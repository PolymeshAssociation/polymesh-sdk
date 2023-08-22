import { Signer as PolkadotSigner } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';
import { noop } from 'lodash';

import { Context, PolymeshTransactionBatch } from '~/internal';
import { fakePromise } from '~/testUtils';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { TransactionStatus, TxTags } from '~/types';
import { tuple } from '~/types/utils';

describe('Polymesh Transaction Batch class', () => {
  let context: Mocked<Context>;

  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();
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
    mortality: { immortal: false } as const,
  };

  afterEach(() => {
    dsMockUtils.reset();
    entityMockUtils.reset();
  });

  describe('method: toTransactionSpec', () => {
    it('should return the tx spec of a transaction', () => {
      const transaction = dsMockUtils.createTxMock('asset', 'registerTicker');
      const args = tuple('FOO');
      const resolver = (): number => 1;
      const transformer = (): number => 2;
      const paidForBy = entityMockUtils.getIdentityInstance();

      const tx = new PolymeshTransactionBatch(
        {
          ...txSpec,
          transactions: [
            { transaction, args, fee: new BigNumber(100), feeMultiplier: new BigNumber(10) },
          ],
          resolver,
          transformer,
          paidForBy,
        },
        context
      );

      expect(PolymeshTransactionBatch.toTransactionSpec(tx)).toEqual({
        resolver,
        transformer,
        paidForBy,
        transactions: [
          {
            transaction,
            args,
            feeMultiplier: new BigNumber(10),
            fee: new BigNumber(100),
          },
        ],
      });
    });
  });

  describe('get: transactions', () => {
    it('should return transactions and their arguments', () => {
      const transaction = dsMockUtils.createTxMock('asset', 'registerTicker');
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
      dsMockUtils.createRpcMock('chain', 'getBlock', {
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
      const transaction = dsMockUtils.createTxMock('asset', 'registerTicker');
      const batchMock = dsMockUtils.createTxMock('utility', 'batchAtomic', { autoResolve: false });
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

      await fakePromise(2);

      dsMockUtils.updateTxStatus(batchMock, dsMockUtils.MockTxStatus.InBlock);

      await fakePromise();

      dsMockUtils.updateTxStatus(batchMock, dsMockUtils.MockTxStatus.Succeeded);

      await fakePromise();

      expect(transaction).toHaveBeenCalledWith(...args);
      expect(tx.blockHash).toBeDefined();
      expect(tx.blockNumber).toBeDefined();
      expect(tx.txHash).toBeDefined();
      expect(tx.status).toBe(TransactionStatus.Succeeded);
    });

    it('should throw an error when one of the transactions in the batch fails', async () => {
      const transaction = dsMockUtils.createTxMock('asset', 'registerTicker');
      const batchMock = dsMockUtils.createTxMock('utility', 'batchAtomic', {
        autoResolve: false,
      });
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

      await fakePromise(2);

      dsMockUtils.updateTxStatus(batchMock, dsMockUtils.MockTxStatus.BatchFailed);

      await expect(runPromise).rejects.toThrow('Unknown error');
      expect(tx.status).toBe(TransactionStatus.Failed);
    });
  });

  describe('method: supportsSubsidy', () => {
    it('should return false', () => {
      const transaction = dsMockUtils.createTxMock('asset', 'registerTicker');
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

  describe('method: splitTransactions', () => {
    it('should return an array of the individual transactions in the batch', async () => {
      const tx1 = dsMockUtils.createTxMock('asset', 'registerTicker');
      const tx2 = dsMockUtils.createTxMock('asset', 'createAsset');
      const args = tuple('A_TICKER');

      const transactions = [
        {
          transaction: tx1,
          args,
        },
        {
          transaction: tx2,
          args,
        },
      ];

      const batch1 = new PolymeshTransactionBatch(
        {
          ...txSpec,
          transactions,
          resolver: (): number => 1,
        },
        context
      );

      const splitTransactions1 = batch1.splitTransactions();

      expect(splitTransactions1.length).toBe(2);

      const result1a = await splitTransactions1[0].run();
      const result1b = await splitTransactions1[1].run();

      expect(result1a).toBe(undefined);
      expect(result1b).toBe(1);

      const batch2 = new PolymeshTransactionBatch(
        {
          ...txSpec,
          transactions,
          resolver: 'foo',
        },
        context
      );

      const splitTransactions2 = batch2.splitTransactions();

      expect(splitTransactions2.length).toBe(2);

      const result2a = await splitTransactions2[0].run();
      const result2b = await splitTransactions2[1].run();

      expect(result2a).toBe(undefined);
      expect(result2b).toBe('foo');
    });

    it('should ensure transactions are run in the same order as they come in the batch', () => {
      const tx1 = dsMockUtils.createTxMock('asset', 'registerTicker');
      const tx2 = dsMockUtils.createTxMock('asset', 'createAsset');
      const args = tuple('A_TICKER');

      const transactions = [
        {
          transaction: tx1,
          args,
        },
        {
          transaction: tx2,
          args,
        },
      ];

      const batch = new PolymeshTransactionBatch(
        {
          ...txSpec,
          transactions,
          resolver: (): number => 1,
        },
        context
      );

      const splitTransactions = batch.splitTransactions();

      expect(() => splitTransactions[1].run()).toThrow(
        'Transactions resulting from splitting a batch must be run in order'
      );
    });
  });
});
