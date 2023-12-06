import {
  PolymeshPrimitivesAssetMetadataAssetMetadataKey,
  PolymeshPrimitivesTicker,
} from '@polkadot/types/lookup';
import { u64 } from '@polkadot/types-codec';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import {
  getAuthorization,
  Params,
  prepareRemoveLocalMetadata,
} from '~/api/procedures/removeLocalMetadata';
import * as procedureUtilsModule from '~/api/procedures/utils';
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

describe('removeLocalMetadata procedure', () => {
  let mockContext: Mocked<Context>;
  let stringToTickerSpy: jest.SpyInstance;
  let bigNumberToU64Spy: jest.SpyInstance;
  let collectionTickerMock: jest.Mock;

  let ticker: string;
  let rawTicker: PolymeshPrimitivesTicker;
  let id: BigNumber;
  let rawKey: u64;

  let type: MetadataType;
  let params: Params;

  let rawMetadataKey: PolymeshPrimitivesAssetMetadataAssetMetadataKey;

  let removeLocalMetadataKeyMock: PolymeshTx<
    [PolymeshPrimitivesTicker, PolymeshPrimitivesAssetMetadataAssetMetadataKey]
  >;

  let metadataEntry: MetadataEntry;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();

    stringToTickerSpy = jest.spyOn(utilsConversionModule, 'stringToTicker');
    bigNumberToU64Spy = jest.spyOn(utilsConversionModule, 'bigNumberToU64');

    jest.spyOn(procedureUtilsModule, 'assertMetadataValueIsModifiable');
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    ticker = 'SOME_TICKER';
    rawTicker = dsMockUtils.createMockTicker(ticker);

    id = new BigNumber(1);
    type = MetadataType.Local;

    metadataEntry = entityMockUtils.getMetadataEntryInstance({
      id,
      type,
      ticker,
    });

    params = { metadataEntry };

    rawMetadataKey = dsMockUtils.createMockAssetMetadataKey({
      Local: dsMockUtils.createMockU64(id),
    });

    when(stringToTickerSpy).calledWith(ticker, mockContext).mockReturnValue(rawTicker);

    rawKey = dsMockUtils.createMockU64(id);
    when(bigNumberToU64Spy).calledWith(id, mockContext).mockReturnValue(rawKey);

    removeLocalMetadataKeyMock = dsMockUtils.createTxMock('asset', 'removeLocalMetadataKey');
    collectionTickerMock = dsMockUtils.createQueryMock('nft', 'collectionTicker');

    collectionTickerMock.mockReturnValue(dsMockUtils.createMockU64(new BigNumber(0)));
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

  it('should return a remove local metadata key transaction spec', async () => {
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    const result = await prepareRemoveLocalMetadata.call(proc, params);

    expect(result).toEqual({
      transaction: removeLocalMetadataKeyMock,
      args: [rawTicker, rawKey],
      resolver: undefined,
    });
  });

  it('should throw an error if the Metadata entry is mandatory NFT collection key', () => {
    collectionTickerMock.mockReturnValue(dsMockUtils.createMockU64(new BigNumber(1)));
    dsMockUtils.createQueryMock('nft', 'collectionKeys', {
      returnValue: dsMockUtils.createMockBTreeSet([rawMetadataKey]),
    });
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    const result = prepareRemoveLocalMetadata.call(proc, params);

    const expectedError = new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'Cannot delete a mandatory NFT Collection Key',
    });
    return expect(result).rejects.toThrow(expectedError);
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

      const boundFunc = getAuthorization.bind(proc);

      expect(boundFunc(params)).toEqual({
        permissions: {
          transactions: [TxTags.asset.RemoveLocalMetadataKey],
          assets: [expect.objectContaining({ ticker })],
          portfolios: [],
        },
      });
    });
  });
});
