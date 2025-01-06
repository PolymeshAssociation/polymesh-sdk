import { AccountId } from '@polkadot/types/interfaces';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import {
  getAuthorization,
  Params,
  prepareSetStakingController,
  prepareStorage,
  Storage,
} from '~/api/procedures/setStakingController';
import { Account, Context, PolymeshError } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { ErrorCode, StakingLedger } from '~/types';
import { PolymeshTx } from '~/types/internal';
import { DUMMY_ACCOUNT_ID } from '~/utils/constants';
import * as utilsConversionModule from '~/utils/conversion';

describe('setStakingController procedure', () => {
  beforeAll(() => {
    entityMockUtils.initMocks();
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
  });

  let currentController: Account;
  let newControllerLedger: StakingLedger;

  let mockContext: Mocked<Context>;
  let setControllerTx: PolymeshTx<[AccountId]>;
  let actingAccount: Account;
  let newController: Account;
  let rawAccountId: AccountId;

  let stringToAccountIdSpy: jest.SpyInstance;

  let storage: Storage;

  beforeEach(() => {
    setControllerTx = dsMockUtils.createTxMock('staking', 'setController');
    mockContext = dsMockUtils.getContextInstance();
    actingAccount = entityMockUtils.getAccountInstance({ address: DUMMY_ACCOUNT_ID });
    newController = entityMockUtils.getAccountInstance({
      address: '5FvreMigHtY1c6XTzDccjn8SVLiAeHz58z4MV4reJYyrdmj3',
    });
    rawAccountId = dsMockUtils.createMockAccountId(newController.address);

    stringToAccountIdSpy = jest.spyOn(utilsConversionModule, 'stringToAccountId');

    when(stringToAccountIdSpy)
      .calledWith(newController.address, mockContext)
      .mockReturnValue(rawAccountId);

    currentController = entityMockUtils.getAccountInstance();
    newControllerLedger = {
      stash: entityMockUtils.getAccountInstance(),
      total: new BigNumber(0),
      active: new BigNumber(0),
      unlocking: [],
      claimedRewards: [],
    };
    storage = {
      actingAccount,
      currentController,
      newControllerLedger: null,
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

  it('should throw an error if the target is already a controller', async () => {
    const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
      ...storage,
      newControllerLedger,
    });

    const expectedError = new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'The given controller is already paired with a stash',
    });

    await expect(
      prepareSetStakingController.call(proc, {
        controller: newController,
      })
    ).rejects.toThrow(expectedError);
  });

  it('should throw an error if the the acting account is not a stash', async () => {
    const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
      ...storage,
      currentController: null,
    });

    const expectedError = new PolymeshError({
      code: ErrorCode.DataUnavailable,
      message: 'Current controller not found. The acting account must be a stash account',
    });

    await expect(
      prepareSetStakingController.call(proc, {
        controller: newController,
      })
    ).rejects.toThrow(expectedError);
  });

  it('should return a setController transaction spec', async () => {
    const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
      actingAccount,
      currentController,
      newControllerLedger: null,
    });

    const args = {
      controller: newController,
    };

    const result = await prepareSetStakingController.call(proc, args);

    expect(result).toEqual({
      transaction: setControllerTx,
      args: [rawAccountId],
      resolver: undefined,
    });
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, storage);
      const boundFunc = getAuthorization.bind(proc);

      expect(boundFunc()).toEqual({
        permissions: {
          transactions: [],
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
        stakingGetController: entityMockUtils.getAccountInstance({ address: 'currentController' }),
      });
      mockContext.getActingAccount.mockResolvedValue(actingAccount);

      const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext);
      const boundFunc = prepareStorage.bind(proc);

      return expect(
        boundFunc({
          controller: entityMockUtils.getAccountInstance(),
        })
      ).resolves.toEqual(
        expect.objectContaining({
          actingAccount: expect.objectContaining({ address: 'someAddress' }),
          currentController: expect.objectContaining({ address: 'currentController' }),
          newControllerLedger: null,
        })
      );
    });
  });
});
