import BigNumber from 'bignumber.js';

import { Context, Entity, Offering } from '~/internal';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';

jest.mock(
  '~/api/entities/Identity',
  require('~/testUtils/mocks/entities').mockIdentityModule('~/api/entities/Identity')
);

describe('Offering class', () => {
  let context: Context;

  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
  });

  afterEach(() => {
    dsMockUtils.reset();
    entityMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
    entityMockUtils.cleanup();
  });

  test('should extend entity', () => {
    expect(Offering.prototype instanceof Entity).toBe(true);
  });

  describe('constructor', () => {
    test('should assign ticker and id to instance', () => {
      const ticker = 'SOMETICKER';
      const id = new BigNumber(1);
      const trustedClaimIssuer = new Offering({ id, ticker }, context);

      expect(trustedClaimIssuer.ticker).toBe(ticker);
      expect(trustedClaimIssuer.id).toEqual(id);
    });
  });

  describe('method: isUniqueIdentifiers', () => {
    test('should return true if the object conforms to the interface', () => {
      expect(Offering.isUniqueIdentifiers({ id: new BigNumber(1), ticker: 'symbol' })).toBe(true);
      expect(Offering.isUniqueIdentifiers({})).toBe(false);
      expect(Offering.isUniqueIdentifiers({ id: new BigNumber(1) })).toBe(false);
      expect(Offering.isUniqueIdentifiers({ id: 1 })).toBe(false);
    });
  });
});
