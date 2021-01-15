import { u64 } from '@polkadot/types';
import { Permill } from '@polkadot/types/interfaces';
import BigNumber from 'bignumber.js';
import { ScopeId, Ticker, TransferManager, TxTags } from 'polymesh-types/types';
import sinon from 'sinon';

import {
  AddTransferRestrictionParams,
  getAuthorization,
  prepareAddTransferRestriction,
} from '~/api/procedures/addTransferRestriction';
import { Context } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { RoleType, TickerReservationStatus } from '~/types';
import { PolymeshTx, TransferRestriction, TransferRestrictionType } from '~/types/internal';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/SecurityToken',
  require('~/testUtils/mocks/entities').mockSecurityTokenModule('~/api/entities/SecurityToken')
);

describe('addTransferRestriction procedure', () => {
  let mockContext: Mocked<Context>;
  let transferRestrictionToTransferManagerStub: sinon.SinonStub<
    [TransferRestriction, Context],
    TransferManager
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
  let rawCountTm: TransferManager;
  let rawPercentageTm: TransferManager;
  let args: AddTransferRestrictionParams;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    transferRestrictionToTransferManagerStub = sinon.stub(
      utilsConversionModule,
      'transferRestrictionToTransferManager'
    );
    stringToTickerStub = sinon.stub(utilsConversionModule, 'stringToTicker');
    ticker = 'someTicker';
    count = new BigNumber(10);
    percentage = new BigNumber(49);
    countTm = { type: TransferRestrictionType.Count, value: count };
    percentageTm = { type: TransferRestrictionType.Percentage, value: percentage };
  });

  let addTransactionStub: sinon.SinonStub;

  let addTransferManagerTransaction: PolymeshTx<[Ticker, TransferManager]>;
  let addExemptedEntitiesTransaction: PolymeshTx<[Ticker, TransferManager, ScopeId[]]>;

  beforeEach(() => {
    addTransactionStub = procedureMockUtils.getAddTransactionStub();

    entityMockUtils.getTickerReservationDetailsStub().resolves({
      owner: entityMockUtils.getIdentityInstance(),
      expiryDate: null,
      status: TickerReservationStatus.Free,
    });

    addTransferManagerTransaction = dsMockUtils.createTxStub('statistics', 'addTransferManager');
    addExemptedEntitiesTransaction = dsMockUtils.createTxStub('statistics', 'addExemptedEntities');

    mockContext = dsMockUtils.getContextInstance();

    rawTicker = dsMockUtils.createMockTicker(ticker);
    rawCount = dsMockUtils.createMockU64(count.toNumber());
    rawPercentage = dsMockUtils.createMockPermill(percentage.toNumber() * 10000);
    rawCountTm = dsMockUtils.createMockTransferManager({ CountTransferManager: rawCount });
    rawPercentageTm = dsMockUtils.createMockTransferManager({
      PercentageTransferManager: rawPercentage,
    });

    transferRestrictionToTransferManagerStub.withArgs(countTm, mockContext).returns(rawCountTm);
    transferRestrictionToTransferManagerStub
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
    entityMockUtils.cleanup();
    procedureMockUtils.cleanup();
    dsMockUtils.cleanup();
  });

  test('should add an add transfer manager transaction to the queue', async () => {
    args = {
      type: TransferRestrictionType.Count,
      exempted: [],
      count,
      ticker,
    };
    const proc = procedureMockUtils.getInstance<AddTransferRestrictionParams, number>(mockContext);

    dsMockUtils.createQueryStub('statistics', 'activeTransferManagers', {
      returnValue: [],
    });

    let result = await prepareAddTransferRestriction.call(proc, args);

    sinon.assert.calledWith(
      addTransactionStub,
      addTransferManagerTransaction,
      {},
      rawTicker,
      rawCountTm
    );

    expect(result).toEqual(1);

    args = {
      type: TransferRestrictionType.Percentage,
      exempted: [],
      percentage,
      ticker,
    };

    result = await prepareAddTransferRestriction.call(proc, args);

    sinon.assert.calledWith(
      addTransactionStub,
      addTransferManagerTransaction,
      {},
      rawTicker,
      rawPercentageTm
    );

    expect(result).toEqual(1);
  });

  test('should add an add exempted entities transaction to the queue', async () => {
    const scopeId = 'someScopeId';
    const rawScopeId = dsMockUtils.createMockScopeId(scopeId);
    args = {
      type: TransferRestrictionType.Count,
      exempted: [scopeId],
      count,
      ticker,
    };
    const proc = procedureMockUtils.getInstance<AddTransferRestrictionParams, number>(mockContext);

    dsMockUtils.createQueryStub('statistics', 'activeTransferManagers', {
      returnValue: [],
    });

    sinon
      .stub(utilsConversionModule, 'stringToScopeId')
      .withArgs(scopeId, mockContext)
      .returns(rawScopeId);

    const result = await prepareAddTransferRestriction.call(proc, args);

    sinon.assert.calledWith(
      addTransactionStub,
      addExemptedEntitiesTransaction,
      { batchSize: 1 },
      rawTicker,
      rawCountTm,
      [rawScopeId]
    );

    expect(result).toEqual(1);
  });

  test('should throw an error if attempting to add a restriction that already exists', async () => {
    args = {
      type: TransferRestrictionType.Count,
      exempted: [],
      count,
      ticker,
    };
    const proc = procedureMockUtils.getInstance<AddTransferRestrictionParams, number>(mockContext);

    dsMockUtils.createQueryStub('statistics', 'activeTransferManagers', {
      returnValue: [rawCountTm],
    });

    let err;

    try {
      await prepareAddTransferRestriction.call(proc, args);
    } catch (error) {
      err = error;
    }

    expect(err.message).toBe('Cannot add the same restriction more than once');
  });

  test('should throw an error if attempting to add a restriction that already exists', async () => {
    args = {
      type: TransferRestrictionType.Count,
      count,
      ticker,
    };
    const proc = procedureMockUtils.getInstance<AddTransferRestrictionParams, number>(mockContext);

    dsMockUtils.createQueryStub('statistics', 'activeTransferManagers', {
      returnValue: [rawPercentageTm, rawPercentageTm, rawPercentageTm],
    });

    let err;

    try {
      await prepareAddTransferRestriction.call(proc, args);
    } catch (error) {
      err = error;
    }

    expect(err.message).toBe('Transfer Restriction limit reached');
    expect(err.data).toEqual({ limit: 3 });
  });

  describe('getAuthorization', () => {
    test('should return the appropriate roles and permissions', () => {
      args = {
        ticker,
        count,
        type: TransferRestrictionType.Count,
      };

      const proc = procedureMockUtils.getInstance<AddTransferRestrictionParams, number>(
        mockContext
      );
      const boundFunc = getAuthorization.bind(proc);

      expect(boundFunc(args)).toEqual({
        identityRoles: [{ type: RoleType.TokenOwner, ticker }],
        signerPermissions: {
          tokens: [entityMockUtils.getSecurityTokenInstance({ ticker })],
          transactions: [TxTags.statistics.AddTransferManager],
          portfolios: [],
        },
      });
      expect(boundFunc({ ...args, exempted: ['someScopeId'] })).toEqual({
        identityRoles: [{ type: RoleType.TokenOwner, ticker }],
        signerPermissions: {
          tokens: [entityMockUtils.getSecurityTokenInstance({ ticker })],
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
