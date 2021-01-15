// Auto-generated via `yarn polkadot-types-from-chain`, do not edit
/* eslint-disable */

import type { Bytes, Option, Vec, bool, u16, u32, u64 } from '@polkadot/types';
import type { AnyNumber, ITuple, Observable } from '@polkadot/types/types';
import type { UncleEntryItem } from '@polkadot/types/interfaces/authorship';
import type {
  BabeAuthorityWeight,
  MaybeRandomness,
  NextConfigDescriptor,
  Randomness,
} from '@polkadot/types/interfaces/babe';
import type { BalanceLock } from '@polkadot/types/interfaces/balances';
import type { AuthorityId } from '@polkadot/types/interfaces/consensus';
import type {
  CodeHash,
  ContractInfo,
  PrefabWasmModule,
  Schedule,
} from '@polkadot/types/interfaces/contracts';
import type { Proposal } from '@polkadot/types/interfaces/democracy';
import type { Vote } from '@polkadot/types/interfaces/elections';
import type { SetId, StoredPendingChange, StoredState } from '@polkadot/types/interfaces/grandpa';
import type { AuthIndex } from '@polkadot/types/interfaces/imOnline';
import type {
  DeferredOffenceOf,
  Kind,
  OffenceDetails,
  OpaqueTimeSlot,
  ReportIdOf,
} from '@polkadot/types/interfaces/offences';
import type {
  AccountId,
  AccountIndex,
  Balance,
  BalanceOf,
  BlockNumber,
  ExtrinsicsWeight,
  Hash,
  KeyTypeId,
  Moment,
  Perbill,
  Releases,
  ValidatorId,
} from '@polkadot/types/interfaces/runtime';
import type { Scheduled, TaskAddress } from '@polkadot/types/interfaces/scheduler';
import type { Keys, SessionIndex } from '@polkadot/types/interfaces/session';
import type {
  ActiveEraInfo,
  ElectionResult,
  ElectionScore,
  ElectionStatus,
  EraIndex,
  EraRewardPoints,
  Exposure,
  Forcing,
  Nominations,
  RewardDestination,
  SlashingSpans,
  SpanIndex,
  SpanRecord,
  StakingLedger,
  UnappliedSlash,
  ValidatorPrefs,
} from '@polkadot/types/interfaces/staking';
import type {
  AccountInfo,
  DigestOf,
  EventIndex,
  EventRecord,
  LastRuntimeUpgradeInfo,
  Phase,
} from '@polkadot/types/interfaces/system';
import type { Multiplier } from '@polkadot/types/interfaces/txpayment';
import type {
  AffirmationStatus,
  AssetCompliance,
  AssetIdentifier,
  AssetOwnershipRelation,
  Authorization,
  AuthorizationNonce,
  BallotMeta,
  BallotTimeRange,
  BallotVote,
  BridgeTxDetail,
  CAId,
  CheckpointId,
  Claim1stKey,
  Claim2ndKey,
  ClassicTickerRegistration,
  CorporateAction,
  Counter,
  DepositInfo,
  DidRecord,
  DispatchableName,
  Distribution,
  Document,
  DocumentId,
  ExtVersion,
  ExtensionAttributes,
  FundingRoundName,
  Fundraiser,
  IdentityClaim,
  IdentityId,
  InactiveMember,
  Instruction,
  Leg,
  LegStatus,
  LocalCAId,
  MaybeBlock,
  OfflineSlashingParams,
  PalletName,
  PermissionedIdentityPrefs,
  Pip,
  PipId,
  PipsMetadata,
  PolymeshVotes,
  PortfolioId,
  PortfolioName,
  PortfolioNumber,
  PosRatio,
  ProposalDetails,
  ProtocolOp,
  ProverTickerKey,
  ScheduleId,
  ScopeId,
  SecurityToken,
  Signatory,
  SkippedCount,
  SlashingSwitch,
  SmartExtension,
  SmartExtensionType,
  SnapshotMetadata,
  SnapshottedPip,
  StoredSchedule,
  TargetIdAuthorization,
  TargetIdentities,
  Tax,
  TemplateDetails,
  TemplateMetadata,
  Ticker,
  TickerRangeProof,
  TickerRegistration,
  TickerRegistrationConfig,
  TransferManager,
  TrustedIssuer,
  Venue,
  Version,
  VotingResult,
} from 'polymesh-types/polymesh';
import type { ApiTypes } from '@polkadot/api/types';

declare module '@polkadot/api/types/storage' {
  export interface AugmentedQueries<ApiType> {
    asset: {
      /**
       * Store aggregate balance of those identities that has the same `ScopeId`.
       * (Ticker, ScopeId) => Balance.
       **/
      aggregateBalance: AugmentedQueryDoubleMap<
        ApiType,
        (
          key1: Ticker | string | Uint8Array,
          key2: ScopeId | string | Uint8Array
        ) => Observable<Balance>,
        [Ticker, ScopeId]
      >;
      /**
       * Documents attached to an Asset
       * (ticker, doc_id) -> document
       **/
      assetDocuments: AugmentedQueryDoubleMap<
        ApiType,
        (
          key1: Ticker | string | Uint8Array,
          key2: DocumentId | AnyNumber | Uint8Array
        ) => Observable<Document>,
        [Ticker, DocumentId]
      >;
      /**
       * Per-ticker document ID counter.
       * (ticker) -> doc_id
       **/
      assetDocumentsIdSequence: AugmentedQuery<
        ApiType,
        (arg: Ticker | string | Uint8Array) => Observable<DocumentId>,
        [Ticker]
      >;
      /**
       * Tickers and token owned by a user
       * (user, ticker) -> AssetOwnership
       **/
      assetOwnershipRelations: AugmentedQueryDoubleMap<
        ApiType,
        (
          key1: IdentityId | string | Uint8Array,
          key2: Ticker | string | Uint8Array
        ) => Observable<AssetOwnershipRelation>,
        [IdentityId, Ticker]
      >;
      /**
       * The total asset ticker balance per identity.
       * (ticker, DID) -> Balance
       **/
      balanceOf: AugmentedQueryDoubleMap<
        ApiType,
        (
          key1: Ticker | string | Uint8Array,
          key2: IdentityId | string | Uint8Array
        ) => Observable<Balance>,
        [Ticker, IdentityId]
      >;
      /**
       * Balances get stored on the basis of the `ScopeId`.
       * Right now it is only helpful for the UI purposes but in future it can be used to do miracles on-chain.
       * (ScopeId, IdentityId) => Balance.
       **/
      balanceOfAtScope: AugmentedQueryDoubleMap<
        ApiType,
        (
          key1: ScopeId | string | Uint8Array,
          key2: IdentityId | string | Uint8Array
        ) => Observable<Balance>,
        [ScopeId, IdentityId]
      >;
      /**
       * Ticker registration details on Polymath Classic / Ethereum.
       **/
      classicTickers: AugmentedQuery<
        ApiType,
        (arg: Ticker | string | Uint8Array) => Observable<Option<ClassicTickerRegistration>>,
        [Ticker]
      >;
      /**
       * Supported extension version.
       **/
      compatibleSmartExtVersion: AugmentedQuery<
        ApiType,
        (
          arg:
            | SmartExtensionType
            | { TransferManager: any }
            | { Offerings: any }
            | { SmartWallet: any }
            | { Custom: any }
            | string
            | Uint8Array
        ) => Observable<ExtVersion>,
        [SmartExtensionType]
      >;
      /**
       * List of Smart extension added for the given tokens.
       * ticker, AccountId (SE address) -> SmartExtension detail
       **/
      extensionDetails: AugmentedQuery<
        ApiType,
        (
          arg:
            | ITuple<[Ticker, AccountId]>
            | [Ticker | string | Uint8Array, AccountId | string | Uint8Array]
        ) => Observable<SmartExtension>,
        [ITuple<[Ticker, AccountId]>]
      >;
      /**
       * List of Smart extension added for the given tokens and for the given type.
       * ticker, type of SE -> address/AccountId of SE
       **/
      extensions: AugmentedQuery<
        ApiType,
        (
          arg:
            | ITuple<[Ticker, SmartExtensionType]>
            | [
                Ticker | string | Uint8Array,
                (
                  | SmartExtensionType
                  | { TransferManager: any }
                  | { Offerings: any }
                  | { SmartWallet: any }
                  | { Custom: any }
                  | string
                  | Uint8Array
                )
              ]
        ) => Observable<Vec<AccountId>>,
        [ITuple<[Ticker, SmartExtensionType]>]
      >;
      /**
       * The set of frozen assets implemented as a membership map.
       * ticker -> bool
       **/
      frozen: AugmentedQuery<
        ApiType,
        (arg: Ticker | string | Uint8Array) => Observable<bool>,
        [Ticker]
      >;
      /**
       * The name of the current funding round.
       * ticker -> funding round
       **/
      fundingRound: AugmentedQuery<
        ApiType,
        (arg: Ticker | string | Uint8Array) => Observable<FundingRoundName>,
        [Ticker]
      >;
      /**
       * A map of a ticker name and asset identifiers.
       **/
      identifiers: AugmentedQuery<
        ApiType,
        (arg: Ticker | string | Uint8Array) => Observable<Vec<AssetIdentifier>>,
        [Ticker]
      >;
      /**
       * The total balances of tokens issued in all recorded funding rounds.
       * (ticker, funding round) -> balance
       **/
      issuedInFundingRound: AugmentedQuery<
        ApiType,
        (
          arg:
            | ITuple<[Ticker, FundingRoundName]>
            | [Ticker | string | Uint8Array, FundingRoundName | string]
        ) => Observable<Balance>,
        [ITuple<[Ticker, FundingRoundName]>]
      >;
      /**
       * Tracks the ScopeId of the identity for a given ticker.
       * (Ticker, IdentityId) => ScopeId.
       **/
      scopeIdOf: AugmentedQueryDoubleMap<
        ApiType,
        (
          key1: Ticker | string | Uint8Array,
          key2: IdentityId | string | Uint8Array
        ) => Observable<ScopeId>,
        [Ticker, IdentityId]
      >;
      /**
       * Storage version.
       **/
      storageVersion: AugmentedQuery<ApiType, () => Observable<Version>, []>;
      /**
       * Ticker registration config.
       * (ticker) -> TickerRegistrationConfig
       **/
      tickerConfig: AugmentedQuery<ApiType, () => Observable<TickerRegistrationConfig>, []>;
      /**
       * Ticker registration details.
       * (ticker) -> TickerRegistration
       **/
      tickers: AugmentedQuery<
        ApiType,
        (arg: Ticker | string | Uint8Array) => Observable<TickerRegistration>,
        [Ticker]
      >;
      /**
       * Details of the token corresponding to the token ticker.
       * (ticker) -> SecurityToken details [returns SecurityToken struct]
       **/
      tokens: AugmentedQuery<
        ApiType,
        (arg: Ticker | string | Uint8Array) => Observable<SecurityToken>,
        [Ticker]
      >;
    };
    authorship: {
      /**
       * Author of current block.
       **/
      author: AugmentedQuery<ApiType, () => Observable<Option<AccountId>>, []>;
      /**
       * Whether uncles were already set in this block.
       **/
      didSetUncles: AugmentedQuery<ApiType, () => Observable<bool>, []>;
      /**
       * Uncles
       **/
      uncles: AugmentedQuery<ApiType, () => Observable<Vec<UncleEntryItem>>, []>;
    };
    babe: {
      /**
       * Current epoch authorities.
       **/
      authorities: AugmentedQuery<
        ApiType,
        () => Observable<Vec<ITuple<[AuthorityId, BabeAuthorityWeight]>>>,
        []
      >;
      /**
       * Current slot number.
       **/
      currentSlot: AugmentedQuery<ApiType, () => Observable<u64>, []>;
      /**
       * Current epoch index.
       **/
      epochIndex: AugmentedQuery<ApiType, () => Observable<u64>, []>;
      /**
       * The slot at which the first epoch actually started. This is 0
       * until the first block of the chain.
       **/
      genesisSlot: AugmentedQuery<ApiType, () => Observable<u64>, []>;
      /**
       * Temporary value (cleared at block finalization) which is `Some`
       * if per-block initialization has already been called for current block.
       **/
      initialized: AugmentedQuery<ApiType, () => Observable<Option<MaybeRandomness>>, []>;
      /**
       * How late the current block is compared to its parent.
       *
       * This entry is populated as part of block execution and is cleaned up
       * on block finalization. Querying this storage entry outside of block
       * execution context should always yield zero.
       **/
      lateness: AugmentedQuery<ApiType, () => Observable<BlockNumber>, []>;
      /**
       * Next epoch configuration, if changed.
       **/
      nextEpochConfig: AugmentedQuery<ApiType, () => Observable<Option<NextConfigDescriptor>>, []>;
      /**
       * Next epoch randomness.
       **/
      nextRandomness: AugmentedQuery<ApiType, () => Observable<Randomness>, []>;
      /**
       * The epoch randomness for the *current* epoch.
       *
       * # Security
       *
       * This MUST NOT be used for gambling, as it can be influenced by a
       * malicious validator in the short term. It MAY be used in many
       * cryptographic protocols, however, so long as one remembers that this
       * (like everything else on-chain) it is public. For example, it can be
       * used where a number is needed that cannot have been chosen by an
       * adversary, for purposes such as public-coin zero-knowledge proofs.
       **/
      randomness: AugmentedQuery<ApiType, () => Observable<Randomness>, []>;
      /**
       * Randomness under construction.
       *
       * We make a tradeoff between storage accesses and list length.
       * We store the under-construction randomness in segments of up to
       * `UNDER_CONSTRUCTION_SEGMENT_LENGTH`.
       *
       * Once a segment reaches this length, we begin the next one.
       * We reset all segments and return to `0` at the beginning of every
       * epoch.
       **/
      segmentIndex: AugmentedQuery<ApiType, () => Observable<u32>, []>;
      /**
       * TWOX-NOTE: `SegmentIndex` is an increasing integer, so this is okay.
       **/
      underConstruction: AugmentedQuery<
        ApiType,
        (arg: u32 | AnyNumber | Uint8Array) => Observable<Vec<Randomness>>,
        [u32]
      >;
    };
    balances: {
      /**
       * Any liquidity locks on some account balances.
       * NOTE: Should only be accessed when setting, changing and freeing a lock.
       **/
      locks: AugmentedQuery<
        ApiType,
        (arg: AccountId | string | Uint8Array) => Observable<Vec<BalanceLock>>,
        [AccountId]
      >;
      /**
       * The total units issued in the system.
       **/
      totalIssuance: AugmentedQuery<ApiType, () => Observable<Balance>, []>;
    };
    baseContracts: {
      /**
       * The subtrie counter.
       **/
      accountCounter: AugmentedQuery<ApiType, () => Observable<u64>, []>;
      /**
       * A mapping between an original code hash and instrumented wasm code, ready for execution.
       **/
      codeStorage: AugmentedQuery<
        ApiType,
        (arg: CodeHash | string | Uint8Array) => Observable<Option<PrefabWasmModule>>,
        [CodeHash]
      >;
      /**
       * The code associated with a given account.
       *
       * TWOX-NOTE: SAFE since `AccountId` is a secure hash.
       **/
      contractInfoOf: AugmentedQuery<
        ApiType,
        (arg: AccountId | string | Uint8Array) => Observable<Option<ContractInfo>>,
        [AccountId]
      >;
      /**
       * Current cost schedule for contracts.
       **/
      currentSchedule: AugmentedQuery<ApiType, () => Observable<Schedule>, []>;
      /**
       * A mapping from an original code hash to the original code, untouched by instrumentation.
       **/
      pristineCode: AugmentedQuery<
        ApiType,
        (arg: CodeHash | string | Uint8Array) => Observable<Option<Bytes>>,
        [CodeHash]
      >;
    };
    bridge: {
      /**
       * The admin key.
       **/
      admin: AugmentedQuery<ApiType, () => Observable<AccountId>, []>;
      /**
       * The maximum number of bridged POLYX per identity within a set interval of
       * blocks. Fields: POLYX amount and the block interval duration.
       **/
      bridgeLimit: AugmentedQuery<ApiType, () => Observable<ITuple<[Balance, BlockNumber]>>, []>;
      /**
       * Identities not constrained by the bridge limit.
       **/
      bridgeLimitExempted: AugmentedQuery<
        ApiType,
        (arg: IdentityId | string | Uint8Array) => Observable<bool>,
        [IdentityId]
      >;
      /**
       * Details of bridge transactions identified with pairs of the recipient account and the
       * bridge transaction nonce.
       **/
      bridgeTxDetails: AugmentedQueryDoubleMap<
        ApiType,
        (
          key1: AccountId | string | Uint8Array,
          key2: u32 | AnyNumber | Uint8Array
        ) => Observable<BridgeTxDetail>,
        [AccountId, u32]
      >;
      /**
       * The multisig account of the bridge controller. The genesis signers accept their
       * authorizations and are able to get their proposals delivered. The bridge creator
       * transfers some POLY to their identity.
       **/
      controller: AugmentedQuery<ApiType, () => Observable<AccountId>, []>;
      /**
       * Whether or not the bridge operation is frozen.
       **/
      frozen: AugmentedQuery<ApiType, () => Observable<bool>, []>;
      /**
       * Amount of POLYX bridged by the identity in last block interval. Fields: the bridged
       * amount and the last interval number.
       **/
      polyxBridged: AugmentedQuery<
        ApiType,
        (arg: IdentityId | string | Uint8Array) => Observable<ITuple<[Balance, BlockNumber]>>,
        [IdentityId]
      >;
      /**
       * Storage version.
       **/
      storageVersion: AugmentedQuery<ApiType, () => Observable<Version>, []>;
      /**
       * The bridge transaction timelock period, in blocks, since the acceptance of the
       * transaction proposal during which the admin key can freeze the transaction.
       **/
      timelock: AugmentedQuery<ApiType, () => Observable<BlockNumber>, []>;
    };
    capitalDistribution: {
      /**
       * All capital distributions, tied to their respective corporate actions (CAs).
       *
       * (CAId) => Distribution
       **/
      distributions: AugmentedQuery<
        ApiType,
        (
          arg: CAId | { ticker?: any; local_id?: any } | string | Uint8Array
        ) => Observable<Option<Distribution>>,
        [CAId]
      >;
      /**
       * Has an asset holder been paid yet?
       *
       * (CAId, DID) -> Was DID paid in the CAId?
       **/
      holderPaid: AugmentedQuery<
        ApiType,
        (
          arg:
            | ITuple<[CAId, IdentityId]>
            | [
                CAId | { ticker?: any; local_id?: any } | string | Uint8Array,
                IdentityId | string | Uint8Array
              ]
        ) => Observable<bool>,
        [ITuple<[CAId, IdentityId]>]
      >;
    };
    cddServiceProviders: {
      /**
       * The current "active" membership, stored as an ordered Vec.
       **/
      activeMembers: AugmentedQuery<ApiType, () => Observable<Vec<IdentityId>>, []>;
      /**
       * Limit of how many "active" members there can be.
       **/
      activeMembersLimit: AugmentedQuery<ApiType, () => Observable<u32>, []>;
      /**
       * The current "inactive" membership, stored as an ordered Vec.
       **/
      inactiveMembers: AugmentedQuery<ApiType, () => Observable<Vec<InactiveMember>>, []>;
    };
    checkpoint: {
      /**
       * Balance of a DID at a checkpoint.
       *
       * (ticker, did, checkpoint ID) -> Balance of a DID at a checkpoint
       **/
      balance: AugmentedQuery<
        ApiType,
        (
          arg:
            | ITuple<[Ticker, IdentityId, CheckpointId]>
            | [
                Ticker | string | Uint8Array,
                IdentityId | string | Uint8Array,
                CheckpointId | AnyNumber | Uint8Array
              ]
        ) => Observable<Balance>,
        [ITuple<[Ticker, IdentityId, CheckpointId]>]
      >;
      /**
       * Checkpoints where a DID's balance was updated.
       * (ticker, did) -> [checkpoint ID where user balance changed]
       **/
      balanceUpdates: AugmentedQuery<
        ApiType,
        (
          arg:
            | ITuple<[Ticker, IdentityId]>
            | [Ticker | string | Uint8Array, IdentityId | string | Uint8Array]
        ) => Observable<Vec<CheckpointId>>,
        [ITuple<[Ticker, IdentityId]>]
      >;
      /**
       * Checkpoints ID generator sequence.
       * ID of first checkpoint is 1 instead of 0.
       *
       * (ticker) -> no. of checkpoints
       **/
      checkpointIdSequence: AugmentedQuery<
        ApiType,
        (arg: Ticker | string | Uint8Array) => Observable<CheckpointId>,
        [Ticker]
      >;
      /**
       * Checkpoint schedule ID sequence for tickers.
       *
       * (ticker) -> schedule ID
       **/
      scheduleIdSequence: AugmentedQuery<
        ApiType,
        (arg: Ticker | string | Uint8Array) => Observable<ScheduleId>,
        [Ticker]
      >;
      /**
       * All the checkpoints a given schedule originated.
       *
       * (ticker, schedule ID) -> [checkpoint ID]
       **/
      schedulePoints: AugmentedQuery<
        ApiType,
        (
          arg:
            | ITuple<[Ticker, ScheduleId]>
            | [Ticker | string | Uint8Array, ScheduleId | AnyNumber | Uint8Array]
        ) => Observable<Vec<CheckpointId>>,
        [ITuple<[Ticker, ScheduleId]>]
      >;
      /**
       * Is the schedule removable?
       *
       * (ticker, schedule ID) -> removable?
       **/
      scheduleRemovable: AugmentedQuery<
        ApiType,
        (
          arg:
            | ITuple<[Ticker, ScheduleId]>
            | [Ticker | string | Uint8Array, ScheduleId | AnyNumber | Uint8Array]
        ) => Observable<bool>,
        [ITuple<[Ticker, ScheduleId]>]
      >;
      /**
       * Checkpoint schedules for tickers.
       *
       * (ticker) -> [schedule]
       **/
      schedules: AugmentedQuery<
        ApiType,
        (arg: Ticker | string | Uint8Array) => Observable<Vec<StoredSchedule>>,
        [Ticker]
      >;
      /**
       * The maximum complexity allowed for an arbitrary ticker's schedule set
       * (i.e. `Schedules` storage item below).
       **/
      schedulesMaxComplexity: AugmentedQuery<ApiType, () => Observable<u64>, []>;
      /**
       * Checkpoint timestamps.
       *
       * Every schedule-originated checkpoint maps its ID to its due time.
       * Every checkpoint manually created maps its ID to the time of recording.
       *
       * (checkpoint ID) -> checkpoint timestamp
       **/
      timestamps: AugmentedQuery<
        ApiType,
        (arg: CheckpointId | AnyNumber | Uint8Array) => Observable<Moment>,
        [CheckpointId]
      >;
      /**
       * Total supply of the token at the checkpoint.
       *
       * (ticker, checkpointId) -> total supply at given checkpoint
       **/
      totalSupply: AugmentedQuery<
        ApiType,
        (
          arg:
            | ITuple<[Ticker, CheckpointId]>
            | [Ticker | string | Uint8Array, CheckpointId | AnyNumber | Uint8Array]
        ) => Observable<Balance>,
        [ITuple<[Ticker, CheckpointId]>]
      >;
    };
    committeeMembership: {
      /**
       * The current "active" membership, stored as an ordered Vec.
       **/
      activeMembers: AugmentedQuery<ApiType, () => Observable<Vec<IdentityId>>, []>;
      /**
       * Limit of how many "active" members there can be.
       **/
      activeMembersLimit: AugmentedQuery<ApiType, () => Observable<u32>, []>;
      /**
       * The current "inactive" membership, stored as an ordered Vec.
       **/
      inactiveMembers: AugmentedQuery<ApiType, () => Observable<Vec<InactiveMember>>, []>;
    };
    complianceManager: {
      /**
       * Asset compliance for a ticker (Ticker -> AssetCompliance)
       **/
      assetCompliances: AugmentedQuery<
        ApiType,
        (arg: Ticker | string | Uint8Array) => Observable<AssetCompliance>,
        [Ticker]
      >;
      /**
       * Storage version.
       **/
      storageVersion: AugmentedQuery<ApiType, () => Observable<Version>, []>;
      /**
       * List of trusted claim issuer Ticker -> Issuer Identity
       **/
      trustedClaimIssuer: AugmentedQuery<
        ApiType,
        (arg: Ticker | string | Uint8Array) => Observable<Vec<TrustedIssuer>>,
        [Ticker]
      >;
    };
    confidential: {
      /**
       * Number of investor per asset.
       **/
      rangeProofs: AugmentedQueryDoubleMap<
        ApiType,
        (
          key1: IdentityId | string | Uint8Array,
          key2: ProverTickerKey | { prover?: any; ticker?: any } | string | Uint8Array
        ) => Observable<Option<TickerRangeProof>>,
        [IdentityId, ProverTickerKey]
      >;
      rangeProofVerifications: AugmentedQueryDoubleMap<
        ApiType,
        (
          key1:
            | ITuple<[IdentityId, Ticker]>
            | [IdentityId | string | Uint8Array, Ticker | string | Uint8Array],
          key2: IdentityId | string | Uint8Array
        ) => Observable<bool>,
        [ITuple<[IdentityId, Ticker]>, IdentityId]
      >;
    };
    contracts: {
      /**
       * Details of extension get updated.
       **/
      extensionInfo: AugmentedQuery<
        ApiType,
        (arg: AccountId | string | Uint8Array) => Observable<ExtensionAttributes>,
        [AccountId]
      >;
      /**
       * Nonce for the smart extension account id generation.
       * Using explicit nonce as in batch transaction accounts nonce doesn't get incremented.
       **/
      extensionNonce: AugmentedQuery<ApiType, () => Observable<u64>, []>;
      /**
       * Store the meta details of the smart extension template.
       **/
      metadataOfTemplate: AugmentedQuery<
        ApiType,
        (arg: CodeHash | string | Uint8Array) => Observable<TemplateMetadata>,
        [CodeHash]
      >;
      /**
       * Store the details of the template (Ex- owner, frozen etc).
       **/
      templateInfo: AugmentedQuery<
        ApiType,
        (arg: CodeHash | string | Uint8Array) => Observable<TemplateDetails>,
        [CodeHash]
      >;
    };
    corporateAction: {
      /**
       * A corporate action agent (CAA) of a ticker, if specified,
       * that may be different from the asset owner (AO).
       * If `None`, the AO is the CAA.
       *
       * The CAA may be distict from the AO because the CAA may require a money services license,
       * and the assets would need to originate from the CAA's identity, not the AO's identity.
       *
       * (ticker => did?)
       **/
      agent: AugmentedQuery<
        ApiType,
        (arg: Ticker | string | Uint8Array) => Observable<Option<IdentityId>>,
        [Ticker]
      >;
      /**
       * Associations from CAs to `Document`s via their IDs.
       * (CAId => [DocumentId])
       *
       * The `CorporateActions` map stores `Ticker => LocalId => The CA`,
       * so we can infer `Ticker => CAId`. Therefore, we don't need a double map.
       **/
      caDocLink: AugmentedQuery<
        ApiType,
        (
          arg: CAId | { ticker?: any; local_id?: any } | string | Uint8Array
        ) => Observable<Vec<DocumentId>>,
        [CAId]
      >;
      /**
       * The next per-`Ticker` CA ID in the sequence.
       * The full ID is defined as a combination of `Ticker` and a number in this sequence.
       **/
      caIdSequence: AugmentedQuery<
        ApiType,
        (arg: Ticker | string | Uint8Array) => Observable<LocalCAId>,
        [Ticker]
      >;
      /**
       * All recorded CAs thus far.
       * Only generic information is stored here.
       * Specific `CAKind`s, e.g., benefits and corporate ballots, may use additional on-chain storage.
       *
       * (ticker => local ID => the corporate action)
       **/
      corporateActions: AugmentedQueryDoubleMap<
        ApiType,
        (
          key1: Ticker | string | Uint8Array,
          key2: LocalCAId | AnyNumber | Uint8Array
        ) => Observable<Option<CorporateAction>>,
        [Ticker, LocalCAId]
      >;
      /**
       * The identities targeted by default for CAs for this ticker,
       * either to be excluded or included.
       *
       * (ticker => target identities)
       **/
      defaultTargetIdentities: AugmentedQuery<
        ApiType,
        (arg: Ticker | string | Uint8Array) => Observable<TargetIdentities>,
        [Ticker]
      >;
      /**
       * The default amount of tax to withhold ("withholding tax", WT) for this ticker when distributing dividends.
       *
       * To understand withholding tax, e.g., let's assume that you hold ACME shares.
       * ACME now decides to distribute 100 SEK to Alice.
       * Alice lives in Sweden, so Skatteverket (the Swedish tax authority) wants 30% of that.
       * Then those 100 * 30% are withheld from Alice, and ACME will send them to Skatteverket.
       *
       * (ticker => % to withhold)
       **/
      defaultWithholdingTax: AugmentedQuery<
        ApiType,
        (arg: Ticker | string | Uint8Array) => Observable<Tax>,
        [Ticker]
      >;
      /**
       * The amount of tax to withhold ("withholding tax", WT) for a certain ticker x DID.
       * If an entry exists for a certain DID, it overrides the default in `DefaultWithholdingTax`.
       *
       * (ticker => [(did, % to withhold)]
       **/
      didWithholdingTax: AugmentedQuery<
        ApiType,
        (arg: Ticker | string | Uint8Array) => Observable<Vec<ITuple<[IdentityId, Tax]>>>,
        [Ticker]
      >;
      /**
       * Determines the maximum number of bytes that the free-form `details` of a CA can store.
       *
       * Note that this is not the number of `char`s or the number of [graphemes].
       * While this may be unnatural in terms of human understanding of a text's length,
       * it more closely reflects actual storage costs (`'a'` is cheaper to store than an emoji).
       *
       * [graphemes]: https://en.wikipedia.org/wiki/Grapheme
       **/
      maxDetailsLength: AugmentedQuery<ApiType, () => Observable<u32>, []>;
    };
    corporateBallot: {
      /**
       * Metadata of a corporate ballot.
       *
       * (CAId) => BallotMeta
       **/
      metas: AugmentedQuery<
        ApiType,
        (
          arg: CAId | { ticker?: any; local_id?: any } | string | Uint8Array
        ) => Observable<Option<BallotMeta>>,
        [CAId]
      >;
      /**
       * Stores how many choices there are in each motion.
       *
       * At all times, the invariant holds that `motion_choices[idx]` is equal to
       * `metas.unwrap().motions[idx].choices.len()`. That is, this is just a cache,
       * used to avoid fetching all the motions with their associated texts.
       *
       * `u16` choices should be more than enough to fit real use cases.
       *
       * (CAId) => Number of choices in each motion.
       **/
      motionNumChoices: AugmentedQuery<
        ApiType,
        (
          arg: CAId | { ticker?: any; local_id?: any } | string | Uint8Array
        ) => Observable<Vec<u16>>,
        [CAId]
      >;
      /**
       * Is ranked choice voting (RCV) enabled for this ballot?
       * For an understanding of how RCV is handled, see note on `BallotVote`'s `fallback` field.
       *
       * (CAId) => bool
       **/
      rcv: AugmentedQuery<
        ApiType,
        (arg: CAId | { ticker?: any; local_id?: any } | string | Uint8Array) => Observable<bool>,
        [CAId]
      >;
      /**
       * Stores the total vote tally on each choice.
       *
       * RCV is not accounted for,
       * as there are too many wants to interpret the graph,
       * and because it would not be efficient.
       *
       * (CAId) => [current vote weights]
       **/
      results: AugmentedQuery<
        ApiType,
        (
          arg: CAId | { ticker?: any; local_id?: any } | string | Uint8Array
        ) => Observable<Vec<Balance>>,
        [CAId]
      >;
      /**
       * Time details of a corporate ballot associated with a CA.
       * The timestamps denote when voting starts and stops.
       *
       * (CAId) => BallotTimeRange
       **/
      timeRanges: AugmentedQuery<
        ApiType,
        (
          arg: CAId | { ticker?: any; local_id?: any } | string | Uint8Array
        ) => Observable<Option<BallotTimeRange>>,
        [CAId]
      >;
      /**
       * Stores each DID's votes in a given ballot.
       * See the documentation of `BallotVote` for notes on semantics.
       *
       * (CAId) => (DID) => [vote weight]
       *
       * User must enter 0 vote weight if they don't want to vote for a choice.
       **/
      votes: AugmentedQueryDoubleMap<
        ApiType,
        (
          key1: CAId | { ticker?: any; local_id?: any } | string | Uint8Array,
          key2: IdentityId | string | Uint8Array
        ) => Observable<Vec<BallotVote>>,
        [CAId, IdentityId]
      >;
    };
    grandpa: {
      /**
       * The number of changes (both in terms of keys and underlying economic responsibilities)
       * in the "set" of Grandpa validators from genesis.
       **/
      currentSetId: AugmentedQuery<ApiType, () => Observable<SetId>, []>;
      /**
       * next block number where we can force a change.
       **/
      nextForced: AugmentedQuery<ApiType, () => Observable<Option<BlockNumber>>, []>;
      /**
       * Pending change: (signaled at, scheduled change).
       **/
      pendingChange: AugmentedQuery<ApiType, () => Observable<Option<StoredPendingChange>>, []>;
      /**
       * A mapping from grandpa set ID to the index of the *most recent* session for which its
       * members were responsible.
       *
       * TWOX-NOTE: `SetId` is not under user control.
       **/
      setIdSession: AugmentedQuery<
        ApiType,
        (arg: SetId | AnyNumber | Uint8Array) => Observable<Option<SessionIndex>>,
        [SetId]
      >;
      /**
       * `true` if we are currently stalled.
       **/
      stalled: AugmentedQuery<
        ApiType,
        () => Observable<Option<ITuple<[BlockNumber, BlockNumber]>>>,
        []
      >;
      /**
       * State of the current authority set.
       **/
      state: AugmentedQuery<ApiType, () => Observable<StoredState>, []>;
    };
    identity: {
      /**
       * All authorizations that an identity/key has
       **/
      authorizations: AugmentedQueryDoubleMap<
        ApiType,
        (
          key1: Signatory | { Identity: any } | { Account: any } | string | Uint8Array,
          key2: u64 | AnyNumber | Uint8Array
        ) => Observable<Authorization>,
        [Signatory, u64]
      >;
      /**
       * All authorizations that an identity has given. (Authorizer, auth_id -> authorized)
       **/
      authorizationsGiven: AugmentedQueryDoubleMap<
        ApiType,
        (
          key1: IdentityId | string | Uint8Array,
          key2: u64 | AnyNumber | Uint8Array
        ) => Observable<Signatory>,
        [IdentityId, u64]
      >;
      /**
       * Obsoleted storage variable superceded by `CddAuthForPrimaryKeyRotation`. It is kept here
       * for the purpose of storage migration.
       **/
      cddAuthForMasterKeyRotation: AugmentedQuery<ApiType, () => Observable<bool>, []>;
      /**
       * A config flag that, if set, instructs an authorization from a CDD provider in order to
       * change the primary key of an identity.
       **/
      cddAuthForPrimaryKeyRotation: AugmentedQuery<ApiType, () => Observable<bool>, []>;
      /**
       * (Target ID, claim type) (issuer,scope) -> Associated claims
       **/
      claims: AugmentedQueryDoubleMap<
        ApiType,
        (
          key1: Claim1stKey | { target?: any; claim_type?: any } | string | Uint8Array,
          key2: Claim2ndKey | { issuer?: any; scope?: any } | string | Uint8Array
        ) => Observable<IdentityClaim>,
        [Claim1stKey, Claim2ndKey]
      >;
      /**
       * It stores the current identity for current transaction.
       **/
      currentDid: AugmentedQuery<ApiType, () => Observable<Option<IdentityId>>, []>;
      /**
       * It stores the current gas fee payer for the current transaction
       **/
      currentPayer: AugmentedQuery<ApiType, () => Observable<Option<AccountId>>, []>;
      /**
       * DID -> identity info
       **/
      didRecords: AugmentedQuery<
        ApiType,
        (arg: IdentityId | string | Uint8Array) => Observable<DidRecord>,
        [IdentityId]
      >;
      /**
       * DID -> bool that indicates if secondary keys are frozen.
       **/
      isDidFrozen: AugmentedQuery<
        ApiType,
        (arg: IdentityId | string | Uint8Array) => Observable<bool>,
        [IdentityId]
      >;
      keyToIdentityIds: AugmentedQuery<
        ApiType,
        (arg: AccountId | string | Uint8Array) => Observable<IdentityId>,
        [AccountId]
      >;
      /**
       * Nonce to ensure unique actions. starts from 1.
       **/
      multiPurposeNonce: AugmentedQuery<ApiType, () => Observable<u64>, []>;
      /**
       * Authorization nonce per Identity. Initially is 0.
       **/
      offChainAuthorizationNonce: AugmentedQuery<
        ApiType,
        (arg: IdentityId | string | Uint8Array) => Observable<AuthorizationNonce>,
        [IdentityId]
      >;
      /**
       * Inmediate revoke of any off-chain authorization.
       **/
      revokeOffChainAuthorization: AugmentedQuery<
        ApiType,
        (
          arg:
            | ITuple<[Signatory, TargetIdAuthorization]>
            | [
                Signatory | { Identity: any } | { Account: any } | string | Uint8Array,
                (
                  | TargetIdAuthorization
                  | { target_id?: any; nonce?: any; expires_at?: any }
                  | string
                  | Uint8Array
                )
              ]
        ) => Observable<bool>,
        [ITuple<[Signatory, TargetIdAuthorization]>]
      >;
      /**
       * Storage version.
       **/
      storageVersion: AugmentedQuery<ApiType, () => Observable<Version>, []>;
    };
    imOnline: {
      /**
       * For each session index, we keep a mapping of `T::ValidatorId` to the
       * number of blocks authored by the given authority.
       **/
      authoredBlocks: AugmentedQueryDoubleMap<
        ApiType,
        (
          key1: SessionIndex | AnyNumber | Uint8Array,
          key2: ValidatorId | string | Uint8Array
        ) => Observable<u32>,
        [SessionIndex, ValidatorId]
      >;
      /**
       * The block number after which it's ok to send heartbeats in current session.
       *
       * At the beginning of each session we set this to a value that should
       * fall roughly in the middle of the session duration.
       * The idea is to first wait for the validators to produce a block
       * in the current session, so that the heartbeat later on will not be necessary.
       **/
      heartbeatAfter: AugmentedQuery<ApiType, () => Observable<BlockNumber>, []>;
      /**
       * The current set of keys that may issue a heartbeat.
       **/
      keys: AugmentedQuery<ApiType, () => Observable<Vec<AuthorityId>>, []>;
      /**
       * For each session index, we keep a mapping of `AuthIndex`
       * to `offchain::OpaqueNetworkState`.
       **/
      receivedHeartbeats: AugmentedQueryDoubleMap<
        ApiType,
        (
          key1: SessionIndex | AnyNumber | Uint8Array,
          key2: AuthIndex | AnyNumber | Uint8Array
        ) => Observable<Option<Bytes>>,
        [SessionIndex, AuthIndex]
      >;
      /**
       * Config parameters for slash fraction
       **/
      slashingParams: AugmentedQuery<ApiType, () => Observable<OfflineSlashingParams>, []>;
    };
    indices: {
      /**
       * The lookup from index to account.
       **/
      accounts: AugmentedQuery<
        ApiType,
        (
          arg: AccountIndex | AnyNumber | Uint8Array
        ) => Observable<Option<ITuple<[AccountId, BalanceOf, bool]>>>,
        [AccountIndex]
      >;
    };
    multiSig: {
      /**
       * Maps a multisig secondary key to a multisig address.
       **/
      keyToMultiSig: AugmentedQuery<
        ApiType,
        (arg: AccountId | string | Uint8Array) => Observable<AccountId>,
        [AccountId]
      >;
      /**
       * Nonce to ensure unique MultiSig addresses are generated; starts from 1.
       **/
      multiSigNonce: AugmentedQuery<ApiType, () => Observable<u64>, []>;
      /**
       * Signers of a multisig. (multisig, signer) => signer.
       **/
      multiSigSigners: AugmentedQueryDoubleMap<
        ApiType,
        (
          key1: AccountId | string | Uint8Array,
          key2: Signatory | { Identity: any } | { Account: any } | string | Uint8Array
        ) => Observable<Signatory>,
        [AccountId, Signatory]
      >;
      /**
       * Confirmations required before processing a multisig tx.
       **/
      multiSigSignsRequired: AugmentedQuery<
        ApiType,
        (arg: AccountId | string | Uint8Array) => Observable<u64>,
        [AccountId]
      >;
      /**
       * Maps a multisig account to its identity.
       **/
      multiSigToIdentity: AugmentedQuery<
        ApiType,
        (arg: AccountId | string | Uint8Array) => Observable<IdentityId>,
        [AccountId]
      >;
      /**
       * Number of transactions proposed in a multisig. Used as tx id; starts from 0.
       **/
      multiSigTxDone: AugmentedQuery<
        ApiType,
        (arg: AccountId | string | Uint8Array) => Observable<u64>,
        [AccountId]
      >;
      /**
       * Number of approved/accepted signers of a multisig.
       **/
      numberOfSigners: AugmentedQuery<
        ApiType,
        (arg: AccountId | string | Uint8Array) => Observable<u64>,
        [AccountId]
      >;
      /**
       * Details of a multisig proposal
       **/
      proposalDetail: AugmentedQuery<
        ApiType,
        (
          arg:
            | ITuple<[AccountId, u64]>
            | [AccountId | string | Uint8Array, u64 | AnyNumber | Uint8Array]
        ) => Observable<ProposalDetails>,
        [ITuple<[AccountId, u64]>]
      >;
      /**
       * A mapping of proposals to their IDs.
       **/
      proposalIds: AugmentedQueryDoubleMap<
        ApiType,
        (
          key1: AccountId | string | Uint8Array,
          key2: Proposal | { callIndex?: any; args?: any } | string | Uint8Array
        ) => Observable<Option<u64>>,
        [AccountId, Proposal]
      >;
      /**
       * Proposals presented for voting to a multisig (multisig, proposal id) => Option<T::Proposal>.
       **/
      proposals: AugmentedQuery<
        ApiType,
        (
          arg:
            | ITuple<[AccountId, u64]>
            | [AccountId | string | Uint8Array, u64 | AnyNumber | Uint8Array]
        ) => Observable<Option<Proposal>>,
        [ITuple<[AccountId, u64]>]
      >;
      /**
       * The last transaction version, used for `on_runtime_upgrade`.
       **/
      transactionVersion: AugmentedQuery<ApiType, () => Observable<u32>, []>;
      /**
       * Individual multisig signer votes. (multi sig, signer, proposal) => vote.
       **/
      votes: AugmentedQuery<
        ApiType,
        (
          arg:
            | ITuple<[AccountId, Signatory, u64]>
            | [
                AccountId | string | Uint8Array,
                Signatory | { Identity: any } | { Account: any } | string | Uint8Array,
                u64 | AnyNumber | Uint8Array
              ]
        ) => Observable<bool>,
        [ITuple<[AccountId, Signatory, u64]>]
      >;
    };
    offences: {
      /**
       * A vector of reports of the same kind that happened at the same time slot.
       **/
      concurrentReportsIndex: AugmentedQueryDoubleMap<
        ApiType,
        (
          key1: Kind | string | Uint8Array,
          key2: OpaqueTimeSlot | string | Uint8Array
        ) => Observable<Vec<ReportIdOf>>,
        [Kind, OpaqueTimeSlot]
      >;
      /**
       * Deferred reports that have been rejected by the offence handler and need to be submitted
       * at a later time.
       **/
      deferredOffences: AugmentedQuery<ApiType, () => Observable<Vec<DeferredOffenceOf>>, []>;
      /**
       * The primary structure that holds all offence records keyed by report identifiers.
       **/
      reports: AugmentedQuery<
        ApiType,
        (arg: ReportIdOf | string | Uint8Array) => Observable<Option<OffenceDetails>>,
        [ReportIdOf]
      >;
      /**
       * Enumerates all reports of a kind along with the time they happened.
       *
       * All reports are sorted by the time of offence.
       *
       * Note that the actual type of this mapping is `Vec<u8>`, this is because values of
       * different types are not supported at the moment so we are doing the manual serialization.
       **/
      reportsByKindIndex: AugmentedQuery<
        ApiType,
        (arg: Kind | string | Uint8Array) => Observable<Bytes>,
        [Kind]
      >;
    };
    permissions: {
      /**
       * The name of the current function (aka extrinsic).
       **/
      currentDispatchableName: AugmentedQuery<ApiType, () => Observable<DispatchableName>, []>;
      /**
       * The name of the current pallet (aka module name).
       **/
      currentPalletName: AugmentedQuery<ApiType, () => Observable<PalletName>, []>;
    };
    pips: {
      /**
       * Total count of current pending or scheduled PIPs.
       **/
      activePipCount: AugmentedQuery<ApiType, () => Observable<u32>, []>;
      /**
       * The maximum allowed number for `ActivePipCount`.
       * Once reached, new PIPs cannot be proposed by community members.
       **/
      activePipLimit: AugmentedQuery<ApiType, () => Observable<u32>, []>;
      /**
       * All existing PIPs where the proposer is a committee.
       * This list is a cache of all ids in `Proposals` with `Proposer::Committee(_)`.
       **/
      committeePips: AugmentedQuery<ApiType, () => Observable<Vec<PipId>>, []>;
      /**
       * Default enactment period that will be use after a proposal is accepted by GC.
       **/
      defaultEnactmentPeriod: AugmentedQuery<ApiType, () => Observable<BlockNumber>, []>;
      /**
       * Those who have locked a deposit.
       * proposal (id, proposer) -> deposit
       **/
      deposits: AugmentedQueryDoubleMap<
        ApiType,
        (
          key1: PipId | AnyNumber | Uint8Array,
          key2: AccountId | string | Uint8Array
        ) => Observable<DepositInfo>,
        [PipId, AccountId]
      >;
      /**
       * A live priority queue (lowest priority at index 0)
       * of pending PIPs up to the active limit.
       * Priority is defined by the `weight` in the `SnapshottedPip`.
       *
       * Unlike `SnapshotQueue`, this queue is live, getting updated with each vote cast.
       * The snapshot is therefore essentially a point-in-time clone of this queue.
       **/
      liveQueue: AugmentedQuery<ApiType, () => Observable<Vec<SnapshottedPip>>, []>;
      /**
       * Maximum times a PIP can be skipped before triggering `CannotSkipPip` in `enact_snapshot_results`.
       **/
      maxPipSkipCount: AugmentedQuery<ApiType, () => Observable<SkippedCount>, []>;
      /**
       * The minimum amount to be used as a deposit for community PIP creation.
       **/
      minimumProposalDeposit: AugmentedQuery<ApiType, () => Observable<BalanceOf>, []>;
      /**
       * How many blocks will it take, after a `Pending` PIP expires,
       * assuming it has not transitioned to another `ProposalState`?
       **/
      pendingPipExpiry: AugmentedQuery<ApiType, () => Observable<MaybeBlock>, []>;
      /**
       * Proposals so far. id can be used to keep track of PIPs off-chain.
       **/
      pipIdSequence: AugmentedQuery<ApiType, () => Observable<u32>, []>;
      /**
       * The number of times a certain PIP has been skipped.
       * Once a (configurable) threshhold is exceeded, a PIP cannot be skipped again.
       **/
      pipSkipCount: AugmentedQuery<
        ApiType,
        (arg: PipId | AnyNumber | Uint8Array) => Observable<SkippedCount>,
        [PipId]
      >;
      /**
       * Maps PIPs to the block at which they will be executed, if any.
       **/
      pipToSchedule: AugmentedQuery<
        ApiType,
        (arg: PipId | AnyNumber | Uint8Array) => Observable<Option<BlockNumber>>,
        [PipId]
      >;
      /**
       * The metadata of the active proposals.
       **/
      proposalMetadata: AugmentedQuery<
        ApiType,
        (arg: PipId | AnyNumber | Uint8Array) => Observable<Option<PipsMetadata>>,
        [PipId]
      >;
      /**
       * PolymeshVotes on a given proposal, if it is ongoing.
       * proposal id -> vote count
       **/
      proposalResult: AugmentedQuery<
        ApiType,
        (arg: PipId | AnyNumber | Uint8Array) => Observable<VotingResult>,
        [PipId]
      >;
      /**
       * Actual proposal for a given id, if it's current.
       * proposal id -> proposal
       **/
      proposals: AugmentedQuery<
        ApiType,
        (arg: PipId | AnyNumber | Uint8Array) => Observable<Option<Pip>>,
        [PipId]
      >;
      /**
       * Votes per Proposal and account. Used to avoid double vote issue.
       * (proposal id, account) -> Vote
       **/
      proposalVotes: AugmentedQueryDoubleMap<
        ApiType,
        (
          key1: PipId | AnyNumber | Uint8Array,
          key2: AccountId | string | Uint8Array
        ) => Observable<Option<Vote>>,
        [PipId, AccountId]
      >;
      /**
       * Determines whether historical PIP data is persisted or removed
       **/
      pruneHistoricalPips: AugmentedQuery<ApiType, () => Observable<bool>, []>;
      /**
       * Snapshots so far. id can be used to keep track of snapshots off-chain.
       **/
      snapshotIdSequence: AugmentedQuery<ApiType, () => Observable<u32>, []>;
      /**
       * The metadata of the snapshot, if there is one.
       **/
      snapshotMeta: AugmentedQuery<ApiType, () => Observable<Option<SnapshotMetadata>>, []>;
      /**
       * The priority queue (lowest priority at index 0) of PIPs at the point of snapshotting.
       * Priority is defined by the `weight` in the `SnapshottedPip`.
       *
       * A queued PIP can be skipped. Doing so bumps the `pip_skip_count`.
       * Once a (configurable) threshhold is exceeded, a PIP cannot be skipped again.
       **/
      snapshotQueue: AugmentedQuery<ApiType, () => Observable<Vec<SnapshottedPip>>, []>;
    };
    polymeshCommittee: {
      /**
       * Time after which a proposal will expire.
       **/
      expiresAfter: AugmentedQuery<ApiType, () => Observable<MaybeBlock>, []>;
      /**
       * The current members of the committee.
       **/
      members: AugmentedQuery<ApiType, () => Observable<Vec<IdentityId>>, []>;
      /**
       * Proposals so far.
       **/
      proposalCount: AugmentedQuery<ApiType, () => Observable<u32>, []>;
      /**
       * Actual proposal for a given hash.
       **/
      proposalOf: AugmentedQuery<
        ApiType,
        (arg: Hash | string | Uint8Array) => Observable<Option<Proposal>>,
        [Hash]
      >;
      /**
       * The hashes of the active proposals.
       **/
      proposals: AugmentedQuery<ApiType, () => Observable<Vec<Hash>>, []>;
      /**
       * Release coordinator.
       **/
      releaseCoordinator: AugmentedQuery<ApiType, () => Observable<Option<IdentityId>>, []>;
      /**
       * Vote threshold for an approval.
       **/
      voteThreshold: AugmentedQuery<ApiType, () => Observable<ITuple<[u32, u32]>>, []>;
      /**
       * PolymeshVotes on a given proposal, if it is ongoing.
       **/
      voting: AugmentedQuery<
        ApiType,
        (arg: Hash | string | Uint8Array) => Observable<Option<PolymeshVotes>>,
        [Hash]
      >;
    };
    portfolio: {
      /**
       * The next portfolio sequence number of an identity.
       **/
      nextPortfolioNumber: AugmentedQuery<
        ApiType,
        (arg: IdentityId | string | Uint8Array) => Observable<PortfolioNumber>,
        [IdentityId]
      >;
      /**
       * The asset balances of portfolios.
       **/
      portfolioAssetBalances: AugmentedQueryDoubleMap<
        ApiType,
        (
          key1: PortfolioId | { did?: any; kind?: any } | string | Uint8Array,
          key2: Ticker | string | Uint8Array
        ) => Observable<Balance>,
        [PortfolioId, Ticker]
      >;
      /**
       * The custodian of a particular portfolio. None implies that the identity owner is the custodian.
       **/
      portfolioCustodian: AugmentedQuery<
        ApiType,
        (
          arg: PortfolioId | { did?: any; kind?: any } | string | Uint8Array
        ) => Observable<Option<IdentityId>>,
        [PortfolioId]
      >;
      /**
       * Amount of assets locked in a portfolio.
       * These assets show up in portfolio balance but can not be transferred away.
       **/
      portfolioLockedAssets: AugmentedQueryDoubleMap<
        ApiType,
        (
          key1: PortfolioId | { did?: any; kind?: any } | string | Uint8Array,
          key2: Ticker | string | Uint8Array
        ) => Observable<Balance>,
        [PortfolioId, Ticker]
      >;
      /**
       * The set of existing portfolios with their names. If a certain pair of a DID and
       * portfolio number maps to `None` then such a portfolio doesn't exist. Conversely, if a
       * pair maps to `Some(name)` then such a portfolio exists and is called `name`.
       **/
      portfolios: AugmentedQueryDoubleMap<
        ApiType,
        (
          key1: IdentityId | string | Uint8Array,
          key2: PortfolioNumber | AnyNumber | Uint8Array
        ) => Observable<PortfolioName>,
        [IdentityId, PortfolioNumber]
      >;
      /**
       * Tracks all the portfolios in custody of a particular identity. Only used by the UIs.
       * When `true` is stored as the value for a given `(did, pid)`, it means that `pid` is in custody of `did`.
       * `false` values are never explicitly stored in the map, and are instead inferred by the absence of a key.
       **/
      portfoliosInCustody: AugmentedQueryDoubleMap<
        ApiType,
        (
          key1: IdentityId | string | Uint8Array,
          key2: PortfolioId | { did?: any; kind?: any } | string | Uint8Array
        ) => Observable<bool>,
        [IdentityId, PortfolioId]
      >;
      /**
       * Storage version.
       **/
      storageVersion: AugmentedQuery<ApiType, () => Observable<Version>, []>;
    };
    protocolFee: {
      /**
       * The mapping of operation names to the base fees of those operations.
       **/
      baseFees: AugmentedQuery<
        ApiType,
        (
          arg:
            | ProtocolOp
            | 'AssetRegisterTicker'
            | 'AssetIssue'
            | 'AssetAddDocument'
            | 'AssetCreateAsset'
            | 'AssetCreateCheckpointSchedule'
            | 'DividendNew'
            | 'ComplianceManagerAddComplianceRequirement'
            | 'IdentityRegisterDid'
            | 'IdentityCddRegisterDid'
            | 'IdentityAddClaim'
            | 'IdentitySetPrimaryKey'
            | 'IdentityAddSecondaryKeysWithAuthorization'
            | 'PipsPropose'
            | 'VotingAddBallot'
            | 'ContractsPutCode'
            | 'BallotAttachBallot'
            | 'DistributionDistribute'
            | number
            | Uint8Array
        ) => Observable<BalanceOf>,
        [ProtocolOp]
      >;
      /**
       * The fee coefficient as a positive rational (numerator, denominator).
       **/
      coefficient: AugmentedQuery<ApiType, () => Observable<PosRatio>, []>;
    };
    randomnessCollectiveFlip: {
      /**
       * Series of block headers from the last 81 blocks that acts as random seed material. This
       * is arranged as a ring buffer with `block_number % 81` being the index into the `Vec` of
       * the oldest hash.
       **/
      randomMaterial: AugmentedQuery<ApiType, () => Observable<Vec<Hash>>, []>;
    };
    scheduler: {
      /**
       * Items to be executed, indexed by the block number that they should be executed on.
       **/
      agenda: AugmentedQuery<
        ApiType,
        (arg: BlockNumber | AnyNumber | Uint8Array) => Observable<Vec<Option<Scheduled>>>,
        [BlockNumber]
      >;
      /**
       * Lookup from identity to the block number and index of the task.
       **/
      lookup: AugmentedQuery<
        ApiType,
        (arg: Bytes | string | Uint8Array) => Observable<Option<TaskAddress>>,
        [Bytes]
      >;
      /**
       * Storage version of the pallet.
       *
       * New networks start with last version.
       **/
      storageVersion: AugmentedQuery<ApiType, () => Observable<Releases>, []>;
    };
    session: {
      /**
       * Current index of the session.
       **/
      currentIndex: AugmentedQuery<ApiType, () => Observable<SessionIndex>, []>;
      /**
       * Indices of disabled validators.
       *
       * The set is cleared when `on_session_ending` returns a new set of identities.
       **/
      disabledValidators: AugmentedQuery<ApiType, () => Observable<Vec<u32>>, []>;
      /**
       * The owner of a key. The key is the `KeyTypeId` + the encoded key.
       **/
      keyOwner: AugmentedQuery<
        ApiType,
        (
          arg:
            | ITuple<[KeyTypeId, Bytes]>
            | [KeyTypeId | AnyNumber | Uint8Array, Bytes | string | Uint8Array]
        ) => Observable<Option<ValidatorId>>,
        [ITuple<[KeyTypeId, Bytes]>]
      >;
      /**
       * The next session keys for a validator.
       **/
      nextKeys: AugmentedQuery<
        ApiType,
        (arg: ValidatorId | string | Uint8Array) => Observable<Option<Keys>>,
        [ValidatorId]
      >;
      /**
       * True if the underlying economic identities or weighting behind the validators
       * has changed in the queued validator set.
       **/
      queuedChanged: AugmentedQuery<ApiType, () => Observable<bool>, []>;
      /**
       * The queued keys for the next session. When the next session begins, these keys
       * will be used to determine the validator's session keys.
       **/
      queuedKeys: AugmentedQuery<ApiType, () => Observable<Vec<ITuple<[ValidatorId, Keys]>>>, []>;
      /**
       * The current set of validators.
       **/
      validators: AugmentedQuery<ApiType, () => Observable<Vec<ValidatorId>>, []>;
    };
    settlement: {
      /**
       * Tracks affirmations received for an instruction. (instruction_id, counter_party) -> AffirmationStatus
       **/
      affirmsReceived: AugmentedQueryDoubleMap<
        ApiType,
        (
          key1: u64 | AnyNumber | Uint8Array,
          key2: PortfolioId | { did?: any; kind?: any } | string | Uint8Array
        ) => Observable<AffirmationStatus>,
        [u64, PortfolioId]
      >;
      /**
       * Number of affirmations pending before instruction is executed. instruction_id -> affirm_pending
       **/
      instructionAffirmsPending: AugmentedQuery<
        ApiType,
        (arg: u64 | AnyNumber | Uint8Array) => Observable<u64>,
        [u64]
      >;
      /**
       * Number of instructions in the system (It's one more than the actual number)
       **/
      instructionCounter: AugmentedQuery<ApiType, () => Observable<u64>, []>;
      /**
       * Details about an instruction. instruction_id -> instruction_details
       **/
      instructionDetails: AugmentedQuery<
        ApiType,
        (arg: u64 | AnyNumber | Uint8Array) => Observable<Instruction>,
        [u64]
      >;
      /**
       * Legs under an instruction. (instruction_id, leg_id) -> Leg
       **/
      instructionLegs: AugmentedQueryDoubleMap<
        ApiType,
        (key1: u64 | AnyNumber | Uint8Array, key2: u64 | AnyNumber | Uint8Array) => Observable<Leg>,
        [u64, u64]
      >;
      /**
       * Status of a leg under an instruction. (instruction_id, leg_id) -> LegStatus
       **/
      instructionLegStatus: AugmentedQueryDoubleMap<
        ApiType,
        (
          key1: u64 | AnyNumber | Uint8Array,
          key2: u64 | AnyNumber | Uint8Array
        ) => Observable<LegStatus>,
        [u64, u64]
      >;
      /**
       * Tracks redemption of receipts. (signer, receipt_uid) -> receipt_used
       **/
      receiptsUsed: AugmentedQueryDoubleMap<
        ApiType,
        (
          key1: AccountId | string | Uint8Array,
          key2: u64 | AnyNumber | Uint8Array
        ) => Observable<bool>,
        [AccountId, u64]
      >;
      /**
       * Storage version.
       **/
      storageVersion: AugmentedQuery<ApiType, () => Observable<Version>, []>;
      /**
       * Helps a user track their pending instructions and affirmations (only needed for UI).
       * (counter_party, instruction_id) -> AffirmationStatus
       **/
      userAffirmations: AugmentedQueryDoubleMap<
        ApiType,
        (
          key1: PortfolioId | { did?: any; kind?: any } | string | Uint8Array,
          key2: u64 | AnyNumber | Uint8Array
        ) => Observable<AffirmationStatus>,
        [PortfolioId, u64]
      >;
      /**
       * Array of venues created by an identity. Only needed for the UI. IdentityId -> Vec<venue_id>
       **/
      userVenues: AugmentedQuery<
        ApiType,
        (arg: IdentityId | string | Uint8Array) => Observable<Vec<u64>>,
        [IdentityId]
      >;
      /**
       * Venues that are allowed to create instructions involving a particular ticker. Oly used if filtering is enabled.
       * (ticker, venue_id) -> allowed
       **/
      venueAllowList: AugmentedQueryDoubleMap<
        ApiType,
        (
          key1: Ticker | string | Uint8Array,
          key2: u64 | AnyNumber | Uint8Array
        ) => Observable<bool>,
        [Ticker, u64]
      >;
      /**
       * Number of venues in the system (It's one more than the actual number)
       **/
      venueCounter: AugmentedQuery<ApiType, () => Observable<u64>, []>;
      /**
       * Tracks if a token has enabled filtering venues that can create instructions involving their token. Ticker -> filtering_enabled
       **/
      venueFiltering: AugmentedQuery<
        ApiType,
        (arg: Ticker | string | Uint8Array) => Observable<bool>,
        [Ticker]
      >;
      /**
       * Info about a venue. venue_id -> venue_details
       **/
      venueInfo: AugmentedQuery<
        ApiType,
        (arg: u64 | AnyNumber | Uint8Array) => Observable<Option<Venue>>,
        [u64]
      >;
      /**
       * Signers allowed by the venue. (venue_id, signer) -> bool
       **/
      venueSigners: AugmentedQueryDoubleMap<
        ApiType,
        (
          key1: u64 | AnyNumber | Uint8Array,
          key2: AccountId | string | Uint8Array
        ) => Observable<bool>,
        [u64, AccountId]
      >;
    };
    staking: {
      /**
       * The active era information, it holds index and start.
       *
       * The active era is the era currently rewarded.
       * Validator set of this era must be equal to `SessionInterface::validators`.
       **/
      activeEra: AugmentedQuery<ApiType, () => Observable<Option<ActiveEraInfo>>, []>;
      /**
       * Map from all locked "stash" accounts to the controller account.
       **/
      bonded: AugmentedQuery<
        ApiType,
        (arg: AccountId | string | Uint8Array) => Observable<Option<AccountId>>,
        [AccountId]
      >;
      /**
       * A mapping from still-bonded eras to the first session index of that era.
       *
       * Must contains information for eras for the range:
       * `[active_era - bounding_duration; active_era]`
       **/
      bondedEras: AugmentedQuery<
        ApiType,
        () => Observable<Vec<ITuple<[EraIndex, SessionIndex]>>>,
        []
      >;
      /**
       * The amount of currency given to reporters of a slash event which was
       * canceled by extraordinary circumstances (e.g. governance).
       **/
      canceledSlashPayout: AugmentedQuery<ApiType, () => Observable<BalanceOf>, []>;
      /**
       * The current era index.
       *
       * This is the latest planned era, depending on how the Session pallet queues the validator
       * set, it might be active or not.
       **/
      currentEra: AugmentedQuery<ApiType, () => Observable<Option<EraIndex>>, []>;
      /**
       * The earliest era for which we have a pending, unapplied slash.
       **/
      earliestUnappliedSlash: AugmentedQuery<ApiType, () => Observable<Option<EraIndex>>, []>;
      /**
       * Flag to control the execution of the offchain election. When `Open(_)`, we accept
       * solutions to be submitted.
       **/
      eraElectionStatus: AugmentedQuery<ApiType, () => Observable<ElectionStatus>, []>;
      /**
       * Rewards for the last `HISTORY_DEPTH` eras.
       * If reward hasn't been set or has been removed then 0 reward is returned.
       **/
      erasRewardPoints: AugmentedQuery<
        ApiType,
        (arg: EraIndex | AnyNumber | Uint8Array) => Observable<EraRewardPoints>,
        [EraIndex]
      >;
      /**
       * Exposure of validator at era.
       *
       * This is keyed first by the era index to allow bulk deletion and then the stash account.
       *
       * Is it removed after `HISTORY_DEPTH` eras.
       * If stakers hasn't been set or has been removed then empty exposure is returned.
       **/
      erasStakers: AugmentedQueryDoubleMap<
        ApiType,
        (
          key1: EraIndex | AnyNumber | Uint8Array,
          key2: AccountId | string | Uint8Array
        ) => Observable<Exposure>,
        [EraIndex, AccountId]
      >;
      /**
       * Clipped Exposure of validator at era.
       *
       * This is similar to [`ErasStakers`] but number of nominators exposed is reduced to the
       * `T::MaxNominatorRewardedPerValidator` biggest stakers.
       * (Note: the field `total` and `own` of the exposure remains unchanged).
       * This is used to limit the i/o cost for the nominator payout.
       *
       * This is keyed fist by the era index to allow bulk deletion and then the stash account.
       *
       * Is it removed after `HISTORY_DEPTH` eras.
       * If stakers hasn't been set or has been removed then empty exposure is returned.
       **/
      erasStakersClipped: AugmentedQueryDoubleMap<
        ApiType,
        (
          key1: EraIndex | AnyNumber | Uint8Array,
          key2: AccountId | string | Uint8Array
        ) => Observable<Exposure>,
        [EraIndex, AccountId]
      >;
      /**
       * The session index at which the era start for the last `HISTORY_DEPTH` eras.
       **/
      erasStartSessionIndex: AugmentedQuery<
        ApiType,
        (arg: EraIndex | AnyNumber | Uint8Array) => Observable<Option<SessionIndex>>,
        [EraIndex]
      >;
      /**
       * The total amount staked for the last `HISTORY_DEPTH` eras.
       * If total hasn't been set or has been removed then 0 stake is returned.
       **/
      erasTotalStake: AugmentedQuery<
        ApiType,
        (arg: EraIndex | AnyNumber | Uint8Array) => Observable<BalanceOf>,
        [EraIndex]
      >;
      /**
       * Similar to `ErasStakers`, this holds the preferences of validators.
       *
       * This is keyed first by the era index to allow bulk deletion and then the stash account.
       *
       * Is it removed after `HISTORY_DEPTH` eras.
       **/
      erasValidatorPrefs: AugmentedQueryDoubleMap<
        ApiType,
        (
          key1: EraIndex | AnyNumber | Uint8Array,
          key2: AccountId | string | Uint8Array
        ) => Observable<ValidatorPrefs>,
        [EraIndex, AccountId]
      >;
      /**
       * The total validator era payout for the last `HISTORY_DEPTH` eras.
       *
       * Eras that haven't finished yet or has been removed doesn't have reward.
       **/
      erasValidatorReward: AugmentedQuery<
        ApiType,
        (arg: EraIndex | AnyNumber | Uint8Array) => Observable<Option<BalanceOf>>,
        [EraIndex]
      >;
      /**
       * Mode of era forcing.
       **/
      forceEra: AugmentedQuery<ApiType, () => Observable<Forcing>, []>;
      /**
       * Number of eras to keep in history.
       *
       * Information is kept for eras in `[current_era - history_depth; current_era]`.
       *
       * Must be more than the number of eras delayed by session otherwise. I.e. active era must
       * always be in history. I.e. `active_era > current_era - history_depth` must be
       * guaranteed.
       **/
      historyDepth: AugmentedQuery<ApiType, () => Observable<u32>, []>;
      /**
       * Any validators that may never be slashed or forcibly kicked. It's a Vec since they're
       * easy to initialize and the performance hit is minimal (we expect no more than four
       * invulnerables) and restricted to testnets.
       **/
      invulnerables: AugmentedQuery<ApiType, () => Observable<Vec<AccountId>>, []>;
      /**
       * True if the current **planned** session is final. Note that this does not take era
       * forcing into account.
       **/
      isCurrentSessionFinal: AugmentedQuery<ApiType, () => Observable<bool>, []>;
      /**
       * Map from all (unlocked) "controller" accounts to the info regarding the staking.
       **/
      ledger: AugmentedQuery<
        ApiType,
        (arg: AccountId | string | Uint8Array) => Observable<Option<StakingLedger>>,
        [AccountId]
      >;
      /**
       * The minimum amount with which a validator can bond.
       **/
      minimumBondThreshold: AugmentedQuery<ApiType, () => Observable<BalanceOf>, []>;
      /**
       * Minimum number of staking participants before emergency conditions are imposed.
       **/
      minimumValidatorCount: AugmentedQuery<ApiType, () => Observable<u32>, []>;
      /**
       * The map from nominator stash key to the set of stash keys of all validators to nominate.
       **/
      nominators: AugmentedQuery<
        ApiType,
        (arg: AccountId | string | Uint8Array) => Observable<Option<Nominations>>,
        [AccountId]
      >;
      /**
       * All slashing events on nominators, mapped by era to the highest slash value of the era.
       **/
      nominatorSlashInEra: AugmentedQueryDoubleMap<
        ApiType,
        (
          key1: EraIndex | AnyNumber | Uint8Array,
          key2: AccountId | string | Uint8Array
        ) => Observable<Option<BalanceOf>>,
        [EraIndex, AccountId]
      >;
      /**
       * Where the reward payment should be made. Keyed by stash.
       **/
      payee: AugmentedQuery<
        ApiType,
        (arg: AccountId | string | Uint8Array) => Observable<RewardDestination>,
        [AccountId]
      >;
      /**
       * Entities that are allowed to run operator/validator nodes.
       **/
      permissionedIdentity: AugmentedQuery<
        ApiType,
        (arg: IdentityId | string | Uint8Array) => Observable<Option<PermissionedIdentityPrefs>>,
        [IdentityId]
      >;
      /**
       * The next validator set. At the end of an era, if this is available (potentially from the
       * result of an offchain worker), it is immediately used. Otherwise, the on-chain election
       * is executed.
       **/
      queuedElected: AugmentedQuery<ApiType, () => Observable<Option<ElectionResult>>, []>;
      /**
       * The score of the current [`QueuedElected`].
       **/
      queuedScore: AugmentedQuery<ApiType, () => Observable<Option<ElectionScore>>, []>;
      slashingAllowedFor: AugmentedQuery<ApiType, () => Observable<SlashingSwitch>, []>;
      /**
       * Slashing spans for stash accounts.
       **/
      slashingSpans: AugmentedQuery<
        ApiType,
        (arg: AccountId | string | Uint8Array) => Observable<Option<SlashingSpans>>,
        [AccountId]
      >;
      /**
       * The percentage of the slash that is distributed to reporters.
       *
       * The rest of the slashed value is handled by the `Slash`.
       **/
      slashRewardFraction: AugmentedQuery<ApiType, () => Observable<Perbill>, []>;
      /**
       * Snapshot of nominators at the beginning of the current election window. This should only
       * have a value when [`EraElectionStatus`] == `ElectionStatus::Open(_)`.
       **/
      snapshotNominators: AugmentedQuery<ApiType, () => Observable<Option<Vec<AccountId>>>, []>;
      /**
       * Snapshot of validators at the beginning of the current election window. This should only
       * have a value when [`EraElectionStatus`] == `ElectionStatus::Open(_)`.
       **/
      snapshotValidators: AugmentedQuery<ApiType, () => Observable<Option<Vec<AccountId>>>, []>;
      /**
       * Records information about the maximum slash of a stash within a slashing span,
       * as well as how much reward has been paid out.
       **/
      spanSlash: AugmentedQuery<
        ApiType,
        (
          arg:
            | ITuple<[AccountId, SpanIndex]>
            | [AccountId | string | Uint8Array, SpanIndex | AnyNumber | Uint8Array]
        ) => Observable<SpanRecord>,
        [ITuple<[AccountId, SpanIndex]>]
      >;
      /**
       * True if network has been upgraded to this version.
       * Storage version of the pallet.
       *
       * This is set to v6.0.0 for new networks.
       **/
      storageVersion: AugmentedQuery<ApiType, () => Observable<Releases>, []>;
      /**
       * All unapplied slashes that are queued for later.
       **/
      unappliedSlashes: AugmentedQuery<
        ApiType,
        (arg: EraIndex | AnyNumber | Uint8Array) => Observable<Vec<UnappliedSlash>>,
        [EraIndex]
      >;
      /**
       * Every validator has commission that should be in the range [0, Cap].
       **/
      validatorCommissionCap: AugmentedQuery<ApiType, () => Observable<Perbill>, []>;
      /**
       * The ideal number of staking participants.
       **/
      validatorCount: AugmentedQuery<ApiType, () => Observable<u32>, []>;
      /**
       * The map from (wannabe) validator stash key to the preferences of that validator.
       **/
      validators: AugmentedQuery<
        ApiType,
        (arg: AccountId | string | Uint8Array) => Observable<ValidatorPrefs>,
        [AccountId]
      >;
      /**
       * All slashing events on validators, mapped by era to the highest slash proportion
       * and slash value of the era.
       **/
      validatorSlashInEra: AugmentedQueryDoubleMap<
        ApiType,
        (
          key1: EraIndex | AnyNumber | Uint8Array,
          key2: AccountId | string | Uint8Array
        ) => Observable<Option<ITuple<[Perbill, BalanceOf]>>>,
        [EraIndex, AccountId]
      >;
    };
    statistics: {
      /**
       * Transfer managers currently enabled for an Asset.
       **/
      activeTransferManagers: AugmentedQuery<
        ApiType,
        (arg: Ticker | string | Uint8Array) => Observable<Vec<TransferManager>>,
        [Ticker]
      >;
      /**
       * Entities exempt from transfer managers. Exemptions requirements are based on TMS.
       * TMs may require just the sender, just the receiver, both or either to be exempted.
       * CTM requires sender to be exempted while PTM requires receiver to be exempted.
       **/
      exemptEntities: AugmentedQueryDoubleMap<
        ApiType,
        (
          key1:
            | ITuple<[Ticker, TransferManager]>
            | [
                Ticker | string | Uint8Array,
                (
                  | TransferManager
                  | { CountTransferManager: any }
                  | { PercentageTransferManager: any }
                  | string
                  | Uint8Array
                )
              ],
          key2: ScopeId | string | Uint8Array
        ) => Observable<bool>,
        [ITuple<[Ticker, TransferManager]>, ScopeId]
      >;
      /**
       * Number of current investors in an asset.
       **/
      investorCountPerAsset: AugmentedQuery<
        ApiType,
        (arg: Ticker | string | Uint8Array) => Observable<Counter>,
        [Ticker]
      >;
    };
    sto: {
      /**
       * Total fundraisers created for a token
       **/
      fundraiserCount: AugmentedQuery<
        ApiType,
        (arg: Ticker | string | Uint8Array) => Observable<u64>,
        [Ticker]
      >;
      /**
       * All fundraisers that are currently running. (ticker, fundraiser_id) -> Fundraiser
       **/
      fundraisers: AugmentedQueryDoubleMap<
        ApiType,
        (
          key1: Ticker | string | Uint8Array,
          key2: u64 | AnyNumber | Uint8Array
        ) => Observable<Option<Fundraiser>>,
        [Ticker, u64]
      >;
    };
    sudo: {
      /**
       * The `AccountId` of the sudo key.
       **/
      key: AugmentedQuery<ApiType, () => Observable<AccountId>, []>;
    };
    system: {
      /**
       * The full account information for a particular account ID.
       **/
      account: AugmentedQuery<
        ApiType,
        (arg: AccountId | string | Uint8Array) => Observable<AccountInfo>,
        [AccountId]
      >;
      /**
       * Total length (in bytes) for all extrinsics put together, for the current block.
       **/
      allExtrinsicsLen: AugmentedQuery<ApiType, () => Observable<Option<u32>>, []>;
      /**
       * Map of block numbers to block hashes.
       **/
      blockHash: AugmentedQuery<
        ApiType,
        (arg: BlockNumber | AnyNumber | Uint8Array) => Observable<Hash>,
        [BlockNumber]
      >;
      /**
       * The current weight for the block.
       **/
      blockWeight: AugmentedQuery<ApiType, () => Observable<ExtrinsicsWeight>, []>;
      /**
       * Digest of the current block, also part of the block header.
       **/
      digest: AugmentedQuery<ApiType, () => Observable<DigestOf>, []>;
      /**
       * The number of events in the `Events<T>` list.
       **/
      eventCount: AugmentedQuery<ApiType, () => Observable<EventIndex>, []>;
      /**
       * Events deposited for the current block.
       **/
      events: AugmentedQuery<ApiType, () => Observable<Vec<EventRecord>>, []>;
      /**
       * Mapping between a topic (represented by T::Hash) and a vector of indexes
       * of events in the `<Events<T>>` list.
       *
       * All topic vectors have deterministic storage locations depending on the topic. This
       * allows light-clients to leverage the changes trie storage tracking mechanism and
       * in case of changes fetch the list of events of interest.
       *
       * The value has the type `(T::BlockNumber, EventIndex)` because if we used only just
       * the `EventIndex` then in case if the topic has the same contents on the next block
       * no notification will be triggered thus the event might be lost.
       **/
      eventTopics: AugmentedQuery<
        ApiType,
        (arg: Hash | string | Uint8Array) => Observable<Vec<ITuple<[BlockNumber, EventIndex]>>>,
        [Hash]
      >;
      /**
       * The execution phase of the block.
       **/
      executionPhase: AugmentedQuery<ApiType, () => Observable<Option<Phase>>, []>;
      /**
       * Total extrinsics count for the current block.
       **/
      extrinsicCount: AugmentedQuery<ApiType, () => Observable<Option<u32>>, []>;
      /**
       * Extrinsics data for the current block (maps an extrinsic's index to its data).
       **/
      extrinsicData: AugmentedQuery<
        ApiType,
        (arg: u32 | AnyNumber | Uint8Array) => Observable<Bytes>,
        [u32]
      >;
      /**
       * Extrinsics root of the current block, also part of the block header.
       **/
      extrinsicsRoot: AugmentedQuery<ApiType, () => Observable<Hash>, []>;
      /**
       * Stores the `spec_version` and `spec_name` of when the last runtime upgrade happened.
       **/
      lastRuntimeUpgrade: AugmentedQuery<
        ApiType,
        () => Observable<Option<LastRuntimeUpgradeInfo>>,
        []
      >;
      /**
       * The current block number being processed. Set by `execute_block`.
       **/
      number: AugmentedQuery<ApiType, () => Observable<BlockNumber>, []>;
      /**
       * Hash of the previous block.
       **/
      parentHash: AugmentedQuery<ApiType, () => Observable<Hash>, []>;
      /**
       * True if we have upgraded so that `type RefCount` is `u32`. False (default) if not.
       **/
      upgradedToU32RefCount: AugmentedQuery<ApiType, () => Observable<bool>, []>;
    };
    technicalCommittee: {
      /**
       * Time after which a proposal will expire.
       **/
      expiresAfter: AugmentedQuery<ApiType, () => Observable<MaybeBlock>, []>;
      /**
       * The current members of the committee.
       **/
      members: AugmentedQuery<ApiType, () => Observable<Vec<IdentityId>>, []>;
      /**
       * Proposals so far.
       **/
      proposalCount: AugmentedQuery<ApiType, () => Observable<u32>, []>;
      /**
       * Actual proposal for a given hash.
       **/
      proposalOf: AugmentedQuery<
        ApiType,
        (arg: Hash | string | Uint8Array) => Observable<Option<Proposal>>,
        [Hash]
      >;
      /**
       * The hashes of the active proposals.
       **/
      proposals: AugmentedQuery<ApiType, () => Observable<Vec<Hash>>, []>;
      /**
       * Release coordinator.
       **/
      releaseCoordinator: AugmentedQuery<ApiType, () => Observable<Option<IdentityId>>, []>;
      /**
       * Vote threshold for an approval.
       **/
      voteThreshold: AugmentedQuery<ApiType, () => Observable<ITuple<[u32, u32]>>, []>;
      /**
       * PolymeshVotes on a given proposal, if it is ongoing.
       **/
      voting: AugmentedQuery<
        ApiType,
        (arg: Hash | string | Uint8Array) => Observable<Option<PolymeshVotes>>,
        [Hash]
      >;
    };
    technicalCommitteeMembership: {
      /**
       * The current "active" membership, stored as an ordered Vec.
       **/
      activeMembers: AugmentedQuery<ApiType, () => Observable<Vec<IdentityId>>, []>;
      /**
       * Limit of how many "active" members there can be.
       **/
      activeMembersLimit: AugmentedQuery<ApiType, () => Observable<u32>, []>;
      /**
       * The current "inactive" membership, stored as an ordered Vec.
       **/
      inactiveMembers: AugmentedQuery<ApiType, () => Observable<Vec<InactiveMember>>, []>;
    };
    timestamp: {
      /**
       * Did the timestamp get updated in this block?
       **/
      didUpdate: AugmentedQuery<ApiType, () => Observable<bool>, []>;
      /**
       * Current time for the current block.
       **/
      now: AugmentedQuery<ApiType, () => Observable<Moment>, []>;
    };
    transactionPayment: {
      nextFeeMultiplier: AugmentedQuery<ApiType, () => Observable<Multiplier>, []>;
    };
    upgradeCommittee: {
      /**
       * Time after which a proposal will expire.
       **/
      expiresAfter: AugmentedQuery<ApiType, () => Observable<MaybeBlock>, []>;
      /**
       * The current members of the committee.
       **/
      members: AugmentedQuery<ApiType, () => Observable<Vec<IdentityId>>, []>;
      /**
       * Proposals so far.
       **/
      proposalCount: AugmentedQuery<ApiType, () => Observable<u32>, []>;
      /**
       * Actual proposal for a given hash.
       **/
      proposalOf: AugmentedQuery<
        ApiType,
        (arg: Hash | string | Uint8Array) => Observable<Option<Proposal>>,
        [Hash]
      >;
      /**
       * The hashes of the active proposals.
       **/
      proposals: AugmentedQuery<ApiType, () => Observable<Vec<Hash>>, []>;
      /**
       * Release coordinator.
       **/
      releaseCoordinator: AugmentedQuery<ApiType, () => Observable<Option<IdentityId>>, []>;
      /**
       * Vote threshold for an approval.
       **/
      voteThreshold: AugmentedQuery<ApiType, () => Observable<ITuple<[u32, u32]>>, []>;
      /**
       * PolymeshVotes on a given proposal, if it is ongoing.
       **/
      voting: AugmentedQuery<
        ApiType,
        (arg: Hash | string | Uint8Array) => Observable<Option<PolymeshVotes>>,
        [Hash]
      >;
    };
    upgradeCommitteeMembership: {
      /**
       * The current "active" membership, stored as an ordered Vec.
       **/
      activeMembers: AugmentedQuery<ApiType, () => Observable<Vec<IdentityId>>, []>;
      /**
       * Limit of how many "active" members there can be.
       **/
      activeMembersLimit: AugmentedQuery<ApiType, () => Observable<u32>, []>;
      /**
       * The current "inactive" membership, stored as an ordered Vec.
       **/
      inactiveMembers: AugmentedQuery<ApiType, () => Observable<Vec<InactiveMember>>, []>;
    };
    utility: {
      nonces: AugmentedQuery<
        ApiType,
        (arg: AccountId | string | Uint8Array) => Observable<AuthorizationNonce>,
        [AccountId]
      >;
    };
  }

  export interface QueryableStorage<ApiType extends ApiTypes> extends AugmentedQueries<ApiType> {}
}
