import { PolymeshError as PolymeshErrorClass } from './PolymeshError';
import { PolymeshTransaction as PolymeshTransactionClass } from './PolymeshTransaction';
import { TransactionQueue as TransactionQueueClass } from './TransactionQueue';

export type PolymeshTransaction = InstanceType<typeof PolymeshTransactionClass>;
export type TransactionQueue = InstanceType<typeof TransactionQueueClass>;
export type PolymeshError = InstanceType<typeof PolymeshErrorClass>;

/**
 * @hidden
 */
export function isPolymeshError(err: unknown): err is PolymeshError {
  const error = err as PolymeshError;

  return typeof error.code === 'string' && typeof error.message === 'string';
}
