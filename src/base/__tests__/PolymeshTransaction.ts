import { ISubmittableResult } from '@polkadot/types/types';
import sinon from 'sinon';

import { PostTransactionValue } from '~/base';
import { polkadotMockUtils } from '~/testUtils/mocks';
import { TransactionStatus } from '~/types';
import { PostTransactionValueArray } from '~/types/internal';
import { tuple } from '~/types/utils';
import { delay } from '~/utils';

import { PolymeshTransaction } from '../PolymeshTransaction';

describe('Polymesh Transaction class', () => {
  beforeAll(() => {
    polkadotMockUtils.initMocks();
  });

  const txSpec = {
    signer: 'signer',
    isCritical: false,
  };

  afterEach(() => {
    polkadotMockUtils.reset();
  });

  describe('method: run', () => {
    test('should execute the underlying transaction with the provided arguments, setting the tx and block hash when finished', async () => {
      const tx = polkadotMockUtils.createTxStub('asset', 'registerTicker');
      const args = tuple('A_TICKER');

      const transaction = new PolymeshTransaction({
        ...txSpec,
        tx,
        args,
      });

      await transaction.run();

      sinon.assert.calledWith(tx, ...args);
      expect(transaction.blockHash).toBeDefined();
      expect(transaction.txHash).toBeDefined();
      expect(transaction.status).toBe(TransactionStatus.Succeeded);
    });

    test('should unwrap PostTransactionValue arguments', async () => {
      const tx = polkadotMockUtils.createTxStub('asset', 'registerTicker');
      const ticker = 'A_DIFFERENT_TICKER';
      const postTransactionTicker = new PostTransactionValue(async () => ticker);
      await postTransactionTicker.run({} as ISubmittableResult);
      const args = tuple(postTransactionTicker);

      const transaction = new PolymeshTransaction({
        ...txSpec,
        tx,
        args,
      });

      await transaction.run();

      sinon.assert.calledWith(tx, ticker);
      expect(transaction.blockHash).toBeDefined();
      expect(transaction.txHash).toBeDefined();
      expect(transaction.status).toBe(TransactionStatus.Succeeded);
    });

    test('should unwrap the method if it is a PostTransactionValue', async () => {
      const tx = polkadotMockUtils.createTxStub('asset', 'registerTicker');
      const ticker = 'NOT_THE_SAME_ONE';
      const postTransactionTx = new PostTransactionValue(async () => tx);
      const args = tuple(ticker);

      const transaction = new PolymeshTransaction({
        ...txSpec,
        tx: postTransactionTx,
        args,
      });

      await postTransactionTx.run({} as ISubmittableResult);

      await transaction.run();

      sinon.assert.calledWith(tx, ticker);
      expect(transaction.blockHash).toBeDefined();
      expect(transaction.txHash).toBeDefined();
      expect(transaction.status).toBe(TransactionStatus.Succeeded);
    });

    test('should update the transaction status', async () => {
      const tx = polkadotMockUtils.createTxStub('asset', 'registerTicker', false);
      const args = tuple('ANOTHER_TICKER');

      const transaction = new PolymeshTransaction({
        ...txSpec,
        tx,
        args,
      });

      expect(transaction.status).toBe(TransactionStatus.Idle);

      transaction.run();

      expect(transaction.status).toBe(TransactionStatus.Unapproved);

      polkadotMockUtils.updateTxStatus(tx, polkadotMockUtils.MockTxStatus.Ready);

      await delay(0);

      expect(transaction.status).toBe(TransactionStatus.Running);

      polkadotMockUtils.updateTxStatus(tx, polkadotMockUtils.MockTxStatus.Intermediate);

      await delay(0);

      expect(transaction.status).toBe(TransactionStatus.Running);

      polkadotMockUtils.updateTxStatus(tx, polkadotMockUtils.MockTxStatus.Succeeded);

      await delay(0);

      expect(transaction.status).toBe(TransactionStatus.Succeeded);
    });

    test('should resolve all postValues', async () => {
      const tx = polkadotMockUtils.createTxStub('asset', 'registerTicker');
      const args = tuple('YET_ANOTHER_TICKER');
      const firstStub = sinon.stub().resolves(1);
      const secondStub = sinon.stub().resolves('someString');
      const postTransactionValues = ([
        { run: firstStub },
        { run: secondStub },
      ] as unknown) as PostTransactionValueArray<[number, string]>;

      const transaction = new PolymeshTransaction({
        ...txSpec,
        tx,
        args,
        postTransactionValues,
      });

      await transaction.run();

      sinon.assert.calledOnce(firstStub);
      sinon.assert.calledOnce(secondStub);
    });

    test('should throw an error when the transaction is aborted', async () => {
      const tx = polkadotMockUtils.createTxStub(
        'asset',
        'registerTicker',
        polkadotMockUtils.MockTxStatus.Aborted
      );
      const args = tuple('IT_HURTS');

      const transaction = new PolymeshTransaction({
        ...txSpec,
        tx,
        args,
      });

      await expect(transaction.run()).rejects.toThrow(
        'The transaction was removed from the transaction pool. This might mean that it was malformed (nonce too large/nonce too small/duplicated or invalid transaction)'
      );
      expect(transaction.status).toBe(TransactionStatus.Aborted);
    });

    test('should throw an error when the transaction fails', async () => {
      let tx = polkadotMockUtils.createTxStub('asset', 'registerTicker', false);
      const args = tuple('PLEASE_MAKE_IT_STOP');

      let transaction = new PolymeshTransaction({
        ...txSpec,
        tx,
        args,
      });
      let runPromise = transaction.run();

      polkadotMockUtils.updateTxStatus(
        tx,
        polkadotMockUtils.MockTxStatus.Failed,
        polkadotMockUtils.TxFailReason.BadOrigin
      );

      await expect(runPromise).rejects.toThrow('Bad origin');
      expect(transaction.status).toBe(TransactionStatus.Failed);

      tx = polkadotMockUtils.createTxStub('asset', 'registerTicker', false);
      transaction = new PolymeshTransaction({
        ...txSpec,
        tx,
        args,
      });
      runPromise = transaction.run();

      polkadotMockUtils.updateTxStatus(
        tx,
        polkadotMockUtils.MockTxStatus.Failed,
        polkadotMockUtils.TxFailReason.CannotLookup
      );

      await expect(runPromise).rejects.toThrow(
        'Could not lookup information required to validate the transaction'
      );
      expect(transaction.status).toBe(TransactionStatus.Failed);

      tx = polkadotMockUtils.createTxStub('asset', 'registerTicker', false);
      transaction = new PolymeshTransaction({
        ...txSpec,
        tx,
        args,
      });
      runPromise = transaction.run();

      polkadotMockUtils.updateTxStatus(
        tx,
        polkadotMockUtils.MockTxStatus.Failed,
        polkadotMockUtils.TxFailReason.Other
      );

      await expect(runPromise).rejects.toThrow('Unknown error');
      expect(transaction.status).toBe(TransactionStatus.Failed);

      tx = polkadotMockUtils.createTxStub('asset', 'registerTicker', false);
      transaction = new PolymeshTransaction({
        ...txSpec,
        tx,
        args,
      });
      runPromise = transaction.run();

      polkadotMockUtils.updateTxStatus(
        tx,
        polkadotMockUtils.MockTxStatus.Failed,
        polkadotMockUtils.TxFailReason.Module
      );

      await expect(runPromise).rejects.toThrow('someModule.SomeError: This is very bad');
      expect(transaction.status).toBe(TransactionStatus.Failed);
    });

    test('should throw an error when the transaction is rejected', async () => {
      const tx = polkadotMockUtils.createTxStub(
        'asset',
        'registerTicker',
        polkadotMockUtils.MockTxStatus.Rejected
      );
      const args = tuple('THIS_IS_THE_LAST_ONE_I_SWEAR');

      const transaction = new PolymeshTransaction({
        ...txSpec,
        tx,
        args,
      });

      await expect(transaction.run()).rejects.toThrow(
        'The user canceled the transaction signature'
      );
      expect(transaction.status).toBe(TransactionStatus.Rejected);
    });
  });

  describe('method: onStatusChange', () => {
    test("should execute a callback when the transaction's status changes", async () => {
      const tx = polkadotMockUtils.createTxStub('asset', 'registerTicker');
      const args = tuple('I_HAVE_LOST_THE_WILL_TO_LIVE');

      const transaction = new PolymeshTransaction({
        ...txSpec,
        tx,
        args,
      });

      const listenerStub = sinon.stub();

      transaction.onStatusChange(t => listenerStub(t.status));

      await transaction.run();

      sinon.assert.calledWith(listenerStub.firstCall, TransactionStatus.Unapproved);
      sinon.assert.calledWith(listenerStub.secondCall, TransactionStatus.Running);
      sinon.assert.calledWith(listenerStub.thirdCall, TransactionStatus.Succeeded);
    });

    test('should return an unsubscribe function', async () => {
      const tx = polkadotMockUtils.createTxStub('asset', 'registerTicker', false);
      const args = tuple('THE_ONLY_THING_THAT_KEEPS_ME_GOING_IS_THE_HOPE_OF_FULL_COVERAGE');

      const transaction = new PolymeshTransaction({
        ...txSpec,
        tx,
        args,
      });

      const listenerStub = sinon.stub();

      const unsub = transaction.onStatusChange(t => listenerStub(t.status));

      transaction.run();

      await delay(0);

      unsub();

      sinon.assert.calledWith(listenerStub.firstCall, TransactionStatus.Unapproved);
      sinon.assert.calledWith(listenerStub.secondCall, TransactionStatus.Running);
      sinon.assert.callCount(listenerStub, 2);
    });
  });
});
