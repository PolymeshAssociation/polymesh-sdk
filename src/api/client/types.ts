import { ApiOptions } from '@polkadot/api/types';
import { ISubmittableResult } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';

import { Asset, Identity, InstructionStatusEnum, TxTag } from '~/types';

export { InstructionStatusEnum };

export interface ExtrinsicData {
  blockHash: string;
  blockNumber: BigNumber;
  blockDate: Date;
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

export interface MiddlewareMetadata {
  chain: string;
  genesisHash: string;
  indexerHealthy: boolean;
  lastProcessedHeight: BigNumber;
  lastProcessedTimestamp: Date;
  specName: string;
  targetHeight: BigNumber;
  sqVersion: string;
  paddedIds: boolean;
}

export interface SubmissionDetails {
  blockHash: string;
  transactionIndex: BigNumber;
  transactionHash: string;
  /**
   * The raw result of the transaction. Contains event data for the transaction
   */
  result: ISubmittableResult;
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

export interface MiddlewareConfig {
  link: string;
  key: string;
}

export interface PolkadotConfig {
  /**
   * provide a locally saved metadata file for a modestly fast startup time (e.g. 1 second when provided, 1.5 seconds without).
   *
   * @note if not provided the SDK will read the needed data from chain during startup
   *
   * @note format is key as genesis hash and spec version and the value hex encoded chain metadata
   *
   * @example creating valid metadata
   * ```ts
   const meta = _polkadotApi.runtimeMetadata.toHex();
   const genesisHash = _polkadotApi.genesisHash;
   const specVersion = _polkadotApi.runtimeVersion.specVersion;

  const metadata = {
    [`${genesisHash}-${specVersion}`]: meta,
  };
  ```
   */
  metadata?: ApiOptions['metadata'];

  /**
   * set to `true` to disable polkadot start up warnings
   */
  noInitWarn?: boolean;

  /**
   * allows for types to be provided for multiple chain specs at once
   *
   * @note shouldn't be needed for most use cases
   */
  typesBundle?: ApiOptions['typesBundle'];
}

export interface EventIdentifier {
  blockNumber: BigNumber;
  blockHash: string;
  blockDate: Date;
  eventIndex: BigNumber;
}

export interface NetworkProperties {
  name: string;
  version: BigNumber;
  genesisHash: string;
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
 * CustomClaimType
 */
export type CustomClaimType = {
  name: string;
  id: BigNumber;
};

/**
 * CustomClaimType with DID that registered the CustomClaimType
 */
export type CustomClaimTypeWithDid = CustomClaimType & { did?: string };

/**
 * Filters for instructions
 *
 */
export interface HistoricalInstructionFilters {
  /**
   * The DID of the identity to filter by
   */
  identity?: string | Identity;
  /**
   * The asset ID to filter by
   */
  asset?: string | Asset;
  /**
   * The status to filter by
   */
  status?: InstructionStatusEnum;
  /**
   * The sender did to filter by
   */
  sender?: string | Identity;
  /**
   * The receiver did to filter by
   */
  receiver?: string | Identity;
  /**
   * The mediator did to filter by
   */
  mediator?: string | Identity;
  /**
   * The party did to filter by
   */
  party?: string | Identity;
  /**
   * The number of results to return
   */
  size?: BigNumber;
  /**
   * The number of results to skip
   */
  start?: BigNumber;
}
