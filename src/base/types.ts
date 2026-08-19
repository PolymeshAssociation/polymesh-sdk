/* istanbul ignore file: already being tested somewhere else */

import { SignerPayloadJSON, SignerPayloadRaw, TypeDef } from '@polkadot/types/types';
import { HexString } from '@polkadot/util/types';
import { EthTransactionRequest } from '@polymeshassociation/signing-manager-types';
import BigNumber from 'bignumber.js';

import { PolymeshError as PolymeshErrorClass } from '~/base/PolymeshError';
import { PolymeshTransaction as PolymeshTransactionClass } from '~/base/PolymeshTransaction';
import { PolymeshTransactionBatch as PolymeshTransactionBatchClass } from '~/base/PolymeshTransactionBatch';
import { Account } from '~/internal';
import { Fees, TxData, TxTag } from '~/types';

/**
 * Apply the {@link TxData} type to all args in an array
 */
export type MapTxData<ArgsArray extends unknown[][]> = {
  [K in keyof ArgsArray]: ArgsArray[K] extends unknown[] ? TxData<ArgsArray[K]> : never;
};

/**
 * Handle to a transaction that has been broadcast but is not being tracked. Returned by
 *   {@link base/PolymeshTransactionBase!PolymeshTransactionBase.broadcast | transaction.broadcast},
 *   which is `run` split at its natural seam: the transaction is on its way to the chain, and
 *   whether to wait for it is now the caller's decision
 */
export interface TransactionBroadcastHandle<ReturnValue> {
  /**
   * the hash the transaction can be looked up by. Normally the Substrate extrinsic hash, but the
   *   Ethereum transaction hash when an Ethereum wallet broadcast it, since that is the handle the
   *   user has and can find in a block explorer
   */
  txHash: string;

  /**
   * the Ethereum transaction hash, set only when an Ethereum wallet broadcast the transaction
   *   itself. `undefined` otherwise
   */
  ethTxHash?: string;

  /**
   * the block height the search for this transaction has to start from. Persist this alongside
   *   `txHash` to resume tracking later via
   *   {@link api/client/Network!Network.watchTransaction | network.watchTransaction}, for example
   *   after a page reload, when `watch` itself is long gone
   */
  startingBlock: BigNumber;

  /**
   * Wait for the transaction to be included in a finalized block and return the same value
   *   `run` would have returned
   *
   * Safe to retry if it times out — nothing is resubmitted, the search simply resumes. Calling it
   *   while a previous call is still in flight throws
   *
   * @param opts.timeout - milliseconds to wait before giving up. Overrides `submission.watchTimeout`
   *   from the Procedure options. Defaults to waiting indefinitely
   *
   * @throws `TransactionTimeout` if the transaction is not found in time. The transaction was still
   *   broadcast and may yet be included — this reports only that the SDK stopped looking
   */
  watch: (opts?: { timeout?: number }) => Promise<ReturnValue>;
}

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
   * the transaction is in a block
   */
  InBlock = 'InBlock',
  /**
   * the transaction is scheduled for the future
   */
  Future = 'Future',
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
   * @note this field is recommended to be passed in with the signature when submitting a signed transaction
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
   * Will be set only if the signing account is a MultiSig signer, the transaction is not approving or rejecting an existing proposal,
   * @note `asProposal: false` will force this to be null, even if the signing account is a MultiSig signer
   */
  readonly multiSig: string | null;
}

/**
 * The data needed for submitting an offline transaction.
 *
 * @note One of the following can be used to submit an offline transaction -
 *   1. Full payload
 *   2. Inner payload field
 *   3. Inner raw payload field
 */
export type TransactionPayloadInput =
  | TransactionPayload
  | TransactionPayload['payload']
  | TransactionPayload['rawPayload'];

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

/*
 * -------------------------------------------------------------------------------------------
 * Ethereum key signing
 *
 * The interfaces themselves live in `@polymeshassociation/signing-manager-types`, since a
 *   Signing Manager has to implement them without depending on the SDK. They are re-exported
 *   here so that consumers reach them from `~/types` alongside everything else.
 * -------------------------------------------------------------------------------------------
 */

export {
  EthSigner,
  EthSignerCapabilities,
  EthSigningManager,
} from '@polymeshassociation/signing-manager-types';
export { EthTransactionRequest };

/**
 * A representation of an Ethereum transaction intended for offline/detached signing, along with
 *   the decoded call for display
 */
export interface EthTransactionPayload {
  /**
   * the parameters that would be passed to `EthSigner.signTransaction` / `sendTransaction`
   *
   * @note every field is 0x-prefixed hex, never a number or bigint. ethers and viem both need it
   *   converted first — `@polymeshassociation/eth-signing-manager` exports `toEthersTransaction` /
   *   `toViemTransaction` for that, usable without the manager itself
   */
  transaction: EthTransactionRequest;
  /** the transaction tag identifying the underlying Polymesh call */
  tag: TxTag;
  /** argument metadata for the underlying Polymesh call */
  args: TransactionArgument[];
  /** additional information attached to the payload, such as IDs or memos about the transaction */
  metadata: Record<string, string>;
}
