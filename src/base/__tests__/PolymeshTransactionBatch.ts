import BigNumber from 'bignumber.js';
import sinon from 'sinon';

import { Context, PolymeshTransactionBatch } from '~/internal';
import { fakePromise } from '~/testUtils';
import { dsMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { TransactionStatus } from '~/types';
import { tuple } from '~/types/utils';

describe('Polymesh Transaction Batch class', () => {
  let context: Mocked<Context>;

  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
  });

  const txSpec = {
    signer: 'signer',
    isCritical: false,
    fee: new BigNumber(100),
    batchSize: null,
    paidByThirdParty: false,
  };

  afterEach(() => {
    dsMockUtils.reset();
  });

  describe('get: args', () => {
    test('should return unwrapped args', () => {
      const tx = dsMockUtils.createTxStub('asset', 'registerTicker');
      const args = [tuple('A_TICKER')];

      const transaction = new PolymeshTransactionBatch(
        {
          ...txSpec,
          tx,
          args,
        },
        context
      );

      expect(transaction.args).toEqual(args);
      expect(transaction.args).toEqual(args); // this second call is to cover the case where the internal value is already set
    });
  });

  describe('method: run', () => {
    test('should execute the underlying transaction with the provided arguments, setting the tx and block hash when finished', async () => {
      const tx = dsMockUtils.createTxStub('asset', 'registerTicker');
      const batchStub = dsMockUtils.createTxStub('utility', 'batchAtomic', { autoresolve: false });
      const args = [tuple('A_TICKER')];

      const transaction = new PolymeshTransactionBatch(
        {
          ...txSpec,
          tx,
          args,
        },
        context
      );

      transaction.run();

      dsMockUtils.updateTxStatus(batchStub, dsMockUtils.MockTxStatus.InBlock);

      await fakePromise();

      dsMockUtils.updateTxStatus(batchStub, dsMockUtils.MockTxStatus.Succeeded);

      await fakePromise();

      sinon.assert.calledWith(tx, ...args[0]);
      sinon.assert.calledOnce(batchStub);
      expect(transaction.blockHash).toBeDefined();
      expect(transaction.blockNumber).toBeDefined();
      expect(transaction.txHash).toBeDefined();
      expect(transaction.status).toBe(TransactionStatus.Succeeded);
    });

    test('should throw an error when one of the transactions in the batch fails', async () => {
      const tx = dsMockUtils.createTxStub('asset', 'registerTicker');
      const batchStub = dsMockUtils.createTxStub('utility', 'batchAtomic', { autoresolve: false });
      const args = [tuple('ANOTHER_TICKER')];

      const transaction = new PolymeshTransactionBatch(
        {
          ...txSpec,
          tx,
          args,
        },
        context
      );
      const runPromise = transaction.run();

      dsMockUtils.updateTxStatus(batchStub, dsMockUtils.MockTxStatus.BatchFailed);

      await expect(runPromise).rejects.toThrow('Unknown error');
      expect(transaction.status).toBe(TransactionStatus.Failed);
    });
  });
});
