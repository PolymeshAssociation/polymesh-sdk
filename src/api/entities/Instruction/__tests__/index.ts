import { StorageKey, u64 } from '@polkadot/types';
import BigNumber from 'bignumber.js';
import { PortfolioId as MeshPortfolioId } from 'polymesh-types/types';
import sinon from 'sinon';

import { Context, Entity, Instruction, TransactionQueue } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { AffirmationStatus, InstructionStatus, InstructionType } from '~/types';
import { InstructionAffirmationOperation } from '~/types/internal';
import { tuple } from '~/types/utils';
import * as utilsConversionModule from '~/utils/conversion';
import * as utilsInternalModule from '~/utils/internal';

jest.mock(
  '~/api/entities/Identity',
  require('~/testUtils/mocks/entities').mockIdentityModule('~/api/entities/Identity')
);
jest.mock(
  '~/api/entities/SecurityToken',
  require('~/testUtils/mocks/entities').mockSecurityTokenModule('~/api/entities/SecurityToken')
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
    entityMockUtils.cleanup();
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

      let result = await instruction.exists();

      expect(result).toBe(true);

      instructionDetailsStub.resolves(
        dsMockUtils.createMockInstruction({
          ...queryResult,
          status: dsMockUtils.createMockInstructionStatus('Unknown'),
        })
      );

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
      const status = InstructionStatus.Pending;
      const createdAt = new Date('10/14/1987');
      const tradeDate = new Date('11/17/1987');
      const valueDate = new Date('11/17/1987');
      const venueId = new BigNumber(1);
      const venue = entityMockUtils.getVenueInstance({ id: venueId });
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

      expect(result).toEqual({
        status,
        createdAt,
        tradeDate,
        valueDate,
        type,
        venue,
      });

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

      expect(result).toEqual({
        status,
        createdAt,
        tradeDate: null,
        valueDate: null,
        type,
        endBlock,
        venue,
      });
    });

    test('should throw an error if the Instruction does not exist', () => {
      dsMockUtils
        .createQueryStub('settlement', 'instructionDetails')
        .withArgs(rawId)
        .resolves(
          dsMockUtils.createMockInstruction({
            /* eslint-disable @typescript-eslint/naming-convention */
            instruction_id: dsMockUtils.createMockU64(),
            status: dsMockUtils.createMockInstructionStatus('Unknown'),
            venue_id: dsMockUtils.createMockU64(),
            created_at: dsMockUtils.createMockOption(),
            trade_date: dsMockUtils.createMockOption(),
            value_date: dsMockUtils.createMockOption(),
            settlement_type: dsMockUtils.createMockSettlementType(),
            /* eslint-enable @typescript-eslint/naming-convention */
          })
        );

      return expect(instruction.details()).rejects.toThrow(
        'Instruction no longer exists. This means it was already executed/rejected (execution might have failed)'
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
          ({
            args: [instructionId, portfolioId],
          } as unknown) as StorageKey,
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

    test('should throw an error if the instruction does not exist', () => {
      instructionDetailsStub.resolves(
        dsMockUtils.createMockInstruction({
          /* eslint-disable @typescript-eslint/naming-convention */
          instruction_id: dsMockUtils.createMockU64(),
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
        'Instruction no longer exists. This means it was already executed/rejected (execution might have failed)'
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
      const identityConstructor = entityMockUtils.getIdentityConstructorStub();
      const fromDid = 'fromDid';
      const toDid = 'toDid';
      const ticker = 'SOMETICKER';
      const amount = new BigNumber(1000);

      entityMockUtils.configureMocks({ securityTokenOptions: { ticker } });

      const entries = [
        tuple((['instructionId', 'legId'] as unknown) as StorageKey, {
          from: dsMockUtils.createMockPortfolioId({
            did: dsMockUtils.createMockIdentityId(fromDid),
            kind: dsMockUtils.createMockPortfolioKind('Default'),
          }),
          to: dsMockUtils.createMockPortfolioId({
            did: dsMockUtils.createMockIdentityId(toDid),
            kind: dsMockUtils.createMockPortfolioKind('Default'),
          }),
          asset: dsMockUtils.createMockTicker(ticker),
          amount: dsMockUtils.createMockBalance(amount.times(Math.pow(10, 6)).toNumber()),
        }),
      ];

      sinon.stub(utilsInternalModule, 'requestPaginated').resolves({ entries, lastKey: null });

      const { data: leg } = await instruction.getLegs();

      sinon.assert.calledTwice(identityConstructor);
      sinon.assert.calledWithExactly(identityConstructor.firstCall, { did: fromDid }, context);
      sinon.assert.calledWithExactly(identityConstructor.secondCall, { did: toDid }, context);
      expect(leg[0].amount).toEqual(amount);
      expect(leg[0].token).toEqual(entityMockUtils.getSecurityTokenInstance());
    });

    test('should throw an error if the instruction does not exist', () => {
      instructionDetailsStub.resolves(
        dsMockUtils.createMockInstruction({
          /* eslint-disable @typescript-eslint/naming-convention */
          instruction_id: dsMockUtils.createMockU64(),
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
        'Instruction no longer exists. This means it was already executed/rejected (execution might have failed)'
      );
    });
  });

  describe('method: reject', () => {
    afterAll(() => {
      sinon.restore();
    });

    test('should prepare the procedure and return the resulting transaction queue', async () => {
      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<void>;

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
      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<Instruction>;

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
      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<Instruction>;

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
});
