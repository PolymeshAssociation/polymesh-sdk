import { PolymeshPrimitivesStatisticsStatType } from '@polkadot/types/lookup';
import { BTreeSet } from '@polkadot/types-codec';

import { Asset, PolymeshError, Procedure } from '~/internal';
import { ClaimOwnershipStatInput, ErrorCode, StatType, TxTags } from '~/types';
import { ProcedureAuthorization, StatisticsOpType } from '~/types/internal';
import {
  claimIssuerToMeshClaimIssuer,
  statisticsOpTypeToStatOpType,
  statisticsOpTypeToStatType,
  statisticStatTypesToBtreeStatType,
  stringToTickerKey,
} from '~/utils/conversion';
import { checkTxType, compareTransferRestrictionToStat } from '~/utils/internal';

export type RemoveCountStatParams = {
  type: StatType.Count;
};

export type RemoveBalanceStatParams = {
  type: StatType.Balance;
};

export type RemoveScopedCountParams = ClaimOwnershipStatInput & {
  type: StatType.ScopedCount;
};

export type RemoveScopedBalanceParams = ClaimOwnershipStatInput & {
  type: StatType.ScopedBalance;
};

export type RemoveAssetStatParams = { ticker: string } & (
  | RemoveCountStatParams
  | RemoveBalanceStatParams
  | RemoveScopedCountParams
  | RemoveScopedBalanceParams
);

export interface Storage {
  currentStats: BTreeSet<PolymeshPrimitivesStatisticsStatType>;
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

  let op;
  if (type === StatType.Count || StatType.ScopedCount) {
    op = statisticsOpTypeToStatOpType(StatisticsOpType.Count, context);
  } else {
    op = statisticsOpTypeToStatOpType(StatisticsOpType.Balance, context);
  }

  let rawClaimIssuer;
  if (type === StatType.ScopedBalance || type === StatType.ScopedCount) {
    rawClaimIssuer = claimIssuerToMeshClaimIssuer(args.claimIssuer, context);
  }

  const newStat = statisticsOpTypeToStatType({ op, claimIssuer: rawClaimIssuer }, context);
  const statsArr = [...currentStats];
  const removeIndex = statsArr.findIndex(s => s.eq(newStat));
  if (removeIndex >= 0) {
    statsArr.splice(removeIndex, 1);
  } else {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'Cannot remove a stat that is not enabled for this Asset',
    });
  }
  const newStats = statisticStatTypesToBtreeStatType(statsArr, context);

  this.addTransaction(
    checkTxType({
      transaction: statistics.setActiveAssetStats,
      args: [tickerKey, newStats],
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

  requirements.forEach(r => {
    let claimIssuer;
    if (type === StatType.ScopedCount || type === StatType.ScopedBalance) {
      claimIssuer = args.claimIssuer;
    }

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
    currentStats,
  };
}

/**
 * @hidden
 */
export const removeAssetStat = (): Procedure<RemoveAssetStatParams, void, Storage> =>
  new Procedure(prepareRemoveAssetStat, getAuthorization, prepareStorage);
