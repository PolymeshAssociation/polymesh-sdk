import { PolymeshPrimitivesIdentityId } from '@polkadot/types/lookup';
import { when } from 'jest-when';

import { ChildIdentity, Context, Entity, PolymeshTransaction } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { MockContext } from '~/testUtils/mocks/dataSources';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/base/Procedure',
  require('~/testUtils/mocks/procedure').mockProcedureModule('~/base/Procedure')
);

describe('ChildIdentity class', () => {
  let context: MockContext;

  let childIdentity: ChildIdentity;
  let did: string;

  let stringToIdentityIdSpy: jest.SpyInstance<PolymeshPrimitivesIdentityId, [string, Context]>;
  let identityIdToStringSpy: jest.SpyInstance<string, [PolymeshPrimitivesIdentityId]>;

  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();
    procedureMockUtils.initMocks();

    did = 'someDid';
    stringToIdentityIdSpy = jest.spyOn(utilsConversionModule, 'stringToIdentityId');
    identityIdToStringSpy = jest.spyOn(utilsConversionModule, 'identityIdToString');
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
    childIdentity = new ChildIdentity({ did }, context);
  });

  afterEach(() => {
    dsMockUtils.reset();
    entityMockUtils.reset();
    procedureMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
    procedureMockUtils.reset();
  });

  it('should extend Entity', () => {
    expect(ChildIdentity.prototype instanceof Entity).toBe(true);
  });

  describe('constructor', () => {
    it('should assign did to instance', () => {
      expect(childIdentity.did).toBe(did);
    });
  });

  describe('method: getParentDid', () => {
    it('should parent identity for the current child identity instance', async () => {
      const rawIdentity = dsMockUtils.createMockIdentityId(did);
      when(stringToIdentityIdSpy).calledWith(did, context).mockReturnValue(rawIdentity);

      dsMockUtils.createQueryMock('identity', 'parentDid', {
        returnValue: dsMockUtils.createMockOption(),
      });

      let result = await childIdentity.getParentDid();

      expect(result).toBe(null);

      const parentDid = 'parentDid';

      const rawParentDid = dsMockUtils.createMockIdentityId(parentDid);
      when(identityIdToStringSpy).calledWith(rawParentDid).mockReturnValue(parentDid);

      dsMockUtils.createQueryMock('identity', 'parentDid', {
        returnValue: dsMockUtils.createMockOption(rawParentDid),
      });

      result = await childIdentity.getParentDid();

      expect(result?.did).toBe(parentDid);
    });
  });

  describe('method: getChildIdentities', () => {
    it('should return an empty array', async () => {
      await expect(childIdentity.getChildIdentities()).resolves.toEqual([]);
    });
  });

  describe('method: exists', () => {
    it('should return whether the ChildIdentity exists', async () => {
      const getParentDidSpy = jest.spyOn(childIdentity, 'getParentDid');

      getParentDidSpy.mockResolvedValueOnce(null);
      await expect(childIdentity.exists()).resolves.toBe(false);

      getParentDidSpy.mockResolvedValueOnce(entityMockUtils.getIdentityInstance());
      await expect(childIdentity.exists()).resolves.toBe(true);
    });
  });

  describe('method: unlinkFromParent', () => {
    it('should prepare the procedure and return the resulting transaction queue', async () => {
      const expectedTransaction = 'someQueue' as unknown as PolymeshTransaction<void>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args: { child: childIdentity }, transformer: undefined }, context, {})
        .mockResolvedValue(expectedTransaction);

      const queue = await childIdentity.unlinkFromParent();

      expect(queue).toBe(expectedTransaction);
    });
  });
});
