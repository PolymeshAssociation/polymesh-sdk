import { u64 } from '@polkadot/types';
import BigNumber from 'bignumber.js';
import sinon from 'sinon';

import { Entity, Venue } from '~/api/entities';
import { Context } from '~/base';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { VenueType } from '~/types';
import * as utilsModule from '~/utils';

jest.mock(
  '~/api/entities/Identity',
  require('~/testUtils/mocks/entities').mockIdentityModule('~/api/entities/Identity')
);

describe('Venue class', () => {
  let context: Mocked<Context>;
  let venue: Venue;

  let id: BigNumber;

  let rawId: u64;

  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();

    id = new BigNumber(1);
    rawId = dsMockUtils.createMockU64(id.toNumber());
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
    venue = new Venue({ id }, context);
  });

  afterEach(() => {
    dsMockUtils.reset();
    entityMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
    entityMockUtils.cleanup();
  });

  test('should extend Entity', () => {
    expect(Venue.prototype instanceof Entity).toBe(true);
  });

  describe('method: isUniqueIdentifiers', () => {
    test('should return true if the object conforms to the interface', () => {
      expect(Venue.isUniqueIdentifiers({ id: new BigNumber(1) })).toBe(true);
      expect(Venue.isUniqueIdentifiers({})).toBe(false);
      expect(Venue.isUniqueIdentifiers({ id: 3 })).toBe(false);
    });
  });

  describe('method: details', () => {
    test('should return the Venue details', async () => {
      const description = 'someDescription';
      const type = VenueType.Other;
      const owner = 'someDid';

      entityMockUtils.configureMocks({ identityOptions: { did: owner } });
      sinon
        .stub(utilsModule, 'numberToU64')
        .withArgs(id, context)
        .returns(rawId);

      dsMockUtils
        .createQueryStub('settlement', 'venueInfo')
        .withArgs(rawId)
        .resolves({
          creator: dsMockUtils.createMockIdentityId(owner),
          instructions: [],
          details: dsMockUtils.createMockVenueDetails(description),
          // eslint-disable-next-line @typescript-eslint/camelcase
          venue_type: dsMockUtils.createMockVenueType(type),
        });

      const result = await venue.details();

      expect(result).toEqual({
        owner: entityMockUtils.getIdentityInstance(),
        description,
        type,
      });
    });
  });
});
