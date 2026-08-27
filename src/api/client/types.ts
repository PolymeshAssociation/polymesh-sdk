import { ApiOptions } from '@polkadot/api/types';
import { ISubmittableResult } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';

import { InstructionsOrderBy } from '~/middleware/types';
import { Account, Asset, Identity, InstructionStatusEnum, TxTag } from '~/types';

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
   * the SDK stopped waiting for the transaction before it reached a conclusion. This is **not**
   *   a failure: the transaction may well have been broadcast, and may still be included in a
   *   block. Nothing about it was cancelled — only the waiting stopped
   */
  TransactionTimeout = 'TransactionTimeout',
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
  /**
   * method not supported
   */
  NotSupported = 'NotSupported',
}

export interface MiddlewareConfig {
  link: string;
  /**
   * API key for the middleware, sent as the `x-api-key` header. Optional: an indexer that
   * requires no authentication needs none, and the header is omitted rather than sent empty
   */
  key?: string;
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
   * set to `false` to stop `ApiPromise` waiting on the WASM crypto backend before becoming ready
   *
   * @note runtimes that forbid WASM compilation (e.g. Cloudflare Workers) otherwise hang on
   *   connect, since `cryptoWaitReady()` resolves to `false` instead of rejecting
   *
   * @note this also leaves the backend uninitialized, since `cryptoWaitReady()` is what
   *   initializes it. Read only usage is unaffected, but `sr25519` has no JS fallback, so a
   *   signing manager using it must call `cryptoWaitReady()` itself (`LocalSigningManager` does)
   */
  initWasm?: boolean;

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
export type CustomClaimTypeWithDid = CustomClaimType & { did?: string | undefined };

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
  /**
   * The ordering of the results. Defaults to oldest first
   */
  orderBy?: InstructionsOrderBy | InstructionsOrderBy[];
}

/**
 * A conglomeration of staking storage related to the active era
 */
export interface StakingEraInfo {
  /**
   * The era whose validator set is in force, and whose rewards and slashes are being processed
   *
   * @note this is the era to use for anything describing what the chain is doing *now*. It lags
   *   {@link StakingEraInfo.currentEra | currentEra} between an election and the session rotation
   *   that brings the newly elected set into force
   */
  activeEra: BigNumber;
  /**
   * The moment the active era began, as milliseconds since the Unix epoch
   *
   * @note this is `0` where the chain holds no start for the active era. The chain creates the
   *   active era at session rotation and records its start on the following block, so the gap is
   *   brief — but it recurs at every era change, not only before the first era
   */
  activeEraStart: BigNumber;
  /**
   * The latest era the chain has *planned*
   *
   * @note a validator set has been elected for this era, but the Session pallet may not have
   *   brought it into force yet, so this runs ahead of
   *   {@link StakingEraInfo.activeEra | activeEra} between the election and the rotation. The two
   *   are equal the rest of the time, and `currentEra` is never behind
   */
  currentEra: BigNumber;
  /**
   * The planned session number. A session is a subdivision of an era
   */
  plannedSession: BigNumber;
  /**
   * The total amount of POLYX staked
   */
  totalStaked: BigNumber;
}

export interface StakingConstants {
  /**
   * The number of sessions in an era
   */
  sessionsPerEra: BigNumber;

  /**
   * The number of slots in a session
   */
  slotsPerSession: BigNumber;

  /**
   * The average time the chain is expected to take to produce a block, in milliseconds
   */
  expectedBlockTime: BigNumber;

  /**
   * How long an era is expected to last, in milliseconds
   *
   * @note this is `expectedBlockTime * slotsPerSession * sessionsPerEra`. It is what an era is
   *   expected to take, not what any particular era took — the chain pays rewards against the
   *   duration an era actually ran for
   */
  eraDuration: BigNumber;

  /**
   * How many eras are expected in a year
   *
   * @note the year here is the Julian year of 365.25 days, which is what the chain's reward
   *   calculation uses
   */
  erasPerYear: BigNumber;

  /**
   * The number of eras that must pass before unbonded POLYX can be withdrawn
   */
  bondingDuration: BigNumber;

  /**
   * How many past eras the chain keeps data for
   *
   * @note the per-era reads return `null` for anything older than this many eras before the active
   *   one, because the chain has pruned it
   */
  historyDepth: BigNumber;

  /**
   * The amount of POLYX issued per year once total issuance reaches
   *   {@link StakingConstants.maxVariableInflationTotalIssuance}
   */
  fixedYearlyReward: BigNumber;

  /**
   * The total issuance at which rewards stop following the inflation curve and become
   *   {@link StakingConstants.fixedYearlyReward}
   */
  maxVariableInflationTotalIssuance: BigNumber;
}

/**
 * The phase of the validator election
 */
export enum ElectionPhase {
  /**
   * No election is in progress
   */
  Off = 'Off',
  /**
   * Signed solutions are being accepted
   */
  Signed = 'Signed',
  /**
   * Unsigned solutions are being accepted
   */
  Unsigned = 'Unsigned',
  /**
   * The election failed and is being resolved by governance
   */
  Emergency = 'Emergency',
}

export interface EraRewardPoints {
  /**
   * The total points awarded across all validators in the era
   */
  total: BigNumber;

  /**
   * The points awarded to each validator that authored at least one block in the era
   */
  individual: {
    account: Account;
    points: BigNumber;
  }[];
}

export interface EraExposure {
  /**
   * The total POLYX backing the validator, its own stake included
   */
  total: BigNumber;

  /**
   * The POLYX the validator bonded itself
   */
  own: BigNumber;

  /**
   * How many Accounts nominated the validator in this era
   */
  nominatorCount: BigNumber;

  /**
   * How many pages the nominators are split across
   *
   * @note nominators are paged so a payout fits in a block. Use
   *   {@link api/client/Staking!Staking.getEraNominators | getEraNominators} to read one page
   */
  pageCount: BigNumber;
}

export interface EraNominators {
  /**
   * The total POLYX nominated on this page
   */
  pageTotal: BigNumber;

  /**
   * The nominators on this page and what each of them staked
   */
  nominators: {
    account: Account;
    value: BigNumber;
  }[];
}

/**
 * How far through a period the chain is
 *
 * @note `elapsed`, `total` and `progress` are **exact** — they are counted in slots, which is how
 *   the chain itself measures a period. `remaining` and `end` are **projections** from
 *   {@link StakingConstants.expectedBlockTime}, so they move as block production drifts. Render a
 *   bar from `progress` and a countdown from `remaining`
 */
export interface PeriodProgress {
  /**
   * Slots elapsed so far
   */
  elapsed: BigNumber;

  /**
   * Slots in the whole period
   */
  total: BigNumber;

  /**
   * How far through the period the chain is, from 0 to 1
   *
   * @note clamped to 1. A period that has run past its expected length has not ended — the chain
   *   rolls it over when it rolls over
   */
  progress: BigNumber;

  /**
   * Projected milliseconds until the period ends
   *
   * @note `0` once the period has run past its expected length
   */
  remaining: BigNumber;

  /**
   * Projected moment the period ends
   */
  end: Date;
}

/**
 * A live view of where the chain is in the staking cycle
 *
 * @note an era is divided into sessions (BABE calls them epochs), and both advance every block.
 *   Subscribe with {@link api/client/Staking!Staking.eraProgress | eraProgress} to drive a progress
 *   bar without polling
 */
export interface EraProgress {
  era: {
    /**
     * The active era — the one whose validator set is in force and whose rewards are being
     *   processed
     */
    index: BigNumber;

    /**
     * The latest era the chain has *planned*
     *
     * @note runs ahead of `index` between an election and the session rotation that brings the
     *   newly elected set into force, and equals it the rest of the time
     */
    planned: BigNumber;

    /**
     * When the active era began
     *
     * @note `null` in the brief window between the chain creating the era at session rotation and
     *   recording its start on the following block. Progress is unaffected — it is counted in
     *   slots, which are always available
     */
    start: Date | null;

    /**
     * How far through the active era the chain is
     */
    progress: PeriodProgress;
  };

  session: {
    /**
     * The absolute session index, counting from genesis
     */
    index: BigNumber;

    /**
     * Which session of the active era this is, counting from 1
     */
    inEra: BigNumber;

    /**
     * How many sessions there are in an era
     */
    perEra: BigNumber;

    /**
     * How far through the current session the chain is
     */
    progress: PeriodProgress;
  };
}
