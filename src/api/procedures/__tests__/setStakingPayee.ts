import { AccountId, RewardDestination } from '@polkadot/types/interfaces';
import BigNumber from 'bignumber.js';

import {
  getAuthorization,
  Params,
  prepareSetStakingPayee,
  prepareStorage,
  Storage,
} from '~/api/procedures/setStakingPayee';
import { Account, Context, PolymeshError } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { ErrorCode, StakingLedger, StakingPayee } from '~/types';
import { PolymeshTx } from '~/types/internal';
import { DUMMY_ACCOUNT_ID } from '~/utils/constants';
import * as internalUtilsModule from '~/utils/internal';

describe('setStakingPayee procedure', () => {
  beforeAll(() => {
    entityMockUtils.initMocks();
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
  });

  let currentPayee: StakingPayee;
  let ledger: StakingLedger;

  let mockContext: Mocked<Context>;
  let setPayeeTx: PolymeshTx<[AccountId]>;
  let actingAccount: Account;
  let newPayee: Account;
  let rewardDestination: RewardDestination;

  let calculateRawStakingPayee: jest.SpyInstance;

  let storage: Storage;

  beforeEach(() => {
    setPayeeTx = dsMockUtils.createTxMock('staking', 'setPayee');
    mockContext = dsMockUtils.getContextInstance();
    actingAccount = entityMockUtils.getAccountInstance({ address: DUMMY_ACCOUNT_ID });
    newPayee = entityMockUtils.getAccountInstance({
      address: '5FvreMigHtY1c6XTzDccjn8SVLiAeHz58z4MV4reJYyrdmj3',
    });
    rewardDestination = dsMockUtils.createMockRewardDestination('Staked');

    calculateRawStakingPayee = jest.spyOn(internalUtilsModule, 'calculateRawStakingPayee');

    calculateRawStakingPayee.mockReturnValue(rewardDestination);

    currentPayee = {
      account: entityMockUtils.getAccountInstance({ isEqual: false }),
      autoStaked: false,
    };
    ledger = {
      stash: entityMockUtils.getAccountInstance({
        stakingGetPayee: { account: entityMockUtils.getAccountInstance(), autoStaked: false },
      }),
      total: new BigNumber(0),
      active: new BigNumber(0),
      unlocking: [],
      claimedRewards: [],
    };
    storage = {
      actingAccount,
      ledger,
      currentPayee,
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

  it('should throw an error if the payee is already set', async () => {
    currentPayee.account = entityMockUtils.getAccountInstance({ isEqual: true });

    const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
      actingAccount,
      currentPayee,
      ledger,
    });

    const args = {
      payee: newPayee,
      autoStake: false,
    };

    const expectedError = new PolymeshError({
      code: ErrorCode.NoDataChange,
      message: 'The given payee is already set',
    });

    return expect(prepareSetStakingPayee.call(proc, args)).rejects.toThrow(expectedError);
  });

  it('should return a setPayee transaction spec', async () => {
    const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
      actingAccount,
      currentPayee,
      ledger,
    });

    const args = {
      payee: newPayee,
      autoStake: false,
    };

    const result = await prepareSetStakingPayee.call(proc, args);

    expect(result).toEqual({
      transaction: setPayeeTx,
      args: [rewardDestination],
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
        stakingGetLedger: ledger,
      });
      mockContext.getActingAccount.mockResolvedValue(actingAccount);

      const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext);
      const boundFunc = prepareStorage.bind(proc);

      return expect(boundFunc()).resolves.toEqual(
        expect.objectContaining({
          actingAccount: expect.objectContaining({ address: 'someAddress' }),
        })
      );
    });
  });

  it('should throw an error if there is no ledger', () => {
    actingAccount = entityMockUtils.getAccountInstance({
      stakingGetLedger: null,
    });
    mockContext.getActingAccount.mockResolvedValue(actingAccount);

    const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext);
    const boundFunc = prepareStorage.bind(proc);

    const expectedError = new PolymeshError({
      code: ErrorCode.DataUnavailable,
      message: 'Staking ledger entry was not found. The acting account must be a controller',
    });

    return expect(boundFunc()).rejects.toThrow(expectedError);
  });

  it('should throw an error if there is no currentPayee', () => {
    actingAccount = entityMockUtils.getAccountInstance({
      stakingGetLedger: {
        ...ledger,
        stash: entityMockUtils.getAccountInstance({ stakingGetPayee: null }),
      },
    });
    mockContext.getActingAccount.mockResolvedValue(actingAccount);

    const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext);
    const boundFunc = prepareStorage.bind(proc);

    const expectedError = new PolymeshError({
      code: ErrorCode.DataUnavailable,
      message: 'Payee was not found. The acting account must be a controller',
    });

    return expect(boundFunc()).rejects.toThrow(expectedError);
  });
});
