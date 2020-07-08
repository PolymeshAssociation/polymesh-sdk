import { ISubmittableResult } from '@polkadot/types/types';

import { PolymeshError } from '~/base';
import { ErrorCode } from '~/types';

/**
 * @hidden
 * Represents a value or method that doesn't exist at the moment, but will exist once a certain transaction
 * has been run
 */
export class PostTransactionValue<Value> {
  private _value?: Value;

  private resolved = false;

  private resolver: (receipt: ISubmittableResult) => Promise<Value> | Value;

  // eslint-disable-next-line require-jsdoc
  constructor(resolver: (receipt: ISubmittableResult) => Promise<Value> | Value) {
    this.resolver = resolver;
  }

  /**
   * Run the resolver function and assign its result to this object
   */
  public async run(receipt: ISubmittableResult): Promise<void> {
    const result = await this.resolver(receipt);
    this.resolved = true;
    this._value = result;
  }

  /**
   * Retrieve the resolved value
   *
   * @throws if the value is being accessed before the resolver function has run
   */
  public get value(): Value {
    const { _value, resolved } = this;

    if (!resolved) {
      throw new PolymeshError({
        code: ErrorCode.FatalError,
        message:
          'Post Transaction Value accessed before the corresponding transaction was executed',
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return _value!;
  }
}
