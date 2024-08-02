import { PolymeshPrimitivesAssetAssetID, PolymeshPrimitivesTicker } from '@polkadot/types/lookup';
import { when } from 'jest-when';

import {
  getAuthorization,
  Params,
  prepareLinkTickerToAsset,
  prepareStorage,
  Storage,
} from '~/api/procedures/linkTickerToAsset';
import { Context, PolymeshError } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { FungibleAsset, RoleType, TickerReservationStatus, TxTags } from '~/types';
import { PolymeshTx } from '~/types/internal';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Asset/Fungible',
  require('~/testUtils/mocks/entities').mockFungibleAssetModule('~/api/entities/Asset/Fungible')
);
jest.mock(
  '~/api/entities/TickerReservation',
  require('~/testUtils/mocks/entities').mockTickerReservationModule(
    '~/api/entities/TickerReservation'
  )
);

describe('linkTickerToAsset procedure', () => {
  let mockContext: Mocked<Context>;
  let stringToAssetIdSpy: jest.SpyInstance;
  let stringToTickerSpy: jest.SpyInstance;
  let assetId: string;
  let ticker: string;
  let asset: FungibleAsset;
  let args: Params;
  let rawAssetId: PolymeshPrimitivesAssetAssetID;
  let rawTicker: PolymeshPrimitivesTicker;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    stringToAssetIdSpy = jest.spyOn(utilsConversionModule, 'stringToAssetId');
    stringToTickerSpy = jest.spyOn(utilsConversionModule, 'stringToTicker');
    assetId = '0x1234';
    ticker = 'TICKER';
    asset = entityMockUtils.getFungibleAssetInstance({ assetId });
    args = {
      ticker,
      asset,
    };
    rawAssetId = dsMockUtils.createMockAssetId(assetId);
    rawTicker = dsMockUtils.createMockTicker(ticker);
    jest.spyOn(utilsConversionModule, 'assetToMeshAssetId').mockReturnValue(rawAssetId);
  });

  let linkTickerToAssetIdTx: PolymeshTx<[PolymeshPrimitivesTicker, PolymeshPrimitivesAssetAssetID]>;
  let registerUniqueTickerTx: PolymeshTx<[PolymeshPrimitivesTicker]>;

  beforeEach(() => {
    registerUniqueTickerTx = dsMockUtils.createTxMock('asset', 'registerUniqueTicker');
    linkTickerToAssetIdTx = dsMockUtils.createTxMock('asset', 'linkTickerToAssetId');

    mockContext = dsMockUtils.getContextInstance();

    when(stringToAssetIdSpy).calledWith(assetId, mockContext).mockReturnValue(rawAssetId);
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

  it('should return a link ticker to asset id transaction', async () => {
    const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
      status: TickerReservationStatus.Reserved,
    });

    const result = await prepareLinkTickerToAsset.call(proc, args);

    expect(result).toEqual({
      transaction: linkTickerToAssetIdTx,
      args: [rawTicker, rawAssetId],
      resolver: undefined,
    });
  });

  it('should return a register and link batch', async () => {
    const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
      status: TickerReservationStatus.Free,
    });

    const result = await prepareLinkTickerToAsset.call(proc, args);

    expect(result).toEqual({
      transactions: [
        {
          transaction: registerUniqueTickerTx,
          args: [rawTicker],
        },
        {
          transaction: linkTickerToAssetIdTx,
          args: [rawTicker, rawAssetId],
        },
      ],
      resolver: undefined,
    });
  });

  it('should throw an error if the chain is on v6', async () => {
    mockContext.isV6 = true;
    const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
      status: TickerReservationStatus.Free,
    });

    return expect(prepareLinkTickerToAsset.call(proc, args)).rejects.toThrow(PolymeshError);
  });

  it('should throw an error if the ticker is already linked', async () => {
    const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
      status: TickerReservationStatus.AssetCreated,
    });

    return expect(prepareLinkTickerToAsset.call(proc, args)).rejects.toThrow(PolymeshError);
  });

  describe('prepareStorage', () => {
    it('should return the ticker reservations status', async () => {
      const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
        status: TickerReservationStatus.AssetCreated,
      });
      entityMockUtils.configureMocks({
        tickerReservationOptions: {
          details: { status: TickerReservationStatus.Reserved },
        },
      });

      const boundFunc = prepareStorage.bind(proc);

      const result = await boundFunc({
        ticker: 'TICKER',
        asset: entityMockUtils.getFungibleAssetInstance(),
      });

      expect(result).toEqual({ status: TickerReservationStatus.Reserved });
    });
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions for a free status', async () => {
      const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
        status: TickerReservationStatus.Free,
      });
      const boundFunc = getAuthorization.bind(proc);

      return expect(boundFunc(args)).resolves.toEqual({
        permissions: {
          assets: [asset],
          transactions: [TxTags.asset.LinkTickerToAssetId, TxTags.asset.RegisterUniqueTicker],
          portfolios: [],
        },
      });
    });

    it('should return the appropriate roles and permissions for a reserved status', async () => {
      const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
        status: TickerReservationStatus.Reserved,
      });
      const boundFunc = getAuthorization.bind(proc);

      return expect(boundFunc(args)).resolves.toEqual({
        permissions: {
          assets: [asset],
          transactions: [TxTags.asset.LinkTickerToAssetId],
          portfolios: [],
        },
        roles: [{ type: RoleType.TickerOwner, ticker }],
      });
    });
  });
});
