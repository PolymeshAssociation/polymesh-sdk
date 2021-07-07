import BigNumber from 'bignumber.js';

import { Context, DefaultTrustedClaimIssuer, Identity } from '~/internal';
import { eventByAddedTrustedClaimIssuer } from '~/middleware/queries';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';
import { MAX_TICKER_LENGTH } from '~/utils/constants';
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
    entityMockUtils.cleanup();
  });

  test('should extend Entity', () => {
    expect(DefaultTrustedClaimIssuer.prototype instanceof Identity).toBe(true);
  });

  describe('constructor', () => {
    test('should assign ticker and Identity to instance', () => {
      const did = 'someDid';
      const ticker = 'SOMETICKER';
      const trustedClaimIssuer = new DefaultTrustedClaimIssuer({ did, ticker }, context);

      expect(trustedClaimIssuer.ticker).toBe(ticker);
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
});
