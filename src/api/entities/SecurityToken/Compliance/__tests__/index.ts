import { Namespace } from '~/api/entities';

import { Compliance } from '../';

describe('Compliance class', () => {
  test('should extend namespace', () => {
    expect(Compliance.prototype instanceof Namespace).toBe(true);
  });
});
