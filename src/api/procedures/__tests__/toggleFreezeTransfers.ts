import { PolymeshPrimitivesTicker } from '@polkadot/types/lookup';
import { when } from 'jest-when';

import {
  getAuthorization,
  Params,
  prepareToggleFreezeTransfers,
} from '~/api/procedures/toggleFreezeTransfers';
import { Context } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { TxTags } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Asset/Base',
  require('~/testUtils/mocks/entities').mockBaseAssetModule('~/api/entities/Asset/Base')
);

describe('toggleFreezeTransfers procedure', () => {
  let mockContext: Mocked<Context>;
  let stringToTickerSpy: jest.SpyInstance<PolymeshPrimitivesTicker, [string, Context]>;
  let ticker: string;
  let rawTicker: PolymeshPrimitivesTicker;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    stringToTickerSpy = jest.spyOn(utilsConversionModule, 'stringToTicker');
    ticker = 'tickerFrozen';
    rawTicker = dsMockUtils.createMockTicker(ticker);
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    when(stringToTickerSpy).calledWith(ticker, mockContext).mockReturnValue(rawTicker);
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

  it('should throw an error if freeze is set to true and the Asset is already frozen', () => {
    entityMockUtils.configureMocks({
      baseAssetOptions: {
        isFrozen: true,
      },
    });

    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    return expect(
      prepareToggleFreezeTransfers.call(proc, {
        ticker,
        freeze: true,
      })
    ).rejects.toThrow('The Asset is already frozen');
  });

  it('should throw an error if freeze is set to false and the Asset is already unfrozen', () => {
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    return expect(
      prepareToggleFreezeTransfers.call(proc, {
        ticker,
        freeze: false,
      })
    ).rejects.toThrow('The Asset is already unfrozen');
  });

  it('should return a freeze transaction spec', async () => {
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    const transaction = dsMockUtils.createTxMock('asset', 'freeze');

    const result = await prepareToggleFreezeTransfers.call(proc, {
      ticker,
      freeze: true,
    });

    expect(result).toEqual({
      transaction,
      args: [rawTicker],
    });
  });

  it('should add an unfreeze transaction spec', async () => {
    entityMockUtils.configureMocks({
      baseAssetOptions: {
        isFrozen: true,
      },
    });

    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    const transaction = dsMockUtils.createTxMock('asset', 'unfreeze');

    const result = await prepareToggleFreezeTransfers.call(proc, {
      ticker,
      freeze: false,
    });

    expect(result).toEqual({
      transaction,
      args: [rawTicker],
    });
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<Params, void>(mockContext);
      const boundFunc = getAuthorization.bind(proc);

      const asset = expect.objectContaining({ ticker });

      expect(boundFunc({ ticker, freeze: true })).toEqual({
        permissions: {
          transactions: [TxTags.asset.Freeze],
          assets: [asset],
          portfolios: [],
        },
      });

      expect(boundFunc({ ticker, freeze: false })).toEqual({
        permissions: {
          transactions: [TxTags.asset.Unfreeze],
          assets: [asset],
          portfolios: [],
        },
      });
    });
  });
});
