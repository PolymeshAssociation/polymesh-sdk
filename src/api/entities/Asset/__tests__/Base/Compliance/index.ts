import { Namespace } from '~/internal';

import { Compliance } from '../../../Base/Compliance';

describe('Compliance class', () => {
  it('should extend namespace', () => {
    expect(Compliance.prototype instanceof Namespace).toBe(true);
  });
});
