/* istanbul ignore file: already being tested somewhere else */

import { PolymeshError as PolymeshErrorClass } from './PolymeshError';
import { PolymeshTransaction as PolymeshTransactionClass } from './PolymeshTransaction';
import { PolymeshTransactionBatch as PolymeshTransactionBatchClass } from './PolymeshTransactionBatch';
import { TransactionQueue as TransactionQueueClass } from './TransactionQueue';

export type PolymeshTransaction = PolymeshTransactionClass;
export type PolymeshTransactionBatch = PolymeshTransactionBatchClass;
export type TransactionQueue<
  ProcedureReturnType = void,
  ReturnType = ProcedureReturnType,
  TransactionArgs extends unknown[][] = unknown[][]
> = TransactionQueueClass<ProcedureReturnType, ReturnType, TransactionArgs>;
export type PolymeshError = PolymeshErrorClass;
