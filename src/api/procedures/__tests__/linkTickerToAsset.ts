import { Vec } from '@polkadot/types';
import {
  PolymeshPrimitivesAssetAssetID,
  PolymeshPrimitivesDocument,
  PolymeshPrimitivesTicker,
} from '@polkadot/types/lookup';
import { when } from 'jest-when';

import {
  getAuthorization,
  Params,
  prepareLinkTickerToAsset,
} from '~/api/procedures/linkTickerToAsset';
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

  let linkTickerToAssetIdTx: PolymeshTx<
    [Vec<PolymeshPrimitivesDocument>, PolymeshPrimitivesAssetAssetID]
  >;

  beforeEach(() => {
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
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    const result = await prepareLinkTickerToAsset.call(proc, args);

    expect(result).toEqual({
      transaction: linkTickerToAssetIdTx,
      args: [rawTicker, rawAssetId],
      resolver: undefined,
    });
  });

  it('should throw an error if the chain is on v6', async () => {
    mockContext.isV6 = true;
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    return expect(prepareLinkTickerToAsset.call(proc, args)).rejects.toThrow(PolymeshError);
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', async () => {
      const proc = procedureMockUtils.getInstance<Params, void>(mockContext);
      const boundFunc = getAuthorization.bind(proc);

      return expect(boundFunc(args)).resolves.toEqual({
        permissions: {
          assets: [asset],
          transactions: [TxTags.asset.LinkTickerToAssetId],
          portfolios: [],
        },
        roles: [{ ticker, type: RoleType.TickerOwner }],
      });
    });
  });
});
