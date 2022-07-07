import { Asset, Context, Namespace, setAssetDocuments } from '~/internal';
import {
  AssetDocument,
  PaginationOptions,
  ProcedureMethod,
  ResultSet,
  SetAssetDocumentsParams,
} from '~/types';
import { documentToAssetDocument, stringToTicker } from '~/utils/conversion';
import { createProcedureMethod, requestPaginated } from '~/utils/internal';

/**
 * Handles all Asset Document related functionality
 */
export class Documents extends Namespace<Asset> {
  /**
   * @hidden
   */
  constructor(parent: Asset, context: Context) {
    super(parent, context);

    const { ticker } = parent;

    this.set = createProcedureMethod(
      { getProcedureAndArgs: args => [setAssetDocuments, { ticker, ...args }] },
      context
    );
  }

  /**
   * Assign a new list of documents to the Asset by replacing the existing list of documents with the ones passed in the parameters
   *
   * This requires two transactions
   */
  public set: ProcedureMethod<SetAssetDocumentsParams, Asset>;

  /**
   * Retrieve all documents linked to the Asset
   *
   * @note supports pagination
   */
  public async get(paginationOpts?: PaginationOptions): Promise<ResultSet<AssetDocument>> {
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

    const data: AssetDocument[] = entries.map(([, doc]) => documentToAssetDocument(doc));

    return {
      data,
      next,
    };
  }
}
