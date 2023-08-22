import {
  PolymeshPrimitivesConditionTrustedIssuer,
  PolymeshPrimitivesTicker,
} from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import { Context, DefaultTrustedClaimIssuer, Identity } from '~/internal';
import { trustedClaimIssuerQuery } from '~/middleware/queries';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';
import { ClaimType } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

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

  it('should extend Entity', () => {
    expect(DefaultTrustedClaimIssuer.prototype instanceof Identity).toBe(true);
  });

  describe('constructor', () => {
    it('should assign ticker and Identity to instance', () => {
      const did = 'someDid';
      const ticker = 'SOME_TICKER';
      const trustedClaimIssuer = new DefaultTrustedClaimIssuer({ did, ticker }, context);

      expect(trustedClaimIssuer.asset.ticker).toBe(ticker);
      expect(trustedClaimIssuer.did).toEqual(did);
    });
  });

  describe('method: isUniqueIdentifiers', () => {
    it('should return true if the object conforms to the interface', () => {
      expect(
        DefaultTrustedClaimIssuer.isUniqueIdentifiers({ did: 'someDid', ticker: 'symbol' })
      ).toBe(true);
      expect(DefaultTrustedClaimIssuer.isUniqueIdentifiers({})).toBe(false);
      expect(DefaultTrustedClaimIssuer.isUniqueIdentifiers({ did: 'someDid' })).toBe(false);
      expect(DefaultTrustedClaimIssuer.isUniqueIdentifiers({ did: 1 })).toBe(false);
    });
  });

  describe('method: addedAtV2', () => {
    const did = 'someDid';
    const ticker = 'SOME_TICKER';
    const variables = {
      assetId: ticker,
      issuer: did,
    };

    it('should return the event identifier object of the trusted claim issuer creation', async () => {
      const blockNumber = new BigNumber(1234);
      const blockDate = new Date('4/14/2020');
      const eventIdx = new BigNumber(1);
      const blockHash = 'someHash';
      const fakeResult = { blockNumber, blockHash, blockDate, eventIndex: eventIdx };
      const trustedClaimIssuer = new DefaultTrustedClaimIssuer({ did, ticker }, context);

      dsMockUtils.createApolloV2QueryMock(trustedClaimIssuerQuery(variables), {
        trustedClaimIssuers: {
          nodes: [
            {
              createdBlock: {
                datetime: blockDate,
                hash: blockHash,
                blockId: blockNumber.toNumber(),
              },
              eventIdx: eventIdx.toNumber(),
            },
          ],
        },
      });

      const result = await trustedClaimIssuer.addedAtV2();

      expect(result).toEqual(fakeResult);
    });

    it('should return null if the query result is empty', async () => {
      const trustedClaimIssuer = new DefaultTrustedClaimIssuer({ did, ticker }, context);

      dsMockUtils.createApolloV2QueryMock(trustedClaimIssuerQuery(variables), {
        trustedClaimIssuers: {
          nodes: [],
        },
      });
      const result = await trustedClaimIssuer.addedAtV2();
      expect(result).toBeNull();
    });
  });

  describe('method: trustedFor', () => {
    let ticker: string;
    let rawTicker: PolymeshPrimitivesTicker;
    let stringToTickerSpy: jest.SpyInstance;
    let claimIssuers: PolymeshPrimitivesConditionTrustedIssuer[];
    let trustedClaimIssuerMock: jest.Mock;

    beforeAll(() => {
      ticker = 'SOME_TICKER';
      rawTicker = dsMockUtils.createMockTicker(ticker);
      stringToTickerSpy = jest.spyOn(utilsConversionModule, 'stringToTicker');
      claimIssuers = [
        dsMockUtils.createMockTrustedIssuer({
          issuer: dsMockUtils.createMockIdentityId('someDid'),
          // eslint-disable-next-line @typescript-eslint/naming-convention
          trustedFor: dsMockUtils.createMockTrustedFor('Any'),
        }),
        dsMockUtils.createMockTrustedIssuer({
          issuer: dsMockUtils.createMockIdentityId('otherDid'),
          // eslint-disable-next-line @typescript-eslint/naming-convention
          trustedFor: dsMockUtils.createMockTrustedFor({
            Specific: [dsMockUtils.createMockClaimType(ClaimType.Exempted)],
          }),
        }),
      ];
    });

    beforeEach(() => {
      when(stringToTickerSpy).calledWith(ticker, context).mockReturnValue(rawTicker);
      trustedClaimIssuerMock = dsMockUtils.createQueryMock(
        'complianceManager',
        'trustedClaimIssuer'
      );
      when(trustedClaimIssuerMock).calledWith(rawTicker).mockResolvedValue(claimIssuers);
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should return the claim types for which the Claim Issuer is trusted', async () => {
      let trustedClaimIssuer = new DefaultTrustedClaimIssuer({ did: 'someDid', ticker }, context);
      let spy = jest.spyOn(trustedClaimIssuer, 'isEqual').mockReturnValue(true);

      let result = await trustedClaimIssuer.trustedFor();

      expect(result).toBeNull();
      spy.mockRestore();

      trustedClaimIssuer = new DefaultTrustedClaimIssuer({ did: 'otherDid', ticker }, context);

      spy = jest
        .spyOn(trustedClaimIssuer, 'isEqual')
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(true);
      result = await trustedClaimIssuer.trustedFor();

      expect(result).toEqual([ClaimType.Exempted]);
      spy.mockRestore();
    });

    it('should throw an error if the Identity is no longer a trusted Claim Issuer', async () => {
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
