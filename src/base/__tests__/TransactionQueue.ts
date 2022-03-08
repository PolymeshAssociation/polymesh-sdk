import { ISubmittableResult } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';
import { noop } from 'lodash';
import sinon from 'sinon';

import { Context, PostTransactionValue, TransactionQueue } from '~/internal';
import { latestProcessedBlock } from '~/middleware/queries';
import { fakePromise, fakePromises } from '~/testUtils';
import { dsMockUtils, entityMockUtils, polymeshTransactionMockUtils } from '~/testUtils/mocks';
import { PayingAccountType, TransactionQueueStatus, TransactionStatus } from '~/types';

jest.mock(
  '~/base/PolymeshTransaction',
  require('~/testUtils/mocks/polymeshTransaction').mockPolymeshTransactionModule(
    '~/base/PolymeshTransaction'
  )
);

describe('Transaction Queue class', () => {
  let context: Context;

  beforeAll(() => {
    jest.useFakeTimers('legacy');
    polymeshTransactionMockUtils.initMocks();
    entityMockUtils.initMocks();
    dsMockUtils.initMocks({ contextOptions: { middlewareEnabled: false } });
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
  });

  afterEach(() => {
    polymeshTransactionMockUtils.reset();
    entityMockUtils.reset();
    dsMockUtils.reset();
  });

  afterAll(() => {
    jest.useRealTimers();
    dsMockUtils.cleanup();
  });

  describe('constructor', () => {
    it('should set the arguments, fees and list of transactions', () => {
      const transactionSpecs = [
        {
          args: [1],
          isCritical: false,
          autoResolve: TransactionStatus.Succeeded as TransactionStatus.Succeeded,
        },
      ];
      const transactions = polymeshTransactionMockUtils.setupNextTransactions(transactionSpecs);
      const procedureResult = 3;
      const queue = new TransactionQueue({ transactions, procedureResult }, context);
      expect(queue.transactions).toEqual(transactions);
    });
  });

  describe('method: run', () => {
    it("should run each transaction in the queue and return the queue's return value, unwrapping it if it is a PostTransactionValue and transforming it if there is a transform function", async () => {
      const transactionSpecs = [
        {
          args: [1],
          isCritical: false,
          autoResolve: TransactionStatus.Succeeded as TransactionStatus.Succeeded,
        },
        {
          args: ['someArg'],
          isCritical: true,
          autoResolve: TransactionStatus.Succeeded as TransactionStatus.Succeeded,
        },
      ];

      let transactions = polymeshTransactionMockUtils.setupNextTransactions(transactionSpecs);

      const procedureResult = new BigNumber(3);
      let queue = new TransactionQueue(
        { transactions, procedureResult, transformer: (val: BigNumber): string => val.toString() },
        context
      );

      let returned = await queue.run();

      expect(returned).toBe('3');
      transactions.forEach(transaction => {
        sinon.assert.calledOnce(transaction.run);
      });

      transactions = polymeshTransactionMockUtils.setupNextTransactions(transactionSpecs);

      const returnPostTransactionValue = new PostTransactionValue(() =>
        Promise.resolve(procedureResult)
      );
      await returnPostTransactionValue.run({} as ISubmittableResult);

      queue = new TransactionQueue(
        { transactions, procedureResult: returnPostTransactionValue },
        context
      );

      returned = await queue.run();

      expect(returned).toBe(procedureResult);
    });

    it('should update the queue status', async () => {
      const transactionSpecs = [
        {
          args: [12],
          isCritical: true,
          autoResolve: false as const,
        },
      ];
      let transactions = polymeshTransactionMockUtils.setupNextTransactions(transactionSpecs);
      const procedureResult = 3;
      let queue = new TransactionQueue({ transactions, procedureResult }, context);

      // Idle -> Running -> Succeeded
      expect(queue.status).toBe(TransactionQueueStatus.Idle);

      queue.run();

      await fakePromise();

      expect(queue.status).toBe(TransactionQueueStatus.Running);

      polymeshTransactionMockUtils.updateTransactionStatus(
        transactions[0],
        TransactionStatus.Succeeded
      );

      await fakePromise();

      expect(queue.status).toBe(TransactionQueueStatus.Succeeded);

      transactions = polymeshTransactionMockUtils.setupNextTransactions(transactionSpecs);

      // Idle -> Running -> Failed
      queue = new TransactionQueue({ transactions, procedureResult }, context);

      queue.run().catch(noop);

      await fakePromise();

      polymeshTransactionMockUtils.updateTransactionStatus(
        transactions[0],
        TransactionStatus.Failed
      );
      await fakePromise();

      expect(queue.status).toBe(TransactionQueueStatus.Failed);
    });

    it('should throw an error if a critical transaction fails', () => {
      const transactionSpecs = [
        {
          args: [1],
          isCritical: false,
          autoResolve: TransactionStatus.Succeeded as TransactionStatus.Succeeded,
        },
        {
          args: ['someArg'],
          isCritical: true,
          autoResolve: TransactionStatus.Failed as TransactionStatus.Failed,
        },
      ];

      const transactions = polymeshTransactionMockUtils.setupNextTransactions(transactionSpecs);

      const procedureResult = 3;
      const queue = new TransactionQueue({ transactions, procedureResult }, context);

      const runPromise = queue.run();

      return expect(runPromise).rejects.toThrow('Transaction Error');
    });

    it("should throw an error if the signing Account doesn't have enough balance to pay the transaction fees", () => {
      const transactionSpecs = [
        {
          args: [1],
          isCritical: false,
          fees: {
            protocol: new BigNumber(200),
            gas: new BigNumber(200),
          },
          autoResolve: TransactionStatus.Succeeded as TransactionStatus.Succeeded,
        },
        {
          args: ['someArg'],
          isCritical: true,
          autoResolve: TransactionStatus.Failed as TransactionStatus.Failed,
        },
      ];

      const transactions = polymeshTransactionMockUtils.setupNextTransactions(transactionSpecs);
      dsMockUtils.setContextAccountBalance({
        free: new BigNumber(100),
        locked: new BigNumber(0),
        total: new BigNumber(100),
      });

      const procedureResult = 3;
      const queue = new TransactionQueue({ transactions, procedureResult }, context);

      const runPromise = queue.run();

      return expect(runPromise).rejects.toThrow(
        "Not enough POLYX balance to pay for this procedure's fees"
      );
    });

    it("should throw an error if any third party Account doesn't have enough balance to pay the transaction fees", () => {
      const account1 = entityMockUtils.getAccountInstance({
        address: 'account1',
        getBalance: {
          free: new BigNumber(100),
          locked: new BigNumber(0),
          total: new BigNumber(100),
        },
      });
      const account2 = entityMockUtils.getAccountInstance({
        address: 'account2',
        getBalance: {
          free: new BigNumber(100),
          locked: new BigNumber(0),
          total: new BigNumber(100),
        },
      });
      const transactionSpecs = [
        {
          args: [1],
          isCritical: false,
          fees: {
            protocol: new BigNumber(100),
            gas: new BigNumber(100),
          },
          payingAccount: {
            type: PayingAccountType.Subsidy,
            account: account1,
            allowance: new BigNumber(500),
          },
          autoResolve: TransactionStatus.Succeeded as TransactionStatus.Succeeded,
        },
        {
          args: ['someArg'],
          isCritical: true,
          fees: {
            protocol: new BigNumber(100),
            gas: new BigNumber(100),
          },
          payingAccount: {
            type: PayingAccountType.Other,
            account: account2,
            allowance: null,
          },
          autoResolve: TransactionStatus.Failed as TransactionStatus.Failed,
        },
      ];

      const transactions = polymeshTransactionMockUtils.setupNextTransactions(transactionSpecs);

      const procedureResult = 3;
      const queue = new TransactionQueue({ transactions, procedureResult }, context);

      const runPromise = queue.run();

      return expect(runPromise).rejects.toThrow(
        "Not enough POLYX third party balance to pay for this procedure's fees"
      );
    });

    it("should throw an error if any third party Account doesn't have enough allowance to pay the transaction fees", () => {
      const account = entityMockUtils.getAccountInstance({
        getBalance: {
          free: new BigNumber(1000),
          locked: new BigNumber(0),
          total: new BigNumber(1000),
        },
      });
      const transactionSpecs = [
        {
          args: [1],
          isCritical: false,
          fees: {
            protocol: new BigNumber(100),
            gas: new BigNumber(100),
          },
          payingAccount: {
            type: PayingAccountType.Subsidy,
            account,
            allowance: new BigNumber(100),
          },
          autoResolve: TransactionStatus.Succeeded as TransactionStatus.Succeeded,
        },
        {
          args: ['someArg'],
          isCritical: true,
          fees: {
            protocol: new BigNumber(100),
            gas: new BigNumber(100),
          },
          payingAccount: {
            type: PayingAccountType.Subsidy,
            account,
            allowance: new BigNumber(100),
          },
          autoResolve: TransactionStatus.Failed as TransactionStatus.Failed,
        },
      ];

      const transactions = polymeshTransactionMockUtils.setupNextTransactions(transactionSpecs);

      const procedureResult = 3;
      const queue = new TransactionQueue({ transactions, procedureResult }, context);

      const runPromise = queue.run();

      return expect(runPromise).rejects.toThrow(
        "Not enough POLYX third party allowance to pay for this procedure's fees"
      );
    });

    it('should throw an error if the caller is subsidized but one or more transactions cannot be subsidized', () => {
      const account1 = entityMockUtils.getAccountInstance({
        address: 'account1',
        getBalance: {
          free: new BigNumber(100),
          locked: new BigNumber(0),
          total: new BigNumber(100),
        },
      });
      const account2 = entityMockUtils.getAccountInstance({
        address: 'account2',
        getBalance: {
          free: new BigNumber(100),
          locked: new BigNumber(0),
          total: new BigNumber(100),
        },
      });
      const transactionSpecs = [
        {
          args: [1],
          isCritical: false,
          fees: {
            protocol: new BigNumber(100),
            gas: new BigNumber(100),
          },
          payingAccount: {
            type: PayingAccountType.Subsidy,
            account: account1,
            allowance: new BigNumber(500),
          },
          autoResolve: TransactionStatus.Succeeded as TransactionStatus.Succeeded,
          supportsSubsidy: false,
        },
        {
          args: ['someArg'],
          isCritical: true,
          fees: {
            protocol: new BigNumber(100),
            gas: new BigNumber(100),
          },
          payingAccount: {
            type: PayingAccountType.Other,
            account: account2,
            allowance: null,
          },
          autoResolve: TransactionStatus.Failed as TransactionStatus.Failed,
        },
      ];

      const transactions = polymeshTransactionMockUtils.setupNextTransactions(transactionSpecs);

      const procedureResult = 3;
      const queue = new TransactionQueue({ transactions, procedureResult }, context);

      const runPromise = queue.run();

      return expect(runPromise).rejects.toThrow(
        'Some of the transactions in the queue cannot be run with a subsidized Account'
      );
    });

    it('should succeed if the only failures are from non-critical transactions', async () => {
      const transactionSpecs = [
        {
          args: [1],
          isCritical: false,
          autoResolve: TransactionStatus.Failed as TransactionStatus.Failed,
        },
        {
          args: ['someArg'],
          isCritical: true,
          autoResolve: TransactionStatus.Succeeded as TransactionStatus.Succeeded,
        },
      ];

      const transactions = polymeshTransactionMockUtils.setupNextTransactions(transactionSpecs);

      const procedureResult = 3;
      const queue = new TransactionQueue({ transactions, procedureResult }, context);

      let err;

      try {
        await queue.run();
      } catch (e) {
        err = e;
      }

      expect(err).toBeUndefined();
    });

    it('should throw an error if attempting to run a queue that has already run', async () => {
      const transactionSpecs = [
        {
          args: [1],
          isCritical: false,
          autoResolve: TransactionStatus.Succeeded as TransactionStatus.Succeeded,
        },
        {
          args: ['someArg'],
          isCritical: true,
          autoResolve: TransactionStatus.Succeeded as TransactionStatus.Succeeded,
        },
      ];

      const transactions = polymeshTransactionMockUtils.setupNextTransactions(transactionSpecs);

      const procedureResult = 3;
      const queue = new TransactionQueue({ transactions, procedureResult }, context);

      await queue.run();

      return expect(queue.run()).rejects.toThrow('Cannot re-run a Transaction Queue');
    });
  });

  describe('method: onStatusChange', () => {
    it("should execute a callback when the queue's status changes", async () => {
      const transactionSpecs = [
        {
          args: [1],
          isCritical: false,
          autoResolve: TransactionStatus.Succeeded as TransactionStatus.Succeeded,
        },
      ];
      const transactions = polymeshTransactionMockUtils.setupNextTransactions(transactionSpecs);
      const procedureResult = 3;
      const queue = new TransactionQueue({ transactions, procedureResult }, context);

      const listenerStub = sinon.stub();
      queue.onStatusChange(q => listenerStub(q.status));

      await queue.run();

      sinon.assert.calledWith(listenerStub.firstCall, TransactionQueueStatus.Running);
      sinon.assert.calledWith(listenerStub.secondCall, TransactionQueueStatus.Succeeded);
    });

    it('should return an unsubscribe function', async () => {
      const transactionSpecs = [
        {
          args: [1],
          isCritical: false,
          autoResolve: false as const,
        },
      ];
      const transactions = polymeshTransactionMockUtils.setupNextTransactions(transactionSpecs);
      const procedureResult = 3;
      const queue = new TransactionQueue({ transactions, procedureResult }, context);

      const listenerStub = sinon.stub();
      const unsub = queue.onStatusChange(q => listenerStub(q.status));

      queue.run();

      await fakePromise();

      unsub();

      polymeshTransactionMockUtils.updateTransactionStatus(
        transactions[0],
        TransactionStatus.Succeeded
      );

      sinon.assert.calledWith(listenerStub.firstCall, TransactionQueueStatus.Running);
      sinon.assert.callCount(listenerStub, 1);
    });
  });

  describe('method: onTransactionStatusChange', () => {
    it("should execute a callback when the a transaction's status changes", async () => {
      const transactionSpecs = [
        {
          args: [1],
          isCritical: false,
          autoResolve: false as const,
        },
      ];
      const transactions = polymeshTransactionMockUtils.setupNextTransactions(transactionSpecs);
      const procedureResult = 3;
      const queue = new TransactionQueue({ transactions, procedureResult }, context);

      const listenerStub = sinon.stub();
      queue.onTransactionStatusChange(transaction => {
        listenerStub(transaction.status);
      });

      const runPromise = queue.run();

      polymeshTransactionMockUtils.updateTransactionStatus(
        transactions[0],
        TransactionStatus.Running
      );
      polymeshTransactionMockUtils.updateTransactionStatus(
        transactions[0],
        TransactionStatus.Succeeded
      );

      await runPromise;

      sinon.assert.calledWith(listenerStub.firstCall, TransactionStatus.Running);
      sinon.assert.calledWith(listenerStub.secondCall, TransactionStatus.Succeeded);
    });

    it('should return an unsubscribe function', async () => {
      const transactionSpecs = [
        {
          args: [1],
          isCritical: false,
          autoResolve: false as const,
        },
      ];
      const transactions = polymeshTransactionMockUtils.setupNextTransactions(transactionSpecs);
      const procedureResult = 3;
      const queue = new TransactionQueue({ transactions, procedureResult }, context);

      const listenerStub = sinon.stub();
      const unsub = queue.onTransactionStatusChange(transaction => {
        listenerStub(transaction.status);
      });

      const runPromise = queue.run();

      polymeshTransactionMockUtils.updateTransactionStatus(
        transactions[0],
        TransactionStatus.Running
      );
      await fakePromise();

      unsub();

      polymeshTransactionMockUtils.updateTransactionStatus(
        transactions[0],
        TransactionStatus.Succeeded
      );

      await runPromise;

      sinon.assert.calledWith(listenerStub.firstCall, TransactionStatus.Running);
      sinon.assert.callCount(listenerStub, 1);
    });
  });

  describe('method: onProcessedByMiddleware', () => {
    let blockNumber: BigNumber;

    beforeEach(() => {
      blockNumber = new BigNumber(100);
      dsMockUtils.initMocks({
        contextOptions: { latestBlock: blockNumber, middlewareEnabled: true },
      });
    });

    it("should execute a callback when the queue's data has been processed", async () => {
      const transactionSpecs = [
        {
          args: [1],
          isCritical: false,
          autoResolve: TransactionStatus.Succeeded as TransactionStatus.Succeeded,
        },
      ];
      const transactions = polymeshTransactionMockUtils.setupNextTransactions(transactionSpecs);
      const procedureResult = 3;
      const queue = new TransactionQueue({ transactions, procedureResult }, context);

      const listenerStub = sinon.stub();
      queue.onProcessedByMiddleware(err => listenerStub(err));

      const stub = dsMockUtils.createApolloQueryStub(latestProcessedBlock(), {
        latestBlock: { id: blockNumber.minus(1).toNumber() },
      });

      stub
        .withArgs(latestProcessedBlock())
        .onCall(3)
        .resolves({ data: { latestBlock: { id: blockNumber.toNumber() } } });

      await queue.run();

      await fakePromises();

      sinon.assert.calledWith(listenerStub.firstCall, undefined);
    });

    it('should execute a callback with an error if 10 seconds pass without the data being processed', async () => {
      const transactionSpecs = [
        {
          args: [1],
          isCritical: false,
          autoResolve: TransactionStatus.Succeeded as TransactionStatus.Succeeded,
        },
      ];
      const transactions = polymeshTransactionMockUtils.setupNextTransactions(transactionSpecs);
      const procedureResult = 3;
      const queue = new TransactionQueue({ transactions, procedureResult }, context);

      const listenerStub = sinon.stub();
      queue.onProcessedByMiddleware(err => listenerStub(err));

      dsMockUtils.createApolloQueryStub(latestProcessedBlock(), {
        latestBlock: { id: blockNumber.minus(1).toNumber() },
      });

      await queue.run();

      await fakePromises();

      expect(listenerStub.getCall(0).args[0].message).toBe('Timed out');
    });

    it('should throw an error if the middleware is not enabled', async () => {
      dsMockUtils.initMocks({ contextOptions: { middlewareEnabled: false } });

      const transactionSpecs = [
        {
          args: [1],
          isCritical: false,
          autoResolve: TransactionStatus.Succeeded as TransactionStatus.Succeeded,
        },
      ];
      const transactions = polymeshTransactionMockUtils.setupNextTransactions(transactionSpecs);
      const procedureResult = 3;
      const queue = new TransactionQueue({ transactions, procedureResult }, context);

      const listenerStub = sinon.stub();
      expect(() => queue.onProcessedByMiddleware(err => listenerStub(err))).toThrow(
        'Cannot subscribe without an enabled middleware connection'
      );
    });

    it('should return an unsubscribe function', async () => {
      const transactionSpecs = [
        {
          args: [1],
          isCritical: false,
          autoResolve: TransactionStatus.Succeeded as TransactionStatus.Succeeded,
        },
      ];
      const transactions = polymeshTransactionMockUtils.setupNextTransactions(transactionSpecs);
      const procedureResult = 3;
      const queue = new TransactionQueue({ transactions, procedureResult }, context);

      const listenerStub = sinon.stub();
      const unsub = queue.onProcessedByMiddleware(err => listenerStub(err));

      dsMockUtils.createApolloQueryStub(latestProcessedBlock(), {
        latestBlock: { id: blockNumber.minus(1).toNumber() },
      });

      await queue.run();

      await fakePromises();

      unsub();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (queue as any).emitter.emit('ProcessedByMiddleware');

      sinon.assert.callCount(listenerStub, 1);
    });
  });

  describe('method: getMinFees', () => {
    it('should return the sum of all transaction fees', async () => {
      const account = entityMockUtils.getAccountInstance({
        getBalance: {
          free: new BigNumber(1000),
          locked: new BigNumber(0),
          total: new BigNumber(1000),
        },
      });
      const transactionSpecs = [
        {
          args: [1],
          isCritical: true,
          fees: {
            protocol: new BigNumber(100),
            gas: new BigNumber(1),
          },
          autoResolve: TransactionStatus.Succeeded as TransactionStatus.Succeeded,
        },
        {
          args: ['someArg'],
          isCritical: true,
          fees: {
            protocol: new BigNumber(50),
            gas: new BigNumber(2),
          },
          autoResolve: TransactionStatus.Succeeded as TransactionStatus.Succeeded,
        },
        {
          args: [{ foo: 'bar' }],
          isCritical: true,
          fees: {
            protocol: new BigNumber(10),
            gas: new BigNumber(5),
          },
          autoResolve: TransactionStatus.Succeeded as TransactionStatus.Succeeded,
          payingAccount: {
            type: PayingAccountType.Subsidy,
            account,
            allowance: new BigNumber(100),
          },
        },
        {
          args: [{ foo: 'bar' }],
          isCritical: true,
          fees: {
            protocol: new BigNumber(10),
            gas: new BigNumber(5),
          },
          autoResolve: TransactionStatus.Succeeded as TransactionStatus.Succeeded,
          payingAccount: {
            type: PayingAccountType.Subsidy,
            account,
            allowance: new BigNumber(100),
          },
        },
      ];

      const transactions = polymeshTransactionMockUtils.setupNextTransactions(transactionSpecs);

      const procedureResult = 3;
      const queue = new TransactionQueue({ transactions, procedureResult }, context);
      const balance = new BigNumber(500);

      dsMockUtils.setContextAccountBalance({
        free: balance,
        locked: new BigNumber(0),
        total: balance,
      });

      const fees = await queue.getMinFees();

      expect(fees).toEqual({
        thirdPartyFees: [
          {
            account,
            fees: {
              protocol: new BigNumber(20),
              gas: new BigNumber(10),
            },
            allowance: new BigNumber(100),
            balance: new BigNumber(1000),
            type: PayingAccountType.Subsidy,
          },
        ],
        accountFees: {
          protocol: new BigNumber(150),
          gas: new BigNumber(3),
        },
        accountBalance: balance,
      });
    });
  });
});
