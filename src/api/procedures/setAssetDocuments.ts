import { DocumentId, TxTags } from 'polymesh-types/types';

import { Asset, PolymeshError, Procedure } from '~/internal';
import { AssetDocument, ErrorCode } from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import {
  assetDocumentToDocument,
  documentToAssetDocument,
  stringToTicker,
} from '~/utils/conversion';
import { batchArguments, hasSameElements } from '~/utils/internal';

export interface SetAssetDocumentsParams {
  /**
   * list of documents
   */
  documents: AssetDocument[];
}

export interface Storage {
  currentDocIds: DocumentId[];
  currentDocs: AssetDocument[];
}

/**
 * @hidden
 */
export type Params = SetAssetDocumentsParams & {
  ticker: string;
};

/**
 * @hidden
 */
export async function prepareSetAssetDocuments(
  this: Procedure<Params, Asset, Storage>,
  args: Params
): Promise<Asset> {
  const {
    context: {
      polymeshApi: { tx },
    },
    context,
    storage: { currentDocIds, currentDocs },
  } = this;
  const { ticker, documents } = args;

  if (hasSameElements(currentDocs, documents)) {
    throw new PolymeshError({
      code: ErrorCode.NoDataChange,
      message: 'The supplied document list is equal to the current one',
    });
  }

  const rawDocuments = documents.map(doc => assetDocumentToDocument(doc, context));

  const rawTicker = stringToTicker(ticker, context);

  if (currentDocIds.length) {
    batchArguments(currentDocIds, TxTags.asset.RemoveDocuments).forEach(docIdBatch => {
      this.addTransaction({
        transaction: tx.asset.removeDocuments,
        feeMultiplier: docIdBatch.length,
        args: [docIdBatch, rawTicker],
      });
    });
  }

  if (rawDocuments.length) {
    batchArguments(rawDocuments, TxTags.asset.AddDocuments).forEach(rawDocumentBatch => {
      this.addTransaction({
        transaction: tx.asset.addDocuments,
        feeMultiplier: rawDocumentBatch.length,
        args: [rawDocumentBatch, rawTicker],
      });
    });
  }

  return new Asset({ ticker }, context);
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params, Asset, Storage>,
  { ticker, documents }: Params
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
      assets: [new Asset({ ticker }, this.context)],
      transactions,
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export async function prepareStorage(
  this: Procedure<Params, Asset, Storage>,
  { ticker }: Params
): Promise<Storage> {
  const {
    context: {
      polymeshApi: { query },
    },
    context,
  } = this;

  const currentDocEntries = await query.asset.assetDocuments.entries(
    stringToTicker(ticker, context)
  );

  const currentDocIds: DocumentId[] = [];
  const currentDocs: AssetDocument[] = [];

  currentDocEntries.forEach(([key, doc]) => {
    const [, id] = key.args;
    currentDocIds.push(id);
    currentDocs.push(documentToAssetDocument(doc));
  });

  return {
    currentDocIds,
    currentDocs,
  };
}

/**
 * @hidden
 */
export const setAssetDocuments = (): Procedure<Params, Asset, Storage> =>
  new Procedure(prepareSetAssetDocuments, getAuthorization, prepareStorage);
