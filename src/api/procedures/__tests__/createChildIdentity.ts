import { AccountId } from '@polkadot/types/interfaces';
import { PolymeshPrimitivesIdentityId } from '@polkadot/types/lookup';
import { ISubmittableResult } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import { ChildIdentity } from '~/api/entities/Identity/ChildIdentity';
import {
  createChildIdentityResolver,
  getAuthorization,
  prepareCreateChildIdentity,
  prepareStorage,
  Storage,
} from '~/api/procedures/createChildIdentity';
import { Account, Context, Identity } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { CreateChildIdentityParams, TxTags } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';
import * as utilsInternalModule from '~/utils/internal';

jest.mock(
  '~/api/entities/Identity/ChildIdentity',
  require('~/testUtils/mocks/entities').mockChildIdentityModule(
    '~/api/entities/Identity/ChildIdentity'
  )
);

describe('createChildIdentity procedure', () => {
  let mockContext: Mocked<Context>;
  let identity: Identity;
  let actingAccount: Account;
  let rawIdentity: PolymeshPrimitivesIdentityId;
  let childAccount: Account;
  let rawChildAccount: AccountId;
  let stringToIdentityIdSpy: jest.SpyInstance;
  let stringToAccountIdSpy: jest.SpyInstance;
  let boolToBooleanSpy: jest.SpyInstance;

  let didKeysQueryMock: jest.Mock;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();

    stringToIdentityIdSpy = jest.spyOn(utilsConversionModule, 'stringToIdentityId');
    stringToAccountIdSpy = jest.spyOn(utilsConversionModule, 'stringToAccountId');
    boolToBooleanSpy = jest.spyOn(utilsConversionModule, 'boolToBoolean');
  });

  beforeEach(() => {
    entityMockUtils.configureMocks({
      childIdentityOptions: {
        getParentDid: null,
      },
    });
    childAccount = entityMockUtils.getAccountInstance();
    rawChildAccount = dsMockUtils.createMockAccountId(childAccount.address);

    identity = entityMockUtils.getIdentityInstance();
    actingAccount = entityMockUtils.getAccountInstance();
    rawIdentity = dsMockUtils.createMockIdentityId(identity.did);

    mockContext = dsMockUtils.getContextInstance({
      getIdentity: identity,
    });

    when(stringToIdentityIdSpy).calledWith(identity.did, mockContext).mockReturnValue(rawIdentity);
    when(stringToAccountIdSpy)
      .calledWith(childAccount.address, mockContext)
      .mockReturnValue(rawChildAccount);

    const rawTrue = dsMockUtils.createMockBool(true);
    didKeysQueryMock = dsMockUtils.createQueryMock('identity', 'didKeys');
    when(didKeysQueryMock).calledWith(rawIdentity, rawChildAccount).mockResolvedValue(rawTrue);

    when(boolToBooleanSpy).calledWith(rawTrue).mockReturnValue(true);
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

  it('should throw an error if the `secondaryKey` provided is not a secondary account of the signing Identity', () => {
    const mockAccount = entityMockUtils.getAccountInstance({ address: 'someOtherAddress' });

    const rawOtherAccount = dsMockUtils.createMockAccountId(mockAccount.address);
    when(stringToAccountIdSpy)
      .calledWith(mockAccount.address, mockContext)
      .mockReturnValue(rawOtherAccount);

    const rawFalse = dsMockUtils.createMockBool(false);
    when(didKeysQueryMock).calledWith(rawIdentity, rawOtherAccount).mockResolvedValue(rawFalse);

    when(boolToBooleanSpy).calledWith(rawFalse).mockReturnValue(false);

    const proc = procedureMockUtils.getInstance<CreateChildIdentityParams, ChildIdentity, Storage>(
      mockContext,
      { identity, actingAccount }
    );

    return expect(
      prepareCreateChildIdentity.call(proc, {
        secondaryKey: mockAccount,
      })
    ).rejects.toThrow('The `secondaryKey` provided is not a secondary key of the signing Identity');
  });

  it('should throw an error if the account provided is a part of multisig with some POLYX balance', () => {
    childAccount.getMultiSig = jest.fn().mockResolvedValue(
      entityMockUtils.getMultiSigInstance({
        getBalance: {
          total: new BigNumber(100),
        },
      })
    );

    const proc = procedureMockUtils.getInstance<CreateChildIdentityParams, ChildIdentity, Storage>(
      mockContext,
      { identity, actingAccount }
    );

    return expect(
      prepareCreateChildIdentity.call(proc, {
        secondaryKey: childAccount,
      })
    ).rejects.toThrow("The `secondaryKey` can't be unlinked from the signing Identity");
  });

  it('should throw an error if the signing Identity is already a child Identity', () => {
    entityMockUtils.configureMocks({
      childIdentityOptions: {
        getParentDid: entityMockUtils.getIdentityInstance({ did: 'someParentDid' }),
      },
    });

    const proc = procedureMockUtils.getInstance<CreateChildIdentityParams, ChildIdentity, Storage>(
      mockContext,
      { identity, actingAccount }
    );

    return expect(
      prepareCreateChildIdentity.call(proc, {
        secondaryKey: childAccount,
      })
    ).rejects.toThrow(
      'The signing Identity is already a child Identity and cannot create further child identities'
    );
  });

  it('should add a create ChildIdentity transaction to the queue', async () => {
    const proc = procedureMockUtils.getInstance<CreateChildIdentityParams, ChildIdentity, Storage>(
      mockContext,
      { identity, actingAccount }
    );

    const createChildIdentityTransaction = dsMockUtils.createTxMock(
      'identity',
      'createChildIdentity'
    );

    const result = await prepareCreateChildIdentity.call(proc, {
      secondaryKey: childAccount,
    });

    expect(result).toEqual({
      transaction: createChildIdentityTransaction,
      resolver: expect.any(Function),
      args: [rawChildAccount],
    });
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', async () => {
      let proc = procedureMockUtils.getInstance<CreateChildIdentityParams, ChildIdentity, Storage>(
        mockContext,
        { identity, actingAccount }
      );
      let boundFunc = getAuthorization.bind(proc);

      let result = await boundFunc();
      expect(result).toEqual({
        permissions: {
          transactions: [TxTags.identity.CreateChildIdentity],
          assets: [],
          portfolios: [],
        },
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (actingAccount.isEqual as any).mockReturnValue(false);

      proc = procedureMockUtils.getInstance<CreateChildIdentityParams, ChildIdentity, Storage>(
        dsMockUtils.getContextInstance({
          signingAccountIsEqual: false,
        }),
        { identity, actingAccount }
      );

      boundFunc = getAuthorization.bind(proc);

      result = await boundFunc();
      expect(result).toEqual({
        signerPermissions: "A child Identity can only be created by an Identity's primary Account",
      });
    });
  });

  describe('prepareStorage', () => {
    it('should return the signing Identity', async () => {
      const proc = procedureMockUtils.getInstance<
        CreateChildIdentityParams,
        ChildIdentity,
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

      expect(result.did).toEqual(childDid);
    });
  });
});
