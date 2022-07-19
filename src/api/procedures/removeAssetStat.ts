import { QueryableStorageEntry } from '@polkadot/api/types';
import {
  PolymeshPrimitivesIdentityClaimClaimType,
  PolymeshPrimitivesIdentityId,
} from '@polkadot/types/lookup';

import { Asset, PolymeshError, Procedure } from '~/internal';
import { ErrorCode, StatClaimIssuer, StatType, TxTags } from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import { QueryReturnType } from '~/types/utils';
import {
  claimIssuerToMeshClaimIssuer,
  statisticsOpTypeToStatType,
  statisticStatTypesToBtreeStatType,
  statTypeToStatOpType,
  stringToTickerKey,
} from '~/utils/conversion';
import { checkTxType, compareTransferRestrictionToStat } from '~/utils/internal';

export type RemoveCountStatParams = {
  type: StatType.Count;
};

export type RemoveBalanceStatParams = {
  type: StatType.Percentage;
};

export type RemoveScopedCountParams = StatClaimIssuer & {
  type: StatType.ScopedCount;
};

export type RemoveScopedBalanceParams = StatClaimIssuer & {
  type: StatType.ScopedPercentage;
};

export type RemoveAssetStatParams = { ticker: string } & (
  | RemoveCountStatParams
  | RemoveBalanceStatParams
  | RemoveScopedCountParams
  | RemoveScopedBalanceParams
);

/**
 * @hidden
 */
export async function prepareRemoveAssetStat(
  this: Procedure<RemoveAssetStatParams, void>,
  args: RemoveAssetStatParams
): Promise<void> {
  const {
    context: {
      polymeshApi: {
        tx: { statistics },
        query: { statistics: statisticsQuery },
        queryMulti,
      },
    },
    context,
  } = this;
  const { ticker, type } = args;
  const tickerKey = stringToTickerKey(ticker, context);

  const [currentStats, { requirements }] = await queryMulti<
    [
      QueryReturnType<typeof statisticsQuery.activeAssetStats>,
      QueryReturnType<typeof statisticsQuery.assetTransferCompliances>
    ]
  >([
    [statisticsQuery.activeAssetStats as unknown as QueryableStorageEntry<'promise'>, tickerKey],
    [
      statisticsQuery.assetTransferCompliances as unknown as QueryableStorageEntry<'promise'>,
      tickerKey,
    ],
  ]);

  let claimIssuer: StatClaimIssuer;
  let rawClaimIssuer:
    | [PolymeshPrimitivesIdentityClaimClaimType, PolymeshPrimitivesIdentityId]
    | undefined;
  if (type === StatType.ScopedCount || type === StatType.ScopedPercentage) {
    claimIssuer = { issuer: args.issuer, claimType: args.claimType };
    rawClaimIssuer = claimIssuerToMeshClaimIssuer(claimIssuer, context);
  }

  requirements.forEach(r => {
    const used = compareTransferRestrictionToStat(r, type, claimIssuer);
    if (used) {
      throw new PolymeshError({
        code: ErrorCode.UnmetPrerequisite,
        message:
          'The statistic cannot be removed because a Transfer Restriction is currently using it',
      });
    }
  });

  const op = statTypeToStatOpType(type, context);

  const removeTarget = statisticsOpTypeToStatType({ op, claimIssuer: rawClaimIssuer }, context);
  const statsArr = [...currentStats];
  const removeIndex = statsArr.findIndex(s => removeTarget.eq(s));
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
  this: Procedure<RemoveAssetStatParams, void>,
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
export const removeAssetStat = (): Procedure<RemoveAssetStatParams, void> =>
  new Procedure(prepareRemoveAssetStat, getAuthorization);
