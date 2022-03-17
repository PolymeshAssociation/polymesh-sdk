import BigNumber from 'bignumber.js';
import P from 'bluebird';
import { EventEmitter } from 'events';
import { range, values } from 'lodash';

import { Context, PolymeshError, PolymeshTransactionBase, PostTransactionValue } from '~/internal';
import { latestProcessedBlock } from '~/middleware/queries';
import { Query } from '~/middleware/types';
import {
  ErrorCode,
  Fees,
  FeesBreakdown,
  PayingAccountType,
  ThirdPartyFees,
  TransactionQueueStatus,
} from '~/types';
import { MaybePostTransactionValue } from '~/types/internal';
import { Ensured } from '~/types/utils';
import { delay } from '~/utils/internal';

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
    ? PolymeshTransactionBase<TransactionArgs[K]>
    : never;
};

/**
 * Class to manage procedural transaction queues
 */
export class TransactionQueue<
  ProcedureReturnType = void,
  ReturnType = ProcedureReturnType,
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
  private queue = [] as unknown as PolymeshTransactionArray<TransactionArgs>;

  /**
   * @hidden
   * value
   */
  private procedureResult: MaybePostTransactionValue<ProcedureReturnType>;

  /**
   * @hidden
   * function that transforms the return type
   */
  private transformer: (procedureResult: ProcedureReturnType) => Promise<ReturnType> | ReturnType;

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
   * @param args.transactions - list of transactions to be run in this queue
   * @param args.procedureResult - value that will be returned by the queue after it is run. It can be a {@link PostTransactionValue}
   * @param args.transformer - function that transforms the procedure's return value before returning it after the queue is run
   */
  constructor(
    args: {
      transactions: PolymeshTransactionArray<TransactionArgs>;
      procedureResult: MaybePostTransactionValue<ProcedureReturnType>;
      transformer?: (result: ProcedureReturnType) => Promise<ReturnType> | ReturnType;
    },
    context: Context
  ) {
    const {
      transactions,
      procedureResult,
      transformer = async (val): Promise<ReturnType> => val as unknown as ReturnType,
    } = args;

    this.emitter = new EventEmitter();
    this.procedureResult = procedureResult;
    this.hasRun = false;
    this.context = context;
    this.transactions = [] as unknown as PolymeshTransactionArray<TransactionArgs>;
    this.transformer = transformer;

    transactions.forEach(transaction => {
      transaction.onStatusChange(updatedTransaction => {
        this.emitter.emit(Event.TransactionStatusChange, updatedTransaction, this);
      });

      this.transactions.push(transaction);
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
        code: ErrorCode.General,
        message: 'Cannot re-run a Transaction Queue',
      });
    }

    await this.assertFeesCovered();

    this.queue = [...this.transactions] as unknown as PolymeshTransactionArray<TransactionArgs>;
    this.updateStatus(TransactionQueueStatus.Running);

    let procRes: ProcedureReturnType;
    let res: ReturnType;

    try {
      await this.executeTransactionQueue();
      this.updateStatus(TransactionQueueStatus.Succeeded);
      const { procedureResult } = this;

      if (procedureResult instanceof PostTransactionValue) {
        procRes = procedureResult.value;
      } else {
        procRes = procedureResult;
      }

      res = await this.transformer(procRes);
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
   * Retrieve a lower bound of the fees required to execute this transaction queue.
   *   Transaction fees can be higher at execution time for three reasons:
   *
   * - One or more transaction arguments depend on the result of another transaction in the queue.
   *   This means fees can't be calculated for said transaction until previous transactions in the queue have run
   * - Protocol or gas fees may vary between when this value is fetched and when the transaction is actually executed because of a
   *   governance vote
   *
   * Transaction fees are broken down between those that have to be paid by the signing Account and
   *   those that will be paid by third parties. In most cases, the entirety of the fees will be paid by
   *   either the signing Account or a **single** third party Account
   */
  public async getMinFees(): Promise<FeesBreakdown> {
    const {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      subsidizedTransactions,
      ...rest
    } = await this._getMinFees();

    return rest;
  }

  /**
   * @hidden
   *
   * Return a breakdown of the queue's fees and which transactions are being subsidized
   */
  private async _getMinFees(): Promise<
    FeesBreakdown & { subsidizedTransactions: PolymeshTransactionBase[] }
  > {
    const { context, transactions } = this;

    // get the fees and paying Account for each transaction in the queue
    const allFees = await P.map(transactions, async transaction => {
      const [payingAccount, fees] = await Promise.all([
        transaction.getPayingAccount(),
        transaction.getFees(),
      ]);

      if (!fees) {
        return null;
      }

      if (payingAccount) {
        return {
          fees,
          payingAccount,
        };
      }

      return {
        fees,
      };
    });

    const addFees = (a: Fees, b: Fees): Fees => {
      return {
        protocol: a.protocol.plus(b.protocol),
        gas: a.gas.plus(b.gas),
      };
    };

    // Account address -> fee data (for efficiency)
    const breakdownByAccount: Record<string, ThirdPartyFees> = {};

    // fees for the signing Account
    let accountFees: Fees = {
      protocol: new BigNumber(0),
      gas: new BigNumber(0),
    };

    const subsidizedTransactions: PolymeshTransactionBase[] = [];

    // compile the fees and other data for each paying Account (and the signing Account as well)
    const eachPromise = P.each(allFees, async (transactionFees, index) => {
      if (!transactionFees) {
        return;
      }

      const { fees, payingAccount } = transactionFees;

      if (!payingAccount) {
        // payingAccount === null means the signing Account has to pay
        accountFees = addFees(accountFees, fees);
      } else {
        const { account, type } = payingAccount;
        const { address } = account;
        const thirdPartyData = breakdownByAccount[address];

        if (type === PayingAccountType.Subsidy) {
          subsidizedTransactions.push(transactions[index]);
        }

        if (!thirdPartyData) {
          // first time encountering this third party Account, we must populate the initial values
          const { free: balance } = await account.getBalance();
          breakdownByAccount[address] = {
            ...payingAccount,
            balance,
            fees,
          };
        } else {
          // already encountered the Account before, just add the fees
          thirdPartyData.fees = addFees(thirdPartyData.fees, fees);
        }
      }
    });

    const { free: accountBalance } = await context.accountBalance();
    await eachPromise;

    const thirdPartyFees = values(breakdownByAccount);

    return {
      thirdPartyFees,
      accountBalance,
      accountFees,
      subsidizedTransactions,
    };
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
  public onTransactionStatusChange<Values extends unknown[]>(
    listener: (transaction: PolymeshTransactionBase<Values>, transactionQueue: this) => void
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
        code: ErrorCode.General,
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
   *
   * @note uses the middleware
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

  /**
   * Check if balances and allowances (both third party and signing Account)
   *   are sufficient to cover this queue's fees
   */
  private async assertFeesCovered(): Promise<void> {
    const breakdown = await this._getMinFees();

    const { accountBalance, accountFees, thirdPartyFees, subsidizedTransactions } = breakdown;

    const unsupportedTransactions = subsidizedTransactions.filter(
      transaction => !transaction.supportsSubsidy()
    );

    if (unsupportedTransactions.length) {
      throw new PolymeshError({
        code: ErrorCode.UnmetPrerequisite,
        message: 'Some of the transactions in the queue cannot be run with a subsidized Account',
        data: {
          unsupportedTransactions,
        },
      });
    }

    const calculateTotal = ({ protocol, gas }: Fees): BigNumber => protocol.plus(gas);

    const noThirdPartyAllowance: ThirdPartyFees[] = [];
    const noThirdPartyBalance: ThirdPartyFees[] = [];
    thirdPartyFees.forEach(data => {
      const { allowance, balance, fees } = data;
      const total = calculateTotal(fees);
      if (balance.lt(total)) {
        noThirdPartyBalance.push(data);
      }
      if (allowance?.lt(total)) {
        noThirdPartyAllowance.push(data);
      }
    });

    if (noThirdPartyAllowance.length) {
      throw new PolymeshError({
        code: ErrorCode.InsufficientBalance,
        message: "Not enough POLYX third party allowance to pay for this procedure's fees",
        data: {
          thirdPartyFees: noThirdPartyAllowance,
        },
      });
    }
    if (noThirdPartyBalance.length) {
      throw new PolymeshError({
        code: ErrorCode.InsufficientBalance,
        message: "Not enough POLYX third party balance to pay for this procedure's fees",
        data: {
          thirdPartyFees: noThirdPartyBalance,
        },
      });
    }

    const totalFees = calculateTotal(accountFees);

    if (accountBalance.lt(totalFees)) {
      throw new PolymeshError({
        code: ErrorCode.InsufficientBalance,
        message: "Not enough POLYX balance to pay for this procedure's fees",
        data: {
          balance: accountBalance,
          fees: accountFees,
        },
      });
    }
  }
}
