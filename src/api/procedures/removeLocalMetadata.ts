import { MetadataEntry, PolymeshError, Procedure } from '~/internal';
import { ErrorCode, MetadataType, TxTags } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import {
  assetToMeshAssetId,
  bigNumberToU64,
  meshMetadataKeyToMetadataKey,
} from '~/utils/conversion';

/**
 * @hidden
 */
export type Params = {
  metadataEntry: MetadataEntry;
};

/**
 * @hidden
 */
export async function prepareRemoveLocalMetadata(
  this: Procedure<Params, void>,
  params: Params
): Promise<TransactionSpec<void, ExtrinsicParams<'assets', 'removeMetadataValue'>>> {
  const {
    context: {
      polymeshApi: {
        tx,
        query: { nft },
      },
      isV6,
    },
    context,
  } = this;

  const {
    metadataEntry: { id, type, asset },
    metadataEntry,
  } = params;

  if (type === MetadataType.Global) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'Global Metadata keys cannot be deleted',
    });
  }

  const rawAssetId = assetToMeshAssetId(asset, context);
  const rawKeyId = bigNumberToU64(id, context);

  let collectionAssetStorage = nft.collectionAsset;
  if (isV6) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    collectionAssetStorage = (nft as any).collectionTicker; // NOSONAR
  }
  const [collectionKey, { canModify, reason }] = await Promise.all([
    collectionAssetStorage(rawAssetId),
    metadataEntry.isModifiable(),
  ]);

  if (!collectionKey.isZero()) {
    const rawKeys = await nft.collectionKeys(collectionKey);
    const metadataKeys = await Promise.all(
      [...rawKeys].map(value => meshMetadataKeyToMetadataKey(value, asset, context))
    );
    const isRequired = metadataKeys.some(value => value.id.eq(id));

    if (isRequired) {
      throw new PolymeshError({
        code: ErrorCode.UnmetPrerequisite,
        message: 'Cannot delete a mandatory NFT Collection Key',
      });
    }
  }

  if (!canModify) {
    throw reason;
  }

  return {
    transaction: tx.asset.removeLocalMetadataKey,
    args: [rawAssetId, rawKeyId],
    resolver: undefined,
  };
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params, void>,
  params: Params
): ProcedureAuthorization {
  const {
    metadataEntry: { asset },
  } = params;

  return {
    permissions: {
      transactions: [TxTags.asset.RemoveLocalMetadataKey],
      assets: [asset],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const removeLocalMetadata = (): Procedure<Params, void> =>
  new Procedure(prepareRemoveLocalMetadata, getAuthorization);
