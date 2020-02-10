import { PostTransactionResolver } from '~/base';
import { SubmittableResultImpl } from '@polymathnetwork/polkadot/api/types';

describe('Post Transaction Resolver class', () => {
  test('should run the provided resolver function with the receipt and assign the result', async () => {
    type Value = number;
    const receipt = (1 as unknown) as SubmittableResultImpl;
    const fakeResolverFunction = jest.fn(receipt => Promise.resolve(receipt));
    const p = new PostTransactionResolver<Value>(fakeResolverFunction);

    await p.run(receipt);

    expect(fakeResolverFunction).toHaveBeenCalledWith(receipt);
    expect(p.result).toBe(receipt);
  });
});
