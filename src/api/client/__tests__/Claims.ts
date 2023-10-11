import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import { Claims } from '~/api/client/Claims';
import { Context, PolymeshTransaction } from '~/internal';
import { ClaimTypeEnum } from '~/middleware/enums';
import { claimsGroupingQuery, claimsQuery } from '~/middleware/queries';
import { Claim, ClaimsGroupBy, ClaimsOrderBy } from '~/middleware/types';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import {
  ClaimData,
  ClaimOperation,
  ClaimTarget,
  ClaimType,
  IdentityWithClaims,
  ResultSet,
  Scope,
  ScopeType,
} from '~/types';
import * as utilsConversionModule from '~/utils/conversion';
import * as utilsInternalModule from '~/utils/internal';

jest.mock(
  '~/api/entities/Identity',
  require('~/testUtils/mocks/entities').mockIdentityModule('~/api/entities/Identity')
);
jest.mock(
  '~/base/Procedure',
  require('~/testUtils/mocks/procedure').mockProcedureModule('~/base/Procedure')
);

describe('Claims Class', () => {
  let context: Mocked<Context>;
  let claims: Claims;

  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();
    procedureMockUtils.initMocks();
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
    claims = new Claims(context);
  });

  afterEach(() => {
    dsMockUtils.reset();
    entityMockUtils.reset();
    procedureMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
    procedureMockUtils.cleanup();
  });

  describe('method: getIssuedClaims', () => {
    it('should return a list of issued claims', async () => {
      const target = 'someDid';
      const getIdentityClaimsFromMiddleware: ResultSet<ClaimData> = {
        data: [
          {
            target: entityMockUtils.getIdentityInstance({ did: target }),
            issuer: entityMockUtils.getIdentityInstance({ did: 'otherDid' }),
            issuedAt: new Date(),
            lastUpdatedAt: new Date(),
            expiry: null,
            claim: {
              type: ClaimType.Accredited,
              scope: { type: ScopeType.Ticker, value: 'TICKER' },
            },
          },
        ],
        next: new BigNumber(1),
        count: new BigNumber(1),
      };

      dsMockUtils.configureMocks({
        contextOptions: {
          getIdentityClaimsFromMiddleware,
        },
      });

      let result = await claims.getIssuedClaims();
      expect(result).toEqual(getIdentityClaimsFromMiddleware);

      result = await claims.getIssuedClaims({ target });
      expect(result).toEqual(getIdentityClaimsFromMiddleware);
    });
  });

  describe('method: getIdentitiesWithClaims', () => {
    beforeAll(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date(2023, 4, 17));
    });

    afterAll(() => {
      jest.useRealTimers();
    });

    it('should return a list of Identities with claims associated to them', async () => {
      const targetDid = 'someTargetDid';
      const issuerDid = 'someIssuerDid';
      const date = 1589816265000;
      const customerDueDiligenceType = ClaimTypeEnum.CustomerDueDiligence;
      const cddId = 'someCddId';
      const claimData = {
        type: ClaimTypeEnum.CustomerDueDiligence,
        id: cddId,
      };
      const claim = {
        target: entityMockUtils.getIdentityInstance({ did: targetDid }),
        issuer: entityMockUtils.getIdentityInstance({ did: issuerDid }),
        issuedAt: new Date(date),
        lastUpdatedAt: new Date(date),
      };

      const fakeClaims = [
        {
          identity: entityMockUtils.getIdentityInstance({ did: targetDid }),
          claims: [
            {
              ...claim,
              expiry: new Date(date),
              claim: claimData,
            },
            {
              ...claim,
              expiry: null,
              claim: claimData,
            },
          ],
        },
      ];

      const commonClaimData = {
        targetId: targetDid,
        issuerId: issuerDid,
        issuanceDate: date,
        lastUpdateDate: date,
      };
      const claimsQueryResponse = {
        nodes: [
          {
            ...commonClaimData,
            expiry: date,
            type: customerDueDiligenceType,
            cddId,
          },
          {
            ...commonClaimData,
            expiry: null,
            type: customerDueDiligenceType,
            cddId,
          },
        ],
      };

      dsMockUtils.configureMocks({ contextOptions: { withSigningManager: true } });

      dsMockUtils.createApolloQueryMock(
        claimsQuery({
          dids: [targetDid],
          scope: undefined,
          trustedClaimIssuers: [issuerDid],
          claimTypes: [ClaimTypeEnum.CustomerDueDiligence],
          includeExpired: false,
        }),
        {
          claims: claimsQueryResponse,
        }
      );

      let result = await claims.getIdentitiesWithClaims({
        targets: [targetDid],
        trustedClaimIssuers: [issuerDid],
        claimTypes: [ClaimType.CustomerDueDiligence],
        includeExpired: false,
        size: new BigNumber(1),
        start: new BigNumber(0),
      });

      expect(JSON.stringify(result.data)).toBe(JSON.stringify(fakeClaims));
      expect(result.count).toEqual(new BigNumber(1));
      expect(result.next).toEqual(null);

      dsMockUtils.createApolloMultipleQueriesMock([
        {
          query: claimsGroupingQuery({
            scope: undefined,
            trustedClaimIssuers: undefined,
            claimTypes: undefined,
            includeExpired: true,
          }),
          returnData: {
            claims: {
              groupedAggregates: [
                {
                  keys: [targetDid],
                },
              ],
            },
          },
        },
        {
          query: claimsQuery({
            dids: [targetDid],
            scope: undefined,
            trustedClaimIssuers: undefined,
            claimTypes: undefined,
            includeExpired: true,
          }),
          returnData: {
            claims: claimsQueryResponse,
          },
        },
      ]);

      result = await claims.getIdentitiesWithClaims();

      expect(JSON.stringify(result.data)).toBe(JSON.stringify(fakeClaims));
      expect(result.count).toEqual(new BigNumber(1));
      expect(result.next).toEqual(null);
    });

    it('should return a list of Identities with claims associated to them filtered by scope', async () => {
      const targetDid = 'someTargetDid';
      const issuerDid = 'someIssuerDid';
      const scope: Scope = { type: ScopeType.Ticker, value: 'someValue' };
      const date = 1589816265000;
      const accreditedType = ClaimTypeEnum.Accredited;
      const claimData = {
        type: ClaimTypeEnum.Accredited,
        scope,
      };
      const claim = {
        target: entityMockUtils.getIdentityInstance({ did: targetDid }),
        issuer: entityMockUtils.getIdentityInstance({ did: issuerDid }),
        issuedAt: new Date(date),
        lastUpdatedAt: new Date(date),
      };

      const fakeClaims = [
        {
          identity: entityMockUtils.getIdentityInstance({ did: targetDid }),
          claims: [
            {
              ...claim,
              expiry: new Date(date),
              claim: claimData,
            },
            {
              ...claim,
              expiry: null,
              claim: claimData,
            },
          ],
        },
      ];
      const commonClaimData = {
        targetId: targetDid,
        issuerId: issuerDid,
        issuanceDate: date,
        lastUpdateDate: date,
      };
      const claimsQueryResponse = {
        nodes: [
          {
            ...commonClaimData,
            expiry: date,
            type: accreditedType,
            scope: { type: 'Ticker', value: 'someValue' },
          },
          {
            ...commonClaimData,
            expiry: null,
            type: accreditedType,
            scope: { type: 'Ticker', value: 'someValue' },
          },
        ],
      };

      dsMockUtils.configureMocks({ contextOptions: { withSigningManager: true } });

      dsMockUtils.createApolloQueryMock(
        claimsQuery({
          dids: [targetDid],
          scope: { type: 'Ticker', value: 'someValue' },
          trustedClaimIssuers: [issuerDid],
          claimTypes: [ClaimTypeEnum.Accredited],
          includeExpired: false,
        }),
        {
          claims: claimsQueryResponse,
        }
      );

      const result = await claims.getIdentitiesWithClaims({
        targets: [targetDid],
        trustedClaimIssuers: [issuerDid],
        scope,
        claimTypes: [ClaimType.Accredited],
        includeExpired: false,
        size: new BigNumber(1),
        start: new BigNumber(0),
      });

      expect(JSON.stringify(result.data)).toBe(JSON.stringify(fakeClaims));
      expect(result.count).toEqual(new BigNumber(1));
      expect(result.next).toBeNull();
    });
  });

  describe('method: addClaims', () => {
    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const targets: ClaimTarget[] = [
        {
          target: 'someDid',
          claim: {
            type: ClaimType.Accredited,
            scope: { type: ScopeType.Identity, value: 'someDid' },
          },
        },
      ];

      const args = { claims: targets };

      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<void>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith(
          { args: { ...args, operation: ClaimOperation.Add }, transformer: undefined },
          context,
          {}
        )
        .mockResolvedValue(expectedTransaction);

      const tx = await claims.addClaims(args);

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: editClaims', () => {
    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const targets: ClaimTarget[] = [
        {
          target: 'someDid',
          claim: {
            type: ClaimType.Accredited,
            scope: { type: ScopeType.Identity, value: 'someDid' },
          },
        },
      ];

      const args = { claims: targets };

      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<void>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith(
          { args: { ...args, operation: ClaimOperation.Edit }, transformer: undefined },
          context,
          {}
        )
        .mockResolvedValue(expectedTransaction);

      const tx = await claims.editClaims(args);

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: revokeClaims', () => {
    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const targets: ClaimTarget[] = [
        {
          target: 'someDid',
          claim: {
            type: ClaimType.Accredited,
            scope: { type: ScopeType.Identity, value: 'someDid' },
          },
        },
      ];

      const args = { claims: targets };

      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<void>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith(
          { args: { ...args, operation: ClaimOperation.Revoke }, transformer: undefined },
          context,
          {}
        )
        .mockResolvedValue(expectedTransaction);

      const tx = await claims.revokeClaims(args);

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: getCddClaims', () => {
    afterAll(() => {
      jest.restoreAllMocks();
    });
    it('should return a list of cdd claims', async () => {
      const target = 'someTarget';
      jest.spyOn(utilsInternalModule, 'getDid').mockResolvedValue(target);

      const rawTarget = dsMockUtils.createMockIdentityId(target);
      jest.spyOn(utilsConversionModule, 'stringToIdentityId').mockReturnValue(rawTarget);

      const claimIssuer = 'someClaimIssuer';
      const issuanceDate = new Date('2023/01/01');
      const lastUpdateDate = new Date('2023/06/01');
      const claim = {
        type: ClaimType.CustomerDueDiligence,
        id: 'someCddId',
      };

      /* eslint-disable @typescript-eslint/naming-convention */
      const rawIdentityClaim = {
        claim_issuer: dsMockUtils.createMockIdentityId(claimIssuer),
        issuance_date: dsMockUtils.createMockMoment(new BigNumber(issuanceDate.getTime())),
        last_update_date: dsMockUtils.createMockMoment(new BigNumber(lastUpdateDate.getTime())),
        expiry: dsMockUtils.createMockOption(),
        claim: dsMockUtils.createMockClaim({
          CustomerDueDiligence: dsMockUtils.createMockCddId(claim.id),
        }),
      };
      /* eslint-enable @typescript-eslint/naming-convention */

      jest.spyOn(utilsConversionModule, 'identityIdToString').mockReturnValue(claimIssuer);
      dsMockUtils.createRpcMock('identity', 'validCDDClaims', {
        returnValue: [rawIdentityClaim],
      });

      const mockResult = {
        target: expect.objectContaining({
          did: target,
        }),
        issuer: expect.objectContaining({
          did: claimIssuer,
        }),
        issuedAt: issuanceDate,
        lastUpdatedAt: lastUpdateDate,
        expiry: null,
        claim,
      };
      let result = await claims.getCddClaims();

      expect(result).toEqual([mockResult]);

      const expiry = new Date('2030/01/01');
      dsMockUtils.createRpcMock('identity', 'validCDDClaims', {
        returnValue: [
          {
            ...rawIdentityClaim,
            expiry: dsMockUtils.createMockOption(
              dsMockUtils.createMockMoment(new BigNumber(expiry.getTime()))
            ),
          },
        ],
      });

      result = await claims.getCddClaims({ target, includeExpired: false });

      expect(result).toEqual([
        {
          ...mockResult,
          expiry,
        },
      ]);
    });
  });

  describe('method: getClaimScopes', () => {
    it('should return a list of scopes and tickers', async () => {
      const target = 'someTarget';
      const someDid = 'someDid';
      const fakeClaimData = [
        {
          claim: {
            type: ClaimType.Jurisdiction,
            scope: {
              type: ScopeType.Identity,
              value: someDid,
            },
          },
        },
        {
          claim: {
            type: ClaimType.Jurisdiction,
            scope: {
              type: ScopeType.Ticker,
              value: 'someTicker',
            },
          },
        },
      ] as ClaimData[];

      dsMockUtils.configureMocks({
        contextOptions: {
          did: target,
          getIdentityClaimsFromChain: fakeClaimData,
        },
      });

      let result = await claims.getClaimScopes({ target });

      expect(result[0].ticker).toBeUndefined();
      expect(result[0].scope).toEqual({ type: ScopeType.Identity, value: someDid });

      result = await claims.getClaimScopes();

      expect(result.length).toEqual(2);
    });
  });

  describe('method: getTargetingClaims', () => {
    beforeAll(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date(2023, 4, 17));
    });

    afterAll(() => {
      jest.useRealTimers();
      jest.restoreAllMocks();
    });

    it('should return a list of claims issued with an Identity as target', async () => {
      const did = 'someDid';
      const issuerDid = 'someIssuerDid';
      const date = 1589816265000;
      const scope = { type: ScopeType.Custom, value: 'someValue' };
      const claim = {
        target: entityMockUtils.getIdentityInstance({ did }),
        issuer: entityMockUtils.getIdentityInstance({ did: issuerDid }),
        issuedAt: new Date(date),
        lastUpdatedAt: new Date(date),
      };
      const fakeClaims: IdentityWithClaims[] = [
        {
          identity: entityMockUtils.getIdentityInstance({ did }),
          claims: [
            {
              ...claim,
              expiry: new Date(date),
              claim: {
                type: ClaimType.CustomerDueDiligence,
                id: 'someCddId',
              },
            },
          ],
        },
      ];

      const claimsQueryResponse = {
        nodes: [
          {
            targetId: did,
            issuerId: issuerDid,
            issuanceDate: date,
            lastUpdateDate: date,
            expiry: date,
            type: ClaimTypeEnum.CustomerDueDiligence,
          },
        ],
      };

      dsMockUtils.configureMocks({ contextOptions: { withSigningManager: true } });

      when(jest.spyOn(utilsConversionModule, 'toIdentityWithClaimsArray'))
        .calledWith(claimsQueryResponse.nodes as unknown as Claim[], context, 'issuerId')
        .mockReturnValue(fakeClaims);

      dsMockUtils.createApolloQueryMock(
        claimsQuery({
          dids: [did],
          scope,
          trustedClaimIssuers: [issuerDid],
          includeExpired: false,
        }),
        {
          claims: claimsQueryResponse,
        }
      );

      let result = await claims.getTargetingClaims({
        target: did,
        trustedClaimIssuers: [issuerDid],
        scope,
        includeExpired: false,
        size: new BigNumber(1),
        start: new BigNumber(0),
      });

      expect(result.data).toEqual(fakeClaims);
      expect(result.count).toEqual(new BigNumber(1));
      expect(result.next).toEqual(null);

      dsMockUtils.createApolloMultipleQueriesMock([
        {
          query: claimsGroupingQuery(
            {
              dids: ['someDid'],
              scope: undefined,
              includeExpired: true,
            },
            ClaimsOrderBy.IssuerIdAsc,
            ClaimsGroupBy.IssuerId
          ),
          returnData: {
            claims: {
              groupedAggregates: [
                {
                  keys: [issuerDid],
                },
              ],
            },
          },
        },
        {
          query: claimsQuery({
            dids: ['someDid'],
            scope: undefined,
            trustedClaimIssuers: [issuerDid],
            includeExpired: true,
          }),
          returnData: {
            claims: claimsQueryResponse,
          },
        },
      ]);

      result = await claims.getTargetingClaims();

      expect(result.data).toEqual(fakeClaims);
      expect(result.count).toEqual(new BigNumber(1));
      expect(result.next).toBeNull();
    });

    it('should return a list of claims issued with an Identity as target from chain', async () => {
      const target = 'someTarget';
      const issuer = 'someIssuer';
      const otherIssuer = 'otherIssuer';

      const scope = {
        type: ScopeType.Identity,
        value: 'someIdentityScope',
      };

      const issuer1 = entityMockUtils.getIdentityInstance({ did: issuer });
      issuer1.isEqual = jest.fn();
      when(issuer1.isEqual).calledWith(issuer1).mockReturnValue(true);
      const issuer2 = entityMockUtils.getIdentityInstance({ did: issuer });
      issuer2.isEqual = jest.fn();
      when(issuer2.isEqual).calledWith(issuer1).mockReturnValue(true);
      const issuer3 = entityMockUtils.getIdentityInstance({ did: otherIssuer });
      issuer3.isEqual = jest.fn();
      when(issuer3.isEqual).calledWith(issuer3).mockReturnValue(true);

      const identityClaims: ClaimData[] = [
        {
          target: entityMockUtils.getIdentityInstance({ did: target }),
          issuer: issuer1,
          issuedAt: new Date(),
          lastUpdatedAt: new Date(),
          expiry: null,
          claim: {
            type: ClaimType.Accredited,
            scope,
          },
        },
        {
          target: entityMockUtils.getIdentityInstance({ did: target }),
          issuer: issuer2,
          issuedAt: new Date(),
          lastUpdatedAt: new Date(),
          expiry: null,
          claim: {
            type: ClaimType.Affiliate,
            scope,
          },
        },
        {
          target: entityMockUtils.getIdentityInstance({ did: target }),
          issuer: issuer3,
          issuedAt: new Date(),
          lastUpdatedAt: new Date(),
          expiry: null,
          claim: {
            type: ClaimType.Accredited,
            scope,
          },
        },
      ];

      dsMockUtils.configureMocks({
        contextOptions: {
          middlewareAvailable: false,
          getIdentityClaimsFromChain: identityClaims,
        },
      });

      let result = await claims.getTargetingClaims({
        target,
      });

      expect(result.data.length).toEqual(2);
      expect(result.data[0].identity.did).toEqual(issuer);
      expect(result.data[0].claims.length).toEqual(2);
      expect(result.data[0].claims[0].claim).toEqual(identityClaims[0].claim);
      expect(result.data[0].claims[1].claim).toEqual(identityClaims[1].claim);
      expect(result.data[1].identity.did).toEqual(otherIssuer);
      expect(result.data[1].claims.length).toEqual(1);
      expect(result.data[1].claims[0].claim).toEqual(identityClaims[2].claim);

      result = await claims.getTargetingClaims({
        target,
        trustedClaimIssuers: ['trusted'],
      });

      expect(result.data.length).toEqual(2);
    });
  });

  describe('method: registerCustomClaimType', () => {
    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const args = {
        name: 'someClaimTypeName',
      };

      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<BigNumber>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args, transformer: undefined }, context, {})
        .mockResolvedValue(expectedTransaction);

      const tx = await claims.registerCustomClaimType(args);

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: getCustomClaimTypeByName', () => {
    const name = 'custom-claim-type';
    const id = new BigNumber(12);
    const rawId = dsMockUtils.createMockU32(id);

    beforeEach(() => {
      jest.spyOn(utilsConversionModule, 'u32ToBigNumber').mockClear().mockReturnValue(id);
      jest.spyOn(utilsConversionModule, 'bytesToString').mockClear().mockReturnValue(name);
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should fetch custom claim type by name', async () => {
      dsMockUtils.createQueryMock('identity', 'customClaimsInverse', {
        returnValue: dsMockUtils.createMockOption(dsMockUtils.createMockOption(rawId)),
      });

      const result = await claims.getCustomClaimTypeByName(name);
      expect(result).toEqual({ id, name });
    });

    it('should return null if custom claim type name does not exist', async () => {
      dsMockUtils.createQueryMock('identity', 'customClaimsInverse', {
        returnValue: dsMockUtils.createMockOption(
          dsMockUtils.createMockOption(dsMockUtils.createMockOption())
        ),
      });

      const result = await claims.getCustomClaimTypeByName(name);
      expect(result).toBeNull();
    });
  });

  describe('method: getCustomClaimTypeById', () => {
    const name = 'custom-claim-type';
    const id = new BigNumber(12);
    const rawId = dsMockUtils.createMockU32(id);

    beforeEach(() => {
      jest.spyOn(utilsConversionModule, 'bigNumberToU32').mockClear().mockReturnValue(rawId);
      jest.spyOn(utilsConversionModule, 'bytesToString').mockClear().mockReturnValue(name);
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should fetch custom claim type by id', async () => {
      dsMockUtils.createQueryMock('identity', 'customClaims', {
        returnValue: dsMockUtils.createMockOption(
          dsMockUtils.createMockOption(dsMockUtils.createMockBytes(name))
        ),
      });

      const result = await claims.getCustomClaimTypeById(id);
      expect(result).toEqual({ id, name });
    });

    it('should return null if custom claim type id does not exist', async () => {
      dsMockUtils.createQueryMock('identity', 'customClaims', {
        returnValue: dsMockUtils.createMockOption(
          dsMockUtils.createMockOption(dsMockUtils.createMockOption())
        ),
      });

      const result = await claims.getCustomClaimTypeById(id);
      expect(result).toBeNull();
    });
  });
});
