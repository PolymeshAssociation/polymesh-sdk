/* istanbul ignore file */

import {
  AugmentedEvents,
  DecoratedRpc,
  QueryableConsts,
  QueryableStorage,
  SubmittableExtrinsics,
} from '@polkadot/api/types';
import { RpcInterface } from '@polkadot/rpc-core/types';
import { BaseAsset } from '@polymeshassociation/polymesh-sdk/internal';
import {
  DefaultPortfolio,
  NumberedPortfolio,
  SignerType,
} from '@polymeshassociation/polymesh-sdk/types';

import { TxTag } from '~/generated/types';

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

/**
 * This represents positive permissions (i.e. only "includes"). It is used
 *   for specifying procedure requirements and querying if an Account has certain
 *   permissions. Null values represent full permissions in that category
 */
export interface SimplePermissions {
  /**
   * list of required Asset permissions
   */
  assets?: BaseAsset[] | null;
  /**
   * list of required Transaction permissions
   */
  transactions?: TxTag[] | null;
  portfolios?: (DefaultPortfolio | NumberedPortfolio)[] | null;
}

/**
 * Result of a `checkPermissions` call. If `Type` is `Account`, represents whether the Account
 *   has all the necessary secondary key Permissions. If `Type` is `Identity`, represents whether the
 *   Identity has all the necessary external agent Permissions
 */
export interface CheckPermissionsResult<Type extends SignerType> {
  /**
   * required permissions which the signer *DOESN'T* have. Only present if `result` is `false`
   */
  missingPermissions?: Type extends SignerType.Account ? SimplePermissions : TxTag[] | null;
  /**
   * whether the signer complies with the required permissions or not
   */
  result: boolean;
  /**
   * optional message explaining the reason for failure in special cases
   */
  message?: string;
}
