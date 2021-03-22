import { Namespace } from '~/internal';

import { Distributions } from '../Distributions';

describe('Distributions class', () => {
  test('should extend namespace', () => {
    expect(Distributions.prototype instanceof Namespace).toBe(true);
  });
});
