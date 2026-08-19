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
  EthSubmissionStrategy,
  getEthSubmissionStrategy,
  getNativeToEthRatio,
} from '~/base/ethTransaction';
import { EthSigner, EthTransactionPayload, EthTransactionRequest } from '~/base/types';
import {
  extrinsicHashMatcher,
  ExtrinsicMatcher,
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
  SubmissionOpts,
  TransactionBroadcastHandle,
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
import { defusePromise, delay, filterEventRecords, optionize, withTimeout } from '~/utils/internal';

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
   * Bounds on how long to wait while broadcasting and tracking this transaction
   */
  protected submissionOpts: SubmissionOpts;

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
   * in-flight `watch` call started by {@link broadcast}, used to reject overlapping calls. Cleared
   *   once it settles, so a `watch` that timed out can simply be retried
   */
  private watching: Promise<TransformedReturnValue> | undefined;

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
      submission,
      preRunValidation,
    } = transactionSpec;

    this.signingAddress = signingAddress;
    this.multiSig = multiSig ?? null;
    this.mortality = mortality;
    this.multiSigOpts = multiSigOpts ?? {};
    this.submissionOpts = submission ?? {};
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

      return await this.resolveResult(receipt);
    } catch (err) {
      this.handleRunError(err);
    } finally {
      this.markAsRan();
    }
  }

  /**
   * Broadcast the transaction and return as soon as it has been accepted, without waiting for it
   *   to be included in a block. This is {@link run} split at its natural seam — the returned
   *   handle's `watch` performs the second half and yields the exact value `run` would have — so
   *   `await (await tx.broadcast()).watch()` is equivalent to `await tx.run()`
   *
   * Use it when waiting is not wanted, or not safe to depend on: an Ethereum wallet that
   *   broadcasts on the user's behalf, a long finalization window a UI should not block on, or a
   *   flow that persists the hash and resumes tracking later via
   *   {@link api/client/Network!Network.watchTransaction | network.watchTransaction}
   *
   * @note this always submits without an extrinsic status subscription, since that channel cannot
   *   report a hash without also waiting for the result. The trade-off is that `Future` status
   *   reporting and in-pool `Aborted` detection are unavailable — those come from the node's
   *   status stream, which only {@link run} attaches to
   *
   * @throws if the transaction has already been run or broadcast
   * @throws `NotSupported` if the signing Account is a MultiSig signer. Use `runAsProposal`, which
   *   needs the finalized receipt to report the resulting proposal
   */
  public async broadcast(): Promise<TransactionBroadcastHandle<TransformedReturnValue>> {
    const { context } = this;

    if (this.hasRun) {
      throw new PolymeshError({
        code: ErrorCode.General,
        message: 'Cannot re-run a Transaction',
      });
    }

    if (this.multiSig) {
      throw new PolymeshError({
        code: ErrorCode.NotSupported,
        message:
          '`.broadcast` cannot be used with a MultiSig signer, since the resulting proposal can only be read from the finalized transaction. `.runAsProposal` should be called instead',
        data: { signingAddress: this.signingAddress, multiSigAddress: this.multiSig.address },
      });
    }

    try {
      if (this.preRunValidation) {
        await this.preRunValidation({ asProposal: false });
      }

      await this.assertFeesCovered();

      const startingBlock = await context.getLatestBlock();

      const { matcher } = await this.broadcastToChain(await this.buildPollingSubmission());

      return {
        // set by `broadcastToChain`, which cannot succeed without it
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        txHash: this.txHash!,
        ...(this.ethTxHash !== undefined ? { ethTxHash: this.ethTxHash } : {}),
        startingBlock,
        watch: opts => this.watchBroadcast(matcher, startingBlock, opts?.timeout),
      };
    } catch (err) {
      this.handleRunError(err);
    } finally {
      /*
       * marked here rather than via `markAsRan`, which would also start the middleware sync. There
       *   is nothing for the middleware to have synced until `watch` sees a block, so that emit
       *   waits until then
       */
      this.hasRun = true;
    }
  }

  /**
   * @hidden
   *
   * The second half of {@link broadcast}: wait for inclusion, then produce the same value `run`
   *   would have. Retryable after a timeout, since nothing is resubmitted — the block scan simply
   *   starts over from the same point
   */
  private async watchBroadcast(
    matcher: ExtrinsicMatcher,
    startingBlock: BigNumber,
    timeout?: number | undefined
  ): Promise<TransformedReturnValue> {
    if (this.isSuccess) {
      // already watched to completion; scanning again would only rediscover the same block
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return this._result!;
    }

    if (this.watching) {
      throw new PolymeshError({
        code: ErrorCode.General,
        message:
          'This transaction is already being watched. Await the promise returned by the previous `watch` call instead of starting another',
      });
    }

    const watching = (async (): Promise<TransformedReturnValue> => {
      try {
        const receipt = await this.watchForInclusion(matcher, startingBlock, timeout);

        const result = await this.resolveResult(receipt);

        this.startMiddlewareSync();

        return result;
      } catch (err) {
        this.handleRunError(err);
      }
    })();

    this.watching = watching;

    try {
      return await watching;
    } finally {
      this.watching = undefined;
    }
  }

  /**
   * @hidden
   *
   * Route to the polling-style submission for whichever signing path this transaction uses. The
   *   returned function is what actually touches the signer, so that {@link broadcastToChain} can
   *   bound it
   */
  private async buildPollingSubmission(): Promise<() => Promise<PollingSubmission>> {
    const { signingAddress, context } = this;

    await context.assertHasSigningAddress(signingAddress);

    if (isEthDerivedAddress(signingAddress, context.ss58Format)) {
      const { ethSigner, request } = await this.buildEthRequest();

      return this.buildEthPollingSubmission(getEthSubmissionStrategy(ethSigner), request);
    }

    const { txWithArgs, signerOptions } = this.buildNativeSignerData();

    return () => Promise.resolve(this.buildNativePollingSubmission(txWithArgs, signerOptions));
  }

  /**
   * @hidden
   *
   * Turn a finalized receipt into the value the caller gets back, recording it and moving the
   *   transaction to `Succeeded`. Shared by `run` and by the `watch` returned from
   *   {@link broadcast}, so that both produce the same value for the same transaction
   */
  private async resolveResult(receipt: ISubmittableResult): Promise<TransformedReturnValue> {
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
      case ErrorCode.TransactionTimeout: {
        /*
         * the transaction was not cancelled, the SDK merely stopped waiting for it. Moving to
         *   `Failed` would assert something untrue — it may still be included in a block — so the
         *   last observed status (`Running`, or `InBlock` if it was already seen) stands
         */
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

    this.startMiddlewareSync();
  }

  /**
   * @hidden
   *
   * Kick off the middleware sync notification. Separate from {@link markAsRan} because
   *   {@link broadcast} marks the transaction as ran without having waited for a block — there is
   *   nothing for the middleware to have synced yet at that point, so the emit waits until `watch`
   *   completes
   */
  private startMiddlewareSync(): void {
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
    const { signingAddress, context } = this;

    await context.assertHasSigningAddress(signingAddress);

    if (isEthDerivedAddress(signingAddress, context.ss58Format)) {
      return this.internalRunEth();
    }

    const { txWithArgs, signerOptions } = this.buildNativeSignerData();

    if (context.supportsSubscription()) {
      return this.runViaSubscription({
        subscribe: callback => txWithArgs.signAndSend(signingAddress, signerOptions, callback),
        getTxHash: () => txWithArgs.hash.toString(),
      });
    }

    return this.runViaPolling(() =>
      Promise.resolve(this.buildNativePollingSubmission(txWithArgs, signerOptions))
    );
  }

  /**
   * @hidden
   *
   * Compose the transaction and assemble the options the native signer is called with. Also moves
   *   the transaction into `Unapproved`, since from here on the signer is what everything waits on
   */
  private buildNativeSignerData(): {
    txWithArgs: SubmittableExtrinsic<'promise', ISubmittableResult>;
    signerOptions: Record<string, unknown>;
  } {
    const { signer, mortality, context } = this;

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

    return { txWithArgs, signerOptions };
  }

  /**
   * @hidden
   *
   * The native "send once and correlate by hash" submission. Used when the connection has no
   *   subscription support, and by {@link broadcast}, which cannot use the callback-driven
   *   subscription at all since that never yields control back before the transaction resolves
   */
  private buildNativePollingSubmission(
    txWithArgs: SubmittableExtrinsic<'promise', ISubmittableResult>,
    signerOptions: Record<string, unknown>
  ): PollingSubmission {
    const { signingAddress } = this;

    return {
      send: async (): Promise<{ txHash: string; matcher: ExtrinsicMatcher }> => {
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
    };
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
    const { context } = this;

    const { ethSigner, request } = await this.buildEthRequest();

    const strategy = getEthSubmissionStrategy(ethSigner);

    if (strategy.mode === 'sdkBroadcast' && context.supportsSubscription()) {
      const rawSignedTx = await strategy.signTransaction(request);

      const { subscription } = buildSdkBroadcastSubmission(context, rawSignedTx);

      return this.runViaSubscription(subscription);
    }

    return this.runViaPolling(this.buildEthPollingSubmission(strategy, request));
  }

  /**
   * @hidden
   *
   * The eager half of the Ethereum path: validate, compose the call and perform the mandatory dry
   *   run pre-flight. Deliberately kept out of the broadcast phase — it is chain RPC work, not a
   *   signer interaction, so a failure here is a real error rather than something a timeout should
   *   describe as "state unknown"
   */
  private async buildEthRequest(): Promise<{
    ethSigner: EthSigner;
    request: EthTransactionRequest;
  }> {
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

    return { ethSigner, request };
  }

  /**
   * @hidden
   *
   * The deferred half of the Ethereum path. Everything that touches the signer lives in here, so
   *   that the broadcast timeout covers the wallet confirmation prompt in both modes: the raw
   *   signing in `sdkBroadcast`, and the sign-and-send in `walletBroadcast`
   */
  private buildEthPollingSubmission(
    strategy: EthSubmissionStrategy,
    request: EthTransactionRequest
  ): () => Promise<PollingSubmission> {
    const { context } = this;

    if (strategy.mode === 'sdkBroadcast') {
      const { signTransaction } = strategy;

      return async () => {
        const rawSignedTx = await signTransaction(request);

        return buildSdkBroadcastSubmission(context, rawSignedTx).polling;
      };
    }

    /*
     * The wallet broadcasts and returns the Ethereum transaction hash. The SDK submitted
     *   nothing, so there is no extrinsic-status subscription to attach to and the result has to
     *   be located by scanning blocks for the matching `revive.ethTransact` extrinsic
     */
    const walletBroadcastSubmission = buildWalletBroadcastSubmission(
      strategy.sendTransaction,
      request
    );

    return () =>
      Promise.resolve({
        send: async (): Promise<{ txHash: string; matcher: ExtrinsicMatcher }> => {
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
  private async runViaPolling(
    getSubmission: () => Promise<PollingSubmission>
  ): Promise<ISubmittableResult> {
    const startingBlock = await this.context.getLatestBlock();

    const { matcher } = await this.broadcastToChain(getSubmission);

    return this.watchForInclusion(matcher, startingBlock);
  }

  /**
   * @hidden
   *
   * Hand the transaction to its signer and get it broadcast, yielding the hash it can be looked up
   *   by and the predicate that recognizes it in a block. This is the phase a wallet confirmation
   *   prompt happens in, so it is what `submission.broadcastTimeout` bounds
   *
   * @throws `TransactionTimeout` if the signer does not broadcast in time. Note this says nothing
   *   about whether the transaction was broadcast — only that the SDK gave up waiting to hear
   */
  private async broadcastToChain(
    getSubmission: () => Promise<PollingSubmission>
  ): Promise<{ txHash: string; matcher: ExtrinsicMatcher }> {
    const {
      submissionOpts: { broadcastTimeout },
    } = this;

    const sending = (async (): Promise<{ txHash: string; matcher: ExtrinsicMatcher }> => {
      const submission = await getSubmission();

      return submission.send();
    })();

    const result = await withTimeout(
      sending,
      broadcastTimeout,
      () =>
        new PolymeshError({
          code: ErrorCode.TransactionTimeout,
          message:
            'The signer did not broadcast the transaction within the allotted time. It was not cancelled — whether it ends up being broadcast is unknown, so check before submitting again, or the same transaction may be submitted twice',
          data: { broadcastTimeout },
        })
    ).catch((err: Error) => {
      /*
       * a timeout is already a well formed error describing exactly what happened. Only genuine
       *   submission failures need translating (e.g. a signer cancellation)
       */
      if (err instanceof PolymeshError && err.code === ErrorCode.TransactionTimeout) {
        throw err;
      }

      throw handleTransactionSubmissionError(err);
    });

    this.setIsRunningStatus(result.txHash);

    return result;
  }

  /**
   * @hidden
   *
   * Locate the broadcast transaction by scanning blocks, updating this transaction's block data as
   *   it goes. Bounded by `submission.watchTimeout`, or by the `timeout` passed to the `watch`
   *   returned from {@link broadcast}, which takes precedence
   *
   * @throws `TransactionTimeout` if the transaction is not found in time. The transaction is
   *   unaffected by this and may still be included in a block afterwards
   */
  private async watchForInclusion(
    matcher: ExtrinsicMatcher,
    startingBlock: BigNumber,
    timeout?: number | undefined
  ): Promise<ISubmittableResult> {
    const { context, submissionOpts } = this;

    const watchTimeout = timeout ?? submissionOpts.watchTimeout;

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
    const scanning = context.supportsSubscription()
      ? subscribeForTransactionFinalization(matcher, startingBlock, context, onInBlock)
      : pollForTransactionFinalization(matcher, startingBlock, context, undefined, onInBlock);

    const finalizedReceipt = await withTimeout(
      scanning,
      watchTimeout,
      () =>
        new PolymeshError({
          code: ErrorCode.TransactionTimeout,
          message:
            'The transaction was broadcast but was not found in a finalized block within the allotted time. It has not been cancelled and may still be included — it can be tracked by hash with `network.watchTransaction`',
          data: {
            txHash: this.txHash,
            ethTxHash: this.ethTxHash,
            startingBlock,
            watchTimeout,
          },
        })
    );

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
   * @param opts.eip1559 - whether to build an EIP-1559 (type 2) transaction. Defaults to `true`;
   *   pass `false` for a custody service or hardware signer that can only encode legacy (type 0)
   *   transactions
   *
   * @note no Signing Manager is required. The whole point of this method is detached signing, so
   *   it must work on an SDK instance connected without one — the payload is built entirely from
   *   chain state and the signing address
   * @note every field of `transaction` is 0x-prefixed hex, never a number or bigint — the only
   *   encoding that survives being serialized and sent to a remote signer. ethers and viem both
   *   need it converted first; `@polymeshassociation/eth-signing-manager` exports
   *   `toEthersTransaction` / `toViemTransaction` for that, usable without the manager itself
   *
   * @throws `ValidationError` if the signing Account is not Ethereum-derived
   */
  public async toEthSignablePayload(
    metadata: Record<string, string> = {},
    opts: { eip1559?: boolean } = {}
  ): Promise<EthTransactionPayload> {
    const { signingAddress, context } = this;
    const { eip1559 = true } = opts;

    if (!isEthDerivedAddress(signingAddress, context.ss58Format)) {
      throw new PolymeshError({
        code: ErrorCode.ValidationError,
        message:
          '`toEthSignablePayload` can only be used for a transaction signed by an Ethereum-derived Account. Use `toSignablePayload` instead',
        data: { signingAddress },
      });
    }

    const composedTx = this.composeTxForFees(true);

    const nonceValue = context.getNonce();
    const nonceOverride = nonceValue.isNegative() ? undefined : nonceValue;

    const transaction = await buildDetachedEthTransactionRequest(
      context,
      signingAddress,
      composedTx,
      eip1559,
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

    /*
     * An Ethereum-derived Account always pays its own fees. `revive.ethTransact` is a bare
     *   extrinsic, so neither `paidForBy` nor a subsidy reaches the chain's fee pipeline — gas is
     *   charged to the signing Account.
     *
     * Both branches below would need revisiting if the chain ever routes third-party payment
     *   through this transport
     */
    if (paidForBy && !isEthSigner) {
      const { account: primaryAccount } = await paidForBy.getPrimaryAccount();

      return {
        type: PayingAccountType.Other,
        account: primaryAccount,
      };
    }

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
