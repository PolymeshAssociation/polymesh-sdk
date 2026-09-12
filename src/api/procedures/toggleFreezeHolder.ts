import { assertAssetHolderExists, assertTxSupported } from '~/api/procedures/utils';
import { BaseAsset, PolymeshError, Procedure } from '~/internal';
import { ErrorCode, FreezeHolderParams, TxTags } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import {
  assetHolderIdToMeshAssetHolder,
  assetHolderLikeToAssetHolderId,
  assetToMeshAssetId,
  booleanToBool,
} from '~/utils/conversion';
import { getHolderFreezeStatus } from '~/utils/internal';

/**
 * @hidden
 */
export type Params = FreezeHolderParams & {
  asset: BaseAsset;
  freeze: boolean;
};

/**
 * @hidden
 */
export async function prepareToggleFreezeHolder(
  this: Procedure<Params, void>,
  args: Params
): Promise<TransactionSpec<void, ExtrinsicParams<'asset', 'setHolderFrozen'>>> {
  const {
    context: {
      polymeshApi: { tx },
    },
    context,
  } = this;
  const { asset, holder, freeze } = args;

  assertTxSupported(TxTags.asset.SetHolderFrozen, '8.1.1', context);

  const holderId = assetHolderLikeToAssetHolderId(holder);

  const [{ isFrozen }] = await Promise.all([
    getHolderFreezeStatus(holder, asset, context),
    assertAssetHolderExists(holderId, context),
  ]);

  if (isFrozen === freeze) {
    throw new PolymeshError({
      code: ErrorCode.NoDataChange,
      message: freeze ? 'The holder is already frozen' : 'The holder is already unfrozen',
      data: { holder: holderId },
    });
  }

  return {
    transaction: tx.asset.setHolderFrozen,
    // unlike the other freezing extrinsics, this one takes the holder before the Asset
    args: [
      assetHolderIdToMeshAssetHolder(holderId, context),
      assetToMeshAssetId(asset, context),
      booleanToBool(freeze, context),
    ],
    resolver: undefined,
  };
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params, void>,
  { asset }: Params
): ProcedureAuthorization {
  return {
    permissions: {
      transactions: [TxTags.asset.SetHolderFrozen],
      assets: [asset],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const toggleFreezeHolder = (): Procedure<Params, void> =>
  new Procedure(prepareToggleFreezeHolder, getAuthorization);
