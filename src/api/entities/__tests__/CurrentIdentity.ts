import { u64 } from '@polkadot/types';
import BigNumber from 'bignumber.js';
import sinon from 'sinon';

import { CurrentIdentity, Identity, Venue } from '~/api/entities';
import { createVenue, inviteAccount, removeSecondaryKeys } from '~/api/procedures';
import { Context, TransactionQueue } from '~/base';
import { IdentityId } from '~/polkadot';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';
import { SecondaryKey, SubCallback, VenueType } from '~/types';
import * as utilsModule from '~/utils';

jest.mock(
  '~/api/entities/Venue',
  require('~/testUtils/mocks/entities').mockVenueModule('~/api/entities/Venue')
);

describe('CurrentIdentity class', () => {
  let context: Context;

  beforeAll(() => {
    entityMockUtils.initMocks();
    dsMockUtils.initMocks();
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
  });

  afterEach(() => {
    entityMockUtils.reset();
    dsMockUtils.reset();
  });

  afterAll(() => {
    entityMockUtils.cleanup();
    dsMockUtils.cleanup();
  });

  test('should extend Identity', () => {
    expect(CurrentIdentity.prototype instanceof Identity).toBe(true);
  });

  describe('method: getSecondaryKeys', () => {
    test('should return a list of Secondaries', async () => {
      const fakeResult = [
        {
          signer: entityMockUtils.getAccountInstance({ address: 'someAddress' }),
          permissions: [],
        },
      ];

      dsMockUtils.configureMocks({ contextOptions: { secondaryKeys: fakeResult } });

      const did = 'someDid';

      const identity = new CurrentIdentity({ did }, context);

      const result = await identity.getSecondaryKeys();
      expect(result).toEqual(fakeResult);
    });

    test('should allow subscription', async () => {
      const unsubCallback = 'unsubCallBack';

      const getSecondaryKeysStub = dsMockUtils
        .getContextInstance()
        .getSecondaryKeys.resolves(unsubCallback);

      const did = 'someDid';

      const identity = new CurrentIdentity({ did }, context);

      const callback = (() => [] as unknown) as SubCallback<SecondaryKey[]>;
      const result = await identity.getSecondaryKeys(callback);
      expect(result).toEqual(unsubCallback);
      sinon.assert.calledWithExactly(getSecondaryKeysStub, callback);
    });
  });

  describe('method: getVenues', () => {
    let did: string;
    let venueId: BigNumber;

    let rawDid: IdentityId;
    let rawVenueId: u64;

    let stringToIdentityIdStub: sinon.SinonStub;

    beforeAll(() => {
      did = 'someDid';
      venueId = new BigNumber(10);

      rawDid = dsMockUtils.createMockIdentityId(did);
      rawVenueId = dsMockUtils.createMockU64(venueId.toNumber());

      stringToIdentityIdStub = sinon.stub(utilsModule, 'stringToIdentityId');
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

      const identity = new CurrentIdentity({ did }, context);

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

      const identity = new CurrentIdentity({ did }, context);

      const callback = sinon.stub();
      const result = await identity.getVenues(callback);
      expect(result).toEqual(unsubCallback);
      sinon.assert.calledWithExactly(callback, fakeResult);
    });
  });

  describe('method: removeSecondaryKeys', () => {
    test('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
      const did = 'someDid';
      const identity = new CurrentIdentity({ did }, context);

      const signers = [entityMockUtils.getAccountInstance({ address: 'someAccount' })];

      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<void>;

      sinon
        .stub(removeSecondaryKeys, 'prepare')
        .withArgs({ signers }, context)
        .resolves(expectedQueue);

      const queue = await identity.removeSecondaryKeys({ signers });

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: inviteAccount', () => {
    test('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
      const did = 'someDid';
      const identity = new CurrentIdentity({ did }, context);

      const args = {
        targetAccount: 'someAccount',
      };

      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<void>;

      sinon
        .stub(inviteAccount, 'prepare')
        .withArgs(args, context)
        .resolves(expectedQueue);

      const queue = await identity.inviteAccount(args);

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: createVenue', () => {
    test('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
      const did = 'someDid';
      const identity = new CurrentIdentity({ did }, context);

      const args = {
        details: 'details',
        type: VenueType.Distribution,
      };

      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<Venue>;

      sinon
        .stub(createVenue, 'prepare')
        .withArgs(args, context)
        .resolves(expectedQueue);

      const queue = await identity.createVenue(args);

      expect(queue).toBe(expectedQueue);
    });
  });
});
