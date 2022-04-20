import { U8aFixed } from '@polkadot/types';
import BigNumber from 'bignumber.js';
import P from 'bluebird';
import { difference, differenceWith, isEqual } from 'lodash';
import { Ticker, TransferCondition, TxTag } from 'polymesh-types/types';

import { Asset, PolymeshError, Procedure } from '~/internal';
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
  transferRestrictionToTransferCondition,
  u32ToBigNumber,
} from '~/utils/conversion';
import { assembleBatchTransactions, defusePromise, getExemptedIds } from '~/utils/internal';

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
  restrictionsToAdd: [Ticker, TransferCondition][];
  restrictionsToRemove: [Ticker, TransferCondition][];
  exemptionsToAdd: [Ticker, TransferCondition, U8aFixed[]][];
  exemptionsToRemove: [Ticker, TransferCondition, U8aFixed[]][];
  occupiedSlots: BigNumber;
}

/**
 * @hidden
 */
export async function prepareSetTransferRestrictions(
  this: Procedure<SetTransferRestrictionsParams, BigNumber, Storage>,
  args: SetTransferRestrictionsParams
): Promise<BigNumber> {
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
    },
  } = this;
  const {
    restrictions: { length: newRestrictionAmount },
  } = args;

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

  const maxTransferConditions = u32ToBigNumber(consts.statistics.maxTransferConditionsPerAsset);
  const finalCount = occupiedSlots.plus(newRestrictionAmount);
  if (finalCount.gte(maxTransferConditions)) {
    throw new PolymeshError({
      code: ErrorCode.LimitExceeded,
      message: 'Cannot set more Transfer Restrictions than there are slots available',
      data: {
        availableSlots: maxTransferConditions.minus(occupiedSlots),
      },
    });
  }

  const transactions = assembleBatchTransactions(
    tuple({
      transaction: statistics.setEntitiesExempt,
      argsArray: [],
    })
    // tuple(
    //   {
    //     transaction: statistics.removeTransferManager,
    //     argsArray: restrictionsToRemove,
    //   },
    //   {
    //     transaction: statistics.addTransferManager,
    //     argsArray: restrictionsToAdd,
    //   },
    //   {
    //     transaction: statistics.removeExemptedEntities,
    //     argsArray: exemptionsToRemove,
    //   },
    //   {
    //     transaction: statistics.addExemptedEntities,
    //     argsArray: exemptionsToAdd,
    //   }
    // )
  );

  this.addBatchTransaction({ transactions });

  return finalCount;
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<SetTransferRestrictionsParams, BigNumber, Storage>,
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
 */
export async function prepareStorage(
  this: Procedure<SetTransferRestrictionsParams, BigNumber, Storage>,
  args: SetTransferRestrictionsParams
): Promise<Storage> {
  const { context } = this;
  const { ticker, type, restrictions } = args;

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

  /*
   * we're using `defusePromise` here because we KNOW the exempted ID promises are being
   * awaited later and errors WILL be caught
   */
  if (type === TransferRestrictionType.Count) {
    restrictions.forEach(({ exemptedIdentities = [], count: value }) => {
      const restriction = { type: TransferRestrictionType.Count, value };
      toAddRestrictions.push(restriction);
      toAddExemptionPromises.push(
        tuple(restriction, defusePromise(getExemptedIds(exemptedIdentities, context, ticker)))
      );
    });
    currentCountRestrictions.forEach(({ exemptedIds = [], count: value }) => {
      const restriction = { type: TransferRestrictionType.Count, value };
      currentRestrictions.push(restriction);
      currentExemptions.push(tuple(restriction, exemptedIds));
    });
  } else {
    restrictions.forEach(({ exemptedIdentities = [], percentage: value }) => {
      const restriction = { type: TransferRestrictionType.Percentage, value };
      toAddRestrictions.push(restriction);
      toAddExemptionPromises.push(
        tuple(restriction, defusePromise(getExemptedIds(exemptedIdentities, context, ticker)))
      );
    });
    currentPercentageRestrictions.forEach(({ exemptedIds = [], percentage: value }) => {
      const restriction = { type: TransferRestrictionType.Percentage, value };
      currentRestrictions.push(restriction);
      currentExemptions.push(tuple(restriction, exemptedIds));
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

  const transformRestriction = (restriction: TransferRestriction): [Ticker, TransferCondition] =>
    tuple(rawTicker, transferRestrictionToTransferCondition(restriction, context));

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

    // Scope/Identity IDs that weren't exempted before for that restriction
    const newExempted = difference(exempted, currentExempted);
    if (newExempted.length) {
      newExemptions.push(tuple(restriction, newExempted));
    }

    // Scope/Identity IDs that will no longer be exempted for that restriction
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

  const transformExemptions = ([restriction, entityIds]: [TransferRestriction, string[]]): [
    Ticker,
    TransferCondition,
    U8aFixed[]
  ] =>
    tuple(
      rawTicker,
      transferRestrictionToTransferCondition(restriction, context),
      // we use `stringToScopeId` because both `ScopeId` and `IdentityId` are aliases for `U8aFixed`
      entityIds.map(entityId => stringToScopeId(entityId, context))
    );

  const exemptionsToAdd = newExemptions.map(transformExemptions);

  const exemptionsToRemove = toRemoveExemptions.map(transformExemptions);

  return {
    restrictionsToRemove,
    restrictionsToAdd,
    exemptionsToAdd,
    exemptionsToRemove,
    occupiedSlots: new BigNumber(occupiedSlots),
  };
}

/**
 * @hidden
 */
export const setTransferRestrictions = (): Procedure<
  SetTransferRestrictionsParams,
  BigNumber,
  Storage
> => new Procedure(prepareSetTransferRestrictions, getAuthorization, prepareStorage);
