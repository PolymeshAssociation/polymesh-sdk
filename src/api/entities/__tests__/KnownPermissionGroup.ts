import { Context, KnownPermissionGroup, PermissionGroup } from '~/internal';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';
import { PermissionGroupType } from '~/types';

describe('KnownPermissionGroup class', () => {
  const ticker = 'TOKENNAME';

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
    entityMockUtils.cleanup();
  });

  test('should extend PermissionGroup', () => {
    expect(KnownPermissionGroup.prototype instanceof PermissionGroup).toBe(true);
  });

  describe('constructor', () => {
    test('should assign id to instance', () => {
      const type = PermissionGroupType.Full;
      const knownPermissionGroup = new KnownPermissionGroup({ type, ticker }, context);

      expect(knownPermissionGroup.ticker).toBe(ticker);
      expect(knownPermissionGroup.type).toBe(type);
    });
  });

  describe('method: isUniqueIdentifiers', () => {
    test('should return true if the object conforms to the interface', () => {
      expect(
        KnownPermissionGroup.isUniqueIdentifiers({
          type: PermissionGroupType.PolymeshV1Caa,
          ticker,
        })
      ).toBe(true);
      expect(KnownPermissionGroup.isUniqueIdentifiers({})).toBe(false);
      expect(KnownPermissionGroup.isUniqueIdentifiers({ ticker })).toBe(false);
    });
  });

  describe('method: toJson', () => {
    test('should return a human readable version of the entity', () => {
      const type = PermissionGroupType.Full;
      const knownPermissionGroup = new KnownPermissionGroup({ type, ticker }, context);
      expect(knownPermissionGroup.toJson()).toEqual({
        type,
        ticker,
      });
    });
  });

  describe('method: getPermissions', () => {
    test('should return a list of permissions and transaction groups', async () => {
      let type = PermissionGroupType.ExceptMeta;
      let knownPermissionGroup = new KnownPermissionGroup({ type, ticker }, context);

      let result = await knownPermissionGroup.getPermissions();

      expect(result).toEqual({
        transactions: { values: ['externalAgents'], type: 'Exclude' },
        transactionGroups: [],
      });

      type = PermissionGroupType.PolymeshV1Caa;
      knownPermissionGroup = new KnownPermissionGroup({ type, ticker }, context);

      result = await knownPermissionGroup.getPermissions();

      expect(result).toEqual({
        transactions: {
          values: ['corporateAction', 'corporateBallot', 'capitalDistribution'],
          type: 'Include',
        },
        transactionGroups: [],
      });

      type = PermissionGroupType.PolymeshV1Pia;
      knownPermissionGroup = new KnownPermissionGroup({ type, ticker }, context);

      result = await knownPermissionGroup.getPermissions();

      expect(result).toEqual({
        transactions: {
          values: ['asset.issue', 'asset.redeem', 'asset.controllerTransfer', 'sto'],
          exceptions: ['sto.invest'],
          type: 'Include',
        },
        transactionGroups: ['Issuance'],
      });

      type = PermissionGroupType.Full;
      knownPermissionGroup = new KnownPermissionGroup({ type, ticker }, context);

      result = await knownPermissionGroup.getPermissions();

      expect(result).toEqual({ transactions: null, transactionGroups: [] });
    });
  });
});
