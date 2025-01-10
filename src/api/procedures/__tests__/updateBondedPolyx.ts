import { Balance } from '@polkadot/types/interfaces';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import {
  getAuthorization,
  Params,
  prepareStorage,
  prepareUnbondPolyx,
  Storage,
} from '~/api/procedures/updateBondedPolyx';
import { Account, Context, PolymeshError } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { ErrorCode, TxTags } from '~/types';
import { PolymeshTx } from '~/types/internal';
import { DUMMY_ACCOUNT_ID } from '~/utils/constants';
import * as utilsConversionModule from '~/utils/conversion';

describe('updateBondedPolyx procedure', () => {
  beforeAll(() => {
    entityMockUtils.initMocks();
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
  });

  const amount = new BigNumber(10);

  let mockContext: Mocked<Context>;
  let unbondTx: PolymeshTx<[Balance]>;
  let bondExtraTx: PolymeshTx<[Balance]>;
  let actingAccount: Account;
  let rawAmount: Balance;

  let bigNumberToBalanceSpy: jest.SpyInstance;

  let storage: Storage;

  beforeEach(() => {
    unbondTx = dsMockUtils.createTxMock('staking', 'unbond');
    bondExtraTx = dsMockUtils.createTxMock('staking', 'bondExtra');
    mockContext = dsMockUtils.getContextInstance();
    actingAccount = entityMockUtils.getAccountInstance({ address: DUMMY_ACCOUNT_ID });
    rawAmount = dsMockUtils.createMockBalance(amount);

    bigNumberToBalanceSpy = jest.spyOn(utilsConversionModule, 'bigNumberToBalance');

    when(bigNumberToBalanceSpy).calledWith(amount, mockContext).mockReturnValue(rawAmount);

    storage = {
      isStash: false,
      actingAccount,
      actingBalance: {
        total: new BigNumber(100),
        free: new BigNumber(100),
        locked: new BigNumber(0),
      },
      controllerEntry: {
        stash: entityMockUtils.getAccountInstance(),
        total: new BigNumber(100),
        active: new BigNumber(100),
        unlocking: [],
        claimedRewards: [],
      },
    };
  });

  afterEach(() => {
    entityMockUtils.reset();
    procedureMockUtils.reset();
    dsMockUtils.reset();
  });

  afterAll(() => {
    procedureMockUtils.cleanup();
    dsMockUtils.cleanup();
  });

  describe('unbond', () => {
    it('should throw an error if the acting account is not a controller', async () => {
      const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
        ...storage,
        controllerEntry: null,
      });

      const expectedError = new PolymeshError({
        code: ErrorCode.ValidationError,
        message: 'The caller must be a controller account',
      });

      await expect(
        prepareUnbondPolyx.call(proc, {
          type: 'unbond',
          amount: new BigNumber(900),
        })
      ).rejects.toThrow(expectedError);
    });

    it('should throw an error if the acting account is not a controller', async () => {
      const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
        ...storage,
        controllerEntry: null,
      });

      const expectedError = new PolymeshError({
        code: ErrorCode.ValidationError,
        message: 'The caller must be a stash account',
      });

      await expect(
        prepareUnbondPolyx.call(proc, {
          type: 'bondExtra',
          amount: new BigNumber(900),
        })
      ).rejects.toThrow(expectedError);
    });

    it('should throw an error if there is insufficient active balance', async () => {
      const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, storage);

      const expectedError = new PolymeshError({
        code: ErrorCode.InsufficientBalance,
        message: 'Insufficient bonded POLYX',
      });

      await expect(
        prepareUnbondPolyx.call(proc, {
          type: 'unbond',
          amount: new BigNumber(900),
        })
      ).rejects.toThrow(expectedError);
    });

    it('should return a unbond transaction spec', async () => {
      const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, storage);

      const args = {
        amount,
        type: 'unbond',
      } as const;

      const result = await prepareUnbondPolyx.call(proc, args);

      expect(result).toEqual({
        transaction: unbondTx,
        args: [rawAmount],
        resolver: undefined,
      });
    });
  });

  describe('bondExtra', () => {
    it('should throw a caller not stash error', async () => {
      const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, storage);

      const args = {
        amount,
        type: 'bondExtra',
      } as const;

      const expectedError = new PolymeshError({
        code: ErrorCode.UnmetPrerequisite,
        message: 'The caller must be a stash account',
      });

      return expect(prepareUnbondPolyx.call(proc, args)).rejects.toThrow(expectedError);
    });

    it('should throw an insufficient balance error', async () => {
      const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
        ...storage,
        isStash: true,
      });

      const args = {
        amount: new BigNumber(9999),
        type: 'bondExtra',
      } as const;

      const expectedError = new PolymeshError({
        code: ErrorCode.InsufficientBalance,
        message: 'The stash account has insufficient free balance',
      });

      return expect(prepareUnbondPolyx.call(proc, args)).rejects.toThrow(expectedError);
    });

    it('should return a bond extra transaction spec', async () => {
      const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
        ...storage,
        isStash: true,
      });

      const args = {
        amount,
        type: 'bondExtra',
      } as const;

      const result = await prepareUnbondPolyx.call(proc, args);

      expect(result).toEqual({
        transaction: bondExtraTx,
        args: [rawAmount],
        resolver: undefined,
      });
    });
  });

  describe('getAuthorization', () => {
    it('should return the Unbond TxTag', () => {
      const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, storage);
      const boundFunc = getAuthorization.bind(proc);

      expect(boundFunc({ amount: new BigNumber(1), type: 'unbond' })).toEqual({
        permissions: {
          transactions: [TxTags.staking.Unbond],
          assets: [],
          portfolios: [],
        },
      });
    });

    it('should return the BondExtra TxTag', () => {
      const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, storage);
      const boundFunc = getAuthorization.bind(proc);

      expect(boundFunc({ amount: new BigNumber(1), type: 'bondExtra' })).toEqual({
        permissions: {
          transactions: [TxTags.staking.BondExtra],
          assets: [],
          portfolios: [],
        },
      });
    });
  });

  describe('prepareStorage', () => {
    it('should return the storage', () => {
      actingAccount = entityMockUtils.getAccountInstance({
        getBalance: { free: new BigNumber(27) },
      });
      mockContext.getActingAccount.mockResolvedValue(actingAccount);

      const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext);
      const boundFunc = prepareStorage.bind(proc);

      return expect(boundFunc()).resolves.toEqual(
        expect.objectContaining({
          actingAccount: expect.objectContaining({ address: 'someAddress' }),
          controllerEntry: null,
        })
      );
    });
  });
});
