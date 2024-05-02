/* istanbul ignore file */

import {
  AugmentedEvents,
  DecoratedRpc,
  QueryableConsts,
  QueryableStorage,
  SubmittableExtrinsics,
} from '@polkadot/api/types';
import { RpcInterface } from '@polkadot/rpc-core/types';

/**
 * Polkadot's `tx` submodule
 */
export type Extrinsics = SubmittableExtrinsics<'promise'>;

/**
 * Parameter list for a specific extrinsic
 *
 * @param ModuleName - pallet name (e.g. 'asset')
 * @param TransactionName - extrinsic name (e.g. 'registerTicker')
 */
export type ExtrinsicParams<
  ModuleName extends keyof Extrinsics,
  TransactionName extends keyof Extrinsics[ModuleName]
> = Parameters<Extrinsics[ModuleName][TransactionName]>;

/**
 * Polkadot's events
 */
export type Events = AugmentedEvents<'promise'>;

/**
 * Polkadot's `query` submodule
 */
export type Queries = QueryableStorage<'promise'>;

/**
 * Polkadot's `consts` submodule
 */
export type Consts = QueryableConsts<'promise'>;

export type Rpcs = DecoratedRpc<'promise', RpcInterface>;
