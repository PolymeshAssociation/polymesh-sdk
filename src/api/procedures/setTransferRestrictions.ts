import P from 'bluebird';
import { difference, differenceWith, isEqual, some, uniq } from 'lodash';

import { Identity, PolymeshError, Procedure, SecurityToken } from '~/internal';
import { ScopeId, Ticker, TransferManager, TxTag } from '~/polkadot';
import {
  CountTransferRestrictionInput,
  ErrorCode,
  PercentageTransferRestrictionInput,
  RoleType,
  TxTags,
} from '~/types';
import {
  ProcedureAuthorization,
  TransferRestriction,
  TransferRestrictionType,
} from '~/types/internal';
import { tuple } from '~/types/utils';
import { MAX_TRANSFER_MANAGERS } from '~/utils/constants';
import {
  stringToScopeId,
  stringToTicker,
  transferRestrictionToTransferManager,
} from '~/utils/conversion';

export interface SetCountTransferRestrictionsParams {
  restrictions: CountTransferRestrictionInput[];
  type: TransferRestrictionType.Count;
}

export interface SetPercentageTransferRestrictionsParams {
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
      code: ErrorCode.ValidationError,
      message: 'The supplied restrictions are already in place',
    });
  }

  const finalCount = occupiedSlots + newRestrictionAmount;
  if (finalCount >= MAX_TRANSFER_MANAGERS) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Cannot set more Transfer Restrictions than there are slots available',
      data: {
        availableSlots: MAX_TRANSFER_MANAGERS - occupiedSlots,
      },
    });
  }

  if (restrictionsToRemoveAmount) {
    this.addBatchTransaction(statistics.removeTransferManager, {}, restrictionsToRemove);
  }

  if (restrictionsToAddAmount) {
    this.addBatchTransaction(statistics.addTransferManager, {}, restrictionsToAdd);
  }

  if (exemptionsToRemoveAmount) {
    this.addBatchTransaction(statistics.removeExemptedEntities, {}, exemptionsToRemove);
  }

  if (exemptionsToAddAmount) {
    this.addBatchTransaction(statistics.addExemptedEntities, {}, exemptionsToAdd);
  }

  return finalCount;
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<SetTransferRestrictionsParams, number, Storage>,
  { ticker }: SetTransferRestrictionsParams
): ProcedureAuthorization {
  const {
    restrictionsToRemove,
    restrictionsToAdd,
    exemptionsToAdd,
    exemptionsToRemove,
  } = this.storage;
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
    identityRoles: [{ type: RoleType.TokenOwner, ticker }],
    signerPermissions: {
      tokens: [new SecurityToken({ ticker }, this.context)],
      transactions,
      portfolios: [],
    },
  };
}

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
  } = new SecurityToken({ ticker }, context);

  const [
    { restrictions: currentCountRestrictions },
    { restrictions: currentPercentageRestrictions },
  ] = await Promise.all([count.get(), percentage.get()]);

  const currentRestrictions: TransferRestriction[] = [];
  const currentExemptions: [TransferRestriction, string[]][] = [];
  const toAddRestrictions: TransferRestriction[] = [];
  const toAddExemptionPromises: [TransferRestriction, Promise<string[]>][] = [];
  let occupiedSlots = currentCountRestrictions.length + currentPercentageRestrictions.length;

  const getScopeIds = async (
    identities: (string | Identity)[],
    scopeIds: string[]
  ): Promise<string[]> => {
    const identityScopeIds = await P.map(identities, async value => {
      let identity: Identity;

      if (typeof value === 'string') {
        identity = new Identity({ did: value }, context);
      } else {
        identity = value;
      }

      return identity.getScopeId({ token: ticker });
    });

    return [...scopeIds, ...identityScopeIds];
  };

  if (args.type === TransferRestrictionType.Count) {
    args.restrictions.forEach(
      ({ exemptedScopeIds = [], exemptedIdentities = [], count: value }) => {
        const restriction = { type: TransferRestrictionType.Count, value };
        toAddRestrictions.push(restriction);
        toAddExemptionPromises.push(
          tuple(restriction, getScopeIds(exemptedIdentities, exemptedScopeIds))
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
          tuple(restriction, getScopeIds(exemptedIdentities, exemptedScopeIds))
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

    const newExempted = difference(exempted, currentExempted);
    if (newExempted.length) {
      newExemptions.push(tuple(restriction, newExempted));
    }

    const toRemoveExempted = difference(currentExempted, exempted);
    if (toRemoveExempted.length) {
      toRemoveExemptions.push(tuple(restriction, toRemoveExempted));
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
export const setTransferRestrictions = new Procedure(
  prepareSetTransferRestrictions,
  getAuthorization,
  prepareStorage
);
