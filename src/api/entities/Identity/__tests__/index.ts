import { u64 } from '@polkadot/types';
import { AccountId, Balance } from '@polkadot/types/interfaces';
import BigNumber from 'bignumber.js';
import { DidRecord, IdentityId, ScopeId, Ticker } from 'polymesh-types/types';
import sinon from 'sinon';

import { Context, Entity, Identity } from '~/internal';
import { tokensByTrustedClaimIssuer, tokensHeldByDid } from '~/middleware/queries';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';
import {
  CorporateActionsAgentRole,
  Order,
  PortfolioCustodianRole,
  Role,
  RoleType,
  TickerOwnerRole,
  TokenOwnerRole,
  TokenPiaRole,
  VenueOwnerRole,
} from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

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
jest.mock(
  '~/api/entities/Venue',
  require('~/testUtils/mocks/entities').mockVenueModule('~/api/entities/Venue')
);
jest.mock(
  '~/api/entities/NumberedPortfolio',
  require('~/testUtils/mocks/entities').mockNumberedPortfolioModule(
    '~/api/entities/NumberedPortfolio'
  )
);
jest.mock(
  '~/api/entities/DefaultPortfolio',
  require('~/testUtils/mocks/entities').mockDefaultPortfolioModule(
    '~/api/entities/DefaultPortfolio'
  )
);

describe('Identity class', () => {
  let context: Context;
  let stringToIdentityIdStub: sinon.SinonStub<[string, Context], IdentityId>;
  let identityIdToStringStub: sinon.SinonStub<[IdentityId], string>;

  beforeAll(() => {
    dsMockUtils.initMocks();
    stringToIdentityIdStub = sinon.stub(utilsConversionModule, 'stringToIdentityId');
    identityIdToStringStub = sinon.stub(utilsConversionModule, 'identityIdToString');
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

  test('should extend Entity', () => {
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

    test('hasRole should check whether the Identity has the Ticker Owner role', async () => {
      const identity = new Identity({ did: 'someDid' }, context);
      const role: TickerOwnerRole = { type: RoleType.TickerOwner, ticker: 'someTicker' };

      let hasRole = await identity.hasRole(role);

      expect(hasRole).toBe(true);

      identity.did = 'otherDid';

      hasRole = await identity.hasRole(role);

      expect(hasRole).toBe(false);
    });

    test('hasRole should check whether the Identity has the Token Owner role', async () => {
      const identity = new Identity({ did: 'someDid' }, context);
      const role: TokenOwnerRole = { type: RoleType.TokenOwner, ticker: 'someTicker' };

      let hasRole = await identity.hasRole(role);

      expect(hasRole).toBe(true);

      identity.did = 'otherDid';

      hasRole = await identity.hasRole(role);

      expect(hasRole).toBe(false);
    });

    test('hasRole should check whether the Identity has the Token PIA role', async () => {
      const identity = new Identity({ did: 'someDid' }, context);
      const role: TokenPiaRole = { type: RoleType.TokenPia, ticker: 'someTicker' };

      let hasRole = await identity.hasRole(role);

      expect(hasRole).toBe(false);

      entityMockUtils.configureMocks({
        securityTokenOptions: {
          details: {
            primaryIssuanceAgent: identity,
          },
        },
      });

      hasRole = await identity.hasRole(role);

      expect(hasRole).toBe(true);

      entityMockUtils.reset();
      entityMockUtils.configureMocks({
        securityTokenOptions: {
          details: {
            primaryIssuanceAgent: new Identity({ did: 'anotherDid' }, context),
          },
        },
      });

      hasRole = await identity.hasRole(role);

      expect(hasRole).toBe(false);
    });

    test('hasRole should check whether the Identity has the CDD Provider role', async () => {
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

    test('hasRole should check whether the Identity has the Venue Owner role', async () => {
      const did = 'someDid';
      const identity = new Identity({ did }, context);
      const role: VenueOwnerRole = { type: RoleType.VenueOwner, venueId: new BigNumber(10) };

      entityMockUtils.configureMocks({
        venueOptions: { details: { owner: new Identity({ did }, context) } },
      });

      let hasRole = await identity.hasRole(role);

      expect(hasRole).toBe(true);

      identity.did = 'otherDid';

      hasRole = await identity.hasRole(role);

      expect(hasRole).toBe(false);
    });

    test('hasRole should check whether the Identity has the Portfolio Custodian role', async () => {
      const did = 'someDid';
      const identity = new Identity({ did }, context);
      const portfolioId = {
        did,
        number: new BigNumber(1),
      };
      let role: PortfolioCustodianRole = { type: RoleType.PortfolioCustodian, portfolioId };

      entityMockUtils.configureMocks({
        numberedPortfolioOptions: { isCustodiedBy: true },
        defaultPortfolioOptions: { isCustodiedBy: false },
      });

      let hasRole = await identity.hasRole(role);

      expect(hasRole).toBe(true);

      role = { type: RoleType.PortfolioCustodian, portfolioId: { did } };

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

    test('hasRoles should return true if the Identity possesses all roles', async () => {
      const identity = new Identity({ did: 'someDid' }, context);
      const roles: TickerOwnerRole[] = [
        { type: RoleType.TickerOwner, ticker: 'someTicker' },
        { type: RoleType.TickerOwner, ticker: 'otherTicker' },
      ];

      const hasRole = await identity.hasRoles(roles);

      expect(hasRole).toBe(true);
    });

    test("hasRoles should return false if at least one role isn't possessed by the Identity", async () => {
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

    test('hasRole should check whether the Identity has the CAA role', async () => {
      const did = 'someDid';
      const identity = new Identity({ did }, context);
      const role: CorporateActionsAgentRole = {
        type: RoleType.CorporateActionsAgent,
        ticker: 'someTicker',
      };

      entityMockUtils.configureMocks({
        securityTokenOptions: {
          corporateActionsGetAgent: entityMockUtils.getIdentityInstance({ did }),
        },
      });

      let hasRole = await identity.hasRole(role);

      expect(hasRole).toBe(true);

      entityMockUtils.reset();
      entityMockUtils.configureMocks({
        securityTokenOptions: {
          corporateActionsGetAgent: entityMockUtils.getIdentityInstance({ did: 'otherDid' }),
        },
      });

      hasRole = await identity.hasRole(role);

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
        .stub(utilsConversionModule, 'stringToTicker')
        .withArgs(ticker, mockContext)
        .returns(rawTicker);

      sinon
        .stub(utilsConversionModule, 'balanceToBigNumber')
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
          primary_issuance_agent: dsMockUtils.createMockOption(),
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
        .stub(utilsConversionModule, 'cddStatusToBoolean')
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

  describe('method: isCddProvider', () => {
    test('should return whether the Identity is a CDD provider', async () => {
      const did = 'someDid';
      const rawDid = dsMockUtils.createMockIdentityId(did);
      const mockContext = dsMockUtils.getContextInstance();
      const identity = new Identity({ did }, mockContext);

      identityIdToStringStub.withArgs(rawDid).returns(did);

      dsMockUtils
        .createQueryStub('cddServiceProviders', 'activeMembers')
        .resolves([rawDid, dsMockUtils.createMockIdentityId('otherDid')]);

      const result = await identity.isCddProvider();

      expect(result).toBeTruthy();
    });
  });

  describe('method: getPrimaryKey', () => {
    const did = 'someDid';
    const accountId = 'somePrimaryKey';

    let accountIdToStringStub: sinon.SinonStub<[AccountId], string>;
    let didRecordsStub: sinon.SinonStub;
    let rawDidRecord: DidRecord;

    beforeAll(() => {
      accountIdToStringStub = sinon.stub(utilsConversionModule, 'accountIdToString');
      accountIdToStringStub.returns(accountId);
    });

    beforeEach(() => {
      didRecordsStub = dsMockUtils.createQueryStub('identity', 'didRecords');
      /* eslint-disable @typescript-eslint/camelcase */
      rawDidRecord = dsMockUtils.createMockDidRecord({
        roles: [],
        primary_key: dsMockUtils.createMockAccountId(accountId),
        secondary_keys: [],
      });
      /* eslint-enabled @typescript-eslint/camelcase */
    });

    test('should return a PrimaryKey', async () => {
      const mockContext = dsMockUtils.getContextInstance();
      const identity = new Identity({ did }, mockContext);

      didRecordsStub.returns(rawDidRecord);

      const result = await identity.getPrimaryKey();
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
      const result = await identity.getPrimaryKey(callback);

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

  describe('method: getVenues', () => {
    let did: string;
    let venueId: BigNumber;

    let rawDid: IdentityId;
    let rawVenueId: u64;

    beforeAll(() => {
      did = 'someDid';
      venueId = new BigNumber(10);

      rawDid = dsMockUtils.createMockIdentityId(did);
      rawVenueId = dsMockUtils.createMockU64(venueId.toNumber());
    });

    beforeEach(() => {
      stringToIdentityIdStub.withArgs(did, context).returns(rawDid);
    });

    afterAll(() => {
      sinon.restore();
    });

    test('should return a list of Venues', async () => {
      const fakeResult = [entityMockUtils.getVenueInstance({ id: venueId })];

      dsMockUtils
        .createQueryStub('settlement', 'userVenues')
        .withArgs(rawDid)
        .resolves([rawVenueId]);

      const identity = new Identity({ did }, context);

      const result = await identity.getVenues();
      expect(result).toEqual(fakeResult);
    });

    test('should allow subscription', async () => {
      const unsubCallback = 'unsubCallBack';

      const fakeResult = [entityMockUtils.getVenueInstance({ id: venueId })];

      dsMockUtils.createQueryStub('settlement', 'userVenues').callsFake(async (_, cbFunc) => {
        cbFunc([rawVenueId]);
        return unsubCallback;
      });

      const identity = new Identity({ did }, context);

      const callback = sinon.stub();
      const result = await identity.getVenues(callback);
      expect(result).toEqual(unsubCallback);
      sinon.assert.calledWithExactly(callback, fakeResult);
    });
  });

  describe('method: getScopeId', () => {
    let did: string;
    let ticker: string;
    let scopeId: string;

    let rawDid: IdentityId;
    let rawTicker: Ticker;
    let rawScopeId: ScopeId;

    let stringToTickerStub: sinon.SinonStub<[string, Context], Ticker>;

    beforeAll(() => {
      did = 'someDid';
      ticker = 'SOME_TICKER';
      scopeId = 'someScopeId';

      rawDid = dsMockUtils.createMockIdentityId(did);
      rawTicker = dsMockUtils.createMockTicker(ticker);
      rawScopeId = dsMockUtils.createMockScopeId(scopeId);

      stringToTickerStub = sinon.stub(utilsConversionModule, 'stringToTicker');
    });

    beforeEach(() => {
      stringToIdentityIdStub.withArgs(did, context).returns(rawDid);
      stringToTickerStub.withArgs(ticker, context).returns(rawTicker);

      dsMockUtils.createQueryStub('asset', 'scopeIdOf', {
        returnValue: rawScopeId,
      });
    });

    afterAll(() => {
      sinon.restore();
    });

    test("should return the Identity's scopeId associated to the token", async () => {
      const identity = new Identity({ did }, context);

      let result = await identity.getScopeId({ token: ticker });
      expect(result).toEqual(scopeId);

      result = await identity.getScopeId({
        token: entityMockUtils.getSecurityTokenInstance({ ticker }),
      });
      expect(result).toEqual(scopeId);
    });
  });
});
