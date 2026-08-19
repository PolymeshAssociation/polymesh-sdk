import { SubmittableResult } from '@polkadot/api';
import { Balance } from '@polkadot/types/interfaces';
import { Signer as PolkadotSigner } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';
import { noop } from 'lodash';

import * as baseUtils from '~/base/utils';
import {
  Context,
  MultiSigProposal,
  PolymeshError,
  PolymeshTransaction,
  PolymeshTransactionBase,
  PolymeshTransactionBatch,
} from '~/internal';
import { latestBlockQuery } from '~/middleware/queries/common';
import { fakePromise, fakePromises } from '~/testUtils';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';
import { createMockSigningPayload, MockTxStatus } from '~/testUtils/mocks/dataSources';
import { Mocked } from '~/testUtils/types';
import { ErrorCode, MultiSig, PayingAccountType, TransactionStatus, TxTags } from '~/types';
import { tuple } from '~/types/utils';
import { DUMMY_ACCOUNT_ID, MAX_BATCH_SIZE_SUPPORTING_SUBSIDY } from '~/utils/constants';
import * as utilsConversionModule from '~/utils/conversion';
import * as utilsInternalModule from '~/utils/internal';

describe('Polymesh Transaction Base class', () => {
  let context: Mocked<Context>;

  beforeAll(() => {
    jest.useFakeTimers({
      legacyFakeTimers: true,
    });
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
    isCritical: false,
    fee: new BigNumber(100),
    mortality: { immortal: false } as const,
  };

  afterEach(() => {
    dsMockUtils.reset();
    entityMockUtils.reset();
    /*
     * several tests stub `~/base/utils` module functions (`getExtrinsicFailure`,
     *   `pollForTransactionFinalization`). Without this those stubs, and their call counts, leak
     *   into every test that runs afterwards
     */
    jest.restoreAllMocks();
  });

  afterAll(() => {
    jest.useRealTimers();
    dsMockUtils.cleanup();
  });

  describe('method: toTransactionSpec', () => {
    it('should return the base tx spec of a transaction', () => {
      const transaction = dsMockUtils.createTxMock('asset', 'registerUniqueTicker');
      const args = tuple('FOO');
      const resolver = (): number => 1;
      const transformer = (): number => 2;
      const paidForBy = entityMockUtils.getIdentityInstance();

      const tx = new PolymeshTransaction(
        {
          ...txSpec,
          transaction,
          args,
          resolver,
          transformer,
          feeMultiplier: new BigNumber(10),
          paidForBy,
        },
        context
      );

      expect(PolymeshTransactionBase.toTransactionSpec(tx)).toEqual({
        multiSig: null,
        resolver,
        transformer,
        paidForBy,
        preRunValidation: undefined,
      });
    });

    it('should include preRunValidation in the returned spec', () => {
      const transaction = dsMockUtils.createTxMock('asset', 'registerUniqueTicker');
      const args = tuple('BAR');
      const resolver = (): number => 1;
      const preRunValidation = jest.fn().mockResolvedValue(undefined);

      const tx = new PolymeshTransaction(
        {
          ...txSpec,
          transaction,
          args,
          resolver,
          preRunValidation,
        },
        context
      );

      expect(PolymeshTransactionBase.toTransactionSpec(tx)).toEqual({
        multiSig: null,
        resolver,
        transformer: undefined,
        paidForBy: undefined,
        preRunValidation,
      });
    });
  });

  describe('method: run', () => {
    let getBlockMock: jest.Mock;

    beforeEach(() => {
      getBlockMock = dsMockUtils.createRpcMock('chain', 'getBlock');
      getBlockMock.mockResolvedValue(
        dsMockUtils.createMockSignedBlock({
          block: {
            header: {
              number: dsMockUtils.createMockCompact(dsMockUtils.createMockU32(new BigNumber(1))),
              parentHash: 'hash',
              stateRoot: 'hash',
              extrinsicsRoot: 'hash',
            },
            extrinsics: undefined,
          },
        })
      );
    });

    it('should execute the underlying transaction with the provided arguments, setting the tx and block hash when finished', async () => {
      const transaction = dsMockUtils.createTxMock('utility', 'batchAll', {
        autoResolve: false,
      });
      const underlyingTx = dsMockUtils.createTxMock('asset', 'registerUniqueTicker');
      const args = tuple('A_TICKER');

      const tx = new PolymeshTransactionBatch(
        {
          ...txSpec,
          transactions: [{ transaction: underlyingTx, args }],
          resolver: 3,
        },
        context
      );

      const runPromise = tx.run().catch(noop);

      await fakePromise();

      dsMockUtils.updateTxStatus(transaction, dsMockUtils.MockTxStatus.InBlock);

      await fakePromise();

      dsMockUtils.updateTxStatus(transaction, dsMockUtils.MockTxStatus.Succeeded);

      await fakePromise();

      expect(underlyingTx).toHaveBeenCalledWith(...args);
      expect(tx.blockHash).toBeDefined();
      expect(tx.blockNumber).toBeDefined();
      expect(tx.txHash).toBeDefined();
      expect(tx.txIndex).toBeDefined();
      expect(tx.status).toBe(TransactionStatus.Succeeded);

      const result = await runPromise;

      expect(result).toBe(3);
    });

    it('should update the transaction status', async () => {
      const transaction = dsMockUtils.createTxMock('utility', 'batchAll', {
        autoResolve: false,
      });
      const args = tuple('ANOTHER_TICKER');

      const statuses: TransactionStatus[] = [];

      const tx = new PolymeshTransactionBatch(
        {
          ...txSpec,
          transactions: [
            { transaction: dsMockUtils.createTxMock('asset', 'registerUniqueTicker'), args },
          ],
          resolver: undefined,
        },
        context
      );

      tx.onStatusChange(txr => {
        statuses.push(txr.status);
      });

      expect(tx.status).toBe(TransactionStatus.Idle);

      tx.run().catch(noop);

      await fakePromise();

      dsMockUtils.updateTxStatus(transaction, dsMockUtils.MockTxStatus.Ready);

      await fakePromise();

      expect(tx.status).toBe(TransactionStatus.Running);

      dsMockUtils.updateTxStatus(transaction, dsMockUtils.MockTxStatus.Intermediate);

      await fakePromise();

      expect(tx.status).toBe(TransactionStatus.Running);

      dsMockUtils.updateTxStatus(transaction, dsMockUtils.MockTxStatus.Future);

      await fakePromise();

      expect(tx.status).toBe(TransactionStatus.Future);

      dsMockUtils.updateTxStatus(transaction, dsMockUtils.MockTxStatus.InBlock);

      await fakePromise();

      expect(tx.status).toBe(TransactionStatus.InBlock);

      dsMockUtils.updateTxStatus(transaction, dsMockUtils.MockTxStatus.Succeeded);

      expect(statuses).toEqual([
        TransactionStatus.Unapproved,
        TransactionStatus.Running,
        TransactionStatus.Future,
        TransactionStatus.InBlock,
      ]);
    });

    it('should resolve the result if it is a resolver function', async () => {
      const transaction = dsMockUtils.createTxMock('asset', 'registerUniqueTicker');
      const args = tuple('YET_ANOTHER_TICKER');
      const resolverMock = jest.fn().mockResolvedValue(1);
      const balance = {
        free: new BigNumber(1000000),
        locked: new BigNumber(0),
        total: new BigNumber(1000000),
      };

      const subsidy = entityMockUtils.getSubsidyInstance();
      subsidy.subsidizer = entityMockUtils.getAccountInstance({
        getBalance: balance,
      });

      context = dsMockUtils.getContextInstance({
        subsidy: {
          subsidy,
          allowance: new BigNumber(10000),
        },
        balance,
      });

      const tx = new PolymeshTransaction(
        {
          ...txSpec,
          transaction,
          args,
          resolver: resolverMock,
        },
        context
      );

      await tx.run();

      expect(resolverMock).toHaveBeenCalledTimes(1);
    });

    it('should throw an error if attempting to run a transaction that has already run', async () => {
      const transaction = dsMockUtils.createTxMock('asset', 'registerUniqueTicker');
      const args = tuple('HOW_MANY_TICKERS_DO_I_NEED');

      const tx = new PolymeshTransaction(
        {
          ...txSpec,
          transaction,
          args,
          resolver: undefined,
        },
        context
      );

      await tx.run();

      await fakePromise();

      return expect(tx.run()).rejects.toThrow('Cannot re-run a Transaction');
    });

    it('should throw an error when the transaction is aborted', async () => {
      const transaction = dsMockUtils.createTxMock('asset', 'registerUniqueTicker', {
        autoResolve: dsMockUtils.MockTxStatus.Aborted,
      });
      const args = tuple('IT_HURTS');

      const tx = new PolymeshTransaction(
        {
          ...txSpec,
          transaction,
          args,
          resolver: undefined,
          paidForBy: entityMockUtils.getIdentityInstance({
            getPrimaryAccount: {
              account: entityMockUtils.getAccountInstance({
                getBalance: {
                  free: new BigNumber(10000),
                  locked: new BigNumber(0),
                  total: new BigNumber(10000),
                },
              }),
            },
          }),
        },
        context
      );

      await expect(tx.run()).rejects.toThrow(
        'The transaction was removed from the transaction pool. This might mean that it was malformed (nonce too large/nonce too small/duplicated or invalid transaction)'
      );
      expect(tx.status).toBe(TransactionStatus.Aborted);
    });

    it('should throw an error when the transaction fails', async () => {
      let transaction = dsMockUtils.createTxMock('asset', 'registerUniqueTicker', {
        autoResolve: false,
      });
      const args = tuple('PLEASE_MAKE_IT_STOP');

      let tx = new PolymeshTransaction(
        {
          ...txSpec,
          transaction,
          args,
          resolver: undefined,
        },
        context
      );
      let runPromise = tx.run();

      await fakePromise(3);

      dsMockUtils.updateTxStatus(
        transaction,
        dsMockUtils.MockTxStatus.Failed,
        dsMockUtils.TxFailReason.BadOrigin
      );

      await expect(runPromise).rejects.toThrow('Bad origin');
      expect(tx.status).toBe(TransactionStatus.Failed);

      transaction = dsMockUtils.createTxMock('asset', 'registerUniqueTicker', {
        autoResolve: false,
      });
      tx = new PolymeshTransaction(
        {
          ...txSpec,
          transaction,
          args,
          resolver: undefined,
        },
        context
      );
      runPromise = tx.run();

      await fakePromise(1);

      dsMockUtils.updateTxStatus(
        transaction,
        dsMockUtils.MockTxStatus.Failed,
        dsMockUtils.TxFailReason.CannotLookup
      );

      await expect(runPromise).rejects.toThrow(
        'Could not lookup information required to validate the transaction'
      );
      expect(tx.status).toBe(TransactionStatus.Failed);

      transaction = dsMockUtils.createTxMock('asset', 'registerUniqueTicker', {
        autoResolve: false,
      });
      tx = new PolymeshTransaction(
        {
          ...txSpec,
          transaction,
          args,
          resolver: undefined,
        },
        context
      );
      runPromise = tx.run();

      await fakePromise(1);

      dsMockUtils.updateTxStatus(
        transaction,
        dsMockUtils.MockTxStatus.Failed,
        dsMockUtils.TxFailReason.Other
      );

      await expect(runPromise).rejects.toThrow('Unknown error');
      expect(tx.status).toBe(TransactionStatus.Failed);

      transaction = dsMockUtils.createTxMock('asset', 'registerUniqueTicker', {
        autoResolve: false,
      });
      tx = new PolymeshTransaction(
        {
          ...txSpec,
          transaction,
          args,
          resolver: undefined,
        },
        context
      );
      runPromise = tx.run();

      await fakePromise(1);

      dsMockUtils.updateTxStatus(
        transaction,
        dsMockUtils.MockTxStatus.Failed,
        dsMockUtils.TxFailReason.Module
      );

      await expect(runPromise).rejects.toThrow('someModule.SomeError: This is very bad');
      expect(tx.status).toBe(TransactionStatus.Failed);
    });

    it('should throw an error if there is a problem fetching block data', async () => {
      const message = 'Something went wrong';
      getBlockMock.mockRejectedValue(new Error(message));

      const transaction = dsMockUtils.createTxMock('asset', 'registerUniqueTicker', {
        autoResolve: false,
      });
      const args = tuple('HERE WE ARE AGAIN');

      const tx = new PolymeshTransaction(
        {
          ...txSpec,
          transaction,
          args,
          resolver: undefined,
        },
        context
      );
      const runPromise = tx.run();

      await fakePromise(1);

      dsMockUtils.updateTxStatus(transaction, dsMockUtils.MockTxStatus.InBlock);

      await fakePromise();

      dsMockUtils.updateTxStatus(transaction, dsMockUtils.MockTxStatus.Succeeded);

      return expect(runPromise).rejects.toThrow(message);
    });

    it('should throw an error if there is a problem unsubscribing', async () => {
      const transaction = dsMockUtils.createTxMock('asset', 'registerUniqueTicker', {
        autoResolve: false,
      });
      const args = tuple('I HATE TESTING THESE THINGS');

      const tx = new PolymeshTransaction(
        {
          ...txSpec,
          transaction,
          args,
          resolver: undefined,
        },
        context
      );
      const runPromise = tx.run();

      await fakePromise(1);

      dsMockUtils.updateTxStatus(transaction, dsMockUtils.MockTxStatus.InBlock);

      await fakePromise();

      dsMockUtils.updateTxStatus(transaction, dsMockUtils.MockTxStatus.FailedToUnsubscribe);

      return expect(runPromise).rejects.toThrow();
    });

    it('should throw an error when the transaction is rejected', async () => {
      const transaction = dsMockUtils.createTxMock('asset', 'registerUniqueTicker', {
        autoResolve: dsMockUtils.MockTxStatus.Rejected,
      });
      const args = tuple('THIS_IS_THE_LAST_ONE_I_SWEAR');

      const tx = new PolymeshTransaction(
        {
          ...txSpec,
          transaction,
          args,
          resolver: undefined,
        },
        context
      );

      await expect(tx.run()).rejects.toThrow('The user canceled the transaction signature');
      expect(tx.status).toBe(TransactionStatus.Rejected);
    });

    it('should throw an error if trying to run a transaction that cannot be subsidized', async () => {
      const notSupportedTransaction = dsMockUtils.createTxMock('staking', 'bond', {
        autoResolve: MockTxStatus.Succeeded,
      });
      const randomArgs = tuple('JUST_KIDDING');

      context = dsMockUtils.getContextInstance({
        subsidy: {
          subsidy: entityMockUtils.getSubsidyInstance(),
          allowance: new BigNumber(1000),
        },
        supportsSubsidy: false,
      });

      const tx = new PolymeshTransaction(
        {
          ...txSpec,
          transaction: notSupportedTransaction,
          args: randomArgs,
          resolver: undefined,
        },
        context
      );

      await expect(tx.run()).rejects.toThrow(
        'This transaction cannot be run by a subsidized Account'
      );
      expect(tx.status).toBe(TransactionStatus.Failed);

      dsMockUtils.createTxMock('utility', 'batchAll');

      const transaction = dsMockUtils.createTxMock('asset', 'registerUniqueTicker');
      const args = tuple('A_TICKER');

      const transactions = [
        {
          transaction,
          args,
        },
        {
          transaction,
          args,
        },
        {
          transaction,
          args,
        },
        {
          transaction,
          args,
        },
        {
          transaction,
          args,
        },
        {
          transaction,
          args,
        },
        {
          transaction,
          args,
        },
        {
          transaction,
          args,
        },
      ];

      const tooLongBatchTransaction = new PolymeshTransactionBatch(
        {
          ...txSpec,
          transactions,
          resolver: undefined,
        },
        context
      );

      await expect(tooLongBatchTransaction.run()).rejects.toThrow(
        `Batch transactions can only be subsidized with a maximum of ${MAX_BATCH_SIZE_SUPPORTING_SUBSIDY} batched calls`
      );

      const batchWithNotSupportedTransaction = new PolymeshTransactionBatch(
        {
          ...txSpec,
          transactions: [
            {
              transaction: notSupportedTransaction,
              args: randomArgs,
            },
          ],
          resolver: undefined,
        },
        context
      );

      await expect(batchWithNotSupportedTransaction.run()).rejects.toThrow(
        'Some of the transactions cannot be run by a subsidized Account'
      );
    });

    it('should throw an error if the subsidy does not have enough allowance', async () => {
      const transaction = dsMockUtils.createTxMock('staking', 'bond', {
        autoResolve: MockTxStatus.Succeeded,
      });
      const args = tuple('JUST_KIDDING');

      context = dsMockUtils.getContextInstance({
        subsidy: {
          subsidy: entityMockUtils.getSubsidyInstance(),
          allowance: new BigNumber(10),
        },
      });

      const tx = new PolymeshTransaction(
        {
          ...txSpec,
          transaction,
          args,
          resolver: undefined,
        },
        context
      );

      await expect(tx.run()).rejects.toThrow(
        "Insufficient subsidy allowance to pay this transaction's fees"
      );
      expect(tx.status).toBe(TransactionStatus.Failed);
    });

    it('should throw an error if the paying account does not have enough balance', async () => {
      const transaction = dsMockUtils.createTxMock('staking', 'bond', {
        autoResolve: MockTxStatus.Succeeded,
      });
      const args = tuple('JUST_KIDDING');

      context = dsMockUtils.getContextInstance({
        balance: {
          free: new BigNumber(0),
          locked: new BigNumber(0),
          total: new BigNumber(0),
        },
      });

      const tx = new PolymeshTransaction(
        {
          ...txSpec,
          transaction,
          args,
          resolver: undefined,
        },
        context
      );

      await expect(tx.run()).rejects.toThrow(
        "The caller Account does not have enough POLYX balance to pay this transaction's fees"
      );
      expect(tx.status).toBe(TransactionStatus.Failed);
    });

    it('should throw error if the signing address is not available in the Context', () => {
      const transaction = dsMockUtils.createTxMock('staking', 'bond', {
        autoResolve: MockTxStatus.Succeeded,
      });
      const args = tuple('JUST_KIDDING');

      const expectedError = new PolymeshError({
        code: ErrorCode.General,
        message: 'The Account is not part of the Signing Manager attached to the ',
      });
      context = dsMockUtils.getContextInstance();
      context.assertHasSigningAddress.mockRejectedValue(expectedError);

      const tx = new PolymeshTransaction(
        {
          ...txSpec,
          transaction,
          args,
          resolver: undefined,
        },
        context
      );

      return expect(() => tx.run()).rejects.toThrow(expectedError);
    });

    it('should call signAndSend with era 0 when given an immortal mortality option', async () => {
      const transaction = dsMockUtils.createTxMock('staking', 'bond');
      const args = tuple('FOO');
      const txWithArgsMock = transaction(...args);

      const tx = new PolymeshTransaction(
        {
          ...txSpec,
          mortality: { immortal: true },
          transaction,
          args,
          resolver: undefined,
        },
        context
      );

      await tx.run();
      expect(txWithArgsMock.signAndSend).toHaveBeenCalledWith(
        txSpec.signingAddress,
        expect.objectContaining({
          era: 0,
          withSignedTransaction: true,
          allowCallDataAlteration: false,
        }),
        expect.any(Function)
      );
    });

    it('should call signAndSend with the lifetime when given a mortal mortality option', async () => {
      const transaction = dsMockUtils.createTxMock('staking', 'bond');
      const args = tuple('FOO');
      const txWithArgsMock = transaction(...args);

      const tx = new PolymeshTransaction(
        {
          ...txSpec,
          mortality: { immortal: false, lifetime: new BigNumber(7) },
          transaction,
          args,
          resolver: undefined,
        },
        context
      );

      await tx.run();
      expect(txWithArgsMock.signAndSend).toHaveBeenCalledWith(
        txSpec.signingAddress,
        expect.objectContaining({ era: 7 }),
        expect.any(Function)
      );
    });

    it('should call signAndSend with no era when given a mortal mortality option with no lifetime', async () => {
      const transaction = dsMockUtils.createTxMock('staking', 'bond');
      const args = tuple('FOO');
      const txWithArgsMock = transaction(...args);

      const tx = new PolymeshTransaction(
        {
          ...txSpec,
          mortality: { immortal: false },
          transaction,
          args,
          resolver: undefined,
        },
        context
      );

      await tx.run();
      expect(txWithArgsMock.signAndSend).toHaveBeenCalledWith(
        txSpec.signingAddress,
        expect.not.objectContaining({ era: expect.anything() }),
        expect.any(Function)
      );
    });

    it('should use polling when subscription is not enabled', async () => {
      const transaction = dsMockUtils.createTxMock('staking', 'bond', { autoResolve: false });
      context.supportsSubscription.mockReturnValue(false);

      const fakeReceipt = new SubmittableResult({
        blockNumber: dsMockUtils.createMockU32(new BigNumber(101)),
        status: dsMockUtils.createMockExtrinsicStatus({
          Finalized: dsMockUtils.createMockHash('blockHash'),
        }),
        txHash: dsMockUtils.createMockHash('bond'),
        txIndex: 1,
      });

      jest.spyOn(baseUtils, 'pollForTransactionFinalization').mockResolvedValue(fakeReceipt);

      const args = tuple('FOO');
      const txWithArgsMock = transaction(...args);

      const tx = new PolymeshTransaction(
        {
          ...txSpec,
          transaction,
          args,
          resolver: 'pollingResult',
        },
        context
      );

      const result = await tx.run();
      expect(txWithArgsMock.signAndSend).toHaveBeenCalledWith(
        txSpec.signingAddress,
        expect.objectContaining({
          nonce: -1,
          signer: 'signer',
          withSignedTransaction: true,
          allowCallDataAlteration: false,
        })
      );

      expect(tx.blockHash).toEqual('blockHash');
      expect(tx.blockNumber).toEqual(new BigNumber(101));
      expect(tx.txHash).toEqual('bond');
      expect(tx.txIndex).toEqual(new BigNumber(1));
      expect(tx.status).toBe(TransactionStatus.Succeeded);
      expect(tx.receipt).toBeDefined();

      expect(result).toBe('pollingResult');
    });

    it('should broadcast a natively signed transaction without waiting for it', async () => {
      const transaction = dsMockUtils.createTxMock('staking', 'bond', { autoResolve: false });
      context.supportsSubscription.mockReturnValue(false);

      const fakeReceipt = new SubmittableResult({
        blockNumber: dsMockUtils.createMockU32(new BigNumber(101)),
        status: dsMockUtils.createMockExtrinsicStatus({
          Finalized: dsMockUtils.createMockHash('blockHash'),
        }),
        txHash: dsMockUtils.createMockHash('bond'),
        txIndex: 1,
      });

      jest.spyOn(baseUtils, 'pollForTransactionFinalization').mockResolvedValue(fakeReceipt);

      const args = tuple('FOO');
      const txWithArgsMock = transaction(...args);

      const tx = new PolymeshTransaction(
        { ...txSpec, transaction, args, resolver: 'pollingResult' },
        context
      );

      const handle = await tx.broadcast();

      // the native signer data path: signed and sent, with no Ethereum signer involved
      expect(txWithArgsMock.signAndSend).toHaveBeenCalledWith(
        txSpec.signingAddress,
        expect.objectContaining({ signer: 'signer' })
      );
      expect(handle.ethTxHash).toBeUndefined();
      expect(tx.status).toBe(TransactionStatus.Running);

      await expect(handle.watch()).resolves.toBe('pollingResult');
      expect(tx.status).toBe(TransactionStatus.Succeeded);
    });

    it('should throw an error when polling if the finalized receipt contains an extrinsic failure', () => {
      const transaction = dsMockUtils.createTxMock('staking', 'bond', { autoResolve: false });
      context.supportsSubscription.mockReturnValue(false);

      const fakeReceipt = new SubmittableResult({
        blockNumber: dsMockUtils.createMockU32(new BigNumber(101)),
        status: dsMockUtils.createMockExtrinsicStatus({
          Finalized: dsMockUtils.createMockHash('blockHash'),
        }),
        txHash: dsMockUtils.createMockHash('bond'),
        txIndex: 1,
      });
      fakeReceipt.filterRecords = jest.fn().mockReturnValue([{ event: { data: ['some error'] } }]);

      jest.spyOn(baseUtils, 'pollForTransactionFinalization').mockResolvedValue(fakeReceipt);

      const args = tuple('FOO');

      const expectedError = new PolymeshError({
        code: ErrorCode.UnexpectedError,
        message: 'Unknown error',
      });

      const tx = new PolymeshTransaction(
        {
          ...txSpec,
          transaction,
          args,
          resolver: undefined,
        },
        context
      );

      return expect(tx.run()).rejects.toThrow(expectedError);
    });

    it('should handle era=0 correctly when subscription is not enabled', async () => {
      const transaction = dsMockUtils.createTxMock('staking', 'bond', { autoResolve: false });
      context.supportsSubscription.mockReturnValue(false);

      const fakeReceipt = new SubmittableResult({
        blockNumber: dsMockUtils.createMockU32(new BigNumber(101)),
        status: dsMockUtils.createMockExtrinsicStatus({
          Finalized: dsMockUtils.createMockHash('blockHash'),
        }),
        txHash: dsMockUtils.createMockHash('bond'),
        txIndex: 1,
      });

      jest.spyOn(baseUtils, 'pollForTransactionFinalization').mockResolvedValue(fakeReceipt);

      const args = tuple('FOO');
      const txWithArgsMock = transaction(...args);

      const tx = new PolymeshTransaction(
        {
          ...txSpec,
          mortality: { immortal: true },
          transaction,
          args,
          resolver: 'pollingResult',
        },
        context
      );

      await tx.run();
      expect(txWithArgsMock.signAndSend).toHaveBeenCalledWith(
        txSpec.signingAddress,
        expect.objectContaining({
          nonce: -1,
          signer: 'signer',
          era: 0,
          withSignedTransaction: true,
          allowCallDataAlteration: false,
        })
      );
    });

    it('should throw an error when polling if there is an extrinsic failure', () => {
      const transaction = dsMockUtils.createTxMock('staking', 'bond', { autoResolve: false });
      context.supportsSubscription.mockReturnValue(false);

      const fakeReceipt = new SubmittableResult({
        blockNumber: dsMockUtils.createMockU32(new BigNumber(101)),
        status: dsMockUtils.createMockExtrinsicStatus({
          Finalized: dsMockUtils.createMockHash('blockHash'),
        }),
        txHash: dsMockUtils.createMockHash('bond'),
        txIndex: 1,
      });
      fakeReceipt.filterRecords = jest.fn().mockReturnValue([{ event: { data: ['some error'] } }]);

      jest.spyOn(baseUtils, 'pollForTransactionFinalization').mockResolvedValue(fakeReceipt);

      const args = tuple('FOO');

      const expectedError = new PolymeshError({
        code: ErrorCode.UnexpectedError,
        message: 'Unknown error',
      });

      const tx = new PolymeshTransaction(
        {
          ...txSpec,
          transaction,
          args,
          resolver: undefined,
        },
        context
      );

      return expect(tx.run()).rejects.toThrow(expectedError);
    });

    it('should throw an error when polling if there is an error submitting the transaction', () => {
      const transaction = dsMockUtils.createTxMock('staking', 'bond', { autoResolve: false });
      context.supportsSubscription.mockReturnValue(false);

      const args = tuple('FOO');
      const txWithArgsMock = transaction(...args);

      txWithArgsMock.signAndSend.mockRejectedValue(new Error('some error'));

      const expectedError = new PolymeshError({
        code: ErrorCode.UnexpectedError,
        message: 'some error',
      });

      const tx = new PolymeshTransaction(
        {
          ...txSpec,
          transaction,
          args,
          resolver: 'pollingResult',
        },
        context
      );

      return expect(tx.run()).rejects.toThrow(expectedError);
    });

    it('should throw an error if called with a multiSig signer', () => {
      const transaction = dsMockUtils.createTxMock('staking', 'bond', { autoResolve: false });
      context.supportsSubscription.mockReturnValue(false);

      const args = tuple('FOO');
      const txWithArgsMock = transaction(...args);

      txWithArgsMock.signAndSend.mockRejectedValue(new Error('some error'));

      const expectedError = new PolymeshError({
        code: ErrorCode.ValidationError,
        message:
          '`.run` cannot be used with a MultiSig signer. `.runAsProposal` should be called instead',
      });

      const tx = new PolymeshTransaction(
        {
          ...txSpec,
          transaction,
          args,
          multiSig: entityMockUtils.getMultiSigInstance(),
          resolver: undefined,
        },
        context
      );

      return expect(tx.run()).rejects.toThrow(expectedError);
    });

    it('should call preRunValidation with false before running the transaction', async () => {
      const transaction = dsMockUtils.createTxMock('asset', 'registerUniqueTicker');
      const args = tuple('VALIDATION_TEST');
      const preRunValidation = jest.fn().mockResolvedValue(undefined);

      const tx = new PolymeshTransaction(
        {
          ...txSpec,
          transaction,
          args,
          resolver: undefined,
          preRunValidation,
        },
        context
      );

      await tx.run();

      expect(preRunValidation).toHaveBeenCalledWith({ asProposal: false });
      expect(transaction).toHaveBeenCalledWith(...args);
    });

    it('should throw an error if preRunValidation fails', async () => {
      const transaction = dsMockUtils.createTxMock('asset', 'registerUniqueTicker');
      const args = tuple('VALIDATION_FAILURE_TEST');
      const validationError = new PolymeshError({
        code: ErrorCode.InsufficientBalance,
        message: 'Insufficient balance',
      });
      const preRunValidation = jest.fn().mockRejectedValue(validationError);

      const tx = new PolymeshTransaction(
        {
          ...txSpec,
          transaction,
          args,
          resolver: undefined,
          preRunValidation,
        },
        context
      );

      await expect(tx.run()).rejects.toThrow(validationError);
      expect(preRunValidation).toHaveBeenCalledWith({ asProposal: false });
      expect(transaction).not.toHaveBeenCalled();
    });

    it('should not call preRunValidation if it is not provided', async () => {
      const transaction = dsMockUtils.createTxMock('asset', 'registerUniqueTicker');
      const args = tuple('NO_VALIDATION_TEST');

      const tx = new PolymeshTransaction(
        {
          ...txSpec,
          transaction,
          args,
          resolver: undefined,
        },
        context
      );

      await tx.run();

      expect(transaction).toHaveBeenCalledWith(...args);
      expect(tx.status).toBe(TransactionStatus.Succeeded);
    });
  });

  describe('method: runAsProposal', () => {
    let getBlockMock: jest.Mock;
    let multiSig: MultiSig;
    let filterEventRecordsSpy: jest.SpyInstance;

    beforeEach(() => {
      getBlockMock = dsMockUtils.createRpcMock('chain', 'getBlock');
      getBlockMock.mockResolvedValue(
        dsMockUtils.createMockSignedBlock({
          block: {
            header: {
              number: dsMockUtils.createMockCompact(dsMockUtils.createMockU32(new BigNumber(1))),
              parentHash: 'hash',
              stateRoot: 'hash',
              extrinsicsRoot: 'hash',
            },
            extrinsics: undefined,
          },
        })
      );

      const proposalId = new BigNumber(2);
      const rawProposalId = dsMockUtils.createMockU64(proposalId);

      filterEventRecordsSpy = jest.spyOn(utilsInternalModule, 'filterEventRecords');
      when(filterEventRecordsSpy)
        .calledWith(expect.any(Object), 'multiSig', 'ProposalAdded')
        .mockReturnValue([dsMockUtils.createMockIEvent([undefined, undefined, rawProposalId])]);

      multiSig = entityMockUtils.getMultiSigInstance({
        address: DUMMY_ACCOUNT_ID,
        getPayer: entityMockUtils.getIdentityInstance({
          getPrimaryAccount: {
            account: entityMockUtils.getAccountInstance({
              getBalance: { total: new BigNumber(1000), free: new BigNumber(1000) },
            }),
          },
        }),
      });
    });

    it('should execute the underlying transaction with the provided arguments, setting the tx and block hash when finished', async () => {
      const underlyingTx = dsMockUtils.createTxMock('asset', 'registerUniqueTicker');
      const args = [dsMockUtils.createMockText('A_TICKER')];

      const transaction = dsMockUtils.createTxMock('multiSig', 'createProposal', {
        autoResolve: MockTxStatus.Succeeded,
      });

      const tx = new PolymeshTransaction(
        {
          ...txSpec,
          transaction: underlyingTx,
          args,
          resolver: 3,
          multiSig,
        },
        context
      );

      const runAsProposalPromise = tx.runAsProposal();

      const result = await runAsProposalPromise;

      expect(underlyingTx).toHaveBeenCalledWith(...args);
      expect(transaction).toHaveBeenCalled();

      expect(result).toBeInstanceOf(MultiSigProposal);
      expect(tx.status).toEqual(TransactionStatus.Succeeded);
      expect(() => tx.result).toThrow(PolymeshError); // MultiSig Proposal would mess up the type
    });

    it('should handle when MultiSig does not have a payer', async () => {
      multiSig = entityMockUtils.getMultiSigInstance({
        address: DUMMY_ACCOUNT_ID,
        getPayer: null,
        getBalance: { total: new BigNumber(1000), free: new BigNumber(1000) },
      });

      const underlyingTx = dsMockUtils.createTxMock('asset', 'registerUniqueTicker');
      const args = [dsMockUtils.createMockText('A_TICKER')];

      const transaction = dsMockUtils.createTxMock('multiSig', 'createProposal', {
        autoResolve: MockTxStatus.Succeeded,
      });

      const tx = new PolymeshTransaction(
        {
          ...txSpec,
          transaction: underlyingTx,
          args,
          resolver: 3,
          multiSig,
        },
        context
      );

      const runAsProposalPromise = tx.runAsProposal();

      const result = await runAsProposalPromise;

      expect(underlyingTx).toHaveBeenCalledWith(...args);
      expect(transaction).toHaveBeenCalled();

      expect(result).toBeInstanceOf(MultiSigProposal);
      expect(tx.status).toEqual(TransactionStatus.Succeeded);
    });

    it('should use multiSigOpts.expiry if it is provided', async () => {
      const underlyingTx = dsMockUtils.createTxMock('asset', 'registerUniqueTicker');
      const args = [dsMockUtils.createMockText('A_TICKER')];

      dsMockUtils.createTxMock('multiSig', 'createProposal', {
        autoResolve: MockTxStatus.Succeeded,
      });

      const expiry = new Date('10/14/1987');

      const dateToMomentSpy = jest.spyOn(utilsConversionModule, 'dateToMoment');

      const tx = new PolymeshTransaction(
        {
          ...txSpec,
          transaction: underlyingTx,
          args,
          resolver: 3,
          multiSig,
          multiSigOpts: { expiry },
        },
        context
      );

      await tx.runAsProposal();

      expect(dateToMomentSpy).toHaveBeenCalledWith(expiry, context);
    });

    it('should throw an error if trying to run a transaction that already ran', async () => {
      const underlyingTx = dsMockUtils.createTxMock('asset', 'registerUniqueTicker');
      const args = [dsMockUtils.createMockText('A_TICKER')];

      dsMockUtils.createTxMock('multiSig', 'createProposal', {});

      const tx = new PolymeshTransaction(
        {
          ...txSpec,
          transaction: underlyingTx,
          args,
          resolver: 3,
          multiSig,
        },
        context
      );

      await tx.runAsProposal();

      const expectedError = new PolymeshError({
        code: ErrorCode.General,
        message: 'Cannot re-run a Transaction',
      });

      return expect(tx.runAsProposal()).rejects.toThrow(expectedError);
    });

    it('should not wrap the transaction in a proposal if its to approve a proposal', () => {
      const transaction = dsMockUtils.createTxMock('multiSig', 'approve');

      const tx = new PolymeshTransaction(
        {
          ...txSpec,
          transaction,
          args: [],
          resolver: 3,
          multiSig,
        },
        context
      );

      const expectedError = new PolymeshError({
        code: ErrorCode.ValidationError,
        message:
          '`.run` should be used instead. Either the signing account is not a MultiSig signer, or the transaction is to approve or reject a MultiSig proposal',
      });

      return expect(tx.runAsProposal()).rejects.toThrow(expectedError);
    });

    it('should throw an error from running the transaction', async () => {
      const underlyingTx = dsMockUtils.createTxMock('asset', 'registerUniqueTicker');

      dsMockUtils.createTxMock('multiSig', 'createProposal', {
        autoResolve: MockTxStatus.Aborted,
      });
      const args = [dsMockUtils.createMockText('A_TICKER')];

      const tx = new PolymeshTransaction(
        {
          ...txSpec,
          transaction: underlyingTx,
          args,
          resolver: 3,
          multiSig,
        },
        context
      );

      await expect(tx.runAsProposal()).rejects.toThrow(PolymeshError);
    });

    it('should call preRunValidation with true before running as proposal', async () => {
      const underlyingTx = dsMockUtils.createTxMock('asset', 'registerUniqueTicker');
      const args = [dsMockUtils.createMockText('VALIDATION_PROPOSAL_TEST')];
      const preRunValidation = jest.fn().mockResolvedValue(undefined);

      dsMockUtils.createTxMock('multiSig', 'createProposal', {
        autoResolve: MockTxStatus.Succeeded,
      });

      const tx = new PolymeshTransaction(
        {
          ...txSpec,
          transaction: underlyingTx,
          args,
          resolver: 3,
          multiSig,
          preRunValidation,
        },
        context
      );

      await tx.runAsProposal();

      expect(preRunValidation).toHaveBeenCalledWith({ asProposal: true });
      expect(underlyingTx).toHaveBeenCalledWith(...args);
    });

    it('should throw an error if preRunValidation fails when running as proposal', async () => {
      const underlyingTx = dsMockUtils.createTxMock('asset', 'registerUniqueTicker');
      const args = [dsMockUtils.createMockText('VALIDATION_FAILURE_PROPOSAL_TEST')];
      const validationError = new PolymeshError({
        code: ErrorCode.InsufficientBalance,
        message: 'MultiSig has insufficient balance',
      });
      const preRunValidation = jest.fn().mockRejectedValue(validationError);

      dsMockUtils.createTxMock('multiSig', 'createProposal', {
        autoResolve: MockTxStatus.Succeeded,
      });

      const tx = new PolymeshTransaction(
        {
          ...txSpec,
          transaction: underlyingTx,
          args,
          resolver: 3,
          multiSig,
          preRunValidation,
        },
        context
      );

      await expect(tx.runAsProposal()).rejects.toThrow(validationError);
      expect(preRunValidation).toHaveBeenCalledWith({ asProposal: true });
      expect(underlyingTx).not.toHaveBeenCalled();
    });

    it('should not call preRunValidation if it is not provided when running as proposal', async () => {
      const underlyingTx = dsMockUtils.createTxMock('asset', 'registerUniqueTicker');
      const args = [dsMockUtils.createMockText('NO_VALIDATION_PROPOSAL_TEST')];

      const transaction = dsMockUtils.createTxMock('multiSig', 'createProposal', {
        autoResolve: MockTxStatus.Succeeded,
      });

      const tx = new PolymeshTransaction(
        {
          ...txSpec,
          transaction: underlyingTx,
          args,
          resolver: 3,
          multiSig,
        },
        context
      );

      const result = await tx.runAsProposal();

      expect(underlyingTx).toHaveBeenCalledWith(...args);
      expect(transaction).toHaveBeenCalled();
      expect(result).toBeInstanceOf(MultiSigProposal);
      expect(tx.status).toBe(TransactionStatus.Succeeded);
    });
  });

  describe('method: onStatusChange', () => {
    it("should execute a callback when the transaction's status changes", async () => {
      const transaction = dsMockUtils.createTxMock('asset', 'registerUniqueTicker');
      const args = tuple('I_HAVE_LOST_THE_WILL_TO_LIVE');

      const tx = new PolymeshTransaction(
        {
          ...txSpec,
          transaction,
          args,
          resolver: undefined,
        },
        context
      );

      const listenerMock = jest.fn();

      tx.onStatusChange(t => listenerMock(t.status));

      await tx.run();

      expect(listenerMock.mock.calls[0][0]).toBe(TransactionStatus.Unapproved);
      expect(listenerMock.mock.calls[1][0]).toBe(TransactionStatus.Running);
      expect(listenerMock.mock.calls[2][0]).toBe(TransactionStatus.Succeeded);
    });

    it('should emit an Idle status change without an error', () => {
      const transaction = dsMockUtils.createTxMock('asset', 'registerUniqueTicker');

      const tx = new PolymeshTransaction(
        {
          ...txSpec,
          transaction,
          args: tuple('IDLE'),
          resolver: undefined,
        },
        context
      );

      const listenerMock = jest.fn();

      tx.onStatusChange(listenerMock);

      /*
       * `Idle` is the status a transaction is constructed with, so nothing drives it through
       *   `updateStatus` on its own. It is still emitted as a non-error status, which is what
       *   this asserts
       */
      (tx as unknown as { updateStatus: (status: TransactionStatus) => void }).updateStatus(
        TransactionStatus.Idle
      );

      expect(tx.status).toBe(TransactionStatus.Idle);
      // called with the transaction alone — an error argument is reserved for the failure statuses
      expect(listenerMock).toHaveBeenCalledWith(tx);
    });

    it('should return an unsubscribe function', async () => {
      const transaction = dsMockUtils.createTxMock('asset', 'registerUniqueTicker', {
        autoResolve: false,
      });
      const args = tuple('THE_ONLY_THING_THAT_KEEPS_ME_GOING_IS_THE_HOPE_OF_FULL_COVERAGE');

      const tx = new PolymeshTransaction(
        {
          ...txSpec,
          transaction,
          args,
          resolver: undefined,
        },
        context
      );

      const listenerMock = jest.fn();

      const unsub = tx.onStatusChange(t => listenerMock(t.status));

      tx.run().catch(noop);

      await fakePromise();

      unsub();

      expect(listenerMock.mock.calls[0][0]).toBe(TransactionStatus.Unapproved);
      expect(listenerMock.mock.calls[1][0]).toBe(TransactionStatus.Running);
      expect(listenerMock).toHaveBeenCalledTimes(2);
    });
  });

  describe('method: getTotalFees', () => {
    let balanceToBigNumberSpy: jest.SpyInstance<BigNumber, [Balance]>;
    let protocolFees: BigNumber[];
    let gasFees: BigNumber[];
    let rawGasFees: Balance[];

    beforeAll(() => {
      balanceToBigNumberSpy = jest.spyOn(utilsConversionModule, 'balanceToBigNumber');
      protocolFees = [new BigNumber(250), new BigNumber(150)];
      gasFees = [new BigNumber(5), new BigNumber(10)];
      rawGasFees = gasFees.map(dsMockUtils.createMockBalance);
    });

    beforeEach(() => {
      when(context.getProtocolFees)
        .calledWith(expect.objectContaining({ tags: [TxTags.asset.RegisterUniqueTicker] }))
        .mockResolvedValue([
          {
            tag: TxTags.asset.RegisterUniqueTicker,
            fees: protocolFees[0]!,
          },
        ]);
      when(context.getProtocolFees)
        .calledWith(expect.objectContaining({ tags: [TxTags.asset.CreateAsset] }))
        .mockResolvedValue([
          {
            tag: TxTags.asset.CreateAsset,
            fees: protocolFees[1]!,
          },
        ]);
      rawGasFees.forEach((rawGasFee, index) =>
        when(balanceToBigNumberSpy)
          .calledWith(rawGasFee)
          .mockReturnValue(new BigNumber(gasFees[index]!))
      );
    });

    it('should fetch (if missing) and return transaction fees', async () => {
      const tx1 = dsMockUtils.createTxMock('asset', 'registerUniqueTicker', {
        gas: rawGasFees[0]!,
      });
      const tx2 = dsMockUtils.createTxMock('asset', 'createAsset', { gas: rawGasFees[1]! });
      dsMockUtils.createTxMock('utility', 'batchAll', { gas: rawGasFees[1]! });

      const args = tuple('OH_GOD_NO_IT_IS_BACK');

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { fee, ...rest } = txSpec;
      let tx: PolymeshTransactionBase = new PolymeshTransaction<void>(
        {
          ...rest,
          transaction: tx1,
          args,
          resolver: undefined,
        },
        context
      );

      let { fees, payingAccountData } = await tx.getTotalFees();

      expect(context.getProtocolFees).toHaveBeenCalledWith(
        expect.objectContaining({ tags: [TxTags.asset.RegisterUniqueTicker] })
      );
      expect(fees.protocol).toEqual(new BigNumber(250));
      expect(fees.gas).toEqual(new BigNumber(5));
      expect(payingAccountData.type).toBe(PayingAccountType.Caller);
      expect(payingAccountData.account.address).toBe('0xdummy');
      expect(payingAccountData.balance).toEqual(new BigNumber(100000));

      tx = new PolymeshTransaction<void>(
        {
          ...rest,
          transaction: tx1,
          args,
          feeMultiplier: new BigNumber(2),
          resolver: undefined,
        },
        context
      );

      ({ fees, payingAccountData } = await tx.getTotalFees());

      expect(fees.protocol).toEqual(new BigNumber(500));
      expect(fees.gas).toEqual(new BigNumber(5));
      expect(payingAccountData.type).toBe(PayingAccountType.Caller);
      expect(payingAccountData.account.address).toBe('0xdummy');
      expect(payingAccountData.balance).toEqual(new BigNumber(100000));

      tx = new PolymeshTransaction<void>(
        {
          ...rest,
          fee: new BigNumber(protocolFees[1]!),
          transaction: tx2,
          args,
          resolver: undefined,
        },
        context
      );

      ({ fees, payingAccountData } = await tx.getTotalFees());

      expect(fees.protocol).toEqual(new BigNumber(150));
      expect(fees.gas).toEqual(new BigNumber(10));
      expect(payingAccountData.type).toBe(PayingAccountType.Caller);
      expect(payingAccountData.account.address).toBe('0xdummy');
      expect(payingAccountData.balance).toEqual(new BigNumber(100000));

      tx = new PolymeshTransaction<void>(
        {
          ...txSpec,
          fee: new BigNumber(protocolFees[1]!),
          transaction: tx2,
          args,
          resolver: undefined,
        },
        context
      );

      ({ fees, payingAccountData } = await tx.getTotalFees());

      expect(fees.protocol).toEqual(new BigNumber(150));
      expect(fees.gas).toEqual(new BigNumber(10));
      expect(payingAccountData.type).toBe(PayingAccountType.Caller);
      expect(payingAccountData.account.address).toBe('0xdummy');
      expect(payingAccountData.balance).toEqual(new BigNumber(100000));

      tx = new PolymeshTransactionBatch<void>(
        {
          ...rest,
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
          resolver: undefined,
        },
        context
      );

      ({ fees, payingAccountData } = await tx.getTotalFees());

      expect(fees.protocol).toEqual(new BigNumber(400));
      expect(fees.gas).toEqual(new BigNumber(10));
      expect(payingAccountData.type).toBe(PayingAccountType.Caller);
      expect(payingAccountData.account.address).toBe('0xdummy');
      expect(payingAccountData.balance).toEqual(new BigNumber(100000));
    });

    it('should use MultiSig payer when asProposal is true and signing account is MultiSig signer', async () => {
      const tx1 = dsMockUtils.createTxMock('asset', 'registerUniqueTicker', {
        gas: rawGasFees[0]!,
      });
      dsMockUtils.createTxMock('multiSig', 'createProposal');

      const multiSig = entityMockUtils.getMultiSigInstance({ address: DUMMY_ACCOUNT_ID });
      const payerIdentity = entityMockUtils.getIdentityInstance({ did: 'payerDid' });
      const payerAccount = entityMockUtils.getAccountInstance({ address: 'payerAddress' });

      multiSig.getPayer = jest.fn().mockResolvedValue(payerIdentity);
      payerIdentity.getPrimaryAccount = jest.fn().mockResolvedValue({ account: payerAccount });
      payerAccount.getBalance = jest.fn().mockResolvedValue({
        free: new BigNumber(50000),
        locked: new BigNumber(0),
        total: new BigNumber(50000),
      });

      const args = tuple('TEST');
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { fee, ...rest } = txSpec;

      const tx = new PolymeshTransaction<void>(
        {
          ...rest,
          transaction: tx1,
          args,
          resolver: undefined,
          multiSig,
        },
        context
      );

      // Test with explicit true to cover that path
      const { payingAccountData } = await tx.getTotalFees(true);

      expect(payingAccountData.type).toBe(PayingAccountType.MultiSigCreator);
      expect(payingAccountData.account.address).toBe('payerAddress');
      expect(multiSig.getPayer).toHaveBeenCalled();

      // Test with default parameter (no argument) to cover default assignment in getPayingAccount
      const { payingAccountData: payingAccountDataDefault } = await tx.getTotalFees();
      expect(payingAccountDataDefault.type).toBe(PayingAccountType.MultiSigCreator);
      expect(payingAccountDataDefault.account.address).toBe('payerAddress');
    });

    it('should use signing account when asProposal is false even if MultiSig is set', async () => {
      const tx1 = dsMockUtils.createTxMock('asset', 'registerUniqueTicker', {
        gas: rawGasFees[0]!,
      });

      const multiSig = entityMockUtils.getMultiSigInstance({ address: DUMMY_ACCOUNT_ID });

      const args = tuple('TEST');
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { fee, ...rest } = txSpec;

      const tx = new PolymeshTransaction<void>(
        {
          ...rest,
          transaction: tx1,
          args,
          resolver: undefined,
          multiSig,
        },
        context
      );

      // Mock createProposal to verify it's not called when asProposal is false
      const createProposalMock = dsMockUtils.createTxMock('multiSig', 'createProposal');

      const { payingAccountData } = await tx.getTotalFees(false);

      expect(payingAccountData.type).toBe(PayingAccountType.Caller);
      expect(payingAccountData.account.address).toBe('0xdummy');
      // getPayer should not be called when asProposal is false
      if (multiSig.getPayer) {
        expect(multiSig.getPayer).not.toHaveBeenCalled();
      }
      // createProposal should not be called when asProposal is false
      expect(createProposalMock).not.toHaveBeenCalled();
    });

    it('should fall back to MultiSig account when payer primary account has no identity', async () => {
      const tx1 = dsMockUtils.createTxMock('asset', 'registerUniqueTicker', {
        gas: rawGasFees[0]!,
      });
      dsMockUtils.createTxMock('multiSig', 'createProposal');

      const multiSig = entityMockUtils.getMultiSigInstance({ address: DUMMY_ACCOUNT_ID });
      const payerIdentity = entityMockUtils.getIdentityInstance({ did: 'payerDid' });

      // Mock getPayer to return an identity
      multiSig.getPayer = jest.fn().mockResolvedValue(payerIdentity);

      // Mock getPrimaryAccount to throw an error (simulating no identity on primary account)
      payerIdentity.getPrimaryAccount = jest.fn().mockRejectedValue(
        new PolymeshError({
          code: ErrorCode.DataUnavailable,
          message: 'There is no Identity associated with this Account',
        })
      );

      const args = tuple('TEST');
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { fee, ...rest } = txSpec;

      const tx = new PolymeshTransaction<void>(
        {
          ...rest,
          transaction: tx1,
          args,
          resolver: undefined,
          multiSig,
        },
        context
      );

      const { payingAccountData } = await tx.getTotalFees(true);

      // Should fall back to using MultiSig account directly
      expect(payingAccountData.type).toBe(PayingAccountType.Caller);
      expect(payingAccountData.account.address).toBe(DUMMY_ACCOUNT_ID);
      expect(multiSig.getPayer).toHaveBeenCalled();
      expect(payerIdentity.getPrimaryAccount).toHaveBeenCalled();
    });

    it('should use MultiSig account when payer is null', async () => {
      const tx1 = dsMockUtils.createTxMock('asset', 'registerUniqueTicker', {
        gas: rawGasFees[0]!,
      });
      dsMockUtils.createTxMock('multiSig', 'createProposal');

      const multiSig = entityMockUtils.getMultiSigInstance({ address: DUMMY_ACCOUNT_ID });

      // Mock getPayer to return null (no payer set)
      multiSig.getPayer = jest.fn().mockResolvedValue(null);
      multiSig.getBalance = jest.fn().mockResolvedValue({
        free: new BigNumber(100000),
        locked: new BigNumber(0),
        total: new BigNumber(100000),
      });

      const args = tuple('TEST');
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { fee, ...rest } = txSpec;

      const tx = new PolymeshTransaction<void>(
        {
          ...rest,
          transaction: tx1,
          args,
          resolver: undefined,
          multiSig,
        },
        context
      );

      const { payingAccountData } = await tx.getTotalFees(true);

      // Should use MultiSig account directly when payer is null
      expect(payingAccountData.type).toBe(PayingAccountType.Caller);
      expect(payingAccountData.account.address).toBe(DUMMY_ACCOUNT_ID);
      expect(multiSig.getPayer).toHaveBeenCalled();
    });
  });

  describe('method: onProcessedByMiddleware', () => {
    let blockNumber: BigNumber;

    beforeEach(() => {
      blockNumber = new BigNumber(100);
      context = dsMockUtils.getContextInstance({
        latestBlock: blockNumber,
        middlewareEnabled: true,
        balance: {
          free: new BigNumber(100000),
          locked: new BigNumber(0),
          total: new BigNumber(100000),
        },
      });
    });

    it("should execute a callback when the queue's data has been processed by middleware V2", async () => {
      const transaction = dsMockUtils.createTxMock('asset', 'registerUniqueTicker');
      const args = tuple('MAKE_IT_STOP');

      const tx = new PolymeshTransaction(
        {
          ...txSpec,
          transaction,
          args,
          resolver: undefined,
        },
        dsMockUtils.getContextInstance({
          latestBlock: blockNumber,
          middlewareEnabled: true,
          balance: {
            free: new BigNumber(100000),
            locked: new BigNumber(0),
            total: new BigNumber(100000),
          },
        })
      );

      const listenerMock = jest.fn();
      tx.onProcessedByMiddleware(err => listenerMock(err));

      const mock = dsMockUtils.createApolloQueryMock(latestBlockQuery(), {
        blocks: { nodes: [{ blockId: blockNumber.minus(1).toNumber() }] },
      });

      when(mock)
        .calledWith(latestBlockQuery())
        .mockResolvedValue({
          data: {
            blocks: { nodes: [{ blockId: blockNumber.toNumber() }] },
          },
        });

      await tx.run();

      await fakePromises();

      expect(listenerMock).toHaveBeenCalledWith(undefined);
    });

    it('should execute a callback with an error if 10 seconds pass without the data being processed by middleware ', async () => {
      const transaction = dsMockUtils.createTxMock('asset', 'registerUniqueTicker');
      const args = tuple('THE_PAIN_IS_UNBEARABLE');

      const tx = new PolymeshTransaction(
        {
          ...txSpec,
          transaction,
          args,
          resolver: undefined,
        },
        dsMockUtils.getContextInstance({
          latestBlock: blockNumber,
          middlewareEnabled: true,
          balance: {
            free: new BigNumber(100000),
            locked: new BigNumber(0),
            total: new BigNumber(100000),
          },
        })
      );

      const listenerMock = jest.fn();
      tx.onProcessedByMiddleware(err => listenerMock(err));

      dsMockUtils.createApolloQueryMock(latestBlockQuery(), {
        blocks: { nodes: [{ blockId: blockNumber.minus(1).toNumber() }] },
      });

      await tx.run();

      await fakePromises();

      expect(listenerMock.mock.calls[0][0].message).toBe(
        'Middleware has not synced after 5 attempts'
      );
    });

    it('should throw an error if both middleware v1 and v2 are not enabled', async () => {
      const transaction = dsMockUtils.createTxMock('asset', 'registerUniqueTicker');
      const args = tuple('PLEASE_NO_MORE');

      const tx = new PolymeshTransaction(
        {
          ...txSpec,
          transaction,
          args,
          resolver: undefined,
        },
        dsMockUtils.getContextInstance({
          middlewareEnabled: false,
          balance: {
            free: new BigNumber(100000),
            locked: new BigNumber(0),
            total: new BigNumber(100000),
          },
        })
      );

      const listenerMock = jest.fn();

      await tx.run();
      expect(() => tx.onProcessedByMiddleware(err => listenerMock(err))).toThrow(
        'Cannot subscribe without an enabled middleware connection'
      );
    });

    it('should return an unsubscribe function', async () => {
      const transaction = dsMockUtils.createTxMock('asset', 'registerUniqueTicker');
      const args = tuple("I'M_DONE");

      const tx = new PolymeshTransaction(
        {
          ...txSpec,
          transaction,
          args,
          resolver: undefined,
        },
        context
      );

      const listenerMock = jest.fn();
      const unsub = tx.onProcessedByMiddleware(err => listenerMock(err));

      dsMockUtils.createApolloQueryMock(latestBlockQuery(), {
        blocks: { nodes: [{ blockId: blockNumber.minus(1).toNumber() }] },
      });

      await tx.run();

      await fakePromises();

      unsub();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (tx as any).emitter.emit('ProcessedByMiddleware');

      expect(listenerMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('getter: result', () => {
    it('should return a result if the transaction was successful', async () => {
      const transaction = dsMockUtils.createTxMock('asset', 'registerUniqueTicker');
      const resolver = (): number => 1;
      const transformer = (): number => 2;
      const args = tuple('FOO');
      const tx = new PolymeshTransaction(
        {
          ...txSpec,
          transaction,
          args,
          resolver,
          transformer,
        },
        context
      );

      await tx.run();

      expect(tx.result).toEqual(2);
    });

    it('should throw an error is the transaction was not successful', () => {
      const transaction = dsMockUtils.createTxMock('asset', 'registerUniqueTicker');
      const args = tuple('FOO');
      const tx = new PolymeshTransaction(
        {
          ...txSpec,
          transaction,
          args,
          resolver: undefined,
        },
        context
      );

      const expectedError = new PolymeshError({
        code: ErrorCode.General,
        message:
          'The result of the transaction was checked before it has been completed. property `result` should only be read if transaction `isSuccess` property is true',
      });

      expect(() => tx.result).toThrowError(expectedError);
    });
  });

  describe('getter: isSuccess', () => {
    it('should be true if the transaction status is TransactionStatus.Success', async () => {
      const transaction = dsMockUtils.createTxMock('asset', 'registerUniqueTicker');
      const args = tuple('FOO');
      const tx = new PolymeshTransaction(
        {
          ...txSpec,
          transaction,
          args,
          resolver: undefined,
        },
        context
      );

      await tx.run();

      expect(tx.isSuccess).toEqual(true);
    });

    it('should be false otherwise', () => {
      const transaction = dsMockUtils.createTxMock('asset', 'registerUniqueTicker');
      const args = tuple('FOO');
      const tx = new PolymeshTransaction(
        {
          ...txSpec,
          transaction,
          args,
          resolver: undefined,
        },
        context
      );

      expect(tx.isSuccess).toEqual(false);
    });
  });

  describe('toSignablePayload', () => {
    it('should return the payload', async () => {
      const mockBlockNumber = dsMockUtils.createMockU32(new BigNumber(1));

      dsMockUtils.configureMocks({
        contextOptions: {
          nonce: new BigNumber(3),
        },
      });

      dsMockUtils.createRpcMock('chain', 'getFinalizedHead', {
        returnValue: dsMockUtils.createMockSignedBlock({
          block: {
            header: {
              parentHash: 'hash',
              number: dsMockUtils.createMockCompact(mockBlockNumber),
              extrinsicsRoot: 'hash',
              stateRoot: 'hash',
            },
            extrinsics: undefined,
          },
        }),
      });

      const genesisHash = '0x12341234123412341234123412341234';
      jest.spyOn(context.polymeshApi.genesisHash, 'toString').mockReturnValue(genesisHash);

      const era = dsMockUtils.createMockExtrinsicsEra();

      const mockSignerPayload = createMockSigningPayload();

      when(context.createType)
        .calledWith('SignerPayload', expect.objectContaining({ genesisHash }))
        .mockReturnValue(mockSignerPayload);

      const transaction = dsMockUtils.createTxMock('asset', 'registerUniqueTicker');
      const args = tuple('FOO');

      let tx = new PolymeshTransaction(
        {
          ...txSpec,
          transaction,
          args,
          resolver: undefined,
          mortality: { immortal: true },
        },
        context
      );

      const result = await tx.toSignablePayload();

      expect(result).toMatchObject(
        expect.objectContaining({
          payload: 'fakePayload',
          rawPayload: 'fakeRawPayload',
          method: expect.stringContaining('0x'),
          metadata: {},
          multiSig: null,
        })
      );

      when(context.createType)
        .calledWith(
          'ExtrinsicEra',
          expect.objectContaining({ current: expect.any(Number), period: expect.any(Number) })
        )
        .mockReturnValue(era);

      dsMockUtils.createTxMock('multiSig', 'createProposal');

      tx = new PolymeshTransaction(
        {
          ...txSpec,
          transaction,
          args,
          resolver: undefined,
          mortality: { immortal: false, lifetime: new BigNumber(32) },
          multiSig: entityMockUtils.getMultiSigInstance({ address: DUMMY_ACCOUNT_ID }),
        },
        context
      );

      const { multiSig } = await tx.toSignablePayload();

      expect(multiSig).toEqual(DUMMY_ACCOUNT_ID);

      expect(context.createType).toHaveBeenCalledWith(
        'ExtrinsicEra',
        expect.objectContaining({ current: expect.any(Number), period: expect.any(Number) })
      );

      tx = new PolymeshTransaction(
        {
          ...txSpec,
          transaction,
          args,
          resolver: undefined,
          mortality: { immortal: false },
        },
        context
      );

      context.getNonce.mockReturnValue(new BigNumber(-1));
      const mockIndex = dsMockUtils.createMockIndex(new BigNumber(3));

      const mockNextIndex = dsMockUtils.createCallMock('accountNonceApi', 'accountNonce', {
        returnValue: mockIndex,
      });

      await tx.toSignablePayload();

      expect(mockNextIndex).toHaveBeenCalled();
    });

    it('should set multiSig to null when asProposal is false even if MultiSig is set', async () => {
      const mockBlockNumber = dsMockUtils.createMockU32(new BigNumber(1));

      dsMockUtils.configureMocks({
        contextOptions: {
          nonce: new BigNumber(3),
        },
      });

      dsMockUtils.createRpcMock('chain', 'getFinalizedHead', {
        returnValue: dsMockUtils.createMockSignedBlock({
          block: {
            header: {
              parentHash: 'hash',
              number: dsMockUtils.createMockCompact(mockBlockNumber),
              extrinsicsRoot: 'hash',
              stateRoot: 'hash',
            },
            extrinsics: undefined,
          },
        }),
      });

      const genesisHash = '0x12341234123412341234123412341234';
      jest.spyOn(context.polymeshApi.genesisHash, 'toString').mockReturnValue(genesisHash);

      dsMockUtils.createMockExtrinsicsEra();
      const mockSignerPayload = createMockSigningPayload();

      when(context.createType)
        .calledWith('SignerPayload', expect.objectContaining({ genesisHash }))
        .mockReturnValue(mockSignerPayload);

      const transaction = dsMockUtils.createTxMock('asset', 'registerUniqueTicker');
      const args = tuple('FOO');

      const tx = new PolymeshTransaction(
        {
          ...txSpec,
          transaction,
          args,
          resolver: undefined,
          mortality: { immortal: true },
          multiSig: entityMockUtils.getMultiSigInstance({ address: DUMMY_ACCOUNT_ID }),
        },
        context
      );

      const result = await tx.toSignablePayload({}, false);

      expect(result.multiSig).toBeNull();
    });

    it('should set multiSig address when asProposal is true and MultiSig is set', async () => {
      const mockBlockNumber = dsMockUtils.createMockU32(new BigNumber(1));

      dsMockUtils.configureMocks({
        contextOptions: {
          nonce: new BigNumber(3),
        },
      });

      dsMockUtils.createRpcMock('chain', 'getFinalizedHead', {
        returnValue: dsMockUtils.createMockSignedBlock({
          block: {
            header: {
              parentHash: 'hash',
              number: dsMockUtils.createMockCompact(mockBlockNumber),
              extrinsicsRoot: 'hash',
              stateRoot: 'hash',
            },
            extrinsics: undefined,
          },
        }),
      });

      const genesisHash = '0x12341234123412341234123412341234';
      jest.spyOn(context.polymeshApi.genesisHash, 'toString').mockReturnValue(genesisHash);

      dsMockUtils.createMockExtrinsicsEra();
      const mockSignerPayload = createMockSigningPayload();

      when(context.createType)
        .calledWith('SignerPayload', expect.objectContaining({ genesisHash }))
        .mockReturnValue(mockSignerPayload);

      dsMockUtils.createTxMock('multiSig', 'createProposal');

      const transaction = dsMockUtils.createTxMock('asset', 'registerUniqueTicker');
      const args = tuple('FOO');

      const tx = new PolymeshTransaction(
        {
          ...txSpec,
          transaction,
          args,
          resolver: undefined,
          mortality: { immortal: true },
          multiSig: entityMockUtils.getMultiSigInstance({ address: DUMMY_ACCOUNT_ID }),
        },
        context
      );

      const result = await tx.toSignablePayload({}, true);

      expect(result.multiSig).toEqual(DUMMY_ACCOUNT_ID);
    });
  });

  describe('Ethereum signing path', () => {
    /**
     * SS58 (format 42) encoding of `<ALITH_H160> ++ [0xEE; 12]` — the Account the `revive` pallet
     *   dispatches as for Alith's Ethereum key
     */
    const ethSs58Address = '5HYRCKHYJN9z5xUtfFkyMj4JUhsAwWyvuU8vKB1FcnYTf9ZQ';
    const sentinelAddress = '0x6d6f646c70792f70616464720000000000000000';

    /**
     * `signTransaction` / `sendTransaction` control whether the signer *implements* that method,
     *   since that is what the SDK derives its submission mode from
     */
    const buildEthSigner = ({
      signTransaction = true,
      sendTransaction = false,
      eip1559,
    }: {
      signTransaction?: boolean;
      sendTransaction?: boolean;
      eip1559?: boolean;
    } = {}): {
      capabilities: { eip1559?: boolean };
      signTransaction?: jest.Mock;
      sendTransaction?: jest.Mock;
    } => ({
      capabilities: eip1559 === undefined ? {} : { eip1559 },
      ...(signTransaction ? { signTransaction: jest.fn().mockResolvedValue('0xrawsigned') } : {}),
      ...(sendTransaction ? { sendTransaction: jest.fn().mockResolvedValue('0xethtxhash') } : {}),
    });

    /**
     * The signer's `sendTransaction` mock, for tests that built a broadcasting signer. Throws
     *   rather than asserting non-null, so a helper misuse fails as itself instead of as an
     *   inscrutable "cannot read property of undefined"
     */
    const sendMockOf = (signer: ReturnType<typeof buildEthSigner>): jest.Mock => {
      const { sendTransaction } = signer;

      if (!sendTransaction) {
        throw new Error('expected the signer to implement sendTransaction');
      }

      return sendTransaction;
    };

    const mockReviveApi = (): void => {
      dsMockUtils.createCallMock('reviveApi', 'gasPrice', {
        returnValue: { toString: () => '100000000000000' },
      });
      dsMockUtils.createCallMock('reviveApi', 'nonce', {
        returnValue: { toString: () => '0' },
      });
      dsMockUtils.createCallMock('reviveApi', 'ethTransactWithConfig', {
        returnValue: { isErr: false, asOk: { ethGas: { toString: () => '1842' } } },
      });
      dsMockUtils.setConstMock('revive', 'nativeToEthRatio', {
        returnValue: dsMockUtils.createMockU64(new BigNumber(1000000000000)),
      });
    };

    const ethTxSpec = { ...txSpec, signingAddress: ethSs58Address };

    beforeEach(() => {
      context = dsMockUtils.getContextInstance({
        // the gas-derived fee on this path is ~184,200 base units, so fund well past it
        balance: {
          free: new BigNumber(10000000),
          locked: new BigNumber(0),
          total: new BigNumber(10000000),
        },
        getEthSigner: buildEthSigner() as never,
        getEthRuntimePalletsAddress: sentinelAddress,
        getEthChainId: new BigNumber(1641818),
      });
      context.ss58Format = new BigNumber(42);
      mockReviveApi();

      dsMockUtils.createRpcMock('chain', 'getBlock').mockResolvedValue(
        dsMockUtils.createMockSignedBlock({
          block: {
            header: {
              number: dsMockUtils.createMockCompact(dsMockUtils.createMockU32(new BigNumber(1))),
              parentHash: 'hash',
              stateRoot: 'hash',
              extrinsicsRoot: 'hash',
            },
            extrinsics: undefined,
          },
        })
      );
    });

    describe('routing', () => {
      it('should throw if no Ethereum signer is attached to the SDK instance', async () => {
        context.getEthSigner.mockReturnValue(undefined);

        const transaction = dsMockUtils.createTxMock('asset', 'registerUniqueTicker');
        const tx = new PolymeshTransaction(
          { ...ethTxSpec, transaction, args: tuple('FOO'), resolver: undefined },
          context
        );

        await expect(tx.run()).rejects.toThrow(
          'There is no Ethereum signer associated with the SDK instance'
        );
      });

      it('should fall back to polling when the connection has no subscription support', async () => {
        context.supportsSubscription.mockReturnValue(false);
        dsMockUtils.createTxMock('revive', 'ethTransact', { autoResolve: false });

        const fakeReceipt = new SubmittableResult({
          blockNumber: dsMockUtils.createMockU32(new BigNumber(101)),
          status: dsMockUtils.createMockExtrinsicStatus({
            Finalized: dsMockUtils.createMockHash('blockHash'),
          }),
          txHash: dsMockUtils.createMockHash('txHash'),
          txIndex: 1,
        });

        // these exercise wallet-broadcast mechanics, not the scan strategy
        context.supportsSubscription.mockReturnValue(false);
        jest.spyOn(baseUtils, 'pollForTransactionFinalization').mockResolvedValue(fakeReceipt);

        const transaction = dsMockUtils.createTxMock('asset', 'registerUniqueTicker');
        const tx = new PolymeshTransaction(
          { ...ethTxSpec, transaction, args: tuple('FOO'), resolver: undefined },
          context
        );

        await tx.run();

        expect(tx.status).toBe(TransactionStatus.Succeeded);
      });

      it('should attribute fees to the caller even when a third party is set to pay them', async () => {
        const transaction = dsMockUtils.createTxMock('asset', 'registerUniqueTicker');
        const tx = new PolymeshTransaction(
          {
            ...ethTxSpec,
            paidForBy: entityMockUtils.getIdentityInstance(),
            transaction,
            args: tuple('FOO'),
            resolver: undefined,
          },
          context
        );

        const { payingAccountData } = await tx.getTotalFees();

        expect(payingAccountData.type).toBe(PayingAccountType.Caller);
      });

      it('should throw a NotSupported error when acting as a MultiSig signer', async () => {
        const transaction = dsMockUtils.createTxMock('asset', 'registerUniqueTicker');
        const tx = new PolymeshTransaction(
          {
            ...ethTxSpec,
            multiSig: entityMockUtils.getMultiSigInstance(),
            transaction,
            args: tuple('FOO'),
            resolver: undefined,
          },
          context
        );

        await expect(tx.runAsProposal()).rejects.toThrow(
          expect.objectContaining({ code: ErrorCode.NotSupported })
        );
      });

      it('should throw a ValidationError if mortality was explicitly set', async () => {
        const transaction = dsMockUtils.createTxMock('asset', 'registerUniqueTicker');
        const tx = new PolymeshTransaction(
          {
            ...ethTxSpec,
            mortality: { immortal: true },
            transaction,
            args: tuple('FOO'),
            resolver: undefined,
          },
          context
        );

        await expect(tx.run()).rejects.toThrow(
          'Mortality cannot be set for a transaction signed by an Ethereum key'
        );
      });
    });

    describe('when the SDK broadcasts', () => {
      it('should sign, submit as a bare revive.ethTransact and track it like a native transaction', async () => {
        const ethSigner = buildEthSigner();
        context.getEthSigner.mockReturnValue(ethSigner);

        const ethTransact = dsMockUtils.createTxMock('revive', 'ethTransact', {
          autoResolve: false,
        });
        const transaction = dsMockUtils.createTxMock('asset', 'registerUniqueTicker');

        const tx = new PolymeshTransaction(
          { ...ethTxSpec, transaction, args: tuple('FOO'), resolver: undefined },
          context
        );

        const runPromise = tx.run().catch(noop);

        await fakePromises();

        dsMockUtils.updateTxStatus(ethTransact, MockTxStatus.InBlock);
        await fakePromise();
        dsMockUtils.updateTxStatus(ethTransact, MockTxStatus.Succeeded);
        await fakePromise();
        await runPromise;

        expect(ethSigner.signTransaction).toHaveBeenCalledWith(
          expect.objectContaining({
            to: sentinelAddress,
            value: '0x0',
            chainId: '0x190d5a',
            nonce: '0x0',
            type: '0x2',
          })
        );
        expect(ethTransact).toHaveBeenCalledWith('0xrawsigned');
        expect(tx.status).toBe(TransactionStatus.Succeeded);
        // the SDK submitted this itself, so there is no separate Ethereum hash to expose
        expect(tx.ethTxHash).toBeUndefined();
      });

      it('should sign with the nonce set through `ProcedureOpts` rather than the on-chain one', async () => {
        const ethSigner = buildEthSigner();
        context.getEthSigner.mockReturnValue(ethSigner);
        context.getNonce.mockReturnValue(new BigNumber(9));

        const ethTransact = dsMockUtils.createTxMock('revive', 'ethTransact', {
          autoResolve: false,
        });
        const transaction = dsMockUtils.createTxMock('asset', 'registerUniqueTicker');

        const tx = new PolymeshTransaction(
          { ...ethTxSpec, transaction, args: tuple('FOO'), resolver: undefined },
          context
        );

        const runPromise = tx.run().catch(noop);

        await fakePromises();

        dsMockUtils.updateTxStatus(ethTransact, MockTxStatus.InBlock);
        await fakePromise();
        dsMockUtils.updateTxStatus(ethTransact, MockTxStatus.Succeeded);
        await fakePromise();
        await runPromise;

        // the caller's nonce is used verbatim, rather than the `0x0` the chain reports
        expect(ethSigner.signTransaction).toHaveBeenCalledWith(
          expect.objectContaining({ nonce: '0x9' })
        );
      });
    });

    describe('when the wallet broadcasts', () => {
      it('should broadcast through the wallet and expose the Ethereum transaction hash', async () => {
        const ethSigner = buildEthSigner({ signTransaction: false, sendTransaction: true });
        context.getEthSigner.mockReturnValue(ethSigner);
        dsMockUtils.createTxMock('revive', 'ethTransact', { autoResolve: false });

        const fakeReceipt = new SubmittableResult({
          blockNumber: dsMockUtils.createMockU32(new BigNumber(101)),
          status: dsMockUtils.createMockExtrinsicStatus({
            Finalized: dsMockUtils.createMockHash('blockHash'),
          }),
          txHash: dsMockUtils.createMockHash('txHash'),
          txIndex: 1,
        });

        // these exercise wallet-broadcast mechanics, not the scan strategy
        context.supportsSubscription.mockReturnValue(false);
        jest.spyOn(baseUtils, 'pollForTransactionFinalization').mockResolvedValue(fakeReceipt);

        const transaction = dsMockUtils.createTxMock('asset', 'registerUniqueTicker');
        const tx = new PolymeshTransaction(
          { ...ethTxSpec, transaction, args: tuple('FOO'), resolver: undefined },
          context
        );

        await tx.run();

        expect(ethSigner.sendTransaction).toHaveBeenCalled();
        // the wallet owns the nonce in this mode
        expect(sendMockOf(ethSigner).mock.calls[0][0].nonce).toBeUndefined();
        expect(tx.ethTxHash).toBe('0xethtxhash');
        expect(tx.txHash).toBe('0xethtxhash');
        expect(tx.status).toBe(TransactionStatus.Succeeded);
      });

      it('should surface a reverted inner dispatch as an error rather than a success', async () => {
        /*
         * the outer `revive.ethTransact` extrinsic emits `ExtrinsicSuccess` even when the inner
         *   call failed, so without the `EthExtrinsicRevert` check this would resolve successfully
         */
        const ethSigner = buildEthSigner({ signTransaction: false, sendTransaction: true });
        context.getEthSigner.mockReturnValue(ethSigner);
        dsMockUtils.createTxMock('revive', 'ethTransact', { autoResolve: false });

        const fakeReceipt = new SubmittableResult({
          blockNumber: dsMockUtils.createMockU32(new BigNumber(101)),
          status: dsMockUtils.createMockExtrinsicStatus({
            Finalized: dsMockUtils.createMockHash('blockHash'),
          }),
          txHash: dsMockUtils.createMockHash('txHash'),
          txIndex: 1,
        });

        const revertError = new PolymeshError({
          code: ErrorCode.TransactionReverted,
          message:
            'identity.AlreadyLinked: One secondary or primary key can only belong to one DID',
        });

        // these exercise wallet-broadcast mechanics, not the scan strategy
        context.supportsSubscription.mockReturnValue(false);
        jest.spyOn(baseUtils, 'pollForTransactionFinalization').mockResolvedValue(fakeReceipt);
        jest.spyOn(baseUtils, 'getExtrinsicFailure').mockReturnValue(revertError);

        const resolver = jest.fn();
        const transaction = dsMockUtils.createTxMock('asset', 'registerUniqueTicker');
        const tx = new PolymeshTransaction(
          { ...ethTxSpec, transaction, args: tuple('FOO'), resolver },
          context
        );

        await expect(tx.run()).rejects.toThrowError(revertError);

        expect(tx.status).toBe(TransactionStatus.Failed);
        // the resolver must not run for a transaction that actually failed
        expect(resolver).not.toHaveBeenCalled();
      });
    });

    describe('submission timeouts', () => {
      /**
       * A wallet-broadcast transaction with a never-answered confirmation prompt — the case a
       *   broadcast timeout exists for
       */
      const buildStalledBroadcast = (
        submission: { broadcastTimeout?: number; watchTimeout?: number } = {}
      ): PolymeshTransaction<undefined, void, [string]> => {
        const ethSigner = buildEthSigner({ signTransaction: false, sendTransaction: true });
        sendMockOf(ethSigner).mockReturnValue(new Promise(noop));
        context.getEthSigner.mockReturnValue(ethSigner);
        context.supportsSubscription.mockReturnValue(false);
        dsMockUtils.createTxMock('revive', 'ethTransact', { autoResolve: false });

        const transaction = dsMockUtils.createTxMock('asset', 'registerUniqueTicker');

        return new PolymeshTransaction(
          { ...ethTxSpec, submission, transaction, args: tuple('FOO'), resolver: undefined },
          context
        );
      };

      it('should throw a TransactionTimeout if the wallet does not broadcast in time', async () => {
        const tx = buildStalledBroadcast({ broadcastTimeout: 5000 });

        const runPromise = tx.run();

        await fakePromise();
        jest.advanceTimersByTime(5000);

        await expect(runPromise).rejects.toThrow(
          expect.objectContaining({ code: ErrorCode.TransactionTimeout })
        );
      });

      it('should wait indefinitely for the broadcast when no timeout is set', async () => {
        const tx = buildStalledBroadcast();
        let settled = false;

        const runPromise = tx.run().catch(noop);
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        runPromise.then(() => {
          settled = true;
        });

        await fakePromise();
        jest.advanceTimersByTime(600000);
        await fakePromise();

        expect(settled).toBe(false);
      });

      it('should throw a TransactionTimeout if the transaction is not found in time', async () => {
        const ethSigner = buildEthSigner({ signTransaction: false, sendTransaction: true });
        context.getEthSigner.mockReturnValue(ethSigner);
        context.supportsSubscription.mockReturnValue(false);
        dsMockUtils.createTxMock('revive', 'ethTransact', { autoResolve: false });

        // the transaction is broadcast, but never turns up in a block
        jest
          .spyOn(baseUtils, 'pollForTransactionFinalization')
          .mockReturnValue(new Promise(noop) as never);

        const transaction = dsMockUtils.createTxMock('asset', 'registerUniqueTicker');
        const tx = new PolymeshTransaction(
          {
            ...ethTxSpec,
            submission: { watchTimeout: 5000 },
            transaction,
            args: tuple('FOO'),
            resolver: undefined,
          },
          context
        );

        const runPromise = tx.run();

        await fakePromise();
        jest.advanceTimersByTime(5000);

        await expect(runPromise).rejects.toThrow(
          expect.objectContaining({ code: ErrorCode.TransactionTimeout })
        );

        /*
         * the transaction was broadcast and may still be included — reporting `Failed` would
         *   assert something untrue, so the last observed status has to stand
         */
        expect(tx.status).toBe(TransactionStatus.Running);
        expect(tx.ethTxHash).toBe('0xethtxhash');
      });
    });

    describe('method: broadcast', () => {
      const buildWalletBroadcastTx = <T>(
        resolver: T,
        preRunValidation?: jest.Mock
      ): {
        tx: PolymeshTransaction<T, T, [string]>;
        ethSigner: ReturnType<typeof buildEthSigner>;
      } => {
        const ethSigner = buildEthSigner({ signTransaction: false, sendTransaction: true });
        context.getEthSigner.mockReturnValue(ethSigner);
        context.supportsSubscription.mockReturnValue(false);
        dsMockUtils.createTxMock('revive', 'ethTransact', { autoResolve: false });

        const transaction = dsMockUtils.createTxMock('asset', 'registerUniqueTicker');
        const tx = new PolymeshTransaction(
          { ...ethTxSpec, transaction, args: tuple('FOO'), resolver, preRunValidation },
          context
        );

        return { tx, ethSigner };
      };

      const fakeReceipt = (): SubmittableResult =>
        new SubmittableResult({
          blockNumber: dsMockUtils.createMockU32(new BigNumber(101)),
          status: dsMockUtils.createMockExtrinsicStatus({
            Finalized: dsMockUtils.createMockHash('blockHash'),
          }),
          txHash: dsMockUtils.createMockHash('txHash'),
          txIndex: 1,
        });

      it('should return the hashes without waiting for the transaction to be included', async () => {
        const { tx, ethSigner } = buildWalletBroadcastTx(undefined);

        const pollSpy = jest
          .spyOn(baseUtils, 'pollForTransactionFinalization')
          .mockReturnValue(new Promise(noop) as never);

        const handle = await tx.broadcast();

        expect(ethSigner.sendTransaction).toHaveBeenCalled();
        expect(handle.txHash).toBe('0xethtxhash');
        expect(handle.ethTxHash).toBe('0xethtxhash');
        expect(handle.startingBlock).toEqual(new BigNumber(100));
        expect(tx.status).toBe(TransactionStatus.Running);
        // the whole point: no block scan was started
        expect(pollSpy).not.toHaveBeenCalled();
      });

      it('should return from watch the same value run would have', async () => {
        const { tx } = buildWalletBroadcastTx('resolved value');

        jest
          .spyOn(baseUtils, 'pollForTransactionFinalization')
          .mockResolvedValue(fakeReceipt() as never);

        const handle = await tx.broadcast();

        await expect(handle.watch()).resolves.toBe('resolved value');

        expect(tx.status).toBe(TransactionStatus.Succeeded);
        expect(tx.result).toBe('resolved value');
        expect(tx.blockHash).toBe('blockHash');
        expect(tx.txIndex).toEqual(new BigNumber(1));
      });

      it('should allow watch to be retried after it times out', async () => {
        const { tx } = buildWalletBroadcastTx('resolved value');

        const pollSpy = jest
          .spyOn(baseUtils, 'pollForTransactionFinalization')
          .mockReturnValue(new Promise(noop) as never);

        const handle = await tx.broadcast();

        const timingOut = handle.watch({ timeout: 5000 });

        await fakePromise();
        jest.advanceTimersByTime(5000);

        await expect(timingOut).rejects.toThrow(
          expect.objectContaining({ code: ErrorCode.TransactionTimeout })
        );

        // nothing is resubmitted on a retry — the scan simply starts again
        pollSpy.mockResolvedValue(fakeReceipt() as never);

        await expect(handle.watch()).resolves.toBe('resolved value');
        expect(tx.status).toBe(TransactionStatus.Succeeded);
      });

      it('should throw if watch is called while a previous call is still in flight', async () => {
        const { tx } = buildWalletBroadcastTx(undefined);

        jest
          .spyOn(baseUtils, 'pollForTransactionFinalization')
          .mockReturnValue(new Promise(noop) as never);

        const handle = await tx.broadcast();

        // still scanning, since the mocked poll never settles
        const inFlight = handle.watch();
        inFlight.catch(noop);

        await expect(handle.watch()).rejects.toThrow('already being watched');
      });

      it('should throw if the transaction has already been broadcast', async () => {
        const { tx } = buildWalletBroadcastTx(undefined);

        jest
          .spyOn(baseUtils, 'pollForTransactionFinalization')
          .mockReturnValue(new Promise(noop) as never);

        await tx.broadcast();

        await expect(tx.broadcast()).rejects.toThrow('Cannot re-run a Transaction');
        await expect(tx.run()).rejects.toThrow('Cannot re-run a Transaction');
      });

      it('should run preRunValidation before anything is submitted', async () => {
        const preRunValidation = jest.fn().mockResolvedValue(undefined);
        const { tx, ethSigner } = buildWalletBroadcastTx(undefined, preRunValidation);

        jest
          .spyOn(baseUtils, 'pollForTransactionFinalization')
          .mockReturnValue(new Promise(noop) as never);

        await tx.broadcast();

        expect(preRunValidation).toHaveBeenCalledWith({ asProposal: false });
        expect(ethSigner.sendTransaction).toHaveBeenCalled();
      });

      it('should mark the transaction as failed if the broadcast itself fails', async () => {
        const validationError = new PolymeshError({
          code: ErrorCode.InsufficientBalance,
          message: 'Insufficient balance',
        });
        const preRunValidation = jest.fn().mockRejectedValue(validationError);
        const { tx, ethSigner } = buildWalletBroadcastTx(undefined, preRunValidation);

        await expect(tx.broadcast()).rejects.toThrow(validationError);

        expect(tx.status).toBe(TransactionStatus.Failed);
        expect(ethSigner.sendTransaction).not.toHaveBeenCalled();
      });

      it('should report inclusion as soon as the transaction lands in a block', async () => {
        const { tx } = buildWalletBroadcastTx(undefined);

        jest
          .spyOn(baseUtils, 'pollForTransactionFinalization')
          .mockImplementation((_matcher, _startingBlock, _context, _pollOptions, onInBlock) => {
            onInBlock?.({
              blockHash: 'inBlockHash',
              blockNumber: new BigNumber(100),
              txIndex: 3,
            });

            // the finalized result never arrives, leaving the transaction at its InBlock state
            return new Promise(noop);
          });

        const handle = await tx.broadcast();

        handle.watch().catch(noop);
        await fakePromise();

        expect(tx.status).toBe(TransactionStatus.InBlock);
        expect(tx.blockHash).toBe('inBlockHash');
        expect(tx.blockNumber).toEqual(new BigNumber(100));
        expect(tx.txIndex).toEqual(new BigNumber(3));
      });

      it('should subscribe for the block scan where the connection supports it', async () => {
        const { tx } = buildWalletBroadcastTx('resolved value');
        context.supportsSubscription.mockReturnValue(true);

        const subscribeSpy = jest
          .spyOn(baseUtils, 'subscribeForTransactionFinalization')
          .mockResolvedValue(fakeReceipt() as never);
        const pollSpy = jest.spyOn(baseUtils, 'pollForTransactionFinalization');

        const handle = await tx.broadcast();

        await expect(handle.watch()).resolves.toBe('resolved value');

        expect(subscribeSpy).toHaveBeenCalled();
        expect(pollSpy).not.toHaveBeenCalled();
      });

      it('should return the result already watched to completion rather than scanning again', async () => {
        const { tx } = buildWalletBroadcastTx('resolved value');

        const pollSpy = jest
          .spyOn(baseUtils, 'pollForTransactionFinalization')
          .mockResolvedValue(fakeReceipt() as never);

        const handle = await tx.broadcast();

        await expect(handle.watch()).resolves.toBe('resolved value');
        await expect(handle.watch()).resolves.toBe('resolved value');

        expect(pollSpy).toHaveBeenCalledTimes(1);
      });

      it('should throw a NotSupported error for a MultiSig signer', async () => {
        const transaction = dsMockUtils.createTxMock('asset', 'registerUniqueTicker');
        const tx = new PolymeshTransaction(
          {
            ...txSpec,
            multiSig: entityMockUtils.getMultiSigInstance(),
            transaction,
            args: tuple('FOO'),
            resolver: undefined,
          },
          context
        );

        await expect(tx.broadcast()).rejects.toThrow(
          expect.objectContaining({ code: ErrorCode.NotSupported })
        );
      });
    });

    describe('method: getTotalFees', () => {
      it('should derive the gas fee from the dry run rather than payment_queryInfo', async () => {
        const transaction = dsMockUtils.createTxMock('asset', 'registerUniqueTicker');
        const tx = new PolymeshTransaction(
          { ...ethTxSpec, transaction, args: tuple('FOO'), resolver: undefined },
          context
        );

        const { fees } = await tx.getTotalFees();

        // 1842 gas * 10^14 wei / 10^12 ratio = 184,200 base units = 0.1842 POLYX
        expect(fees.gas).toEqual(new BigNumber(0.1842));
      });

      it('should report the gas fee in the same units as the native path', async () => {
        /*
         * the unit contract between the two branches: the Ethereum branch derives a base-unit
         *   figure from the dry run while the native branch goes through `balanceToBigNumber`.
         *   Both must end up as display POLYX, since `getTotalFees` sums the result with protocol
         *   fees and `assertFeesCovered` compares it against an Account balance, both of which are
         *   display values
         */
        const transaction = dsMockUtils.createTxMock('asset', 'registerUniqueTicker', {
          // price the same call natively: 1842 gas * 10^14 / 10^12 = 184,200 base units
          gas: dsMockUtils.createMockBalance(new BigNumber(184200)),
        });

        const ethTx = new PolymeshTransaction(
          { ...ethTxSpec, transaction, args: tuple('FOO'), resolver: undefined },
          context
        );
        const { fees: ethFees } = await ethTx.getTotalFees();

        const nativeContext = dsMockUtils.getContextInstance({
          balance: {
            free: new BigNumber(10000000),
            locked: new BigNumber(0),
            total: new BigNumber(10000000),
          },
        });
        nativeContext.ss58Format = new BigNumber(42);

        const nativeTx = new PolymeshTransaction(
          { ...txSpec, transaction, args: tuple('FOO'), resolver: undefined },
          nativeContext
        );
        const { fees: nativeFees } = await nativeTx.getTotalFees();

        expect(ethFees.gas).toEqual(nativeFees.gas);
      });
    });

    describe('method: toSignablePayload', () => {
      it('should throw NotSupported, since an Ethereum key cannot sign a SCALE payload', async () => {
        const transaction = dsMockUtils.createTxMock('asset', 'registerUniqueTicker');
        const tx = new PolymeshTransaction(
          { ...ethTxSpec, transaction, args: tuple('FOO'), resolver: undefined },
          context
        );

        await expect(tx.toSignablePayload()).rejects.toThrow(
          'A SCALE `SignerPayload` cannot be produced for a transaction signed by an Ethereum key'
        );
      });
    });

    describe('method: toEthSignablePayload', () => {
      it('should build a detached payload carrying the request and the decoded call', async () => {
        const tag = TxTags.asset.RegisterUniqueTicker;
        jest.spyOn(utilsConversionModule, 'transactionHexToTxTag').mockReturnValue(tag);
        context.getTransactionArguments.mockReturnValue([]);

        const transaction = dsMockUtils.createTxMock('asset', 'registerUniqueTicker');
        const tx = new PolymeshTransaction(
          { ...ethTxSpec, transaction, args: tuple('FOO'), resolver: undefined },
          context
        );

        const result = await tx.toEthSignablePayload();

        expect(result.transaction).toEqual(
          expect.objectContaining({
            to: sentinelAddress,
            value: '0x0',
            // a detached signer cannot own the nonce, so it is always resolved
            nonce: '0x0',
          })
        );
        expect(result.tag).toBe(tag);
      });

      it('should build the payload with no Ethereum signer attached, since detached signing is the point', async () => {
        context.getEthSigner.mockReturnValue(undefined);
        jest
          .spyOn(utilsConversionModule, 'transactionHexToTxTag')
          .mockReturnValue(TxTags.asset.RegisterUniqueTicker);
        context.getTransactionArguments.mockReturnValue([]);

        const transaction = dsMockUtils.createTxMock('asset', 'registerUniqueTicker');
        const tx = new PolymeshTransaction(
          { ...ethTxSpec, transaction, args: tuple('FOO'), resolver: undefined },
          context
        );

        const result = await tx.toEthSignablePayload();

        expect(result.transaction).toEqual(
          expect.objectContaining({ to: sentinelAddress, type: '0x2' })
        );
      });

      it('should default to an EIP-1559 transaction', async () => {
        jest
          .spyOn(utilsConversionModule, 'transactionHexToTxTag')
          .mockReturnValue(TxTags.asset.RegisterUniqueTicker);
        context.getTransactionArguments.mockReturnValue([]);

        const transaction = dsMockUtils.createTxMock('asset', 'registerUniqueTicker');
        const tx = new PolymeshTransaction(
          { ...ethTxSpec, transaction, args: tuple('FOO'), resolver: undefined },
          context
        );

        const { transaction: request } = await tx.toEthSignablePayload();

        expect(request.type).toBe('0x2');
        expect(request.maxFeePerGas).toBeDefined();
        expect(request.gasPrice).toBeUndefined();
      });

      it('should build a legacy transaction when the caller asks for one', async () => {
        jest
          .spyOn(utilsConversionModule, 'transactionHexToTxTag')
          .mockReturnValue(TxTags.asset.RegisterUniqueTicker);
        context.getTransactionArguments.mockReturnValue([]);

        const transaction = dsMockUtils.createTxMock('asset', 'registerUniqueTicker');
        const tx = new PolymeshTransaction(
          { ...ethTxSpec, transaction, args: tuple('FOO'), resolver: undefined },
          context
        );

        const { transaction: request } = await tx.toEthSignablePayload({}, { eip1559: false });

        expect(request.type).toBe('0x0');
        expect(request.gasPrice).toBeDefined();
        expect(request.maxFeePerGas).toBeUndefined();
      });

      it('should carry the nonce set through `ProcedureOpts` rather than the on-chain one', async () => {
        jest
          .spyOn(utilsConversionModule, 'transactionHexToTxTag')
          .mockReturnValue(TxTags.asset.RegisterUniqueTicker);
        context.getTransactionArguments.mockReturnValue([]);
        context.getNonce.mockReturnValue(new BigNumber(7));

        const transaction = dsMockUtils.createTxMock('asset', 'registerUniqueTicker');
        const tx = new PolymeshTransaction(
          { ...ethTxSpec, transaction, args: tuple('FOO'), resolver: undefined },
          context
        );

        const { transaction: request } = await tx.toEthSignablePayload();

        expect(request.nonce).toBe('0x7');
      });

      it('should throw a ValidationError for a native signing Account', async () => {
        const nativeContext = dsMockUtils.getContextInstance();
        nativeContext.ss58Format = new BigNumber(42);

        const transaction = dsMockUtils.createTxMock('asset', 'registerUniqueTicker');
        const tx = new PolymeshTransaction(
          { ...txSpec, transaction, args: tuple('FOO'), resolver: undefined },
          nativeContext
        );

        await expect(tx.toEthSignablePayload()).rejects.toThrow(
          '`toEthSignablePayload` can only be used for a transaction signed by an Ethereum-derived Account'
        );
      });
    });
  });
});
