import { SubmittableExtrinsic } from '@polkadot/api/types';
import { AnyJson, ISubmittableResult } from '@polkadot/types/types';
import { compactToU8a, isHex, u8aConcat } from '@polkadot/util';
import { HexString } from '@polkadot/util/types';
import BigNumber from 'bignumber.js';

import { ethTransactKeccakMatcher } from '~/base/ethTransaction';
import {
  extrinsicHashMatcher,
  ExtrinsicMatcher,
  getExtrinsicFailure,
  pollForTransactionFinalization,
  subscribeForTransactionFinalization,
} from '~/base/utils';
import { Account, Context, PolymeshError, transferPolyx } from '~/internal';
import { eventsByArgs } from '~/middleware/queries/events';
import { extrinsicByHash } from '~/middleware/queries/extrinsics';
import { EventIdEnum, ModuleIdEnum, Query } from '~/middleware/types';
import {
  ErrorCode,
  EventIdentifier,
  ExtrinsicDataWithFees,
  MiddlewareMetadata,
  NetworkProperties,
  ProcedureMethod,
  ProtocolFees,
  SubCallback,
  SubmissionDetails,
  SubmissionOpts,
  TransactionArgument,
  TransactionPayloadInput,
  TransferPolyxParams,
  TxTag,
  UnsubCallback,
} from '~/types';
import { Ensured } from '~/types/utils';
import { isFullOfflinePayload, isRawPayload } from '~/utils';
import { TREASURY_MODULE_ADDRESS } from '~/utils/constants';
import {
  balanceToBigNumber,
  extrinsicIdentifierToTxTag,
  hashToString,
  middlewareEventDetailsToEventIdentifier,
  moduleAddressToString,
  stringToBlockHash,
  textToString,
  transactionHexToTxTag,
  u32ToBigNumber,
} from '~/utils/conversion';
import { createProcedureMethod, optionize, withTimeout } from '~/utils/internal';

/**
 * Handles all Network related functionality, including querying for historical events from middleware
 */
export class Network {
  private readonly context: Context;

  /**
   * @hidden
   */
  constructor(context: Context) {
    this.context = context;

    this.transferPolyx = createProcedureMethod(
      { getProcedureAndArgs: args => [transferPolyx, args] },
      context
    );
  }

  /**
   * Retrieve the number of the latest finalized block in the chain
   */
  public getLatestBlock(): Promise<BigNumber> {
    return this.context.getLatestBlock();
  }

  /**
   * Fetch the current network version (e.g. 3.1.0)
   */
  public getVersion(): Promise<string> {
    return this.context.getNetworkVersion();
  }

  /**
   * Retrieve the chain's SS58 format
   */
  public getSs58Format(): BigNumber {
    return this.context.ss58Format;
  }

  /**
   * Retrieve information for the current network
   */
  public async getNetworkProperties(): Promise<NetworkProperties> {
    const {
      context: {
        polymeshApi: {
          runtimeVersion: { specVersion },
          rpc: {
            system: { chain },
          },
          genesisHash,
        },
      },
    } = this;
    const name = await chain();

    return {
      name: textToString(name),
      version: u32ToBigNumber(specVersion),
      genesisHash: hashToString(genesisHash),
    };
  }

  /**
   * Retrieve the protocol fees associated with running specific transactions
   *
   * @param args.tags - list of transaction tags (e.g. [TxTags.asset.CreateAsset, TxTags.asset.RegisterUniqueTicker] or ["asset.createAsset", "asset.registerTicker"])
   */
  public getProtocolFees(args: { tags: TxTag[] }): Promise<ProtocolFees[]> {
    return this.context.getProtocolFees(args);
  }

  /**
   * Get the treasury wallet address
   */
  public getTreasuryAccount(): Account {
    const { context } = this;
    return new Account(
      { address: moduleAddressToString(TREASURY_MODULE_ADDRESS, context) },
      context
    );
  }

  /**
   * Get the Treasury POLYX balance
   *
   * @returns Promise that resolves to the current Treasury balance
   */
  public getTreasuryBalance(): Promise<BigNumber>;

  /**
   * Get the Treasury POLYX balance (with subscription support)
   *
   * @param callback - Callback function that receives balance updates
   *
   * @returns Promise that resolves to an unsubscribe function
   *
   * @note can be subscribed to, if connected to node using a web socket
   */
  public getTreasuryBalance(callback: SubCallback<BigNumber>): Promise<UnsubCallback>;

  // eslint-disable-next-line require-jsdoc
  public async getTreasuryBalance(
    callback?: SubCallback<BigNumber>
  ): Promise<BigNumber | UnsubCallback> {
    const account = this.getTreasuryAccount();

    if (callback) {
      this.context.assertSupportsSubscription();
      return account.getBalance(({ free: freeBalance }) => {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises -- callback errors should be handled by the caller
        callback(freeBalance);
      });
    }

    const { free } = await account.getBalance();
    return free;
  }

  /**
   * Get the total POLYX in existence
   *
   * @returns Promise that resolves to the current total issuance
   *
   * @note this is every POLYX the chain has issued, not the circulating or staked amount. It is
   *   the denominator for a staking ratio, and one of the inputs to Polymesh's inflation curve —
   *   see {@link api/client/Staking!Staking.getConstants | staking.getConstants}
   */
  public getTotalIssuance(): Promise<BigNumber>;

  /**
   * Get the total POLYX in existence (with subscription support)
   *
   * @param callback - Callback function that receives issuance updates
   *
   * @returns Promise that resolves to an unsubscribe function
   *
   * @note can be subscribed to, if connected to node using a web socket
   */
  public getTotalIssuance(callback: SubCallback<BigNumber>): Promise<UnsubCallback>;

  // eslint-disable-next-line require-jsdoc
  public async getTotalIssuance(
    callback?: SubCallback<BigNumber>
  ): Promise<BigNumber | UnsubCallback> {
    const {
      context,
      context: {
        polymeshApi: {
          query: { balances },
        },
      },
    } = this;

    if (callback) {
      context.assertSupportsSubscription();

      return balances.totalIssuance(rawIssuance => {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises -- callback errors should be handled by the caller
        callback(balanceToBigNumber(rawIssuance));
      });
    }

    return balanceToBigNumber(await balances.totalIssuance());
  }

  /**
   * Transfer an amount of POLYX to a specified Account
   */
  public transferPolyx: ProcedureMethod<TransferPolyxParams, void>;

  /**
   * Retrieve a single event by any of its indexed arguments. Can be filtered using parameters
   *
   * @param opts.moduleId - type of the module to fetch
   * @param opts.eventId - type of the event to fetch
   * @param opts.eventArg0 - event parameter value to filter by in position 0
   * @param opts.eventArg1 - event parameter value to filter by in position 1
   * @param opts.eventArg2 - event parameter value to filter by in position 2
   *
   * @note uses the middlewareV2
   */
  public async getEventByIndexedArgs(opts: {
    moduleId: ModuleIdEnum;
    eventId: EventIdEnum;
    eventArg0?: string;
    eventArg1?: string;
    eventArg2?: string;
  }): Promise<EventIdentifier | null> {
    const { context } = this;

    const { moduleId, eventId, eventArg0, eventArg1, eventArg2 } = opts;

    const {
      data: {
        events: {
          nodes: [event],
        },
      },
    } = await context.queryMiddleware<Ensured<Query, 'events'>>(
      eventsByArgs(
        {
          moduleId,
          eventId,
          eventArg0,
          eventArg1,
          eventArg2,
        },
        new BigNumber(1)
      )
    );

    return optionize(middlewareEventDetailsToEventIdentifier)(event?.block, event?.eventIdx);
  }

  /**
   * Submits a transaction payload with its signature to the chain. `signature` should be hex encoded
   *
   * @param opts - bounds on how long to wait while broadcasting and tracking the transaction.
   *   Defaults to waiting indefinitely
   *
   * @throws if the signature is not hex encoded
   * @throws `TransactionTimeout` if a bound in `opts` is exceeded. The transaction is not cancelled
   *   by this, and can be tracked afterwards with {@link watchTransaction}
   */
  public async submitTransaction(
    txPayload: TransactionPayloadInput,
    signature: string,
    opts: SubmissionOpts = {}
  ): Promise<SubmissionDetails> {
    const { context } = this;

    let payload;
    let address: string;
    let extrinsic;

    if (isFullOfflinePayload(txPayload)) {
      payload = txPayload.payload;
      address = payload.address;
      extrinsic = context.createType('Extrinsic', payload);
    } else {
      address = txPayload.address;
      if (isRawPayload(txPayload)) {
        let data: string;
        ({ address, data } = txPayload);

        const call = context.createType('Call', data);

        extrinsic = context.createType('Extrinsic', call);

        // The payload must be prefixed with the SCALE encoded length of the payload
        payload = u8aConcat(compactToU8a(call.encodedLength), data);
      } else {
        payload = txPayload;
        extrinsic = context.createType('Extrinsic', payload);
      }
    }

    if (!signature.startsWith('0x')) {
      signature = `0x${signature}`;
    }

    if (!isHex(signature))
      throw new PolymeshError({
        code: ErrorCode.ValidationError,
        message: '`signature` should be a hex encoded string',
        data: { signature },
      });

    extrinsic.addSignature(address, signature, payload);

    const transaction = context.polymeshApi.tx(extrinsic);

    return await this.broadcastExtrinsic(transaction, opts);
  }

  /**
   * Submits a raw, signed Ethereum transaction that carries a Polymesh runtime call through the
   *   `revive` pallet's sentinel address. This is the SDK-broadcast submission step, reused
   *   here to unlock Fireblocks / KMS / HSM / air-gapped custody flows for Ethereum-derived
   *   Accounts: build the payload via
   *   {@link base/PolymeshTransactionBase!PolymeshTransactionBase.toEthSignablePayload | transaction.toEthSignablePayload},
   *   sign it externally, and submit the raw signed bytes here
   *
   * @param rawSignedTx - the raw signed Ethereum transaction, as returned by an `EthSigner`'s `signTransaction`
   * @param opts - bounds on how long to wait while broadcasting and tracking the transaction.
   *   Defaults to waiting indefinitely
   *
   * @throws `TransactionTimeout` if a bound in `opts` is exceeded. The transaction is not cancelled
   *   by this, and can be tracked afterwards with {@link watchTransaction}
   */
  public async submitEthTransaction(
    rawSignedTx: HexString,
    opts: SubmissionOpts = {}
  ): Promise<SubmissionDetails> {
    const { context } = this;

    const transaction = context.polymeshApi.tx.revive.ethTransact(rawSignedTx);

    return await this.broadcastExtrinsic(transaction, opts);
  }

  /**
   * Track a transaction that has already been broadcast, by its hash, and wait for it to be
   *   included in a finalized block
   *
   * Complements {@link base/PolymeshTransactionBase!PolymeshTransactionBase.broadcast | transaction.broadcast}
   *   and the timeouts on {@link submitTransaction} / {@link submitEthTransaction}: each of those
   *   can leave a transaction in flight but untracked. Since this needs nothing but a hash and a
   *   block height, tracking can be picked back up in a later session — after a page reload, for
   *   instance, where the original handle no longer exists
   *
   * @param args.startingBlock - block height to start searching from. This must be at or before the
   *   block the transaction was submitted in, or it will not be found. `broadcast` returns the
   *   correct value to persist
   * @param args.txHash - hash of the transaction to look for
   * @param args.isEthTxHash - set to `true` when `txHash` is an Ethereum transaction hash, i.e. the
   *   transaction was broadcast by an Ethereum wallet. Those are carried on chain as an unsigned
   *   `revive.ethTransact` extrinsic, so they are matched by their payload rather than by the
   *   extrinsic hash
   * @param args.timeout - milliseconds to wait before giving up. Defaults to waiting indefinitely
   *
   * @throws `TransactionTimeout` if the transaction is not found in time. It may still be included
   *   afterwards — this reports only that the search stopped
   */
  public async watchTransaction(args: {
    startingBlock: BigNumber;
    txHash: string;
    isEthTxHash?: boolean;
    timeout?: number;
  }): Promise<SubmissionDetails> {
    const { context } = this;
    const { startingBlock, txHash, isEthTxHash = false, timeout } = args;

    const matcher: ExtrinsicMatcher = isEthTxHash
      ? ethTransactKeccakMatcher(txHash)
      : extrinsicHashMatcher(context.createType('Hash', txHash));

    const scanning = context.supportsSubscription()
      ? subscribeForTransactionFinalization(matcher, startingBlock, context)
      : pollForTransactionFinalization(matcher, startingBlock, context);

    const result = await withTimeout(
      scanning,
      timeout,
      () =>
        new PolymeshError({
          code: ErrorCode.TransactionTimeout,
          message:
            'The transaction was not found in a finalized block within the allotted time. It has not been cancelled and may still be included, so this can be retried',
          data: { txHash, startingBlock, timeout },
        })
    );

    const failureError = getExtrinsicFailure(result);

    if (failureError) {
      throw failureError;
    }

    return {
      blockHash: hashToString(result.status.asFinalized),
      transactionHash: txHash,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      transactionIndex: new BigNumber(result.txIndex!),
      result,
    };
  }

  /**
   * @hidden
   *
   * Broadcast an already-built extrinsic (either the offline-signed native extrinsic, or the
   *   bare `revive.ethTransact` wrapper around a raw signed Ethereum transaction) and track it
   *   through to finalization
   *
   * @note the bounds in `opts` only apply to the polling path. The subscription path is driven by
   *   the node's own status stream, which reports progress unprompted and does not risk waiting on
   *   a signer that never responds
   */
  private async broadcastExtrinsic(
    transaction: SubmittableExtrinsic<'promise', ISubmittableResult>,
    opts: SubmissionOpts
  ): Promise<SubmissionDetails> {
    const { context } = this;
    const { broadcastTimeout, watchTimeout } = opts;

    const submissionDetails: SubmissionDetails = {
      blockHash: '',
      transactionHash: transaction.hash.toString(),
      transactionIndex: new BigNumber(-1),
    } as SubmissionDetails;

    if (context.supportsSubscription()) {
      return new Promise((resolve, reject) => {
        const gettingUnsub = transaction.send(receipt => {
          const { status } = receipt;
          let isLastCallback = false;
          let unsubscribing = Promise.resolve();
          let failureError: PolymeshError | undefined;

          // isCompleted implies status is one of: isFinalized, isInBlock or isError
          if (receipt.isCompleted) {
            if (receipt.isInBlock) {
              const inBlockHash = status.asInBlock;
              submissionDetails.blockHash = hashToString(inBlockHash);

              // we know that the index has to be set by the time the transaction is included in a block
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              submissionDetails.transactionIndex = new BigNumber(receipt.txIndex!);

              /*
               * if the extrinsic failed due to an on-chain error, we should handle it in a special
               *   way. This also catches `revive.EthExtrinsicRevert`, emitted instead of
               *   `system.ExtrinsicFailed` when the transaction was signed by an Ethereum key
               */
              failureError = getExtrinsicFailure(receipt);

              // extrinsic failed so we can unsubscribe
              isLastCallback = !!failureError;
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

            if (failureError) {
              const error = failureError;

              finishing = Promise.all([unsubscribing]).then(() => {
                reject(error);
              });
            } else if (receipt.isFinalized) {
              submissionDetails.result = receipt;
              finishing = Promise.all([unsubscribing]).then(() => {
                resolve(submissionDetails);
              });
            } else if (receipt.isError) {
              reject(new PolymeshError({ code: ErrorCode.TransactionAborted }));
            }

            finishing.catch((err: Error) => reject(err));
          }
        });
      });
    } else {
      const startingBlock = await context.getLatestBlock();

      await withTimeout(
        transaction.send(),
        broadcastTimeout,
        () =>
          new PolymeshError({
            code: ErrorCode.TransactionTimeout,
            message:
              'The transaction was not broadcast within the allotted time. It was not cancelled — whether it ends up being submitted is unknown, so check before submitting again, or the same transaction may be submitted twice',
            data: { transactionHash: transaction.hash.toString(), broadcastTimeout },
          })
      );

      const result = await withTimeout(
        pollForTransactionFinalization(
          extrinsicHashMatcher(transaction.hash),
          startingBlock,
          context
        ),
        watchTimeout,
        () =>
          new PolymeshError({
            code: ErrorCode.TransactionTimeout,
            message:
              'The transaction was broadcast but was not found in a finalized block within the allotted time. It has not been cancelled and may still be included — it can be tracked by hash with `network.watchTransaction`',
            data: {
              transactionHash: transaction.hash.toString(),
              startingBlock,
              watchTimeout,
            },
          })
      );

      const failureError = getExtrinsicFailure(result);

      if (failureError) {
        throw failureError;
      }

      return {
        blockHash: hashToString(result.status.asFinalized),
        transactionHash: hashToString(transaction.hash),
        transactionIndex: new BigNumber(result.txIndex!),
        result,
      };
    }
  }

  /**
   * Decode the SCALE-encoded call carried by a `revive.ethTransact` transaction (or any other
   *   Polymesh call), so a dapp can render it next to a wallet's confirmation prompt. Does not
   *   fix in-wallet legibility (the wallet still shows raw bytes); it removes the worst of the
   *   opacity for a dapp that cares
   *
   * @param hex - SCALE-encoded call, e.g. `transaction.toEthSignablePayload()`'s `transaction.data`
   */
  public decodeCall(hex: HexString): {
    tag: TxTag;
    args: TransactionArgument[];
    humanReadable: AnyJson;
  } {
    const { context } = this;

    const tag = transactionHexToTxTag(hex, context);
    const args = context.getTransactionArguments({ tag });
    const humanReadable = context.createType('Call', hex).toHuman();

    return { tag, args, humanReadable };
  }

  /**
   * Retrieve a list of events. Can be filtered using parameters
   *
   * @deprecated
   * @param opts.moduleId - type of the module to fetch
   * @param opts.eventId - type of the event to fetch
   * @param opts.eventArg0 - event parameter value to filter by in position 0
   * @param opts.eventArg1 - event parameter value to filter by in position 1
   * @param opts.eventArg2 - event parameter value to filter by in position 2
   * @param opts.size - page size
   * @param opts.start - page offset
   *
   * @note uses the middlewareV2
   */
  public async getEventsByIndexedArgs(opts: {
    moduleId: ModuleIdEnum;
    eventId: EventIdEnum;
    eventArg0?: string;
    eventArg1?: string;
    eventArg2?: string;
    size?: BigNumber;
    start?: BigNumber;
  }): Promise<EventIdentifier[] | null> {
    const { context } = this;

    const { moduleId, eventId, eventArg0, eventArg1, eventArg2, size, start } = opts;

    const {
      data: {
        events: { nodes: events },
      },
    } = await context.queryMiddleware<Ensured<Query, 'events'>>(
      eventsByArgs(
        {
          moduleId,
          eventId,
          eventArg0,
          eventArg1,
          eventArg2,
        },
        size,
        start
      )
    );

    if (events.length) {
      return events.map(({ block, eventIdx }) =>
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        middlewareEventDetailsToEventIdentifier(block!, eventIdx)
      );
    }

    return null;
  }

  /**
   * Retrieve a transaction by hash
   *
   * @param opts.txHash - hash of the transaction
   *
   * @note uses the middlewareV2
   */
  public async getTransactionByHash(opts: {
    txHash: string;
  }): Promise<ExtrinsicDataWithFees | null> {
    const {
      context: {
        polymeshApi: {
          rpc: {
            chain: { getBlock },
          },
          call,
        },
      },
      context,
    } = this;

    const {
      data: {
        extrinsics: {
          nodes: [transaction],
        },
      },
    } = await context.queryMiddleware<Ensured<Query, 'extrinsics'>>(
      extrinsicByHash({
        extrinsicHash: opts.txHash,
      })
    );

    if (transaction) {
      const {
        extrinsicIdx,
        address: rawAddress,
        nonce,
        moduleId,
        callId,
        paramsTxt,
        success: txSuccess,
        specVersionId,
        extrinsicHash,
        block,
      } = transaction;

      const txTag = extrinsicIdentifierToTxTag({
        moduleId,
        callId,
      });

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const { hash: blockHash, blockId: blockNumber, datetime } = block!;

      const rawBlockHash = stringToBlockHash(blockHash, context);

      const {
        block: { extrinsics: blockExtrinsics },
      } = await getBlock(rawBlockHash);

      // blockExtrinsics is a Vec<Extrinsic> from Polkadot.js, so we can safely access the index
      const extrinsic = blockExtrinsics[extrinsicIdx]!;

      const [{ partialFee }, [protocolFees]] = await Promise.all([
        call.transactionPaymentApi.queryInfo(extrinsic.toHex(), rawBlockHash),
        context.getProtocolFees({ tags: [txTag], blockHash }),
      ]);
      const protocol = protocolFees!.fees;
      const gas = balanceToBigNumber(partialFee);

      return {
        blockNumber: new BigNumber(blockNumber),
        blockHash,
        blockDate: new Date(`${datetime}Z`),
        extrinsicIdx: new BigNumber(extrinsicIdx),
        address: rawAddress ?? null,
        nonce: nonce ? new BigNumber(nonce) : null,
        txTag,
        params: JSON.parse(paramsTxt),
        success: !!txSuccess,
        specVersionId: new BigNumber(specVersionId),
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        extrinsicHash: extrinsicHash!,
        fee: {
          gas,
          protocol,
          total: gas.plus(protocol),
        },
      };
    }

    return null;
  }

  /**
   * Retrieve middleware metadata.
   * Returns null if middleware is disabled
   *
   * @note uses the middleware V2
   */
  public getMiddlewareMetadata(): Promise<MiddlewareMetadata | null> {
    return this.context.getMiddlewareMetadata();
  }

  /**
   * Get the number of blocks the middleware needs to process to be synced with chain.
   * The lag can be around somewhere upto 15 blocks, but this can increase if the block size being processed by the Middleware is too large.
   * If the lag is too large, its recommended to check the indexer health to make sure the Middleware is processing the blocks.
   *
   * @note uses the middleware V2
   */
  public async getMiddlewareLag(): Promise<BigNumber> {
    let lastProcessedBlockFromMiddleware = new BigNumber(0);
    const [latestBlockFromChain, middlewareMetadata] = await Promise.all([
      this.context.getLatestBlock(),
      this.context.getMiddlewareMetadata(),
    ]);

    if (middlewareMetadata) {
      lastProcessedBlockFromMiddleware = middlewareMetadata.lastProcessedHeight;
    }

    return latestBlockFromChain.minus(lastProcessedBlockFromMiddleware);
  }

  /**
   * Returns whether or not the connected chain node as support for confidential assets
   */
  public supportsConfidentialAssets(): boolean {
    const {
      context: {
        polymeshApi: { query },
      },
    } = this;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return !!(query as any).confidentialAsset; // NOSONAR
  }

  /**
   * Returns if functions can be subscribed.
   *
   * @returns `true` if connected over ws(s)://, otherwise `false`
   */
  public supportsSubscription(): boolean {
    const { context } = this;

    return context.supportsSubscription();
  }
}
