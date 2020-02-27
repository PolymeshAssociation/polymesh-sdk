import { AddressOrPair, TxTag } from '@polymathnetwork/polkadot/api/types';
import BigNumber from 'bignumber.js';

import { TransactionQueue } from '~/base';
import { PolymeshError } from '~/base/PolymeshError';
import { PostTransactionValue } from '~/base/PostTransactionValue';
import { Context } from '~/context';
import { ErrorCode, Role } from '~/types';
import {
  MapMaybePostTransactionValue,
  MaybePostTransactionValue,
  PolymeshTx,
  PostTransactionValueArray,
  ResolverFunctionArray,
  TransactionSpec,
} from '~/types/internal';

/**
 * @hidden
 * Represents an operation performed on the Polymesh blockchain.
 * A Procedure can be prepared to yield a [[TransactionQueue]] that can be run
 */
export class Procedure<Args extends unknown = void, ReturnValue extends unknown = void> {
  private prepareTransactions: (
    this: Procedure<Args, ReturnValue>,
    args: Args
  ) => Promise<MaybePostTransactionValue<ReturnValue>>;

  private checkRoles: (this: Procedure<Args, ReturnValue>, args: Args) => Promise<boolean>;

  private transactions: TransactionSpec[] = [];

  private fees: Array<BigNumber> = [];

  public context = {} as Context;

  /**
   * @hidden
   */
  constructor(
    prepareTransactions: (
      this: Procedure<Args, ReturnValue>,
      args: Args
    ) => Promise<MaybePostTransactionValue<ReturnValue>>,
    checkRoles:
      | Role[]
      | ((this: Procedure<Args, ReturnValue>, args: Args) => Promise<boolean>) = async (): Promise<
      boolean
    > => true
  ) {
    this.prepareTransactions = prepareTransactions;

    if (Array.isArray(checkRoles)) {
      // TODO @monitz87: implement this for real when we have actual role-checking logic
      this.checkRoles = async (): Promise<boolean> => false;
    } else {
      this.checkRoles = checkRoles;
    }
  }

  /**
   * @hidden
   * Reset the procedure
   */
  private cleanup(): void {
    this.transactions = [];
    this.fees = [];
    this.context = {} as Context;
  }

  /**
   * Build a [[TransactionQueue]] that can be run
   *
   * @param args - arguments required to prepare the queue
   * @param context - context in which the resulting queue will run
   */
  public async prepare(args: Args, context: Context): Promise<TransactionQueue<ReturnValue>> {
    this.context = context;

    const allowed = await this.checkRoles(args);

    if (!allowed) {
      throw new PolymeshError({
        code: ErrorCode.NotAuthorized,
        message: 'Current account is not authorized to execute this procedure',
      });
    }

    const returnValue = await this.prepareTransactions(args);
    const totalFees = this.fees.reduce((acc, next) => {
      return acc.plus(next);
    }, new BigNumber(0));

    const transactionQueue = new TransactionQueue(this.transactions, totalFees, returnValue);

    this.cleanup();

    return transactionQueue;
  }

  /**
   * Appends a method (or [[PostTransactionValue]] that resolves to a method) into the TransactionQueue's queue. This defines
   * what will be run by the TransactionQueue when it is started.
   *
   * @param method - a method that will be run in the Procedure's TransactionQueue.
   * A future method is a transaction that doesn't exist at prepare time
   * (for example a transaction on a module that hasn't been attached but will be by the time the previous transactions are run)
   * @param options.tag - a tag for SDK users to identify this transaction, this
   * can be used for doing things such as mapping descriptions to tags in the UI
   * @param options.fee - value in POLY of the transaction (defaults to 0)
   * @param options.resolvers - asynchronous callbacks used to return runtime data after
   * the added transaction has finished successfully
   * @param options.isCritical - whether this transaction failing should make the entire queue fail or not. Defaults to true
   * @param options.signer - address or keyring pair of the account that will sign this transaction. Defaults to the current pair in the context
   * @param args - arguments to be passed to the transaction method
   *
   * @returns an array of [[PostTransactionValue]]. Each element corresponds to whatever is returned by one of the resolver functions passed as options
   */
  public addTransaction<TxArgs extends unknown[], Values extends unknown[] = []>(
    tx: MaybePostTransactionValue<PolymeshTx<TxArgs>>,
    options: {
      tag: TxTag;
      fee?: BigNumber;
      resolvers?: ResolverFunctionArray<Values>;
      isCritical?: boolean;
      signer?: AddressOrPair;
    },
    ...args: MapMaybePostTransactionValue<TxArgs>
  ): PostTransactionValueArray<Values> {
    const {
      tag,
      fee = new BigNumber(0),
      resolvers = ([] as unknown) as ResolverFunctionArray<Values>,
      isCritical = true,
      signer = this.context.currentPair,
    } = options;
    const postTransactionValues = resolvers.map(
      resolver => new PostTransactionValue(resolver)
    ) as PostTransactionValueArray<Values>;

    this.fees.push(fee);

    const transaction = {
      tx,
      args,
      postTransactionValues,
      tag,
      isCritical,
      signer,
    };

    this.transactions.push((transaction as unknown) as TransactionSpec);

    return postTransactionValues;
  }

  public async addProcedure<ProcArgs extends unknown, ReturnValue extends unknown>(
    procedure: Procedure<ProcArgs, ReturnValue>,
    args: ProcArgs
  ): Promise<MaybePostTransactionValue<ReturnValue>>;

  public async addProcedure<ReturnValue extends unknown>(
    procedure: Procedure<void, ReturnValue>
  ): Promise<MaybePostTransactionValue<ReturnValue>>;

  /**
   * Appends a Procedure into this Procedure's queue. This defines
   * what will be run by the Transaction Queue when it is started.
   *
   * @param proc - a Procedure that will be run as part of this Procedure's Transaction Queue
   * @param args - arguments to be passed to the procedure
   *
   * @returns whichever value is returned by the passed Procedure
   */
  public async addProcedure<ProcArgs extends unknown, ReturnValue extends unknown>(
    procedure: Procedure<void | ProcArgs, ReturnValue>,
    args: ProcArgs = {} as ProcArgs
  ): Promise<MaybePostTransactionValue<ReturnValue>> {
    try {
      procedure.context = this.context;
      const returnValue = await procedure.prepareTransactions(args);

      const { transactions, fees } = procedure;
      this.fees = [...this.fees, ...fees];
      this.transactions = [...this.transactions, ...transactions];

      return returnValue;
    } catch (err) {
      throw new PolymeshError({ code: err.code || ErrorCode.FatalError, message: err.message });
    } finally {
      procedure.cleanup();
    }
  }
}
