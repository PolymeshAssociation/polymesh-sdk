import { Balance } from '@polkadot/types/interfaces';
import BigNumber from 'bignumber.js';
import { AccountKey, DidRecord, IdentityId, Ticker } from 'polymesh-types/types';
import sinon from 'sinon';

import { Entity } from '~/base';
import { Context } from '~/context';
import { tokensByTrustedClaimIssuer } from '~/middleware/queries';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';
import { Order, Role, RoleType, TickerOwnerRole, TokenOwnerRole } from '~/types';
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

  // TODO: uncomment for v2
  // describe('method: getPolyXBalance', () => {
  //   test("should return the identity's POLYX balance", async () => {
  //     const did = 'someDid';
  //     const fakeBalance = new BigNumber(100);
  //     const rawIdentityId = dsMockUtils.createMockIdentityId(did);
  //     const mockContext = dsMockUtils.getContextInstance();

  //     stringToIdentityIdStub.withArgs(did, mockContext).returns(rawIdentityId);

  //     dsMockUtils
  //       .createQueryStub('balances', 'identityBalance')
  //       .resolves(fakeBalance.times(Math.pow(10, 6)));

  //     const identity = new Identity({ did }, context);
  //     const result = await identity.getPolyXBalance();
  //     expect(result).toEqual(fakeBalance);
  //   });
  // });

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

    // afterEach(() => {
    //   balanceOfStub.reset();
    // });

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

  describe('method: getMasterKey', () => {
    const did = 'someDid';
    const accountKey = 'someMasterKey';

    let accountKeyToStringStub: sinon.SinonStub<[AccountKey], string>;
    let didRecordsStub: sinon.SinonStub;
    let rawDidRecord: DidRecord;

    beforeAll(() => {
      accountKeyToStringStub = sinon.stub(utilsModule, 'accountKeyToString');
      accountKeyToStringStub.returns(accountKey);
    });

    beforeEach(() => {
      didRecordsStub = dsMockUtils.createQueryStub('identity', 'didRecords');
      /* eslint-disable @typescript-eslint/camelcase */
      rawDidRecord = dsMockUtils.createMockDidRecord({
        roles: [],
        master_key: dsMockUtils.createMockAccountKey(accountKey),
        signing_items: [],
      });
      /* eslint-enabled @typescript-eslint/camelcase */
    });

    test('should return a MasterKey', async () => {
      const mockContext = dsMockUtils.getContextInstance();
      const identity = new Identity({ did }, mockContext);

      didRecordsStub.returns(rawDidRecord);

      const result = await identity.getMasterKey();
      expect(result).toEqual(accountKey);
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
      sinon.assert.calledWithExactly(callback, accountKey);
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
});
