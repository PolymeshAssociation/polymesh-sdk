import { Namespace } from '~/api/entities';

import { Portfolios } from '../Portfolios';

describe('Portfolios class', () => {
  test('should extend namespace', () => {
    expect(Portfolios.prototype instanceof Namespace).toBe(true);
  });
});
