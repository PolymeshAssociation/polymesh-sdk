import { ISubmittableResult } from '@polymathnetwork/polkadot/types/types';

import { PolymeshError } from '~/base';
import { ErrorCode } from '~/types';

/**
 * @hidden
 * Represents a value or method that doesn't exist at the moment, but will exist once a certain transaction
 * has been run
 */
export class PostTransactionValue<Value> {
  private _value?: Value;

  private resolver: (receipt: ISubmittableResult) => Promise<Value | undefined>;

  // eslint-disable-next-line require-jsdoc
  constructor(resolver: (receipt: ISubmittableResult) => Promise<Value>) {
    this.resolver = resolver;
  }

  /**
   * Run the resolver function and assign its result to this object
   */
  public async run(receipt: ISubmittableResult): Promise<void> {
    const result = await this.resolver(receipt);

    this._value = result;
  }

  /**
   * Retrieve the resolved value
   *
   * @throws if the value is being accessed before the resolver function has run (should NEVER happen)
   */
  get value(): Value {
    const { _value } = this;

    /* istanbul ignore if: this should never happen unless we're doing something horribly wrong */
    if (!_value) {
      throw new PolymeshError({
        code: ErrorCode.FatalError,
        message:
          'Post Transaction Value accessed before the corresponding transaction was executed',
      });
    }

    return _value;
  }
}
