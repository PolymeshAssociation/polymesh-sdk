import { StorageKey, u64 } from '@polkadot/types';
import BigNumber from 'bignumber.js';
import { PortfolioId as MeshPortfolioId } from 'polymesh-types/types';
import sinon from 'sinon';

import { Context, Entity, Instruction, TransactionQueue } from '~/internal';
import { eventByIndexedArgs } from '~/middleware/queries';
import { EventIdEnum, ModuleIdEnum } from '~/middleware/types';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { AffirmationStatus, InstructionStatus, InstructionType } from '~/types';
import {
  InstructionAffirmationOperation,
  InstructionStatus as InternalInstructionStatus,
} from '~/types/internal';
import { tuple } from '~/types/utils';
import * as utilsConversionModule from '~/utils/conversion';
import * as utilsInternalModule from '~/utils/internal';

jest.mock(
  '~/api/entities/Identity',
  require('~/testUtils/mocks/entities').mockIdentityModule('~/api/entities/Identity')
);
jest.mock(
  '~/api/entities/Asset',
  require('~/testUtils/mocks/entities').mockAssetModule('~/api/entities/Asset')
);
jest.mock(
  '~/api/entities/Venue',
  require('~/testUtils/mocks/entities').mockVenueModule('~/api/entities/Venue')
);
jest.mock(
  '~/base/Procedure',
  require('~/testUtils/mocks/procedure').mockProcedureModule('~/base/Procedure')
);

describe('Instruction class', () => {
  let context: Mocked<Context>;
  let instruction: Instruction;
  let id: BigNumber;
  let rawId: u64;

  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();
    procedureMockUtils.initMocks();

    id = new BigNumber(1);
    rawId = dsMockUtils.createMockU64(id.toNumber());
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
    instruction = new Instruction({ id }, context);
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

  test('should extend Entity', () => {
    expect(Instruction.prototype instanceof Entity).toBe(true);
  });

  describe('method: isUniqueIdentifiers', () => {
    test('should return true if the object conforms to the interface', () => {
      expect(Instruction.isUniqueIdentifiers({ id: new BigNumber(1) })).toBe(true);
      expect(Instruction.isUniqueIdentifiers({})).toBe(false);
      expect(Instruction.isUniqueIdentifiers({ id: 3 })).toBe(false);
    });
  });

  describe('method: isExecuted', () => {
    afterAll(() => {
      sinon.restore();
    });

    let numberToU64Stub: sinon.SinonStub;
    let instructionCounterStub: sinon.SinonStub;

    beforeAll(() => {
      numberToU64Stub = sinon.stub(utilsConversionModule, 'numberToU64');
    });

    beforeEach(() => {
      instructionCounterStub = dsMockUtils.createQueryStub('settlement', 'instructionCounter', {
        returnValue: dsMockUtils.createMockU64(1000),
      });
      numberToU64Stub.withArgs(id, context).returns(rawId);
    });

    test('should return whether the instruction is executed', async () => {
      const status = InternalInstructionStatus.Unknown;
      const createdAt = new Date('10/14/1987');
      const tradeDate = new Date('11/17/1987');
      const valueDate = new Date('11/17/1987');
      const venueId = new BigNumber(1);
      const type = InstructionType.SettleOnAffirmation;
      const owner = 'someDid';

      entityMockUtils.configureMocks({ identityOptions: { did: owner } });

      const queryResult = dsMockUtils.createMockInstruction({
        /* eslint-disable @typescript-eslint/naming-convention */
        instruction_id: dsMockUtils.createMockU64(1),
        status: dsMockUtils.createMockInstructionStatus(status),
        venue_id: dsMockUtils.createMockU64(venueId.toNumber()),
        created_at: dsMockUtils.createMockOption(dsMockUtils.createMockMoment(createdAt.getTime())),
        trade_date: dsMockUtils.createMockOption(dsMockUtils.createMockMoment(tradeDate.getTime())),
        value_date: dsMockUtils.createMockOption(dsMockUtils.createMockMoment(valueDate.getTime())),
        settlement_type: dsMockUtils.createMockSettlementType(type),
        /* eslint-enable @typescript-eslint/naming-convention */
      });

      const instructionDetailsStub = dsMockUtils
        .createQueryStub('settlement', 'instructionDetails')
        .withArgs(rawId)
        .resolves(queryResult);

      let result = await instruction.isExecuted();

      expect(result).toBe(true);

      instructionCounterStub.resolves(dsMockUtils.createMockU64(0));

      result = await instruction.isExecuted();

      expect(result).toBe(false);

      instructionDetailsStub.resolves(
        dsMockUtils.createMockInstruction({
          ...queryResult,
          status: dsMockUtils.createMockInstructionStatus('Unknown'),
        })
      );

      result = await instruction.isExecuted();

      expect(result).toBe(false);
    });
  });

  describe('method: isPending', () => {
    afterAll(() => {
      sinon.restore();
    });

    let numberToU64Stub: sinon.SinonStub;

    beforeAll(() => {
      numberToU64Stub = sinon.stub(utilsConversionModule, 'numberToU64');
    });

    beforeEach(() => {
      numberToU64Stub.withArgs(id, context).returns(rawId);
    });

    test('should return whether the instruction is pending', async () => {
      const status = InstructionStatus.Pending;
      const createdAt = new Date('10/14/1987');
      const tradeDate = new Date('11/17/1987');
      const valueDate = new Date('11/17/1987');
      const venueId = new BigNumber(1);
      const type = InstructionType.SettleOnAffirmation;
      const owner = 'someDid';

      entityMockUtils.configureMocks({ identityOptions: { did: owner } });

      const queryResult = dsMockUtils.createMockInstruction({
        /* eslint-disable @typescript-eslint/naming-convention */
        instruction_id: dsMockUtils.createMockU64(1),
        status: dsMockUtils.createMockInstructionStatus(status),
        venue_id: dsMockUtils.createMockU64(venueId.toNumber()),
        created_at: dsMockUtils.createMockOption(dsMockUtils.createMockMoment(createdAt.getTime())),
        trade_date: dsMockUtils.createMockOption(dsMockUtils.createMockMoment(tradeDate.getTime())),
        value_date: dsMockUtils.createMockOption(dsMockUtils.createMockMoment(valueDate.getTime())),
        settlement_type: dsMockUtils.createMockSettlementType(type),
        /* eslint-enable @typescript-eslint/naming-convention */
      });

      const instructionDetailsStub = dsMockUtils
        .createQueryStub('settlement', 'instructionDetails')
        .withArgs(rawId)
        .resolves(queryResult);

      let result = await instruction.isPending();

      expect(result).toBe(true);

      instructionDetailsStub.resolves(
        dsMockUtils.createMockInstruction({
          ...queryResult,
          status: dsMockUtils.createMockInstructionStatus('Unknown'),
        })
      );

      result = await instruction.isPending();

      expect(result).toBe(false);
    });
  });

  describe('method: exists', () => {
    afterAll(() => {
      sinon.restore();
    });

    let numberToU64Stub: sinon.SinonStub;

    beforeAll(() => {
      numberToU64Stub = sinon.stub(utilsConversionModule, 'numberToU64');
    });

    beforeEach(() => {
      numberToU64Stub.withArgs(id, context).returns(rawId);
    });

    test('should return whether the instruction exists', async () => {
      const owner = 'someDid';

      entityMockUtils.configureMocks({ identityOptions: { did: owner } });

      const instructionCounterStub = dsMockUtils
        .createQueryStub('settlement', 'instructionCounter')
        .resolves(dsMockUtils.createMockU64(10));

      let result = await instruction.exists();

      expect(result).toBe(true);

      instructionCounterStub.resolves(dsMockUtils.createMockU64(0));

      result = await instruction.exists();

      expect(result).toBe(false);
    });
  });

  describe('method: details', () => {
    afterAll(() => {
      sinon.restore();
    });

    let numberToU64Stub: sinon.SinonStub;

    beforeAll(() => {
      numberToU64Stub = sinon.stub(utilsConversionModule, 'numberToU64');
    });

    beforeEach(() => {
      numberToU64Stub.withArgs(id, context).returns(rawId);
    });

    test('should return the Instruction details', async () => {
      let status = InstructionStatus.Pending;
      const createdAt = new Date('10/14/1987');
      const tradeDate = new Date('11/17/1987');
      const valueDate = new Date('11/17/1987');
      const venueId = new BigNumber(1);
      let type = InstructionType.SettleOnAffirmation;
      const owner = 'someDid';

      entityMockUtils.configureMocks({ identityOptions: { did: owner } });

      const queryResult = dsMockUtils.createMockInstruction({
        /* eslint-disable @typescript-eslint/naming-convention */
        instruction_id: dsMockUtils.createMockU64(1),
        status: dsMockUtils.createMockInstructionStatus(status),
        venue_id: dsMockUtils.createMockU64(venueId.toNumber()),
        created_at: dsMockUtils.createMockOption(dsMockUtils.createMockMoment(createdAt.getTime())),
        trade_date: dsMockUtils.createMockOption(dsMockUtils.createMockMoment(tradeDate.getTime())),
        value_date: dsMockUtils.createMockOption(dsMockUtils.createMockMoment(valueDate.getTime())),
        settlement_type: dsMockUtils.createMockSettlementType(type),
        /* eslint-enable @typescript-eslint/naming-convention */
      });

      const instructionDetailsStub = dsMockUtils
        .createQueryStub('settlement', 'instructionDetails')
        // .withArgs(rawId)
        .resolves(queryResult);

      let result = await instruction.details();

      expect(result).toMatchObject({
        status,
        createdAt,
        tradeDate,
        valueDate,
        type,
      });
      expect(result.venue.id).toEqual(venueId);

      type = InstructionType.SettleOnBlock;
      const endBlock = new BigNumber(100);

      instructionDetailsStub.resolves(
        dsMockUtils.createMockInstruction({
          ...queryResult,
          /* eslint-disable @typescript-eslint/naming-convention */
          trade_date: dsMockUtils.createMockOption(),
          value_date: dsMockUtils.createMockOption(),
          settlement_type: dsMockUtils.createMockSettlementType({
            SettleOnBlock: dsMockUtils.createMockU32(endBlock.toNumber()),
          }),
          /* eslint-enable @typescript-eslint/naming-convention */
        })
      );

      result = await instruction.details();

      expect(result).toMatchObject({
        status,
        createdAt,
        tradeDate: null,
        valueDate: null,
        type,
        endBlock,
      });
      expect(result.venue.id).toEqual(venueId);

      status = InstructionStatus.Failed;
      type = InstructionType.SettleOnAffirmation;

      instructionDetailsStub.resolves(
        dsMockUtils.createMockInstruction({
          ...queryResult,
          status: dsMockUtils.createMockInstructionStatus(status),
        })
      );

      result = await instruction.details();

      expect(result).toMatchObject({
        status,
        createdAt,
        tradeDate,
        valueDate,
        type,
      });
      expect(result.venue.id).toEqual(venueId);
    });

    test('should throw an error if the Instruction is not pending', () => {
      dsMockUtils
        .createQueryStub('settlement', 'instructionDetails')
        .withArgs(rawId)
        .resolves(
          dsMockUtils.createMockInstruction({
            /* eslint-disable @typescript-eslint/naming-convention */
            instruction_id: dsMockUtils.createMockU64(1),
            status: dsMockUtils.createMockInstructionStatus('Unknown'),
            venue_id: dsMockUtils.createMockU64(1),
            created_at: dsMockUtils.createMockOption(),
            trade_date: dsMockUtils.createMockOption(),
            value_date: dsMockUtils.createMockOption(),
            settlement_type: dsMockUtils.createMockSettlementType(),
            /* eslint-enable @typescript-eslint/naming-convention */
          })
        );

      return expect(instruction.details()).rejects.toThrow(
        'Instruction has already been executed/rejected and it was purged from chain'
      );
    });
  });

  describe('method: getAffirmations', () => {
    const did = 'someDid';
    const status = AffirmationStatus.Affirmed;
    let rawStorageKey: [u64, MeshPortfolioId][];

    let instructionDetailsStub: sinon.SinonStub;

    afterAll(() => {
      sinon.restore();
    });

    beforeAll(() => {
      rawStorageKey = [
        tuple(
          dsMockUtils.createMockU64(),
          dsMockUtils.createMockPortfolioId({
            did: dsMockUtils.createMockIdentityId(did),
            kind: dsMockUtils.createMockPortfolioKind('Default'),
          })
        ),
      ];
      const authsReceivedEntries = rawStorageKey.map(([instructionId, portfolioId]) =>
        tuple(
          {
            args: [instructionId, portfolioId],
          } as unknown as StorageKey,
          dsMockUtils.createMockAffirmationStatus(AffirmationStatus.Affirmed)
        )
      );
      sinon
        .stub(utilsInternalModule, 'requestPaginated')
        .resolves({ entries: authsReceivedEntries, lastKey: null });

      sinon.stub(utilsConversionModule, 'identityIdToString').returns(did);
      sinon.stub(utilsConversionModule, 'meshAffirmationStatusToAffirmationStatus').returns(status);
    });

    beforeEach(() => {
      dsMockUtils.createQueryStub('settlement', 'instructionCounter', {
        returnValue: dsMockUtils.createMockU64(1000),
      });
      instructionDetailsStub = dsMockUtils.createQueryStub('settlement', 'instructionDetails', {
        returnValue: dsMockUtils.createMockInstruction({
          /* eslint-disable @typescript-eslint/naming-convention */
          instruction_id: dsMockUtils.createMockU64(1),
          venue_id: dsMockUtils.createMockU64(1),
          status: dsMockUtils.createMockInstructionStatus('Pending'),
          settlement_type: dsMockUtils.createMockSettlementType('SettleOnAffirmation'),
          created_at: dsMockUtils.createMockOption(
            dsMockUtils.createMockMoment(new Date('10/14/1987').getTime())
          ),
          trade_date: dsMockUtils.createMockOption(),
          value_date: dsMockUtils.createMockOption(),
          /* eslint-enable @typescript-eslint/naming-convention */
        }),
      });
      dsMockUtils.createQueryStub('settlement', 'affirmsReceived');
    });

    test('should throw an error if the instruction is not pending', () => {
      instructionDetailsStub.resolves(
        dsMockUtils.createMockInstruction({
          /* eslint-disable @typescript-eslint/naming-convention */
          instruction_id: dsMockUtils.createMockU64(1),
          venue_id: dsMockUtils.createMockU64(),
          status: dsMockUtils.createMockInstructionStatus('Unknown'),
          settlement_type: dsMockUtils.createMockSettlementType(),
          created_at: dsMockUtils.createMockOption(),
          trade_date: dsMockUtils.createMockOption(),
          value_date: dsMockUtils.createMockOption(),
          /* eslint-enable @typescript-eslint/naming-convention */
        })
      );
      return expect(instruction.getAffirmations()).rejects.toThrow(
        'Instruction has already been executed/rejected and it was purged from chain'
      );
    });

    test('should return a list of Affirmation Statuses', async () => {
      const { data } = await instruction.getAffirmations();

      expect(data).toHaveLength(1);
      expect(data[0].identity.did).toEqual(did);
      expect(data[0].status).toEqual(status);
    });
  });

  describe('method: getLegs', () => {
    let instructionDetailsStub: sinon.SinonStub;

    afterAll(() => {
      sinon.restore();
    });

    let numberToU64Stub: sinon.SinonStub;

    beforeAll(() => {
      numberToU64Stub = sinon.stub(utilsConversionModule, 'numberToU64');
    });

    beforeEach(() => {
      dsMockUtils.createQueryStub('settlement', 'instructionCounter', {
        returnValue: dsMockUtils.createMockU64(1000),
      });
      numberToU64Stub.withArgs(id, context).returns(rawId);
      dsMockUtils.createQueryStub('settlement', 'instructionLegs');
      instructionDetailsStub = dsMockUtils.createQueryStub('settlement', 'instructionDetails', {
        returnValue: dsMockUtils.createMockInstruction({
          /* eslint-disable @typescript-eslint/naming-convention */
          instruction_id: dsMockUtils.createMockU64(1),
          venue_id: dsMockUtils.createMockU64(1),
          status: dsMockUtils.createMockInstructionStatus('Pending'),
          settlement_type: dsMockUtils.createMockSettlementType('SettleOnAffirmation'),
          created_at: dsMockUtils.createMockOption(
            dsMockUtils.createMockMoment(new Date('10/14/1987').getTime())
          ),
          trade_date: dsMockUtils.createMockOption(),
          value_date: dsMockUtils.createMockOption(),
          /* eslint-enable @typescript-eslint/naming-convention */
        }),
      });
    });

    test("should return the instruction's legs", async () => {
      const fromDid = 'fromDid';
      const toDid = 'toDid';
      const ticker = 'SOME_TICKER';
      const amount = new BigNumber(1000);

      entityMockUtils.configureMocks({ assetOptions: { ticker } });

      const entries = [
        tuple(['instructionId', 'legId'] as unknown as StorageKey, {
          from: dsMockUtils.createMockPortfolioId({
            did: dsMockUtils.createMockIdentityId(fromDid),
            kind: dsMockUtils.createMockPortfolioKind('Default'),
          }),
          to: dsMockUtils.createMockPortfolioId({
            did: dsMockUtils.createMockIdentityId(toDid),
            kind: dsMockUtils.createMockPortfolioKind('Default'),
          }),
          asset: dsMockUtils.createMockTicker(ticker),
          amount: dsMockUtils.createMockBalance(amount.shiftedBy(6).toNumber()),
        }),
      ];

      sinon.stub(utilsInternalModule, 'requestPaginated').resolves({ entries, lastKey: null });

      const { data: leg } = await instruction.getLegs();

      expect(leg[0].amount).toEqual(amount);
      expect(leg[0].asset.ticker).toBe(ticker);
      expect(leg[0].from.owner.did).toBe(fromDid);
      expect(leg[0].to.owner.did).toBe(toDid);
    });

    test('should throw an error if the instruction is not pending', () => {
      instructionDetailsStub.resolves(
        dsMockUtils.createMockInstruction({
          /* eslint-disable @typescript-eslint/naming-convention */
          instruction_id: dsMockUtils.createMockU64(1),
          venue_id: dsMockUtils.createMockU64(),
          status: dsMockUtils.createMockInstructionStatus('Unknown'),
          settlement_type: dsMockUtils.createMockSettlementType(),
          created_at: dsMockUtils.createMockOption(),
          trade_date: dsMockUtils.createMockOption(),
          value_date: dsMockUtils.createMockOption(),
          /* eslint-enable @typescript-eslint/naming-convention */
        })
      );
      return expect(instruction.getLegs()).rejects.toThrow(
        'Instruction has already been executed/rejected and it was purged from chain'
      );
    });
  });

  describe('method: reject', () => {
    afterAll(() => {
      sinon.restore();
    });

    test('should prepare the procedure and return the resulting transaction queue', async () => {
      const expectedQueue = 'someQueue' as unknown as TransactionQueue<void>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs(
          {
            args: { id, operation: InstructionAffirmationOperation.Reject },
            transformer: undefined,
          },
          context
        )
        .resolves(expectedQueue);

      const queue = await instruction.reject();
      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: affirm', () => {
    afterAll(() => {
      sinon.restore();
    });

    test('should prepare the procedure and return the resulting transaction queue', async () => {
      const expectedQueue = 'someQueue' as unknown as TransactionQueue<Instruction>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs(
          {
            args: { id, operation: InstructionAffirmationOperation.Affirm },
            transformer: undefined,
          },
          context
        )
        .resolves(expectedQueue);

      const queue = await instruction.affirm();

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: withdraw', () => {
    afterAll(() => {
      sinon.restore();
    });

    test('should prepare the procedure and return the resulting transaction queue', async () => {
      const expectedQueue = 'someQueue' as unknown as TransactionQueue<Instruction>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs(
          {
            args: { id, operation: InstructionAffirmationOperation.Withdraw },
            transformer: undefined,
          },
          context
        )
        .resolves(expectedQueue);

      const queue = await instruction.withdraw();

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: reschedule', () => {
    afterAll(() => {
      sinon.restore();
    });

    test('should prepare the procedure and return the resulting transaction queue', async () => {
      const expectedQueue = 'someQueue' as unknown as TransactionQueue<Instruction>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs(
          {
            args: { id },
            transformer: undefined,
          },
          context
        )
        .resolves(expectedQueue);

      const queue = await instruction.reschedule();

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: getStatus', () => {
    afterAll(() => {
      sinon.restore();
    });

    let numberToU64Stub: sinon.SinonStub;

    beforeAll(() => {
      numberToU64Stub = sinon.stub(utilsConversionModule, 'numberToU64');
    });

    beforeEach(() => {
      numberToU64Stub.withArgs(id, context).returns(rawId);
    });

    test('should return Pending Instruction status', async () => {
      const queryResult = dsMockUtils.createMockInstruction({
        /* eslint-disable @typescript-eslint/naming-convention */
        instruction_id: dsMockUtils.createMockU64(1),
        status: dsMockUtils.createMockInstructionStatus(InternalInstructionStatus.Pending),
        venue_id: dsMockUtils.createMockU64(),
        created_at: dsMockUtils.createMockOption(),
        trade_date: dsMockUtils.createMockOption(),
        value_date: dsMockUtils.createMockOption(),
        settlement_type: dsMockUtils.createMockSettlementType(),
        /* eslint-enable @typescript-eslint/naming-convention */
      });

      dsMockUtils
        .createQueryStub('settlement', 'instructionDetails')
        .withArgs(rawId)
        .resolves(queryResult);

      const result = await instruction.getStatus();
      expect(result).toMatchObject({
        status: InstructionStatus.Pending,
      });
    });

    test('should return Executed Instruction status', async () => {
      const blockNumber = new BigNumber(1234);
      const blockDate = new Date('4/14/2020');
      const eventIdx = 1;
      const fakeQueryResult = {
        /* eslint-disable @typescript-eslint/naming-convention */
        block_id: blockNumber.toNumber(),
        block: { datetime: blockDate },
        event_idx: eventIdx,
        /* eslint-enable @typescript-eslint/naming-convention */
      };
      const fakeEventIdentifierResult = { blockNumber, blockDate, eventIndex: eventIdx };

      const queryVariables = {
        moduleId: ModuleIdEnum.Settlement,
        eventId: EventIdEnum.InstructionExecuted,
        eventArg1: id.toString(),
      };

      // Should return Pending status
      const queryResult = dsMockUtils.createMockInstruction({
        /* eslint-disable @typescript-eslint/naming-convention */
        instruction_id: dsMockUtils.createMockU64(1),
        status: dsMockUtils.createMockInstructionStatus(InternalInstructionStatus.Unknown),
        venue_id: dsMockUtils.createMockU64(),
        created_at: dsMockUtils.createMockOption(),
        trade_date: dsMockUtils.createMockOption(),
        value_date: dsMockUtils.createMockOption(),
        settlement_type: dsMockUtils.createMockSettlementType(),
        /* eslint-enable @typescript-eslint/naming-convention */
      });

      dsMockUtils
        .createQueryStub('settlement', 'instructionDetails')
        .withArgs(rawId)
        .resolves(queryResult);

      dsMockUtils.createApolloQueryStub(eventByIndexedArgs(queryVariables), {
        eventByIndexedArgs: fakeQueryResult,
      });

      const result = await instruction.getStatus();
      expect(result).toMatchObject({
        status: InstructionStatus.Executed,
        eventIdentifier: fakeEventIdentifierResult,
      });
    });

    test('should return Failed Instruction status', async () => {
      const blockNumber = new BigNumber(1234);
      const blockDate = new Date('4/14/2020');
      const eventIdx = 1;
      const fakeQueryResult = {
        /* eslint-disable @typescript-eslint/naming-convention */
        block_id: blockNumber.toNumber(),
        block: { datetime: blockDate },
        event_idx: eventIdx,
        /* eslint-enable @typescript-eslint/naming-convention */
      };
      const fakeEventIdentifierResult = { blockNumber, blockDate, eventIndex: eventIdx };

      const queryVariables = {
        moduleId: ModuleIdEnum.Settlement,
        eventId: EventIdEnum.InstructionExecuted,
        eventArg1: id.toString(),
      };

      // Should return Pending status
      const queryResult = dsMockUtils.createMockInstruction({
        /* eslint-disable @typescript-eslint/naming-convention */
        instruction_id: dsMockUtils.createMockU64(1),
        status: dsMockUtils.createMockInstructionStatus(InternalInstructionStatus.Unknown),
        venue_id: dsMockUtils.createMockU64(),
        created_at: dsMockUtils.createMockOption(),
        trade_date: dsMockUtils.createMockOption(),
        value_date: dsMockUtils.createMockOption(),
        settlement_type: dsMockUtils.createMockSettlementType(),
        /* eslint-enable @typescript-eslint/naming-convention */
      });

      dsMockUtils
        .createQueryStub('settlement', 'instructionDetails')
        .withArgs(rawId)
        .resolves(queryResult);

      dsMockUtils.createApolloMultipleQueriesStub([
        {
          query: eventByIndexedArgs(queryVariables),
          returnData: {
            eventByIndexedArgs: null,
          },
        },
        {
          query: eventByIndexedArgs({
            ...queryVariables,
            eventId: EventIdEnum.InstructionFailed,
          }),
          returnData: {
            eventByIndexedArgs: fakeQueryResult,
          },
        },
      ]);

      const result = await instruction.getStatus();
      expect(result).toMatchObject({
        status: InstructionStatus.Failed,
        eventIdentifier: fakeEventIdentifierResult,
      });
    });

    test("should throw an error if Instruction status couldn't be determied", async () => {
      const queryVariables = {
        moduleId: ModuleIdEnum.Settlement,
        eventId: EventIdEnum.InstructionExecuted,
        eventArg1: id.toString(),
      };

      // Should return Pending status
      const queryResult = dsMockUtils.createMockInstruction({
        /* eslint-disable @typescript-eslint/naming-convention */
        instruction_id: dsMockUtils.createMockU64(1),
        status: dsMockUtils.createMockInstructionStatus(InternalInstructionStatus.Unknown),
        venue_id: dsMockUtils.createMockU64(),
        created_at: dsMockUtils.createMockOption(),
        trade_date: dsMockUtils.createMockOption(),
        value_date: dsMockUtils.createMockOption(),
        settlement_type: dsMockUtils.createMockSettlementType(),
        /* eslint-enable @typescript-eslint/naming-convention */
      });

      dsMockUtils
        .createQueryStub('settlement', 'instructionDetails')
        .withArgs(rawId)
        .resolves(queryResult);

      dsMockUtils.createApolloMultipleQueriesStub([
        {
          query: eventByIndexedArgs(queryVariables),
          returnData: {
            eventByIndexedArgs: null,
          },
        },
        {
          query: eventByIndexedArgs({
            ...queryVariables,
            eventId: EventIdEnum.InstructionFailed,
          }),
          returnData: {
            eventByIndexedArgs: null,
          },
        },
      ]);

      return expect(instruction.getStatus()).rejects.toThrow(
        "It isn't possible to determine the current status of this Instruction"
      );
    });
  });

  describe('method: toJson', () => {
    test('should return a human readable version of the entity', () => {
      expect(instruction.toJson()).toBe('1');
    });
  });
});
