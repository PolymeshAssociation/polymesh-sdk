import sinon, { SinonStub } from 'sinon';

import { Namespace, NumberedPortfolio } from '~/api/entities';
import { Identity } from '~/api/entities/Identity';
import { createPortfolio } from '~/api/procedures';
import { Context, TransactionQueue } from '~/base';
import { dsMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';

import { Portfolios } from '../Portfolios';

describe('Portfolios class', () => {
  let context: Mocked<Context>;
  let portfolios: Portfolios;
  let identity: Identity;
  let prepareCreatePortfolioStub: SinonStub;

  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
    identity = new Identity({ did: 'someDid' }, context);
    portfolios = new Portfolios(identity, context);
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  test('should extend namespace', () => {
    expect(Portfolios.prototype instanceof Namespace).toBe(true);
  });

  describe('method: createPortfolio', () => {
    beforeAll(() => {
      prepareCreatePortfolioStub = sinon.stub(createPortfolio, 'prepare');
    });

    afterAll(() => {
      sinon.restore();
    });

    test('should prepare the procedure and return the resulting transaction queue', async () => {
      const name = 'someName';
      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<NumberedPortfolio>;

      prepareCreatePortfolioStub.withArgs({ name }, context).resolves(expectedQueue);

      const queue = await portfolios.createPortfolio({ name });

      expect(queue).toBe(expectedQueue);
    });
  });
});
