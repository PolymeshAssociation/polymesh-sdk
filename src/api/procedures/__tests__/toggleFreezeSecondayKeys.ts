import { TxTags } from 'polymesh-types/types';
import sinon from 'sinon';

import {
  getAuthorization,
  prepareToggleFreezeSecondaryKeys,
  ToggleFreezeSecondaryKeysParams,
} from '~/api/procedures/toggleFreezeSecondaryKeys';
import { Context } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';

describe('toggleFreezeSecondaryKeys procedure', () => {
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
      areScondaryKeysFrozen: true,
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

  test('should throw an error if freeze is set to true and the secondary keys are already frozen', () => {
    const proc = procedureMockUtils.getInstance<ToggleFreezeSecondaryKeysParams, void>(mockContext);

    return expect(
      prepareToggleFreezeSecondaryKeys.call(proc, {
        freeze: true,
        identity: entityMockUtils.getCurrentIdentityInstance({
          areScondaryKeysFrozen: true,
        }),
      })
    ).rejects.toThrow('The secondary keys are already frozen');
  });

  test('should throw an error if freeze is set to false and the secondary keys are already unfrozen', () => {
    const proc = procedureMockUtils.getInstance<ToggleFreezeSecondaryKeysParams, void>(mockContext);

    return expect(
      prepareToggleFreezeSecondaryKeys.call(proc, {
        freeze: false,
        identity: entityMockUtils.getCurrentIdentityInstance({
          areScondaryKeysFrozen: false,
        }),
      })
    ).rejects.toThrow('The secondary keys are already unfrozen');
  });

  test('should add a freeze secondary keys transaction to the queue', async () => {
    const proc = procedureMockUtils.getInstance<ToggleFreezeSecondaryKeysParams, void>(mockContext);

    const transaction = dsMockUtils.createTxStub('identity', 'freezeSecondaryKeys');

    await prepareToggleFreezeSecondaryKeys.call(proc, {
      freeze: true,
      identity: entityMockUtils.getCurrentIdentityInstance({
        areScondaryKeysFrozen: false,
      }),
    });

    sinon.assert.calledWith(addTransactionStub, transaction, {});
  });

  test('should add a unfreeze secondary keys transaction to the queue', async () => {
    const proc = procedureMockUtils.getInstance<ToggleFreezeSecondaryKeysParams, void>(mockContext);

    const transaction = dsMockUtils.createTxStub('identity', 'unfreezeSecondaryKeys');

    await prepareToggleFreezeSecondaryKeys.call(proc, {
      freeze: false,
      identity: entityMockUtils.getCurrentIdentityInstance({
        areScondaryKeysFrozen: true,
      }),
    });

    sinon.assert.calledWith(addTransactionStub, transaction, {});
  });

  describe('getAuthorization', () => {
    test('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<ToggleFreezeSecondaryKeysParams, void>(
        mockContext
      );
      const boundFunc = getAuthorization.bind(proc);

      expect(
        boundFunc({ freeze: true, identity: entityMockUtils.getCurrentIdentityInstance() })
      ).toEqual({
        permissions: {
          transactions: [TxTags.identity.FreezeSecondaryKeys],
          tokens: [],
          portfolios: [],
        },
      });

      expect(
        boundFunc({ freeze: false, identity: entityMockUtils.getCurrentIdentityInstance() })
      ).toEqual({
        permissions: {
          transactions: [TxTags.identity.UnfreezeSecondaryKeys],
          tokens: [],
          portfolios: [],
        },
      });
    });
  });
});
