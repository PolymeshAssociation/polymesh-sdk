import { Link } from 'polymesh-types/types';

import { setTokenDocuments, SetTokenDocumentsParams } from '~/api/procedures';
import { Namespace, TransactionQueue } from '~/base';
import { LinkType, TokenDocument } from '~/types';
import { SignerType } from '~/types/internal';
import {
  booleanToBool,
  documentToTokenDocument,
  linkTypeToMeshLinkType,
  signerToSignatory,
  tickerToDid,
} from '~/utils';

import { SecurityToken } from './';

/**
 * Handles all Security Token Document related functionality
 */
export class Documents extends Namespace<SecurityToken> {
  /**
   * Assign a new list of documents to the Security Token by replacing the existing list of documents with the one passed in the parameters
   *
   * This requires two transactions
   *
   * @param args.documents - new list of documents
   */
  public set(args: SetTokenDocumentsParams): Promise<TransactionQueue<SecurityToken>> {
    const {
      parent: { ticker },
      context,
    } = this;
    return setTokenDocuments.prepare({ ticker, ...args }, context);
  }

  /**
   * Retrieve all documents linked to the Security Token
   */
  public async get(): Promise<TokenDocument[]> {
    const {
      context: {
        polymeshApi: { rpc },
      },
      context,
      parent: { ticker },
    } = this;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const links: Link[] = await (rpc as any).identity.getFilteredLinks(
      signerToSignatory({ type: SignerType.Identity, value: tickerToDid(ticker) }, context),
      booleanToBool(false, context),
      linkTypeToMeshLinkType(LinkType.DocumentOwnership, context)
    );

    return links.map(({ link_data: linkData }) =>
      documentToTokenDocument(linkData.asDocumentOwned)
    );
  }
}
