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
   *
   * @note on v7 chains this is the maximum of the chain's `miscFrozen` and `feeFrozen` values
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
