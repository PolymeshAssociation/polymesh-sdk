import { SubmittableExtrinsic } from '@polkadot/api/types';
import { u32 } from '@polkadot/types';
import { DispatchError } from '@polkadot/types/interfaces';
import { ISubmittableResult } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';
import P from 'bluebird';

import { Context, PolymeshTransactionBase } from '~/internal';
import {
  BatchTransactionSpec,
  MapTxData,
  MapTxDataWithFees,
  MapTxWithArgs,
} from '~/types/internal';
import { transactionToTxTag, u32ToBigNumber } from '~/utils/conversion';
import { unwrapValues } from '~/utils/internal';

/**
 * Wrapper class for a batch of Polymesh Transactions
 */
export class PolymeshTransactionBatch<
  Args extends unknown[][] = unknown[][],
  Values extends unknown[] = unknown[]
> extends PolymeshTransactionBase<Values> {
  /**
   * @hidden
   *
   * unwrapped transaction data (available right before execution)
   */
  private unwrappedTransactions?: MapTxDataWithFees<Args>;

  /**
   * @hidden
   *
   * underlying transactions to be batched, together with their respective arguments
   */
  private inputTransactions: MapTxWithArgs<Args>;

  /**
   * @hidden
   */
  constructor(transactionSpec: BatchTransactionSpec<Args, Values>, context: Context) {
    const { transactions, ...rest } = transactionSpec;

    super(rest, context);

    this.inputTransactions = transactions;
  }

  /**
   * @hidden
   */
  private getUnwrappedTransactions(): MapTxDataWithFees<Args> {
    if (!this.unwrappedTransactions) {
      this.unwrappedTransactions = this.inputTransactions.map(
        ({ transaction, args, feeMultiplier }) => ({
          tag: transactionToTxTag(transaction),
          args: unwrapValues(args),
          feeMultiplier,
          transaction,
        })
      ) as MapTxDataWithFees<Args>;
    }

    return this.unwrappedTransactions;
  }

  /**
   * transactions in the batch with their respective arguments
   */
  get transactions(): MapTxData<Args> {
    return this.getUnwrappedTransactions().map(({ tag, args }) => ({
      tag,
      args,
    })) as MapTxData<Args>;
  }

  /**
   * @hidden
   */
  protected composeTx(): SubmittableExtrinsic<'promise', ISubmittableResult> {
    const {
      context: {
        polymeshApi: {
          tx: { utility },
        },
      },
    } = this;

    return utility.batchAtomic(
      this.getUnwrappedTransactions().map(({ transaction, args }) => transaction(...args))
    );
  }

  /**
   * @hidden
   */
  protected getProtocolFees(): Promise<BigNumber> {
    return P.reduce(
      this.getUnwrappedTransactions(),
      async (total, { tag, feeMultiplier = new BigNumber(1) }) => {
        const fee = await this.context.getProtocolFees({ tag });

        return total.plus(fee.multipliedBy(feeMultiplier));
      },
      new BigNumber(0)
    );
  }

  /**
   * @note batches can't be subsidized
   */
  public supportsSubsidy(): boolean {
    return false;
  }

  /**
   * @hidden
   */
  protected override handleExtrinsicSuccess(
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
