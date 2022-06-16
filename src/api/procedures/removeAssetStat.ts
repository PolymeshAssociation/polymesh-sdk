import { BTreeSetStatType } from '@polkadot/types/lookup';

import { Asset, PolymeshError, Procedure } from '~/internal';
import { ErrorCode, StatType, TxTags } from '~/types';
import { ProcedureAuthorization, StatisticsOpType } from '~/types/internal';
import {
  meshStatToStatisticsOpType,
  statisticsOpTypeToStatOpType,
  statisticsOpTypeToStatType,
  stringToTickerKey,
} from '~/utils/conversion';
import { checkTxType } from '~/utils/internal';

export interface RemoveCountStatParams {
  type: StatType.Count;
}

export interface RemoveBalanceStatParams {
  type: StatType.Balance;
}

export type RemoveAssetStatParams = { ticker: string } & (
  | RemoveCountStatParams
  | RemoveBalanceStatParams
);

export interface Storage {
  currentStats: BTreeSetStatType;
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
    type === StatType.Count
      ? statisticsOpTypeToStatOpType(StatisticsOpType.Count, context)
      : statisticsOpTypeToStatOpType(StatisticsOpType.Balance, context);

  const newStat = statisticsOpTypeToStatType(op, context);
  const removeIndex = currentStats.indexOf(newStat);
  const statsArr = currentStats.toArray();
  statsArr.splice(removeIndex, 1);

  this.addTransaction(
    checkTxType({
      transaction: statistics.setActiveAssetStats,
      args: [tickerKey, statsArr as BTreeSetStatType],
    })
  );
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<RemoveAssetStatParams, void, Storage>,
  { ticker }: RemoveAssetStatParams
): ProcedureAuthorization {
  const transactions = [TxTags.statistics.SetActiveAssetStats];
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

  const tickerKey = stringToTickerKey(ticker, context);
  const [currentStats, { requirements }] = await Promise.all([
    statistics.activeAssetStats(tickerKey),
    statistics.assetTransferCompliances(tickerKey),
  ]);
  const missingStat = !currentStats.find(s => {
    const stat = meshStatToStatisticsOpType(s);
    const cmpStat = stat === StatisticsOpType.Balance ? StatType.Balance : StatType.Count;
    return cmpStat === type;
  });

  if (missingStat) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: `Stat of type: "${type}" is not enabled for Asset: "${ticker}"`,
    });
  }

  requirements.forEach(r => {
    let matchedRequirement = '';
    if (type === StatType.Count && r.isMaxInvestorCount) {
      matchedRequirement = StatType.Count;
    } else if (type === StatType.Balance && r.isMaxInvestorOwnership) {
      matchedRequirement = StatType.Balance;
    }

    if (matchedRequirement !== '') {
      throw new PolymeshError({
        code: ErrorCode.UnmetPrerequisite,
        message:
          'This statistics cannot be removed as a TransferRequirement is currently using using it',
      });
    }
  });

  return {
    currentStats,
  };
}

/**
 * @hidden
 */
export const removeAssetStat = (): Procedure<RemoveAssetStatParams, void, Storage> =>
  new Procedure(prepareRemoveAssetStat, getAuthorization, prepareStorage);
