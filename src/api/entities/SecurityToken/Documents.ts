import { setTokenDocuments } from '~/api/procedures';
import { Namespace, TransactionQueue } from '~/base';
import { TokenDocument } from '~/types';
import { SignerType } from '~/types/internal';
import { documentToTokenDocument, signerToSignatory, tickerToDid } from '~/utils';

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
  public set(args: { documents: TokenDocument[] }): Promise<TransactionQueue<SecurityToken>> {
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
        polymeshApi: { query },
      },
      context,
      parent: { ticker },
    } = this;

    const links = await query.identity.links.entries(
      signerToSignatory({ type: SignerType.Identity, value: tickerToDid(ticker) }, context)
    );

    return links
      .filter(([, { link_data: linkData }]) => linkData.isDocumentOwned)
      .map(([, { link_data: linkData }]) => documentToTokenDocument(linkData.asDocumentOwned));
  }
}
