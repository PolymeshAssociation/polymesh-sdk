import { AccountId, Balance } from '@polkadot/types/interfaces';
import { PalletStakingRewardDestination } from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import {
  getAuthorization,
  Params,
  prepareBondPolyx,
  prepareStorage,
  Storage,
} from '~/api/procedures/bondPolyx';
import { Account, Context, PolymeshError } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { ErrorCode, TxTags } from '~/types';
import { PolymeshTx } from '~/types/internal';
import { DUMMY_ACCOUNT_ID } from '~/utils/constants';
import * as utilsConversionModule from '~/utils/conversion';

describe('bondPolyx procedure', () => {
  beforeAll(() => {
    entityMockUtils.initMocks();
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
  });

  const amount = new BigNumber(100);
  const actingBalance = {
    free: new BigNumber(100),
    locked: new BigNumber(0),
    total: new BigNumber(100),
  };

  let mockContext: Mocked<Context>;
  let bondTx: PolymeshTx<[AccountId, Balance, AccountId]>;
  let actingAccount: Account;
  let rawAccountId: AccountId;
  let rawAmount: Balance;
  let rewardDestination: PalletStakingRewardDestination;

  let bigNumberToBalanceSpy: jest.SpyInstance;
  let stringToAccountIdSpy: jest.SpyInstance;
  let stakingRewardDestinationToRawSpy: jest.SpyInstance;

  let storage: Storage;

  beforeEach(() => {
    bondTx = dsMockUtils.createTxMock('staking', 'bond');
    mockContext = dsMockUtils.getContextInstance();
    actingAccount = entityMockUtils.getAccountInstance({ address: DUMMY_ACCOUNT_ID });
    rawAccountId = dsMockUtils.createMockAccountId(actingAccount.address);
    rawAmount = dsMockUtils.createMockBalance(amount);

    bigNumberToBalanceSpy = jest.spyOn(utilsConversionModule, 'bigNumberToBalance');
    stringToAccountIdSpy = jest.spyOn(utilsConversionModule, 'stringToAccountId');
    stakingRewardDestinationToRawSpy = jest.spyOn(
      utilsConversionModule,
      'stakingRewardDestinationToRaw'
    );

    when(bigNumberToBalanceSpy).calledWith(amount, mockContext).mockReturnValue(rawAmount);
    when(stringToAccountIdSpy)
      .calledWith(actingAccount.address, mockContext)
      .mockReturnValue(rawAccountId);

    when(stakingRewardDestinationToRawSpy)
      .calledWith({ stash: true }, mockContext)
      .mockReturnValue(rewardDestination);

    storage = {
      actingBalance,
      actingAccount,
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

  it('should throw an error if there is insufficient free balance', async () => {
    const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, storage);

    const expectedError = new PolymeshError({
      code: ErrorCode.InsufficientBalance,
      message: 'The stash account has insufficient POLYX',
    });

    await expect(
      prepareBondPolyx.call(proc, {
        controller: actingAccount,
        amount: new BigNumber(900),
        rewardDestination: actingAccount,
        autoStake: false,
      })
    ).rejects.toThrow(expectedError);
  });

  it('should throw an error auto staked is true and there is non stash destination', async () => {
    const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, storage);

    const payeeAccount = entityMockUtils.getAccountInstance({ isEqual: false });

    const expectedError = new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'auto staking requires the payee to be the acting account',
    });

    await expect(
      prepareBondPolyx.call(proc, {
        controller: actingAccount,
        amount: new BigNumber(900),
        rewardDestination: payeeAccount,
        autoStake: true,
      })
    ).rejects.toThrow(expectedError);
  });

  it('should return a bond transaction spec', async () => {
    const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
      actingBalance,
      actingAccount,
    });

    const args = {
      payee: actingAccount,
      controller: actingAccount,
      rewardDestination: actingAccount,
      amount,
      autoStake: false,
    };

    const result = await prepareBondPolyx.call(proc, args);

    expect(result).toEqual({
      transaction: bondTx,
      args: [rawAccountId, rawAmount, rewardDestination],
      resolver: undefined,
    });
  });

  it('should handle auto stake', async () => {
    const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
      actingBalance,
      actingAccount: entityMockUtils.getAccountInstance({
        isEqual: false,
        address: actingAccount.address,
      }),
    });

    const args = {
      payee: actingAccount,
      controller: actingAccount,
      rewardDestination: actingAccount,
      amount,
      autoStake: true,
    };

    await prepareBondPolyx.call(proc, args);

    expect(stakingRewardDestinationToRawSpy).toHaveBeenCalledWith({ staked: true }, mockContext);
  });

  it('should handle different an account destination', async () => {
    const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
      actingBalance,
      actingAccount: entityMockUtils.getAccountInstance({
        isEqual: false,
        address: actingAccount.address,
      }),
    });

    const destination = entityMockUtils.getAccountInstance({
      address: '5GREnjoNggSyKfD3Jhmzg2jdBi1Zb7y2r58nqo4QzxDHHhsW',
    });

    const args = {
      payee: actingAccount,
      controller: entityMockUtils.getAccountInstance({
        isEqual: false,
        address: '5CD1ydRQzG7du6Sd4EfBWTGpZc1VJjKNSc5ScyZXfRgkqUG9',
      }),
      rewardDestination: destination,
      amount,
      autoStake: false,
    };

    await prepareBondPolyx.call(proc, args);

    expect(stakingRewardDestinationToRawSpy).toHaveBeenCalledWith(
      { account: destination },
      mockContext
    );
  });

  it('should handle a controller destination', async () => {
    const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
      actingBalance,
      actingAccount: entityMockUtils.getAccountInstance({
        isEqual: false,
        address: actingAccount.address,
      }),
    });

    const controller = entityMockUtils.getAccountInstance({
      isEqual: true,
      address: '5CD1ydRQzG7du6Sd4EfBWTGpZc1VJjKNSc5ScyZXfRgkqUG9',
    });
    const args = {
      payee: actingAccount,
      controller,
      rewardDestination: controller,
      amount,
      autoStake: false,
    };

    await prepareBondPolyx.call(proc, args);

    expect(stakingRewardDestinationToRawSpy).toHaveBeenCalledWith(
      { controller: true },
      mockContext
    );
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, storage);
      const boundFunc = getAuthorization.bind(proc);

      expect(boundFunc()).toEqual({
        permissions: {
          transactions: [TxTags.staking.Bond],
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
          actingBalance: {
            free: new BigNumber(27),
          },
          actingAccount: expect.objectContaining({ address: 'someAddress' }),
        })
      );
    });
  });
});
