import {
  Context,
  Namespace,
  SecurityToken,
  setTokenDocuments,
  SetTokenDocumentsParams,
} from '~/internal';
import { PaginationOptions, ProcedureMethod, ResultSet, TokenDocument } from '~/types';
import { documentToTokenDocument, stringToTicker } from '~/utils/conversion';
import { createProcedureMethod, requestPaginated } from '~/utils/internal';

/**
 * Handles all Security Token Document related functionality
 */
export class Documents extends Namespace<SecurityToken> {
  /**
   * @hidden
   */
  constructor(parent: SecurityToken, context: Context) {
    super(parent, context);

    const { ticker } = parent;

    this.set = createProcedureMethod(
      { getProcedureAndArgs: args => [setTokenDocuments, { ticker, ...args }] },
      context
    );
  }

  /**
   * Assign a new list of documents to the Security Token by replacing the existing list of documents with the one passed in the parameters
   *
   * This requires two transactions
   */
  public set: ProcedureMethod<SetTokenDocumentsParams, SecurityToken>;

  /**
   * Retrieve all documents linked to the Security Token
   *
   * @note supports pagination
   */
  public async get(paginationOpts?: PaginationOptions): Promise<ResultSet<TokenDocument>> {
    const {
      context: {
        polymeshApi: { query },
      },
      context,
      parent: { ticker },
    } = this;

    const { entries, lastKey: next } = await requestPaginated(query.asset.assetDocuments, {
      arg: stringToTicker(ticker, context),
      paginationOpts,
    });

    const data: TokenDocument[] = entries.map(([, doc]) => documentToTokenDocument(doc));

    return {
      data,
      next,
    };
  }
}
