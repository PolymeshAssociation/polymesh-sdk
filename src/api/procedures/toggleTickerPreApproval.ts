import { BaseAsset, PolymeshError, Procedure } from '~/internal';
import { ErrorCode, TxTags } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import { assetToMeshAssetId } from '~/utils/conversion';

/**
 * @hidden
 */
export interface Params {
  asset: BaseAsset;
  preApprove: boolean;
}

/**
 * @hidden
 */
export async function prepareToggleTickerPreApproval(
  this: Procedure<Params, void>,
  args: Params
): Promise<TransactionSpec<void, ExtrinsicParams<'assets', 'preApprove'>>> {
  const {
    context: {
      polymeshApi: { tx },
      isV6,
    },
    context,
  } = this;
  const { asset, preApprove } = args;

  const identity = await context.getSigningIdentity();
  const isPreApproved = await identity.isAssetPreApproved(asset);

  if (isPreApproved === preApprove) {
    const message = isPreApproved
      ? 'The signing identity has already pre-approved the ticker'
      : 'The signing identity has not pre-approved the asset';
    throw new PolymeshError({
      code: ErrorCode.NoDataChange,
      message,
      data: { identity: identity.did, assetId: asset.id },
    });
  }

  const rawAssetId = assetToMeshAssetId(asset, context);

  let transaction = preApprove ? tx.asset.preApproveAsset : tx.asset.removeAssetPreApproval;
  if (isV6) {
    transaction = preApprove
      ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (tx.asset as any).preApproveTicker
      : // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (tx.asset as any).removeTickerPreApproval;
  }

  return {
    transaction,
    args: [rawAssetId],
    resolver: undefined,
  };
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params, void>,
  { preApprove }: Params
): ProcedureAuthorization {
  return {
    permissions: {
      transactions: [
        preApprove ? TxTags.asset.PreApproveTicker : TxTags.asset.RemoveTickerPreApproval,
      ],
      assets: [],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const toggleTickerPreApproval = (): Procedure<Params, void> =>
  new Procedure(prepareToggleTickerPreApproval, getAuthorization);
