import BigNumber from 'bignumber.js';

import { Identity } from '~/api/entities';

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
  Whitelisted = 'Whitelisted',
  Blacklisted = 'Blacklisted',
  NoData = 'NoData',
}

export type Claim =
  | { type: ClaimType.Jurisdiction; name: string; scope: string }
  | { type: Exclude<ClaimType, ClaimType.NoData | ClaimType.Jurisdiction>; scope: string }
  | { type: ClaimType.NoData | ClaimType.CustomerDueDiligence };

export type ClaimData = {
  target: Identity;
  issuer: Identity;
  issuedAt: Date;
  expiry: Date | null;
  claim: Claim;
};

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
}

/**
 * Represents an amount of tokens to be issued to an identity
 */
export interface IssuanceData {
  did: string;
  amount: BigNumber;
}

export enum TransferStatus {
  Failure = 'Failure',
  Success = 'Success',
  InsufficientBalance = 'InsufficientBalance',
  InvalidReceiver = 'InvalidReceiver',
  FundsLimitReached = 'FundsLimitReached',
}

export interface ClaimTargets {
  targets: string[];
  claim: Claim;
  expiry?: Date;
}

export type SubCallback<T> = (result: T) => void | Promise<void>;
export type UnsubCallback = () => void;

export type Ensured<T, K extends keyof T> = Required<Pick<T, K>>;

export * from '~/api/entities/types';
