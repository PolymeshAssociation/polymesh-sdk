import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import { Settlements } from '~/api/client/Settlements';
import { addInstructionTransformer, Context, PolymeshTransaction, Venue } from '~/internal';
import { historicalInstructionsQuery } from '~/middleware/queries/settlements';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import {
  HistoricInstruction,
  Instruction,
  InstructionAffirmationOperation,
  VenueType,
} from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

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
    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const args = {
        description: 'description',
        type: VenueType.Distribution,
      };

      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<Venue>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args, transformer: undefined }, context, {})
        .mockResolvedValue(expectedTransaction);

      const tx = await settlements.createVenue(args);

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: addInstruction', () => {
    it('should prepare the procedure and return the resulting transaction', async () => {
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

      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<Instruction>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith(
          {
            args: { instructions: [{ legs, tradeDate, endBlock }], venueId },
            transformer: addInstructionTransformer,
          },
          context,
          {}
        )
        .mockResolvedValue(expectedTransaction);

      const tx = await settlements.addInstruction({ venueId, legs, tradeDate, endBlock });
      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: affirmInstruction', () => {
    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const instructionId = new BigNumber(1);

      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<Venue>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith(
          {
            args: { id: instructionId, operation: InstructionAffirmationOperation.Affirm },
            transformer: undefined,
          },
          context,
          {}
        )
        .mockResolvedValue(expectedTransaction);

      const tx = await settlements.affirmInstruction({ id: instructionId });

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: getHistoricalInstructions', () => {
    it('should return the list of all instructions where the Identity was involved', async () => {
      const middlewareInstructionToHistoricInstructionSpy = jest.spyOn(
        utilsConversionModule,
        'middlewareInstructionToHistoricInstruction'
      );

      const instructionsResponse = {
        totalCount: 5,
        nodes: [{ id: '1' }],
      };

      dsMockUtils.createApolloQueryMock(await historicalInstructionsQuery({}, context), {
        instructions: instructionsResponse,
      });

      const mockHistoricInstruction = 'mockData' as unknown as HistoricInstruction;

      middlewareInstructionToHistoricInstructionSpy.mockReturnValue(mockHistoricInstruction);

      const result = await settlements.getHistoricalInstructions({});

      expect(result).toEqual([mockHistoricInstruction]);
    });
  });
});
