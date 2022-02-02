import { AddressOrPair, SubmittableExtrinsic } from '@polkadot/api/types';
import { DispatchError } from '@polkadot/types/interfaces';
import { ISubmittableResult, RegistryError } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';
import { EventEmitter } from 'events';

import { Context, Identity, PolymeshError } from '~/internal';
import { ErrorCode, Fees, PayingAccount, PayingAccountType, TransactionStatus } from '~/types';
import { BaseTransactionSpec, PostTransactionValueArray } from '~/types/internal';
import { balanceToBigNumber, hashToString, u32ToBigNumber } from '~/utils/conversion';

/**
 * @hidden
 */
enum Event {
  StatusChange = 'StatusChange',
}

/**
 * Wrapper class for a Polymesh Transaction
 */
export abstract class PolymeshTransactionBase<Values extends unknown[] = unknown[]> {
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
   * @hidden
   *
   * Identity that will pay for this transaction's fees. This value overrides any subsidy,
   *   and is seen as having infinite allowance (but still constrained by its current balance)
   */
  protected paidForBy?: Identity;

  /**
   * @hidden
   *
   * wrappers for values that will exist after this transaction has executed
   */
  protected postValues: PostTransactionValueArray<Values> =
    [] as unknown as PostTransactionValueArray<Values>;

  /**
   * @hidden
   *
   * internal event emitter to handle status changes
   */
  protected emitter: EventEmitter;

  /**
   * @hidden
   *
   * Account that will sign the transaction
   */
  protected signer: AddressOrPair;

  /**
   * @hidden
   *
   * used by procedures to set the fee manually in case the protocol op can't be
   *   dynamically generated from the transaction name, or a specific procedure has
   *   special rules for calculating them
   */
  protected protocolFee?: BigNumber;

  protected context: Context;

  /**
   * @hidden
   */
  constructor(transactionSpec: BaseTransactionSpec<Values>, context: Context) {
    const { postTransactionValues, signer, isCritical, fee, paidForBy } = transactionSpec;

    if (postTransactionValues) {
      this.postValues = postTransactionValues;
    }

    this.emitter = new EventEmitter();
    this.signer = signer;
    this.isCritical = isCritical;
    this.protocolFee = fee;
    this.context = context;
    this.paidForBy = paidForBy;
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
   * Retrieve the Account that would pay fees for the transaction if it was run at this moment, as well as the total amount that can be
   *   charged to it (allowance). A null allowance means that there is no limit to that amount
   *
   * A null return value signifies that the caller Account would pay the fees
   *
   * @note this value might change if, before running the transaction, the caller Account enters (or leaves)
   *   a subsidizer relationship
   */
  public async getPayingAccount(): Promise<PayingAccount | null> {
    const { paidForBy, context } = this;

    if (this.ignoresSubsidy()) {
      return null;
    }

    if (paidForBy) {
      const { account: primaryAccount } = await paidForBy.getPrimaryAccount();

      return {
        type: PayingAccountType.Other,
        account: primaryAccount,
        allowance: null,
      };
    }

    const subsidy = await context.accountSubsidy();

    if (!subsidy) {
      return null;
    }

    const { subsidizer: account, allowance } = subsidy;

    return {
      type: PayingAccountType.Subsidy,
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
    const { signer } = this;
    let { protocolFee: protocol } = this;

    let composedTx;

    try {
      composedTx = this.composeTx();
    } catch (err) {
      return null;
    }

    const paymentInfoPromise = composedTx.paymentInfo(signer);

    if (!protocol) {
      protocol = await this.getProtocolFees();
    }

    const { partialFee } = await paymentInfoPromise;

    return {
      protocol,
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
   * Return whether the transaction can be subsidized. If the result is false
   *   AND the caller is being subsidized by a third party, the transaction can't be executed and trying
   *   to do so will result in an error
   *
   * @note this depends on the type of transaction itself (i.e. `staking.bond` can't be subsidized, but `asset.createAsset` can)
   */
  public abstract supportsSubsidy(): boolean;

  /**
   * @hidden
   *
   * Compose a Transaction Object with arguments that can be signed
   */
  protected abstract composeTx(): SubmittableExtrinsic<'promise', ISubmittableResult>;

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
   * @hidden
   *
   * Fetch and calculate this transaction's protocol fees
   */
  protected abstract getProtocolFees(): Promise<BigNumber>;

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
