import { TxTags } from 'polymesh-types/types';
import sinon from 'sinon';

import {
  getAuthorization,
  prepareToggleFreezeSecondaryAccounts,
  ToggleFreezeSecondaryAccountsParams,
} from '~/api/procedures/toggleFreezeSecondaryAccounts';
import { Context } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';

describe('toggleFreezeSecondaryAccounts procedure', () => {
  let mockContext: Mocked<Context>;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
  });

  let addTransactionStub: sinon.SinonStub;

  beforeEach(() => {
    addTransactionStub = procedureMockUtils.getAddTransactionStub();
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
    entityMockUtils.cleanup();
    procedureMockUtils.cleanup();
    dsMockUtils.cleanup();
  });

  test('should throw an error if freeze is set to true and the secondary Accounts are already frozen', () => {
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

  test('should throw an error if freeze is set to false and the secondary Accounts are already unfrozen', () => {
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

  test('should add a freeze secondary Accounts transaction to the queue', async () => {
    dsMockUtils.configureMocks({
      contextOptions: {
        areSecondaryAccountsFrozen: false,
      },
    });

    const proc = procedureMockUtils.getInstance<ToggleFreezeSecondaryAccountsParams, void>(
      mockContext
    );

    const transaction = dsMockUtils.createTxStub('identity', 'freezeSecondaryKeys');

    await prepareToggleFreezeSecondaryAccounts.call(proc, {
      freeze: true,
    });

    sinon.assert.calledWith(addTransactionStub, transaction, {});
  });

  test('should add a unfreeze secondary Accounts transaction to the queue', async () => {
    dsMockUtils.configureMocks({
      contextOptions: {
        areSecondaryAccountsFrozen: true,
      },
    });

    const proc = procedureMockUtils.getInstance<ToggleFreezeSecondaryAccountsParams, void>(
      mockContext
    );

    const transaction = dsMockUtils.createTxStub('identity', 'unfreezeSecondaryKeys');

    await prepareToggleFreezeSecondaryAccounts.call(proc, {
      freeze: false,
    });

    sinon.assert.calledWith(addTransactionStub, transaction, {});
  });

  describe('getAuthorization', () => {
    test('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<ToggleFreezeSecondaryAccountsParams, void>(
        mockContext
      );
      const boundFunc = getAuthorization.bind(proc);

      expect(boundFunc({ freeze: true })).toEqual({
        permissions: {
          transactions: [TxTags.identity.FreezeSecondaryKeys],
          tokens: [],
          portfolios: [],
        },
      });

      expect(boundFunc({ freeze: false })).toEqual({
        permissions: {
          transactions: [TxTags.identity.UnfreezeSecondaryKeys],
          tokens: [],
          portfolios: [],
        },
      });
    });
  });
});
