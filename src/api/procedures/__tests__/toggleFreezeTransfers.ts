import { Ticker, TxTags } from 'polymesh-types/types';
import sinon from 'sinon';

import {
  getAuthorization,
  Params,
  prepareToggleFreezeTransfers,
} from '~/api/procedures/toggleFreezeTransfers';
import { Context, SecurityToken } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/SecurityToken',
  require('~/testUtils/mocks/entities').mockSecurityTokenModule('~/api/entities/SecurityToken')
);

describe('toggleFreezeTransfers procedure', () => {
  let mockContext: Mocked<Context>;
  let stringToTickerStub: sinon.SinonStub<[string, Context], Ticker>;
  let ticker: string;
  let rawTicker: Ticker;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    stringToTickerStub = sinon.stub(utilsConversionModule, 'stringToTicker');
    ticker = 'tickerFrozen';
    rawTicker = dsMockUtils.createMockTicker(ticker);
  });

  let addTransactionStub: sinon.SinonStub;

  beforeEach(() => {
    addTransactionStub = procedureMockUtils.getAddTransactionStub();
    mockContext = dsMockUtils.getContextInstance();
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

  test('should throw an error if freeze is set to true and the security token is already frozen', () => {
    entityMockUtils.configureMocks({
      securityTokenOptions: {
        isFrozen: true,
      },
    });

    const proc = procedureMockUtils.getInstance<Params, SecurityToken>(mockContext);

    return expect(
      prepareToggleFreezeTransfers.call(proc, {
        ticker,
        freeze: true,
      })
    ).rejects.toThrow('The Security Token is already frozen');
  });

  test('should throw an error if freeze is set to false and the security token is already unfrozen', () => {
    const proc = procedureMockUtils.getInstance<Params, SecurityToken>(mockContext);

    return expect(
      prepareToggleFreezeTransfers.call(proc, {
        ticker,
        freeze: false,
      })
    ).rejects.toThrow('The Security Token is already unfrozen');
  });

  test('should add a freeze transaction to the queue', async () => {
    const proc = procedureMockUtils.getInstance<Params, SecurityToken>(mockContext);

    const transaction = dsMockUtils.createTxStub('asset', 'freeze');

    const result = await prepareToggleFreezeTransfers.call(proc, {
      ticker,
      freeze: true,
    });

    sinon.assert.calledWith(addTransactionStub, { transaction, args: [rawTicker] });

    expect(ticker).toBe(result.ticker);
  });

  test('should add a unfreeze transaction to the queue', async () => {
    entityMockUtils.configureMocks({
      securityTokenOptions: {
        isFrozen: true,
      },
    });

    const proc = procedureMockUtils.getInstance<Params, SecurityToken>(mockContext);

    const transaction = dsMockUtils.createTxStub('asset', 'unfreeze');

    const result = await prepareToggleFreezeTransfers.call(proc, {
      ticker,
      freeze: false,
    });

    sinon.assert.calledWith(addTransactionStub, { transaction, args: [rawTicker] });

    expect(ticker).toBe(result.ticker);
  });

  describe('getAuthorization', () => {
    test('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<Params, SecurityToken>(mockContext);
      const boundFunc = getAuthorization.bind(proc);

      const token = entityMockUtils.getSecurityTokenInstance({ ticker });

      expect(boundFunc({ ticker, freeze: true })).toEqual({
        permissions: {
          transactions: [TxTags.asset.Freeze],
          tokens: [token],
          portfolios: [],
        },
      });

      expect(boundFunc({ ticker, freeze: false })).toEqual({
        permissions: {
          transactions: [TxTags.asset.Unfreeze],
          tokens: [token],
          portfolios: [],
        },
      });
    });
  });
});
