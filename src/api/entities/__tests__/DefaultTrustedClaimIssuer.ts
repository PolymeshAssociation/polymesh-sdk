import BigNumber from 'bignumber.js';

import { Context, DefaultTrustedClaimIssuer, Entity, Identity } from '~/internal';
import { eventByAddedTrustedClaimIssuer } from '~/middleware/queries';
import { dsMockUtils } from '~/testUtils/mocks';
import { MAX_TICKER_LENGTH } from '~/utils/constants';
import * as utilsInternalModule from '~/utils/internal';

describe('DefaultTrustedClaimIssuer class', () => {
  let context: Context;

  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  test('should extend entity', () => {
    expect(DefaultTrustedClaimIssuer.prototype instanceof Entity).toBe(true);
  });

  describe('constructor', () => {
    test('should assign ticker and Identity to instance', () => {
      const did = 'someDid';
      const ticker = 'SOMETICKER';
      const identity = new Identity({ did }, context);
      const trustedClaimIssuer = new DefaultTrustedClaimIssuer({ did, ticker }, context);

      expect(trustedClaimIssuer.ticker).toBe(ticker);
      expect(trustedClaimIssuer.identity).toEqual(identity);
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
    const ticker = 'SOMETICKER';
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
        /* eslint-disable @typescript-eslint/camelcase */
        eventByAddedTrustedClaimIssuer: {
          block_id: blockNumber.toNumber(),
          block: { datetime: blockDate },
          event_idx: eventIdx,
        },
        /* eslint-enable @typescript-eslint/camelcase */
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
});
