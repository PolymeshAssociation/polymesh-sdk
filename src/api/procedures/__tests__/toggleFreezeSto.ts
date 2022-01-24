import { u64 } from '@polkadot/types';
import BigNumber from 'bignumber.js';
import { Ticker, TxTags } from 'polymesh-types/types';
import sinon from 'sinon';

import {
  getAuthorization,
  prepareToggleFreezeSto,
  ToggleFreezeStoParams,
} from '~/api/procedures/toggleFreezeSto';
import { Context, Sto } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { StoBalanceStatus, StoSaleStatus, StoTimingStatus } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/SecurityToken',
  require('~/testUtils/mocks/entities').mockSecurityTokenModule('~/api/entities/SecurityToken')
);
jest.mock(
  '~/api/entities/Sto',
  require('~/testUtils/mocks/entities').mockStoModule('~/api/entities/Sto')
);

describe('toggleFreezeSto procedure', () => {
  let mockContext: Mocked<Context>;
  let stringToTickerStub: sinon.SinonStub<[string, Context], Ticker>;
  let numberToU64Stub: sinon.SinonStub<[number | BigNumber, Context], u64>;
  let ticker: string;
  let rawTicker: Ticker;
  let id: BigNumber;
  let rawId: u64;
  let sto: Sto;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    stringToTickerStub = sinon.stub(utilsConversionModule, 'stringToTicker');
    numberToU64Stub = sinon.stub(utilsConversionModule, 'numberToU64');
    ticker = 'tickerFrozen';
    id = new BigNumber(1);
    rawTicker = dsMockUtils.createMockTicker(ticker);
    rawId = dsMockUtils.createMockU64(id.toNumber());
    sto = new Sto({ ticker, id }, mockContext);
  });

  let addTransactionStub: sinon.SinonStub;

  beforeEach(() => {
    addTransactionStub = procedureMockUtils.getAddTransactionStub();
    mockContext = dsMockUtils.getContextInstance();
    stringToTickerStub.withArgs(ticker, mockContext).returns(rawTicker);
    numberToU64Stub.withArgs(id, mockContext).returns(rawId);
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

  test('should throw an error if the STO has reached its end date', () => {
    entityMockUtils.configureMocks({
      stoOptions: {
        details: {
          status: {
            timing: StoTimingStatus.Expired,
            balance: StoBalanceStatus.Available,
            sale: StoSaleStatus.Closed,
          },
        },
      },
    });

    const proc = procedureMockUtils.getInstance<ToggleFreezeStoParams, Sto>(mockContext);

    return expect(
      prepareToggleFreezeSto.call(proc, {
        ticker,
        id,
        freeze: true,
      })
    ).rejects.toThrow('The STO has already ended');
  });

  test('should throw an error if freeze is set to true and the STO is already frozen', () => {
    entityMockUtils.configureMocks({
      stoOptions: {
        details: {
          status: {
            sale: StoSaleStatus.Frozen,
            timing: StoTimingStatus.Started,
            balance: StoBalanceStatus.Available,
          },
        },
      },
    });

    const proc = procedureMockUtils.getInstance<ToggleFreezeStoParams, Sto>(mockContext);

    return expect(
      prepareToggleFreezeSto.call(proc, {
        ticker,
        id,
        freeze: true,
      })
    ).rejects.toThrow('The STO is already frozen');
  });

  test('should throw an error if freeze is set to false and the STO status is live or close', async () => {
    const proc = procedureMockUtils.getInstance<ToggleFreezeStoParams, Sto>(mockContext);

    entityMockUtils.configureMocks({
      stoOptions: {
        details: {
          status: {
            sale: StoSaleStatus.Live,
            timing: StoTimingStatus.Started,
            balance: StoBalanceStatus.Available,
          },
        },
      },
    });

    await expect(
      prepareToggleFreezeSto.call(proc, {
        ticker,
        id,
        freeze: false,
      })
    ).rejects.toThrow('The STO is already unfrozen');

    entityMockUtils.configureMocks({
      stoOptions: {
        details: {
          status: {
            sale: StoSaleStatus.Closed,
            timing: StoTimingStatus.Started,
            balance: StoBalanceStatus.Available,
          },
        },
      },
    });

    return expect(
      prepareToggleFreezeSto.call(proc, {
        ticker,
        id,
        freeze: false,
      })
    ).rejects.toThrow('The STO is already closed');
  });

  test('should add a freeze transaction to the queue', async () => {
    const proc = procedureMockUtils.getInstance<ToggleFreezeStoParams, Sto>(mockContext);

    const transaction = dsMockUtils.createTxStub('sto', 'freezeFundraiser');

    const result = await prepareToggleFreezeSto.call(proc, {
      ticker,
      id,
      freeze: true,
    });

    sinon.assert.calledWith(addTransactionStub, transaction, {}, rawTicker, rawId);

    expect(sto.token.ticker).toBe(result.token.ticker);
  });

  test('should add a unfreeze transaction to the queue', async () => {
    entityMockUtils.configureMocks({
      stoOptions: {
        details: {
          status: {
            timing: StoTimingStatus.Started,
            balance: StoBalanceStatus.Available,
            sale: StoSaleStatus.Frozen,
          },
        },
      },
    });

    const proc = procedureMockUtils.getInstance<ToggleFreezeStoParams, Sto>(mockContext);

    const transaction = dsMockUtils.createTxStub('sto', 'unfreezeFundraiser');

    const result = await prepareToggleFreezeSto.call(proc, {
      ticker,
      id,
      freeze: false,
    });

    sinon.assert.calledWith(addTransactionStub, transaction, {}, rawTicker, rawId);

    expect(sto.token.ticker).toBe(result.token.ticker);
  });

  describe('getAuthorization', () => {
    test('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<ToggleFreezeStoParams, Sto>(mockContext);
      const boundFunc = getAuthorization.bind(proc);

      const token = expect.objectContaining({ ticker });

      expect(boundFunc({ ticker, id, freeze: true })).toEqual({
        permissions: {
          transactions: [TxTags.sto.FreezeFundraiser],
          tokens: [token],
          portfolios: [],
        },
      });

      expect(boundFunc({ ticker, id, freeze: false })).toEqual({
        permissions: {
          transactions: [TxTags.sto.UnfreezeFundraiser],
          tokens: [token],
          portfolios: [],
        },
      });
    });
  });
});
