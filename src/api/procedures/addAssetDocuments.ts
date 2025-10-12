import BigNumber from 'bignumber.js';

import { BaseAsset, PolymeshError, Procedure } from '~/internal';
import { AddAssetDocumentsParams, ErrorCode, TxTags } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import { assetDocumentToDocument, assetToMeshAssetId } from '~/utils/conversion';

/**
 * @hidden
 */
export type Params = AddAssetDocumentsParams & {
  asset: BaseAsset;
};

/**
 * @hidden
 */
export function prepareAddAssetDocuments(
  this: Procedure<Params, void>,
  args: Params
): Promise<TransactionSpec<void, ExtrinsicParams<'asset', 'addDocuments'>>> {
  const {
    context: {
      polymeshApi: { tx },
    },
    context,
  } = this;
  const { asset, documents } = args;

  if (!documents.length) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The documents list cannot be empty',
    });
  }

  const rawDocuments = documents.map(doc => assetDocumentToDocument(doc, context));
  const rawAssetId = assetToMeshAssetId(asset, context);

  return Promise.resolve({
    transaction: tx.asset.addDocuments,
    feeMultiplier: new BigNumber(documents.length),
    args: [rawDocuments, rawAssetId],
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
      transactions: [TxTags.asset.AddDocuments],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const addAssetDocuments = (): Procedure<Params, void> =>
  new Procedure(prepareAddAssetDocuments, getAuthorization);
