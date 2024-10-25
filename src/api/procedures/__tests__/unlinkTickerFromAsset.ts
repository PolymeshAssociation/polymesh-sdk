import { PolymeshPrimitivesAssetAssetId, PolymeshPrimitivesTicker } from '@polkadot/types/lookup';
import { when } from 'jest-when';

import {
  getAuthorization,
  Params,
  prepareStorage,
  prepareUnlinkTickerFromAsset,
  Storage,
} from '~/api/procedures/unlinkTickerFromAsset';
import { Context, PolymeshError } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { FungibleAsset, RoleType, TxTags } from '~/types';
import { PolymeshTx } from '~/types/internal';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Asset/Fungible',
  require('~/testUtils/mocks/entities').mockFungibleAssetModule('~/api/entities/Asset/Fungible')
);

describe('unlinkTickerFromAsset procedure', () => {
  let mockContext: Mocked<Context>;
  let assetToMeshAssetIdSpy: jest.SpyInstance;
  let stringToTickerSpy: jest.SpyInstance;
  let assetId: string;
  let ticker: string;
  let asset: FungibleAsset;
  let args: Params;
  let rawAssetId: PolymeshPrimitivesAssetAssetId;
  let rawTicker: PolymeshPrimitivesTicker;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    assetToMeshAssetIdSpy = jest.spyOn(utilsConversionModule, 'assetToMeshAssetId');
    stringToTickerSpy = jest.spyOn(utilsConversionModule, 'stringToTicker');
    assetId = '0x12341234123412341234123412341234';
    ticker = 'TICKER';
    asset = entityMockUtils.getFungibleAssetInstance({
      assetId,
      details: {
        ticker,
      },
    });
    args = {
      asset,
    };
    rawAssetId = dsMockUtils.createMockAssetId(assetId);
    rawTicker = dsMockUtils.createMockTicker(ticker);
  });

  let unlinkTickerFromAssetIdTx: PolymeshTx<
    [PolymeshPrimitivesTicker, PolymeshPrimitivesAssetAssetId]
  >;

  beforeEach(() => {
    unlinkTickerFromAssetIdTx = dsMockUtils.createTxMock('asset', 'unlinkTickerFromAssetId');

    mockContext = dsMockUtils.getContextInstance();

    when(assetToMeshAssetIdSpy).calledWith(asset, mockContext).mockReturnValue(rawAssetId);
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

  it('should return a unlink ticker from asset id transaction', async () => {
    const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
      ticker,
    });

    const result = await prepareUnlinkTickerFromAsset.call(proc, args);

    expect(result).toEqual({
      transaction: unlinkTickerFromAssetIdTx,
      args: [rawTicker, rawAssetId],
      resolver: undefined,
    });
  });

  it('should throw an error if the chain is on v6', async () => {
    mockContext.isV6 = true;
    const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
      ticker,
    });

    return expect(prepareUnlinkTickerFromAsset.call(proc, args)).rejects.toThrow(PolymeshError);
  });

  describe('prepareStorage', () => {
    it('should return the ticker associated with the Asset', async () => {
      const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
        ticker,
      });

      const boundFunc = prepareStorage.bind(proc);

      const result = await boundFunc({
        asset,
      });

      expect(result).toEqual({ ticker });
    });

    it('should return the ticker associated with the Asset', () => {
      const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
        ticker,
      });

      const boundFunc = prepareStorage.bind(proc);

      return expect(
        boundFunc({
          asset: entityMockUtils.getFungibleAssetInstance({
            details: {
              ticker: undefined,
            },
          }),
        })
      ).rejects.toThrowError(PolymeshError);
    });
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions for a free status', async () => {
      const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
        ticker,
      });
      const boundFunc = getAuthorization.bind(proc);

      return expect(boundFunc(args)).resolves.toEqual({
        roles: [{ type: RoleType.TickerOwner, ticker }],
        permissions: {
          assets: [asset],
          transactions: [TxTags.asset.UnlinkTickerFromAssetId],
          portfolios: [],
        },
      });
    });
  });
});
