import { SubmittableExtrinsic } from '@polkadot/api/types';
import { ISubmittableResult } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';
import P from 'bluebird';

import { handleExtrinsicFailure } from '~/base/utils';
import { Context, PolymeshError, PolymeshTransaction, PolymeshTransactionBase } from '~/internal';
import { ErrorCode, MapTxData } from '~/types';
import {
  BatchTransactionSpec,
  isResolverFunction,
  MapTxDataWithFees,
  MapTxWithArgs,
  TransactionConstructionData,
} from '~/types/internal';
import { transactionToTxTag, u32ToBigNumber } from '~/utils/conversion';
import { filterEventRecords, mergeReceipts } from '~/utils/internal';

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
      TransactionConstructionData,
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

    return utility.batchAll(
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
   * @note batches can't be subsidized. If the caller is subsidized, they should use `splitTransactions` and
   *   run each transaction separately
   */
  public supportsSubsidy(): boolean {
    return false;
  }

  /**
   * Splits this batch into its individual transactions to be run separately. This is useful if the caller is being subsidized,
   *   since batches cannot be run by subsidized Accounts
   *
   * @note the transactions returned by this method must be run in the same order they appear in the array to guarantee the same behavior. If run out of order,
   *   an error will be thrown. The result that would be obtained by running the batch is returned by running the last transaction in the array
   *
   * @example
   *
   * ```typescript
   * const createAssetTx = await sdk.assets.createAsset(...);
   *
   * let ticker: string;
   *
   * if (isPolymeshTransactionBatch<Asset>(createAssetTx)) {
   *   const transactions = createAssetTx.splitTransactions();
   *
   *   for (let i = 0; i < length; i += 1) {
   *     const result = await transactions[i].run();
   *
   *     if (isAsset(result)) {
   *       ({ticker} = result)
   *     }
   *   }
   * } else {
   *   ({ ticker } = await createAssetTx.run());
   * }
   *
   * console.log(`New Asset created! Ticker: ${ticker}`);
   * ```
   */
  public splitTransactions(): (
    | PolymeshTransaction<void>
    | PolymeshTransaction<ReturnValue, TransformedReturnValue>
  )[] {
    const { signingAddress, signer, mortality, context } = this;

    const { transactions, resolver, transformer } =
      PolymeshTransactionBatch.toTransactionSpec(this);

    const receipts: ISubmittableResult[] = [];
    const processedIndexes: number[] = [];

    return transactions.map(({ transaction, args }, index) => {
      const isLast = index === transactions.length - 1;

      const spec = {
        signer,
        signingAddress,
        transaction,
        args,
        mortality,
      };

      let newTransaction;

      /*
       * the last transaction's resolver will pass the merged receipt with all events to the batch's original resolver.
       *   Other transactions will just add their receipts to the list to be merged
       */
      if (isLast) {
        newTransaction = new PolymeshTransaction(
          {
            ...spec,
            resolver: (receipt: ISubmittableResult): ReturnValue | Promise<ReturnValue> => {
              if (isResolverFunction(resolver)) {
                return resolver(mergeReceipts([...receipts, receipt], context));
              }

              return resolver;
            },
            transformer,
          },
          context
        );
      } else {
        newTransaction = new PolymeshTransaction(
          {
            ...spec,
            resolver: (receipt: ISubmittableResult): void => {
              processedIndexes.push(index);
              receipts.push(receipt);
            },
          },
          context
        );
      }

      const originalRun = newTransaction.run.bind(newTransaction);

      newTransaction.run = ((): Promise<TransformedReturnValue> | Promise<void> => {
        const expectedIndex = index - 1;

        // we throw an error if the transactions aren't being run in order
        if (expectedIndex >= 0 && processedIndexes[expectedIndex] !== expectedIndex) {
          throw new PolymeshError({
            code: ErrorCode.General,
            message: 'Transactions resulting from splitting a batch must be run in order',
          });
        }

        return originalRun();
      }) as (() => Promise<TransformedReturnValue>) | (() => Promise<void>);

      return newTransaction;
    });
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
    const [failed] = filterEventRecords(receipt, 'utility', 'BatchInterrupted', true);

    if (failed) {
      const {
        data: [, failedData],
      } = failed;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const failedIndex = u32ToBigNumber((failedData as any)[0]).toNumber();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const dispatchError = (failedData as any)[1];

      const error = handleExtrinsicFailure(dispatchError, { failedIndex });
      reject(error);
    } else {
      resolve(receipt);
    }
  }
}
