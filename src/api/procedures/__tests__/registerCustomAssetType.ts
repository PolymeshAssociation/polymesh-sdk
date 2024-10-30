import { Bytes, u32 } from '@polkadot/types';
import { ISubmittableResult } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import {
  createRegisterCustomAssetTypeResolver,
  prepareRegisterCustomAssetType,
  registerCustomAssetType,
} from '~/api/procedures/registerCustomAssetType';
import { Context, PolymeshError, Procedure } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { ErrorCode, RegisterCustomAssetTypeParams } from '~/types';
import { PolymeshTx } from '~/types/internal';
import * as utilsConversionModule from '~/utils/conversion';
import * as utilsInternalModule from '~/utils/internal';

describe('registerCustomAssetType procedure', () => {
  let mockContext: Mocked<Context>;
  let u32ToBigNumberSpy: jest.SpyInstance;
  let stringToBytesSpy: jest.SpyInstance;

  let customAssetTypeNameMaxLength: BigNumber;
  let rawCustomAssetTypeNameMaxLength: u32;
  let name: string;
  let rawName: Bytes;
  let registerCustomAssetTypeTxMock: PolymeshTx<[string]>;
  let params: RegisterCustomAssetTypeParams;

  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();
    procedureMockUtils.initMocks();

    stringToBytesSpy = jest.spyOn(utilsConversionModule, 'stringToBytes');
    u32ToBigNumberSpy = jest.spyOn(utilsConversionModule, 'u32ToBigNumber');
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();

    customAssetTypeNameMaxLength = new BigNumber(20);

    rawCustomAssetTypeNameMaxLength = dsMockUtils.createMockU32(customAssetTypeNameMaxLength);

    dsMockUtils.setConstMock('base', 'maxLen', {
      returnValue: rawCustomAssetTypeNameMaxLength,
    });

    when(u32ToBigNumberSpy)
      .calledWith(rawCustomAssetTypeNameMaxLength)
      .mockReturnValue(customAssetTypeNameMaxLength);

    name = 'SOME_ASSET_TYPE';
    rawName = dsMockUtils.createMockBytes(name);
    when(stringToBytesSpy).calledWith(name, mockContext).mockReturnValue(rawName);

    params = {
      name,
    };

    dsMockUtils.createQueryMock('asset', 'customTypesInverse');
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

  it('should throw an error if attempting to add a CustomAssetType with a name exceeding the max length', () => {
    params = {
      ...params,
      name: 'NAME_EXCEEDING_MAX_LENGTH',
    };
    const proc = procedureMockUtils.getInstance<RegisterCustomAssetTypeParams, BigNumber>(
      mockContext
    );

    const expectedError = new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Custom Asset type name length exceeded',
    });

    return expect(prepareRegisterCustomAssetType.call(proc, params)).rejects.toThrowError(
      expectedError
    );
  });

  it('should throw an error if attempting to add a CustomAssetType which is already present', async () => {
    const customAssetTypeId = new BigNumber(1);
    const rawId = dsMockUtils.createMockU32(customAssetTypeId);

    const proc = procedureMockUtils.getInstance<RegisterCustomAssetTypeParams, BigNumber>(
      mockContext
    );

    dsMockUtils.createQueryMock('asset', 'customTypesInverse', {
      returnValue: dsMockUtils.createMockOption(rawId),
    });

    const expectedError = new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: `The Custom Asset Type with "${name}" already exists`,
      data: {
        customAssetTypeId,
      },
    });

    await expect(prepareRegisterCustomAssetType.call(proc, params)).rejects.toThrowError(
      expectedError
    );
  });

  it('should return a register CustomAssetType transaction spec', async () => {
    dsMockUtils.createQueryMock('asset', 'customTypesInverse', {
      returnValue: dsMockUtils.createMockOption(),
    });

    registerCustomAssetTypeTxMock = dsMockUtils.createTxMock('asset', 'registerCustomAssetType');

    const proc = procedureMockUtils.getInstance<RegisterCustomAssetTypeParams, BigNumber>(
      mockContext
    );

    const result = await prepareRegisterCustomAssetType.call(proc, params);

    expect(result).toEqual({
      transaction: registerCustomAssetTypeTxMock,
      args: [rawName],
      resolver: expect.any(Function),
    });
  });

  describe('createRegisterCustomAssetTypeResolver', () => {
    const id = new BigNumber(10);
    const rawId = dsMockUtils.createMockU64(id);

    beforeEach(() => {
      jest.spyOn(utilsInternalModule, 'filterEventRecords').mockReturnValue([
        {
          data: ['someDid', rawId, 'Random Name'],
        },
      ]);

      when(u32ToBigNumberSpy).calledWith(rawId).mockReturnValue(id);
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should return the new id of the new CustomAssetType', () => {
      const fakeSubmittableResult = {} as ISubmittableResult;

      const resolver = createRegisterCustomAssetTypeResolver();
      const result = resolver(fakeSubmittableResult);

      expect(result).toEqual(id);
    });
  });

  describe('registerCustomAssetType procedure', () => {
    it('should return a Procedure with the appropriate roles and permissions', () => {
      const proc = registerCustomAssetType();

      expect(proc).toBeInstanceOf(Procedure);
    });
  });
});
