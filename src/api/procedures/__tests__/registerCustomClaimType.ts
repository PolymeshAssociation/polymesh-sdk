import { Bytes, u32 } from '@polkadot/types';
import { ISubmittableResult } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import {
  createRegisterCustomClaimTypeResolver,
  Params,
  prepareRegisterCustomClaimType,
  registerCustomClaimType,
} from '~/api/procedures/registerCustomClaimType';
import { Context, PolymeshError, Procedure } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { ErrorCode } from '~/types';
import { PolymeshTx } from '~/types/internal';
import * as utilsConversionModule from '~/utils/conversion';
import * as utilsInternalModule from '~/utils/internal';

describe('registerCustomClaimType procedure', () => {
  let mockContext: Mocked<Context>;
  let u32ToBigNumberSpy: jest.SpyInstance;
  let stringToBytesSpy: jest.SpyInstance;

  let customClaimTypeNameMaxLength: BigNumber;
  let rawCustomClaimTypeNameMaxLength: u32;
  let params: Params;
  let name: string;
  let rawName: Bytes;
  let registerCustomClaimTypeTxMock: PolymeshTx<[string]>;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();

    u32ToBigNumberSpy = jest.spyOn(utilsConversionModule, 'u32ToBigNumber');
    stringToBytesSpy = jest.spyOn(utilsConversionModule, 'stringToBytes');
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    customClaimTypeNameMaxLength = new BigNumber(15);
    rawCustomClaimTypeNameMaxLength = dsMockUtils.createMockU32(customClaimTypeNameMaxLength);

    dsMockUtils.setConstMock('base', 'maxLen', {
      returnValue: rawCustomClaimTypeNameMaxLength,
    });

    when(u32ToBigNumberSpy)
      .calledWith(rawCustomClaimTypeNameMaxLength)
      .mockReturnValue(customClaimTypeNameMaxLength);

    name = 'SOME_NAME';
    rawName = dsMockUtils.createMockBytes(name);
    when(stringToBytesSpy).calledWith(name, mockContext).mockReturnValue(rawName);

    params = {
      name,
    };

    dsMockUtils.createQueryMock('identity', 'customClaimsInverse');
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

  it('should throw an error if attempting to add a CustomClaimType already present', () => {
    params = {
      ...params,
      name: 'NAME_EXCEEDING_MAX_LENGTH',
    };
    const proc = procedureMockUtils.getInstance<Params, BigNumber>(mockContext);

    const expectedError = new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'CustomClaimType name length exceeded',
      data: {
        maxLength: customClaimTypeNameMaxLength,
      },
    });

    return expect(prepareRegisterCustomClaimType.call(proc, params)).rejects.toThrowError(
      expectedError
    );
  });

  it('should throw an error if attempting to register a CustomClaimType with duplicate name', async () => {
    const rawId = dsMockUtils.createMockU32(new BigNumber(1));

    const proc = procedureMockUtils.getInstance<Params, BigNumber>(mockContext);

    dsMockUtils.createQueryMock('identity', 'customClaimsInverse', {
      returnValue: dsMockUtils.createMockOption(rawId),
    });

    const expectedError = new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: `The CustomClaimType with "${name}" already exists`,
    });

    await expect(prepareRegisterCustomClaimType.call(proc, params)).rejects.toThrowError(
      expectedError
    );
  });

  it('should return a register CustomClaimType transaction spec', async () => {
    dsMockUtils.createQueryMock('identity', 'customClaimsInverse', {
      returnValue: dsMockUtils.createMockOption(),
    });

    registerCustomClaimTypeTxMock = dsMockUtils.createTxMock('identity', 'registerCustomClaimType');

    const proc = procedureMockUtils.getInstance<Params, BigNumber>(mockContext);

    const result = await prepareRegisterCustomClaimType.call(proc, params);

    expect(result).toEqual({
      transaction: registerCustomClaimTypeTxMock,
      args: [name],
      resolver: expect.any(Function),
    });
  });

  describe('createRegisterCustomClaimTypeResolver', () => {
    const id = new BigNumber(10);
    const rawId = dsMockUtils.createMockU64(id);

    beforeEach(() => {
      jest.spyOn(utilsInternalModule, 'filterEventRecords').mockReturnValue([
        {
          data: ['ignoredData', rawId],
        },
      ]);

      jest.spyOn(utilsConversionModule, 'u64ToBigNumber').mockReturnValue(id);
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should return the new id of the new CustomClaimType', () => {
      const fakeSubmittableResult = {} as ISubmittableResult;

      const resolver = createRegisterCustomClaimTypeResolver();
      const result = resolver(fakeSubmittableResult);

      expect(result).toEqual(id);
    });
  });

  describe('registerCustomClaimType procedure', () => {
    it('should return a Procedure with the appropriate roles and permissions', () => {
      const proc = registerCustomClaimType();

      expect(proc).toBeInstanceOf(Procedure);
    });
  });
});
