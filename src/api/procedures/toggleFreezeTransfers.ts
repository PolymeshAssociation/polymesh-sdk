import { BaseAsset, PolymeshError, Procedure } from '~/internal';
import { ErrorCode, TxTags } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import { assetToMeshAssetId } from '~/utils/conversion';

export interface ToggleFreezeTransfersParams {
  freeze: boolean;
}

/**
 * @hidden
 */
export type Params = ToggleFreezeTransfersParams & {
  asset: BaseAsset;
};

/**
 * @hidden
 */
export async function prepareToggleFreezeTransfers(
  this: Procedure<Params, void>,
  args: Params
): Promise<TransactionSpec<void, ExtrinsicParams<'asset', 'freeze'>>> {
  const {
    context: {
      polymeshApi: {
        tx: { asset },
      },
    },
    context,
  } = this;

  const { asset: assetEntity, freeze } = args;

  const rawAssetId = assetToMeshAssetId(assetEntity, context);

  const isFrozen = await args.asset.isFrozen();

  if (freeze) {
    if (isFrozen) {
      throw new PolymeshError({
        code: ErrorCode.NoDataChange,
        message: 'The Asset is already frozen',
      });
    }

    return {
      transaction: asset.freeze,
      args: [rawAssetId],
      resolver: undefined,
    };
  }
  if (!isFrozen) {
    throw new PolymeshError({
      code: ErrorCode.NoDataChange,
      message: 'The Asset is already unfrozen',
    });
  }

  return {
    transaction: asset.unfreeze,
    args: [rawAssetId],
    resolver: undefined,
  };
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params, void>,
  { asset, freeze }: Params
): ProcedureAuthorization {
  return {
    permissions: {
      transactions: [freeze ? TxTags.asset.Freeze : TxTags.asset.Unfreeze],
      assets: [asset],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const toggleFreezeTransfers = (): Procedure<Params, void> =>
  new Procedure(prepareToggleFreezeTransfers, getAuthorization);
