import { Keyring } from '@polkadot/api';
import { IKeyringPair, TypeDef } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';

import { Identity } from '~/api/entities';
import { CallIdEnum, ModuleIdEnum } from '~/middleware/types';

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
  CddProvider = 'CddProvider',
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

export interface CddProviderRole {
  type: RoleType.CddProvider;
}

/**
 * @hidden
 */
export function isCddProviderRole(role: Role): role is CddProviderRole {
  return role.type === RoleType.CddProvider;
}

export type Role = TickerOwnerRole | TokenOwnerRole | CddProviderRole;

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
}

/**
 * Type of security that the token represents
 */
export type TokenType = KnownTokenType | { custom: string };

export enum TokenIdentifierType {
  Isin = 'Isin',
  Cusip = 'Cusip',
  Cins = 'Cins',
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
}

/**
 * Type of authorization request
 */
export enum AuthorizationType {
  AttestMasterKeyRotation = 'AttestMasterKeyRotation',
  RotateMasterKey = 'RotateMasterKey',
  TransferTicker = 'TransferTicker',
  AddMultiSigSigner = 'AddMultiSigSigner',
  TransferAssetOwnership = 'TransferAssetOwnership',
  JoinIdentity = 'JoinIdentity',
  Custom = 'Custom',
  NoData = 'NoData',
}

/**
 * Authorization request data corresponding to type
 */
export type Authorization =
  | { type: AuthorizationType.NoData | AuthorizationType.AddMultiSigSigner }
  | {
      type: Exclude<
        AuthorizationType,
        AuthorizationType.NoData | AuthorizationType.AddMultiSigSigner
      >;
      value: string;
    };

export enum ConditionTarget {
  Sender = 'Sender',
  Receiver = 'Receiver',
  Both = 'Both',
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
  NoData = 'NoData',
}

export type ScopedClaim =
  | { type: ClaimType.Jurisdiction; name: string; scope: string }
  | { type: Exclude<ClaimType, ClaimType.NoData | ClaimType.Jurisdiction>; scope: string };

export type UnscopedClaim = { type: ClaimType.NoData | ClaimType.CustomerDueDiligence };

export type Claim = ScopedClaim | UnscopedClaim;

/**
 * @hidden
 */
export function isScopedClaim(claim: Claim): claim is ScopedClaim {
  const { type } = claim;

  return type !== ClaimType.NoData && type !== ClaimType.CustomerDueDiligence;
}

export interface ClaimData {
  target: Identity;
  issuer: Identity;
  issuedAt: Date;
  expiry: Date | null;
  claim: Claim;
}

export interface IdentityWithClaims {
  identity: Identity;
  claims: ClaimData[];
}

export interface ExtrinsicData {
  blockId?: number | null;
  extrinsicIdx?: number | null;
  extrinsicVersion?: string | null;
  signed?: number | null;
  address?: string | null;
  nonce?: number | null;
  era?: string | null;
  call?: string | null;
  moduleId?: ModuleIdEnum | null;
  callId?: CallIdEnum | null;
  params?: object | null;
  success?: number | null;
  specVersionId?: number | null;
  extrinsicHash?: string | null;
}

export enum ConditionType {
  IsPresent = 'IsPresent',
  IsAbsent = 'IsAbsent',
  IsAnyOf = 'IsAnyOf',
  IsNoneOf = 'IsNoneOf',
}

export type ConditionBase = { target: ConditionTarget; trustedClaimIssuers?: string[] };

export type SingleClaimCondition = ConditionBase & {
  type: ConditionType.IsPresent | ConditionType.IsAbsent;
  claim: Claim;
};

export type MultiClaimCondition = ConditionBase & {
  type: ConditionType.IsAnyOf | ConditionType.IsNoneOf;
  claims: Claim[];
};

export type Condition = SingleClaimCondition | MultiClaimCondition;

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

export interface Rule {
  id: number;
  conditions: Condition[];
}

export interface RuleCompliance {
  rules: (Rule & {
    complies: boolean;
  })[];
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
}

/**
 * Represents an amount of tokens to be issued to an identity
 */
export interface IssuanceData {
  identity: string | Identity;
  amount: BigNumber;
}

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
}

export interface ClaimTargets {
  targets: (string | Identity)[];
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

export type CommonKeyring = Pick<Keyring, 'getPair' | 'getPairs' | 'addFromSeed' | 'addFromUri'>;

export interface UiKeyring {
  keyring: CommonKeyring;
}

export interface EventIdentifier {
  blockNumber: number;
  blockDate: Date;
  eventIndex: number;
}

export interface KeyringPair extends IKeyringPair {
  isLocked: boolean;
}

export interface AccountBalance {
  free: BigNumber;
  locked: BigNumber;
}

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

export enum LinkType {
  DocumentOwnership = 'DocumentOwnership',
  TickerOwnership = 'TickerOwnership',
  AssetOwnership = 'AssetOwnership',
  NoData = 'NoData',
}

export enum SignerType {
  // eslint-disable-next-line no-shadow
  Identity = 'Identity',
  AccountKey = 'AccountKey',
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

export interface Signer {
  type: SignerType;
  value: string;
}

export { TxTags } from 'polymesh-types/types';
export * from '~/api/entities/types';
export * from '~/base/types';
export { Order } from '~/middleware/types';
