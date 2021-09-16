import { SubmittableExtrinsic } from '@polkadot/api/types';
import { ISubmittableResult } from '@polkadot/types/types';

import { Context, PolymeshTransactionBase } from '~/internal';
import { MapMaybePostTransactionValue, TransactionSpec } from '~/types/internal';
import { unwrapValues } from '~/utils/internal';

/**
 * Wrapper class for a Polymesh Transaction
 */
export class PolymeshTransaction<
  Args extends unknown[],
  Values extends unknown[] = unknown[]
> extends PolymeshTransactionBase<Args, Values> {
  /**
   * @hidden
   *
   * unwrapped arguments (available right before execution)
   */
  private unwrappedArgs?: Args;

  /**
   * arguments for the transaction. Available after the transaction starts running
   * (may be Post Transaction Values from a previous transaction in the queue that haven't resolved yet)
   */
  public inputArgs: MapMaybePostTransactionValue<Args>;

  /**
   * @hidden
   */
  constructor(transactionSpec: Omit<TransactionSpec<Args, Values>, 'type'>, context: Context) {
    const { args, batchSize, ...rest } = transactionSpec;

    super(rest, context);

    this.inputArgs = args;
    this.batchSize = batchSize;
  }

  /**
   * Arguments for the transaction
   */
  public get args(): Args {
    if (!this.unwrappedArgs) {
      this.unwrappedArgs = unwrapValues(this.inputArgs);
    }

    return this.unwrappedArgs;
  }

  /**
   * @hidden
   */
  protected composeTx(): SubmittableExtrinsic<'promise', ISubmittableResult> {
    const { tx, args } = this;

    return tx(...args);
  }
}
