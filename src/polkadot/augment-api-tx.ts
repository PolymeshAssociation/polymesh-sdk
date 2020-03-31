// Auto-generated via `yarn polkadot-types-from-chain`, do not edit
/* eslint-disable @typescript-eslint/no-empty-interface */

import { ApiTypes, SubmittableExtrinsic } from '@polkadot/api/types';
import { Compact, Option, Vec } from '@polkadot/types/codec';
import { ProposalIndex } from '@polkadot/types/interfaces/collective';
import { CodeHash, Gas, Schedule } from '@polkadot/types/interfaces/contracts';
import { Proposal } from '@polkadot/types/interfaces/democracy';
import { Extrinsic, Signature } from '@polkadot/types/interfaces/extrinsics';
import { Heartbeat } from '@polkadot/types/interfaces/imOnline';
import {
  AccountId,
  AccountIndex,
  Address,
  Balance,
  BalanceOf,
  BlockNumber,
  Call,
  Hash,
  Header,
  KeyValue,
  LookupSource,
  Moment,
  Perbill,
} from '@polkadot/types/interfaces/runtime';
import { Keys } from '@polkadot/types/interfaces/session';
import { EraIndex, RewardDestination, ValidatorPrefs } from '@polkadot/types/interfaces/staking';
import { Key } from '@polkadot/types/interfaces/system';
import { bool, Bytes, u16, u32, u64,u128 } from '@polkadot/types/primitive';
import { AnyNumber, ITuple } from '@polkadot/types/types';
import {
  AccountKey,
  AssetIdentifier,
  AssetTransferRule,
  AssetType,
  AuthIdentifier,
  AuthorizationData,
  Ballot,
  BatchAddClaimItem,
  BatchRevokeClaimItem,
  BridgeTx,
  Claim,
  Document,
  FundingRoundName,
  IdentifierType,
  IdentityId,
  Memo,
  MipDescription,
  MipsIndex,
  OffChainSignature,
  OfflineSlashingParams,
  Permission,
  ProtocolOp,
  Rule,
  Signatory,
  SigningItem,
  SigningItemWithAuth,
  SmartExtension,
  TargetIdAuthorization,
  Ticker,
  TokenName,
  Url,
} from 'polymesh-types/polymesh';

declare module '@polkadot/api/types/submittable' {
  export interface AugmentedSubmittables<ApiType> {
    system: {
      /**
       * A big dispatch that will disallow any other transaction to be included.
       **/
      fillBlock: AugmentedSubmittable<() => SubmittableExtrinsic<ApiType>>;
      /**
       * Make some on-chain remark.
       **/
      remark: AugmentedSubmittable<
        (remark: Bytes | string | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Set the number of pages in the WebAssembly environment's heap.
       **/
      setHeapPages: AugmentedSubmittable<
        (pages: u64 | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Set the new code.
       **/
      setCode: AugmentedSubmittable<
        (updated: Bytes | string | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Set some items of storage.
       **/
      setStorage: AugmentedSubmittable<
        (items: Vec<KeyValue> | KeyValue[]) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Kill some items from storage.
       **/
      killStorage: AugmentedSubmittable<
        (keys: Vec<Key> | (Key | string | Uint8Array)[]) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Kill all storage items with a key that starts with the given prefix.
       **/
      killPrefix: AugmentedSubmittable<
        (prefix: Key | string | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
    };
    timestamp: {
      /**
       * Set the current time.
       * This call should be invoked exactly once per block. It will panic at the finalization
       * phase, if this call hasn't been invoked by that time.
       * The timestamp should be greater than the previous one by the amount specified by
       * `MinimumPeriod`.
       * The dispatch origin for this call must be `Inherent`.
       **/
      set: AugmentedSubmittable<
        (now: Compact<Moment> | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
    };
    balances: {
      /**
       * Transfer some liquid free balance to another account.
       * `transfer` will set the `FreeBalance` of the sender and receiver.
       * It will decrease the total issuance of the system by the `TransferFee`.
       * The dispatch origin for this call must be `Signed` by the transactor.
       * # <weight>
       * - Dependent on arguments but not critical, given proper implementations for
       * input config types. See related functions below.
       * - It contains a limited number of reads and writes internally and no complex computation.
       * Related functions:
       * - `ensure_can_withdraw` is always called internally but has a bounded complexity.
       * - Transferring balances to accounts that did not exist before will cause
       * `T::OnNewAccount::on_new_account` to be called.
       * # </weight>
       **/
      transfer: AugmentedSubmittable<
        (
          dest: LookupSource | Address | AccountId | AccountIndex | string | Uint8Array,
          value: Compact<Balance> | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      transferWithMemo: AugmentedSubmittable<
        (
          dest: LookupSource | Address | AccountId | AccountIndex | string | Uint8Array,
          value: Compact<Balance> | AnyNumber | Uint8Array,
          memo: Option<Memo> | null | object | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Move some poly from balance of self to balance of an identity.
       **/
      topUpIdentityBalance: AugmentedSubmittable<
        (
          did: IdentityId | string | Uint8Array,
          value: Compact<Balance> | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Claim back poly from an identity. Can only be called by master key of the identity.
       **/
      reclaimIdentityBalance: AugmentedSubmittable<
        (
          did: IdentityId | string | Uint8Array,
          value: Compact<Balance> | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Change setting that governs if user pays fee via their own balance or identity's balance.
       **/
      changeChargeDidFlag: AugmentedSubmittable<
        (chargeDid: bool | boolean | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Set the balances of a given account.
       * This will alter `FreeBalance` and `ReservedBalance` in storage. it will
       * also decrease the total issuance of the system (`TotalIssuance`).
       * The dispatch origin for this call is `root`.
       * # <weight>
       * - Independent of the arguments.
       * - Contains a limited number of reads and writes.
       * # </weight>
       **/
      setBalance: AugmentedSubmittable<
        (
          who: LookupSource | Address | AccountId | AccountIndex | string | Uint8Array,
          newFree: Compact<Balance> | AnyNumber | Uint8Array,
          newReserved: Compact<Balance> | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Exactly as `transfer`, except the origin must be root and the source account may be
       * specified.
       **/
      forceTransfer: AugmentedSubmittable<
        (
          source: LookupSource | Address | AccountId | AccountIndex | string | Uint8Array,
          dest: LookupSource | Address | AccountId | AccountIndex | string | Uint8Array,
          value: Compact<Balance> | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
    };
    authorship: {
      /**
       * Provide a set of uncles.
       **/
      setUncles: AugmentedSubmittable<
        (
          newUncles:
            | Vec<Header>
            | (
                | Header
                | {
                    parentHash?: any;
                    number?: any;
                    stateRoot?: any;
                    extrinsicsRoot?: any;
                    digest?: any;
                  }
                | string
                | Uint8Array
              )[]
        ) => SubmittableExtrinsic<ApiType>
      >;
    };
    staking: {
      /**
       * Take the origin account as a stash and lock up `value` of its balance. `controller` will
       * be the account that controls it.
       * `value` must be more than the `minimum_balance` specified by `<T as Trait>::Currency`.
       * The dispatch origin for this call must be _Signed_ by the stash account.
       * # <weight>
       * - Independent of the arguments. Moderate complexity.
       * - O(1).
       * - Three extra DB entries.
       * NOTE: Two of the storage writes (`Self::bonded`, `Self::payee`) are _never_ cleaned unless
       * the `origin` falls below _existential deposit_ and gets removed as dust.
       * # </weight>
       **/
      bond: AugmentedSubmittable<
        (
          controller: LookupSource | Address | AccountId | AccountIndex | string | Uint8Array,
          value: Compact<BalanceOf> | AnyNumber | Uint8Array,
          payee: RewardDestination | ('Staked' | 'Stash' | 'Controller') | number | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Add some extra amount that have appeared in the stash `free_balance` into the balance up
       * for staking.
       * Use this if there are additional funds in your stash account that you wish to bond.
       * Unlike [`bond`] or [`unbond`] this function does not impose any limitation on the amount
       * that can be added.
       * The dispatch origin for this call must be _Signed_ by the stash, not the controller.
       * # <weight>
       * - Independent of the arguments. Insignificant complexity.
       * - O(1).
       * - One DB entry.
       * # </weight>
       **/
      bondExtra: AugmentedSubmittable<
        (
          maxAdditional: Compact<BalanceOf> | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Schedule a portion of the stash to be unlocked ready for transfer out after the bond
       * period ends. If this leaves an amount actively bonded less than
       * <T as Trait>::Currency::minimum_balance(), then it is increased to the full amount.
       * Once the unlock period is done, you can call `withdraw_unbonded` to actually move
       * the funds out of management ready for transfer.
       * No more than a limited number of unlocking chunks (see `MAX_UNLOCKING_CHUNKS`)
       * can co-exists at the same time. In that case, [`Call::withdraw_unbonded`] need
       * to be called first to remove some of the chunks (if possible).
       * The dispatch origin for this call must be _Signed_ by the controller, not the stash.
       * See also [`Call::withdraw_unbonded`].
       * # <weight>
       * - Independent of the arguments. Limited but potentially exploitable complexity.
       * - Contains a limited number of reads.
       * - Each call (requires the remainder of the bonded balance to be above `minimum_balance`)
       * will cause a new entry to be inserted into a vector (`Ledger.unlocking`) kept in storage.
       * The only way to clean the aforementioned storage item is also user-controlled via `withdraw_unbonded`.
       * - One DB entry.
       * </weight>
       **/
      unbond: AugmentedSubmittable<
        (value: Compact<BalanceOf> | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Remove any unlocked chunks from the `unlocking` queue from our management.
       * This essentially frees up that balance to be used by the stash account to do
       * whatever it wants.
       * The dispatch origin for this call must be _Signed_ by the controller, not the stash.
       * See also [`Call::unbond`].
       * # <weight>
       * - Could be dependent on the `origin` argument and how much `unlocking` chunks exist.
       * It implies `consolidate_unlocked` which loops over `Ledger.unlocking`, which is
       * indirectly user-controlled. See [`unbond`] for more detail.
       * - Contains a limited number of reads, yet the size of which could be large based on `ledger`.
       * - Writes are limited to the `origin` account key.
       * # </weight>
       **/
      withdrawUnbonded: AugmentedSubmittable<() => SubmittableExtrinsic<ApiType>>;
      /**
       * Declare the desire to validate for the origin controller.
       * Effects will be felt at the beginning of the next era.
       * The dispatch origin for this call must be _Signed_ by the controller, not the stash.
       * # <weight>
       * - Independent of the arguments. Insignificant complexity.
       * - Contains a limited number of reads.
       * - Writes are limited to the `origin` account key.
       * # </weight>
       **/
      validate: AugmentedSubmittable<
        (
          prefs: ValidatorPrefs | { commission?: any } | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Declare the desire to nominate `targets` for the origin controller.
       * Effects will be felt at the beginning of the next era.
       * The dispatch origin for this call must be _Signed_ by the controller, not the stash.
       * # <weight>
       * - The transaction's complexity is proportional to the size of `targets`,
       * which is capped at `MAX_NOMINATIONS`.
       * - It also depends upon the no. of claim issuers for a given stash account.
       * - Both the reads and writes follow a similar pattern.
       * # </weight>
       **/
      nominate: AugmentedSubmittable<
        (
          targets:
            | Vec<LookupSource>
            | (LookupSource | Address | AccountId | AccountIndex | string | Uint8Array)[]
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Declare no desire to either validate or nominate.
       * Effects will be felt at the beginning of the next era.
       * The dispatch origin for this call must be _Signed_ by the controller, not the stash.
       * # <weight>
       * - Independent of the arguments. Insignificant complexity.
       * - Contains one read.
       * - Writes are limited to the `origin` account key.
       * # </weight>
       **/
      chill: AugmentedSubmittable<() => SubmittableExtrinsic<ApiType>>;
      /**
       * (Re-)set the payment target for a controller.
       * Effects will be felt at the beginning of the next era.
       * The dispatch origin for this call must be _Signed_ by the controller, not the stash.
       * # <weight>
       * - Independent of the arguments. Insignificant complexity.
       * - Contains a limited number of reads.
       * - Writes are limited to the `origin` account key.
       * # </weight>
       **/
      setPayee: AugmentedSubmittable<
        (
          payee: RewardDestination | ('Staked' | 'Stash' | 'Controller') | number | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * (Re-)set the controller of a stash.
       * Effects will be felt at the beginning of the next era.
       * The dispatch origin for this call must be _Signed_ by the stash, not the controller.
       * # <weight>
       * - Independent of the arguments. Insignificant complexity.
       * - Contains a limited number of reads.
       * - Writes are limited to the `origin` account key.
       * # </weight>
       **/
      setController: AugmentedSubmittable<
        (
          controller: LookupSource | Address | AccountId | AccountIndex | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * The ideal number of validators.
       **/
      setValidatorCount: AugmentedSubmittable<
        (updated: Compact<u32> | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Governance committee on 2/3 rds majority can introduce a new potential validator
       * to the pool of validators. Staking module uses `PermissionedValidators` to ensure
       * validators have completed KYB compliance and considers them for validation.
       **/
      addPotentialValidator: AugmentedSubmittable<
        (validator: AccountId | string | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Remove a validator from the pool of validators. Effects are known in the next session.
       * Staking module checks `PermissionedValidators` to ensure validators have
       * completed KYB compliance
       **/
      removeValidator: AugmentedSubmittable<
        (validator: AccountId | string | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Governance committee on 2/3 rds majority can update the compliance status of a validator
       * as `Pending`.
       **/
      complianceFailed: AugmentedSubmittable<
        (validator: AccountId | string | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Governance committee on 2/3 rds majority can update the compliance status of a validator
       * as `Active`.
       **/
      compliancePassed: AugmentedSubmittable<
        (validator: AccountId | string | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Validate the nominators CDD expiry time
       * If an account from a given set of address is nominating then
       * check the CDD expiry time of it and if it is expired
       * then the account should be unbonded and removed from the nominating process.
       * #<weight>
       * - Depends on passed list of AccountId
       * - Depends on the no. of claim issuers an accountId has for the CDD expiry
       * #</weight>
       **/
      validateCddExpiryNominators: AugmentedSubmittable<
        (
          targets: Vec<AccountId> | (AccountId | string | Uint8Array)[]
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Enables individual commisions. This can be set only once. Once individual commission
       * rates are enabled, there's no going back.  Only Governance committee is allowed to
       * change this value.
       **/
      enableIndividualCommissions: AugmentedSubmittable<() => SubmittableExtrinsic<ApiType>>;
      /**
       * Changes commission rate which applies to all validators. Only Governance
       * committee is allowed to change this value.
       * # Arguments
       * * `new_value` the new commission to be used for reward calculations
       **/
      setGlobalComission: AugmentedSubmittable<
        (newValue: Perbill | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Changes min bond value to be used in bond(). Only Governance
       * committee is allowed to change this value.
       * # Arguments
       * * `new_value` the new minimum
       **/
      setMinBondThreshold: AugmentedSubmittable<
        (newValue: BalanceOf | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Force there to be no new eras indefinitely.
       * # <weight>
       * - No arguments.
       * # </weight>
       **/
      forceNoEras: AugmentedSubmittable<() => SubmittableExtrinsic<ApiType>>;
      /**
       * Force there to be a new era at the end of the next session. After this, it will be
       * reset to normal (non-forced) behaviour.
       * # <weight>
       * - No arguments.
       * # </weight>
       **/
      forceNewEra: AugmentedSubmittable<() => SubmittableExtrinsic<ApiType>>;
      /**
       * Set the validators who cannot be slashed (if any).
       **/
      setInvulnerables: AugmentedSubmittable<
        (
          validators: Vec<AccountId> | (AccountId | string | Uint8Array)[]
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Force a current staker to become completely unstaked, immediately.
       **/
      forceUnstake: AugmentedSubmittable<
        (stash: AccountId | string | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Force there to be a new era at the end of sessions indefinitely.
       * # <weight>
       * - One storage write
       * # </weight>
       **/
      forceNewEraAlways: AugmentedSubmittable<() => SubmittableExtrinsic<ApiType>>;
      /**
       * Cancel enactment of a deferred slash. Can be called by either the root origin or
       * the `T::SlashCancelOrigin`.
       * passing the era and indices of the slashes for that era to kill.
       * # <weight>
       * - One storage write.
       * # </weight>
       **/
      cancelDeferredSlash: AugmentedSubmittable<
        (
          era: EraIndex | AnyNumber | Uint8Array,
          slashIndices: Vec<u32> | (u32 | AnyNumber | Uint8Array)[]
        ) => SubmittableExtrinsic<ApiType>
      >;
    };
    session: {
      /**
       * Sets the session key(s) of the function caller to `key`.
       * Allows an account to set its session key prior to becoming a validator.
       * This doesn't take effect until the next session.
       * The dispatch origin of this function must be signed.
       * # <weight>
       * - O(log n) in number of accounts.
       * - One extra DB entry.
       * # </weight>
       **/
      setKeys: AugmentedSubmittable<
        (keys: Keys, proof: Bytes | string | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
    };
    finalityTracker: {
      /**
       * Hint that the author of this block thinks the best finalized
       * block is the given number.
       **/
      finalHint: AugmentedSubmittable<
        (hint: Compact<BlockNumber> | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
    };
    grandpa: {
      /**
       * Report some misbehavior.
       **/
      reportMisbehavior: AugmentedSubmittable<
        (report: Bytes | string | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
    };
    imOnline: {
      heartbeat: AugmentedSubmittable<
        (
          heartbeat:
            | Heartbeat
            | { blockNumber?: any; networkState?: any; sessionIndex?: any; authorityIndex?: any }
            | string
            | Uint8Array,
          signature: Signature | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Set slashing params to be used in calculating `slash_fraction`
       * Only Governance committee is allowed to set these params.
       **/
      setSlashingParams: AugmentedSubmittable<
        (
          params:
            | OfflineSlashingParams
            | { max_offline_percent?: any; constant?: any; max_slash_percent?: any }
            | string
            | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
    };
    sudo: {
      /**
       * Authenticates the sudo key and dispatches a function call with `Root` origin.
       * The dispatch origin for this call must be _Signed_.
       * # <weight>
       * - O(1).
       * - Limited storage reads.
       * - One DB write (event).
       * - Unknown weight of derivative `proposal` execution.
       * # </weight>
       **/
      sudo: AugmentedSubmittable<
        (
          proposal: Proposal | { callIndex?: any; args?: any } | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Authenticates the current sudo key and sets the given AccountId (`new`) as the new sudo key.
       * The dispatch origin for this call must be _Signed_.
       * # <weight>
       * - O(1).
       * - Limited storage reads.
       * - One DB change.
       * # </weight>
       **/
      setKey: AugmentedSubmittable<
        (
          updated: LookupSource | Address | AccountId | AccountIndex | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Authenticates the sudo key and dispatches a function call with `Signed` origin from
       * a given account.
       * The dispatch origin for this call must be _Signed_.
       * # <weight>
       * - O(1).
       * - Limited storage reads.
       * - One DB write (event).
       * - Unknown weight of derivative `proposal` execution.
       * # </weight>
       **/
      sudoAs: AugmentedSubmittable<
        (
          who: LookupSource | Address | AccountId | AccountIndex | string | Uint8Array,
          proposal: Proposal | { callIndex?: any; args?: any } | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
    };
    multiSig: {
      /**
       * Creates a multisig
       * # Arguments
       * * `signers` - Signers of the multisig (They need to accept authorization before they are actually added).
       * * `sigs_required` - Number of sigs required to process a multi-sig tx.
       **/
      createMultisig: AugmentedSubmittable<
        (
          signers:
            | Vec<Signatory>
            | (Signatory | { identity: any } | { accountKey: any } | string | Uint8Array)[],
          sigsRequired: u64 | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Creates a multisig proposal if it hasn't been created or approves it if it has.
       * # Arguments
       * * `multisig` - MultiSig address.
       * * `proposal` - Proposal to be voted on.
       * If this is 1 of m multisig, the proposal will be immediately executed.
       **/
      createOrApproveProposalAsIdentity: AugmentedSubmittable<
        (
          multisig: AccountId | string | Uint8Array,
          proposal: Proposal | { callIndex?: any; args?: any } | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Creates a multisig proposal if it hasn't been created or approves it if it has.
       * # Arguments
       * * `multisig` - MultiSig address.
       * * `proposal` - Proposal to be voted on.
       * If this is 1 of m multisig, the proposal will be immediately executed.
       **/
      createOrApproveProposalAsKey: AugmentedSubmittable<
        (
          multisig: AccountId | string | Uint8Array,
          proposal: Proposal | { callIndex?: any; args?: any } | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Creates a multisig proposal
       * # Arguments
       * * `multisig` - MultiSig address.
       * * `proposal` - Proposal to be voted on.
       * If this is 1 of m multisig, the proposal will be immediately executed.
       **/
      createProposalAsIdentity: AugmentedSubmittable<
        (
          multisig: AccountId | string | Uint8Array,
          proposal: Proposal | { callIndex?: any; args?: any } | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Creates a multisig proposal
       * # Arguments
       * * `multisig` - MultiSig address.
       * * `proposal` - Proposal to be voted on.
       * If this is 1 of m multisig, the proposal will be immediately executed.
       **/
      createProposalAsKey: AugmentedSubmittable<
        (
          multisig: AccountId | string | Uint8Array,
          proposal: Proposal | { callIndex?: any; args?: any } | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Approves a multisig proposal using caller's identity
       * # Arguments
       * * `multisig` - MultiSig address.
       * * `proposal_id` - Proposal id to approve.
       * If quorum is reached, the proposal will be immediately executed.
       **/
      approveAsIdentity: AugmentedSubmittable<
        (
          multisig: AccountId | string | Uint8Array,
          proposalId: u64 | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Approves a multisig proposal using caller's signing key (AccountId)
       * # Arguments
       * * `multisig` - MultiSig address.
       * * `proposal_id` - Proposal id to approve.
       * If quorum is reached, the proposal will be immediately executed.
       **/
      approveAsKey: AugmentedSubmittable<
        (
          multisig: AccountId | string | Uint8Array,
          proposalId: u64 | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Accept a multisig signer authorization given to signer's identity
       * # Arguments
       * * `proposal_id` - Auth id of the authorization.
       **/
      acceptMultisigSignerAsIdentity: AugmentedSubmittable<
        (authId: u64 | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Accept a multisig signer authorization given to signer's key (AccountId)
       * # Arguments
       * * `proposal_id` - Auth id of the authorization.
       **/
      acceptMultisigSignerAsKey: AugmentedSubmittable<
        (authId: u64 | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Add a signer to the multisig. This must be called by the multisig itself.
       * # Arguments
       * * `signer` - Signatory to add.
       **/
      addMultisigSigner: AugmentedSubmittable<
        (
          signer: Signatory | { identity: any } | { accountKey: any } | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Remove a signer from the multisig. This must be called by the multisig itself.
       * # Arguments
       * * `signer` - Signatory to remove.
       **/
      removeMultisigSigner: AugmentedSubmittable<
        (
          signer: Signatory | { identity: any } | { accountKey: any } | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Add a signer to the multisig.
       * This must be called by the creator identity of the multisig.
       * # Arguments
       * * `multisig` - Address of the multi sig
       * * `signers` - Signatories to add.
       **/
      addMultisigSignersViaCreator: AugmentedSubmittable<
        (
          multisig: AccountId | string | Uint8Array,
          signers:
            | Vec<Signatory>
            | (Signatory | { identity: any } | { accountKey: any } | string | Uint8Array)[]
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Remove a signer from the multisig.
       * This must be called by the creator identity of the multisig.
       * # Arguments
       * * `multisig` - Address of the multi sig
       * * `signers` - Signatories to remove.
       **/
      removeMultisigSignersViaCreator: AugmentedSubmittable<
        (
          multisig: AccountId | string | Uint8Array,
          signers:
            | Vec<Signatory>
            | (Signatory | { identity: any } | { accountKey: any } | string | Uint8Array)[]
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Change number of sigs required by a multisig. This must be called by the multisig itself.
       * # Arguments
       * * `sigs_required` - New number of sigs required.
       **/
      changeSigsRequired: AugmentedSubmittable<
        (sigsRequired: u64 | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * This function allows to replace all existing signers of the given multisig & also change no. of signature required
       * NOTE - Once this function get executed no other function of the multisig is allowed to execute until unless
       * potential signers accept the authorization and there count should be greater than or equal to the signature required
       * # Arguments
       * * signers - Vector of signers for a given multisig
       * * sigs_required - Number of signature required for a given multisig
       **/
      changeAllSignersAndSigsRequired: AugmentedSubmittable<
        (
          signers:
            | Vec<Signatory>
            | (Signatory | { identity: any } | { accountKey: any } | string | Uint8Array)[],
          sigsRequired: u64 | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Adds a multisig as a signer of current did if the current did is the creator of the multisig
       * # Arguments
       * * `multi_sig` - multi sig address
       **/
      makeMultisigSigner: AugmentedSubmittable<
        (multiSig: AccountId | string | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Adds a multisig as the master key of the current did if the current did is the creator of the multisig
       * # Arguments
       * * `multi_sig` - multi sig address
       **/
      makeMultisigMaster: AugmentedSubmittable<
        (
          multiSig: AccountId | string | Uint8Array,
          optionalCddAuthId: Option<u64> | null | object | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
    };
    contracts: {
      /**
       * Updates the schedule for metering contracts.
       * The schedule must have a greater version than the stored schedule.
       **/
      updateSchedule: AugmentedSubmittable<
        (
          schedule:
            | Schedule
            | {
                version?: any;
                putCodePerByteCost?: any;
                growMemCost?: any;
                regularOpCost?: any;
                returnDataPerByteCost?: any;
                eventDataPerByteCost?: any;
                eventPerTopicCost?: any;
                eventBaseCost?: any;
                sandboxDataReadCost?: any;
                sandboxDataWriteCost?: any;
                transferCost?: any;
                maxEventTopics?: any;
                maxStackHeight?: any;
                maxMemoryPages?: any;
                enablePrintln?: any;
                maxSubjectLen?: any;
              }
            | string
            | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Stores the given binary Wasm code into the chain's storage and returns its `codehash`.
       * You can instantiate contracts only with stored code.
       **/
      putCode: AugmentedSubmittable<
        (
          gasLimit: Compact<Gas> | AnyNumber | Uint8Array,
          code: Bytes | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Makes a call to an account, optionally transferring some balance.
       * * If the account is a smart-contract account, the associated code will be
       * executed and any value will be transferred.
       * * If the account is a regular account, any value will be transferred.
       * * If no account exists and the call value is not less than `existential_deposit`,
       * a regular account will be created and any value will be transferred.
       **/
      call: AugmentedSubmittable<
        (
          dest: LookupSource | Address | AccountId | AccountIndex | string | Uint8Array,
          value: Compact<BalanceOf> | AnyNumber | Uint8Array,
          gasLimit: Compact<Gas> | AnyNumber | Uint8Array,
          data: Bytes | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Instantiates a new contract from the `codehash` generated by `put_code`, optionally transferring some balance.
       * Instantiation is executed as follows:
       * - The destination address is computed based on the sender and hash of the code.
       * - The smart-contract account is created at the computed address.
       * - The `ctor_code` is executed in the context of the newly-created account. Buffer returned
       * after the execution is saved as the `code` of the account. That code will be invoked
       * upon any call received by this account.
       * - The contract is initialized.
       **/
      instantiate: AugmentedSubmittable<
        (
          endowment: Compact<BalanceOf> | AnyNumber | Uint8Array,
          gasLimit: Compact<Gas> | AnyNumber | Uint8Array,
          codeHash: CodeHash | string | Uint8Array,
          data: Bytes | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Allows block producers to claim a small reward for evicting a contract. If a block producer
       * fails to do so, a regular users will be allowed to claim the reward.
       * If contract is not evicted as a result of this call, no actions are taken and
       * the sender is not eligible for the reward.
       **/
      claimSurcharge: AugmentedSubmittable<
        (
          dest: AccountId | string | Uint8Array,
          auxSender: Option<AccountId> | null | object | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
    };
    treasury: {
      /**
       * Put forward a suggestion for spending. A deposit proportional to the value
       * is reserved and slashed if the proposal is rejected. It is returned once the
       * proposal is awarded.
       * # <weight>
       * - O(1).
       * - Limited storage reads.
       * - One DB change, one extra DB entry.
       * # </weight>
       **/
      proposeSpend: AugmentedSubmittable<
        (
          value: Compact<BalanceOf> | AnyNumber | Uint8Array,
          beneficiary: LookupSource | Address | AccountId | AccountIndex | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Reject a proposed spend. The original deposit will be slashed.
       * # <weight>
       * - O(1).
       * - Limited storage reads.
       * - One DB clear.
       * # </weight>
       **/
      rejectProposal: AugmentedSubmittable<
        (
          proposalId: Compact<ProposalIndex> | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Approve a proposal. At a later time, the proposal will be allocated to the beneficiary
       * and the original deposit will be returned.
       * # <weight>
       * - O(1).
       * - Limited storage reads.
       * - One DB change.
       * # </weight>
       **/
      approveProposal: AugmentedSubmittable<
        (
          proposalId: Compact<ProposalIndex> | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
    };
    polymeshCommittee: {
      /**
       * Change the vote threshold the determines the winning proposal. For e.g., for a simple
       * majority use (1, 2) which represents the inequation ">= 1/2"
       * # Arguments
       * * `match_criteria` One of {AtLeast, MoreThan}
       * * `n` Numerator of the fraction representing vote threshold
       * * `d` Denominator of the fraction representing vote threshold
       **/
      setVoteThreshold: AugmentedSubmittable<
        (
          n: u32 | AnyNumber | Uint8Array,
          d: u32 | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Any committee member proposes a dispatchable.
       * # Arguments
       * * `proposal` A dispatchable call
       **/
      propose: AugmentedSubmittable<
        (
          proposal: Proposal | { callIndex?: any; args?: any } | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Member casts a vote.
       * # Arguments
       * * `proposal` Hash of proposal to be voted on
       * * `index` Proposal index
       * * `approve` Represents a `for` or `against` vote
       **/
      vote: AugmentedSubmittable<
        (
          proposal: Hash | string | Uint8Array,
          index: Compact<ProposalIndex> | AnyNumber | Uint8Array,
          approve: bool | boolean | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
    };
    committeeMembership: {
      /**
       * It disables a member at specific moment.
       * Please note that if member is already revoked (a "valid member"), its revocation
       * time-stamp will be updated.
       * Any disabled member should NOT allow to act like an active member of the group. For
       * instance, a disabled CDD member should NOT be able to generate a CDD claim. However any
       * generated claim issued before `at` would be considered as a valid one.
       * If you want to invalidate any generated claim, you should use `Self::remove_member`.
       * # Arguments
       * * `at` Revocation time-stamp.
       * * `who` Target member of the group.
       * * `expiry` Time-stamp when `who` is removed from CDD. As soon as it is expired, the
       * generated claims will be "invalid" as `who` is not considered a member of the group.
       **/
      disableMember: AugmentedSubmittable<
        (
          who: IdentityId | string | Uint8Array,
          expiry: Option<Moment> | null | object | string | Uint8Array,
          at: Option<Moment> | null | object | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Add a member `who` to the set. May only be called from `AddOrigin` or root.
       * # Arguments
       * * `origin` Origin representing `AddOrigin` or root
       * * `who` IdentityId to be added to the group.
       **/
      addMember: AugmentedSubmittable<
        (who: IdentityId | string | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Remove a member `who` from the set. May only be called from `RemoveOrigin` or root.
       * Any claim previously generated by this member is not valid as a group claim. For
       * instance, if a CDD member group generated a claim for a target identity and then it is
       * removed, that claim will be invalid.
       * In case you want to keep the validity of generated claims, you have to use `Self::disable_member` function
       * # Arguments
       * * `origin` Origin representing `RemoveOrigin` or root
       * * `who` IdentityId to be removed from the group.
       **/
      removeMember: AugmentedSubmittable<
        (who: IdentityId | string | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Swap out one member `remove` for another `add`.
       * May only be called from `SwapOrigin` or root.
       * # Arguments
       * * `origin` Origin representing `SwapOrigin` or root
       * * `remove` IdentityId to be removed from the group.
       * * `add` IdentityId to be added in place of `remove`.
       **/
      swapMember: AugmentedSubmittable<
        (
          remove: IdentityId | string | Uint8Array,
          add: IdentityId | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Change the membership to a new set, disregarding the existing membership.
       * May only be called from `ResetOrigin` or root.
       * # Arguments
       * * `origin` Origin representing `ResetOrigin` or root
       * * `members` New set of identities
       **/
      resetMembers: AugmentedSubmittable<
        (
          members: Vec<IdentityId> | (IdentityId | string | Uint8Array)[]
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * It allows a caller member to unilaterally quit without this
       * being subject to a GC vote.
       * # Arguments
       * * `origin` Member of committee who wants to quit.
       * # Error
       * * Only master key can abdicate.
       * * Last member of a group
       **/
      abdicateMembership: AugmentedSubmittable<() => SubmittableExtrinsic<ApiType>>;
    };
    mips: {
      /**
       * Change the minimum proposal deposit amount required to start a proposal. Only Governance
       * committee is allowed to change this value.
       * # Arguments
       * * `deposit` the new min deposit required to start a proposal
       **/
      setMinProposalDeposit: AugmentedSubmittable<
        (deposit: BalanceOf | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Change the quorum threshold amount. This is the amount which a proposal must gather so
       * as to be considered by a committee. Only Governance committee is allowed to change
       * this value.
       * # Arguments
       * * `threshold` the new quorum threshold amount value
       **/
      setQuorumThreshold: AugmentedSubmittable<
        (threshold: BalanceOf | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Change the proposal duration value. This is the number of blocks for which votes are
       * accepted on a proposal. Only Governance committee is allowed to change this value.
       * # Arguments
       * * `duration` proposal duration in blocks
       **/
      setProposalDuration: AugmentedSubmittable<
        (duration: BlockNumber | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * A network member creates a Mesh Improvement Proposal by submitting a dispatchable which
       * changes the network in someway. A minimum deposit is required to open a new proposal.
       * # Arguments
       * * `proposal` a dispatchable call
       * * `deposit` minimum deposit value
       * * `url` a link to a website for proposal discussion
       **/
      propose: AugmentedSubmittable<
        (
          proposal: Proposal | { callIndex?: any; args?: any } | string | Uint8Array,
          deposit: BalanceOf | AnyNumber | Uint8Array,
          url: Option<Url> | null | object | string | Uint8Array,
          description: Option<MipDescription> | null | object | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * A network member can vote on any Mesh Improvement Proposal by selecting the hash that
       * corresponds ot the dispatchable action and vote with some balance.
       * # Arguments
       * * `proposal` a dispatchable call
       * * `index` proposal index
       * * `aye_or_nay` a bool representing for or against vote
       * * `deposit` minimum deposit value
       **/
      vote: AugmentedSubmittable<
        (
          proposalHash: Hash | string | Uint8Array,
          index: MipsIndex | AnyNumber | Uint8Array,
          ayeOrNay: bool | boolean | Uint8Array,
          deposit: BalanceOf | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * An emergency stop measure to kill a proposal. Governance committee can kill
       * a proposal at any time.
       **/
      killProposal: AugmentedSubmittable<
        (
          index: MipsIndex | AnyNumber | Uint8Array,
          proposalHash: Hash | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Any governance committee member can fast track a proposal and turn it into a referendum
       * that will be voted on by the committee.
       **/
      fastTrackProposal: AugmentedSubmittable<
        (
          index: MipsIndex | AnyNumber | Uint8Array,
          proposalHash: Hash | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Governance committee can make a proposal that automatically becomes a referendum on
       * which the committee can vote on.
       **/
      submitReferendum: AugmentedSubmittable<
        (
          proposal: Proposal | { callIndex?: any; args?: any } | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Moves a referendum instance into dispatch queue.
       **/
      enactReferendum: AugmentedSubmittable<
        (proposalHash: Hash | string | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
    };
    asset: {
      /**
       * This function is used to either register a new ticker or extend validity of an exisitng ticker
       * NB Ticker validity does not get carryforward when renewing ticker
       * # Arguments
       * * `origin` It contains the signing key of the caller (i.e who signed the transaction to execute this function)
       * * `ticker` ticker to register
       **/
      registerTicker: AugmentedSubmittable<
        (ticker: Ticker | string | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * This function is used to accept a ticker transfer
       * NB: To reject the transfer, call remove auth function in identity module.
       * # Arguments
       * * `origin` It contains the signing key of the caller (i.e who signed the transaction to execute this function)
       * * `auth_id` Authorization ID of ticker transfer authorization
       **/
      acceptTickerTransfer: AugmentedSubmittable<
        (authId: u64 | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * This function is used to accept a token ownership transfer
       * NB: To reject the transfer, call remove auth function in identity module.
       * # Arguments
       * * `origin` It contains the signing key of the caller (i.e who signed the transaction to execute this function)
       * * `auth_id` Authorization ID of the token ownership transfer authorization
       **/
      acceptTokenOwnershipTransfer: AugmentedSubmittable<
        (authId: u64 | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Initializes a new security token
       * makes the initiating account the owner of the security token
       * & the balance of the owner is set to total supply
       * # Arguments
       * * `origin` - contains the signing key of the caller (i.e who signed the transaction to execute this function).
       * * `name` - the name of the token.
       * * `ticker` - the ticker symbol of the token.
       * * `total_supply` - the total supply of the token.
       * * `divisible` - a boolean to identify the divisibility status of the token.
       * * `asset_type` - the asset type.
       * * `identifiers` - a vector of asset identifiers.
       * * `funding_round` - name of the funding round
       **/
      createToken: AugmentedSubmittable<
        (
          name: TokenName | string,
          ticker: Ticker | string | Uint8Array,
          totalSupply: Balance | AnyNumber | Uint8Array,
          divisible: bool | boolean | Uint8Array,
          assetType:
            | AssetType
            | { equity: any }
            | { debt: any }
            | { commodity: any }
            | { structuredProduct: any }
            | { custom: any }
            | string
            | Uint8Array,
          identifiers:
            | Vec<ITuple<[IdentifierType, AssetIdentifier]>>
            | [
                (
                  | IdentifierType
                  | { isin: any }
                  | { cusip: any }
                  | { custom: any }
                  | string
                  | Uint8Array
                ),
                AssetIdentifier | string
              ][],
          fundingRound: Option<FundingRoundName> | null | object | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Freezes transfers and minting of a given token.
       * # Arguments
       * * `origin` - the signing key of the sender
       * * `ticker` - the ticker of the token
       **/
      freeze: AugmentedSubmittable<
        (ticker: Ticker | string | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Unfreezes transfers and minting of a given token.
       * # Arguments
       * * `origin` - the signing key of the sender
       * * `ticker` - the ticker of the frozen token
       **/
      unfreeze: AugmentedSubmittable<
        (ticker: Ticker | string | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Renames a given token.
       * # Arguments
       * * `origin` - the signing key of the sender
       * * `ticker` - the ticker of the token
       * * `name` - the new name of the token
       **/
      renameToken: AugmentedSubmittable<
        (
          ticker: Ticker | string | Uint8Array,
          name: TokenName | string
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Transfer tokens from one DID to another DID as tokens are stored/managed on the DID level
       * # Arguments
       * * `_origin` signing key of the sender
       * * `ticker` Ticker of the token
       * * `to_did` DID of the `to` token holder, to whom token needs to transferred
       * * `value` Value that needs to transferred
       **/
      transfer: AugmentedSubmittable<
        (
          ticker: Ticker | string | Uint8Array,
          toDid: IdentityId | string | Uint8Array,
          value: Balance | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Forces a transfer between two DIDs & This can only be called by security token owner.
       * This function doesn't validate any type of restriction beside a valid CDD check
       * # Arguments
       * * `_origin` signing key of the token owner DID.
       * * `ticker` symbol of the token
       * * `from_did` DID of the token holder from whom balance token will be transferred.
       * * `to_did` DID of token holder to whom token balance will be transferred.
       * * `value` Amount of tokens.
       * * `data` Some off chain data to validate the restriction.
       * * `operator_data` It is a string which describes the reason of this control transfer call.
       **/
      controllerTransfer: AugmentedSubmittable<
        (
          ticker: Ticker | string | Uint8Array,
          fromDid: IdentityId | string | Uint8Array,
          toDid: IdentityId | string | Uint8Array,
          value: Balance | AnyNumber | Uint8Array,
          data: Bytes | string | Uint8Array,
          operatorData: Bytes | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * approve token transfer from one DID to DID
       * once this is done, transfer_from can be called with corresponding values
       * # Arguments
       * * `_origin` Signing key of the token owner (i.e sender)
       * * `spender_did` DID of the spender
       * * `value` Amount of the tokens approved
       **/
      approve: AugmentedSubmittable<
        (
          ticker: Ticker | string | Uint8Array,
          spenderDid: IdentityId | string | Uint8Array,
          value: Balance | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * If sufficient allowance provided, transfer from a DID to another DID without token owner's signature.
       * # Arguments
       * * `_origin` Signing key of spender
       * * `_ticker` Ticker of the token
       * * `from_did` DID from whom token is being transferred
       * * `to_did` DID to whom token is being transferred
       * * `value` Amount of the token for transfer
       **/
      transferFrom: AugmentedSubmittable<
        (
          ticker: Ticker | string | Uint8Array,
          fromDid: IdentityId | string | Uint8Array,
          toDid: IdentityId | string | Uint8Array,
          value: Balance | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Function used to create the checkpoint
       * # Arguments
       * * `origin` Signing key of the token owner. (Only token owner can call this function).
       * * `_ticker` Ticker of the token
       **/
      createCheckpoint: AugmentedSubmittable<
        (ticker: Ticker | string | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Function is used to issue(or mint) new tokens for the given DID
       * can only be executed by the token owner
       * # Arguments
       * * `origin` Signing key of token owner
       * * `ticker` Ticker of the token
       * * `to_did` DID of the token holder to whom new tokens get issued.
       * * `value` Amount of tokens that get issued
       **/
      issue: AugmentedSubmittable<
        (
          ticker: Ticker | string | Uint8Array,
          toDid: IdentityId | string | Uint8Array,
          value: Balance | AnyNumber | Uint8Array,
          data: Bytes | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Function is used issue(or mint) new tokens for the given DIDs
       * can only be executed by the token owner
       * # Arguments
       * * `origin` Signing key of token owner
       * * `ticker` Ticker of the token
       * * `investor_dids` Array of the DID of the token holders to whom new tokens get issued.
       * * `values` Array of the Amount of tokens that get issued
       **/
      batchIssue: AugmentedSubmittable<
        (
          ticker: Ticker | string | Uint8Array,
          investorDids: Vec<IdentityId> | (IdentityId | string | Uint8Array)[],
          values: Vec<Balance> | (Balance | AnyNumber | Uint8Array)[]
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Used to redeem the security tokens
       * # Arguments
       * * `_origin` Signing key of the token holder who wants to redeem the tokens
       * * `ticker` Ticker of the token
       * * `value` Amount of the tokens needs to redeem
       * * `_data` An off chain data blob used to validate the redeem functionality.
       **/
      redeem: AugmentedSubmittable<
        (
          ticker: Ticker | string | Uint8Array,
          value: Balance | AnyNumber | Uint8Array,
          data: Bytes | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Used to redeem the security tokens by some other DID who has approval
       * # Arguments
       * * `_origin` Signing key of the spender who has valid approval to redeem the tokens
       * * `ticker` Ticker of the token
       * * `from_did` DID from whom balance get reduced
       * * `value` Amount of the tokens needs to redeem
       * * `_data` An off chain data blob used to validate the redeem functionality.
       **/
      redeemFrom: AugmentedSubmittable<
        (
          ticker: Ticker | string | Uint8Array,
          fromDid: IdentityId | string | Uint8Array,
          value: Balance | AnyNumber | Uint8Array,
          data: Bytes | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Forces a redemption of an DID's tokens. Can only be called by token owner
       * # Arguments
       * * `_origin` Signing key of the token owner
       * * `ticker` Ticker of the token
       * * `token_holder_did` DID from whom balance get reduced
       * * `value` Amount of the tokens needs to redeem
       * * `data` An off chain data blob used to validate the redeem functionality.
       * * `operator_data` Any data blob that defines the reason behind the force redeem.
       **/
      controllerRedeem: AugmentedSubmittable<
        (
          ticker: Ticker | string | Uint8Array,
          tokenHolderDid: IdentityId | string | Uint8Array,
          value: Balance | AnyNumber | Uint8Array,
          data: Bytes | string | Uint8Array,
          operatorData: Bytes | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Makes an indivisible token divisible. Only called by the token owner
       * # Arguments
       * * `origin` Signing key of the token owner.
       * * `ticker` Ticker of the token
       **/
      makeDivisible: AugmentedSubmittable<
        (ticker: Ticker | string | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Checks whether a transaction with given parameters can take place or not
       * This function is state less function and used to validate the transfer before actual transfer call.
       * # Arguments
       * * `_origin` Signing Key of the caller
       * * `ticker` Ticker of the token
       * * `from_did` DID from whom tokens will be transferred
       * * `to_did` DID to whom tokens will be transferred
       * * `value` Amount of the tokens
       * * `data` Off chain data blob to validate the transfer.
       **/
      canTransfer: AugmentedSubmittable<
        (
          ticker: Ticker | string | Uint8Array,
          fromDid: IdentityId | string | Uint8Array,
          toDid: IdentityId | string | Uint8Array,
          value: Balance | AnyNumber | Uint8Array,
          data: Bytes | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * An ERC1594 transfer with data
       * This function can be used by the exchanges of other third parties to dynamically validate the transaction
       * by passing the data blob
       * # Arguments
       * * `origin` Signing key of the sender
       * * `ticker` Ticker of the token
       * * `to_did` DID to whom tokens will be transferred
       * * `value` Amount of the tokens
       * * `data` Off chain data blob to validate the transfer.
       **/
      transferWithData: AugmentedSubmittable<
        (
          ticker: Ticker | string | Uint8Array,
          toDid: IdentityId | string | Uint8Array,
          value: Balance | AnyNumber | Uint8Array,
          data: Bytes | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * An ERC1594 transfer_from with data
       * This function can be used by the exchanges of other third parties to dynamically validate the transaction
       * by passing the data blob
       * # Arguments
       * * `origin` Signing key of the spender
       * * `ticker` Ticker of the token
       * * `from_did` DID from whom tokens will be transferred
       * * `to_did` DID to whom tokens will be transferred
       * * `value` Amount of the tokens
       * * `data` Off chain data blob to validate the transfer.
       **/
      transferFromWithData: AugmentedSubmittable<
        (
          ticker: Ticker | string | Uint8Array,
          fromDid: IdentityId | string | Uint8Array,
          toDid: IdentityId | string | Uint8Array,
          value: Balance | AnyNumber | Uint8Array,
          data: Bytes | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Used to know whether the given token will issue new tokens or not
       * # Arguments
       * * `_origin` Signing key
       * * `ticker` Ticker of the token whose issuance status need to know
       **/
      isIssuable: AugmentedSubmittable<
        (ticker: Ticker | string | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Add documents for a given token. To be called only by the token owner
       * # Arguments
       * * `origin` Signing key of the token owner
       * * `ticker` Ticker of the token
       * * `documents` Documents to be attached to `ticker`
       **/
      addDocuments: AugmentedSubmittable<
        (
          ticker: Ticker | string | Uint8Array,
          documents:
            | Vec<Document>
            | (Document | { name?: any; uri?: any; content_hash?: any } | string | Uint8Array)[]
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Remove documents for a given token. To be called only by the token owner
       * # Arguments
       * * `origin` Signing key of the token owner
       * * `ticker` Ticker of the token
       * * `doc_ids` Documents to be removed from `ticker`
       **/
      removeDocuments: AugmentedSubmittable<
        (
          ticker: Ticker | string | Uint8Array,
          docIds: Vec<u64> | (u64 | AnyNumber | Uint8Array)[]
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Update documents for the given token, Only be called by the token owner
       * # Arguments
       * * `origin` Signing key of the token owner
       * * `ticker` Ticker of the token
       * * `docs` Vector of tuples (Document to be updated, Contents of new document)
       **/
      updateDocuments: AugmentedSubmittable<
        (
          ticker: Ticker | string | Uint8Array,
          docs:
            | Vec<ITuple<[u64, Document]>>
            | [
                u64 | AnyNumber | Uint8Array,
                Document | { name?: any; uri?: any; content_hash?: any } | string | Uint8Array
              ][]
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * ERC-2258 Implementation
       * Used to increase the allowance for a given custodian
       * Any investor/token holder can add a custodian and transfer the token transfer ownership to the custodian
       * Through that investor balance will remain the same but the given token are only transfer by the custodian.
       * This implementation make sure to have an accurate investor count from omnibus wallets.
       * # Arguments
       * * `origin` Signing key of the token holder
       * * `ticker` Ticker of the token
       * * `holder_did` DID of the token holder (i.e who wants to increase the custody allowance)
       * * `custodian_did` DID of the custodian (i.e whom allowance provided)
       * * `value` Allowance amount
       **/
      increaseCustodyAllowance: AugmentedSubmittable<
        (
          ticker: Ticker | string | Uint8Array,
          holderDid: IdentityId | string | Uint8Array,
          custodianDid: IdentityId | string | Uint8Array,
          value: Balance | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Used to increase the allowance for a given custodian by providing the off chain signature
       * # Arguments
       * * `origin` Signing key of a DID who posses off chain signature
       * * `ticker` Ticker of the token
       * * `holder_did` DID of the token holder (i.e who wants to increase the custody allowance)
       * * `holder_account_id` Signing key which signs the off chain data blob.
       * * `custodian_did` DID of the custodian (i.e whom allowance provided)
       * * `caller_did` DID of the caller
       * * `value` Allowance amount
       * * `nonce` A u16 number which avoid the replay attack
       * * `signature` Signature provided by the holder_did
       **/
      increaseCustodyAllowanceOf: AugmentedSubmittable<
        (
          ticker: Ticker | string | Uint8Array,
          holderDid: IdentityId | string | Uint8Array,
          holderAccountId: AccountId | string | Uint8Array,
          custodianDid: IdentityId | string | Uint8Array,
          callerDid: IdentityId | string | Uint8Array,
          value: Balance | AnyNumber | Uint8Array,
          nonce: u16 | AnyNumber | Uint8Array,
          signature: OffChainSignature | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Used to transfer the tokens by the approved custodian
       * # Arguments
       * * `origin` Signing key of the custodian
       * * `ticker` Ticker of the token
       * * `holder_did` DID of the token holder (i.e whom balance get reduced)
       * * `custodian_did` DID of the custodian (i.e who has the valid approved allowance)
       * * `receiver_did` DID of the receiver
       * * `value` Amount of tokens need to transfer
       **/
      transferByCustodian: AugmentedSubmittable<
        (
          ticker: Ticker | string | Uint8Array,
          holderDid: IdentityId | string | Uint8Array,
          custodianDid: IdentityId | string | Uint8Array,
          receiverDid: IdentityId | string | Uint8Array,
          value: Balance | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Sets the name of the current funding round.
       * # Arguments
       * * `origin` - the signing key of the token owner DID.
       * * `ticker` - the ticker of the token.
       * * `name` - the desired name of the current funding round.
       **/
      setFundingRound: AugmentedSubmittable<
        (
          ticker: Ticker | string | Uint8Array,
          name: FundingRoundName | string
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Updates the asset identifiers. Can only be called by the token owner.
       * # Arguments
       * * `origin` - the signing key of the token owner
       * * `ticker` - the ticker of the token
       * * `identifiers` - the asset identifiers to be updated in the form of a vector of pairs
       * of `IdentifierType` and `AssetIdentifier` value.
       **/
      updateIdentifiers: AugmentedSubmittable<
        (
          ticker: Ticker | string | Uint8Array,
          identifiers:
            | Vec<ITuple<[IdentifierType, AssetIdentifier]>>
            | [
                (
                  | IdentifierType
                  | { isin: any }
                  | { cusip: any }
                  | { custom: any }
                  | string
                  | Uint8Array
                ),
                AssetIdentifier | string
              ][]
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Whitelisting the Smart-Extension address for a given ticker
       * # Arguments
       * * `origin` - Signatory who owns to ticker/asset
       * * `ticker` - ticker for whom extension get added
       * * `extension_details` - Details of the smart extension
       **/
      addExtension: AugmentedSubmittable<
        (
          ticker: Ticker | string | Uint8Array,
          extensionDetails:
            | SmartExtension
            | { extension_type?: any; extension_name?: any; extension_id?: any; is_archive?: any }
            | string
            | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Archived the extension. Extension will not be used to verify the compliance or any smart logic it posses
       * # Arguments
       * * `origin` - Signatory who owns the ticker/asset.
       * * `ticker` - Ticker symbol of the asset.
       * * `extension_id` - AccountId of the extension that need to be archived
       **/
      archiveExtension: AugmentedSubmittable<
        (
          ticker: Ticker | string | Uint8Array,
          extensionId: AccountId | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Archived the extension. Extension will not be used to verify the compliance or any smart logic it posses
       * # Arguments
       * * `origin` - Signatory who owns the ticker/asset.
       * * `ticker` - Ticker symbol of the asset.
       * * `extension_id` - AccountId of the extension that need to be un-archived
       **/
      unarchiveExtension: AugmentedSubmittable<
        (
          ticker: Ticker | string | Uint8Array,
          extensionId: AccountId | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
    };
    bridge: {
      /**
       * Change the controller account as admin.
       **/
      changeController: AugmentedSubmittable<
        (controller: AccountId | string | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Change the bridge admin key.
       **/
      changeAdmin: AugmentedSubmittable<
        (admin: AccountId | string | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Change the timelock period.
       **/
      changeTimelock: AugmentedSubmittable<
        (timelock: BlockNumber | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Freezes the entire operation of the bridge module if it is not already frozen. The only
       * available operations in the frozen state are the following admin methods:
       * * `change_controller`,
       * * `change_admin`,
       * * `change_timelock`,
       * * `unfreeze`,
       * * `freeze_bridge_txs`,
       * * `unfreeze_bridge_txs`.
       **/
      freeze: AugmentedSubmittable<() => SubmittableExtrinsic<ApiType>>;
      /**
       * Unfreezes the operation of the bridge module if it is frozen.
       **/
      unfreeze: AugmentedSubmittable<() => SubmittableExtrinsic<ApiType>>;
      /**
       * Proposes a bridge transaction, which amounts to making a multisig proposal for the
       * bridge transaction if the transaction is new or approving an existing proposal if the
       * transaction has already been proposed.
       **/
      proposeBridgeTx: AugmentedSubmittable<
        (
          bridgeTx:
            | BridgeTx
            | { nonce?: any; recipient?: any; value?: any; tx_hash?: any }
            | string
            | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Finalizes pending bridge transactions following a receipt of a valid CDD by the
       * recipient identity.
       **/
      finalizePending: AugmentedSubmittable<
        (did: IdentityId | string | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Handles an approved bridge transaction proposal.
       **/
      handleBridgeTx: AugmentedSubmittable<
        (
          bridgeTx:
            | BridgeTx
            | { nonce?: any; recipient?: any; value?: any; tx_hash?: any }
            | string
            | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Freezes given bridge transactions.
       **/
      freezeTxs: AugmentedSubmittable<
        (
          bridgeTxs:
            | Vec<BridgeTx>
            | (
                | BridgeTx
                | { nonce?: any; recipient?: any; value?: any; tx_hash?: any }
                | string
                | Uint8Array
              )[]
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Unfreezes given bridge transactions.
       **/
      unfreezeTxs: AugmentedSubmittable<
        (
          bridgeTxs:
            | Vec<BridgeTx>
            | (
                | BridgeTx
                | { nonce?: any; recipient?: any; value?: any; tx_hash?: any }
                | string
                | Uint8Array
              )[]
        ) => SubmittableExtrinsic<ApiType>
      >;
    };
    dividend: {
      /**
       * Creates a new dividend entry without payout. Token must have at least one checkpoint.
       **/
      new: AugmentedSubmittable<
        (
          amount: Balance | AnyNumber | Uint8Array,
          ticker: Ticker | string | Uint8Array,
          maturesAt: Moment | AnyNumber | Uint8Array,
          expiresAt: Moment | AnyNumber | Uint8Array,
          payoutTicker: Ticker | string | Uint8Array,
          checkpointId: u64 | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Lets the owner cancel a dividend before start/maturity date
       **/
      cancel: AugmentedSubmittable<
        (
          ticker: Ticker | string | Uint8Array,
          dividendId: u32 | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Withdraws from a dividend the adequate share of the `amount` field. All dividend shares
       * are rounded by truncation (down to first integer below)
       **/
      claim: AugmentedSubmittable<
        (
          ticker: Ticker | string | Uint8Array,
          dividendId: u32 | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * After a dividend had expired, collect the remaining amount to owner address
       **/
      claimUnclaimed: AugmentedSubmittable<
        (
          ticker: Ticker | string | Uint8Array,
          dividendId: u32 | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
    };
    identity: {
      registerDid: AugmentedSubmittable<
        (
          signingItems:
            | Vec<SigningItem>
            | (
                | SigningItem
                | { signer?: any; signer_type?: any; permissions?: any }
                | string
                | Uint8Array
              )[]
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Register `target_account` with a new Identity.
       * # Failure
       * - `origin` has to be a active CDD provider. Inactive CDD providers cannot add new
       * claims.
       * - `target_account` (master key of the new Identity) can be linked to just one and only
       * one identity.
       * - External signing keys can be linked to just one identity.
       * # TODO
       * - Imbalance: Since we are not handling the imbalance here, this will leave a hold in
       * the total supply. We are reducing someone's balance but not increasing anyone's
       * else balance or decreasing total supply. This will mean that the sum of all
       * balances will become less than the total supply.
       **/
      cddRegisterDid: AugmentedSubmittable<
        (
          targetAccount: AccountId | string | Uint8Array,
          cddClaimExpiry: Option<Moment> | null | object | string | Uint8Array,
          signingItems:
            | Vec<SigningItem>
            | (
                | SigningItem
                | { signer?: any; signer_type?: any; permissions?: any }
                | string
                | Uint8Array
              )[]
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * It invalidates any claim generated by `cdd` from `disable_from` timestamps.
       * You can also define an expiration time, which will invalidate all claims generated by
       * that `cdd` and remove it as CDD member group.
       **/
      invalidateCddClaims: AugmentedSubmittable<
        (
          cdd: IdentityId | string | Uint8Array,
          disableFrom: Moment | AnyNumber | Uint8Array,
          expiry: Option<Moment> | null | object | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Removes specified signing keys of a DID if present.
       * # Failure
       * It can only called by master key owner.
       **/
      removeSigningItems: AugmentedSubmittable<
        (
          signersToRemove:
            | Vec<Signatory>
            | (Signatory | { identity: any } | { accountKey: any } | string | Uint8Array)[]
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Sets a new master key for a DID.
       * # Failure
       * Only called by master key owner.
       **/
      setMasterKey: AugmentedSubmittable<
        (newKey: AccountKey | string | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Call this with the new master key. By invoking this method, caller accepts authorization
       * with the new master key. If a CDD service provider approved this change, master key of
       * the DID is updated.
       * # Arguments
       * * `owner_auth_id` Authorization from the owner who initiated the change
       * * `cdd_auth_id` Authorization from a CDD service provider
       **/
      acceptMasterKey: AugmentedSubmittable<
        (
          rotationAuthId: u64 | AnyNumber | Uint8Array,
          optionalCddAuthId: Option<u64> | null | object | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Set if CDD authorization is required for updating master key of an identity.
       * Callable via root (governance)
       * # Arguments
       * * `auth_required` CDD Authorization required or not
       **/
      changeCddRequirementForMkRotation: AugmentedSubmittable<
        (authRequired: bool | boolean | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Join an identity as a signing key
       **/
      joinIdentityAsKey: AugmentedSubmittable<
        (authId: u64 | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Join an identity as a signing identity
       **/
      joinIdentityAsIdentity: AugmentedSubmittable<
        (authId: u64 | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Adds new claim record or edits an existing one. Only called by did_issuer's signing key
       **/
      addClaim: AugmentedSubmittable<
        (
          target: IdentityId | string | Uint8Array,
          claim:
            | Claim
            | { accredited: any }
            | { affiliate: any }
            | { buyLockup: any }
            | { sellLockup: any }
            | { customerDueDiligence: any }
            | { knowYourCustomer: any }
            | { jurisdiction: any }
            | { whitelisted: any }
            | { blacklisted: any }
            | { noData: any }
            | string
            | Uint8Array,
          expiry: Option<Moment> | null | object | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Adds a new batch of claim records or edits an existing one. Only called by
       * `did_issuer`'s signing key.
       **/
      addClaimsBatch: AugmentedSubmittable<
        (
          claims:
            | Vec<BatchAddClaimItem>
            | (
                | BatchAddClaimItem
                | { target?: any; claim?: any; expiry?: any }
                | string
                | Uint8Array
              )[]
        ) => SubmittableExtrinsic<ApiType>
      >;
      forwardedCall: AugmentedSubmittable<
        (
          targetDid: IdentityId | string | Uint8Array,
          proposal: Proposal | { callIndex?: any; args?: any } | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Marks the specified claim as revoked
       **/
      revokeClaim: AugmentedSubmittable<
        (
          target: IdentityId | string | Uint8Array,
          claim:
            | Claim
            | { accredited: any }
            | { affiliate: any }
            | { buyLockup: any }
            | { sellLockup: any }
            | { customerDueDiligence: any }
            | { knowYourCustomer: any }
            | { jurisdiction: any }
            | { whitelisted: any }
            | { blacklisted: any }
            | { noData: any }
            | string
            | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Revoke multiple claims in a batch
       * # Arguments
       * * origin - did issuer
       * * did_and_claim_data - Vector of the identities & the corresponding claim data whom claim needs to be revoked
       **/
      revokeClaimsBatch: AugmentedSubmittable<
        (
          claims:
            | Vec<BatchRevokeClaimItem>
            | (BatchRevokeClaimItem | { target?: any; claim?: any } | string | Uint8Array)[]
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * It sets permissions for an specific `target_key` key.
       * Only the master key of an identity is able to set signing key permissions.
       **/
      setPermissionToSigner: AugmentedSubmittable<
        (
          signer: Signatory | { identity: any } | { accountKey: any } | string | Uint8Array,
          permissions:
            | Vec<Permission>
            | (Permission | ('Full' | 'Admin' | 'Operator' | 'SpendFunds') | number | Uint8Array)[]
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * It disables all signing keys at `did` identity.
       * # Errors
       **/
      freezeSigningKeys: AugmentedSubmittable<() => SubmittableExtrinsic<ApiType>>;
      unfreezeSigningKeys: AugmentedSubmittable<() => SubmittableExtrinsic<ApiType>>;
      getMyDid: AugmentedSubmittable<() => SubmittableExtrinsic<ApiType>>;
      /**
       * Adds an authorization
       **/
      addAuthorization: AugmentedSubmittable<
        (
          target: Signatory | { identity: any } | { accountKey: any } | string | Uint8Array,
          authorizationData:
            | AuthorizationData
            | { attestMasterKeyRotation: any }
            | { rotateMasterKey: any }
            | { transferTicker: any }
            | { addMultiSigSigner: any }
            | { transferTokenOwnership: any }
            | { joinIdentity: any }
            | { custom: any }
            | { noData: any }
            | string
            | Uint8Array,
          expiry: Option<Moment> | null | object | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Adds an authorization as a key.
       * To be used by signing keys that don't have an identity
       **/
      addAuthorizationAsKey: AugmentedSubmittable<
        (
          target: Signatory | { identity: any } | { accountKey: any } | string | Uint8Array,
          authorizationData:
            | AuthorizationData
            | { attestMasterKeyRotation: any }
            | { rotateMasterKey: any }
            | { transferTicker: any }
            | { addMultiSigSigner: any }
            | { transferTokenOwnership: any }
            | { joinIdentity: any }
            | { custom: any }
            | { noData: any }
            | string
            | Uint8Array,
          expiry: Option<Moment> | null | object | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Adds an array of authorization
       **/
      batchAddAuthorization: AugmentedSubmittable<
        (
          auths:
            | Vec<ITuple<[Signatory, AuthorizationData, Option<Moment>]>>
            | [
                Signatory | { identity: any } | { accountKey: any } | string | Uint8Array,
                (
                  | AuthorizationData
                  | { attestMasterKeyRotation: any }
                  | { rotateMasterKey: any }
                  | { transferTicker: any }
                  | { addMultiSigSigner: any }
                  | { transferTokenOwnership: any }
                  | { joinIdentity: any }
                  | { custom: any }
                  | { noData: any }
                  | string
                  | Uint8Array
                ),
                Option<Moment> | null | object | string | Uint8Array
              ][]
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Removes an authorization
       **/
      removeAuthorization: AugmentedSubmittable<
        (
          target: Signatory | { identity: any } | { accountKey: any } | string | Uint8Array,
          authId: u64 | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Removes an array of authorizations
       **/
      batchRemoveAuthorization: AugmentedSubmittable<
        (
          authIdentifiers:
            | Vec<AuthIdentifier>
            | (AuthIdentifier | { signatory?: any; auth_id?: any } | string | Uint8Array)[]
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Accepts an authorization
       **/
      acceptAuthorization: AugmentedSubmittable<
        (authId: u64 | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Accepts an array of authorizations
       **/
      batchAcceptAuthorization: AugmentedSubmittable<
        (authIds: Vec<u64> | (u64 | AnyNumber | Uint8Array)[]) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * It adds signing keys to target identity `id`.
       * Keys are directly added to identity because each of them has an authorization.
       * Arguments:
       * - `origin` Master key of `id` identity.
       * - `id` Identity where new signing keys will be added.
       * - `additional_keys` New signing items (and their authorization data) to add to target
       * identity.
       * Failure
       * - It can only called by master key owner.
       * - Keys should be able to linked to any identity.
       **/
      addSigningItemsWithAuthorization: AugmentedSubmittable<
        (
          expiresAt: Moment | AnyNumber | Uint8Array,
          additionalKeys:
            | Vec<SigningItemWithAuth>
            | (
                | SigningItemWithAuth
                | { signing_item?: any; auth_signature?: any }
                | string
                | Uint8Array
              )[]
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * It revokes the `auth` off-chain authorization of `signer`. It only takes effect if
       * the authorized transaction is not yet executed.
       **/
      revokeOffchainAuthorization: AugmentedSubmittable<
        (
          signer: Signatory | { identity: any } | { accountKey: any } | string | Uint8Array,
          auth:
            | TargetIdAuthorization
            | { target_id?: any; nonce?: any; expires_at?: any }
            | string
            | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
    };
    generalTm: {
      /**
       * Adds an asset rule to active rules for a ticker
       * # Arguments
       * * origin - Signer of the dispatchable. It should be the owner of the ticker
       * * ticker - Symbol of the asset
       * * sender_rules - Sender transfer rule.
       * * receiver_rules - Receiver transfer rule.
       **/
      addActiveRule: AugmentedSubmittable<
        (
          ticker: Ticker | string | Uint8Array,
          senderRules:
            | Vec<Rule>
            | (Rule | { rule_type?: any; issuers?: any } | string | Uint8Array)[],
          receiverRules:
            | Vec<Rule>
            | (Rule | { rule_type?: any; issuers?: any } | string | Uint8Array)[]
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Removes a rule from active asset rules
       * # Arguments
       * * origin - Signer of the dispatchable. It should be the owner of the ticker
       * * ticker - Symbol of the asset
       * * asset_rule_id - Rule id which is need to be removed
       **/
      removeActiveRule: AugmentedSubmittable<
        (
          ticker: Ticker | string | Uint8Array,
          assetRuleId: u32 | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Removes all active rules of a given ticker
       * # Arguments
       * * origin - Signer of the dispatchable. It should be the owner of the ticker
       * * ticker - Symbol of the asset
       **/
      resetActiveRules: AugmentedSubmittable<
        (ticker: Ticker | string | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * It pauses the verification of rules for `ticker` during transfers.
       * # Arguments
       * * origin - Signer of the dispatchable. It should be the owner of the ticker
       * * ticker - Symbol of the asset
       **/
      pauseAssetRules: AugmentedSubmittable<
        (ticker: Ticker | string | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * It resumes the verification of rules for `ticker` during transfers.
       * # Arguments
       * * origin - Signer of the dispatchable. It should be the owner of the ticker
       * * ticker - Symbol of the asset
       **/
      resumeAssetRules: AugmentedSubmittable<
        (ticker: Ticker | string | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * To add the default trusted claim issuer for a given asset
       * Addition - When the given element is not exist
       * # Arguments
       * * origin - Signer of the dispatchable. It should be the owner of the ticker.
       * * ticker - Symbol of the asset.
       * * trusted_issuer - IdentityId of the trusted claim issuer.
       **/
      addDefaultTrustedClaimIssuer: AugmentedSubmittable<
        (
          ticker: Ticker | string | Uint8Array,
          trustedIssuer: IdentityId | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * To remove the default trusted claim issuer for a given asset
       * Removal - When the given element is already present
       * # Arguments
       * * origin - Signer of the dispatchable. It should be the owner of the ticker.
       * * ticker - Symbol of the asset.
       * * trusted_issuer - IdentityId of the trusted claim issuer.
       **/
      removeDefaultTrustedClaimIssuer: AugmentedSubmittable<
        (
          ticker: Ticker | string | Uint8Array,
          trustedIssuer: IdentityId | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * To add the default trusted claim issuer for a given asset
       * Addition - When the given element is not exist
       * # Arguments
       * * origin - Signer of the dispatchable. It should be the owner of the ticker.
       * * ticker - Symbol of the asset.
       * * trusted_issuers - Vector of IdentityId of the trusted claim issuers.
       **/
      addDefaultTrustedClaimIssuersBatch: AugmentedSubmittable<
        (
          ticker: Ticker | string | Uint8Array,
          trustedIssuers: Vec<IdentityId> | (IdentityId | string | Uint8Array)[]
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * To remove the default trusted claim issuer for a given asset
       * Removal - When the given element is already present
       * # Arguments
       * * origin - Signer of the dispatchable. It should be the owner of the ticker.
       * * ticker - Symbol of the asset.
       * * trusted_issuers - Vector of IdentityId of the trusted claim issuers.
       **/
      removeDefaultTrustedClaimIssuersBatch: AugmentedSubmittable<
        (
          ticker: Ticker | string | Uint8Array,
          trustedIssuers: Vec<IdentityId> | (IdentityId | string | Uint8Array)[]
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Change/Modify the existing asset rule of a given ticker
       * # Arguments
       * * origin - Signer of the dispatchable. It should be the owner of the ticker.
       * * ticker - Symbol of the asset.
       * * asset_rule - Asset rule.
       **/
      changeAssetRule: AugmentedSubmittable<
        (
          ticker: Ticker | string | Uint8Array,
          assetRule:
            | AssetTransferRule
            | { sender_rules?: any; receiver_rules?: any; rule_id?: any }
            | string
            | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Change/Modify the existing asset rule of a given ticker in batch
       * # Arguments
       * * origin - Signer of the dispatchable. It should be the owner of the ticker.
       * * ticker - Symbol of the asset.
       * * asset_rules - Vector of asset rule.
       **/
      changeAssetRuleBatch: AugmentedSubmittable<
        (
          ticker: Ticker | string | Uint8Array,
          assetRules:
            | Vec<AssetTransferRule>
            | (
                | AssetTransferRule
                | { sender_rules?: any; receiver_rules?: any; rule_id?: any }
                | string
                | Uint8Array
              )[]
        ) => SubmittableExtrinsic<ApiType>
      >;
    };
    voting: {
      /**
       * Adds a ballot
       * # Arguments
       * * `ticker` - Ticker of the token for which ballot is to be created
       * * `ballot_name` - Name of the ballot
       * * `ballot_details` - Other details of the ballot
       **/
      addBallot: AugmentedSubmittable<
        (
          ticker: Ticker | string | Uint8Array,
          ballotName: Bytes | string | Uint8Array,
          ballotDetails:
            | Ballot
            | { checkpoint_id?: any; voting_start?: any; voting_end?: any; motions?: any }
            | string
            | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Casts a vote
       * # Arguments
       * * `ticker` - Ticker of the token for which vote is to be cast
       * * `ballot_name` - Name of the ballot
       * * `votes` - The actual vote to be cast
       **/
      vote: AugmentedSubmittable<
        (
          ticker: Ticker | string | Uint8Array,
          ballotName: Bytes | string | Uint8Array,
          votes: Vec<Balance> | (Balance | AnyNumber | Uint8Array)[]
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Cancels a vote by setting it as expired
       * # Arguments
       * * `ticker` - Ticker of the token for which ballot is to be cancelled
       * * `ballot_name` - Name of the ballot
       **/
      cancelBallot: AugmentedSubmittable<
        (
          ticker: Ticker | string | Uint8Array,
          ballotName: Bytes | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
    };
    stoCapped: {
      /**
       * Used to initialize the STO for a given asset
       * # Arguments
       * * `origin` Signing key of the token owner who wants to initialize the sto
       * * `ticker` Ticker of the token
       * * `beneficiary_did` DID which holds all the funds collected
       * * `cap` Total amount of tokens allowed for sale
       * * `rate` Rate of asset in terms of native currency
       * * `start_date` Unix timestamp at when STO starts
       * * `end_date` Unix timestamp at when STO ends
       * * `simple_token_ticker` Ticker of the simple token
       **/
      launchSto: AugmentedSubmittable<
        (
          ticker: Ticker | string | Uint8Array,
          beneficiaryDid: IdentityId | string | Uint8Array,
          cap: Balance | AnyNumber | Uint8Array,
          rate: u128 | AnyNumber | Uint8Array,
          startDate: Moment | AnyNumber | Uint8Array,
          endDate: Moment | AnyNumber | Uint8Array,
          simpleTokenTicker: Ticker | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Used to buy tokens
       * # Arguments
       * * `origin` Signing key of the investor
       * * `did` DID of the investor
       * * `ticker` Ticker of the token
       * * `sto_id` A unique identifier to know which STO investor wants to invest in
       * * `value` Amount of POLY wants to invest in
       **/
      buyTokens: AugmentedSubmittable<
        (
          ticker: Ticker | string | Uint8Array,
          stoId: u32 | AnyNumber | Uint8Array,
          value: Balance | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Modify the list of allowed tokens (stable coins) corresponds to given token/asset
       * # Arguments
       * * `origin` Signing key of the token owner
       * * `ticker` Ticker of the token
       * * `sto_id` A unique identifier to know which STO investor wants to invest in.
       * * `simple_token_ticker` Ticker of the stable coin
       * * `modify_status` Boolean to know whether the provided simple token ticker will be used or not.
       **/
      modifyAllowedTokens: AugmentedSubmittable<
        (
          ticker: Ticker | string | Uint8Array,
          stoId: u32 | AnyNumber | Uint8Array,
          simpleTokenTicker: Ticker | string | Uint8Array,
          modifyStatus: bool | boolean | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Used to buy tokens using stable coins
       * # Arguments
       * * `origin` Signing key of the investor
       * * `ticker` Ticker of the token
       * * `sto_id` A unique identifier to know which STO investor wants to invest in
       * * `value` Amount of POLY wants to invest in
       * * `simple_token_ticker` Ticker of the simple token
       **/
      buyTokensBySimpleToken: AugmentedSubmittable<
        (
          ticker: Ticker | string | Uint8Array,
          stoId: u32 | AnyNumber | Uint8Array,
          value: Balance | AnyNumber | Uint8Array,
          simpleTokenTicker: Ticker | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Pause the STO, Can only be called by the token owner
       * By doing this every operations on given sto_id would get freezed like buy_tokens
       * # Arguments
       * * `origin` Signing key of the token owner
       * * `ticker` Ticker of the token
       * * `sto_id` A unique identifier to know which STO needs to paused
       **/
      pauseSto: AugmentedSubmittable<
        (
          ticker: Ticker | string | Uint8Array,
          stoId: u32 | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Un-pause the STO, Can only be called by the token owner
       * By doing this every operations on given sto_id would get un freezed.
       * # Arguments
       * * `origin` Signing key of the token owner
       * * `ticker` Ticker of the token
       * * `sto_id` A unique identifier to know which STO needs to un paused
       **/
      unpauseSto: AugmentedSubmittable<
        (
          ticker: Ticker | string | Uint8Array,
          stoId: u32 | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
    };
    percentageTm: {
      /**
       * Set a maximum percentage that can be owned by a single investor
       **/
      toggleMaximumPercentageRestriction: AugmentedSubmittable<
        (
          ticker: Ticker | string | Uint8Array,
          maxPercentage: u16 | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
    };
    exemption: {
      modifyExemptionList: AugmentedSubmittable<
        (
          ticker: Ticker | string | Uint8Array,
          tm: u16 | AnyNumber | Uint8Array,
          assetHolderDid: IdentityId | string | Uint8Array,
          exempted: bool | boolean | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
    };
    simpleToken: {
      /**
       * Create a new token and mint a balance to the issuing identity
       **/
      createToken: AugmentedSubmittable<
        (
          ticker: Ticker | string | Uint8Array,
          totalSupply: Balance | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Approve another identity to transfer tokens on behalf of the caller
       **/
      approve: AugmentedSubmittable<
        (
          ticker: Ticker | string | Uint8Array,
          spenderDid: IdentityId | string | Uint8Array,
          value: Balance | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Transfer tokens to another identity
       **/
      transfer: AugmentedSubmittable<
        (
          ticker: Ticker | string | Uint8Array,
          toDid: IdentityId | string | Uint8Array,
          amount: Balance | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Transfer tokens to another identity using the approval mechanic
       **/
      transferFrom: AugmentedSubmittable<
        (
          ticker: Ticker | string | Uint8Array,
          fromDid: IdentityId | string | Uint8Array,
          toDid: IdentityId | string | Uint8Array,
          amount: Balance | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
    };
    cddServiceProviders: {
      /**
       * It disables a member at specific moment.
       * Please note that if member is already revoked (a "valid member"), its revocation
       * time-stamp will be updated.
       * Any disabled member should NOT allow to act like an active member of the group. For
       * instance, a disabled CDD member should NOT be able to generate a CDD claim. However any
       * generated claim issued before `at` would be considered as a valid one.
       * If you want to invalidate any generated claim, you should use `Self::remove_member`.
       * # Arguments
       * * `at` Revocation time-stamp.
       * * `who` Target member of the group.
       * * `expiry` Time-stamp when `who` is removed from CDD. As soon as it is expired, the
       * generated claims will be "invalid" as `who` is not considered a member of the group.
       **/
      disableMember: AugmentedSubmittable<
        (
          who: IdentityId | string | Uint8Array,
          expiry: Option<Moment> | null | object | string | Uint8Array,
          at: Option<Moment> | null | object | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Add a member `who` to the set. May only be called from `AddOrigin` or root.
       * # Arguments
       * * `origin` Origin representing `AddOrigin` or root
       * * `who` IdentityId to be added to the group.
       **/
      addMember: AugmentedSubmittable<
        (who: IdentityId | string | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Remove a member `who` from the set. May only be called from `RemoveOrigin` or root.
       * Any claim previously generated by this member is not valid as a group claim. For
       * instance, if a CDD member group generated a claim for a target identity and then it is
       * removed, that claim will be invalid.
       * In case you want to keep the validity of generated claims, you have to use `Self::disable_member` function
       * # Arguments
       * * `origin` Origin representing `RemoveOrigin` or root
       * * `who` IdentityId to be removed from the group.
       **/
      removeMember: AugmentedSubmittable<
        (who: IdentityId | string | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Swap out one member `remove` for another `add`.
       * May only be called from `SwapOrigin` or root.
       * # Arguments
       * * `origin` Origin representing `SwapOrigin` or root
       * * `remove` IdentityId to be removed from the group.
       * * `add` IdentityId to be added in place of `remove`.
       **/
      swapMember: AugmentedSubmittable<
        (
          remove: IdentityId | string | Uint8Array,
          add: IdentityId | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Change the membership to a new set, disregarding the existing membership.
       * May only be called from `ResetOrigin` or root.
       * # Arguments
       * * `origin` Origin representing `ResetOrigin` or root
       * * `members` New set of identities
       **/
      resetMembers: AugmentedSubmittable<
        (
          members: Vec<IdentityId> | (IdentityId | string | Uint8Array)[]
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * It allows a caller member to unilaterally quit without this
       * being subject to a GC vote.
       * # Arguments
       * * `origin` Member of committee who wants to quit.
       * # Error
       * * Only master key can abdicate.
       * * Last member of a group
       **/
      abdicateMembership: AugmentedSubmittable<() => SubmittableExtrinsic<ApiType>>;
    };
    protocolFee: {
      /**
       * Changes the fee coefficient for the root origin.
       **/
      changeCoefficient: AugmentedSubmittable<
        (coefficient: PosRatio | null) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Changes the a base fee for the root origin.
       **/
      changeBaseFee: AugmentedSubmittable<
        (
          op:
            | ProtocolOp
            | (
                | 'AssetRegisterTicker'
                | 'AssetIssue'
                | 'AssetAddDocument'
                | 'AssetCreateToken'
                | 'DividendNew'
                | 'GeneralTmAddActiveRule'
                | 'IdentityRegisterDid'
                | 'IdentityCddRegisterDid'
                | 'IdentityAddClaim'
                | 'IdentitySetMasterKey'
                | 'IdentityAddSigningItem'
                | 'MipsPropose'
                | 'VotingAddBallot'
              )
            | number
            | Uint8Array,
          baseFee: BalanceOf | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Emits an event with the fee of the operation.
       **/
      getFee: AugmentedSubmittable<
        (
          op:
            | ProtocolOp
            | (
                | 'AssetRegisterTicker'
                | 'AssetIssue'
                | 'AssetAddDocument'
                | 'AssetCreateToken'
                | 'DividendNew'
                | 'GeneralTmAddActiveRule'
                | 'IdentityRegisterDid'
                | 'IdentityCddRegisterDid'
                | 'IdentityAddClaim'
                | 'IdentitySetMasterKey'
                | 'IdentityAddSigningItem'
                | 'MipsPropose'
                | 'VotingAddBallot'
              )
            | number
            | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Emits an event with the fee coefficient.
       **/
      getCoefficient: AugmentedSubmittable<() => SubmittableExtrinsic<ApiType>>;
    };
  }

  export interface SubmittableExtrinsics<ApiType extends ApiTypes>
    extends AugmentedSubmittables<ApiType> {
    (extrinsic: Call | Extrinsic | Uint8Array | string): SubmittableExtrinsic<ApiType>;
  }
}
