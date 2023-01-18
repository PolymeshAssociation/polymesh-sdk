import { AccountId } from '@polkadot/types/interfaces';
import { PolymeshPrimitivesSecondaryKey } from '@polkadot/types/lookup';
import { ISubmittableResult } from '@polkadot/types/types';
import { when } from 'jest-when';

import {
  createRegisterIdentityResolver,
  prepareRegisterIdentity,
} from '~/api/procedures/registerIdentity';
import { Context, Identity } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { PermissionedAccount, RegisterIdentityParams } from '~/types';
import { PolymeshTx } from '~/types/internal';
import * as utilsConversionModule from '~/utils/conversion';
import * as utilsInternalModule from '~/utils/internal';

describe('registerIdentity procedure', () => {
  let mockContext: Mocked<Context>;
  let stringToAccountIdSpy: jest.SpyInstance<AccountId, [string, Context]>;
  let secondaryAccountToMeshSecondaryKeySpy: jest.SpyInstance<
    PolymeshPrimitivesSecondaryKey,
    [PermissionedAccount, Context]
  >;
  let registerIdentityTransaction: PolymeshTx<unknown[]>;

  beforeAll(() => {
    entityMockUtils.initMocks();
    procedureMockUtils.initMocks();
    dsMockUtils.initMocks();
    stringToAccountIdSpy = jest.spyOn(utilsConversionModule, 'stringToAccountId');
    secondaryAccountToMeshSecondaryKeySpy = jest.spyOn(
      utilsConversionModule,
      'secondaryAccountToMeshSecondaryKey'
    );
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    registerIdentityTransaction = dsMockUtils.createTxMock('identity', 'cddRegisterDid');
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

  it('should return a cddRegisterIdentity transaction spec', async () => {
    const targetAccount = 'someAccount';
    const secondaryAccounts = [
      {
        account: entityMockUtils.getAccountInstance({ address: 'someValue' }),
        permissions: {
          assets: null,
          portfolios: null,
          transactions: null,
          transactionGroups: [],
        },
      },
    ];
    const args = {
      targetAccount,
      secondaryAccounts,
    };
    const rawAccountId = dsMockUtils.createMockAccountId(targetAccount);
    const rawSecondaryAccount = dsMockUtils.createMockSecondaryKey({
      signer: dsMockUtils.createMockSignatory({
        Account: dsMockUtils.createMockAccountId(secondaryAccounts[0].account.address),
      }),
      permissions: dsMockUtils.createMockPermissions(),
    });

    const proc = procedureMockUtils.getInstance<RegisterIdentityParams, Identity>(mockContext);

    when(stringToAccountIdSpy).calledWith(targetAccount, mockContext).mockReturnValue(rawAccountId);
    when(secondaryAccountToMeshSecondaryKeySpy)
      .calledWith(secondaryAccounts[0], mockContext)
      .mockReturnValue(rawSecondaryAccount);

    let result = await prepareRegisterIdentity.call(proc, args);

    expect(result).toEqual({
      transaction: registerIdentityTransaction,
      args: [rawAccountId, [rawSecondaryAccount]],
      resolver: expect.any(Function),
    });

    result = await prepareRegisterIdentity.call(proc, { targetAccount });

    expect(result).toEqual({
      transaction: registerIdentityTransaction,
      args: [rawAccountId, []],
      resolver: expect.any(Function),
    });
  });
});

describe('createRegisterIdentityResolver', () => {
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

    const result = createRegisterIdentityResolver(fakeContext)({} as ISubmittableResult);

    expect(result.did).toEqual(did);
  });
});
