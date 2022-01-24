import BigNumber from 'bignumber.js';

import { Context, TransactionQueue, Venue } from '~/internal';
import { Settlements } from '~/Settlements';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { VenueType } from '~/types';

jest.mock(
  '~/api/entities/Venue',
  require('~/testUtils/mocks/entities').mockVenueModule('~/api/entities/Venue')
);

jest.mock(
  '~/api/entities/Instruction',
  require('~/testUtils/mocks/entities').mockInstructionModule('~/api/entities/Instruction')
);

jest.mock(
  '~/base/Procedure',
  require('~/testUtils/mocks/procedure').mockProcedureModule('~/base/Procedure')
);

describe('Settlements Class', () => {
  let context: Mocked<Context>;
  let settlements: Settlements;

  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();
    procedureMockUtils.initMocks();
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
    settlements = new Settlements(context);
  });

  afterEach(() => {
    dsMockUtils.reset();
    entityMockUtils.reset();
    procedureMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
    procedureMockUtils.cleanup();
  });

  describe('method: getVenue', () => {
    test('should return a Venue by its id', async () => {
      const venueId = new BigNumber(1);

      entityMockUtils.configureMocks({
        venueOptions: { exists: true },
      });

      const result = await settlements.getVenue({ id: venueId });

      expect(result.id).toEqual(venueId);
    });

    test('should throw if the Venue does not exist', async () => {
      const venueId = new BigNumber(1);

      entityMockUtils.configureMocks({
        venueOptions: { exists: false },
      });

      return expect(settlements.getVenue({ id: venueId })).rejects.toThrow(
        "The Venue doesn't exist"
      );
    });
  });

  describe('method: getInstruction', () => {
    test('should return an Instruction by its id', async () => {
      const instructionId = new BigNumber(1);

      entityMockUtils.configureMocks({
        instructionOptions: { exists: true },
      });

      const result = await settlements.getInstruction({ id: instructionId });

      expect(result.id).toEqual(instructionId);
    });

    test('should throw if the Instruction does not exist', async () => {
      const instructionId = new BigNumber(1);

      entityMockUtils.configureMocks({
        instructionOptions: { exists: false },
      });

      return expect(settlements.getInstruction({ id: instructionId })).rejects.toThrow(
        "The Instruction doesn't exist"
      );
    });
  });

  describe('method: createVenue', () => {
    test('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
      const args = {
        description: 'description',
        type: VenueType.Distribution,
      };

      const expectedQueue = 'someQueue' as unknown as TransactionQueue<Venue>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs({ args, transformer: undefined }, context)
        .resolves(expectedQueue);

      const queue = await settlements.createVenue(args);

      expect(queue).toBe(expectedQueue);
    });
  });
});
