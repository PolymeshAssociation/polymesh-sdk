import { u64 } from '@polkadot/types';
import BigNumber from 'bignumber.js';
import {
  AffirmationStatus as MeshAffirmationStatus,
  PortfolioId as MeshPortfolioId,
  TxTags,
} from 'polymesh-types/types';
import sinon from 'sinon';

import {
  getAuthorization,
  ModifyInstructionAffirmationParams,
  prepareModifyInstructionAffirmation,
  prepareStorage,
  Storage,
} from '~/api/procedures/modifyInstructionAffirmation';
import * as procedureUtilsModule from '~/api/procedures/utils';
import { Context, DefaultPortfolio, Instruction } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { AffirmationStatus, PortfolioLike } from '~/types';
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
  let portfolio: DefaultPortfolio;
  const portfolioId: PortfolioId = { did: 'someDid' };
  const latestBlock = new BigNumber(100);
  let mockContext: Mocked<Context>;
  let numberToU64Stub: sinon.SinonStub<[number | BigNumber, Context], u64>;
  let portfolioLikeToPortfolioIdStub: sinon.SinonStub<[PortfolioLike], PortfolioId>;
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

    portfolio = entityMockUtils.getDefaultPortfolioInstance({ did: 'someDid ' });
    numberToU64Stub = sinon.stub(utilsConversionModule, 'numberToU64');
    portfolioLikeToPortfolioIdStub = sinon.stub(
      utilsConversionModule,
      'portfolioLikeToPortfolioId'
    );
    portfolioIdToMeshPortfolioIdStub = sinon.stub(
      utilsConversionModule,
      'portfolioIdToMeshPortfolioId'
    );
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
    portfolioLikeToPortfolioIdStub.withArgs(portfolio).returns(portfolioId);
    portfolioIdToMeshPortfolioIdStub.withArgs(portfolioId, mockContext).returns(rawPortfolioId);
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

    const proc = procedureMockUtils.getInstance<
      ModifyInstructionAffirmationParams,
      Instruction,
      Storage
    >(mockContext, {
      portfolios: [portfolio, portfolio],
    });

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

    const proc = procedureMockUtils.getInstance<
      ModifyInstructionAffirmationParams,
      Instruction,
      Storage
    >(mockContext, { portfolios: [portfolio, portfolio] });

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

    const proc = procedureMockUtils.getInstance<
      ModifyInstructionAffirmationParams,
      Instruction,
      Storage
    >(mockContext, {
      portfolios: [portfolio, portfolio],
    });

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

    const proc = procedureMockUtils.getInstance<
      ModifyInstructionAffirmationParams,
      Instruction,
      Storage
    >(mockContext, {
      portfolios: [portfolio, portfolio],
    });

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

    const proc = procedureMockUtils.getInstance<
      ModifyInstructionAffirmationParams,
      Instruction,
      Storage
    >(mockContext, {
      portfolios: [portfolio, portfolio],
    });

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

    const proc = procedureMockUtils.getInstance<
      ModifyInstructionAffirmationParams,
      Instruction,
      Storage
    >(mockContext, {
      portfolios: [portfolio, portfolio],
    });

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
        getLegs: {
          data: [
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
          next: null,
        },
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

    const proc = procedureMockUtils.getInstance<
      ModifyInstructionAffirmationParams,
      Instruction,
      Storage
    >(mockContext, {
      portfolios: [portfolio, portfolio],
    });

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

  describe('getAuthorization', () => {
    test('should return the appropriate roles and permissions', async () => {
      const args = {
        id: new BigNumber(1),
        operation: InstructionAffirmationOperation.Affirm,
      };
      const from = entityMockUtils.getNumberedPortfolioInstance();
      const to = entityMockUtils.getDefaultPortfolioInstance();

      let proc = procedureMockUtils.getInstance<
        ModifyInstructionAffirmationParams,
        Instruction,
        Storage
      >(mockContext, {
        portfolios: [from, to],
      });
      let boundFunc = getAuthorization.bind(proc);

      let result = await boundFunc(args);

      expect(result).toEqual({
        signerPermissions: {
          tokens: [],
          portfolios: [from, to],
          transactions: [TxTags.settlement.AffirmInstruction],
        },
      });

      proc = procedureMockUtils.getInstance<
        ModifyInstructionAffirmationParams,
        Instruction,
        Storage
      >(mockContext, {
        portfolios: [],
      });

      boundFunc = getAuthorization.bind(proc);

      result = await boundFunc({ ...args, operation: InstructionAffirmationOperation.Reject });

      expect(result).toEqual({
        signerPermissions: {
          tokens: [],
          portfolios: [],
          transactions: [TxTags.settlement.RejectInstruction],
        },
      });

      result = await boundFunc({ ...args, operation: InstructionAffirmationOperation.Withdraw });

      expect(result).toEqual({
        signerPermissions: {
          tokens: [],
          portfolios: [],
          transactions: [TxTags.settlement.WithdrawAffirmation],
        },
      });
    });
  });

  describe('prepareStorage', () => {
    test('should return the portfolios for which to modify affirmation status', async () => {
      const proc = procedureMockUtils.getInstance<
        ModifyInstructionAffirmationParams,
        Instruction,
        Storage
      >(mockContext);
      const boundFunc = prepareStorage.bind(proc);

      let from = entityMockUtils.getNumberedPortfolioInstance({ isCustodiedBy: true });
      let to = entityMockUtils.getDefaultPortfolioInstance({ isCustodiedBy: true });
      const amount = new BigNumber(1);
      const token = entityMockUtils.getSecurityTokenInstance({ ticker: 'SOME_TOKEN' });

      entityMockUtils.configureMocks({
        instructionOptions: {
          getLegs: { data: [{ from, to, amount, token }], next: null },
        },
      });

      let result = await boundFunc({
        id: new BigNumber(1),
        operation: InstructionAffirmationOperation.Affirm,
      });

      expect(result).toEqual({
        portfolios: [from, to],
      });

      from = entityMockUtils.getNumberedPortfolioInstance({ isCustodiedBy: false });
      to = entityMockUtils.getDefaultPortfolioInstance({ isCustodiedBy: false });

      entityMockUtils
        .getInstructionGetLegsStub()
        .resolves({ data: [{ from, to, amount, token }], next: null });

      result = await boundFunc({
        id: new BigNumber(1),
        operation: InstructionAffirmationOperation.Affirm,
      });

      expect(result).toEqual({
        portfolios: [],
      });
    });
  });
});
