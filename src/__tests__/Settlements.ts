import BigNumber from 'bignumber.js';

import { Context, Venue } from '~/internal';
import { Settlements } from '~/Settlements';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';

jest.mock(
  '~/api/entities/Venue',
  require('~/testUtils/mocks/entities').mockVenueModule('~/api/entities/Venue')
);

describe('Settlements Class', () => {
  let context: Mocked<Context>;
  let settlements: Settlements;

  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
    settlements = new Settlements(context);
  });

  afterEach(() => {
    dsMockUtils.reset();
    entityMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
    entityMockUtils.cleanup();
  });

  describe('method: getVenue', () => {
    test('should return a Venue by its id', async () => {
      const venueId = 1;
      const matchingVenue = new Venue({ id: new BigNumber(venueId) }, context);

      entityMockUtils.configureMocks({
        venueOptions: { exists: true },
      });

      let result = await settlements.getVenue(venueId);
      expect(result).toMatchObject(matchingVenue);

      result = await settlements.getVenue(new BigNumber(venueId));
      expect(result).toMatchObject(matchingVenue);
    });

    test('should throw if Venue does not exist', async () => {
      const venueId = 1;

      entityMockUtils.configureMocks({
        venueOptions: { exists: false },
      });

      expect(settlements.getVenue(venueId)).rejects.toThrow("The Venue doesn't exist");
    });
  });
});
