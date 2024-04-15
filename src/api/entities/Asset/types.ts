import BigNumber from 'bignumber.js';

import {
  CustomPermissionGroup,
  DefaultPortfolio,
  FungibleAsset,
  Identity,
  KnownPermissionGroup,
  NftCollection,
  NumberedPortfolio,
} from '~/internal';
import { EventIdEnum } from '~/middleware/types';
import {
  Compliance,
  EventIdentifier,
  MetadataDetails,
  MetadataType,
  Nft,
  TransferError,
  TransferRestriction,
  Venue,
} from '~/types';

/**
 * Represents a generic asset on chain. Common functionality (e.g. documents) can be interacted with directly. For type specific functionality (e.g. issue) the type can
 * be narrowed via `instanceof` operator, or by using a more specific getter
 */
export type Asset = FungibleAsset | NftCollection;

/**
 * Properties that uniquely identify an Asset
 */
export interface UniqueIdentifiers {
  /**
   * ticker of the Asset
   */
  ticker: string;
}

export interface AssetDetails {
  assetType: string;
  nonFungible: boolean;
  isDivisible: boolean;
  name: string;
  owner: Identity;
  totalSupply: BigNumber;
  fullAgents: Identity[];
}

/**
 * Represents the balance of an Asset Holder
 */
export interface IdentityBalance {
  identity: Identity;
  balance: BigNumber;
}

/**
 * Represents the holdings of an NFT holder
 */
export interface IdentityHeldNfts {
  identity: Identity;
  nfts: Nft[];
}

export interface TransferRestrictionResult {
  restriction: TransferRestriction;
  result: boolean;
}

/**
 * Object containing every reason why a specific Asset transfer would fail
 */
export interface TransferBreakdown {
  /**
   * list of general transfer errors
   */
  general: TransferError[];
  /**
   * how the transfer adheres to the asset's compliance rules
   */
  compliance: Compliance;
  /**
   * list of transfer restrictions and whether the transfer satisfies each one
   */
  restrictions: TransferRestrictionResult[];
  /**
   * true if the transfer is possible
   */
  result: boolean;
}

export interface AgentWithGroup {
  agent: Identity;
  group: KnownPermissionGroup | CustomPermissionGroup;
}

export interface BaseHistoricAssetTransaction extends EventIdentifier {
  /**
   * Origin portfolio involved in the transaction. This value will be null when the `event` value is `Issued`
   */
  from: DefaultPortfolio | NumberedPortfolio | null;
  /**
   * Destination portfolio involved in the transaction . This value will be null when the `event` value is `Redeemed`
   */
  to: DefaultPortfolio | NumberedPortfolio | null;

  /**
   * Event identifying the type of transaction
   */
  event: EventIdEnum;

  /**
   * Index value of the extrinsic which led to the Asset transaction within the `blockNumber` block
   */
  extrinsicIndex: BigNumber;

  /**
   * Name of the funding round (if provided while issuing the Asset). This value is present only when the value of `event` is `Issued`
   */
  fundingRound?: string;
  /**
   * ID of the instruction being executed. This value is present only when the value of `event` is `Transfer`
   */
  instructionId?: BigNumber;
  /**
   * Memo provided against the executed instruction. This value is present only when the value of `event` is `Transfer`
   */
  instructionMemo?: string;
}

export interface HistoricAssetTransaction extends BaseHistoricAssetTransaction {
  asset: FungibleAsset;

  /**
   * Amount of the fungible tokens involved in the transaction
   */
  amount: BigNumber;
}

export interface HistoricNftTransaction extends BaseHistoricAssetTransaction {
  asset: NftCollection;

  /**
   * The specific NFTs involved in the transaction
   */
  nfts: Nft[];
}

/**
 * The data needed to uniquely identify a metadata specification
 */
export type MetadataKeyId =
  | {
      type: MetadataType.Global;
      id: BigNumber;
    }
  | {
      type: MetadataType.Local;
      id: BigNumber;
      ticker: string;
    };

export interface NftMetadata {
  /**
   * The metadata key this value is intended for
   */
  key: MetadataKeyId;
  /**
   * The value the particular NFT has for the metadata
   */
  value: string;
}

export interface VenueFilteringDetails {
  /**
   * Whether or not Venue filtering is enabled. If enabled then only allowed the Venues are able to create instructions to trade the asset
   */
  isEnabled: boolean;
  /**
   * If `isEnabled` is true, then only these venues are allowed to create instructions involving the asset
   */
  allowedVenues: Venue[];
}

/**
 * A metadata entry for which each NFT in the collection must have an entry for
 *
 * @note each NFT **must** have an entry for each metadata value, the entry **should** comply with the relevant spec
 */
export type CollectionKey = MetadataKeyId & MetadataDetails;

export * from './Fungible/Checkpoints/types';
export * from './Fungible/CorporateActions/types';
