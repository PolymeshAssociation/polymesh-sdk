import { differenceWith } from 'lodash';
import { DocumentId, TxTags } from 'polymesh-types/types';

import { PolymeshError, Procedure, SecurityToken } from '~/internal';
import { ErrorCode, RoleType, TokenDocument } from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import {
  documentToTokenDocument,
  stringToTicker,
  tokenDocumentToDocument,
} from '~/utils/conversion';
import { batchArguments } from '~/utils/internal';

export interface SetTokenDocumentsParams {
  documents: TokenDocument[];
}

export interface Storage {
  currentDocIds: DocumentId[];
  currentDocs: TokenDocument[];
}

/**
 * @hidden
 */
export type Params = SetTokenDocumentsParams & {
  ticker: string;
};

/**
 * @hidden
 */
export async function prepareSetTokenDocuments(
  this: Procedure<Params, SecurityToken, Storage>,
  args: Params
): Promise<SecurityToken> {
  const {
    context: {
      polymeshApi: { tx },
    },
    context,
    storage: { currentDocIds, currentDocs },
  } = this;
  const { ticker, documents } = args;

  const comparator = (a: TokenDocument, b: TokenDocument): boolean => {
    return (
      a.name === b.name &&
      a.uri === b.uri &&
      a.contentHash === b.contentHash &&
      a.type === b.type &&
      a.filedAt === b.filedAt
    );
  };

  if (
    !differenceWith(currentDocs, documents, comparator).length &&
    currentDocs.length === documents.length
  ) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The supplied document list is equal to the current one',
    });
  }

  const rawDocuments = documents.map(doc => tokenDocumentToDocument(doc, context));

  const rawTicker = stringToTicker(ticker, context);

  if (currentDocIds.length) {
    batchArguments(currentDocIds, TxTags.asset.RemoveDocuments).forEach(docIdBatch => {
      this.addTransaction(
        tx.asset.removeDocuments,
        { batchSize: docIdBatch.length },
        docIdBatch,
        rawTicker
      );
    });
  }

  if (rawDocuments.length) {
    batchArguments(rawDocuments, TxTags.asset.AddDocuments).forEach(rawDocumentBatch => {
      this.addTransaction(
        tx.asset.addDocuments,
        { batchSize: rawDocumentBatch.length },
        rawDocumentBatch,
        rawTicker
      );
    });
  }

  return new SecurityToken({ ticker }, context);
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params, SecurityToken, Storage>,
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
    identityRoles: [{ type: RoleType.TokenOwner, ticker }],
    signerPermissions: {
      tokens: [new SecurityToken({ ticker }, this.context)],
      transactions,
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export async function prepareStorage(
  this: Procedure<Params, SecurityToken, Storage>,
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
  const currentDocs: TokenDocument[] = [];

  currentDocEntries.forEach(([key, doc]) => {
    const id = key.args[1] as DocumentId;
    currentDocIds.push(id);
    currentDocs.push(documentToTokenDocument(doc));
  });

  return {
    currentDocIds,
    currentDocs,
  };
}

/**
 * @hidden
 */
export const setTokenDocuments = new Procedure(prepareSetTokenDocuments, getAuthorization);
