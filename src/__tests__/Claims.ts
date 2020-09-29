import sinon from 'sinon';

import { Identity } from '~/api/entities';
import { modifyClaims } from '~/api/procedures';
import { Context, TransactionQueue } from '~/base';
import { Claims } from '~/Claims';
import {
  didsWithClaims,
  issuerDidsWithClaimsByTarget,
  scopesByIdentity,
} from '~/middleware/queries';
import { ClaimTypeEnum, IdentityWithClaimsResult } from '~/middleware/types';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import {
  ClaimData,
  ClaimTarget,
  ClaimType,
  IdentityWithClaims,
  ResultSet,
  ScopeType,
} from '~/types';
import { ClaimOperation } from '~/types/internal';
import * as utilsModule from '~/utils';

describe('Claims Class', () => {
  let context: Mocked<Context>;
  let claims: Claims;

  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
    claims = new Claims(context);
  });

  afterEach(() => {
    dsMockUtils.reset();
    entityMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
    entityMockUtils.cleanup();
  });

  describe('method: getIssuedClaims', () => {
    test('should return a list of issued claims', async () => {
      const target = 'someDid';
      const issuedClaims: ResultSet<ClaimData> = {
        data: [
          {
            target: new Identity({ did: target }, context),
            issuer: new Identity({ did: 'otherDid' }, context),
            issuedAt: new Date(),
            expiry: null,
            claim: { type: ClaimType.NoData },
          },
        ],
        next: 1,
        count: 1,
      };

      dsMockUtils.configureMocks({
        contextOptions: {
          issuedClaims,
        },
      });

      let result = await claims.getIssuedClaims();
      expect(result).toEqual(issuedClaims);

      result = await claims.getIssuedClaims({ target });
      expect(result).toEqual(issuedClaims);
    });
  });

  describe('method: getIdentitiesWithClaims', () => {
    test('should return a list of Identities with claims associated to them', async () => {
      const targetDid = 'someTargetDid';
      const issuerDid = 'someIssuerDid';
      const date = 1589816265000;
      const customerDueDiligenceType = ClaimTypeEnum.CustomerDueDiligence;
      const claim = {
        target: new Identity({ did: targetDid }, context),
        issuer: new Identity({ did: issuerDid }, context),
        issuedAt: new Date(date),
      };

      const fakeClaims = [
        {
          identity: new Identity({ did: targetDid }, context),
          claims: [
            {
              ...claim,
              expiry: new Date(date),
              claim: {
                type: customerDueDiligenceType,
              },
            },
            {
              ...claim,
              expiry: null,
              claim: {
                type: customerDueDiligenceType,
              },
            },
          ],
        },
      ];
      /* eslint-disable @typescript-eslint/camelcase */
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
              },
              {
                ...commonClaimData,
                expiry: null,
                type: customerDueDiligenceType,
              },
            ],
          },
        ],
      };
      /* eslint-enabled @typescript-eslint/camelcase */

      dsMockUtils.configureMocks({ contextOptions: { withSeed: true } });

      dsMockUtils.createApolloQueryStub(
        didsWithClaims({
          dids: [targetDid],
          scope: undefined,
          trustedClaimIssuers: [targetDid],
          claimTypes: [ClaimTypeEnum.Accredited],
          includeExpired: false,
          count: 1,
          skip: undefined,
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
        size: 1,
      });

      expect(result.data).toEqual(fakeClaims);
      expect(result.count).toEqual(25);
      expect(result.next).toEqual(1);

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

      expect(result.data).toEqual(fakeClaims);
      expect(result.count).toEqual(25);
      expect(result.next).toEqual(null);
    });
  });

  describe('method: addClaims', () => {
    afterAll(() => {
      sinon.restore();
    });

    test('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
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

      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<void>;

      sinon
        .stub(modifyClaims, 'prepare')
        .withArgs({ ...args, operation: ClaimOperation.Add }, context)
        .resolves(expectedQueue);

      const queue = await claims.addClaims(args);

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: editClaims', () => {
    afterAll(() => {
      sinon.restore();
    });

    test('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
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

      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<void>;

      sinon
        .stub(modifyClaims, 'prepare')
        .withArgs({ ...args, operation: ClaimOperation.Edit }, context)
        .resolves(expectedQueue);

      const queue = await claims.editClaims(args);

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: revokeClaims', () => {
    afterAll(() => {
      sinon.restore();
    });

    test('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
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

      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<void>;

      sinon
        .stub(modifyClaims, 'prepare')
        .withArgs({ ...args, operation: ClaimOperation.Revoke }, context)
        .resolves(expectedQueue);

      const queue = await claims.revokeClaims(args);

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: getCddClaims', () => {
    test('should return a list of cdd claims', async () => {
      const target = 'someTarget';

      const issuedClaims: ResultSet<ClaimData> = {
        data: [
          {
            target: new Identity({ did: target }, context),
            issuer: new Identity({ did: 'otherDid' }, context),
            issuedAt: new Date(),
            expiry: null,
            claim: { type: ClaimType.CustomerDueDiligence, id: 'someCddId' },
          },
        ],
        next: 1,
        count: 1,
      };

      dsMockUtils.configureMocks({
        contextOptions: {
          issuedClaims,
        },
      });

      let result = await claims.getCddClaims({ target });
      expect(result).toEqual(issuedClaims);

      result = await claims.getCddClaims();
      expect(result).toEqual(issuedClaims);
    });
  });

  describe('method: getClaimScopes', () => {
    test('should return a list of scopes and tickers', async () => {
      const target = 'someTarget';
      const scopes = [
        {
          scope: { type: ScopeType.Identity, value: 'someScope' },
          ticker: 'TOKEN\0\0',
        },
        {
          scope: null,
        },
      ];

      dsMockUtils.configureMocks({
        contextOptions: {
          did: target,
        },
      });

      dsMockUtils.createApolloQueryStub(scopesByIdentity({ did: target }), {
        scopesByIdentity: scopes,
      });

      sinon.stub();

      let result = await claims.getClaimScopes({ target });

      expect(result[0].ticker).toBe('TOKEN');
      expect(result[0].scope).toEqual({ type: ScopeType.Identity, value: 'someScope' });
      expect(result[1].ticker).toBeUndefined();
      expect(result[1].scope).toBeNull();

      result = await claims.getClaimScopes();

      expect(result[0].ticker).toBe('TOKEN');
      expect(result[0].scope).toEqual({ type: ScopeType.Identity, value: 'someScope' });
      expect(result[1].ticker).toBeUndefined();
      expect(result[1].scope).toBeNull();
    });
  });

  describe('method: getTargetingClaims', () => {
    test('should return a list of claims issued with an Identity as target', async () => {
      const did = 'someDid';
      const issuerDid = 'someIssuerDid';
      const date = 1589816265000;
      const claim = {
        target: new Identity({ did }, context),
        issuer: new Identity({ did: issuerDid }, context),
        issuedAt: new Date(date),
      };
      const fakeClaims: IdentityWithClaims[] = [
        {
          identity: new Identity({ did }, context),
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
      /* eslint-disable @typescript-eslint/camelcase */
      const commonClaimData = {
        targetDID: did,
        issuer: issuerDid,
        issuance_date: date,
        last_update_date: date,
      };
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
      /* eslint-enabled @typescript-eslint/camelcase */

      dsMockUtils.configureMocks({ contextOptions: { withSeed: true } });

      sinon
        .stub(utilsModule, 'toIdentityWithClaimsArray')
        .withArgs(issuerDidsWithClaimsByTargetQueryResponse.items, context)
        .returns(fakeClaims);

      dsMockUtils.createApolloQueryStub(
        issuerDidsWithClaimsByTarget({
          target: did,
          scope: undefined,
          trustedClaimIssuers: [did],
          includeExpired: false,
          count: 1,
          skip: undefined,
        }),
        {
          issuerDidsWithClaimsByTarget: issuerDidsWithClaimsByTargetQueryResponse,
        }
      );

      let result = await claims.getTargetingClaims({
        target: did,
        trustedClaimIssuers: [did],
        includeExpired: false,
        size: 1,
      });

      expect(result.data).toEqual(fakeClaims);
      expect(result.count).toEqual(25);
      expect(result.next).toEqual(1);

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
      expect(result.count).toEqual(25);
      expect(result.next).toBeNull();
    });
  });
});
