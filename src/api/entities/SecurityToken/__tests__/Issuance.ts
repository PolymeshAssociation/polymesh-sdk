import BigNumber from 'bignumber.js';
import sinon from 'sinon';

import { issueTokens, Namespace, SecurityToken, TransactionQueue } from '~/internal';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';

import { Issuance } from '../Issuance';

describe('Issuance class', () => {
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
    expect(Issuance.prototype instanceof Namespace).toBe(true);
  });

  describe('method: issue', () => {
    afterAll(() => {
      sinon.restore();
    });

    test('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
      const context = dsMockUtils.getContextInstance();
      const token = entityMockUtils.getSecurityTokenInstance();
      const issuance = new Issuance(token, context);

      const args = {
        ticker: token.ticker,
        amount: new BigNumber(100),
      };

      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<SecurityToken>;

      sinon.stub(issueTokens, 'prepare').withArgs(args, context).resolves(expectedQueue);

      const queue = await issuance.issue(args);

      expect(queue).toBe(expectedQueue);
    });
  });
});
