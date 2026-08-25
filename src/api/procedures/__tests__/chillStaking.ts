import BigNumber from 'bignumber.js';

import {
  getAuthorization,
  prepareChillStaking,
  prepareStorage,
  Storage,
} from '~/api/procedures/chillStaking';
import { Account, Context, PolymeshError } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { ErrorCode } from '~/types';
import { PolymeshTx } from '~/types/internal';
import { DUMMY_ACCOUNT_ID } from '~/utils/constants';

describe('chillStaking procedure', () => {
  beforeAll(() => {
    entityMockUtils.initMocks();
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
  });

  let mockContext: Mocked<Context>;
  let chillTx: PolymeshTx<[]>;
  let actingAccount: Account;

  let storage: Storage;

  beforeEach(() => {
    chillTx = dsMockUtils.createTxMock('staking', 'chill');
    mockContext = dsMockUtils.getContextInstance();
    actingAccount = entityMockUtils.getAccountInstance({ address: DUMMY_ACCOUNT_ID });

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

  describe('chillStaking', () => {
    it('should throw an error if the acting account is not a controller', () => {
      const proc = procedureMockUtils.getInstance<void, void, Storage>(mockContext, {
        ...storage,
        controllerEntry: null,
      });

      const expectedError = new PolymeshError({
        code: ErrorCode.UnmetPrerequisite,
        message: 'The caller must be a controller account',
      });

      expect(() => prepareChillStaking.call(proc)).toThrow(expectedError);
    });

    it('should return a chill transaction spec', async () => {
      const proc = procedureMockUtils.getInstance<void, void, Storage>(mockContext, storage);

      const result = await prepareChillStaking.call(proc);

      expect(result).toEqual({
        transaction: chillTx,
        args: undefined,
        resolver: undefined,
      });
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
      mockContext.getActingAccount.mockResolvedValue(actingAccount);
      const proc = procedureMockUtils.getInstance<void, void, Storage>(mockContext);
      const boundFunc = prepareStorage.bind(proc);

      return expect(boundFunc()).resolves.toEqual({
        actingAccount: expect.objectContaining({ address: DUMMY_ACCOUNT_ID }),
        controllerEntry: null,
      });
    });
  });
});
