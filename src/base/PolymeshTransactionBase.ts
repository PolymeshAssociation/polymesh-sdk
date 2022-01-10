import { AddressOrPair, SubmittableExtrinsic } from '@polkadot/api/types';
import { DispatchError } from '@polkadot/types/interfaces';
import { ISubmittableResult, RegistryError } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';
import { EventEmitter } from 'events';
import { TxTag, TxTags } from 'polymesh-types/types';

import { Account, Context, Identity, PolymeshError } from '~/internal';
import { ErrorCode, Fees, TransactionStatus } from '~/types';
import { BaseTransactionSpec, PolymeshTx, PostTransactionValueArray } from '~/types/internal';
import {
  balanceToBigNumber,
  hashToString,
  signerToString,
  transactionToTxTag,
  u32ToBigNumber,
} from '~/utils/conversion';

/**
 * @hidden
 */
enum Event {
  StatusChange = 'StatusChange',
}

/**
 * Wrapper class for a Polymesh Transaction
 */
export abstract class PolymeshTransactionBase<
  Args extends unknown[],
  Values extends unknown[] = unknown[]
> {
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
   * hash of the block where this transaction resides (status: `Succeeded`, `Failed`)
   */
  public blockHash?: string;

  /**
   * number of the block where this transaction resides (status: `Succeeded`, `Failed`)
   */
  public blockNumber?: BigNumber;

  /**
   * whether this transaction failing makes the entire transaction queue fail or not
   */
  public isCritical: boolean;

  /**
   * type of transaction represented by this instance (mostly for display purposes)
   */
  public tag: TxTag;

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
   * underlying transaction to be executed
   */
  protected tx: PolymeshTx<Args>;

  /**
   * @hidden
   *
   * number of elements in the batch (only applicable to batch transactions)
   */
  protected batchSize: number | null;

  /**
   * @hidden
   *
   * wrappers for values that will exist after this transaction has executed
   */
  protected postValues: PostTransactionValueArray<Values> = ([] as unknown) as PostTransactionValueArray<Values>;

  /**
   * @hidden
   *
   * internal event emitter to handle status changes
   */
  protected emitter: EventEmitter;

  /**
   * @hidden
   *
   * account that will sign the transaction
   */
  protected signer: AddressOrPair;

  /**
   * @hidden
   *
   * used by procedures to set the fee manually in case the protocol op can't be
   *   dynamically generated from the transaction name
   */
  protected protocolFee: BigNumber | null;

  protected context: Context;

  /**
   * @hidden
   *
   * Promise to set the block number. Must be resolved before marking an extrinsic as succeeded or failed
   */
  private settingBlockData?: Promise<void>;

  /**
   * @hidden
   */
  constructor(transactionSpec: BaseTransactionSpec<Args, Values>, context: Context) {
    const { postTransactionValues, tx, signer, isCritical, fee, paidForBy } = transactionSpec;

    if (postTransactionValues) {
      this.postValues = postTransactionValues;
    }

    this.emitter = new EventEmitter();
    this.tx = tx;
    this.tag = transactionToTxTag(tx);
    this.signer = signer;
    this.isCritical = isCritical;
    this.protocolFee = fee;
    this.context = context;
    this.paidForBy = paidForBy;
    this.batchSize = null;
  }

  /**
   * Run the transaction and update its status
   */
  public async run(): Promise<void> {
    try {
      const receipt = await this.internalRun();
      this.receipt = receipt;

      await Promise.all(this.postValues.map(postValue => postValue.run(receipt)));

      this.updateStatus(TransactionStatus.Succeeded);
    } catch (err) {
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
  }

  /**
   * @hidden
   *
   * Execute the underlying transaction, updating the status where applicable and
   *   throwing any pertinent errors
   */
  private async internalRun(): Promise<ISubmittableResult> {
    this.updateStatus(TransactionStatus.Unapproved);

    return new Promise((resolve, reject) => {
      const txWithArgs = this.composeTx();
      let settingBlockData = Promise.resolve();

      const gettingUnsub = txWithArgs.signAndSend(this.signer, receipt => {
        const { status } = receipt;
        let unsubscribe = false;

        // isCompleted === isFinalized || isInBlock || isError
        if (receipt.isCompleted) {
          if (receipt.isInBlock) {
            const blockHash = status.asInBlock;

            /*
             * this must be done to ensure that the block hash and number are set before the success event
             *   is emitted, and at the same time. We do not resolve or reject the containing promise until this
             *   one resolves
             */
            settingBlockData = this.context.polymeshApi.rpc.chain
              .getBlock(blockHash)
              .then(({ block }) => {
                this.blockHash = hashToString(blockHash);
                this.blockNumber = u32ToBigNumber(block.header.number.unwrap());
              });

            const failed = receipt.findRecord('system', 'ExtrinsicFailed');

            if (failed) {
              unsubscribe = true;
              settingBlockData.then(() => {
                this.handleExtrinsicFailure(resolve, reject, failed.event.data[0] as DispatchError);
              });
            }
          } else {
            unsubscribe = true;
          }

          if (unsubscribe) {
            gettingUnsub.then(unsub => {
              unsub();
            });
          }

          if (receipt.isFinalized) {
            settingBlockData.then(() => {
              this.handleExtrinsicSuccess(resolve, reject, receipt);
            });
          }

          if (receipt.isError) {
            reject(new PolymeshError({ code: ErrorCode.TransactionAborted }));
          }
        }
      });

      gettingUnsub
        .then(() => {
          // tx approved by signer
          this.updateStatus(TransactionStatus.Running);
          this.txHash = txWithArgs.hash.toString();
        })
        .catch((err: Error) => {
          let error;
          /* istanbul ignore else */
          if (err.message.indexOf('Cancelled') > -1) {
            // tx rejected by signer
            error = { code: ErrorCode.TransactionRejectedByUser };
          } else {
            // unexpected error
            error = { code: ErrorCode.UnexpectedError, message: err.message };
          }

          reject(new PolymeshError(error));
        });
    });
  }

  /**
   * Subscribe to status changes
   *
   * @param listener - callback function that will be called whenever the status changes
   *
   * @returns unsubscribe function
   */
  public onStatusChange(listener: (transaction: this) => void): () => void {
    this.emitter.on(Event.StatusChange, listener);

    return (): void => {
      this.emitter.removeListener(Event.StatusChange, listener);
    };
  }

  /**
   * Retrieve the Account that would pay for the transaction fees if it was run at this moment, as well as the maximum amount that can be
   *   charged to it. A null allowance means that there is no limit to that amount
   *
   * A null return value signifies that the current Account will pay for the fees
   *
   * @note this value might change if, before running the transaction, the current Account enters (or leaves)
   *   a subsidizer relationship
   */
  public async getPayingAccount(): Promise<{
    account: Account;
    allowance: BigNumber | null;
  } | null> {
    const { paidForBy, context, tag } = this;

    if (paidForBy) {
      const { signer } = await paidForBy.getPrimaryKey();

      return {
        account: new Account({ address: signerToString(signer) }, context),
        allowance: null,
      };
    }

    const subsidy = await context.accountSubsidy();

    // `relayer.removePayingKey` is always paid by the caller
    if (!subsidy || tag === TxTags.relayer.RemovePayingKey) {
      return null;
    }

    const { subsidizer: account, allowance } = subsidy;

    return {
      account,
      allowance,
    };
  }

  /**
   * Get all (protocol and gas) fees associated with this transaction. Returns null
   * if the transaction is not ready yet (this can happen if it depends on the execution of a
   * previous transaction in the queue)
   *
   * @note this value might change if the transaction is run at a later time. This can be due to a governance vote
   */
  public async getFees(): Promise<Fees | null> {
    const { signer, context } = this;
    let { protocolFee } = this;

    let composedTx;

    try {
      composedTx = this.composeTx();
    } catch (err) {
      return null;
    }

    const paymentInfoPromise = composedTx.paymentInfo(signer);

    if (!protocolFee) {
      protocolFee = await context.getTransactionFees(this.tag);
    }

    const { partialFee } = await paymentInfoPromise;

    return {
      protocol: protocolFee.multipliedBy(this.batchSize || 1),
      gas: balanceToBigNumber(partialFee),
    };
  }

  /**
   * @hidden
   */
  protected updateStatus(status: TransactionStatus): void {
    this.status = status;

    /* eslint-disable default-case */
    switch (status) {
      case TransactionStatus.Unapproved:
      case TransactionStatus.Running:
      case TransactionStatus.Succeeded: {
        this.emitter.emit(Event.StatusChange, this);
        return;
      }
      case TransactionStatus.Rejected:
      case TransactionStatus.Aborted:
      case TransactionStatus.Failed: {
        this.emitter.emit(Event.StatusChange, this, this.error);
      }
    }
    /* eslint-enable default-case */
  }

  /**
   * @hidden
   *
   * Compose a Transaction Object with arguments that can be signed
   */
  protected abstract composeTx(): SubmittableExtrinsic<'promise', ISubmittableResult>;

  /**
   * @hidden
   */
  protected handleExtrinsicFailure(
    _resolve: (value: ISubmittableResult | PromiseLike<ISubmittableResult>) => void,
    reject: (reason?: unknown) => void,
    error: DispatchError,
    data?: Record<string, unknown>
  ): void {
    // get revert message from event
    let message: string;

    if (error.isModule) {
      // known error
      const mod = error.asModule;

      const { section, name, docs }: RegistryError = mod.registry.findMetaError(mod);
      message = `${section}.${name}: ${docs.join(' ')}`;
    } else if (error.isBadOrigin) {
      message = 'Bad origin';
    } else if (error.isCannotLookup) {
      message = 'Could not lookup information required to validate the transaction';
    } else {
      message = 'Unknown error';
    }

    reject(new PolymeshError({ code: ErrorCode.TransactionReverted, message, data }));
  }

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
}
