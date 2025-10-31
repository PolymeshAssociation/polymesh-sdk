import {
  PolymeshPrimitivesStatisticsStatType,
  PolymeshPrimitivesStatisticsStatUpdate,
} from '@polkadot/types/lookup';
import { BTreeSet } from '@polkadot/types-codec';

import { Context, PolymeshError, Procedure } from '~/internal';
import {
  AddBalanceStatParams,
  AddClaimBalanceStatParams,
  AddClaimCountStatParams,
  AddCountStatParams,
  ErrorCode,
  FungibleAsset,
  SetTransferRestrictionStatParams,
  StatType,
  TxTag,
  TxTags,
} from '~/types';
import { BatchTransactionSpec, ProcedureAuthorization } from '~/types/internal';
import {
  assetToMeshAssetId,
  balanceStatInputToStatUpdates,
  claimBalanceStatInputToStatUpdates,
  claimCountStatInputToStatUpdates,
  claimIssuerToMeshClaimIssuer,
  countStatInputToStatUpdates,
  statisticsOpTypeToStatType,
  statisticStatTypesToBtreeStatType,
  statParamsToMeshStatType,
  statTypeToStatOpType,
  statUpdatesToBtreeStatUpdate,
} from '~/utils/conversion';
import { checkTxType } from '~/utils/internal';

/**
 * @hidden
 */
export type SetAssetStatParams = { asset: FungibleAsset } & SetTransferRestrictionStatParams;

/**
 * @hidden
 */
export interface SetAssetStatsStorage {
  currentStats: BTreeSet<PolymeshPrimitivesStatisticsStatType>;
}

/**
 * @hidden
 */
function statToStatUpdates(
  stat:
    | AddCountStatParams
    | AddBalanceStatParams
    | AddClaimCountStatParams
    | AddClaimBalanceStatParams,
  context: Context
): BTreeSet<PolymeshPrimitivesStatisticsStatUpdate> {
  const { type } = stat;

  if (type === StatType.Count && stat.count !== undefined) {
    return countStatInputToStatUpdates(stat, context);
  }

  if (type === StatType.ScopedCount && stat.value !== undefined) {
    return claimCountStatInputToStatUpdates(stat, context);
  }

  if (type === StatType.Balance && stat.balance !== undefined) {
    return balanceStatInputToStatUpdates(stat, context);
  }

  if (type === StatType.ScopedBalance && stat.value !== undefined) {
    return claimBalanceStatInputToStatUpdates(stat, context);
  }

  // Return empty BTreeSet when no value is provided
  return statUpdatesToBtreeStatUpdate([], context);
}

/**
 * @hidden
 */
export function prepareSetAssetStats(
  this: Procedure<SetAssetStatParams, void, SetAssetStatsStorage>,
  args: SetAssetStatParams
): Promise<BatchTransactionSpec<void, unknown[][]>> {
  const {
    context: {
      polymeshApi: {
        tx: { statistics },
      },
    },
    context,
    storage: { currentStats },
  } = this;
  const { asset, stats } = args;

  const rawAssetId = assetToMeshAssetId(asset, context);
  const transactions = [];

  // Build new stats list and compare with current stats
  const rawStats = stats.map(stat => statParamsToMeshStatType(stat, context));
  const rawNewStats = statisticStatTypesToBtreeStatType(rawStats, context);

  // If the new stats set differs from the current one, create a setActiveAssetStats transaction
  if (!rawNewStats.hash.eq(currentStats.hash)) {
    transactions.push(
      checkTxType({
        transaction: statistics.setActiveAssetStats,
        args: [rawAssetId, rawNewStats],
      })
    );
  }

  // Create a separate batchUpdateAssetStats transaction for each stat that has a value
  for (const stat of stats) {
    const type = stat.type;
    const operationType = statTypeToStatOpType(type, context);

    let rawClaimIssuer;
    if (type === StatType.ScopedCount || type === StatType.ScopedBalance) {
      rawClaimIssuer = claimIssuerToMeshClaimIssuer(stat, context);
    }

    const statType = statisticsOpTypeToStatType(
      { operationType, claimIssuer: rawClaimIssuer },
      context
    );

    const rawUpdates = statToStatUpdates(stat, context);

    if (!rawUpdates.isEmpty) {
      transactions.push(
        checkTxType({
          transaction: statistics.batchUpdateAssetStats,
          args: [rawAssetId, statType, rawUpdates],
        })
      );
    }
  }

  if (transactions.length === 0) {
    throw new PolymeshError({
      code: ErrorCode.NoDataChange,
      message: 'The supplied stat types are already set and no new values were provided',
    });
  }

  return Promise.resolve({ transactions, resolver: undefined });
}

/**
 * @hidden
 */
export async function prepareStorage(
  this: Procedure<SetAssetStatParams, void, SetAssetStatsStorage>,
  { asset }: SetAssetStatParams
): Promise<SetAssetStatsStorage> {
  const {
    context: {
      polymeshApi: {
        query: { statistics },
      },
    },
    context,
  } = this;

  const rawAssetId = assetToMeshAssetId(asset, context);
  const currentStats = await statistics.activeAssetStats(rawAssetId);

  return {
    currentStats,
  };
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<SetAssetStatParams, void, SetAssetStatsStorage>,
  { asset, stats }: SetAssetStatParams
): ProcedureAuthorization {
  const {
    storage: { currentStats },
    context,
  } = this;

  const hasValues = stats.some(stat => {
    const { type } = stat;
    if (type === StatType.Count) {
      return stat.count !== undefined;
    } else if (type === StatType.ScopedCount) {
      return stat.value !== undefined;
    } else if (type === StatType.Balance) {
      return stat.balance !== undefined;
    } else if (type === StatType.ScopedBalance) {
      return stat.value !== undefined;
    }
    throw new PolymeshError({
      code: ErrorCode.UnexpectedError,
      message: `Unsupported stat type: ${type}. Please report this to the Polymesh team`,
    });
  });

  // Build new stats list and compare with current stats
  const rawStats = stats.map(stat => statParamsToMeshStatType(stat, context));
  const rawNewStats = statisticStatTypesToBtreeStatType(rawStats, context);
  const transactions: TxTag[] = [];
  // If the new stats set differs from the current one, push a setActiveAssetStats transaction
  if (!rawNewStats.hash.eq(currentStats.hash)) {
    transactions.push(TxTags.statistics.SetActiveAssetStats);
  }

  if (hasValues) {
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
export const setAssetStats = (): Procedure<SetAssetStatParams, void, SetAssetStatsStorage> =>
  new Procedure(prepareSetAssetStats, getAuthorization, prepareStorage);
