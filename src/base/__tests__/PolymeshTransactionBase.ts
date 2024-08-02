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
import { DUMMY_ACCOUNT_ID } from '~/utils/constants';
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
        resolver,
        transformer,
        paidForBy,
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

      expect(tx.status).toBe(TransactionStatus.Idle);

      tx.run().catch(noop);

      await fakePromise(2);

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

    it('should throw an error if trying to run a transaction that cannot be subsidized with a subsidized Account', async () => {
      const transaction = dsMockUtils.createTxMock('staking', 'bond', {
        autoResolve: MockTxStatus.Succeeded,
      });
      const args = tuple('JUST_KIDDING');

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
          transaction,
          args,
          resolver: undefined,
        },
        context
      );

      await expect(tx.run()).rejects.toThrow(
        'This transaction cannot be run by a subsidized Account'
      );
      expect(tx.status).toBe(TransactionStatus.Failed);
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

    it('should throw error if the signing address is not available in the Context', async () => {
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
        expect.objectContaining({ era: 0 }),
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
        expect.objectContaining({ era: undefined, nonce: -1, signer: 'signer' })
      );

      expect(tx.blockHash).toEqual('blockHash');
      expect(tx.blockNumber).toEqual(new BigNumber(101));
      expect(tx.txHash).toEqual('bond');
      expect(tx.txIndex).toEqual(new BigNumber(1));
      expect(tx.status).toBe(TransactionStatus.Succeeded);
      expect(tx.receipt).toBeDefined();

      expect(result).toBe('pollingResult');
    });

    it('should throw an error when polling if there is an extrinsic failure', async () => {
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

    it('should throw an error when polling if there is an error submitting the transaction', async () => {
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

    it('should throw an error if called with a multiSig signer', async () => {
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
        .calledWith({ tags: [TxTags.asset.RegisterUniqueTicker] })
        .mockResolvedValue([
          {
            tag: TxTags.asset.RegisterUniqueTicker,
            fees: protocolFees[0],
          },
        ]);
      when(context.getProtocolFees)
        .calledWith({ tags: [TxTags.asset.CreateAsset] })
        .mockResolvedValue([
          {
            tag: TxTags.asset.CreateAsset,
            fees: protocolFees[1],
          },
        ]);
      rawGasFees.forEach((rawGasFee, index) =>
        when(balanceToBigNumberSpy)
          .calledWith(rawGasFee)
          .mockReturnValue(new BigNumber(gasFees[index]))
      );
    });

    it('should fetch (if missing) and return transaction fees', async () => {
      const tx1 = dsMockUtils.createTxMock('asset', 'registerUniqueTicker', { gas: rawGasFees[0] });
      const tx2 = dsMockUtils.createTxMock('asset', 'createAsset', { gas: rawGasFees[1] });
      dsMockUtils.createTxMock('utility', 'batchAll', { gas: rawGasFees[1] });

      const args = tuple('OH_GOD_NO_IT_IS_BACK');

      let tx: PolymeshTransactionBase = new PolymeshTransaction<void>(
        {
          ...txSpec,
          transaction: tx1,
          args,
          fee: undefined,
          resolver: undefined,
        },
        context
      );

      let { fees, payingAccountData } = await tx.getTotalFees();

      expect(fees.protocol).toEqual(new BigNumber(250));
      expect(fees.gas).toEqual(new BigNumber(5));
      expect(payingAccountData.type).toBe(PayingAccountType.Caller);
      expect(payingAccountData.account.address).toBe('0xdummy');
      expect(payingAccountData.balance).toEqual(new BigNumber(100000));

      tx = new PolymeshTransaction<void>(
        {
          ...txSpec,
          transaction: tx1,
          args,
          fee: undefined,
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
          ...txSpec,
          fee: new BigNumber(protocolFees[1]),
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
          fee: new BigNumber(protocolFees[1]),
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
          ...txSpec,
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

      const genesisHash = '0x1234';
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
  });
});
