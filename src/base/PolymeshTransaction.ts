import { AddressOrPair, TxTag } from '@polymathnetwork/polkadot/api/types';
import { DispatchError } from '@polymathnetwork/polkadot/types/interfaces';
import { ISubmittableResult, RegistryError } from '@polymathnetwork/polkadot/types/types';
import { EventEmitter } from 'events';

import { PolymeshError } from '~/base';
import { ErrorCode, TransactionStatus } from '~/types';
import {
  MapMaybePostTransactionValue,
  MaybePostTransactionValue,
  PolymeshTx,
  PostTransactionValueArray,
  TransactionSpec,
} from '~/types/internal';
import { unwrapValue, unwrapValues } from '~/utils';

enum Event {
  StatusChange = 'StatusChange',
}

/**
 * Wrapper class for a Polymesh Transaction
 */
export class PolymeshTransaction<Args extends unknown[], Values extends unknown[] = unknown[]> {
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
   * type of transaction represented by this instance for display purposes
   */
  public tag: TxTag;

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
   * arguments arguments for the transaction. Available after the transaction starts running
   * (may be Post Transaction Values from a previous transaction in the queue that haven't resolved yet)
   */
  public args: MapMaybePostTransactionValue<Args>;

  /**
   * @hidden
   *
   * underlying transaction to be executed
   */
  private tx: MaybePostTransactionValue<PolymeshTx<Args>>;

  /**
   * @hidden
   *
   * wrappers for values that will exist after this transaction has executed
   */
  private postValues: PostTransactionValueArray<
    Values
  > = ([] as unknown) as PostTransactionValueArray<Values>;

  /**
   * @hidden
   *
   * internal event emitter to handle status changes
   */
  private emitter: EventEmitter;

  /**
   * @hidden
   *
   * account that will sign the transaction
   */
  private signer: AddressOrPair;

  /**
   * @hidden
   */
  constructor(transactionSpec: TransactionSpec<Args, Values>) {
    const { postTransactionValues, tag, tx, args, signer, isCritical } = transactionSpec;

    if (postTransactionValues) {
      this.postValues = postTransactionValues;
    }

    this.emitter = new EventEmitter();
    this.tag = tag;
    this.tx = tx;
    this.args = args;
    this.signer = signer;
    this.isCritical = isCritical;
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
   * @hidden
   *
   * Execute the underlying transaction, updating the status where applicable and
   * throwing any pertinent errors
   */
  private async internalRun(): Promise<ISubmittableResult> {
    this.updateStatus(TransactionStatus.Unapproved);

    const { tx: wrappedTx } = this;
    const unwrappedArgs = unwrapValues(this.args);
    const tx = unwrapValue(wrappedTx);
    this.args = unwrappedArgs;

    const gettingReceipt: Promise<ISubmittableResult> = new Promise((resolve, reject) => {
      const txWithArgs = tx(...unwrappedArgs);
      const gettingUnsub = txWithArgs.signAndSend(this.signer, receipt => {
        const { status } = receipt;

        if (receipt.isCompleted) {
          /*
           * isCompleted === isInBlock || isError, which means
           * no further updates, so we unsubscribe
           */
          gettingUnsub.then(unsub => {
            unsub();
          });

          if (receipt.isInBlock) {
            // tx included in a block
            // TODO @monitz87: replace with event object when it is auto-generated by the polkadot fork
            const failed = receipt.findRecord('system', 'ExtrinsicFailed');

            this.blockHash = status.asInBlock.toString();

            if (failed) {
              // get revert message from event
              let message: string;
              const dispatchError = failed.event.data[0] as DispatchError;

              if (dispatchError.isModule) {
                // known error
                const mod = dispatchError.asModule;

                const { section, name, documentation }: RegistryError = mod.registry.findMetaError(
                  new Uint8Array([mod.index.toNumber(), mod.error.toNumber()])
                );
                message = `${section}.${name}: ${documentation.join(' ')}`;
              } else if (dispatchError.isBadOrigin) {
                message = 'Bad origin';
              } else if (dispatchError.isCannotLookup) {
                message = 'Could not lookup information required to validate the transaction';
              } else {
                message = 'Unknown error';
              }

              reject(new PolymeshError({ code: ErrorCode.TransactionReverted, message }));
            } else {
              resolve(receipt);
            }
          } else {
            // this means receipt.isError === true
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

    return gettingReceipt;
  }

  /**
   * @hidden
   */
  private updateStatus(status: TransactionStatus): void {
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
}
