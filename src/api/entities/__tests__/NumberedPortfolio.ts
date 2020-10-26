import BigNumber from 'bignumber.js';
import sinon from 'sinon';

import { Entity, Identity, NumberedPortfolio } from '~/api/entities';
import { deletePortfolio } from '~/api/procedures';
import { Context, TransactionQueue } from '~/base';
import { dsMockUtils } from '~/testUtils/mocks';

describe('Numberedortfolio class', () => {
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
    expect(NumberedPortfolio.prototype instanceof Entity).toBe(true);
  });

  describe('constructor', () => {
    test('should assign Identity and id to instance', () => {
      const did = 'someDid';
      const id = new BigNumber(1);
      const identity = new Identity({ did }, context);
      const portfolio = new NumberedPortfolio({ did, id }, context);

      expect(portfolio.owner).toEqual(identity);
      expect(portfolio.id).toEqual(id);
    });
  });

  describe('method: isUniqueIdentifiers', () => {
    test('should return true if the object conforms to the interface', () => {
      expect(NumberedPortfolio.isUniqueIdentifiers({ did: 'someDid', id: new BigNumber(1) })).toBe(
        true
      );
      expect(NumberedPortfolio.isUniqueIdentifiers({ did: 'someDid' })).toBe(false);
      expect(NumberedPortfolio.isUniqueIdentifiers({})).toBe(false);
      expect(NumberedPortfolio.isUniqueIdentifiers({ did: 'someDid', id: 3 })).toBe(false);
      expect(NumberedPortfolio.isUniqueIdentifiers({ did: 1, id: new BigNumber(1) })).toBe(false);
    });
  });

  describe('method: delete', () => {
    test('should prepare the procedure and return the resulting transaction queue', async () => {
      const id = new BigNumber(1);
      const did = 'someDid';
      const numberedPortfolio = new NumberedPortfolio({ id, did }, context);
      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<void>;

      sinon
        .stub(deletePortfolio, 'prepare')
        .withArgs({ id, did }, context)
        .resolves(expectedQueue);

      const queue = await numberedPortfolio.delete();

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: getName', () => {
    test('should return the name of the Portfolio', async () => {
      const id = new BigNumber(1);
      const did = 'someDid';
      const portfolioName = 'someName';
      const rawPortfolioName = dsMockUtils.createMockBytes(portfolioName);
      const numberedPortfolio = new NumberedPortfolio({ id, did }, context);

      dsMockUtils.createQueryStub('portfolio', 'portfolios', {
        returnValue: rawPortfolioName,
      });

      const result = await numberedPortfolio.getName();

      expect(result).toEqual(portfolioName);
    });
  });
});
