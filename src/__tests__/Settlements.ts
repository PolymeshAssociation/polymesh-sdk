import BigNumber from 'bignumber.js';

import { Context } from '~/internal';
import { Settlements } from '~/Settlements';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';

jest.mock(
  '~/api/entities/Venue',
  require('~/testUtils/mocks/entities').mockVenueModule('~/api/entities/Venue')
);

jest.mock(
  '~/api/entities/Instruction',
  require('~/testUtils/mocks/entities').mockInstructionModule('~/api/entities/Instruction')
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

      const result = await settlements.getVenue(venueId);
      expect(result).toMatchObject(matchingVenue);
    });

    test('should throw if Venue does not exist', async () => {
      const venueId = new BigNumber(1);

      entityMockUtils.configureMocks({
        venueOptions: { exists: false },
      });

      expect(settlements.getVenue(venueId)).rejects.toThrow("The Venue doesn't exist");
    });
  });

  describe('method: getInstruction', () => {
    test('should return an Instruction by its id', async () => {
      const instructionId = new BigNumber(1);
      const matchingInstruction = entityMockUtils.getInstructionInstance({ id: instructionId });

      entityMockUtils.configureMocks({
        instructionOptions: { exists: true },
      });

      const result = await settlements.getInstruction(instructionId);
      expect(result).toMatchObject(matchingInstruction);
    });

    test('should throw if Instruction does not exist', async () => {
      const instructionId = new BigNumber(1);

      entityMockUtils.configureMocks({
        instructionOptions: { exists: false },
      });

      expect(settlements.getInstruction(instructionId)).rejects.toThrow(
        "The Instruction doesn't exist"
      );
    });
  });
});
