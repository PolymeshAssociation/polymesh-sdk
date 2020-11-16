// Auto-generated via `yarn polkadot-types-from-chain`, do not edit
/* eslint-disable */

import { AnyNumber, ITuple, Observable } from '@polkadot/types/types';
import { Option, Vec } from '@polkadot/types/codec';
import { Bytes, bool, u16, u32, u64 } from '@polkadot/types/primitive';
import { UncleEntryItem } from '@polkadot/types/interfaces/authorship';
import {
  BabeAuthorityWeight,
  MaybeRandomness,
  NextConfigDescriptor,
  Randomness,
} from '@polkadot/types/interfaces/babe';
import { BalanceLock } from '@polkadot/types/interfaces/balances';
import { AuthorityId } from '@polkadot/types/interfaces/consensus';
import {
  CodeHash,
  ContractInfo,
  PrefabWasmModule,
  Schedule,
} from '@polkadot/types/interfaces/contracts';
import { Proposal } from '@polkadot/types/interfaces/democracy';
import { Vote } from '@polkadot/types/interfaces/elections';
import { SetId, StoredPendingChange, StoredState } from '@polkadot/types/interfaces/grandpa';
import { AuthIndex } from '@polkadot/types/interfaces/imOnline';
import {
  DeferredOffenceOf,
  Kind,
  OffenceDetails,
  OpaqueTimeSlot,
  ReportIdOf,
} from '@polkadot/types/interfaces/offences';
import {
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
  ValidatorId,
} from '@polkadot/types/interfaces/runtime';
import { Keys, SessionIndex } from '@polkadot/types/interfaces/session';
import {
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
import {
  AccountInfo,
  DigestOf,
  EventIndex,
  EventRecord,
  LastRuntimeUpgradeInfo,
  Phase,
} from '@polkadot/types/interfaces/system';
import { Multiplier } from '@polkadot/types/interfaces/txpayment';
import {
  AssetCompliance,
  AssetIdentifier,
  AssetOwnershipRelation,
  Authorization,
  AuthorizationNonce,
  AuthorizationStatus,
  Ballot,
  BridgeTx,
  BridgeTxDetail,
  Claim1stKey,
  Claim2ndKey,
  ClassicTickerRegistration,
  Commission,
  Counter,
  DepositInfo,
  DidRecord,
  Dividend,
  Document,
  DocumentName,
  FundingRoundName,
  Fundraiser,
  IdentityClaim,
  IdentityId,
  InactiveMember,
  Instruction,
  Investment,
  Leg,
  LegStatus,
  LinkedKeyInfo,
  OfflineSlashingParams,
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
  STO,
  SecurityToken,
  Signatory,
  SkippedCount,
  SmartExtension,
  SmartExtensionType,
  SnapshotMetadata,
  SnapshottedPip,
  TargetIdAuthorization,
  Ticker,
  TickerRangeProof,
  TickerRegistration,
  TickerRegistrationConfig,
  Venue,
  VotingResult,
} from 'polymesh-types/polymesh';
import { ApiTypes } from '@polkadot/api/types';

declare module '@polkadot/api/types/storage' {
  export interface AugmentedQueries<ApiType> {
    asset: {
      /**
       * Documents attached to an Asset
       * (ticker, document_name) -> document
       **/
      assetDocuments: AugmentedQueryDoubleMap<
        ApiType,
        (key1: Ticker | string | Uint8Array, key2: DocumentName | string) => Observable<Document>
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
        ) => Observable<AssetOwnershipRelation>
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
        ) => Observable<Balance>
      >;
      /**
       * Balance of a DID at a checkpoint.
       * (ticker, did, checkpoint ID) -> Balance of a DID at a checkpoint
       **/
      checkpointBalance: AugmentedQuery<
        ApiType,
        (
          arg:
            | ITuple<[Ticker, IdentityId, u64]>
            | [
                Ticker | string | Uint8Array,
                IdentityId | string | Uint8Array,
                u64 | AnyNumber | Uint8Array
              ]
        ) => Observable<Balance>
      >;
      /**
       * Total supply of the token at the checkpoint.
       * (ticker, checkpointId) -> total supply at given checkpoint
       **/
      checkpointTotalSupply: AugmentedQuery<
        ApiType,
        (
          arg: ITuple<[Ticker, u64]> | [Ticker | string | Uint8Array, u64 | AnyNumber | Uint8Array]
        ) => Observable<Balance>
      >;
      /**
       * Ticker registration details on Polymath Classic / Ethereum.
       **/
      classicTickers: AugmentedQuery<
        ApiType,
        (arg: Ticker | string | Uint8Array) => Observable<Option<ClassicTickerRegistration>>
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
        ) => Observable<SmartExtension>
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
                  | { Custom: any }
                  | string
                  | Uint8Array
                )
              ]
        ) => Observable<Vec<AccountId>>
      >;
      /**
       * The set of frozen assets implemented as a membership map.
       * ticker -> bool
       **/
      frozen: AugmentedQuery<ApiType, (arg: Ticker | string | Uint8Array) => Observable<bool>>;
      /**
       * The name of the current funding round.
       * ticker -> funding round
       **/
      fundingRound: AugmentedQuery<
        ApiType,
        (arg: Ticker | string | Uint8Array) => Observable<FundingRoundName>
      >;
      /**
       * A map of a ticker name and asset identifiers.
       **/
      identifiers: AugmentedQuery<
        ApiType,
        (arg: Ticker | string | Uint8Array) => Observable<Vec<AssetIdentifier>>
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
        ) => Observable<Balance>
      >;
      /**
       * Ticker registration config.
       * (ticker) -> TickerRegistrationConfig
       **/
      tickerConfig: AugmentedQuery<ApiType, () => Observable<TickerRegistrationConfig>>;
      /**
       * Ticker registration details.
       * (ticker) -> TickerRegistration
       **/
      tickers: AugmentedQuery<
        ApiType,
        (arg: Ticker | string | Uint8Array) => Observable<TickerRegistration>
      >;
      /**
       * Details of the token corresponding to the token ticker.
       * (ticker) -> SecurityToken details [returns SecurityToken struct]
       **/
      tokens: AugmentedQuery<
        ApiType,
        (arg: Ticker | string | Uint8Array) => Observable<SecurityToken>
      >;
      /**
       * Checkpoints created per token.
       * (ticker) -> no. of checkpoints
       **/
      totalCheckpoints: AugmentedQuery<
        ApiType,
        (arg: Ticker | string | Uint8Array) => Observable<u64>
      >;
      /**
       * Last checkpoint updated for a DID's balance.
       * (ticker, did) -> List of checkpoints where user balance changed
       **/
      userCheckpoints: AugmentedQuery<
        ApiType,
        (
          arg:
            | ITuple<[Ticker, IdentityId]>
            | [Ticker | string | Uint8Array, IdentityId | string | Uint8Array]
        ) => Observable<Vec<u64>>
      >;
    };
    authorship: {
      /**
       * Author of current block.
       **/
      author: AugmentedQuery<ApiType, () => Observable<Option<AccountId>>>;
      /**
       * Whether uncles were already set in this block.
       **/
      didSetUncles: AugmentedQuery<ApiType, () => Observable<bool>>;
      /**
       * Uncles
       **/
      uncles: AugmentedQuery<ApiType, () => Observable<Vec<UncleEntryItem>>>;
    };
    babe: {
      /**
       * Current epoch authorities.
       **/
      authorities: AugmentedQuery<
        ApiType,
        () => Observable<Vec<ITuple<[AuthorityId, BabeAuthorityWeight]>>>
      >;
      /**
       * Current slot number.
       **/
      currentSlot: AugmentedQuery<ApiType, () => Observable<u64>>;
      /**
       * Current epoch index.
       **/
      epochIndex: AugmentedQuery<ApiType, () => Observable<u64>>;
      /**
       * The slot at which the first epoch actually started. This is 0
       * until the first block of the chain.
       **/
      genesisSlot: AugmentedQuery<ApiType, () => Observable<u64>>;
      /**
       * Temporary value (cleared at block finalization) which is `Some`
       * if per-block initialization has already been called for current block.
       **/
      initialized: AugmentedQuery<ApiType, () => Observable<Option<MaybeRandomness>>>;
      /**
       * How late the current block is compared to its parent.
       *
       * This entry is populated as part of block execution and is cleaned up
       * on block finalization. Querying this storage entry outside of block
       * execution context should always yield zero.
       **/
      lateness: AugmentedQuery<ApiType, () => Observable<BlockNumber>>;
      /**
       * Next epoch configuration, if changed.
       **/
      nextEpochConfig: AugmentedQuery<ApiType, () => Observable<Option<NextConfigDescriptor>>>;
      /**
       * Next epoch randomness.
       **/
      nextRandomness: AugmentedQuery<ApiType, () => Observable<Randomness>>;
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
      randomness: AugmentedQuery<ApiType, () => Observable<Randomness>>;
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
      segmentIndex: AugmentedQuery<ApiType, () => Observable<u32>>;
      /**
       * TWOX-NOTE: `SegmentIndex` is an increasing integer, so this is okay.
       **/
      underConstruction: AugmentedQuery<
        ApiType,
        (arg: u32 | AnyNumber | Uint8Array) => Observable<Vec<Randomness>>
      >;
    };
    balances: {
      /**
       * Any liquidity locks on some account balances.
       * NOTE: Should only be accessed when setting, changing and freeing a lock.
       **/
      locks: AugmentedQuery<
        ApiType,
        (arg: AccountId | string | Uint8Array) => Observable<Vec<BalanceLock>>
      >;
      /**
       * The total units issued in the system.
       **/
      totalIssuance: AugmentedQuery<ApiType, () => Observable<Balance>>;
    };
    bridge: {
      /**
       * The admin key.
       **/
      admin: AugmentedQuery<ApiType, () => Observable<AccountId>>;
      /**
       * The maximum number of bridged POLYX per identity within a set interval of
       * blocks. Fields: POLYX amount and the block interval duration.
       **/
      bridgeLimit: AugmentedQuery<ApiType, () => Observable<ITuple<[Balance, BlockNumber]>>>;
      /**
       * Identities not constrained by the bridge limit.
       **/
      bridgeLimitExempted: AugmentedQuery<
        ApiType,
        (arg: IdentityId | string | Uint8Array) => Observable<bool>
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
        ) => Observable<BridgeTxDetail>
      >;
      /**
       * The multisig account of the bridge controller. The genesis signers accept their
       * authorizations and are able to get their proposals delivered. The bridge creator
       * transfers some POLY to their identity.
       **/
      controller: AugmentedQuery<ApiType, () => Observable<AccountId>>;
      /**
       * Whether or not the bridge operation is frozen.
       **/
      frozen: AugmentedQuery<ApiType, () => Observable<bool>>;
      /**
       * Amount of POLYX bridged by the identity in last block interval. Fields: the bridged
       * amount and the last interval number.
       **/
      polyxBridged: AugmentedQuery<
        ApiType,
        (arg: IdentityId | string | Uint8Array) => Observable<ITuple<[Balance, BlockNumber]>>
      >;
      /**
       * The bridge transaction timelock period, in blocks, since the acceptance of the
       * transaction proposal during which the admin key can freeze the transaction.
       **/
      timelock: AugmentedQuery<ApiType, () => Observable<BlockNumber>>;
      /**
       * The list of timelocked transactions with the block numbers in which those transactions
       * become unlocked. Pending transactions are also included here to be retried
       * automatically.
       **/
      timelockedTxs: AugmentedQuery<
        ApiType,
        (arg: BlockNumber | AnyNumber | Uint8Array) => Observable<Vec<BridgeTx>>
      >;
    };
    cddServiceProviders: {
      /**
       * The current "active" membership, stored as an ordered Vec.
       **/
      activeMembers: AugmentedQuery<ApiType, () => Observable<Vec<IdentityId>>>;
      /**
       * Limit of how many "active" members there can be.
       **/
      activeMembersLimit: AugmentedQuery<ApiType, () => Observable<u32>>;
      /**
       * The current "inactive" membership, stored as an ordered Vec.
       **/
      inactiveMembers: AugmentedQuery<ApiType, () => Observable<Vec<InactiveMember>>>;
    };
    committeeMembership: {
      /**
       * The current "active" membership, stored as an ordered Vec.
       **/
      activeMembers: AugmentedQuery<ApiType, () => Observable<Vec<IdentityId>>>;
      /**
       * Limit of how many "active" members there can be.
       **/
      activeMembersLimit: AugmentedQuery<ApiType, () => Observable<u32>>;
      /**
       * The current "inactive" membership, stored as an ordered Vec.
       **/
      inactiveMembers: AugmentedQuery<ApiType, () => Observable<Vec<InactiveMember>>>;
    };
    complianceManager: {
      /**
       * Asset compliance for a ticker (Ticker -> AssetCompliance)
       **/
      assetCompliances: AugmentedQuery<
        ApiType,
        (arg: Ticker | string | Uint8Array) => Observable<AssetCompliance>
      >;
      /**
       * List of trusted claim issuer Ticker -> Issuer Identity
       **/
      trustedClaimIssuer: AugmentedQuery<
        ApiType,
        (arg: Ticker | string | Uint8Array) => Observable<Vec<IdentityId>>
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
        ) => Observable<Option<TickerRangeProof>>
      >;
      rangeProofVerifications: AugmentedQueryDoubleMap<
        ApiType,
        (
          key1:
            | ITuple<[IdentityId, Ticker]>
            | [IdentityId | string | Uint8Array, Ticker | string | Uint8Array],
          key2: IdentityId | string | Uint8Array
        ) => Observable<bool>
      >;
    };
    contracts: {
      /**
       * The subtrie counter.
       **/
      accountCounter: AugmentedQuery<ApiType, () => Observable<u64>>;
      /**
       * A mapping between an original code hash and instrumented wasm code, ready for execution.
       **/
      codeStorage: AugmentedQuery<
        ApiType,
        (arg: CodeHash | string | Uint8Array) => Observable<Option<PrefabWasmModule>>
      >;
      /**
       * The code associated with a given account.
       *
       * TWOX-NOTE: SAFE since `AccountId` is a secure hash.
       **/
      contractInfoOf: AugmentedQuery<
        ApiType,
        (arg: AccountId | string | Uint8Array) => Observable<Option<ContractInfo>>
      >;
      /**
       * Current cost schedule for contracts.
       **/
      currentSchedule: AugmentedQuery<ApiType, () => Observable<Schedule>>;
      /**
       * A mapping from an original code hash to the original code, untouched by instrumentation.
       **/
      pristineCode: AugmentedQuery<
        ApiType,
        (arg: CodeHash | string | Uint8Array) => Observable<Option<Bytes>>
      >;
    };
    dividend: {
      /**
       * How many dividends were created for a ticker so far; (ticker) => count
       **/
      dividendCount: AugmentedQuery<
        ApiType,
        (arg: Ticker | string | Uint8Array) => Observable<u32>
      >;
      /**
       * Dividend records; (ticker, dividend ID) => dividend entry
       * Note: contrary to checkpoint IDs, dividend IDs are 0-indexed.
       **/
      dividends: AugmentedQuery<
        ApiType,
        (
          arg: ITuple<[Ticker, u32]> | [Ticker | string | Uint8Array, u32 | AnyNumber | Uint8Array]
        ) => Observable<Dividend>
      >;
      /**
       * Payout flags, decide whether a user already was paid their dividend
       * (DID, ticker, dividend_id) -> whether they got their payout
       **/
      userPayoutCompleted: AugmentedQuery<
        ApiType,
        (
          arg:
            | ITuple<[IdentityId, Ticker, u32]>
            | [
                IdentityId | string | Uint8Array,
                Ticker | string | Uint8Array,
                u32 | AnyNumber | Uint8Array
              ]
        ) => Observable<bool>
      >;
    };
    exemption: {
      exemptionList: AugmentedQuery<
        ApiType,
        (
          arg:
            | ITuple<[Ticker, u16, IdentityId]>
            | [
                Ticker | string | Uint8Array,
                u16 | AnyNumber | Uint8Array,
                IdentityId | string | Uint8Array
              ]
        ) => Observable<bool>
      >;
    };
    grandpa: {
      /**
       * The number of changes (both in terms of keys and underlying economic responsibilities)
       * in the "set" of Grandpa validators from genesis.
       **/
      currentSetId: AugmentedQuery<ApiType, () => Observable<SetId>>;
      /**
       * next block number where we can force a change.
       **/
      nextForced: AugmentedQuery<ApiType, () => Observable<Option<BlockNumber>>>;
      /**
       * Pending change: (signaled at, scheduled change).
       **/
      pendingChange: AugmentedQuery<ApiType, () => Observable<Option<StoredPendingChange>>>;
      /**
       * A mapping from grandpa set ID to the index of the *most recent* session for which its
       * members were responsible.
       *
       * TWOX-NOTE: `SetId` is not under user control.
       **/
      setIdSession: AugmentedQuery<
        ApiType,
        (arg: SetId | AnyNumber | Uint8Array) => Observable<Option<SessionIndex>>
      >;
      /**
       * `true` if we are currently stalled.
       **/
      stalled: AugmentedQuery<
        ApiType,
        () => Observable<Option<ITuple<[BlockNumber, BlockNumber]>>>
      >;
      /**
       * State of the current authority set.
       **/
      state: AugmentedQuery<ApiType, () => Observable<StoredState>>;
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
        ) => Observable<Authorization>
      >;
      /**
       * All authorizations that an identity has given. (Authorizer, auth_id -> authorized)
       **/
      authorizationsGiven: AugmentedQueryDoubleMap<
        ApiType,
        (
          key1: IdentityId | string | Uint8Array,
          key2: u64 | AnyNumber | Uint8Array
        ) => Observable<Signatory>
      >;
      /**
       * Obsoleted storage variable superceded by `CddAuthForPrimaryKeyRotation`. It is kept here
       * for the purpose of storage migration.
       **/
      cddAuthForMasterKeyRotation: AugmentedQuery<ApiType, () => Observable<bool>>;
      /**
       * A config flag that, if set, instructs an authorization from a CDD provider in order to
       * change the primary key of an identity.
       **/
      cddAuthForPrimaryKeyRotation: AugmentedQuery<ApiType, () => Observable<bool>>;
      /**
       * (Target ID, claim type) (issuer,scope) -> Associated claims
       **/
      claims: AugmentedQueryDoubleMap<
        ApiType,
        (
          key1: Claim1stKey | { target?: any; claim_type?: any } | string | Uint8Array,
          key2: Claim2ndKey | { issuer?: any; scope?: any } | string | Uint8Array
        ) => Observable<IdentityClaim>
      >;
      /**
       * It stores the current identity for current transaction.
       **/
      currentDid: AugmentedQuery<ApiType, () => Observable<Option<IdentityId>>>;
      /**
       * It stores the current gas fee payer for the current transaction
       **/
      currentPayer: AugmentedQuery<ApiType, () => Observable<Option<AccountId>>>;
      /**
       * DID -> identity info
       **/
      didRecords: AugmentedQuery<
        ApiType,
        (arg: IdentityId | string | Uint8Array) => Observable<DidRecord>
      >;
      /**
       * DID -> bool that indicates if secondary keys are frozen.
       **/
      isDidFrozen: AugmentedQuery<
        ApiType,
        (arg: IdentityId | string | Uint8Array) => Observable<bool>
      >;
      keyToIdentityIds: AugmentedQuery<
        ApiType,
        (arg: AccountId | string | Uint8Array) => Observable<Option<LinkedKeyInfo>>
      >;
      /**
       * Nonce to ensure unique actions. starts from 1.
       **/
      multiPurposeNonce: AugmentedQuery<ApiType, () => Observable<u64>>;
      /**
       * Authorization nonce per Identity. Initially is 0.
       **/
      offChainAuthorizationNonce: AugmentedQuery<
        ApiType,
        (arg: IdentityId | string | Uint8Array) => Observable<AuthorizationNonce>
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
        ) => Observable<bool>
      >;
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
        ) => Observable<u32>
      >;
      /**
       * The block number after which it's ok to send heartbeats in current session.
       *
       * At the beginning of each session we set this to a value that should
       * fall roughly in the middle of the session duration.
       * The idea is to first wait for the validators to produce a block
       * in the current session, so that the heartbeat later on will not be necessary.
       **/
      heartbeatAfter: AugmentedQuery<ApiType, () => Observable<BlockNumber>>;
      /**
       * The current set of keys that may issue a heartbeat.
       **/
      keys: AugmentedQuery<ApiType, () => Observable<Vec<AuthorityId>>>;
      /**
       * For each session index, we keep a mapping of `AuthIndex`
       * to `offchain::OpaqueNetworkState`.
       **/
      receivedHeartbeats: AugmentedQueryDoubleMap<
        ApiType,
        (
          key1: SessionIndex | AnyNumber | Uint8Array,
          key2: AuthIndex | AnyNumber | Uint8Array
        ) => Observable<Option<Bytes>>
      >;
      /**
       * Config parameters for slash fraction
       **/
      slashingParams: AugmentedQuery<ApiType, () => Observable<OfflineSlashingParams>>;
    };
    indices: {
      /**
       * The lookup from index to account.
       **/
      accounts: AugmentedQuery<
        ApiType,
        (
          arg: AccountIndex | AnyNumber | Uint8Array
        ) => Observable<Option<ITuple<[AccountId, BalanceOf, bool]>>>
      >;
    };
    multiSig: {
      /**
       * Maps a multisig secondary key to a multisig address.
       **/
      keyToMultiSig: AugmentedQuery<
        ApiType,
        (arg: AccountId | string | Uint8Array) => Observable<AccountId>
      >;
      /**
       * Nonce to ensure unique MultiSig addresses are generated; starts from 1.
       **/
      multiSigNonce: AugmentedQuery<ApiType, () => Observable<u64>>;
      /**
       * Signers of a multisig. (multisig, signer) => signer.
       **/
      multiSigSigners: AugmentedQueryDoubleMap<
        ApiType,
        (
          key1: AccountId | string | Uint8Array,
          key2: Signatory | { Identity: any } | { Account: any } | string | Uint8Array
        ) => Observable<Signatory>
      >;
      /**
       * Confirmations required before processing a multisig tx.
       **/
      multiSigSignsRequired: AugmentedQuery<
        ApiType,
        (arg: AccountId | string | Uint8Array) => Observable<u64>
      >;
      /**
       * Maps a multisig account to its identity.
       **/
      multiSigToIdentity: AugmentedQuery<
        ApiType,
        (arg: AccountId | string | Uint8Array) => Observable<IdentityId>
      >;
      /**
       * Number of transactions proposed in a multisig. Used as tx id; starts from 0.
       **/
      multiSigTxDone: AugmentedQuery<
        ApiType,
        (arg: AccountId | string | Uint8Array) => Observable<u64>
      >;
      /**
       * Number of approved/accepted signers of a multisig.
       **/
      numberOfSigners: AugmentedQuery<
        ApiType,
        (arg: AccountId | string | Uint8Array) => Observable<u64>
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
        ) => Observable<ProposalDetails>
      >;
      /**
       * A mapping of proposals to their IDs.
       **/
      proposalIds: AugmentedQueryDoubleMap<
        ApiType,
        (
          key1: AccountId | string | Uint8Array,
          key2: Proposal | { callIndex?: any; args?: any } | string | Uint8Array
        ) => Observable<Option<u64>>
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
        ) => Observable<Option<Proposal>>
      >;
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
        ) => Observable<bool>
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
        ) => Observable<Vec<ReportIdOf>>
      >;
      /**
       * Deferred reports that have been rejected by the offence handler and need to be submitted
       * at a later time.
       **/
      deferredOffences: AugmentedQuery<ApiType, () => Observable<Vec<DeferredOffenceOf>>>;
      /**
       * The primary structure that holds all offence records keyed by report identifiers.
       **/
      reports: AugmentedQuery<
        ApiType,
        (arg: ReportIdOf | string | Uint8Array) => Observable<Option<OffenceDetails>>
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
        (arg: Kind | string | Uint8Array) => Observable<Bytes>
      >;
    };
    pips: {
      /**
       * Total count of current pending or scheduled PIPs.
       **/
      activePipCount: AugmentedQuery<ApiType, () => Observable<u32>>;
      /**
       * The maximum allowed number for `ActivePipCount`.
       * Once reached, new PIPs cannot be proposed by community members.
       **/
      activePipLimit: AugmentedQuery<ApiType, () => Observable<u32>>;
      /**
       * All existing PIPs where the proposer is a committee.
       * This list is a cache of all ids in `Proposals` with `Proposer::Committee(_)`.
       **/
      committeePips: AugmentedQuery<ApiType, () => Observable<Vec<PipId>>>;
      /**
       * Default enactment period that will be use after a proposal is accepted by GC.
       **/
      defaultEnactmentPeriod: AugmentedQuery<ApiType, () => Observable<BlockNumber>>;
      /**
       * Those who have locked a deposit.
       * proposal (id, proposer) -> deposit
       **/
      deposits: AugmentedQueryDoubleMap<
        ApiType,
        (
          key1: PipId | AnyNumber | Uint8Array,
          key2: AccountId | string | Uint8Array
        ) => Observable<DepositInfo>
      >;
      /**
       * Maps block numbers to list of PIPs which should be executed at the block number.
       * block number -> Pip id
       **/
      executionSchedule: AugmentedQuery<
        ApiType,
        (arg: BlockNumber | AnyNumber | Uint8Array) => Observable<Vec<PipId>>
      >;
      /**
       * Maximum times a PIP can be skipped before triggering `CannotSkipPip` in `enact_snapshot_results`.
       **/
      maxPipSkipCount: AugmentedQuery<ApiType, () => Observable<SkippedCount>>;
      /**
       * The minimum amount to be used as a deposit for community PIP creation.
       **/
      minimumProposalDeposit: AugmentedQuery<ApiType, () => Observable<BalanceOf>>;
      /**
       * Proposals so far. id can be used to keep track of PIPs off-chain.
       **/
      pipIdSequence: AugmentedQuery<ApiType, () => Observable<u32>>;
      /**
       * The number of times a certain PIP has been skipped.
       * Once a (configurable) threshhold is exceeded, a PIP cannot be skipped again.
       **/
      pipSkipCount: AugmentedQuery<
        ApiType,
        (arg: PipId | AnyNumber | Uint8Array) => Observable<SkippedCount>
      >;
      /**
       * Maps PIPs to the block at which they will be executed, if any.
       **/
      pipToSchedule: AugmentedQuery<
        ApiType,
        (arg: PipId | AnyNumber | Uint8Array) => Observable<Option<BlockNumber>>
      >;
      /**
       * During Cool-off period, proposal owner can amend any PIP detail or cancel the entire
       * proposal.
       **/
      proposalCoolOffPeriod: AugmentedQuery<ApiType, () => Observable<BlockNumber>>;
      /**
       * The metadata of the active proposals.
       **/
      proposalMetadata: AugmentedQuery<
        ApiType,
        (arg: PipId | AnyNumber | Uint8Array) => Observable<Option<PipsMetadata>>
      >;
      /**
       * PolymeshVotes on a given proposal, if it is ongoing.
       * proposal id -> vote count
       **/
      proposalResult: AugmentedQuery<
        ApiType,
        (arg: PipId | AnyNumber | Uint8Array) => Observable<VotingResult>
      >;
      /**
       * Actual proposal for a given id, if it's current.
       * proposal id -> proposal
       **/
      proposals: AugmentedQuery<
        ApiType,
        (arg: PipId | AnyNumber | Uint8Array) => Observable<Option<Pip>>
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
        ) => Observable<Option<Vote>>
      >;
      /**
       * Determines whether historical PIP data is persisted or removed
       **/
      pruneHistoricalPips: AugmentedQuery<ApiType, () => Observable<bool>>;
      /**
       * Snapshots so far. id can be used to keep track of snapshots off-chain.
       **/
      snapshotIdSequence: AugmentedQuery<ApiType, () => Observable<u32>>;
      /**
       * The metadata of the snapshot, if there is one.
       **/
      snapshotMeta: AugmentedQuery<ApiType, () => Observable<Option<SnapshotMetadata>>>;
      /**
       * The priority queue (lowest priority at index 0) of PIPs at the point of snapshotting.
       * Priority is defined by the `weight` in the `SnapshottedPIP`.
       *
       * A queued PIP can be skipped. Doing so bumps the `pip_skip_count`.
       * Once a (configurable) threshhold is exceeded, a PIP cannot be skipped again.
       **/
      snapshotQueue: AugmentedQuery<ApiType, () => Observable<Vec<SnapshottedPip>>>;
    };
    polymeshCommittee: {
      /**
       * The current members of the committee.
       **/
      members: AugmentedQuery<ApiType, () => Observable<Vec<IdentityId>>>;
      /**
       * Proposals so far.
       **/
      proposalCount: AugmentedQuery<ApiType, () => Observable<u32>>;
      /**
       * Actual proposal for a given hash.
       **/
      proposalOf: AugmentedQuery<
        ApiType,
        (arg: Hash | string | Uint8Array) => Observable<Option<Proposal>>
      >;
      /**
       * The hashes of the active proposals.
       **/
      proposals: AugmentedQuery<ApiType, () => Observable<Vec<Hash>>>;
      /**
       * Release coordinator.
       **/
      releaseCoordinator: AugmentedQuery<ApiType, () => Observable<Option<IdentityId>>>;
      /**
       * Vote threshold for an approval.
       **/
      voteThreshold: AugmentedQuery<ApiType, () => Observable<ITuple<[u32, u32]>>>;
      /**
       * PolymeshVotes on a given proposal, if it is ongoing.
       **/
      voting: AugmentedQuery<
        ApiType,
        (arg: Hash | string | Uint8Array) => Observable<Option<PolymeshVotes>>
      >;
    };
    portfolio: {
      /**
       * The next portfolio sequence number of an identity.
       **/
      nextPortfolioNumber: AugmentedQuery<
        ApiType,
        (arg: IdentityId | string | Uint8Array) => Observable<PortfolioNumber>
      >;
      /**
       * The asset balances of portfolios.
       **/
      portfolioAssetBalances: AugmentedQueryDoubleMap<
        ApiType,
        (
          key1: PortfolioId | { did?: any; kind?: any } | string | Uint8Array,
          key2: Ticker | string | Uint8Array
        ) => Observable<Balance>
      >;
      /**
       * The custodian of a particular portfolio. None implies that the identity owner is the custodian.
       **/
      portfolioCustodian: AugmentedQuery<
        ApiType,
        (
          arg: PortfolioId | { did?: any; kind?: any } | string | Uint8Array
        ) => Observable<Option<IdentityId>>
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
        ) => Observable<Balance>
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
        ) => Observable<PortfolioName>
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
        ) => Observable<bool>
      >;
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
            | 'DividendNew'
            | 'ComplianceManagerAddComplianceRequirement'
            | 'IdentityRegisterDid'
            | 'IdentityCddRegisterDid'
            | 'IdentityAddClaim'
            | 'IdentitySetPrimaryKey'
            | 'IdentityAddSecondaryKeysWithAuthorization'
            | 'PipsPropose'
            | 'VotingAddBallot'
            | number
            | Uint8Array
        ) => Observable<BalanceOf>
      >;
      /**
       * The fee coefficient as a positive rational (numerator, denominator).
       **/
      coefficient: AugmentedQuery<ApiType, () => Observable<PosRatio>>;
    };
    randomnessCollectiveFlip: {
      /**
       * Series of block headers from the last 81 blocks that acts as random seed material. This
       * is arranged as a ring buffer with `block_number % 81` being the index into the `Vec` of
       * the oldest hash.
       **/
      randomMaterial: AugmentedQuery<ApiType, () => Observable<Vec<Hash>>>;
    };
    session: {
      /**
       * Current index of the session.
       **/
      currentIndex: AugmentedQuery<ApiType, () => Observable<SessionIndex>>;
      /**
       * Indices of disabled validators.
       *
       * The set is cleared when `on_session_ending` returns a new set of identities.
       **/
      disabledValidators: AugmentedQuery<ApiType, () => Observable<Vec<u32>>>;
      /**
       * The owner of a key. The key is the `KeyTypeId` + the encoded key.
       **/
      keyOwner: AugmentedQuery<
        ApiType,
        (
          arg:
            | ITuple<[KeyTypeId, Bytes]>
            | [KeyTypeId | AnyNumber | Uint8Array, Bytes | string | Uint8Array]
        ) => Observable<Option<ValidatorId>>
      >;
      /**
       * The next session keys for a validator.
       **/
      nextKeys: AugmentedQuery<
        ApiType,
        (arg: ValidatorId | string | Uint8Array) => Observable<Option<Keys>>
      >;
      /**
       * True if the underlying economic identities or weighting behind the validators
       * has changed in the queued validator set.
       **/
      queuedChanged: AugmentedQuery<ApiType, () => Observable<bool>>;
      /**
       * The queued keys for the next session. When the next session begins, these keys
       * will be used to determine the validator's session keys.
       **/
      queuedKeys: AugmentedQuery<ApiType, () => Observable<Vec<ITuple<[ValidatorId, Keys]>>>>;
      /**
       * The current set of validators.
       **/
      validators: AugmentedQuery<ApiType, () => Observable<Vec<ValidatorId>>>;
    };
    settlement: {
      /**
       * Tracks authorizations received for an instruction. (instruction_id, counter_party) -> AuthorizationStatus
       **/
      authsReceived: AugmentedQueryDoubleMap<
        ApiType,
        (
          key1: u64 | AnyNumber | Uint8Array,
          key2: PortfolioId | { did?: any; kind?: any } | string | Uint8Array
        ) => Observable<AuthorizationStatus>
      >;
      /**
       * Number of authorizations pending before instruction is executed. instruction_id -> auths_pending
       **/
      instructionAuthsPending: AugmentedQuery<
        ApiType,
        (arg: u64 | AnyNumber | Uint8Array) => Observable<u64>
      >;
      /**
       * Number of instructions in the system (It's one more than the actual number)
       **/
      instructionCounter: AugmentedQuery<ApiType, () => Observable<u64>>;
      /**
       * Details about an instruction. instruction_id -> instruction_details
       **/
      instructionDetails: AugmentedQuery<
        ApiType,
        (arg: u64 | AnyNumber | Uint8Array) => Observable<Instruction>
      >;
      /**
       * Legs under an instruction. (instruction_id, leg_id) -> Leg
       **/
      instructionLegs: AugmentedQueryDoubleMap<
        ApiType,
        (key1: u64 | AnyNumber | Uint8Array, key2: u64 | AnyNumber | Uint8Array) => Observable<Leg>
      >;
      /**
       * Status of a leg under an instruction. (instruction_id, leg_id) -> LegStatus
       **/
      instructionLegStatus: AugmentedQueryDoubleMap<
        ApiType,
        (
          key1: u64 | AnyNumber | Uint8Array,
          key2: u64 | AnyNumber | Uint8Array
        ) => Observable<LegStatus>
      >;
      /**
       * Tracks redemption of receipts. (signer, receipt_uid) -> receipt_used
       **/
      receiptsUsed: AugmentedQueryDoubleMap<
        ApiType,
        (
          key1: AccountId | string | Uint8Array,
          key2: u64 | AnyNumber | Uint8Array
        ) => Observable<bool>
      >;
      /**
       * The list of scheduled instructions with the block numbers in which those instructions
       * become eligible to be executed. BlockNumber -> Vec<instruction_id>
       **/
      scheduledInstructions: AugmentedQuery<
        ApiType,
        (arg: BlockNumber | AnyNumber | Uint8Array) => Observable<Vec<u64>>
      >;
      /**
       * Helps a user track their pending instructions and authorizations (only needed for UI).
       * (counter_party, instruction_id) -> AuthorizationStatus
       **/
      userAuths: AugmentedQueryDoubleMap<
        ApiType,
        (
          key1: PortfolioId | { did?: any; kind?: any } | string | Uint8Array,
          key2: u64 | AnyNumber | Uint8Array
        ) => Observable<AuthorizationStatus>
      >;
      /**
       * Array of venues created by an identity. Only needed for the UI. IdentityId -> Vec<venue_id>
       **/
      userVenues: AugmentedQuery<
        ApiType,
        (arg: IdentityId | string | Uint8Array) => Observable<Vec<u64>>
      >;
      /**
       * Venues that are allowed to create instructions involving a particular ticker. Oly used if filtering is enabled.
       * (ticker, venue_id) -> allowed
       **/
      venueAllowList: AugmentedQueryDoubleMap<
        ApiType,
        (key1: Ticker | string | Uint8Array, key2: u64 | AnyNumber | Uint8Array) => Observable<bool>
      >;
      /**
       * Number of venues in the system (It's one more than the actual number)
       **/
      venueCounter: AugmentedQuery<ApiType, () => Observable<u64>>;
      /**
       * Tracks if a token has enabled filtering venues that can create instructions involving their token. Ticker -> filtering_enabled
       **/
      venueFiltering: AugmentedQuery<
        ApiType,
        (arg: Ticker | string | Uint8Array) => Observable<bool>
      >;
      /**
       * Info about a venue. venue_id -> venue_details
       **/
      venueInfo: AugmentedQuery<ApiType, (arg: u64 | AnyNumber | Uint8Array) => Observable<Venue>>;
      /**
       * Signers authorized by the venue. (venue_id, signer) -> authorized_bool
       **/
      venueSigners: AugmentedQueryDoubleMap<
        ApiType,
        (
          key1: u64 | AnyNumber | Uint8Array,
          key2: AccountId | string | Uint8Array
        ) => Observable<bool>
      >;
    };
    staking: {
      /**
       * The active era information, it holds index and start.
       *
       * The active era is the era currently rewarded.
       * Validator set of this era must be equal to `SessionInterface::validators`.
       **/
      activeEra: AugmentedQuery<ApiType, () => Observable<Option<ActiveEraInfo>>>;
      /**
       * Map from all locked "stash" accounts to the controller account.
       **/
      bonded: AugmentedQuery<
        ApiType,
        (arg: AccountId | string | Uint8Array) => Observable<Option<AccountId>>
      >;
      /**
       * A mapping from still-bonded eras to the first session index of that era.
       *
       * Must contains information for eras for the range:
       * `[active_era - bounding_duration; active_era]`
       **/
      bondedEras: AugmentedQuery<ApiType, () => Observable<Vec<ITuple<[EraIndex, SessionIndex]>>>>;
      /**
       * The amount of currency given to reporters of a slash event which was
       * canceled by extraordinary circumstances (e.g. governance).
       **/
      canceledSlashPayout: AugmentedQuery<ApiType, () => Observable<BalanceOf>>;
      /**
       * The current era index.
       *
       * This is the latest planned era, depending on how the Session pallet queues the validator
       * set, it might be active or not.
       **/
      currentEra: AugmentedQuery<ApiType, () => Observable<Option<EraIndex>>>;
      /**
       * The earliest era for which we have a pending, unapplied slash.
       **/
      earliestUnappliedSlash: AugmentedQuery<ApiType, () => Observable<Option<EraIndex>>>;
      /**
       * Flag to control the execution of the offchain election. When `Open(_)`, we accept
       * solutions to be submitted.
       **/
      eraElectionStatus: AugmentedQuery<ApiType, () => Observable<ElectionStatus>>;
      /**
       * Rewards for the last `HISTORY_DEPTH` eras.
       * If reward hasn't been set or has been removed then 0 reward is returned.
       **/
      erasRewardPoints: AugmentedQuery<
        ApiType,
        (arg: EraIndex | AnyNumber | Uint8Array) => Observable<EraRewardPoints>
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
        ) => Observable<Exposure>
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
        ) => Observable<Exposure>
      >;
      /**
       * The session index at which the era start for the last `HISTORY_DEPTH` eras.
       **/
      erasStartSessionIndex: AugmentedQuery<
        ApiType,
        (arg: EraIndex | AnyNumber | Uint8Array) => Observable<Option<SessionIndex>>
      >;
      /**
       * The total amount staked for the last `HISTORY_DEPTH` eras.
       * If total hasn't been set or has been removed then 0 stake is returned.
       **/
      erasTotalStake: AugmentedQuery<
        ApiType,
        (arg: EraIndex | AnyNumber | Uint8Array) => Observable<BalanceOf>
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
        ) => Observable<ValidatorPrefs>
      >;
      /**
       * The total validator era payout for the last `HISTORY_DEPTH` eras.
       *
       * Eras that haven't finished yet or has been removed doesn't have reward.
       **/
      erasValidatorReward: AugmentedQuery<
        ApiType,
        (arg: EraIndex | AnyNumber | Uint8Array) => Observable<Option<BalanceOf>>
      >;
      /**
       * Mode of era forcing.
       **/
      forceEra: AugmentedQuery<ApiType, () => Observable<Forcing>>;
      /**
       * Number of eras to keep in history.
       *
       * Information is kept for eras in `[current_era - history_depth; current_era]`.
       *
       * Must be more than the number of eras delayed by session otherwise. I.e. active era must
       * always be in history. I.e. `active_era > current_era - history_depth` must be
       * guaranteed.
       **/
      historyDepth: AugmentedQuery<ApiType, () => Observable<u32>>;
      /**
       * Any validators that may never be slashed or forcibly kicked. It's a Vec since they're
       * easy to initialize and the performance hit is minimal (we expect no more than four
       * invulnerables) and restricted to testnets.
       **/
      invulnerables: AugmentedQuery<ApiType, () => Observable<Vec<AccountId>>>;
      /**
       * True if the current **planned** session is final. Note that this does not take era
       * forcing into account.
       **/
      isCurrentSessionFinal: AugmentedQuery<ApiType, () => Observable<bool>>;
      /**
       * Map from all (unlocked) "controller" accounts to the info regarding the staking.
       **/
      ledger: AugmentedQuery<
        ApiType,
        (arg: AccountId | string | Uint8Array) => Observable<Option<StakingLedger>>
      >;
      /**
       * The minimum amount with which a validator can bond.
       **/
      minimumBondThreshold: AugmentedQuery<ApiType, () => Observable<BalanceOf>>;
      /**
       * Minimum number of staking participants before emergency conditions are imposed.
       **/
      minimumValidatorCount: AugmentedQuery<ApiType, () => Observable<u32>>;
      /**
       * The map from nominator stash key to the set of stash keys of all validators to nominate.
       **/
      nominators: AugmentedQuery<
        ApiType,
        (arg: AccountId | string | Uint8Array) => Observable<Option<Nominations>>
      >;
      /**
       * All slashing events on nominators, mapped by era to the highest slash value of the era.
       **/
      nominatorSlashInEra: AugmentedQueryDoubleMap<
        ApiType,
        (
          key1: EraIndex | AnyNumber | Uint8Array,
          key2: AccountId | string | Uint8Array
        ) => Observable<Option<BalanceOf>>
      >;
      /**
       * Where the reward payment should be made. Keyed by stash.
       **/
      payee: AugmentedQuery<
        ApiType,
        (arg: AccountId | string | Uint8Array) => Observable<RewardDestination>
      >;
      /**
       * The map from (wannabe) validators to the status of compliance.
       **/
      permissionedValidators: AugmentedQuery<
        ApiType,
        (arg: AccountId | string | Uint8Array) => Observable<bool>
      >;
      /**
       * The next validator set. At the end of an era, if this is available (potentially from the
       * result of an offchain worker), it is immediately used. Otherwise, the on-chain election
       * is executed.
       **/
      queuedElected: AugmentedQuery<ApiType, () => Observable<Option<ElectionResult>>>;
      /**
       * The score of the current [`QueuedElected`].
       **/
      queuedScore: AugmentedQuery<ApiType, () => Observable<Option<ElectionScore>>>;
      /**
       * Slashing spans for stash accounts.
       **/
      slashingSpans: AugmentedQuery<
        ApiType,
        (arg: AccountId | string | Uint8Array) => Observable<Option<SlashingSpans>>
      >;
      /**
       * The percentage of the slash that is distributed to reporters.
       *
       * The rest of the slashed value is handled by the `Slash`.
       **/
      slashRewardFraction: AugmentedQuery<ApiType, () => Observable<Perbill>>;
      /**
       * Snapshot of nominators at the beginning of the current election window. This should only
       * have a value when [`EraElectionStatus`] == `ElectionStatus::Open(_)`.
       **/
      snapshotNominators: AugmentedQuery<ApiType, () => Observable<Option<Vec<AccountId>>>>;
      /**
       * Snapshot of validators at the beginning of the current election window. This should only
       * have a value when [`EraElectionStatus`] == `ElectionStatus::Open(_)`.
       **/
      snapshotValidators: AugmentedQuery<ApiType, () => Observable<Option<Vec<AccountId>>>>;
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
        ) => Observable<SpanRecord>
      >;
      /**
       * All unapplied slashes that are queued for later.
       **/
      unappliedSlashes: AugmentedQuery<
        ApiType,
        (arg: EraIndex | AnyNumber | Uint8Array) => Observable<Vec<UnappliedSlash>>
      >;
      /**
       * Commission rate to be used by all validators.
       **/
      validatorCommission: AugmentedQuery<ApiType, () => Observable<Commission>>;
      /**
       * The ideal number of staking participants.
       **/
      validatorCount: AugmentedQuery<ApiType, () => Observable<u32>>;
      /**
       * The map from (wannabe) validator stash key to the preferences of that validator.
       **/
      validators: AugmentedQuery<
        ApiType,
        (arg: AccountId | string | Uint8Array) => Observable<ValidatorPrefs>
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
        ) => Observable<Option<ITuple<[Perbill, BalanceOf]>>>
      >;
    };
    statistic: {
      /**
       * Number of investor per asset.
       **/
      investorCountPerAsset: AugmentedQuery<
        ApiType,
        (arg: Ticker | string | Uint8Array) => Observable<Counter>
      >;
    };
    sto: {
      /**
       * Total fundraisers created for a token
       **/
      fundraiserCount: AugmentedQuery<
        ApiType,
        (arg: Ticker | string | Uint8Array) => Observable<u64>
      >;
      /**
       * All fundraisers that are currently running. (ticker, fundraiser_id) -> Fundraiser
       **/
      fundraisers: AugmentedQueryDoubleMap<
        ApiType,
        (
          key1: Ticker | string | Uint8Array,
          key2: u64 | AnyNumber | Uint8Array
        ) => Observable<Fundraiser>
      >;
    };
    stoCapped: {
      /**
       * To track the investment data of the investor corresponds to ticker
       * (asset_ticker, sto_id, DID) -> Investment structure
       **/
      investmentData: AugmentedQuery<
        ApiType,
        (
          arg:
            | ITuple<[Ticker, u32, IdentityId]>
            | [
                Ticker | string | Uint8Array,
                u32 | AnyNumber | Uint8Array,
                IdentityId | string | Uint8Array
              ]
        ) => Observable<Investment>
      >;
      /**
       * To track the investment amount of the investor corresponds to ticker
       * (asset_ticker, sto_id, accountId) -> Invested balance
       **/
      simpleTokenSpent: AugmentedQuery<
        ApiType,
        (
          arg:
            | ITuple<[Ticker, u32, IdentityId]>
            | [
                Ticker | string | Uint8Array,
                u32 | AnyNumber | Uint8Array,
                IdentityId | string | Uint8Array
              ]
        ) => Observable<Balance>
      >;
      /**
       * It returns the sto count corresponds to its ticker
       * ticker -> sto count
       **/
      stoCount: AugmentedQuery<ApiType, (arg: Ticker | string | Uint8Array) => Observable<u32>>;
      /**
       * Tokens can have multiple exemptions that (for now) check entries individually within each other
       * (ticker, sto_id) -> STO
       **/
      stosByToken: AugmentedQuery<
        ApiType,
        (
          arg: ITuple<[Ticker, u32]> | [Ticker | string | Uint8Array, u32 | AnyNumber | Uint8Array]
        ) => Observable<STO>
      >;
    };
    sudo: {
      /**
       * The `AccountId` of the sudo key.
       **/
      key: AugmentedQuery<ApiType, () => Observable<AccountId>>;
    };
    system: {
      /**
       * The full account information for a particular account ID.
       **/
      account: AugmentedQuery<
        ApiType,
        (arg: AccountId | string | Uint8Array) => Observable<AccountInfo>
      >;
      /**
       * Total length (in bytes) for all extrinsics put together, for the current block.
       **/
      allExtrinsicsLen: AugmentedQuery<ApiType, () => Observable<Option<u32>>>;
      /**
       * Map of block numbers to block hashes.
       **/
      blockHash: AugmentedQuery<
        ApiType,
        (arg: BlockNumber | AnyNumber | Uint8Array) => Observable<Hash>
      >;
      /**
       * The current weight for the block.
       **/
      blockWeight: AugmentedQuery<ApiType, () => Observable<ExtrinsicsWeight>>;
      /**
       * Digest of the current block, also part of the block header.
       **/
      digest: AugmentedQuery<ApiType, () => Observable<DigestOf>>;
      /**
       * The number of events in the `Events<T>` list.
       **/
      eventCount: AugmentedQuery<ApiType, () => Observable<EventIndex>>;
      /**
       * Events deposited for the current block.
       **/
      events: AugmentedQuery<ApiType, () => Observable<Vec<EventRecord>>>;
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
        (arg: Hash | string | Uint8Array) => Observable<Vec<ITuple<[BlockNumber, EventIndex]>>>
      >;
      /**
       * The execution phase of the block.
       **/
      executionPhase: AugmentedQuery<ApiType, () => Observable<Option<Phase>>>;
      /**
       * Total extrinsics count for the current block.
       **/
      extrinsicCount: AugmentedQuery<ApiType, () => Observable<Option<u32>>>;
      /**
       * Extrinsics data for the current block (maps an extrinsic's index to its data).
       **/
      extrinsicData: AugmentedQuery<
        ApiType,
        (arg: u32 | AnyNumber | Uint8Array) => Observable<Bytes>
      >;
      /**
       * Extrinsics root of the current block, also part of the block header.
       **/
      extrinsicsRoot: AugmentedQuery<ApiType, () => Observable<Hash>>;
      /**
       * Stores the `spec_version` and `spec_name` of when the last runtime upgrade happened.
       **/
      lastRuntimeUpgrade: AugmentedQuery<ApiType, () => Observable<Option<LastRuntimeUpgradeInfo>>>;
      /**
       * The current block number being processed. Set by `execute_block`.
       **/
      number: AugmentedQuery<ApiType, () => Observable<BlockNumber>>;
      /**
       * Hash of the previous block.
       **/
      parentHash: AugmentedQuery<ApiType, () => Observable<Hash>>;
    };
    technicalCommittee: {
      /**
       * The current members of the committee.
       **/
      members: AugmentedQuery<ApiType, () => Observable<Vec<IdentityId>>>;
      /**
       * Proposals so far.
       **/
      proposalCount: AugmentedQuery<ApiType, () => Observable<u32>>;
      /**
       * Actual proposal for a given hash.
       **/
      proposalOf: AugmentedQuery<
        ApiType,
        (arg: Hash | string | Uint8Array) => Observable<Option<Proposal>>
      >;
      /**
       * The hashes of the active proposals.
       **/
      proposals: AugmentedQuery<ApiType, () => Observable<Vec<Hash>>>;
      /**
       * Release coordinator.
       **/
      releaseCoordinator: AugmentedQuery<ApiType, () => Observable<Option<IdentityId>>>;
      /**
       * Vote threshold for an approval.
       **/
      voteThreshold: AugmentedQuery<ApiType, () => Observable<ITuple<[u32, u32]>>>;
      /**
       * PolymeshVotes on a given proposal, if it is ongoing.
       **/
      voting: AugmentedQuery<
        ApiType,
        (arg: Hash | string | Uint8Array) => Observable<Option<PolymeshVotes>>
      >;
    };
    technicalCommitteeMembership: {
      /**
       * The current "active" membership, stored as an ordered Vec.
       **/
      activeMembers: AugmentedQuery<ApiType, () => Observable<Vec<IdentityId>>>;
      /**
       * Limit of how many "active" members there can be.
       **/
      activeMembersLimit: AugmentedQuery<ApiType, () => Observable<u32>>;
      /**
       * The current "inactive" membership, stored as an ordered Vec.
       **/
      inactiveMembers: AugmentedQuery<ApiType, () => Observable<Vec<InactiveMember>>>;
    };
    timestamp: {
      /**
       * Did the timestamp get updated in this block?
       **/
      didUpdate: AugmentedQuery<ApiType, () => Observable<bool>>;
      /**
       * Current time for the current block.
       **/
      now: AugmentedQuery<ApiType, () => Observable<Moment>>;
    };
    transactionPayment: {
      nextFeeMultiplier: AugmentedQuery<ApiType, () => Observable<Multiplier>>;
    };
    upgradeCommittee: {
      /**
       * The current members of the committee.
       **/
      members: AugmentedQuery<ApiType, () => Observable<Vec<IdentityId>>>;
      /**
       * Proposals so far.
       **/
      proposalCount: AugmentedQuery<ApiType, () => Observable<u32>>;
      /**
       * Actual proposal for a given hash.
       **/
      proposalOf: AugmentedQuery<
        ApiType,
        (arg: Hash | string | Uint8Array) => Observable<Option<Proposal>>
      >;
      /**
       * The hashes of the active proposals.
       **/
      proposals: AugmentedQuery<ApiType, () => Observable<Vec<Hash>>>;
      /**
       * Release coordinator.
       **/
      releaseCoordinator: AugmentedQuery<ApiType, () => Observable<Option<IdentityId>>>;
      /**
       * Vote threshold for an approval.
       **/
      voteThreshold: AugmentedQuery<ApiType, () => Observable<ITuple<[u32, u32]>>>;
      /**
       * PolymeshVotes on a given proposal, if it is ongoing.
       **/
      voting: AugmentedQuery<
        ApiType,
        (arg: Hash | string | Uint8Array) => Observable<Option<PolymeshVotes>>
      >;
    };
    upgradeCommitteeMembership: {
      /**
       * The current "active" membership, stored as an ordered Vec.
       **/
      activeMembers: AugmentedQuery<ApiType, () => Observable<Vec<IdentityId>>>;
      /**
       * Limit of how many "active" members there can be.
       **/
      activeMembersLimit: AugmentedQuery<ApiType, () => Observable<u32>>;
      /**
       * The current "inactive" membership, stored as an ordered Vec.
       **/
      inactiveMembers: AugmentedQuery<ApiType, () => Observable<Vec<InactiveMember>>>;
    };
    utility: {
      nonces: AugmentedQuery<
        ApiType,
        (arg: AccountId | string | Uint8Array) => Observable<AuthorizationNonce>
      >;
    };
    voting: {
      /**
       * Mapping of ticker and ballot name -> ballot details
       **/
      ballots: AugmentedQuery<
        ApiType,
        (
          arg: ITuple<[Ticker, Bytes]> | [Ticker | string | Uint8Array, Bytes | string | Uint8Array]
        ) => Observable<Ballot>
      >;
      /**
       * (Ticker, BallotName) -> Vector of current vote weights.
       * weight at 0 index means weight for choice 1 of motion 1.
       * weight at 1 index means weight for choice 2 of motion 1.
       **/
      results: AugmentedQuery<
        ApiType,
        (
          arg: ITuple<[Ticker, Bytes]> | [Ticker | string | Uint8Array, Bytes | string | Uint8Array]
        ) => Observable<Vec<Balance>>
      >;
      /**
       * Helper data to make voting cheaper.
       * (ticker, BallotName) -> NoOfChoices
       **/
      totalChoices: AugmentedQuery<
        ApiType,
        (
          arg: ITuple<[Ticker, Bytes]> | [Ticker | string | Uint8Array, Bytes | string | Uint8Array]
        ) => Observable<u64>
      >;
      /**
       * (Ticker, BallotName, DID) -> Vector of vote weights.
       * weight at 0 index means weight for choice 1 of motion 1.
       * weight at 1 index means weight for choice 2 of motion 1.
       * User must enter 0 vote weight if they don't want to vote for a choice.
       **/
      votes: AugmentedQuery<
        ApiType,
        (
          arg:
            | ITuple<[Ticker, Bytes, IdentityId]>
            | [
                Ticker | string | Uint8Array,
                Bytes | string | Uint8Array,
                IdentityId | string | Uint8Array
              ]
        ) => Observable<Vec<Balance>>
      >;
    };
  }

  export interface QueryableStorage<ApiType extends ApiTypes> extends AugmentedQueries<ApiType> {}
}
