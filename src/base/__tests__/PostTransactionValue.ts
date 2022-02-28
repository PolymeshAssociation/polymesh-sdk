import { ISubmittableResult } from '@polkadot/types/types';
import sinon from 'sinon';

import { PostTransactionValue } from '~/internal';

describe('Post Transaction Value class', () => {
  describe('method: run', () => {
    it('should run the provided resolver function with the receipt and assign the resulting value', async () => {
      const receipt = 1 as unknown as ISubmittableResult;
      const resolverFunctionStub = sinon.stub().callsFake(r => Promise.resolve(r));
      const p = new PostTransactionValue<number>(resolverFunctionStub);

      await p.run(receipt);

      sinon.assert.calledWith(resolverFunctionStub, receipt);
      expect(p.value).toBe(receipt);
    });
  });

  describe('method: transform', () => {
    it('should return a new PTV that runs its value through the callback', async () => {
      const receipt = 1 as unknown as ISubmittableResult;
      const resolverFunctionStub = sinon.stub().callsFake(r => Promise.resolve(r));
      const p = new PostTransactionValue<number>(resolverFunctionStub);
      const transformed = p.transform(n => `${n}`);

      await p.run(receipt);

      sinon.assert.calledWith(resolverFunctionStub, receipt);
      expect(transformed.value).toBe('1');
    });
  });

  describe('method: merge', () => {
    it('should return a new PTV that runs both underlying values through the callback', async () => {
      const pReceipt = 1 as unknown as ISubmittableResult;
      const qReceipt = 'a' as unknown as ISubmittableResult;
      const pResolverFunctionStub = sinon.stub().callsFake(r => Promise.resolve(r));
      const qResolverFunctionStub = sinon.stub().callsFake(r => Promise.resolve(r));
      const p = new PostTransactionValue<number>(pResolverFunctionStub);
      const q = new PostTransactionValue<string>(qResolverFunctionStub);
      const merged = p.merge(q, (a, b) => `${a * 2}${b}`);

      await p.run(pReceipt);
      await q.run(qReceipt);

      sinon.assert.calledWith(pResolverFunctionStub, pReceipt);
      sinon.assert.calledWith(qResolverFunctionStub, qReceipt);
      expect(merged.value).toBe('2a');
    });

    it('should accept non PTV values', async () => {
      const receipt = 1 as unknown as ISubmittableResult;
      const resolverFunctionStub = sinon.stub().callsFake(r => Promise.resolve(r));
      const p = new PostTransactionValue<number>(resolverFunctionStub);
      const merged = p.merge('a', (a, b) => `${a * 2}${b}`);

      await p.run(receipt);

      sinon.assert.calledWith(resolverFunctionStub, receipt);
      expect(merged.value).toBe('2a');
    });
  });
});
