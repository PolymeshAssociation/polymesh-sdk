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
  TransactionQueue,
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
   * the transaction's execution failed due to a revert
   */
  Failed = 'Failed',
  /**
   * the transaction couldn't be broadcast. It was either dropped, usurped or invalidated
   * see https://github.com/paritytech/substrate/blob/master/primitives/transaction-pool/src/pool.rs#L58-L110
   */
  Aborted = 'Aborted',
}

export enum TransactionQueueStatus {
  /**
   * the queue is prepped to run
   */
  Idle = 'Idle',
  /**
   * transactions in the queue are being executed
   */
  Running = 'Running',
  /**
   * a critical transaction's execution failed.
   * This might mean the transaction was rejected,
   * failed due to a revert or never entered a block
   */
  Failed = 'Failed',
  /**
   * the queue finished running all of its transactions. Non-critical transactions
   * might still have failed
   */
  Succeeded = 'Succeeded',
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
   *   Please report it to the Polymath team
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
   *   These should generally be reported to the Polymath team
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
   *   chain-specific constraints (i.e. the caller is accepting an invitation to an Identity
   *   and cannot have any funds to pay for it by definition)
   */
  Other = 'Other',
}

/**
 * Represents a relationship in which a third party Account
 *   is paying for a transaction on behalf of the caller
 */
export interface PayingAccount {
  type: PayingAccountType;
  /**
   * Account that pays for the transaction
   */
  account: Account;
  /**
   * total amount that will be paid for
   */
  allowance: BigNumber | null;
}

/**
 * Breakdown of the fees that will be paid by a specific third party in a Transaction Queue
 */
export interface ThirdPartyFees extends PayingAccount {
  /**
   * fees that will be paid by the third party Account
   */
  fees: Fees;
  /**
   * free balance of the third party Account
   */
  balance: BigNumber;
}

/**
 * Breakdown of transaction fees for a Transaction Queue. In most cases, the entirety of the Queue's fees
 *   will be paid by either the signing Account or a third party. In some rare cases,
 *   fees can be split between them (for example, if the signing Account is being subsidized, but one of the
 *   transactions in the queue terminates the subsidy, leaving the signing Account with the responsibility of
 *   paying for the rest of the transactions)
 */
export interface FeesBreakdown {
  /**
   * fees that will be paid by third parties. Each element in the array represents
   *   a different third party Account, their corresponding fees, allowances and balance
   */
  thirdPartyFees: ThirdPartyFees[];
  /**
   * fees that must be paid by the caller Account
   */
  accountFees: Fees;
  /**
   * free balance of the caller Account
   */
  accountBalance: BigNumber;
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
   * - TxTags.settlement.AddAndAffirmInstruction
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
   * - TxTags.settlement.AddAndAffirmInstruction
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
 *   all permissions of that type (i.e. if `assets` is null, the key has permissions over all
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
   *   {@link https://developers.polymesh.network/introduction/identity#polymesh-unique-identity-system-puis | here} and
   *   {@link https://developers.polymesh.network/polymesh-docs/primitives/confidential-identity | here}
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

export interface ActiveTransferRestrictions<
  Restriction extends CountTransferRestriction | PercentageTransferRestriction
> {
  restrictions: Restriction[];
  /**
   * amount of restrictions that can be added before reaching the shared limit
   */
  availableSlots: BigNumber;
}

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
 * Represents a period of time measured in a specific unit (i.e. 20 days)
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
}

export interface ProcedureMethod<
  MethodArgs,
  ProcedureReturnValue,
  ReturnValue = ProcedureReturnValue
> {
  (args: MethodArgs, opts?: ProcedureOpts): Promise<
    TransactionQueue<ProcedureReturnValue, ReturnValue>
  >;
  checkAuthorization: (
    args: MethodArgs,
    opts?: ProcedureOpts
  ) => Promise<ProcedureAuthorizationStatus>;
}

export interface NoArgsProcedureMethod<ProcedureReturnValue, ReturnValue = ProcedureReturnValue> {
  (opts?: ProcedureOpts): Promise<TransactionQueue<ProcedureReturnValue, ReturnValue>>;
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
export * from '~/api/procedures/types';
