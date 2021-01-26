import { u64 } from '@polkadot/types';
import BigNumber from 'bignumber.js';
import {
  AffirmationStatus as MeshAffirmationStatus,
  PortfolioId as MeshPortfolioId,
} from 'polymesh-types/types';
import sinon, { SinonStub } from 'sinon';

import {
  Context,
  Entity,
  Instruction,
  modifyInstructionAffirmation,
  TransactionQueue,
} from '~/internal';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';
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

describe('Instruction class', () => {
  let context: Mocked<Context>;
  let instruction: Instruction;
  let prepareModifyInstructionAffirmationStub: SinonStub;
  let id: BigNumber;
  let rawId: u64;

  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();

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
  });

  afterAll(() => {
    dsMockUtils.cleanup();
    entityMockUtils.cleanup();
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

  describe('method: details', () => {
    afterAll(() => {
      sinon.restore();
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
      sinon.stub(utilsConversionModule, 'numberToU64').withArgs(id, context).returns(rawId);

      const queryResult = {
        status: dsMockUtils.createMockInstructionStatus(status),
        /* eslint-disable @typescript-eslint/camelcase */
        venue_id: dsMockUtils.createMockU64(venueId.toNumber()),
        created_at: dsMockUtils.createMockOption(dsMockUtils.createMockMoment(createdAt.getTime())),
        trade_date: dsMockUtils.createMockOption(dsMockUtils.createMockMoment(tradeDate.getTime())),
        value_date: dsMockUtils.createMockOption(dsMockUtils.createMockMoment(valueDate.getTime())),
        settlement_type: dsMockUtils.createMockSettlementType(type),
        /* eslint-enable @typescript-eslint/camelcase */
      };

      const instructionDetailsStub = dsMockUtils
        .createQueryStub('settlement', 'instructionDetails')
        .withArgs(rawId)
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

      instructionDetailsStub.resolves({
        ...queryResult,
        /* eslint-disable @typescript-eslint/camelcase */
        trade_date: dsMockUtils.createMockOption(),
        value_date: dsMockUtils.createMockOption(),
        settlement_type: dsMockUtils.createMockSettlementType({
          SettleOnBlock: dsMockUtils.createMockU32(endBlock.toNumber()),
        }),
        /* eslint-enable @typescript-eslint/camelcase */
      });

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
  });

  describe('method: getAffirmations', () => {
    const did = 'someDid';
    const status = AffirmationStatus.Affirmed;
    let rawStorageKey: [u64, MeshPortfolioId][];
    let authsReceivedEntries: [[u64, MeshPortfolioId], MeshAffirmationStatus][];

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
      authsReceivedEntries = rawStorageKey.map(([instructionId, portfolioId]) =>
        tuple(
          [instructionId, portfolioId],
          dsMockUtils.createMockAffirmationStatus(AffirmationStatus.Affirmed)
        )
      );
      dsMockUtils.createQueryStub('settlement', 'affirmsReceived', {
        entries: [authsReceivedEntries[0]],
      });
      sinon.stub(utilsConversionModule, 'identityIdToString').returns(did);
      sinon.stub(utilsConversionModule, 'meshAffirmationStatusToAffirmationStatus').returns(status);
    });

    test('should return a list of Affirmation Statuses', async () => {
      const result = await instruction.getAffirmations();

      expect(result).toHaveLength(1);
      expect(result[0].identity.did).toEqual(did);
      expect(result[0].status).toEqual(status);
    });
  });

  describe('method: getLegs', () => {
    let requestPaginatedStub: sinon.SinonStub;

    beforeAll(() => {
      requestPaginatedStub = sinon.stub(utilsInternalModule, 'requestPaginated');
    });

    beforeEach(() => {
      dsMockUtils.createQueryStub('settlement', 'instructionLegs');
    });

    afterAll(() => {
      sinon.restore();
    });

    test("should return the instruction's legs", async () => {
      const identityConstructor = entityMockUtils.getIdentityConstructorStub();
      const fromDid = 'fromDid';
      const toDid = 'toDid';
      const ticker = 'SOMETICKER';
      const amount = new BigNumber(1000);

      entityMockUtils.configureMocks({ securityTokenOptions: { ticker } });

      sinon.stub(utilsConversionModule, 'numberToU64').withArgs(id, context).returns(rawId);

      const entries = [
        tuple(['instructionId', 'legId'], {
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

      requestPaginatedStub.resolves({ entries, lastKey: null });

      const { data: leg } = await instruction.getLegs();

      sinon.assert.calledTwice(identityConstructor);
      sinon.assert.calledWithExactly(identityConstructor.firstCall, { did: fromDid }, context);
      sinon.assert.calledWithExactly(identityConstructor.secondCall, { did: toDid }, context);
      expect(leg[0].amount).toEqual(amount);
      expect(leg[0].token).toEqual(entityMockUtils.getSecurityTokenInstance());
    });
  });

  describe('method: reject', () => {
    beforeAll(() => {
      prepareModifyInstructionAffirmationStub = sinon.stub(modifyInstructionAffirmation, 'prepare');
    });

    afterAll(() => {
      sinon.restore();
    });

    test('should prepare the procedure and return the resulting transaction queue', async () => {
      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<void>;

      prepareModifyInstructionAffirmationStub
        .withArgs({ id, operation: InstructionAffirmationOperation.Reject }, context)
        .resolves(expectedQueue);

      const queue = await instruction.reject();
      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: affirm', () => {
    beforeAll(() => {
      prepareModifyInstructionAffirmationStub = sinon.stub(modifyInstructionAffirmation, 'prepare');
    });

    afterAll(() => {
      sinon.restore();
    });

    test('should prepare the procedure and return the resulting transaction queue', async () => {
      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<Instruction>;

      prepareModifyInstructionAffirmationStub
        .withArgs({ id, operation: InstructionAffirmationOperation.Affirm }, context)
        .resolves(expectedQueue);

      const queue = await instruction.affirm();

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: withdraw', () => {
    beforeAll(() => {
      prepareModifyInstructionAffirmationStub = sinon.stub(modifyInstructionAffirmation, 'prepare');
    });

    afterAll(() => {
      sinon.restore();
    });

    test('should prepare the procedure and return the resulting transaction queue', async () => {
      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<Instruction>;

      prepareModifyInstructionAffirmationStub
        .withArgs({ id, operation: InstructionAffirmationOperation.Withdraw }, context)
        .resolves(expectedQueue);

      const queue = await instruction.withdraw();

      expect(queue).toBe(expectedQueue);
    });
  });
});
