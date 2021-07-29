import { Entity, PermissionGroup } from '~/internal';

describe('PermissionGroup class', () => {
  test('should extend Entity', () => {
    expect(PermissionGroup.prototype instanceof Entity).toBe(true);
  });
});
