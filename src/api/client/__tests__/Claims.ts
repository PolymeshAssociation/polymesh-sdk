import BigNumber from 'bignumber.js';
import sinon from 'sinon';

import { Claims } from '~/api/client/Claims';
import { Context, TransactionQueue } from '~/internal';
import { didsWithClaims, issuerDidsWithClaimsByTarget } from '~/middleware/queries';
import { ClaimScopeTypeEnum, ClaimTypeEnum, IdentityWithClaimsResult } from '~/middleware/types';
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
import { padString } from '~/utils/internal';

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
            expiry: null,
            claim: { type: ClaimType.NoData },
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
      /* eslint-disable @typescript-eslint/naming-convention */
      const commonClaimData = {
        targetDID: targetDid,
        issuer: issuerDid,
        issuance_date: date,
        last_update_date: date,
      };
      const didsWithClaimsQueryResponse: IdentityWithClaimsResult = {
        totalCount: 25,
        items: [
          {
            did: targetDid,
            claims: [
              {
                ...commonClaimData,
                expiry: date,
                type: customerDueDiligenceType,
                cdd_id: cddId,
              },
              {
                ...commonClaimData,
                expiry: null,
                type: customerDueDiligenceType,
                cdd_id: cddId,
              },
            ],
          },
        ],
      };
      /* eslint-enable @typescript-eslint/naming-convention */

      dsMockUtils.configureMocks({ contextOptions: { withSigningManager: true } });

      dsMockUtils.createApolloQueryStub(
        didsWithClaims({
          dids: [targetDid],
          scope: undefined,
          trustedClaimIssuers: [targetDid],
          claimTypes: [ClaimTypeEnum.Accredited],
          includeExpired: false,
          count: 1,
          skip: 0,
        }),
        {
          didsWithClaims: didsWithClaimsQueryResponse,
        }
      );

      let result = await claims.getIdentitiesWithClaims({
        targets: [targetDid],
        trustedClaimIssuers: [targetDid],
        claimTypes: [ClaimType.Accredited],
        includeExpired: false,
        size: new BigNumber(1),
        start: new BigNumber(0),
      });

      expect(JSON.stringify(result.data)).toBe(JSON.stringify(fakeClaims));
      expect(result.count).toEqual(new BigNumber(25));
      expect(result.next).toEqual(new BigNumber(1));

      dsMockUtils.createApolloQueryStub(
        didsWithClaims({
          dids: undefined,
          scope: undefined,
          trustedClaimIssuers: undefined,
          claimTypes: undefined,
          includeExpired: true,
          count: undefined,
          skip: undefined,
        }),
        {
          didsWithClaims: didsWithClaimsQueryResponse,
        }
      );

      result = await claims.getIdentitiesWithClaims();

      expect(JSON.stringify(result.data)).toBe(JSON.stringify(fakeClaims));
      expect(result.count).toEqual(new BigNumber(25));
      expect(result.next).toEqual(null);
    });

    it('should return a list of Identities with claims associated to them filtered by scope', async () => {
      const targetDid = 'someTargetDid';
      const issuerDid = 'someIssuerDid';
      const scope: Scope = { type: ScopeType.Ticker, value: 'someValue' };
      const date = 1589816265000;
      const accreditedType = ClaimTypeEnum.Accredited;
      const claim = {
        target: entityMockUtils.getIdentityInstance({ did: targetDid }),
        issuer: entityMockUtils.getIdentityInstance({ did: issuerDid }),
        issuedAt: new Date(date),
      };

      const fakeClaims = [
        {
          identity: entityMockUtils.getIdentityInstance({ did: targetDid }),
          claims: [
            {
              ...claim,
              expiry: new Date(date),
              claim: {
                type: accreditedType,
                scope,
              },
            },
            {
              ...claim,
              expiry: null,
              claim: {
                type: accreditedType,
                scope,
              },
            },
          ],
        },
      ];
      /* eslint-disable @typescript-eslint/naming-convention */
      const commonClaimData = {
        targetDID: targetDid,
        issuer: issuerDid,
        issuance_date: date,
        last_update_date: date,
      };
      /* eslint-enable @typescript-eslint/naming-convention */
      const didsWithClaimsQueryResponse: IdentityWithClaimsResult = {
        totalCount: 25,
        items: [
          {
            did: targetDid,
            claims: [
              {
                ...commonClaimData,
                expiry: date,
                type: accreditedType,
                scope: {
                  type: ClaimScopeTypeEnum[scope.type],
                  value: padString(scope.value, 12),
                },
              },
              {
                ...commonClaimData,
                expiry: null,
                type: accreditedType,
                scope: {
                  type: ClaimScopeTypeEnum[scope.type],
                  value: padString(scope.value, 12),
                },
              },
            ],
          },
        ],
      };

      dsMockUtils.configureMocks({ contextOptions: { withSigningManager: true } });

      dsMockUtils.createApolloQueryStub(
        didsWithClaims({
          dids: [targetDid],
          scope: { type: ClaimScopeTypeEnum[scope.type], value: padString(scope.value, 12) },
          trustedClaimIssuers: [targetDid],
          claimTypes: [ClaimTypeEnum.Accredited],
          includeExpired: false,
          count: 1,
          skip: 0,
        }),
        {
          didsWithClaims: didsWithClaimsQueryResponse,
        }
      );

      const result = await claims.getIdentitiesWithClaims({
        targets: [targetDid],
        trustedClaimIssuers: [targetDid],
        scope,
        claimTypes: [ClaimType.Accredited],
        includeExpired: false,
        size: new BigNumber(1),
        start: new BigNumber(0),
      });

      expect(JSON.stringify(result.data)).toBe(JSON.stringify(fakeClaims));
      expect(result.count).toEqual(new BigNumber(25));
      expect(result.next).toEqual(new BigNumber(1));
    });
  });

  describe('method: addClaims', () => {
    afterAll(() => {
      sinon.restore();
    });

    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
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

      const expectedQueue = 'someQueue' as unknown as TransactionQueue<void>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs(
          { args: { ...args, operation: ClaimOperation.Add }, transformer: undefined },
          context
        )
        .resolves(expectedQueue);

      const queue = await claims.addClaims(args);

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: addInvestorUniquenessClaim', () => {
    afterAll(() => {
      sinon.restore();
    });

    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
      const ticker = 'SOME_ASSET';
      const cddId = 'someId';
      const proof = 'someProof';
      const scopeId = 'someScopeId';
      const expiry = new Date();

      const args = {
        scope: { type: ScopeType.Ticker, value: ticker },
        cddId,
        proof,
        scopeId,
        expiry,
      };

      const expectedQueue = 'someQueue' as unknown as TransactionQueue<void>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs({ args, transformer: undefined }, context)
        .resolves(expectedQueue);

      const queue = await claims.addInvestorUniquenessClaim(args);

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: editClaims', () => {
    afterAll(() => {
      sinon.restore();
    });

    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
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

      const expectedQueue = 'someQueue' as unknown as TransactionQueue<void>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs(
          { args: { ...args, operation: ClaimOperation.Edit }, transformer: undefined },
          context
        )
        .resolves(expectedQueue);

      const queue = await claims.editClaims(args);

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: revokeClaims', () => {
    afterAll(() => {
      sinon.restore();
    });

    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
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

      const expectedQueue = 'someQueue' as unknown as TransactionQueue<void>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs(
          { args: { ...args, operation: ClaimOperation.Revoke }, transformer: undefined },
          context
        )
        .resolves(expectedQueue);

      const queue = await claims.revokeClaims(args);

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: getCddClaims', () => {
    it('should return a list of cdd claims', async () => {
      const target = 'someTarget';

      const identityClaims: ClaimData[] = [
        {
          target: entityMockUtils.getIdentityInstance({ did: target }),
          issuer: entityMockUtils.getIdentityInstance({ did: 'otherDid' }),
          issuedAt: new Date(),
          expiry: null,
          claim: {
            type: ClaimType.CustomerDueDiligence,
            id: 'someId',
          },
        },
      ];

      dsMockUtils.configureMocks({
        contextOptions: {
          getIdentityClaimsFromChain: identityClaims,
        },
      });

      let result = await claims.getCddClaims({ target });
      expect(result).toEqual(identityClaims);

      result = await claims.getCddClaims();
      expect(result).toEqual(identityClaims);
    });
  });

  describe('method: getClaimScopes', () => {
    it('should return a list of scopes and tickers', async () => {
      const target = 'someTarget';
      const ticker = 'FAKE_TICKER';
      const someDid = 'someDid';
      const fakeClaimData = [
        {
          claim: {
            type: ClaimType.InvestorUniqueness,
            scope: {
              type: ScopeType.Ticker,
              value: ticker,
            },
          },
        },
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
              type: ScopeType.Identity,
              value: someDid,
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

      expect(result[0].ticker).toBe(ticker);
      expect(result[0].scope).toEqual({ type: ScopeType.Ticker, value: ticker });
      expect(result[1].ticker).toBeUndefined();
      expect(result[1].scope).toEqual({ type: ScopeType.Identity, value: someDid });

      result = await claims.getClaimScopes();

      expect(result.length).toEqual(2);
    });
  });

  describe('method: getTargetingClaims', () => {
    afterAll(() => {
      sinon.restore();
    });

    it('should return a list of claims issued with an Identity as target', async () => {
      const did = 'someDid';
      const issuerDid = 'someIssuerDid';
      const date = 1589816265000;
      const claim = {
        target: entityMockUtils.getIdentityInstance({ did }),
        issuer: entityMockUtils.getIdentityInstance({ did: issuerDid }),
        issuedAt: new Date(date),
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
      /* eslint-disable @typescript-eslint/naming-convention */
      const commonClaimData = {
        targetDID: did,
        issuer: issuerDid,
        issuance_date: date,
        last_update_date: date,
      };
      /* eslint-enable @typescript-eslint/naming-convention */
      const issuerDidsWithClaimsByTargetQueryResponse: IdentityWithClaimsResult = {
        totalCount: 25,
        items: [
          {
            did,
            claims: [
              {
                ...commonClaimData,
                expiry: date,
                type: ClaimTypeEnum.CustomerDueDiligence,
              },
            ],
          },
        ],
      };

      dsMockUtils.configureMocks({ contextOptions: { withSigningManager: true } });

      sinon
        .stub(utilsConversionModule, 'toIdentityWithClaimsArray')
        .withArgs(issuerDidsWithClaimsByTargetQueryResponse.items, context)
        .returns(fakeClaims);

      dsMockUtils.createApolloQueryStub(
        issuerDidsWithClaimsByTarget({
          target: did,
          scope: undefined,
          trustedClaimIssuers: [did],
          includeExpired: false,
          count: 1,
          skip: 0,
        }),
        {
          issuerDidsWithClaimsByTarget: issuerDidsWithClaimsByTargetQueryResponse,
        }
      );

      let result = await claims.getTargetingClaims({
        target: did,
        trustedClaimIssuers: [did],
        includeExpired: false,
        size: new BigNumber(1),
        start: new BigNumber(0),
      });

      expect(result.data).toEqual(fakeClaims);
      expect(result.count).toEqual(new BigNumber(25));
      expect(result.next).toEqual(new BigNumber(1));

      dsMockUtils.createApolloQueryStub(
        issuerDidsWithClaimsByTarget({
          target: did,
          scope: undefined,
          trustedClaimIssuers: undefined,
          includeExpired: true,
          count: undefined,
          skip: undefined,
        }),
        {
          issuerDidsWithClaimsByTarget: issuerDidsWithClaimsByTargetQueryResponse,
        }
      );

      result = await claims.getTargetingClaims();

      expect(result.data).toEqual(fakeClaims);
      expect(result.count).toEqual(new BigNumber(25));
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
      issuer1.isEqual.onFirstCall().returns(true).onSecondCall().returns(false);
      const issuer2 = entityMockUtils.getIdentityInstance({ did: issuer });
      issuer2.isEqual.onFirstCall().returns(true).onSecondCall().returns(false);
      const issuer3 = entityMockUtils.getIdentityInstance({ did: otherIssuer });
      issuer3.isEqual.onFirstCall().returns(false).onSecondCall().returns(true);

      const identityClaims: ClaimData[] = [
        {
          target: entityMockUtils.getIdentityInstance({ did: target }),
          issuer: issuer1,
          issuedAt: new Date(),
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
          expiry: null,
          claim: {
            type: ClaimType.InvestorUniqueness,
            scope,
            cddId: 'someCddId',
            scopeId: 'someScopeId',
          },
        },
        {
          target: entityMockUtils.getIdentityInstance({ did: target }),
          issuer: issuer3,
          issuedAt: new Date(),
          expiry: null,
          claim: {
            type: ClaimType.InvestorUniqueness,
            scope,
            cddId: 'otherCddId',
            scopeId: 'someScopeId',
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

  describe('method: getInvestorUniquenessClaims', () => {
    it('should return a list of claim data', async () => {
      const target = 'someTarget';

      const scope = {
        type: ScopeType.Identity,
        value: 'someIdentityScope',
      };

      const identityClaims: ClaimData[] = [
        {
          target: entityMockUtils.getIdentityInstance({ did: target }),
          issuer: entityMockUtils.getIdentityInstance({ did: 'otherDid' }),
          issuedAt: new Date(),
          expiry: null,
          claim: {
            type: ClaimType.InvestorUniqueness,
            scope,
            cddId: 'someCddId',
            scopeId: 'someScopeId',
          },
        },
      ];

      dsMockUtils.configureMocks({
        contextOptions: {
          getIdentityClaimsFromChain: identityClaims,
        },
      });

      let result = await claims.getInvestorUniquenessClaims({ target });
      expect(result).toEqual(identityClaims);

      result = await claims.getInvestorUniquenessClaims();
      expect(result).toEqual(identityClaims);
    });
  });

  it('should return a list of claims issued with an Identity as target and a given Scope', async () => {
    const did = 'someDid';
    const issuerDid = 'someIssuerDid';
    const scope: Scope = { type: ScopeType.Ticker, value: 'someValue' };
    const date = 1589816265000;
    const claim = {
      target: entityMockUtils.getIdentityInstance({ did }),
      issuer: entityMockUtils.getIdentityInstance({ did: issuerDid }),
      issuedAt: new Date(date),
    };
    const fakeClaims: IdentityWithClaims[] = [
      {
        identity: entityMockUtils.getIdentityInstance({ did }),
        claims: [
          {
            ...claim,
            expiry: new Date(date),
            claim: {
              type: ClaimType.Accredited,
              scope,
            },
          },
        ],
      },
    ];

    /* eslint-disable @typescript-eslint/naming-convention */
    const commonClaimData = {
      targetDID: did,
      issuer: issuerDid,
      issuance_date: date,
      last_update_date: date,
    };
    /* eslint-enable @typescript-eslint/naming-convention */
    const issuerDidsWithClaimsByTargetQueryResponse: IdentityWithClaimsResult = {
      totalCount: 25,
      items: [
        {
          did,
          claims: [
            {
              ...commonClaimData,
              expiry: date,
              type: ClaimTypeEnum.Accredited,
              scope: { type: ClaimScopeTypeEnum[scope.type], value: padString(scope.value, 12) },
            },
          ],
        },
      ],
    };

    dsMockUtils.configureMocks({ contextOptions: { withSigningManager: true } });

    sinon
      .stub(utilsConversionModule, 'toIdentityWithClaimsArray')
      .withArgs(issuerDidsWithClaimsByTargetQueryResponse.items, context)
      .returns(fakeClaims);

    dsMockUtils.createApolloQueryStub(
      issuerDidsWithClaimsByTarget({
        target: did,
        scope: { type: ClaimScopeTypeEnum[scope.type], value: padString(scope.value, 12) },
        trustedClaimIssuers: [did],
        includeExpired: false,
        count: 1,
        skip: undefined,
      }),
      {
        issuerDidsWithClaimsByTarget: issuerDidsWithClaimsByTargetQueryResponse,
      }
    );

    const result = await claims.getTargetingClaims({
      target: did,
      trustedClaimIssuers: [did],
      scope,
      includeExpired: false,
      size: new BigNumber(1),
    });

    expect(result.data).toEqual(fakeClaims);
    expect(result.count).toEqual(new BigNumber(25));
    expect(result.next).toEqual(new BigNumber(1));
  });
});
