import { StorageKey, u64 } from '@polkadot/types';
import { PolymeshPrimitivesIdentityId, PolymeshPrimitivesTicker } from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';

import { BaseAsset } from '~/api/entities/Asset/Base';
import { NonFungibleSettlements } from '~/api/entities/Asset/Base/Settlements';
import { Nft } from '~/api/entities/Asset/NonFungible/Nft';
import { issueNft } from '~/api/procedures/issueNft';
import { Context, PolymeshError, transferAssetOwnership } from '~/internal';
import { assetQuery } from '~/middleware/queries';
import { Query } from '~/middleware/types';
import {
  AssetDetails,
  CollectionMetadata,
  ErrorCode,
  EventIdentifier,
  IssueNftParams,
  ProcedureMethod,
  SubCallback,
  UniqueIdentifiers,
  UnsubCallback,
} from '~/types';
import { Ensured } from '~/types/utils';
import {
  bigNumberToU64,
  meshMetadataKeyToMetadataKey,
  middlewareEventDetailsToEventIdentifier,
  stringToTicker,
  u64ToBigNumber,
} from '~/utils/conversion';
import { createProcedureMethod, optionize } from '~/utils/internal';

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
 * Class used to manage Nft functionality
 */
export class NftCollection extends BaseAsset {
  public settlements: NonFungibleSettlements;
  /**
   * Issues a new NFT for the collection
   *
   * @note Each NFT requires metadata for each value returned by `collectionMetadata`. The SDK and chain only validate the presence of these fields. Additional validation may be needed to ensure each value is compliant with the expected specification
   */
  public issue: ProcedureMethod<IssueNftParams, Nft>;

  /**
   * Caches value for `getCollectionId`
   *
   * @hidden
   */
  private id?: BigNumber;

  /**
   * @hidden
   */
  constructor(identifiers: UniqueIdentifiers, context: Context) {
    super(identifiers, context);

    const { ticker } = identifiers;
    this.settlements = new NonFungibleSettlements(this, context);

    this.transferOwnership = createProcedureMethod(
      { getProcedureAndArgs: args => [transferAssetOwnership, { ticker, ...args }] },
      context
    );

    this.issue = createProcedureMethod(
      {
        getProcedureAndArgs: args => [issueNft, { ticker, ...args }],
      },
      context
    );
  }

  /**
   * Retrieve the identifier data (block number, date and event index) of the event that was emitted when the token was created
   *
   * @note uses the middlewareV2
   * @note there is a possibility that the data is not ready by the time it is requested. In that case, `null` is returned
   */
  public async createdAt(): Promise<EventIdentifier | null> {
    const { ticker, context } = this;

    const {
      data: {
        assets: {
          nodes: [asset],
        },
      },
    } = await context.queryMiddleware<Ensured<Query, 'assets'>>(
      assetQuery({
        ticker,
      })
    );

    return optionize(middlewareEventDetailsToEventIdentifier)(asset?.createdBlock, asset?.eventIdx);
  }

  /**
   * Retrieve the NftCollection's data
   *
   * @note can be subscribed to
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
      ticker,
      context,
    } = this;

    const rawTicker = stringToTicker(ticker, context);

    const rawNumberNftsPromise = query.nft.numberOfNFTs.entries(rawTicker);

    if (callback) {
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
   * Get the metadata that each NFT in the collection must have
   *
   * @note Each NFT **must** have an entry for each value, it **should** comply with the spec
   * the SDK validates only presence of metadata keys, additional validation may be needed for issuers
   */
  public async collectionMetadata(): Promise<CollectionMetadata[]> {
    const {
      context,
      ticker,
      context: {
        polymeshApi: { query },
      },
    } = this;

    const collectionId = await this.getCollectionId();
    const rawCollectionId = bigNumberToU64(collectionId, context);

    const rawKeys = await query.nft.collectionKeys(rawCollectionId);
    const neededKeys = [...rawKeys].map(value => meshMetadataKeyToMetadataKey(value, ticker));

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
        return { ...details, id, type, ticker };
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
      ticker,
    } = this;

    const rawTicker = stringToTicker(ticker, context);

    const holderEntries = await query.nft.numberOfNFTs.entries(rawTicker);

    const assetBalances = holderEntries.filter(([, balance]) => !balance.isZero());

    return new BigNumber(assetBalances.length);
  }

  /**
   * Determine whether this NftCollection exists on chain
   */
  public override async exists(): Promise<boolean> {
    const { ticker, context } = this;

    const rawTokenId = await context.polymeshApi.query.nft.collectionTicker(
      stringToTicker(ticker, context)
    );

    return !rawTokenId.isZero();
  }

  /**
   * Returns the collection id
   */
  public async getCollectionId(): Promise<BigNumber> {
    const {
      ticker,
      context,
      context: {
        polymeshApi: { query },
      },
    } = this;

    if (this.id) {
      return this.id;
    }

    const rawTicker = stringToTicker(ticker, context);
    const rawId = await query.nft.collectionTicker(rawTicker);

    this.id = u64ToBigNumber(rawId);

    return this.id;
  }
}
