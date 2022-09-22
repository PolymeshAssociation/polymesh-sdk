import { Asset, PolymeshError, Procedure } from '~/internal';
import { AddAssetStatParams, ErrorCode, StatType, TxTags } from '~/types';
import { BatchTransactionSpec, ProcedureAuthorization } from '~/types/internal';
import {
  claimCountStatInputToStatUpdates,
  claimIssuerToMeshClaimIssuer,
  countStatInputToStatUpdates,
  statisticsOpTypeToStatType,
  statisticStatTypesToBtreeStatType,
  statTypeToStatOpType,
  stringToTickerKey,
} from '~/utils/conversion';
import { checkTxType, compareStatsToInput } from '~/utils/internal';

/**
 * @hidden
 */
export async function prepareAddAssetStat(
  this: Procedure<AddAssetStatParams, void>,
  args: AddAssetStatParams
): Promise<BatchTransactionSpec<void, unknown[][]>> {
  const {
    context: {
      polymeshApi: {
        query: { statistics: statisticsQuery },
        tx: { statistics },
      },
    },
    context,
  } = this;
  const { ticker, type } = args;

  const tickerKey = stringToTickerKey(ticker, context);
  const currentStats = await statisticsQuery.activeAssetStats(tickerKey);
  const needStat = ![...currentStats].find(s => compareStatsToInput(s, args));

  if (!needStat) {
    throw new PolymeshError({
      code: ErrorCode.NoDataChange,
      message: 'Stat is already enabled',
    });
  }

  const op = statTypeToStatOpType(type, context);

  const transactions = [];

  let rawClaimIssuer;
  if (type === StatType.ScopedCount || type === StatType.ScopedBalance) {
    rawClaimIssuer = claimIssuerToMeshClaimIssuer(args, context);
  }

  const newStat = statisticsOpTypeToStatType({ op, claimIssuer: rawClaimIssuer }, context);
  const newStats = statisticStatTypesToBtreeStatType([...currentStats, newStat], context);
  transactions.push(
    checkTxType({
      transaction: statistics.setActiveAssetStats,
      args: [tickerKey, newStats],
    })
  );

  // Count stats need the user to provide the initial value for the counter as computing may cause prohibitive gas charges on the chain
  // We require users to provide initial stats in this method so they won't miss setting initial values. It could be its own step
  if (args.type === StatType.Count) {
    const statValue = countStatInputToStatUpdates(args, context);
    transactions.push(
      checkTxType({
        transaction: statistics.batchUpdateAssetStats,
        args: [tickerKey, newStat, statValue],
      })
    );
  } else if (args.type === StatType.ScopedCount) {
    const statValue = claimCountStatInputToStatUpdates(args, context);
    transactions.push(
      checkTxType({
        transaction: statistics.batchUpdateAssetStats,
        args: [tickerKey, newStat, statValue],
      })
    );
  }
  return { transactions, resolver: undefined };
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<AddAssetStatParams, void>,
  { type, ticker }: AddAssetStatParams
): ProcedureAuthorization {
  const transactions = [TxTags.statistics.SetActiveAssetStats];
  if (type === StatType.Count || type === StatType.ScopedCount) {
    transactions.push(TxTags.statistics.BatchUpdateAssetStats);
  }
  const asset = new Asset({ ticker }, this.context);
  return {
    permissions: {
      transactions,
      assets: [asset],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const addAssetStat = (): Procedure<AddAssetStatParams, void> =>
  new Procedure(prepareAddAssetStat, getAuthorization);
