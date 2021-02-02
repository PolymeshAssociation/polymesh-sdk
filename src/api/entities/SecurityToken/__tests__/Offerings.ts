import { Namespace } from '~/internal';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';

import { Offerings } from '../Offerings';

jest.mock(
  '~/api/entities/SecurityToken',
  require('~/testUtils/mocks/entities').mockSecurityTokenModule('~/api/entities/SecurityToken')
);

describe('Offerings class', () => {
  beforeAll(() => {
    entityMockUtils.initMocks();
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    entityMockUtils.reset();
    dsMockUtils.reset();
  });

  afterAll(() => {
    entityMockUtils.cleanup();
    dsMockUtils.cleanup();
  });

  test('should extend namespace', () => {
    expect(Offerings.prototype instanceof Namespace).toBe(true);
  });
});
