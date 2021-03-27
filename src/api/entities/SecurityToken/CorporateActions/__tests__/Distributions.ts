import sinon from 'sinon';

import {
  configureDividendDistribution,
  ConfigureDividendDistributionParams,
  DividendDistribution,
  Namespace,
  TransactionQueue,
} from '~/internal';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';

import { Distributions } from '../Distributions';

describe('Distributions class', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();
  });

  beforeEach(() => {
    dsMockUtils.reset();
    entityMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
    entityMockUtils.cleanup();
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

      sinon
        .stub(configureDividendDistribution, 'prepare')
        .withArgs({ ticker: token.ticker, ...args }, context)
        .resolves(expectedQueue);

      const queue = await distributions.configureDividendDistribution(args);

      expect(queue).toBe(expectedQueue);
    });
  });
});
