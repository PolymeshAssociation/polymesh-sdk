import { PolymeshTransaction as PolymeshTransactionClass } from './PolymeshTransaction';
import { TransactionQueue as TransactionQueueClass } from './TransactionQueue';

export type PolymeshTransaction = InstanceType<typeof PolymeshTransactionClass>;
export type TransactionQueue = InstanceType<typeof TransactionQueueClass>;
