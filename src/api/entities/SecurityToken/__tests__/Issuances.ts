import BigNumber from 'bignumber.js';
import sinon from 'sinon';

import { SecurityToken } from '~/api/entities';
import { setIssuancesData } from '~/api/procedures';
import { Namespace, TransactionQueue } from '~/base';
import { entityMockUtils, polkadotMockUtils } from '~/testUtils/mocks';

import { Issuances } from '../Issuances';

describe('Issuances class', () => {
  beforeAll(() => {
    entityMockUtils.initMocks();
    polkadotMockUtils.initMocks();
  });

  afterEach(() => {
    polkadotMockUtils.reset();
  });

  afterAll(() => {
    polkadotMockUtils.cleanup();
  });

  test('should extend namespace', () => {
    expect(Issuances.prototype instanceof Namespace).toBe(true);
  });

  describe('method: issue', () => {
    afterAll(() => {
      sinon.restore();
    });

    test('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
      const context = polkadotMockUtils.getContextInstance();
      const token = entityMockUtils.getSecurityTokenInstance();
      const issuances = new Issuances(token, context);

      const args = {
        issuances: [
          {
            did: 'someDid',
            balance: new BigNumber(100),
          },
        ],
      };

      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<SecurityToken>;

      sinon
        .stub(setIssuancesData, 'prepare')
        .withArgs({ ticker: token.ticker, ...args }, context)
        .resolves(expectedQueue);

      const queue = await issuances.issue(args);

      expect(queue).toBe(expectedQueue);
    });
  });
});
