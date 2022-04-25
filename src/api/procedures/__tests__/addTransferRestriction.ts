import { u64 } from '@polkadot/types';
import { Permill } from '@polkadot/types/interfaces';
import BigNumber from 'bignumber.js';
import { ScopeId, Ticker, TransferCondition } from 'polymesh-types/types';
import sinon from 'sinon';

import {
  AddTransferRestrictionParams,
  getAuthorization,
  prepareAddTransferRestriction,
} from '~/api/procedures/addTransferRestriction';
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

describe('addTransferRestriction procedure', () => {
  let mockContext: Mocked<Context>;
  let transferRestrictionToTransferRestrictionStub: sinon.SinonStub<
    [TransferRestriction, Context],
    TransferCondition
  >;
  let stringToTickerStub: sinon.SinonStub<[string, Context], Ticker>;
  let ticker: string;
  let count: BigNumber;
  let percentage: BigNumber;
  let countTm: TransferRestriction;
  let percentageTm: TransferRestriction;
  let rawTicker: Ticker;
  let rawCount: u64;
  let rawPercentage: Permill;
  let rawCountTm: TransferCondition;
  let rawPercentageTm: TransferCondition;
  let args: AddTransferRestrictionParams;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    transferRestrictionToTransferRestrictionStub = sinon.stub(
      utilsConversionModule,
      'transferRestrictionToTransferCondition'
    );
    stringToTickerStub = sinon.stub(utilsConversionModule, 'stringToTicker');
    ticker = 'someTicker';
    count = new BigNumber(10);
    percentage = new BigNumber(49);
    countTm = { type: TransferRestrictionType.Count, value: count };
    percentageTm = { type: TransferRestrictionType.Percentage, value: percentage };
  });

  let addBatchTransactionStub: sinon.SinonStub;

  let setAssetTransferCompliance: PolymeshTx<[Ticker, TransferCondition]>;
  let addExemptedEntitiesTransaction: PolymeshTx<[Ticker, TransferCondition, ScopeId[]]>;

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
    rawTicker = dsMockUtils.createMockTicker(ticker);
    rawCount = dsMockUtils.createMockU64(count);
    rawPercentage = dsMockUtils.createMockPermill(percentage.multipliedBy(10000));
    rawCountTm = dsMockUtils.createMockTransferCondition({ MaxInvestorCount: rawCount });
    rawPercentageTm = dsMockUtils.createMockTransferCondition({
      MaxInvestorOwnership: rawPercentage,
    });

    transferRestrictionToTransferRestrictionStub.withArgs(countTm, mockContext).returns(rawCountTm);
    transferRestrictionToTransferRestrictionStub
      .withArgs(percentageTm, mockContext)
      .returns(rawPercentageTm);
    stringToTickerStub.withArgs(ticker, mockContext).returns(rawTicker);
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

  it('should add an add transfer manager transaction to the queue', async () => {
    args = {
      type: 'MaxInvestorCount',
      exemptedIdentities: [],
      count,
      ticker,
    };
    const proc = procedureMockUtils.getInstance<AddTransferRestrictionParams, BigNumber>(
      mockContext
    );

    dsMockUtils.createQueryStub('statistics', 'assetTransferCompliances', {
      returnValue: { requirements: [] },
    });

    let result = await prepareAddTransferRestriction.call(proc, args);

    sinon.assert.calledWith(addBatchTransactionStub.firstCall, {
      transactions: [
        {
          transaction: setAssetTransferCompliance,
          args: [rawTicker, rawCountTm],
        },
      ],
    });

    expect(result).toEqual(new BigNumber(1));

    args = {
      type: 'MaxInvestorOwnership',
      exemptedIdentities: [],
      percentage,
      ticker,
    };

    result = await prepareAddTransferRestriction.call(proc, args);

    sinon.assert.calledWith(addBatchTransactionStub.secondCall, {
      transactions: [
        {
          transaction: setAssetTransferCompliance,
          args: [rawTicker, rawPercentageTm],
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
      type: 'MaxInvestorCount',
      exemptedIdentities: [did],
      count,
      ticker,
    };
    const proc = procedureMockUtils.getInstance<AddTransferRestrictionParams, BigNumber>(
      mockContext
    );

    dsMockUtils.createQueryStub('statistics', 'assetTransferCompliances', {
      returnValue: { requirements: [] },
    });

    const stringToScopeIdStub = sinon.stub(utilsConversionModule, 'stringToScopeId');

    stringToScopeIdStub.withArgs(scopeId, mockContext).returns(rawScopeId);
    stringToScopeIdStub.withArgs(identityScopeId, mockContext).returns(rawIdentityScopeId);

    let result = await prepareAddTransferRestriction.call(proc, args);

    sinon.assert.calledWith(addBatchTransactionStub.firstCall, {
      transactions: [
        {
          transaction: setAssetTransferCompliance,
          args: [rawTicker, rawCountTm],
        },
        {
          transaction: addExemptedEntitiesTransaction,
          feeMultiplier: new BigNumber(1),
          args: [rawTicker, rawCountTm, [rawIdentityScopeId]],
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
          transaction: setAssetTransferCompliance,
          args: [rawTicker, rawCountTm],
        },
        {
          transaction: addExemptedEntitiesTransaction,
          feeMultiplier: new BigNumber(1),
          args: [rawTicker, rawCountTm, [rawIdentityScopeId]],
        },
      ],
    });

    expect(result).toEqual(new BigNumber(1));
  });

  it('should throw an error if attempting to add a restriction that already exists', async () => {
    args = {
      type: 'MaxInvestorCount',
      exemptedIdentities: [],
      count,
      ticker,
    };
    const proc = procedureMockUtils.getInstance<AddTransferRestrictionParams, BigNumber>(
      mockContext
    );

    dsMockUtils.createQueryStub('statistics', 'assetTransferCompliances', {
      returnValue: { requirements: [rawCountTm] },
    });

    let err;

    try {
      await prepareAddTransferRestriction.call(proc, args);
    } catch (error) {
      err = error;
    }

    expect(err.message).toBe('Cannot add the same restriction more than once');
  });

  it('should throw an error if attempting to add a restriction when the restriction limit has been reached', async () => {
    args = {
      type: 'MaxInvestorCount',
      count,
      ticker,
    };
    const proc = procedureMockUtils.getInstance<AddTransferRestrictionParams, BigNumber>(
      mockContext
    );

    dsMockUtils.createQueryStub('statistics', 'assetTransferCompliances', {
      returnValue: { requirements: [rawPercentageTm, rawPercentageTm, rawPercentageTm] },
    });

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
      type: 'MaxInvestorCount',
      exemptedIdentities: ['someScopeId', 'someScopeId'],
      count,
      ticker,
    };
    const proc = procedureMockUtils.getInstance<AddTransferRestrictionParams, BigNumber>(
      mockContext
    );

    dsMockUtils.createQueryStub('statistics', 'assetTransferCompliances', {
      returnValue: { requirements: [] },
    });

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
        type: 'MaxInvestorCount',
      };

      const proc = procedureMockUtils.getInstance<AddTransferRestrictionParams, BigNumber>(
        mockContext
      );
      const boundFunc = getAuthorization.bind(proc);

      expect(boundFunc(args)).toEqual({
        permissions: {
          assets: [expect.objectContaining({ ticker })],
          transactions: [TxTags.statistics.AddTransferManager],
          portfolios: [],
        },
      });
      expect(boundFunc({ ...args, exemptedIdentities: ['someScopeId'] })).toEqual({
        permissions: {
          assets: [expect.objectContaining({ ticker })],
          transactions: [
            TxTags.statistics.AddTransferManager,
            TxTags.statistics.AddExemptedEntities,
          ],
          portfolios: [],
        },
      });
    });
  });
});
