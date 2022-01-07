import { u64 } from '@polkadot/types';
import { Permill } from '@polkadot/types/interfaces';
import BigNumber from 'bignumber.js';
import { ScopeId, Ticker, TransferManager, TxTags } from 'polymesh-types/types';
import sinon from 'sinon';

import {
  getAuthorization,
  prepareSetTransferRestrictions,
  prepareStorage,
  SetTransferRestrictionsParams,
  Storage,
} from '~/api/procedures/setTransferRestrictions';
import { Context } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { TickerReservationStatus, TransferRestriction, TransferRestrictionType } from '~/types';
import { PolymeshTx } from '~/types/internal';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Asset',
  require('~/testUtils/mocks/entities').mockAssetModule('~/api/entities/Asset')
);
jest.mock(
  '~/api/entities/Identity',
  require('~/testUtils/mocks/entities').mockIdentityModule('~/api/entities/Identity')
);

describe('setTransferRestrictions procedure', () => {
  let mockContext: Mocked<Context>;
  let transferRestrictionToTransferManagerStub: sinon.SinonStub<
    [TransferRestriction, Context],
    TransferManager
  >;
  let stringToTickerStub: sinon.SinonStub<[string, Context], Ticker>;
  let stringToScopeIdStub: sinon.SinonStub<[string, Context], ScopeId>;
  let ticker: string;
  let count: BigNumber;
  let percentage: BigNumber;
  let countTm: TransferRestriction;
  let percentageTm: TransferRestriction;
  let scopeId: string;
  let rawTicker: Ticker;
  let rawCount: u64;
  let rawPercentage: Permill;
  let rawCountTm: TransferManager;
  let rawPercentageTm: TransferManager;
  let rawScopeId: ScopeId;
  let args: SetTransferRestrictionsParams;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    transferRestrictionToTransferManagerStub = sinon.stub(
      utilsConversionModule,
      'transferRestrictionToTransferManager'
    );
    stringToTickerStub = sinon.stub(utilsConversionModule, 'stringToTicker');
    stringToScopeIdStub = sinon.stub(utilsConversionModule, 'stringToScopeId');
    ticker = 'someTicker';
    count = new BigNumber(10);
    percentage = new BigNumber(49);
    countTm = { type: TransferRestrictionType.Count, value: count };
    percentageTm = { type: TransferRestrictionType.Percentage, value: percentage };
    scopeId = 'scopeId';
    args = {
      ticker,
      restrictions: [{ count }],
      type: TransferRestrictionType.Count,
    };
  });

  let addBatchTransactionStub: sinon.SinonStub;

  let addTransferManagerTransaction: PolymeshTx<[Ticker, TransferManager]>;
  let addExemptedEntitiesTransaction: PolymeshTx<[Ticker, TransferManager, ScopeId[]]>;
  let removeTransferManagerTransaction: PolymeshTx<[Ticker, TransferManager]>;
  let removeExemptedEntitiesTransaction: PolymeshTx<[Ticker, TransferManager, ScopeId[]]>;

  beforeEach(() => {
    dsMockUtils.setConstMock('statistics', 'maxTransferManagersPerAsset', {
      returnValue: dsMockUtils.createMockU32(3),
    });

    addBatchTransactionStub = procedureMockUtils.getAddBatchTransactionStub();

    entityMockUtils.getTickerReservationDetailsStub().resolves({
      owner: entityMockUtils.getIdentityInstance(),
      expiryDate: null,
      status: TickerReservationStatus.Free,
    });

    addTransferManagerTransaction = dsMockUtils.createTxStub('statistics', 'addTransferManager');
    addExemptedEntitiesTransaction = dsMockUtils.createTxStub('statistics', 'addExemptedEntities');
    removeTransferManagerTransaction = dsMockUtils.createTxStub(
      'statistics',
      'removeTransferManager'
    );
    removeExemptedEntitiesTransaction = dsMockUtils.createTxStub(
      'statistics',
      'removeExemptedEntities'
    );

    mockContext = dsMockUtils.getContextInstance();

    rawTicker = dsMockUtils.createMockTicker(ticker);
    rawCount = dsMockUtils.createMockU64(count.toNumber());
    rawPercentage = dsMockUtils.createMockPermill(percentage.toNumber() * 10000);
    rawCountTm = dsMockUtils.createMockTransferManager({ CountTransferManager: rawCount });
    rawPercentageTm = dsMockUtils.createMockTransferManager({
      PercentageTransferManager: rawPercentage,
    });
    rawScopeId = dsMockUtils.createMockScopeId(scopeId);

    transferRestrictionToTransferManagerStub.withArgs(countTm, mockContext).returns(rawCountTm);
    transferRestrictionToTransferManagerStub
      .withArgs(percentageTm, mockContext)
      .returns(rawPercentageTm);
    stringToTickerStub.withArgs(ticker, mockContext).returns(rawTicker);
    stringToScopeIdStub.withArgs(scopeId, mockContext).returns(rawScopeId);
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

  test('should add a batch of add transfer manager transactions to the queue', async () => {
    const proc = procedureMockUtils.getInstance<SetTransferRestrictionsParams, number, Storage>(
      mockContext,
      {
        restrictionsToRemove: [],
        restrictionsToAdd: [[rawTicker, rawCountTm]],
        exemptionsToAdd: [],
        exemptionsToRemove: [],
        occupiedSlots: 0,
        exemptionsRepeated: false,
      }
    );

    const result = await prepareSetTransferRestrictions.call(proc, args);

    sinon.assert.calledWith(addBatchTransactionStub, addTransferManagerTransaction, {}, [
      [rawTicker, rawCountTm],
    ]);

    expect(result).toEqual(1);
  });

  test('should add a batch of remove transfer manager transactions to the queue', async () => {
    args = {
      type: TransferRestrictionType.Count,
      restrictions: [],
      ticker,
    };

    const proc = procedureMockUtils.getInstance<SetTransferRestrictionsParams, number, Storage>(
      mockContext,
      {
        restrictionsToRemove: [[rawTicker, rawCountTm]],
        restrictionsToAdd: [],
        exemptionsToAdd: [],
        exemptionsToRemove: [],
        occupiedSlots: 0,
        exemptionsRepeated: false,
      }
    );

    const result = await prepareSetTransferRestrictions.call(proc, args);

    sinon.assert.calledWith(addBatchTransactionStub, removeTransferManagerTransaction, {}, [
      [rawTicker, rawCountTm],
    ]);

    expect(result).toEqual(0);
  });

  test('should add a batch of add exempted entities transaction to the queue', async () => {
    const proc = procedureMockUtils.getInstance<SetTransferRestrictionsParams, number, Storage>(
      mockContext,
      {
        restrictionsToRemove: [],
        restrictionsToAdd: [],
        exemptionsToAdd: [[rawTicker, rawCountTm, [rawScopeId]]],
        exemptionsToRemove: [],
        occupiedSlots: 0,
        exemptionsRepeated: false,
      }
    );

    const result = await prepareSetTransferRestrictions.call(proc, args);

    sinon.assert.calledWith(addBatchTransactionStub, addExemptedEntitiesTransaction, {}, [
      [rawTicker, rawCountTm, [rawScopeId]],
    ]);

    expect(result).toEqual(0);
  });

  test('should add a batch of remove exempted entities transaction to the queue', async () => {
    const proc = procedureMockUtils.getInstance<SetTransferRestrictionsParams, number, Storage>(
      mockContext,
      {
        restrictionsToRemove: [],
        restrictionsToAdd: [],
        exemptionsToAdd: [],
        exemptionsToRemove: [[rawTicker, rawCountTm, [rawScopeId]]],
        occupiedSlots: 0,
        exemptionsRepeated: false,
      }
    );

    const result = await prepareSetTransferRestrictions.call(proc, args);

    sinon.assert.calledWith(addBatchTransactionStub, removeExemptedEntitiesTransaction, {}, [
      [rawTicker, rawCountTm, [rawScopeId]],
    ]);

    expect(result).toEqual(0);
  });

  test('should throw an error if attempting to add restrictions that already exist', async () => {
    const proc = procedureMockUtils.getInstance<SetTransferRestrictionsParams, number, Storage>(
      mockContext,
      {
        restrictionsToRemove: [],
        restrictionsToAdd: [],
        exemptionsToAdd: [],
        exemptionsToRemove: [],
        occupiedSlots: 0,
        exemptionsRepeated: false,
      }
    );

    let err;

    try {
      await prepareSetTransferRestrictions.call(proc, {
        ticker,
        restrictions: [{ count }],
        type: TransferRestrictionType.Count,
      });
    } catch (error) {
      err = error;
    }

    expect(err.message).toBe('The supplied restrictions are already in place');
  });

  test('should throw an error if attempting to remove an empty restriction list', async () => {
    const proc = procedureMockUtils.getInstance<SetTransferRestrictionsParams, number, Storage>(
      mockContext,
      {
        restrictionsToRemove: [],
        restrictionsToAdd: [],
        exemptionsToAdd: [],
        exemptionsToRemove: [],
        occupiedSlots: 0,
        exemptionsRepeated: false,
      }
    );

    let err;

    try {
      await prepareSetTransferRestrictions.call(proc, args);
    } catch (error) {
      err = error;
    }

    expect(err.message).toBe('There are no restrictions to remove');
  });

  test('should throw an error if attempting to add more restrictions than there are slots available', async () => {
    const proc = procedureMockUtils.getInstance<SetTransferRestrictionsParams, number, Storage>(
      mockContext,
      {
        restrictionsToRemove: [],
        restrictionsToAdd: [[rawTicker, rawCountTm]],
        exemptionsToAdd: [],
        exemptionsToRemove: [],
        occupiedSlots: 3,
        exemptionsRepeated: false,
      }
    );

    let err;

    try {
      await prepareSetTransferRestrictions.call(proc, args);
    } catch (error) {
      err = error;
    }

    expect(err.message).toBe(
      'Cannot set more Transfer Restrictions than there are slots available'
    );
    expect(err.data).toEqual({ availableSlots: 0 });
  });

  test('should throw an error if exempted scope IDs are repeated for a restriction', async () => {
    const proc = procedureMockUtils.getInstance<SetTransferRestrictionsParams, number, Storage>(
      mockContext,
      {
        restrictionsToRemove: [],
        restrictionsToAdd: [],
        exemptionsToAdd: [],
        exemptionsToRemove: [],
        occupiedSlots: 0,
        exemptionsRepeated: true,
      }
    );

    let err;

    try {
      await prepareSetTransferRestrictions.call(proc, args);
    } catch (error) {
      err = error;
    }

    expect(err.message).toBe(
      'One or more restrictions have repeated exempted Scope IDs/Identities'
    );
  });

  describe('getAuthorization', () => {
    test('should return the appropriate roles and permissions', () => {
      let proc = procedureMockUtils.getInstance<SetTransferRestrictionsParams, number, Storage>(
        mockContext,
        {
          restrictionsToRemove: [],
          restrictionsToAdd: [[rawTicker, rawCountTm]],
          exemptionsToAdd: [],
          exemptionsToRemove: [],
          occupiedSlots: 0,
          exemptionsRepeated: false,
        }
      );

      let boundFunc = getAuthorization.bind(proc);

      expect(boundFunc(args)).toEqual({
        permissions: {
          assets: [entityMockUtils.getMockAssetInstance({ ticker })],
          transactions: [TxTags.statistics.AddTransferManager],
          portfolios: [],
        },
      });

      proc = procedureMockUtils.getInstance<SetTransferRestrictionsParams, number, Storage>(
        mockContext,
        {
          restrictionsToRemove: [],
          restrictionsToAdd: [],
          exemptionsToAdd: [[rawTicker, rawCountTm, [rawScopeId]]],
          exemptionsToRemove: [],
          occupiedSlots: 0,
          exemptionsRepeated: false,
        }
      );

      boundFunc = getAuthorization.bind(proc);

      expect(boundFunc(args)).toEqual({
        permissions: {
          assets: [entityMockUtils.getMockAssetInstance({ ticker })],
          transactions: [TxTags.statistics.AddExemptedEntities],
          portfolios: [],
        },
      });

      proc = procedureMockUtils.getInstance<SetTransferRestrictionsParams, number, Storage>(
        mockContext,
        {
          restrictionsToRemove: [[rawTicker, rawCountTm]],
          restrictionsToAdd: [],
          exemptionsToAdd: [],
          exemptionsToRemove: [],
          occupiedSlots: 0,
          exemptionsRepeated: false,
        }
      );

      boundFunc = getAuthorization.bind(proc);

      expect(boundFunc(args)).toEqual({
        permissions: {
          assets: [entityMockUtils.getMockAssetInstance({ ticker })],
          transactions: [TxTags.statistics.RemoveTransferManager],
          portfolios: [],
        },
      });

      proc = procedureMockUtils.getInstance<SetTransferRestrictionsParams, number, Storage>(
        mockContext,
        {
          restrictionsToRemove: [],
          restrictionsToAdd: [],
          exemptionsToAdd: [],
          exemptionsToRemove: [[rawTicker, rawCountTm, [rawScopeId]]],
          occupiedSlots: 0,
          exemptionsRepeated: false,
        }
      );

      boundFunc = getAuthorization.bind(proc);

      expect(boundFunc(args)).toEqual({
        permissions: {
          assets: [entityMockUtils.getMockAssetInstance({ ticker })],
          transactions: [TxTags.statistics.RemoveExemptedEntities],
          portfolios: [],
        },
      });
    });
  });

  describe('prepareStorage', () => {
    let did: string;
    let identityScopeId: string;

    let rawIdentityScopeId: ScopeId;

    beforeAll(() => {
      did = 'someDid';
      identityScopeId = 'someScopeId';

      rawIdentityScopeId = dsMockUtils.createMockScopeId(identityScopeId);
    });

    beforeEach(() => {
      stringToScopeIdStub.withArgs(identityScopeId, mockContext).returns(rawIdentityScopeId);
    });

    afterAll(() => {
      sinon.restore();
    });

    test('should fetch, process and return shared data', async () => {
      entityMockUtils.configureMocks({
        identityOptions: {
          getScopeId: identityScopeId,
        },
      });

      const getCountStub = entityMockUtils.getAssetTransferRestrictionsCountGetStub({
        restrictions: [],
        availableSlots: 1,
      });
      const getPercentageStub = entityMockUtils.getAssetTransferRestrictionsPercentageGetStub({
        restrictions: [{ percentage }],
        availableSlots: 1,
      });

      const proc = procedureMockUtils.getInstance<SetTransferRestrictionsParams, number, Storage>(
        mockContext
      );
      const boundFunc = prepareStorage.bind(proc);

      args = {
        ticker,
        type: TransferRestrictionType.Count,
        restrictions: [
          {
            count,
          },
        ],
      };

      let result = await boundFunc(args);

      expect(result).toEqual({
        restrictionsToAdd: [[rawTicker, rawCountTm]],
        restrictionsToRemove: [],
        exemptionsToAdd: [],
        exemptionsToRemove: [],
        occupiedSlots: 1,
        exemptionsRepeated: false,
      });

      args.restrictions = [];

      getCountStub.resolves({ restrictions: [{ count }], avaliableSlots: 1 });

      result = await boundFunc(args);

      expect(result).toEqual({
        restrictionsToAdd: [],
        restrictionsToRemove: [[rawTicker, rawCountTm]],
        exemptionsToAdd: [],
        exemptionsToRemove: [],
        occupiedSlots: 1,
        exemptionsRepeated: false,
      });

      getCountStub.resolves({
        restrictions: [{ count, exemptedScopeIds: [scopeId] }],
        avaliableSlots: 1,
      });

      result = await boundFunc(args);

      expect(result).toEqual({
        restrictionsToAdd: [],
        restrictionsToRemove: [[rawTicker, rawCountTm]],
        exemptionsToAdd: [],
        exemptionsToRemove: [[rawTicker, rawCountTm, [rawScopeId]]],
        occupiedSlots: 1,
        exemptionsRepeated: false,
      });

      getPercentageStub.resolves({
        restrictions: [{ percentage }],
        avaliableSlots: 1,
      });

      args = {
        restrictions: [
          {
            percentage,
            exemptedScopeIds: [scopeId],
          },
        ],
        ticker,
        type: TransferRestrictionType.Percentage,
      };

      result = await boundFunc(args);

      expect(result).toEqual({
        restrictionsToAdd: [],
        restrictionsToRemove: [],
        exemptionsToAdd: [[rawTicker, rawPercentageTm, [rawScopeId]]],
        exemptionsToRemove: [],
        occupiedSlots: 1,
        exemptionsRepeated: false,
      });

      getPercentageStub.resolves({
        restrictions: [],
        avaliableSlots: 1,
      });

      args = {
        restrictions: [
          {
            percentage,
            exemptedScopeIds: [scopeId],
          },
        ],
        ticker,
        type: TransferRestrictionType.Percentage,
      };

      result = await boundFunc(args);

      expect(result).toEqual({
        restrictionsToAdd: [[rawTicker, rawPercentageTm]],
        restrictionsToRemove: [],
        exemptionsToAdd: [[rawTicker, rawPercentageTm, [rawScopeId]]],
        exemptionsToRemove: [],
        occupiedSlots: 1,
        exemptionsRepeated: false,
      });

      getPercentageStub.resolves({
        restrictions: [{ percentage, exemptedScopeIds: [scopeId] }],
        avaliableSlots: 1,
      });

      args = {
        restrictions: [
          {
            percentage,
          },
        ],
        ticker,
        type: TransferRestrictionType.Percentage,
      };

      result = await boundFunc(args);

      expect(result).toEqual({
        restrictionsToAdd: [],
        restrictionsToRemove: [],
        exemptionsToAdd: [],
        exemptionsToRemove: [[rawTicker, rawPercentageTm, [rawScopeId]]],
        occupiedSlots: 1,
        exemptionsRepeated: false,
      });

      getPercentageStub.resolves({
        restrictions: [{ percentage, exemptedScopeIds: [] }],
        avaliableSlots: 1,
      });

      args = {
        restrictions: [
          {
            percentage,
            exemptedScopeIds: [scopeId],
          },
        ],
        ticker,
        type: TransferRestrictionType.Percentage,
      };

      result = await boundFunc(args);

      expect(result).toEqual({
        restrictionsToAdd: [],
        restrictionsToRemove: [],
        exemptionsToAdd: [[rawTicker, rawPercentageTm, [rawScopeId]]],
        exemptionsToRemove: [],
        occupiedSlots: 1,
        exemptionsRepeated: false,
      });

      args = {
        restrictions: [
          {
            percentage,
            exemptedScopeIds: [scopeId],
            exemptedIdentities: [did],
          },
        ],
        ticker,
        type: TransferRestrictionType.Percentage,
      };

      result = await boundFunc(args);

      expect(result).toEqual({
        restrictionsToAdd: [],
        restrictionsToRemove: [],
        exemptionsToAdd: [[rawTicker, rawPercentageTm, [rawScopeId, rawIdentityScopeId]]],
        exemptionsToRemove: [],
        occupiedSlots: 1,
        exemptionsRepeated: false,
      });

      args = {
        restrictions: [
          {
            percentage,
            exemptedScopeIds: [scopeId, scopeId],
            exemptedIdentities: [entityMockUtils.getIdentityInstance()],
          },
        ],
        ticker,
        type: TransferRestrictionType.Percentage,
      };

      result = await boundFunc(args);

      expect(result).toEqual({
        restrictionsToAdd: [],
        restrictionsToRemove: [],
        exemptionsToAdd: [
          [rawTicker, rawPercentageTm, [rawScopeId, rawScopeId, rawIdentityScopeId]],
        ],
        exemptionsToRemove: [],
        occupiedSlots: 1,
        exemptionsRepeated: true,
      });
    });
  });
});
