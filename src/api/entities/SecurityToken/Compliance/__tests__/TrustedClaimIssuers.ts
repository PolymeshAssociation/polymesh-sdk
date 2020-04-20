import sinon from 'sinon';

import { SecurityToken } from '~/api/entities';
import { setTokenTrustedClaimIssuers } from '~/api/procedures';
import { Namespace, TransactionQueue } from '~/base';
import { entityMockUtils, polkadotMockUtils } from '~/testUtils/mocks';

import { TrustedClaimIssuers } from '../TrustedClaimIssuers';

describe('TrustedClaimIssuers class', () => {
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
    expect(TrustedClaimIssuers.prototype instanceof Namespace).toBe(true);
  });

  describe('method: set', () => {
    afterAll(() => {
      sinon.restore();
    });

    test('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
      const context = polkadotMockUtils.getContextInstance();
      const token = entityMockUtils.getSecurityTokenInstance();
      const trustedClaimIssuers = new TrustedClaimIssuers(token, context);

      const args = {
        claimIssuerDids: ['someDid', 'otherDid'],
      };

      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<SecurityToken>;

      sinon
        .stub(setTokenTrustedClaimIssuers, 'prepare')
        .withArgs({ ticker: token.ticker, ...args }, context)
        .resolves(expectedQueue);

      const queue = await trustedClaimIssuers.set(args);

      expect(queue).toBe(expectedQueue);
    });
  });
});
