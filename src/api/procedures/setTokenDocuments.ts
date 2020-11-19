import { differenceWith } from 'lodash';
import { DocumentName, TxTags } from 'polymesh-types/types';

import { PolymeshError, Procedure, SecurityToken } from '~/internal';
import { ErrorCode, Role, RoleType, TokenDocument } from '~/types';
import { tuple } from '~/types/utils';
import {
  documentNameToString,
  documentToTokenDocumentData,
  stringToDocumentName,
  stringToTicker,
  tokenDocumentDataToDocument,
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

  const currentDocNames: DocumentName[] = [];
  const currentDocs: TokenDocument[] = [];

  currentDocEntries.forEach(([key, doc]) => {
    const name = key.args[1] as DocumentName;
    currentDocNames.push(name);
    currentDocs.push({
      ...documentToTokenDocumentData(doc),
      name: documentNameToString(name),
    });
  });

  const comparator = (a: TokenDocument, b: TokenDocument): boolean => {
    return a.name === b.name && a.uri === b.uri && a.contentHash === b.contentHash;
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

  const rawDocuments = documents.map(({ name, ...documentData }) =>
    tuple(stringToDocumentName(name, context), tokenDocumentDataToDocument(documentData, context))
  );

  const rawTicker = stringToTicker(ticker, context);

  if (currentDocNames.length) {
    batchArguments(currentDocNames, TxTags.asset.BatchRemoveDocument).forEach(docNameBatch => {
      this.addTransaction(
        tx.asset.batchRemoveDocument,
        { batchSize: docNameBatch.length },
        docNameBatch,
        rawTicker
      );
    });
  }

  if (rawDocuments.length) {
    batchArguments(rawDocuments, TxTags.asset.BatchAddDocument).forEach(rawDocumentBatch => {
      this.addTransaction(
        tx.asset.batchAddDocument,
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
