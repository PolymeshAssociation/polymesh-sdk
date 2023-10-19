import BigNumber from 'bignumber.js';

import { Account, Identity } from '~/internal';
import { BalanceTypeEnum, CallIdEnum, EventIdEnum, ModuleIdEnum } from '~/middleware/types';
import { EventIdentifier, Signer } from '~/types';
export interface MultiSigDetails {
  signers: Signer[];
  requiredSignatures: BigNumber;
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
  fromIdentity?: Identity;
  /**
   * Account from which the POLYX transaction has been initiated/deducted in case of a transfer.
   * @note this can be null in cases where some balance are endowed/transferred from treasury
   */
  fromAccount?: Account;
  /**
   * Identity in which the POLYX amount was deposited.
   * @note this can be null in case when account balance was burned
   */
  toIdentity?: Identity;
  /**
   * Account in which the POLYX amount was deposited.
   * @note this can be null in case when account balance was burned
   */
  toAccount?: Account;

  amount: BigNumber;
  type: BalanceTypeEnum;
  /**
   * identifier string to help differentiate transfers
   */
  memo?: string;
  extrinsicIdx?: BigNumber;

  callId?: CallIdEnum;
  moduleId: ModuleIdEnum;
  eventId: EventIdEnum;
}
