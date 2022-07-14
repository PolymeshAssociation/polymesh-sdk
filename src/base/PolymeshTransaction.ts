import { SubmittableExtrinsic } from '@polkadot/api/types';
import { ISubmittableResult } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';

import { Context, PolymeshTransactionBase } from '~/internal';
import { TxTag, TxTags } from '~/types';
import { PolymeshTx, TransactionSigningData, TransactionSpec } from '~/types/internal';
import { transactionToTxTag } from '~/utils/conversion';

/**
 * Wrapper class for a Polymesh Transaction
 */
export class PolymeshTransaction<
  ReturnValue,
  TransformedReturnValue = ReturnValue,
  Args extends unknown[] | [] = unknown[]
> extends PolymeshTransactionBase<ReturnValue, TransformedReturnValue> {
  /**
   * arguments for the transaction in SCALE format (polkadot.js Codec)
   */
  public args: Args;

  /**
   * type of transaction represented by this instance (mostly for display purposes)
   */
  public tag: TxTag;

  /**
   * @hidden
   *
   * underlying transaction to be executed
   */
  private transaction: PolymeshTx<Args>;

  /**
   * @hidden
   *
   * amount by which the protocol fees are multiplied. The total fees of some transactions depend on the size of the input.
   *   For example, when adding documents to an Asset, the fees are proportional to the amount of documents being added
   *
   * @note defaults to 1
   */
  protected feeMultiplier;

  /**
   * @hidden
   */
  constructor(
    transactionSpec: TransactionSpec<ReturnValue, Args, TransformedReturnValue> &
      TransactionSigningData,
    context: Context
  ) {
    const { args = [], feeMultiplier = new BigNumber(1), transaction, ...rest } = transactionSpec;

    super(rest, context);

    this.args = args as Args;
    this.transaction = transaction;
    this.tag = transactionToTxTag(transaction);
    this.feeMultiplier = feeMultiplier;
  }

  // eslint-disable-next-line require-jsdoc
  protected composeTx(): SubmittableExtrinsic<'promise', ISubmittableResult> {
    const { transaction, args } = this;

    return transaction(...args);
  }

  // eslint-disable-next-line require-jsdoc
  protected async getProtocolFees(): Promise<BigNumber> {
    const { tag } = this;
    const [{ fees }] = await this.context.getProtocolFees({ tags: [tag] });

    return fees.multipliedBy(this.feeMultiplier);
  }

  // eslint-disable-next-line require-jsdoc
  protected override ignoresSubsidy(): boolean {
    /*
     * this is the only extrinsic so far that always has to be
     *   paid by the caller
     */
    return this.tag === TxTags.relayer.RemovePayingKey;
  }

  // eslint-disable-next-line require-jsdoc
  public supportsSubsidy(): boolean {
    const { tag, context } = this;

    return context.supportsSubsidy({ tag });
  }
}
