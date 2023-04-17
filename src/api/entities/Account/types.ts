import BigNumber from 'bignumber.js';

import { Signer } from '~/types';

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
