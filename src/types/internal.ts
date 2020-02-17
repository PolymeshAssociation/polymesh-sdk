import {
  SubmittableExtrinsics,
  AugmentedSubmittable,
  SubmittableExtrinsic,
  TxTag,
  AddressOrPair,
  QueryableStorage,
} from '@polymathnetwork/polkadot/api/types';
import { PostTransactionValue } from '~/base';

/**
 * Polkadot's `tx` submodule
 */
export type Extrinsics = SubmittableExtrinsics<'promise'>;

/**
 * Polkadot's `query` submodule
 */
export type Queries = QueryableStorage<'promise'>;

/**
 * Low level transaction method in the polkadot API
 *
 * @param ModuleName - name of the runtime module in which the transaction resides
 * @param TransactionName - name of the transaction
 */
export type PolymeshTx<
  ModuleName extends keyof Extrinsics,
  TransactionName extends keyof Extrinsics[ModuleName]
> = AugmentedSubmittable<
  (...args: ArgsType<Extrinsics[ModuleName][TransactionName]>) => SubmittableExtrinsic<'promise'>
>;

/**
 * Transforms a tuple of types into an array of [[PostTransactionValue]].
 * For each type in the tuple, the corresponding [[PostTransactionValue]] resolves to that type
 *
 * @param Values - types of the values to be wrapped
 */
export type PostTransactionValueArray<Values extends unknown[]> = {
  [P in keyof Values]: PostTransactionValue<Values[P]>;
};

/**
 * Either a specific type or a [[PostTransactionValue]] that wraps a value of that type
 */
export type MaybePostTransactionValue<T> = PostTransactionValue<T> | T;

/**
 * Apply the [[MaybePostTransactionValue]] type to all members of a tuple
 */
export type MapMaybePostTransactionValue<T extends unknown[]> = {
  [K in keyof T]: MaybePostTransactionValue<T[K]>;
};

/**
 * Schema of a specific transaction
 *
 * @param ModuleName - name of the runtime module in which the transaction resides
 * @param TransactionName - name of the transaction
 * @param Values - values that will be returned wrapped in [[PostTransactionValue]] after the transaction runs
 */
export interface TransactionSpec<
  ModuleName extends keyof Extrinsics,
  TransactionName extends keyof Extrinsics[ModuleName],
  Values extends unknown[] = unknown[]
> {
  /**
   * underlying polkadot transaction object
   */
  tx: PolymeshTx<ModuleName, TransactionName>;
  /**
   * arguments that the transaction will receive (some of them can be [[PostTransactionValue]] from an earlier transaction)
   */
  args: MapMaybePostTransactionValue<ArgsType<PolymeshTx<ModuleName, TransactionName>>>;
  /**
   * wrapped values that will be returned after this transaction is run
   */
  postTransactionValues?: PostTransactionValueArray<Values>;
  /**
   * type of transaction for display and comparison
   */
  tag: TxTag;
  /**
   * account that will sign the transaction
   */
  signer: AddressOrPair;
  /**
   * whether this tx failing makes the entire tx queue fail or not
   */
  isCritical: boolean;
}
