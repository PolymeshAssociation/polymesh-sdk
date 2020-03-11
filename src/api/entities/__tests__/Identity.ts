import BigNumber from 'bignumber.js';

import { Entity } from '~/base';
import { polkadotMockUtils } from '~/testUtils/mocks';

import { Identity } from '../Identity';

describe('Identity class', () => {
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
    expect(Identity.prototype instanceof Entity).toBe(true);
  });

  describe('constructor', () => {
    test('should assign did to instance', () => {
      const did = 'abc';
      const context = polkadotMockUtils.getContextInstance();
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

  describe('method: getPolyXBalance', () => {
    test("should return the identity's POLY balance", async () => {
      const fakeBalance = new BigNumber(100);
      polkadotMockUtils
        .createQueryStub('balances', 'identityBalance')
        .resolves(fakeBalance.times(Math.pow(10, 6)));
      const identity = new Identity({ did: 'abc' }, polkadotMockUtils.getContextInstance());
      const result = await identity.getPolyXBalance();
      expect(result).toEqual(fakeBalance);
    });
  });
});
