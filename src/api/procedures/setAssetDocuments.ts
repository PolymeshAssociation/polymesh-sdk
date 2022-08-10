import BigNumber from 'bignumber.js';
import { DocumentId } from 'polymesh-types/types';

import { Asset, PolymeshError, Procedure } from '~/internal';
import { AssetDocument, ErrorCode, SetAssetDocumentsParams, TxTags } from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import {
  assetDocumentToDocument,
  documentToAssetDocument,
  stringToTicker,
} from '~/utils/conversion';
import { checkTxType, hasSameElements } from '~/utils/internal';

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

  const transactions = [];

  if (currentDocIds.length) {
    transactions.push(
      checkTxType({
        transaction: tx.asset.removeDocuments,
        feeMultiplier: new BigNumber(currentDocIds.length),
        args: [currentDocIds, rawTicker],
      })
    );
  }

  if (rawDocuments.length) {
    transactions.push(
      checkTxType({
        transaction: tx.asset.addDocuments,
        feeMultiplier: new BigNumber(rawDocuments.length),
        args: [rawDocuments, rawTicker],
      })
    );
  }

  this.addBatchTransaction({ transactions });

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
