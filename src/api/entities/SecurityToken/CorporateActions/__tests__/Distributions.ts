import sinon from 'sinon';

import {
  ConfigureDividendDistributionParams,
  DividendDistribution,
  Namespace,
  TransactionQueue,
} from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';

import { Distributions } from '../Distributions';

jest.mock(
  '~/api/entities/DividendDistribution',
  require('~/testUtils/mocks/entities').mockDividendDistributionModule(
    '~/api/entities/DividendDistribution'
  )
);
jest.mock(
  '~/api/entities/DefaultPortfolio',
  require('~/testUtils/mocks/entities').mockDefaultPortfolioModule(
    '~/api/entities/DefaultPortfolio'
  )
);
jest.mock(
  '~/api/entities/NumberedPortfolio',
  require('~/testUtils/mocks/entities').mockNumberedPortfolioModule(
    '~/api/entities/NumberedPortfolio'
  )
);
jest.mock(
  '~/base/Procedure',
  require('~/testUtils/mocks/procedure').mockProcedureModule('~/base/Procedure')
);

describe('Distributions class', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();
    procedureMockUtils.initMocks();
  });

  beforeEach(() => {
    dsMockUtils.reset();
    entityMockUtils.reset();
    procedureMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
    entityMockUtils.cleanup();
    procedureMockUtils.cleanup();
  });

  test('should extend namespace', () => {
    expect(Distributions.prototype instanceof Namespace).toBe(true);
  });

  describe('method: configureDividendDistribution', () => {
    afterAll(() => {
      sinon.restore();
    });

    test('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
      const context = dsMockUtils.getContextInstance();
      const token = entityMockUtils.getSecurityTokenInstance();
      const distributions = new Distributions(token, context);

      const args = ({ foo: 'bar' } as unknown) as ConfigureDividendDistributionParams;

      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<DividendDistribution>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs({ args: { ticker: token.ticker, ...args }, transformer: undefined }, context)
        .resolves(expectedQueue);

      const queue = await distributions.configureDividendDistribution(args);

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: get', () => {
    afterAll(() => {
      sinon.restore();
    });

    test('should return all distributions associated to the token', async () => {
      const ticker = 'SOME_TICKER';

      const context = dsMockUtils.getContextInstance();
      const token = entityMockUtils.getSecurityTokenInstance({ ticker });

      context.getDividendDistributionsForTokens
        .withArgs({ tokens: [token] })
        .resolves('distributions');

      const target = new Distributions(token, context);

      const result = await target.get();

      expect(result).toBe('distributions');
    });
  });
});
