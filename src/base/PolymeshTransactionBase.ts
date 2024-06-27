import { SubmittableExtrinsic } from '@polkadot/api/types';
import { ISubmittableResult, Signer as PolkadotSigner } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';
import P from 'bluebird';
import { EventEmitter } from 'events';
import { range } from 'lodash';

import {
  handleExtrinsicFailure,
  handleTransactionSubmissionError,
  pollForTransactionFinalization,
} from '~/base/utils';
import { Context, Identity, MultiSigProposal, PolymeshError } from '~/internal';
import { latestBlockQuery } from '~/middleware/queries';
import { Query } from '~/middleware/types';
import {
  ErrorCode,
  GenericPolymeshTransaction,
  MortalityProcedureOpt,
  MultiSig,
  MultiSigProcedureOpt,
  PayingAccount,
  PayingAccountFees,
  PayingAccountType,
  TransactionPayload,
  TransactionStatus,
  UnsubCallback,
} from '~/types';
import {
  BaseTransactionSpec,
  isResolverFunction,
  MaybeResolverFunction,
  TransactionConstructionData,
} from '~/types/internal';
import { Ensured } from '~/types/utils';
import { DEFAULT_LIFETIME_PERIOD } from '~/utils/constants';
import {
  balanceToBigNumber,
  dateToMoment,
  hashToString,
  stringToAccountId,
  u32ToBigNumber,
  u64ToBigNumber,
} from '~/utils/conversion';
import { defusePromise, delay, filterEventRecords, optionize } from '~/utils/internal';

/**
 * @hidden
 */
enum Event {
  StatusChange = 'StatusChange',
  ProcessedByMiddleware = 'ProcessedByMiddleware',
}

/**
 * Wrapper class for a Polymesh Transaction
 */
export abstract class PolymeshTransactionBase<
  ReturnValue = void,
  TransformedReturnValue = ReturnValue
> {
  /**
   * @hidden
   */
  public static toTransactionSpec<R, T>(
    transaction: PolymeshTransactionBase<R, T>
  ): BaseTransactionSpec<R, T> {
    const { resolver, transformer, paidForBy, multiSig } = transaction;

    return {
      resolver,
      transformer,
      paidForBy,
      multiSig: multiSig ?? undefined,
    };
  }

  /**
   * current status of the transaction
   */
  public status: TransactionStatus = TransactionStatus.Idle;

  /**
   * stores errors thrown while running the transaction (status: `Failed`, `Aborted`)
   */
  public error?: PolymeshError;

  /**
   * stores the transaction receipt (if successful)
   */
  public receipt?: ISubmittableResult;

  /**
   * transaction hash (status: `Running`, `Succeeded`, `Failed`)
   */
  public txHash?: string;

  /**
   * transaction index within its block (status: `Succeeded`, `Failed`)
   */
  public txIndex?: BigNumber;

  /**
   * hash of the block where this transaction resides (status: `Succeeded`, `Failed`)
   */
  public blockHash?: string;

  /**
   * number of the block where this transaction resides (status: `Succeeded`, `Failed`)
   */
  public blockNumber?: BigNumber;

  /**
   * @hidden
   *
   * This will be set if the signingAddress is a MultiSig signer
   */
  public multiSig: null | MultiSig;

  /**
   * @hidden
   *
   * Identity that will pay for this transaction's fees. This value overrides any subsidy,
   *   and is seen as having infinite allowance (but still constrained by its current balance)
   */
  protected paidForBy?: Identity;

  /**
   * @hidden
   *
   * function that transforms the transaction's return value before returning it after it is run
   */
  protected resolver: MaybeResolverFunction<ReturnValue>;

  /**
   * @hidden
   *
   * internal event emitter to handle status changes
   */
  protected emitter = new EventEmitter();

  /**
   * @hidden
   *
   * Account that will sign the transaction
   */
  protected signingAddress: string;

  /**
   * @hidden
   *
   * Mortality of the transactions
   */
  protected mortality: MortalityProcedureOpt;

  /**
   * @hidden
   *
   * MultiSig proposal options
   */
  protected multiSigOpts: MultiSigProcedureOpt;

  /**
   * @hidden
   *
   * object that performs the payload signing logic
   */
  protected signer?: PolkadotSigner;

  /**
   * @hidden
   *
   * function that transforms the return value to another type. Useful when using the same
   *   Procedure for different endpoints which are supposed to return different values
   */
  protected transformer?: (
    result: ReturnValue
  ) => Promise<TransformedReturnValue> | TransformedReturnValue;

  protected context: Context;

  /**
   * @hidden
   * whether the queue has run or not (prevents re-running)
   */
  private hasRun = false;

  /**
   * @hidden
   * the result that was returned from this transaction after being successfully ran
   */
  private _result: TransformedReturnValue | undefined;

  /**
   * @hidden
   */
  constructor(
    transactionSpec: BaseTransactionSpec<ReturnValue, TransformedReturnValue> &
      TransactionConstructionData,
    context: Context
  ) {
    const {
      resolver,
      transformer,
      signingAddress,
      signer,
      paidForBy,
      mortality,
      multiSig,
      multiSigOpts,
    } = transactionSpec;

    this.signingAddress = signingAddress;
    this.multiSig = multiSig ?? null;
    this.mortality = mortality;
    this.multiSigOpts = multiSigOpts ?? {};
    this.signer = signer;
    this.context = context;
    this.paidForBy = paidForBy;
    this.transformer = transformer;
    this.resolver = resolver;
  }

  /**
   * Run the transaction as a multiSig proposal
   */
  public async runAsProposal(): Promise<MultiSigProposal> {
    if (this.hasRun) {
      throw new PolymeshError({
        code: ErrorCode.General,
        message: 'Cannot re-run a Transaction',
      });
    }

    if (!this.multiSig) {
      throw new PolymeshError({
        code: ErrorCode.ValidationError,
        message:
          '`.run` should be used instead. Either the signing account is not a MultiSig signer, or the transaction is to approve or reject a MultiSig proposal',
        data: { signingAddress: this.signingAddress },
      });
    }

    try {
      await this.assertFeesCovered();

      const receipt = await this.internalRun();
      this.receipt = receipt;
    } catch (err) {
      this.handleRunError(err);
    } finally {
      this.markAsRan();
    }

    const [proposalAddedEvent] = filterEventRecords(this.receipt, 'multiSig', 'ProposalAdded');
    const id = u64ToBigNumber(proposalAddedEvent.data[2]);

    this.updateStatus(TransactionStatus.Succeeded);

    return new MultiSigProposal({ multiSigAddress: this.multiSig.address, id }, this.context);
  }

  /**
   * Run the transaction, update its status and return a result if applicable.
   *   Certain transactions create Entities on the blockchain, and those Entities are returned
   *   for convenience. For example, when running a transaction that creates an Asset, the Asset itself
   *   is returned
   */
  public async run(): Promise<TransformedReturnValue> {
    if (this.hasRun) {
      throw new PolymeshError({
        code: ErrorCode.General,
        message: 'Cannot re-run a Transaction',
      });
    }

    if (this.multiSig) {
      throw new PolymeshError({
        code: ErrorCode.ValidationError,
        message:
          '`.run` cannot be used with a MultiSig signer. `.runAsProposal` should be called instead',
        data: { signingAddress: this.signingAddress, multiSigAddress: this.multiSig.address },
      });
    }

    try {
      await this.assertFeesCovered();

      const receipt = await this.internalRun();
      this.receipt = receipt;

      const {
        resolver,
        transformer = async (val): Promise<TransformedReturnValue> =>
          val as unknown as TransformedReturnValue,
      } = this;

      let value: ReturnValue;

      if (isResolverFunction(resolver)) {
        value = await resolver(receipt);
      } else {
        value = resolver;
      }

      this._result = await transformer(value);
      this.updateStatus(TransactionStatus.Succeeded);

      return this._result;
    } catch (err) {
      this.handleRunError(err);
    } finally {
      this.markAsRan();
    }
  }

  /**
   * @hidden
   */
  private handleRunError(err: PolymeshError): never {
    const error: PolymeshError = err;

    this.error = err;

    switch (error.code) {
      case ErrorCode.TransactionAborted: {
        this.updateStatus(TransactionStatus.Aborted);
        break;
      }
      case ErrorCode.TransactionRejectedByUser: {
        this.updateStatus(TransactionStatus.Rejected);
        break;
      }
      case ErrorCode.TransactionReverted:
      case ErrorCode.FatalError:
      default: {
        this.updateStatus(TransactionStatus.Failed);
        break;
      }
    }

    throw error;
  }

  /**
   * @hidden
   */
  private markAsRan(): void {
    this.hasRun = true;

    /*
     * We do not await this promise because it is supposed to run in the background, and
     * any errors encountered are emitted. If the user isn't listening, they shouldn't
     * care about middleware (or other) errors anyway
     */
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.emitWhenMiddlewareIsSynced();
  }

  /**
   * @hidden
   *
   * Execute the underlying transaction, updating the status where applicable and
   *   throwing any pertinent errors
   */
  private async internalRun(): Promise<ISubmittableResult> {
    const { signingAddress, signer, mortality, context } = this;

    await context.assertHasSigningAddress(signingAddress);

    // era is how many blocks the transaction remains valid for, `undefined` for default
    const era = mortality.immortal ? 0 : mortality.lifetime?.toNumber();
    const nonce = context.getNonce().toNumber();

    this.updateStatus(TransactionStatus.Unapproved);
    const txWithArgs = this.composeTx();

    if (context.supportsSubscription()) {
      return new Promise((resolve, reject) => {
        let settingBlockData = Promise.resolve();
        const gettingUnsub = txWithArgs.signAndSend(
          signingAddress,
          { nonce, signer, era },
          receipt => {
            const { status } = receipt;
            let isLastCallback = false;
            let unsubscribing = Promise.resolve();
            let extrinsicFailedEvent;

            // isCompleted implies status is one of: isFinalized, isInBlock or isError
            if (receipt.isCompleted) {
              if (receipt.isInBlock) {
                const inBlockHash = status.asInBlock;

                /*
                 * this must be done to ensure that the block hash and number are set before the success event
                 *   is emitted, and at the same time. We do not resolve or reject the containing promise until this
                 *   one resolves
                 */
                settingBlockData = defusePromise(
                  this.context.polymeshApi.rpc.chain.getBlock(inBlockHash).then(({ block }) => {
                    this.blockHash = hashToString(inBlockHash);
                    this.blockNumber = u32ToBigNumber(block.header.number.unwrap());

                    // we know that the index has to be set by the time the transaction is included in a block
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    this.txIndex = new BigNumber(receipt.txIndex!);
                  })
                );

                // if the extrinsic failed due to an on-chain error, we should handle it in a special way
                [extrinsicFailedEvent] = filterEventRecords(
                  receipt,
                  'system',
                  'ExtrinsicFailed',
                  true
                );

                // extrinsic failed so we can unsubscribe
                isLastCallback = !!extrinsicFailedEvent;
              } else {
                // isFinalized || isError so we know we can unsubscribe
                isLastCallback = true;
              }

              if (isLastCallback) {
                unsubscribing = gettingUnsub.then(unsub => {
                  unsub();
                });
              }

              /*
               * Promise chain that handles all sub-promises in this pass through the signAndSend callback.
               * Primarily for consistent error handling
               */
              let finishing = Promise.resolve();

              if (extrinsicFailedEvent) {
                const { data } = extrinsicFailedEvent;

                finishing = Promise.all([settingBlockData, unsubscribing]).then(() => {
                  const error = handleExtrinsicFailure(data[0]);
                  reject(error);
                });
              } else if (receipt.isFinalized) {
                finishing = Promise.all([settingBlockData, unsubscribing]).then(() => {
                  this.handleExtrinsicSuccess(resolve, reject, receipt);
                });
              } else if (receipt.isError) {
                reject(new PolymeshError({ code: ErrorCode.TransactionAborted }));
              }

              finishing.catch((err: Error) => reject(err));
            }
          }
        );

        gettingUnsub
          .then(() => {
            // tx approved by signer
            this.setIsRunningStatus(txWithArgs.hash.toString());
          })
          .catch((err: Error) => {
            const error = handleTransactionSubmissionError(err);
            reject(new PolymeshError(error));
          });
      });
    } else {
      const startingBlock = await context.getLatestBlock();

      await txWithArgs
        .signAndSend(signingAddress, { nonce, signer, era })
        .then(() => {
          this.setIsRunningStatus(txWithArgs.hash.toString());
        })
        .catch((err: Error) => {
          const error = handleTransactionSubmissionError(err);

          throw new PolymeshError(error);
        });

      const finalizedReceipt = await pollForTransactionFinalization(
        txWithArgs.hash,
        startingBlock,
        context
      );

      this.blockHash = hashToString(finalizedReceipt.status.asFinalized);
      this.blockNumber = u32ToBigNumber(finalizedReceipt.blockNumber!);
      this.txIndex = new BigNumber(finalizedReceipt.txIndex!);

      // if the extrinsic failed due to an on-chain error, we should handle it in a special way
      const [extrinsicFailedEvent] = filterEventRecords(
        finalizedReceipt,
        'system',
        'ExtrinsicFailed',
        true
      );

      if (extrinsicFailedEvent) {
        const { data } = extrinsicFailedEvent;
        const error = handleExtrinsicFailure(data[0]);

        throw error;
      }

      return finalizedReceipt;
    }
  }

  /**
   * Subscribe to status changes
   *
   * @param listener - callback function that will be called whenever the status changes
   *
   * @returns unsubscribe function
   */
  public onStatusChange(
    listener: (transaction: GenericPolymeshTransaction<ReturnValue, TransformedReturnValue>) => void
  ): UnsubCallback {
    const { emitter } = this;

    emitter.on(Event.StatusChange, listener);

    return (): void => {
      emitter.removeListener(Event.StatusChange, listener);
    };
  }

  /**
   * Retrieve a breakdown of the fees required to run this transaction, as well as the Account responsible for paying them
   *
   * @note these values might be inaccurate if the transaction is run at a later time. This can be due to a governance vote or other
   *   chain related factors (like modifications to a specific subsidizer relationship or a chain upgrade)
   */
  public async getTotalFees(): Promise<PayingAccountFees> {
    const { signingAddress } = this;

    const composedTx = this.composeTx();

    const paymentInfoPromise = composedTx.paymentInfo(signingAddress);

    const protocol = await this.getProtocolFees();

    const [payingAccount, { partialFee }] = await Promise.all([
      this.getPayingAccount(),
      paymentInfoPromise,
    ]);

    const { free: balance } = await payingAccount.account.getBalance();
    const gas = balanceToBigNumber(partialFee);

    return {
      fees: {
        protocol,
        gas,
        total: protocol.plus(gas),
      },
      payingAccountData: {
        ...payingAccount,
        balance,
      },
    };
  }

  /**
   * Subscribe to the results of this transaction being processed by the indexing service (and as such, available to the middleware)
   *
   * @param listener - callback function that will be called whenever the middleware is updated with the latest data.
   *   If there is an error (timeout or middleware offline) it will be passed to this callback
   *
   * @note this event will be fired even if the queue fails
   * @returns unsubscribe function
   * @throws if the middleware wasn't enabled when instantiating the SDK client
   */
  public onProcessedByMiddleware(listener: (err?: PolymeshError) => void): UnsubCallback {
    const { context, emitter } = this;

    if (!context.isMiddlewareEnabled()) {
      throw new PolymeshError({
        code: ErrorCode.General,
        message: 'Cannot subscribe without an enabled middleware connection',
      });
    }

    emitter.on(Event.ProcessedByMiddleware, listener);

    return (): void => {
      emitter.removeListener(Event.ProcessedByMiddleware, listener);
    };
  }

  /**
   * @hidden
   */
  private setIsRunningStatus(txHash: string): void {
    this.txHash = txHash;
    this.updateStatus(TransactionStatus.Running);
  }

  /**
   * Get the latest processed block from the database
   *
   * @note uses the middleware
   */
  private async getLatestBlockFromMiddleware(): Promise<BigNumber> {
    const { context } = this;

    const {
      data: {
        blocks: {
          nodes: [{ blockId: processedBlock }],
        },
      },
    } = await context.queryMiddleware<Ensured<Query, 'blocks'>>(latestBlockQuery());

    return new BigNumber(processedBlock);
  }

  /**
   * Poll the middleware every 2 seconds to see if it has already processed the
   *   block that reflects the changes brought on by this transaction being run. If so,
   *   emit the corresponding event. After 5 retries (or if the middleware can't be reached),
   *   the event is emitted with an error
   *
   * @note uses the middleware
   */
  private async emitWhenMiddlewareIsSynced(): Promise<void> {
    const { context, emitter } = this;

    try {
      if (!context.isMiddlewareEnabled()) {
        return;
      }

      const blockNumber = await context.getLatestBlock();

      let done = false;

      await P.each(range(6), async i => {
        if (done) {
          return;
        }

        try {
          const processedBlock = await this.getLatestBlockFromMiddleware();
          if (blockNumber.lte(processedBlock)) {
            done = true;
            emitter.emit(Event.ProcessedByMiddleware);
            return;
          }
        } catch (err) {
          /*
           * query errors are swallowed because we wish to query again if we haven't reached the
           * maximum amount of retries
           */
        }

        if (i === 5) {
          emitter.emit(
            Event.ProcessedByMiddleware,
            new PolymeshError({
              code: ErrorCode.MiddlewareError,
              message: `Middleware has not synced after ${i} attempts`,
            })
          );
        }

        return delay(2000);
      });
    } catch (err) {
      /* istanbul ignore next: extreme edge case */
      emitter.emit(
        Event.ProcessedByMiddleware,
        new PolymeshError({
          code: ErrorCode.UnexpectedError,
          message: err.message || 'Unexpected error',
        })
      );
    }
  }

  /**
   * @hidden
   */
  protected updateStatus(status: TransactionStatus): void {
    const { emitter } = this;
    this.status = status;

    /* eslint-disable default-case */
    switch (status) {
      case TransactionStatus.Unapproved:
      case TransactionStatus.Running:
      case TransactionStatus.Succeeded: {
        emitter.emit(Event.StatusChange, this);
        return;
      }
      case TransactionStatus.Rejected:
      case TransactionStatus.Aborted:
      case TransactionStatus.Failed: {
        emitter.emit(Event.StatusChange, this, this.error);
      }
    }
    /* eslint-enable default-case */
  }

  /**
   * Return whether the transaction can be subsidized. If the result is false
   *   AND the caller is being subsidized by a third party, the transaction can't be executed and trying
   *   to do so will result in an error
   *
   * @note this depends on the type of transaction itself (e.g. `staking.bond` can't be subsidized, but `asset.createAsset` can)
   */
  public abstract supportsSubsidy(): boolean;

  /**
   * @hidden
   *
   * Compose a Transaction Object with arguments that can be signed
   */
  protected abstract composeTx(): SubmittableExtrinsic<'promise', ISubmittableResult>;

  /* istanbul ignore next: there is no way of reaching this path currently */
  /**
   * @hidden
   *
   * Return whether the transaction ignores any existing subsidizer relationships
   *   and is always paid by the caller
   */
  protected ignoresSubsidy(): boolean {
    /*
     * since we don't know anything about the transaction, a safe default is
     *   to assume it doesn't ignore subsidies
     */
    return false;
  }

  /**
   * Return this transaction's protocol fees. These are extra fees charged for
   *   specific operations on the chain. Not to be confused with network fees (which
   *   depend on the complexity of the operation), protocol fees are set by governance and/or
   *   chain upgrades
   */
  public abstract getProtocolFees(): Promise<BigNumber>;

  /**
   * @hidden
   */
  protected handleExtrinsicSuccess(
    resolve: (value: ISubmittableResult | PromiseLike<ISubmittableResult>) => void,
    _reject: (reason?: unknown) => void,
    receipt: ISubmittableResult
  ): void {
    resolve(receipt);
  }

  /**
   * @hidden
   *
   * Check if balances and allowances (both third party and signing Account)
   *   are sufficient to cover this transaction's fees
   */
  private async assertFeesCovered(): Promise<void> {
    const {
      fees: { total },
      payingAccountData,
    } = await this.getTotalFees();

    const { type, balance } = payingAccountData;

    if (type === PayingAccountType.Subsidy) {
      const { allowance } = payingAccountData;
      if (!this.supportsSubsidy()) {
        throw new PolymeshError({
          code: ErrorCode.UnmetPrerequisite,
          message: 'This transaction cannot be run by a subsidized Account',
        });
      }

      if (allowance.lt(total)) {
        throw new PolymeshError({
          code: ErrorCode.UnmetPrerequisite,
          message: "Insufficient subsidy allowance to pay this transaction's fees",
          data: {
            allowance,
            fees: total,
          },
        });
      }
    }

    const accountDescriptions = {
      [PayingAccountType.Caller]: 'caller',
      [PayingAccountType.Other]: 'paying third party',
      [PayingAccountType.Subsidy]: 'subsidizer',
      [PayingAccountType.MultiSigCreator]: "MultiSig creator's primary",
    };

    if (balance.lt(total)) {
      throw new PolymeshError({
        code: ErrorCode.InsufficientBalance,
        message: `The ${accountDescriptions[type]} Account does not have enough POLYX balance to pay this transaction's fees`,
        data: {
          balance: balance.toString(),
          fees: total.toString(),
          address: payingAccountData.account.address,
        },
      });
    }
  }

  /**
   * returns the transaction result - this is the same value as the Promise run returns
   * @note it is generally preferable to `await` the `Promise` returned by { @link base/PolymeshTransactionBase!PolymeshTransactionBase.run | transaction.run() } instead of reading this property
   *
   * @throws if the { @link base/PolymeshTransactionBase!PolymeshTransactionBase.isSuccess | transaction.isSuccess } property is false — be sure to check that before accessing!
   */
  get result(): TransformedReturnValue {
    if (this.isSuccess && !this.multiSig) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return this._result!;
    } else {
      throw new PolymeshError({
        code: ErrorCode.General,
        message:
          'The result of the transaction was checked before it has been completed. property `result` should only be read if transaction `isSuccess` property is true',
      });
    }
  }

  /**
   * Returns a representation intended for offline signers.
   *
   * @note Usually `.run()` should be preferred due to is simplicity.
   *
   * @note When using this method, details like account nonces, and transaction mortality require extra consideration. Generating a payload for offline sign implies asynchronicity. If using this API, be sure each procedure is created with the correct nonce, accounting for in flight transactions, and the lifetime is sufficient.
   *
   */
  public async toSignablePayload(
    metadata: Record<string, string> = {}
  ): Promise<TransactionPayload> {
    const {
      mortality,
      signingAddress,
      context,
      context: { polymeshApi },
    } = this;
    const tx = this.composeTx();

    const [tipHash, latestBlockNumber] = await Promise.all([
      polymeshApi.rpc.chain.getFinalizedHead(),
      context.getLatestBlock(),
    ]);

    let nonce: number = context.getNonce().toNumber();
    if (nonce < 0) {
      const nextIndex = await polymeshApi.call.accountNonceApi.accountNonce(signingAddress);
      nonce = nextIndex.toNumber();
    }

    let era;
    let blockHash;
    if (mortality.immortal) {
      blockHash = polymeshApi.genesisHash.toString();
      era = '0x00';
    } else {
      era = context.createType('ExtrinsicEra', {
        current: latestBlockNumber.toNumber(),
        period: mortality.lifetime?.toNumber() ?? DEFAULT_LIFETIME_PERIOD,
      });

      blockHash = tipHash.toString();
    }

    const payloadData = {
      address: signingAddress,
      method: tx,
      nonce,
      genesisHash: polymeshApi.genesisHash.toString(),
      blockHash,
      specVersion: polymeshApi.runtimeVersion.specVersion,
      transactionVersion: polymeshApi.runtimeVersion.transactionVersion,
      runtimeVersion: polymeshApi.runtimeVersion,
      version: polymeshApi.extrinsicVersion,
      era,
    };

    const rawSignerPayload = context.createType('SignerPayload', payloadData);

    return {
      payload: rawSignerPayload.toPayload(),
      rawPayload: rawSignerPayload.toRaw(),
      method: tx.toHex(),
      metadata,
    };
  }

  /**
   * returns true if transaction has completed successfully
   */
  get isSuccess(): boolean {
    return this.status === TransactionStatus.Succeeded;
  }

  /**
   * @hidden
   *
   * Retrieve the Account that would pay fees for the transaction if it was run at this moment, as well as the total amount that can be
   *   charged to it (allowance) in case of a subsidy
   *
   * @note the paying Account might change if, before running the transaction, the caller Account enters (or leaves)
   *   a subsidizer relationship. A governance vote or chain upgrade could also cause the value to change between the time
   *   this method is called and the time the transaction is run
   */
  private async getPayingAccount(): Promise<PayingAccount> {
    const { paidForBy, multiSig, context } = this;

    if (paidForBy) {
      const { account: primaryAccount } = await paidForBy.getPrimaryAccount();

      return {
        type: PayingAccountType.Other,
        account: primaryAccount,
      };
    }

    const subsidyWithAllowance = await context.accountSubsidy();

    if (subsidyWithAllowance && !this.ignoresSubsidy()) {
      const {
        subsidy: { subsidizer: account },
        allowance,
      } = subsidyWithAllowance;

      return {
        type: PayingAccountType.Subsidy,
        account,
        allowance,
      };
    }

    // For MultiSig the fees come from the creator's primary key
    if (multiSig) {
      const multiId = await multiSig.getCreator();

      const { account } = await multiId.getPrimaryAccount();

      return {
        account,
        type: PayingAccountType.MultiSigCreator,
      };
    }

    const caller = context.getSigningAccount();

    return {
      account: caller,
      type: PayingAccountType.Caller,
    };
  }

  /**
   * Wrap a transaction with a multiSig proposal if the signer is a multiSig signer
   */
  protected wrapProposalIfNeeded(
    tx: SubmittableExtrinsic<'promise', ISubmittableResult>
  ): SubmittableExtrinsic<'promise', ISubmittableResult> {
    const {
      context,
      context: {
        polymeshApi: {
          tx: { multiSig },
        },
      },
      multiSig: actingMultiSig,
      multiSigOpts,
    } = this;

    if (actingMultiSig) {
      const rawMultiSigId = stringToAccountId(actingMultiSig.address, context);
      const rawExpiry = optionize(dateToMoment)(multiSigOpts.expiry, context);

      return multiSig.createProposalAsKey(rawMultiSigId, tx, rawExpiry, true);
    }

    return tx;
  }
}
