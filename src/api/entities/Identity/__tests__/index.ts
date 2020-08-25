import { AccountId, Balance } from '@polkadot/types/interfaces';
import BigNumber from 'bignumber.js';
import { DidRecord, IdentityId, Ticker } from 'polymesh-types/types';
import sinon from 'sinon';

import { Entity } from '~/base';
import { Context } from '~/context';
import {
  issuerDidsWithClaimsByTarget,
  scopesByIdentity,
  tokensByTrustedClaimIssuer,
  tokensHeldByDid,
} from '~/middleware/queries';
import { ClaimTypeEnum, IdentityWithClaimsResult } from '~/middleware/types';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';
import {
  ClaimData,
  ClaimType,
  IdentityWithClaims,
  Order,
  ResultSet,
  Role,
  RoleType,
  TickerOwnerRole,
  TokenOwnerRole,
} from '~/types';
import * as utilsModule from '~/utils';

import { Identity } from '../';

jest.mock(
  '~/api/entities/TickerReservation',
  require('~/testUtils/mocks/entities').mockTickerReservationModule(
    '~/api/entities/TickerReservation'
  )
);
jest.mock(
  '~/api/entities/SecurityToken',
  require('~/testUtils/mocks/entities').mockSecurityTokenModule('~/api/entities/SecurityToken')
);

describe('Identity class', () => {
  let context: Context;
  let stringToIdentityIdStub: sinon.SinonStub<[string, Context], IdentityId>;
  let identityIdToStringStub: sinon.SinonStub<[IdentityId], string>;

  beforeAll(() => {
    dsMockUtils.initMocks();
    stringToIdentityIdStub = sinon.stub(utilsModule, 'stringToIdentityId');
    identityIdToStringStub = sinon.stub(utilsModule, 'identityIdToString');
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
    expect(Identity.prototype instanceof Entity).toBe(true);
  });

  describe('constructor', () => {
    test('should assign did to instance', () => {
      const did = 'abc';
      const identity = new Identity({ did }, context);

      expect(identity.did).toBe(did);
    });
  });

  describe('method: isUniqueIdentifiers', () => {
    test('should return true if the object conforms to the interface', () => {
      expect(Identity.isUniqueIdentifiers({ did: 'someDid' })).toBe(true);
      expect(Identity.isUniqueIdentifiers({})).toBe(false);
      expect(Identity.isUniqueIdentifiers({ did: 3 })).toBe(false);
    });
  });

  describe('method: hasRole and hasRoles', () => {
    beforeAll(() => {
      entityMockUtils.initMocks();
    });

    afterEach(() => {
      entityMockUtils.reset();
    });

    afterAll(() => {
      entityMockUtils.cleanup();
    });

    test('hasRole should check whether the identity has the Ticker Owner role', async () => {
      const identity = new Identity({ did: 'someDid' }, context);
      const role: TickerOwnerRole = { type: RoleType.TickerOwner, ticker: 'someTicker' };

      let hasRole = await identity.hasRole(role);

      expect(hasRole).toBe(true);

      identity.did = 'otherDid';

      hasRole = await identity.hasRole(role);

      expect(hasRole).toBe(false);
    });

    test('hasRole should check whether the identity has the Token Owner role', async () => {
      const identity = new Identity({ did: 'someDid' }, context);
      const role: TokenOwnerRole = { type: RoleType.TokenOwner, ticker: 'someTicker' };

      let hasRole = await identity.hasRole(role);

      expect(hasRole).toBe(true);

      identity.did = 'otherDid';

      hasRole = await identity.hasRole(role);

      expect(hasRole).toBe(false);
    });

    test('hasRole should check whether the identity has the CDD Provider role', async () => {
      const did = 'someDid';
      const identity = new Identity({ did }, context);
      const role: Role = { type: RoleType.CddProvider };
      const rawDid = dsMockUtils.createMockIdentityId(did);

      dsMockUtils.createQueryStub('cddServiceProviders', 'activeMembers').resolves([rawDid]);

      identityIdToStringStub.withArgs(rawDid).returns(did);

      let hasRole = await identity.hasRole(role);

      expect(hasRole).toBe(true);

      identity.did = 'otherDid';

      hasRole = await identity.hasRole(role);

      expect(hasRole).toBe(false);
    });

    test('hasRole should throw an error if the role is not recognized', () => {
      const identity = new Identity({ did: 'someDid' }, context);
      const type = 'Fake' as RoleType;
      const role = { type, ticker: 'someTicker' } as TokenOwnerRole;

      const hasRole = identity.hasRole(role);

      return expect(hasRole).rejects.toThrow(`Unrecognized role "${JSON.stringify(role)}"`);
    });

    test('hasRoles should return true if the identity possesses all roles', async () => {
      const identity = new Identity({ did: 'someDid' }, context);
      const roles: TickerOwnerRole[] = [
        { type: RoleType.TickerOwner, ticker: 'someTicker' },
        { type: RoleType.TickerOwner, ticker: 'otherTicker' },
      ];

      const hasRole = await identity.hasRoles(roles);

      expect(hasRole).toBe(true);
    });

    test("hasRoles should return false if at least one role isn't possessed by the identity", async () => {
      const identity = new Identity({ did: 'someDid' }, context);
      const roles: TickerOwnerRole[] = [
        { type: RoleType.TickerOwner, ticker: 'someTicker' },
        { type: RoleType.TickerOwner, ticker: 'otherTicker' },
      ];

      const stub = entityMockUtils.getTickerReservationDetailsStub();

      stub.onSecondCall().returns({
        owner: null,
      });

      const hasRole = await identity.hasRoles(roles);

      expect(hasRole).toBe(false);
    });
  });

  describe('method: getTokenBalance', () => {
    let ticker: string;
    let did: string;
    let rawTicker: Ticker;
    let rawIdentityId: IdentityId;
    let fakeValue: BigNumber;
    let fakeBalance: Balance;
    let mockContext: Context;
    let balanceOfStub: sinon.SinonStub;
    let tokensStub: sinon.SinonStub;

    let identity: Identity;

    beforeAll(() => {
      ticker = 'TEST';
      did = 'someDid';
      rawTicker = dsMockUtils.createMockTicker(ticker);
      rawIdentityId = dsMockUtils.createMockIdentityId(did);
      fakeValue = new BigNumber(100);
      fakeBalance = dsMockUtils.createMockBalance(fakeValue.toNumber());
      mockContext = dsMockUtils.getContextInstance();
      balanceOfStub = dsMockUtils.createQueryStub('asset', 'balanceOf');
      tokensStub = dsMockUtils.createQueryStub('asset', 'tokens');

      stringToIdentityIdStub.withArgs(did, mockContext).returns(rawIdentityId);

      identity = new Identity({ did }, mockContext);

      sinon
        .stub(utilsModule, 'stringToTicker')
        .withArgs(ticker, mockContext)
        .returns(rawTicker);

      sinon
        .stub(utilsModule, 'balanceToBigNumber')
        .withArgs(fakeBalance)
        .returns(fakeValue);
    });

    beforeEach(() => {
      /* eslint-disable @typescript-eslint/camelcase */
      tokensStub.withArgs(rawTicker).resolves(
        dsMockUtils.createMockSecurityToken({
          owner_did: dsMockUtils.createMockIdentityId('tokenOwner'),
          total_supply: dsMockUtils.createMockBalance(3000),
          divisible: dsMockUtils.createMockBool(true),
          asset_type: dsMockUtils.createMockAssetType('EquityCommon'),
          treasury_did: dsMockUtils.createMockOption(),
          name: dsMockUtils.createMockAssetName('someToken'),
        })
      );
      /* eslint-enable @typescript-eslint/camelcase */
    });

    test('should return the balance of a given token', async () => {
      balanceOfStub.withArgs(rawTicker, rawIdentityId).resolves(fakeBalance);

      const result = await identity.getTokenBalance({ ticker });

      expect(result).toEqual(fakeValue);
    });

    test('should allow subscription', async () => {
      const unsubCallback = 'unsubCallback';
      const callback = sinon.stub();

      balanceOfStub.withArgs(rawTicker, rawIdentityId).callsFake(async (_a, _b, cbFunc) => {
        cbFunc(fakeBalance);
        return unsubCallback;
      });

      const result = await identity.getTokenBalance({ ticker }, callback);

      expect(result).toEqual(unsubCallback);
      sinon.assert.calledWithExactly(callback, fakeValue);
    });

    test("should throw an error if the token doesn't exist", async () => {
      tokensStub.withArgs(rawTicker).resolves(dsMockUtils.createMockSecurityToken());

      let error;

      try {
        await identity.getTokenBalance({ ticker });
      } catch (err) {
        error = err;
      }

      expect(error.message).toBe(`There is no Security Token with ticker "${ticker}"`);
    });
  });

  describe('method: hasValidCdd', () => {
    test('should return whether the Identity has valid CDD', async () => {
      const did = 'someDid';
      const statusResponse = true;
      const mockContext = dsMockUtils.getContextInstance();
      const rawIdentityId = dsMockUtils.createMockIdentityId(did);
      const fakeHasValidCdd = dsMockUtils.createMockCddStatus({
        Ok: rawIdentityId,
      });

      stringToIdentityIdStub.withArgs(did, mockContext).returns(rawIdentityId);

      dsMockUtils
        .createRpcStub('identity', 'isIdentityHasValidCdd')
        .withArgs(rawIdentityId)
        .resolves(fakeHasValidCdd);

      sinon
        .stub(utilsModule, 'cddStatusToBoolean')
        .withArgs(fakeHasValidCdd)
        .returns(statusResponse);

      const identity = new Identity({ did }, context);
      const result = await identity.hasValidCdd();

      expect(result).toEqual(statusResponse);
    });
  });

  describe('method: isGcMember', () => {
    test('should return whether the Identity is GC member', async () => {
      const did = 'someDid';
      const rawDid = dsMockUtils.createMockIdentityId(did);
      const mockContext = dsMockUtils.getContextInstance();
      const identity = new Identity({ did }, mockContext);

      identityIdToStringStub.withArgs(rawDid).returns(did);

      dsMockUtils
        .createQueryStub('committeeMembership', 'activeMembers')
        .resolves([rawDid, dsMockUtils.createMockIdentityId('otherDid')]);

      const result = await identity.isGcMember();

      expect(result).toBeTruthy();
    });
  });

  describe('method: getCddClaims', () => {
    test('should return a list of cdd claims', async () => {
      const did = 'someDid';
      const identity = new Identity({ did }, context);

      const issuedClaims: ResultSet<ClaimData> = {
        data: [
          {
            target: new Identity({ did }, context),
            issuer: new Identity({ did: 'otherDid' }, context),
            issuedAt: new Date(),
            expiry: null,
            claim: { type: ClaimType.CustomerDueDiligence },
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

      const result = await identity.getCddClaims();
      expect(result).toEqual(issuedClaims);
    });
  });

  describe('method: getMasterKey', () => {
    const did = 'someDid';
    const accountId = 'someMasterKey';

    let accountIdToStringStub: sinon.SinonStub<[AccountId], string>;
    let didRecordsStub: sinon.SinonStub;
    let rawDidRecord: DidRecord;

    beforeAll(() => {
      accountIdToStringStub = sinon.stub(utilsModule, 'accountIdToString');
      accountIdToStringStub.returns(accountId);
    });

    beforeEach(() => {
      didRecordsStub = dsMockUtils.createQueryStub('identity', 'didRecords');
      /* eslint-disable @typescript-eslint/camelcase */
      rawDidRecord = dsMockUtils.createMockDidRecord({
        roles: [],
        master_key: dsMockUtils.createMockAccountId(accountId),
        signing_keys: [],
      });
      /* eslint-enabled @typescript-eslint/camelcase */
    });

    test('should return a MasterKey', async () => {
      const mockContext = dsMockUtils.getContextInstance();
      const identity = new Identity({ did }, mockContext);

      didRecordsStub.returns(rawDidRecord);

      const result = await identity.getMasterKey();
      expect(result).toEqual(accountId);
    });

    test('should allow subscription', async () => {
      const mockContext = dsMockUtils.getContextInstance();
      const identity = new Identity({ did }, mockContext);

      const unsubCallback = 'unsubCallBack';

      didRecordsStub.callsFake(async (_, cbFunc) => {
        cbFunc(rawDidRecord);
        return unsubCallback;
      });

      const callback = sinon.stub();
      const result = await identity.getMasterKey(callback);

      expect(result).toBe(unsubCallback);
      sinon.assert.calledWithExactly(callback, accountId);
    });
  });

  describe('method: getTrustingTokens', () => {
    const did = 'someDid';
    const tickers = ['TOKEN1\0\0', 'TOKEN2\0\0'];

    test('should return a list of security tokens', async () => {
      const identity = new Identity({ did }, context);

      dsMockUtils.createApolloQueryStub(
        tokensByTrustedClaimIssuer({ claimIssuerDid: did, order: Order.Asc }),
        {
          tokensByTrustedClaimIssuer: tickers,
        }
      );

      const result = await identity.getTrustingTokens();

      expect(result[0].ticker).toBe('TOKEN1');
      expect(result[1].ticker).toBe('TOKEN2');
    });
  });

  describe('method: getHeldTokens', () => {
    const did = 'someDid';
    const tickers = ['TOKEN1', 'TOKEN2'];

    test('should return a list of security tokens', async () => {
      const identity = new Identity({ did }, context);

      dsMockUtils.createApolloQueryStub(
        tokensHeldByDid({ did, count: undefined, skip: undefined, order: Order.Asc }),
        {
          tokensHeldByDid: { items: tickers, totalCount: 2 },
        }
      );

      const result = await identity.getHeldTokens();

      expect(result.data[0].ticker).toBe(tickers[0]);
      expect(result.data[1].ticker).toBe(tickers[1]);
    });
  });

  describe('method: getClaimScopes', () => {
    const did = 'someDid';
    const scopes = [
      {
        scope: 'someScope',
        ticker: 'TOKEN\0\0',
      },
      {
        scope: null,
      },
    ];

    test('should return a list of scopes and tickers', async () => {
      const identity = new Identity({ did }, context);

      dsMockUtils.createApolloQueryStub(scopesByIdentity({ did }), {
        scopesByIdentity: scopes,
      });

      const result = await identity.getClaimScopes();

      expect(result[0].ticker).toBe('TOKEN');
      expect(result[0].scope).toBe('someScope');
      expect(result[1].ticker).toBeUndefined();
      expect(result[1].scope).toBeNull();
    });
  });

  describe('method: getClaims', () => {
    test('should return a list of claims issued with this identity as the target', async () => {
      const did = 'someDid';
      const identity = new Identity({ did }, context);
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
          count: 1,
          skip: undefined,
        }),
        {
          issuerDidsWithClaimsByTarget: issuerDidsWithClaimsByTargetQueryResponse,
        }
      );

      let result = await identity.getClaims({
        trustedClaimIssuers: [did],
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
          count: undefined,
          skip: undefined,
        }),
        {
          issuerDidsWithClaimsByTarget: issuerDidsWithClaimsByTargetQueryResponse,
        }
      );

      result = await identity.getClaims();

      expect(result.data).toEqual(fakeClaims);
      expect(result.count).toEqual(25);
      expect(result.next).toBeNull();
    });
  });
});
