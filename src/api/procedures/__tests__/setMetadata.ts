import { Bytes, Option } from '@polkadot/types';
import {
  PolymeshPrimitivesAssetMetadataAssetMetadataKey,
  PolymeshPrimitivesAssetMetadataAssetMetadataValueDetail,
  PolymeshPrimitivesTicker,
} from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import sinon from 'sinon';

import { getAuthorization, Params, prepareSetMetadata } from '~/api/procedures/setMetadata';
import { Context, MetadataEntry, PolymeshError } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { ErrorCode, MetadataLockStatus, MetadataType, TxTags } from '~/types';
import { PolymeshTx } from '~/types/internal';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Asset',
  require('~/testUtils/mocks/entities').mockAssetModule('~/api/entities/Asset')
);
jest.mock(
  '~/api/entities/MetadataEntry',
  require('~/testUtils/mocks/entities').mockMetadataEntryModule('~/api/entities/MetadataEntry')
);

describe('setMetadata procedure', () => {
  let mockContext: Mocked<Context>;
  let stringToTickerStub: sinon.SinonStub;
  let metadataToMeshMetadataKeyStub: sinon.SinonStub;
  let metadataValueDetailToMeshMetadataValueDetailStub: sinon.SinonStub;

  let ticker: string;
  let id: BigNumber;
  let type: MetadataType;
  let rawTicker: PolymeshPrimitivesTicker;
  let rawMetadataKey: PolymeshPrimitivesAssetMetadataAssetMetadataKey;
  let params: Params;
  let setAssetMetadataStub: PolymeshTx<
    [
      PolymeshPrimitivesTicker,
      PolymeshPrimitivesAssetMetadataAssetMetadataKey,
      Bytes,
      Option<PolymeshPrimitivesAssetMetadataAssetMetadataValueDetail>
    ]
  >;

  let setAssetMetadataDetailsStub: PolymeshTx<
    [
      PolymeshPrimitivesTicker,
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

    stringToTickerStub = sinon.stub(utilsConversionModule, 'stringToTicker');
    metadataToMeshMetadataKeyStub = sinon.stub(utilsConversionModule, 'metadataToMeshMetadataKey');
    metadataValueDetailToMeshMetadataValueDetailStub = sinon.stub(
      utilsConversionModule,
      'metadataValueDetailToMeshMetadataValueDetail'
    );
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    ticker = 'SOME_TICKER';
    rawTicker = dsMockUtils.createMockTicker(ticker);

    id = new BigNumber(1);
    type = MetadataType.Local;

    entityMockUtils.configureMocks({
      metadataEntryOptions: {
        value: {
          value: 'OLD_VALUE',
          expiry: null,
          lockStatus: MetadataLockStatus.LockedUntil,
          lockedUntil: new Date('1987/01/01'),
        },
      },
    });

    metadataEntry = new MetadataEntry({ id, type, ticker }, mockContext);

    stringToTickerStub.withArgs(ticker, mockContext).returns(rawTicker);

    rawMetadataKey = dsMockUtils.createMockAssetMetadataKey({
      Local: dsMockUtils.createMockU64(id),
    });
    metadataToMeshMetadataKeyStub.withArgs(type, id, mockContext).returns(rawMetadataKey);

    lockedUntil = new Date('2030/01/01');
    rawValueDetail = dsMockUtils.createMockAssetMetadataValueDetail({
      lockStatus: dsMockUtils.createMockAssetMetadataLockStatus({
        lockStatus: 'LockedUntil',
        lockedUntil,
      }),
      expire: dsMockUtils.createMockOption(),
    });
    metadataValueDetailToMeshMetadataValueDetailStub.returns(rawValueDetail);

    setAssetMetadataStub = dsMockUtils.createTxStub('asset', 'setAssetMetadata');
    setAssetMetadataDetailsStub = dsMockUtils.createTxStub('asset', 'setAssetMetadataDetails');
  });

  afterEach(() => {
    entityMockUtils.reset();
    procedureMockUtils.reset();
    dsMockUtils.reset();
    sinon.restore();
  });

  afterAll(() => {
    procedureMockUtils.cleanup();
    dsMockUtils.cleanup();
  });

  it('should throw an error if MetadataEntry status is Locked', () => {
    entityMockUtils.configureMocks({
      metadataEntryOptions: {
        value: {
          lockStatus: MetadataLockStatus.Locked,
        },
      },
    });
    params = {
      metadataEntry: new MetadataEntry({ id, type, ticker }, mockContext),
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
    entityMockUtils.configureMocks({
      metadataEntryOptions: {
        value: {
          lockStatus: MetadataLockStatus.LockedUntil,
          lockedUntil,
        },
      },
    });
    params = {
      metadataEntry: new MetadataEntry({ id, type, ticker }, mockContext),
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
    entityMockUtils.configureMocks({
      metadataEntryOptions: {
        value: null,
      },
    });

    params = {
      metadataEntry: new MetadataEntry({ id, type, ticker }, mockContext),
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
    const metadataValueToMeshMetadataValueStub = sinon.stub(
      utilsConversionModule,
      'metadataValueToMeshMetadataValue'
    );
    const rawValue = dsMockUtils.createMockBytes('SOME_VALUE');
    metadataValueToMeshMetadataValueStub.returns(rawValue);

    let result = await prepareSetMetadata.call(proc, params);

    const fakeResult = expect.objectContaining({
      id,
      type,
      asset: expect.objectContaining({ ticker }),
    });

    expect(result).toEqual({
      transaction: setAssetMetadataStub,
      args: [rawTicker, rawMetadataKey, rawValue, null],
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
      transaction: setAssetMetadataStub,
      args: [rawTicker, rawMetadataKey, rawValue, rawValueDetail],
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
      asset: expect.objectContaining({ ticker }),
    });

    expect(result).toEqual({
      transaction: setAssetMetadataDetailsStub,
      args: [rawTicker, rawMetadataKey, rawValueDetail],
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
          assets: [expect.objectContaining({ ticker })],
          portfolios: [],
        },
      });

      expect(boundFunc({ ...params, value: 'SOME_VALUE' })).toEqual({
        permissions: {
          transactions: [TxTags.asset.SetAssetMetadata],
          assets: [expect.objectContaining({ ticker })],
          portfolios: [],
        },
      });
    });
  });
});
