import { u64 } from '@polkadot/types';
import BigNumber from 'bignumber.js';
import {
  AuthorizationStatus as MeshAuthorizationStatus,
  PortfolioId as MeshPortfolioId,
} from 'polymesh-types/types';
import sinon from 'sinon';

import { DefaultPortfolio, Instruction } from '~/api/entities';
import {
  ModifyInstructionAuthorizationParams,
  prepareModifyInstructionAuthorization,
} from '~/api/procedures/modifyInstructionAuthorization';
import * as procedureUtilsModule from '~/api/procedures/utils';
import { Context } from '~/base';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { AuthorizationStatus } from '~/types';
import { InstructionAuthorizationOperation, PortfolioId } from '~/types/internal';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Instruction',
  require('~/testUtils/mocks/entities').mockInstructionModule('~/api/entities/Instruction')
);

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

  beforeAll(() => {
    dsMockUtils.initMocks({
      contextOptions: {
        latestBlock,
      },
    });
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    numberToU64Stub = sinon.stub(utilsConversionModule, 'numberToU64');
    portfolioIdToMeshPortfolioIdStub = sinon.stub(
      utilsConversionModule,
      'portfolioIdToMeshPortfolioId'
    );
    sinon.stub(utilsConversionModule, 'portfolioLikeToPortfolioId');
    meshAuthorizationStatusToAuthorizationStatusStub = sinon.stub(
      utilsConversionModule,
      'meshAuthorizationStatusToAuthorizationStatus'
    );

    sinon.stub(procedureUtilsModule, 'assertInstructionValid');
  });

  let addTransactionStub: sinon.SinonStub;

  beforeEach(() => {
    dsMockUtils.createTxStub('settlement', 'authorizeInstruction');
    dsMockUtils.createTxStub('settlement', 'unauthorizeInstruction');
    dsMockUtils.createTxStub('settlement', 'rejectInstruction');
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

  test("should throw an error if the operation is Authorize and all of the current Identity's Portfolios are authorized", () => {
    const rawAuthorizationStatus = dsMockUtils.createMockAuthorizationStatus('Authorized');
    dsMockUtils.createQueryStub('settlement', 'userAuths', {
      multi: [rawAuthorizationStatus, rawAuthorizationStatus],
    });
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
    dsMockUtils.createQueryStub('settlement', 'userAuths', {
      multi: [rawAuthorizationStatus, rawAuthorizationStatus],
    });
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
      rawPortfolioId,
    ]);

    expect(result.id).toEqual(id);
  });

  test('should throw an error if operation is Unauthorize and the current status of the instruction is pending', () => {
    const rawAuthorizationStatus = dsMockUtils.createMockAuthorizationStatus('Pending');
    dsMockUtils.createQueryStub('settlement', 'userAuths', {
      multi: [rawAuthorizationStatus, rawAuthorizationStatus],
    });
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
    dsMockUtils.createQueryStub('settlement', 'userAuths', {
      multi: [rawAuthorizationStatus, rawAuthorizationStatus],
    });
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
    dsMockUtils.createQueryStub('settlement', 'userAuths', {
      multi: [rawAuthorizationStatus, rawAuthorizationStatus],
    });
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
      rawPortfolioId,
    ]);

    expect(result.id).toEqual(id);
  });

  test('should throw an error if operation is Reject and the current status of the instruction is rejected', () => {
    const rawAuthorizationStatus = dsMockUtils.createMockAuthorizationStatus('Rejected');
    dsMockUtils.createQueryStub('settlement', 'userAuths', {
      multi: [rawAuthorizationStatus, rawAuthorizationStatus],
    });
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
    ).rejects.toThrow('The Instruction cannot be rejected');
  });

  test('should add an reject instruction transaction to the queue', async () => {
    const currentDid = (await mockContext.getCurrentIdentity()).did;
    entityMockUtils.configureMocks({
      instructionOptions: {
        getLegs: [
          {
            from: new DefaultPortfolio({ did: 'notTheCurrentIdentity' }, mockContext),
            to: new DefaultPortfolio({ did: currentDid }, mockContext),
            token: entityMockUtils.getSecurityTokenInstance(),
            amount: new BigNumber(100),
          },
          {
            from: new DefaultPortfolio({ did: currentDid }, mockContext),
            to: new DefaultPortfolio({ did: 'notTheCurrentIdentity' }, mockContext),
            token: entityMockUtils.getSecurityTokenInstance(),
            amount: new BigNumber(200),
          },
        ],
      },
    });
    const rawAuthorizationStatus = dsMockUtils.createMockAuthorizationStatus('Pending');
    dsMockUtils.createQueryStub('settlement', 'userAuths', {
      multi: [rawAuthorizationStatus, rawAuthorizationStatus],
    });
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
      rawPortfolioId,
    ]);

    expect(result.id).toEqual(id);
  });
});
