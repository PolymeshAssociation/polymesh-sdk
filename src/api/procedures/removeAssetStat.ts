import { BTreeSetStatType } from '@polkadot/types/lookup';

import { Asset, PolymeshError, Procedure } from '~/internal';
import { ErrorCode, TransferRestrictionType, TxTags } from '~/types';
import { ProcedureAuthorization, StatisticsOpType } from '~/types/internal';
import {
  meshStatToStatisticsOpType,
  statisticsOpTypeToStatOpType,
  statisticsOpTypeToStatType,
  stringToTickerKey,
} from '~/utils/conversion';
import { checkTxType } from '~/utils/internal';

export interface RemoveAssetStatParams {
  ticker: string;
  type: TransferRestrictionType;
}

export interface Storage {
  currentStats: BTreeSetStatType;
  asset: Asset;
}

/**
 * @hidden
 */
export async function prepareRemoveAssetStat(
  this: Procedure<RemoveAssetStatParams, void, Storage>,
  args: RemoveAssetStatParams
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
    type === TransferRestrictionType.Count
      ? statisticsOpTypeToStatOpType(StatisticsOpType.Count, context)
      : statisticsOpTypeToStatOpType(StatisticsOpType.Balance, context);

  const transactions = [];

  const rawStat = statisticsOpTypeToStatType(op, context);

  const index = currentStats.indexOf(rawStat);
  if (index > -1) {
    currentStats.splice(index, 1); // 2nd parameter means remove one item only
  }

  transactions.push(
    checkTxType({
      transaction: statistics.setActiveAssetStats,
      args: [tickerKey, currentStats],
    })
  );

  this.addBatchTransaction({ transactions });
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<RemoveAssetStatParams, void, Storage>
): ProcedureAuthorization {
  const {
    storage: { asset },
  } = this;
  return {
    permissions: {
      transactions: [TxTags.statistics.SetActiveAssetStats],
      assets: [asset],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export async function prepareStorage(
  this: Procedure<RemoveAssetStatParams, void, Storage>,
  args: RemoveAssetStatParams
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

  const asset = new Asset({ ticker }, context);

  const tickerKey = stringToTickerKey(ticker, context);

  const currentStats = await statistics.activeAssetStats(tickerKey);
  const hasStat = currentStats.find(s => {
    const stat = meshStatToStatisticsOpType(s);
    const cmpStat =
      stat === StatisticsOpType.Balance
        ? TransferRestrictionType.Percentage
        : TransferRestrictionType.Count;
    return cmpStat === type;
  });

  // TODO need to check if anything depends on the stat

  if (!hasStat) {
    throw new PolymeshError({
      code: ErrorCode.NoDataChange,
      message: 'That stat is not enabled',
    });
  }

  return {
    asset,
    currentStats,
  };
}

/**
 * @hidden
 */
export const removeAssetStat = (): Procedure<RemoveAssetStatParams, void, Storage> =>
  new Procedure(prepareRemoveAssetStat, getAuthorization, prepareStorage);
