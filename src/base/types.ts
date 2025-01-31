/* istanbul ignore file: already being tested somewhere else */

import { SignerPayloadJSON, SignerPayloadRaw, TypeDef } from '@polkadot/types/types';
import { HexString } from '@polkadot/util/types';
import BigNumber from 'bignumber.js';

import { Account } from '~/internal';
import { Fees, TxData } from '~/types';

import { PolymeshError as PolymeshErrorClass } from './PolymeshError';
import { PolymeshTransaction as PolymeshTransactionClass } from './PolymeshTransaction';
import { PolymeshTransactionBatch as PolymeshTransactionBatchClass } from './PolymeshTransactionBatch';

/**
 * Apply the {@link TxData} type to all args in an array
 */
export type MapTxData<ArgsArray extends unknown[][]> = {
  [K in keyof ArgsArray]: ArgsArray[K] extends unknown[] ? TxData<ArgsArray[K]> : never;
};

export enum TransactionStatus {
  /**
   * the transaction is prepped to run
   */
  Idle = 'Idle',
  /**
   * the transaction is waiting for the user's signature
   */
  Unapproved = 'Unapproved',
  /**
   * the transaction is being executed
   */
  Running = 'Running',
  /**
   * the transaction was rejected by the signer
   */
  Rejected = 'Rejected',
  /**
   * the transaction was run successfully
   */
  Succeeded = 'Succeeded',
  /**
   * the transaction's execution failed due to a an on-chain validation error, insufficient balance for fees, or other such reasons
   */
  Failed = 'Failed',
  /**
   * the transaction couldn't be broadcast. It was either dropped, usurped or invalidated
   * see https://github.com/paritytech/substrate/blob/master/primitives/transaction-pool/src/pool.rs#L58-L110
   */
  Aborted = 'Aborted',
}

export enum TransactionArgumentType {
  Did = 'Did',
  Address = 'Address',
  Text = 'Text',
  Boolean = 'Boolean',
  Number = 'Number',
  Balance = 'Balance',
  Date = 'Date',
  Array = 'Array',
  Tuple = 'Tuple',
  SimpleEnum = 'SimpleEnum',
  RichEnum = 'RichEnum',
  Object = 'Object',
  Unknown = 'Unknown',
  Null = 'Null',
}

export interface PlainTransactionArgument {
  type: Exclude<
    TransactionArgumentType,
    | TransactionArgumentType.Array
    | TransactionArgumentType.Tuple
    | TransactionArgumentType.SimpleEnum
    | TransactionArgumentType.RichEnum
    | TransactionArgumentType.Object
  >;
}

export interface ArrayTransactionArgument {
  type: TransactionArgumentType.Array;
  internal: TransactionArgument;
}

export interface SimpleEnumTransactionArgument {
  type: TransactionArgumentType.SimpleEnum;
  internal: string[];
}

export interface ComplexTransactionArgument {
  type:
    | TransactionArgumentType.RichEnum
    | TransactionArgumentType.Object
    | TransactionArgumentType.Tuple;
  internal: TransactionArgument[];
}

export type TransactionArgument = {
  name: string;
  optional: boolean;
  _rawType: TypeDef;
} & (
  | PlainTransactionArgument
  | ArrayTransactionArgument
  | SimpleEnumTransactionArgument
  | ComplexTransactionArgument
);

/**
 * Type of relationship between a paying account and a beneficiary
 */
export enum PayingAccountType {
  /**
   * the paying Account is currently subsidizing the caller
   */
  Subsidy = 'Subsidy',
  /**
   * the paying Account is paying for a specific transaction because of
   *   chain-specific constraints (e.g. the caller is accepting an invitation to an Identity
   *   and cannot have any funds to pay for it by definition)
   */
  Other = 'Other',
  /**
   * the caller Account is responsible of paying the fees
   */
  Caller = 'Caller',
  /**
   * The creator of the MultiSig is responsible for paying the fees
   */
  MultiSigCreator = 'MultiSigCreator',
}

/**
 * Data representing the Account responsible for paying fees for a transaction
 */
export type PayingAccount =
  | {
      type: PayingAccountType.Subsidy;
      /**
       * Account that pays for the transaction
       */
      account: Account;
      /**
       * total amount that can be paid for
       */
      allowance: BigNumber;
    }
  | {
      type: PayingAccountType.Caller | PayingAccountType.Other | PayingAccountType.MultiSigCreator;
      account: Account;
    };

/**
 * Breakdown of the fees that will be paid by a specific Account for a transaction, along
 *   with data associated to the Paying account
 */
export interface PayingAccountFees {
  /**
   * fees that will be paid by the Account
   */
  fees: Fees;
  /**
   * data related to the Account responsible of paying for the transaction
   */
  payingAccountData: PayingAccount & {
    /**
     * free balance of the Account
     */
    balance: BigNumber;
  };
}

/**
 * Unsigned transaction data in JSON a format
 */
export interface TransactionPayload {
  /**
   * This is what a Polkadot signer ".signPayload" method expects
   *
   * @note this field needs to be passed in with the signature
   */
  readonly payload: SignerPayloadJSON;

  /**
   * An alternative representation of the payload for which Polkadot signers providing ".signRaw" expect.
   *
   * @note using the field `payload` is generally recommended. The raw version is included so any polkadot compliant signer can sign.
   * @note `signRaw` typically returns just the signature. However signatures must be prefixed with a byte to indicate the type. For ed25519 signatures prepend a zero byte (`0x00`), for sr25519 `0x01` byte to indicate sr25519 if the signer implementation does not already do so.

   */
  readonly rawPayload: SignerPayloadRaw;

  /**
   * A hex representation of the core extrinsic information. i.e. the extrinsic and args, but does not contain information about who is to sign the transaction.
   */
  readonly method: HexString;

  /**
   * Additional information attached to the payload, such as IDs or memos about the transaction.
   *
   * @note this is not chain data. Its for convenience for attaching a trace ID
   */
  readonly metadata: Record<string, string>;

  /**
   * The address of the MultiSig if the transaction is a proposal.
   *
   * Will be set only if the signing account is a MultiSig signer and the transaction is not approving or rejecting an existing proposal
   */
  readonly multiSig: string | null;
}

/**
 * The data needed for submitting an offline transaction.
 *
 * @note Either the full payload can be used or just the inner payload field. It doesn't matter which is given.
 */
export type TransactionPayloadInput = TransactionPayload | TransactionPayload['payload'];

export type PolymeshTransaction<
  ReturnValue = unknown,
  TransformedReturnValue = ReturnValue,
  Args extends unknown[] | [] = unknown[]
> = PolymeshTransactionClass<ReturnValue, TransformedReturnValue, Args>;
export type PolymeshTransactionBatch<
  ReturnValue = unknown,
  TransformedReturnValue = ReturnValue,
  Args extends unknown[][] = unknown[][]
> = PolymeshTransactionBatchClass<ReturnValue, TransformedReturnValue, Args>;
export type PolymeshError = PolymeshErrorClass;
