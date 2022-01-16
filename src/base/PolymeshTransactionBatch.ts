import { SubmittableExtrinsic } from '@polkadot/api/types';
import { u32 } from '@polkadot/types';
import { DispatchError } from '@polkadot/types/interfaces';
import { ISubmittableResult } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';

import { Context, PolymeshTransactionBase } from '~/internal';
import { BatchTransactionSpec, MapMaybePostTransactionValue } from '~/types/internal';
import { u32ToBigNumber } from '~/utils/conversion';
import { unwrapValues } from '~/utils/internal';

/**
 * Wrapper class for a batch of Polymesh Transactions
 */
export class PolymeshTransactionBatch<
  Args extends unknown[],
  Values extends unknown[] = unknown[]
> extends PolymeshTransactionBase<Args, Values> {
  /**
   * @hidden
   *
   * unwrapped arguments (available right before execution)
   */
  private unwrappedArgs?: Args[];

  /**
   * @hidden
   *
   * arguments for each transaction in the batch. Available after the transaction starts running
   * (may be Post Transaction Values from a previous transaction in the queue that haven't resolved yet)
   */
  private inputArgs: MapMaybePostTransactionValue<Args>[];

  /**
   * @hidden
   */
  constructor(transactionSpec: BatchTransactionSpec<Args, Values>, context: Context) {
    const { args, ...rest } = transactionSpec;

    super(rest, context);

    this.inputArgs = args;
    this.batchSize = new BigNumber(args.length);
  }

  /**
   * Arguments for each transaction in the batch
   */
  public get args(): Args[] {
    if (!this.unwrappedArgs) {
      this.unwrappedArgs = this.inputArgs.map(arg => unwrapValues(arg));
    }

    return this.unwrappedArgs;
  }

  /**
   * @hidden
   */
  protected composeTx(): SubmittableExtrinsic<'promise', ISubmittableResult> {
    const {
      tx,
      context: {
        polymeshApi: {
          tx: { utility },
        },
      },
      args,
    } = this;

    return utility.batchAtomic(args.map(arg => tx(...arg)));
  }

  /**
   * @hidden
   */
  protected handleExtrinsicSuccess(
    resolve: (value: ISubmittableResult | PromiseLike<ISubmittableResult>) => void,
    reject: (reason?: unknown) => void,
    receipt: ISubmittableResult
  ): void {
    // If one of the transactions in the batch fails, this event gets emitted
    const failed = receipt.findRecord('utility', 'BatchInterrupted');

    if (failed) {
      const {
        event: { data: failedData },
      } = failed;
      const failedIndex = u32ToBigNumber(failedData[0] as u32).toNumber();
      const dispatchError = failedData[1] as DispatchError;

      this.handleExtrinsicFailure(resolve, reject, dispatchError, { failedIndex });
    } else {
      resolve(receipt);
    }
  }
}
