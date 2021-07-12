import BigNumber from 'bignumber.js';

import { Context, Entity, PermissionGroup } from '~/internal';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';

describe('PermissionGroup class', () => {
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

  test('should extend Entity', () => {
    expect(PermissionGroup.prototype instanceof Entity).toBe(true);
  });

  describe('constructor', () => {
    test('should assign id to instance', () => {
      const id = new BigNumber(1);
      const agentGroup = new PermissionGroup({ id }, context);

      expect(agentGroup.id).toBe(id);
    });
  });

  describe('method: isUniqueIdentifiers', () => {
    test('should return true if the object conforms to the interface', () => {
      expect(PermissionGroup.isUniqueIdentifiers({ id: new BigNumber(1) })).toBe(true);
      expect(PermissionGroup.isUniqueIdentifiers({})).toBe(false);
      expect(PermissionGroup.isUniqueIdentifiers({ id: 1 })).toBe(false);
    });
  });
});
