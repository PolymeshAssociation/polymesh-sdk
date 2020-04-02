import BigNumber from 'bignumber.js';

import { Entity } from '~/base';
import { Context } from '~/context';
import { entityMockUtils, polkadotMockUtils } from '~/testUtils/mocks';
import { RoleType } from '~/types';

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

  beforeAll(() => {
    polkadotMockUtils.initMocks();
  });

  beforeEach(() => {
    context = polkadotMockUtils.getContextInstance();
  });

  afterEach(() => {
    polkadotMockUtils.reset();
  });

  afterAll(() => {
    polkadotMockUtils.cleanup();
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

  describe('method: getPolyXBalance', () => {
    test("should return the identity's POLYX balance", async () => {
      const fakeBalance = new BigNumber(100);
      polkadotMockUtils
        .createQueryStub('balances', 'identityBalance')
        .resolves(fakeBalance.times(Math.pow(10, 6)));
      const identity = new Identity({ did: 'abc' }, context);
      const result = await identity.getPolyXBalance();
      expect(result).toEqual(fakeBalance);
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
      const role = { type: RoleType.TickerOwner, ticker: 'someTicker' };

      let hasRole = await identity.hasRole(role);

      expect(hasRole).toBe(true);

      identity.did = 'otherDid';

      hasRole = await identity.hasRole(role);

      expect(hasRole).toBe(false);
    });

    test('hasRole should check whether the identity has the Token Owner role', async () => {
      const identity = new Identity({ did: 'someDid' }, context);
      const role = { type: RoleType.TokenOwner, ticker: 'someTicker' };

      let hasRole = await identity.hasRole(role);

      expect(hasRole).toBe(true);

      identity.did = 'otherDid';

      hasRole = await identity.hasRole(role);

      expect(hasRole).toBe(false);
    });

    test('hasRole should throw an error if the role is not recognized', () => {
      const identity = new Identity({ did: 'someDid' }, context);
      const type = 'Fake' as RoleType;
      const role = { type, ticker: 'someTicker' };

      const hasRole = identity.hasRole(role);

      expect(hasRole).rejects.toThrow(`Unrecognized role "${type}"`);
    });

    test('hasRoles should return true if the identity possesses all roles', async () => {
      const identity = new Identity({ did: 'someDid' }, context);
      const roles = [
        { type: RoleType.TickerOwner, ticker: 'someTicker' },
        { type: RoleType.TickerOwner, ticker: 'otherTicker' },
      ];

      const hasRole = await identity.hasRoles(roles);

      expect(hasRole).toBe(true);
    });

    test("hasRoles should return false if at least one role isn't possessed by the identity", async () => {
      const identity = new Identity({ did: 'someDid' }, context);
      const roles = [
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
});
