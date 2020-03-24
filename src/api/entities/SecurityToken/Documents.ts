import { setTokenDocuments } from '~/api/procedures';
import { Namespace, TransactionQueue } from '~/base';
import { TokenDocument } from '~/types';

import { SecurityToken } from './';

/**
 * Handles all Security Token Document related functionality
 */
export class Documents extends Namespace<SecurityToken> {
  /**
   * Assign a new list of documents to the Security Token. This replaces the existing list of documents with the one passed in the parameters
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
}
