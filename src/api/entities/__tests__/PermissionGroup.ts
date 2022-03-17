import { Entity, PermissionGroup } from '~/internal';

describe('PermissionGroup class', () => {
  it('should extend Entity', () => {
    expect(PermissionGroup.prototype instanceof Entity).toBe(true);
  });
});
