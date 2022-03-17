import { Namespace } from '~/internal';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';

import { Count } from '../Count';

jest.mock(
  '~/api/entities/Identity',
  require('~/testUtils/mocks/entities').mockIdentityModule('~/api/entities/Identity')
);

describe('Count class', () => {
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
    expect(Count.prototype instanceof Namespace).toBe(true);
  });
});
