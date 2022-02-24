import { Balance } from '@polkadot/types/interfaces';
import { ISubmittableResult } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';
import { TxTags } from 'polymesh-types/types';
import sinon from 'sinon';

import {
  Context,
  PolymeshTransaction,
  PolymeshTransactionBase,
  PolymeshTransactionBatch,
  PostTransactionValue,
} from '~/internal';
import { fakePromise } from '~/testUtils';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { TransactionStatus } from '~/types';
import { PostTransactionValueArray } from '~/types/internal';
import { tuple } from '~/types/utils';
import * as utilsConversionModule from '~/utils/conversion';

describe('Polymesh Transaction Base class', () => {
  let context: Mocked<Context>;

  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
  });

  const txSpec = {
    signer: 'signer',
    isCritical: false,
    fee: new BigNumber(100),
  };

  afterEach(() => {
    dsMockUtils.reset();
    entityMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  describe('method: run', () => {
    beforeEach(() => {
      dsMockUtils.createRpcStub('chain', 'getBlock', {
        returnValue: dsMockUtils.createMockSignedBlock({
          block: {
            header: {
              number: dsMockUtils.createMockCompact(dsMockUtils.createMockU32(new BigNumber(1))),
              parentHash: 'hash',
              stateRoot: 'hash',
              extrinsicsRoot: 'hash',
            },
          },
        }),
      });
    });

    it('should execute the underlying transaction with the provided arguments, setting the tx and block hash when finished', async () => {
      const transaction = dsMockUtils.createTxStub('asset', 'registerTicker', {
        autoResolve: false,
      });
      const args = tuple('A_TICKER');

      const tx = new PolymeshTransaction(
        {
          ...txSpec,
          transaction,
          args,
        },
        context
      );

      tx.run();

      dsMockUtils.updateTxStatus(transaction, dsMockUtils.MockTxStatus.InBlock);

      await fakePromise();

      dsMockUtils.updateTxStatus(transaction, dsMockUtils.MockTxStatus.Succeeded);

      await fakePromise();

      sinon.assert.calledWith(transaction, ...args);
      expect(tx.blockHash).toBeDefined();
      expect(tx.blockNumber).toBeDefined();
      expect(tx.txHash).toBeDefined();
      expect(tx.status).toBe(TransactionStatus.Succeeded);
    });

    it('should unwrap PostTransactionValue arguments', async () => {
      const transaction = dsMockUtils.createTxStub('asset', 'registerTicker', {
        autoResolve: false,
      });
      const ticker = 'A_DIFFERENT_TICKER';
      const postTransactionTicker = new PostTransactionValue(async () => ticker);
      await postTransactionTicker.run({} as ISubmittableResult);
      const args = tuple(postTransactionTicker);

      const tx = new PolymeshTransaction(
        {
          ...txSpec,
          transaction,
          args,
        },
        context
      );

      tx.run();

      dsMockUtils.updateTxStatus(transaction, dsMockUtils.MockTxStatus.InBlock);

      await fakePromise();

      dsMockUtils.updateTxStatus(transaction, dsMockUtils.MockTxStatus.Succeeded);

      await fakePromise();

      sinon.assert.calledWith(transaction, ticker);
      expect(tx.blockHash).toBeDefined();
      expect(tx.blockNumber).toBeDefined();
      expect(tx.txHash).toBeDefined();
      expect(tx.status).toBe(TransactionStatus.Succeeded);
    });

    it('should update the transaction status', async () => {
      const transaction = dsMockUtils.createTxStub('asset', 'registerTicker', {
        autoResolve: false,
      });
      const args = tuple('ANOTHER_TICKER');

      const tx = new PolymeshTransaction(
        {
          ...txSpec,
          transaction,
          args,
        },
        context
      );

      expect(tx.status).toBe(TransactionStatus.Idle);

      tx.run();

      expect(tx.status).toBe(TransactionStatus.Unapproved);

      dsMockUtils.updateTxStatus(transaction, dsMockUtils.MockTxStatus.Ready);

      await fakePromise();

      expect(tx.status).toBe(TransactionStatus.Running);

      dsMockUtils.updateTxStatus(transaction, dsMockUtils.MockTxStatus.Intermediate);

      await fakePromise();

      expect(tx.status).toBe(TransactionStatus.Running);

      dsMockUtils.updateTxStatus(transaction, dsMockUtils.MockTxStatus.InBlock);

      await fakePromise();

      expect(tx.status).toBe(TransactionStatus.Running);

      dsMockUtils.updateTxStatus(transaction, dsMockUtils.MockTxStatus.Succeeded);

      await fakePromise();

      expect(tx.status).toBe(TransactionStatus.Succeeded);
    });

    it('should resolve all postValues', async () => {
      const transaction = dsMockUtils.createTxStub('asset', 'registerTicker');
      const args = tuple('YET_ANOTHER_TICKER');
      const firstStub = sinon.stub().resolves(1);
      const secondStub = sinon.stub().resolves('someString');
      const postTransactionValues = [
        { run: firstStub },
        { run: secondStub },
      ] as unknown as PostTransactionValueArray<[number, string]>;

      const tx = new PolymeshTransaction(
        {
          ...txSpec,
          transaction,
          args,
          postTransactionValues,
        },
        context
      );

      await tx.run();

      sinon.assert.calledOnce(firstStub);
      sinon.assert.calledOnce(secondStub);
    });

    it('should throw an error when the transaction is aborted', async () => {
      const transaction = dsMockUtils.createTxStub('asset', 'registerTicker', {
        autoResolve: dsMockUtils.MockTxStatus.Aborted,
      });
      const args = tuple('IT_HURTS');

      const tx = new PolymeshTransaction(
        {
          ...txSpec,
          transaction,
          args,
        },
        context
      );

      await expect(tx.run()).rejects.toThrow(
        'The transaction was removed from the transaction pool. This might mean that it was malformed (nonce too large/nonce too small/duplicated or invalid transaction)'
      );
      expect(tx.status).toBe(TransactionStatus.Aborted);
    });

    it('should throw an error when the transaction fails', async () => {
      let transaction = dsMockUtils.createTxStub('asset', 'registerTicker', { autoResolve: false });
      const args = tuple('PLEASE_MAKE_IT_STOP');

      let tx = new PolymeshTransaction(
        {
          ...txSpec,
          transaction,
          args,
        },
        context
      );
      let runPromise = tx.run();

      dsMockUtils.updateTxStatus(
        transaction,
        dsMockUtils.MockTxStatus.Failed,
        dsMockUtils.TxFailReason.BadOrigin
      );

      await expect(runPromise).rejects.toThrow('Bad origin');
      expect(tx.status).toBe(TransactionStatus.Failed);

      transaction = dsMockUtils.createTxStub('asset', 'registerTicker', { autoResolve: false });
      tx = new PolymeshTransaction(
        {
          ...txSpec,
          transaction,
          args,
        },
        context
      );
      runPromise = tx.run();

      dsMockUtils.updateTxStatus(
        transaction,
        dsMockUtils.MockTxStatus.Failed,
        dsMockUtils.TxFailReason.CannotLookup
      );

      await expect(runPromise).rejects.toThrow(
        'Could not lookup information required to validate the transaction'
      );
      expect(tx.status).toBe(TransactionStatus.Failed);

      transaction = dsMockUtils.createTxStub('asset', 'registerTicker', { autoResolve: false });
      tx = new PolymeshTransaction(
        {
          ...txSpec,
          transaction,
          args,
        },
        context
      );
      runPromise = tx.run();

      dsMockUtils.updateTxStatus(
        transaction,
        dsMockUtils.MockTxStatus.Failed,
        dsMockUtils.TxFailReason.Other
      );

      await expect(runPromise).rejects.toThrow('Unknown error');
      expect(tx.status).toBe(TransactionStatus.Failed);

      transaction = dsMockUtils.createTxStub('asset', 'registerTicker', { autoResolve: false });
      tx = new PolymeshTransaction(
        {
          ...txSpec,
          transaction,
          args,
        },
        context
      );
      runPromise = tx.run();

      dsMockUtils.updateTxStatus(
        transaction,
        dsMockUtils.MockTxStatus.Failed,
        dsMockUtils.TxFailReason.Module
      );

      await expect(runPromise).rejects.toThrow('someModule.SomeError: This is very bad');
      expect(tx.status).toBe(TransactionStatus.Failed);
    });

    it('should throw an error when the transaction is rejected', async () => {
      const transaction = dsMockUtils.createTxStub('asset', 'registerTicker', {
        autoResolve: dsMockUtils.MockTxStatus.Rejected,
      });
      const args = tuple('THIS_IS_THE_LAST_ONE_I_SWEAR');

      const tx = new PolymeshTransaction(
        {
          ...txSpec,
          transaction,
          args,
        },
        context
      );

      await expect(tx.run()).rejects.toThrow('The user canceled the transaction signature');
      expect(tx.status).toBe(TransactionStatus.Rejected);
    });
  });

  describe('method: onStatusChange', () => {
    test("should execute a callback when the transaction's status changes", async () => {
      const transaction = dsMockUtils.createTxStub('asset', 'registerTicker');
      const args = tuple('I_HAVE_LOST_THE_WILL_TO_LIVE');

      const tx = new PolymeshTransaction(
        {
          ...txSpec,
          transaction,
          args,
        },
        context
      );

      const listenerStub = sinon.stub();

      tx.onStatusChange(t => listenerStub(t.status));

      await tx.run();

      sinon.assert.calledWith(listenerStub.firstCall, TransactionStatus.Unapproved);
      sinon.assert.calledWith(listenerStub.secondCall, TransactionStatus.Running);
      sinon.assert.calledWith(listenerStub.thirdCall, TransactionStatus.Succeeded);
    });

    it('should return an unsubscribe function', async () => {
      const transaction = dsMockUtils.createTxStub('asset', 'registerTicker', {
        autoResolve: false,
      });
      const args = tuple('THE_ONLY_THING_THAT_KEEPS_ME_GOING_IS_THE_HOPE_OF_FULL_COVERAGE');

      const tx = new PolymeshTransaction(
        {
          ...txSpec,
          transaction,
          args,
        },
        context
      );

      const listenerStub = sinon.stub();

      const unsub = tx.onStatusChange(t => listenerStub(t.status));

      tx.run();

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
    let gasFees: BigNumber[];
    let rawGasFees: Balance[];

    beforeAll(() => {
      balanceToBigNumberStub = sinon.stub(utilsConversionModule, 'balanceToBigNumber');
      protocolFees = [new BigNumber(250), new BigNumber(150)];
      gasFees = [new BigNumber(5), new BigNumber(10)];
      rawGasFees = gasFees.map(dsMockUtils.createMockBalance);
    });

    beforeEach(() => {
      context.getProtocolFees
        .withArgs({ tag: TxTags.asset.RegisterTicker })
        .resolves(protocolFees[0]);
      context.getProtocolFees.withArgs({ tag: TxTags.asset.CreateAsset }).resolves(protocolFees[1]);
      rawGasFees.forEach((rawGasFee, index) =>
        balanceToBigNumberStub.withArgs(rawGasFee).returns(new BigNumber(gasFees[index]))
      );
    });

    it('should fetch (if missing) and return transaction fees', async () => {
      const tx1 = dsMockUtils.createTxStub('asset', 'registerTicker', { gas: rawGasFees[0] });
      const tx2 = dsMockUtils.createTxStub('asset', 'createAsset', { gas: rawGasFees[1] });
      dsMockUtils.createTxStub('utility', 'batchAtomic', { gas: rawGasFees[1] });

      const args = tuple('OH_GOD_NO_IT_IS_BACK');

      let tx: PolymeshTransactionBase = new PolymeshTransaction(
        {
          ...txSpec,
          transaction: tx1,
          args,
          fee: undefined,
        },
        context
      );

      let result = await tx.getFees();

      expect(result?.protocol).toEqual(new BigNumber(250));
      expect(result?.gas).toEqual(new BigNumber(5));

      tx = new PolymeshTransaction(
        {
          ...txSpec,
          transaction: tx1,
          args,
          fee: undefined,
          feeMultiplier: new BigNumber(2),
        },
        context
      );

      result = await tx.getFees();

      expect(result?.protocol).toEqual(new BigNumber(500));
      expect(result?.gas).toEqual(new BigNumber(5));

      tx = new PolymeshTransaction(
        {
          ...txSpec,
          fee: new BigNumber(protocolFees[1]),
          transaction: tx2,
          args,
        },
        context
      );

      result = await tx.getFees();

      expect(result?.protocol).toEqual(new BigNumber(150));
      expect(result?.gas).toEqual(new BigNumber(10));

      tx = new PolymeshTransaction(
        {
          ...txSpec,
          fee: new BigNumber(protocolFees[1]),
          transaction: tx2,
          args,
        },
        context
      );

      result = await tx.getFees();

      expect(result?.protocol).toEqual(new BigNumber(150));
      expect(result?.gas).toEqual(new BigNumber(10));

      tx = new PolymeshTransactionBatch(
        {
          ...txSpec,
          fee: undefined,
          transactions: [
            {
              transaction: tx1,
              args,
            },
            {
              transaction: tx2,
              args,
            },
          ],
        },
        context
      );

      result = await tx.getFees();

      expect(result?.protocol).toEqual(new BigNumber(400));
      expect(result?.gas).toEqual(new BigNumber(10));
    });

    it('should return null if the transaction arguments are not ready', async () => {
      const transaction = dsMockUtils.createTxStub('asset', 'registerTicker', {
        gas: rawGasFees[0],
      });

      const args = tuple('WILL_IT_EVER_BE_OVER?');

      const tx = new PolymeshTransaction(
        {
          ...txSpec,
          transaction,
          args: args.map(arg => new PostTransactionValue(async () => arg)),
        },
        context
      );

      const result = await tx.getFees();

      expect(result).toBe(null);
    });
  });

  describe('method: getPayingAccount', () => {
    it('should return null if the current Account should pay', async () => {
      const transaction = dsMockUtils.createTxStub('asset', 'registerTicker');

      const args = tuple('SOMETHING');

      const tx: PolymeshTransactionBase = new PolymeshTransaction(
        {
          ...txSpec,
          transaction,
          args,
        },
        context
      );

      const result = await tx.getPayingAccount();

      expect(result).toBeNull();
    });

    it('should return null if the transaction ignores subsidy', async () => {
      const transaction = dsMockUtils.createTxStub('relayer', 'removePayingKey');
      const account = entityMockUtils.getAccountInstance();
      const allowance = new BigNumber(100);

      context.accountSubsidy.resolves({
        subsidizer: account,
        allowance,
      });

      const args = tuple('SOMETHING_ELSE');

      const tx = new PolymeshTransaction(
        {
          ...txSpec,
          transaction,
          args,
        },
        context
      );

      const result = await tx.getPayingAccount();

      expect(result).toBeNull();
    });

    it('should return a null allowance if the transaction is paid for a fixed third party', async () => {
      const transaction = dsMockUtils.createTxStub('asset', 'registerTicker');
      const account = entityMockUtils.getAccountInstance();
      const paidForBy = entityMockUtils.getIdentityInstance({
        getPrimaryAccount: {
          account,
          permissions: {
            assets: null,
            portfolios: null,
            transactions: null,
            transactionGroups: [],
          },
        },
      });

      const args = tuple('SOMETHING');

      const tx = new PolymeshTransaction(
        {
          ...txSpec,
          transaction,
          args,
          paidForBy,
        },
        context
      );

      const result = await tx.getPayingAccount();

      expect(result?.account.address).toEqual(account.address);
      expect(result?.allowance).toBeNull();
    });

    it('should return the account and allowance if the transaction is being subsidized', async () => {
      const transaction = dsMockUtils.createTxStub('asset', 'registerTicker');
      const account = expect.objectContaining({ address: 'subsidizer' });
      const allowance = new BigNumber(100);
      context.accountSubsidy.resolves({
        subsidy: entityMockUtils.getSubsidyInstance(),
        allowance,
      });

      const args = tuple('SOMETHING');

      let tx: PolymeshTransactionBase = new PolymeshTransaction(
        {
          ...txSpec,
          transaction,
          args,
        },
        context
      );

      let result = await tx.getPayingAccount();

      expect(result?.account).toEqual(account);
      expect(result?.allowance).toBe(allowance);

      tx = new PolymeshTransactionBatch(
        {
          ...txSpec,
          transactions: [
            {
              transaction,
              args,
            },
          ],
        },
        context
      );

      result = await tx.getPayingAccount();

      expect(result?.account).toEqual(account);
      expect(result?.allowance).toBe(allowance);
    });
  });
});
