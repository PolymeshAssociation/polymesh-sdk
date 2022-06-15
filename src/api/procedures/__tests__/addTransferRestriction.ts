import { u64, Vec } from '@polkadot/types';
import { Permill } from '@polkadot/types/interfaces';
import {
  BTreeSetIdentityId,
  PolymeshPrimitivesStatisticsStatOpType,
  PolymeshPrimitivesStatisticsStatType,
  PolymeshPrimitivesTicker,
  PolymeshPrimitivesTransferComplianceTransferCondition,
} from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import { ScopeId } from 'polymesh-types/types';
import sinon from 'sinon';

import {
  AddTransferRestrictionParams,
  getAuthorization,
  prepareAddTransferRestriction,
  prepareStorage,
  Storage,
} from '~/api/procedures/addTransferRestriction';
import { Context, PolymeshError } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { ErrorCode, TransferRestriction, TransferRestrictionType, TxTags } from '~/types';
import { PolymeshTx, StatisticsOpType, TickerKey } from '~/types/internal';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Asset',
  require('~/testUtils/mocks/entities').mockAssetModule('~/api/entities/Asset')
);
jest.mock(
  '~/api/entities/Identity',
  require('~/testUtils/mocks/entities').mockIdentityModule('~/api/entities/Identity')
);

describe('addTransferRestriction procedure', () => {
  let mockContext: Mocked<Context>;
  let transferRestrictionToTransferRestrictionStub: sinon.SinonStub<
    [TransferRestriction, Context],
    PolymeshPrimitivesTransferComplianceTransferCondition
  >;
  let stringToTickerKeyStub: sinon.SinonStub<[string, Context], TickerKey>;
  let statisticsOpTypeToStatOpType: sinon.SinonStub<
    [StatisticsOpType, Context],
    PolymeshPrimitivesStatisticsStatOpType
  >;
  let ticker: string;
  let count: BigNumber;
  let percentage: BigNumber;
  let countRestriction: TransferRestriction;
  let percentageRestriction: TransferRestriction;
  let rawTicker: PolymeshPrimitivesTicker;
  let rawCount: u64;
  let rawPercentage: Permill;
  let rawCountCondition: PolymeshPrimitivesTransferComplianceTransferCondition;
  let rawPercentageCondition: PolymeshPrimitivesTransferComplianceTransferCondition;
  let args: AddTransferRestrictionParams;
  let rawOp: PolymeshPrimitivesStatisticsStatOpType;
  let rawStatType: PolymeshPrimitivesStatisticsStatType;

  let addBatchTransactionStub: sinon.SinonStub;
  let setAssetTransferCompliance: PolymeshTx<
    [PolymeshPrimitivesTicker, PolymeshPrimitivesTransferComplianceTransferCondition]
  >;
  let addExemptedEntitiesTransaction: PolymeshTx<
    [PolymeshPrimitivesTicker, PolymeshPrimitivesTransferComplianceTransferCondition, ScopeId[]]
  >;

  const emptyStorage = {
    currentExemptions: [],
    currentRestrictions: [],
    currentStats: [] as unknown as Vec<PolymeshPrimitivesStatisticsStatType>,
  };

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();

    ticker = 'TICKER';
    count = new BigNumber(10);
    percentage = new BigNumber(49);
    countRestriction = { type: TransferRestrictionType.Count, value: count };
    percentageRestriction = { type: TransferRestrictionType.Percentage, value: percentage };
  });

  beforeEach(() => {
    addBatchTransactionStub = procedureMockUtils.getAddBatchTransactionStub();
    setAssetTransferCompliance = dsMockUtils.createTxStub(
      'statistics',
      'setAssetTransferCompliance'
    );
    addExemptedEntitiesTransaction = dsMockUtils.createTxStub('statistics', 'setEntitiesExempt');

    mockContext = dsMockUtils.getContextInstance();

    dsMockUtils.setConstMock('statistics', 'maxTransferConditionsPerAsset', {
      returnValue: dsMockUtils.createMockU32(new BigNumber(3)),
    });
    transferRestrictionToTransferRestrictionStub = sinon.stub(
      utilsConversionModule,
      'transferRestrictionToPolymeshTransferCondition'
    );
    stringToTickerKeyStub = sinon.stub(utilsConversionModule, 'stringToTickerKey');
    statisticsOpTypeToStatOpType = sinon.stub(
      utilsConversionModule,
      'statisticsOpTypeToStatOpType'
    );
    rawOp = dsMockUtils.createMockStatisticsOpType(StatisticsOpType.Count);
    rawStatType = dsMockUtils.createMockStatistics();
    rawTicker = dsMockUtils.createMockTicker(ticker);
    rawCount = dsMockUtils.createMockU64(count);
    rawPercentage = dsMockUtils.createMockPermill(percentage.multipliedBy(10000));
    rawCountCondition = dsMockUtils.createMockTransferCondition({ MaxInvestorCount: rawCount });
    rawPercentageCondition = dsMockUtils.createMockTransferCondition({
      MaxInvestorOwnership: rawPercentage,
    });

    transferRestrictionToTransferRestrictionStub
      .withArgs(countRestriction, mockContext)
      .returns(rawCountCondition);
    transferRestrictionToTransferRestrictionStub
      .withArgs(percentageRestriction, mockContext)
      .returns(rawPercentageCondition);
    stringToTickerKeyStub.withArgs(ticker, mockContext).returns({ Ticker: rawTicker });
  });

  afterEach(() => {
    entityMockUtils.reset();
    procedureMockUtils.reset();
    dsMockUtils.reset();
    sinon.restore();
  });

  afterAll(() => {
    procedureMockUtils.cleanup();
    dsMockUtils.cleanup();
  });

  it('should add an add asset transfer compliance transaction to the queue', async () => {
    args = {
      type: TransferRestrictionType.Count,
      exemptedIdentities: [],
      count,
      ticker,
    };
    const proc = procedureMockUtils.getInstance<AddTransferRestrictionParams, BigNumber, Storage>(
      mockContext,
      { ...emptyStorage }
    );

    let result = await prepareAddTransferRestriction.call(proc, args);

    sinon.assert.calledWith(addBatchTransactionStub.firstCall, {
      transactions: [
        {
          transaction: setAssetTransferCompliance,
          args: [{ Ticker: rawTicker }, [rawCountCondition]],
        },
      ],
    });

    expect(result).toEqual(new BigNumber(1));

    args = {
      type: TransferRestrictionType.Percentage,
      exemptedIdentities: [],
      percentage,
      ticker,
    };

    result = await prepareAddTransferRestriction.call(proc, args);

    sinon.assert.calledWith(addBatchTransactionStub.secondCall, {
      transactions: [
        {
          transaction: setAssetTransferCompliance,
          args: [{ Ticker: rawTicker }, [rawPercentageCondition]],
        },
      ],
    });

    expect(result).toEqual(new BigNumber(1));
  });

  it('should add an add exempted entities transaction to the queue', async () => {
    const did = 'someDid';
    const scopeId = 'someScopeId';
    const rawScopeId = dsMockUtils.createMockScopeId(scopeId);
    const identityScopeId = 'anotherScopeId';
    const rawIdentityScopeId = dsMockUtils.createMockScopeId(identityScopeId);
    entityMockUtils.configureMocks({
      identityOptions: { getScopeId: identityScopeId },
      assetOptions: { details: { requiresInvestorUniqueness: true } },
    });
    args = {
      type: TransferRestrictionType.Count,
      exemptedIdentities: [did],
      count,
      ticker,
    };
    const proc = procedureMockUtils.getInstance<AddTransferRestrictionParams, BigNumber, Storage>(
      mockContext,
      { ...emptyStorage }
    );

    const stringToScopeIdStub = sinon.stub(utilsConversionModule, 'stringToScopeId');

    stringToScopeIdStub.withArgs(scopeId, mockContext).returns(rawScopeId);
    stringToScopeIdStub.withArgs(identityScopeId, mockContext).returns(rawIdentityScopeId);
    statisticsOpTypeToStatOpType.withArgs(StatisticsOpType.Count, mockContext).returns(rawOp);

    sinon
      .stub(utilsConversionModule, 'scopeIdsToBtreeSetIdentityId')
      .returns([rawIdentityScopeId] as unknown as BTreeSetIdentityId);

    let result = await prepareAddTransferRestriction.call(proc, args);
    sinon.assert.calledWith(addBatchTransactionStub.firstCall, {
      transactions: [
        {
          transaction: addExemptedEntitiesTransaction,
          feeMultiplier: new BigNumber(1),
          args: [true, { asset: { Ticker: rawTicker }, op: rawOp }, [rawIdentityScopeId]],
        },
        {
          transaction: setAssetTransferCompliance,
          args: [{ Ticker: rawTicker }, [rawCountCondition]],
        },
      ],
    });

    expect(result).toEqual(new BigNumber(1));

    result = await prepareAddTransferRestriction.call(proc, {
      ...args,
      exemptedIdentities: [entityMockUtils.getIdentityInstance()],
    });

    sinon.assert.calledWith(addBatchTransactionStub.secondCall, {
      transactions: [
        {
          transaction: addExemptedEntitiesTransaction,
          feeMultiplier: new BigNumber(1),
          args: [true, { asset: { Ticker: rawTicker }, op: rawOp }, [rawIdentityScopeId]],
        },
        {
          transaction: setAssetTransferCompliance,
          args: [{ Ticker: rawTicker }, [rawCountCondition]],
        },
      ],
    });

    expect(result).toEqual(new BigNumber(1));
  });

  it('should throw an error if attempting to add a restriction that already exists', async () => {
    args = {
      type: TransferRestrictionType.Count,
      exemptedIdentities: [],
      count,
      ticker,
    };
    let proc = procedureMockUtils.getInstance<AddTransferRestrictionParams, BigNumber, Storage>(
      mockContext,
      {
        ...emptyStorage,
        currentRestrictions: [rawCountCondition],
      }
    );

    let err;

    try {
      await prepareAddTransferRestriction.call(proc, args);
    } catch (error) {
      err = error;
    }

    expect(err.message).toBe('Cannot add the same restriction more than once');

    args = {
      type: TransferRestrictionType.Percentage,
      exemptedIdentities: [],
      percentage,
      ticker,
    };

    proc = procedureMockUtils.getInstance<AddTransferRestrictionParams, BigNumber, Storage>(
      mockContext,
      {
        ...emptyStorage,
        currentRestrictions: [rawCountCondition, rawPercentageCondition],
      }
    );

    try {
      await prepareAddTransferRestriction.call(proc, args);
    } catch (error) {
      err = error;
    }

    expect(err.message).toBe('Cannot add the same restriction more than once');
  });

  it('should throw an error if attempting to add a restriction when the restriction limit has been reached', async () => {
    args = {
      type: TransferRestrictionType.Count,
      count,
      ticker,
    };
    const proc = procedureMockUtils.getInstance<AddTransferRestrictionParams, BigNumber, Storage>(
      mockContext,
      {
        ...emptyStorage,
        currentRestrictions: [
          rawPercentageCondition,
          rawPercentageCondition,
          rawPercentageCondition,
        ],
      }
    );

    let err;

    try {
      await prepareAddTransferRestriction.call(proc, args);
    } catch (error) {
      err = error;
    }

    expect(err.message).toBe('Transfer Restriction limit reached');
    expect(err.data).toEqual({ limit: new BigNumber(3) });
  });

  it('should throw an error if exempted entities are repeated', async () => {
    args = {
      type: TransferRestrictionType.Count,
      exemptedIdentities: ['someScopeId', 'someScopeId'],
      count,
      ticker,
    };
    const proc = procedureMockUtils.getInstance<AddTransferRestrictionParams, BigNumber, Storage>(
      mockContext,
      emptyStorage
    );

    let err;

    try {
      await prepareAddTransferRestriction.call(proc, args);
    } catch (error) {
      err = error;
    }

    expect(err.message).toBe(
      'One or more of the passed exempted Identities are repeated or have the same Scope ID'
    );
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      args = {
        ticker,
        count,
        type: TransferRestrictionType.Count,
      };

      let proc = procedureMockUtils.getInstance<AddTransferRestrictionParams, BigNumber, Storage>(
        mockContext,
        emptyStorage
      );
      let boundFunc = getAuthorization.bind(proc);

      expect(boundFunc(args)).toEqual({
        permissions: {
          assets: [expect.objectContaining({ ticker })],
          transactions: [TxTags.statistics.SetAssetTransferCompliance],
          portfolios: [],
        },
      });
      expect(boundFunc({ ...args, exemptedIdentities: ['someScopeId'] })).toEqual({
        permissions: {
          assets: [expect.objectContaining({ ticker })],
          transactions: [
            TxTags.statistics.SetAssetTransferCompliance,
            TxTags.statistics.SetEntitiesExempt,
          ],
          portfolios: [],
        },
      });

      proc = procedureMockUtils.getInstance<AddTransferRestrictionParams, BigNumber, Storage>(
        mockContext,
        {
          ...emptyStorage,
        }
      );
      boundFunc = getAuthorization.bind(proc);

      expect(boundFunc(args)).toEqual({
        permissions: {
          assets: [expect.objectContaining({ ticker })],
          transactions: [TxTags.statistics.SetAssetTransferCompliance],
          portfolios: [],
        },
      });
    });
  });

  describe('prepareStorage', () => {
    beforeEach(() => {
      const did = 'someDid';
      dsMockUtils.configureMocks({
        contextOptions: {
          did,
        },
      });
      dsMockUtils.createQueryStub('statistics', 'activeAssetStats', {
        returnValue: [rawStatType],
      });

      dsMockUtils.createQueryStub('statistics', 'assetTransferCompliances', {
        returnValue: { requirements: [] },
      });
    });

    it('should fetch, process and return shared data', async () => {
      const proc = procedureMockUtils.getInstance<AddTransferRestrictionParams, BigNumber, Storage>(
        mockContext
      );
      const boundFunc = prepareStorage.bind(proc);

      const statStub = sinon
        .stub(utilsConversionModule, 'meshStatToStatisticsOpType')
        .returns(StatisticsOpType.Count);

      let result = await boundFunc({
        ticker: 'TICKER',
        type: TransferRestrictionType.Count,
        count: new BigNumber(1),
      } as AddTransferRestrictionParams);

      expect(result).toEqual({
        currentRestrictions: [],
      });

      dsMockUtils.createQueryStub('statistics', 'assetTransferCompliances', {
        returnValue: { requirements: [rawCountCondition] },
      });

      result = await boundFunc({
        ticker: 'TICKER',
        type: TransferRestrictionType.Count,
        count: new BigNumber(1),
      } as AddTransferRestrictionParams);

      expect(result).toEqual({
        currentRestrictions: [rawCountCondition],
      });

      statStub.returns(StatisticsOpType.Balance);

      result = await boundFunc({
        ticker: 'TICKER',
        type: TransferRestrictionType.Percentage,
        percentage: new BigNumber(1),
      } as AddTransferRestrictionParams);

      expect(result).toEqual({
        currentRestrictions: [rawCountCondition],
      });
    });

    it('should throw an error if the appropriate stat is not set', () => {
      const proc = procedureMockUtils.getInstance<AddTransferRestrictionParams, BigNumber, Storage>(
        mockContext
      );
      const boundFunc = prepareStorage.bind(proc);

      sinon
        .stub(utilsConversionModule, 'meshStatToStatisticsOpType')
        .returns(StatisticsOpType.Count);

      const expectedError = new PolymeshError({
        code: ErrorCode.UnmetPrerequisite,
        message:
          'The appropriate statistic must be enabled. Try calling the enableStat method first',
      });

      return expect(
        boundFunc({
          ticker: 'TICKER',
          type: TransferRestrictionType.Percentage,
          percentage: new BigNumber(1),
        } as AddTransferRestrictionParams)
      ).rejects.toThrowError(expectedError);
    });
  });
});
