import BigNumber from 'bignumber.js';

import {
  Asset,
  Context,
  PolymeshError,
  PolymeshTransaction,
  PolymeshTransactionBatch,
  PostTransactionValue,
  TransactionQueue,
} from '~/internal';
import {
  CheckPermissionsResult,
  CheckRolesResult,
  ErrorCode,
  Identity,
  ProcedureAuthorizationStatus,
  ProcedureOpts,
  SignerType,
  TxTag,
} from '~/types';
import {
  MapMaybePostTransactionValue,
  MaybePostTransactionValue,
  PolymeshTx,
  PostTransactionValueArray,
  ProcedureAuthorization,
  ResolverFunctionArray,
} from '~/types/internal';
import { signerToString, transactionToTxTag } from '~/utils/conversion';
import { batchArguments } from '~/utils/internal';

interface AddTransactionOptsBase<Values extends unknown[]> {
  fee?: BigNumber;
  resolvers?: ResolverFunctionArray<Values>;
  isCritical?: boolean;
  paidForBy?: Identity;
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

  private transactions: (PolymeshTransaction<unknown[]> | PolymeshTransactionBatch<unknown[]>)[] =
    [];

  private _storage: null | Storage = null;
  private _context: null | Context = null;

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
   * Set the context and storage (if not already set), return the Context
   */
  private async setup(args: Args, context: Context, opts: ProcedureOpts = {}): Promise<Context> {
    if (!this._context) {
      const ctx = context.clone();
      const { signer } = opts;

      if (signer) {
        ctx.setPair(signerToString(signer));
      }

      this._context = ctx;
    }

    if (!this._storage) {
      this._storage = await this.prepareStorage(args);
    }

    return this._context;
  }

  /**
   * @hidden
   * Reset the procedure
   */
  private cleanup(): void {
    this.transactions = [];
    this._context = null;
    this._storage = null;
  }

  /**
   * @hidden
   */
  private async _checkAuthorization(
    args: Args,
    context: Context,
    opts?: ProcedureOpts
  ): Promise<ProcedureAuthorizationStatus> {
    const ctx = await this.setup(args, context, opts);

    const checkAuthorizationResult = await this.getAuthorization(args);

    const { permissions = true, roles = true } = checkAuthorizationResult;

    const { signerPermissions = permissions, agentPermissions = permissions } =
      checkAuthorizationResult;

    let identity: Identity | null = null;
    let rolesResult: CheckRolesResult;
    let noIdentity = false;

    const account = ctx.getCurrentAccount();

    const fetchIdentity = async (): Promise<Identity | null> => identity || account.getIdentity();

    if (typeof roles === 'boolean') {
      rolesResult = { result: roles };
    } else if (typeof roles === 'string') {
      rolesResult = { result: false, message: roles };
    } else {
      identity = await fetchIdentity();
      noIdentity = !identity;
      rolesResult = { result: false, missingRoles: roles };

      if (identity) {
        rolesResult = await identity.checkRoles(roles);
      }
    }

    let agentPermissionsResult: CheckPermissionsResult<SignerType.Identity>;
    let signerPermissionsAwaitable:
      | CheckPermissionsResult<SignerType.Account>
      | Promise<CheckPermissionsResult<SignerType.Account>>;

    const accountFrozenPromise = account.isFrozen();

    if (typeof signerPermissions === 'boolean') {
      signerPermissionsAwaitable = { result: signerPermissions };
    } else if (typeof signerPermissions === 'string') {
      signerPermissionsAwaitable = { result: false, message: signerPermissions };
    } else {
      signerPermissionsAwaitable = account.checkPermissions(signerPermissions);
    }

    if (typeof agentPermissions === 'boolean') {
      agentPermissionsResult = { result: agentPermissions };
    } else if (typeof agentPermissions === 'string') {
      agentPermissionsResult = { result: false, message: agentPermissions };
    } else {
      const { assets, transactions } = agentPermissions;

      agentPermissionsResult = { result: true };

      if (assets?.length && transactions?.length) {
        assertOnlyOneAsset(assets);

        identity = await fetchIdentity();

        noIdentity = !identity;

        agentPermissionsResult = await getAgentPermissionsResult(identity, assets[0], transactions);
      }
    }

    const hasSignerPermissions = await signerPermissionsAwaitable;

    const accountFrozen = await accountFrozenPromise;

    return {
      roles: rolesResult,
      signerPermissions: hasSignerPermissions,
      agentPermissions: agentPermissionsResult,
      accountFrozen,
      noIdentity,
    };
  }

  /**
   * Check if the current user has sufficient authorization to run the procedure
   *
   * @param args - procedure arguments
   */
  public async checkAuthorization(
    args: Args,
    context: Context,
    opts?: ProcedureOpts
  ): Promise<ProcedureAuthorizationStatus> {
    try {
      return await this._checkAuthorization(args, context, opts);
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
   * @param opts.signer - address that will be used as a signer for this procedure
   *   (it must have already been added to the keyring)
   */
  public async prepare<QueueReturnType>(
    args: {
      args: Args;
      transformer?: (value: ReturnValue) => QueueReturnType | Promise<QueueReturnType>;
    },
    context: Context,
    opts?: ProcedureOpts
  ): Promise<TransactionQueue<ReturnValue, QueueReturnType>> {
    try {
      const { args: procArgs, transformer } = args;
      const ctx = await this.setup(procArgs, context, opts);

      const { roles, signerPermissions, agentPermissions, accountFrozen, noIdentity } =
        await this._checkAuthorization(procArgs, ctx);

      if (noIdentity) {
        throw new PolymeshError({
          code: ErrorCode.NotAuthorized,
          message: 'This procedure requires the Current Account to have an associated Identity',
        });
      }

      if (accountFrozen) {
        throw new PolymeshError({
          code: ErrorCode.NotAuthorized,
          message: "Current Account can't execute this procedure because it is frozen",
        });
      }

      if (!signerPermissions.result) {
        const { message, missingPermissions } = signerPermissions;

        throw new PolymeshError({
          code: ErrorCode.NotAuthorized,
          message:
            "Current Account doesn't have the required permissions to execute this procedure",
          data: {
            message,
            missingPermissions,
          },
        });
      }

      if (!agentPermissions.result) {
        const { message, missingPermissions } = agentPermissions;

        throw new PolymeshError({
          code: ErrorCode.NotAuthorized,
          message:
            "Current Identity doesn't have the required permissions to execute this procedure",
          data: {
            message,
            missingPermissions,
          },
        });
      }

      if (!roles.result) {
        const { message, missingRoles } = roles;

        throw new PolymeshError({
          code: ErrorCode.NotAuthorized,
          message: "Current Identity doesn't have the required roles to execute this procedure",
          data: {
            message,
            missingRoles,
          },
        });
      }

      const procedureResult = await this.prepareTransactions(procArgs);
      return new TransactionQueue(
        { transactions: this.transactions, procedureResult, transformer },
        ctx
      );
    } finally {
      this.cleanup();
    }
  }

  /**
   * Appends a transaction into the TransactionQueue's queue. This defines
   *   what will be run by the TransactionQueue when it is started.
   *
   * @param tx - a transaction that will be run in the Procedure's TransactionQueue
   * @param options.fee - value in POLYX of the transaction (should only be set manually in special cases, otherwise it is fetched automatically from the chain)
   * @param options.resolvers - asynchronous callbacks used to return runtime data after
   *   the added transaction has finished successfully
   * @param options.isCritical - whether this transaction failing should make the entire queue fail or not. Defaults to true
   * @param options.signer - address or keyring pair of the Account that will sign this transaction. Defaults to the current pair in the context
   * @param options.batchSize - amount of elements in the batch (this is only used for certain transactions whose fees depend on the size of the arg list, like `asset.addDocuments`)
   * @param options.paidForBy - third party Identity that will pay for the transaction fees
   * @param args - arguments to be passed to the transaction method
   *
   * @returns an array of [[PostTransactionValue]]. Each element corresponds to whatever is returned by one of the resolver functions passed as options
   */
  public addTransaction<TxArgs extends unknown[], Values extends unknown[] = []>(
    transaction: PolymeshTx<TxArgs>,
    options: AddTransactionOpts<Values>,
    ...args: MapMaybePostTransactionValue<TxArgs>
  ): PostTransactionValueArray<Values> {
    const {
      fee = null,
      resolvers = [] as unknown as ResolverFunctionArray<Values>,
      isCritical = true,
      paidForBy,
      batchSize = null,
    } = options;
    const { context } = this;
    const postTransactionValues = resolvers.map(
      resolver => new PostTransactionValue(resolver)
    ) as PostTransactionValueArray<Values>;

    const signer = context.getSigner();

    const tx = transaction as PolymeshTx<unknown[]>;

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
          paidForBy,
        },
        context
      )
    );

    return postTransactionValues;
  }

  /**
   * Appends a Procedure into this Procedure's queue. This defines
   *   what will be run by the Transaction Queue when it is started.
   *
   * @param proc - a Procedure that will be run as part of this Procedure's Transaction Queue
   * @param args - arguments to be passed to the procedure
   *
   * @returns whichever value is returned by the passed Procedure
   */
  public async addProcedure<ProcArgs extends unknown, R extends unknown, S extends unknown>(
    procedure: Procedure<ProcArgs, R, S>,
    args: ProcArgs
  ): Promise<MaybePostTransactionValue<R>>;

  public async addProcedure<R extends unknown, S extends unknown>(
    procedure: Procedure<void, R, S>
  ): Promise<MaybePostTransactionValue<R>>;

  // eslint-disable-next-line require-jsdoc
  public async addProcedure<ProcArgs extends unknown, R extends unknown, S extends unknown>(
    procedure: Procedure<void | ProcArgs, R, S>,
    args: ProcArgs = {} as ProcArgs
  ): Promise<MaybePostTransactionValue<R>> {
    try {
      procedure._context = this.context;
      const returnValue = await procedure.prepareTransactions(args);

      const { transactions } = procedure;
      this.transactions = [...this.transactions, ...transactions];

      return returnValue;
    } catch (err) {
      throw new PolymeshError({
        code: err.code || ErrorCode.UnexpectedError,
        message: err.message,
      });
    } finally {
      procedure.cleanup();
    }
  }

  /**
   * Appends a batch of transactions into the TransactionQueue's queue. This defines
   *   what will be run by the TransactionQueue when it is started
   *
   * @note if the argument list is too large, they will be separated into multiple batch transactions
   *
   * @param tx - a transaction that will be run in the Procedure's TransactionQueue
   * @param options.fee - value in POLYX of the transaction (should only be set manually in special cases, otherwise it is fetched automatically from the chain)
   * @param options.resolvers - asynchronous callbacks used to return runtime data after
   *   the added transaction has finished successfully
   * @param options.isCritical - whether this transaction failing should make the entire queue fail or not. Defaults to true
   * @param options.signer - address or keyring pair of the Account that will sign this transaction. Defaults to the current pair in the context
   * @param options.paidByThirdParty - if the transaction fees will be paid by a third party. Defaults to false
   * @param options.groupByFn - function that establishes how to group the arguments in case the list is too large and they must be separated internally
   * @param args - arguments to be passed to each method in the batch
   *
   * @returns an array of [[PostTransactionValue]]. Each element corresponds to whatever is returned by one of the resolver functions passed as options.
   *   If the batch is separated into smaller batches, resolvers will be run on the last batch
   */
  public addBatchTransaction<TxArgs extends unknown[], Values extends unknown[] = []>(
    transaction: PolymeshTx<TxArgs>,
    options: AddBatchTransactionOpts<Values, TxArgs>,
    args: MapMaybePostTransactionValue<TxArgs>[]
  ): PostTransactionValueArray<Values> {
    const {
      fee = null,
      resolvers = [] as unknown as ResolverFunctionArray<Values>,
      isCritical = true,
      paidForBy,
      groupByFn,
    } = options;
    const { context } = this;
    const postTransactionValues = resolvers.map(
      resolver => new PostTransactionValue(resolver)
    ) as PostTransactionValueArray<Values>;

    const signer = context.getSigner();

    const tx = transaction as PolymeshTx<unknown[]>;

    const tag = transactionToTxTag(tx);

    const specBase = {
      tx,
      postTransactionValues,
      isCritical,
      signer,
      fee,
      paidForBy,
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

  /**
   * contains the data services, current Account, etc. In short, the *context* in which
   *   the Procedure is being run
   */
  public get context(): Context {
    const { _context: context } = this;

    if (!context) {
      throw new PolymeshError({
        code: ErrorCode.FatalError,
        message: 'Attempt to access context before it was set',
      });
    }

    return context;
  }
}

/**
 * @hidden
 */
function assertOnlyOneAsset(assets: Asset[]) {
  if (assets.length > 1) {
    throw new PolymeshError({
      code: ErrorCode.FatalError,
      message:
        'Procedures cannot require permissions for more than one Asset. Please contact the Polymath team',
    });
  }
}

/**
 * @hidden
 */
async function getAgentPermissionsResult(
  identity: Identity | null,
  asset: Asset,
  transactions: TxTag[] | null
): Promise<CheckPermissionsResult<SignerType.Identity>> {
  return identity
    ? identity.assetPermissions.checkPermissions({
        asset,
        transactions,
      })
    : { result: false, missingPermissions: transactions };
}
