import { ISubmittableResult } from '@polymathnetwork/polkadot/types/types';
import sinon from 'sinon';

import { PostTransactionValue } from '~/base';

describe('Post Transaction Value class', () => {
  describe('method: run', () => {
    test('should run the provided resolver function with the receipt and assign the resulting value', async () => {
      const receipt = (1 as unknown) as ISubmittableResult;
      const resolverFunctionStub = sinon.stub().callsFake(receipt => Promise.resolve(receipt));
      const p = new PostTransactionValue<number>(resolverFunctionStub);

      await p.run(receipt);

      sinon.assert.calledWith(resolverFunctionStub, receipt);
      expect(p.value).toBe(receipt);
    });
  });
});
