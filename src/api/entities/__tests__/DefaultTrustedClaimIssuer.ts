import {
  PolymeshPrimitivesAssetAssetId,
  PolymeshPrimitivesConditionTrustedIssuer,
} from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import { Context, DefaultTrustedClaimIssuer, Identity } from '~/internal';
import { trustedClaimIssuerQuery } from '~/middleware/queries/claims';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';
import { ClaimType } from '~/types';
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

  it('should extend Entity', () => {
    expect(DefaultTrustedClaimIssuer.prototype instanceof Identity).toBe(true);
  });

  describe('constructor', () => {
    it('should assign assetId and Identity to instance', () => {
      const did = 'someDid';
      const assetId = '12341234-1234-1234-1234-123412341234';
      const trustedClaimIssuer = new DefaultTrustedClaimIssuer({ did, assetId }, context);

      expect(trustedClaimIssuer.asset.id).toBe(assetId);
      expect(trustedClaimIssuer.did).toEqual(did);
    });
  });

  describe('method: isUniqueIdentifiers', () => {
    it('should return true if the object conforms to the interface', () => {
      expect(
        DefaultTrustedClaimIssuer.isUniqueIdentifiers({
          did: 'someDid',
          assetId: '12341234-1234-1234-1234-123412341234',
        })
      ).toBe(true);
      expect(DefaultTrustedClaimIssuer.isUniqueIdentifiers({})).toBe(false);
      expect(DefaultTrustedClaimIssuer.isUniqueIdentifiers({ did: 'someDid' })).toBe(false);
      expect(DefaultTrustedClaimIssuer.isUniqueIdentifiers({ did: 1 })).toBe(false);
    });
  });

  describe('method: addedAt', () => {
    const did = 'someDid';
    const assetId = '12341234-1234-1234-1234-123412341234';
    const variables = {
      assetId,
      issuer: did,
    };
    const getAssetIdForMiddlewareSpy = jest.spyOn(utilsInternalModule, 'getAssetIdForMiddleware');

    it('should return the event identifier object of the trusted claim issuer creation', async () => {
      const blockNumber = new BigNumber(1234);
      const blockDate = new Date('4/14/2020');
      const eventIdx = new BigNumber(1);
      const blockHash = 'someHash';
      const fakeResult = { blockNumber, blockHash, blockDate, eventIndex: eventIdx };
      const trustedClaimIssuer = new DefaultTrustedClaimIssuer({ did, assetId }, context);

      when(getAssetIdForMiddlewareSpy).calledWith(assetId, context).mockResolvedValue(assetId);

      dsMockUtils.createApolloQueryMock(trustedClaimIssuerQuery(false, variables), {
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

      const result = await trustedClaimIssuer.addedAt();

      expect(result).toEqual(fakeResult);
    });

    it('should return null if the query result is empty', async () => {
      const trustedClaimIssuer = new DefaultTrustedClaimIssuer({ did, assetId }, context);

      dsMockUtils.createApolloQueryMock(trustedClaimIssuerQuery(false, variables), {
        trustedClaimIssuers: {
          nodes: [],
        },
      });

      when(getAssetIdForMiddlewareSpy).calledWith(assetId, context).mockResolvedValue(assetId);
      const result = await trustedClaimIssuer.addedAt();
      expect(result).toBeNull();
    });
  });

  describe('method: trustedFor', () => {
    let assetId: string;
    let rawAssetId: PolymeshPrimitivesAssetAssetId;
    let stringToAssetIdSpy: jest.SpyInstance;
    let claimIssuers: PolymeshPrimitivesConditionTrustedIssuer[];
    let trustedClaimIssuerMock: jest.Mock;

    beforeAll(() => {
      assetId = '12341234-1234-1234-1234-123412341234';
      stringToAssetIdSpy = jest.spyOn(utilsConversionModule, 'stringToAssetId');
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
      trustedClaimIssuerMock = dsMockUtils.createQueryMock(
        'complianceManager',
        'trustedClaimIssuer'
      );
      when(trustedClaimIssuerMock).calledWith(rawAssetId).mockResolvedValue(claimIssuers);
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should return the claim types for which the Claim Issuer is trusted', async () => {
      let trustedClaimIssuer = new DefaultTrustedClaimIssuer({ did: 'someDid', assetId }, context);
      when(stringToAssetIdSpy)
        .calledWith(trustedClaimIssuer.asset, context)
        .mockReturnValue(rawAssetId);

      let spy = jest.spyOn(trustedClaimIssuer, 'isEqual').mockReturnValue(true);

      let result = await trustedClaimIssuer.trustedFor();

      expect(result).toBeNull();
      spy.mockRestore();

      trustedClaimIssuer = new DefaultTrustedClaimIssuer({ did: 'otherDid', assetId }, context);

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
      const trustedClaimIssuer = new DefaultTrustedClaimIssuer({ did, assetId }, context);

      when(stringToAssetIdSpy)
        .calledWith(trustedClaimIssuer.asset, context)
        .mockReturnValue(rawAssetId);
      let err;
      try {
        await trustedClaimIssuer.trustedFor();
      } catch (error) {
        err = error;
      }

      expect(err.message).toBe(
        `The Identity with DID "${did}" is no longer a trusted issuer for "${assetId}"`
      );
    });
  });
});
