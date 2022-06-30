import {
  BTreeSetStatType,
  BTreeSetTransferCondition,
  PolymeshPrimitivesTransferComplianceTransferCondition,
} from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';

import { Asset, PolymeshError, Procedure } from '~/internal';
import {
  AddCountTransferRestrictionParams,
  AddPercentageTransferRestrictionParams,
  ErrorCode,
  TransferRestrictionType,
  TxTags,
} from '~/types';
import { ProcedureAuthorization, StatisticsOpType } from '~/types/internal';
import {
  bigNumberToU128,
  createStat2ndKey,
  meshStatToStatisticsOpType,
  permillToBigNumber,
  scopeIdsToBtreeSetIdentityId,
  statisticsOpTypeToStatOpType,
  statisticsOpTypeToStatType,
  statUpdate,
  statUpdatesToBtreeStatUpdate,
  stringToIdentityId,
  stringToTickerKey,
  toExemptKey,
  transferRestrictionToPolymeshTransferCondition,
  u32ToBigNumber,
  u64ToBigNumber,
} from '~/utils/conversion';
import { checkTxType, getExemptedIds } from '~/utils/internal';

/**
 * @hidden
 */
export type AddTransferRestrictionParams = { ticker: string } & (
  | AddCountTransferRestrictionParams
  | AddPercentageTransferRestrictionParams
);

export interface Storage {
  currentRestrictions: PolymeshPrimitivesTransferComplianceTransferCondition[];
  currentStats: BTreeSetStatType;
  needStat: boolean;
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
        query,
        consts,
      },
    },
    storage: { needStat, currentStats, currentRestrictions },
    context,
  } = this;
  const { ticker, exemptedIdentities = [], type } = args;
  const tickerKey = stringToTickerKey(ticker, context);

  const maxConditions = u32ToBigNumber(consts.statistics.maxTransferConditionsPerAsset);

  const restrictionAmount = new BigNumber(currentRestrictions.length);
  if (restrictionAmount.gte(maxConditions)) {
    throw new PolymeshError({
      code: ErrorCode.LimitExceeded,
      message: 'Transfer Restriction limit reached',
      data: { limit: maxConditions },
    });
  }

  let value: BigNumber;
  let chainType: TransferRestrictionType;
  if (type === TransferRestrictionType.Count) {
    value = args.count;
    chainType = TransferRestrictionType.Count;
  } else {
    value = args.percentage;
    chainType = TransferRestrictionType.Percentage;
  }

  const exists = !!currentRestrictions.find(transferRestriction => {
    if (transferRestriction.isMaxInvestorCount && type === TransferRestrictionType.Count) {
      const currentCount = u64ToBigNumber(transferRestriction.asMaxInvestorCount);
      return currentCount.eq(value);
    } else if (
      transferRestriction.isMaxInvestorOwnership &&
      type === TransferRestrictionType.Percentage
    ) {
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
    { type: chainType, value },
    context
  );

  // The chain requires BTreeSets to be sorted or else it will reject the transaction
  const conditions = [...currentRestrictions, rawTransferCondition].sort();

  const transactions = [];

  const op =
    type === TransferRestrictionType.Count
      ? statisticsOpTypeToStatOpType(StatisticsOpType.Count, context)
      : statisticsOpTypeToStatOpType(StatisticsOpType.Balance, context);

  if (needStat) {
    const newStat = statisticsOpTypeToStatType(op, context);
    currentStats.push(newStat);
    currentStats.sort().reverse(); // sort needed as it is a BTreeSet
    transactions.push(
      checkTxType({
        transaction: statistics.setActiveAssetStats,
        args: [tickerKey, currentStats],
      })
    );

    // If the stat restriction is a Count the actual value needs to be set. This is due to the potentially slow operation of counting all holders for the chain
    if (type === TransferRestrictionType.Count) {
      const holders = await query.asset.balanceOf.entries(tickerKey.Ticker);
      const holderCount = new BigNumber(holders.length);
      // if an asset has many investors this could be slow and instead should be fetched from SubQuery
      // These should happen near the assets inception, so for now query the chain directly
      const secondKey = createStat2ndKey(context);
      const stat = statUpdate(secondKey, bigNumberToU128(holderCount, context), context);
      const statValue = statUpdatesToBtreeStatUpdate([stat], context);

      transactions.push(
        checkTxType({
          transaction: statistics.batchUpdateAssetStats,
          args: [tickerKey, newStat, statValue],
        })
      );
    }
  }

  if (exemptedIdentities.length) {
    const exemptedIds = await getExemptedIds(exemptedIdentities, context, ticker);
    const exemptedScopeIds = exemptedIds.map(entityId => stringToIdentityId(entityId, context));
    const btreeIds = scopeIdsToBtreeSetIdentityId(exemptedScopeIds, context);
    const exemptKey = toExemptKey(tickerKey, op);
    transactions.push(
      checkTxType({
        transaction: statistics.setEntitiesExempt,
        feeMultiplier: new BigNumber(exemptedIds.length),
        args: [true, exemptKey, btreeIds],
      })
    );
  }
  transactions.push(
    checkTxType({
      transaction: statistics.setAssetTransferCompliance,
      args: [tickerKey, conditions as BTreeSetTransferCondition],
    })
  );

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
  const {
    storage: { needStat },
  } = this;

  const transactions = [TxTags.statistics.SetAssetTransferCompliance];

  if (exemptedIdentities.length) {
    transactions.push(TxTags.statistics.SetEntitiesExempt);
  }

  if (needStat) {
    transactions.push(TxTags.statistics.SetActiveAssetStats);
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

  const needStat = !currentStats.find(s => {
    const stat = meshStatToStatisticsOpType(s);
    const cmpStat =
      stat === StatisticsOpType.Balance
        ? TransferRestrictionType.Percentage
        : TransferRestrictionType.Count;
    return cmpStat === type;
  });

  return {
    currentRestrictions,
    needStat,
    currentStats,
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
