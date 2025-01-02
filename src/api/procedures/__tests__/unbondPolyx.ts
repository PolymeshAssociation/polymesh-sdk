import { Balance } from '@polkadot/types/interfaces';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import {
  getAuthorization,
  prepareStorage,
  prepareUnbondPolyx,
  Storage,
} from '~/api/procedures/unbondPolyx';
import { Account, Context, PolymeshError } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { ErrorCode, TxTags, UnbondPolyxParams } from '~/types';
import { PolymeshTx } from '~/types/internal';
import { DUMMY_ACCOUNT_ID } from '~/utils/constants';
import * as utilsConversionModule from '~/utils/conversion';

describe('unbondPolyx procedure', () => {
  beforeAll(() => {
    entityMockUtils.initMocks();
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
  });

  const amount = new BigNumber(10);

  let mockContext: Mocked<Context>;
  let unbondTx: PolymeshTx<[Balance]>;
  let actingAccount: Account;
  let rawAmount: Balance;

  let bigNumberToBalanceSpy: jest.SpyInstance;

  let storage: Storage;

  beforeEach(() => {
    unbondTx = dsMockUtils.createTxMock('staking', 'unbond');
    mockContext = dsMockUtils.getContextInstance();
    actingAccount = entityMockUtils.getAccountInstance({ address: DUMMY_ACCOUNT_ID });
    rawAmount = dsMockUtils.createMockBalance(amount);

    bigNumberToBalanceSpy = jest.spyOn(utilsConversionModule, 'bigNumberToBalance');

    when(bigNumberToBalanceSpy).calledWith(amount, mockContext).mockReturnValue(rawAmount);

    storage = {
      actingAccount,
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

  it('should throw an error if the acting account is not a controller', async () => {
    const proc = procedureMockUtils.getInstance<UnbondPolyxParams, void, Storage>(mockContext, {
      ...storage,
      controllerEntry: null,
    });

    const expectedError = new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Caller must be a controller account',
    });

    await expect(
      prepareUnbondPolyx.call(proc, {
        amount: new BigNumber(900),
      })
    ).rejects.toThrow(expectedError);
  });

  it('should throw an error if there is insufficient active balance', async () => {
    const proc = procedureMockUtils.getInstance<UnbondPolyxParams, void, Storage>(
      mockContext,
      storage
    );

    const expectedError = new PolymeshError({
      code: ErrorCode.InsufficientBalance,
      message: 'Insufficient bonded POLYX',
    });

    await expect(
      prepareUnbondPolyx.call(proc, {
        amount: new BigNumber(900),
      })
    ).rejects.toThrow(expectedError);
  });

  it('should return a unbond transaction spec', async () => {
    const proc = procedureMockUtils.getInstance<UnbondPolyxParams, void, Storage>(
      mockContext,
      storage
    );

    const args = {
      amount,
    };

    const result = await prepareUnbondPolyx.call(proc, args);

    expect(result).toEqual({
      transaction: unbondTx,
      args: [rawAmount],
      resolver: undefined,
    });
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<UnbondPolyxParams, void, Storage>(
        mockContext,
        storage
      );
      const boundFunc = getAuthorization.bind(proc);

      expect(boundFunc()).toEqual({
        permissions: {
          transactions: [TxTags.staking.Unbond],
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

      const proc = procedureMockUtils.getInstance<UnbondPolyxParams, void, Storage>(mockContext);
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
