import { BTreeSetStatType } from '@polkadot/types/lookup';

import { Asset, PolymeshError, Procedure } from '~/internal';
import { ClaimIssuer, ErrorCode, StatType, TxTags } from '~/types';
import { ProcedureAuthorization, StatisticsOpType } from '~/types/internal';
import {
  claimIssuerToMeshClaimIssuer,
  statisticsOpTypeToStatOpType,
  statisticsOpTypeToStatType,
  stringToTickerKey,
} from '~/utils/conversion';
import {
  checkTxType,
  compareStatsToInput,
  compareTransferRestrictionToStat,
} from '~/utils/internal';

export interface RemoveAssetStatParamsBase {
  claimIssuer?: ClaimIssuer;
}

export type RemoveCountStatParams = RemoveAssetStatParamsBase & {
  type: StatType.Count;
};

export type RemoveBalanceStatParams = RemoveAssetStatParamsBase & {
  type: StatType.Balance;
};

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
  const { ticker, type, claimIssuer } = args;

  const tickerKey = stringToTickerKey(ticker, context);

  const op =
    type === StatType.Count
      ? statisticsOpTypeToStatOpType(StatisticsOpType.Count, context)
      : statisticsOpTypeToStatOpType(StatisticsOpType.Balance, context);

  const rawClaimIssuer = claimIssuer
    ? claimIssuerToMeshClaimIssuer(claimIssuer, context)
    : undefined;

  const newStat = statisticsOpTypeToStatType({ op, claimIssuer: rawClaimIssuer }, context);
  const removeIndex = currentStats.indexOf(newStat);
  console.log('removing index of: ', removeIndex);
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
  const { ticker, type, claimIssuer } = args;

  const tickerKey = stringToTickerKey(ticker, context);
  const [currentStats, { requirements }] = await Promise.all([
    statistics.activeAssetStats(tickerKey),
    statistics.assetTransferCompliances(tickerKey),
  ]);
  const missingStat = !currentStats.find(s => {
    return compareStatsToInput(s, args);
  });

  if (missingStat) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'Cannot remove a stat that is not enabled for this Asset',
    });
  }

  requirements.forEach(r => {
    const used = compareTransferRestrictionToStat(
      r,
      type,
      claimIssuer?.issuer.did,
      claimIssuer?.claimType
    );

    if (used) {
      throw new PolymeshError({
        code: ErrorCode.UnmetPrerequisite,
        message:
          'This statistics cannot be removed because a TransferRequirement is currently using it',
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
