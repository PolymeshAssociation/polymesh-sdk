import { ISubmittableResult } from '@polkadot/types/types';

import { PolymeshError } from '~/internal';
import { ErrorCode } from '~/types';
import { MaybePostTransactionValue } from '~/types/internal';

/**
 * @hidden
 *
 * Represents a value or method that doesn't exist at the moment, but will exist once a certain transaction
 *   has been run
 */
export class PostTransactionValue<Value> {
  private _value?: Value;

  private resolved = false;

  private resolver: (receipt: ISubmittableResult) => Promise<Value> | Value;

  private runCondition: () => boolean;

  /**
   * Array of PostTransactionValues spawned by this one via `transform` or `merge`. We use this to keep track
   */
  private children: PostTransactionValue<unknown>[] = [];

  // eslint-disable-next-line require-jsdoc
  constructor(
    resolver: (receipt: ISubmittableResult) => Promise<Value> | Value,
    runCondition: () => boolean = (): boolean => true
  ) {
    this.resolver = resolver;
    this.runCondition = runCondition;
  }

  /**
   * Run the resolver function and assign its result to this object
   */
  public async run(receipt: ISubmittableResult): Promise<void> {
    if (!this.runCondition()) {
      return;
    }

    const result = await this.resolver(receipt);
    this.resolved = true;
    this._value = result;

    await Promise.all(this.children.map(child => child.run(receipt)));
  }

  /**
   * Retrieve the resolved value
   *
   * @throws if the value is being accessed before the resolver function has run
   */
  public get value(): Value {
    const { _value: value, resolved } = this;

    if (!resolved) {
      throw new PolymeshError({
        code: ErrorCode.FatalError,
        message:
          'Post Transaction Value accessed before the corresponding transaction was executed',
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return value!;
  }

  /**
   * Add a new PostTransactionValue to the children array to be run when this one runs
   */
  private addChild(child: PostTransactionValue<unknown>): void {
    this.children.push(child);
  }

  /**
   * Return a new PostTransactionValue that resolves to the value of this one processed by
   *   the passed callback. The new PostTransactionValue is resolved when this one is resolved
   */
  public transform<NewValue>(callback: (val: Value) => NewValue): PostTransactionValue<NewValue> {
    const newResolver = (): NewValue => {
      return callback(this.value);
    };

    const child = new PostTransactionValue(newResolver);
    this.addChild(child);

    return child;
  }

  /**
   * Merge this PostTransactionValue with another PostTransactionValue (or plain value), resulting in a new
   *   PostTransactionValue that resolves once these two are resolved. The resolved value is the result of passing the
   *   resolved values of both PostTransactionValues to the callback
   */
  public merge<PostValue, NewValue>(
    postValue: MaybePostTransactionValue<PostValue>,
    // cSpell: disable-next-line
    callback: (val: Value, pval: PostValue) => NewValue
  ): PostTransactionValue<NewValue> {
    let newResolver;
    let runCondition;

    // do nothing on .run unless both underlying values have been resolved
    if (postValue instanceof PostTransactionValue) {
      newResolver = (): NewValue => callback(this.value, postValue.value);
      runCondition = (): boolean => this.resolved && postValue.resolved;
    } else {
      newResolver = (): NewValue => callback(this.value, postValue);
      runCondition = (): boolean => this.resolved;
    }

    const child = new PostTransactionValue(newResolver, runCondition);
    this.addChild(child);

    if (postValue instanceof PostTransactionValue) {
      postValue.addChild(child);
    }

    return child;
  }
}
