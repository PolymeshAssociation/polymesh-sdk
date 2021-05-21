import { AddressOrPair } from '@polkadot/api/types';
import BigNumber from 'bignumber.js';
import { TxTag } from 'polymesh-types/types';

import {
  Context,
  PolymeshError,
  PolymeshTransaction,
  PolymeshTransactionBatch,
  PostTransactionValue,
  TransactionQueue,
} from '~/internal';
import { ErrorCode, ProcedureAuthorizationStatus } from '~/types';
import {
  MapMaybePostTransactionValue,
  MaybePostTransactionValue,
  PolymeshTx,
  PostTransactionValueArray,
  ProcedureAuthorization,
  ResolverFunctionArray,
} from '~/types/internal';
import { transactionToTxTag } from '~/utils/conversion';
import { batchArguments } from '~/utils/internal';

interface AddTransactionOptsBase<Values extends unknown[]> {
  fee?: BigNumber;
  resolvers?: ResolverFunctionArray<Values>;
  isCritical?: boolean;
  signer?: AddressOrPair;
  paidByThirdParty?: boolean;
}

interface AddBatchTransactionOpts<Values extends unknown[], Args extends unknown[]>
  extends AddTransactionOptsBase<Values> {
  groupByFn?: (obj: MapMaybePostTransactionValue<Args>) => string;
}

interface AddTransactionOpts<Values extends unknown[]> extends AddTransactionOptsBase<Values> {
  batchSize?: number;
}

/**
 * @hidden
 *
 * Represents an operation performed on the Polymesh blockchain.
 * A Procedure can be prepared to yield a [[TransactionQueue]] that can be run
 */
export class Procedure<
  Args extends unknown = void,
  ReturnValue extends unknown = void,
  Storage extends unknown = Record<string, unknown>
> {
  private prepareTransactions: (
    this: Procedure<Args, ReturnValue, Storage>,
    args: Args
  ) => Promise<MaybePostTransactionValue<ReturnValue>>;

  private getAuthorization: (
    this: Procedure<Args, ReturnValue, Storage>,
    args: Args
  ) => Promise<ProcedureAuthorization> | ProcedureAuthorization;

  private prepareStorage: (
    this: Procedure<Args, ReturnValue, Storage>,
    args: Args
  ) => Promise<Storage> | Storage;

  private transactions: (
    | PolymeshTransaction<unknown[]>
    | PolymeshTransactionBatch<unknown[]>
  )[] = [];

  private _storage: null | Storage = null;

  public context = {} as Context;

  /**
   * @hidden
   *
   * @param prepareTransactions - function that prepares the transaction queue
   * @param getAuthorization - can be a ProcedureAuthorization object or a function that returns a ProcedureAuthorization object
   */
  constructor(
    prepareTransactions: (
      this: Procedure<Args, ReturnValue, Storage>,
      args: Args
    ) => Promise<MaybePostTransactionValue<ReturnValue>>,
    getAuthorization:
      | ProcedureAuthorization
      | ((
          this: Procedure<Args, ReturnValue, Storage>,
          args: Args
        ) =>
          | Promise<ProcedureAuthorization>
          | ProcedureAuthorization) = async (): Promise<ProcedureAuthorization> => ({}),
    prepareStorage: (
      this: Procedure<Args, ReturnValue, Storage>,
      args: Args
    ) => Promise<Storage> | Storage = async (): Promise<Storage> => ({} as Storage)
  ) {
    this.prepareTransactions = prepareTransactions;

    if (typeof getAuthorization !== 'function') {
      this.getAuthorization = (): ProcedureAuthorization => getAuthorization;
    } else {
      this.getAuthorization = getAuthorization;
    }

    this.prepareStorage = prepareStorage;
  }

  /**
   * @hidden
   * Set the context and storage (if not already set)
   */
  private async setup(args: Args, context: Context): Promise<void> {
    this.context = context;
    if (!this._storage) {
      this._storage = await this.prepareStorage(args);
    }
  }

  /**
   * @hidden
   * Reset the procedure
   */
  private cleanup(): void {
    this.transactions = [];
    this.context = {} as Context;
    this._storage = null;
  }

  /**
   * @hidden
   */
  private async _checkAuthorization(
    args: Args,
    context: Context
  ): Promise<ProcedureAuthorizationStatus> {
    await this.setup(args, context);

    const checkAuthorizationResult = await this.getAuthorization(args);

    const { signerPermissions = true, identityRoles = true } = checkAuthorizationResult;

    let identityAllowed: boolean;
    if (typeof identityRoles !== 'boolean') {
      const identity = await context.getCurrentIdentity();
      identityAllowed = await identity.hasRoles(identityRoles);
    } else {
      identityAllowed = identityRoles;
    }

    let signerAllowed: boolean;
    if (typeof signerPermissions !== 'boolean') {
      const account = context.getCurrentAccount();
      signerAllowed = await account.hasPermissions(signerPermissions);
    } else {
      signerAllowed = signerPermissions;
    }

    const accountFrozen = await context.getCurrentAccount().isFrozen();

    return {
      roles: identityAllowed,
      permissions: signerAllowed,
      accountFrozen,
    };
  }

  /**
   * Check if the current user has sufficient authorization to run the procedure
   *
   * @param args - procedure arguments
   */
  public async checkAuthorization(
    args: Args,
    context: Context
  ): Promise<ProcedureAuthorizationStatus> {
    try {
      const status = await this._checkAuthorization(args, context);

      return status;
    } finally {
      this.cleanup();
    }
  }

  /**
   * Build a [[TransactionQueue]] that can be run
   *
   * @param args.args - arguments required to prepare the queue
   * @param args.transformer - optional function that transforms the Procedure result
   * @param context - context in which the resulting queue will run
   */
  public async prepare<QueueReturnType>(
    args: {
      args: Args;
      transformer?: (value: ReturnValue) => QueueReturnType | Promise<QueueReturnType>;
    },
    context: Context
  ): Promise<TransactionQueue<ReturnValue, QueueReturnType>> {
    try {
      const { args: procArgs, transformer } = args;

      await this.setup(procArgs, context);

      const { roles, permissions, accountFrozen } = await this._checkAuthorization(
        procArgs,
        context
      );

      if (accountFrozen) {
        throw new PolymeshError({
          code: ErrorCode.NotAuthorized,
          message: "Current Account can't execute this procedure because it is frozen",
        });
      }

      if (!permissions) {
        throw new PolymeshError({
          code: ErrorCode.NotAuthorized,
          message:
            "Current Account doesn't have the required permissions to execute this procedure",
        });
      }

      if (!roles) {
        throw new PolymeshError({
          code: ErrorCode.NotAuthorized,
          message: "Current Identity doesn't have the required roles to execute this procedure",
        });
      }

      const procedureResult = await this.prepareTransactions(procArgs);

      return new TransactionQueue(
        { transactions: this.transactions, procedureResult, transformer },
        context
      );
    } finally {
      this.cleanup();
    }
  }

  /**
   * Appends a transaction (or [[PostTransactionValue]] that resolves to a transaction) into the TransactionQueue's queue. This defines
   *   what will be run by the TransactionQueue when it is started.
   *
   * @param tx - a transaction that will be run in the Procedure's TransactionQueue
   * @param options.fee - value in POLYX of the transaction (should only be set manually if the transaction is a future value or other special cases, otherwise it is fetched automatically from the chain)
   * @param options.resolvers - asynchronous callbacks used to return runtime data after
   *   the added transaction has finished successfully
   * @param options.isCritical - whether this transaction failing should make the entire queue fail or not. Defaults to true
   * @param options.signer - address or keyring pair of the account that will sign this transaction. Defaults to the current pair in the context
   * @param options.batchSize - amount of elements in the batch (this is only used for certain transactions whose fees depend on the size of the arg list, like `asset.addDocuments`)
   * @param options.paidByThirdParty - if the transaction fees will be paid by a third party. Defaults to false
   * @param args - arguments to be passed to the transaction method
   *
   * @returns an array of [[PostTransactionValue]]. Each element corresponds to whatever is returned by one of the resolver functions passed as options
   */
  public addTransaction<TxArgs extends unknown[], Values extends unknown[] = []>(
    tx: PolymeshTx<TxArgs>,
    options: AddTransactionOpts<Values>,
    ...args: MapMaybePostTransactionValue<TxArgs>
  ): PostTransactionValueArray<Values>;

  public addTransaction<TxArgs extends unknown[], Values extends unknown[] = []>(
    tx: PostTransactionValue<PolymeshTx<TxArgs>>,
    options: Omit<AddTransactionOpts<Values>, 'fee'> & {
      fee: BigNumber; // fee MUST be provided by hand if the transaction is a future value
    },
    ...args: MapMaybePostTransactionValue<TxArgs>
  ): PostTransactionValueArray<Values>;

  // eslint-disable-next-line require-jsdoc
  public addTransaction<TxArgs extends unknown[], Values extends unknown[] = []>(
    transaction: MaybePostTransactionValue<PolymeshTx<TxArgs>>,
    options: AddTransactionOpts<Values>,
    ...args: MapMaybePostTransactionValue<TxArgs>
  ): PostTransactionValueArray<Values> {
    const {
      fee = null,
      resolvers = ([] as unknown) as ResolverFunctionArray<Values>,
      isCritical = true,
      paidByThirdParty = false,
      batchSize = null,
    } = options;
    const { context } = this;
    let { signer } = options;
    const postTransactionValues = resolvers.map(
      resolver => new PostTransactionValue(resolver)
    ) as PostTransactionValueArray<Values>;

    if (!signer) {
      signer = context.getSigner();
    }

    const tx = transaction as MaybePostTransactionValue<PolymeshTx<unknown[]>>;

    this.transactions.push(
      new PolymeshTransaction<unknown[]>(
        {
          tx,
          args,
          postTransactionValues,
          isCritical,
          signer,
          fee,
          batchSize,
          paidByThirdParty,
        },
        context
      )
    );

    return postTransactionValues;
  }

  /**
   * Appends a Procedure into this Procedure's queue. This defines
   * what will be run by the Transaction Queue when it is started.
   *
   * @param proc - a Procedure that will be run as part of this Procedure's Transaction Queue
   * @param args - arguments to be passed to the procedure
   *
   * @returns whichever value is returned by the passed Procedure
   */
  public async addProcedure<ProcArgs extends unknown, R extends unknown>(
    procedure: Procedure<ProcArgs, R>,
    args: ProcArgs
  ): Promise<MaybePostTransactionValue<R>>;

  public async addProcedure<R extends unknown>(
    procedure: Procedure<void, R>
  ): Promise<MaybePostTransactionValue<R>>;

  // eslint-disable-next-line require-jsdoc
  public async addProcedure<ProcArgs extends unknown, R extends unknown>(
    procedure: Procedure<void | ProcArgs, R>,
    args: ProcArgs = {} as ProcArgs
  ): Promise<MaybePostTransactionValue<R>> {
    try {
      procedure.context = this.context;
      const returnValue = await procedure.prepareTransactions(args);

      const { transactions } = procedure;
      this.transactions = [...this.transactions, ...transactions];

      return returnValue;
    } catch (err) {
      throw new PolymeshError({ code: err.code || ErrorCode.FatalError, message: err.message });
    } finally {
      procedure.cleanup();
    }
  }

  /**
   * Appends a batch (or multiple batches) of transactions (or [[PostTransactionValue]]s that resolve to transactions) into the TransactionQueue's queue. This defines
   *   what will be run by the TransactionQueue when it is started.
   *
   * @param tx - a transaction that will be run in the Procedure's TransactionQueue
   * @param options.fee - value in POLYX of the transaction (should only be set manually if the transaction is a future value or other special cases, otherwise it is fetched automatically from the chain)
   * @param options.resolvers - asynchronous callbacks used to return runtime data after
   *   the added transaction has finished successfully
   * @param options.isCritical - whether this transaction failing should make the entire queue fail or not. Defaults to true
   * @param options.signer - address or keyring pair of the account that will sign this transaction. Defaults to the current pair in the context
   * @param options.paidByThirdParty - if the transaction fees will be paid by a third party. Defaults to false
   * @param options.groupByFn - function that establishes how to group the arguments in case the list is too large and they must be separated internally
   * @param args - arguments to be passed to each method in the batch
   *
   * @returns an array of [[PostTransactionValue]]. Each element corresponds to whatever is returned by one of the resolver functions passed as options.
   *   Resolvers will be run on the last internal batch of the transactions.
   */
  public addBatchTransaction<TxArgs extends unknown[], Values extends unknown[] = []>(
    tx: PolymeshTx<TxArgs>,
    options: AddBatchTransactionOpts<Values, TxArgs>,
    args: MapMaybePostTransactionValue<TxArgs>[]
  ): PostTransactionValueArray<Values>;

  public addBatchTransaction<TxArgs extends unknown[], Values extends unknown[] = []>(
    tx: PostTransactionValue<PolymeshTx<TxArgs>>,
    options: Omit<AddBatchTransactionOpts<Values, TxArgs>, 'fee'> & {
      fee: BigNumber; // fee MUST be provided by hand if the transaction is a future value
    },
    args: MapMaybePostTransactionValue<TxArgs>[]
  ): PostTransactionValueArray<Values>;

  // eslint-disable-next-line require-jsdoc
  public addBatchTransaction<TxArgs extends unknown[], Values extends unknown[] = []>(
    transaction: MaybePostTransactionValue<PolymeshTx<TxArgs>>,
    options: AddBatchTransactionOpts<Values, TxArgs>,
    args: MapMaybePostTransactionValue<TxArgs>[]
  ): PostTransactionValueArray<Values> {
    const {
      fee = null,
      resolvers = ([] as unknown) as ResolverFunctionArray<Values>,
      isCritical = true,
      paidByThirdParty = false,
      groupByFn,
    } = options;
    const { context } = this;
    let { signer } = options;
    const postTransactionValues = resolvers.map(
      resolver => new PostTransactionValue(resolver)
    ) as PostTransactionValueArray<Values>;

    if (!signer) {
      signer = context.getSigner();
    }

    const tx = transaction as MaybePostTransactionValue<PolymeshTx<unknown[]>>;

    let tag: TxTag | null;

    if (tx instanceof PostTransactionValue) {
      tag = null;
    } else {
      tag = transactionToTxTag(tx);
    }

    const specBase = {
      tx,
      postTransactionValues,
      isCritical,
      signer,
      fee,
      paidByThirdParty,
    } as const;

    const batches = batchArguments(args, tag, groupByFn);

    batches.forEach((argumentBatch, index) => {
      let spec = { ...specBase };

      if (index === batches.length - 1) {
        spec = { ...spec, postTransactionValues };
      }

      if (argumentBatch.length === 1) {
        // single transaction
        this.transactions.push(
          new PolymeshTransaction<unknown[]>(
            { ...spec, args: argumentBatch[0], batchSize: null },
            context
          )
        );

        return;
      }

      this.transactions.push(
        new PolymeshTransactionBatch<unknown[]>({ ...spec, args: argumentBatch }, context)
      );
    });

    return postTransactionValues;
  }

  /**
   * internal data container. Used to store common fetched/processed data that is
   *   used by both `prepareTransactions` and `checkAuthorization`
   */
  public get storage(): Storage {
    const { _storage: storage } = this;

    if (!storage) {
      throw new PolymeshError({
        code: ErrorCode.FatalError,
        message: 'Attempt to access storage before it was set',
      });
    }

    return storage;
  }
}
