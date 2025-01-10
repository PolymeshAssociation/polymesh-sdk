import { u32 } from '@polkadot/types';
import BigNumber from 'bignumber.js';

import {
  getAuthorization,
  prepareStorage,
  prepareWithdrawUnbondedPolyx,
  Storage,
} from '~/api/procedures/withdrawUnbondedPolyx';
import { Account, Context, PolymeshError } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { ErrorCode } from '~/types';
import { PolymeshTx } from '~/types/internal';
import { DUMMY_ACCOUNT_ID } from '~/utils/constants';
import * as utilsConversionModule from '~/utils/conversion';

describe('withdrawUnbondedPolyx procedure', () => {
  beforeAll(() => {
    entityMockUtils.initMocks();
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
  });

  let mockContext: Mocked<Context>;
  let withdrawUnbondedTx: PolymeshTx<[u32]>;
  let actingAccount: Account;

  let bigNumberToU32Spy: jest.SpyInstance;
  let rawSpanCount: u32;

  let storage: Storage;

  beforeEach(() => {
    withdrawUnbondedTx = dsMockUtils.createTxMock('staking', 'withdrawUnbonded');
    mockContext = dsMockUtils.getContextInstance();
    actingAccount = entityMockUtils.getAccountInstance({ address: DUMMY_ACCOUNT_ID });
    rawSpanCount = dsMockUtils.createMockU32(new BigNumber(3));

    bigNumberToU32Spy = jest.spyOn(utilsConversionModule, 'bigNumberToU32');
    bigNumberToU32Spy.mockReturnValue(rawSpanCount);

    storage = {
      actingAccount,
      optSpans: dsMockUtils.createMockOption(),
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

  describe('withdrawUnbondedPolyx', () => {
    it('should throw an error if the acting account is not a controller', async () => {
      const proc = procedureMockUtils.getInstance<void, void, Storage>(mockContext, {
        ...storage,
        controllerEntry: null,
      });

      const expectedError = new PolymeshError({
        code: ErrorCode.ValidationError,
        message: 'The caller must be a controller account',
      });

      await expect(prepareWithdrawUnbondedPolyx.call(proc)).rejects.toThrow(expectedError);
    });

    it('should return a withdrawUnbonded transaction spec', async () => {
      const proc = procedureMockUtils.getInstance<void, void, Storage>(mockContext, storage);

      const result = await prepareWithdrawUnbondedPolyx.call(proc);

      expect(result).toEqual({
        transaction: withdrawUnbondedTx,
        args: [rawSpanCount],
        resolver: undefined,
      });
    });

    it('should handle a non-null slashingSpan', async () => {
      const proc = procedureMockUtils.getInstance<void, void, Storage>(mockContext, {
        ...storage,
        optSpans: dsMockUtils.createMockOption(
          dsMockUtils.createMockSlashingSpans({
            spanIndex: dsMockUtils.createMockU32(),
            prior: dsMockUtils.createMockVec<u32>([dsMockUtils.createMockU32(new BigNumber(3))]),
            lastStart: dsMockUtils.createMockU32(),
            lastNonzeroSlash: dsMockUtils.createMockU32(),
          })
        ),
      });

      const result = await prepareWithdrawUnbondedPolyx.call(proc);

      expect(result).toEqual({
        transaction: withdrawUnbondedTx,
        args: [rawSpanCount],
        resolver: undefined,
      });
    });
  });

  describe('getAuthorization', () => {
    it('should return empty permissions', () => {
      const proc = procedureMockUtils.getInstance<void, void, Storage>(mockContext, storage);
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
      dsMockUtils.createQueryMock('staking', 'slashingSpans', {
        returnValue: dsMockUtils.createMockOption(),
      });
      mockContext.getActingAccount.mockResolvedValue(actingAccount);
      const proc = procedureMockUtils.getInstance<void, void, Storage>(mockContext);
      const boundFunc = prepareStorage.bind(proc);

      return expect(boundFunc()).resolves.toEqual(
        expect.objectContaining({
          actingAccount: expect.objectContaining({ address: DUMMY_ACCOUNT_ID }),
          controllerEntry: null,
        })
      );
    });
  });
});
