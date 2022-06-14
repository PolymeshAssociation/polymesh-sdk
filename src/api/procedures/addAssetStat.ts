import { BTreeSetStatType } from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';

import { Asset, PolymeshError, Procedure } from '~/internal';
import { AddCountStatInput, ErrorCode, StatisticsInputBase, StatType, TxTags } from '~/types';
import { ProcedureAuthorization, StatisticsOpType } from '~/types/internal';
import {
  bigNumberToU128,
  createStat2ndKey,
  meshStatToStatisticsOpType,
  statisticsOpTypeToStatOpType,
  statisticsOpTypeToStatType,
  statUpdate,
  statUpdatesToBtreeStatUpdate,
  stringToTickerKey,
} from '~/utils/conversion';
import { checkTxType } from '~/utils/internal';

export type AddCountStatParams = AddCountStatInput & {
  type: StatType.Count;
  count: BigNumber;
};

export type AddPercentStatParams = StatisticsInputBase & {
  type: StatType.Balance;
};

export type AddAssetStatParams = { ticker: string } & (AddCountStatParams | AddPercentStatParams);

export interface Storage {
  currentStats: BTreeSetStatType;
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
    type === StatType.Count
      ? statisticsOpTypeToStatOpType(StatisticsOpType.Count, context)
      : statisticsOpTypeToStatOpType(StatisticsOpType.Balance, context);

  const transactions = [];

  const newStat = statisticsOpTypeToStatType(op, context);
  currentStats.push(newStat);
  currentStats.sort().reverse();

  transactions.push(
    checkTxType({
      transaction: statistics.setActiveAssetStats,
      args: [tickerKey, currentStats],
    })
  );

  // Count stats need the user to provide the initial value for the counter
  if (args.type === StatType.Count) {
    const holderCount = args.count;
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
  const { ticker, type } = args;

  const tickerKey = stringToTickerKey(ticker, context);
  const currentStats = await statistics.activeAssetStats(tickerKey);
  const needStat = !currentStats.find(s => {
    const stat = meshStatToStatisticsOpType(s);
    const cmpStat = stat === StatisticsOpType.Balance ? StatType.Balance : StatType.Count;
    return cmpStat === type;
  });

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
