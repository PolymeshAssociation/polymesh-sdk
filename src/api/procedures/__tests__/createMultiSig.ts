import { ISubmittableResult } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';

import { MultiSig } from '~/api/entities/Account/MultiSig';
import {
  createMultiSigResolver,
  prepareCreateMultiSigAccount,
} from '~/api/procedures/createMultiSig';
import { Context, PolymeshError } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { CreateMultiSigParams, ErrorCode, TxGroup } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';
import * as utilsInternalModule from '~/utils/internal';

describe('createMultiSig procedure', () => {
  let mockContext: Mocked<Context>;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    jest.spyOn(utilsInternalModule, 'assertAddressValid').mockImplementation();
    jest.spyOn(utilsConversionModule, 'addressToKey').mockImplementation();
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
  });

  afterEach(() => {
    entityMockUtils.reset();
    procedureMockUtils.reset();
    dsMockUtils.reset();
  });

  afterAll(() => {
    procedureMockUtils.cleanup();
    dsMockUtils.cleanup();
  });

  it('should add a create multiSig transaction to the queue', async () => {
    const proc = procedureMockUtils.getInstance<CreateMultiSigParams, MultiSig>(mockContext);
    const createMultiSigTransaction = dsMockUtils.createTxMock('multiSig', 'createMultisig');
    const mockAccount = entityMockUtils.getAccountInstance();

    const signers = [mockAccount];
    const requiredSignatures = new BigNumber(1);

    const rawSignatories = signers.map(s =>
      utilsConversionModule.signerToSignatory(s, mockContext)
    );
    const rawRequiredSignatures = utilsConversionModule.bigNumberToU64(
      requiredSignatures,
      mockContext
    );

    let result = await prepareCreateMultiSigAccount.call(proc, {
      signers,
      requiredSignatures,
    });

    expect(result).toEqual({
      transaction: createMultiSigTransaction,
      resolver: expect.any(Function),
      args: [rawSignatories, rawRequiredSignatures, null],
    });

    const rawPermissions = dsMockUtils.createMockPermissions();
    jest
      .spyOn(utilsConversionModule, 'permissionsToMeshPermissions')
      .mockReturnValue(rawPermissions);

    result = await prepareCreateMultiSigAccount.call(proc, {
      signers,
      requiredSignatures,
      permissions: {
        transactionGroups: [TxGroup.AssetManagement],
      },
    });

    expect(result).toEqual({
      transaction: createMultiSigTransaction,
      resolver: expect.any(Function),
      args: [rawSignatories, rawRequiredSignatures, rawPermissions],
    });
  });

  it('should throw an error if more signatures are required than signers', () => {
    const proc = procedureMockUtils.getInstance<CreateMultiSigParams, MultiSig>(mockContext);
    const mockAccount = entityMockUtils.getAccountInstance();

    const signers = [mockAccount];
    const requiredSignatures = new BigNumber(2);

    const expectedError = new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The number of required signatures should not exceed the number of signers',
    });

    return expect(
      prepareCreateMultiSigAccount.call(proc, {
        signers,
        requiredSignatures,
      })
    ).rejects.toThrowError(expectedError);
  });

  it('should throw an error if more Identity signers are provided', () => {
    const proc = procedureMockUtils.getInstance<CreateMultiSigParams, MultiSig>(mockContext);
    const mockIdentity = entityMockUtils.getIdentityInstance();

    const signers = [mockIdentity];
    const requiredSignatures = new BigNumber(1);

    const expectedError = new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'MultiSig signers must be accounts as of v7',
    });

    return expect(
      prepareCreateMultiSigAccount.call(proc, {
        signers,
        requiredSignatures,
      })
    ).rejects.toThrowError(expectedError);
  });
});

describe('createMultiSigResolver', () => {
  const filterEventRecordsSpy = jest.spyOn(utilsInternalModule, 'filterEventRecords');
  const did = 'someDid';
  const rawIdentityId = dsMockUtils.createMockIdentityId(did);
  const address = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';
  const rawAddress = dsMockUtils.createMockAccountId(address);

  beforeEach(() => {
    filterEventRecordsSpy.mockReturnValue([
      dsMockUtils.createMockIEvent([rawIdentityId, rawAddress]),
    ]);
  });

  afterEach(() => {
    jest.resetAllMocks();
    filterEventRecordsSpy.mockReset();
  });

  it('should return the new MultiSig', () => {
    const fakeContext = {} as Context;

    const multiSig = createMultiSigResolver(fakeContext)({} as ISubmittableResult);

    expect(multiSig.address).toEqual(address);
  });
});
