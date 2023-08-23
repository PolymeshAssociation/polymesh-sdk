import { u64 } from '@polkadot/types';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import { createPortfolioTransformer } from '~/api/entities/Venue';
import {
  addInstructionTransformer,
  Context,
  Entity,
  Instruction,
  PolymeshTransaction,
  Venue,
} from '~/internal';
import { instructionsQuery } from '~/middleware/queries';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { HistoricInstruction, InstructionStatus, VenueType } from '~/types';
import { tuple } from '~/types/utils';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Identity',
  require('~/testUtils/mocks/entities').mockIdentityModule('~/api/entities/Identity')
);
jest.mock(
  '~/api/entities/Asset',
  require('~/testUtils/mocks/entities').mockAssetModule('~/api/entities/Asset')
);
jest.mock(
  '~/api/entities/DefaultPortfolio',
  require('~/testUtils/mocks/entities').mockDefaultPortfolioModule(
    '~/api/entities/DefaultPortfolio'
  )
);
jest.mock(
  '~/api/entities/NumberedPortfolio',
  require('~/testUtils/mocks/entities').mockNumberedPortfolioModule(
    '~/api/entities/NumberedPortfolio'
  )
);
jest.mock(
  '~/api/entities/Instruction',
  require('~/testUtils/mocks/entities').mockInstructionModule('~/api/entities/Instruction')
);
jest.mock(
  '~/base/Procedure',
  require('~/testUtils/mocks/procedure').mockProcedureModule('~/base/Procedure')
);

describe('Venue class', () => {
  let context: Mocked<Context>;
  let venue: Venue;

  let id: BigNumber;

  let rawId: u64;

  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();
    procedureMockUtils.initMocks();

    id = new BigNumber(1);
    rawId = dsMockUtils.createMockU64(id);
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
    venue = new Venue({ id }, context);
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

  it('should extend Entity', () => {
    expect(Venue.prototype instanceof Entity).toBe(true);
  });

  describe('method: isUniqueIdentifiers', () => {
    it('should return true if the object conforms to the interface', () => {
      expect(Venue.isUniqueIdentifiers({ id: new BigNumber(1) })).toBe(true);
      expect(Venue.isUniqueIdentifiers({})).toBe(false);
      expect(Venue.isUniqueIdentifiers({ id: 3 })).toBe(false);
    });
  });

  describe('method: exists', () => {
    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should return whether if the venue exists or not', async () => {
      const owner = 'someDid';

      entityMockUtils.configureMocks({ identityOptions: { did: owner } });
      when(jest.spyOn(utilsConversionModule, 'bigNumberToU64'))
        .calledWith(id, context)
        .mockReturnValue(rawId);

      when(dsMockUtils.createQueryMock('settlement', 'venueInfo'))
        .calledWith(rawId)
        .mockResolvedValue(dsMockUtils.createMockOption());

      const result = await venue.exists();

      expect(result).toEqual(false);
    });
  });

  describe('method: details', () => {
    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should return the Venue details', async () => {
      const description = 'someDescription';
      const type = VenueType.Other;
      const owner = 'someDid';

      entityMockUtils.configureMocks({ identityOptions: { did: owner } });
      when(jest.spyOn(utilsConversionModule, 'bigNumberToU64'))
        .calledWith(id, context)
        .mockReturnValue(rawId);
      when(jest.spyOn(utilsConversionModule, 'bytesToString')).mockReturnValue(description);

      when(dsMockUtils.createQueryMock('settlement', 'venueInfo'))
        .calledWith(rawId)
        .mockResolvedValue(
          dsMockUtils.createMockOption(
            dsMockUtils.createMockVenue({
              creator: dsMockUtils.createMockIdentityId(owner),
              venueType: dsMockUtils.createMockVenueType(type),
            })
          )
        );
      when(dsMockUtils.createQueryMock('settlement', 'details'))
        .calledWith(rawId)
        .mockResolvedValue(dsMockUtils.createMockBytes(description));

      const result = await venue.details();

      expect(result).toEqual({
        owner: expect.objectContaining({ did: owner }),
        description,
        type,
      });
    });
  });

  describe('method: getHistoricalInstructions', () => {
    it('should return the paginated list of all instructions that have been associated with a Venue', async () => {
      const middlewareInstructionToHistoricInstructionSpy = jest.spyOn(
        utilsConversionModule,
        'middlewareInstructionToHistoricInstruction'
      );

      const venueId = new BigNumber(1);

      const instructionsResponse = {
        totalCount: 5,
        nodes: ['instructions'],
      };

      dsMockUtils.createApolloQueryMock(
        instructionsQuery(
          {
            venueId: venueId.toString(),
          },
          new BigNumber(2),
          new BigNumber(0)
        ),
        {
          instructions: instructionsResponse,
        }
      );

      const mockHistoricInstruction = 'mockData' as unknown as HistoricInstruction;

      middlewareInstructionToHistoricInstructionSpy.mockReturnValue(mockHistoricInstruction);

      let result = await venue.getHistoricalInstructions({
        size: new BigNumber(2),
        start: new BigNumber(0),
      });

      const { data, next, count } = result;

      expect(next).toEqual(new BigNumber(1));
      expect(count).toEqual(new BigNumber(5));
      expect(data).toEqual([mockHistoricInstruction]);

      dsMockUtils.createApolloQueryMock(
        instructionsQuery({
          venueId: venueId.toString(),
        }),
        {
          instructions: instructionsResponse,
        }
      );

      result = await venue.getHistoricalInstructions();

      expect(result.count).toEqual(new BigNumber(5));
      expect(result.next).toEqual(new BigNumber(result.data.length));
    });
  });

  describe('method: getInstructions', () => {
    afterAll(() => {
      jest.restoreAllMocks();
    });

    it("should return the Venue's pending and failed instructions", async () => {
      const id1 = new BigNumber(1);
      const id2 = new BigNumber(2);

      const detailsMock = jest.fn();

      detailsMock
        .mockResolvedValueOnce({
          status: InstructionStatus.Pending,
        })
        .mockResolvedValueOnce({
          status: InstructionStatus.Failed,
        })
        .mockResolvedValue({
          status: InstructionStatus.Executed,
        });

      entityMockUtils.configureMocks({
        instructionOptions: {
          details: detailsMock,
        },
      });

      when(jest.spyOn(utilsConversionModule, 'bigNumberToU64'))
        .calledWith(id, context)
        .mockReturnValue(rawId);

      dsMockUtils
        .createQueryMock('settlement', 'venueInfo')
        .mockResolvedValue(dsMockUtils.createMockOption(dsMockUtils.createMockVenue()));

      dsMockUtils.createQueryMock('settlement', 'venueInstructions', {
        entries: [
          [tuple(rawId, dsMockUtils.createMockU64(id1)), []],
          [tuple(rawId, dsMockUtils.createMockU64(id2)), []],
          [tuple(rawId, dsMockUtils.createMockU64(new BigNumber(3))), []],
        ],
      });

      const result = await venue.getInstructions();

      expect(result.pending[0].id).toEqual(id1);
      expect(result.failed[0].id).toEqual(id2);
      expect(result.pending).toHaveLength(1);
      expect(result.failed).toHaveLength(1);
    });
  });

  describe('method: addInstruction', () => {
    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should prepare the procedure and return the resulting transaction', async () => {
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
            args: { instructions: [{ legs, tradeDate, endBlock }], venueId: venue.id },
            transformer: addInstructionTransformer,
          },
          context,
          {}
        )
        .mockResolvedValue(expectedTransaction);

      const tx = await venue.addInstruction({ legs, tradeDate, endBlock });

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: addInstructions', () => {
    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should prepare the procedure and return the resulting transaction', async () => {
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

      const instructions = [
        {
          legs,
          tradeDate,
          endBlock,
        },
      ];

      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<Instruction>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith(
          {
            args: { venueId: venue.id, instructions },
            transformer: undefined,
          },
          context,
          {}
        )
        .mockResolvedValue(expectedTransaction);

      const tx = await venue.addInstructions({ instructions });

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: modify', () => {
    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should prepare the procedure and return the resulting transaction', async () => {
      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<Instruction>;
      const description = 'someDetails';
      const type = VenueType.Other;

      when(procedureMockUtils.getPrepareMock())
        .calledWith(
          {
            args: { venue, description, type },
            transformer: undefined,
          },
          context,
          {}
        )
        .mockResolvedValue(expectedTransaction);

      const tx = await venue.modify({ description, type });

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: toHuman', () => {
    it('should return a human readable version of the entity', () => {
      const venueEntity = new Venue({ id: new BigNumber(1) }, context);

      expect(venueEntity.toHuman()).toBe('1');
    });
  });
});

describe('addInstructionTransformer', () => {
  it('should return a single Instruction', () => {
    const id = new BigNumber(1);

    const result = addInstructionTransformer([entityMockUtils.getInstructionInstance({ id })]);

    expect(result.id).toEqual(id);
  });
});

describe('createPortfolioTransformer', () => {
  it('should return a single Portfolio', () => {
    const id = new BigNumber(1);
    const did = 'someDid';

    const result = createPortfolioTransformer([
      entityMockUtils.getNumberedPortfolioInstance({ id, did }),
    ]);

    expect(result.id).toEqual(id);
    expect(result.owner.did).toBe(did);
  });
});
