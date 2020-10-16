import BigNumber from 'bignumber.js';

import { Entity, Identity, Portfolio } from '~/api/entities';
import { Context } from '~/base';
import { dsMockUtils } from '~/testUtils/mocks';

describe('Portfolio class', () => {
  let context: Context;

  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  test('should extend entity', () => {
    expect(Portfolio.prototype instanceof Entity).toBe(true);
  });

  describe('constructor', () => {
    test('should assign Identity to instance', () => {
      const did = 'someDid';
      const identity = new Identity({ did }, context);
      const portfolio = new Portfolio({ did }, context);

      expect(portfolio.owner).toEqual(identity);
    });
  });

  describe('method: isUniqueIdentifiers', () => {
    test('should return true if the object conforms to the interface', () => {
      expect(Portfolio.isUniqueIdentifiers({ did: 'someDid', id: new BigNumber(1) })).toBe(true);
      expect(Portfolio.isUniqueIdentifiers({ did: 'someDid' })).toBe(true);
      expect(Portfolio.isUniqueIdentifiers({})).toBe(false);
      expect(Portfolio.isUniqueIdentifiers({ did: 'someDid', id: 3 })).toBe(false);
      expect(Portfolio.isUniqueIdentifiers({ did: 1 })).toBe(false);
    });
  });

  describe('method: isOwned', () => {
    let did: string;

    beforeAll(() => {
      did = 'currentIdentity';
      dsMockUtils.configureMocks({ contextOptions: { did } });
    });

    test('should return whether the current Identity is the Portfolio owner', async () => {
      let portfolio = new Portfolio({ did }, context);

      let result = await portfolio.isOwned();

      expect(result).toBe(true);

      portfolio = new Portfolio({ did: 'notTheCurrentIdentity' }, context);

      result = await portfolio.isOwned();

      expect(result).toBe(false);
    });
  });
});
