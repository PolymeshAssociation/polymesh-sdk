import BigNumber from 'bignumber.js';
import sinon from 'sinon';

import {
  Context,
  CorporateAction,
  Entity,
  Identity,
  linkCaDocs,
  TransactionQueue,
} from '~/internal';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';
import { CorporateActionKind, TargetTreatment, TaxWithholding } from '~/types';

describe('CorporateAction class', () => {
  let context: Context;
  let id: BigNumber;
  let ticker: string;
  let declarationDate: Date;
  let description: string;
  let targets: {
    identities: Identity[];
    treatment: TargetTreatment;
  };
  let defaultTaxWithholding: BigNumber;
  let taxWithholdings: TaxWithholding[];
  let kind: CorporateActionKind;

  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
    id = new BigNumber(1);
    ticker = 'SOME_TICKER';
    declarationDate = new Date('10/14/1987');
    description = 'something';
    targets = {
      identities: [entityMockUtils.getIdentityInstance()],
      treatment: TargetTreatment.Include,
    };
    defaultTaxWithholding = new BigNumber(10);
    taxWithholdings = [];
    kind = CorporateActionKind.UnpredictableBenefit;
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

  describe('method: linkCaDocs', () => {
    test('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
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

      const args = {
        documents: [
          {
            name: 'someName',
            uri: 'someUri',
            contentHash: 'someHash',
          },
        ],
      };

      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<void>;

      sinon
        .stub(linkCaDocs, 'prepare')
        .withArgs({ id, ticker, ...args }, context)
        .resolves(expectedQueue);

      const queue = await corporateAction.linkCaDocs(args);

      expect(queue).toBe(expectedQueue);
    });
  });
});
