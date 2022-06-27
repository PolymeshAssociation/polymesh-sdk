import { PolymeshPrimitivesStatisticsStatType } from '@polkadot/types/lookup';
import { BTreeSet } from '@polkadot/types-codec';

import { Asset, PolymeshError, Procedure } from '~/internal';
import {
  AddCountStatInput,
  ClaimCountStatInput,
  ClaimOwnershipStatInput,
  ErrorCode,
  StatType,
  TxTags,
} from '~/types';
import { ProcedureAuthorization, StatisticsOpType } from '~/types/internal';
import {
  claimCountStatInputToStatUpdates,
  claimIssuerToMeshClaimIssuer,
  countStatInputToStatUpdates,
  statisticsOpTypeToStatOpType,
  statisticsOpTypeToStatType,
  statisticStatTypesToBtreeStatType,
  stringToTickerKey,
} from '~/utils/conversion';
import { checkTxType, compareStatsToInput } from '~/utils/internal';

export type AddCountStatParams = AddCountStatInput & {
  type: StatType.Count;
};

export type AddBalanceStatParams = {
  type: StatType.Balance;
};

export type AddClaimCountStatParams = ClaimCountStatInput & {
  type: StatType.ScopedCount;
};

export type AddClaimOwnershipStatParams = ClaimOwnershipStatInput & {
  type: StatType.ScopedBalance;
};

export type AddAssetStatParams = { ticker: string } & (
  | AddCountStatParams
  | AddBalanceStatParams
  | AddClaimCountStatParams
  | AddClaimOwnershipStatParams
);

export interface Storage {
  currentStats: BTreeSet<PolymeshPrimitivesStatisticsStatType>;
}

/**
 * @hidden
 */
export async function prepareAddAssetStat(
  this: Procedure<AddAssetStatParams, void, Storage>,
  args: AddAssetStatParams
): Promise<void> {
  const {
    context: {
      polymeshApi: {
        tx: { statistics },
      },
    },
    storage: { currentStats },
    context,
  } = this;
  const { ticker, type } = args;

  const tickerKey = stringToTickerKey(ticker, context);

  const op =
    type === StatType.Count || type === StatType.ScopedCount
      ? statisticsOpTypeToStatOpType(StatisticsOpType.Count, context)
      : statisticsOpTypeToStatOpType(StatisticsOpType.Balance, context);

  const transactions = [];

  let rawClaimIssuer;
  if (args.type === StatType.ScopedCount || args.type === StatType.ScopedBalance) {
    rawClaimIssuer = claimIssuerToMeshClaimIssuer(args.claimIssuer, context);
  }

  const newStat = statisticsOpTypeToStatType({ op, claimIssuer: rawClaimIssuer }, context);
  const newStats = statisticStatTypesToBtreeStatType([...currentStats, newStat], context);
  transactions.push(
    checkTxType({
      transaction: statistics.setActiveAssetStats,
      args: [tickerKey, newStats],
    })
  );

  // Count stats need the user to provide the initial value for the counter as computing them present a DOS attack vector on chain
  // We require users to provide initial stats so they won't miss setting initial values
  if (args.type === StatType.Count) {
    const statValue = countStatInputToStatUpdates(args, context);
    transactions.push(
      checkTxType({
        transaction: statistics.batchUpdateAssetStats,
        args: [tickerKey, newStat, statValue],
      })
    );
  } else if (args.type === StatType.ScopedCount) {
    if (args.type === StatType.ScopedCount) {
      const {
        claimIssuer: { value },
      } = args;
      const statValue = claimCountStatInputToStatUpdates(value, context);
      transactions.push(
        checkTxType({
          transaction: statistics.batchUpdateAssetStats,
          args: [tickerKey, newStat, statValue],
        })
      );
    }
  }

  this.addBatchTransaction({ transactions });
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<AddAssetStatParams, void, Storage>,
  { type, ticker }: AddAssetStatParams
): ProcedureAuthorization {
  const transactions = [TxTags.statistics.SetActiveAssetStats];
  if (type === StatType.Count) {
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
export async function prepareStorage(
  this: Procedure<AddAssetStatParams, void, Storage>,
  args: AddAssetStatParams
): Promise<Storage> {
  const {
    context,
    context: {
      polymeshApi: {
        query: { statistics },
      },
    },
  } = this;
  const { ticker } = args;

  const tickerKey = stringToTickerKey(ticker, context);
  const currentStats = await statistics.activeAssetStats(tickerKey);
  const needStat = ![...currentStats].find(s => compareStatsToInput(s, args));

  if (!needStat) {
    throw new PolymeshError({
      code: ErrorCode.NoDataChange,
      message: 'Stat is already enabled',
    });
  }

  return {
    currentStats,
  };
}

/**
 * @hidden
 */
export const addAssetStat = (): Procedure<AddAssetStatParams, void, Storage> =>
  new Procedure(prepareAddAssetStat, getAuthorization, prepareStorage);
