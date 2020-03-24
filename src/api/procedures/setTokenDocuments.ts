import { u64 } from '@polkadot/types';
import { differenceWith } from 'lodash';
import { Document } from 'polymesh-types/types';

import { SecurityToken } from '~/api/entities';
import { PolymeshError, Procedure } from '~/base';
import { ErrorCode, Role, RoleType, TokenDocument } from '~/types';
import { SignerType } from '~/types/internal';
import { signerToSignatory, stringToTicker, tickerToDid, tokenDocumentToDocument } from '~/utils';

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
      polymeshApi: { query, tx },
    },
    context,
  } = this;
  const { ticker, documents } = args;

  const links = await query.identity.links.entries(
    signerToSignatory({ type: SignerType.Identity, value: tickerToDid(ticker) }, context)
  );

  const currentDocLinks = links.filter(([, { link_data: linkData }]) => linkData.isDocumentOwned);
  const currentDocs: Document[] = [];
  const currentDocIds: u64[] = [];

  currentDocLinks.forEach(([, { link_id: linkId, link_data: linkData }]) => {
    currentDocs.push(linkData.asDocumentOwned);
    currentDocIds.push(linkId);
  });

  const rawDocuments = documents.map(document => tokenDocumentToDocument(document, context));

  const comparator = (a: Document, b: Document): boolean => {
    return a.name === b.name && a.uri && b.uri && a.content_hash === b.content_hash;
  };

  if (
    !differenceWith(currentDocs, rawDocuments, comparator).length &&
    currentDocs.length === rawDocuments.length
  ) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The supplied document list is equal to the current one',
    });
  }

  const rawTicker = stringToTicker(ticker, context);

  if (currentDocIds.length) {
    this.addTransaction(tx.asset.removeDocuments, {}, rawTicker, currentDocIds);
  }

  if (rawDocuments.length) {
    this.addTransaction(tx.asset.addDocuments, {}, rawTicker, rawDocuments);
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
