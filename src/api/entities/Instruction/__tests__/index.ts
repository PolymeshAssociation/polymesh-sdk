import { u64 } from '@polkadot/types';
import BigNumber from 'bignumber.js';
import sinon, { SinonStub } from 'sinon';

import { Entity, Instruction } from '~/api/entities';
import {
  Params,
  toggleInstructionAuthorization,
} from '~/api/procedures/toggleInstructionAuthorization';
import { Context, TransactionQueue } from '~/base';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { InstructionStatus, InstructionType } from '~/types';
import { tuple } from '~/types/utils';
import * as utilsModule from '~/utils';

jest.mock(
  '~/api/entities/Identity',
  require('~/testUtils/mocks/entities').mockIdentityModule('~/api/entities/Identity')
);
jest.mock(
  '~/api/entities/SecurityToken',
  require('~/testUtils/mocks/entities').mockSecurityTokenModule('~/api/entities/SecurityToken')
);

describe('Instruction class', () => {
  let context: Mocked<Context>;
  let instruction: Instruction;
  let prepareToggleInstructionAuthorizationStub: SinonStub<
    [Params, Context],
    Promise<TransactionQueue<Instruction, unknown[][]>>
  >;

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
      const validFrom = new Date('11/17/1987');
      let type = InstructionType.SettleOnAuthorization;
      const creator = 'someDid';

      entityMockUtils.configureMocks({ identityOptions: { did: creator } });
      sinon
        .stub(utilsModule, 'numberToU64')
        .withArgs(id, context)
        .returns(rawId);

      const queryResult = {
        status: dsMockUtils.createMockInstructionStatus(status),
        /* eslint-disable @typescript-eslint/camelcase */
        created_at: dsMockUtils.createMockOption(dsMockUtils.createMockMoment(createdAt.getTime())),
        valid_from: dsMockUtils.createMockOption(dsMockUtils.createMockMoment(validFrom.getTime())),
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
        validFrom,
        type,
      });

      type = InstructionType.SettleOnBlock;
      const endBlock = new BigNumber(100);

      instructionDetailsStub.resolves({
        ...queryResult,
        /* eslint-disable @typescript-eslint/camelcase */
        valid_from: dsMockUtils.createMockOption(),
        settlement_type: dsMockUtils.createMockSettlementType({
          SettleOnBlock: dsMockUtils.createMockU32(endBlock.toNumber()),
        }),
        /* eslint-enable @typescript-eslint/camelcase */
      });

      result = await instruction.details();

      expect(result).toEqual({
        status,
        createdAt,
        validFrom: null,
        type,
        endBlock,
      });
    });
  });

  describe('method: getLegs', () => {
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
      sinon
        .stub(utilsModule, 'numberToU64')
        .withArgs(id, context)
        .returns(rawId);
      dsMockUtils.createQueryStub('settlement', 'instructionLegs', {
        entries: [
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
        ],
      });

      const [leg] = await instruction.getLegs();

      sinon.assert.calledTwice(identityConstructor);
      sinon.assert.calledWithExactly(identityConstructor.firstCall, { did: fromDid }, context);
      sinon.assert.calledWithExactly(identityConstructor.secondCall, { did: toDid }, context);
      expect(leg.amount).toEqual(amount);
      expect(leg.token).toEqual(entityMockUtils.getSecurityTokenInstance());
    });
  });

  describe('method: authorize', () => {
    beforeAll(() => {
      prepareToggleInstructionAuthorizationStub = sinon.stub(
        toggleInstructionAuthorization,
        'prepare'
      );
    });

    afterAll(() => {
      sinon.restore();
    });

    test('should prepare the procedure and return the resulting transaction queue', async () => {
      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<Instruction>;

      prepareToggleInstructionAuthorizationStub
        .withArgs({ id, authorize: true }, context)
        .resolves(expectedQueue);

      const queue = await instruction.authorize();

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: unauthorize', () => {
    beforeAll(() => {
      prepareToggleInstructionAuthorizationStub = sinon.stub(
        toggleInstructionAuthorization,
        'prepare'
      );
    });

    afterAll(() => {
      sinon.restore();
    });

    test('should prepare the procedure and return the resulting transaction queue', async () => {
      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<Instruction>;

      prepareToggleInstructionAuthorizationStub
        .withArgs({ id, authorize: false }, context)
        .resolves(expectedQueue);

      const queue = await instruction.unauthorize();

      expect(queue).toBe(expectedQueue);
    });
  });
});
