import { BaseAsset } from '~/api/entities/Asset/Base/BaseAsset';
import {
  addAssetDocuments,
  Context,
  Namespace,
  removeAssetDocuments,
  setAssetDocuments,
} from '~/internal';
import {
  AddAssetDocumentsParams,
  AssetDocumentWithId,
  PaginationOptions,
  ProcedureMethod,
  RemoveAssetDocumentsParams,
  ResultSet,
  SetAssetDocumentsParams,
} from '~/types';
import { assetToMeshAssetId, documentToAssetDocumentWithId } from '~/utils/conversion';
import { createProcedureMethod, requestPaginated } from '~/utils/internal';

/**
 * Handles all Asset Document related functionality
 */
export class Documents extends Namespace<BaseAsset> {
  /**
   * @hidden
   */
  constructor(parent: BaseAsset, context: Context) {
    super(parent, context);

    this.set = createProcedureMethod(
      { getProcedureAndArgs: args => [setAssetDocuments, { asset: parent, ...args }] },
      context
    );

    this.add = createProcedureMethod(
      { getProcedureAndArgs: args => [addAssetDocuments, { asset: parent, ...args }] },
      context
    );

    this.remove = createProcedureMethod(
      { getProcedureAndArgs: args => [removeAssetDocuments, { asset: parent, ...args }] },
      context
    );
  }

  /**
   * Assign a new list of documents to the Asset by replacing the existing list of documents with the ones passed in the parameters
   *
   * @note this removes all existing documents and adds the new ones
   */
  public set: ProcedureMethod<SetAssetDocumentsParams, void>;

  /**
   * Add documents to the Asset's existing list of documents
   */
  public add: ProcedureMethod<AddAssetDocumentsParams, void>;

  /**
   * Remove specific documents from the Asset by their IDs
   */
  public remove: ProcedureMethod<RemoveAssetDocumentsParams, void>;

  /**
   * Retrieve all documents linked to the Asset
   *
   * @note supports pagination
   * @note returns documents with their on-chain IDs which can be used with the `remove` method
   */
  public async get(paginationOpts?: PaginationOptions): Promise<ResultSet<AssetDocumentWithId>> {
    const {
      context: {
        polymeshApi: { query },
      },
      context,
      parent,
    } = this;

    const rawAssetId = assetToMeshAssetId(parent, context);
    const { entries, lastKey: next } = await requestPaginated(query.asset.assetDocuments, {
      arg: rawAssetId,
      paginationOpts,
    });

    const data: AssetDocumentWithId[] = entries.map(([key, doc]) => {
      const [, id] = key.args;
      return documentToAssetDocumentWithId({ document: doc.unwrap(), id });
    });

    return {
      data,
      next,
    };
  }
}
