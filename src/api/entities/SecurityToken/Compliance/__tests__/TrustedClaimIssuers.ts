import sinon from 'sinon';

import { SecurityToken } from '~/api/entities';
import { Identity } from '~/api/entities/Identity';
import { setTokenTrustedClaimIssuers } from '~/api/procedures';
import { Namespace, TransactionQueue } from '~/base';
import { IdentityId } from '~/polkadot';
import { entityMockUtils, polkadotMockUtils } from '~/testUtils/mocks';
import * as utilsModule from '~/utils';

import { TrustedClaimIssuers } from '../TrustedClaimIssuers';

jest.mock(
  '~/api/entities/Identity',
  require('~/testUtils/mocks/entities').mockIdentityModule('~/api/entities/Identity')
);

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

  describe('method: get', () => {
    afterAll(() => {
      sinon.restore();
    });

    test('should return the current default trusted claim issuers', async () => {
      const ticker = 'test';
      const rawTicker = polkadotMockUtils.createMockTicker(ticker);
      const stringToTickerStub = sinon.stub(utilsModule, 'stringToTicker');
      const context = polkadotMockUtils.getContextInstance();
      const token = entityMockUtils.getSecurityTokenInstance({ ticker });

      const expectedDids = ['someDid', 'otherDid', 'yetAnotherDid'];

      const expectedIdentities: Identity[] = [];
      const claimIssuers: IdentityId[] = [];

      expectedDids.forEach(did => {
        expectedIdentities.push(new Identity({ did }, context));
        claimIssuers.push(polkadotMockUtils.createMockIdentityId(did));
      });

      stringToTickerStub.withArgs(ticker, context).returns(rawTicker);
      polkadotMockUtils
        .createQueryStub('generalTm', 'trustedClaimIssuer')
        .withArgs(rawTicker)
        .resolves(claimIssuers);

      const trustedClaimIssuers = new TrustedClaimIssuers(token, context);

      const result = await trustedClaimIssuers.get();

      expect(result).toEqual(expectedIdentities);
    });
  });
});
