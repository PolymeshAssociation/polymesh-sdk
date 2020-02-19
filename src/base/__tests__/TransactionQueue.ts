import { ISubmittableResult } from '@polymathnetwork/polkadot/types/types';
import BN from 'bn.js';
import { noop } from 'lodash';
import sinon from 'sinon';

import { PostTransactionValue, TransactionQueue } from '~/base';
import { PolymeshTransactionMockFactory } from '~/testUtils/mocks';
import { TransactionQueueStatus, TransactionStatus } from '~/types';
import { TransactionSpec } from '~/types/internal';
import { delay } from '~/utils';

describe('Transaction Queue class', () => {
  const transactionMockFactory = new PolymeshTransactionMockFactory();

  transactionMockFactory.initMocks();

  afterEach(() => {
    transactionMockFactory.reset();
  });

  afterAll(() => {
    transactionMockFactory.cleanup();
  });

  describe('constructor', () => {
    test('should set the arguments, fees and list of transactions', () => {
      const transactionSpecs = [
        {
          args: [1],
          isCritical: false,
          autoresolve: TransactionStatus.Succeeded as TransactionStatus.Succeeded,
        },
      ];
      const transactions = transactionMockFactory.setupNextTransactions(transactionSpecs);
      const args: [string] = ['someArgs'];
      const fees = new BN(3);
      const returnValue = 3;
      const queue = new TransactionQueue(
        (transactionSpecs as unknown) as [TransactionSpec<[number]>],
        fees,
        args,
        returnValue
      );
      expect(queue.args).toBe(args);
      expect(queue.fees).toBe(fees);
      expect(queue.transactions).toEqual(transactions);
    });
  });

  describe('method: run', () => {
    test("should run each transaction in the queue and return the queue's return value, unwrapping it if it is a PostTransactionValue", async () => {
      const transactionSpecs = [
        {
          args: [1],
          isCritical: false,
          autoresolve: TransactionStatus.Succeeded as TransactionStatus.Succeeded,
        },
        {
          args: ['someArg'],
          isCritical: true,
          autoresolve: TransactionStatus.Succeeded as TransactionStatus.Succeeded,
        },
      ];

      const transactions = transactionMockFactory.setupNextTransactions(transactionSpecs);

      const args: [string] = ['someArgs'];
      const fees = new BN(3);
      const returnValue = 3;
      let queue = new TransactionQueue(
        (transactionSpecs as unknown) as [TransactionSpec<[number]>, TransactionSpec<[string]>],
        fees,
        args,
        returnValue
      );

      let returned = await queue.run();

      expect(returned).toBe(returnValue);
      transactions.forEach(transaction => {
        sinon.assert.calledOnce(transaction.run);
      });

      transactionMockFactory.setupNextTransactions(transactionSpecs);

      const returnPostTransactionValue = new PostTransactionValue(() =>
        Promise.resolve(returnValue)
      );
      await returnPostTransactionValue.run({} as ISubmittableResult);

      queue = new TransactionQueue(
        (transactionSpecs as unknown) as [TransactionSpec<[number]>, TransactionSpec<[string]>],
        fees,
        args,
        returnPostTransactionValue
      );

      returned = await queue.run();

      expect(returned).toBe(returnValue);
    });

    test('should update the queue status', async () => {
      const transactionSpecs = [
        {
          args: [12],
          isCritical: true,
          autoresolve: false as false,
        },
      ];
      let transactions = transactionMockFactory.setupNextTransactions(transactionSpecs);
      const args: [string] = ['someArgs'];
      const fees = new BN(3);
      const returnValue = 3;
      let queue = new TransactionQueue(
        (transactionSpecs as unknown) as [TransactionSpec<[number]>],
        fees,
        args,
        returnValue
      );

      // Idle -> Running -> Succeeded
      expect(queue.status).toBe(TransactionQueueStatus.Idle);

      queue.run();

      expect(queue.status).toBe(TransactionQueueStatus.Running);

      transactionMockFactory.updateTransactionStatus(transactions[0], TransactionStatus.Succeeded);

      await delay(0);

      expect(queue.status).toBe(TransactionQueueStatus.Succeeded);

      transactions = transactionMockFactory.setupNextTransactions(transactionSpecs);

      // Idle -> Running -> Failed
      queue = new TransactionQueue(
        (transactionSpecs as unknown) as [TransactionSpec<[number]>],
        fees,
        args,
        returnValue
      );

      queue.run().catch(noop);

      transactionMockFactory.updateTransactionStatus(transactions[0], TransactionStatus.Failed);
      await delay(0);

      expect(queue.status).toBe(TransactionQueueStatus.Failed);
    });

    test('should throw an error if a critical transaction fails', () => {
      const transactionSpecs = [
        {
          args: [1],
          isCritical: false,
          autoresolve: TransactionStatus.Succeeded as TransactionStatus.Succeeded,
        },
        {
          args: ['someArg'],
          isCritical: true,
          autoresolve: TransactionStatus.Failed as TransactionStatus.Failed,
        },
      ];

      transactionMockFactory.setupNextTransactions(transactionSpecs);

      const args: [string] = ['someArgs'];
      const fees = new BN(3);
      const returnValue = 3;
      const queue = new TransactionQueue(
        (transactionSpecs as unknown) as [TransactionSpec<[number]>, TransactionSpec<[string]>],
        fees,
        args,
        returnValue
      );

      const runPromise = queue.run();

      expect(runPromise).rejects.toThrow('Transaction Error');
    });

    test('should succeed if the only failures are from non-critical transactions', () => {
      const transactionSpecs = [
        {
          args: [1],
          isCritical: false,
          autoresolve: TransactionStatus.Failed as TransactionStatus.Failed,
        },
        {
          args: ['someArg'],
          isCritical: true,
          autoresolve: TransactionStatus.Succeeded as TransactionStatus.Succeeded,
        },
      ];

      transactionMockFactory.setupNextTransactions(transactionSpecs);

      const args: [string] = ['someArgs'];
      const fees = new BN(3);
      const returnValue = 3;
      const queue = new TransactionQueue(
        (transactionSpecs as unknown) as [TransactionSpec<[number]>, TransactionSpec<[string]>],
        fees,
        args,
        returnValue
      );

      const runPromise = queue.run();

      expect(runPromise).resolves.not.toThrow();
    });
  });

  describe('method: onStatusChange', () => {
    test("should execute a callback when the queue's status changes", async () => {
      const transactionSpecs = [
        {
          args: [1],
          isCritical: false,
          autoresolve: TransactionStatus.Succeeded as TransactionStatus.Succeeded,
        },
      ];
      transactionMockFactory.setupNextTransactions(transactionSpecs);
      const args: [string] = ['someArgs'];
      const fees = new BN(3);
      const returnValue = 3;
      const queue = new TransactionQueue(
        (transactionSpecs as unknown) as [TransactionSpec<[number]>],
        fees,
        args,
        returnValue
      );

      const listenerStub = sinon.stub();
      queue.onStatusChange(q => listenerStub(q.status));

      await queue.run();

      sinon.assert.calledWith(listenerStub.firstCall, TransactionQueueStatus.Running);
      sinon.assert.calledWith(listenerStub.secondCall, TransactionQueueStatus.Succeeded);
    });

    test('should return an unsubscribe function', async () => {
      const transactionSpecs = [
        {
          args: [1],
          isCritical: false,
          autoresolve: false as false,
        },
      ];
      const transactions = transactionMockFactory.setupNextTransactions(transactionSpecs);
      const args: [string] = ['someArgs'];
      const fees = new BN(3);
      const returnValue = 3;
      const queue = new TransactionQueue(
        (transactionSpecs as unknown) as [TransactionSpec<[number]>],
        fees,
        args,
        returnValue
      );

      const listenerStub = sinon.stub();
      const unsub = queue.onStatusChange(q => listenerStub(q.status));

      queue.run();

      await delay(0);

      unsub();

      transactionMockFactory.updateTransactionStatus(transactions[0], TransactionStatus.Succeeded);

      sinon.assert.calledWith(listenerStub.firstCall, TransactionQueueStatus.Running);
      sinon.assert.callCount(listenerStub, 1);
    });
  });

  describe('method: onTransactionStatusChange', () => {
    test("should execute a callback when the a transaction's status changes", async () => {
      const transactionSpecs = [
        {
          args: [1],
          isCritical: false,
          autoresolve: false as false,
        },
      ];
      const transactions = transactionMockFactory.setupNextTransactions(transactionSpecs);
      const args: [string] = ['someArgs'];
      const fees = new BN(3);
      const returnValue = 3;
      const queue = new TransactionQueue(
        (transactionSpecs as unknown) as [TransactionSpec<[number]>],
        fees,
        args,
        returnValue
      );

      const listenerStub = sinon.stub();
      queue.onTransactionStatusChange(transaction => {
        listenerStub(transaction.status);
      });

      const runPromise = queue.run();

      transactionMockFactory.updateTransactionStatus(transactions[0], TransactionStatus.Running);
      transactionMockFactory.updateTransactionStatus(transactions[0], TransactionStatus.Succeeded);

      await runPromise;

      sinon.assert.calledWith(listenerStub.firstCall, TransactionStatus.Running);
      sinon.assert.calledWith(listenerStub.secondCall, TransactionStatus.Succeeded);
    });

    test('should return an unsubscribe function', async () => {
      const transactionSpecs = [
        {
          args: [1],
          isCritical: false,
          autoresolve: false as false,
        },
      ];
      const transactions = transactionMockFactory.setupNextTransactions(transactionSpecs);
      const args: [string] = ['someArgs'];
      const fees = new BN(3);
      const returnValue = 3;
      const queue = new TransactionQueue(
        (transactionSpecs as unknown) as [TransactionSpec<[number]>],
        fees,
        args,
        returnValue
      );

      const listenerStub = sinon.stub();
      const unsub = queue.onTransactionStatusChange(transaction => {
        listenerStub(transaction.status);
      });

      const runPromise = queue.run();

      transactionMockFactory.updateTransactionStatus(transactions[0], TransactionStatus.Running);
      await delay(0);

      unsub();

      transactionMockFactory.updateTransactionStatus(transactions[0], TransactionStatus.Succeeded);

      await runPromise;

      sinon.assert.calledWith(listenerStub.firstCall, TransactionStatus.Running);
      sinon.assert.callCount(listenerStub, 1);
    });
  });
});
