// Auto-generated via `yarn polkadot-types-from-chain`, do not edit
/* eslint-disable @typescript-eslint/no-empty-interface */

import { ApiTypes } from '@polkadot/api/types';
import { Option, U8aFixed, Vec } from '@polkadot/types/codec';
import { UncleEntryItem } from '@polkadot/types/interfaces/authorship';
import { BabeAuthorityWeight, MaybeVrf } from '@polkadot/types/interfaces/babe';
import { BalanceLock, VestingSchedule } from '@polkadot/types/interfaces/balances';
import { ProposalIndex } from '@polkadot/types/interfaces/collective';
import { AuthorityId } from '@polkadot/types/interfaces/consensus';
import {
  CodeHash,
  ContractInfo,
  Gas,
  PrefabWasmModule,
  Schedule,
} from '@polkadot/types/interfaces/contracts';
import { Proposal } from '@polkadot/types/interfaces/democracy';
import {
  AuthorityList,
  SetId,
  StoredPendingChange,
  StoredState,
} from '@polkadot/types/interfaces/grandpa';
import { AuthIndex } from '@polkadot/types/interfaces/imOnline';
import {
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
  Hash,
  Index,
  KeyTypeId,
  Moment,
  Perbill,
  ValidatorId,
  Weight,
} from '@polkadot/types/interfaces/runtime';
import { Keys, SessionIndex } from '@polkadot/types/interfaces/session';
import {
  EraIndex,
  EraPoints,
  Exposure,
  Forcing,
  MomentOf,
  Nominations,
  RewardDestination,
  SlashingSpans,
  SpanIndex,
  SpanRecord,
  StakingLedger,
  UnappliedSlash,
  ValidatorPrefs,
} from '@polkadot/types/interfaces/staking';
import { DigestOf, EventIndex, EventRecord } from '@polkadot/types/interfaces/system';
import { TreasuryProposal } from '@polkadot/types/interfaces/treasury';
import { Multiplier } from '@polkadot/types/interfaces/txpayment';
import { bool, Bytes, u16, u32, u64 } from '@polkadot/types/primitive';
import { AnyNumber, ITuple } from '@polkadot/types/types';
import {
  AccountKey,
  AssetIdentifier,
  AssetRules,
  Authorization,
  AuthorizationNonce,
  Ballot,
  BridgeTx,
  ClaimIdentifier,
  Commission,
  Counter,
  DidRecord,
  Dividend,
  FundingRoundName,
  IdentifierType,
  IdentityClaim,
  IdentityId,
  Investment,
  Link,
  LinkedKeyInfo,
  MIP,
  MipsIndex,
  MipsMetadata,
  OfflineSlashingParams,
  PermissionedValidator,
  PolymeshReferendumInfo,
  PolymeshVotes,
  PreAuthorizedKeyInfo,
  ProportionMatch,
  SecurityToken,
  Signatory,
  SimpleTokenRecord,
  SmartExtension,
  SmartExtensionType,
  STO,
  TargetIdAuthorization,
  Ticker,
  TickerRegistration,
  TickerRegistrationConfig,
} from 'polymesh-types/polymesh';
import { Observable } from 'rxjs';

declare module '@polkadot/api/types/storage' {
  export interface AugmentedQueries<ApiType> {
    system: {
      /**
       * Extrinsics nonce for accounts.
       **/
      accountNonce: AugmentedQuery<
        ApiType,
        (arg: AccountId | string | Uint8Array) => Observable<Index>
      >;
      /**
       * Total extrinsics count for the current block.
       **/
      extrinsicCount: AugmentedQuery<ApiType, () => Observable<Option<u32>>>;
      /**
       * Total weight for all extrinsics put together, for the current block.
       **/
      allExtrinsicsWeight: AugmentedQuery<ApiType, () => Observable<Option<Weight>>>;
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
       * Extrinsics data for the current block (maps an extrinsic's index to its data).
       **/
      extrinsicData: AugmentedQuery<
        ApiType,
        (arg: u32 | AnyNumber | Uint8Array) => Observable<Bytes>
      >;
      /**
       * The current block number being processed. Set by `execute_block`.
       **/
      number: AugmentedQuery<ApiType, () => Observable<BlockNumber>>;
      /**
       * Hash of the previous block.
       **/
      parentHash: AugmentedQuery<ApiType, () => Observable<Hash>>;
      /**
       * Extrinsics root of the current block, also part of the block header.
       **/
      extrinsicsRoot: AugmentedQuery<ApiType, () => Observable<Hash>>;
      /**
       * Digest of the current block, also part of the block header.
       **/
      digest: AugmentedQuery<ApiType, () => Observable<DigestOf>>;
      /**
       * Events deposited for the current block.
       **/
      events: AugmentedQuery<ApiType, () => Observable<Vec<EventRecord>>>;
      /**
       * The number of events in the `Events<T>` list.
       **/
      eventCount: AugmentedQuery<ApiType, () => Observable<EventIndex>>;
      /**
       * Mapping between a topic (represented by T::Hash) and a vector of indexes
       * of events in the `<Events<T>>` list.
       * The first key serves no purpose. This field is declared as double_map just
       * for convenience of using `remove_prefix`.
       * All topic vectors have deterministic storage locations depending on the topic. This
       * allows light-clients to leverage the changes trie storage tracking mechanism and
       * in case of changes fetch the list of events of interest.
       * The value has the type `(T::BlockNumber, EventIndex)` because if we used only just
       * the `EventIndex` then in case if the topic has the same contents on the next block
       * no notification will be triggered thus the event might be lost.
       **/
      eventTopics: AugmentedQueryDoubleMap<
        ApiType,
        (
          key1: null,
          key2: Hash | string | Uint8Array
        ) => Observable<Vec<ITuple<[BlockNumber, EventIndex]>>>
      >;
    };
    babe: {
      /**
       * Current epoch index.
       **/
      epochIndex: AugmentedQuery<ApiType, () => Observable<u64>>;
      /**
       * Current epoch authorities.
       **/
      authorities: AugmentedQuery<
        ApiType,
        () => Observable<Vec<ITuple<[AuthorityId, BabeAuthorityWeight]>>>
      >;
      /**
       * The slot at which the first epoch actually started. This is 0
       * until the first block of the chain.
       **/
      genesisSlot: AugmentedQuery<ApiType, () => Observable<u64>>;
      /**
       * Current slot number.
       **/
      currentSlot: AugmentedQuery<ApiType, () => Observable<u64>>;
      /**
       * The epoch randomness for the *current* epoch.
       * # Security
       * This MUST NOT be used for gambling, as it can be influenced by a
       * malicious validator in the short term. It MAY be used in many
       * cryptographic protocols, however, so long as one remembers that this
       * (like everything else on-chain) it is public. For example, it can be
       * used where a number is needed that cannot have been chosen by an
       * adversary, for purposes such as public-coin zero-knowledge proofs.
       **/
      randomness: AugmentedQuery<ApiType, () => Observable<U8aFixed>>;
      /**
       * Next epoch randomness.
       **/
      nextRandomness: AugmentedQuery<ApiType, () => Observable<U8aFixed>>;
      /**
       * Randomness under construction.
       * We make a tradeoff between storage accesses and list length.
       * We store the under-construction randomness in segments of up to
       * `UNDER_CONSTRUCTION_SEGMENT_LENGTH`.
       * Once a segment reaches this length, we begin the next one.
       * We reset all segments and return to `0` at the beginning of every
       * epoch.
       **/
      segmentIndex: AugmentedQuery<ApiType, () => Observable<u32>>;
      underConstruction: AugmentedQuery<
        ApiType,
        (arg: u32 | AnyNumber | Uint8Array) => Observable<Vec<U8aFixed>>
      >;
      /**
       * Temporary value (cleared at block finalization) which is `Some`
       * if per-block initialization has already been called for current block.
       **/
      initialized: AugmentedQuery<ApiType, () => Observable<Option<MaybeVrf>>>;
    };
    timestamp: {
      /**
       * Current time for the current block.
       **/
      now: AugmentedQuery<ApiType, () => Observable<Moment>>;
      /**
       * Did the timestamp get updated in this block?
       **/
      didUpdate: AugmentedQuery<ApiType, () => Observable<bool>>;
    };
    indices: {
      /**
       * The next free enumeration set.
       **/
      nextEnumSet: AugmentedQuery<ApiType, () => Observable<AccountIndex>>;
      /**
       * The enumeration sets.
       **/
      enumSet: AugmentedQuery<
        ApiType,
        (arg: AccountIndex | AnyNumber | Uint8Array) => Observable<Vec<AccountId>>
      >;
    };
    balances: {
      /**
       * The total units issued in the system.
       **/
      totalIssuance: AugmentedQuery<ApiType, () => Observable<Balance>>;
      /**
       * Information regarding the vesting of a given account.
       **/
      vesting: AugmentedQuery<
        ApiType,
        (arg: AccountId | string | Uint8Array) => Observable<Option<VestingSchedule>>
      >;
      /**
       * The 'free' balance of a given account.
       * This is the only balance that matters in terms of most operations on tokens. It
       * alone is used to determine the balance when in the contract execution environment.
       **/
      freeBalance: AugmentedQuery<
        ApiType,
        (arg: AccountId | string | Uint8Array) => Observable<Balance>
      >;
      /**
       * The amount of the balance of a given account that is externally reserved; this can still get
       * slashed, but gets slashed last of all.
       * This balance is a 'reserve' balance that other subsystems use in order to set aside tokens
       * that are still 'owned' by the account holder, but which are suspendable.
       **/
      reservedBalance: AugmentedQuery<
        ApiType,
        (arg: AccountId | string | Uint8Array) => Observable<Balance>
      >;
      /**
       * Any liquidity locks on some account balances.
       **/
      locks: AugmentedQuery<
        ApiType,
        (arg: AccountId | string | Uint8Array) => Observable<Vec<BalanceLock>>
      >;
      /**
       * Balance held by the identity. It can be spent by its signing keys.
       **/
      identityBalance: AugmentedQuery<
        ApiType,
        (arg: IdentityId | string | Uint8Array) => Observable<Balance>
      >;
      /**
       * Signing key => Charge Fee to did?. Default is false i.e. the fee will be charged from user balance
       **/
      chargeDid: AugmentedQuery<
        ApiType,
        (arg: AccountKey | string | Uint8Array) => Observable<bool>
      >;
      /**
       * AccountId of the block rewards reserve
       **/
      blockRewardsReserve: AugmentedQuery<ApiType, () => Observable<AccountId>>;
    };
    authorship: {
      /**
       * Uncles
       **/
      uncles: AugmentedQuery<ApiType, () => Observable<Vec<UncleEntryItem>>>;
      /**
       * Author of current block.
       **/
      author: AugmentedQuery<ApiType, () => Observable<Option<AccountId>>>;
      /**
       * Whether uncles were already set in this block.
       **/
      didSetUncles: AugmentedQuery<ApiType, () => Observable<bool>>;
    };
    staking: {
      /**
       * The ideal number of staking participants.
       **/
      validatorCount: AugmentedQuery<ApiType, () => Observable<u32>>;
      /**
       * Minimum number of staking participants before emergency conditions are imposed.
       **/
      minimumValidatorCount: AugmentedQuery<ApiType, () => Observable<u32>>;
      /**
       * Any validators that may never be slashed or forcibly kicked. It's a Vec since they're
       * easy to initialize and the performance hit is minimal (we expect no more than four
       * invulnerables) and restricted to testnets.
       **/
      invulnerables: AugmentedQuery<ApiType, () => Observable<Vec<AccountId>>>;
      /**
       * Map from all locked "stash" accounts to the controller account.
       **/
      bonded: AugmentedQuery<
        ApiType,
        (arg: AccountId | string | Uint8Array) => Observable<Option<AccountId>>
      >;
      /**
       * Map from all (unlocked) "controller" accounts to the info regarding the staking.
       **/
      ledger: AugmentedQuery<
        ApiType,
        (arg: AccountId | string | Uint8Array) => Observable<Option<StakingLedger>>
      >;
      /**
       * Where the reward payment should be made. Keyed by stash.
       **/
      payee: AugmentedQuery<
        ApiType,
        (arg: AccountId | string | Uint8Array) => Observable<RewardDestination>
      >;
      /**
       * The map from (wannabe) validator stash key to the preferences of that validator.
       **/
      validators: AugmentedQuery<
        ApiType,
        (arg: AccountId | string | Uint8Array) => Observable<ValidatorPrefs>
      >;
      /**
       * The map from nominator stash key to the set of stash keys of all validators to nominate.
       * NOTE: is private so that we can ensure upgraded before all typical accesses.
       * Direct storage APIs can still bypass this protection.
       **/
      nominators: AugmentedQuery<
        ApiType,
        (arg: AccountId | string | Uint8Array) => Observable<Option<Nominations>>
      >;
      /**
       * Nominators for a particular account that is in action right now. You can't iterate
       * through validators here, but you can find them in the Session module.
       * This is keyed by the stash account.
       **/
      stakers: AugmentedQuery<
        ApiType,
        (arg: AccountId | string | Uint8Array) => Observable<Exposure>
      >;
      /**
       * The currently elected validator set keyed by stash account ID.
       **/
      currentElected: AugmentedQuery<ApiType, () => Observable<Vec<AccountId>>>;
      /**
       * The current era index.
       **/
      currentEra: AugmentedQuery<ApiType, () => Observable<EraIndex>>;
      /**
       * The start of the current era.
       **/
      currentEraStart: AugmentedQuery<ApiType, () => Observable<MomentOf>>;
      /**
       * The session index at which the current era started.
       **/
      currentEraStartSessionIndex: AugmentedQuery<ApiType, () => Observable<SessionIndex>>;
      /**
       * Rewards for the current era. Using indices of current elected set.
       **/
      currentEraPointsEarned: AugmentedQuery<ApiType, () => Observable<EraPoints>>;
      /**
       * The amount of balance actively at stake for each validator slot, currently.
       * This is used to derive rewards and punishments.
       **/
      slotStake: AugmentedQuery<ApiType, () => Observable<BalanceOf>>;
      /**
       * True if the next session change will be a new era regardless of index.
       **/
      forceEra: AugmentedQuery<ApiType, () => Observable<Forcing>>;
      /**
       * The percentage of the slash that is distributed to reporters.
       * The rest of the slashed value is handled by the `Slash`.
       **/
      slashRewardFraction: AugmentedQuery<ApiType, () => Observable<Perbill>>;
      /**
       * The amount of currency given to reporters of a slash event which was
       * canceled by extraordinary circumstances (e.g. governance).
       **/
      canceledSlashPayout: AugmentedQuery<ApiType, () => Observable<BalanceOf>>;
      /**
       * All unapplied slashes that are queued for later.
       **/
      unappliedSlashes: AugmentedQuery<
        ApiType,
        (arg: EraIndex | AnyNumber | Uint8Array) => Observable<Vec<UnappliedSlash>>
      >;
      /**
       * A mapping from still-bonded eras to the first session index of that era.
       **/
      bondedEras: AugmentedQuery<ApiType, () => Observable<Vec<ITuple<[EraIndex, SessionIndex]>>>>;
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
       * Slashing spans for stash accounts.
       **/
      slashingSpans: AugmentedQuery<
        ApiType,
        (arg: AccountId | string | Uint8Array) => Observable<Option<SlashingSpans>>
      >;
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
       * The earliest era for which we have a pending, unapplied slash.
       **/
      earliestUnappliedSlash: AugmentedQuery<ApiType, () => Observable<Option<EraIndex>>>;
      /**
       * The version of storage for upgrade.
       **/
      storageVersion: AugmentedQuery<ApiType, () => Observable<u32>>;
      /**
       * The map from (wannabe) validators to the status of compliance
       **/
      permissionedValidators: AugmentedQuery<
        ApiType,
        (arg: AccountId | string | Uint8Array) => Observable<Option<PermissionedValidator>>
      >;
      /**
       * Commision rate to be used by all validators.
       **/
      validatorCommission: AugmentedQuery<ApiType, () => Observable<Commission>>;
      /**
       * The minimum amount with which a validator can bond.
       **/
      minimumBondThreshold: AugmentedQuery<ApiType, () => Observable<BalanceOf>>;
    };
    offences: {
      /**
       * The primary structure that holds all offence records keyed by report identifiers.
       **/
      reports: AugmentedQuery<
        ApiType,
        (arg: ReportIdOf | string | Uint8Array) => Observable<Option<OffenceDetails>>
      >;
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
       * Enumerates all reports of a kind along with the time they happened.
       * All reports are sorted by the time of offence.
       * Note that the actual type of this mapping is `Vec<u8>`, this is because values of
       * different types are not supported at the moment so we are doing the manual serialization.
       **/
      reportsByKindIndex: AugmentedQuery<
        ApiType,
        (arg: Kind | string | Uint8Array) => Observable<Bytes>
      >;
    };
    session: {
      /**
       * The current set of validators.
       **/
      validators: AugmentedQuery<ApiType, () => Observable<Vec<ValidatorId>>>;
      /**
       * Current index of the session.
       **/
      currentIndex: AugmentedQuery<ApiType, () => Observable<SessionIndex>>;
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
       * Indices of disabled validators.
       * The set is cleared when `on_session_ending` returns a new set of identities.
       **/
      disabledValidators: AugmentedQuery<ApiType, () => Observable<Vec<u32>>>;
      /**
       * The next session keys for a validator.
       * The first key is always `DEDUP_KEY_PREFIX` to have all the data in the same branch of
       * the trie. Having all data in the same branch should prevent slowing down other queries.
       **/
      nextKeys: AugmentedQueryDoubleMap<
        ApiType,
        (
          key1: Bytes | string | Uint8Array,
          key2: ValidatorId | string | Uint8Array
        ) => Observable<Option<Keys>>
      >;
      /**
       * The owner of a key. The second key is the `KeyTypeId` + the encoded key.
       * The first key is always `DEDUP_KEY_PREFIX` to have all the data in the same branch of
       * the trie. Having all data in the same branch should prevent slowing down other queries.
       **/
      keyOwner: AugmentedQueryDoubleMap<
        ApiType,
        (
          key1: Bytes | string | Uint8Array,
          key2:
            | ITuple<[KeyTypeId, Bytes]>
            | [KeyTypeId | AnyNumber | Uint8Array, Bytes | string | Uint8Array]
        ) => Observable<Option<ValidatorId>>
      >;
    };
    grandpa: {
      /**
       * DEPRECATED
       * This used to store the current authority set, which has been migrated to the well-known
       * GRANDPA_AUTHORITES_KEY unhashed key.
       **/
      authorities: AugmentedQuery<ApiType, () => Observable<AuthorityList>>;
      /**
       * State of the current authority set.
       **/
      state: AugmentedQuery<ApiType, () => Observable<StoredState>>;
      /**
       * Pending change: (signaled at, scheduled change).
       **/
      pendingChange: AugmentedQuery<ApiType, () => Observable<Option<StoredPendingChange>>>;
      /**
       * next block number where we can force a change.
       **/
      nextForced: AugmentedQuery<ApiType, () => Observable<Option<BlockNumber>>>;
      /**
       * `true` if we are currently stalled.
       **/
      stalled: AugmentedQuery<
        ApiType,
        () => Observable<Option<ITuple<[BlockNumber, BlockNumber]>>>
      >;
      /**
       * The number of changes (both in terms of keys and underlying economic responsibilities)
       * in the "set" of Grandpa validators from genesis.
       **/
      currentSetId: AugmentedQuery<ApiType, () => Observable<SetId>>;
      /**
       * A mapping from grandpa set ID to the index of the *most recent* session for which its members were responsible.
       **/
      setIdSession: AugmentedQuery<
        ApiType,
        (arg: SetId | AnyNumber | Uint8Array) => Observable<Option<SessionIndex>>
      >;
    };
    imOnline: {
      /**
       * The block number when we should gossip.
       **/
      gossipAt: AugmentedQuery<ApiType, () => Observable<BlockNumber>>;
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
       * Config parameters for slash fraction
       **/
      slashingParams: AugmentedQuery<ApiType, () => Observable<OfflineSlashingParams>>;
    };
    randomnessCollectiveFlip: {
      /**
       * Series of block headers from the last 81 blocks that acts as random seed material. This
       * is arranged as a ring buffer with `block_number % 81` being the index into the `Vec` of
       * the oldest hash.
       **/
      randomMaterial: AugmentedQuery<ApiType, () => Observable<Vec<Hash>>>;
    };
    transactionPayment: {
      nextFeeMultiplier: AugmentedQuery<ApiType, () => Observable<Multiplier>>;
    };
    sudo: {
      /**
       * The `AccountId` of the sudo key.
       **/
      key: AugmentedQuery<ApiType, () => Observable<AccountId>>;
    };
    multiSig: {
      /**
       * Nonce to ensure unique MultiSig addresses are generated. starts from 1.
       **/
      multiSigNonce: AugmentedQuery<ApiType, () => Observable<u64>>;
      /**
       * Signers of a multisig. (mulisig, signer) => signer.
       **/
      multiSigSigners: AugmentedQueryDoubleMap<
        ApiType,
        (
          key1: AccountId | string | Uint8Array,
          key2: Signatory | { identity: any } | { accountKey: any } | string | Uint8Array
        ) => Observable<Signatory>
      >;
      /**
       * Number of approved/accepted signers of a multisig.
       **/
      numberOfSigners: AugmentedQuery<
        ApiType,
        (arg: AccountId | string | Uint8Array) => Observable<u64>
      >;
      /**
       * Confirmations required before processing a multisig tx
       **/
      multiSigSignsRequired: AugmentedQuery<
        ApiType,
        (arg: AccountId | string | Uint8Array) => Observable<u64>
      >;
      /**
       * Number of transactions proposed in a multisig. Used as tx id. starts from 0
       **/
      multiSigTxDone: AugmentedQuery<
        ApiType,
        (arg: AccountId | string | Uint8Array) => Observable<u64>
      >;
      /**
       * Proposals presented for voting to a multisig (multisig, proposal id) => Option<proposal>.
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
       * Number of votes in favor of a tx. Mapping from (multisig, tx id) => no. of approvals.
       **/
      txApprovals: AugmentedQuery<
        ApiType,
        (
          arg:
            | ITuple<[AccountId, u64]>
            | [AccountId | string | Uint8Array, u64 | AnyNumber | Uint8Array]
        ) => Observable<u64>
      >;
      /**
       * Individual multisig signer votes. (multi sig, signer, )
       **/
      votes: AugmentedQuery<
        ApiType,
        (
          arg:
            | ITuple<[AccountId, Signatory, u64]>
            | [
                AccountId | string | Uint8Array,
                Signatory | { identity: any } | { accountKey: any } | string | Uint8Array,
                u64 | AnyNumber | Uint8Array
              ]
        ) => Observable<bool>
      >;
    };
    contracts: {
      /**
       * Gas spent so far in this block.
       **/
      gasSpent: AugmentedQuery<ApiType, () => Observable<Gas>>;
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
      /**
       * A mapping between an original code hash and instrumented wasm code, ready for execution.
       **/
      codeStorage: AugmentedQuery<
        ApiType,
        (arg: CodeHash | string | Uint8Array) => Observable<Option<PrefabWasmModule>>
      >;
      /**
       * The subtrie counter.
       **/
      accountCounter: AugmentedQuery<ApiType, () => Observable<u64>>;
      /**
       * The code associated with a given account.
       **/
      contractInfoOf: AugmentedQuery<
        ApiType,
        (arg: AccountId | string | Uint8Array) => Observable<Option<ContractInfo>>
      >;
      /**
       * The price of one unit of gas.
       **/
      gasPrice: AugmentedQuery<ApiType, () => Observable<BalanceOf>>;
    };
    treasury: {
      /**
       * Number of proposals that have been made.
       **/
      proposalCount: AugmentedQuery<ApiType, () => Observable<ProposalIndex>>;
      /**
       * Proposals that have been made.
       **/
      proposals: AugmentedQuery<
        ApiType,
        (arg: ProposalIndex | AnyNumber | Uint8Array) => Observable<Option<TreasuryProposal>>
      >;
      /**
       * Proposal indices that have been approved but not yet awarded.
       **/
      approvals: AugmentedQuery<ApiType, () => Observable<Vec<ProposalIndex>>>;
    };
    polymeshCommittee: {
      /**
       * The hashes of the active proposals.
       **/
      proposals: AugmentedQuery<ApiType, () => Observable<Vec<Hash>>>;
      /**
       * Actual proposal for a given hash.
       **/
      proposalOf: AugmentedQuery<
        ApiType,
        (arg: Hash | string | Uint8Array) => Observable<Option<Proposal>>
      >;
      /**
       * PolymeshVotes on a given proposal, if it is ongoing.
       **/
      voting: AugmentedQuery<
        ApiType,
        (arg: Hash | string | Uint8Array) => Observable<Option<PolymeshVotes>>
      >;
      /**
       * Proposals so far.
       **/
      proposalCount: AugmentedQuery<ApiType, () => Observable<u32>>;
      /**
       * The current members of the committee.
       **/
      members: AugmentedQuery<ApiType, () => Observable<Vec<IdentityId>>>;
      /**
       * Vote threshold for an approval.
       **/
      voteThreshold: AugmentedQuery<ApiType, () => Observable<ITuple<[ProportionMatch, u32, u32]>>>;
    };
    committeeMembership: {
      /**
       * Identities that are part of this group
       **/
      members: AugmentedQuery<ApiType, () => Observable<Vec<IdentityId>>>;
    };
    mips: {
      /**
       * The minimum amount to be used as a deposit for a public referendum proposal.
       **/
      minimumProposalDeposit: AugmentedQuery<ApiType, () => Observable<BalanceOf>>;
      /**
       * Minimum stake a proposal must gather in order to be considered by the committee.
       **/
      quorumThreshold: AugmentedQuery<ApiType, () => Observable<BalanceOf>>;
      /**
       * How long (in blocks) a ballot runs
       **/
      proposalDuration: AugmentedQuery<ApiType, () => Observable<BlockNumber>>;
      /**
       * Proposals so far. Index can be used to keep track of MIPs off-chain.
       **/
      proposalCount: AugmentedQuery<ApiType, () => Observable<u32>>;
      /**
       * The hashes of the active proposals.
       **/
      proposalMetadata: AugmentedQuery<ApiType, () => Observable<Vec<MipsMetadata>>>;
      /**
       * Those who have locked a deposit.
       * proposal hash -> (deposit, proposer)
       **/
      deposits: AugmentedQuery<
        ApiType,
        (arg: Hash | string | Uint8Array) => Observable<Vec<ITuple<[AccountId, BalanceOf]>>>
      >;
      /**
       * Actual proposal for a given hash, if it's current.
       * proposal hash -> proposal
       **/
      proposals: AugmentedQuery<
        ApiType,
        (arg: Hash | string | Uint8Array) => Observable<Option<MIP>>
      >;
      /**
       * Lookup proposal hash by a proposal's index
       * MIP index -> proposal hash
       **/
      proposalByIndex: AugmentedQuery<
        ApiType,
        (arg: MipsIndex | AnyNumber | Uint8Array) => Observable<Hash>
      >;
      /**
       * PolymeshVotes on a given proposal, if it is ongoing.
       * proposal hash -> vote count
       **/
      voting: AugmentedQuery<
        ApiType,
        (arg: Hash | string | Uint8Array) => Observable<Option<PolymeshVotes>>
      >;
      /**
       * Active referendums.
       **/
      referendumMetadata: AugmentedQuery<ApiType, () => Observable<Vec<PolymeshReferendumInfo>>>;
      /**
       * Proposals that have met the quorum threshold to be put forward to a governance committee
       * proposal hash -> proposal
       **/
      referendums: AugmentedQuery<
        ApiType,
        (arg: Hash | string | Uint8Array) => Observable<Option<Proposal>>
      >;
    };
    asset: {
      /**
       * The DID of the fee collector
       **/
      feeCollector: AugmentedQuery<ApiType, () => Observable<AccountId>>;
      /**
       * Ticker registration details
       * (ticker) -> TickerRegistration
       **/
      tickers: AugmentedQuery<
        ApiType,
        (arg: Ticker | string | Uint8Array) => Observable<TickerRegistration>
      >;
      /**
       * Ticker registration config
       * (ticker) -> TickerRegistrationConfig
       **/
      tickerConfig: AugmentedQuery<ApiType, () => Observable<TickerRegistrationConfig>>;
      /**
       * details of the token corresponding to the token ticker
       * (ticker) -> SecurityToken details [returns SecurityToken struct]
       **/
      tokens: AugmentedQuery<
        ApiType,
        (arg: Ticker | string | Uint8Array) => Observable<SecurityToken>
      >;
      /**
       * Used to store the securityToken balance corresponds to ticker and Identity
       * (ticker, DID) -> balance
       **/
      balanceOf: AugmentedQuery<
        ApiType,
        (
          arg:
            | ITuple<[Ticker, IdentityId]>
            | [Ticker | string | Uint8Array, IdentityId | string | Uint8Array]
        ) => Observable<Balance>
      >;
      /**
       * A map of pairs of a ticker name and an `IdentifierType` to asset identifiers.
       **/
      identifiers: AugmentedQuery<
        ApiType,
        (
          arg:
            | ITuple<[Ticker, IdentifierType]>
            | [
                Ticker | string | Uint8Array,
                (
                  | IdentifierType
                  | { isin: any }
                  | { cusip: any }
                  | { custom: any }
                  | string
                  | Uint8Array
                )
              ]
        ) => Observable<AssetIdentifier>
      >;
      /**
       * (ticker, sender (DID), spender(DID)) -> allowance amount
       **/
      allowance: AugmentedQuery<
        ApiType,
        (
          arg:
            | ITuple<[Ticker, IdentityId, IdentityId]>
            | [
                Ticker | string | Uint8Array,
                IdentityId | string | Uint8Array,
                IdentityId | string | Uint8Array
              ]
        ) => Observable<Balance>
      >;
      /**
       * cost in base currency to create a token
       **/
      assetCreationFee: AugmentedQuery<ApiType, () => Observable<Balance>>;
      /**
       * cost in base currency to register a ticker
       **/
      tickerRegistrationFee: AugmentedQuery<ApiType, () => Observable<Balance>>;
      /**
       * Checkpoints created per token
       * (ticker) -> no. of checkpoints
       **/
      totalCheckpoints: AugmentedQuery<
        ApiType,
        (arg: Ticker | string | Uint8Array) => Observable<u64>
      >;
      /**
       * Total supply of the token at the checkpoint
       * (ticker, checkpointId) -> total supply at given checkpoint
       **/
      checkpointTotalSupply: AugmentedQuery<
        ApiType,
        (
          arg: ITuple<[Ticker, u64]> | [Ticker | string | Uint8Array, u64 | AnyNumber | Uint8Array]
        ) => Observable<Balance>
      >;
      /**
       * Balance of a DID at a checkpoint
       * (ticker, DID, checkpoint ID) -> Balance of a DID at a checkpoint
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
       * Last checkpoint updated for a DID's balance
       * (ticker, DID) -> List of checkpoints where user balance changed
       **/
      userCheckpoints: AugmentedQuery<
        ApiType,
        (
          arg:
            | ITuple<[Ticker, IdentityId]>
            | [Ticker | string | Uint8Array, IdentityId | string | Uint8Array]
        ) => Observable<Vec<u64>>
      >;
      /**
       * Allowance provided to the custodian
       * (ticker, token holder, custodian) -> balance
       **/
      custodianAllowance: AugmentedQuery<
        ApiType,
        (
          arg:
            | ITuple<[Ticker, IdentityId, IdentityId]>
            | [
                Ticker | string | Uint8Array,
                IdentityId | string | Uint8Array,
                IdentityId | string | Uint8Array
              ]
        ) => Observable<Balance>
      >;
      /**
       * Total custodian allowance for a given token holder
       * (ticker, token holder) -> balance
       **/
      totalCustodyAllowance: AugmentedQuery<
        ApiType,
        (
          arg:
            | ITuple<[Ticker, IdentityId]>
            | [Ticker | string | Uint8Array, IdentityId | string | Uint8Array]
        ) => Observable<Balance>
      >;
      /**
       * Store the nonce for off chain signature to increase the custody allowance
       * (ticker, token holder, nonce) -> bool
       **/
      authenticationNonce: AugmentedQuery<
        ApiType,
        (
          arg:
            | ITuple<[Ticker, IdentityId, u16]>
            | [
                Ticker | string | Uint8Array,
                IdentityId | string | Uint8Array,
                u16 | AnyNumber | Uint8Array
              ]
        ) => Observable<bool>
      >;
      /**
       * The name of the current funding round.
       * ticker -> funding round
       **/
      fundingRound: AugmentedQuery<
        ApiType,
        (arg: Ticker | string | Uint8Array) => Observable<FundingRoundName>
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
       * List of Smart extension added for the given tokens
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
       * List of Smart extension added for the given tokens and for the given type
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
                  | { transferManager: any }
                  | { offerings: any }
                  | { custom: any }
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
    };
    bridge: {
      /**
       * The multisig account of the bridge controller. The genesis signers must accept their
       * authorizations to be able to get their proposals delivered.
       **/
      controller: AugmentedQuery<ApiType, () => Observable<AccountId>>;
      /**
       * Pending issuance transactions to identities.
       **/
      pendingTxs: AugmentedQuery<
        ApiType,
        (arg: IdentityId | string | Uint8Array) => Observable<Vec<BridgeTx>>
      >;
      /**
       * Frozen transactions.
       **/
      frozenTxs: AugmentedQuery<
        ApiType,
        (
          arg:
            | BridgeTx
            | { nonce?: any; recipient?: any; value?: any; tx_hash?: any }
            | string
            | Uint8Array
        ) => Observable<bool>
      >;
      /**
       * Handled bridge transactions.
       **/
      handledTxs: AugmentedQuery<
        ApiType,
        (
          arg:
            | BridgeTx
            | { nonce?: any; recipient?: any; value?: any; tx_hash?: any }
            | string
            | Uint8Array
        ) => Observable<bool>
      >;
      /**
       * The admin key.
       **/
      adminKey: AugmentedQuery<ApiType, () => Observable<AccountKey>>;
      /**
       * Whether or not the bridge operation is frozen.
       **/
      frozen: AugmentedQuery<ApiType, () => Observable<bool>>;
    };
    dividend: {
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
       * How many dividends were created for a ticker so far; (ticker) => count
       **/
      dividendCount: AugmentedQuery<
        ApiType,
        (arg: Ticker | string | Uint8Array) => Observable<u32>
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
    identity: {
      /**
       * Module owner.
       **/
      owner: AugmentedQuery<ApiType, () => Observable<AccountId>>;
      /**
       * DID -> identity info
       **/
      didRecords: AugmentedQuery<
        ApiType,
        (arg: IdentityId | string | Uint8Array) => Observable<DidRecord>
      >;
      /**
       * DID -> bool that indicates if signing keys are frozen.
       **/
      isDidFrozen: AugmentedQuery<
        ApiType,
        (arg: IdentityId | string | Uint8Array) => Observable<bool>
      >;
      /**
       * It stores the current identity for current transaction.
       **/
      currentDid: AugmentedQuery<ApiType, () => Observable<Option<IdentityId>>>;
      /**
       * (DID, claim_data, claim_issuer) -> Associated claims
       **/
      claims: AugmentedQueryDoubleMap<
        ApiType,
        (
          key1: IdentityId | string | Uint8Array,
          key2: ClaimIdentifier | { claim?: any; claim_issuer?: any } | string | Uint8Array
        ) => Observable<IdentityClaim>
      >;
      keyToIdentityIds: AugmentedQuery<
        ApiType,
        (arg: AccountKey | string | Uint8Array) => Observable<Option<LinkedKeyInfo>>
      >;
      /**
       * How much does creating a DID cost
       **/
      didCreationFee: AugmentedQuery<ApiType, () => Observable<Balance>>;
      /**
       * Nonce to ensure unique actions. starts from 1.
       **/
      multiPurposeNonce: AugmentedQuery<ApiType, () => Observable<u64>>;
      /**
       * Pre-authorize join to Identity.
       **/
      preAuthorizedJoinDid: AugmentedQuery<
        ApiType,
        (
          arg: Signatory | { identity: any } | { accountKey: any } | string | Uint8Array
        ) => Observable<Vec<PreAuthorizedKeyInfo>>
      >;
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
                Signatory | { identity: any } | { accountKey: any } | string | Uint8Array,
                (
                  | TargetIdAuthorization
                  | { target_id?: any; nonce?: any; expires_at?: any }
                  | string
                  | Uint8Array
                )
              ]
        ) => Observable<bool>
      >;
      /**
       * All authorizations that an identity/key has
       **/
      authorizations: AugmentedQueryDoubleMap<
        ApiType,
        (
          key1: Signatory | { identity: any } | { accountKey: any } | string | Uint8Array,
          key2: u64 | AnyNumber | Uint8Array
        ) => Observable<Authorization>
      >;
      /**
       * All links that an identity/key has
       **/
      links: AugmentedQueryDoubleMap<
        ApiType,
        (
          key1: Signatory | { identity: any } | { accountKey: any } | string | Uint8Array,
          key2: u64 | AnyNumber | Uint8Array
        ) => Observable<Link>
      >;
      /**
       * All authorizations that an identity/key has given. (Authorizer, auth_id -> authorized)
       **/
      authorizationsGiven: AugmentedQueryDoubleMap<
        ApiType,
        (
          key1: Signatory | { identity: any } | { accountKey: any } | string | Uint8Array,
          key2: u64 | AnyNumber | Uint8Array
        ) => Observable<Signatory>
      >;
      cddAuthForMasterKeyRotation: AugmentedQuery<ApiType, () => Observable<bool>>;
    };
    generalTM: {
      /**
       * List of active rules for a ticker (Ticker -> Array of AssetRules)
       **/
      assetRulesMap: AugmentedQuery<
        ApiType,
        (arg: Ticker | string | Uint8Array) => Observable<AssetRules>
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
    };
    stoCapped: {
      /**
       * Tokens can have multiple whitelists that (for now) check entries individually within each other
       * (ticker, sto_id) -> STO
       **/
      stosByToken: AugmentedQuery<
        ApiType,
        (
          arg: ITuple<[Ticker, u32]> | [Ticker | string | Uint8Array, u32 | AnyNumber | Uint8Array]
        ) => Observable<STO>
      >;
      /**
       * It returns the sto count corresponds to its ticker
       * ticker -> sto count
       **/
      stoCount: AugmentedQuery<ApiType, (arg: Ticker | string | Uint8Array) => Observable<u32>>;
      /**
       * List of SimpleToken tokens which will be accepted as the fund raised type for the STO
       * (asset_ticker, sto_id, index) -> simple_token_ticker
       **/
      allowedTokens: AugmentedQuery<
        ApiType,
        (
          arg:
            | ITuple<[Ticker, u32, u32]>
            | [
                Ticker | string | Uint8Array,
                u32 | AnyNumber | Uint8Array,
                u32 | AnyNumber | Uint8Array
              ]
        ) => Observable<Ticker>
      >;
      /**
       * To track the index of the token address for the given STO
       * (Asset_ticker, sto_id, simple_token_ticker) -> index
       **/
      tokenIndexForSTO: AugmentedQuery<
        ApiType,
        (
          arg:
            | ITuple<[Ticker, u32, Ticker]>
            | [
                Ticker | string | Uint8Array,
                u32 | AnyNumber | Uint8Array,
                Ticker | string | Uint8Array
              ]
        ) => Observable<Option<u32>>
      >;
      /**
       * To track the no of different tokens allowed as fund raised type for the given STO
       * (asset_ticker, sto_id) -> count
       **/
      tokensCountForSto: AugmentedQuery<
        ApiType,
        (
          arg: ITuple<[Ticker, u32]> | [Ticker | string | Uint8Array, u32 | AnyNumber | Uint8Array]
        ) => Observable<u32>
      >;
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
       * To track the investment amount of the investor corresponds to ticker using SimpleToken
       * (asset_ticker, simple_token_ticker, sto_id, accountId) -> Invested balance
       **/
      simpleTokenSpent: AugmentedQuery<
        ApiType,
        (
          arg:
            | ITuple<[Ticker, Ticker, u32, IdentityId]>
            | [
                Ticker | string | Uint8Array,
                Ticker | string | Uint8Array,
                u32 | AnyNumber | Uint8Array,
                IdentityId | string | Uint8Array
              ]
        ) => Observable<Balance>
      >;
    };
    percentageTM: {
      maximumPercentageEnabledForToken: AugmentedQuery<
        ApiType,
        (arg: Ticker | string | Uint8Array) => Observable<u16>
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
    simpleToken: {
      /**
       * Mapping from (ticker, owner DID, spender DID) to allowance amount
       **/
      allowance: AugmentedQuery<
        ApiType,
        (
          arg:
            | ITuple<[Ticker, IdentityId, IdentityId]>
            | [
                Ticker | string | Uint8Array,
                IdentityId | string | Uint8Array,
                IdentityId | string | Uint8Array
              ]
        ) => Observable<Balance>
      >;
      /**
       * Mapping from (ticker, owner DID) to their balance
       **/
      balanceOf: AugmentedQuery<
        ApiType,
        (
          arg:
            | ITuple<[Ticker, IdentityId]>
            | [Ticker | string | Uint8Array, IdentityId | string | Uint8Array]
        ) => Observable<Balance>
      >;
      /**
       * The cost to create a new simple token
       **/
      creationFee: AugmentedQuery<ApiType, () => Observable<Balance>>;
      /**
       * The details associated with each simple token
       **/
      tokens: AugmentedQuery<
        ApiType,
        (arg: Ticker | string | Uint8Array) => Observable<SimpleTokenRecord>
      >;
    };
    cddServiceProviders: {
      /**
       * Identities that are part of this group
       **/
      members: AugmentedQuery<ApiType, () => Observable<Vec<IdentityId>>>;
    };
    statistic: {
      investorCountPerAsset: AugmentedQuery<
        ApiType,
        (arg: Ticker | string | Uint8Array) => Observable<Counter>
      >;
    };
  }

  export interface QueryableStorage<ApiType extends ApiTypes> extends AugmentedQueries<ApiType> {}
}
