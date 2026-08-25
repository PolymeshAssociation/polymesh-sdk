import { AccountId } from '@polkadot/types/interfaces';
import BigNumber from 'bignumber.js';

import {
  getAuthorization,
  prepareSetStakingController,
  prepareStorage,
  Storage,
} from '~/api/procedures/setStakingController';
import { Account, Context, PolymeshError } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { ErrorCode } from '~/types';
import { PolymeshTx } from '~/types/internal';
import { DUMMY_ACCOUNT_ID } from '~/utils/constants';

describe('setStakingController procedure', () => {
  beforeAll(() => {
    entityMockUtils.initMocks();
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
  });

  let currentController: Account;

  let mockContext: Mocked<Context>;
  let setControllerTx: PolymeshTx<[AccountId]>;
  let actingAccount: Account;

  let storage: Storage;

  beforeEach(() => {
    setControllerTx = dsMockUtils.createTxMock('staking', 'setController');
    mockContext = dsMockUtils.getContextInstance();
    actingAccount = entityMockUtils.getAccountInstance({ address: DUMMY_ACCOUNT_ID });

    currentController = entityMockUtils.getAccountInstance();
    storage = {
      actingAccount,
      currentController,
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

  it('should throw an error if the the acting account is not a stash', () => {
    const proc = procedureMockUtils.getInstance<void, void, Storage>(mockContext, {
      ...storage,
      currentController: null,
    });

    const expectedError = new PolymeshError({
      code: ErrorCode.DataUnavailable,
      message: 'Current controller not found. The acting account must be a stash account',
    });

    expect(() => prepareSetStakingController.call(proc)).toThrow(expectedError);
  });

  it('should return a setController transaction spec', async () => {
    const proc = procedureMockUtils.getInstance<void, void, Storage>(mockContext, {
      actingAccount,
      currentController,
    });

    const result = await prepareSetStakingController.call(proc);

    expect(result).toEqual({
      transaction: setControllerTx,
      args: undefined,
      resolver: undefined,
    });
  });

  describe('getAuthorization', () => {
    it('should require no permissions', () => {
      const proc = procedureMockUtils.getInstance<void, void, Storage>(mockContext);
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
        stakingGetController: entityMockUtils.getAccountInstance({ address: 'currentController' }),
      });
      mockContext.getActingAccount.mockResolvedValue(actingAccount);

      const proc = procedureMockUtils.getInstance<void, void, Storage>(mockContext);
      const boundFunc = prepareStorage.bind(proc);

      return expect(boundFunc()).resolves.toEqual(
        expect.objectContaining({
          actingAccount: expect.objectContaining({ address: 'someAddress' }),
          currentController: expect.objectContaining({ address: 'currentController' }),
        })
      );
    });
  });
});
