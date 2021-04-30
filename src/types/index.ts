import { Keyring } from '@polkadot/api';
import { IKeyringPair, TypeDef } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';
import { TxTag, TxTags } from 'polymesh-types/types';

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
  NumberedPortfolio,
  /*, Proposal */
  SecurityToken,
  Sto,
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
  TokenOwner = 'TokenOwner',
  TokenPia = 'TokenPia',
  TokenCaa = 'TokenCaa',
  CddProvider = 'CddProvider',
  VenueOwner = 'VenueOwner',
  PortfolioCustodian = 'PortfolioCustodian',
  CorporateActionsAgent = 'CorporateActionsAgent',
}

export interface TickerOwnerRole {
  type: RoleType.TickerOwner;
  ticker: string;
}

/**
 * @hidden
 */
export function isTickerOwnerRole(role: Role): role is TickerOwnerRole {
  return role.type === RoleType.TickerOwner;
}

export interface TokenOwnerRole {
  type: RoleType.TokenOwner;
  ticker: string;
}

/**
 * @hidden
 */
export function isTokenOwnerRole(role: Role): role is TokenOwnerRole {
  return role.type === RoleType.TokenOwner;
}

export interface TokenPiaRole {
  type: RoleType.TokenPia;
  ticker: string;
}

/**
 * @hidden
 */
export function isTokenPiaRole(role: Role): role is TokenPiaRole {
  return role.type === RoleType.TokenPia;
}

export interface TokenCaaRole {
  type: RoleType.TokenCaa;
  ticker: string;
}

/**
 * @hidden
 */
export function isTokenCaaRole(role: Role): role is TokenCaaRole {
  return role.type === RoleType.TokenCaa;
}

export interface CddProviderRole {
  type: RoleType.CddProvider;
}

/**
 * @hidden
 */
export function isCddProviderRole(role: Role): role is CddProviderRole {
  return role.type === RoleType.CddProvider;
}

export interface VenueOwnerRole {
  type: RoleType.VenueOwner;
  venueId: BigNumber;
}

/**
 * @hidden
 */
export function isVenueOwnerRole(role: Role): role is VenueOwnerRole {
  return role.type === RoleType.VenueOwner;
}

export interface PortfolioCustodianRole {
  type: RoleType.PortfolioCustodian;
  portfolioId: PortfolioId;
}

/**
 * @hidden
 */
export function isPortfolioCustodianRole(role: Role): role is PortfolioCustodianRole {
  return role.type === RoleType.PortfolioCustodian;
}

export type Role =
  | TickerOwnerRole
  | TokenOwnerRole
  | TokenPiaRole
  | TokenCaaRole
  | CddProviderRole
  | VenueOwnerRole
  | PortfolioCustodianRole;

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
  contentHash: string;
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
  Custom = 'Custom',
  NoData = 'NoData',
}

/**
 * Authorization request data corresponding to type
 */
export type Authorization =
  | { type: AuthorizationType.NoData }
  | { type: AuthorizationType.JoinIdentity; value: Permissions }
  | { type: AuthorizationType.PortfolioCustody; value: NumberedPortfolio | DefaultPortfolio }
  | {
      type: Exclude<
        AuthorizationType,
        | AuthorizationType.NoData
        | AuthorizationType.JoinIdentity
        | AuthorizationType.PortfolioCustody
      >;
      value: string;
    };

export enum ConditionTarget {
  Sender = 'Sender',
  Receiver = 'Receiver',
  Both = 'Both',
}

export enum ScopeType {
  // eslint-disable-next-line no-shadow
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
  params: object[];
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
  IsPrimaryIssuanceAgent = 'IsPrimaryIssuanceAgent',
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

export type PrimaryIssuanceAgentCondition = ConditionBase & {
  type: ConditionType.IsPrimaryIssuanceAgent;
};

export type Condition =
  | SingleClaimCondition
  | MultiClaimCondition
  | IdentityCondition
  | PrimaryIssuanceAgentCondition;

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
  'getPair' | 'getPairs' | 'addFromSeed' | 'addFromUri' | 'addFromMnemonic'
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
 * Permissions a Secondary Key has over the Identity. A null value means the key has
 *   all permissions of that type (i.e. if `tokens` is null, the key has permissions over all
 *   of the Identity's Security Tokens)
 */
export interface Permissions {
  /**
   * list of Security Tokens over which this key has permissions
   */
  tokens: SecurityToken[] | null;
  /**
   * list of Transactions this key can execute
   */
  transactions: TxTag[] | null;
  /**
   * list of Transaction Groups this key can execute. Having permissions over a TxGroup
   *   means having permissions over every TxTag in said group. Transaction permissions are the result of
   *   combining these with the `transactions` array. If `transactions` is null, then this value is redundant
   */
  transactionGroups: TxGroup[];
  /* list of Portfolios over which this key has permissions */
  portfolios: (DefaultPortfolio | NumberedPortfolio)[] | null;
}

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

// NOTE uncomment in Governance v2 upgrade
// export interface ProposalWithDetails {
//   proposal: Proposal;
//   details: ProposalDetails;
// }

export interface StoWithDetails {
  sto: Sto;
  details: StoDetails;
}

export interface CheckpointWithCreationDate {
  checkpoint: Checkpoint;
  createdAt: Date;
}

export interface SecondaryKey {
  signer: Signer;
  permissions: Permissions;
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

/**
 * Permissions to grant to a Signer over an Identity
 *
 * @note TxGroups in the `transactionGroups` array will be transformed into their corresponding `TxTag`s
 *   and appended to the `transactions` array. If `transactions` is null, then the value of `transactionGroups` is redundant
 */
export interface PermissionsLike {
  tokens?: (string | SecurityToken)[] | null;
  transactions?: TxTag[] | null;
  transactionGroups?: TxGroup[];
  portfolios?: PortfolioLike[] | null;
}

export type PortfolioLike =
  | string
  | Identity
  | NumberedPortfolio
  | DefaultPortfolio
  | { identity: string | Identity; id: BigNumber };

export interface PortfolioMovement {
  token: string | SecurityToken;
  amount: BigNumber;
}

export interface ProcedureAuthorizationStatus {
  permissions: boolean;
  roles: boolean;
}

interface TransferRestrictionBase {
  exemptedScopeIds?: string[];
}

interface TransferRestrictionInputBase {
  exemptedScopeIds?: string[];
  exemptedIdentities?: (Identity | string)[];
}

export interface CountTransferRestriction extends TransferRestrictionBase {
  count: BigNumber;
}

export interface PercentageTransferRestriction extends TransferRestrictionBase {
  percentage: BigNumber;
}

export interface CountTransferRestrictionInput extends TransferRestrictionInputBase {
  count: BigNumber;
}

export interface PercentageTransferRestrictionInput extends TransferRestrictionInputBase {
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

export { TxTags, TxTag };
export { Signer as PolkadotSigner } from '@polkadot/api/types';
export { EventRecord } from '@polkadot/types/interfaces';
export * from '~/api/entities/types';
export * from '~/base/types';
export { Order } from '~/middleware/types';
