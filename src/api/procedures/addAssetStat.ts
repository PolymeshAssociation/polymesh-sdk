import { PolymeshError, Procedure } from '~/internal';
import { AddAssetStatParams, ErrorCode, StatType, TxTags } from '~/types';
import { BatchTransactionSpec, ProcedureAuthorization } from '~/types/internal';
import {
  claimCountStatInputToStatUpdates,
  claimIssuerToMeshClaimIssuer,
  countStatInputToStatUpdates,
  statisticsOpTypeToStatType,
  statisticStatTypesToBtreeStatType,
  statTypeToStatOpType,
} from '~/utils/conversion';
import { checkTxType, compareStatsToInput, getAssetIdForStats } from '~/utils/internal';

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
  const { asset, type } = args;

  const rawAssetId = getAssetIdForStats(asset, context);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const currentStats = await statisticsQuery.activeAssetStats(rawAssetId as any);
  const needStat = ![...currentStats].find(s => compareStatsToInput(s, args, context));

  if (!needStat) {
    throw new PolymeshError({
      code: ErrorCode.NoDataChange,
      message: 'Stat is already enabled',
    });
  }

  const operationType = statTypeToStatOpType(type, context);

  const transactions = [];

  let rawClaimIssuer;
  if (type === StatType.ScopedCount || type === StatType.ScopedBalance) {
    rawClaimIssuer = claimIssuerToMeshClaimIssuer(args, context);
  }

  const newStat = statisticsOpTypeToStatType(
    { operationType, claimIssuer: rawClaimIssuer },
    context
  );
  const newStats = statisticStatTypesToBtreeStatType([...currentStats, newStat], context);
  transactions.push(
    checkTxType({
      transaction: statistics.setActiveAssetStats,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      args: [rawAssetId as any, newStats],
    })
  );

  // Count stats need the user to provide the initial value for the counter as computing may cause prohibitive gas charges on the chain
  // We require users to provide initial stats in this method so they won't miss setting initial values. It could be its own step
  if (args.type === StatType.Count) {
    const statValue = countStatInputToStatUpdates(args, context);
    transactions.push(
      checkTxType({
        transaction: statistics.batchUpdateAssetStats,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        args: [rawAssetId as any, newStat, statValue],
      })
    );
  } else if (args.type === StatType.ScopedCount) {
    const statValue = claimCountStatInputToStatUpdates(args, context);
    transactions.push(
      checkTxType({
        transaction: statistics.batchUpdateAssetStats,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        args: [rawAssetId as any, newStat, statValue],
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
  { type, asset }: AddAssetStatParams
): ProcedureAuthorization {
  const transactions = [TxTags.statistics.SetActiveAssetStats];
  if (type === StatType.Count || type === StatType.ScopedCount) {
    transactions.push(TxTags.statistics.BatchUpdateAssetStats);
  }
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
