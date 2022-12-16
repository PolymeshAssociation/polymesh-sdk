import { u64 } from '@polkadot/types';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import { createPortfolioTransformer } from '~/api/entities/Venue';
import {
  addInstructionTransformer,
  Context,
  Entity,
  Instruction,
  NumberedPortfolio,
  PolymeshTransaction,
  Venue,
} from '~/internal';
import { InstructionStatusEnum } from '~/middleware/enumsV2';
import { instructionsQuery } from '~/middleware/queriesV2';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { InstructionStatus, InstructionType, VenueType } from '~/types';
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
      const instructionId1 = new BigNumber(1);
      const instructionId2 = new BigNumber(2);
      const blockNumber = new BigNumber(1234);
      const blockHash = 'someHash';
      const memo = 'memo';
      const ticker = 'SOME_TICKER';
      const amount1 = new BigNumber(10);
      const amount2 = new BigNumber(5);
      const venueId = new BigNumber(1);
      const createdAt = new Date('2022/01/01');
      const status = InstructionStatusEnum.Executed;
      const portfolioDid1 = 'portfolioDid1';
      const portfolioKind1 = 'Default';

      const portfolioDid2 = 'portfolioDid2';
      const portfolioKind2 = '10';
      const type1 = InstructionType.SettleOnAffirmation;
      const type2 = InstructionType.SettleOnBlock;
      const endBlock = new BigNumber(1238);

      const legs1 = [
        {
          assetId: ticker,
          amount: amount1.shiftedBy(6).toString(),
          from: {
            number: portfolioKind1,
            identityId: portfolioDid1,
          },
          to: {
            number: portfolioKind2,
            identityId: portfolioDid2,
          },
        },
      ];
      const legs2 = [
        {
          assetId: ticker,
          amount: amount2.shiftedBy(6).toString(),
          from: {
            number: portfolioKind2,
            identityId: portfolioDid2,
          },
          to: {
            number: portfolioKind1,
            identityId: portfolioDid1,
          },
        },
      ];

      const nodes = [
        {
          id: instructionId1.toString(),
          createdBlock: {
            blockId: blockNumber.toString(),
            hash: blockHash,
            datetime: createdAt,
          },
          status,
          memo,
          venueId: venueId.toString(),
          settlementType: type1,
          legs: {
            nodes: legs1,
          },
        },
        {
          id: instructionId2.toString(),
          createdBlock: {
            blockId: blockNumber.toString(),
            hash: blockHash,
            datetime: createdAt,
          },
          status,
          settlementType: type2,
          endBlock: endBlock.toString(),
          venueId: venueId.toString(),
          legs: {
            nodes: legs2,
          },
        },
      ];

      const instructionsResponse = {
        totalCount: 5,
        nodes,
      };

      dsMockUtils.createApolloV2QueryMock(
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

      let result = await venue.getHistoricalInstructions({
        size: new BigNumber(2),
        start: new BigNumber(0),
      });

      const { data, next, count } = result;

      expect(next).toEqual(new BigNumber(2));
      expect(count).toEqual(new BigNumber(5));

      expect(data[0].id).toEqual(instructionId1);
      expect(data[0].blockHash).toEqual(blockHash);
      expect(data[0].blockNumber).toEqual(blockNumber);
      expect(data[0].status).toEqual(status);
      expect(data[0].memo).toEqual(memo);
      expect(data[0].type).toEqual(InstructionType.SettleOnAffirmation);
      expect(data[0].venueId).toEqual(venueId);
      expect(data[0].createdAt).toEqual(createdAt);
      expect(data[0].legs[0].asset.ticker).toBe(ticker);
      expect(data[0].legs[0].amount).toEqual(amount1);
      expect(data[0].legs[0].from.owner.did).toBe(portfolioDid1);
      expect(data[0].legs[0].to.owner.did).toBe(portfolioDid2);
      expect((data[0].legs[0].to as NumberedPortfolio).id).toEqual(new BigNumber(portfolioKind2));

      expect(data[1].id).toEqual(instructionId2);
      expect(data[1].memo).toBeNull();
      expect(data[1].type).toEqual(InstructionType.SettleOnBlock);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((data[1] as any).endBlock).toEqual(endBlock);
      expect(data[1].venueId).toEqual(venueId);
      expect(data[1].createdAt).toEqual(createdAt);
      expect(data[1].legs[0].asset.ticker).toBe(ticker);
      expect(data[1].legs[0].amount).toEqual(amount2);
      expect(data[1].legs[0].from.owner.did).toBe(portfolioDid2);
      expect(data[1].legs[0].to.owner.did).toBe(portfolioDid1);
      expect((data[1].legs[0].from as NumberedPortfolio).id).toEqual(new BigNumber(portfolioKind2));

      dsMockUtils.createApolloV2QueryMock(
        instructionsQuery({
          venueId: venueId.toString(),
        }),
        {
          instructions: instructionsResponse,
        }
      );

      result = await venue.getHistoricalInstructions();

      expect(result.count).toEqual(new BigNumber(5));
      expect(result.next).toEqual(null);
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
