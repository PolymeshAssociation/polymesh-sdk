import { AccountId } from '@polkadot/types/interfaces';
import { ISubmittableResult } from '@polkadot/types/types';
import { when } from 'jest-when';

import {
  createRegisterDidResolver,
  prepareRegisterDid,
  registerDid,
} from '~/api/procedures/registerDid';
import { Context, Identity, PolymeshError, Procedure } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { ErrorCode, RegisterDidParams, RoleType, TxTags } from '~/types';
import { PolymeshTx } from '~/types/internal';
import * as utilsConversionModule from '~/utils/conversion';
import * as utilsInternalModule from '~/utils/internal';

jest.mock(
  '~/api/entities/Account',
  require('~/testUtils/mocks/entities').mockAccountModule('~/api/entities/Account')
);

describe('registerDid procedure', () => {
  const targetAccount = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';
  const rawAccountId = dsMockUtils.createMockAccountId(targetAccount);

  let mockContext: Mocked<Context>;
  let stringToAccountIdSpy: jest.SpyInstance<AccountId, [string, Context]>;
  let registerDidTransaction: PolymeshTx<unknown[]>;
  let proc: Procedure<RegisterDidParams, Identity, Record<string, unknown>>;

  beforeAll(() => {
    entityMockUtils.initMocks();
    procedureMockUtils.initMocks();
    dsMockUtils.initMocks();
    stringToAccountIdSpy = jest.spyOn(utilsConversionModule, 'stringToAccountId');
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    registerDidTransaction = dsMockUtils.createTxMock('identity', 'registerDid');
    proc = procedureMockUtils.getInstance<RegisterDidParams, Identity>(mockContext);
    jest.spyOn(utilsInternalModule, 'assertAddressValid').mockImplementation();
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

  it('should return a registerDid transaction spec', async () => {
    entityMockUtils.configureMocks({
      accountOptions: {
        getIdentity: null,
      },
    });

    const args = {
      targetAccount,
    };

    when(stringToAccountIdSpy).calledWith(targetAccount, mockContext).mockReturnValue(rawAccountId);

    const result = await prepareRegisterDid.call(proc, args);

    expect(result).toEqual({
      transaction: registerDidTransaction,
      args: [rawAccountId],
      resolver: expect.any(Function),
    });
  });

  it('should throw if the target Account already has an Identity', () => {
    const identity = entityMockUtils.getIdentityInstance({
      getPrimaryAccount: {
        account: entityMockUtils.getAccountInstance({ address: targetAccount }),
      },
    });

    entityMockUtils.getAccountInstance({ address: targetAccount, getIdentity: identity });

    const args = {
      targetAccount,
    };

    const expectedError = new PolymeshError({
      code: ErrorCode.NoDataChange,
      message: 'The target account already has an identity',
    });

    return expect(prepareRegisterDid.call(proc, args)).rejects.toThrow(expectedError);
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', async () => {
      const args = {
        targetAccount,
      };

      const result = await registerDid().requiredAuthorizations(args);

      expect(result).toEqual({
        roles: [{ type: RoleType.DidRegistrar }],
        permissions: {
          assets: [],
          portfolios: [],
          transactions: [TxTags.identity.RegisterDid],
        },
      });
    });
  });
});

describe('createRegisterDidResolver', () => {
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

    const result = createRegisterDidResolver(fakeContext)({} as ISubmittableResult);

    expect(result.did).toEqual(did);
  });
});
