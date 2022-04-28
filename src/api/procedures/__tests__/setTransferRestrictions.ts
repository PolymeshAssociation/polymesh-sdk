import { u64 } from '@polkadot/types';
import { Permill } from '@polkadot/types/interfaces';
import { BTreeSetStatType } from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import { ScopeId, Ticker, TransferCondition, TxTags } from 'polymesh-types/types';
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
import { TransferRestriction, TransferRestrictionType } from '~/types';
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
  let rawCountRestriction: TransferCondition;
  let rawPercentageRestriction: TransferCondition;
  let rawScopeId: ScopeId;
  let args: SetTransferRestrictionsParams;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    transferRestrictionToTransferManagerStub = sinon.stub(
      utilsConversionModule,
      'transferRestrictionToPolymeshTransferCondition'
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

  let addTransactionStub: sinon.SinonStub;

  let setTransferRestrictionsTransaction: PolymeshTx<[Ticker, TransferCondition]>;

  beforeEach(() => {
    dsMockUtils.setConstMock('statistics', 'maxTransferConditionsPerAsset', {
      returnValue: dsMockUtils.createMockU32(new BigNumber(3)),
    });

    addTransactionStub = procedureMockUtils.getAddTransactionStub();

    setTransferRestrictionsTransaction = dsMockUtils.createTxStub(
      'statistics',
      'setAssetTransferCompliance'
    );
    dsMockUtils.createTxStub('statistics', 'setEntitiesExempt');

    mockContext = dsMockUtils.getContextInstance();

    rawTicker = dsMockUtils.createMockTicker(ticker);
    rawCount = dsMockUtils.createMockU64(count);
    rawPercentage = dsMockUtils.createMockPermill(percentage.multipliedBy(10000));
    rawCountRestriction = dsMockUtils.createMockTransferCondition({ MaxInvestorCount: rawCount });
    rawPercentageRestriction = dsMockUtils.createMockTransferCondition({
      MaxInvestorOwnership: rawPercentage,
    });
    rawScopeId = dsMockUtils.createMockScopeId(exemptedDid);

    transferRestrictionToTransferManagerStub
      .withArgs(countTm, mockContext)
      .returns(rawCountRestriction);
    transferRestrictionToTransferManagerStub
      .withArgs(percentageTm, mockContext)
      .returns(rawPercentageRestriction);
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

  it('should add a setTransferRestrictions transaction to the queue', async () => {
    const proc = procedureMockUtils.getInstance<SetTransferRestrictionsParams, BigNumber, Storage>(
      mockContext,
      {
        currentRestrictions: [],
        occupiedSlots: new BigNumber(0),
        needStat: false,
        currentStats: [] as unknown as BTreeSetStatType,
      }
    );

    const result = await prepareSetTransferRestrictions.call(proc, args);

    sinon.assert.calledWith(addTransactionStub, {
      transaction: setTransferRestrictionsTransaction,
      args: [{ Ticker: rawTicker }, [rawCountRestriction]],
    });

    expect(result).toEqual(new BigNumber(1));
  });

  it('should remove restrictions by adding a setTransferRestriction transaction to the queue', async () => {
    args = {
      type: TransferRestrictionType.Count,
      restrictions: [],
      ticker,
    };

    const proc = procedureMockUtils.getInstance<SetTransferRestrictionsParams, BigNumber, Storage>(
      mockContext,
      {
        currentRestrictions: [rawCountRestriction],
        occupiedSlots: new BigNumber(0),
        needStat: false,
        currentStats: [] as unknown as BTreeSetStatType,
      }
    );

    const result = await prepareSetTransferRestrictions.call(proc, args);

    sinon.assert.calledWith(addTransactionStub, {
      transaction: setTransferRestrictionsTransaction,
      args: [{ Ticker: rawTicker }, []],
    });

    expect(result).toEqual(new BigNumber(0));
  });

  it('should throw an error if attempting to add restrictions that already exist', async () => {
    const proc = procedureMockUtils.getInstance<SetTransferRestrictionsParams, BigNumber, Storage>(
      mockContext,
      {
        currentRestrictions: [rawCountRestriction],
        occupiedSlots: new BigNumber(0),
        needStat: false,
        currentStats: [] as unknown as BTreeSetStatType,
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
    args = {
      ticker,
      restrictions: [],
      type: TransferRestrictionType.Count,
    };

    const proc = procedureMockUtils.getInstance<SetTransferRestrictionsParams, BigNumber, Storage>(
      mockContext,
      {
        currentRestrictions: [],
        occupiedSlots: new BigNumber(0),
        needStat: false,
        currentStats: [] as unknown as BTreeSetStatType,
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
    args = {
      ticker,
      restrictions: [{ count }, { count: new BigNumber(2) }],
      type: TransferRestrictionType.Count,
    };

    const proc = procedureMockUtils.getInstance<SetTransferRestrictionsParams, BigNumber, Storage>(
      mockContext,
      {
        currentRestrictions: [rawCountRestriction],
        occupiedSlots: new BigNumber(3),
        needStat: false,
        currentStats: [] as unknown as BTreeSetStatType,
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
          currentRestrictions: [],
          occupiedSlots: new BigNumber(0),
          needStat: false,
          currentStats: [] as unknown as BTreeSetStatType,
        }
      );

      let boundFunc = getAuthorization.bind(proc);

      expect(boundFunc(args)).toEqual({
        permissions: {
          assets: [expect.objectContaining({ ticker })],
          transactions: [TxTags.statistics.SetAssetTransferCompliance],
          portfolios: [],
        },
      });

      proc = procedureMockUtils.getInstance<SetTransferRestrictionsParams, BigNumber, Storage>(
        mockContext,
        {
          currentRestrictions: [],
          occupiedSlots: new BigNumber(0),
          needStat: true,
          currentStats: [] as unknown as BTreeSetStatType,
        }
      );

      boundFunc = getAuthorization.bind(proc);

      expect(boundFunc(args)).toEqual({
        permissions: {
          assets: [expect.objectContaining({ ticker })],
          transactions: [
            TxTags.statistics.SetAssetTransferCompliance,
            TxTags.statistics.SetActiveAssetStats,
            // TxTags.statistics.SetEntitiesExempt,
          ],
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

      dsMockUtils.createQueryStub('statistics', 'activeAssetStats', {
        returnValue: [],
      });

      let result = await boundFunc(args);

      expect(result).toEqual({
        currentRestrictions: [],
        occupiedSlots: new BigNumber(1),
        currentStats: [],
        needStat: true,
      });

      args.restrictions = [];

      getCountStub.resolves({ restrictions: [{ count }], availableSlots: 1 });

      result = await boundFunc(args);

      getCountStub.resolves({
        restrictions: [{ count, exemptedIds: [exemptedDid] }],
        availableSlots: 1,
      });
    });
  });
});
