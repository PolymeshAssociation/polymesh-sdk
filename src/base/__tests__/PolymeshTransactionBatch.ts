import { Signer as PolkadotSigner } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';
import { noop } from 'lodash';
import sinon from 'sinon';

import { Context, PolymeshTransactionBatch } from '~/internal';
import { fakePromise } from '~/testUtils';
import { dsMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { TransactionStatus, TxTags } from '~/types';
import { tuple } from '~/types/utils';

describe('Polymesh Transaction Batch class', () => {
  let context: Mocked<Context>;

  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance({
      balance: {
        free: new BigNumber(100000),
        locked: new BigNumber(0),
        total: new BigNumber(100000),
      },
    });
  });

  const txSpec = {
    signingAddress: 'signingAddress',
    signer: 'signer' as PolkadotSigner,
    isCritical: false,
    fee: new BigNumber(100),
    nonce: new BigNumber(10),
  };

  afterEach(() => {
    dsMockUtils.reset();
  });

  describe('get: transactions', () => {
    it('should return transactions and their arguments', () => {
      const transaction = dsMockUtils.createTxStub('asset', 'registerTicker');
      const args = tuple('A_TICKER');

      const transactions = [
        {
          transaction,
          args,
        },
      ];

      const tx = new PolymeshTransactionBatch(
        {
          ...txSpec,
          transactions,
          resolver: undefined,
        },
        context
      );

      const expectedResult = [
        {
          tag: TxTags.asset.RegisterTicker,
          args,
        },
      ];

      expect(tx.transactions).toEqual(expectedResult);
    });
  });

  describe('method: run', () => {
    beforeAll(() => {
      dsMockUtils.createRpcStub('chain', 'getBlock', {
        returnValue: dsMockUtils.createMockSignedBlock({
          block: {
            header: {
              number: dsMockUtils.createMockCompact(dsMockUtils.createMockU32(new BigNumber(1))),
              parentHash: 'hash',
              stateRoot: 'hash',
              extrinsicsRoot: 'hash',
            },
            extrinsics: undefined,
          },
        }),
      });
    });
    it('should execute the underlying transaction with the provided arguments, setting the tx and block hash when finished', async () => {
      const transaction = dsMockUtils.createTxStub('asset', 'registerTicker');
      const batchStub = dsMockUtils.createTxStub('utility', 'batchAtomic', { autoResolve: false });
      const args = tuple('A_TICKER');

      const tx = new PolymeshTransactionBatch(
        {
          ...txSpec,
          transactions: [
            {
              transaction,
              args,
            },
          ],
          resolver: undefined,
        },
        context
      );

      tx.run().catch(noop);

      await fakePromise(1);

      dsMockUtils.updateTxStatus(batchStub, dsMockUtils.MockTxStatus.InBlock);

      await fakePromise();

      dsMockUtils.updateTxStatus(batchStub, dsMockUtils.MockTxStatus.Succeeded);

      await fakePromise();

      sinon.assert.calledWith(transaction, ...args);
      expect(tx.blockHash).toBeDefined();
      expect(tx.blockNumber).toBeDefined();
      expect(tx.txHash).toBeDefined();
      expect(tx.status).toBe(TransactionStatus.Succeeded);
    });

    it('should throw an error when one of the transactions in the batch fails', async () => {
      const transaction = dsMockUtils.createTxStub('asset', 'registerTicker');
      const batchStub = dsMockUtils.createTxStub('utility', 'batchAtomic', { autoResolve: false });
      const args = tuple('ANOTHER_TICKER');

      const tx = new PolymeshTransactionBatch(
        {
          ...txSpec,
          transactions: [
            {
              transaction,
              args,
            },
          ],
          resolver: undefined,
        },
        context
      );
      const runPromise = tx.run();

      await fakePromise(1);

      dsMockUtils.updateTxStatus(batchStub, dsMockUtils.MockTxStatus.BatchFailed);

      await expect(runPromise).rejects.toThrow('Unknown error');
      expect(tx.status).toBe(TransactionStatus.Failed);
    });
  });

  describe('method: supportsSubsidy', () => {
    it('should return false', () => {
      const transaction = dsMockUtils.createTxStub('asset', 'registerTicker');
      const args = tuple('A_TICKER');

      const transactions = [
        {
          transaction,
          args,
        },
      ];

      const tx = new PolymeshTransactionBatch(
        {
          ...txSpec,
          transactions,
          resolver: undefined,
        },
        context
      );

      expect(tx.supportsSubsidy()).toBe(false);
    });
  });
});
