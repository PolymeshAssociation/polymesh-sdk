import {
  AddressOrPair,
  AugmentedEvents,
  AugmentedSubmittable,
  QueryableConsts,
  QueryableStorage,
  SubmittableExtrinsic,
  SubmittableExtrinsics,
} from '@polkadot/api/types';
import { ISubmittableResult } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';
import { DocumentNode } from 'graphql';

import { PostTransactionValue } from '~/internal';
import { CallIdEnum, ModuleIdEnum } from '~/middleware/types';
import { CalendarPeriod, Role, SignerValue, SimplePermissions } from '~/types';

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
 * Low level transaction method in the polkadot API
 *
 * @param Args - arguments of the transaction
 */
export type PolymeshTx<Args extends unknown[]> = AugmentedSubmittable<
  (...args: Args) => SubmittableExtrinsic<'promise'>
>;

/**
 * Transforms a tuple of types into an array of resolver functions. For each type in the tuple, the corresponding resolver function returns that type wrapped in a promise
 */
export type ResolverFunctionArray<Values extends unknown[]> = {
  [K in keyof Values]: (receipt: ISubmittableResult) => Promise<Values[K]> | Values[K];
};

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
 * Base Transaction Schema
 *
 * @param Args - arguments of the transaction
 * @param Values - values that will be returned wrapped in [[PostTransactionValue]] after the transaction runs
 */
export interface BaseTransactionSpec<
  Args extends unknown[] = unknown[],
  Values extends unknown[] = unknown[]
> {
  /**
   * underlying polkadot transaction object
   */
  tx: MaybePostTransactionValue<PolymeshTx<Args>>;
  /**
   * wrapped values that will be returned after this transaction is run
   */
  postTransactionValues?: PostTransactionValueArray<Values>;
  /**
   * account that will sign the transaction
   */
  signer: AddressOrPair;
  /**
   * whether this tx failing makes the entire tx queue fail or not
   */
  isCritical: boolean;
  /**
   * any protocol fees associated with running the transaction (not gas)
   */
  fee: BigNumber | null;
  /**
   * whether the transaction fees are paid by a third party (for example when joining an identity as a secondary key)
   */
  paidByThirdParty: boolean;
}

/**
 * Schema of a transaction batch
 *
 * @param Args - arguments of the transaction
 * @param Values - values that will be returned wrapped in [[PostTransactionValue]] after the transaction runs
 */
export interface BatchTransactionSpec<
  Args extends unknown[] = unknown[],
  Values extends unknown[] = unknown[]
> extends BaseTransactionSpec<Args, Values> {
  /**
   * arguments of each transaction in the batch (some of them can be [[PostTransactionValue]] from an earlier transaction)
   */
  args: MapMaybePostTransactionValue<Args>[];
}

/**
 * Schema of a specific transaction
 *
 * @param Args - arguments of the transaction
 * @param Values - values that will be returned wrapped in [[PostTransactionValue]] after the transaction runs
 */
export interface TransactionSpec<
  Args extends unknown[] = unknown[],
  Values extends unknown[] = unknown[]
> extends BaseTransactionSpec<Args, Values> {
  /**
   * arguments that the transaction will receive (some of them can be [[PostTransactionValue]] from an earlier transaction)
   */
  args: MapMaybePostTransactionValue<Args>;
  /**
   * number of elements in the batch (only applicable to batch transactions)
   */
  batchSize: number | null;
}

export interface AuthTarget {
  target: SignerValue;
  authId: BigNumber;
}

export interface GraphqlQuery<Variables = undefined> {
  query: DocumentNode;
  variables: Variables;
}

export enum ClaimOperation {
  Revoke = 'Revoke',
  Add = 'Add',
  Edit = 'Edit',
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

export interface PortfolioId {
  did: string;
  number?: BigNumber;
}

export enum InstructionAffirmationOperation {
  Affirm = 'Affirm',
  Withdraw = 'Withdraw',
  Reject = 'Reject',
}

export interface ScheduleSpec {
  start: Date | null;
  period: CalendarPeriod | null;
  repetitions: number | null;
}

export interface ScopeClaimProof {
  proofScopeIdWellformed: string;
  proofScopeIdCddIdMatch: {
    challengeResponses: [string, string];
    subtractExpressionsRes: string;
    blindedScopeDidHash: string;
  };
}

export interface CorporateActionIdentifier {
  ticker: string;
  localId: BigNumber;
}

export interface ProcedureAuthorization {
  permissions?: SimplePermissions | boolean;
  roles?: Role[] | boolean;
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
