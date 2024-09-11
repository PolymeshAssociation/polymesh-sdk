import { SubmittableExtrinsic } from '@polkadot/api/types';
import { ISubmittableResult } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';

import { Context, PolymeshTransactionBase } from '~/internal';
import { TxTag, TxTags } from '~/types';
import { PolymeshTx, TransactionConstructionData, TransactionSpec } from '~/types/internal';
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
   * @hidden
   */
  public static override toTransactionSpec<R, T, A extends unknown[] | [] = unknown[]>(
    inputTransaction: PolymeshTransaction<R, T, A>
  ): TransactionSpec<R, A, T> {
    const spec = PolymeshTransactionBase.toTransactionSpec(inputTransaction);
    const { transaction, args, protocolFee: fee, feeMultiplier } = inputTransaction;

    return {
      ...spec,
      transaction,
      args,
      fee,
      feeMultiplier,
    } as unknown as TransactionSpec<R, A, T>;
  }

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
  protected feeMultiplier?: BigNumber;

  /**
   * @hidden
   *
   * used by procedures to set the protocol fee manually in case the protocol op can't be
   *   dynamically generated from the transaction name, or a specific procedure has
   *   special rules for calculating them
   */
  private protocolFee?: BigNumber;

  /**
   * @hidden
   */
  constructor(
    transactionSpec: TransactionSpec<ReturnValue, Args, TransformedReturnValue> &
      TransactionConstructionData,
    context: Context
  ) {
    const { args = [], feeMultiplier, transaction, fee, paidForBy, ...rest } = transactionSpec;

    super(rest, context);

    this.args = args as Args;
    this.transaction = transaction;
    this.tag = transactionToTxTag(transaction);
    this.feeMultiplier = feeMultiplier;
    this.protocolFee = fee;
    this.paidForBy = paidForBy;
  }

  // eslint-disable-next-line require-jsdoc
  protected composeTx(): SubmittableExtrinsic<'promise', ISubmittableResult> {
    const { transaction, args } = this;

    return transaction(...args);
  }

  // eslint-disable-next-line require-jsdoc
  public async getProtocolFees(): Promise<BigNumber> {
    const { protocolFee, feeMultiplier = new BigNumber(1) } = this;

    let fees = protocolFee;

    if (!fees) {
      const { tag } = this;
      [{ fees }] = await this.context.getProtocolFees({ tags: [tag] });
    }

    return fees.multipliedBy(feeMultiplier);
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
