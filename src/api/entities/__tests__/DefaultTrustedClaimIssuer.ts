import BigNumber from 'bignumber.js';
import { Ticker, TrustedIssuer } from 'polymesh-types/types';
import sinon from 'sinon';

import { Context, DefaultTrustedClaimIssuer, Identity } from '~/internal';
import { eventByAddedTrustedClaimIssuer } from '~/middleware/queries';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';
import { ClaimType } from '~/types';
import { MAX_TICKER_LENGTH } from '~/utils/constants';
import * as utilsConversionModule from '~/utils/conversion';
import * as utilsInternalModule from '~/utils/internal';

describe('DefaultTrustedClaimIssuer class', () => {
  let context: Context;

  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
  });

  afterEach(() => {
    dsMockUtils.reset();
    entityMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  test('should extend Entity', () => {
    expect(DefaultTrustedClaimIssuer.prototype instanceof Identity).toBe(true);
  });

  describe('constructor', () => {
    test('should assign ticker and Identity to instance', () => {
      const did = 'someDid';
      const ticker = 'SOME_TICKER';
      const trustedClaimIssuer = new DefaultTrustedClaimIssuer({ did, ticker }, context);

      expect(trustedClaimIssuer.asset.ticker).toBe(ticker);
      expect(trustedClaimIssuer.did).toEqual(did);
    });
  });

  describe('method: isUniqueIdentifiers', () => {
    test('should return true if the object conforms to the interface', () => {
      expect(
        DefaultTrustedClaimIssuer.isUniqueIdentifiers({ did: 'someDid', ticker: 'symbol' })
      ).toBe(true);
      expect(DefaultTrustedClaimIssuer.isUniqueIdentifiers({})).toBe(false);
      expect(DefaultTrustedClaimIssuer.isUniqueIdentifiers({ did: 'someDid' })).toBe(false);
      expect(DefaultTrustedClaimIssuer.isUniqueIdentifiers({ did: 1 })).toBe(false);
    });
  });

  describe('method: addedAt', () => {
    const did = 'someDid';
    const ticker = 'SOME_TICKER';
    const variables = {
      ticker: utilsInternalModule.padString(ticker, MAX_TICKER_LENGTH),
      identityId: did,
    };

    test('should return the event identifier object of the trusted claim issuer creation', async () => {
      const blockNumber = new BigNumber(1234);
      const blockDate = new Date('4/14/2020');
      const eventIdx = 1;
      const fakeResult = { blockNumber, blockDate, eventIndex: eventIdx };
      const trustedClaimIssuer = new DefaultTrustedClaimIssuer({ did, ticker }, context);

      dsMockUtils.createApolloQueryStub(eventByAddedTrustedClaimIssuer(variables), {
        /* eslint-disable @typescript-eslint/naming-convention */
        eventByAddedTrustedClaimIssuer: {
          block_id: blockNumber.toNumber(),
          block: { datetime: blockDate },
          event_idx: eventIdx,
        },
        /* eslint-enable @typescript-eslint/naming-convention */
      });

      const result = await trustedClaimIssuer.addedAt();

      expect(result).toEqual(fakeResult);
    });

    test('should return null if the query result is empty', async () => {
      const trustedClaimIssuer = new DefaultTrustedClaimIssuer({ did, ticker }, context);

      dsMockUtils.createApolloQueryStub(eventByAddedTrustedClaimIssuer(variables), {});
      const result = await trustedClaimIssuer.addedAt();
      expect(result).toBeNull();
    });
  });

  describe('method: trustedFor', () => {
    let ticker: string;
    let rawTicker: Ticker;
    let stringToTickerStub: sinon.SinonStub;
    let claimIssuers: TrustedIssuer[];
    let trustedClaimIssuerStub: sinon.SinonStub;

    beforeAll(() => {
      ticker = 'SOME_TICKER';
      rawTicker = dsMockUtils.createMockTicker(ticker);
      stringToTickerStub = sinon.stub(utilsConversionModule, 'stringToTicker');
      claimIssuers = [
        dsMockUtils.createMockTrustedIssuer({
          issuer: dsMockUtils.createMockIdentityId('someDid'),
          // eslint-disable-next-line @typescript-eslint/naming-convention
          trusted_for: dsMockUtils.createMockTrustedFor('Any'),
        }),
        dsMockUtils.createMockTrustedIssuer({
          issuer: dsMockUtils.createMockIdentityId('otherDid'),
          // eslint-disable-next-line @typescript-eslint/naming-convention
          trusted_for: dsMockUtils.createMockTrustedFor({
            Specific: [dsMockUtils.createMockClaimType(ClaimType.Exempted)],
          }),
        }),
      ];
    });

    beforeEach(() => {
      stringToTickerStub.withArgs(ticker, context).returns(rawTicker);
      trustedClaimIssuerStub = dsMockUtils.createQueryStub(
        'complianceManager',
        'trustedClaimIssuer'
      );
      trustedClaimIssuerStub.withArgs(rawTicker).resolves(claimIssuers);
    });

    afterAll(() => {
      sinon.restore();
    });

    test('should return the claim types for which the Claim Issuer is trusted', async () => {
      let trustedClaimIssuer = new DefaultTrustedClaimIssuer({ did: 'someDid', ticker }, context);

      let result = await trustedClaimIssuer.trustedFor();

      expect(result).toBeNull();

      trustedClaimIssuer = new DefaultTrustedClaimIssuer({ did: 'otherDid', ticker }, context);

      result = await trustedClaimIssuer.trustedFor();

      expect(result).toEqual([ClaimType.Exempted]);
    });

    test('should throw an error if the Identity is no longer a trusted Claim Issuer', async () => {
      const did = 'randomDid';
      const trustedClaimIssuer = new DefaultTrustedClaimIssuer({ did, ticker }, context);

      let err;
      try {
        await trustedClaimIssuer.trustedFor();
      } catch (error) {
        err = error;
      }

      expect(err.message).toBe(
        `The Identity with DID "${did}" is no longer a trusted issuer for "${ticker}"`
      );
    });
  });
});
