import { Context, KnownPermissionGroup, PermissionGroup } from '~/internal';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';
import { PermissionGroupType } from '~/types';

jest.mock(
  '~/api/entities/Asset/Fungible',
  require('~/testUtils/mocks/entities').mockFungibleAssetModule('~/api/entities/Asset/Fungible')
);

describe('KnownPermissionGroup class', () => {
  const assetId = '0x1234';

  let context: Context;

  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
  });

  afterEach(() => {
    dsMockUtils.reset();
    entityMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  it('should extend PermissionGroup', () => {
    expect(KnownPermissionGroup.prototype instanceof PermissionGroup).toBe(true);
  });

  describe('constructor', () => {
    it('should assign id to instance', () => {
      const type = PermissionGroupType.Full;
      const knownPermissionGroup = new KnownPermissionGroup({ type, assetId }, context);

      expect(knownPermissionGroup.asset.id).toBe(assetId);
      expect(knownPermissionGroup.type).toBe(type);
    });
  });

  describe('method: isUniqueIdentifiers', () => {
    it('should return true if the object conforms to the interface', () => {
      expect(
        KnownPermissionGroup.isUniqueIdentifiers({
          type: PermissionGroupType.PolymeshV1Caa,
          assetId,
        })
      ).toBe(true);
      expect(KnownPermissionGroup.isUniqueIdentifiers({})).toBe(false);
      expect(KnownPermissionGroup.isUniqueIdentifiers({ assetId })).toBe(false);
    });
  });

  describe('method: toHuman', () => {
    it('should return a human readable version of the entity', () => {
      entityMockUtils.configureMocks({
        fungibleAssetOptions: {
          toHuman: assetId,
        },
      });
      const type = PermissionGroupType.Full;
      const knownPermissionGroup = new KnownPermissionGroup({ type, assetId }, context);
      expect(knownPermissionGroup.toHuman()).toEqual({
        type,
        assetId,
        ticker: assetId,
      });
    });
  });

  describe('method: getPermissions', () => {
    it('should return a list of permissions and transaction groups', async () => {
      let type = PermissionGroupType.ExceptMeta;
      let knownPermissionGroup = new KnownPermissionGroup({ type, assetId }, context);

      let result = await knownPermissionGroup.getPermissions();

      expect(result).toEqual({
        transactions: { values: ['externalAgents'], type: 'Exclude' },
        transactionGroups: [],
      });

      type = PermissionGroupType.PolymeshV1Caa;
      knownPermissionGroup = new KnownPermissionGroup({ type, assetId }, context);

      result = await knownPermissionGroup.getPermissions();

      expect(result).toEqual({
        transactions: {
          values: ['capitalDistribution', 'corporateAction', 'corporateBallot'],
          type: 'Include',
        },
        transactionGroups: [],
      });

      type = PermissionGroupType.PolymeshV1Pia;
      knownPermissionGroup = new KnownPermissionGroup({ type, assetId }, context);

      result = await knownPermissionGroup.getPermissions();

      expect(result).toEqual({
        transactions: {
          values: ['asset.controllerTransfer', 'asset.issue', 'asset.redeem', 'sto'],
          exceptions: ['sto.invest'],
          type: 'Include',
        },
        transactionGroups: ['Issuance'],
      });

      type = PermissionGroupType.Full;
      knownPermissionGroup = new KnownPermissionGroup({ type, assetId }, context);

      result = await knownPermissionGroup.getPermissions();

      expect(result).toEqual({ transactions: null, transactionGroups: [] });
    });
  });

  describe('exists', () => {
    it('should return true', () => {
      const type = PermissionGroupType.ExceptMeta;
      const knownPermissionGroup = new KnownPermissionGroup({ type, assetId }, context);

      return expect(knownPermissionGroup.exists()).resolves.toBe(true);
    });
  });
});
