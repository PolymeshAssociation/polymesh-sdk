import BigNumber from 'bignumber.js';

import { Account, Identity } from '~/internal';
import { BalanceTypeEnum, CallIdEnum, EventIdEnum, ModuleIdEnum } from '~/middleware/types';
import { EventIdentifier } from '~/types';

export interface Balance {
  /**
   * balance available for transferring
   */
  free: BigNumber;
  /**
   * unavailable balance, locked for some purpose (e.g. pending settlement instructions)
   */
  locked: BigNumber;
  /**
   * free + locked
   */
  total: BigNumber;
}

/**
 * POLYX balance of an Account
 */
export interface AccountBalance {
  /**
   * balance that is guaranteed to be spendable on transfers and transaction fees. Calculated according
   *   to the chain's rules as `chain free - max(frozen - reserved, existential deposit)`
   *
   * @note this differs from the chain's raw `free` value, which still includes frozen funds. The
   *   existential deposit (0.000001 POLYX) is always treated as unspendable, so this value is a
   *   lower bound on what the Account can spend without risk of the transaction failing
   */
  free: BigNumber;
  /**
   * balance that is unavailable for spending. Made up of funds on hold (`reserved`, e.g. bonded for
   *   staking), frozen funds not covered by holds (`frozen`) and the existential
   *   deposit. Always equal to `total - free`
   */
  locked: BigNumber;
  /**
   * total balance owned by the Account, including unavailable funds. Equal to the chain's
   *   `free + reserved`, and to `free + locked` as returned here
   */
  total: BigNumber;
  /**
   * balance placed on hold by the protocol, e.g. POLYX bonded for staking. Held funds are not part
   *   of the chain's `free` balance and cannot be spent until released (e.g. unbonded and withdrawn).
   *   Corresponds to the chain's raw `reserved` value
   */
  reserved: BigNumber;
  /**
   * minimum balance (out of `total`) that must remain in the Account due to freezes/locks.
   *   Frozen funds may overlap with `reserved` funds. Corresponds to the chain's raw `frozen` value
   */
  frozen: BigNumber;
}

/**
 * Distinguishes MultiSig and Smart Contract accounts
 */
export enum AccountKeyType {
  /**
   * Account is a standard type (e.g. corresponds to the public key of a sr25519 pair)
   */
  Normal = '',
  /**
   * Account is a MultiSig. (i.e. multiple signatures are required to authorize transactions)
   */
  MultiSig = 'MultiSig',
  /**
   * Account represents a smart contract
   */
  SmartContract = 'SmartContract',
  /**
   * Account is controlled by an Ethereum key (the last 12 bytes of its decoded `AccountId32`
   *   are `0xEE`). If the Account is also a MultiSig signer, `MultiSig` takes priority, since
   *   that is the flag that changes control flow (`run` vs `runAsProposal`)
   */
  Ethereum = 'Ethereum',
}

/**
 * Represents the how an Account is associated to an Identity
 */
export enum AccountIdentityRelation {
  /**
   * The Account is not associated to any Identity
   */
  Unassigned = 'Unassigned',
  /**
   * The Account is the Identity's primary key (i.e. it has full permission)
   */
  Primary = 'Primary',
  /**
   * The Account is a Secondary account. There are associated permissions that may limit what transactions it may authorize for the Identity
   */
  Secondary = 'Secondary',
  /**
   * The Account is one of many signers for a MultiSig
   */
  MultiSigSigner = 'MultiSigSigner',
}

/**
 * How an Account's Ethereum (H160) address relates to the Account itself
 */
export enum EvmAddressType {
  /**
   * The Account is padded from a native Ethereum key (`<h160> ++ [0xEE; 12]`), so its Ethereum
   *   address is that key. The chain can always resolve this address back to the Account, and
   *   `revive.mapAccount` neither applies nor is needed
   */
  Native = 'Native',
  /**
   * The Account is a native Polymesh Account, so its Ethereum address is derived by hashing:
   *   `keccak256(<32-byte AccountId32>)[12..]`. Hashing is one way, so the chain can only resolve
   *   this address back to the Account once the Account has called `revive.mapAccount`
   */
  Derived = 'Derived',
}

/**
 * The Ethereum address the chain associates with an Account, and whether the chain can resolve it
 *   back to that Account
 */
export interface EvmAddressDetails {
  /**
   * The checksummed (EIP-55) `0x`-prefixed Ethereum address
   */
  address: string;
  /**
   * Whether `address` is the Account's own Ethereum key or is derived from it by hashing
   */
  type: EvmAddressType;
  /**
   * Whether the chain can resolve `address` back to this Account. Always `true` for
   *   {@link EvmAddressType.Native}; for {@link EvmAddressType.Derived} it reflects whether the
   *   Account has called `revive.mapAccount`
   *
   * @note while this is `false`, anything sent to `address` is credited to `fallbackAccount`
   *   instead of to this Account
   */
  isMapped: boolean;
  /**
   * The Account credited when the chain cannot resolve `address` back to this Account, i.e. the
   *   Account `ss58(<address> ++ [0xEE; 12])`. `null` only for {@link EvmAddressType.Native},
   *   where this Account *is* the one the Ethereum key controls, so there is no separate fallback
   *
   * @note always populated for {@link EvmAddressType.Derived}, including once `isMapped` is
   *   `true`. Mapping does not move funds that arrived before it, so this remains the place to
   *   look for anything sent to `address` while it was still unmapped
   *
   * @note the chain's `revive.dispatchAsFallbackAccount` can dispatch on this Account's behalf,
   *   which is how funds sent to an unmapped address are recovered
   */
  fallbackAccount: Account | null;
}

/**
 * The type of account, and its relation to an Identity
 */
export interface AccountTypeInfo {
  /**
   * The type of Account
   */
  keyType: AccountKeyType;
  /**
   * How or if the account is associated to an Identity
   */
  relation: AccountIdentityRelation;
}

export interface HistoricPolyxTransaction extends EventIdentifier {
  /**
   * Identity from which the POLYX transaction has been initiated/deducted in case of a transfer.
   * @note this can be null in cases where some balance are endowed/transferred from treasury
   */
  fromIdentity: Identity | undefined;
  /**
   * Account from which the POLYX transaction has been initiated/deducted in case of a transfer.
   * @note this can be null in cases where some balance are endowed/transferred from treasury
   */
  fromAccount: Account | undefined;
  /**
   * Identity in which the POLYX amount was deposited.
   * @note this can be null in case when account balance was burned
   */
  toIdentity: Identity | undefined;
  /**
   * Account in which the POLYX amount was deposited.
   * @note this can be null in case when account balance was burned
   */
  toAccount: Account | undefined;

  amount: BigNumber;
  type: BalanceTypeEnum;
  /**
   * identifier string to help differentiate transfers
   */
  memo: string | undefined;
  extrinsicIdx: BigNumber | undefined;

  callId: CallIdEnum | undefined;
  moduleId: ModuleIdEnum;
  eventId: EventIdEnum;
}

export interface StakingNomination {
  /**
   * The nominated validators
   */
  targets: Account[];
  /**
   * The era in which the nomination was submitted
   *
   * @note nominations only effect future eras (1 era is approximately 1 day)
   */
  submittedInEra: BigNumber;

  /**
   * Nominations maybe suppressed if they fail to meet the minimum bond or validators are over subscribed
   *
   * @note nominations are rarely suppressed on Polymesh
   */
  suppressed: boolean;
}

export interface ActiveEraInfo {
  /**
   * The block number in which this era became active
   */
  start: BigNumber;

  /**
   * The era number
   * @note an era is roughly 1 day on most chains (dev chains may have shorter eras)
   */
  index: BigNumber;
}

export interface StakingUnlockingEntry {
  value: BigNumber;
  era: BigNumber;
}

export interface StakingLedger {
  stash: Account;
  total: BigNumber;
  active: BigNumber;
  unlocking: StakingUnlockingEntry[];
  claimedRewards: BigNumber[];
}

export interface StakingPayee {
  account: Account;
  /**
   * If true then rewards will be auto staked
   */
  autoStaked: boolean;
}

export interface StakingCommission {
  /**
   * The account of the validator
   */
  account: Account;

  /**
   * The commission as a percentage (0-100)
   */
  commission: BigNumber;

  /**
   * `true` if the validator has been blocked
   */
  blocked: boolean;
}
