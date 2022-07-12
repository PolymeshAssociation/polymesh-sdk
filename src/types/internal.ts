import {
  AugmentedEvents,
  AugmentedSubmittable,
  QueryableConsts,
  QueryableStorage,
  SubmittableExtrinsic,
  SubmittableExtrinsics,
} from '@polkadot/api/types';
import {
  PolymeshPrimitivesStatisticsStatOpType,
  PolymeshPrimitivesTicker,
} from '@polkadot/types/lookup';
import { ISubmittableResult, Signer as PolkadotSigner } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';
import { DocumentNode } from 'graphql';

import { Identity, PostTransactionValue } from '~/internal';
import { CallIdEnum, ModuleIdEnum } from '~/middleware/types';
import { CustomAssetTypeId } from '~/polkadot';
import {
  CalendarPeriod,
  KnownAssetType,
  PermissionGroupType,
  Role,
  SignerValue,
  SimplePermissions,
  TxTag,
} from '~/types';

/**
 * Polkadot's `tx` submodule
 */
export type Extrinsics = SubmittableExtrinsics<'promise'>;

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

/**
 * Transform a tuple of types into an array of {@link PostTransactionValue}.
 * For each type in the tuple, the corresponding {@link PostTransactionValue} resolves to that type
 *
 * @param Values - types of the values to be wrapped
 */
export type PostTransactionValueArray<Values extends unknown[]> = {
  [P in keyof Values]: PostTransactionValue<Values[P]>;
};

/**
 * Either a specific type or a {@link PostTransactionValue} that wraps a value of that type
 */
export type MaybePostTransactionValue<T> = PostTransactionValue<T> | T;

/**
 * Apply the {@link MaybePostTransactionValue} type to all members of a tuple
 */
export type MapMaybePostTransactionValue<T extends unknown[]> = {
  [K in keyof T]: MaybePostTransactionValue<T[K]>;
};

/**
 * Low level transaction method in the polkadot API
 *
 * @param Args - arguments of the transaction
 */
export type PolymeshTx<Args extends unknown[] = unknown[]> = AugmentedSubmittable<
  (...args: Args) => SubmittableExtrinsic<'promise'>
>;

interface BaseTx<Args extends unknown[] = unknown[]> {
  /**
   * underlying polkadot transaction object
   */
  transaction: PolymeshTx<Args>;
  /**
   * amount by which the protocol fees should be multiplied (only applicable to transactions where the input size impacts the total fees)
   */
  feeMultiplier?: BigNumber;
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
        /**
         * arguments that the transaction will receive (some of them can be {@link PostTransactionValue} from an earlier transaction)
         */
        args: MapMaybePostTransactionValue<Args>;
      });

/**
 * Transaction data for display purposes
 */
export interface TxData<Args extends unknown[] = unknown[]> {
  /**
   * transaction string identifier
   */
  tag: TxTag;
  /**
   * arguments with which the transaction will be called
   */
  args: Args;
}

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
 * Apply the {@link TxData} type to all args in an array
 */
export type MapTxData<ArgsArray extends unknown[][]> = {
  [K in keyof ArgsArray]: ArgsArray[K] extends unknown[] ? TxData<ArgsArray[K]> : never;
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
 * Base Transaction Schema
 *
 * @param Args - arguments of the transaction
 * @param Values - values that will be returned wrapped in {@link PostTransactionValue} after the transaction runs
 */
export interface BaseTransactionSpec<Values extends unknown[] = unknown[]> {
  /**
   * wrapped values that will be returned after this transaction is run
   */
  postTransactionValues?: PostTransactionValueArray<Values>;
  /**
   * Account that will sign the transaction
   */
  signingAddress: string;
  /**
   * object that handles the payload signing logic
   */
  signer: PolkadotSigner;
  /**
   * whether this tx failing makes the entire tx queue fail or not
   */
  isCritical: boolean;
  /**
   * any protocol fees associated with running the transaction (not gas)
   */
  fee?: BigNumber;
  /**
   * third party Identity that will pay for the transaction (for example when joining an Identity/multisig as a secondary key).
   *   This is separate from a subsidy, and takes precedence over it. If the signing Account is being subsidized and
   *   they try to execute a transaction with `paidForBy` set, the fees will be paid for by the `paidForBy` Identity
   */
  paidForBy?: Identity;
}

/**
 * Schema of a transaction batch
 *
 * @param Args - arguments of the transaction
 * @param Values - values that will be returned wrapped in {@link PostTransactionValue} after the transaction runs
 */
export interface BatchTransactionSpec<
  ArgsArray extends unknown[][],
  Values extends unknown[] = unknown[]
> extends BaseTransactionSpec<Values> {
  /**
   * transactions in the batch with their respective arguments
   */
  transactions: MapTxWithArgs<ArgsArray>;
}

/**
 * Schema of a specific transaction
 *
 * @param Args - arguments of the transaction
 * @param Values - values that will be returned wrapped in {@link PostTransactionValue} after the transaction runs
 */
export type TransactionSpec<
  Args extends unknown[],
  Values extends unknown[] = unknown[]
> = BaseTransactionSpec<Values> & TxWithArgs<Args>;

/**
 * Common args for `addTransaction` and `addBatchTransaction`
 */
export interface AddTransactionArgsBase<Values extends unknown[]> {
  /**
   * value in POLYX of the transaction (should only be set manually in special cases,
   *   otherwise it is fetched automatically from the chain). Fee multipliers have no effect on this value
   */
  fee?: BigNumber;
  /**
   * asynchronous callbacks used to return runtime data after the transaction has finished successfully
   */
  resolvers?: ResolverFunctionArray<Values>;
  /**
   * whether this transaction failing should make the entire queue fail or not. Defaults to true
   */
  isCritical?: boolean;
  /**
   * third party Identity that will pay for the transaction fees. No value means that the caller pays
   */
  paidForBy?: Identity;
}

/**
 * Args for `addBatchTransaction`
 */
export interface AddBatchTransactionArgs<
  Values extends unknown[],
  ArgsArray extends (unknown[] | [])[]
> extends AddTransactionArgsBase<Values> {
  /**
   * list of transactions to be added to the batch, with their respective arguments and fee multipliers
   */
  transactions: MapTxWithArgs<[...ArgsArray]>;
}

/**
 * Args for `addTransaction`
 */
export type AddTransactionArgs<
  TxArgs extends unknown[] | [],
  Values extends unknown[]
> = AddTransactionArgsBase<Values> & TxWithArgs<TxArgs>;

export interface AuthTarget {
  target: SignerValue;
  authId: BigNumber;
}

export interface GraphqlQuery<Variables = undefined> {
  query: DocumentNode;
  variables: Variables;
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

export interface ScheduleSpec {
  start: Date | null;
  period: CalendarPeriod | null;
  repetitions: BigNumber | null;
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
}

/**
 * Determines the subset of permissions an Agent has over an Asset
 */
export type PermissionGroupIdentifier = PermissionGroupType | { custom: BigNumber };

export type InternalAssetType = KnownAssetType | { Custom: CustomAssetTypeId };

export enum StatisticsOpType {
  Count = 'Count',
  Balance = 'Balance',
}

export interface TickerKey {
  Ticker: PolymeshPrimitivesTicker;
}

export interface ExemptKey {
  asset: TickerKey;
  op: PolymeshPrimitivesStatisticsStatOpType;
}
