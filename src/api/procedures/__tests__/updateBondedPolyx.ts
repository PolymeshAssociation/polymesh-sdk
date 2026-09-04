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
import { ErrorCode } from '~/types';
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
  let rebondTx: PolymeshTx<[Balance]>;
  let actingAccount: Account;
  let stash: Account;
  let rawAmount: Balance;

  let bigNumberToBalanceSpy: jest.SpyInstance;

  let storage: Storage;

  beforeEach(() => {
    unbondTx = dsMockUtils.createTxMock('staking', 'unbond');
    bondExtraTx = dsMockUtils.createTxMock('staking', 'bondExtra');
    rebondTx = dsMockUtils.createTxMock('staking', 'rebond');
    mockContext = dsMockUtils.getContextInstance();
    actingAccount = entityMockUtils.getAccountInstance({ address: DUMMY_ACCOUNT_ID });
    rawAmount = dsMockUtils.createMockBalance(amount);

    bigNumberToBalanceSpy = jest.spyOn(utilsConversionModule, 'bigNumberToBalance');

    when(bigNumberToBalanceSpy).calledWith(amount, mockContext).mockReturnValue(rawAmount);

    stash = entityMockUtils.getAccountInstance();

    storage = {
      isStash: false,
      actingAccount,
      actingBalance: {
        total: new BigNumber(100),
        free: new BigNumber(100),
        locked: new BigNumber(0),
      },
      controllerEntry: {
        stash,
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
    it('should throw an error if the acting account is not a controller', () => {
      const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
        ...storage,
        controllerEntry: null,
      });

      const expectedError = new PolymeshError({
        code: ErrorCode.ValidationError,
        message: 'The caller must be a controller account',
      });

      expect(() =>
        prepareUnbondPolyx.call(proc, {
          type: 'unbond',
          amount: new BigNumber(900),
        })
      ).toThrow(expectedError);
    });

    it('should throw an error if the acting account is not a controller', () => {
      const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
        ...storage,
        controllerEntry: null,
      });

      const expectedError = new PolymeshError({
        code: ErrorCode.ValidationError,
        message: 'The caller must be a stash account',
      });

      expect(() =>
        prepareUnbondPolyx.call(proc, {
          type: 'bondExtra',
          amount: new BigNumber(900),
        })
      ).toThrow(expectedError);
    });

    it('should throw an error if there is insufficient active balance', () => {
      const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, storage);

      const expectedError = new PolymeshError({
        code: ErrorCode.InsufficientBalance,
        message: 'Insufficient bonded POLYX',
      });

      expect(() =>
        prepareUnbondPolyx.call(proc, {
          type: 'unbond',
          amount: new BigNumber(900),
        })
      ).toThrow(expectedError);
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
    it('should throw a caller not stash error', () => {
      const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, storage);

      const args = {
        amount,
        type: 'bondExtra',
      } as const;

      const expectedError = new PolymeshError({
        code: ErrorCode.UnmetPrerequisite,
        message: 'The caller must be a stash account',
      });

      return expect(() => prepareUnbondPolyx.call(proc, args)).toThrow(expectedError);
    });

    it('should throw an insufficient balance error', () => {
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

      return expect(() => prepareUnbondPolyx.call(proc, args)).toThrow(expectedError);
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

  describe('rebond', () => {
    it('should throw an error if the acting account is not a controller', () => {
      const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
        ...storage,
        controllerEntry: null,
      });

      const expectedError = new PolymeshError({
        code: ErrorCode.UnmetPrerequisite,
        message: 'The caller must be a controller account',
      });

      expect(() => prepareUnbondPolyx.call(proc, { type: 'rebond', amount })).toThrow(
        expectedError
      );
    });

    it('should throw an error if there is nothing unbonding at all', () => {
      const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, storage);

      const expectedError = new PolymeshError({
        code: ErrorCode.UnmetPrerequisite,
        message: 'There is no unbonding POLYX to rebond',
      });

      /* zero passes the amount check, since nothing is not less than nothing */
      expect(() =>
        prepareUnbondPolyx.call(proc, { type: 'rebond', amount: new BigNumber(0) })
      ).toThrow(expectedError);
    });

    it('should throw an error if there is insufficient unbonding POLYX', () => {
      const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
        ...storage,
        controllerEntry: {
          ...storage.controllerEntry!,
          unlocking: [{ value: new BigNumber(4), era: new BigNumber(1) }],
        },
      });

      const expectedError = new PolymeshError({
        code: ErrorCode.InsufficientBalance,
        message: 'Insufficient unbonding POLYX',
      });

      expect(() => prepareUnbondPolyx.call(proc, { type: 'rebond', amount })).toThrow(
        expectedError
      );
    });

    it('should sum every unlocking chunk when checking the amount', async () => {
      const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
        ...storage,
        controllerEntry: {
          ...storage.controllerEntry!,
          unlocking: [
            { value: new BigNumber(4), era: new BigNumber(1) },
            { value: new BigNumber(6), era: new BigNumber(2) },
          ],
        },
      });

      const result = await prepareUnbondPolyx.call(proc, { type: 'rebond', amount });

      expect(result).toEqual({
        transaction: rebondTx,
        args: [rawAmount],
        resolver: undefined,
      });
    });

    it('should return a rebond transaction spec', async () => {
      const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
        ...storage,
        controllerEntry: {
          ...storage.controllerEntry!,
          unlocking: [{ value: new BigNumber(100), era: new BigNumber(1) }],
        },
      });

      const result = await prepareUnbondPolyx.call(proc, { type: 'rebond', amount });

      expect(result).toEqual({
        transaction: rebondTx,
        args: [rawAmount],
        resolver: undefined,
      });
    });
  });

  describe('getAuthorization', () => {
    it('should require no permissions', () => {
      const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext);
      const boundFunc = getAuthorization.bind(proc);

      /*
       * `true`, not empty arrays: the staking pallet consults no `ExtrinsicPermissions`, and an
       *   empty `SimplePermissions` would still read the key's permissions from chain — which
       *   throws for an Account with no Identity
       */
      expect(boundFunc()).toEqual({ permissions: true });
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
