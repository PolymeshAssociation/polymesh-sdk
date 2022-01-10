import { Namespace } from '~/internal';

import { TransferRestrictions } from '../';

describe('TransferRestrictions class', () => {
  test('should extend namespace', () => {
    expect(TransferRestrictions.prototype instanceof Namespace).toBe(true);
  });
});
