import BigNumber from 'bignumber.js';

import { Context, CorporateAction, Entity } from '~/internal';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';
import { CorporateActionKind, TargetTreatment, TaxWithholding } from '~/types';

describe('CorporateAction class', () => {
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

  test('should extend Entity', () => {
    expect(CorporateAction.prototype instanceof Entity).toBe(true);
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
      const kind = CorporateActionKind.UnpredictableBenefit;
      const corporateAction = new CorporateAction(
        {
          id,
          ticker,
          declarationDate,
          description,
          targets,
          defaultTaxWithholding,
          taxWithholdings,
          kind,
        },
        context
      );

      expect(corporateAction.id).toEqual(id);
      expect(corporateAction.ticker).toBe(ticker);
      expect(corporateAction.declarationDate).toEqual(declarationDate);
      expect(corporateAction.description).toEqual(description);
      expect(corporateAction.targets).toEqual(targets);
      expect(corporateAction.defaultTaxWithholding).toEqual(defaultTaxWithholding);
      expect(corporateAction.taxWithholdings).toEqual(taxWithholdings);
    });
  });

  describe('method: isUniqueIdentifiers', () => {
    test('should return true if the object conforms to the interface', () => {
      expect(CorporateAction.isUniqueIdentifiers({ ticker: 'SYMBOL', id: new BigNumber(1) })).toBe(
        true
      );
      expect(CorporateAction.isUniqueIdentifiers({})).toBe(false);
      expect(CorporateAction.isUniqueIdentifiers({ ticker: 'SYMBOL' })).toBe(false);
      expect(CorporateAction.isUniqueIdentifiers({ id: 1 })).toBe(false);
    });
  });
});
