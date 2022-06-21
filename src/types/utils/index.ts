import { AugmentedQuery } from '@polkadot/api/types';
import type { Observable } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';

import { Entity, Procedure } from '~/internal';
import { Exact } from '~/middleware/typesV2';

export type Mutable<Immutable> = {
  -readonly [K in keyof Immutable]: Immutable[K];
};

export type ProcedureFunc<Args, ReturnValue, Storage> = () => Procedure<Args, ReturnValue, Storage>;

export type UnionOfProcedureFuncs<Args, ReturnValue, Storage> = Args extends unknown
  ? ProcedureFunc<Args, ReturnValue, Storage>
  : never;

/**
 * Less strict version of Parameters<T>
 */
export type ArgsType<T> = T extends (...args: infer A) => unknown ? A : never;

/**
 * Recursively traverse a type and transform its Entity properties into their
 *   human readable version (as if `.toHuman` had been called on all of them)
 */
export type HumanReadableType<T> = T extends Entity<unknown, infer H>
  ? HumanReadableType<H>
  : T extends BigNumber
  ? string
  : T extends Date
  ? string
  : // eslint-disable-next-line @typescript-eslint/ban-types
  T extends object
  ? {
      [K in keyof T]: T[K] extends Entity<unknown, infer E>
        ? HumanReadableType<E>
        : HumanReadableType<T[K]>;
    }
  : T;

/**
 * Extract the return type of a polkadot.js query function
 *
 * @example `QueryReturnType<typeof identity.authorizations>` returns `Option<Authorization>`
 */
export type QueryReturnType<T> = T extends AugmentedQuery<'promise', infer Fun>
  ? ReturnType<Fun> extends Observable<infer R>
    ? R
    : never
  : never;

/**
 * Override T with the properties of R
 */
export type Modify<T, R> = Omit<T, keyof R> & R;

/**
 * Ensure a specific property of T is defined
 */
export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };

/**
 * Pick a single property from T and ensure it is defined
 */
export type Ensured<T, K extends keyof T> = Required<Pick<T, K>>;

export type EnsuredV2<T, K extends keyof T> = Required<Pick<T, K>> & {
  [SubKey in K]: NonNullable<T[SubKey]>;
};

export type PaginatedQueryArgs<T> = T & {
  size?: number;
  start?: number;
};

export type QueryArgs<T, K extends keyof T> = {
  [P in K]?: T[P];
};

/**
 * Create a literal tuple type from a list of arguments
 *
 * @param args - values to turn into a tuple
 */
export const tuple = <T extends unknown[]>(...args: T): T => args;
