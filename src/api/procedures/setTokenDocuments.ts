import { differenceWith } from 'lodash';
import { DocumentId, TxTags } from 'polymesh-types/types';

import { PolymeshError, Procedure, SecurityToken } from '~/internal';
import { ErrorCode, Role, RoleType, TokenDocument } from '~/types';
import {
  documentToTokenDocument,
  stringToTicker,
  tokenDocumentToDocument,
} from '~/utils/conversion';
import { batchArguments } from '~/utils/internal';

export interface SetTokenDocumentsParams {
  documents: TokenDocument[];
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
  this: Procedure<Params, SecurityToken>,
  args: Params
): Promise<SecurityToken> {
  const {
    context: {
      polymeshApi: { tx, query },
    },
    context,
  } = this;
  const { ticker, documents } = args;

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
    batchArguments(rawDocuments, TxTags.asset.BatchAddDocument).forEach(rawDocumentBatch => {
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
export function getRequiredRoles({ ticker }: Params): Role[] {
  return [{ type: RoleType.TokenOwner, ticker }];
}

/**
 * @hidden
 */
export const setTokenDocuments = new Procedure(prepareSetTokenDocuments, getRequiredRoles);
