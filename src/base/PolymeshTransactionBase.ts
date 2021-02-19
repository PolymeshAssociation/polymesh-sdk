import { AddressOrPair, SubmittableExtrinsic } from '@polkadot/api/types';
import { DispatchError } from '@polkadot/types/interfaces';
import { ISubmittableResult, RegistryError } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';
import { EventEmitter } from 'events';
import { TxTag } from 'polymesh-types/types';

import { Context, PolymeshError, PostTransactionValue } from '~/internal';
import { ErrorCode, Fees, TransactionStatus } from '~/types';
import {
  BaseTransactionSpec,
  MaybePostTransactionValue,
  PolymeshTx,
  PostTransactionValueArray,
} from '~/types/internal';
import { balanceToBigNumber, transactionToTxTag } from '~/utils/conversion';

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
   * whether this tx failing makes the entire tx queue fail or not
   */
  public isCritical: boolean;

  /**
   * whether the fees for this tx are paid by a third party.
   *   For example, when accepting/rejecting a request to join an Identity, fees are paid by the Identity that sent the request
   */
  public paidByThirdParty: boolean;

  /**
   * @hidden
   *
   * underlying transaction to be executed
   */
  protected tx: MaybePostTransactionValue<PolymeshTx<Args>>;

  /**
   * @hidden
   *
   * number of elements in the batch (only applicable to batch transactions)
   */
  protected batchSize: number | null;

  /**
   * @hidden
   *
   * type of transaction represented by this instance for display purposes.
   * If the transaction isn't defined at design time, the tag won't be set (will be empty string) until the transaction is about to be run
   */
  protected _tag = '' as TxTag;

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
   * dynamically generated from the transaction name
   */
  protected protocolFee: BigNumber | null;

  protected context: Context;

  /**
   * @hidden
   */
  constructor(transactionSpec: BaseTransactionSpec<Args, Values>, context: Context) {
    const {
      postTransactionValues,
      tx,
      signer,
      isCritical,
      fee,
      paidByThirdParty,
    } = transactionSpec;

    if (postTransactionValues) {
      this.postValues = postTransactionValues;
    }

    this.emitter = new EventEmitter();
    this.tx = tx;
    this.signer = signer;
    this.isCritical = isCritical;
    this.protocolFee = fee;
    this.context = context;
    this.paidByThirdParty = paidByThirdParty;
    this.batchSize = null;

    this.setTag();
  }

  /**
   * Run the poly transaction and update the transaction status
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
   * throwing any pertinent errors
   */
  private internalRun(): Promise<ISubmittableResult> {
    this.updateStatus(TransactionStatus.Unapproved);

    this.setTag();

    return new Promise((resolve, reject) => {
      const txWithArgs = this.composeTx();
      const gettingUnsub = txWithArgs.signAndSend(this.signer, receipt => {
        const { status } = receipt;
        let unsubscribe = false;

        if (receipt.isCompleted) {
          // isCompleted === isFinalized || isInBlock || isError

          // TODO @monitz87: replace with event object when it is auto-generated by the polkadot fork
          const failed = receipt.findRecord('system', 'ExtrinsicFailed');

          if (receipt.isInBlock) {
            // tx included in a block
            this.blockHash = status.asInBlock.toString();

            if (failed) {
              unsubscribe = true;
              this.handleExtrinsicFailure(resolve, reject, failed.event.data[0] as DispatchError);
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
            // tx finalized
            this.handleExtrinsicSuccess(resolve, reject, receipt);
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
            error = { code: ErrorCode.FatalError, message: err.message };
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
   * Get all (protocol and gas) fees associated with this transaction. Returns null
   * if the transaction is not ready yet (this can happen if it depends on the execution of a
   * previous transaction in the queue)
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

    const { partialFee } = await composedTx.paymentInfo(signer);

    if (!protocolFee) {
      protocolFee = await context.getTransactionFees(this.tag);
    }

    return {
      protocol: protocolFee.multipliedBy(this.batchSize || 1),
      gas: balanceToBigNumber(partialFee),
    };
  }

  /**
   * type of transaction represented by this instance for display purposes.
   * If the transaction isn't defined at design time, the tag won't be set (will be empty string) until the transaction is about to be run
   */
  public get tag(): TxTag {
    this.setTag();

    return this._tag;
  }

  /**
   * @hidden
   *
   * Set transaction tag if available and it hasn't been set yet
   */
  protected setTag(): void {
    if (this._tag) {
      return;
    }

    const { tx } = this;
    let transaction;
    if (tx instanceof PostTransactionValue) {
      try {
        transaction = tx.value;
      } catch (err) {
        return;
      }
    } else {
      transaction = tx;
    }

    this._tag = transactionToTxTag(transaction);
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
    _resolve: (value?: ISubmittableResult | PromiseLike<ISubmittableResult> | undefined) => void,
    reject: (reason?: unknown) => void,
    error: DispatchError,
    data?: Record<string, unknown>
  ): void {
    // get revert message from event
    let message: string;

    if (error.isModule) {
      // known error
      const mod = error.asModule;

      const { section, name, documentation }: RegistryError = mod.registry.findMetaError(mod);
      message = `${section}.${name}: ${documentation.join(' ')}`;
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
    resolve: (value?: ISubmittableResult | PromiseLike<ISubmittableResult> | undefined) => void,
    _reject: (reason?: unknown) => void,
    receipt: ISubmittableResult
  ): void {
    resolve(receipt);
  }
}
