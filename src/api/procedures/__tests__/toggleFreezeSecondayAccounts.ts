import sinon from 'sinon';

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

  it('should add a freeze secondary Accounts transaction to the queue', async () => {
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

    sinon.assert.calledWith(addTransactionStub, { transaction });
  });

  it('should add a unfreeze secondary Accounts transaction to the queue', async () => {
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

    sinon.assert.calledWith(addTransactionStub, { transaction });
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
