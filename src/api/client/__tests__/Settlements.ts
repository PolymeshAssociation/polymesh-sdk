import BigNumber from 'bignumber.js';

import { Settlements } from '~/api/client/Settlements';
import { addInstructionTransformer, Context, TransactionQueue, Venue } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { Instruction, InstructionAffirmationOperation, VenueType } from '~/types';

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
    it('should return a Venue by its id', async () => {
      const venueId = new BigNumber(1);

      entityMockUtils.configureMocks({
        venueOptions: { exists: true },
      });

      const result = await settlements.getVenue({ id: venueId });

      expect(result.id).toEqual(venueId);
    });

    it('should throw if the Venue does not exist', async () => {
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
    it('should return an Instruction by its id', async () => {
      const instructionId = new BigNumber(1);

      entityMockUtils.configureMocks({
        instructionOptions: { exists: true },
      });

      const result = await settlements.getInstruction({ id: instructionId });

      expect(result.id).toEqual(instructionId);
    });

    it('should throw if the Instruction does not exist', async () => {
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
    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
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

  describe('method: addInstruction', () => {
    it('should prepare the procedure and return the resulting transaction queue', async () => {
      const venueId = new BigNumber(1);
      const legs = [
        {
          from: 'someDid',
          to: 'anotherDid',
          amount: new BigNumber(1000),
          asset: 'SOME_ASSET',
        },
        {
          from: 'anotherDid',
          to: 'aThirdDid',
          amount: new BigNumber(100),
          asset: 'ANOTHER_ASSET',
        },
      ];

      const tradeDate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
      const endBlock = new BigNumber(10000);

      const expectedQueue = 'someQueue' as unknown as TransactionQueue<Instruction>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs(
          {
            args: { instructions: [{ legs, tradeDate, endBlock }], venueId },
            transformer: addInstructionTransformer,
          },
          context
        )
        .resolves(expectedQueue);

      const queue = await settlements.addInstruction({ venueId, legs, tradeDate, endBlock });
      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: affirmInstruction', () => {
    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
      const instructionId = new BigNumber(1);

      const expectedQueue = 'someQueue' as unknown as TransactionQueue<Venue>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs(
          {
            args: { id: instructionId, operation: InstructionAffirmationOperation.Affirm },
            transformer: undefined,
          },
          context
        )
        .resolves(expectedQueue);

      const queue = await settlements.affirmInstruction({ id: instructionId });

      expect(queue).toBe(expectedQueue);
    });
  });
});
