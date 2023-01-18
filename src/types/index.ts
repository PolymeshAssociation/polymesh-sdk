/* istanbul ignore file */

import { TypeDef } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';

import {
  CorporateActionTargets,
  DividendDistributionDetails,
  OfferingDetails,
  ScheduleDetails,
  SubsidyData,
  TaxWithholding,
} from '~/api/entities/types';
import { CreateTransactionBatchParams } from '~/api/procedures/types';
import { CountryCode, ModuleName, TxTag, TxTags } from '~/generated/types';
import {
  Account,
  Asset,
  Checkpoint,
  CheckpointSchedule,
  CustomPermissionGroup,
  DefaultPortfolio,
  DefaultTrustedClaimIssuer,
  DividendDistribution,
  Identity,
  Instruction,
  KnownPermissionGroup,
  NumberedPortfolio,
  Offering,
  PolymeshTransaction,
  PolymeshTransactionBatch,
} from '~/internal';
import { Modify } from '~/types/utils';

export * from '~/generated/types';

export enum TransactionStatus {
  /**
   * the transaction is prepped to run
   */
  Idle = 'Idle',
  /**
   * the transaction is waiting for the user's signature
   */
  Unapproved = 'Unapproved',
  /**
   * the transaction is being executed
   */
  Running = 'Running',
  /**
   * the transaction was rejected by the signer
   */
  Rejected = 'Rejected',
  /**
   * the transaction was run successfully
   */
  Succeeded = 'Succeeded',
  /**
   * the transaction's execution failed due to a an on-chain validation error, insufficient balance for fees, or other such reasons
   */
  Failed = 'Failed',
  /**
   * the transaction couldn't be broadcast. It was either dropped, usurped or invalidated
   * see https://github.com/paritytech/substrate/blob/master/primitives/transaction-pool/src/pool.rs#L58-L110
   */
  Aborted = 'Aborted',
}

// Roles

export enum RoleType {
  TickerOwner = 'TickerOwner',
  CddProvider = 'CddProvider',
  VenueOwner = 'VenueOwner',
  PortfolioCustodian = 'PortfolioCustodian',
  CorporateActionsAgent = 'CorporateActionsAgent',
  // eslint-disable-next-line @typescript-eslint/no-shadow
  Identity = 'Identity',
}

export interface TickerOwnerRole {
  type: RoleType.TickerOwner;
  ticker: string;
}

export interface CddProviderRole {
  type: RoleType.CddProvider;
}

export interface VenueOwnerRole {
  type: RoleType.VenueOwner;
  venueId: BigNumber;
}

export interface PortfolioId {
  did: string;
  number?: BigNumber;
}

export interface PortfolioCustodianRole {
  type: RoleType.PortfolioCustodian;
  portfolioId: PortfolioId;
}

export interface IdentityRole {
  type: RoleType.Identity;
  did: string;
}

export type Role =
  | TickerOwnerRole
  | CddProviderRole
  | VenueOwnerRole
  | PortfolioCustodianRole
  | IdentityRole;

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
 * Type of Authorization Request
 */
export enum AuthorizationType {
  AttestPrimaryKeyRotation = 'AttestPrimaryKeyRotation',
  RotatePrimaryKey = 'RotatePrimaryKey',
  TransferTicker = 'TransferTicker',
  AddMultiSigSigner = 'AddMultiSigSigner',
  TransferAssetOwnership = 'TransferAssetOwnership',
  JoinIdentity = 'JoinIdentity',
  PortfolioCustody = 'PortfolioCustody',
  BecomeAgent = 'BecomeAgent',
  AddRelayerPayingKey = 'AddRelayerPayingKey',
  RotatePrimaryKeyToSecondary = 'RotatePrimaryKeyToSecondary',
}

export enum ConditionTarget {
  Sender = 'Sender',
  Receiver = 'Receiver',
  Both = 'Both',
}

export enum ScopeType {
  // eslint-disable-next-line @typescript-eslint/no-shadow
  Identity = 'Identity',
  Ticker = 'Ticker',
  Custom = 'Custom',
}

export interface Scope {
  type: ScopeType;
  value: string;
}

export enum ClaimType {
  Accredited = 'Accredited',
  Affiliate = 'Affiliate',
  BuyLockup = 'BuyLockup',
  SellLockup = 'SellLockup',
  CustomerDueDiligence = 'CustomerDueDiligence',
  KnowYourCustomer = 'KnowYourCustomer',
  Jurisdiction = 'Jurisdiction',
  Exempted = 'Exempted',
  Blocked = 'Blocked',
  InvestorUniqueness = 'InvestorUniqueness',
  NoType = 'NoType',
  NoData = 'NoData',
  InvestorUniquenessV2 = 'InvestorUniquenessV2',
}

export interface AccreditedClaim {
  type: ClaimType.Accredited;
  scope: Scope;
}

export interface AffiliateClaim {
  type: ClaimType.Affiliate;
  scope: Scope;
}

export interface BuyLockupClaim {
  type: ClaimType.BuyLockup;
  scope: Scope;
}

export interface SellLockupClaim {
  type: ClaimType.SellLockup;
  scope: Scope;
}

export interface CddClaim {
  type: ClaimType.CustomerDueDiligence;
  id: string;
}

export interface KycClaim {
  type: ClaimType.KnowYourCustomer;
  scope: Scope;
}

export interface JurisdictionClaim {
  type: ClaimType.Jurisdiction;
  code: CountryCode;
  scope: Scope;
}

export interface ExemptedClaim {
  type: ClaimType.Exempted;
  scope: Scope;
}

export interface BlockedClaim {
  type: ClaimType.Blocked;
  scope: Scope;
}

export interface InvestorUniquenessClaim {
  type: ClaimType.InvestorUniqueness;
  scope: Scope;
  cddId: string;
  scopeId: string;
}

export interface NoTypeClaim {
  type: ClaimType.NoType;
}

export interface NoDataClaim {
  type: ClaimType.NoData;
}

export interface InvestorUniquenessV2Claim {
  type: ClaimType.InvestorUniquenessV2;
  cddId: string;
}

export type ScopedClaim =
  | JurisdictionClaim
  | InvestorUniquenessClaim
  | AccreditedClaim
  | AffiliateClaim
  | BuyLockupClaim
  | SellLockupClaim
  | KycClaim
  | ExemptedClaim
  | BlockedClaim;

export type UnscopedClaim = NoDataClaim | NoTypeClaim | CddClaim | InvestorUniquenessV2Claim;

export type Claim = ScopedClaim | UnscopedClaim;

export interface ClaimData<ClaimType = Claim> {
  target: Identity;
  issuer: Identity;
  issuedAt: Date;
  expiry: Date | null;
  claim: ClaimType;
}

export type StatClaimType = ClaimType.Accredited | ClaimType.Affiliate | ClaimType.Jurisdiction;

export interface StatJurisdictionClaimInput {
  type: ClaimType.Jurisdiction;
  countryCode?: CountryCode;
}

export interface StatAccreditedClaimInput {
  type: ClaimType.Accredited;
  accredited: boolean;
}

export interface StatAffiliateClaimInput {
  type: ClaimType.Affiliate;
  affiliate: boolean;
}

export type InputStatClaim =
  | StatJurisdictionClaimInput
  | StatAccreditedClaimInput
  | StatAffiliateClaimInput;

export type InputStatType =
  | {
      type: StatType.Count | StatType.Balance;
    }
  | {
      type: StatType.ScopedCount | StatType.ScopedBalance;
      claimIssuer: StatClaimIssuer;
    };

/**
 * Represents the StatType from the `statistics` module.
 *
 * @note the chain doesn't use "Scoped" types, but they are needed here to discriminate the input instead of having an optional input
 */
export enum StatType {
  Count = 'Count',
  Balance = 'Balance',
  /**
   * ScopedCount is an SDK only type, on chain it is `Count` with a claimType option present
   */
  ScopedCount = 'ScopedCount',
  /**
   * ScopedPercentage is an SDK only type, on chain it is `Balance` with a claimType option present
   */
  ScopedBalance = 'ScopedBalance',
}
export interface IdentityWithClaims {
  identity: Identity;
  claims: ClaimData[];
}

export interface ExtrinsicData {
  blockHash: string;
  blockNumber: BigNumber;
  extrinsicIdx: BigNumber;
  /**
   * public key of the signer. Unsigned transactions have no signer, in which case this value is null (example: an enacted governance proposal)
   */
  address: string | null;
  /**
   * nonce of the transaction. Null for unsigned transactions where address is null
   */
  nonce: BigNumber | null;
  txTag: TxTag;
  params: Record<string, unknown>[];
  success: boolean;
  specVersionId: BigNumber;
  extrinsicHash: string;
}

export interface ExtrinsicDataWithFees extends ExtrinsicData {
  fee: Fees;
}

export interface ProtocolFees {
  tag: TxTag;
  fees: BigNumber;
}

export interface ClaimScope {
  scope: Scope | null;
  ticker?: string;
}

/**
 * @param IsDefault - whether the Identity is a default trusted claim issuer for an asset or just
 *   for a specific compliance condition. Defaults to false
 */
export interface TrustedClaimIssuer<IsDefault extends boolean = false> {
  identity: IsDefault extends true ? DefaultTrustedClaimIssuer : Identity;
  /**
   * a null value means that the issuer is trusted for all claim types
   */
  trustedFor: ClaimType[] | null;
}

export type InputTrustedClaimIssuer = Modify<
  TrustedClaimIssuer,
  {
    identity: string | Identity;
  }
>;

export enum ConditionType {
  IsPresent = 'IsPresent',
  IsAbsent = 'IsAbsent',
  IsAnyOf = 'IsAnyOf',
  IsNoneOf = 'IsNoneOf',
  IsExternalAgent = 'IsExternalAgent',
  IsIdentity = 'IsIdentity',
}

export interface ConditionBase {
  target: ConditionTarget;
  /**
   * if undefined, the default trusted claim issuers for the Asset are used
   */
  trustedClaimIssuers?: TrustedClaimIssuer[];
}

export type InputConditionBase = Modify<
  ConditionBase,
  {
    /**
     * if undefined, the default trusted claim issuers for the Asset are used
     */
    trustedClaimIssuers?: InputTrustedClaimIssuer[];
  }
>;

export interface SingleClaimCondition {
  type: ConditionType.IsPresent | ConditionType.IsAbsent;
  claim: Claim;
}

export interface MultiClaimCondition {
  type: ConditionType.IsAnyOf | ConditionType.IsNoneOf;
  claims: Claim[];
}

export interface IdentityCondition {
  type: ConditionType.IsIdentity;
  identity: Identity;
}

export interface ExternalAgentCondition {
  type: ConditionType.IsExternalAgent;
}

export type Condition = (
  | SingleClaimCondition
  | MultiClaimCondition
  | IdentityCondition
  | ExternalAgentCondition
) &
  ConditionBase;

export type InputCondition = (
  | SingleClaimCondition
  | MultiClaimCondition
  | Modify<
      IdentityCondition,
      {
        identity: string | Identity;
      }
    >
  | ExternalAgentCondition
) &
  InputConditionBase;

export interface Requirement {
  id: BigNumber;
  conditions: Condition[];
}

export interface ComplianceRequirements {
  requirements: Requirement[];
  /**
   * used for conditions where no trusted claim issuers were specified
   */
  defaultTrustedClaimIssuers: TrustedClaimIssuer[];
}

export type InputRequirement = Modify<Requirement, { conditions: InputCondition[] }>;

export interface ConditionCompliance {
  condition: Condition;
  complies: boolean;
}

export interface RequirementCompliance {
  id: BigNumber;
  conditions: ConditionCompliance[];
  complies: boolean;
}

export interface Compliance {
  requirements: RequirementCompliance[];
  complies: boolean;
}

/**
 * Specifies possible types of errors in the SDK
 */
export enum ErrorCode {
  /**
   * transaction removed from the tx pool
   */
  TransactionAborted = 'TransactionAborted',
  /**
   * user rejected the transaction in their wallet
   */
  TransactionRejectedByUser = 'TransactionRejectedByUser',
  /**
   * transaction failed due to an on-chain error. This is a business logic error,
   *   and it should be caught by the SDK before being sent to the chain.
   *   Please report it to the Polymesh team
   */
  TransactionReverted = 'TransactionReverted',
  /**
   * error that should cause termination of the calling application
   */
  FatalError = 'FatalError',
  /**
   * user input error. This means that one or more inputs passed by the user
   *   do not conform to expected value ranges or types
   */
  ValidationError = 'ValidationError',
  /**
   * user does not have the required roles/permissions to perform an operation
   */
  NotAuthorized = 'NotAuthorized',
  /**
   * errors encountered when interacting with the historic data middleware (GQL server)
   */
  MiddlewareError = 'MiddlewareError',
  /**
   * the data that is being fetched does not exist on-chain, or relies on non-existent data. There are
   *   some cases where the data did exist at some point, but has been deleted to save storage space
   */
  DataUnavailable = 'DataUnavailable',
  /**
   * the data that is being written to the chain is the same data that is already in place. This would result
   *   in a redundant/useless transaction being executed
   */
  NoDataChange = 'NoDataChange',
  /**
   * the data that is being written to the chain would result in some limit being exceeded. For example, adding a transfer
   *   restriction when the maximum possible amount has already been added
   */
  LimitExceeded = 'LimitExceeded',
  /**
   * one or more base prerequisites for a transaction to be successful haven't been met. For example, reserving a ticker requires
   *   said ticker to not be already reserved. Attempting to reserve a ticker without that prerequisite being met would result in this
   *   type of error. Attempting to create an entity that already exists would also fall into this category,
   *   if the entity in question is supposed to be unique
   */
  UnmetPrerequisite = 'UnmetPrerequisite',
  /**
   * this type of error is thrown when attempting to delete/modify an entity which has other entities depending on it. For example, deleting
   *   a Portfolio that still holds assets, or removing a Checkpoint Schedule that is being referenced by a Corporate Action
   */
  EntityInUse = 'EntityInUse',
  /**
   * one or more parties involved in the transaction do not have enough balance to perform it
   */
  InsufficientBalance = 'InsufficientBalance',
  /**
   * errors that are the result of something unforeseen.
   *   These should generally be reported to the Polymesh team
   */
  UnexpectedError = 'UnexpectedError',
  /**
   * general purpose errors that don't fit well into the other categories
   */
  General = 'General',
}

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
}

export interface ClaimTarget {
  target: string | Identity;
  claim: Claim;
  expiry?: Date;
}

export type SubCallback<T> = (result: T) => void | Promise<void>;

export type UnsubCallback = () => void;

export interface MiddlewareConfig {
  link: string;
  key: string;
}

export interface EventIdentifier {
  blockNumber: BigNumber;
  blockHash: string;
  blockDate: Date;
  eventIndex: BigNumber;
}

export interface Balance {
  /**
   * balance available for transferring and paying fees
   */
  free: BigNumber;
  /**
   * unavailable balance, either bonded for staking or locked for some other purpose
   */
  locked: BigNumber;
  /**
   * free + locked
   */
  total: BigNumber;
}

export type AccountBalance = Balance;

export interface PaginationOptions {
  size: BigNumber;
  start?: string;
}

export type NextKey = string | BigNumber | null;

export interface ResultSet<T> {
  data: T[];
  next: NextKey;
  count?: BigNumber;
}

export interface NetworkProperties {
  name: string;
  version: BigNumber;
}

export interface Fees {
  /**
   * bonus fee charged by certain transactions
   */
  protocol: BigNumber;
  /**
   * regular network fee
   */
  gas: BigNumber;
  /**
   * sum of the protocol and gas fees
   */
  total: BigNumber;
}

/**
 * Type of relationship between a paying account and a beneficiary
 */
export enum PayingAccountType {
  /**
   * the paying Account is currently subsidizing the caller
   */
  Subsidy = 'Subsidy',
  /**
   * the paying Account is paying for a specific transaction because of
   *   chain-specific constraints (e.g. the caller is accepting an invitation to an Identity
   *   and cannot have any funds to pay for it by definition)
   */
  Other = 'Other',
  /**
   * the caller Account is responsible of paying the fees
   */
  Caller = 'Caller',
}

/**
 * Data representing the Account responsible for paying fees for a transaction
 */
export type PayingAccount =
  | {
      type: PayingAccountType.Subsidy;
      /**
       * Account that pays for the transaction
       */
      account: Account;
      /**
       * total amount that can be paid for
       */
      allowance: BigNumber;
    }
  | {
      type: PayingAccountType.Caller | PayingAccountType.Other;
      account: Account;
    };

/**
 * Breakdown of the fees that will be paid by a specific Account for a transaction, along
 *   with data associated to the Paying account
 */
export interface PayingAccountFees {
  /**
   * fees that will be paid by the Account
   */
  fees: Fees;
  /**
   * data related to the Account responsible of paying for the transaction
   */
  payingAccountData: PayingAccount & {
    /**
     * free balance of the Account
     */
    balance: BigNumber;
  };
}

export enum SignerType {
  /* eslint-disable @typescript-eslint/no-shadow */
  Identity = 'Identity',
  Account = 'Account',
  /* eslint-enable @typescript-eslint/no-shadow */
}

export interface SignerValue {
  /**
   * whether the signer is an Account or Identity
   */
  type: SignerType;
  /**
   * address or DID (depending on whether the signer is an Account or Identity)
   */
  value: string;
}

/**
 * Transaction Groups (for permissions purposes)
 */
export enum TxGroup {
  /**
   * - TxTags.identity.AddInvestorUniquenessClaim
   * - TxTags.portfolio.MovePortfolioFunds
   * - TxTags.settlement.AddInstruction
   * - TxTags.settlement.AddInstructionWithMemo
   * - TxTags.settlement.AddAndAffirmInstruction
   * - TxTags.settlement.AddAndAffirmInstructionWithMemo
   * - TxTags.settlement.AffirmInstruction
   * - TxTags.settlement.RejectInstruction
   * - TxTags.settlement.CreateVenue
   */
  PortfolioManagement = 'PortfolioManagement',
  /**
   * - TxTags.asset.MakeDivisible
   * - TxTags.asset.RenameAsset
   * - TxTags.asset.SetFundingRound
   * - TxTags.asset.AddDocuments
   * - TxTags.asset.RemoveDocuments
   */
  AssetManagement = 'AssetManagement',
  /**
   * - TxTags.asset.Freeze
   * - TxTags.asset.Unfreeze
   * - TxTags.identity.AddAuthorization
   * - TxTags.identity.RemoveAuthorization
   */
  AdvancedAssetManagement = 'AdvancedAssetManagement',
  /**
   * - TxTags.identity.AddInvestorUniquenessClaim
   * - TxTags.settlement.CreateVenue
   * - TxTags.settlement.AddInstruction
   * - TxTags.settlement.AddInstructionWithMemo
   * - TxTags.settlement.AddAndAffirmInstruction
   * - TxTags.settlement.AddAndAffirmInstructionWithMemo
   */
  Distribution = 'Distribution',
  /**
   * - TxTags.asset.Issue
   */
  Issuance = 'Issuance',
  /**
   * - TxTags.complianceManager.AddDefaultTrustedClaimIssuer
   * - TxTags.complianceManager.RemoveDefaultTrustedClaimIssuer
   */
  TrustedClaimIssuersManagement = 'TrustedClaimIssuersManagement',
  /**
   * - TxTags.identity.AddClaim
   * - TxTags.identity.RevokeClaim
   */
  ClaimsManagement = 'ClaimsManagement',
  /**
   * - TxTags.complianceManager.AddComplianceRequirement
   * - TxTags.complianceManager.RemoveComplianceRequirement
   * - TxTags.complianceManager.PauseAssetCompliance
   * - TxTags.complianceManager.ResumeAssetCompliance
   * - TxTags.complianceManager.ResetAssetCompliance
   */
  ComplianceRequirementsManagement = 'ComplianceRequirementsManagement',
  /**
   * - TxTags.checkpoint.CreateSchedule,
   * - TxTags.checkpoint.RemoveSchedule,
   * - TxTags.checkpoint.CreateCheckpoint,
   * - TxTags.corporateAction.InitiateCorporateAction,
   * - TxTags.capitalDistribution.Distribute,
   * - TxTags.capitalDistribution.Claim,
   * - TxTags.identity.AddInvestorUniquenessClaim,
   */
  CorporateActionsManagement = 'CorporateActionsManagement',
  /**
   * - TxTags.sto.CreateFundraiser,
   * - TxTags.sto.FreezeFundraiser,
   * - TxTags.sto.Invest,
   * - TxTags.sto.ModifyFundraiserWindow,
   * - TxTags.sto.Stop,
   * - TxTags.sto.UnfreezeFundraiser,
   * - TxTags.identity.AddInvestorUniquenessClaim,
   * - TxTags.asset.Issue,
   * - TxTags.settlement.CreateVenue
   */
  StoManagement = 'StoManagement',
}

export enum PermissionType {
  Include = 'Include',
  Exclude = 'Exclude',
}

/**
 * Signer/agent permissions for a specific type
 *
 * @param T - type of Permissions (Asset, Transaction, Portfolio, etc)
 */
export interface SectionPermissions<T> {
  /**
   * Values to be included/excluded
   */
  values: T[];
  /**
   * Whether the permissions are inclusive or exclusive
   */
  type: PermissionType;
}

/**
 * Permissions related to Transactions. Can include/exclude individual transactions or entire modules
 */
export interface TransactionPermissions extends SectionPermissions<TxTag | ModuleName> {
  /**
   * Transactions to be exempted from inclusion/exclusion. This allows more granularity when
   *   setting permissions. For example, let's say we want to include only the `asset` and `staking` modules,
   *   but exclude the `asset.registerTicker` transaction. We could add both modules to `values`, and add
   *   `TxTags.asset.registerTicker` to `exceptions`
   */
  exceptions?: TxTag[];
}

/**
 * Permissions a Secondary Key has over the Identity. A null value means the key has
 *   all permissions of that type (e.g. if `assets` is null, the key has permissions over all
 *   of the Identity's Assets)
 */
export interface Permissions {
  /**
   * Assets over which this key has permissions
   */
  assets: SectionPermissions<Asset> | null;
  /**
   * Transactions this key can execute
   */
  transactions: TransactionPermissions | null;
  /**
   * list of Transaction Groups this key can execute. Having permissions over a TxGroup
   *   means having permissions over every TxTag in said group. Partial group permissions are not
   *   covered by this value. For a full picture of transaction permissions, see the `transactions` property
   *
   * NOTE: If transactions is null, ignore this value
   */
  transactionGroups: TxGroup[];
  /* list of Portfolios over which this key has permissions */
  portfolios: SectionPermissions<DefaultPortfolio | NumberedPortfolio> | null;
}

/**
 * Asset permissions shared by agents in a group
 */
export type GroupPermissions = Pick<Permissions, 'transactions' | 'transactionGroups'>;

/**
 * All Permission Groups of a specific Asset, separated by `known` and `custom`
 */
export interface PermissionGroups {
  known: KnownPermissionGroup[];
  custom: CustomPermissionGroup[];
}

/**
 * This represents positive permissions (i.e. only "includes"). It is used
 *   for specifying procedure requirements and querying if an Account has certain
 *   permissions. Null values represent full permissions in that category
 */
export interface SimplePermissions {
  /**
   * list of required Asset permissions
   */
  assets?: Asset[] | null;
  /**
   * list of required Transaction permissions
   */
  transactions?: TxTag[] | null;
  /* list of required Portfolio permissions */
  portfolios?: (DefaultPortfolio | NumberedPortfolio)[] | null;
}

/**
 * Result of a `checkRoles` call
 */
export interface CheckRolesResult {
  /**
   * required roles which the Identity *DOESN'T* have. Only present if `result` is `false`
   */
  missingRoles?: Role[];
  /**
   * whether the signer possesses all the required roles or not
   */
  result: boolean;
  /**
   * optional message explaining the reason for failure in special cases
   */
  message?: string;
}

/**
 * Result of a `checkPermissions` call. If `Type` is `Account`, represents whether the Account
 *   has all the necessary secondary key Permissions. If `Type` is `Identity`, represents whether the
 *   Identity has all the necessary external agent Permissions
 */
export interface CheckPermissionsResult<Type extends SignerType> {
  /**
   * required permissions which the signer *DOESN'T* have. Only present if `result` is `false`
   */
  missingPermissions?: Type extends SignerType.Account ? SimplePermissions : TxTag[] | null;
  /**
   * whether the signer complies with the required permissions or not
   */
  result: boolean;
  /**
   * optional message explaining the reason for failure in special cases
   */
  message?: string;
}

export enum PermissionGroupType {
  /**
   * all transactions authorized
   */
  Full = 'Full',
  /**
   * not authorized:
   *   - externalAgents
   */
  ExceptMeta = 'ExceptMeta',
  /**
   * authorized:
   *   - corporateAction
   *   - corporateBallot
   *   - capitalDistribution
   */
  PolymeshV1Caa = 'PolymeshV1Caa',
  /**
   * authorized:
   *   - asset.issue
   *   - asset.redeem
   *   - asset.controllerTransfer
   *   - sto (except for sto.invest)
   */
  PolymeshV1Pia = 'PolymeshV1Pia',
}

export type RotatePrimaryKeyAuthorizationData = {
  type: AuthorizationType.RotatePrimaryKey;
};

export type RotatePrimaryKeyToSecondaryData = {
  type: AuthorizationType.RotatePrimaryKeyToSecondary;
  value: Permissions;
};

export type JoinIdentityAuthorizationData = {
  type: AuthorizationType.JoinIdentity;
  value: Permissions;
};

export type PortfolioCustodyAuthorizationData = {
  type: AuthorizationType.PortfolioCustody;
  value: NumberedPortfolio | DefaultPortfolio;
};

export type BecomeAgentAuthorizationData = {
  type: AuthorizationType.BecomeAgent;
  value: KnownPermissionGroup | CustomPermissionGroup;
};

export type AddRelayerPayingKeyAuthorizationData = {
  type: AuthorizationType.AddRelayerPayingKey;
  value: SubsidyData;
};

export type GenericAuthorizationData = {
  type: Exclude<
    AuthorizationType,
    | AuthorizationType.RotatePrimaryKey
    | AuthorizationType.JoinIdentity
    | AuthorizationType.PortfolioCustody
    | AuthorizationType.BecomeAgent
    | AuthorizationType.AddRelayerPayingKey
    | AuthorizationType.RotatePrimaryKeyToSecondary
  >;
  value: string;
};
/**
 * Authorization request data corresponding to type
 */
export type Authorization =
  | RotatePrimaryKeyAuthorizationData
  | JoinIdentityAuthorizationData
  | PortfolioCustodyAuthorizationData
  | BecomeAgentAuthorizationData
  | AddRelayerPayingKeyAuthorizationData
  | RotatePrimaryKeyToSecondaryData
  | GenericAuthorizationData;

export enum TransactionArgumentType {
  Did = 'Did',
  Address = 'Address',
  Text = 'Text',
  Boolean = 'Boolean',
  Number = 'Number',
  Balance = 'Balance',
  Date = 'Date',
  Array = 'Array',
  Tuple = 'Tuple',
  SimpleEnum = 'SimpleEnum',
  RichEnum = 'RichEnum',
  Object = 'Object',
  Unknown = 'Unknown',
  Null = 'Null',
}

export interface PlainTransactionArgument {
  type: Exclude<
    TransactionArgumentType,
    | TransactionArgumentType.Array
    | TransactionArgumentType.Tuple
    | TransactionArgumentType.SimpleEnum
    | TransactionArgumentType.RichEnum
    | TransactionArgumentType.Object
  >;
}

export interface ArrayTransactionArgument {
  type: TransactionArgumentType.Array;
  internal: TransactionArgument;
}

export interface SimpleEnumTransactionArgument {
  type: TransactionArgumentType.SimpleEnum;
  internal: string[];
}

export interface ComplexTransactionArgument {
  type:
    | TransactionArgumentType.RichEnum
    | TransactionArgumentType.Object
    | TransactionArgumentType.Tuple;
  internal: TransactionArgument[];
}

export type TransactionArgument = {
  name: string;
  optional: boolean;
  _rawType: TypeDef;
} & (
  | PlainTransactionArgument
  | ArrayTransactionArgument
  | SimpleEnumTransactionArgument
  | ComplexTransactionArgument
);

export type Signer = Identity | Account;

export interface OfferingWithDetails {
  offering: Offering;
  details: OfferingDetails;
}

export interface CheckpointWithData {
  checkpoint: Checkpoint;
  createdAt: Date;
  totalSupply: BigNumber;
}

export interface PermissionedAccount {
  account: Account;
  permissions: Permissions;
}

export type PortfolioLike =
  | string
  | Identity
  | NumberedPortfolio
  | DefaultPortfolio
  | { identity: string | Identity; id: BigNumber };

/**
 * Permissions to grant to a Signer over an Identity
 *
 * {@link Permissions}
 *
 * @note TxGroups in the `transactionGroups` array will be transformed into their corresponding `TxTag`s
 */
export type PermissionsLike = {
  /**
   * Assets on which to grant permissions. A null value represents full permissions
   */
  assets?: SectionPermissions<string | Asset> | null;
  /**
   * Portfolios on which to grant permissions. A null value represents full permissions
   */
  portfolios?: SectionPermissions<PortfolioLike> | null;
  /**
   * transaction that the Secondary Key has permission to execute. A null value represents full permissions
   */
} & (
  | {
      transactions?: TransactionPermissions | null;
    }
  | {
      transactionGroups?: TxGroup[];
    }
);

export interface PortfolioMovement {
  asset: string | Asset;
  amount: BigNumber;
  /**
   * identifier string to help differentiate transfers
   */
  memo?: string;
}

export interface ProcedureAuthorizationStatus {
  /**
   * whether the Identity complies with all required Agent permissions
   */
  agentPermissions: CheckPermissionsResult<SignerType.Identity>;
  /**
   * whether the Account complies with all required Signer permissions
   */
  signerPermissions: CheckPermissionsResult<SignerType.Account>;
  /**
   * whether the Identity complies with all required Roles
   */
  roles: CheckRolesResult;
  /**
   * whether the Account is frozen (i.e. can't perform any transactions)
   */
  accountFrozen: boolean;
  /**
   * true only if the Procedure requires an Identity but the signing Account
   *   doesn't have one associated
   */
  noIdentity: boolean;
}

interface TransferRestrictionBase {
  /**
   * array of Scope/Identity IDs that are exempted from the Restriction
   *
   * @note if the Asset requires investor uniqueness, Scope IDs are used. Otherwise, we use Identity IDs. More on Scope IDs and investor uniqueness
   *   [here](https://developers.polymesh.network/introduction/identity#polymesh-unique-identity-system-puis) and
   *   [here](https://developers.polymesh.network/polymesh-docs/primitives/confidential-identity)
   */
  exemptedIds?: string[];
}

export interface CountTransferRestriction extends TransferRestrictionBase {
  count: BigNumber;
}

export interface PercentageTransferRestriction extends TransferRestrictionBase {
  /**
   * maximum percentage (0-100) of the total supply of the Asset that can be held by a single investor at once
   */
  percentage: BigNumber;
}
export interface ClaimCountTransferRestriction extends TransferRestrictionBase {
  /**
   * The type of investors this restriction applies to. e.g. non-accredited
   */
  claim: InputStatClaim;
  /**
   * The minimum amount of investors the must meet the Claim criteria
   */
  min: BigNumber;
  /**
   * The maximum amount of investors that must meet the Claim criteria
   */
  max?: BigNumber;

  issuer: Identity;
}
export interface ClaimPercentageTransferRestriction extends TransferRestrictionBase {
  /**
   * The type of investors this restriction applies to. e.g. Canadian investor
   */
  claim: InputStatClaim;
  /**
   * The minimum percentage of the total supply that investors meeting the Claim criteria must hold
   */
  min: BigNumber;
  /**
   * The maximum percentage of the total supply that investors meeting the Claim criteria must hold
   */
  max: BigNumber;

  issuer: Identity;
}

export interface ActiveTransferRestrictions<
  Restriction extends
    | CountTransferRestriction
    | PercentageTransferRestriction
    | ClaimCountTransferRestriction
    | ClaimPercentageTransferRestriction
> {
  restrictions: Restriction[];
  /**
   * amount of restrictions that can be added before reaching the shared limit
   */
  availableSlots: BigNumber;
}

export enum TransferRestrictionType {
  Count = 'Count',
  Percentage = 'Percentage',
  ClaimCount = 'ClaimCount',
  ClaimPercentage = 'ClaimPercentage',
}

export type TransferRestriction =
  | {
      type: TransferRestrictionType.Count;
      value: BigNumber;
    }
  | { type: TransferRestrictionType.Percentage; value: BigNumber }
  | {
      type: TransferRestrictionType.ClaimCount;
      value: ClaimCountRestrictionValue;
    }
  | {
      type: TransferRestrictionType.ClaimPercentage;
      value: ClaimPercentageRestrictionValue;
    };

export interface ClaimCountRestrictionValue {
  min: BigNumber;
  max?: BigNumber;
  issuer: Identity;
  claim: InputStatClaim;
}

export interface ClaimPercentageRestrictionValue {
  min: BigNumber;
  max: BigNumber;
  issuer: Identity;
  claim: InputStatClaim;
}

export interface AddCountStatInput {
  count: BigNumber;
}

export interface StatClaimIssuer {
  issuer: Identity;
  claimType: StatClaimType;
}

export type ClaimCountStatInput =
  | {
      issuer: Identity;
      claimType: ClaimType.Accredited;
      value: { accredited: BigNumber; nonAccredited: BigNumber };
    }
  | {
      issuer: Identity;
      claimType: ClaimType.Affiliate;
      value: { affiliate: BigNumber; nonAffiliate: BigNumber };
    }
  | {
      issuer: Identity;
      claimType: ClaimType.Jurisdiction;
      value: { countryCode: CountryCode; count: BigNumber }[];
    };

export enum CalendarUnit {
  Second = 'second',
  Minute = 'minute',
  Hour = 'hour',
  Day = 'day',
  Week = 'week',
  Month = 'month',
  Year = 'year',
}

/**
 * Represents a period of time measured in a specific unit (e.g. 20 days)
 */
export interface CalendarPeriod {
  unit: CalendarUnit;
  amount: BigNumber;
}

export interface ScheduleWithDetails {
  schedule: CheckpointSchedule;
  details: ScheduleDetails;
}

export interface DistributionWithDetails {
  distribution: DividendDistribution;
  details: DividendDistributionDetails;
}

export interface DistributionPayment {
  blockNumber: BigNumber;
  blockHash: string;
  date: Date;
  target: Identity;
  amount: BigNumber;
  /**
   * percentage (0-100) of tax withholding for the `target` identity
   */
  withheldTax: BigNumber;
}

export interface ProcedureOpts {
  /**
   * Account or address of a signing key to replace the current one (for this procedure only)
   */
  signingAccount?: string | Account;

  /**
   * nonce value for signing the transaction
   *
   * An {@link api/entities/Account!Account} can directly fetch its current nonce by calling {@link api/entities/Account!Account.getCurrentNonce | account.getCurrentNonce}. More information can be found at: https://polkadot.js.org/docs/api/cookbook/tx/#how-do-i-take-the-pending-tx-pool-into-account-in-my-nonce
   *
   * @note the passed value can be either the nonce itself or a function that returns the nonce. This allows, for example, passing a closure that increases the returned value every time it's called, or a function that fetches the nonce from the chain or a different source
   */
  nonce?: BigNumber | Promise<BigNumber> | (() => BigNumber | Promise<BigNumber>);

  /**
   * This option allows for transactions that never expire, aka "immortal". By default, a transaction is only valid for approximately 5 minutes (250 blocks) after its construction. Allows for transaction construction to be decoupled from its submission, such as requiring manual approval for the signing or providing "at least once" guarantees.
   *
   * More information can be found [here](https://wiki.polkadot.network/docs/build-protocol-info#transaction-mortality). Note the Polymesh chain will **never** reap Accounts, so the risk of a replay attack is mitigated.
   */
  mortality?: MortalityProcedureOpt;
}

/**
 * This transaction will never expire
 */
export interface ImmortalProcedureOptValue {
  readonly immortal: true;
}

/**
 * This transaction will be rejected if not included in a block after a while (default: ~5 minutes)
 */
export interface MortalProcedureOptValue {
  readonly immortal: false;
  /**
   * The number of blocks the for which the transaction remains valid. Target block time is 6 seconds. The default should suffice for most use cases
   *
   * @note this value will get rounded up to the closest power of 2, e.g. `65` rounds to `128`
   * @note this value should not exceed 250 (rounds to 256), which is the chain's `BlockHashCount` as the lesser of the two will be used.
   */
  readonly lifetime?: BigNumber;
}

export type MortalityProcedureOpt = ImmortalProcedureOptValue | MortalProcedureOptValue;

export interface CreateTransactionBatchProcedureMethod {
  <ReturnValues extends readonly [...unknown[]]>(
    args: CreateTransactionBatchParams<ReturnValues>,
    opts?: ProcedureOpts
  ): Promise<PolymeshTransactionBatch<ReturnValues, ReturnValues>>;
  checkAuthorization: <ReturnValues extends [...unknown[]]>(
    args: CreateTransactionBatchParams<ReturnValues>,
    opts?: ProcedureOpts
  ) => Promise<ProcedureAuthorizationStatus>;
}

export interface ProcedureMethod<
  MethodArgs,
  ProcedureReturnValue,
  ReturnValue = ProcedureReturnValue
> {
  (args: MethodArgs, opts?: ProcedureOpts): Promise<
    GenericPolymeshTransaction<ProcedureReturnValue, ReturnValue>
  >;
  checkAuthorization: (
    args: MethodArgs,
    opts?: ProcedureOpts
  ) => Promise<ProcedureAuthorizationStatus>;
}

export interface NoArgsProcedureMethod<ProcedureReturnValue, ReturnValue = ProcedureReturnValue> {
  (opts?: ProcedureOpts): Promise<GenericPolymeshTransaction<ProcedureReturnValue, ReturnValue>>;
  checkAuthorization: (opts?: ProcedureOpts) => Promise<ProcedureAuthorizationStatus>;
}

export interface GroupedInstructions {
  /**
   * Instructions that have already been affirmed by the Identity
   */
  affirmed: Instruction[];
  /**
   * Instructions that still need to be affirmed/rejected by the Identity
   */
  pending: Instruction[];
  /**
   * Instructions that failed in their execution (can be rescheduled).
   *   This group supersedes the other three, so for example, a failed Instruction
   *   might also belong in the `affirmed` group, but it will only be included in this one
   */
  failed: Instruction[];
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
 * URI|mnemonic|hex representation of a private key
 */
export type PrivateKey =
  | {
      uri: string;
    }
  | {
      mnemonic: string;
    }
  | {
      seed: string;
    };

/**
 * Targets of a corporate action in a flexible structure for input purposes
 */
export type InputCorporateActionTargets = Modify<
  CorporateActionTargets,
  {
    identities: (string | Identity)[];
  }
>;

/**
 * Per-Identity tax withholdings of a corporate action in a flexible structure for input purposes
 */
export type InputCorporateActionTaxWithholdings = Modify<
  TaxWithholding,
  {
    identity: string | Identity;
  }
>[];

export type GenericPolymeshTransaction<ProcedureReturnValue, ReturnValue> =
  | PolymeshTransaction<ProcedureReturnValue, ReturnValue>
  | PolymeshTransactionBatch<ProcedureReturnValue, ReturnValue>;

export type TransactionArray<ReturnValues extends readonly [...unknown[]]> = {
  // The type has to be any here to account for procedures with transformed return values
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [K in keyof ReturnValues]: GenericPolymeshTransaction<any, ReturnValues[K]>;
};

/**
 * Transaction data for display purposes
 */
export interface TxData<Args extends unknown[] = unknown[]> {
  /**
   * transaction string identifier
   */
  tag: TxTag;
  /**
   * arguments with which the transaction will be called
   */
  args: Args;
}

/**
 * Apply the {@link TxData} type to all args in an array
 */
export type MapTxData<ArgsArray extends unknown[][]> = {
  [K in keyof ArgsArray]: ArgsArray[K] extends unknown[] ? TxData<ArgsArray[K]> : never;
};

export { TxTags, TxTag, ModuleName, CountryCode };
export { EventRecord } from '@polkadot/types/interfaces';
export { ConnectParams } from '~/api/client/Polymesh';
export * from '~/api/entities/types';
export * from '~/base/types';
export {
  Order,
  EventIdEnum,
  ModuleIdEnum,
  TransactionOrderByInput,
  TransactionOrderFields,
  SettlementResultEnum,
  SettlementDirectionEnum,
} from '~/middleware/types';
export * from '~/middleware/enumsV2';
export {
  PublicEnum8F5A39C8Ee,
  PublicEnum7A0B4Cc03E,
  ExtrinsicsOrderBy,
  AssetHoldersOrderBy,
} from '~/middleware/typesV2';
export * from '~/api/procedures/types';
