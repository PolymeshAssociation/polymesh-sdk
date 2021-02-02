import BigNumber from 'bignumber.js';
import sinon from 'sinon';

import { launchSto, Namespace, Sto, TransactionQueue } from '~/internal';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';

import { Offerings } from '../Offerings';

jest.mock(
  '~/api/entities/SecurityToken',
  require('~/testUtils/mocks/entities').mockSecurityTokenModule('~/api/entities/SecurityToken')
);

describe('Offerings class', () => {
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
    expect(Offerings.prototype instanceof Namespace).toBe(true);
  });

  describe('method: launch', () => {
    afterAll(() => {
      sinon.restore();
    });

    test('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
      const context = dsMockUtils.getContextInstance();
      const token = entityMockUtils.getSecurityTokenInstance();
      const ticker = 'SOME_TICKER';
      const offerings = new Offerings(token, context);

      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<Sto>;
      const args = {
        raisingCurrency: 'USD',
        raisingPortfolio: 'someDid',
        name: 'someName',
        tiers: [],
        minInvestment: new BigNumber(100),
      };

      sinon
        .stub(launchSto, 'prepare')
        .withArgs({ ticker, ...args }, context)
        .resolves(expectedQueue);

      const queue = await offerings.launch(args);

      expect(queue).toBe(expectedQueue);
    });
  });
});
