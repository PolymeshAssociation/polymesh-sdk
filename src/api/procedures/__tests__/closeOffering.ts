import BigNumber from 'bignumber.js';

import { getAuthorization, Params, prepareCloseOffering } from '~/api/procedures/closeOffering';
import { Context } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { OfferingBalanceStatus, OfferingSaleStatus, OfferingTimingStatus, TxTags } from '~/types';
import { PolymeshTx } from '~/types/internal';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Offering',
  require('~/testUtils/mocks/entities').mockOfferingModule('~/api/entities/Offering')
);
jest.mock(
  '~/api/entities/Asset',
  require('~/testUtils/mocks/entities').mockAssetModule('~/api/entities/Asset')
);

describe('closeOffering procedure', () => {
  const ticker = 'SOME_TICKER';
  const id = new BigNumber(1);

  const rawTicker = dsMockUtils.createMockTicker(ticker);
  const rawId = dsMockUtils.createMockU64(id);

  let mockContext: Mocked<Context>;
  let stopStoTransaction: PolymeshTx<unknown[]>;

  beforeAll(() => {
    entityMockUtils.initMocks({
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
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();

    jest.spyOn(utilsConversionModule, 'stringToTicker').mockReturnValue(rawTicker);
    jest.spyOn(utilsConversionModule, 'bigNumberToU64').mockReturnValue(rawId);
  });

  beforeEach(() => {
    stopStoTransaction = dsMockUtils.createTxMock('sto', 'stop');
    mockContext = dsMockUtils.getContextInstance();
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

  it('should return a stop sto transaction spec', async () => {
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    const result = await prepareCloseOffering.call(proc, { ticker, id });

    expect(result).toEqual({
      transaction: stopStoTransaction,
      args: [rawTicker, rawId],
      resolver: undefined,
    });
  });

  it('should throw an error if the Offering is already closed', async () => {
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

    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    return expect(prepareCloseOffering.call(proc, { ticker, id })).rejects.toThrow(
      'The Offering is already closed'
    );
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<Params, void>(mockContext);
      const boundFunc = getAuthorization.bind(proc);
      const args = {
        ticker,
      } as Params;

      expect(boundFunc(args)).toEqual({
        permissions: {
          transactions: [TxTags.sto.Stop],
          assets: [expect.objectContaining({ ticker })],
          portfolios: [],
        },
      });
    });
  });
});
