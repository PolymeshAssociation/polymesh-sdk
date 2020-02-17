import { SubmittableResultImpl } from '@polymathnetwork/polkadot/api/types';

/**
 * @hidden
 * Represents a value or method that doesn't exist at the moment, but will exist once a certain transaction
 * has been run
 */
export class PostTransactionValue<Value> {
  public value?: Value;

  private resolver: (receipt: SubmittableResultImpl) => Promise<Value | undefined>;

  // eslint-disable-next-line require-jsdoc
  constructor(resolver: (receipt: SubmittableResultImpl) => Promise<Value>) {
    this.resolver = resolver;
  }

  /**
   * Run the resolver function and assign its result to this object
   */
  public async run(receipt: SubmittableResultImpl): Promise<void> {
    const result = await this.resolver(receipt);

    this.value = result;
  }
}
