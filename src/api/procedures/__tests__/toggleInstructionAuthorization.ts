import { u64 } from '@polkadot/types';
import BigNumber from 'bignumber.js';
import {
  AuthorizationStatus as MeshAuthorizationStatus,
  PortfolioId as MeshPortfolioId,
} from 'polymesh-types/types';
import sinon from 'sinon';

import { Instruction } from '~/api/entities';
import {
  Params,
  prepareToggleInstructionAuthorization,
} from '~/api/procedures/toggleInstructionAuthorization';
import { Context } from '~/base';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import {
  AuthorizationStatus,
  InstructionDetails,
  InstructionStatus,
  InstructionType,
} from '~/types';
import { PortfolioId } from '~/types/internal';
import * as utilsModule from '~/utils';

jest.mock(
  '~/api/entities/Instruction',
  require('~/testUtils/mocks/entities').mockInstructionModule('~/api/entities/Instruction')
);

describe('toggleInstructionAuthorization procedure', () => {
  const id = new BigNumber(1);
  const rawInstructionId = dsMockUtils.createMockU64(1);
  const rawPortfolioId = dsMockUtils.createMockPortfolioId({
    did: dsMockUtils.createMockIdentityId('someDid'),
    kind: dsMockUtils.createMockPortfolioKind('Default'),
  });
  let mockContext: Mocked<Context>;
  let numberToU64Stub: sinon.SinonStub<[number | BigNumber, Context], u64>;
  let portfolioIdToMeshPortfolioIdStub: sinon.SinonStub<[PortfolioId, Context], MeshPortfolioId>;
  let meshAuthorizationStatusToAuthorizationStatusStub: sinon.SinonStub<
    [MeshAuthorizationStatus],
    AuthorizationStatus
  >;
  let instruction: Instruction;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    numberToU64Stub = sinon.stub(utilsModule, 'numberToU64');
    portfolioIdToMeshPortfolioIdStub = sinon.stub(utilsModule, 'portfolioIdToMeshPortfolioId');
    meshAuthorizationStatusToAuthorizationStatusStub = sinon.stub(
      utilsModule,
      'meshAuthorizationStatusToAuthorizationStatus'
    );
    instruction = new Instruction({ id }, mockContext);
  });

  let addTransactionStub: sinon.SinonStub;

  beforeEach(() => {
    addTransactionStub = procedureMockUtils.getAddTransactionStub();
    mockContext = dsMockUtils.getContextInstance();
    numberToU64Stub.returns(rawInstructionId);
    portfolioIdToMeshPortfolioIdStub.returns(rawPortfolioId);
  });

  afterEach(() => {
    entityMockUtils.reset();
    procedureMockUtils.reset();
    dsMockUtils.reset();
  });

  afterAll(() => {
    entityMockUtils.cleanup();
    procedureMockUtils.cleanup();
    dsMockUtils.cleanup();
  });

  test('should throw an error if instruction is not in pending state', () => {
    entityMockUtils.configureMocks({
      instructionOptions: {
        details: {
          status: InstructionStatus.Unknown,
        } as InstructionDetails,
      },
    });

    const proc = procedureMockUtils.getInstance<Params, Instruction>(mockContext);

    return expect(
      prepareToggleInstructionAuthorization.call(proc, {
        id,
        authorize: true,
      })
    ).rejects.toThrow('The Instruction must be in pending state');
  });

  test('should throw an error if instruction is blocked', () => {
    entityMockUtils.configureMocks({
      instructionOptions: {
        details: {
          status: InstructionStatus.Pending,
          validFrom: new Date('12/12/2050'),
        } as InstructionDetails,
      },
    });

    const proc = procedureMockUtils.getInstance<Params, Instruction>(mockContext);

    return expect(
      prepareToggleInstructionAuthorization.call(proc, {
        id,
        authorize: true,
      })
    ).rejects.toThrow('The instruction in still blocked');
  });

  test('should throw an error if the instruction can not be modified', () => {
    entityMockUtils.configureMocks({
      instructionOptions: {
        details: {
          status: InstructionStatus.Pending,
          type: InstructionType.SettleOnBlock,
          endBlock: new BigNumber(10),
        } as InstructionDetails,
      },
    });

    const proc = procedureMockUtils.getInstance<Params, Instruction>(mockContext);

    return expect(
      prepareToggleInstructionAuthorization.call(proc, {
        id,
        authorize: true,
      })
    ).rejects.toThrow('The instruction can not be modified');
  });

  test('should throw an error if authorize is set to true and the instruction is already authorized', () => {
    entityMockUtils.configureMocks({
      instructionOptions: {
        details: {
          status: InstructionStatus.Pending,
          type: InstructionType.SettleOnBlock,
          endBlock: new BigNumber(1000),
        } as InstructionDetails,
      },
    });

    const rawAuthorizationStatus = dsMockUtils.createMockAuthorizationStatus('Authorized');
    dsMockUtils.createQueryStub('settlement', 'userAuths').resolves(rawAuthorizationStatus);
    meshAuthorizationStatusToAuthorizationStatusStub
      .withArgs(rawAuthorizationStatus)
      .returns(AuthorizationStatus.Authorized);

    const proc = procedureMockUtils.getInstance<Params, Instruction>(mockContext);

    return expect(
      prepareToggleInstructionAuthorization.call(proc, {
        id,
        authorize: true,
      })
    ).rejects.toThrow('The Instruction is already authorized');
  });

  test('should throw an error if authorize is set to false and the instruction is already unauthorized', () => {
    entityMockUtils.configureMocks({
      instructionOptions: {
        details: {
          status: InstructionStatus.Pending,
          type: InstructionType.SettleOnBlock,
          endBlock: new BigNumber(1000),
        } as InstructionDetails,
      },
    });

    const rawAuthorizationStatus = dsMockUtils.createMockAuthorizationStatus('Pending');
    dsMockUtils.createQueryStub('settlement', 'userAuths').resolves(rawAuthorizationStatus);
    meshAuthorizationStatusToAuthorizationStatusStub
      .withArgs(rawAuthorizationStatus)
      .returns(AuthorizationStatus.Pending);

    const proc = procedureMockUtils.getInstance<Params, Instruction>(mockContext);

    return expect(
      prepareToggleInstructionAuthorization.call(proc, {
        id,
        authorize: false,
      })
    ).rejects.toThrow('The Instruction is already unauthorized');
  });

  test('should add an authorize instruction transaction to the queue', async () => {
    entityMockUtils.configureMocks({
      instructionOptions: {
        details: {
          status: InstructionStatus.Pending,
        } as InstructionDetails,
      },
    });

    const rawAuthorizationStatus = dsMockUtils.createMockAuthorizationStatus('Pending');
    dsMockUtils.createQueryStub('settlement', 'userAuths').resolves(rawAuthorizationStatus);
    meshAuthorizationStatusToAuthorizationStatusStub
      .withArgs(rawAuthorizationStatus)
      .returns(AuthorizationStatus.Pending);

    const proc = procedureMockUtils.getInstance<Params, Instruction>(mockContext);

    const transaction = dsMockUtils.createTxStub('settlement', 'authorizeInstruction');

    const result = await prepareToggleInstructionAuthorization.call(proc, {
      id,
      authorize: true,
    });

    sinon.assert.calledWith(addTransactionStub, transaction, {}, rawInstructionId, [
      rawPortfolioId,
    ]);

    expect(instruction.id).toBe(result.id);
  });

  test('should add an unauthorize instruction transaction to the queue', async () => {
    entityMockUtils.configureMocks({
      instructionOptions: {
        details: {
          status: InstructionStatus.Pending,
          validFrom: new Date('12/12/2019'),
          type: InstructionType.SettleOnBlock,
          endBlock: new BigNumber(1000),
        } as InstructionDetails,
      },
    });

    const rawAuthorizationStatus = dsMockUtils.createMockAuthorizationStatus('Rejected');
    dsMockUtils.createQueryStub('settlement', 'userAuths').resolves(rawAuthorizationStatus);
    meshAuthorizationStatusToAuthorizationStatusStub
      .withArgs(rawAuthorizationStatus)
      .returns(AuthorizationStatus.Rejected);

    const proc = procedureMockUtils.getInstance<Params, Instruction>(mockContext);

    const transaction = dsMockUtils.createTxStub('settlement', 'unauthorizeInstruction');

    const result = await prepareToggleInstructionAuthorization.call(proc, {
      id,
      authorize: false,
    });

    sinon.assert.calledWith(addTransactionStub, transaction, {}, rawInstructionId, [
      rawPortfolioId,
    ]);

    expect(instruction.id).toBe(result.id);
  });
});
