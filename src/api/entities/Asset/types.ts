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
  ClaimType,
  Compliance,
  CountryCode,
  EventIdentifier,
  MetadataDetails,
  MetadataType,
  Nft,
  StatClaimIssuer,
  StatType,
  TransferRestriction,
  TrustedFor,
  Venue,
} from '~/types';

/**
 * Represents a generic asset on chain. Common functionality (e.g. documents) can be interacted with directly. For type specific functionality (e.g. issue) the type can
 * be narrowed via `instanceof` operator, or by using a more specific getter
 */
export type Asset = FungibleAsset | NftCollection;

export enum KnownAssetType {
  EquityCommon = 'EquityCommon',
  EquityPreferred = 'EquityPreferred',
  Commodity = 'Commodity',
  FixedIncome = 'FixedIncome',
  Reit = 'Reit',
  Fund = 'Fund',
  RevenueShareAgreement = 'RevenueShareAgreement',
  StructuredProduct = 'StructuredProduct',
  Derivative = 'Derivative',
  StableCoin = 'StableCoin',
}

export enum KnownNftType {
  Derivative = 'Derivative',
  FixedIncome = 'FixedIncome',
  Invoice = 'Invoice',
}

export enum SecurityIdentifierType {
  Isin = 'Isin',
  Cusip = 'Cusip',
  Cins = 'Cins',
  Lei = 'Lei',
  Figi = 'Figi',
}

// NOTE: query.asset.identifiers doesn’t support custom identifier types properly for now
// export type TokenIdentifierType = KnownTokenIdentifierType | { custom: string };

/**
 * Alphanumeric standardized security identifier
 */
export interface SecurityIdentifier {
  type: SecurityIdentifierType;
  value: string;
}

/**
 * Document attached to a token
 */
export interface AssetDocument {
  name: string;
  uri: string;
  /**
   * hex representation of the document (must be prefixed by "0x")
   */
  contentHash?: string;
  type?: string;
  filedAt?: Date;
}

/**
 * Asset Document with its on-chain identifier
 */
export interface AssetDocumentWithId extends AssetDocument {
  /**
   * Document ID as stored on-chain
   */
  id: BigNumber;
}

/**
 * Properties that uniquely identify an Asset
 */
export interface UniqueIdentifiers {
  /**
   * id of the Asset
   */
  assetId: string;
}

export interface AssetDetails {
  assetType: string;
  nonFungible: boolean;
  isDivisible: boolean;
  name: string;
  owner: Identity;
  totalSupply: BigNumber;
  fullAgents: Identity[];
  ticker?: string | undefined;
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
  general: (TransferError | string)[];
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
  fundingRound: string | undefined;
  /**
   * ID of the instruction being executed. This value is present only when the value of `event` is `Transfer`
   */
  instructionId?: BigNumber | undefined;
  /**
   * Memo provided against the executed instruction. This value is present only when the value of `event` is `Transfer`
   */
  instructionMemo?: string | undefined;
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
      assetId: string;
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

/**
 * ERC1400 compliant transfer status
 */
export enum TransferStatus {
  Failure = 'Failure', // 80
  Success = 'Success', // 81
  InsufficientBalance = 'InsufficientBalance', // 82
  InsufficientAllowance = 'InsufficientAllowance', // 83
  TransfersHalted = 'TransfersHalted', // 84
  FundsLocked = 'FundsLocked', // 85
  InvalidSenderAddress = 'InvalidSenderAddress', // 86
  InvalidReceiverAddress = 'InvalidReceiverAddress', // 87
  InvalidOperator = 'InvalidOperator', // 88
  InvalidSenderIdentity = 'InvalidSenderIdentity', // 160
  InvalidReceiverIdentity = 'InvalidReceiverIdentity', // 161
  ComplianceFailure = 'ComplianceFailure', // 162
  SmartExtensionFailure = 'SmartExtensionFailure', // 163
  InvalidGranularity = 'InvalidGranularity', // 164
  VolumeLimitReached = 'VolumeLimitReached', // 165
  BlockedTransaction = 'BlockedTransaction', // 166
  FundsLimitReached = 'FundsLimitReached', // 168
  PortfolioFailure = 'PortfolioFailure', // 169
  CustodianError = 'CustodianError', // 170
  ScopeClaimMissing = 'ScopeClaimMissing', // 171
  TransferRestrictionFailure = 'TransferRestrictionFailure', // 172
}

/**
 * Akin to TransferStatus, these are a bit more granular and specific. Every TransferError translates to
 *   a {@link TransferStatus}, but two or more TransferErrors can represent the same TransferStatus, and
 *   not all Transfer Statuses are represented by a TransferError
 */
export enum TransferError {
  /**
   * translates to TransferStatus.InvalidGranularity
   *
   * occurs if attempting to transfer decimal amounts of a non-divisible token
   */
  InvalidGranularity = 'InvalidGranularity',
  /**
   * translates to TransferStatus.InvalidReceiverIdentity
   *
   * occurs if the origin and destination Identities are the same
   */
  SelfTransfer = 'SelfTransfer',
  /**
   * translates to TransferStatus.InvalidReceiverIdentity
   *
   * occurs if the receiver Identity doesn't have a valid CDD claim
   */
  InvalidReceiverCdd = 'InvalidReceiverCdd',
  /**
   * translates to TransferStatus.InvalidSenderIdentity
   *
   * occurs if the receiver Identity doesn't have a valid CDD claim
   */
  InvalidSenderCdd = 'InvalidSenderCdd',
  /**
   * translates to TransferStatus.ScopeClaimMissing
   *
   * occurs if one of the participants doesn't have a valid Investor Uniqueness Claim for
   *   the Asset
   */
  ScopeClaimMissing = 'ScopeClaimMissing',
  /**
   * translates to TransferStatus.InsufficientBalance
   *
   * occurs if the sender Identity does not have enough balance to cover the amount
   */
  InsufficientBalance = 'InsufficientBalance',
  /**
   * translates to TransferStatus.TransfersHalted
   *
   * occurs if the Asset's transfers are frozen
   */
  TransfersFrozen = 'TransfersFrozen',
  /**
   * translates to TransferStatus.PortfolioFailure
   *
   * occurs if the sender Portfolio doesn't exist
   */
  InvalidSenderPortfolio = 'InvalidSenderPortfolio',
  /**
   * translates to TransferStatus.PortfolioFailure
   *
   * occurs if the receiver Portfolio doesn't exist
   */
  InvalidReceiverPortfolio = 'InvalidReceiverPortfolio',
  /**
   * translates to TransferStatus.PortfolioFailure
   *
   * occurs if the sender Portfolio does not have enough balance to cover the amount
   */
  InsufficientPortfolioBalance = 'InsufficientPortfolioBalance',

  /**
   * translates to TransferStatus.ComplianceFailure
   *
   * occurs if some compliance rule would prevent the transfer
   */
  ComplianceFailure = 'ComplianceFailure',

  /**
   * occurs if some statistics transfer condition would prevent the transfer
   */
  TransferNotAllowed = 'TransferNotAllowed',

  /**
   * occurs if asset to be check for transfer, no longer exists
   */
  AssetDoesNotExists = 'AssetDoesNotExists',

  /**
   * occurs if receiver balance will overflow on receiving the transfer amount
   */
  BalanceOverflow = 'BalanceOverflow',
}

export interface AssetWithGroup {
  asset: Asset;
  group: KnownPermissionGroup | CustomPermissionGroup;
}

/**
 * Events triggered by transactions performed by an Agent Identity, related to the Token's configuration
 *   For example: changing compliance requirements, inviting/removing agent Identities, freezing/unfreezing transfers
 *
 * Token transfers (settlements or movements between Portfolios) do not count as Operations
 */
export interface HistoricAgentOperation {
  /**
   * Agent Identity that performed the operations
   */
  identity: Identity;
  /**
   * list of Token Operation Events that were triggered by the Agent Identity
   */
  history: EventIdentifier[];
}

/**
 * An nft collection, along with a subset of its NFTs
 */
export interface HeldNfts {
  collection: NftCollection;
  nfts: Nft[];
}

/**
 * For all claim types except Jurisdiction - tracks holders with and without the claim
 */
export type ClaimValue = {
  /**
   * The number of individual Asset holders that have the claim, or the total balance of tokens held by all holders with the claim
   */
  withClaim: BigNumber;

  /**
   * The number of individual Asset holders that do not have the claim, or the total balance of tokens held by all holders without the claim
   */
  withoutClaim: BigNumber;
};

/**
 * For Jurisdiction claims - tracks holders by country code and those without jurisdiction
 */
export type JurisdictionValue = {
  /**
   * The country code of the jurisdiction
   * @note null if the jurisdiction is not specified (no jurisdiction claim)
   */
  countryCode: CountryCode | null;

  /**
   * The number of individual Asset holders with this jurisdiction (or without any jurisdiction if countryCode is null), or the total balance of tokens held by all such holders
   */
  value: BigNumber;
};

/**
 * Maps claim types to their corresponding statistical value types
 */
export type ClaimStatValue<T extends TrustedFor> = T extends ClaimType.Jurisdiction
  ? JurisdictionValue[]
  : ClaimValue;

/**
 * Asset Stat along with its current value
 */
export interface TransferRestrictionStatValues {
  /**
   * The claim of the stat
   * @note for scoped stats, this is the claim of the stat
   * @note for count stats, this is undefined
   */
  claim?: {
    issuer: Identity;
    claimType: TrustedFor;
    value?: ClaimStatValue<TrustedFor>; // value is undefined for claim types not tracked onchain
  };

  /**
   * The type of the stat
   */
  type: StatType;
  /**
   * The total value of of the Asset Stat
   * @note for scoped stats, this is the total value of all claims
   * @note for count stats, this is the value of the stat
   */
  value: BigNumber;
}

/**
 * The active Transfer Restrictions enabled on an Asset
 */
export interface ActiveTransferRestrictions {
  paused: boolean;
  restrictions: TransferRestriction[];
}

/**
 * An enabled statistic on an Asset
 */
export interface AssetStat {
  type: StatType;
  claimIssuer?: StatClaimIssuer;
}

/**
 * An identifier that specifies the exact Transfer Restriction for an exemption
 */
export interface TransferExemptKey {
  assetId: string;
  opType: StatType;
  claimType: TrustedFor | null;
}

/**
 * Identities that are exempt from Transfer Restrictions.
 *
 * @note if these entities are removed from exemptions but are
 * in violation of any Transfer Restrictions then they will only
 * be able to trade in a manner that brings them more inline. e.g.
 * Exceeding a percentage restriction means tokens can only be sent
 * and not received
 */
export interface TransferRestrictionExemption {
  identity: Identity;
  exemptKey: TransferExemptKey;
}

export enum NftOwnerStatus {
  NotOwned = 'NotOwned',
  Owner = 'Owner',
  OwnerLocked = 'OwnerLocked',
}
