import {
  BaseAsset,
  Context,
  PolymeshError,
  PolymeshTransaction,
  PolymeshTransactionBatch,
} from '~/internal';
import {
  CheckPermissionsResult,
  CheckRolesResult,
  ErrorCode,
  GenericPolymeshTransaction,
  Identity,
  MultiSig,
  ProcedureAuthorizationStatus,
  ProcedureOpts,
  SignerType,
  TxTag,
} from '~/types';
import {
  BaseTransactionSpec,
  GenericTransactionSpec,
  ProcedureAuthorization,
} from '~/types/internal';
import { signerToString } from '~/utils/conversion';
import { asAccount, defusePromise } from '~/utils/internal';

/**
 * @hidden
 */
function assertOnlyOneAsset(assets: BaseAsset[]): void {
  if (assets.length > 1) {
    throw new PolymeshError({
      code: ErrorCode.FatalError,
      message:
        'Procedures cannot require permissions for more than one Asset. Please contact the Polymesh team',
    });
  }
}

/**
 * @hidden
 */
async function getAgentPermissionsResult(
  identity: Identity | null,
  asset: BaseAsset,
  transactions: TxTag[] | null
): Promise<CheckPermissionsResult<SignerType.Identity>> {
  return identity
    ? identity.assetPermissions.checkPermissions({
        asset,
        transactions,
      })
    : { result: false, missingPermissions: transactions };
}

/**
 * @hidden
 *
 * Represents an operation performed on the Polymesh blockchain.
 * A Procedure can be prepared to return a promise that resolves
 * to a {@link PolymeshTransaction} (or {@link PolymeshTransactionBatch}) that can be run
 */
export class Procedure<Args = void, ReturnValue = void, Storage = Record<string, unknown>> {
  private readonly prepareTransactions: (
    this: Procedure<Args, ReturnValue, Storage>,
    args: Args
  ) => Promise<GenericTransactionSpec<ReturnValue>>;

  private readonly getAuthorization: (
    this: Procedure<Args, ReturnValue, Storage>,
    args: Args
  ) => Promise<ProcedureAuthorization> | ProcedureAuthorization;

  private readonly prepareStorage: (
    this: Procedure<Args, ReturnValue, Storage>,
    args: Args
  ) => Promise<Storage> | Storage;

  private _storage: null | Storage = null;
  private _context: null | Context = null;
  private _signerMultiSig: null | MultiSig = null;

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
    ) => Promise<BaseTransactionSpec<ReturnValue>>,
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
    this.prepareTransactions = prepareTransactions as typeof this.prepareTransactions;

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
      const { signingAccount, nonce } = opts;

      if (typeof nonce === 'function') {
        ctx.setNonce(await nonce());
      } else {
        ctx.setNonce(await nonce);
      }

      let multiSig;
      if (signingAccount) {
        const account = asAccount(signingAccount, context);

        [multiSig] = await Promise.all([
          account.getMultiSig(),
          ctx.setSigningAddress(signerToString(signingAccount)),
        ]);
      } else {
        multiSig = await ctx.getSigningAccount().getMultiSig();
      }

      this._signerMultiSig = multiSig ?? null;
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

    const account = this._signerMultiSig || ctx.getSigningAccount();

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
   * Build a {@link PolymeshTransaction} or {@link PolymeshTransactionBatch} that can be run
   *
   * @param args.args - arguments required to prepare the queue
   * @param args.transformer - optional function that transforms the Procedure result
   * @param context - context in which the resulting queue will run
   * @param opts.signer - address that will be used as a signer for this procedure
   */
  public async prepare<TransformedReturnValue>(
    args: {
      args: Args;
      transformer?: (
        value: ReturnValue
      ) => TransformedReturnValue | Promise<TransformedReturnValue>;
    },
    context: Context,
    opts?: ProcedureOpts
  ): Promise<GenericPolymeshTransaction<ReturnValue, TransformedReturnValue>> {
    try {
      const { args: procArgs, transformer } = args;

      const mortality = opts?.mortality || {
        immortal: false,
      };

      const ctx = await this.setup(procArgs, context, opts);

      // parallelize the async calls
      const prepareTransactionsPromise = defusePromise(this.prepareTransactions(procArgs));
      const { roles, signerPermissions, agentPermissions, accountFrozen, noIdentity } =
        await this._checkAuthorization(procArgs, ctx);

      if (noIdentity) {
        throw new PolymeshError({
          code: ErrorCode.NotAuthorized,
          message: 'This procedure requires the signing Account to have an associated Identity',
        });
      }

      if (accountFrozen) {
        throw new PolymeshError({
          code: ErrorCode.NotAuthorized,
          message: "The signing Account can't execute this procedure because it is frozen",
        });
      }

      if (!signerPermissions.result) {
        const { message, missingPermissions } = signerPermissions;

        throw new PolymeshError({
          code: ErrorCode.NotAuthorized,
          message:
            "The signing Account doesn't have the required permissions to execute this procedure",
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
            "The signing Identity doesn't have the required permissions to execute this procedure",
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
          message: "The signing Identity doesn't have the required roles to execute this procedure",
          data: {
            message,
            missingRoles,
          },
        });
      }

      const procedureResult = await prepareTransactionsPromise;

      const signingAddress = ctx.getSigningAddress();
      const signer = ctx.getExternalSigner();

      const spec = {
        ...procedureResult,
        signer,
        signingAddress,
        mortality,
        transformer,
        multiSig: this._signerMultiSig ?? undefined,
      };

      if (!('transactions' in spec)) {
        return new PolymeshTransaction<ReturnValue, TransformedReturnValue>(spec, ctx);
      } else if (spec.transactions.length === 1) {
        const [{ transaction, args: txArgs, fee, feeMultiplier }] = spec.transactions;
        return new PolymeshTransaction<ReturnValue, TransformedReturnValue>(
          {
            ...spec,
            transaction,
            fee,
            feeMultiplier,
            args: txArgs,
          },
          ctx
        );
      } else {
        return new PolymeshTransactionBatch<ReturnValue, TransformedReturnValue>(spec, ctx);
      }
    } finally {
      this.cleanup();
    }
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
   * contains the data services, signing Account, etc. In short, the *context* in which
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
