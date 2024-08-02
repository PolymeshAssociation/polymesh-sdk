import { MetadataEntry, Procedure } from '~/internal';
import { TxTags } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import { assetToMeshAssetId, metadataToMeshMetadataKey } from '~/utils/conversion';

/**
 * @hidden
 */
export type Params = {
  metadataEntry: MetadataEntry;
};

/**
 * @hidden
 */
export async function prepareClearMetadata(
  this: Procedure<Params, void>,
  params: Params
): Promise<TransactionSpec<void, ExtrinsicParams<'assets', 'removeMetadataValue'>>> {
  const {
    context: {
      polymeshApi: { tx },
    },
    context,
  } = this;

  const {
    metadataEntry: { id, type, asset },
    metadataEntry,
  } = params;

  const rawAssetId = assetToMeshAssetId(asset, context);
  const rawMetadataKey = metadataToMeshMetadataKey(type, id, context);

  const { canModify, reason } = await metadataEntry.isModifiable();

  if (!canModify) {
    throw reason;
  }

  return {
    transaction: tx.asset.removeMetadataValue,
    args: [rawAssetId, rawMetadataKey],
    resolver: undefined,
  };
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params, void>,
  { metadataEntry: { asset } }: Params
): ProcedureAuthorization {
  return {
    permissions: {
      transactions: [TxTags.asset.RemoveMetadataValue],
      assets: [asset],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const clearMetadata = (): Procedure<Params, void> =>
  new Procedure(prepareClearMetadata, getAuthorization);
