import { u64 } from '@polkadot/types';
import BigNumber from 'bignumber.js';
import {
  AuthorizationStatus as MeshAuthorizationStatus,
  PortfolioId as MeshPortfolioId,
} from 'polymesh-types/types';
import sinon from 'sinon';

import { Params, prepareRejectInstruction } from '~/api/procedures/rejectInstruction';
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

describe('rejectInstruction procedure', () => {
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

    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    return expect(
      prepareRejectInstruction.call(proc, {
        id,
      })
    ).rejects.toThrow('The Instruction must be in pending state');
  });

  test('should throw an error if instruction is blocked', async () => {
    const validFrom = new Date('12/12/2050');

    entityMockUtils.configureMocks({
      instructionOptions: {
        details: {
          status: InstructionStatus.Pending,
          validFrom,
        } as InstructionDetails,
      },
    });

    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    let error;

    try {
      await prepareRejectInstruction.call(proc, {
        id,
      });
    } catch (err) {
      error = err;
    }

    expect(error.message).toBe('The instruction has not reached its validity period');
    expect(error.data.validFrom).toBe(validFrom);
  });

  test('should throw an error if the instruction can not be modified', async () => {
    const endBlock = new BigNumber(10);

    entityMockUtils.configureMocks({
      instructionOptions: {
        details: {
          status: InstructionStatus.Pending,
          type: InstructionType.SettleOnBlock,
          endBlock,
        } as InstructionDetails,
      },
    });

    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    let error;

    try {
      await prepareRejectInstruction.call(proc, {
        id,
      });
    } catch (err) {
      error = err;
    }

    expect(error.message).toBe(
      'The instruction cannot be modified; it has already reached its end block'
    );
    expect(error.data.endBlock).toBe(endBlock);
  });

  test('should throw an error if authorization status is rejected', () => {
    entityMockUtils.configureMocks({
      instructionOptions: {
        details: {
          status: InstructionStatus.Pending,
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

    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    return expect(
      prepareRejectInstruction.call(proc, {
        id,
      })
    ).rejects.toThrow('The instruction cannot be rejected');
  });

  test('should add an reject instruction transaction to the queue', async () => {
    entityMockUtils.configureMocks({
      instructionOptions: {
        details: {
          status: InstructionStatus.Pending,
          validFrom: new Date('10/10/2019'),
        } as InstructionDetails,
      },
    });

    const rawAuthorizationStatus = dsMockUtils.createMockAuthorizationStatus('Pending');
    dsMockUtils.createQueryStub('settlement', 'userAuths').resolves(rawAuthorizationStatus);
    meshAuthorizationStatusToAuthorizationStatusStub
      .withArgs(rawAuthorizationStatus)
      .returns(AuthorizationStatus.Pending);

    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    const transaction = dsMockUtils.createTxStub('settlement', 'rejectInstruction');

    await prepareRejectInstruction.call(proc, {
      id,
    });

    sinon.assert.calledWith(addTransactionStub, transaction, {}, rawInstructionId, [
      rawPortfolioId,
    ]);
  });
});
