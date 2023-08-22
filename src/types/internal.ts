/* istanbul ignore file */

import {
  AugmentedEvents,
  AugmentedSubmittable,
  DecoratedRpc,
  QueryableConsts,
  QueryableStorage,
  SubmittableExtrinsic,
  SubmittableExtrinsics,
} from '@polkadot/api/types';
import { RpcInterface } from '@polkadot/rpc-core/types';
import { u32 } from '@polkadot/types';
import {
  PolymeshPrimitivesStatisticsStatOpType,
  PolymeshPrimitivesTicker,
} from '@polkadot/types/lookup';
import { ISubmittableResult, Signer as PolkadotSigner } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';

import { Identity, Procedure } from '~/internal';
import { CallIdEnum, ModuleIdEnum } from '~/middleware/enums';
import {
  ClaimType,
  InputStatClaim,
  KnownAssetType,
  MortalityProcedureOpt,
  PermissionGroupType,
  Role,
  SignerValue,
  SimplePermissions,
  StatClaimType,
  TxData,
} from '~/types';

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
 * Low level transaction method in the polkadot API
 *
 * @param Args - arguments of the transaction
 */
export type PolymeshTx<Args extends Readonly<unknown[]> = Readonly<unknown[]>> =
  AugmentedSubmittable<(...args: Args) => SubmittableExtrinsic<'promise'>>;

interface BaseTx<Args extends unknown[] = unknown[]> {
  /**
   * underlying polkadot transaction object
   */
  transaction: PolymeshTx<Args>;
  /**
   * amount by which the protocol fees should be multiplied (only applicable to transactions where the input size impacts the total fees)
   */
  feeMultiplier?: BigNumber;
  /**
   * protocol fees associated with running the transaction (not gas). If not passed, they will be fetched from the chain. This is used for
   *   special cases where the fees aren't trivially derived from the extrinsic type
   */
  fee?: BigNumber;
}

/**
 * Object containing a low level transaction and its respective arguments
 */
export type TxWithArgs<Args extends unknown[] = unknown[]> = BaseTx<Args> &
  (Args extends []
    ? {
        args?: undefined; // this ugly hack is so that tx args don't have to be passed for transactions that don't take args
      }
    : {
        args: Args;
      });

export type TxDataWithFees<Args extends unknown[] = unknown[]> = TxData<Args> &
  Omit<TxWithArgs<Args>, 'args'>;

/**
 * Apply the {@link PolymeshTx} type to all args in an array
 */
export type MapPolymeshTx<ArgsArray extends unknown[][]> = {
  [K in keyof ArgsArray]: ArgsArray[K] extends unknown[] ? PolymeshTx<ArgsArray[K]> : never;
};

/**
 * Apply the {@link TxWithArgs} type to all args in an array
 */
export type MapTxWithArgs<ArgsArray extends unknown[][]> = {
  [K in keyof ArgsArray]: ArgsArray[K] extends unknown[] ? TxWithArgs<ArgsArray[K]> : never;
};

/**
 * Apply the {@link TxDataWithFees} type to all args in an array
 */
export type MapTxDataWithFees<ArgsArray extends unknown[][]> = {
  [K in keyof ArgsArray]: ArgsArray[K] extends unknown[] ? TxDataWithFees<ArgsArray[K]> : never;
};

/**
 * Transform a tuple of types into an array of resolver functions. For each type in the tuple, the corresponding resolver function returns that type wrapped in a promise
 */
export type ResolverFunctionArray<Values extends unknown[]> = {
  [K in keyof Values]: (receipt: ISubmittableResult) => Promise<Values[K]> | Values[K];
};

/**
 * Function that returns a value (or promise that resolves to a value) from a transaction receipt
 */
export type ResolverFunction<ReturnValue> = (
  receipt: ISubmittableResult
) => Promise<ReturnValue> | ReturnValue;

/**
 * Representation of the value that will be returned by a Procedure after it is run
 *
 * It can be:
 *   - a plain value
 *   - a resolver function that returns either a value or a promise that resolves to a value
 */
export type MaybeResolverFunction<ReturnValue> = ResolverFunction<ReturnValue> | ReturnValue;

/**
 * @hidden
 */
export function isResolverFunction<ReturnValue>(
  value: MaybeResolverFunction<ReturnValue>
): value is ResolverFunction<ReturnValue> {
  return typeof value === 'function';
}

/**
 * Base Transaction Schema
 */
export interface BaseTransactionSpec<ReturnValue, TransformedReturnValue = ReturnValue> {
  /**
   * third party Identity that will pay for the transaction (for example when joining an Identity/multisig as a secondary key).
   *   This is separate from a subsidy, and takes precedence over it. If the signing Account is being subsidized and
   *   they try to execute a transaction with `paidForBy` set, the fees will be paid for by the `paidForBy` Identity
   */
  paidForBy?: Identity;
  /**
   * value that the transaction will return once it has run, or a function that returns that value
   */
  resolver: MaybeResolverFunction<ReturnValue>;
  /**
   * function that transforms the transaction's return value before returning it after it is run
   */
  transformer?: (result: ReturnValue) => Promise<TransformedReturnValue> | TransformedReturnValue;
}

/**
 * Schema of a transaction batch
 *
 * @param Args - tuple where each value represents the type of the arguments of one of the transactions
 *   in the batch. There are cases where it is impossible to know this type beforehand. For example, if
 *   the amount (or type) of transactions in the batch depends on an argument or the chain state. For those cases,
 *   `unknown[][]` should be used, and extra care must be taken to ensure the correct transactions (and arguments)
 *   are being returned
 */
export interface BatchTransactionSpec<
  ReturnValue,
  ArgsArray extends unknown[][],
  TransformedReturnValue = ReturnValue
> extends BaseTransactionSpec<ReturnValue, TransformedReturnValue> {
  /**
   * transactions in the batch with their respective arguments
   */
  transactions: MapTxWithArgs<ArgsArray>;
}

/**
 * Schema of a specific transaction
 *
 * @param Args - arguments of the transaction
 */
export type TransactionSpec<
  ReturnValue,
  Args extends unknown[],
  TransformedReturnValue = ReturnValue
> = BaseTransactionSpec<ReturnValue, TransformedReturnValue> & TxWithArgs<Args>;

/**
 * Helper type that represents either type of transaction spec
 */
export type GenericTransactionSpec<ReturnValue> =
  | BatchTransactionSpec<ReturnValue, unknown[][]>
  | TransactionSpec<ReturnValue, unknown[]>;

/**
 * Additional information for constructing the final transaction
 */
export interface TransactionConstructionData {
  /**
   * address of the key that will sign the transaction
   */
  signingAddress: string;
  /**
   * object that handles the payload signing logic
   */
  signer: PolkadotSigner;
  /**
   * how long the transaction should be valid for
   */
  mortality: MortalityProcedureOpt;
}

export interface AuthTarget {
  target: SignerValue;
  authId: BigNumber;
}

export enum TrustedClaimIssuerOperation {
  Remove = 'Remove',
  Add = 'Add',
  Set = 'Set',
}

export interface ExtrinsicIdentifier {
  moduleId: ModuleIdEnum;
  callId: CallIdEnum;
}

export interface ExtrinsicIdentifierV2 {
  moduleId: ModuleIdEnum;
  callId: CallIdEnum;
}

export interface CorporateActionIdentifier {
  ticker: string;
  localId: BigNumber;
}

/**
 * Represents the permissions that a signer must have in order to run a Procedure. In some cases, this must be determined
 *   in a special way for the specific Procedure. In those cases, the resulting value will either be `true` if the signer can
 *   run the procedure, or a string message indicating why the signer *CAN'T* run the Procedure
 */
export interface ProcedureAuthorization {
  /**
   * general permissions that apply to both Secondary Key Accounts and External
   *   Agent Identities. Overridden by `signerPermissions` and `agentPermissions` respectively
   */
  permissions?: SimplePermissions | true | string;
  /**
   * permissions specific to secondary Accounts. This value takes precedence over `permissions` for
   *   secondary Accounts
   */
  signerPermissions?: SimplePermissions | true | string;
  /**
   * permissions specific to External Agent Identities. This value takes precedence over `permissions` for
   *   External Agents
   */
  agentPermissions?: Omit<SimplePermissions, 'portfolios'> | true | string;
  roles?: Role[] | true | string;
}

export type Falsyable<T> = T | null | undefined;

export type PermissionsEnum<P> =
  | 'Whole'
  | {
      These: P[];
    }
  | {
      Except: P[];
    };
export type PalletPermissions = {
  /* eslint-disable @typescript-eslint/naming-convention */
  pallet_name: string;
  dispatchable_names: PermissionsEnum<string>;
  /* eslint-enable @typescript-eslint/naming-convention */
};

export enum InstructionStatus {
  Pending = 'Pending',
  Unknown = 'Unknown',
  Failed = 'Failed',
  Executed = 'Executed',
}

/**
 * Determines the subset of permissions an Agent has over an Asset
 */
export type PermissionGroupIdentifier = PermissionGroupType | { custom: BigNumber };

export type InternalAssetType = KnownAssetType | { Custom: u32 };

export interface TickerKey {
  Ticker: PolymeshPrimitivesTicker;
}

/**
 * Infer Procedure parameters parameters from a Procedure function
 */
export type ProcedureParams<ProcedureFunction extends (...args: unknown[]) => unknown> =
  ReturnType<ProcedureFunction> extends Procedure<infer Params> ? Params : never;

export interface ExemptKey {
  asset: TickerKey;
  op: PolymeshPrimitivesStatisticsStatOpType;
  claimType?: ClaimType;
}

export type StatClaimInputType = Omit<InputStatClaim, 'affiliate' | 'accredited'>;

export interface StatClaimIssuer {
  issuer: Identity;
  claimType: StatClaimType;
}
