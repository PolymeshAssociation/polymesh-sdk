/* istanbul ignore file: already being tested somewhere else */

import { SignerPayloadJSON, SignerPayloadRaw } from '@polkadot/types/types';
import { HexString } from '@polkadot/util/types';

import { PolymeshError as PolymeshErrorClass } from './PolymeshError';
import { PolymeshTransaction as PolymeshTransactionClass } from './PolymeshTransaction';
import { PolymeshTransactionBatch as PolymeshTransactionBatchClass } from './PolymeshTransactionBatch';

export interface TransactionPayload {
  /**
   * This is what a Polkadot signer ".signPayload" method expects
   */
  readonly payload: SignerPayloadJSON;

  /**
   * An alternative representation of the payload for which Polkadot signers providing ".signRaw" expects.
   *
   * @note if you wish to generate a signature without an external signer, the `data` field should be converted to its byte representation, which should be signed e.g. `const signThis = hexToU8a(rawPayload.data)`
   *
   * @note the signature should be prefixed with a single byte to indicate its type. Prepend a zero byte (`0x00`) for ed25519 or a `0x01` byte to indicate sr25519 if the signer implementation does not already do so.
   */
  readonly rawPayload: SignerPayloadRaw;

  /**
   * A hex representation of the core extrinsic information. i.e. the method and args
   *
   * This does not contain information about who is to sign the transaction.
   *
   * When submitting the transaction this will be used to construct the extrinsic, to which
   * the signer payload and signature will be attached to.
   *
   * ```ts
   *    const transaction = sdk._polkadotApi.tx(txPayload.method)
   *   transaction.signPayload(signingAddress, signature, payload)
   *   transaction.send()
   * ```
   *
   *
   * @note The payload also contains the method, however there it is encoded without the "length prefix", to save space for the chain.
   */
  readonly method: HexString;

  /**
   * Additional information can be attached to the payload, such as IDs or memos about the transaction
   */
  readonly metadata: Record<string, string>;
}

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
