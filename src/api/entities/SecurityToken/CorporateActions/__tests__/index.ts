import { Namespace } from '~/internal';

import { CorporateActions } from '../';

describe('CorporateActions class', () => {
  test('should extend namespace', () => {
    expect(CorporateActions.prototype instanceof Namespace).toBe(true);
  });
});
