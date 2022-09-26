import {
  getAuthorization,
  prepareToggleFreezeSecondaryAccounts,
  ToggleFreezeSecondaryAccountsParams,
} from '~/api/procedures/toggleFreezeSecondaryAccounts';
import { Context } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { TxTags } from '~/types';

describe('toggleFreezeSecondaryAccounts procedure', () => {
  let mockContext: Mocked<Context>;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance({
      areSecondaryAccountsFrozen: true,
    });
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

  it('should throw an error if freeze is set to true and the secondary Accounts are already frozen', () => {
    const proc = procedureMockUtils.getInstance<ToggleFreezeSecondaryAccountsParams, void>(
      mockContext
    );

    return expect(
      prepareToggleFreezeSecondaryAccounts.call(proc, {
        freeze: true,
        identity: entityMockUtils.getIdentityInstance({
          areSecondaryAccountsFrozen: true,
        }),
      })
    ).rejects.toThrow('The secondary Accounts are already frozen');
  });

  it('should throw an error if freeze is set to false and the secondary Accounts are already unfrozen', () => {
    dsMockUtils.configureMocks({
      contextOptions: {
        areSecondaryAccountsFrozen: false,
      },
    });

    const proc = procedureMockUtils.getInstance<ToggleFreezeSecondaryAccountsParams, void>(
      mockContext
    );

    return expect(
      prepareToggleFreezeSecondaryAccounts.call(proc, {
        freeze: false,
      })
    ).rejects.toThrow('The secondary Accounts are already unfrozen');
  });

  it('should return a freeze secondary Accounts transaction spec', async () => {
    dsMockUtils.configureMocks({
      contextOptions: {
        areSecondaryAccountsFrozen: false,
      },
    });

    const proc = procedureMockUtils.getInstance<ToggleFreezeSecondaryAccountsParams, void>(
      mockContext
    );

    const transaction = dsMockUtils.createTxMock('identity', 'freezeSecondaryKeys');

    const result = await prepareToggleFreezeSecondaryAccounts.call(proc, {
      freeze: true,
    });

    expect(result).toEqual({ transaction, resolver: undefined });
  });

  it('should return an unfreeze secondary Accounts transaction spec', async () => {
    dsMockUtils.configureMocks({
      contextOptions: {
        areSecondaryAccountsFrozen: true,
      },
    });

    const proc = procedureMockUtils.getInstance<ToggleFreezeSecondaryAccountsParams, void>(
      mockContext
    );

    const transaction = dsMockUtils.createTxMock('identity', 'unfreezeSecondaryKeys');

    const result = await prepareToggleFreezeSecondaryAccounts.call(proc, {
      freeze: false,
    });

    expect(result).toEqual({ transaction, resolver: undefined });
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<ToggleFreezeSecondaryAccountsParams, void>(
        mockContext
      );
      const boundFunc = getAuthorization.bind(proc);

      expect(boundFunc({ freeze: true })).toEqual({
        permissions: {
          transactions: [TxTags.identity.FreezeSecondaryKeys],
          assets: [],
          portfolios: [],
        },
      });

      expect(boundFunc({ freeze: false })).toEqual({
        permissions: {
          transactions: [TxTags.identity.UnfreezeSecondaryKeys],
          assets: [],
          portfolios: [],
        },
      });
    });
  });
});
