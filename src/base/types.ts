import { PolymeshError as PolymeshErrorClass } from './PolymeshError';
import { PolymeshTransaction as PolymeshTransactionClass } from './PolymeshTransaction';
import { TransactionQueue as TransactionQueueClass } from './TransactionQueue';

export type PolymeshTransaction = InstanceType<typeof PolymeshTransactionClass>;
export type TransactionQueue = InstanceType<typeof TransactionQueueClass>;
export type PolymeshError = InstanceType<typeof PolymeshErrorClass>;
export { isPolymeshError } from './PolymeshError';
