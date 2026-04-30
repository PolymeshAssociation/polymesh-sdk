import { ISubmittableResult } from '@polkadot/types/types';

import {
  createSelfRegisterDidResolver,
  getAuthorization,
  prepareSelfRegisterDid,
} from '~/api/procedures/selfRegisterDid';
import { Context, Identity, PolymeshError, Procedure } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { ErrorCode } from '~/types';
import { PolymeshTx } from '~/types/internal';
import * as utilsInternalModule from '~/utils/internal';

describe('selfRegisterDid procedure', () => {
  let mockContext: Mocked<Context>;
  let selfRegisterDidTransaction: PolymeshTx<unknown[]>;
  let proc: Procedure<void, Identity, Record<string, unknown>>;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance({ isV7: false });
    selfRegisterDidTransaction = dsMockUtils.createTxMock('identity', 'selfRegisterDid');
    proc = procedureMockUtils.getInstance<void, Identity>(mockContext);
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

  it('should return a selfRegisterDid transaction spec', async () => {
    const actingAccount = entityMockUtils.getAccountInstance({ getIdentity: null });

    mockContext.getActingAccount.mockResolvedValue(actingAccount);

    const result = await prepareSelfRegisterDid.call(proc);

    expect(result).toEqual({
      transaction: selfRegisterDidTransaction,
      resolver: expect.any(Function),
    });
  });

  it('should throw if called for chain v7', () => {
    mockContext = dsMockUtils.getContextInstance({ isV7: true });
    proc = procedureMockUtils.getInstance<void, Identity>(mockContext);

    const expectedError = new PolymeshError({
      code: ErrorCode.NotSupported,
      message: 'selfRegisterDid is only supported in chain v8',
    });

    return expect(prepareSelfRegisterDid.call(proc)).rejects.toThrow(expectedError);
  });

  it('should throw if the signing Account already has an Identity', () => {
    const actingAccount = entityMockUtils.getAccountInstance({
      getIdentity: entityMockUtils.getIdentityInstance(),
    });

    mockContext.getActingAccount.mockResolvedValue(actingAccount);

    const expectedError = new PolymeshError({
      code: ErrorCode.NoDataChange,
      message: 'The signing Account already has an Identity',
    });

    return expect(prepareSelfRegisterDid.call(proc)).rejects.toThrow(expectedError);
  });

  describe('getAuthorization', () => {
    it('should return signer permissions bypass', () => {
      const boundFunc = getAuthorization.bind(proc);

      expect(boundFunc()).toEqual({
        signerPermissions: true,
      });
    });
  });
});

describe('createSelfRegisterDidResolver', () => {
  const filterEventRecordsSpy = jest.spyOn(utilsInternalModule, 'filterEventRecords');
  const did = 'someDid';
  const rawDid = dsMockUtils.createMockIdentityId(did);

  beforeAll(() => {
    entityMockUtils.initMocks({
      identityOptions: {
        did,
      },
    });
  });

  beforeEach(() => {
    filterEventRecordsSpy.mockReturnValue([
      dsMockUtils.createMockIEvent([rawDid, 'accountId', 'signingItem']),
    ]);
  });

  afterEach(() => {
    filterEventRecordsSpy.mockReset();
  });

  it('should return the new Identity', () => {
    const fakeContext = {} as Context;

    const result = createSelfRegisterDidResolver(fakeContext)({} as ISubmittableResult);

    expect(result.did).toEqual(did);
  });
});
