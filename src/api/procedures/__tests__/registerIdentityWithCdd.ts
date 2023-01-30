import { AccountId } from '@polkadot/types/interfaces';
import { PolymeshPrimitivesSecondaryKey } from '@polkadot/types/lookup';
import { ISubmittableResult } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import {
  createRegisterIdentityWithDidResolver,
  prepareRegisterIdentityWithCdd,
} from '~/api/procedures/registerIdentityWithCdd';
import { Context, Identity } from '~/internal';
import { Moment } from '~/polkadot';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { PermissionedAccount, RegisterIdentityWithCddParams } from '~/types';
import { PolymeshTx } from '~/types/internal';
import * as utilsConversionModule from '~/utils/conversion';
import * as utilsInternalModule from '~/utils/internal';

describe('registerIdentityWithCdd procedure', () => {
  let mockContext: Mocked<Context>;
  let stringToAccountIdSpy: jest.SpyInstance<AccountId, [string, Context]>;
  let dateToMomentSpy: jest.SpyInstance<Moment, [Date, Context]>;
  let secondaryAccountToMeshSecondaryKeySpy: jest.SpyInstance<
    PolymeshPrimitivesSecondaryKey,
    [PermissionedAccount, Context]
  >;
  let registerIdentityWithCddTransaction: PolymeshTx<unknown[]>;

  beforeAll(() => {
    entityMockUtils.initMocks();
    procedureMockUtils.initMocks();
    dsMockUtils.initMocks();
    secondaryAccountToMeshSecondaryKeySpy = jest.spyOn(
      utilsConversionModule,
      'secondaryAccountToMeshSecondaryKey'
    );
    stringToAccountIdSpy = jest.spyOn(utilsConversionModule, 'stringToAccountId');
    dateToMomentSpy = jest.spyOn(utilsConversionModule, 'dateToMoment');
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    registerIdentityWithCddTransaction = dsMockUtils.createTxMock(
      'identity',
      'cddRegisterDidWithCdd'
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
    const expiry = new Date('12/12/2050');
    const rawExpiry = dsMockUtils.createMockMoment(new BigNumber(expiry.getTime()));
    when(dateToMomentSpy).calledWith(expiry, mockContext).mockReturnValue(rawExpiry);
    const rawAccountId = dsMockUtils.createMockAccountId(targetAccount);
    const rawSecondaryAccount = dsMockUtils.createMockSecondaryKey({
      signer: dsMockUtils.createMockSignatory({
        Account: dsMockUtils.createMockAccountId(secondaryAccounts[0].account.address),
      }),
      permissions: dsMockUtils.createMockPermissions(),
    });

    const proc = procedureMockUtils.getInstance<RegisterIdentityWithCddParams, Identity>(
      mockContext
    );

    when(stringToAccountIdSpy).calledWith(targetAccount, mockContext).mockReturnValue(rawAccountId);
    when(secondaryAccountToMeshSecondaryKeySpy)
      .calledWith(secondaryAccounts[0], mockContext)
      .mockReturnValue(rawSecondaryAccount);

    let result = await prepareRegisterIdentityWithCdd.call(proc, args);

    expect(result).toEqual({
      transaction: registerIdentityWithCddTransaction,
      args: [rawAccountId, [rawSecondaryAccount], null],
      resolver: expect.any(Function),
    });

    result = await prepareRegisterIdentityWithCdd.call(proc, { targetAccount, expiry });

    expect(result).toEqual({
      transaction: registerIdentityWithCddTransaction,
      args: [rawAccountId, [], rawExpiry],
      resolver: expect.any(Function),
    });
  });
});

describe('createRegisterIdentityResolver', () => {
  const did = 'someDid';
  const rawDid = dsMockUtils.createMockIdentityId(did);
  const filterEventRecordsSpy = jest.spyOn(utilsInternalModule, 'filterEventRecords');

  beforeAll(() => {
    entityMockUtils.initMocks({
      identityOptions: {
        did,
      },
    });
  });

  beforeEach(() => {
    filterEventRecordsSpy.mockReturnValue([
      dsMockUtils.createMockIEvent([rawDid, 'accountId', 'signedItem']),
    ]);
  });

  afterEach(() => {
    filterEventRecordsSpy.mockReset();
  });

  it('should return the new Identity', () => {
    const fakeContext = {} as Context;

    const result = createRegisterIdentityWithDidResolver(fakeContext)({} as ISubmittableResult);

    expect(result.did).toEqual(did);
  });
});
