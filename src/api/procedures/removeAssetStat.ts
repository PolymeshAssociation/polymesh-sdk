import { BTreeSetStatType, PolymeshPrimitivesStatisticsStatType } from '@polkadot/types/lookup';

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

export type RemoveCountStatParams = {
  type: StatType.Count;
};

export type RemoveBalanceStatParams = {
  type: StatType.Balance;
};

export type RemoveScopedCountStatParams = {
  type: StatType.ScopedCount;
  claimIssuer: ClaimIssuer;
};

export type RemoveScopedBalanceStatParams = {
  type: StatType.ScopedBalance;
  claimIssuer: ClaimIssuer;
};

export type RemoveAssetStatInput<T> = Omit<
  T extends StatType.Count
    ? RemoveCountStatParams
    : T extends StatType.Balance
    ? RemoveBalanceStatParams
    : T extends StatType.ScopedCount
    ? RemoveScopedCountStatParams
    : RemoveScopedBalanceStatParams,
  'type'
>;

export type RemoveAssetStatParams = { ticker: string } & (
  | RemoveCountStatParams
  | RemoveBalanceStatParams
  | RemoveScopedCountStatParams
  | RemoveScopedBalanceStatParams
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

  let rawClaimIssuer;
  if (type === StatType.ScopedCount || type === StatType.ScopedBalance) {
    rawClaimIssuer = claimIssuerToMeshClaimIssuer(args.claimIssuer, context);
  }

  const newStat = statisticsOpTypeToStatType({ op, claimIssuer: rawClaimIssuer }, context);
  const removed = currentStats.delete(newStat);
  console.log('removed? ', removed);
  // const statsArr = currentStats.toArray();
  // statsArr.splice(removeIndex, 1);

  this.addTransaction(
    checkTxType({
      transaction: statistics.setActiveAssetStats,
      args: [tickerKey, currentStats as BTreeSetStatType],
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
  const missingStat = !(
    currentStats as unknown as Array<PolymeshPrimitivesStatisticsStatType>
  ).find(s => {
    return compareStatsToInput(s, args);
  });

  if (missingStat) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'Cannot remove a stat that is not enabled for this Asset',
    });
  }

  let claimIssuer: ClaimIssuer;
  if (type === StatType.ScopedCount || type === StatType.ScopedBalance) {
    claimIssuer = args.claimIssuer;
  }

  requirements.forEach(r => {
    const used = compareTransferRestrictionToStat(r, type, claimIssuer);

    if (used) {
      throw new PolymeshError({
        code: ErrorCode.UnmetPrerequisite,
        message:
          'This statistics cannot be removed because a TransferRequirement is currently using it',
      });
    }
  });

  return {
    currentStats: currentStats as unknown as BTreeSetStatType,
  };
}

/**
 * @hidden
 */
export const removeAssetStat = (): Procedure<RemoveAssetStatParams, void, Storage> =>
  new Procedure(prepareRemoveAssetStat, getAuthorization, prepareStorage);
