import {
  PolymeshPrimitivesIdentityClaimClaimType,
  PolymeshPrimitivesIdentityId,
} from '@polkadot/types/lookup';

import { PolymeshError, Procedure } from '~/internal';
import { ErrorCode, RemoveAssetStatParams, StatClaimIssuer, StatType, TxTags } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import {
  assetToMeshAssetId,
  claimIssuerToMeshClaimIssuer,
  statisticsOpTypeToStatType,
  statisticStatTypesToBtreeStatType,
  statTypeToStatOpType,
} from '~/utils/conversion';
import { compareTransferRestrictionToStat, requestMulti } from '~/utils/internal';

/**
 * @hidden
 */
export async function prepareRemoveAssetStat(
  this: Procedure<RemoveAssetStatParams, void>,
  args: RemoveAssetStatParams
): Promise<TransactionSpec<void, ExtrinsicParams<'statistics', 'setActiveAssetStats'>>> {
  const {
    context: {
      polymeshApi: {
        tx: { statistics },
        query: { statistics: statisticsQuery },
      },
    },
    context,
  } = this;
  const { asset, type } = args;
  const rawAssetId = assetToMeshAssetId(asset, context);

  const [currentStats, { requirements }] = await requestMulti<
    [typeof statisticsQuery.activeAssetStats, typeof statisticsQuery.assetTransferCompliances]
  >(context, [
    [statisticsQuery.activeAssetStats, rawAssetId],
    [statisticsQuery.assetTransferCompliances, rawAssetId],
  ]);

  let claimIssuer: StatClaimIssuer;
  let rawClaimIssuer:
    | [PolymeshPrimitivesIdentityClaimClaimType, PolymeshPrimitivesIdentityId]
    | undefined;

  if (type === StatType.ScopedCount || type === StatType.ScopedBalance) {
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

  const removeTarget = statisticsOpTypeToStatType(
    { operationType: op, claimIssuer: rawClaimIssuer },
    context
  );
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

  return {
    transaction: statistics.setActiveAssetStats,
    args: [rawAssetId, newStats],
    resolver: undefined,
  };
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<RemoveAssetStatParams, void>,
  { asset }: RemoveAssetStatParams
): ProcedureAuthorization {
  const transactions = [TxTags.statistics.SetActiveAssetStats];
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
