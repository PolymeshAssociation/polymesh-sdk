import BigNumber from 'bignumber.js';
import { EventEmitter } from 'events';

import { PolymeshError, PolymeshTransaction, PostTransactionValue } from '~/base';
import { Context } from '~/context';
import { ErrorCode, Fees, TransactionQueueStatus } from '~/types';
import { MaybePostTransactionValue, TransactionSpec } from '~/types/internal';

enum Events {
  StatusChange = 'StatusChange',
  TransactionStatusChange = 'TransactionStatusChange',
}

type PolymeshTransactionArray<TransactionArgs extends unknown[][]> = {
  [K in keyof TransactionArgs]: TransactionArgs[K] extends TransactionArgs[number]
    ? PolymeshTransaction<TransactionArgs[K]>
    : never;
};

type TransactionSpecArray<TransactionArgs extends unknown[][]> = {
  [K in keyof TransactionArgs]: TransactionArgs[K] extends TransactionArgs[number]
    ? TransactionSpec<TransactionArgs[K]>
    : never;
};

/**
 * Class to manage procedural transaction queues
 */
export class TransactionQueue<
  ReturnType = void,
  TransactionArgs extends unknown[][] = unknown[][]
> {
  /**
   * transactions that will be run in the queue
   */
  public transactions: PolymeshTransactionArray<TransactionArgs>;

  /**
   * status of the queue
   */
  public status: TransactionQueueStatus = TransactionQueueStatus.Idle;

  /**
   * optional error information
   */
  public error?: PolymeshError;

  /**
   * @hidden
   * internal queue of transactions to be run
   */
  private queue = ([] as unknown) as PolymeshTransactionArray<TransactionArgs>;

  /**
   * @hidden
   * value that will be returned by the queue after running
   */
  private returnValue: MaybePostTransactionValue<ReturnType>;

  /**
   * @hidden
   * internal event emitter to listen for status changes
   */
  private emitter: EventEmitter;

  /**
   * @hidden
   * whether the queue has run or not (prevents re-running)
   */
  private hasRun: boolean;

  private context: Context;

  /**
   * Create a transaction queue
   *
   * @param transactions - list of transactions to be run in this queue
   * @param returnValue - value that will be returned by the queue after it is run. It can be a [[PostTransactionValue]]
   * @param args - arguments with which the Procedure that generated this queue was instanced
   */
  constructor(
    transactions: TransactionSpecArray<TransactionArgs>,
    returnValue: MaybePostTransactionValue<ReturnType>,
    context: Context
  ) {
    this.emitter = new EventEmitter();
    this.returnValue = returnValue;
    this.hasRun = false;
    this.context = context;
    this.transactions = ([] as unknown) as PolymeshTransactionArray<TransactionArgs>;

    transactions.forEach(transaction => {
      const txn = new PolymeshTransaction(transaction, context);

      txn.onStatusChange(updatedTransaction => {
        this.emitter.emit(Events.TransactionStatusChange, updatedTransaction, this);
      });

      this.transactions.push(txn);
    });
  }

  /**
   * Run the transactions in the queue in sequential order. If a transaction fails or the user refuses to sign it, one of two things can happen:
   *
   * 1) If `transaction.isCritical === true`, the entire queue fails and the corresponding error is stored in `this.error` as well as thrown
   * 2) Otherwise, the queue continues executing and the error is stored in `transaction.error`
   */
  public async run(): Promise<ReturnType> {
    if (this.hasRun) {
      throw new PolymeshError({
        code: ErrorCode.FatalError,
        message: 'Cannot re-run a Transaction Queue',
      });
    }

    const [{ free: freeBalance }, fees] = await Promise.all([
      this.context.accountBalance(),
      this.getMinFees(),
    ]);

    const { protocol, gas } = fees;

    if (freeBalance.lt(protocol.plus(gas))) {
      throw new PolymeshError({
        code: ErrorCode.ValidationError,
        message: "Not enough POLYX balance to pay for this procedure's fees",
        data: {
          freeBalance,
          fees,
        },
      });
    }

    this.queue = [...this.transactions] as PolymeshTransactionArray<TransactionArgs>;
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
    } finally {
      this.hasRun = true;
    }

    return res;
  }

  /**
   * Retrieves a lower bound of the fees required to execute this transaction queue
   */
  public async getMinFees(): Promise<Fees> {
    const allFees = await Promise.all(this.transactions.map(transaction => transaction.getFees()));

    return allFees.reduce<Fees>(
      (acc, next) => ({
        protocol: acc.protocol.plus(next?.protocol ?? 0),
        gas: acc.gas.plus(next?.gas ?? 0),
      }),
      {
        protocol: new BigNumber(0),
        gas: new BigNumber(0),
      }
    );
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
  public onTransactionStatusChange<TxArgs extends unknown[], Values extends unknown[]>(
    listener: (transaction: PolymeshTransaction<TxArgs, Values>, transactionQueue: this) => void
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
      case TransactionQueueStatus.Running:
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
