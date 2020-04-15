import BigNumber from 'bignumber.js';
import sinon from 'sinon';

import { SecurityToken } from '~/api/entities';
import { issueTokens } from '~/api/procedures';
import { Namespace, TransactionQueue } from '~/base';
import { entityMockUtils, polkadotMockUtils } from '~/testUtils/mocks';

import { Issuance } from '../Issuance';

describe('Issuance class', () => {
  beforeAll(() => {
    entityMockUtils.initMocks();
    polkadotMockUtils.initMocks();
  });

  afterEach(() => {
    entityMockUtils.reset();
    polkadotMockUtils.reset();
  });

  afterAll(() => {
    entityMockUtils.cleanup();
    polkadotMockUtils.cleanup();
  });

  test('should extend namespace', () => {
    expect(Issuance.prototype instanceof Namespace).toBe(true);
  });

  describe('method: issue', () => {
    afterAll(() => {
      sinon.restore();
    });

    test('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
      const context = polkadotMockUtils.getContextInstance();
      const token = entityMockUtils.getSecurityTokenInstance();
      const issuance = new Issuance(token, context);

      const args = {
        issuanceData: [
          {
            did: 'someDid',
            amount: new BigNumber(100),
          },
        ],
      };

      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<SecurityToken>;

      sinon
        .stub(issueTokens, 'prepare')
        .withArgs({ ticker: token.ticker, ...args }, context)
        .resolves(expectedQueue);

      const queue = await issuance.issue(args);

      expect(queue).toBe(expectedQueue);
    });
  });
});
