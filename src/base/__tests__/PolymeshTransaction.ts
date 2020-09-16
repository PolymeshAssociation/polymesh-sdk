import { Balance } from '@polkadot/types/interfaces';
import { ISubmittableResult } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';
import { TxTags } from 'polymesh-types/types';
import sinon from 'sinon';

import { Context, PolymeshTransaction, PostTransactionValue } from '~/base';
import { fakePromise } from '~/testUtils';
import { dsMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { TransactionStatus } from '~/types';
import { PostTransactionValueArray } from '~/types/internal';
import { tuple } from '~/types/utils';
import * as utilsModule from '~/utils';

describe('Polymesh Transaction class', () => {
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
  };

  afterEach(() => {
    dsMockUtils.reset();
  });

  describe('method: run', () => {
    test('should execute the underlying transaction with the provided arguments, setting the tx and block hash when finished', async () => {
      const tx = dsMockUtils.createTxStub('asset', 'registerTicker');
      const args = tuple('A_TICKER');

      const transaction = new PolymeshTransaction(
        {
          ...txSpec,
          tx,
          args,
        },
        context
      );

      await transaction.run();

      sinon.assert.calledWith(tx, ...args);
      expect(transaction.blockHash).toBeDefined();
      expect(transaction.txHash).toBeDefined();
      expect(transaction.status).toBe(TransactionStatus.Succeeded);
    });

    test('should unwrap PostTransactionValue arguments', async () => {
      const tx = dsMockUtils.createTxStub('asset', 'registerTicker');
      const ticker = 'A_DIFFERENT_TICKER';
      const postTransactionTicker = new PostTransactionValue(async () => ticker);
      await postTransactionTicker.run({} as ISubmittableResult);
      const args = tuple(postTransactionTicker);

      const transaction = new PolymeshTransaction(
        {
          ...txSpec,
          tx,
          args,
        },
        context
      );

      await transaction.run();

      sinon.assert.calledWith(tx, ticker);
      expect(transaction.blockHash).toBeDefined();
      expect(transaction.txHash).toBeDefined();
      expect(transaction.status).toBe(TransactionStatus.Succeeded);
    });

    test('should unwrap the method if it is a PostTransactionValue', async () => {
      const tx = dsMockUtils.createTxStub('asset', 'registerTicker');
      const ticker = 'NOT_THE_SAME_ONE';
      const postTransactionTx = new PostTransactionValue(async () => tx);
      const args = tuple(ticker);

      const transaction = new PolymeshTransaction(
        {
          ...txSpec,
          tx: postTransactionTx,
          args,
        },
        context
      );

      await postTransactionTx.run({} as ISubmittableResult);

      await transaction.run();

      sinon.assert.calledWith(tx, ticker);
      expect(transaction.blockHash).toBeDefined();
      expect(transaction.txHash).toBeDefined();
      expect(transaction.status).toBe(TransactionStatus.Succeeded);
    });

    test('should update the transaction status', async () => {
      const tx = dsMockUtils.createTxStub('asset', 'registerTicker', { autoresolve: false });
      const args = tuple('ANOTHER_TICKER');

      const transaction = new PolymeshTransaction(
        {
          ...txSpec,
          tx,
          args,
        },
        context
      );

      expect(transaction.status).toBe(TransactionStatus.Idle);

      transaction.run();

      expect(transaction.status).toBe(TransactionStatus.Unapproved);

      dsMockUtils.updateTxStatus(tx, dsMockUtils.MockTxStatus.Ready);

      await fakePromise();

      expect(transaction.status).toBe(TransactionStatus.Running);

      dsMockUtils.updateTxStatus(tx, dsMockUtils.MockTxStatus.Intermediate);

      await fakePromise();

      expect(transaction.status).toBe(TransactionStatus.Running);

      dsMockUtils.updateTxStatus(tx, dsMockUtils.MockTxStatus.Succeeded);

      await fakePromise();

      expect(transaction.status).toBe(TransactionStatus.Succeeded);
    });

    test('should resolve all postValues', async () => {
      const tx = dsMockUtils.createTxStub('asset', 'registerTicker');
      const args = tuple('YET_ANOTHER_TICKER');
      const firstStub = sinon.stub().resolves(1);
      const secondStub = sinon.stub().resolves('someString');
      const postTransactionValues = ([
        { run: firstStub },
        { run: secondStub },
      ] as unknown) as PostTransactionValueArray<[number, string]>;

      const transaction = new PolymeshTransaction(
        {
          ...txSpec,
          tx,
          args,
          postTransactionValues,
        },
        context
      );

      await transaction.run();

      sinon.assert.calledOnce(firstStub);
      sinon.assert.calledOnce(secondStub);
    });

    test('should throw an error when the transaction is aborted', async () => {
      const tx = dsMockUtils.createTxStub('asset', 'registerTicker', {
        autoresolve: dsMockUtils.MockTxStatus.Aborted,
      });
      const args = tuple('IT_HURTS');

      const transaction = new PolymeshTransaction(
        {
          ...txSpec,
          tx,
          args,
        },
        context
      );

      await expect(transaction.run()).rejects.toThrow(
        'The transaction was removed from the transaction pool. This might mean that it was malformed (nonce too large/nonce too small/duplicated or invalid transaction)'
      );
      expect(transaction.status).toBe(TransactionStatus.Aborted);
    });

    test('should throw an error when the transaction fails', async () => {
      let tx = dsMockUtils.createTxStub('asset', 'registerTicker', { autoresolve: false });
      const args = tuple('PLEASE_MAKE_IT_STOP');

      let transaction = new PolymeshTransaction(
        {
          ...txSpec,
          tx,
          args,
        },
        context
      );
      let runPromise = transaction.run();

      dsMockUtils.updateTxStatus(
        tx,
        dsMockUtils.MockTxStatus.Failed,
        dsMockUtils.TxFailReason.BadOrigin
      );

      await expect(runPromise).rejects.toThrow('Bad origin');
      expect(transaction.status).toBe(TransactionStatus.Failed);

      tx = dsMockUtils.createTxStub('asset', 'registerTicker', { autoresolve: false });
      transaction = new PolymeshTransaction(
        {
          ...txSpec,
          tx,
          args,
        },
        context
      );
      runPromise = transaction.run();

      dsMockUtils.updateTxStatus(
        tx,
        dsMockUtils.MockTxStatus.Failed,
        dsMockUtils.TxFailReason.CannotLookup
      );

      await expect(runPromise).rejects.toThrow(
        'Could not lookup information required to validate the transaction'
      );
      expect(transaction.status).toBe(TransactionStatus.Failed);

      tx = dsMockUtils.createTxStub('asset', 'registerTicker', { autoresolve: false });
      transaction = new PolymeshTransaction(
        {
          ...txSpec,
          tx,
          args,
        },
        context
      );
      runPromise = transaction.run();

      dsMockUtils.updateTxStatus(
        tx,
        dsMockUtils.MockTxStatus.Failed,
        dsMockUtils.TxFailReason.Other
      );

      await expect(runPromise).rejects.toThrow('Unknown error');
      expect(transaction.status).toBe(TransactionStatus.Failed);

      tx = dsMockUtils.createTxStub('asset', 'registerTicker', { autoresolve: false });
      transaction = new PolymeshTransaction(
        {
          ...txSpec,
          tx,
          args,
        },
        context
      );
      runPromise = transaction.run();

      dsMockUtils.updateTxStatus(
        tx,
        dsMockUtils.MockTxStatus.Failed,
        dsMockUtils.TxFailReason.Module
      );

      await expect(runPromise).rejects.toThrow('someModule.SomeError: This is very bad');
      expect(transaction.status).toBe(TransactionStatus.Failed);
    });

    test('should throw an error when the transaction is rejected', async () => {
      const tx = dsMockUtils.createTxStub('asset', 'registerTicker', {
        autoresolve: dsMockUtils.MockTxStatus.Rejected,
      });
      const args = tuple('THIS_IS_THE_LAST_ONE_I_SWEAR');

      const transaction = new PolymeshTransaction(
        {
          ...txSpec,
          tx,
          args,
        },
        context
      );

      await expect(transaction.run()).rejects.toThrow(
        'The user canceled the transaction signature'
      );
      expect(transaction.status).toBe(TransactionStatus.Rejected);
    });
  });

  describe('method: onStatusChange', () => {
    test("should execute a callback when the transaction's status changes", async () => {
      const tx = dsMockUtils.createTxStub('asset', 'registerTicker');
      const args = tuple('I_HAVE_LOST_THE_WILL_TO_LIVE');

      const transaction = new PolymeshTransaction(
        {
          ...txSpec,
          tx,
          args,
        },
        context
      );

      const listenerStub = sinon.stub();

      transaction.onStatusChange(t => listenerStub(t.status));

      await transaction.run();

      sinon.assert.calledWith(listenerStub.firstCall, TransactionStatus.Unapproved);
      sinon.assert.calledWith(listenerStub.secondCall, TransactionStatus.Running);
      sinon.assert.calledWith(listenerStub.thirdCall, TransactionStatus.Succeeded);
    });

    test('should return an unsubscribe function', async () => {
      const tx = dsMockUtils.createTxStub('asset', 'registerTicker', { autoresolve: false });
      const args = tuple('THE_ONLY_THING_THAT_KEEPS_ME_GOING_IS_THE_HOPE_OF_FULL_COVERAGE');

      const transaction = new PolymeshTransaction(
        {
          ...txSpec,
          tx,
          args,
        },
        context
      );

      const listenerStub = sinon.stub();

      const unsub = transaction.onStatusChange(t => listenerStub(t.status));

      transaction.run();

      await fakePromise();

      unsub();

      sinon.assert.calledWith(listenerStub.firstCall, TransactionStatus.Unapproved);
      sinon.assert.calledWith(listenerStub.secondCall, TransactionStatus.Running);
      sinon.assert.callCount(listenerStub, 2);
    });
  });

  describe('method: getFees', () => {
    let balanceToBigNumberStub: sinon.SinonStub<[Balance], BigNumber>;
    let protocolFees: BigNumber[];
    let gasFees: number[];
    let rawGasFees: Balance[];

    beforeAll(() => {
      balanceToBigNumberStub = sinon.stub(utilsModule, 'balanceToBigNumber');
      protocolFees = [new BigNumber(250), new BigNumber(150)];
      gasFees = [5, 10];
      rawGasFees = gasFees.map(dsMockUtils.createMockBalance);
    });

    beforeEach(() => {
      context.getTransactionFees.withArgs(TxTags.asset.RegisterTicker).resolves(protocolFees[0]);
      context.getTransactionFees.withArgs(TxTags.asset.CreateAsset).resolves(protocolFees[1]);
      rawGasFees.forEach((rawGasFee, index) =>
        balanceToBigNumberStub.withArgs(rawGasFee).returns(new BigNumber(gasFees[index]))
      );
    });

    test('should fetch (if missing) and return transaction fees', async () => {
      const tx1 = dsMockUtils.createTxStub('asset', 'registerTicker', { gas: rawGasFees[0] });
      const tx2 = dsMockUtils.createTxStub('asset', 'createAsset', { gas: rawGasFees[1] });

      const args = tuple('OH_GOD_NO_IT_IS_BACK');

      let transaction = new PolymeshTransaction(
        {
          ...txSpec,
          fee: null,
          tx: tx1,
          args,
        },
        context
      );

      let result = await transaction.getFees();

      expect(result?.protocol).toEqual(new BigNumber(250));
      expect(result?.gas).toEqual(new BigNumber(5));

      transaction = new PolymeshTransaction(
        {
          ...txSpec,
          fee: new BigNumber(protocolFees[1]),
          tx: tx2,
          args,
        },
        context
      );

      result = await transaction.getFees();

      expect(result?.protocol).toEqual(new BigNumber(150));
      expect(result?.gas).toEqual(new BigNumber(10));
    });

    test('should return null if the transaction (or its arguments) are not ready', async () => {
      const tx = dsMockUtils.createTxStub('asset', 'registerTicker', { gas: rawGasFees[0] });

      const args = tuple('WILL_IT_EVER_BE_OVER?');

      let transaction = new PolymeshTransaction(
        {
          ...txSpec,
          fee: null,
          tx: new PostTransactionValue(async () => tx),
          args,
        },
        context
      );

      let result = await transaction.getFees();

      expect(result).toBe(null);

      transaction = new PolymeshTransaction(
        {
          ...txSpec,
          fee: null,
          tx,
          args: args.map(arg => new PostTransactionValue(async () => arg)),
        },
        context
      );

      result = await transaction.getFees();

      expect(result).toBe(null);
    });

    test('should throw an error if there is a batch transaction in the queue with no batch size', () => {
      const tx = dsMockUtils.createTxStub('identity', 'batchAcceptAuthorization', {
        gas: rawGasFees[0],
      });

      const args = tuple('I_HAVE_LOST_ALL_WILL_TO_CONTINUE');

      const transaction = new PolymeshTransaction(
        {
          ...txSpec,
          fee: null,
          tx,
          args,
        },
        context
      );

      return expect(transaction.getFees()).rejects.toThrow(
        'Did not set batch size for batch transaction. Please report this error to the Polymath team'
      );
    });
  });
});
