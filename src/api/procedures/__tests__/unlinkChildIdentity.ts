import { PolymeshPrimitivesIdentityId } from '@polkadot/types/lookup';
import { when } from 'jest-when';

import { ChildIdentity } from '~/api/entities/Identity/ChildIdentity';
import {
  getAuthorization,
  prepareStorage,
  prepareUnlinkChildIdentity,
  Storage,
} from '~/api/procedures/unlinkChildIdentity';
import { Context, Identity } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { Account, TxTags, UnlinkChildParams } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Identity/ChildIdentity',
  require('~/testUtils/mocks/entities').mockChildIdentityModule(
    '~/api/entities/Identity/ChildIdentity'
  )
);

describe('unlinkChildIdentity procedure', () => {
  let mockContext: Mocked<Context>;
  let identity: Identity;
  let actingAccount: Account;
  let childIdentity: ChildIdentity;
  let rawChildIdentity: PolymeshPrimitivesIdentityId;
  let stringToIdentityIdSpy: jest.SpyInstance;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();

    stringToIdentityIdSpy = jest.spyOn(utilsConversionModule, 'stringToIdentityId');
  });

  beforeEach(() => {
    identity = entityMockUtils.getIdentityInstance();
    actingAccount = entityMockUtils.getAccountInstance();

    childIdentity = entityMockUtils.getChildIdentityInstance({
      did: 'someChild',
      getParentDid: identity,
    });
    rawChildIdentity = dsMockUtils.createMockIdentityId(childIdentity.did);

    mockContext = dsMockUtils.getContextInstance({
      getIdentity: identity,
    });

    when(stringToIdentityIdSpy)
      .calledWith(childIdentity.did, mockContext)
      .mockReturnValue(rawChildIdentity);
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

  it("should throw an error if the child Identity doesn't exists ", () => {
    const child = entityMockUtils.getChildIdentityInstance({
      did: 'randomDid',
      getParentDid: null,
    });

    const proc = procedureMockUtils.getInstance<UnlinkChildParams, void, Storage>(mockContext, {
      identity,
      actingAccount,
    });

    return expect(
      prepareUnlinkChildIdentity.call(proc, {
        child,
      })
    ).rejects.toThrow("The `child` doesn't have a parent identity");
  });

  it('should throw an error if the signing Identity is neither the parent nor child', () => {
    const child = entityMockUtils.getChildIdentityInstance({
      did: 'randomChild',
      getParentDid: entityMockUtils.getIdentityInstance({ did: 'randomParent' }),
    });

    const proc = procedureMockUtils.getInstance<UnlinkChildParams, void, Storage>(mockContext, {
      identity,
      actingAccount,
    });

    return expect(
      prepareUnlinkChildIdentity.call(proc, {
        child,
      })
    ).rejects.toThrow(
      'Only the parent or the child identity is authorized to unlink a child identity'
    );
  });

  it('should add a create unlinkChildIdentity transaction to the queue', async () => {
    const proc = procedureMockUtils.getInstance<UnlinkChildParams, void, Storage>(mockContext, {
      identity,
      actingAccount,
    });

    const unlinkChildIdentityTransaction = dsMockUtils.createTxMock(
      'identity',
      'unlinkChildIdentity'
    );

    const result = await prepareUnlinkChildIdentity.call(proc, {
      child: childIdentity,
    });

    expect(result).toEqual({
      transaction: unlinkChildIdentityTransaction,
      args: [rawChildIdentity],
      resolver: undefined,
    });
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', async () => {
      let proc = procedureMockUtils.getInstance<UnlinkChildParams, void, Storage>(mockContext, {
        identity,
        actingAccount,
      });
      let boundFunc = getAuthorization.bind(proc);

      let result = await boundFunc();
      expect(result).toEqual({
        permissions: {
          transactions: [TxTags.identity.UnlinkChildIdentity],
          assets: [],
          portfolios: [],
        },
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (actingAccount.isEqual as any).mockReturnValue(false);

      proc = procedureMockUtils.getInstance<UnlinkChildParams, void, Storage>(
        dsMockUtils.getContextInstance(),
        { identity, actingAccount }
      );

      boundFunc = getAuthorization.bind(proc);

      result = await boundFunc();
      expect(result).toEqual({
        signerPermissions:
          'Child identity can only be unlinked by primary key of either the child Identity or parent Identity',
      });
    });
  });

  describe('prepareStorage', () => {
    it('should return the signing Identity', async () => {
      const proc = procedureMockUtils.getInstance<UnlinkChildParams, void, Storage>(mockContext);
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
});
