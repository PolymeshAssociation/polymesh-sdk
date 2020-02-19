import { SubmittableExtrinsic, TxTags } from '@polymathnetwork/polkadot/api/types';
import { CallBase, ISubmittableResult } from '@polymathnetwork/polkadot/types/types';
import sinon, { SinonStub } from 'sinon';

import { PolymeshTransaction } from '~/base/PolymeshTransaction';
import { PostTransactionValue } from '~/base/PostTransactionValue';
import {
  MockTxStatus,
  PolkadotMockFactory,
  TxFailReason,
} from '~/testUtils/mocks/PolkadotMockFactory';
import { TransactionStatus } from '~/types';
import { MaybePostTransactionValue, PostTransactionValueArray } from '~/types/internal';
import { delay } from '~/utils';

type ExtractTxArgs<T> = T extends ((...args: infer A) => SubmittableExtrinsic<'promise'>) &
  CallBase &
  SinonStub
  ? A
  : never;

describe('Polymesh Transaction class', () => {
  const mockFactory = new PolkadotMockFactory();

  mockFactory.initMocks();

  const txSpec = {
    tag: TxTags.asset.RegisterTicker,
    signer: 'signer',
    isCritical: false,
  };

  afterEach(() => {
    mockFactory.reset();
  });

  describe('method: run', () => {
    test('should execute the underlying transaction with the provided arguments, setting the tx and block hash when finished', async () => {
      const tx = mockFactory.createTxStub('asset', 'registerTicker');
      const args: [string] = ['A_TICKER'];

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
      const tx = mockFactory.createTxStub('asset', 'registerTicker');
      const ticker = 'A_DIFFERENT_TICKER';
      const postTransactionTicker = new PostTransactionValue(async () => ticker);
      await postTransactionTicker.run({} as ISubmittableResult);
      const args: [MaybePostTransactionValue<string>] = [postTransactionTicker];

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

    test('should update the transaction status', async () => {
      const tx = mockFactory.createTxStub('asset', 'registerTicker', false);
      const args: [string] = ['ANOTHER_TICKER'];

      const transaction = new PolymeshTransaction({
        ...txSpec,
        tx,
        args,
      });

      expect(transaction.status).toBe(TransactionStatus.Idle);

      transaction.run();

      expect(transaction.status).toBe(TransactionStatus.Unapproved);

      mockFactory.updateTxStatus(tx, MockTxStatus.Ready);

      await delay(0);

      expect(transaction.status).toBe(TransactionStatus.Running);

      mockFactory.updateTxStatus(tx, MockTxStatus.Succeeded);

      await delay(0);

      expect(transaction.status).toBe(TransactionStatus.Succeeded);
    });

    test('should resolve all postValues', async () => {
      const tx = mockFactory.createTxStub('asset', 'registerTicker');
      const args: [string] = ['YET_ANOTHER_TICKER'];
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
      const tx = mockFactory.createTxStub('asset', 'registerTicker', MockTxStatus.Aborted);
      const args: [string] = ['IT_HURTS'];

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
      let tx = mockFactory.createTxStub('asset', 'registerTicker', false);
      const args: [string] = ['PLEASE_MAKE_IT_STOP'];

      let transaction = new PolymeshTransaction({
        ...txSpec,
        tx,
        args,
      });
      let runPromise = transaction.run();

      mockFactory.updateTxStatus(tx, MockTxStatus.Failed, TxFailReason.BadOrigin);

      await expect(runPromise).rejects.toThrow('Bad origin');
      expect(transaction.status).toBe(TransactionStatus.Failed);

      tx = mockFactory.createTxStub('asset', 'registerTicker', false);
      transaction = new PolymeshTransaction({
        ...txSpec,
        tx,
        args,
      });
      runPromise = transaction.run();

      mockFactory.updateTxStatus(tx, MockTxStatus.Failed, TxFailReason.CannotLookup);

      await expect(runPromise).rejects.toThrow(
        'Could not lookup information required to validate the transaction'
      );
      expect(transaction.status).toBe(TransactionStatus.Failed);

      tx = mockFactory.createTxStub('asset', 'registerTicker', false);
      transaction = new PolymeshTransaction({
        ...txSpec,
        tx,
        args,
      });
      runPromise = transaction.run();

      mockFactory.updateTxStatus(tx, MockTxStatus.Failed, TxFailReason.Other);

      await expect(runPromise).rejects.toThrow('Unknown error');
      expect(transaction.status).toBe(TransactionStatus.Failed);

      tx = mockFactory.createTxStub('asset', 'registerTicker', false);
      transaction = new PolymeshTransaction({
        ...txSpec,
        tx,
        args,
      });
      runPromise = transaction.run();

      mockFactory.updateTxStatus(tx, MockTxStatus.Failed, TxFailReason.Module);

      await expect(runPromise).rejects.toThrow('someModule.SomeError: This is very bad');
      expect(transaction.status).toBe(TransactionStatus.Failed);
    });

    test('should throw an error when the transaction is rejected', async () => {
      const tx = mockFactory.createTxStub('asset', 'registerTicker', MockTxStatus.Rejected);
      const args: [string] = ['THIS_IS_THE_LAST_ONE_I_SWEAR'];

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
      const tx = mockFactory.createTxStub('asset', 'registerTicker');
      const args: [string] = ['I_HAVE_LOST_THE_WILL_TO_LIVE'];

      const transaction = new PolymeshTransaction({
        ...txSpec,
        tx,
        args,
      });

      const listenerStub = sinon.stub();

      transaction.onStatusChange(transaction => listenerStub(transaction.status));

      await transaction.run();

      sinon.assert.calledWith(listenerStub.firstCall, TransactionStatus.Unapproved);
      sinon.assert.calledWith(listenerStub.secondCall, TransactionStatus.Running);
      sinon.assert.calledWith(listenerStub.thirdCall, TransactionStatus.Succeeded);
    });

    test('should return an unsubscribe function', async () => {
      const tx = mockFactory.createTxStub('asset', 'registerTicker', false);
      const args: [string] = ['THE_ONLY_THING_THAT_KEEPS_ME_GOING_IS_THE_HOPE_OF_FULL_COVERAGE'];

      const transaction = new PolymeshTransaction({
        ...txSpec,
        tx,
        args,
      });

      const listenerStub = sinon.stub();

      const unsub = transaction.onStatusChange(transaction => listenerStub(transaction.status));

      transaction.run();

      await delay(0);

      unsub();

      sinon.assert.calledWith(listenerStub.firstCall, TransactionStatus.Unapproved);
      sinon.assert.calledWith(listenerStub.secondCall, TransactionStatus.Running);
      sinon.assert.callCount(listenerStub, 2);
    });
  });
});
