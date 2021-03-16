import BigNumber from 'bignumber.js';

import { Context, DividendDistribution, Entity } from '~/internal';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';
import { TargetTreatment, TaxWithholding } from '~/types';

describe('DividendDistribution class', () => {
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
    expect(DividendDistribution.prototype instanceof Entity).toBe(true);
  });

  describe('constructor', () => {
    test('should assign parameters to instance', () => {
      const id = new BigNumber(1);
      const ticker = 'SOME_TICKER';
      const declarationDate = new Date('10/14/1987');
      const description = 'something';
      const targets = {
        identities: [entityMockUtils.getIdentityInstance()],
        treatment: TargetTreatment.Include,
      };
      const defaultTaxWithholding = new BigNumber(10);
      const taxWithholdings: TaxWithholding[] = [];
      const origin = entityMockUtils.getDefaultPortfolioInstance();
      const currency = 'USD';
      const perShare = new BigNumber(10);
      const maxAmount = new BigNumber(10000);
      const expiryDate = null;
      const paymentDate = new Date('10/14/2021');
      const dividendDistribution = new DividendDistribution(
        {
          id,
          ticker,
          declarationDate,
          description,
          targets,
          defaultTaxWithholding,
          taxWithholdings,
          origin,
          currency,
          perShare,
          maxAmount,
          expiryDate,
          paymentDate,
        },
        context
      );

      expect(dividendDistribution.id).toEqual(id);
      expect(dividendDistribution.ticker).toBe(ticker);
      expect(dividendDistribution.declarationDate).toEqual(declarationDate);
      expect(dividendDistribution.description).toEqual(description);
      expect(dividendDistribution.targets).toEqual(targets);
      expect(dividendDistribution.defaultTaxWithholding).toEqual(defaultTaxWithholding);
      expect(dividendDistribution.taxWithholdings).toEqual(taxWithholdings);
    });
  });
});
