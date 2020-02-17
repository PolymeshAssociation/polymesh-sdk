import { PostTransactionValue } from '~/base';
import { SubmittableResultImpl } from '@polymathnetwork/polkadot/api/types';
import sinon from 'sinon';

describe('Post Transaction Value class', () => {
  describe('method: run', () => {
    test('should run the provided resolver function with the receipt and assign the resulting value', async () => {
      const receipt = (1 as unknown) as SubmittableResultImpl;
      const resolverFunctionStub = sinon.stub().callsFake(receipt => Promise.resolve(receipt));
      const p = new PostTransactionValue<number>(resolverFunctionStub);

      await p.run(receipt);

      sinon.assert.calledWith(resolverFunctionStub, receipt);
      expect(p.value).toBe(receipt);
    });
  });
});
