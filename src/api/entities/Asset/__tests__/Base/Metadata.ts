import { u64 } from '@polkadot/types';
import { PolymeshPrimitivesAssetAssetID } from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import { Metadata } from '~/api/entities/Asset/Base/Metadata';
import { Context, FungibleAsset, MetadataEntry, Namespace, PolymeshTransaction } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { MetadataLockStatus, MetadataType, MetadataValue } from '~/types';
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
  let assetId: string;
  let asset: FungibleAsset;
  let context: Context;
  let metadata: Metadata;
  let rawAssetId: PolymeshPrimitivesAssetAssetID;
  let stringToAssetIdSpy: jest.SpyInstance;

  beforeAll(() => {
    entityMockUtils.initMocks();
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();

    stringToAssetIdSpy = jest.spyOn(utilsConversionModule, 'stringToAssetId');
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
    assetId = '0x1234';
    rawAssetId = dsMockUtils.createMockAssetId(assetId);
    asset = entityMockUtils.getFungibleAssetInstance({ assetId });

    metadata = new Metadata(asset, context);

    when(stringToAssetIdSpy).calledWith(assetId, context).mockReturnValue(rawAssetId);
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
        .calledWith({ args: { asset, ...params }, transformer: undefined }, context, {})
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
            [rawAssetId, rawId],
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
          asset: expect.objectContaining({ id: assetId }),
          type: MetadataType.Global,
        }),
        expect.objectContaining({
          id: new BigNumber(1),
          asset: expect.objectContaining({ id: assetId }),
          type: MetadataType.Local,
        }),
        expect.objectContaining({
          id: new BigNumber(2),
          asset: expect.objectContaining({ id: assetId }),
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
          asset: expect.objectContaining({ id: assetId }),
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
          asset: expect.objectContaining({ id: assetId }),
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

    it('should return the next local Metadata ID', async () => {
      dsMockUtils.createQueryMock('asset', 'currentAssetMetadataLocalKey', {
        returnValue: dsMockUtils.createMockOption(rawId),
      });

      const result = await metadata.getNextLocalId();
      expect(result).toEqual(new BigNumber(2));
    });

    it('should return the next local Metadata ID as 1 for assets with no existing local metadata', async () => {
      dsMockUtils.createQueryMock('asset', 'currentAssetMetadataLocalKey', {
        returnValue: dsMockUtils.createMockOption(),
      });

      const result = await metadata.getNextLocalId();
      expect(result).toEqual(new BigNumber(1));
    });
  });

  describe('method: getDetails', () => {
    it('should return all the metadata details associated with an Asset', async () => {
      const meshMetadataValueToMetadataValueSpy = jest.spyOn(
        utilsConversionModule,
        'meshMetadataValueToMetadataValue'
      );

      const meshMetadataSpecToMetadataSpecSpy = jest.spyOn(
        utilsConversionModule,
        'meshMetadataSpecToMetadataSpec'
      );

      const assetMetadataValueDetailsMock = dsMockUtils.createQueryMock(
        'asset',
        'assetMetadataValueDetails'
      );

      const localName = 'LOCAL_METADATA';

      const rawLocalName = dsMockUtils.createMockBytes(localName);
      dsMockUtils.createQueryMock('asset', 'assetMetadataLocalKeyToName', {
        returnValue: dsMockUtils.createMockOption(rawLocalName),
      });
      const localSpecs = {
        description: 'some description for local metadata',
      };

      const rawLocalSpecs = dsMockUtils.createMockOption(
        dsMockUtils.createMockAssetMetadataSpec({
          url: dsMockUtils.createMockOption(),
          description: dsMockUtils.createMockOption(
            dsMockUtils.createMockBytes(localSpecs.description)
          ),
          typeDef: dsMockUtils.createMockOption(),
        })
      );

      dsMockUtils.createQueryMock('asset', 'assetMetadataLocalSpecs', {
        returnValue: rawLocalSpecs,
      });

      when(meshMetadataSpecToMetadataSpecSpy).calledWith(rawLocalSpecs).mockReturnValue(localSpecs);

      const localValue = '1234';
      const rawLocalValue = dsMockUtils.createMockOption(dsMockUtils.createMockBytes(localValue));

      const localValueDetails = {
        expiry: null,
        lockStatus: MetadataLockStatus.Locked,
      };

      const rawLocalValueDetails = dsMockUtils.createMockOption(
        dsMockUtils.createMockAssetMetadataValueDetail({
          expire: dsMockUtils.createMockOption(),
          lockStatus: dsMockUtils.createMockAssetMetadataLockStatus({ lockStatus: 'Locked' }),
        })
      );

      when(meshMetadataValueToMetadataValueSpy)
        .calledWith(rawLocalValue, rawLocalValueDetails)
        .mockReturnValue({
          value: localValue,
          ...localValueDetails,
        } as MetadataValue);

      const globalName = 'GLOBAL_METADATA';
      const rawGlobalName = dsMockUtils.createMockBytes(globalName);

      dsMockUtils.createQueryMock('asset', 'assetMetadataGlobalKeyToName', {
        returnValue: dsMockUtils.createMockOption(rawGlobalName),
      });

      const globalSpecs = {
        description: 'some description for local metadata',
      };
      const rawGlobalSpecs = dsMockUtils.createMockOption(
        dsMockUtils.createMockAssetMetadataSpec({
          url: dsMockUtils.createMockOption(),
          description: dsMockUtils.createMockOption(
            dsMockUtils.createMockBytes(globalSpecs.description)
          ),
          typeDef: dsMockUtils.createMockOption(),
        })
      );

      dsMockUtils.createQueryMock('asset', 'assetMetadataGlobalSpecs', {
        returnValue: rawGlobalSpecs,
      });

      when(meshMetadataSpecToMetadataSpecSpy)
        .calledWith(rawGlobalSpecs)
        .mockReturnValue(globalSpecs);

      const globalValue = 'random value';
      const rawGlobalValue = dsMockUtils.createMockOption(dsMockUtils.createMockBytes(globalValue));

      const globalValueDetails = {
        expiry: null,
        lockStatus: MetadataLockStatus.Unlocked,
      };

      const rawGlobalValueDetails = dsMockUtils.createMockOption(
        dsMockUtils.createMockAssetMetadataValueDetail({
          expire: dsMockUtils.createMockOption(),
          lockStatus: dsMockUtils.createMockAssetMetadataLockStatus({ lockStatus: 'Unlocked' }),
        })
      );

      when(meshMetadataValueToMetadataValueSpy)
        .calledWith(rawGlobalValue, rawGlobalValueDetails)
        .mockReturnValue({
          value: globalValue,
          ...globalValueDetails,
        } as MetadataValue);

      assetMetadataValueDetailsMock
        .mockReturnValueOnce(rawGlobalValueDetails)
        .mockReturnValueOnce(rawLocalValueDetails);

      const globalKey = dsMockUtils.createMockAssetMetadataKey({
        Global: dsMockUtils.createMockU64(new BigNumber(1)),
      });
      const localKey = dsMockUtils.createMockAssetMetadataKey({
        Local: dsMockUtils.createMockU64(new BigNumber(1)),
      });
      dsMockUtils.createQueryMock('asset', 'assetMetadataValues', {
        entries: [
          tuple([rawAssetId, globalKey], rawGlobalValue),
          tuple([rawAssetId, localKey], rawLocalValue),
        ],
      });

      const meshMetadataKeyToMetadataKeySpy = jest.spyOn(
        utilsConversionModule,
        'meshMetadataKeyToMetadataKey'
      );

      when(meshMetadataKeyToMetadataKeySpy)
        .calledWith(globalKey, asset, context)
        .mockResolvedValue({
          id: new BigNumber(1),
          type: MetadataType.Global,
        });

      when(meshMetadataKeyToMetadataKeySpy)
        .calledWith(localKey, asset, context)
        .mockResolvedValue({
          id: new BigNumber(1),
          type: MetadataType.Local,
          assetId,
        });

      const mockResult = [
        {
          metadataEntry: new MetadataEntry(
            {
              id: new BigNumber(1),
              type: MetadataType.Global,
              assetId,
            },
            context
          ),
          name: globalName,
          specs: globalSpecs,
          value: globalValue,
          expiry: null,
          lockStatus: MetadataLockStatus.Unlocked,
        },
        {
          metadataEntry: new MetadataEntry(
            {
              id: new BigNumber(1),
              type: MetadataType.Local,
              assetId,
            },
            context
          ),
          name: localName,
          specs: localSpecs,
          value: localValue,
          expiry: null,
          lockStatus: MetadataLockStatus.Locked,
        },
      ];

      const result = await metadata.getDetails();

      expect(JSON.stringify(result)).toEqual(JSON.stringify(mockResult));
    });
  });
});
