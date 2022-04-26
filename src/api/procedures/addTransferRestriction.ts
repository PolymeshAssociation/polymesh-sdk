import { BTreeSetIdentityId, BTreeSetTransferCondition } from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';

import { Asset, PolymeshError, Procedure } from '~/internal';
import {
  CountTransferRestrictionInput,
  ErrorCode,
  PercentageTransferRestrictionInput,
  TransferRestrictionType,
  TxTags,
} from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import {
  permillToBigNumber,
  scopeIdsToBtreeSetIdentityId,
  stringToIdentityId,
  stringToTicker,
  transferRestrictionToPolymeshTransferCondition,
  u32ToBigNumber,
  u64ToBigNumber,
} from '~/utils/conversion';
import { checkTxType, getExemptedIds } from '~/utils/internal';

export type AddCountTransferRestrictionParams = CountTransferRestrictionInput & {
  type: 'Count';
};

export type AddPercentageTransferRestrictionParams = PercentageTransferRestrictionInput & {
  type: 'Percentage';
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
  this: Procedure<AddTransferRestrictionParams, BigNumber>,
  args: AddTransferRestrictionParams
): Promise<BigNumber> {
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
  const { ticker, exemptedIdentities = [], type } = args;
  const rawTicker = stringToTicker(ticker, context);

  const maxConditions = u32ToBigNumber(consts.statistics.maxTransferConditionsPerAsset);

  const { requirements: currentTransferRestrictions } =
    await query.statistics.assetTransferCompliances({ Ticker: ticker });
  const restrictionAmount = new BigNumber(currentTransferRestrictions.length);

  if (restrictionAmount.gte(maxConditions)) {
    throw new PolymeshError({
      code: ErrorCode.LimitExceeded,
      message: 'Transfer Restriction limit reached',
      data: { limit: maxConditions },
    });
  }

  let value: BigNumber;
  let inputType: TransferRestrictionType;

  if (type === 'Count') {
    value = args.count;
    inputType = TransferRestrictionType.Count;
  } else if (type === 'Percentage') {
    value = args.percentage;
    inputType = TransferRestrictionType.Percentage;
  } else {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: `Unknown type: ${type}`,
    });
  }

  const exists = !!currentTransferRestrictions.find(transferRestriction => {
    if (transferRestriction.isMaxInvestorCount && type === 'Count') {
      const currentCount = u64ToBigNumber(transferRestriction.asMaxInvestorCount);
      return currentCount.eq(value);
    } else if (transferRestriction.isMaxInvestorOwnership && type === 'Percentage') {
      const currentOwnership = permillToBigNumber(transferRestriction.asMaxInvestorOwnership);
      return currentOwnership.eq(value);
    }
    return false;
  });

  if (exists) {
    throw new PolymeshError({
      code: ErrorCode.NoDataChange,
      message: 'Cannot add the same restriction more than once',
    });
  }

  const rawTransferCondition = transferRestrictionToPolymeshTransferCondition(
    { type: inputType, value },
    context
  );

  const newTransferConditions = [...currentTransferRestrictions, rawTransferCondition];

  const transactions = [
    checkTxType({
      transaction: statistics.setAssetTransferCompliance,
      args: [{ Ticker: rawTicker }, newTransferConditions as BTreeSetTransferCondition],
    }),
  ];

  if (exemptedIdentities.length) {
    const exemptedIds = await getExemptedIds(exemptedIdentities, context, ticker);
    const exemptedScopeIds = exemptedIds.map(entityId => stringToIdentityId(entityId, context));
    const btreeIds = scopeIdsToBtreeSetIdentityId(exemptedScopeIds, context);
    transactions.push(
      checkTxType({
        transaction: statistics.setEntitiesExempt,
        feeMultiplier: new BigNumber(exemptedIds.length),
        args: [true, { asset: { Ticker: rawTicker } }, btreeIds],
      })
    );
  }

  this.addBatchTransaction({ transactions });
  return restrictionAmount.plus(1);
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<AddTransferRestrictionParams, BigNumber>,
  { ticker, exemptedIdentities = [] }: AddTransferRestrictionParams
): ProcedureAuthorization {
  const transactions = [TxTags.statistics.AddTransferManager];

  if (exemptedIdentities.length) {
    transactions.push(TxTags.statistics.AddExemptedEntities);
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
export const addTransferRestriction = (): Procedure<AddTransferRestrictionParams, BigNumber> =>
  new Procedure(prepareAddTransferRestriction, getAuthorization);
