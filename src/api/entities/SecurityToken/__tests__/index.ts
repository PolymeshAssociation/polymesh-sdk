import { Entity } from '~/base';
import { polkadotMockUtils } from '~/testUtils/mocks';

import { SecurityToken } from '../';

describe('SecurityToken class', () => {
  beforeAll(() => {
    polkadotMockUtils.initMocks();
  });

  afterEach(() => {
    polkadotMockUtils.reset();
  });

  afterAll(() => {
    polkadotMockUtils.cleanup();
  });

  test('should extend entity', () => {
    expect(SecurityToken.prototype instanceof Entity).toBe(true);
  });

  describe('constructor', () => {
    test('should assign ticker to instance', () => {
      const ticker = 'test';
      const context = polkadotMockUtils.getContextInstance();
      const securityToken = new SecurityToken({ ticker }, context);

      expect(securityToken.ticker).toBe(ticker);
    });
  });

  describe('method: isUniqueIdentifiers', () => {
    test('should return true if the object conforms to the interface', () => {
      expect(SecurityToken.isUniqueIdentifiers({ ticker: 'someTicker' })).toBe(true);
      expect(SecurityToken.isUniqueIdentifiers({})).toBe(false);
      expect(SecurityToken.isUniqueIdentifiers({ ticker: 3 })).toBe(false);
    });
  });
});
