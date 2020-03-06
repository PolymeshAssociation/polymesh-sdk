import { Entity } from '~/base';
import { PolkadotMockFactory } from '~/testUtils/mocks';

import { SecurityToken } from '../SecurityToken';

describe('SecurityToken class', () => {
  const polkadotMockFactory = new PolkadotMockFactory();

  polkadotMockFactory.initMocks({ mockContext: true });

  afterEach(() => {
    polkadotMockFactory.reset();
  });

  afterAll(() => {
    polkadotMockFactory.cleanup();
  });

  test('should extend entity', () => {
    expect(SecurityToken.prototype instanceof Entity).toBe(true);
  });

  describe('constructor', () => {
    test('should assign symbol instance', () => {
      const symbol = 'test';
      const context = polkadotMockFactory.getContextInstance();
      const securityToken = new SecurityToken({ symbol }, context);

      expect(securityToken.symbol).toBe(symbol);
    });
  });

  describe('method: isUniqueIdentifiers', () => {
    test('should return true if the object conforms to the interface', () => {
      expect(SecurityToken.isUniqueIdentifiers({ symbol: 'someToken' })).toBe(true);
      expect(SecurityToken.isUniqueIdentifiers({})).toBe(false);
      expect(SecurityToken.isUniqueIdentifiers({ symbol: 3 })).toBe(false);
    });
  });
});
