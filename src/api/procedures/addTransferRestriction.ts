import {
  BTreeSetTransferCondition,
  PolymeshPrimitivesStatisticsStatType,
  PolymeshPrimitivesTransferComplianceTransferCondition,
} from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';

import { Asset, PolymeshError, Procedure } from '~/internal';
import {
  ClaimCountTransferRestrictionInput,
  ClaimOwnershipTransferRestrictionInput,
  ClaimRestrictionValue,
  CountTransferRestrictionInput,
  ErrorCode,
  PercentageTransferRestrictionInput,
  TransferRestrictionType,
  TxTags,
} from '~/types';
import { ProcedureAuthorization, StatisticsOpType } from '~/types/internal';
import {
  meshStatToStatisticsOpType,
  scopeIdsToBtreeSetIdentityId,
  statisticsOpTypeToStatOpType,
  stringToIdentityId,
  stringToTickerKey,
  toExemptKey,
  transferRestrictionToPolymeshTransferCondition,
  u32ToBigNumber,
} from '~/utils/conversion';
import {
  checkTxType,
  compareStatTypeToTransferRestrictionType,
  compareTransferRestrictionToInput,
  getExemptedIds,
} from '~/utils/internal';

export type AddCountTransferRestrictionParams = CountTransferRestrictionInput & {
  type: TransferRestrictionType.Count;
};

export type AddPercentageTransferRestrictionParams = PercentageTransferRestrictionInput & {
  type: TransferRestrictionType.Percentage;
};

export type AddClaimCountTransferRestrictionParams = ClaimCountTransferRestrictionInput & {
  type: TransferRestrictionType.ClaimCount;
};

export type AddClaimOwnershipTransferRestrictionParams = ClaimOwnershipTransferRestrictionInput & {
  type: TransferRestrictionType.ClaimOwnership;
};

/**
 * @hidden
 */
export type AddTransferRestrictionParams = { ticker: string } & (
  | AddCountTransferRestrictionParams
  | AddPercentageTransferRestrictionParams
  | AddClaimCountTransferRestrictionParams
  | AddClaimOwnershipTransferRestrictionParams
);

export interface Storage {
  // currentRestrictions: PolymeshPrimitivesTransferComplianceTransferCondition[];
  currentRestrictions: BTreeSetTransferCondition;
}

/**
 * @hidden
 */
export async function prepareAddTransferRestriction(
  this: Procedure<AddTransferRestrictionParams, BigNumber, Storage>,
  args: AddTransferRestrictionParams
): Promise<BigNumber> {
  const {
    context: {
      polymeshApi: {
        tx: { statistics },
        consts,
      },
    },
    storage: { currentRestrictions },
    context,
  } = this;
  const { ticker, exemptedIdentities = [], type } = args;
  const tickerKey = stringToTickerKey(ticker, context);

  const maxConditions = u32ToBigNumber(consts.statistics.maxTransferConditionsPerAsset);

  const restrictionAmount = new BigNumber(currentRestrictions.size);
  console.log('restriction amount: ', currentRestrictions.size);
  if (restrictionAmount.gte(maxConditions)) {
    throw new PolymeshError({
      code: ErrorCode.LimitExceeded,
      message: 'Transfer Restriction limit reached',
      data: { limit: maxConditions },
    });
  }

  let value: BigNumber | ClaimRestrictionValue;
  let chainType: TransferRestrictionType;
  if (type === TransferRestrictionType.Count) {
    value = args.count;
    chainType = TransferRestrictionType.Count;
  } else if (type === TransferRestrictionType.Percentage) {
    value = args.percentage;
    chainType = TransferRestrictionType.Percentage;
  } else if (type === TransferRestrictionType.ClaimCount) {
    value = { claim: args.claim, issuer: args.issuer, min: args.min, max: args.max }; // TODO use conversion
    chainType = TransferRestrictionType.ClaimCount;
  } else {
    value = { claim: args.claim, issuer: args.issuer, min: args.min, max: args.max };
    chainType = TransferRestrictionType.ClaimOwnership;
  }

  const exists = !!(
    currentRestrictions as unknown as Array<PolymeshPrimitivesTransferComplianceTransferCondition>
  ).find(transferRestriction =>
    compareTransferRestrictionToInput(transferRestriction, value, type)
  );

  if (exists) {
    throw new PolymeshError({
      code: ErrorCode.NoDataChange,
      message: 'Cannot add the same restriction more than once',
    });
  }

  const rawTransferCondition = transferRestrictionToPolymeshTransferCondition(
    { type: chainType, value },
    context
  );

  // The chain requires BTreeSets to be sorted or else it will reject the transaction
  // const conditions = currentRestrictions.add(rawTransferCondition);
  const conditions = [rawTransferCondition] as any;
  console.log('conditions: ', conditions);

  const transactions = [];
  transactions.push(
    checkTxType({
      transaction: statistics.setAssetTransferCompliance,
      args: [tickerKey, conditions],
    })
  );

  // if (exemptedIdentities.length) {
  //   const op =
  //     type === TransferRestrictionType.Count
  //       ? statisticsOpTypeToStatOpType(StatisticsOpType.Count, context)
  //       : statisticsOpTypeToStatOpType(StatisticsOpType.Balance, context);
  //   const exemptedIds = await getExemptedIds(exemptedIdentities, context, ticker);
  //   const exemptedScopeIds = exemptedIds.map(entityId => stringToIdentityId(entityId, context));
  //   const btreeIds = scopeIdsToBtreeSetIdentityId(exemptedScopeIds, context);
  //   const exemptKey = toExemptKey(tickerKey, op);
  //   transactions.push(
  //     checkTxType({
  //       transaction: statistics.setEntitiesExempt,
  //       feeMultiplier: new BigNumber(exemptedIds.length),
  //       args: [true, exemptKey, btreeIds],
  //     })
  //   );
  // }

  this.addBatchTransaction({ transactions });
  return restrictionAmount.plus(1);
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<AddTransferRestrictionParams, BigNumber, Storage>,
  { ticker, exemptedIdentities = [] }: AddTransferRestrictionParams
): ProcedureAuthorization {
  const transactions = [TxTags.statistics.SetAssetTransferCompliance];

  if (exemptedIdentities.length) {
    transactions.push(TxTags.statistics.SetEntitiesExempt);
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
  this: Procedure<AddTransferRestrictionParams, BigNumber, Storage>,
  args: AddTransferRestrictionParams
): Promise<Storage> {
  const {
    context,
    context: {
      polymeshApi: {
        query: { statistics },
      },
    },
  } = this;
  const { ticker, type } = args;

  const tickerKey = stringToTickerKey(ticker, context);

  const [{ requirements: currentRestrictions }, currentStats] = await Promise.all([
    statistics.assetTransferCompliances(tickerKey),
    statistics.activeAssetStats(tickerKey),
  ]);

  console.log('need stat?', currentStats.toJSON());
  const needStat = !(currentStats as unknown as Array<PolymeshPrimitivesStatisticsStatType>).find(
    s => compareStatTypeToTransferRestrictionType(s, type)
  );

  if (!needStat) {
    console.log('yes');
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'The appropriate statistic must be enabled. Try calling the enableStat method first',
    });
  }

  return {
    currentRestrictions,
  };
}

/**
 * @hidden
 */
export const addTransferRestriction = (): Procedure<
  AddTransferRestrictionParams,
  BigNumber,
  Storage
> => new Procedure(prepareAddTransferRestriction, getAuthorization, prepareStorage);
