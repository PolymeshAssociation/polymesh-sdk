import { Context, DefaultPortfolio, Portfolio } from '~/internal';
import { dsMockUtils } from '~/testUtils/mocks';

describe('DefaultPortfolio class', () => {
  it('should extend Portfolio', () => {
    expect(DefaultPortfolio.prototype instanceof Portfolio).toBe(true);
  });

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

  describe('exists', () => {
    it('should return true', () => {
      const portfolio = new DefaultPortfolio({ did: 'someDid' }, context);

      return expect(portfolio.exists()).resolves.toBe(true);
    });
  });
});
