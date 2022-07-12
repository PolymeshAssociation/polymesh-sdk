import { u32, u64 } from '@polkadot/types';
import BigNumber from 'bignumber.js';
import {
  AffirmationStatus as MeshAffirmationStatus,
  PortfolioId as MeshPortfolioId,
} from 'polymesh-types/types';
import sinon from 'sinon';

import {
  getAuthorization,
  prepareModifyInstructionAffirmation,
  prepareStorage,
  Storage,
} from '~/api/procedures/modifyInstructionAffirmation';
import * as procedureUtilsModule from '~/api/procedures/utils';
import { Context, DefaultPortfolio, Instruction } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import {
  AffirmationStatus,
  InstructionAffirmationOperation,
  ModifyInstructionAffirmationParams,
  PortfolioId,
  PortfolioLike,
  TxTags,
} from '~/types';
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
  const rawInstructionId = dsMockUtils.createMockU64(new BigNumber(1));
  const rawPortfolioId = dsMockUtils.createMockPortfolioId({
    did: dsMockUtils.createMockIdentityId('someDid'),
    kind: dsMockUtils.createMockPortfolioKind('Default'),
  });
  const did = 'someDid';
  let portfolio: DefaultPortfolio;
  let legAmount: BigNumber;
  let rawLegAmount: u32;
  const portfolioId: PortfolioId = { did };
  const latestBlock = new BigNumber(100);
  let mockContext: Mocked<Context>;
  let bigNumberToU64Stub: sinon.SinonStub<[BigNumber, Context], u64>;
  let bigNumberToU32Stub: sinon.SinonStub<[BigNumber, Context], u32>;
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
    legAmount = new BigNumber(2);
    bigNumberToU64Stub = sinon.stub(utilsConversionModule, 'bigNumberToU64');
    bigNumberToU32Stub = sinon.stub(utilsConversionModule, 'bigNumberToU32');
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
    rawLegAmount = dsMockUtils.createMockU32(new BigNumber(2));
    dsMockUtils.createTxStub('settlement', 'affirmInstruction');
    dsMockUtils.createTxStub('settlement', 'withdrawAffirmation');
    dsMockUtils.createTxStub('settlement', 'rejectInstruction');
    addTransactionStub = procedureMockUtils.getAddTransactionStub();
    mockContext = dsMockUtils.getContextInstance();
    bigNumberToU64Stub.returns(rawInstructionId);
    bigNumberToU32Stub.returns(rawLegAmount);
    portfolioLikeToPortfolioIdStub.withArgs(portfolio).returns(portfolioId);
    portfolioIdToMeshPortfolioIdStub.withArgs(portfolioId, mockContext).returns(rawPortfolioId);
  });

  afterEach(() => {
    entityMockUtils.reset();
    procedureMockUtils.reset();
    dsMockUtils.reset();
  });

  afterAll(() => {
    procedureMockUtils.cleanup();
    dsMockUtils.cleanup();
  });

  it('should throw an error if the signing Identity is not the custodian of any of the involved portfolios', () => {
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
      portfolios: [],
      senderLegAmount: legAmount,
      totalLegAmount: legAmount,
    });

    return expect(
      prepareModifyInstructionAffirmation.call(proc, {
        id,
        operation: InstructionAffirmationOperation.Affirm,
      })
    ).rejects.toThrow('The signing Identity is not involved in this Instruction');
  });

  it("should throw an error if the operation is Affirm and all of the signing Identity's Portfolios are affirmed", () => {
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
      senderLegAmount: legAmount,
      totalLegAmount: legAmount,
    });

    return expect(
      prepareModifyInstructionAffirmation.call(proc, {
        id,
        operation: InstructionAffirmationOperation.Affirm,
      })
    ).rejects.toThrow('The Instruction is already affirmed');
  });

  it('should add an affirm instruction transaction to the queue', async () => {
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
      senderLegAmount: legAmount,
      totalLegAmount: legAmount,
    });

    const transaction = dsMockUtils.createTxStub('settlement', 'affirmInstruction');

    const result = await prepareModifyInstructionAffirmation.call(proc, {
      id,
      operation: InstructionAffirmationOperation.Affirm,
    });

    sinon.assert.calledWith(addTransactionStub, {
      transaction,
      feeMultiplier: new BigNumber(2),
      args: [rawInstructionId, [rawPortfolioId, rawPortfolioId], rawLegAmount],
    });

    expect(result.id).toEqual(id);
  });

  it('should throw an error if operation is Withdraw and the current status of the instruction is pending', () => {
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
      senderLegAmount: legAmount,
      totalLegAmount: legAmount,
    });

    return expect(
      prepareModifyInstructionAffirmation.call(proc, {
        id,
        operation: InstructionAffirmationOperation.Withdraw,
      })
    ).rejects.toThrow('The instruction is not affirmed');
  });

  it('should add a withdraw instruction transaction to the queue', async () => {
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
      senderLegAmount: legAmount,
      totalLegAmount: legAmount,
    });

    const transaction = dsMockUtils.createTxStub('settlement', 'withdrawAffirmation');

    const result = await prepareModifyInstructionAffirmation.call(proc, {
      id,
      operation: InstructionAffirmationOperation.Withdraw,
    });

    sinon.assert.calledWith(addTransactionStub, {
      transaction,
      feeMultiplier: new BigNumber(2),
      args: [rawInstructionId, [rawPortfolioId, rawPortfolioId], rawLegAmount],
    });

    expect(result.id).toEqual(id);
  });

  it('should add a reject instruction transaction to the queue', async () => {
    const rawAffirmationStatus = dsMockUtils.createMockAffirmationStatus('Pending');
    dsMockUtils.createQueryStub('settlement', 'userAffirmations', {
      multi: [rawAffirmationStatus, rawAffirmationStatus],
    });
    meshAffirmationStatusToAffirmationStatusStub
      .withArgs(rawAffirmationStatus)
      .returns(AffirmationStatus.Pending);

    const isCustodiedByStub = sinon.stub();
    isCustodiedByStub.onCall(0).returns(true);
    isCustodiedByStub.onCall(1).returns(true);
    isCustodiedByStub.onCall(2).returns(false);
    isCustodiedByStub.onCall(3).returns(false);

    entityMockUtils.configureMocks({
      defaultPortfolioOptions: {
        isCustodiedBy: isCustodiedByStub,
      },
    });

    const proc = procedureMockUtils.getInstance<
      ModifyInstructionAffirmationParams,
      Instruction,
      Storage
    >(mockContext, {
      portfolios: [portfolio, portfolio],
      senderLegAmount: legAmount,
      totalLegAmount: legAmount,
    });

    const transaction = dsMockUtils.createTxStub('settlement', 'rejectInstruction');

    const result = await prepareModifyInstructionAffirmation.call(proc, {
      id,
      operation: InstructionAffirmationOperation.Reject,
    });

    sinon.assert.calledWith(addTransactionStub, {
      transaction,
      feeMultiplier: new BigNumber(2),
      args: [rawInstructionId, rawPortfolioId, rawLegAmount],
    });

    expect(result.id).toEqual(id);
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', async () => {
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
        senderLegAmount: legAmount,
        totalLegAmount: legAmount,
      });
      let boundFunc = getAuthorization.bind(proc);

      let result = await boundFunc(args);

      expect(result).toEqual({
        permissions: {
          assets: [],
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
        senderLegAmount: legAmount,
        totalLegAmount: legAmount,
      });

      boundFunc = getAuthorization.bind(proc);

      result = await boundFunc({ ...args, operation: InstructionAffirmationOperation.Reject });

      expect(result).toEqual({
        permissions: {
          assets: [],
          portfolios: [],
          transactions: [TxTags.settlement.RejectInstruction],
        },
      });

      result = await boundFunc({ ...args, operation: InstructionAffirmationOperation.Withdraw });

      expect(result).toEqual({
        permissions: {
          assets: [],
          portfolios: [],
          transactions: [TxTags.settlement.WithdrawAffirmation],
        },
      });
    });
  });

  describe('prepareStorage', () => {
    it('should return the portfolios for which to modify affirmation status', async () => {
      const proc = procedureMockUtils.getInstance<
        ModifyInstructionAffirmationParams,
        Instruction,
        Storage
      >(mockContext);
      const boundFunc = prepareStorage.bind(proc);

      const fromDid = 'fromDid';
      const toDid = 'toDid';

      let from = entityMockUtils.getDefaultPortfolioInstance({ did: fromDid, isCustodiedBy: true });
      let to = entityMockUtils.getDefaultPortfolioInstance({ did: toDid, isCustodiedBy: true });
      const amount = new BigNumber(1);
      const asset = entityMockUtils.getAssetInstance({ ticker: 'SOME_ASSET' });

      entityMockUtils.configureMocks({
        instructionOptions: {
          getLegs: { data: [{ from, to, amount, asset }], next: null },
        },
      });

      let result = await boundFunc({
        id: new BigNumber(1),
        operation: InstructionAffirmationOperation.Affirm,
      });

      expect(result).toEqual({
        portfolios: [
          expect.objectContaining({ owner: expect.objectContaining({ did: fromDid }) }),
          expect.objectContaining({ owner: expect.objectContaining({ did: toDid }) }),
        ],
        senderLegAmount: new BigNumber(1),
        totalLegAmount: new BigNumber(1),
      });

      from = entityMockUtils.getDefaultPortfolioInstance({ did: fromDid, isCustodiedBy: false });
      to = entityMockUtils.getDefaultPortfolioInstance({ did: toDid, isCustodiedBy: false });

      entityMockUtils.configureMocks({
        instructionOptions: {
          getLegs: { data: [{ from, to, amount, asset }], next: null },
        },
      });

      result = await boundFunc({
        id: new BigNumber(1),
        operation: InstructionAffirmationOperation.Affirm,
      });

      expect(result).toEqual({
        portfolios: [],
        senderLegAmount: new BigNumber(0),
        totalLegAmount: new BigNumber(1),
      });
    });
  });
});
