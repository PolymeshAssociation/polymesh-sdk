import BigNumber from 'bignumber.js';

import { PolymeshError } from '~/base/PolymeshError';
import { Procedure, SecurityToken } from '~/internal';
import { ErrorCode, RoleType, TxTags } from '~/types';
import { ProcedureAuthorization, TransferRestrictionType } from '~/types/internal';
import { MAX_TRANSFER_MANAGERS } from '~/utils/constants';
import {
  stringToScopeId,
  stringToTicker,
  transferManagerToTransferRestriction,
  transferRestrictionToTransferManager,
} from '~/utils/conversion';

interface BaseParams {
  exempted: string[];
}

export type AddCountTransferRestrictionParams = BaseParams & {
  type: TransferRestrictionType.Count;
  count: BigNumber;
};

export type AddPercentageTransferRestrictionParams = BaseParams & {
  type: TransferRestrictionType.Percentage;
  percentage: BigNumber;
};

/**
 * @hidden
 */
export type AddTransferRestrictionParams = { ticker: string } & (
  | AddCountTransferRestrictionParams
  | AddPercentageTransferRestrictionParams
);

/**
 * @hidden
 */
export async function prepareAddTransferRestriction(
  this: Procedure<AddTransferRestrictionParams, number>,
  args: AddTransferRestrictionParams
): Promise<number> {
  const {
    context: {
      polymeshApi: {
        tx: { statistics },
        query,
      },
    },
    context,
  } = this;
  const { ticker, exempted } = args;

  const rawTicker = stringToTicker(ticker, context);

  const currentTms = await query.statistics.activeTransferManagers(ticker);

  const restrictionAmount = currentTms.length;

  if (restrictionAmount >= MAX_TRANSFER_MANAGERS) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Transfer Restriction limit reached',
      data: { limit: MAX_TRANSFER_MANAGERS },
    });
  }

  let value: BigNumber;

  if (args.type === TransferRestrictionType.Count) {
    value = args.count;
  } else {
    value = args.percentage;
  }

  const exists = !!currentTms.find(transferManager => {
    const restriction = transferManagerToTransferRestriction(transferManager);

    return restriction.type === args.type && restriction.value.eq(value);
  });

  if (exists) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Cannot add the same restriction more than once',
    });
  }

  const rawTransferManager = transferRestrictionToTransferManager(
    { type: args.type, value },
    context
  );

  this.addTransaction(statistics.addTransferManager, {}, rawTicker, rawTransferManager);

  if (exempted.length) {
    this.addTransaction(
      statistics.addExemptedEntities,
      {},
      rawTicker,
      rawTransferManager,
      exempted.map(scopeId => stringToScopeId(scopeId, context))
    );
  }

  return restrictionAmount + 1;
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<AddTransferRestrictionParams, number>,
  { ticker, exempted }: AddTransferRestrictionParams
): ProcedureAuthorization {
  const transactions = [TxTags.statistics.AddTransferManager];

  if (exempted.length) {
    transactions.push(TxTags.statistics.AddExemptedEntities);
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
export const addTransferRestriction = new Procedure(
  prepareAddTransferRestriction,
  getAuthorization
);
