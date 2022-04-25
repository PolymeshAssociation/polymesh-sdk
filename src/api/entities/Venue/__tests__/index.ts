import { u64 } from '@polkadot/types';
import BigNumber from 'bignumber.js';
import sinon from 'sinon';

import {
  addInstructionTransformer,
  Context,
  Entity,
  Instruction,
  TransactionQueue,
  Venue,
} from '~/internal';
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
      sinon.restore();
    });

    it('should return whether if the venue exists or not', async () => {
      const owner = 'someDid';

      entityMockUtils.configureMocks({ identityOptions: { did: owner } });
      sinon.stub(utilsConversionModule, 'bigNumberToU64').withArgs(id, context).returns(rawId);

      dsMockUtils
        .createQueryStub('settlement', 'venueInfo')
        .withArgs(rawId)
        .resolves(dsMockUtils.createMockOption());

      const result = await venue.exists();

      expect(result).toEqual(false);
    });
  });

  describe('method: details', () => {
    afterAll(() => {
      sinon.restore();
    });

    it('should return the Venue details', async () => {
      const description = 'someDescription';
      const type = VenueType.Other;
      const owner = 'someDid';

      entityMockUtils.configureMocks({ identityOptions: { did: owner } });
      sinon.stub(utilsConversionModule, 'bigNumberToU64').withArgs(id, context).returns(rawId);
      sinon.stub(utilsConversionModule, 'bytesToString').returns(description);

      dsMockUtils
        .createQueryStub('settlement', 'venueInfo')
        .withArgs(rawId)
        .resolves(
          dsMockUtils.createMockOption(
            dsMockUtils.createMockVenue({
              creator: dsMockUtils.createMockIdentityId(owner),
              venueType: dsMockUtils.createMockVenueType(type),
            })
          )
        );
      dsMockUtils
        .createQueryStub('settlement', 'details')
        .withArgs(rawId)
        .resolves(dsMockUtils.createMockVenueDetails(description));

      const result = await venue.details();

      expect(result).toEqual({
        owner: expect.objectContaining({ did: owner }),
        description,
        type,
      });
    });
  });

  describe('method: getInstructions', () => {
    afterAll(() => {
      sinon.restore();
    });

    it("should return the Venue's pending and failed instructions", async () => {
      const id1 = new BigNumber(1);
      const id2 = new BigNumber(2);

      const detailsStub = sinon.stub();

      detailsStub.onFirstCall().resolves({
        status: InstructionStatus.Pending,
      });
      detailsStub.onSecondCall().resolves({
        status: InstructionStatus.Failed,
      });
      detailsStub.onThirdCall().resolves({
        status: InstructionStatus.Executed,
      });

      entityMockUtils.configureMocks({
        instructionOptions: {
          details: detailsStub,
        },
      });

      sinon.stub(utilsConversionModule, 'bigNumberToU64').withArgs(id, context).returns(rawId);

      dsMockUtils
        .createQueryStub('settlement', 'venueInfo')
        .resolves(dsMockUtils.createMockOption(dsMockUtils.createMockVenue()));

      dsMockUtils.createQueryStub('settlement', 'venueInstructions', {
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

  describe('method: getPendingInstructions', () => {
    afterAll(() => {
      sinon.restore();
    });

    it("should return the Venue's pending instructions", async () => {
      const instructionId = new BigNumber(1);

      entityMockUtils.configureMocks({
        instructionOptions: { id: instructionId, isPending: true },
      });
      sinon.stub(utilsConversionModule, 'bigNumberToU64').withArgs(id, context).returns(rawId);

      dsMockUtils
        .createQueryStub('settlement', 'venueInfo')
        .resolves(dsMockUtils.createMockOption(dsMockUtils.createMockVenue()));

      dsMockUtils.createQueryStub('settlement', 'venueInstructions', {
        entries: [[tuple(rawId, dsMockUtils.createMockU64(instructionId)), []]],
      });

      let result = await venue.getPendingInstructions();

      expect(result[0].id).toEqual(instructionId);

      entityMockUtils.configureMocks({
        instructionOptions: {
          id: instructionId,
          exists: true,
          details: {
            status: InstructionStatus.Failed,
            createdAt: new Date('10/14/1987'),
            tradeDate: null,
            valueDate: null,
            venue,
            type: InstructionType.SettleOnAffirmation,
          },
        },
      });

      result = await venue.getPendingInstructions();
      expect(result.length).toBe(0);
    });
  });

  describe('method: addInstruction', () => {
    afterAll(() => {
      sinon.restore();
    });

    it('should prepare the procedure and return the resulting transaction queue', async () => {
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
            args: { instructions: [{ legs, tradeDate, endBlock }], venueId: venue.id },
            transformer: addInstructionTransformer,
          },
          context
        )
        .resolves(expectedQueue);

      const queue = await venue.addInstruction({ legs, tradeDate, endBlock });

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: addInstructions', () => {
    afterAll(() => {
      sinon.restore();
    });

    it('should prepare the procedure and return the resulting transaction queue', async () => {
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

      const expectedQueue = 'someQueue' as unknown as TransactionQueue<Instruction>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs(
          {
            args: { venueId: venue.id, instructions },
            transformer: undefined,
          },
          context
        )
        .resolves(expectedQueue);

      const queue = await venue.addInstructions({ instructions });

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: modify', () => {
    afterAll(() => {
      sinon.restore();
    });

    it('should prepare the procedure and return the resulting transaction queue', async () => {
      const expectedQueue = 'someQueue' as unknown as TransactionQueue<Instruction>;
      const description = 'someDetails';
      const type = VenueType.Other;

      procedureMockUtils
        .getPrepareStub()
        .withArgs(
          {
            args: { venue, description, type },
            transformer: undefined,
          },
          context
        )
        .resolves(expectedQueue);

      const queue = await venue.modify({ description, type });

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: toJson', () => {
    it('should return a human readable version of the entity', () => {
      const venueEntity = new Venue({ id: new BigNumber(1) }, context);

      expect(venueEntity.toJson()).toBe('1');
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
