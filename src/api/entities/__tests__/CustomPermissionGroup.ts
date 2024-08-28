import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import { Context, CustomPermissionGroup, PermissionGroup, PolymeshTransaction } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Asset/Fungible',
  require('~/testUtils/mocks/entities').mockFungibleAssetModule('~/api/entities/Asset/Fungible')
);
jest.mock(
  '~/base/Procedure',
  require('~/testUtils/mocks/procedure').mockProcedureModule('~/base/Procedure')
);

describe('CustomPermissionGroup class', () => {
  const assetId = '0x1234';
  const id = new BigNumber(1);

  let context: Context;

  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();
    procedureMockUtils.initMocks();

    jest.spyOn(utilsConversionModule, 'stringToAssetId').mockImplementation();
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
  });

  afterEach(() => {
    dsMockUtils.reset();
    entityMockUtils.reset();
    procedureMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
    procedureMockUtils.cleanup();
  });

  it('should extend PermissionGroup', () => {
    expect(CustomPermissionGroup.prototype instanceof PermissionGroup).toBe(true);
  });

  describe('constructor', () => {
    it('should assign id to instance', () => {
      const customPermissionGroup = new CustomPermissionGroup({ id, assetId }, context);

      expect(customPermissionGroup.id).toBe(id);
      expect(customPermissionGroup.asset.id).toBe(assetId);
    });
  });

  describe('method: isUniqueIdentifiers', () => {
    it('should return true if the object conforms to the interface', () => {
      expect(CustomPermissionGroup.isUniqueIdentifiers({ id: new BigNumber(1), assetId })).toBe(
        true
      );
      expect(CustomPermissionGroup.isUniqueIdentifiers({})).toBe(false);
      expect(CustomPermissionGroup.isUniqueIdentifiers({ id: 1 })).toBe(false);
    });
  });

  describe('method: toHuman', () => {
    it('should return a human readable version of the entity', () => {
      entityMockUtils.configureMocks({
        fungibleAssetOptions: {
          toHuman: assetId,
        },
      });
      const customPermissionGroup = new CustomPermissionGroup({ id, assetId }, context);
      expect(customPermissionGroup.toHuman()).toEqual({
        id: id.toString(),
        assetId,
        ticker: assetId,
      });
    });
  });

  describe('method: setPermissions', () => {
    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const customPermissionGroup = new CustomPermissionGroup({ id, assetId }, context);

      const args = {
        permissions: {
          transactionGroups: [],
        },
      };

      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<void>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith(
          { args: { ...args, group: customPermissionGroup }, transformer: undefined },
          context,
          {}
        )
        .mockResolvedValue(expectedTransaction);

      const tx = await customPermissionGroup.setPermissions(args);

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: getPermissions', () => {
    it('should return a list of permissions and transaction groups', async () => {
      const customPermissionGroup = new CustomPermissionGroup({ id, assetId }, context);

      const rawStoName = dsMockUtils.createMockText('Sto');
      const rawIdentityName = dsMockUtils.createMockText('Identity');

      const rawInvestPermissions = dsMockUtils.createMockPalletPermissions({
        extrinsics: dsMockUtils.createMockExtrinsicName({
          These: [dsMockUtils.createMockText('invest')],
        }),
      });

      const rawAddClaimPermissions = dsMockUtils.createMockPalletPermissions({
        extrinsics: dsMockUtils.createMockExtrinsicName({
          These: [dsMockUtils.createMockText('addClaim')],
        }),
      });

      const permissionMap = new Map();
      permissionMap.set(rawStoName, rawInvestPermissions);
      permissionMap.set(rawIdentityName, rawAddClaimPermissions);

      dsMockUtils.createQueryMock('externalAgents', 'groupPermissions', {
        returnValue: dsMockUtils.createMockOption(
          dsMockUtils.createMockExtrinsicPermissions({
            These: dsMockUtils.createMockBTreeMap(permissionMap),
          })
        ),
      });

      const result = await customPermissionGroup.getPermissions();

      expect(result).toEqual({
        transactions: { type: 'Include', values: ['sto.invest', 'identity.addClaim'] },
        transactionGroups: [],
      });
    });
  });

  describe('method: exists', () => {
    it('should return whether the Custom Permission Group exists', async () => {
      const customPermissionGroup = new CustomPermissionGroup({ id, assetId }, context);

      dsMockUtils.createQueryMock('externalAgents', 'agIdSequence', {
        returnValue: dsMockUtils.createMockU32(new BigNumber(0)),
      });

      await expect(customPermissionGroup.exists()).resolves.toBe(false);

      dsMockUtils.createQueryMock('externalAgents', 'agIdSequence', {
        returnValue: dsMockUtils.createMockU32(new BigNumber(10)),
      });

      await expect(customPermissionGroup.exists()).resolves.toBe(true);

      dsMockUtils.createQueryMock('externalAgents', 'agIdSequence', {
        returnValue: dsMockUtils.createMockU32(new BigNumber(1)),
      });

      await expect(customPermissionGroup.exists()).resolves.toBe(true);

      customPermissionGroup.id = new BigNumber(0);

      return expect(customPermissionGroup.exists()).resolves.toBe(false);
    });
  });
});
