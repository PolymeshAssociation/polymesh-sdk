import P from 'bluebird';
import { difference, differenceWith, isEqual, some, uniq } from 'lodash';
import { ScopeId, Ticker, TransferManager, TxTag } from 'polymesh-types/types';

import { Asset, Context, Identity, PolymeshError, Procedure } from '~/internal';
import {
  CountTransferRestrictionInput,
  ErrorCode,
  PercentageTransferRestrictionInput,
  TransferRestriction,
  TransferRestrictionType,
  TxTags,
} from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import { tuple } from '~/types/utils';
import {
  stringToScopeId,
  stringToTicker,
  transferRestrictionToTransferManager,
  u32ToBigNumber,
} from '~/utils/conversion';
import { assembleBatchTransactions } from '~/utils/internal';

export interface SetCountTransferRestrictionsParams {
  /**
   * array of Count Transfer Restrictions with their corresponding exemptions (if applicable)
   */
  restrictions: CountTransferRestrictionInput[];
  type: TransferRestrictionType.Count;
}

export interface SetPercentageTransferRestrictionsParams {
  /**
   * array of Percentage Transfer Restrictions with their corresponding exemptions (if applicable)
   */
  restrictions: PercentageTransferRestrictionInput[];
  type: TransferRestrictionType.Percentage;
}

export type SetTransferRestrictionsParams = { ticker: string } & (
  | SetCountTransferRestrictionsParams
  | SetPercentageTransferRestrictionsParams
);

/**
 * @hidden
 */
export interface Storage {
  restrictionsToAdd: [Ticker, TransferManager][];
  restrictionsToRemove: [Ticker, TransferManager][];
  exemptionsToAdd: [Ticker, TransferManager, ScopeId[]][];
  exemptionsToRemove: [Ticker, TransferManager, ScopeId[]][];
  occupiedSlots: number;
  exemptionsRepeated: boolean;
}

/**
 * @hidden
 */
export async function prepareSetTransferRestrictions(
  this: Procedure<SetTransferRestrictionsParams, number, Storage>,
  args: SetTransferRestrictionsParams
): Promise<number> {
  const {
    context: {
      polymeshApi: {
        tx: { statistics },
        consts,
      },
    },
    storage: {
      restrictionsToAdd,
      restrictionsToRemove,
      exemptionsToAdd,
      exemptionsToRemove,
      occupiedSlots,
      exemptionsRepeated,
    },
  } = this;
  const {
    restrictions: { length: newRestrictionAmount },
  } = args;

  if (exemptionsRepeated) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'One or more restrictions have repeated exempted Scope IDs/Identities',
    });
  }

  const restrictionsToAddAmount = restrictionsToAdd.length;
  const restrictionsToRemoveAmount = restrictionsToRemove.length;
  const exemptionsToAddAmount = exemptionsToAdd.length;
  const exemptionsToRemoveAmount = exemptionsToRemove.length;

  if (
    !restrictionsToAddAmount &&
    !restrictionsToRemoveAmount &&
    !exemptionsToAddAmount &&
    !exemptionsToRemoveAmount
  ) {
    throw new PolymeshError({
      code: ErrorCode.NoDataChange,
      message: newRestrictionAmount
        ? 'The supplied restrictions are already in place'
        : 'There are no restrictions to remove',
    });
  }

  const maxTransferManagers = u32ToBigNumber(
    consts.statistics.maxTransferManagersPerAsset
  ).toNumber();
  const finalCount = occupiedSlots + newRestrictionAmount;
  if (finalCount >= maxTransferManagers) {
    throw new PolymeshError({
      code: ErrorCode.LimitExceeded,
      message: 'Cannot set more Transfer Restrictions than there are slots available',
      data: {
        availableSlots: maxTransferManagers - occupiedSlots,
      },
    });
  }

  const transactions = assembleBatchTransactions(
    tuple(
      {
        transaction: statistics.removeTransferManager,
        argsArray: restrictionsToRemove,
      },
      {
        transaction: statistics.addTransferManager,
        argsArray: restrictionsToAdd,
      },
      {
        transaction: statistics.removeExemptedEntities,
        argsArray: exemptionsToRemove,
      },
      {
        transaction: statistics.addExemptedEntities,
        argsArray: exemptionsToAdd,
      }
    )
  );

  this.addBatchTransaction({ transactions });

  return finalCount;
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<SetTransferRestrictionsParams, number, Storage>,
  { ticker }: SetTransferRestrictionsParams
): ProcedureAuthorization {
  const { restrictionsToRemove, restrictionsToAdd, exemptionsToAdd, exemptionsToRemove } =
    this.storage;
  const transactions: TxTag[] = [];
  if (restrictionsToAdd.length) {
    transactions.push(TxTags.statistics.AddTransferManager);
  }

  if (restrictionsToRemove.length) {
    transactions.push(TxTags.statistics.RemoveTransferManager);
  }

  if (exemptionsToAdd.length) {
    transactions.push(TxTags.statistics.AddExemptedEntities);
  }

  if (exemptionsToRemove.length) {
    transactions.push(TxTags.statistics.RemoveExemptedEntities);
  }

  return {
    permissions: {
      assets: [new Asset({ ticker }, this.context)],
      transactions,
      portfolios: [],
    },
  };
}

/**
 * @hidden
 *
 * Merge an array of Identity IDs and Scope IDs into an array of only Scope IDs
 *
 * @note fetches missing scope IDs from the chain
 */
const getScopeIds = async (
  identities: (string | Identity)[],
  scopeIds: string[],
  context: Context,
  ticker: string
): Promise<string[]> => {
  const identityScopeIds = await P.map(identities, async value => {
    let identity: Identity;

    if (typeof value === 'string') {
      identity = new Identity({ did: value }, context);
    } else {
      identity = value;
    }

    return identity.getScopeId({ asset: ticker });
  });

  return [...scopeIds, ...identityScopeIds];
};

/**
 * @hidden
 */
export async function prepareStorage(
  this: Procedure<SetTransferRestrictionsParams, number, Storage>,
  args: SetTransferRestrictionsParams
): Promise<Storage> {
  const { context } = this;
  const { ticker } = args;

  const rawTicker = stringToTicker(ticker, context);

  const {
    transferRestrictions: { count, percentage },
  } = new Asset({ ticker }, context);

  const [
    { restrictions: currentCountRestrictions },
    { restrictions: currentPercentageRestrictions },
  ] = await Promise.all([count.get(), percentage.get()]);

  const currentRestrictions: TransferRestriction[] = [];
  const currentExemptions: [TransferRestriction, string[]][] = [];
  const toAddRestrictions: TransferRestriction[] = [];
  const toAddExemptionPromises: [TransferRestriction, Promise<string[]>][] = [];
  let occupiedSlots = currentCountRestrictions.length + currentPercentageRestrictions.length;

  if (args.type === TransferRestrictionType.Count) {
    args.restrictions.forEach(
      ({ exemptedScopeIds = [], exemptedIdentities = [], count: value }) => {
        const restriction = { type: TransferRestrictionType.Count, value };
        toAddRestrictions.push(restriction);
        toAddExemptionPromises.push(
          tuple(restriction, getScopeIds(exemptedIdentities, exemptedScopeIds, context, ticker))
        );
      }
    );
    currentCountRestrictions.forEach(({ exemptedScopeIds = [], count: value }) => {
      const restriction = { type: TransferRestrictionType.Count, value };
      currentRestrictions.push(restriction);
      currentExemptions.push(tuple(restriction, exemptedScopeIds));
    });
  } else {
    args.restrictions.forEach(
      ({ exemptedIdentities = [], exemptedScopeIds = [], percentage: value }) => {
        const restriction = { type: TransferRestrictionType.Percentage, value };
        toAddRestrictions.push(restriction);
        toAddExemptionPromises.push(
          tuple(restriction, getScopeIds(exemptedIdentities, exemptedScopeIds, context, ticker))
        );
      }
    );
    currentPercentageRestrictions.forEach(({ exemptedScopeIds = [], percentage: value }) => {
      const restriction = { type: TransferRestrictionType.Percentage, value };
      currentRestrictions.push(restriction);
      currentExemptions.push(tuple(restriction, exemptedScopeIds));
    });
  }

  const toAddExemptions = await P.map(
    toAddExemptionPromises,
    async ([restriction, exemptedPromise]) => {
      const exempted = await exemptedPromise;

      return tuple(restriction, exempted);
    }
  );

  const newRestrictions = differenceWith(toAddRestrictions, currentRestrictions, isEqual);
  const toRemoveRestrictions = differenceWith(currentRestrictions, toAddRestrictions, isEqual);

  const transformRestriction = (restriction: TransferRestriction): [Ticker, TransferManager] =>
    tuple(rawTicker, transferRestrictionToTransferManager(restriction, context));

  const restrictionsToRemove = toRemoveRestrictions.map(transformRestriction);
  const restrictionsToAdd = newRestrictions.map(transformRestriction);

  occupiedSlots -= currentRestrictions.length;

  const newExemptions: [TransferRestriction, string[]][] = [];
  const toRemoveExemptions: [TransferRestriction, string[]][] = [];

  toAddExemptions.forEach(exemption => {
    const [restriction, exempted] = exemption;

    if (newRestrictions.find(res => isEqual(restriction, res)) && exempted.length) {
      newExemptions.push(exemption);
      return;
    }

    const currentExemption = currentExemptions.find(([res]) => isEqual(res, restriction));
    const currentExempted = currentExemption?.[1] || [];

    // scope IDs that weren't exempted before for that restriction
    const newExempted = difference(exempted, currentExempted);
    if (newExempted.length) {
      newExemptions.push(tuple(restriction, newExempted));
    }

    // scope IDs that will no longer be exempted for that restriction
    const toRemoveExempted = difference(currentExempted, exempted);
    if (toRemoveExempted.length) {
      toRemoveExemptions.push(tuple(restriction, toRemoveExempted));
    }
  });

  // also remove all exemptions of the restrictions that will be removed
  toRemoveRestrictions.forEach(restriction => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const [, currentExempted] = currentExemptions.find(([res]) => isEqual(res, restriction))!;

    if (currentExempted.length) {
      toRemoveExemptions.push(tuple(restriction, currentExempted));
    }
  });

  const exemptionsRepeated = some(
    newExemptions,
    ([, scopeIds]) => uniq(scopeIds).length !== scopeIds.length
  );

  const transformExemptions = ([restriction, scopeIds]: [TransferRestriction, string[]]): [
    Ticker,
    TransferManager,
    ScopeId[]
  ] =>
    tuple(
      rawTicker,
      transferRestrictionToTransferManager(restriction, context),
      scopeIds.map(scopeId => stringToScopeId(scopeId, context))
    );

  const exemptionsToAdd = newExemptions.map(transformExemptions);

  const exemptionsToRemove = toRemoveExemptions.map(transformExemptions);

  return {
    restrictionsToRemove,
    restrictionsToAdd,
    exemptionsToAdd,
    exemptionsToRemove,
    occupiedSlots,
    exemptionsRepeated,
  };
}

/**
 * @hidden
 */
export const setTransferRestrictions = (): Procedure<
  SetTransferRestrictionsParams,
  number,
  Storage
> => new Procedure(prepareSetTransferRestrictions, getAuthorization, prepareStorage);
