import BigNumber from 'bignumber.js';
import P from 'bluebird';
import { uniq } from 'lodash';

import { Identity, PolymeshError, Procedure, SecurityToken } from '~/internal';
import {
  CountTransferRestrictionInput,
  ErrorCode,
  PercentageTransferRestrictionInput,
  TransferRestrictionType,
  TxTags,
} from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import {
  stringToScopeId,
  stringToTicker,
  transferManagerToTransferRestriction,
  transferRestrictionToTransferManager,
  u32ToBigNumber,
} from '~/utils/conversion';
import { batchArguments } from '~/utils/internal';

export type AddCountTransferRestrictionParams = CountTransferRestrictionInput & {
  type: TransferRestrictionType.Count;
};

export type AddPercentageTransferRestrictionParams = PercentageTransferRestrictionInput & {
  type: TransferRestrictionType.Percentage;
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
        consts,
      },
    },
    context,
  } = this;
  const { ticker, exemptedScopeIds = [], exemptedIdentities = [] } = args;

  const rawTicker = stringToTicker(ticker, context);

  const maxTransferManagers = u32ToBigNumber(
    consts.statistics.maxTransferManagersPerAsset
  ).toNumber();

  const currentTms = await query.statistics.activeTransferManagers(ticker);
  const restrictionAmount = currentTms.length;

  if (restrictionAmount >= maxTransferManagers) {
    throw new PolymeshError({
      code: ErrorCode.LimitExceeded,
      message: 'Transfer Restriction limit reached',
      data: { limit: maxTransferManagers },
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
      code: ErrorCode.NoDataChange,
      message: 'Cannot add the same restriction more than once',
    });
  }

  const rawTransferManager = transferRestrictionToTransferManager(
    { type: args.type, value },
    context
  );

  this.addTransaction(statistics.addTransferManager, {}, rawTicker, rawTransferManager);

  const identityScopes = await P.map(exemptedIdentities, identityValue => {
    let identity: Identity;
    if (typeof identityValue === 'string') {
      identity = new Identity({ did: identityValue }, context);
    } else {
      identity = identityValue;
    }

    return identity.getScopeId({ token: ticker });
  });

  const exempted: string[] = [...exemptedScopeIds, ...identityScopes];

  const exemptedLength = exempted.length;

  if (exemptedLength) {
    const hasDuplicates = uniq(exempted).length !== exemptedLength;

    if (hasDuplicates) {
      throw new PolymeshError({
        code: ErrorCode.ValidationError,
        message: 'One or more of the passed exempted Scope IDs/Identities are repeated',
      });
    }

    const scopeIds = exempted.map(scopeId => stringToScopeId(scopeId, context));

    batchArguments(scopeIds, TxTags.statistics.AddExemptedEntities).forEach(scopeIdBatch => {
      this.addTransaction(
        statistics.addExemptedEntities,
        { batchSize: scopeIdBatch.length },
        rawTicker,
        rawTransferManager,
        scopeIdBatch
      );
    });
  }

  return restrictionAmount + 1;
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<AddTransferRestrictionParams, number>,
  { ticker, exemptedScopeIds = [], exemptedIdentities = [] }: AddTransferRestrictionParams
): ProcedureAuthorization {
  const transactions = [TxTags.statistics.AddTransferManager];

  const exempted = [...exemptedScopeIds, ...exemptedIdentities];

  if (exempted.length) {
    transactions.push(TxTags.statistics.AddExemptedEntities);
  }

  return {
    permissions: {
      tokens: [new SecurityToken({ ticker }, this.context)],
      transactions,
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const addTransferRestriction = (): Procedure<AddTransferRestrictionParams, number> =>
  new Procedure(prepareAddTransferRestriction, getAuthorization);
