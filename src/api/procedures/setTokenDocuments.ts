import { u64 } from '@polkadot/types';
import { differenceWith } from 'lodash';
import { Document, Link, TxTags } from 'polymesh-types/types';

import { SecurityToken } from '~/api/entities';
import { PolymeshError, Procedure } from '~/base';
import { ErrorCode, LinkType, Role, RoleType, SignerType, TokenDocument } from '~/types';
import {
  batchArguments,
  booleanToBool,
  documentToTokenDocument,
  linkTypeToMeshLinkType,
  signerToSignatory,
  stringToTicker,
  tickerToDid,
  tokenDocumentToDocument,
} from '~/utils';

export interface SetTokenDocumentsParams {
  documents: TokenDocument[];
}

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
      polymeshApi: { tx, rpc },
    },
    context,
  } = this;
  const { ticker, documents } = args;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const currentDocLinks: Link[] = await (rpc as any).identity.getFilteredLinks(
    signerToSignatory({ type: SignerType.Identity, value: tickerToDid(ticker) }, context),
    booleanToBool(true, context),
    linkTypeToMeshLinkType(LinkType.DocumentOwnership, context)
  );

  const rawCurrentDocs: Document[] = [];
  const currentDocIds: u64[] = [];

  currentDocLinks.forEach(({ link_id: linkId, link_data: linkData }) => {
    rawCurrentDocs.push(linkData.asDocumentOwned);
    currentDocIds.push(linkId);
  });

  const currentDocs = rawCurrentDocs.map(rawDoc => documentToTokenDocument(rawDoc));

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

  const rawDocuments = documents.map(document => tokenDocumentToDocument(document, context));

  const rawTicker = stringToTicker(ticker, context);

  if (currentDocIds.length) {
    batchArguments(currentDocIds, TxTags.asset.RemoveDocuments).forEach(docIdBatch => {
      this.addTransaction(
        tx.asset.removeDocuments,
        { batchSize: docIdBatch.length },
        rawTicker,
        docIdBatch
      );
    });
  }

  if (rawDocuments.length) {
    batchArguments(rawDocuments, TxTags.asset.AddDocuments).forEach(rawDocumentBatch => {
      this.addTransaction(
        tx.asset.addDocuments,
        { batchSize: rawDocumentBatch.length },
        rawTicker,
        rawDocumentBatch
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

export const setTokenDocuments = new Procedure(prepareSetTokenDocuments, getRequiredRoles);
