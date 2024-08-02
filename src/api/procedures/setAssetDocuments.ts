import { u32 } from '@polkadot/types';
import BigNumber from 'bignumber.js';

import { BaseAsset, PolymeshError, Procedure } from '~/internal';
import { AssetDocument, ErrorCode, SetAssetDocumentsParams, TxTags } from '~/types';
import { BatchTransactionSpec, ProcedureAuthorization } from '~/types/internal';
import {
  assetDocumentToDocument,
  assetToMeshAssetId,
  documentToAssetDocument,
} from '~/utils/conversion';
import { checkTxType, hasSameElements } from '~/utils/internal';

export interface Storage {
  currentDocIds: u32[];
  currentDocs: AssetDocument[];
}

/**
 * @hidden
 */
export type Params = SetAssetDocumentsParams & {
  asset: BaseAsset;
};

/**
 * @hidden
 */
export async function prepareSetAssetDocuments(
  this: Procedure<Params, void, Storage>,
  args: Params
): Promise<BatchTransactionSpec<void, unknown[][]>> {
  const {
    context: {
      polymeshApi: { tx },
    },
    context,
    storage: { currentDocIds, currentDocs },
  } = this;
  const { asset, documents } = args;

  if (hasSameElements(currentDocs, documents)) {
    throw new PolymeshError({
      code: ErrorCode.NoDataChange,
      message: 'The supplied document list is equal to the current one',
    });
  }

  const rawDocuments = documents.map(doc => assetDocumentToDocument(doc, context));

  const rawAssetId = assetToMeshAssetId(asset, context);

  const transactions = [];

  if (currentDocIds.length) {
    transactions.push(
      checkTxType({
        transaction: tx.asset.removeDocuments,
        feeMultiplier: new BigNumber(currentDocIds.length),
        args: [currentDocIds, rawAssetId],
      })
    );
  }

  if (rawDocuments.length) {
    transactions.push(
      checkTxType({
        transaction: tx.asset.addDocuments,
        feeMultiplier: new BigNumber(rawDocuments.length),
        args: [rawDocuments, rawAssetId],
      })
    );
  }

  return { transactions, resolver: undefined };
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params, void, Storage>,
  { asset, documents }: Params
): ProcedureAuthorization {
  const {
    storage: { currentDocIds },
  } = this;
  const transactions = [];

  if (documents.length) {
    transactions.push(TxTags.asset.AddDocuments);
  }

  if (currentDocIds.length) {
    transactions.push(TxTags.asset.RemoveDocuments);
  }

  return {
    permissions: {
      assets: [asset],
      transactions,
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export async function prepareStorage(
  this: Procedure<Params, void, Storage>,
  { asset }: Params
): Promise<Storage> {
  const {
    context: {
      polymeshApi: { query },
    },
    context,
  } = this;

  const rawAssetId = assetToMeshAssetId(asset, context);

  const currentDocEntries = await query.asset.assetDocuments.entries(rawAssetId);

  const currentDocIds: u32[] = [];
  const currentDocs: AssetDocument[] = [];

  currentDocEntries.forEach(([key, doc]) => {
    const [, docId] = key.args;
    if (doc.isSome) {
      currentDocIds.push(docId);
      currentDocs.push(documentToAssetDocument(doc.unwrap()));
    }
  });

  return {
    currentDocIds,
    currentDocs,
  };
}

/**
 * @hidden
 */
export const setAssetDocuments = (): Procedure<Params, void, Storage> =>
  new Procedure(prepareSetAssetDocuments, getAuthorization, prepareStorage);
