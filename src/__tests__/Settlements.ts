import BigNumber from 'bignumber.js';

import { Context } from '~/internal';
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
      const venueId = new BigNumber(1);
      const matchingVenue = entityMockUtils.getVenueInstance({ id: venueId });

      entityMockUtils.configureMocks({
        venueOptions: { exists: true },
      });

      const result = await settlements.getVenue({ id: venueId });
      expect(result).toMatchObject(matchingVenue);
    });

    test('should throw if Venue does not exist', async () => {
      const venueId = new BigNumber(1);

      entityMockUtils.configureMocks({
        venueOptions: { exists: false },
      });

      expect(settlements.getVenue({ id: venueId })).rejects.toThrow("The Venue doesn't exist");
    });
  });
});
