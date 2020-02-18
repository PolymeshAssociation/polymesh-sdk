import BN from 'bn.js';
import { EventEmitter } from 'events';

import { PolymeshError } from '~/base/PolymeshError';
import { PolymeshTransaction } from '~/base/PolymeshTransaction';
import { PostTransactionValue } from '~/base/PostTransactionValue';
import { TransactionQueueStatus } from '~/types';
import {
  Extrinsics,
  MaybePostTransactionValue,
  PolymeshTx,
  TransactionSpec,
} from '~/types/internal';

enum Events {
  StatusChange = 'StatusChange',
  TransactionStatusChange = 'TransactionStatusChange',
}

type TransactionNamesFromModuleNames<ModuleNames extends (keyof Extrinsics)[]> = {
  [K in keyof ModuleNames]: ModuleNames[K] extends ModuleNames[number]
    ? keyof Extrinsics[ModuleNames[K]]
    : never;
};

type PolymeshTransactionArray<
  ModuleNames extends (keyof Extrinsics)[],
  TransactionNames extends TransactionNamesFromModuleNames<ModuleNames>
> = {
  [K in keyof ModuleNames]: ModuleNames[K] extends ModuleNames[number]
    ? TransactionNames[K] extends TransactionNames[number]
      ? PolymeshTransaction<ModuleNames[K], TransactionNames[K]>
      : never
    : never;
};

type TransactionSpecArray<
  ModuleNames extends (keyof Extrinsics)[],
  TransactionNames extends TransactionNamesFromModuleNames<ModuleNames>
> = {
  [K in keyof ModuleNames]: ModuleNames[K] extends ModuleNames[number]
    ? TransactionNames[K] extends TransactionNames[number]
      ? TransactionSpec<ModuleNames[K], TransactionNames[K]>
      : never
    : never;
};

type GetModuleName<Tx> = Tx extends PolymeshTx<infer ModuleName, infer _> ? ModuleName : never;

type GetTransactionName<Tx> = Tx extends PolymeshTx<infer _, infer TransactionName>
  ? TransactionName
  : never;

/**
 * Class to manage procedural transaction queues
 */
export class TransactionQueue<
  ModuleNames extends (keyof Extrinsics)[],
  TransactionNames extends TransactionNamesFromModuleNames<ModuleNames>,
  Args extends unknown = unknown,
  ReturnType extends unknown = void
> {
  /**
   * transactions that will be run in the queue
   */
  public transactions: PolymeshTransactionArray<ModuleNames, TransactionNames>;

  /**
   * status of the queue
   */
  public status: TransactionQueueStatus = TransactionQueueStatus.Idle;

  /**
   * arguments provided to the procedure that generated the queue
   */
  public args: Args;

  /**
   * optional error information
   */
  public error?: PolymeshError;

  /**
   * total cost of running the transactions in the queue (in POLY). This does not include gas
   */
  public fees: BN;

  /**
   * @hidden
   */
  private queue = ([] as unknown) as PolymeshTransactionArray<ModuleNames, TransactionNames>;

  /**
   * @hidden
   */
  private returnValue: MaybePostTransactionValue<ReturnType>;

  /**
   * @hidden
   */
  private emitter: EventEmitter;

  /**
   * Create a transaction queue
   *
   * @param transactions - list of transactions to be run in this queue
   * @param returnValue - value that will be returned by the queue after it is run. It can be a [[PostTransactionValue]]
   * @param args - arguments with which the Procedure that generated this queue was instanced
   */
  constructor(
    transactions: TransactionSpecArray<ModuleNames, TransactionNames>,
    fees: BN,
    returnValue: MaybePostTransactionValue<ReturnType>,
    args: Args
  ) {
    this.emitter = new EventEmitter();
    this.args = args;
    this.fees = fees;
    this.returnValue = returnValue;

    this.transactions = transactions.map(transaction => {
      const txn = new PolymeshTransaction<
        GetModuleName<typeof transaction>,
        GetTransactionName<typeof transaction>
      >(transaction);

      txn.onStatusChange(updatedTransaction => {
        this.emitter.emit(Events.TransactionStatusChange, updatedTransaction, this);
      });

      return txn;
    }) as PolymeshTransactionArray<ModuleNames, TransactionNames>;
  }

  /**
   * Run the transactions in the queue in sequential order. If a transaction fails or the user refuses to sign it, one of two things can happen:
   *
   * 1) If `transaction.isCritical === true`, the entire queue fails and the corresponding error is stored in `this.error` as well as thrown
   * 2) Otherwise, the queue continues executing and the error is stored in `transaction.error`
   */
  public async run(): Promise<ReturnType> {
    this.queue = [...this.transactions] as PolymeshTransactionArray<ModuleNames, TransactionNames>;
    this.updateStatus(TransactionQueueStatus.Running);

    let res: ReturnType | undefined;

    try {
      await this.executeTransactionQueue();
      this.updateStatus(TransactionQueueStatus.Succeeded);
      const { returnValue } = this;

      if (returnValue instanceof PostTransactionValue) {
        res = returnValue.value;
      } else {
        res = returnValue;
      }
    } catch (err) {
      this.error = err;
      this.updateStatus(TransactionQueueStatus.Failed);
      throw err;
    }

    return res;
  }

  /**
   * Subscribe to status changes on the Transaction Queue
   *
   * @param listener - callback function that will be called whenever the Transaction Queue's status changes
   *
   * @returns unsubscribe function
   */
  public onStatusChange(listener: (transactionQueue: this) => void): () => void {
    this.emitter.on(Events.StatusChange, listener);

    return (): void => {
      this.emitter.removeListener(Events.StatusChange, listener);
    };
  }

  /**
   * Subscribe to status changes on individual transactions
   *
   * @param listener - callback function that will be called whenever the individual transaction's status changes
   *
   * @returns unsubscribe function
   */
  public onTransactionStatusChange<
    ModuleName extends keyof Extrinsics,
    TransactionName extends keyof Extrinsics[ModuleName],
    Values extends unknown[]
  >(
    listener: (
      transaction: PolymeshTransaction<ModuleName, TransactionName, Values>,
      transactionQueue: this
    ) => void
  ): () => void {
    this.emitter.on(Events.TransactionStatusChange, listener);

    return (): void => {
      this.emitter.removeListener(Events.TransactionStatusChange, listener);
    };
  }

  /**
   * @hidden
   */
  private updateStatus(
    status:
      | TransactionQueueStatus.Running
      | TransactionQueueStatus.Succeeded
      | TransactionQueueStatus.Failed
  ): void {
    this.status = status;

    switch (status) {
      case TransactionQueueStatus.Running: {
        this.emitter.emit(Events.StatusChange, this);
        return;
      }
      case TransactionQueueStatus.Succeeded: {
        this.emitter.emit(Events.StatusChange, this);
        return;
      }
      case TransactionQueueStatus.Failed: {
        this.emitter.emit(Events.StatusChange, this, this.error);
      }
    }
  }

  /**
   * @hidden
   */
  private async executeTransactionQueue(): Promise<void> {
    const nextTransaction = this.queue.shift();

    if (!nextTransaction) {
      return;
    }

    try {
      await nextTransaction.run();
    } catch (err) {
      if (nextTransaction.isCritical) {
        throw err;
      }
    }

    await this.executeTransactionQueue();
  }
}
