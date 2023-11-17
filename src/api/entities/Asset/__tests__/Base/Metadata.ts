import { u64 } from '@polkadot/types';
import { PolymeshPrimitivesTicker } from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import { Metadata } from '~/api/entities/Asset/Base/Metadata';
import { Context, FungibleAsset, MetadataEntry, Namespace, PolymeshTransaction } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { MetadataType } from '~/types';
import { tuple } from '~/types/utils';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Asset/Fungible',
  require('~/testUtils/mocks/entities').mockFungibleAssetModule('~/api/entities/Asset/Fungible')
);
jest.mock(
  '~/api/entities/MetadataEntry',
  require('~/testUtils/mocks/entities').mockMetadataEntryModule('~/api/entities/MetadataEntry')
);
jest.mock(
  '~/base/Procedure',
  require('~/testUtils/mocks/procedure').mockProcedureModule('~/base/Procedure')
);

describe('Metadata class', () => {
  let ticker: string;
  let asset: FungibleAsset;
  let context: Context;
  let metadata: Metadata;
  let rawTicker: PolymeshPrimitivesTicker;
  let stringToTickerSpy: jest.SpyInstance;

  beforeAll(() => {
    entityMockUtils.initMocks();
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();

    stringToTickerSpy = jest.spyOn(utilsConversionModule, 'stringToTicker');
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
    ticker = 'SOME_TICKER';
    rawTicker = dsMockUtils.createMockTicker(ticker);
    asset = entityMockUtils.getFungibleAssetInstance({ ticker });

    metadata = new Metadata(asset, context);

    when(stringToTickerSpy).calledWith(ticker, context).mockReturnValue(rawTicker);
  });

  afterEach(() => {
    entityMockUtils.reset();
    dsMockUtils.reset();
    procedureMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
    procedureMockUtils.cleanup();
  });

  it('should extend namespace', () => {
    expect(Metadata.prototype instanceof Namespace).toBe(true);
  });

  describe('method: register', () => {
    it('should prepare the procedure and return the resulting transaction', async () => {
      const expectedTransaction =
        'someTransaction' as unknown as PolymeshTransaction<MetadataEntry>;

      const params = { name: 'SOME_METADATA', specs: {} };

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args: { ticker, ...params }, transformer: undefined }, context, {})
        .mockResolvedValue(expectedTransaction);

      const tx = await metadata.register(params);

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: get', () => {
    let ids: BigNumber[];
    let rawIds: u64[];
    let u64ToBigNumberSpy: jest.SpyInstance;

    beforeAll(() => {
      u64ToBigNumberSpy = jest.spyOn(utilsConversionModule, 'u64ToBigNumber');
    });

    beforeEach(() => {
      ids = [new BigNumber(1), new BigNumber(2)];
      rawIds = [dsMockUtils.createMockU64(ids[0]), dsMockUtils.createMockU64(ids[1])];

      rawIds.forEach((rawId, index) =>
        when(u64ToBigNumberSpy).calledWith(rawId).mockReturnValue(ids[index])
      );

      dsMockUtils.createQueryMock('asset', 'assetMetadataGlobalKeyToName', {
        entries: [
          tuple(
            [rawIds[0]],
            dsMockUtils.createMockOption(dsMockUtils.createMockBytes('GLOBAL_NAME'))
          ),
        ],
      });

      dsMockUtils.createQueryMock('asset', 'assetMetadataLocalKeyToName', {
        entries: rawIds.map((rawId, index) =>
          tuple(
            [rawTicker, rawId],
            dsMockUtils.createMockOption(dsMockUtils.createMockBytes(`LOCAL_NAME_${index}`))
          )
        ),
      });
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should return all MetadataEntry associated to the Asset', async () => {
      const result = await metadata.get();

      expect(result).toEqual([
        expect.objectContaining({
          id: new BigNumber(1),
          asset: expect.objectContaining({ ticker }),
          type: MetadataType.Global,
        }),
        expect.objectContaining({
          id: new BigNumber(1),
          asset: expect.objectContaining({ ticker }),
          type: MetadataType.Local,
        }),
        expect.objectContaining({
          id: new BigNumber(2),
          asset: expect.objectContaining({ ticker }),
          type: MetadataType.Local,
        }),
      ]);
    });
  });

  describe('method: getOne', () => {
    let id: BigNumber;

    beforeAll(() => {
      jest.spyOn(utilsConversionModule, 'bigNumberToU64').mockImplementation();
    });

    beforeEach(() => {
      id = new BigNumber(1);
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should throw an error if no MetadataEntry is found', async () => {
      dsMockUtils.createQueryMock('asset', 'assetMetadataGlobalKeyToName', {
        returnValue: dsMockUtils.createMockOption(),
      });
      await expect(metadata.getOne({ id, type: MetadataType.Global })).rejects.toThrow(
        `There is no global Asset Metadata with id "${id.toString()}"`
      );

      dsMockUtils.createQueryMock('asset', 'assetMetadataLocalKeyToName', {
        returnValue: dsMockUtils.createMockOption(),
      });
      await expect(metadata.getOne({ id, type: MetadataType.Local })).rejects.toThrow(
        `There is no local Asset Metadata with id "${id.toString()}"`
      );
    });

    it('should return the MetadataEntry for requested id and type', async () => {
      const rawName = dsMockUtils.createMockOption(dsMockUtils.createMockBytes('SOME_NAME'));
      dsMockUtils.createQueryMock('asset', 'assetMetadataGlobalKeyToName', {
        returnValue: rawName,
      });

      let result = await metadata.getOne({ id, type: MetadataType.Global });
      expect(result).toEqual(
        expect.objectContaining({
          id,
          asset: expect.objectContaining({ ticker }),
          type: MetadataType.Global,
        })
      );

      dsMockUtils.createQueryMock('asset', 'assetMetadataGlobalKeyToName', {
        returnValue: dsMockUtils.createMockOption(),
      });

      dsMockUtils.createQueryMock('asset', 'assetMetadataLocalKeyToName', {
        returnValue: rawName,
      });

      result = await metadata.getOne({ id, type: MetadataType.Local });
      expect(result).toEqual(
        expect.objectContaining({
          id,
          asset: expect.objectContaining({ ticker }),
          type: MetadataType.Local,
        })
      );
    });
  });

  describe('method: getNextLocalId', () => {
    let id: BigNumber;
    let rawId: u64;

    beforeEach(() => {
      id = new BigNumber(1);
      rawId = dsMockUtils.createMockU64(id);
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should return the MetadataEntry for requested id and type', async () => {
      dsMockUtils.createQueryMock('asset', 'assetMetadataNextLocalKey', {
        returnValue: rawId,
      });

      const result = await metadata.getNextLocalId();
      expect(result).toEqual(new BigNumber(2));
    });
  });
});
