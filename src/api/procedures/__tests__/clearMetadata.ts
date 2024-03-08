import {
  PolymeshPrimitivesAssetMetadataAssetMetadataKey,
  PolymeshPrimitivesTicker,
} from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import { getAuthorization, Params, prepareClearMetadata } from '~/api/procedures/clearMetadata';
import { Context, MetadataEntry, PolymeshError } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { ErrorCode, MetadataType, TxTags } from '~/types';
import { PolymeshTx } from '~/types/internal';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Asset/Fungible',
  require('~/testUtils/mocks/entities').mockFungibleAssetModule('~/api/entities/Asset/Fungible')
);
jest.mock(
  '~/api/entities/MetadataEntry',
  require('~/testUtils/mocks/entities').mockMetadataEntryModule('~/api/entities/MetadataEntry')
);

describe('clearMetadata procedure', () => {
  let mockContext: Mocked<Context>;
  let stringToTickerSpy: jest.SpyInstance;
  let metadataToMeshMetadataKeySpy: jest.SpyInstance;

  let ticker: string;
  let id: BigNumber;
  let type: MetadataType;
  let rawTicker: PolymeshPrimitivesTicker;
  let rawMetadataKey: PolymeshPrimitivesAssetMetadataAssetMetadataKey;
  let params: Params;

  let removeMetadataValueMock: PolymeshTx<
    [PolymeshPrimitivesTicker, PolymeshPrimitivesAssetMetadataAssetMetadataKey]
  >;

  let isModifiableSpy: jest.SpyInstance;

  let metadataEntry: MetadataEntry;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();

    stringToTickerSpy = jest.spyOn(utilsConversionModule, 'stringToTicker');
    metadataToMeshMetadataKeySpy = jest.spyOn(utilsConversionModule, 'metadataToMeshMetadataKey');
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    ticker = 'SOME_TICKER';
    rawTicker = dsMockUtils.createMockTicker(ticker);

    id = new BigNumber(1);
    type = MetadataType.Local;

    metadataEntry = new MetadataEntry({ id, type, ticker }, mockContext);

    isModifiableSpy = jest.spyOn(metadataEntry, 'isModifiable');
    isModifiableSpy.mockResolvedValue({
      canModify: true,
    });

    params = { metadataEntry };

    when(stringToTickerSpy).calledWith(ticker, mockContext).mockReturnValue(rawTicker);

    rawMetadataKey = dsMockUtils.createMockAssetMetadataKey({
      Local: dsMockUtils.createMockU64(id),
    });
    when(metadataToMeshMetadataKeySpy)
      .calledWith(type, id, mockContext)
      .mockReturnValue(rawMetadataKey);

    removeMetadataValueMock = dsMockUtils.createTxMock('asset', 'removeMetadataValue');
  });

  afterEach(() => {
    entityMockUtils.reset();
    procedureMockUtils.reset();
    dsMockUtils.reset();
  });

  afterAll(() => {
    procedureMockUtils.cleanup();
    dsMockUtils.cleanup();
    jest.restoreAllMocks();
  });

  it('should return a remove metadata value transaction spec', async () => {
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    const result = await prepareClearMetadata.call(proc, params);

    expect(result).toEqual({
      transaction: removeMetadataValueMock,
      args: [rawTicker, rawMetadataKey],
      resolver: undefined,
    });
  });

  it('should throw an error if MetadataEntry is not modifiable', () => {
    const mockError = new PolymeshError({
      code: ErrorCode.DataUnavailable,
      message: 'Metadata does not exists',
    });
    isModifiableSpy.mockResolvedValue({
      canModify: false,
      reason: mockError,
    });
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    return expect(prepareClearMetadata.call(proc, params)).rejects.toThrow(mockError);
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

      const boundFunc = getAuthorization.bind(proc);

      expect(boundFunc(params)).toEqual({
        permissions: {
          transactions: [TxTags.asset.RemoveMetadataValue],
          assets: [expect.objectContaining({ ticker })],
          portfolios: [],
        },
      });
    });
  });
});
