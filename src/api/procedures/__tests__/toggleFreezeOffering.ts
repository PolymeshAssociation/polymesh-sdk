import { u64 } from '@polkadot/types';
import BigNumber from 'bignumber.js';
import { Ticker } from 'polymesh-types/types';
import sinon from 'sinon';

import {
  getAuthorization,
  prepareToggleFreezeOffering,
  ToggleFreezeOfferingParams,
} from '~/api/procedures/toggleFreezeOffering';
import { Context, Offering } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { OfferingBalanceStatus, OfferingSaleStatus, OfferingTimingStatus, TxTags } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Asset',
  require('~/testUtils/mocks/entities').mockAssetModule('~/api/entities/Asset')
);
jest.mock(
  '~/api/entities/Offering',
  require('~/testUtils/mocks/entities').mockOfferingModule('~/api/entities/Offering')
);

describe('toggleFreezeOffering procedure', () => {
  let mockContext: Mocked<Context>;
  let stringToTickerStub: sinon.SinonStub<[string, Context], Ticker>;
  let bigNumberToU64Stub: sinon.SinonStub<[BigNumber, Context], u64>;
  let ticker: string;
  let rawTicker: Ticker;
  let id: BigNumber;
  let rawId: u64;
  let offering: Offering;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    stringToTickerStub = sinon.stub(utilsConversionModule, 'stringToTicker');
    bigNumberToU64Stub = sinon.stub(utilsConversionModule, 'bigNumberToU64');
    ticker = 'tickerFrozen';
    id = new BigNumber(1);
    rawTicker = dsMockUtils.createMockTicker(ticker);
    rawId = dsMockUtils.createMockU64(id);
    offering = new Offering({ ticker, id }, mockContext);
  });

  let addTransactionStub: sinon.SinonStub;

  beforeEach(() => {
    addTransactionStub = procedureMockUtils.getAddTransactionStub();
    mockContext = dsMockUtils.getContextInstance();
    stringToTickerStub.withArgs(ticker, mockContext).returns(rawTicker);
    bigNumberToU64Stub.withArgs(id, mockContext).returns(rawId);
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

  it('should throw an error if the Offering has reached its end date', () => {
    entityMockUtils.configureMocks({
      offeringOptions: {
        details: {
          status: {
            timing: OfferingTimingStatus.Expired,
            balance: OfferingBalanceStatus.Available,
            sale: OfferingSaleStatus.Closed,
          },
        },
      },
    });

    const proc = procedureMockUtils.getInstance<ToggleFreezeOfferingParams, Offering>(mockContext);

    return expect(
      prepareToggleFreezeOffering.call(proc, {
        ticker,
        id,
        freeze: true,
      })
    ).rejects.toThrow('The Offering has already ended');
  });

  it('should throw an error if freeze is set to true and the Offering is already frozen', () => {
    entityMockUtils.configureMocks({
      offeringOptions: {
        details: {
          status: {
            sale: OfferingSaleStatus.Frozen,
            timing: OfferingTimingStatus.Started,
            balance: OfferingBalanceStatus.Available,
          },
        },
      },
    });

    const proc = procedureMockUtils.getInstance<ToggleFreezeOfferingParams, Offering>(mockContext);

    return expect(
      prepareToggleFreezeOffering.call(proc, {
        ticker,
        id,
        freeze: true,
      })
    ).rejects.toThrow('The Offering is already frozen');
  });

  it('should throw an error if freeze is set to false and the Offering status is live or close', async () => {
    const proc = procedureMockUtils.getInstance<ToggleFreezeOfferingParams, Offering>(mockContext);

    entityMockUtils.configureMocks({
      offeringOptions: {
        details: {
          status: {
            sale: OfferingSaleStatus.Live,
            timing: OfferingTimingStatus.Started,
            balance: OfferingBalanceStatus.Available,
          },
        },
      },
    });

    await expect(
      prepareToggleFreezeOffering.call(proc, {
        ticker,
        id,
        freeze: false,
      })
    ).rejects.toThrow('The Offering is already unfrozen');

    entityMockUtils.configureMocks({
      offeringOptions: {
        details: {
          status: {
            sale: OfferingSaleStatus.Closed,
            timing: OfferingTimingStatus.Started,
            balance: OfferingBalanceStatus.Available,
          },
        },
      },
    });

    return expect(
      prepareToggleFreezeOffering.call(proc, {
        ticker,
        id,
        freeze: false,
      })
    ).rejects.toThrow('The Offering is already closed');
  });

  it('should add a freeze transaction to the queue', async () => {
    const proc = procedureMockUtils.getInstance<ToggleFreezeOfferingParams, Offering>(mockContext);

    const transaction = dsMockUtils.createTxStub('sto', 'freezeFundraiser');

    const result = await prepareToggleFreezeOffering.call(proc, {
      ticker,
      id,
      freeze: true,
    });

    sinon.assert.calledWith(addTransactionStub, { transaction, args: [rawTicker, rawId] });

    expect(offering.asset.ticker).toBe(result.asset.ticker);
  });

  it('should add a unfreeze transaction to the queue', async () => {
    entityMockUtils.configureMocks({
      offeringOptions: {
        details: {
          status: {
            timing: OfferingTimingStatus.Started,
            balance: OfferingBalanceStatus.Available,
            sale: OfferingSaleStatus.Frozen,
          },
        },
      },
    });

    const proc = procedureMockUtils.getInstance<ToggleFreezeOfferingParams, Offering>(mockContext);

    const transaction = dsMockUtils.createTxStub('sto', 'unfreezeFundraiser');

    const result = await prepareToggleFreezeOffering.call(proc, {
      ticker,
      id,
      freeze: false,
    });

    sinon.assert.calledWith(addTransactionStub, { transaction, args: [rawTicker, rawId] });

    expect(offering.asset.ticker).toBe(result.asset.ticker);
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<ToggleFreezeOfferingParams, Offering>(
        mockContext
      );
      const boundFunc = getAuthorization.bind(proc);

      const asset = expect.objectContaining({ ticker });

      expect(boundFunc({ ticker, id, freeze: true })).toEqual({
        permissions: {
          transactions: [TxTags.sto.FreezeFundraiser],
          assets: [asset],
          portfolios: [],
        },
      });

      expect(boundFunc({ ticker, id, freeze: false })).toEqual({
        permissions: {
          transactions: [TxTags.sto.UnfreezeFundraiser],
          assets: [asset],
          portfolios: [],
        },
      });
    });
  });
});
