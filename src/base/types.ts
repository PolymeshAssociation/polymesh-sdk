/* istanbul ignore file: already being tested somewhere else */

import { PolymeshError as PolymeshErrorClass } from './PolymeshError';
import { PolymeshTransaction as PolymeshTransactionClass } from './PolymeshTransaction';
import { TransactionQueue as TransactionQueueClass } from './TransactionQueue';

export type PolymeshTransaction = InstanceType<typeof PolymeshTransactionClass>;
export type TransactionQueue<
  ProcedureReturnType = void,
  ReturnType = ProcedureReturnType,
  TransactionArgs extends unknown[][] = unknown[][]
> = TransactionQueueClass<ProcedureReturnType, ReturnType, TransactionArgs>;
export type PolymeshError = PolymeshErrorClass;
