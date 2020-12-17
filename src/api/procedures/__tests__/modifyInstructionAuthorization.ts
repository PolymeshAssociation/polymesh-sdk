import { u64 } from '@polkadot/types';
import BigNumber from 'bignumber.js';
import {
  AffirmationStatus as MeshAffirmationStatus,
  PortfolioId as MeshPortfolioId,
} from 'polymesh-types/types';
import sinon from 'sinon';

import {
  ModifyInstructionAffirmationParams,
  prepareModifyInstructionAffirmation,
} from '~/api/procedures/modifyInstructionAffirmation';
import * as procedureUtilsModule from '~/api/procedures/utils';
import { Context, DefaultPortfolio, Instruction } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { AffirmationStatus } from '~/types';
import { InstructionAffirmationOperation, PortfolioId } from '~/types/internal';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Instruction',
  require('~/testUtils/mocks/entities').mockInstructionModule('~/api/entities/Instruction')
);
jest.mock(
  '~/api/entities/DefaultPortfolio',
  require('~/testUtils/mocks/entities').mockDefaultPortfolioModule(
    '~/api/entities/DefaultPortfolio'
  )
);

describe('modifyInstructionAffirmation procedure', () => {
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
  let meshAffirmationStatusToAffirmationStatusStub: sinon.SinonStub<
    [MeshAffirmationStatus],
    AffirmationStatus
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
    meshAffirmationStatusToAffirmationStatusStub = sinon.stub(
      utilsConversionModule,
      'meshAffirmationStatusToAffirmationStatus'
    );

    sinon.stub(procedureUtilsModule, 'assertInstructionValid');
  });

  let addTransactionStub: sinon.SinonStub;

  beforeEach(() => {
    dsMockUtils.createTxStub('settlement', 'affirmInstruction');
    dsMockUtils.createTxStub('settlement', 'withdrawAffirmation');
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

  test("should throw an error if the operation is Affirm and all of the current Identity's Portfolios are affirmed", () => {
    const rawAffirmationStatus = dsMockUtils.createMockAffirmationStatus('Affirmed');
    dsMockUtils.createQueryStub('settlement', 'userAffirmations', {
      multi: [rawAffirmationStatus, rawAffirmationStatus],
    });
    meshAffirmationStatusToAffirmationStatusStub
      .withArgs(rawAffirmationStatus)
      .returns(AffirmationStatus.Affirmed);

    const proc = procedureMockUtils.getInstance<ModifyInstructionAffirmationParams, Instruction>(
      mockContext
    );

    return expect(
      prepareModifyInstructionAffirmation.call(proc, {
        id,
        operation: InstructionAffirmationOperation.Affirm,
      })
    ).rejects.toThrow('The Instruction is already affirmed');
  });

  test('should add an affirm instruction transaction to the queue', async () => {
    const rawAffirmationStatus = dsMockUtils.createMockAffirmationStatus('Pending');
    dsMockUtils.createQueryStub('settlement', 'userAffirmations', {
      multi: [rawAffirmationStatus, rawAffirmationStatus],
    });
    meshAffirmationStatusToAffirmationStatusStub
      .withArgs(rawAffirmationStatus)
      .returns(AffirmationStatus.Pending);

    const proc = procedureMockUtils.getInstance<ModifyInstructionAffirmationParams, Instruction>(
      mockContext
    );

    const transaction = dsMockUtils.createTxStub('settlement', 'affirmInstruction');

    const result = await prepareModifyInstructionAffirmation.call(proc, {
      id,
      operation: InstructionAffirmationOperation.Affirm,
    });

    sinon.assert.calledWith(addTransactionStub, transaction, {}, rawInstructionId, [
      rawPortfolioId,
      rawPortfolioId,
    ]);

    expect(result.id).toEqual(id);
  });

  test('should throw an error if operation is Withdraw and the current status of the instruction is pending', () => {
    const rawAffirmationStatus = dsMockUtils.createMockAffirmationStatus('Pending');
    dsMockUtils.createQueryStub('settlement', 'userAffirmations', {
      multi: [rawAffirmationStatus, rawAffirmationStatus],
    });
    meshAffirmationStatusToAffirmationStatusStub
      .withArgs(rawAffirmationStatus)
      .returns(AffirmationStatus.Pending);

    const proc = procedureMockUtils.getInstance<ModifyInstructionAffirmationParams, Instruction>(
      mockContext
    );

    return expect(
      prepareModifyInstructionAffirmation.call(proc, {
        id,
        operation: InstructionAffirmationOperation.Withdraw,
      })
    ).rejects.toThrow('The instruction is not affirmed');
  });

  test('should throw an error if operation is Withdraw and the current status of the instruction is rejected', () => {
    const rawAffirmationStatus = dsMockUtils.createMockAffirmationStatus('Rejected');
    dsMockUtils.createQueryStub('settlement', 'userAffirmations', {
      multi: [rawAffirmationStatus, rawAffirmationStatus],
    });
    meshAffirmationStatusToAffirmationStatusStub
      .withArgs(rawAffirmationStatus)
      .returns(AffirmationStatus.Rejected);

    const proc = procedureMockUtils.getInstance<ModifyInstructionAffirmationParams, Instruction>(
      mockContext
    );

    return expect(
      prepareModifyInstructionAffirmation.call(proc, {
        id,
        operation: InstructionAffirmationOperation.Withdraw,
      })
    ).rejects.toThrow('The instruction is not affirmed');
  });

  test('should add a withdraw instruction transaction to the queue', async () => {
    const rawAffirmationStatus = dsMockUtils.createMockAffirmationStatus('Affirmed');
    dsMockUtils.createQueryStub('settlement', 'userAffirmations', {
      multi: [rawAffirmationStatus, rawAffirmationStatus],
    });
    meshAffirmationStatusToAffirmationStatusStub
      .withArgs(rawAffirmationStatus)
      .returns(AffirmationStatus.Affirmed);

    const proc = procedureMockUtils.getInstance<ModifyInstructionAffirmationParams, Instruction>(
      mockContext
    );

    const transaction = dsMockUtils.createTxStub('settlement', 'withdrawAffirmation');

    const result = await prepareModifyInstructionAffirmation.call(proc, {
      id,
      operation: InstructionAffirmationOperation.Withdraw,
    });

    sinon.assert.calledWith(addTransactionStub, transaction, {}, rawInstructionId, [
      rawPortfolioId,
      rawPortfolioId,
    ]);

    expect(result.id).toEqual(id);
  });

  test('should throw an error if operation is Reject and the current status of the instruction is rejected', () => {
    const rawAffirmationStatus = dsMockUtils.createMockAffirmationStatus('Rejected');
    dsMockUtils.createQueryStub('settlement', 'userAffirmations', {
      multi: [rawAffirmationStatus, rawAffirmationStatus],
    });
    meshAffirmationStatusToAffirmationStatusStub
      .withArgs(rawAffirmationStatus)
      .returns(AffirmationStatus.Rejected);

    const proc = procedureMockUtils.getInstance<ModifyInstructionAffirmationParams, Instruction>(
      mockContext
    );

    return expect(
      prepareModifyInstructionAffirmation.call(proc, {
        id,
        operation: InstructionAffirmationOperation.Reject,
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
    const rawAffirmationStatus = dsMockUtils.createMockAffirmationStatus('Pending');
    dsMockUtils.createQueryStub('settlement', 'userAffirmations', {
      multi: [rawAffirmationStatus, rawAffirmationStatus],
    });
    meshAffirmationStatusToAffirmationStatusStub
      .withArgs(rawAffirmationStatus)
      .returns(AffirmationStatus.Pending);

    const isCustodiedByStub = entityMockUtils.getDefaultPortfolioIsCustodiedByStub();
    isCustodiedByStub.onCall(0).returns(true);
    isCustodiedByStub.onCall(1).returns(true);
    isCustodiedByStub.onCall(2).returns(false);
    isCustodiedByStub.onCall(3).returns(false);

    const proc = procedureMockUtils.getInstance<ModifyInstructionAffirmationParams, Instruction>(
      mockContext
    );

    const transaction = dsMockUtils.createTxStub('settlement', 'rejectInstruction');

    const result = await prepareModifyInstructionAffirmation.call(proc, {
      id,
      operation: InstructionAffirmationOperation.Reject,
    });

    sinon.assert.calledWith(addTransactionStub, transaction, {}, rawInstructionId, [
      rawPortfolioId,
      rawPortfolioId,
    ]);

    expect(result.id).toEqual(id);
  });
});
