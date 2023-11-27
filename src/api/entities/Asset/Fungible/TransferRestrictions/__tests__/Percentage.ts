import { Namespace } from '~/internal';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';

import { Percentage } from '../Percentage';

jest.mock(
  '~/api/entities/Identity',
  require('~/testUtils/mocks/entities').mockIdentityModule('~/api/entities/Identity')
);

describe('Percentage class', () => {
  beforeAll(() => {
    entityMockUtils.initMocks();
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  it('should extend namespace', () => {
    expect(Percentage.prototype instanceof Namespace).toBe(true);
  });
});
