import { StorageKey, u64 } from '@polkadot/types';
import { PolymeshPrimitivesIdentityId, PolymeshPrimitivesTicker } from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';

import { BaseAsset } from '~/api/entities/Asset/Base';
import { NonFungibleSettlements } from '~/api/entities/Asset/Base/Settlements';
import { AssetHolders } from '~/api/entities/Asset/NonFungible/AssetHolders';
import { Context, issueNft, Nft, nftControllerTransfer, PolymeshError } from '~/internal';
import { assetQuery, assetTransactionQuery } from '~/middleware/queries/assets';
import { Query } from '~/middleware/types';
import {
  AssetDetails,
  CollectionKey,
  ErrorCode,
  EventIdentifier,
  HistoricNftTransaction,
  IssueNftParams,
  MetadataType,
  NftControllerTransferParams,
  ProcedureMethod,
  ResultSet,
  SubCallback,
  UniqueIdentifiers,
  UnsubCallback,
} from '~/types';
import { Ensured } from '~/types/utils';
import {
  assetToMeshAssetId,
  bigNumberToU64,
  meshMetadataKeyToMetadataKey,
  middlewareEventDetailsToEventIdentifier,
  middlewarePortfolioToPortfolio,
  portfolioIdStringToPortfolio,
  u64ToBigNumber,
} from '~/utils/conversion';
import {
  calculateNextKey,
  createProcedureMethod,
  getAssetIdAndTicker,
  getAssetIdForMiddleware,
  getAssetIdFromMiddleware,
  optionize,
} from '~/utils/internal';

const sumNftIssuance = (
  numberOfNfts: [StorageKey<[PolymeshPrimitivesTicker, PolymeshPrimitivesIdentityId]>, u64][]
): BigNumber => {
  let numberIssued = new BigNumber(0);
  numberOfNfts.forEach(([, holderEntry]) => {
    const holderAmount = u64ToBigNumber(holderEntry);
    numberIssued = numberIssued.plus(holderAmount);
  });

  return numberIssued;
};

/**
 * Class used to manage NFT functionality
 */
export class NftCollection extends BaseAsset {
  public assetHolders: AssetHolders;
  public settlements: NonFungibleSettlements;
  /**
   * Issues a new NFT for the collection
   *
   * @note Each NFT requires metadata for each value returned by `collectionKeys`. The SDK and chain only validate the presence of these fields. Additional validation may be needed to ensure each value complies with the specification.
   */
  public issue: ProcedureMethod<IssueNftParams, Nft>;

  /**
   * Force a transfer from the origin portfolio to one of the caller's portfolios
   */
  public controllerTransfer: ProcedureMethod<NftControllerTransferParams, void>;

  /**
   * Local cache for `getCollectionId`
   *
   * @hidden
   */
  private _id?: BigNumber;

  /**
   * @hidden
   */
  constructor(identifiers: UniqueIdentifiers, context: Context) {
    super(identifiers, context);

    this.assetHolders = new AssetHolders(this, context);
    this.settlements = new NonFungibleSettlements(this, context);

    this.issue = createProcedureMethod(
      {
        getProcedureAndArgs: args => [issueNft, { collection: this, ...args }],
      },
      context
    );

    this.controllerTransfer = createProcedureMethod(
      {
        getProcedureAndArgs: args => [nftControllerTransfer, { collection: this, ...args }],
      },
      context
    );
  }

  /**
   * Retrieve the NftCollection's data
   *
   * @note can be subscribed to, if connected to node using a web socket
   */
  public override details(): Promise<AssetDetails>;
  public override details(callback: SubCallback<AssetDetails>): Promise<UnsubCallback>;

  // eslint-disable-next-line require-jsdoc
  public override async details(
    callback?: SubCallback<AssetDetails>
  ): Promise<AssetDetails | UnsubCallback> {
    const {
      context: {
        polymeshApi: { query },
      },
      context,
    } = this;

    const rawAssetId = assetToMeshAssetId(this, context);

    const rawNumberNftsPromise = query.nft.numberOfNFTs.entries(rawAssetId);

    if (callback) {
      context.assertSupportsSubscription();

      const rawNumberNfts = await rawNumberNftsPromise;
      const numberIssued = sumNftIssuance(rawNumberNfts);

      // currently `asset.tokens` does not track Nft `totalSupply', we wrap the callback to provide it
      const wrappedCallback = async (commonDetails: AssetDetails): Promise<void> => {
        const nftDetails = { ...commonDetails, totalSupply: numberIssued };

        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        callback(nftDetails);
      };

      return super.details(wrappedCallback);
    }

    const [rawNumberNfts, commonDetails] = await Promise.all([
      rawNumberNftsPromise,
      super.details(),
    ]);
    const numberIssued = sumNftIssuance(rawNumberNfts);

    return { ...commonDetails, totalSupply: numberIssued };
  }

  /**
   * Retrieve the metadata that defines the NFT collection. Every `issue` call for this collection must provide a value for each element returned
   *
   * @note Each NFT **must** have an entry for each value, it **should** comply with the spec.
   * In other words, the SDK only validates the presence of metadata keys, additional validation should be used when issuing
   */
  public async collectionKeys(): Promise<CollectionKey[]> {
    const {
      context,
      id: assetId,
      context: {
        polymeshApi: { query },
      },
    } = this;

    const collectionId = await this.getCollectionId();
    const rawCollectionId = bigNumberToU64(collectionId, context);

    const rawKeys = await query.nft.collectionKeys(rawCollectionId);
    const neededKeys = await Promise.all(
      [...rawKeys].map(value => meshMetadataKeyToMetadataKey(value, this, context))
    );

    const allMetadata = await this.metadata.get();
    return Promise.all(
      neededKeys.map(async ({ type, id }) => {
        const neededMetadata = allMetadata.find(entry => entry.type === type && entry.id.eq(id));
        if (!neededMetadata) {
          throw new PolymeshError({
            code: ErrorCode.DataUnavailable,
            message: 'Failed to find metadata details',
            data: { type, id },
          });
        }

        const details = await neededMetadata.details();

        if (type === MetadataType.Local) {
          return { ...details, id, type, ...(await getAssetIdAndTicker(assetId, context)) };
        } else {
          return { ...details, id, type };
        }
      })
    );
  }

  /**
   * Retrieve the amount of unique investors that hold this Nft
   */
  public async investorCount(): Promise<BigNumber> {
    const {
      context: {
        polymeshApi: { query },
      },
      context,
    } = this;

    const rawAssetId = assetToMeshAssetId(this, context);

    const holderEntries = await query.nft.numberOfNFTs.entries(rawAssetId);

    const assetBalances = holderEntries.filter(([, balance]) => !balance.isZero());

    return new BigNumber(assetBalances.length);
  }

  /**
   * Get an NFT belonging to this collection
   *
   * @throws if the given NFT does not exist
   */
  public async getNft(args: { id: BigNumber }): Promise<Nft> {
    const { context, id: assetId } = this;
    const { id } = args;

    const nft = new Nft({ assetId, id }, context);

    const exists = await nft.exists();
    if (!exists) {
      throw new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: 'The NFT does not exist',
        data: { id },
      });
    }

    return nft;
  }

  /**
   * Retrieve the identifier data (block number, date and event index) of the event that was emitted when the token was created
   *
   * @note uses the middlewareV2
   * @note there is a possibility that the data is not ready by the time it is requested. In that case, `null` is returned
   */
  public async createdAt(): Promise<EventIdentifier | null> {
    const { id, context } = this;

    const middlewareAssetId = await getAssetIdForMiddleware(id, context);

    const {
      data: {
        assets: {
          nodes: [asset],
        },
      },
    } = await context.queryMiddleware<Ensured<Query, 'assets'>>(
      assetQuery({
        id: middlewareAssetId,
      })
    );

    return optionize(middlewareEventDetailsToEventIdentifier)(asset?.createdBlock, asset?.eventIdx);
  }

  /**
   * Determine whether this NftCollection exists on chain
   */
  public override async exists(): Promise<boolean> {
    const {
      context,
      context: {
        polymeshApi: {
          query: { nft },
        },
        isV6,
      },
    } = this;

    let collectionStorage = nft.collectionAsset;
    if (isV6) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      collectionStorage = (nft as any).collectionTicker;
    }

    const rawAssetId = assetToMeshAssetId(this, context);
    const rawTokenId = await collectionStorage(rawAssetId);

    return !rawTokenId.isZero();
  }

  /**
   * Returns the collection's on chain numeric ID. Used primarily to access NFT specific storage values
   */
  public async getCollectionId(): Promise<BigNumber> {
    const {
      context,
      context: {
        polymeshApi: {
          query: { nft },
        },
        isV6,
      },
    } = this;

    if (this._id) {
      return this._id;
    }

    let collectionStorage = nft.collectionAsset;
    if (isV6) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      collectionStorage = (nft as any).collectionTicker;
    }

    const rawAssetId = assetToMeshAssetId(this, context);
    const rawId = await collectionStorage(rawAssetId);

    this._id = u64ToBigNumber(rawId);

    return this._id;
  }

  /**
   * Retrieve this Collection's transaction history
   *
   * @note uses the middlewareV2
   */
  public async getTransactionHistory(opts: {
    size?: BigNumber;
    start?: BigNumber;
  }): Promise<ResultSet<HistoricNftTransaction>> {
    const { context, id } = this;
    const { size, start } = opts;

    const {
      data: {
        assetTransactions: { nodes, totalCount },
      },
    } = await context.queryMiddleware<Ensured<Query, 'assetTransactions'>>(
      assetTransactionQuery(
        {
          assetId: id,
        },
        size,
        start
      )
    );

    const data: HistoricNftTransaction[] = [];

    for (const {
      asset,
      nftIds,
      fromPortfolioId,
      toPortfolioId,
      createdBlock,
      eventId,
      eventIdx,
      extrinsicIdx,
      fundingRound,
      instructionId,
      instructionMemo,
    } of nodes) {
      const fromPortfolio = optionize(portfolioIdStringToPortfolio)(fromPortfolioId);
      const toPortfolio = optionize(portfolioIdStringToPortfolio)(toPortfolioId);

      const assetId = getAssetIdFromMiddleware(asset, context);
      const collection = new NftCollection({ assetId }, context);
      data.push({
        asset: collection,
        nfts: nftIds.map(
          (nftId: string) => new Nft({ assetId, id: new BigNumber(nftId) }, context)
        ),
        event: eventId,
        to: optionize(middlewarePortfolioToPortfolio)(toPortfolio, context),
        from: optionize(middlewarePortfolioToPortfolio)(fromPortfolio, context),
        fundingRound,
        instructionMemo,
        instructionId: instructionId ? new BigNumber(instructionId) : undefined,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        extrinsicIndex: new BigNumber(extrinsicIdx!),
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        ...middlewareEventDetailsToEventIdentifier(createdBlock!, eventIdx),
      });
    }

    const count = new BigNumber(totalCount);
    const next = calculateNextKey(count, data.length, start);

    return {
      data,
      count,
      next,
    };
  }
}
