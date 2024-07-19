import { AccountId } from '@polkadot/types/interfaces';
import { PolymeshPrimitivesSecondaryKey } from '@polkadot/types/lookup';
import { ISubmittableResult } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import {
  createRegisterIdentityResolver,
  prepareRegisterIdentity,
} from '~/api/procedures/registerIdentity';
import { Context, Identity, PolymeshError, Procedure } from '~/internal';
import { Moment } from '~/polkadot';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { ErrorCode, PermissionedAccount, RegisterIdentityParams } from '~/types';
import { PolymeshTx } from '~/types/internal';
import * as utilsConversionModule from '~/utils/conversion';
import * as utilsInternalModule from '~/utils/internal';

jest.mock(
  '~/api/entities/Account',
  require('~/testUtils/mocks/entities').mockAccountModule('~/api/entities/Account')
);

describe('registerIdentity procedure', () => {
  const targetAccount = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';
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
  const rawAccountId = dsMockUtils.createMockAccountId(targetAccount);
  const rawSecondaryAccount = dsMockUtils.createMockSecondaryKey({
    signer: dsMockUtils.createMockSignatory({
      Account: dsMockUtils.createMockAccountId(secondaryAccounts[0].account.address),
    }),
    permissions: dsMockUtils.createMockPermissions(),
  });

  let mockContext: Mocked<Context>;
  let stringToAccountIdSpy: jest.SpyInstance<AccountId, [string, Context]>;
  let secondaryAccountToMeshSecondaryKeySpy: jest.SpyInstance<
    PolymeshPrimitivesSecondaryKey,
    [PermissionedAccount, Context]
  >;
  let dateToMomentSpy: jest.SpyInstance<Moment, [Date, Context]>;
  let registerIdentityTransaction: PolymeshTx<unknown[]>;
  let proc: Procedure<RegisterIdentityParams, Identity, Record<string, unknown>>;

  beforeAll(() => {
    entityMockUtils.initMocks();
    procedureMockUtils.initMocks();
    dsMockUtils.initMocks();
    stringToAccountIdSpy = jest.spyOn(utilsConversionModule, 'stringToAccountId');
    dateToMomentSpy = jest.spyOn(utilsConversionModule, 'dateToMoment');
    secondaryAccountToMeshSecondaryKeySpy = jest.spyOn(
      utilsConversionModule,
      'secondaryAccountToMeshSecondaryKey'
    );
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    registerIdentityTransaction = dsMockUtils.createTxMock('identity', 'cddRegisterDid');
    proc = procedureMockUtils.getInstance<RegisterIdentityParams, Identity>(mockContext);
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

  describe('with falsy `createCdd` arg', () => {
    beforeEach(() => {
      registerIdentityTransaction = dsMockUtils.createTxMock('identity', 'cddRegisterDid');

      entityMockUtils.configureMocks({
        accountOptions: {
          getIdentity: null,
        },
      });
    });

    it('should return a cddRegisterIdentity transaction spec', async () => {
      const args = {
        targetAccount,
        secondaryAccounts,
      };

      when(stringToAccountIdSpy)
        .calledWith(targetAccount, mockContext)
        .mockReturnValue(rawAccountId);
      when(secondaryAccountToMeshSecondaryKeySpy)
        .calledWith(secondaryAccounts[0], mockContext)
        .mockReturnValue(rawSecondaryAccount);

      let result = await prepareRegisterIdentity.call(proc, args);

      expect(result).toEqual({
        transaction: registerIdentityTransaction,
        args: [rawAccountId, [rawSecondaryAccount]],
        resolver: expect.any(Function),
      });

      result = await prepareRegisterIdentity.call(proc, { targetAccount, createCdd: false });

      expect(result).toEqual({
        transaction: registerIdentityTransaction,
        args: [rawAccountId, []],
        resolver: expect.any(Function),
      });
    });

    it('should throw if `expiry` is passed', () => {
      const args = {
        targetAccount,
        secondaryAccounts,
        createCdd: false,
        expiry: new Date(),
      };

      const expectedError = new PolymeshError({
        code: ErrorCode.ValidationError,
        message: 'Expiry cannot be set unless a CDD claim is being created',
      });

      return expect(() => prepareRegisterIdentity.call(proc, args)).rejects.toThrow(expectedError);
    });
  });

  describe('with true `createCdd` arg', () => {
    beforeEach(() => {
      registerIdentityTransaction = dsMockUtils.createTxMock('identity', 'cddRegisterDidWithCdd');
      entityMockUtils.configureMocks({
        accountOptions: {
          getIdentity: null,
        },
      });
    });

    it('should return a cddRegisterIdentityWithCdd transaction spec', async () => {
      const args = {
        targetAccount,
        secondaryAccounts,
        createCdd: true,
      };

      when(stringToAccountIdSpy)
        .calledWith(targetAccount, mockContext)
        .mockReturnValue(rawAccountId);
      when(secondaryAccountToMeshSecondaryKeySpy)
        .calledWith(secondaryAccounts[0], mockContext)
        .mockReturnValue(rawSecondaryAccount);

      let result = await prepareRegisterIdentity.call(proc, args);

      expect(result).toEqual({
        transaction: registerIdentityTransaction,
        args: [rawAccountId, [rawSecondaryAccount], null],
        resolver: expect.any(Function),
      });

      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30);
      const expiry = new BigNumber(expiryDate.getTime());

      const mockExpiry = dsMockUtils.createMockMoment(expiry);

      when(dateToMomentSpy).calledWith(expiryDate, mockContext).mockReturnValue(mockExpiry);

      result = await prepareRegisterIdentity.call(proc, {
        targetAccount,
        createCdd: true,
        expiry: expiryDate,
      });

      expect(result).toEqual({
        transaction: registerIdentityTransaction,
        args: [rawAccountId, [], mockExpiry],
        resolver: expect.any(Function),
      });
    });
  });

  describe('with existing Identity', () => {
    beforeEach(() => {
      registerIdentityTransaction = dsMockUtils.createTxMock('identity', 'cddRegisterDid');
    });

    it('should throw if an Identity is already registered for the Account', () => {
      const identity = entityMockUtils.getIdentityInstance({
        getPrimaryAccount: {
          account: entityMockUtils.getAccountInstance({ address: targetAccount }),
        },
      });

      entityMockUtils.getAccountInstance({ address: targetAccount, getIdentity: identity });

      const args = {
        targetAccount,
        secondaryAccounts,
        createCdd: false,
        expiry: new Date(),
      };

      const expectedError = new PolymeshError({
        code: ErrorCode.NoDataChange,
        message: 'The target account already has an identity',
      });

      return expect(() => prepareRegisterIdentity.call(proc, args)).rejects.toThrow(expectedError);
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
