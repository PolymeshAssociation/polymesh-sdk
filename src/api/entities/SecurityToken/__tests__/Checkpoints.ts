import sinon from 'sinon';

import { createCheckpoint, Namespace, SecurityToken, TransactionQueue } from '~/internal';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';

import { Checkpoints } from '../Checkpoints';

describe('Checkpoints class', () => {
  beforeAll(() => {
    entityMockUtils.initMocks();
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    entityMockUtils.reset();
    dsMockUtils.reset();
  });

  afterAll(() => {
    entityMockUtils.cleanup();
    dsMockUtils.cleanup();
  });

  test('should extend namespace', () => {
    expect(Checkpoints.prototype instanceof Namespace).toBe(true);
  });

  describe('method: create', () => {
    afterAll(() => {
      sinon.restore();
    });

    test('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
      const context = dsMockUtils.getContextInstance();
      const token = entityMockUtils.getSecurityTokenInstance();
      const checkpoints = new Checkpoints(token, context);

      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<SecurityToken>;

      sinon
        .stub(createCheckpoint, 'prepare')
        .withArgs({ ticker: token.ticker }, context)
        .resolves(expectedQueue);

      const queue = await checkpoints.create();

      expect(queue).toBe(expectedQueue);
    });
  });
});
