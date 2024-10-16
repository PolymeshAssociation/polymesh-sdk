import { Bytes, Option, u32 } from '@polkadot/types';
import {
  PolymeshPrimitivesAssetAssetId,
  PolymeshPrimitivesAssetMetadataAssetMetadataSpec,
  PolymeshPrimitivesAssetMetadataAssetMetadataValueDetail,
} from '@polkadot/types/lookup';
import { ISubmittableResult } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import {
  createMetadataResolver,
  getAuthorization,
  Params,
  prepareRegisterMetadata,
} from '~/api/procedures/registerMetadata';
import { BaseAsset, Context, MetadataEntry, PolymeshError } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { ErrorCode, MetadataLockStatus, MetadataType, TxTags } from '~/types';
import { PolymeshTx } from '~/types/internal';
import * as utilsConversionModule from '~/utils/conversion';
import * as utilsInternalModule from '~/utils/internal';

jest.mock(
  '~/api/entities/Asset/Fungible',
  require('~/testUtils/mocks/entities').mockFungibleAssetModule('~/api/entities/Asset/Fungible')
);
jest.mock(
  '~/api/entities/MetadataEntry',
  require('~/testUtils/mocks/entities').mockMetadataEntryModule('~/api/entities/MetadataEntry')
);

describe('registerMetadata procedure', () => {
  let mockContext: Mocked<Context>;
  let assetToMeshAssetIdSpy: jest.SpyInstance;
  let u32ToBigNumberSpy: jest.SpyInstance;
  let stringToBytesSpy: jest.SpyInstance;
  let metadataSpecToMeshMetadataSpecSpy: jest.SpyInstance;

  let queryMultiMock: jest.Mock;
  let assetId: string;
  let asset: BaseAsset;
  let rawAssetId: PolymeshPrimitivesAssetAssetId;
  let metadataNameMaxLength: BigNumber;
  let rawMetadataNameMaxLength: u32;
  let params: Params;
  let name: string;
  let rawName: Bytes;
  let rawSpecs: PolymeshPrimitivesAssetMetadataAssetMetadataSpec;
  let registerAssetMetadataLocalTypeTxMock: PolymeshTx<
    [PolymeshPrimitivesAssetAssetId, Bytes, PolymeshPrimitivesAssetMetadataAssetMetadataSpec]
  >;

  let registerAndSetLocalAssetMetadataMock: PolymeshTx<
    [
      PolymeshPrimitivesAssetAssetId,
      Bytes,
      PolymeshPrimitivesAssetMetadataAssetMetadataSpec,
      Bytes,
      Option<PolymeshPrimitivesAssetMetadataAssetMetadataValueDetail>
    ]
  >;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();

    assetToMeshAssetIdSpy = jest.spyOn(utilsConversionModule, 'assetToMeshAssetId');
    u32ToBigNumberSpy = jest.spyOn(utilsConversionModule, 'u32ToBigNumber');
    stringToBytesSpy = jest.spyOn(utilsConversionModule, 'stringToBytes');
    metadataSpecToMeshMetadataSpecSpy = jest.spyOn(
      utilsConversionModule,
      'metadataSpecToMeshMetadataSpec'
    );
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    assetId = '0x1234';
    rawAssetId = dsMockUtils.createMockAssetId(assetId);
    asset = entityMockUtils.getBaseAssetInstance({ assetId });

    when(assetToMeshAssetIdSpy).calledWith(asset, mockContext).mockReturnValue(rawAssetId);

    metadataNameMaxLength = new BigNumber(15);
    rawMetadataNameMaxLength = dsMockUtils.createMockU32(metadataNameMaxLength);

    dsMockUtils.setConstMock('asset', 'assetMetadataNameMaxLength', {
      returnValue: rawMetadataNameMaxLength,
    });

    when(u32ToBigNumberSpy)
      .calledWith(rawMetadataNameMaxLength)
      .mockReturnValue(metadataNameMaxLength);

    name = 'SOME_NAME';
    rawName = dsMockUtils.createMockBytes(name);
    when(stringToBytesSpy).calledWith(name, mockContext).mockReturnValue(rawName);

    rawSpecs = dsMockUtils.createMockAssetMetadataSpec();
    metadataSpecToMeshMetadataSpecSpy.mockReturnValue(rawSpecs);

    params = {
      asset,
      name,
      specs: {},
    };

    dsMockUtils.createQueryMock('asset', 'assetMetadataGlobalNameToKey');
    dsMockUtils.createQueryMock('asset', 'assetMetadataLocalNameToKey');
    queryMultiMock = dsMockUtils.getQueryMultiMock();

    registerAssetMetadataLocalTypeTxMock = dsMockUtils.createTxMock(
      'asset',
      'registerAssetMetadataLocalType'
    );
    registerAndSetLocalAssetMetadataMock = dsMockUtils.createTxMock(
      'asset',
      'registerAndSetLocalAssetMetadata'
    );
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

  it('should throw an error if attempting to add a metadata exceeding the allowed name ', () => {
    params = {
      ...params,
      name: 'NAME_EXCEEDING_MAX_LENGTH',
    };
    const proc = procedureMockUtils.getInstance<Params, MetadataEntry>(mockContext);

    const expectedError = new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Asset Metadata name length exceeded',
      data: {
        maxLength: metadataNameMaxLength,
      },
    });

    return expect(prepareRegisterMetadata.call(proc, params)).rejects.toThrowError(expectedError);
  });

  it('should throw an error if attempting to register a metadata with duplicate name', async () => {
    const rawId = dsMockUtils.createMockU64(new BigNumber(1));

    const proc = procedureMockUtils.getInstance<Params, MetadataEntry>(mockContext);

    const expectedError = new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: `Metadata with name "${name}" already exists`,
    });

    queryMultiMock.mockResolvedValue([
      dsMockUtils.createMockOption(rawId),
      dsMockUtils.createMockOption(),
    ]);

    await expect(prepareRegisterMetadata.call(proc, params)).rejects.toThrowError(expectedError);

    queryMultiMock.mockResolvedValue([
      dsMockUtils.createMockOption(),
      dsMockUtils.createMockOption(rawId),
    ]);

    await expect(prepareRegisterMetadata.call(proc, params)).rejects.toThrowError(expectedError);
  });

  it('should return a register asset metadata local type transaction spec', async () => {
    queryMultiMock.mockResolvedValue([
      dsMockUtils.createMockOption(),
      dsMockUtils.createMockOption(),
    ]);

    const proc = procedureMockUtils.getInstance<Params, MetadataEntry>(mockContext);

    const result = await prepareRegisterMetadata.call(proc, params);

    expect(result).toEqual({
      transaction: registerAssetMetadataLocalTypeTxMock,
      args: [rawAssetId, rawName, rawSpecs],
      resolver: expect.any(Function),
    });
  });

  it('should return a register and set local asset metadata transaction spec', async () => {
    const metadataValueToMeshMetadataValueSpy = jest.spyOn(
      utilsConversionModule,
      'metadataValueToMeshMetadataValue'
    );
    const rawValue = dsMockUtils.createMockBytes('SOME_VALUE');
    metadataValueToMeshMetadataValueSpy.mockReturnValue(rawValue);

    const metadataValueDetailToMeshMetadataValueDetailSpy = jest.spyOn(
      utilsConversionModule,
      'metadataValueDetailToMeshMetadataValueDetail'
    );
    const rawValueDetail = dsMockUtils.createMockAssetMetadataValueDetail({
      lockStatus: dsMockUtils.createMockAssetMetadataLockStatus({
        lockStatus: 'LockedUntil',
        lockedUntil: new Date('2025/01/01'),
      }),
      expire: dsMockUtils.createMockOption(),
    });
    metadataValueDetailToMeshMetadataValueDetailSpy.mockReturnValue(rawValueDetail);

    queryMultiMock.mockResolvedValue([
      dsMockUtils.createMockOption(),
      dsMockUtils.createMockOption(),
    ]);

    params = {
      ...params,
      value: 'SOME_VALUE',
    };

    const proc = procedureMockUtils.getInstance<Params, MetadataEntry>(mockContext);

    let result = await prepareRegisterMetadata.call(proc, params);

    expect(result).toEqual({
      transaction: registerAndSetLocalAssetMetadataMock,
      args: [rawAssetId, rawName, rawSpecs, rawValue, null],
      resolver: expect.any(Function),
    });

    result = await prepareRegisterMetadata.call(proc, {
      ...params,
      details: {
        expiry: null,
        lockStatus: MetadataLockStatus.LockedUntil,
        lockedUntil: new Date('2025/01/01'),
      },
    });

    expect(result).toEqual({
      transaction: registerAndSetLocalAssetMetadataMock,
      args: [rawAssetId, rawName, rawSpecs, rawValue, rawValueDetail],
      resolver: expect.any(Function),
    });
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<Params, MetadataEntry>(mockContext);

      const boundFunc = getAuthorization.bind(proc);

      expect(boundFunc(params)).toEqual({
        permissions: {
          transactions: [TxTags.asset.RegisterAssetMetadataLocalType],
          assets: [expect.objectContaining({ id: assetId })],
          portfolios: [],
        },
      });

      expect(boundFunc({ ...params, value: 'SOME_VALUE' })).toEqual({
        permissions: {
          transactions: [TxTags.asset.RegisterAndSetLocalAssetMetadata],
          assets: [expect.objectContaining({ id: assetId })],
          portfolios: [],
        },
      });
    });
  });

  describe('createMetadataResolver', () => {
    let filterEventRecordsSpy: jest.SpyInstance;
    let u64ToBigNumberSpy: jest.SpyInstance;
    const id = new BigNumber(10);
    const rawId = dsMockUtils.createMockU64(id);

    beforeAll(() => {
      entityMockUtils.initMocks({
        instructionOptions: {
          id,
        },
      });

      filterEventRecordsSpy = jest.spyOn(utilsInternalModule, 'filterEventRecords');
      u64ToBigNumberSpy = jest.spyOn(utilsConversionModule, 'u64ToBigNumber');
    });

    beforeEach(() => {
      filterEventRecordsSpy.mockReturnValue([
        dsMockUtils.createMockIEvent(['someIdentity', 'someTicker', 'someName', rawId]),
      ]);
      when(u64ToBigNumberSpy).calledWith(rawId).mockReturnValue(id);
    });

    afterEach(() => {
      filterEventRecordsSpy.mockReset();
    });

    it('should return the new MetadataEntry', () => {
      const fakeContext = {} as Context;

      const result = createMetadataResolver(assetId, fakeContext)({} as ISubmittableResult);

      expect(result).toEqual(
        expect.objectContaining({
          id,
          asset: expect.objectContaining({ id: assetId }),
          type: MetadataType.Local,
        })
      );
    });
  });
});
