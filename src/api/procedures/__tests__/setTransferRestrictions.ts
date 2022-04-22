import { u64 } from '@polkadot/types';
import { Permill } from '@polkadot/types/interfaces';
import BigNumber from 'bignumber.js';
import { ScopeId, Ticker, TransferCondition } from 'polymesh-types/types';
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
import { TransferRestriction, TransferRestrictionType, TxTags } from '~/types';
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
    TransferCondition
  >;
  let stringToTickerStub: sinon.SinonStub<[string, Context], Ticker>;
  let stringToScopeIdStub: sinon.SinonStub<[string, Context], ScopeId>;
  let ticker: string;
  let count: BigNumber;
  let percentage: BigNumber;
  let countTm: TransferRestriction;
  let percentageTm: TransferRestriction;
  let exemptedDid: string;
  let rawTicker: Ticker;
  let rawCount: u64;
  let rawPercentage: Permill;
  let rawCountTm: TransferCondition;
  let rawPercentageTm: TransferCondition;
  let rawScopeId: ScopeId;
  let args: SetTransferRestrictionsParams;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    transferRestrictionToTransferManagerStub = sinon.stub(
      utilsConversionModule,
      'transferRestrictionToTransferCondition'
    );
    stringToTickerStub = sinon.stub(utilsConversionModule, 'stringToTicker');
    stringToScopeIdStub = sinon.stub(utilsConversionModule, 'stringToScopeId');
    ticker = 'someTicker';
    count = new BigNumber(10);
    percentage = new BigNumber(49);
    countTm = { type: TransferRestrictionType.Count, value: count };
    percentageTm = { type: TransferRestrictionType.Percentage, value: percentage };
    exemptedDid = 'exemptedDid';
    args = {
      ticker,
      restrictions: [{ count }],
      type: TransferRestrictionType.Count,
    };
  });

  let addBatchTransactionStub: sinon.SinonStub;

  let addTransferManagerTransaction: PolymeshTx<[Ticker, TransferCondition]>;
  let addExemptedEntitiesTransaction: PolymeshTx<[Ticker, TransferCondition, ScopeId[]]>;
  let removeTransferManagerTransaction: PolymeshTx<[Ticker, TransferCondition]>;
  let removeExemptedEntitiesTransaction: PolymeshTx<[Ticker, TransferCondition, ScopeId[]]>;

  beforeEach(() => {
    dsMockUtils.setConstMock('statistics', 'maxTransferConditionsPerAsset', {
      returnValue: dsMockUtils.createMockU32(new BigNumber(3)),
    });

    addBatchTransactionStub = procedureMockUtils.getAddBatchTransactionStub();

    addTransferManagerTransaction = dsMockUtils.createTxStub(
      'statistics',
      'setAssetTransferCompliance'
    );
    addExemptedEntitiesTransaction = dsMockUtils.createTxStub('statistics', 'setEntitiesExempt');
    removeTransferManagerTransaction = dsMockUtils.createTxStub('statistics', 'setEntitiesExempt');
    removeExemptedEntitiesTransaction = dsMockUtils.createTxStub('statistics', 'setEntitiesExempt');

    mockContext = dsMockUtils.getContextInstance();

    rawTicker = dsMockUtils.createMockTicker(ticker);
    rawCount = dsMockUtils.createMockU64(count);
    rawPercentage = dsMockUtils.createMockPermill(percentage.multipliedBy(10000));
    rawCountTm = dsMockUtils.createMockTransferCondition({ CountTransferManager: rawCount });
    rawPercentageTm = dsMockUtils.createMockTransferCondition({
      PercentageTransferManager: rawPercentage,
    });
    rawScopeId = dsMockUtils.createMockScopeId(exemptedDid);

    transferRestrictionToTransferManagerStub.withArgs(countTm, mockContext).returns(rawCountTm);
    transferRestrictionToTransferManagerStub
      .withArgs(percentageTm, mockContext)
      .returns(rawPercentageTm);
    stringToTickerStub.withArgs(ticker, mockContext).returns(rawTicker);
    stringToScopeIdStub.withArgs(exemptedDid, mockContext).returns(rawScopeId);
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

  it('should add a batch of add transfer manager transactions to the queue', async () => {
    const proc = procedureMockUtils.getInstance<SetTransferRestrictionsParams, BigNumber, Storage>(
      mockContext,
      {
        restrictionsToRemove: [],
        restrictionsToAdd: [[rawTicker, rawCountTm]],
        exemptionsToAdd: [],
        exemptionsToRemove: [],
        occupiedSlots: new BigNumber(0),
      }
    );

    const result = await prepareSetTransferRestrictions.call(proc, args);

    sinon.assert.calledWith(addBatchTransactionStub, {
      transactions: [
        {
          transaction: addTransferManagerTransaction,
          args: [rawTicker, rawCountTm],
        },
      ],
    });

    expect(result).toEqual(new BigNumber(1));
  });

  it('should add a batch of remove transfer manager transactions to the queue', async () => {
    args = {
      type: TransferRestrictionType.Count,
      restrictions: [],
      ticker,
    };

    const proc = procedureMockUtils.getInstance<SetTransferRestrictionsParams, BigNumber, Storage>(
      mockContext,
      {
        restrictionsToRemove: [[rawTicker, rawCountTm]],
        restrictionsToAdd: [],
        exemptionsToAdd: [],
        exemptionsToRemove: [],
        occupiedSlots: new BigNumber(0),
      }
    );

    const result = await prepareSetTransferRestrictions.call(proc, args);

    sinon.assert.calledWith(addBatchTransactionStub, {
      transactions: [
        {
          transaction: removeTransferManagerTransaction,
          args: [rawTicker, rawCountTm],
        },
      ],
    });

    expect(result).toEqual(new BigNumber(0));
  });

  it('should add a batch of add exempted entities transaction to the queue', async () => {
    const proc = procedureMockUtils.getInstance<SetTransferRestrictionsParams, BigNumber, Storage>(
      mockContext,
      {
        restrictionsToRemove: [],
        restrictionsToAdd: [],
        exemptionsToAdd: [[rawTicker, rawCountTm, [rawScopeId]]],
        exemptionsToRemove: [],
        occupiedSlots: new BigNumber(0),
      }
    );

    const result = await prepareSetTransferRestrictions.call(proc, args);

    sinon.assert.calledWith(addBatchTransactionStub, {
      transactions: [
        {
          transaction: addExemptedEntitiesTransaction,
          args: [rawTicker, rawCountTm, [rawScopeId]],
        },
      ],
    });

    expect(result).toEqual(new BigNumber(0));
  });

  it('should add a batch of remove exempted entities transaction to the queue', async () => {
    const proc = procedureMockUtils.getInstance<SetTransferRestrictionsParams, BigNumber, Storage>(
      mockContext,
      {
        restrictionsToRemove: [],
        restrictionsToAdd: [],
        exemptionsToAdd: [],
        exemptionsToRemove: [[rawTicker, rawCountTm, [rawScopeId]]],
        occupiedSlots: new BigNumber(0),
      }
    );

    const result = await prepareSetTransferRestrictions.call(proc, args);

    sinon.assert.calledWith(addBatchTransactionStub, {
      transactions: [
        {
          transaction: removeExemptedEntitiesTransaction,
          args: [rawTicker, rawCountTm, [rawScopeId]],
        },
      ],
    });

    expect(result).toEqual(new BigNumber(0));
  });

  it('should throw an error if attempting to add restrictions that already exist', async () => {
    const proc = procedureMockUtils.getInstance<SetTransferRestrictionsParams, BigNumber, Storage>(
      mockContext,
      {
        restrictionsToRemove: [],
        restrictionsToAdd: [],
        exemptionsToAdd: [],
        exemptionsToRemove: [],
        occupiedSlots: new BigNumber(0),
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

  it('should throw an error if attempting to remove an empty restriction list', async () => {
    const proc = procedureMockUtils.getInstance<SetTransferRestrictionsParams, BigNumber, Storage>(
      mockContext,
      {
        restrictionsToRemove: [],
        restrictionsToAdd: [],
        exemptionsToAdd: [],
        exemptionsToRemove: [],
        occupiedSlots: new BigNumber(0),
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

  it('should throw an error if attempting to add more restrictions than there are slots available', async () => {
    const proc = procedureMockUtils.getInstance<SetTransferRestrictionsParams, BigNumber, Storage>(
      mockContext,
      {
        restrictionsToRemove: [],
        restrictionsToAdd: [[rawTicker, rawCountTm]],
        exemptionsToAdd: [],
        exemptionsToRemove: [],
        occupiedSlots: new BigNumber(3),
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
    expect(err.data).toEqual({ availableSlots: new BigNumber(0) });
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      let proc = procedureMockUtils.getInstance<SetTransferRestrictionsParams, BigNumber, Storage>(
        mockContext,
        {
          restrictionsToRemove: [],
          restrictionsToAdd: [[rawTicker, rawCountTm]],
          exemptionsToAdd: [],
          exemptionsToRemove: [],
          occupiedSlots: new BigNumber(0),
        }
      );

      let boundFunc = getAuthorization.bind(proc);

      expect(boundFunc(args)).toEqual({
        permissions: {
          assets: [expect.objectContaining({ ticker })],
          transactions: [TxTags.statistics.AddTransferManager],
          portfolios: [],
        },
      });

      proc = procedureMockUtils.getInstance<SetTransferRestrictionsParams, BigNumber, Storage>(
        mockContext,
        {
          restrictionsToRemove: [],
          restrictionsToAdd: [],
          exemptionsToAdd: [[rawTicker, rawCountTm, [rawScopeId]]],
          exemptionsToRemove: [],
          occupiedSlots: new BigNumber(0),
        }
      );

      boundFunc = getAuthorization.bind(proc);

      expect(boundFunc(args)).toEqual({
        permissions: {
          assets: [expect.objectContaining({ ticker })],
          transactions: [TxTags.statistics.AddExemptedEntities],
          portfolios: [],
        },
      });

      proc = procedureMockUtils.getInstance<SetTransferRestrictionsParams, BigNumber, Storage>(
        mockContext,
        {
          restrictionsToRemove: [[rawTicker, rawCountTm]],
          restrictionsToAdd: [],
          exemptionsToAdd: [],
          exemptionsToRemove: [],
          occupiedSlots: new BigNumber(0),
        }
      );

      boundFunc = getAuthorization.bind(proc);

      expect(boundFunc(args)).toEqual({
        permissions: {
          assets: [expect.objectContaining({ ticker })],
          transactions: [TxTags.statistics.RemoveTransferManager],
          portfolios: [],
        },
      });

      proc = procedureMockUtils.getInstance<SetTransferRestrictionsParams, BigNumber, Storage>(
        mockContext,
        {
          restrictionsToRemove: [],
          restrictionsToAdd: [],
          exemptionsToAdd: [],
          exemptionsToRemove: [[rawTicker, rawCountTm, [rawScopeId]]],
          occupiedSlots: new BigNumber(0),
        }
      );

      boundFunc = getAuthorization.bind(proc);

      expect(boundFunc(args)).toEqual({
        permissions: {
          assets: [expect.objectContaining({ ticker })],
          transactions: [TxTags.statistics.RemoveExemptedEntities],
          portfolios: [],
        },
      });
    });
  });

  describe('prepareStorage', () => {
    let identityScopeId: string;

    let rawIdentityScopeId: ScopeId;

    beforeAll(() => {
      identityScopeId = 'someScopeId';

      rawIdentityScopeId = dsMockUtils.createMockScopeId(identityScopeId);
    });

    beforeEach(() => {
      stringToScopeIdStub.withArgs(identityScopeId, mockContext).returns(rawIdentityScopeId);
    });

    afterAll(() => {
      sinon.restore();
    });

    it('should fetch, process and return shared data', async () => {
      const getCountStub = sinon.stub();
      getCountStub.resolves({
        restrictions: [],
        availableSlots: new BigNumber(1),
      });
      const getPercentageStub = sinon.stub();
      getPercentageStub.resolves({
        restrictions: [{ percentage }],
        availableSlots: new BigNumber(1),
      });

      entityMockUtils.configureMocks({
        identityOptions: {
          getScopeId: identityScopeId,
        },
        assetOptions: {
          transferRestrictionsCountGet: getCountStub,
          transferRestrictionsPercentageGet: getPercentageStub,
        },
      });

      const proc = procedureMockUtils.getInstance<
        SetTransferRestrictionsParams,
        BigNumber,
        Storage
      >(mockContext);
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
        occupiedSlots: new BigNumber(1),
      });

      args.restrictions = [];

      getCountStub.resolves({ restrictions: [{ count }], availableSlots: 1 });

      result = await boundFunc(args);

      expect(result).toEqual({
        restrictionsToAdd: [],
        restrictionsToRemove: [[rawTicker, rawCountTm]],
        exemptionsToAdd: [],
        exemptionsToRemove: [],
        occupiedSlots: new BigNumber(1),
      });

      getCountStub.resolves({
        restrictions: [{ count, exemptedIds: [exemptedDid] }],
        availableSlots: 1,
      });

      result = await boundFunc(args);

      expect(result).toEqual({
        restrictionsToAdd: [],
        restrictionsToRemove: [[rawTicker, rawCountTm]],
        exemptionsToAdd: [],
        exemptionsToRemove: [[rawTicker, rawCountTm, [rawScopeId]]],
        occupiedSlots: new BigNumber(1),
      });

      getPercentageStub.resolves({
        restrictions: [{ percentage }],
        availableSlots: 1,
      });

      args = {
        restrictions: [
          {
            percentage,
            exemptedIdentities: [exemptedDid],
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
        occupiedSlots: new BigNumber(1),
      });

      getPercentageStub.resolves({
        restrictions: [],
        availableSlots: 1,
      });

      args = {
        restrictions: [
          {
            percentage,
            exemptedIdentities: [exemptedDid],
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
        occupiedSlots: new BigNumber(1),
      });

      getPercentageStub.resolves({
        restrictions: [{ percentage, exemptedIds: [exemptedDid] }],
        availableSlots: 1,
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
        occupiedSlots: new BigNumber(1),
      });

      getPercentageStub.resolves({
        restrictions: [{ percentage, exemptedIds: [] }],
        availableSlots: 1,
      });

      args = {
        restrictions: [
          {
            percentage,
            exemptedIdentities: [exemptedDid],
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
        occupiedSlots: new BigNumber(1),
      });
    });

    it('should throw an error if exempted entities are repeated', () => {
      const proc = procedureMockUtils.getInstance<
        SetTransferRestrictionsParams,
        BigNumber,
        Storage
      >(mockContext);

      const boundFunc = prepareStorage.bind(proc);
      args = {
        type: TransferRestrictionType.Count,
        restrictions: [{ count, exemptedIdentities: [exemptedDid, exemptedDid] }],
        ticker,
      };

      return expect(boundFunc(args)).rejects.toThrow(
        'One or more of the passed exempted Identities are repeated or have the same Scope ID'
      );
    });
  });
});
