import { Keyring } from '@polkadot/api';
import { IKeyringPair, TypeDef } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';
import { ModuleName, TxTag, TxTags } from 'polymesh-types/types';

import { CustomPermissionGroup } from '~/api/entities/CustomPermissionGroup';
import { KnownPermissionGroup } from '~/api/entities/KnownPermissionGroup';
import { DividendDistributionDetails, ScheduleDetails, StoDetails } from '~/api/entities/types';
import { CountryCode } from '~/generated/types';
// NOTE uncomment in Governance v2 upgrade
// import { ProposalDetails } from '~/api/entities/Proposal/types';
import {
  Account,
  Checkpoint,
  CheckpointSchedule,
  DefaultPortfolio,
  DividendDistribution,
  Identity,
  Instruction,
  NumberedPortfolio,
  /*, Proposal */
  SecurityToken,
  Sto,
  TransactionQueue,
} from '~/internal';
import { PortfolioId } from '~/types/internal';

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

/**
 * @hidden
 */
export function isPortfolioCustodianRole(role: Role): role is PortfolioCustodianRole {
  return role.type === RoleType.PortfolioCustodian;
}

/**
 * @hidden
 */
export function isVenueOwnerRole(role: Role): role is VenueOwnerRole {
  return role.type === RoleType.VenueOwner;
}

/**
 * @hidden
 */
export function isCddProviderRole(role: Role): role is CddProviderRole {
  return role.type === RoleType.CddProvider;
}

/**
 * @hidden
 */
export function isTickerOwnerRole(role: Role): role is TickerOwnerRole {
  return role.type === RoleType.TickerOwner;
}

/**
 * @hidden
 */
export function isIdentityRole(role: Role): role is IdentityRole {
  return role.type === RoleType.Identity;
}

export enum KnownTokenType {
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

/**
 * Type of security that the token represents
 */
export type TokenType = KnownTokenType | { custom: string };

export enum TokenIdentifierType {
  Isin = 'Isin',
  Cusip = 'Cusip',
  Cins = 'Cins',
  Lei = 'Lei',
}

// NOTE: query.asset.identifiers doesn’t support custom identifier types properly for now
// export type TokenIdentifierType = KnownTokenIdentifierType | { custom: string };

/**
 * Alphanumeric standardized security identifier
 */
export interface TokenIdentifier {
  type: TokenIdentifierType;
  value: string;
}

/**
 * Document attached to a token
 */
export interface TokenDocument {
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
 * Type of authorization request
 */
export enum AuthorizationType {
  AttestPrimaryKeyRotation = 'AttestPrimaryKeyRotation',
  RotatePrimaryKey = 'RotatePrimaryKey',
  TransferTicker = 'TransferTicker',
  AddMultiSigSigner = 'AddMultiSigSigner',
  TransferAssetOwnership = 'TransferAssetOwnership',
  TransferPrimaryIssuanceAgent = 'TransferPrimaryIssuanceAgent',
  JoinIdentity = 'JoinIdentity',
  PortfolioCustody = 'PortfolioCustody',
  TransferCorporateActionAgent = 'TransferCorporateActionAgent',
  BecomeAgent = 'BecomeAgent',
  Custom = 'Custom',
  NoData = 'NoData',
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
  NoData = 'NoData',
  InvestorUniquenessV2 = 'InvestorUniquenessV2',
}

export type CddClaim = { type: ClaimType.CustomerDueDiligence; id: string };

export type InvestorUniquenessClaim = {
  type: ClaimType.InvestorUniqueness;
  scope: Scope;
  cddId: string;
  scopeId: string;
};

export type InvestorUniquenessV2Claim = {
  type: ClaimType.InvestorUniquenessV2;
  cddId: string;
};

export type ScopedClaim =
  | { type: ClaimType.Jurisdiction; code: CountryCode; scope: Scope }
  | InvestorUniquenessClaim
  | {
      type: Exclude<
        ClaimType,
        | ClaimType.NoData
        | ClaimType.Jurisdiction
        | ClaimType.CustomerDueDiligence
        | ClaimType.InvestorUniqueness
        | ClaimType.InvestorUniquenessV2
      >;
      scope: Scope;
    };

export type UnscopedClaim = { type: ClaimType.NoData } | CddClaim | InvestorUniquenessV2Claim;

export type Claim = ScopedClaim | UnscopedClaim;

/**
 * @hidden
 */
export function isScopedClaim(claim: Claim): claim is ScopedClaim {
  const { type } = claim;

  return ![
    ClaimType.NoData,
    ClaimType.CustomerDueDiligence,
    ClaimType.InvestorUniquenessV2,
  ].includes(type);
}

/**
 * @hidden
 */
export function isInvestorUniquenessClaim(claim: Claim): claim is InvestorUniquenessClaim {
  return claim.type === ClaimType.InvestorUniqueness;
}

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
  blockNumber: BigNumber;
  extrinsicIdx: number;
  address: string | null;
  nonce: number;
  txTag: TxTag;
  params: Record<string, unknown>[];
  success: boolean;
  specVersionId: number;
  extrinsicHash: string;
}

export interface ClaimScope {
  scope: Scope | null;
  ticker?: string;
}

export interface TrustedClaimIssuer {
  identity: Identity;
  /**
   * an undefined value means that the issuer is trusted for all claim types.
   */
  trustedFor?: ClaimType[];
}

export enum ConditionType {
  IsPresent = 'IsPresent',
  IsAbsent = 'IsAbsent',
  IsAnyOf = 'IsAnyOf',
  IsNoneOf = 'IsNoneOf',
  IsExternalAgent = 'IsExternalAgent',
  IsIdentity = 'IsIdentity',
}

export type ConditionBase = { target: ConditionTarget; trustedClaimIssuers?: TrustedClaimIssuer[] };

export type SingleClaimCondition = ConditionBase & {
  type: ConditionType.IsPresent | ConditionType.IsAbsent;
  claim: Claim;
};

export type MultiClaimCondition = ConditionBase & {
  type: ConditionType.IsAnyOf | ConditionType.IsNoneOf;
  claims: Claim[];
};

export type IdentityCondition = ConditionBase & {
  type: ConditionType.IsIdentity;
  identity: Identity;
};

export type ExternalAgentCondition = ConditionBase & {
  type: ConditionType.IsExternalAgent;
};

export type Condition =
  | SingleClaimCondition
  | MultiClaimCondition
  | IdentityCondition
  | ExternalAgentCondition;

/**
 * @hidden
 */
export function isSingleClaimCondition(condition: Condition): condition is SingleClaimCondition {
  return [ConditionType.IsPresent, ConditionType.IsAbsent].includes(condition.type);
}

/**
 * @hidden
 */
export function isMultiClaimCondition(condition: Condition): condition is MultiClaimCondition {
  return [ConditionType.IsAnyOf, ConditionType.IsNoneOf].includes(condition.type);
}

export interface Requirement {
  id: number;
  conditions: Condition[];
}

export interface ConditionCompliance {
  condition: Condition;
  complies: boolean;
}

export interface RequirementCompliance {
  id: number;
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
  TransactionAborted = 'TransactionAborted',
  TransactionRejectedByUser = 'TransactionRejectedByUser',
  TransactionReverted = 'TransactionReverted',
  FatalError = 'FatalError',
  InvalidUuid = 'InvalidUuid',
  ValidationError = 'ValidationError',
  NotAuthorized = 'NotAuthorized',
  MiddlewareError = 'MiddlewareError',
  IdentityNotPresent = 'IdentityNotPresent',
  DataUnavailable = 'DataUnavailable',
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
 *   a [[TransferStatus]], but two or more TransferErrors can represent the same TransferStatus, and
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
   *   the Security Token
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
   * occurs if the Security Token's transfers are frozen
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

export type Ensured<T, K extends keyof T> = Required<Pick<T, K>>;

export interface MiddlewareConfig {
  link: string;
  key: string;
}

export type CommonKeyring = Pick<
  Keyring,
  | 'getPair'
  | 'getPairs'
  | 'addFromSeed'
  | 'addFromUri'
  | 'addFromMnemonic'
  | 'addPair'
  | 'encodeAddress'
>;

export interface UiKeyring {
  keyring: CommonKeyring;
}

export interface EventIdentifier {
  blockNumber: BigNumber;
  blockDate: Date;
  eventIndex: number;
}

export interface KeyringPair extends IKeyringPair {
  isLocked: boolean;
}

export interface Balance {
  free: BigNumber;
  locked: BigNumber;
  total: BigNumber;
}

export type AccountBalance = Balance;

export interface PaginationOptions {
  size: number;
  start?: string;
}

export type NextKey = string | number | null;

export interface ResultSet<T> {
  data: T[];
  next: NextKey;
  count?: number;
}

export interface NetworkProperties {
  name: string;
  version: number;
}

export interface Fees {
  protocol: BigNumber;
  gas: BigNumber;
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
  TokenManagement = 'TokenManagement',
  /**
   * - TxTags.asset.Freeze
   * - TxTags.asset.Unfreeze
   * - TxTags.identity.AddAuthorization
   * - TxTags.identity.RemoveAuthorization
   */
  AdvancedTokenManagement = 'AdvancedTokenManagement',
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
 * @param T - type of Permissions (Security Token, Transaction, Portfolio, etc)
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
 *   all permissions of that type (i.e. if `tokens` is null, the key has permissions over all
 *   of the Identity's Security Tokens)
 */
export interface Permissions {
  /**
   * Security Tokens over which this key has permissions
   */
  tokens: SectionPermissions<SecurityToken> | null;
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
 * Security Token permissions shared by agents in a group
 */
export type GroupPermissions = Pick<Permissions, 'transactions' | 'transactionGroups'>;

/**
 * This represents positive permissions (i.e. only "includes"). It is used
 *   for specifying procedure requirements and querying if an account has certain
 *   permissions
 */
export interface SimplePermissions {
  /**
   * list of required Security Tokens permissions
   */
  tokens?: SecurityToken[] | null;
  /**
   * list of required Transaction permissions
   */
  transactions?: TxTag[] | null;
  /* list of required Portfolio permissions */
  portfolios?: (DefaultPortfolio | NumberedPortfolio)[] | null;
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

/**
 * Authorization request data corresponding to type
 */
export type Authorization =
  | { type: AuthorizationType.NoData }
  | { type: AuthorizationType.JoinIdentity; value: Permissions }
  | { type: AuthorizationType.PortfolioCustody; value: NumberedPortfolio | DefaultPortfolio }
  | { type: AuthorizationType.BecomeAgent; value: KnownPermissionGroup | CustomPermissionGroup }
  | {
      type: Exclude<
        AuthorizationType,
        | AuthorizationType.NoData
        | AuthorizationType.JoinIdentity
        | AuthorizationType.PortfolioCustody
        | AuthorizationType.BecomeAgent
      >;
      value: string;
    };

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
  // eslint-disable-next-line no-use-before-define
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
  // eslint-disable-next-line no-use-before-define
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

// NOTE uncomment in Governance v2 upgrade
// export interface ProposalWithDetails {
//   proposal: Proposal;
//   details: ProposalDetails;
// }

export interface StoWithDetails {
  sto: Sto;
  details: StoDetails;
}

export interface CheckpointWithData {
  checkpoint: Checkpoint;
  createdAt: Date;
  totalSupply: BigNumber;
}

export interface SecondaryKey {
  signer: Signer;
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
 * @link [[Permissions]]
 *
 * @note TxGroups in the `transactionGroups` array will be transformed into their corresponding `TxTag`s
 */
export type PermissionsLike = {
  /**
   * Security Tokens on which to grant permissions. A null value represents full permissions
   */
  tokens?: SectionPermissions<string | SecurityToken> | null;
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
  token: string | SecurityToken;
  amount: BigNumber;
  /**
   * identifier string to help differentiate transfers
   */
  memo?: string;
}

export interface ProcedureAuthorizationStatus {
  agentPermissions: boolean;
  signerPermissions: boolean;
  roles: boolean;
  accountFrozen: boolean;
}

interface TransferRestrictionBase {
  /**
   * array of Scope IDs that are exempted from the Restriction
   */
  exemptedScopeIds?: string[];
}

interface TransferRestrictionInputBase {
  /**
   * array of Scope IDs that are exempted from the Restriction
   */
  exemptedScopeIds?: string[];
  /**
   * array of Identities (or DIDs) that are exempted from the Restriction
   */
  exemptedIdentities?: (Identity | string)[];
}

export interface CountTransferRestriction extends TransferRestrictionBase {
  count: BigNumber;
}

export interface PercentageTransferRestriction extends TransferRestrictionBase {
  percentage: BigNumber;
}

export interface CountTransferRestrictionInput extends TransferRestrictionInputBase {
  /**
   * limit on the amount of different (unique) investors that can hold the Security Token at once
   */
  count: BigNumber;
}

export interface PercentageTransferRestrictionInput extends TransferRestrictionInputBase {
  /**
   * limit on the proportion of the total supply of the Security Token that can be held by a single investor at once
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
  availableSlots: number;
}

export enum TransferRestrictionType {
  Count = 'Count',
  Percentage = 'Percentage',
}

export interface TransferRestriction {
  type: TransferRestrictionType;
  value: BigNumber;
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
  amount: number;
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
  date: Date;
  target: Identity;
  amount: BigNumber;
  withheldTax: BigNumber;
}

export interface ProcedureOpts {
  /**
   * Account or address of a signing key to replace the current one (for this procedure only)
   */
  signer?: string | Account;
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

export interface GroupedInstructions {
  /**
   * Instructions that have already been affirmed by the Identity
   */
  affirmed: Instruction[];
  /**
   * Instructions that have already been rejected by the Identity
   */
  rejected: Instruction[];
  /**
   * Instructions that still need to be affirmed/rejected by the Identity
   */
  pending: Instruction[];
  /**
   * Instructions that failed in their execution (can be rescheduled).
   *   This group supercedes the other three, so for example, a failed Instruction
   *   might also belong in the `affirmed` group, but it will only be included in this one
   */
  failed: Instruction[];
}

export interface TokenWithGroup {
  token: SecurityToken;
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

export { TxTags, TxTag, ModuleName };
export { Signer as PolkadotSigner } from '@polkadot/api/types';
export { EventRecord } from '@polkadot/types/interfaces';
export * from '~/api/entities/types';
export * from '~/base/types';
export { Order } from '~/middleware/types';
