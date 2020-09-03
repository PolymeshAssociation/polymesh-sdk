import BigNumber from 'bignumber.js';
import P from 'bluebird';
import { EventEmitter } from 'events';
import { range } from 'lodash';

import { PolymeshError, PolymeshTransaction, PostTransactionValue } from '~/base';
import { Context } from '~/context';
import { latestProcessedBlock } from '~/middleware/queries';
import { Query } from '~/middleware/types';
import { Ensured, ErrorCode, Fees, TransactionQueueStatus } from '~/types';
import { MaybePostTransactionValue, TransactionSpec } from '~/types/internal';
import { delay } from '~/utils';

/**
 * @hidden
 */
enum Event {
  StatusChange = 'StatusChange',
  TransactionStatusChange = 'TransactionStatusChange',
  ProcessedByMiddleware = 'ProcessedByMiddleware',
}

/**
 * @hidden
 */
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
        this.emitter.emit(Event.TransactionStatusChange, updatedTransaction, this);
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

    const { context } = this;

    const [{ free: freeBalance }, fees] = await Promise.all([
      context.accountBalance(),
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
      this.emitWhenMiddlewareIsSynced();
    }

    return res;
  }

  /**
   * Retrieves a lower bound of the fees required to execute this transaction queue.
   *   Transaction fees can be higher at execution time for two reasons:
   *
   * - One or more transactions (or arguments) depend on the result of another transaction in the queue.
   *   This means fees can't be calculated for said transaction until previous transactions in the queue have run
   * - Protocol fees may vary between when this value is fetched and when the transaction is actually executed because of a
   *   governance vote
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
  public onStatusChange(
    listener: (transactionQueue: this, err?: PolymeshError) => void
  ): () => void {
    this.emitter.on(Event.StatusChange, listener);

    return (): void => {
      this.emitter.removeListener(Event.StatusChange, listener);
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
    this.emitter.on(Event.TransactionStatusChange, listener);

    return (): void => {
      this.emitter.removeListener(Event.TransactionStatusChange, listener);
    };
  }

  /**
   * Subscribe to the results of this queue being processed by the harvester (and as such, available to the middleware)
   *
   * @param listener - callback function that will be called whenever the middleware is updated with the latest data.
   *   If there is an error (timeout or middleware offline) it will be passed to this callback
   *
   * @note this event will be fired even if the queue fails
   * @returns unsubscribe function
   * @throws if the middleware wasn't enabled when instantiating the SDK client
   */
  public onProcessedByMiddleware(listener: (err?: PolymeshError) => void): () => void {
    if (!this.context.isMiddlewareEnabled()) {
      throw new PolymeshError({
        code: ErrorCode.FatalError,
        message: 'Cannot subscribe without an enabled middleware connection',
      });
    }

    this.emitter.on(Event.ProcessedByMiddleware, listener);

    return (): void => {
      this.emitter.removeListener(Event.ProcessedByMiddleware, listener);
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
        this.emitter.emit(Event.StatusChange, this);
        return;
      }
      case TransactionQueueStatus.Failed: {
        this.emitter.emit(Event.StatusChange, this, this.error);
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

  /**
   * Poll the middleware every 2 seconds to see if it has already processed the
   *   block that reflects the changes brought on by this queue being run. If so,
   *   emit the corresponding event. After 5 retries (or if the middleware can't be reached),
   *   the event is emitted with an error
   */
  private async emitWhenMiddlewareIsSynced(): Promise<void> {
    const { context } = this;

    if (!context.isMiddlewareEnabled()) {
      return;
    }

    const blockNumber = await context.getLatestBlock();

    let done = false;

    P.each(range(6), async i => {
      if (done) {
        return;
      }

      try {
        const {
          data: {
            latestBlock: { id: processedBlock },
          },
        } = await context.queryMiddleware<Ensured<Query, 'latestBlock'>>(latestProcessedBlock());

        if (blockNumber.lte(processedBlock)) {
          done = true;
          this.emitter.emit(Event.ProcessedByMiddleware);
          return;
        }
      } catch (err) {}

      if (i === 5) {
        this.emitter.emit(
          Event.ProcessedByMiddleware,
          new PolymeshError({ code: ErrorCode.MiddlewareError, message: 'Timed out' })
        );
      }

      return delay(2000);
    });
  }
}
