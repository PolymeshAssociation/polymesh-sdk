// Auto-generated via `yarn polkadot-types-from-chain`, do not edit
/* eslint-disable */

import { AnyNumber, ITuple, Observable } from '@polkadot/types/types';
import { Linkage, Option, U8aFixed, Vec } from '@polkadot/types/codec';
import { Bytes, bool, u16, u32, u64 } from '@polkadot/types/primitive';
import { UncleEntryItem } from '@polkadot/types/interfaces/authorship';
import { BabeAuthorityWeight, MaybeVrf } from '@polkadot/types/interfaces/babe';
import { AccountData, BalanceLock } from '@polkadot/types/interfaces/balances';
import { AuthorityId } from '@polkadot/types/interfaces/consensus';
import {
  CodeHash,
  ContractInfo,
  Gas,
  PrefabWasmModule,
  Schedule,
} from '@polkadot/types/interfaces/contracts';
import { Proposal } from '@polkadot/types/interfaces/democracy';
import { Vote } from '@polkadot/types/interfaces/elections';
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
  KeyTypeId,
  Moment,
  Perbill,
  ValidatorId,
  Weight,
} from '@polkadot/types/interfaces/runtime';
import { Keys, SessionIndex } from '@polkadot/types/interfaces/session';
import {
  ActiveEraInfo,
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
import { AccountInfo, DigestOf, EventIndex, EventRecord } from '@polkadot/types/interfaces/system';
import { Multiplier } from '@polkadot/types/interfaces/txpayment';
import {
  AccountKey,
  AssetIdentifier,
  AssetTransferRules,
  Authorization,
  AuthorizationNonce,
  Ballot,
  BridgeTx,
  BridgeTxDetail,
  Claim1stKey,
  Claim2ndKey,
  Commission,
  Counter,
  DepositInfo,
  DidRecord,
  Dividend,
  FundingRoundName,
  IdentifierType,
  IdentityClaim,
  IdentityId,
  InactiveMember,
  Investment,
  Link,
  LinkedKeyInfo,
  OfflineSlashingParams,
  PermissionedValidator,
  Pip,
  PipId,
  PipsMetadata,
  PolymeshVotes,
  PosRatio,
  PreAuthorizedKeyInfo,
  ProtocolOp,
  Referendum,
  STO,
  SecurityToken,
  Signatory,
  SimpleTokenRecord,
  SmartExtension,
  SmartExtensionType,
  TargetIdAuthorization,
  Ticker,
  TickerRegistration,
  TickerRegistrationConfig,
  VotingResult,
} from 'polymesh-types/polymesh';
import { ApiTypes } from '@polkadot/api/types';

declare module '@polkadot/api/types/storage' {
  export interface AugmentedQueries<ApiType> {
    asset: {
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
       * Store the nonce for off chain signature to increase the custody allowance.
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
       * Used to store the securityToken balance corresponds to ticker and Identity.
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
       * Allowance provided to the custodian.
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
       * A map of pairs of a ticker name and an `IdentifierType` to asset identifiers.
       **/
      identifiers: AugmentedQuery<
        ApiType,
        (
          arg:
            | ITuple<[Ticker, IdentifierType]>
            | [
                Ticker | string | Uint8Array,
                IdentifierType | 'Cins' | 'Cusip' | 'Isin' | number | Uint8Array
              ]
        ) => Observable<AssetIdentifier>
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
       * Total custodian allowance for a given token holder.
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
       * Last checkpoint updated for a DID's balance.
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
      initialized: AugmentedQuery<ApiType, () => Observable<Option<MaybeVrf>>>;
      /**
       * Next epoch randomness.
       **/
      nextRandomness: AugmentedQuery<ApiType, () => Observable<U8aFixed>>;
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
      randomness: AugmentedQuery<ApiType, () => Observable<U8aFixed>>;
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
      underConstruction: AugmentedQuery<
        ApiType,
        (arg: u32 | AnyNumber | Uint8Array) => Observable<Vec<U8aFixed>>
      >;
    };
    balances: {
      /**
       * The balance of an account.
       *
       * NOTE: THIS MAY NEVER BE IN EXISTENCE AND YET HAVE A `total().is_zero()`. If the total
       * is ever zero, then the entry *MUST* be removed.
       *
       * NOTE: This is only used in the case that this module is used to store balances.
       **/
      account: AugmentedQuery<
        ApiType,
        (arg: AccountId | string | Uint8Array) => Observable<AccountData>
      >;
      /**
       * AccountId of the block rewards reserve
       **/
      blockRewardsReserve: AugmentedQuery<ApiType, () => Observable<AccountId>>;
      /**
       * Signing key => Charge Fee to did?. Default is false i.e. the fee will be charged from user balance
       **/
      chargeDid: AugmentedQuery<
        ApiType,
        (arg: AccountKey | string | Uint8Array) => Observable<bool>
      >;
      /**
       * Balance held by the identity. It can be spent by its signing keys.
       **/
      identityBalance: AugmentedQuery<
        ApiType,
        (arg: IdentityId | string | Uint8Array) => Observable<Balance>
      >;
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
      bridgeLimitWhitelist: AugmentedQuery<
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
       * The multisig account of the bridge controller. The genesis signers must accept their
       * authorizations to be able to get their proposals delivered.
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
       * The current "inactive" membership, stored as an ordered Vec.
       **/
      inactiveMembers: AugmentedQuery<ApiType, () => Observable<Vec<InactiveMember>>>;
      /**
       * The current prime member, if one exists.
       **/
      prime: AugmentedQuery<ApiType, () => Observable<Option<IdentityId>>>;
    };
    committeeMembership: {
      /**
       * The current "active" membership, stored as an ordered Vec.
       **/
      activeMembers: AugmentedQuery<ApiType, () => Observable<Vec<IdentityId>>>;
      /**
       * The current "inactive" membership, stored as an ordered Vec.
       **/
      inactiveMembers: AugmentedQuery<ApiType, () => Observable<Vec<InactiveMember>>>;
      /**
       * The current prime member, if one exists.
       **/
      prime: AugmentedQuery<ApiType, () => Observable<Option<IdentityId>>>;
    };
    complianceManager: {
      /**
       * List of active rules for a ticker (Ticker -> Array of AssetTransferRules)
       **/
      assetRulesMap: AugmentedQuery<
        ApiType,
        (arg: Ticker | string | Uint8Array) => Observable<AssetTransferRules>
      >;
      /**
       * List of trusted claim issuer Ticker -> Issuer Identity
       **/
      trustedClaimIssuer: AugmentedQuery<
        ApiType,
        (arg: Ticker | string | Uint8Array) => Observable<Vec<IdentityId>>
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
       * The price of one unit of gas.
       **/
      gasPrice: AugmentedQuery<ApiType, () => Observable<BalanceOf>>;
      /**
       * Gas spent so far in this block.
       **/
      gasSpent: AugmentedQuery<ApiType, () => Observable<Gas>>;
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
       * DEPRECATED
       *
       * This used to store the current authority set, which has been migrated to the well-known
       * GRANDPA_AUTHORITIES_KEY unhashed key.
       **/
      authorities: AugmentedQuery<ApiType, () => Observable<AuthorityList>>;
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
       * A mapping from grandpa set ID to the index of the *most recent* session for which its members were responsible.
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
          key1: Signatory | { Identity: any } | { AccountKey: any } | string | Uint8Array,
          key2: u64 | AnyNumber | Uint8Array
        ) => Observable<Authorization>
      >;
      /**
       * All authorizations that an identity/key has given. (Authorizer, auth_id -> authorized)
       **/
      authorizationsGiven: AugmentedQueryDoubleMap<
        ApiType,
        (
          key1: Signatory | { Identity: any } | { AccountKey: any } | string | Uint8Array,
          key2: u64 | AnyNumber | Uint8Array
        ) => Observable<Signatory>
      >;
      /**
       * It defines if authorization from a CDD provider is needed to change master key of an identity
       **/
      cddAuthForMasterKeyRotation: AugmentedQuery<ApiType, () => Observable<bool>>;
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
      currentPayer: AugmentedQuery<ApiType, () => Observable<Option<Signatory>>>;
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
      keyToIdentityIds: AugmentedQuery<
        ApiType,
        (arg: AccountKey | string | Uint8Array) => Observable<Option<LinkedKeyInfo>>
      >;
      /**
       * All links that an identity/key has
       **/
      links: AugmentedQueryDoubleMap<
        ApiType,
        (
          key1: Signatory | { Identity: any } | { AccountKey: any } | string | Uint8Array,
          key2: u64 | AnyNumber | Uint8Array
        ) => Observable<Link>
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
       * Pre-authorize join to Identity.
       **/
      preAuthorizedJoinDid: AugmentedQuery<
        ApiType,
        (
          arg: Signatory | { Identity: any } | { AccountKey: any } | string | Uint8Array
        ) => Observable<Vec<PreAuthorizedKeyInfo>>
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
                Signatory | { Identity: any } | { AccountKey: any } | string | Uint8Array,
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
        ) => Observable<Option<ITuple<[AccountId, BalanceOf]>>>
      >;
    };
    multiSig: {
      /**
       * Maps a key to a multisig address.
       **/
      keyToMultiSig: AugmentedQuery<
        ApiType,
        (arg: AccountKey | string | Uint8Array) => Observable<AccountId>
      >;
      /**
       * Maps a multisig to its creator's identity.
       **/
      multiSigCreator: AugmentedQuery<
        ApiType,
        (arg: AccountId | string | Uint8Array) => Observable<IdentityId>
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
          key2: Signatory | { Identity: any } | { AccountKey: any } | string | Uint8Array
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
       * Individual multisig signer votes. (multi sig, signer, proposal) => vote.
       **/
      votes: AugmentedQuery<
        ApiType,
        (
          arg:
            | ITuple<[AccountId, Signatory, u64]>
            | [
                AccountId | string | Uint8Array,
                Signatory | { Identity: any } | { AccountKey: any } | string | Uint8Array,
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
    percentageTm: {
      /**
       * Maximum percentage enabled for a given token
       **/
      maximumPercentageEnabledForToken: AugmentedQuery<
        ApiType,
        (arg: Ticker | string | Uint8Array) => Observable<u16>
      >;
    };
    pips: {
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
       * The minimum amount to be used as a deposit for a public referendum proposal.
       **/
      minimumProposalDeposit: AugmentedQuery<ApiType, () => Observable<BalanceOf>>;
      /**
       * Proposals so far. id can be used to keep track of PIPs off-chain.
       **/
      pipIdSequence: AugmentedQuery<ApiType, () => Observable<u32>>;
      /**
       * During Cool-off period, proposal owner can amend any PIP detail or cancel the entire
       * proposal.
       **/
      proposalCoolOffPeriod: AugmentedQuery<ApiType, () => Observable<BlockNumber>>;
      /**
       * How long (in blocks) a ballot runs
       **/
      proposalDuration: AugmentedQuery<ApiType, () => Observable<BlockNumber>>;
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
       * It maps the block number where a list of proposal are considered as matured.
       **/
      proposalsMaturingAt: AugmentedQuery<
        ApiType,
        (arg: BlockNumber | AnyNumber | Uint8Array) => Observable<Vec<PipId>>
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
        ) => Observable<Vote>
      >;
      /**
       * Determines whether historical PIP data is persisted or removed
       **/
      pruneHistoricalPips: AugmentedQuery<ApiType, () => Observable<bool>>;
      /**
       * Minimum stake a proposal must gather in order to be considered by the committee.
       **/
      quorumThreshold: AugmentedQuery<ApiType, () => Observable<BalanceOf>>;
      /**
       * Proposals that have met the quorum threshold to be put forward to a governance committee
       * proposal id -> proposal
       **/
      referendums: AugmentedQuery<
        ApiType,
        (arg: PipId | AnyNumber | Uint8Array) => Observable<Option<Referendum>>
      >;
      /**
       * List of id's of current scheduled referendums.
       * block number -> Pip id
       **/
      scheduledReferendumsAt: AugmentedQuery<
        ApiType,
        (arg: BlockNumber | AnyNumber | Uint8Array) => Observable<Vec<PipId>>
      >;
    };
    polymeshCommittee: {
      /**
       * The current members of the committee.
       **/
      members: AugmentedQuery<ApiType, () => Observable<Vec<IdentityId>>>;
      /**
       * The member who provides the default vote for any other members that do not vote before
       * the timeout. If None, then no member has that privilege.
       **/
      prime: AugmentedQuery<ApiType, () => Observable<Option<IdentityId>>>;
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
            | 'ComplianceManagerAddActiveRule'
            | 'IdentityRegisterDid'
            | 'IdentityCddRegisterDid'
            | 'IdentityAddClaim'
            | 'IdentitySetMasterKey'
            | 'IdentityAddSigningItem'
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
       * The owner of a key. The second key is the `KeyTypeId` + the encoded key.
       *
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
      /**
       * The next session keys for a validator.
       *
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
       * The details associated with each simple token
       **/
      tokens: AugmentedQuery<
        ApiType,
        (arg: Ticker | string | Uint8Array) => Observable<SimpleTokenRecord>
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
       * This is the latest planned era, depending on how session module queues the validator
       * set, it might be active or not.
       **/
      currentEra: AugmentedQuery<ApiType, () => Observable<Option<EraIndex>>>;
      /**
       * The earliest era for which we have a pending, unapplied slash.
       **/
      earliestUnappliedSlash: AugmentedQuery<ApiType, () => Observable<Option<EraIndex>>>;
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
       * This is similar to [`ErasStakers`] but number of nominators exposed is reduce to the
       * `T::MaxNominatorRewardedPerValidator` biggest stakers.
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
       * Similarly to `ErasStakers` this holds the preferences of validators.
       *
       * This is keyed fist by the era index to allow bulk deletion and then the stash account.
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
       * True if the next session change will be a new era regardless of index.
       **/
      forceEra: AugmentedQuery<ApiType, () => Observable<Forcing>>;
      /**
       * Number of era to keep in history.
       *
       * Information is kept for eras in `[current_era - history_depth; current_era]
       *
       * Must be more than the number of era delayed by session otherwise.
       * i.e. active era must always be in history.
       * i.e. `active_era > current_era - history_depth` must be guaranteed.
       **/
      historyDepth: AugmentedQuery<ApiType, () => Observable<u32>>;
      /**
       * Any validators that may never be slashed or forcibly kicked. It's a Vec since they're
       * easy to initialize and the performance hit is minimal (we expect no more than four
       * invulnerables) and restricted to testnets.
       **/
      invulnerables: AugmentedQuery<ApiType, () => Observable<Vec<AccountId>>>;
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
        (
          arg: AccountId | string | Uint8Array
        ) => Observable<ITuple<[Option<Nominations>, Linkage<AccountId>]>>
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
        (
          arg: AccountId | string | Uint8Array
        ) => Observable<ITuple<[Option<PermissionedValidator>, Linkage<AccountId>]>>
      >;
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
       * Commision rate to be used by all validators.
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
        (
          arg: AccountId | string | Uint8Array
        ) => Observable<ITuple<[ValidatorPrefs, Linkage<AccountId>]>>
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
    stoCapped: {
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
      /**
       * It returns the sto count corresponds to its ticker
       * ticker -> sto count
       **/
      stoCount: AugmentedQuery<ApiType, (arg: Ticker | string | Uint8Array) => Observable<u32>>;
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
       * To track the index of the token address for the given STO
       * (Asset_ticker, sto_id, simple_token_ticker) -> index
       **/
      tokenIndexForSto: AugmentedQuery<
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
       * Total weight for all extrinsics put together, for the current block.
       **/
      allExtrinsicsWeight: AugmentedQuery<ApiType, () => Observable<Option<Weight>>>;
      /**
       * Map of block numbers to block hashes.
       **/
      blockHash: AugmentedQuery<
        ApiType,
        (arg: BlockNumber | AnyNumber | Uint8Array) => Observable<Hash>
      >;
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
       * The current block number being processed. Set by `execute_block`.
       **/
      number: AugmentedQuery<ApiType, () => Observable<BlockNumber>>;
      /**
       * Hash of the previous block.
       **/
      parentHash: AugmentedQuery<ApiType, () => Observable<Hash>>;
      /**
       * A bool to track if the runtime was upgraded last block.
       **/
      runtimeUpgraded: AugmentedQuery<ApiType, () => Observable<bool>>;
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
    voting: {
      /**
       * Mapping of ticker and ballot name -> ballot details
       **/
      ballots: AugmentedQuery<
        ApiType,
        (
          arg: ITuple<[Ticker, Bytes]> | [Ticker | string | Uint8Array, Bytes | string | Uint8Array]
        ) => Observable<ITuple<[Ballot, Linkage<ITuple<[Ticker, Bytes]>>]>>
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
