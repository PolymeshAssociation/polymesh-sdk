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
  TransactionSigningData,
} from '~/types/internal';
import { transactionToTxTag, u32ToBigNumber } from '~/utils/conversion';

/**
 * Wrapper class for a batch of Polymesh Transactions
 */
export class PolymeshTransactionBatch<
  ReturnValue,
  TransformedReturnValue = ReturnValue,
  Args extends unknown[][] = unknown[][]
> extends PolymeshTransactionBase<ReturnValue, TransformedReturnValue> {
  /**
   * @hidden
   */
  public static override toTransactionSpec<R, A extends unknown[][], T>(
    inputTransaction: PolymeshTransactionBatch<R, T, A>
  ): BatchTransactionSpec<R, A, T> {
    const spec = PolymeshTransactionBase.toTransactionSpec(inputTransaction);
    const { transactionData } = inputTransaction;

    return {
      ...spec,
      transactions: transactionData.map(({ transaction, args, fee, feeMultiplier }) => ({
        transaction,
        args,
        fee,
        feeMultiplier,
      })) as MapTxWithArgs<A>,
    };
  }

  /**
   * @hidden
   *
   * underlying transactions to be batched, together with their arguments and other relevant data
   */
  private transactionData: MapTxDataWithFees<Args>;

  /**
   * @hidden
   */
  constructor(
    transactionSpec: BatchTransactionSpec<ReturnValue, Args, TransformedReturnValue> &
      TransactionSigningData,
    context: Context
  ) {
    const { transactions, ...rest } = transactionSpec;

    super(rest, context);

    this.transactionData = transactions.map(({ transaction, args, feeMultiplier, fee }) => ({
      tag: transactionToTxTag(transaction),
      args,
      feeMultiplier,
      transaction,
      fee,
    })) as MapTxDataWithFees<Args>;
  }

  /**
   * transactions in the batch with their respective arguments
   */
  get transactions(): MapTxData<Args> {
    return this.transactionData.map(({ tag, args }) => ({
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
      this.transactionData.map(({ transaction, args }) => transaction(...args))
    );
  }

  /**
   * @hidden
   */
  public getProtocolFees(): Promise<BigNumber> {
    return P.reduce(
      this.transactionData,
      async (total, { tag, feeMultiplier = new BigNumber(1), fee }) => {
        let fees = fee;

        if (!fees) {
          [{ fees }] = await this.context.getProtocolFees({ tags: [tag] });
        }

        return total.plus(fees.multipliedBy(feeMultiplier));
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
