import BigNumber from 'bignumber.js';

import { Context, Entity, NftCollection, redeemNft } from '~/internal';
import {
  DefaultPortfolio,
  NftMetadata,
  NumberedPortfolio,
  OptionalArgsProcedureMethod,
  RedeemNftParams,
} from '~/types';
import {
  GLOBAL_BASE_IMAGE_URI_NAME,
  GLOBAL_BASE_TOKEN_URI_NAME,
  GLOBAL_IMAGE_URI_NAME,
  GLOBAL_TOKEN_URI_NAME,
} from '~/utils/constants';
import {
  bigNumberToU64,
  bytesToString,
  meshMetadataKeyToMetadataKey,
  meshPortfolioIdToPortfolio,
  stringToTicker,
  u64ToBigNumber,
} from '~/utils/conversion';
import { createProcedureMethod } from '~/utils/internal';

export type NftUniqueIdentifiers = {
  ticker: string;
  id: BigNumber;
};

export interface HumanReadable {
  id: string;
  collection: string;
}

/**
 * Class used to manage Nft functionality. Each NFT belongs to an NftCollection, which specifies the expected metadata values for each NFT
 */
export class Nft extends Entity<NftUniqueIdentifiers, HumanReadable> {
  public id: BigNumber;

  /**
   * The {@link api/entities/Asset/NonFungible/NftCollection | NftCollection} this NFT belongs to
   */
  public collection: NftCollection;

  /**
   * Redeem (or "burns") the NFT, removing it from circulation
   */
  public redeem: OptionalArgsProcedureMethod<RedeemNftParams, void>;

  /**
   * @hidden
   * Check if a value is of type {@link UniqueIdentifiers}
   */
  public static override isUniqueIdentifiers(
    identifier: unknown
  ): identifier is NftUniqueIdentifiers {
    const { ticker, id } = identifier as NftUniqueIdentifiers;

    return typeof ticker === 'string' && id instanceof BigNumber;
  }

  /**
   * @hidden
   */
  constructor(identifiers: NftUniqueIdentifiers, context: Context) {
    super(identifiers, context);

    const { ticker, id } = identifiers;

    this.id = id;

    this.collection = new NftCollection({ ticker }, context);

    this.redeem = createProcedureMethod(
      { getProcedureAndArgs: args => [redeemNft, { ticker, id, ...args }], optionalArgs: true },
      context
    );
  }

  /**
   * Get metadata associated with this token
   */
  public async getMetadata(): Promise<NftMetadata[]> {
    const {
      id,
      context,
      collection,
      context: {
        polymeshApi: { query },
      },
    } = this;

    const collectionId = await collection.getCollectionId();

    const rawCollectionId = bigNumberToU64(collectionId, context);
    const rawId = bigNumberToU64(id, context);

    const entries = await query.nft.metadataValue.entries([rawCollectionId, rawId]);

    return entries.map(([storageKey, rawValue]) => {
      const rawMetadataKey = storageKey.args[1];
      const key = meshMetadataKeyToMetadataKey(rawMetadataKey, collection.ticker);
      const value = bytesToString(rawValue);

      return { key, value };
    });
  }

  /**
   * Determine if the NFT exists on chain
   *
   * @note This method returns true, even if the token has been redeemed/burned
   */
  public async exists(): Promise<boolean> {
    const {
      context,
      context: {
        polymeshApi: { query },
      },
      collection,
      id,
    } = this;
    const collectionId = await collection.getCollectionId();
    const rawCollectionId = bigNumberToU64(collectionId, context);

    // note: "nextId" is actually the last used id
    const rawNextId = await query.nft.nextNFTId(rawCollectionId);
    const nextId = u64ToBigNumber(rawNextId);

    return id.lte(nextId);
  }

  /**
   * Get the conventional image URI for the NFT
   *
   * This function will check for a token level value and a collection level value. Token level values take precedence over base values in case of a conflict.
   *
   * When creating a collection an issuer can either require per token images by specifying global metadata key `imageUri` as a collection key or by
   * setting a collection base image URL by setting a value on the collection corresponding to the global metadata key `baseImageUri`.
   *
   * This method will return `null` if the NFT issuer did not configure the collection according to the convention.
   *
   * Per token URIs provide the most flexibility, but require more chain space to store, increasing the POLYX fee to issue each token.
   *
   * The URI values can include `{tokenId}` that will be replaced with the NFTs ID. If a base URI does not specify this the ID will be appended onto the URL. Examples:
   *  - `https://example.com/nfts/{tokenId}/image.png` becomes `https://example.com/nfts/1/image.png`
   *  - `https://example.com/nfts` becomes `https://example.com/nfts/1` if used a base value, but remain unchanged as a local value
   */
  public async getImageUri(): Promise<string | null> {
    const [localId, collectionId] = await Promise.all([
      this.getGlobalMetadataId(GLOBAL_IMAGE_URI_NAME),
      this.getGlobalMetadataId(GLOBAL_BASE_IMAGE_URI_NAME),
    ]);

    const [localImageUrl, collectionBaseImageUrl] = await Promise.all([
      this.getLocalUri(localId),
      this.getBaseUri(collectionId),
    ]);

    if (localImageUrl) {
      return localImageUrl;
    } else if (collectionBaseImageUrl) {
      return collectionBaseImageUrl;
    }

    return null;
  }

  /**
   * Get the conventional token URI for the NFT
   *
   * This function will check for a token level value and a collection level value. Token level values take precedence over base values in case of a conflict.
   *
   * When creating a collection an issuer can either require per token URL by specifying global metadata key `tokenURI` as a collection key or by
   * setting a collection base URL by setting a value on the collection corresponding to the global metadata key `baseTokenUri` on the collection.
   *
   * This method will return `null` if the NFT issuer did not configure the collection according to the convention.
   *
   * Per token URIs provide the most flexibility, but require more chain space to store, increasing the POLYX fee to issue each token.
   *
   * The URI values can include `{tokenId}` that will be replaced with the NFTs ID. If a base URI does not specify this the ID will be appended onto the URL. Examples:
   *  - `https://example.com/nfts/{tokenId}/info.json` becomes `https://example.com/nfts/1/info.json`
   *  - `https://example.com/nfts` becomes `https://example.com/nfts/1` if used a base value, but remain unchanged as a local value
   */
  public async getTokenUri(): Promise<string | null> {
    const [localId, baseId] = await Promise.all([
      this.getGlobalMetadataId(GLOBAL_TOKEN_URI_NAME),
      this.getGlobalMetadataId(GLOBAL_BASE_TOKEN_URI_NAME),
    ]);

    const [localTokenUri, baseUri] = await Promise.all([
      this.getLocalUri(localId),
      this.getBaseUri(baseId),
    ]);

    if (localTokenUri) {
      return localTokenUri;
    } else if (baseUri) {
      return baseUri;
    }

    return null;
  }

  /**
   * Get owner of the NFT
   */
  public async getOwner(): Promise<DefaultPortfolio | NumberedPortfolio | null> {
    const {
      collection: { ticker },
      id,
      context: {
        polymeshApi: {
          query: {
            nft: { nftOwner },
          },
        },
      },
      context,
    } = this;

    const rawTicker = stringToTicker(ticker, context);
    const rawNftId = bigNumberToU64(id, context);

    const owner = await nftOwner(rawTicker, rawNftId);

    if (owner.isEmpty) {
      return null;
    }

    return meshPortfolioIdToPortfolio(owner.unwrap(), context);
  }

  /**
   * @hidden
   */
  public toHuman(): HumanReadable {
    const {
      collection: { ticker },
      id,
    } = this;

    return {
      collection: ticker,
      id: id.toString(),
    };
  }

  /**
   * given a global metadata ID fetches a local URI value
   *
   * @hidden
   */
  private async getLocalUri(metadataId: BigNumber | null): Promise<string | null> {
    const {
      id,
      context,
      collection,
      context: {
        polymeshApi: { query },
      },
    } = this;

    if (!metadataId) {
      return null;
    }

    const collectionId = await collection.getCollectionId();

    const rawCollectionId = bigNumberToU64(collectionId, context);
    const rawNftId = bigNumberToU64(id, context);

    const rawNftValue = await query.nft.metadataValue([rawCollectionId, rawNftId], {
      Global: bigNumberToU64(metadataId, context),
    });

    const nftValue = bytesToString(rawNftValue);
    if (nftValue === '') {
      return null;
    }

    return this.templateId(nftValue);
  }

  /**
   *
   * given a global metadata ID fetches a base URI value
   *
   * @hidden
   */
  private async getBaseUri(metadataId: BigNumber | null): Promise<string | null> {
    const {
      collection: { ticker },
      context,
      context: {
        polymeshApi: { query },
      },
    } = this;

    if (!metadataId) {
      return null;
    }

    const rawId = bigNumberToU64(metadataId, context);
    const rawTicker = stringToTicker(ticker, context);
    const rawValue = await query.asset.assetMetadataValues(rawTicker, { Global: rawId });

    if (rawValue.isNone) {
      return null;
    }

    const baseUrl = bytesToString(rawValue.unwrap());
    return this.templateBaseUri(baseUrl);
  }

  /**
   * @hidden
   */
  private templateId(input: string): string {
    const { id } = this;

    return input.replace('{tokenId}', id.toString());
  }

  /**
   * @hidden
   */
  private templateBaseUri(input: string): string {
    const { id } = this;

    const templatedPath = this.templateId(input);

    if (input !== templatedPath) {
      return templatedPath;
    } else if (input.endsWith('/')) {
      return `${input}${id.toString()}`;
    } else {
      return `${input}/${id.toString()}`;
    }
  }

  /**
   * helper to lookup global metadata ID by name
   *
   * @hidden
   */
  private async getGlobalMetadataId(keyName: string): Promise<BigNumber | null> {
    const {
      context: {
        polymeshApi: { query },
      },
    } = this;

    const metadataId = await query.asset.assetMetadataGlobalNameToKey(keyName);

    if (metadataId.isSome) {
      return u64ToBigNumber(metadataId.unwrap());
    }
    return null;
  }
}
