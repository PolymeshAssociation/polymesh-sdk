import { Procedure } from '~/internal';

export type Mutable<Immutable> = {
  -readonly [K in keyof Immutable]: Immutable[K];
};

export type ProcedureFunc<Args extends unknown, ReturnValue, Storage> = () => Procedure<
  Args,
  ReturnValue,
  Storage
>;

export type UnionOfProcedureFuncs<Args extends unknown, ReturnValue, Storage> = Args extends unknown
  ? ProcedureFunc<Args, ReturnValue, Storage>
  : never;

/**
 * Less strict version of Parameters<T>
 */
export type ArgsType<T> = T extends (...args: infer A) => unknown ? A : never;

/**
 * Create a literal tuple type from a list of arguments
 *
 * @param args - values to turn into a tuple
 */
export const tuple = <T extends unknown[]>(...args: T): T => args;
