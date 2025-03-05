import { Vec } from '@polkadot/types/codec';
import { Moment } from '@polkadot/types/interfaces/runtime';
import { PolymeshCommonUtilitiesIdentityCreateChildIdentityWithAuth } from '@polkadot/types/lookup';
import { ISubmittableResult } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import { ChildIdentity } from '~/api/entities/Identity/ChildIdentity';
import {
  createChildIdentityResolver,
  getAuthorization,
  prepareCreateChildIdentities,
  prepareStorage,
  Storage,
} from '~/api/procedures/createChildIdentities';
import { Account, Context, Identity } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { CreateChildIdentitiesParams, TxTags } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';
import * as utilsInternalModule from '~/utils/internal';

jest.mock(
  '~/api/entities/Identity/ChildIdentity',
  require('~/testUtils/mocks/entities').mockChildIdentityModule(
    '~/api/entities/Identity/ChildIdentity'
  )
);

describe('createChildIdentities procedure', () => {
  let mockContext: Mocked<Context>;
  let identity: Identity;
  let actingAccount: Account;
  let childAccount: Account;
  let childKeysWithAuthToCreateChildIdentitiesWithAuthSpy: jest.SpyInstance;

  let rawChildKeyWithAuths: Vec<PolymeshCommonUtilitiesIdentityCreateChildIdentityWithAuth>;
  let args: CreateChildIdentitiesParams;
  let expiresAt: Date;
  let rawExpiresAt: Moment;
  let dateToMomentSpy: jest.SpyInstance;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();

    childKeysWithAuthToCreateChildIdentitiesWithAuthSpy = jest.spyOn(
      utilsConversionModule,
      'childKeysWithAuthToCreateChildIdentitiesWithAuth'
    );
    dateToMomentSpy = jest.spyOn(utilsConversionModule, 'dateToMoment');
  });

  beforeEach(() => {
    entityMockUtils.configureMocks({
      childIdentityOptions: {
        getParentDid: null,
      },
    });

    childAccount = entityMockUtils.getAccountInstance({
      address: 'childAddress',
      getIdentity: null,
    });

    actingAccount = entityMockUtils.getAccountInstance({
      address: 'actingAccount',
    });
    identity = entityMockUtils.getIdentityInstance({
      getPrimaryAccount: {
        account: actingAccount,
      },
    });

    mockContext = dsMockUtils.getContextInstance({
      getIdentity: identity,
    });

    expiresAt = new Date('2050/01/01');

    args = {
      childKeyAuths: [
        {
          key: childAccount,
          authSignature: '0xsignature',
        },
      ],
      expiresAt,
    };

    rawExpiresAt = dsMockUtils.createMockMoment(new BigNumber(expiresAt.getTime()));
    when(dateToMomentSpy).calledWith(expiresAt, mockContext).mockReturnValue(rawExpiresAt);

    rawChildKeyWithAuths =
      'someKeysWithAuth' as unknown as Vec<PolymeshCommonUtilitiesIdentityCreateChildIdentityWithAuth>;

    when(childKeysWithAuthToCreateChildIdentitiesWithAuthSpy)
      .calledWith(args.childKeyAuths, mockContext)
      .mockReturnValue(rawChildKeyWithAuths);
  });

  afterEach(() => {
    entityMockUtils.reset();
    procedureMockUtils.reset();
    dsMockUtils.reset();
  });

  afterAll(() => {
    jest.resetAllMocks();
    procedureMockUtils.cleanup();
    dsMockUtils.cleanup();
  });

  it('should throw an error if expiry date is not valid', () => {
    const proc = procedureMockUtils.getInstance<
      CreateChildIdentitiesParams,
      ChildIdentity[],
      Storage
    >(mockContext, { identity, actingAccount });

    return expect(
      prepareCreateChildIdentities.call(proc, {
        ...args,
        expiresAt: new Date('2020/01/01'),
      })
    ).rejects.toThrow('Expiry date must be in the future');
  });

  it('should throw an error if the signing Identity is already a child Identity', () => {
    entityMockUtils.configureMocks({
      childIdentityOptions: {
        getParentDid: entityMockUtils.getIdentityInstance({ did: 'someParentDid' }),
      },
    });

    const proc = procedureMockUtils.getInstance<
      CreateChildIdentitiesParams,
      ChildIdentity[],
      Storage
    >(mockContext, { identity, actingAccount });

    return expect(prepareCreateChildIdentities.call(proc, args)).rejects.toThrow(
      'The signing Identity is already a child Identity and cannot create further child identities'
    );
  });

  it('should throw an error if the one or more accounts are already linked to an Identity', () => {
    const proc = procedureMockUtils.getInstance<
      CreateChildIdentitiesParams,
      ChildIdentity[],
      Storage
    >(mockContext, { identity, actingAccount });

    return expect(
      prepareCreateChildIdentities.call(proc, {
        childKeyAuths: [
          {
            key: entityMockUtils.getAccountInstance({
              address: 'secondaryAccount',
              getIdentity: entityMockUtils.getIdentityInstance({ did: 'someRandomDid' }),
            }),
            authSignature: '0xsignature',
          },
        ],
        expiresAt,
      })
    ).rejects.toThrow('One or more accounts are already linked to some Identity');
  });

  it('should add a createChildIdentities transaction to the queue', async () => {
    const proc = procedureMockUtils.getInstance<
      CreateChildIdentitiesParams,
      ChildIdentity[],
      Storage
    >(mockContext, { identity, actingAccount });

    const createChildIdentitiesTransaction = dsMockUtils.createTxMock(
      'identity',
      'createChildIdentities'
    );

    const result = await prepareCreateChildIdentities.call(proc, args);

    expect(result).toEqual({
      transaction: createChildIdentitiesTransaction,
      resolver: expect.any(Function),
      args: [rawChildKeyWithAuths, rawExpiresAt],
    });
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', async () => {
      let proc = procedureMockUtils.getInstance<
        CreateChildIdentitiesParams,
        ChildIdentity[],
        Storage
      >(mockContext, { identity, actingAccount });
      let boundFunc = getAuthorization.bind(proc);

      let result = await boundFunc();
      expect(result).toEqual({
        permissions: {
          transactions: [TxTags.identity.CreateChildIdentities],
          assets: [],
          portfolios: [],
        },
      });

      identity = entityMockUtils.getIdentityInstance({
        getPrimaryAccount: {
          account: entityMockUtils.getAccountInstance({
            address: 'differentAddress',
          }),
        },
      });

      proc = procedureMockUtils.getInstance<CreateChildIdentitiesParams, ChildIdentity[], Storage>(
        dsMockUtils.getContextInstance({
          signingAccountIsEqual: false,
        }),
        { identity, actingAccount }
      );

      boundFunc = getAuthorization.bind(proc);

      result = await boundFunc();
      expect(result).toEqual({
        signerPermissions: "Child Identities can only be created by an Identity's primary Account",
      });
    });
  });

  describe('prepareStorage', () => {
    it('should return the signing Identity', async () => {
      const proc = procedureMockUtils.getInstance<
        CreateChildIdentitiesParams,
        ChildIdentity[],
        Storage
      >(mockContext);
      const boundFunc = prepareStorage.bind(proc);

      const result = await boundFunc();

      expect(result).toEqual({
        identity: expect.objectContaining({
          did: 'someDid',
        }),
        actingAccount: expect.objectContaining({
          address: '0xdummy',
        }),
      });
    });
  });

  describe('createChildIdentityResolver', () => {
    const filterEventRecordsSpy = jest.spyOn(utilsInternalModule, 'filterEventRecords');
    const did = 'someDid';
    const rawIdentityId = dsMockUtils.createMockIdentityId(did);
    const childDid = 'someChildDid';
    const rawChildIdentity = dsMockUtils.createMockIdentityId(childDid);

    beforeEach(() => {
      filterEventRecordsSpy.mockReturnValue([
        dsMockUtils.createMockIEvent([rawIdentityId, rawChildIdentity]),
      ]);
    });

    afterEach(() => {
      jest.resetAllMocks();
      filterEventRecordsSpy.mockReset();
    });

    it('should return the new ChildIdentity', () => {
      const fakeContext = {} as Context;

      const result = createChildIdentityResolver(fakeContext)({} as ISubmittableResult);

      expect(result[0].did).toEqual(childDid);
    });
  });
});
