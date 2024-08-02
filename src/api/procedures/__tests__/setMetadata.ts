import { Bytes, Option } from '@polkadot/types';
import {
  PolymeshPrimitivesAssetAssetID,
  PolymeshPrimitivesAssetMetadataAssetMetadataKey,
  PolymeshPrimitivesAssetMetadataAssetMetadataValueDetail,
} from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import { getAuthorization, Params, prepareSetMetadata } from '~/api/procedures/setMetadata';
import { Context, MetadataEntry, PolymeshError } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { ErrorCode, MetadataLockStatus, MetadataType, TxTags } from '~/types';
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

describe('setMetadata procedure', () => {
  let mockContext: Mocked<Context>;
  let assetToMeshAssetIdSpy: jest.SpyInstance;
  let metadataToMeshMetadataKeySpy: jest.SpyInstance;
  let metadataValueDetailToMeshMetadataValueDetailSpy: jest.SpyInstance;

  let assetId: string;
  let id: BigNumber;
  let type: MetadataType;
  let rawAssetId: PolymeshPrimitivesAssetAssetID;
  let rawMetadataKey: PolymeshPrimitivesAssetMetadataAssetMetadataKey;
  let params: Params;
  let setAssetMetadataMock: PolymeshTx<
    [
      PolymeshPrimitivesAssetAssetID,
      PolymeshPrimitivesAssetMetadataAssetMetadataKey,
      Bytes,
      Option<PolymeshPrimitivesAssetMetadataAssetMetadataValueDetail>
    ]
  >;

  let setAssetMetadataDetailsMock: PolymeshTx<
    [
      PolymeshPrimitivesAssetAssetID,
      PolymeshPrimitivesAssetMetadataAssetMetadataKey,
      PolymeshPrimitivesAssetMetadataAssetMetadataValueDetail
    ]
  >;
  let metadataEntry: MetadataEntry;
  let lockedUntil: Date;
  let rawValueDetail: PolymeshPrimitivesAssetMetadataAssetMetadataValueDetail;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();

    assetToMeshAssetIdSpy = jest.spyOn(utilsConversionModule, 'assetToMeshAssetId');
    metadataToMeshMetadataKeySpy = jest.spyOn(utilsConversionModule, 'metadataToMeshMetadataKey');
    metadataValueDetailToMeshMetadataValueDetailSpy = jest.spyOn(
      utilsConversionModule,
      'metadataValueDetailToMeshMetadataValueDetail'
    );
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    assetId = '0x1234';
    rawAssetId = dsMockUtils.createMockAssetId(assetId);

    id = new BigNumber(1);
    type = MetadataType.Local;

    metadataEntry = entityMockUtils.getMetadataEntryInstance({
      id,
      type,
      assetId,
      value: {
        value: 'OLD_VALUE',
        expiry: null,
        lockStatus: MetadataLockStatus.LockedUntil,
        lockedUntil: new Date('1987/01/01'),
      },
    });

    when(assetToMeshAssetIdSpy)
      .calledWith(expect.objectContaining({ id: assetId }), mockContext)
      .mockReturnValue(rawAssetId);

    rawMetadataKey = dsMockUtils.createMockAssetMetadataKey({
      Local: dsMockUtils.createMockU64(id),
    });
    when(metadataToMeshMetadataKeySpy)
      .calledWith(type, id, mockContext)
      .mockReturnValue(rawMetadataKey);

    lockedUntil = new Date('2030/01/01');
    rawValueDetail = dsMockUtils.createMockAssetMetadataValueDetail({
      lockStatus: dsMockUtils.createMockAssetMetadataLockStatus({
        lockStatus: 'LockedUntil',
        lockedUntil,
      }),
      expire: dsMockUtils.createMockOption(),
    });
    metadataValueDetailToMeshMetadataValueDetailSpy.mockReturnValue(rawValueDetail);

    setAssetMetadataMock = dsMockUtils.createTxMock('asset', 'setAssetMetadata');
    setAssetMetadataDetailsMock = dsMockUtils.createTxMock('asset', 'setAssetMetadataDetails');
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

  it('should throw an error if MetadataEntry status is Locked', () => {
    params = {
      metadataEntry: entityMockUtils.getMetadataEntryInstance({
        id,
        type,
        assetId,
        value: {
          lockStatus: MetadataLockStatus.Locked,
        },
      }),
      value: 'SOME_VALUE',
    };
    const proc = procedureMockUtils.getInstance<Params, MetadataEntry>(mockContext);

    const expectedError = new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'You cannot set details of a locked Metadata',
    });

    return expect(prepareSetMetadata.call(proc, params)).rejects.toThrowError(expectedError);
  });

  it('should throw an error if MetadataEntry is still in locked phase', () => {
    params = {
      metadataEntry: entityMockUtils.getMetadataEntryInstance({
        id,
        type,
        assetId,
        value: {
          lockStatus: MetadataLockStatus.LockedUntil,
          lockedUntil,
        },
      }),
      value: 'SOME_VALUE',
    };
    const proc = procedureMockUtils.getInstance<Params, MetadataEntry>(mockContext);

    const expectedError = new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'Metadata is currently locked',
      data: {
        lockedUntil,
      },
    });

    return expect(prepareSetMetadata.call(proc, params)).rejects.toThrowError(expectedError);
  });

  it('should throw an error if MetadataEntry value details are being set without specifying the value', () => {
    params = {
      metadataEntry: entityMockUtils.getMetadataEntryInstance({ id, type, assetId, value: null }),
      details: {
        expiry: null,
        lockStatus: MetadataLockStatus.Unlocked,
      },
    };

    const proc = procedureMockUtils.getInstance<Params, MetadataEntry>(mockContext);

    const expectedError = new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Metadata value details cannot be set for a metadata with no value',
    });

    return expect(prepareSetMetadata.call(proc, params)).rejects.toThrowError(expectedError);
  });

  it('should return a set asset metadata transaction spec', async () => {
    const proc = procedureMockUtils.getInstance<Params, MetadataEntry>(mockContext);

    params = {
      value: 'SOME_VALUE',
      metadataEntry,
    };
    const metadataValueToMeshMetadataValueSpy = jest.spyOn(
      utilsConversionModule,
      'metadataValueToMeshMetadataValue'
    );
    const rawValue = dsMockUtils.createMockBytes('SOME_VALUE');
    metadataValueToMeshMetadataValueSpy.mockReturnValue(rawValue);

    let result = await prepareSetMetadata.call(proc, params);

    const fakeResult = expect.objectContaining({
      id,
      type,
      asset: expect.objectContaining({ id: assetId }),
    });

    expect(result).toEqual({
      transaction: setAssetMetadataMock,
      args: [rawAssetId, rawMetadataKey, rawValue, null],
      resolver: fakeResult,
    });

    result = await prepareSetMetadata.call(proc, {
      ...params,
      details: {
        expiry: null,
        lockStatus: MetadataLockStatus.LockedUntil,
        lockedUntil,
      },
    });

    expect(result).toEqual({
      transaction: setAssetMetadataMock,
      args: [rawAssetId, rawMetadataKey, rawValue, rawValueDetail],
      resolver: fakeResult,
    });
  });

  it('should return a set asset metadata details transaction spec', async () => {
    const proc = procedureMockUtils.getInstance<Params, MetadataEntry>(mockContext);

    params = {
      metadataEntry,
      details: {
        expiry: null,
        lockStatus: MetadataLockStatus.LockedUntil,
        lockedUntil,
      },
    };

    const result = await prepareSetMetadata.call(proc, params);

    const fakeResult = expect.objectContaining({
      id,
      type,
      asset: expect.objectContaining({ id: assetId }),
    });

    expect(result).toEqual({
      transaction: setAssetMetadataDetailsMock,
      args: [rawAssetId, rawMetadataKey, rawValueDetail],
      resolver: fakeResult,
    });
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<Params, MetadataEntry>(mockContext);

      const boundFunc = getAuthorization.bind(proc);

      params = {
        metadataEntry,
        details: { expiry: null, lockStatus: MetadataLockStatus.Unlocked },
      };

      expect(boundFunc(params)).toEqual({
        permissions: {
          transactions: [TxTags.asset.SetAssetMetadataDetails],
          assets: [expect.objectContaining({ id: assetId })],
          portfolios: [],
        },
      });

      expect(boundFunc({ ...params, value: 'SOME_VALUE' })).toEqual({
        permissions: {
          transactions: [TxTags.asset.SetAssetMetadata],
          assets: [expect.objectContaining({ id: assetId })],
          portfolios: [],
        },
      });
    });
  });
});
