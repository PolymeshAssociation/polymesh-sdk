import { u64 } from '@polkadot/types';
import BigNumber from 'bignumber.js';
import {
  AuthorizationStatus as MeshAuthorizationStatus,
  PortfolioId as MeshPortfolioId,
} from 'polymesh-types/types';
import sinon from 'sinon';

import { Instruction } from '~/api/entities';
import {
  ModifyInstructionAuthorizationParams,
  prepareModifyInstructionAuthorization,
} from '~/api/procedures/modifyInstructionAuthorization';
import { Context } from '~/base';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { AuthorizationStatus } from '~/types';
import { InstructionAuthorizationOperation, PortfolioId } from '~/types/internal';
import * as utilsModule from '~/utils';

describe('modifyInstructionAuthorization procedure', () => {
  const id = new BigNumber(1);
  const rawInstructionId = dsMockUtils.createMockU64(1);
  const rawPortfolioId = dsMockUtils.createMockPortfolioId({
    did: dsMockUtils.createMockIdentityId('someDid'),
    kind: dsMockUtils.createMockPortfolioKind('Default'),
  });
  const latestBlock = new BigNumber(100);
  let mockContext: Mocked<Context>;
  let numberToU64Stub: sinon.SinonStub<[number | BigNumber, Context], u64>;
  let portfolioIdToMeshPortfolioIdStub: sinon.SinonStub<[PortfolioId, Context], MeshPortfolioId>;
  let meshAuthorizationStatusToAuthorizationStatusStub: sinon.SinonStub<
    [MeshAuthorizationStatus],
    AuthorizationStatus
  >;
  let instruction: Instruction;

  beforeAll(() => {
    dsMockUtils.initMocks({
      contextOptions: {
        latestBlock,
      },
    });
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

  test('should throw an error if operation is Authorize and the current status of the instruction is authorized', () => {
    const rawAuthorizationStatus = dsMockUtils.createMockAuthorizationStatus('Authorized');
    dsMockUtils.createQueryStub('settlement', 'userAuths').resolves(rawAuthorizationStatus);
    meshAuthorizationStatusToAuthorizationStatusStub
      .withArgs(rawAuthorizationStatus)
      .returns(AuthorizationStatus.Authorized);

    const proc = procedureMockUtils.getInstance<ModifyInstructionAuthorizationParams, Instruction>(
      mockContext
    );

    return expect(
      prepareModifyInstructionAuthorization.call(proc, {
        id,
        operation: InstructionAuthorizationOperation.Authorize,
      })
    ).rejects.toThrow('The Instruction is already authorized');
  });

  test('should add an authorize instruction transaction to the queue', async () => {
    const rawAuthorizationStatus = dsMockUtils.createMockAuthorizationStatus('Pending');
    dsMockUtils.createQueryStub('settlement', 'userAuths').resolves(rawAuthorizationStatus);
    meshAuthorizationStatusToAuthorizationStatusStub
      .withArgs(rawAuthorizationStatus)
      .returns(AuthorizationStatus.Pending);

    const proc = procedureMockUtils.getInstance<ModifyInstructionAuthorizationParams, Instruction>(
      mockContext
    );

    const transaction = dsMockUtils.createTxStub('settlement', 'authorizeInstruction');

    const result = await prepareModifyInstructionAuthorization.call(proc, {
      id,
      operation: InstructionAuthorizationOperation.Authorize,
    });

    sinon.assert.calledWith(addTransactionStub, transaction, {}, rawInstructionId, [
      rawPortfolioId,
    ]);

    expect(instruction.id).toEqual((result as Instruction).id);
  });

  test('should throw an error if operation is Unauthorize and the current status of the instruction is pending', () => {
    const rawAuthorizationStatus = dsMockUtils.createMockAuthorizationStatus('Pending');
    dsMockUtils.createQueryStub('settlement', 'userAuths').resolves(rawAuthorizationStatus);
    meshAuthorizationStatusToAuthorizationStatusStub
      .withArgs(rawAuthorizationStatus)
      .returns(AuthorizationStatus.Pending);

    const proc = procedureMockUtils.getInstance<ModifyInstructionAuthorizationParams, Instruction>(
      mockContext
    );

    return expect(
      prepareModifyInstructionAuthorization.call(proc, {
        id,
        operation: InstructionAuthorizationOperation.Unauthorize,
      })
    ).rejects.toThrow('The instruction is not authorized');
  });

  test('should throw an error if operation is Unauthorize and the current status of the instruction is rejected', () => {
    const rawAuthorizationStatus = dsMockUtils.createMockAuthorizationStatus('Rejected');
    dsMockUtils.createQueryStub('settlement', 'userAuths').resolves(rawAuthorizationStatus);
    meshAuthorizationStatusToAuthorizationStatusStub
      .withArgs(rawAuthorizationStatus)
      .returns(AuthorizationStatus.Rejected);

    const proc = procedureMockUtils.getInstance<ModifyInstructionAuthorizationParams, Instruction>(
      mockContext
    );

    return expect(
      prepareModifyInstructionAuthorization.call(proc, {
        id,
        operation: InstructionAuthorizationOperation.Unauthorize,
      })
    ).rejects.toThrow('The instruction is not authorized');
  });

  test('should add an unauthorize instruction transaction to the queue', async () => {
    const rawAuthorizationStatus = dsMockUtils.createMockAuthorizationStatus('Authorized');
    dsMockUtils.createQueryStub('settlement', 'userAuths').resolves(rawAuthorizationStatus);
    meshAuthorizationStatusToAuthorizationStatusStub
      .withArgs(rawAuthorizationStatus)
      .returns(AuthorizationStatus.Authorized);

    const proc = procedureMockUtils.getInstance<ModifyInstructionAuthorizationParams, Instruction>(
      mockContext
    );

    const transaction = dsMockUtils.createTxStub('settlement', 'unauthorizeInstruction');

    const result = await prepareModifyInstructionAuthorization.call(proc, {
      id,
      operation: InstructionAuthorizationOperation.Unauthorize,
    });

    sinon.assert.calledWith(addTransactionStub, transaction, {}, rawInstructionId, [
      rawPortfolioId,
    ]);

    expect(instruction.id).toEqual((result as Instruction).id);
  });

  test('should throw an error if operation is Reject and the current status of the instruction is rejected', () => {
    const rawAuthorizationStatus = dsMockUtils.createMockAuthorizationStatus('Rejected');
    dsMockUtils.createQueryStub('settlement', 'userAuths').resolves(rawAuthorizationStatus);
    meshAuthorizationStatusToAuthorizationStatusStub
      .withArgs(rawAuthorizationStatus)
      .returns(AuthorizationStatus.Rejected);

    const proc = procedureMockUtils.getInstance<ModifyInstructionAuthorizationParams, Instruction>(
      mockContext
    );

    return expect(
      prepareModifyInstructionAuthorization.call(proc, {
        id,
        operation: InstructionAuthorizationOperation.Reject,
      })
    ).rejects.toThrow('The instruction cannot be rejected');
  });

  test('should add an reject instruction transaction to the queue', async () => {
    const rawAuthorizationStatus = dsMockUtils.createMockAuthorizationStatus('Pending');
    dsMockUtils.createQueryStub('settlement', 'userAuths').resolves(rawAuthorizationStatus);
    meshAuthorizationStatusToAuthorizationStatusStub
      .withArgs(rawAuthorizationStatus)
      .returns(AuthorizationStatus.Pending);

    const proc = procedureMockUtils.getInstance<ModifyInstructionAuthorizationParams, Instruction>(
      mockContext
    );

    const transaction = dsMockUtils.createTxStub('settlement', 'rejectInstruction');

    const result = await prepareModifyInstructionAuthorization.call(proc, {
      id,
      operation: InstructionAuthorizationOperation.Reject,
    });

    sinon.assert.calledWith(addTransactionStub, transaction, {}, rawInstructionId, [
      rawPortfolioId,
    ]);

    expect(instruction.id).toEqual((result as Instruction).id);
  });
});
