/* eslint-disable simple-import-sort/imports */
import { EventEmitter } from 'events';

import { SubmittableExtrinsic } from '@polkadot/api/types';
import { ISubmittableResult, Signer as PolkadotSigner } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';

import {
  buildDetachedEthTransactionRequest,
  buildSdkBroadcastSubmission,
  buildWalletBroadcastSubmission,
  buildEthTransactionRequest,
  calculateEthGasFee,
  dryRunEthTransaction,
  getEthSubmissionMode,
  getNativeToEthRatio,
} from '~/base/ethTransaction';
import { EthTransactionPayload } from '~/base/types';
import {
  extrinsicHashMatcher,
  getExtrinsicFailure,
  handleTransactionSubmissionError,
  pollForTransactionFinalization,
  subscribeForTransactionFinalization,
  TransactionInclusionInfo,
} from '~/base/utils';
import { Context, Identity, MultiSigProposal, PolymeshError } from '~/internal';
import { latestBlockQuery } from '~/middleware/queries/common';
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
  PollingSubmission,
  SubscriptionSubmission,
  TransactionConstructionData,
} from '~/types/internal';
import { Ensured } from '~/types/utils';
import { DEFAULT_LIFETIME_PERIOD } from '~/utils/constants';
import {
  balanceToBigNumber,
  dateToMoment,
  hashToString,
  stringToAccountId,
  transactionHexToTxTag,
  u32ToBigNumber,
  u64ToBigNumber,
} from '~/utils/conversion';
import { isEthDerivedAddress } from '~/utils/eth';
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
    const { resolver, transformer, paidForBy, multiSig, preRunValidation } = transaction;

    return {
      resolver,
      transformer,
      paidForBy,
      multiSig,
      preRunValidation,
    };
  }

  /**
   * current status of the transaction
   */
  public status: TransactionStatus = TransactionStatus.Idle;

  /**
   * stores errors thrown while running the transaction (status: `Failed`, `Aborted`)
   */
  public error?: PolymeshError | undefined;

  /**
   * stores the transaction receipt (if successful)
   */
  public receipt?: ISubmittableResult | undefined;

  /**
   * transaction hash (status: `Running`, `Succeeded`, `Failed`)
   *
   * @note when this transaction was signed by an Ethereum key and the wallet broadcast it
   *   itself, this is the Ethereum transaction hash, since that is the handle the user
   *   has and can look up in a block explorer
   */
  public txHash?: string | undefined;

  /**
   * the Ethereum transaction hash, set only when this transaction was signed by an Ethereum key
   *   and the wallet broadcast it itself. `undefined` for the native path, and when the SDK
   *   submits the Ethereum transaction itself
   */
  public ethTxHash?: string | undefined;

  /**
   * transaction index within its block (status: `Succeeded`, `Failed`)
   */
  public txIndex?: BigNumber | undefined;

  /**
   * hash of the block where this transaction resides (status: `Succeeded`, `Failed`)
   */
  public blockHash?: string | undefined;

  /**
   * number of the block where this transaction resides (status: `Succeeded`, `Failed`)
   */
  public blockNumber?: BigNumber | undefined;

  /**
   * This will be set if the signingAddress is a MultiSig signer, otherwise `null`
   *
   * When set it indicates the transaction will be wrapped as a proposal for the MultiSig,
   * meaning `.runAsProposal` should be used instead of `.run`
   */
  public multiSig: null | MultiSig;

  /**
   * @hidden
   *
   * Identity that will pay for this transaction's fees. This value overrides any subsidy,
   *   and is seen as having infinite allowance (but still constrained by its current balance)
   */
  protected paidForBy?: Identity | undefined;

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
  protected signer?: PolkadotSigner | undefined;

  /**
   * @hidden
   *
   * function that transforms the return value to another type. Useful when using the same
   *   Procedure for different endpoints which are supposed to return different values
   */
  protected transformer?:
    | undefined
    | ((result: ReturnValue) => Promise<TransformedReturnValue> | TransformedReturnValue);

  /**
   * @hidden
   *
   * Optional validation function that runs before the transaction. Receives an object indicating whether it's running as a proposal.
   */
  protected preRunValidation?: ((args: { asProposal: boolean }) => Promise<void>) | undefined;

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
      preRunValidation,
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
    this.preRunValidation = preRunValidation;
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
      if (this.preRunValidation) {
        await this.preRunValidation({ asProposal: true });
      }

      await this.assertFeesCovered();

      const receipt = await this.internalRun();
      this.receipt = receipt;
    } catch (err) {
      this.handleRunError(err);
    } finally {
      this.markAsRan();
    }

    const [proposalAddedEvent] = filterEventRecords(this.receipt, 'multiSig', 'ProposalAdded');

    const id = u64ToBigNumber(proposalAddedEvent!.data[2]);

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
      if (this.preRunValidation) {
        await this.preRunValidation({ asProposal: false });
      }

      await this.assertFeesCovered();

      const receipt = await this.internalRun();

      this.receipt = receipt;

      const {
        resolver,
        transformer = (val): Promise<TransformedReturnValue> =>
          Promise.resolve(val as unknown as TransformedReturnValue),
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

    if (isEthDerivedAddress(signingAddress, context.ss58Format)) {
      return this.internalRunEth();
    }

    // era is how many blocks the transaction remains valid for, `undefined` for default
    const era = mortality.immortal ? 0 : mortality.lifetime?.toNumber();
    const nonce = context.getNonce().toNumber();

    this.updateStatus(TransactionStatus.Unapproved);

    const txWithArgs = this.composeTx();

    const signerOptions = {
      nonce,
      /*
       * allows signers (e.g. Ledger devices signing via the generic app) to return a modified
       *   `signedTransaction`, which is required when signed extensions like `CheckMetadataHash` alter the payload
       */
      withSignedTransaction: true,
      /*
       * a returned `signedTransaction` may only alter signed extensions (e.g. `mode`, `metadataHash`).
       *   The API will reject any submission where the signer changed the call data itself
       */
      allowCallDataAlteration: false,
      ...(signer && { signer }),
      ...(era !== undefined ? { era } : {}),
    };

    if (context.supportsSubscription()) {
      return this.runViaSubscription({
        subscribe: callback => txWithArgs.signAndSend(signingAddress, signerOptions, callback),
        getTxHash: () => txWithArgs.hash.toString(),
      });
    }

    return this.runViaPolling({
      send: async () => {
        /*
         * the resolved hash is used instead of `txWithArgs.hash` because a signer may return a modified
         *   `signedTransaction` (e.g. Ledger devices signing via the generic app), in which case the
         *   submitted extrinsic's hash can differ from the locally composed one
         */
        const submittedTxHash = await txWithArgs.signAndSend(signingAddress, signerOptions);

        return {
          txHash: submittedTxHash.toString(),
          matcher: extrinsicHashMatcher(submittedTxHash),
        };
      },
    });
  }

  /**
   * @hidden
   *
   * @throws `ValidationError` if the caller explicitly requested a mortality setting.
   *   Ethereum transactions have no era; replay protection comes from the nonce and chain id, so
   *   `ProcedureOpts.mortality` is meaningless on this path and silently ignoring a request for
   *   immortality that the transport cannot honour would be worse than a clear error
   */
  private assertMortalitySupportedForEth(): void {
    const { mortality } = this;

    const wasExplicitlySet = mortality.immortal || mortality.lifetime !== undefined;

    if (wasExplicitlySet) {
      throw new PolymeshError({
        code: ErrorCode.ValidationError,
        message:
          'Mortality cannot be set for a transaction signed by an Ethereum key. Ethereum transactions have no era; replay protection comes from the nonce and chain id, so they are effectively immortal until the nonce is consumed',
      });
    }
  }

  /**
   * @hidden
   *
   * Ethereum submission strategy: build the request (performing the mandatory dry run
   *   pre-flight), then either broadcast a raw signed transaction from the SDK, or let the
   *   wallet broadcast and correlate the result by scanning blocks for a matching
   *   `revive.ethTransact` extrinsic
   */
  private async internalRunEth(): Promise<ISubmittableResult> {
    const { context, signingAddress } = this;

    this.assertMortalitySupportedForEth();

    const ethSigner = context.getEthSigner();

    if (!ethSigner) {
      throw new PolymeshError({
        code: ErrorCode.General,
        message:
          'There is no Ethereum signer associated with the SDK instance. Please report this to the Polymesh team',
      });
    }

    this.updateStatus(TransactionStatus.Unapproved);

    const composedTx = this.composeTx();

    const nonceValue = context.getNonce();
    const nonceOverride = nonceValue.isNegative() ? undefined : nonceValue;

    const { request } = await buildEthTransactionRequest({
      context,
      signingAddress,
      composedTx,
      ethSigner,
      ...(nonceOverride ? { nonce: nonceOverride } : {}),
    });

    const mode = getEthSubmissionMode(ethSigner);

    if (mode === 'sdkBroadcast') {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const rawSignedTx = await ethSigner.signTransaction!(request);

      const { subscription, polling } = buildSdkBroadcastSubmission(context, rawSignedTx);

      if (context.supportsSubscription()) {
        return this.runViaSubscription(subscription);
      }

      return this.runViaPolling(polling);
    }

    /*
     * The wallet broadcasts and returns the Ethereum transaction hash. The SDK submitted
     *   nothing, so there is no extrinsic-status subscription to attach to and the result has to
     *   be located by scanning blocks for the matching `revive.ethTransact` extrinsic
     */
    const walletBroadcastSubmission = buildWalletBroadcastSubmission(ethSigner, request);

    return this.runViaPolling({
      send: async () => {
        const result = await walletBroadcastSubmission.send();
        // set as soon as the hash is known, even if the transaction later reverts or is not found
        this.ethTxHash = result.txHash;

        return result;
      },
    });
  }

  /**
   * @hidden
   *
   * Submit the transaction and track it through a subscription, updating the transaction's
   *   status and block data as the node reports progress. All lifecycle bookkeeping lives here,
   *   so the only thing a submission strategy has to provide is *how* the transaction reaches
   *   the chain
   */
  private runViaSubscription(submission: SubscriptionSubmission): Promise<ISubmittableResult> {
    const { subscribe, getTxHash } = submission;

    return new Promise((resolve, reject) => {
      let settingBlockData = Promise.resolve();
      const gettingUnsub = subscribe(receipt => {
        const { status } = receipt;
        let isLastCallback = false;
        let unsubscribing = Promise.resolve();
        let failureError: PolymeshError | undefined;

        if (status.isFuture) {
          this.updateStatus(TransactionStatus.Future);
        } else if (receipt.isCompleted) {
          // isCompleted implies status is one of: isFinalized, isInBlock or isError
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
                this.updateStatus(TransactionStatus.InBlock);
              })
            );

            // if the extrinsic failed due to an on-chain error, we should handle it in a special way
            failureError = this.getReceiptFailure(receipt);
            // extrinsic failed so we can unsubscribe
            isLastCallback = !!failureError;
          } else {
            // isFinalized || isError so we know we can unsubscribe
            isLastCallback = true;
          }

          if (isLastCallback) {
            unsubscribing = gettingUnsub.then((unsub: UnsubCallback) => {
              unsub();
            });
          }

          /*
           * Promise chain that handles all sub-promises in this pass through the signAndSend callback.
           * Primarily for consistent error handling
           */
          let finishing = Promise.resolve();

          if (failureError) {
            const error = failureError;

            finishing = Promise.all([settingBlockData, unsubscribing]).then(() => {
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
      });

      gettingUnsub
        .then(() => {
          // tx approved by signer
          this.setIsRunningStatus(getTxHash());
        })
        .catch((err: Error) => {
          const error = handleTransactionSubmissionError(err);
          reject(new PolymeshError(error));
        });
    });
  }

  /**
   * @hidden
   *
   * Submit the transaction, then locate it by scanning the chain's blocks. Used when there is no
   *   extrinsic status subscription to attach to — either because the connection does not support
   *   subscriptions, or because the transaction was broadcast by an Ethereum wallet rather than
   *   by the SDK
   */
  private async runViaPolling(submission: PollingSubmission): Promise<ISubmittableResult> {
    const { context } = this;

    const startingBlock = await context.getLatestBlock();

    const { txHash, matcher } = await submission.send().catch((err: Error) => {
      const error = handleTransactionSubmissionError(err);

      throw new PolymeshError(error);
    });

    this.setIsRunningStatus(txHash);

    /*
     * report inclusion as soon as the transaction lands in a block, rather than leaving the caller
     *   with no feedback for the whole finalization window. This matters most for an Ethereum
     *   transaction the wallet broadcast, where block scanning is the only signal
     *   available
     */
    const onInBlock = ({ blockHash, blockNumber, txIndex }: TransactionInclusionInfo): void => {
      this.blockHash = blockHash;
      this.blockNumber = blockNumber;
      this.txIndex = new BigNumber(txIndex);
      this.updateStatus(TransactionStatus.InBlock);
    };

    /*
     * subscribing is strictly better where the connection allows it: blocks arrive as they are
     *   produced instead of on a poll tick, and it removes a repeating `getHeader`/`getBlock`
     *   cycle per in-flight transaction. Polling remains the fallback for HTTP connections, which
     *   is what it was always intended for
     */
    const finalizedReceipt = context.supportsSubscription()
      ? await subscribeForTransactionFinalization(matcher, startingBlock, context, onInBlock)
      : await pollForTransactionFinalization(matcher, startingBlock, context, undefined, onInBlock);

    this.blockHash = hashToString(finalizedReceipt.status.asFinalized);
    this.blockNumber = u32ToBigNumber(finalizedReceipt.blockNumber!);
    this.txIndex = new BigNumber(finalizedReceipt.txIndex!);

    // if the extrinsic failed due to an on-chain error, we should handle it in a special way
    const failureError = this.getReceiptFailure(finalizedReceipt);

    if (failureError) {
      throw failureError;
    }

    return finalizedReceipt;
  }

  /**
   * @hidden
   *
   * Inspect a receipt for an on-chain failure, returning the corresponding error if the
   *   transaction did not succeed. Checks both `system.ExtrinsicFailed` (the native path) and
   *   `revive.EthExtrinsicRevert` (the Ethereum signing path, where the outer extrinsic reports
   *   success even when the inner dispatch failed)
   */
  protected getReceiptFailure(receipt: ISubmittableResult): PolymeshError | undefined {
    return getExtrinsicFailure(receipt);
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
   * @param asProposal - When `true` (default), treats the transaction as a MultiSig proposal if the signing account is a MultiSig signer.
   *   When `false`, treats the transaction as a direct transaction from the signing account, ignoring the MultiSig.
   *
   * @note these values might be inaccurate if the transaction is run at a later time. This can be due to a governance vote or other
   *   chain related factors (like modifications to a specific subsidizer relationship or a chain upgrade)
   * @note for a transaction signed by an Ethereum key, the `gas` component is derived from
   *   `ethGas * gasPrice / nativeToEthRatio` (a dry run over the `revive` pallet) rather than
   *   `payment_queryInfo`, and so may differ slightly from the equivalent native call
   */
  public async getTotalFees(asProposal = true): Promise<PayingAccountFees> {
    const { signingAddress, context } = this;

    const composedTx = this.composeTxForFees(asProposal);

    const isEthSigner = isEthDerivedAddress(signingAddress, context.ss58Format);

    const gasPromise: Promise<BigNumber> = isEthSigner
      ? dryRunEthTransaction(context, signingAddress, composedTx).then(({ rawEthGas, gasPrice }) =>
          calculateEthGasFee(rawEthGas, gasPrice, getNativeToEthRatio(context))
        )
      : composedTx
          .paymentInfo(signingAddress)
          .then(({ partialFee }) => balanceToBigNumber(partialFee));

    const protocol = await this.getProtocolFees();

    const payingAccount = await this.getPayingAccount(asProposal);

    const [gas, { free: balance }] = await Promise.all([
      gasPromise,
      payingAccount.account.getBalance(),
    ]);

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
        blocks: { nodes },
      },
    } = await context.queryMiddleware<Ensured<Query, 'blocks'>>(latestBlockQuery());

    const block = nodes[0]!;

    const { blockId: processedBlock } = block;

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

      for (let i = 0; i < 6; i++) {
        const processedBlock = await this.getLatestBlockFromMiddleware();
        if (blockNumber.lte(processedBlock)) {
          emitter.emit(Event.ProcessedByMiddleware);
          break;
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

        await delay(2000);
      }
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
      case TransactionStatus.Idle:
      case TransactionStatus.Unapproved:
      case TransactionStatus.Running:
      case TransactionStatus.InBlock:
      case TransactionStatus.Future:
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
  public abstract supportsSubsidy(): void;

  /**
   * @hidden
   *
   * Asserts whether the transaction can be subsidized.
   *
   * @throws if transaction cannot be subsidized
   */
  protected abstract assertTransactionSupportsSubsidy(): void;

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
      this.assertTransactionSupportsSubsidy();

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
   * @param metadata - Additional information attached to the payload, such as IDs or memos about the transaction
   * @param asProposal - When `true` (default), treats the transaction as a MultiSig proposal if the signing account is a MultiSig signer.
   *   When `false`, treats the transaction as a direct transaction from the signing account, ignoring the MultiSig.
   *
   * @note Usually `.run()` should be preferred due to is simplicity.
   *
   * @note When using this method, details like account nonces, and transaction mortality require extra consideration. Generating a payload for offline sign implies asynchronicity. If using this API, be sure each procedure is created with the correct nonce, accounting for in flight transactions, and the lifetime is sufficient.
   *
   */
  public async toSignablePayload(
    metadata: Record<string, string> = {},
    asProposal = true
  ): Promise<TransactionPayload> {
    const {
      mortality,
      signingAddress,
      context,
      context: { polymeshApi },
    } = this;

    if (isEthDerivedAddress(signingAddress, context.ss58Format)) {
      throw new PolymeshError({
        code: ErrorCode.NotSupported,
        message:
          'A SCALE `SignerPayload` cannot be produced for a transaction signed by an Ethereum key, since an Ethereum key cannot sign it. Use `toEthSignablePayload` instead',
        data: { signingAddress },
      });
    }

    const tx = this.composeTxForFees(asProposal);

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
      multiSig: asProposal ? this.multiSig?.address ?? null : null,
    };
  }

  /**
   * Returns a representation intended for offline/detached signing of a transaction signed by an
   *   Ethereum-derived Account. Unlocks Fireblocks / KMS / HSM / air-gapped custody flows: the
   *   caller signs the returned `transaction` and submits the raw signed bytes via
   *   {@link api/client/Network!Network.submitEthTransaction | sdk.network.submitEthTransaction}
   *
   * @param metadata - Additional information attached to the payload, such as IDs or memos about the transaction
   *
   * @throws `ValidationError` if the signing Account is not Ethereum-derived
   */
  public async toEthSignablePayload(
    metadata: Record<string, string> = {}
  ): Promise<EthTransactionPayload> {
    const { signingAddress, context } = this;

    if (!isEthDerivedAddress(signingAddress, context.ss58Format)) {
      throw new PolymeshError({
        code: ErrorCode.ValidationError,
        message:
          '`toEthSignablePayload` can only be used for a transaction signed by an Ethereum-derived Account. Use `toSignablePayload` instead',
        data: { signingAddress },
      });
    }

    const ethSigner = context.getEthSigner();

    if (!ethSigner) {
      throw new PolymeshError({
        code: ErrorCode.General,
        message:
          'There is no Ethereum signer associated with the SDK instance. Please report this to the Polymesh team',
      });
    }

    const composedTx = this.composeTxForFees(true);

    const nonceValue = context.getNonce();
    const nonceOverride = nonceValue.isNegative() ? undefined : nonceValue;

    const transaction = await buildDetachedEthTransactionRequest(
      context,
      signingAddress,
      composedTx,
      ethSigner.capabilities.eip1559,
      nonceOverride
    );

    const tag = transactionHexToTxTag(transaction.data, context);
    const args = context.getTransactionArguments({ tag });

    return { transaction, tag, args, metadata };
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
   * @param asProposal - When `true` (default), uses MultiSig payer if the signing account is a MultiSig signer.
   *   When `false`, uses the signing account directly, ignoring the MultiSig.
   *
   * @note the paying Account might change if, before running the transaction, the caller Account enters (or leaves)
   *   a subsidizer relationship. A governance vote or chain upgrade could also cause the value to change between the time
   *   this method is called and the time the transaction is run
   */
  private async getPayingAccount(asProposal: boolean): Promise<PayingAccount> {
    const { paidForBy, multiSig, context, signingAddress } = this;

    const isEthSigner = isEthDerivedAddress(signingAddress, context.ss58Format);

    if (paidForBy) {
      if (isEthSigner) {
        throw new PolymeshError({
          code: ErrorCode.NotSupported,
          message:
            'A third-party paying Account (`paidForBy`) is not supported for a transaction signed by an Ethereum key. The Ethereum-derived Account is both the origin and the fee payer on this transport',
        });
      }

      const { account: primaryAccount } = await paidForBy.getPrimaryAccount();

      return {
        type: PayingAccountType.Other,
        account: primaryAccount,
      };
    }

    // subsidies are ignored on the Ethereum path: whether they apply is not established, and
    //   ignoring one that does apply merely over-reports the fee
    const subsidyWithAllowance = isEthSigner ? null : await context.accountSubsidy();

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
    // Only use MultiSig payer when asProposal is true
    if (multiSig && asProposal) {
      const multiId = await multiSig.getPayer();

      if (multiId) {
        try {
          const { account } = await multiId.getPrimaryAccount();

          return {
            account,
            type: PayingAccountType.MultiSigCreator,
          };
        } catch {
          // If we can't get the primary account (e.g., it doesn't have an identity),
          // fall back to using the MultiSig account directly
          return {
            type: PayingAccountType.Caller,
            account: multiSig,
          };
        }
      } else {
        return {
          type: PayingAccountType.Caller,
          account: multiSig,
        };
      }
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
      signingAddress,
    } = this;

    if (actingMultiSig) {
      /*
       * MultiSig + Ethereum is a narrow, untested intersection: `getPayingAccount` resolves fees
       *   to a *native* primary key for a MultiSig proposal, while the gas-derived fee arithmetic
       *   describes the transaction the Ethereum key itself submits. Out of scope for now,
       *   rather than shipping an untested combination of two fee models
       */
      if (isEthDerivedAddress(signingAddress, context.ss58Format)) {
        throw new PolymeshError({
          code: ErrorCode.NotSupported,
          message:
            'Using an Ethereum-derived Account as a MultiSig signer is not currently supported',
        });
      }

      const rawMultiSigId = stringToAccountId(actingMultiSig.address, context);
      const rawExpiry = optionize(dateToMoment)(multiSigOpts.expiry, context);

      return multiSig.createProposal(rawMultiSigId, tx, rawExpiry);
    }

    return tx;
  }

  /**
   * @hidden
   *
   * Compose a transaction for fee calculation or payload generation, conditionally wrapping as a proposal
   *
   * @param asProposal - When `true` (default), wraps the transaction as a proposal if the signing account is a MultiSig signer.
   *   When `false`, returns the unwrapped transaction.
   */
  protected composeTxForFees(
    asProposal: boolean
  ): SubmittableExtrinsic<'promise', ISubmittableResult> {
    // Get the base transaction without wrapping
    const baseTx = this.getBaseTransaction();

    if (asProposal) {
      return this.wrapProposalIfNeeded(baseTx);
    }

    return baseTx;
  }

  /**
   * @hidden
   *
   * Get the base transaction without any proposal wrapping
   */
  protected abstract getBaseTransaction(): SubmittableExtrinsic<'promise', ISubmittableResult>;
}
