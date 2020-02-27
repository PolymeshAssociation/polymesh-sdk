import BigNumber from 'bignumber.js';

import { Entity } from '~/base';
import { PolkadotMockFactory } from '~/testUtils/mocks';

import { Identity } from '../Identity';

describe('Identity class', () => {
  const polkadotMockFactory = new PolkadotMockFactory();

  polkadotMockFactory.initMocks({ mockContext: true });

  afterEach(() => {
    polkadotMockFactory.reset();
  });

  afterAll(() => {
    polkadotMockFactory.cleanup();
  });

  test('should extend entity', () => {
    expect(Identity.prototype instanceof Entity).toBe(true);
  });

  describe('constructor', () => {
    test('should assign did to instance', () => {
      const did = 'abc';
      const context = polkadotMockFactory.getContextInstance();
      const identity = new Identity({ did }, context);

      expect(identity.did).toBe(did);
    });
  });

  describe('method: isUniqueIdentifiers', () => {
    test('should return true if the object conforms to the interface', () => {
      expect(Identity.isUniqueIdentifiers({ did: 'someDid' })).toBe(true);
      expect(Identity.isUniqueIdentifiers({})).toBe(false);
      expect(Identity.isUniqueIdentifiers({ did: 3 })).toBe(false);
    });
  });

  describe('method: getIdentityBalance', () => {
    test("should return the identity's POLY balance", async () => {
      const fakeBalance = new BigNumber(100);
      polkadotMockFactory
        .createQueryStub('balances', 'identityBalance')
        .resolves(fakeBalance.times(Math.pow(10, 6)));
      const identity = new Identity({ did: 'abc' }, polkadotMockFactory.getContextInstance());
      const result = await identity.getIdentityBalance();
      expect(result).toEqual(fakeBalance);
    });
  });
});
