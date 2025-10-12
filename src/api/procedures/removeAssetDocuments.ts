import BigNumber from 'bignumber.js';

import { BaseAsset, PolymeshError, Procedure } from '~/internal';
import { ErrorCode, RemoveAssetDocumentsParams, TxTags } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import { assetToMeshAssetId, bigNumberToU32 } from '~/utils/conversion';

/**
 * @hidden
 */
export type Params = RemoveAssetDocumentsParams & {
  asset: BaseAsset;
};

/**
 * @hidden
 */
export function prepareRemoveAssetDocuments(
  this: Procedure<Params, void>,
  args: Params
): Promise<TransactionSpec<void, ExtrinsicParams<'asset', 'removeDocuments'>>> {
  const {
    context: {
      polymeshApi: { tx },
    },
    context,
  } = this;
  const { asset, documentIds } = args;

  if (!documentIds.length) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The document IDs list cannot be empty',
    });
  }

  const rawDocumentIds = documentIds.map(id => bigNumberToU32(id, context));
  const rawAssetId = assetToMeshAssetId(asset, context);

  return Promise.resolve({
    transaction: tx.asset.removeDocuments,
    feeMultiplier: new BigNumber(documentIds.length),
    args: [rawDocumentIds, rawAssetId],
    resolver: undefined,
  });
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
      assets: [asset],
      transactions: [TxTags.asset.RemoveDocuments],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const removeAssetDocuments = (): Procedure<Params, void> =>
  new Procedure(prepareRemoveAssetDocuments, getAuthorization);
