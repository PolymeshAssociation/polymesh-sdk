import { Procedure } from '~/internal';

export type Mutable<Immutable> = {
  -readonly [K in keyof Immutable]: Immutable[K];
};

export type UnionOfProcedures<Args extends unknown, ReturnValue> = Args extends unknown
  ? Procedure<Args, ReturnValue>
  : never;

/**
 * Create a literal tuple type from a list of arguments
 *
 * @param args - values to turn into a tuple
 */
export const tuple = <T extends unknown[]>(...args: T): T => args;
