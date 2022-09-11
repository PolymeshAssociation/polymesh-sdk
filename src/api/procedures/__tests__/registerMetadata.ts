import { Bytes, Option, u32 } from '@polkadot/types';
import {
  PolymeshPrimitivesAssetMetadataAssetMetadataSpec,
  PolymeshPrimitivesAssetMetadataAssetMetadataValueDetail,
  PolymeshPrimitivesTicker,
} from '@polkadot/types/lookup';
import { ISubmittableResult } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';
import sinon from 'sinon';

import {
  createMetadataResolver,
  getAuthorization,
  Params,
  prepareRegisterMetadata,
} from '~/api/procedures/registerMetadata';
import { Context, MetadataEntry, PolymeshError } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { ErrorCode, MetadataLockStatus, MetadataType, TxTags } from '~/types';
import { PolymeshTx } from '~/types/internal';
import * as utilsConversionModule from '~/utils/conversion';
import * as utilsInternalModule from '~/utils/internal';

jest.mock(
  '~/api/entities/Asset',
  require('~/testUtils/mocks/entities').mockAssetModule('~/api/entities/Asset')
);
jest.mock(
  '~/api/entities/MetadataEntry',
  require('~/testUtils/mocks/entities').mockMetadataEntryModule('~/api/entities/MetadataEntry')
);

describe('registerMetadata procedure', () => {
  let mockContext: Mocked<Context>;
  let stringToTickerStub: sinon.SinonStub;
  let u32ToBigNumberStub: sinon.SinonStub;
  let stringToBytesStub: sinon.SinonStub;
  let metadataSpecToMeshMetadataSpecStub: sinon.SinonStub;

  let queryMultiStub: sinon.SinonStub;
  let ticker: string;
  let rawTicker: PolymeshPrimitivesTicker;
  let metadataNameMaxLength: BigNumber;
  let rawMetadataNameMaxLength: u32;
  let params: Params;
  let name: string;
  let rawName: Bytes;
  let rawSpecs: PolymeshPrimitivesAssetMetadataAssetMetadataSpec;
  let registerAssetMetadataLocalTypeTxStub: PolymeshTx<
    [PolymeshPrimitivesTicker, Bytes, PolymeshPrimitivesAssetMetadataAssetMetadataSpec]
  >;

  let registerAndSetLocalAssetMetadataStub: PolymeshTx<
    [
      PolymeshPrimitivesTicker,
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

    stringToTickerStub = sinon.stub(utilsConversionModule, 'stringToTicker');
    u32ToBigNumberStub = sinon.stub(utilsConversionModule, 'u32ToBigNumber');
    stringToBytesStub = sinon.stub(utilsConversionModule, 'stringToBytes');
    metadataSpecToMeshMetadataSpecStub = sinon.stub(
      utilsConversionModule,
      'metadataSpecToMeshMetadataSpec'
    );
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    ticker = 'SOME_TICKER';
    rawTicker = dsMockUtils.createMockTicker(ticker);

    stringToTickerStub.withArgs(ticker, mockContext).returns(rawTicker);

    metadataNameMaxLength = new BigNumber(15);
    rawMetadataNameMaxLength = dsMockUtils.createMockU32(metadataNameMaxLength);

    dsMockUtils.setConstMock('asset', 'assetMetadataNameMaxLength', {
      returnValue: rawMetadataNameMaxLength,
    });

    u32ToBigNumberStub.withArgs(rawMetadataNameMaxLength).returns(metadataNameMaxLength);

    name = 'SOME_NAME';
    rawName = dsMockUtils.createMockBytes(name);
    stringToBytesStub.withArgs(name, mockContext).returns(rawName);

    rawSpecs = dsMockUtils.createMockAssetMetadataSpec();
    metadataSpecToMeshMetadataSpecStub.returns(rawSpecs);

    params = {
      ticker,
      name,
      specs: {},
    };
    dsMockUtils.createQueryStub('asset', 'assetMetadataGlobalNameToKey');
    dsMockUtils.createQueryStub('asset', 'assetMetadataLocalNameToKey');
    queryMultiStub = dsMockUtils.getQueryMultiStub();
    registerAssetMetadataLocalTypeTxStub = dsMockUtils.createTxStub(
      'asset',
      'registerAssetMetadataLocalType'
    );
    registerAndSetLocalAssetMetadataStub = dsMockUtils.createTxStub(
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
    sinon.restore();
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

    queryMultiStub.resolves([dsMockUtils.createMockOption(rawId), dsMockUtils.createMockOption()]);

    await expect(prepareRegisterMetadata.call(proc, params)).rejects.toThrowError(expectedError);

    queryMultiStub.resolves([dsMockUtils.createMockOption(), dsMockUtils.createMockOption(rawId)]);

    await expect(prepareRegisterMetadata.call(proc, params)).rejects.toThrowError(expectedError);
  });

  it('should return a register asset metadata local type transaction spec', async () => {
    queryMultiStub.resolves([dsMockUtils.createMockOption(), dsMockUtils.createMockOption()]);

    const proc = procedureMockUtils.getInstance<Params, MetadataEntry>(mockContext);

    const result = await prepareRegisterMetadata.call(proc, params);

    expect(result).toEqual({
      transaction: registerAssetMetadataLocalTypeTxStub,
      args: [rawTicker, rawName, rawSpecs],
      resolver: expect.any(Function),
    });
  });

  it('should return a register and set local asset metadata transaction spec', async () => {
    const metadataValueToMeshMetadataValueStub = sinon.stub(
      utilsConversionModule,
      'metadataValueToMeshMetadataValue'
    );
    const rawValue = dsMockUtils.createMockBytes('SOME_VALUE');
    metadataValueToMeshMetadataValueStub.returns(rawValue);

    const metadataValueDetailToMeshMetadataValueDetailStub = sinon.stub(
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
    metadataValueDetailToMeshMetadataValueDetailStub.returns(rawValueDetail);

    queryMultiStub.resolves([dsMockUtils.createMockOption(), dsMockUtils.createMockOption()]);

    params = {
      ...params,
      value: 'SOME_VALUE',
    };

    const proc = procedureMockUtils.getInstance<Params, MetadataEntry>(mockContext);

    let result = await prepareRegisterMetadata.call(proc, params);

    expect(result).toEqual({
      transaction: registerAndSetLocalAssetMetadataStub,
      args: [rawTicker, rawName, rawSpecs, rawValue, null],
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
      transaction: registerAndSetLocalAssetMetadataStub,
      args: [rawTicker, rawName, rawSpecs, rawValue, rawValueDetail],
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
          assets: [expect.objectContaining({ ticker })],
          portfolios: [],
        },
      });

      expect(boundFunc({ ...params, value: 'SOME_VALUE' })).toEqual({
        permissions: {
          transactions: [TxTags.asset.RegisterAndSetLocalAssetMetadata],
          assets: [expect.objectContaining({ ticker })],
          portfolios: [],
        },
      });
    });
  });

  describe('createMetadataResolver', () => {
    let filterEventRecordsStub: sinon.SinonStub;
    let u64ToBigNumberStub: sinon.SinonStub;
    const id = new BigNumber(10);
    const rawId = dsMockUtils.createMockU64(id);

    beforeAll(() => {
      entityMockUtils.initMocks({
        instructionOptions: {
          id,
        },
      });

      filterEventRecordsStub = sinon.stub(utilsInternalModule, 'filterEventRecords');
      u64ToBigNumberStub = sinon.stub(utilsConversionModule, 'u64ToBigNumber');
    });

    beforeEach(() => {
      filterEventRecordsStub.returns([
        dsMockUtils.createMockIEvent(['someIdentity', 'someTicker', 'someName', rawId]),
      ]);
      u64ToBigNumberStub.withArgs(rawId).returns(id);
    });

    afterEach(() => {
      filterEventRecordsStub.reset();
    });

    it('should return the new MetadataEntry', () => {
      const fakeContext = {} as Context;

      const result = createMetadataResolver(ticker, fakeContext)({} as ISubmittableResult);

      expect(result).toEqual(
        expect.objectContaining({
          id,
          asset: expect.objectContaining({ ticker }),
          type: MetadataType.Local,
        })
      );
    });
  });
});
