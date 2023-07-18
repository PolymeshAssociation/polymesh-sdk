import { u32, u64 } from '@polkadot/types';
import {
  PalletSettlementAffirmationStatus,
  PolymeshPrimitivesIdentityIdPortfolioId,
} from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

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
  let bigNumberToU64Spy: jest.SpyInstance<u64, [BigNumber, Context]>;
  let bigNumberToU32Spy: jest.SpyInstance<u32, [BigNumber, Context]>;
  let portfolioLikeToPortfolioIdSpy: jest.SpyInstance<PortfolioId, [PortfolioLike]>;
  let portfolioIdToMeshPortfolioIdSpy: jest.SpyInstance<
    PolymeshPrimitivesIdentityIdPortfolioId,
    [PortfolioId, Context]
  >;
  let meshAffirmationStatusToAffirmationStatusSpy: jest.SpyInstance<
    AffirmationStatus,
    [PalletSettlementAffirmationStatus]
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
    bigNumberToU64Spy = jest.spyOn(utilsConversionModule, 'bigNumberToU64');
    bigNumberToU32Spy = jest.spyOn(utilsConversionModule, 'bigNumberToU32');
    portfolioLikeToPortfolioIdSpy = jest.spyOn(utilsConversionModule, 'portfolioLikeToPortfolioId');
    portfolioIdToMeshPortfolioIdSpy = jest.spyOn(
      utilsConversionModule,
      'portfolioIdToMeshPortfolioId'
    );
    meshAffirmationStatusToAffirmationStatusSpy = jest.spyOn(
      utilsConversionModule,
      'meshAffirmationStatusToAffirmationStatus'
    );

    jest.spyOn(procedureUtilsModule, 'assertInstructionValid').mockImplementation();
  });

  beforeEach(() => {
    rawLegAmount = dsMockUtils.createMockU32(new BigNumber(2));
    dsMockUtils.createTxMock('settlement', 'affirmInstruction');
    dsMockUtils.createTxMock('settlement', 'withdrawAffirmation');
    dsMockUtils.createTxMock('settlement', 'rejectInstruction');
    mockContext = dsMockUtils.getContextInstance();
    bigNumberToU64Spy.mockReturnValue(rawInstructionId);
    bigNumberToU32Spy.mockReturnValue(rawLegAmount);
    when(portfolioLikeToPortfolioIdSpy).calledWith(portfolio).mockReturnValue(portfolioId);
    when(portfolioIdToMeshPortfolioIdSpy)
      .calledWith(portfolioId, mockContext)
      .mockReturnValue(rawPortfolioId);
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

  it('should throw an error if the one or more portfolio params are not a part of the Instruction', () => {
    const proc = procedureMockUtils.getInstance<
      ModifyInstructionAffirmationParams,
      Instruction,
      Storage
    >(mockContext, {
      portfolios: [],
      portfolioParams: ['someDid'],
      senderLegAmount: legAmount,
      totalLegAmount: legAmount,
    });

    return expect(
      prepareModifyInstructionAffirmation.call(proc, {
        id,
        operation: InstructionAffirmationOperation.Affirm,
      })
    ).rejects.toThrow('Some of the portfolios are not a involved in this instruction');
  });

  it('should throw an error if the signing Identity is not the custodian of any of the involved portfolios', () => {
    const rawAffirmationStatus = dsMockUtils.createMockAffirmationStatus('Affirmed');
    dsMockUtils.createQueryMock('settlement', 'userAffirmations', {
      multi: [rawAffirmationStatus, rawAffirmationStatus],
    });
    when(meshAffirmationStatusToAffirmationStatusSpy)
      .calledWith(rawAffirmationStatus)
      .mockReturnValue(AffirmationStatus.Affirmed);

    const proc = procedureMockUtils.getInstance<
      ModifyInstructionAffirmationParams,
      Instruction,
      Storage
    >(mockContext, {
      portfolios: [],
      portfolioParams: [],
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
    dsMockUtils.createQueryMock('settlement', 'userAffirmations', {
      multi: [rawAffirmationStatus, rawAffirmationStatus],
    });
    when(meshAffirmationStatusToAffirmationStatusSpy)
      .calledWith(rawAffirmationStatus)
      .mockReturnValue(AffirmationStatus.Affirmed);

    const proc = procedureMockUtils.getInstance<
      ModifyInstructionAffirmationParams,
      Instruction,
      Storage
    >(mockContext, {
      portfolios: [portfolio, portfolio],
      portfolioParams: [],
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

  it('should return an affirm instruction transaction spec', async () => {
    const rawAffirmationStatus = dsMockUtils.createMockAffirmationStatus('Pending');
    dsMockUtils.createQueryMock('settlement', 'userAffirmations', {
      multi: [rawAffirmationStatus, rawAffirmationStatus],
    });
    when(meshAffirmationStatusToAffirmationStatusSpy)
      .calledWith(rawAffirmationStatus)
      .mockReturnValue(AffirmationStatus.Pending);

    const proc = procedureMockUtils.getInstance<
      ModifyInstructionAffirmationParams,
      Instruction,
      Storage
    >(mockContext, {
      portfolios: [portfolio, portfolio],
      portfolioParams: [],
      senderLegAmount: legAmount,
      totalLegAmount: legAmount,
    });

    const transaction = dsMockUtils.createTxMock('settlement', 'affirmInstruction');

    const result = await prepareModifyInstructionAffirmation.call(proc, {
      id,
      operation: InstructionAffirmationOperation.Affirm,
    });

    expect(result).toEqual({
      transaction,
      feeMultiplier: new BigNumber(2),
      args: [rawInstructionId, [rawPortfolioId, rawPortfolioId], rawLegAmount],
      resolver: expect.objectContaining({ id }),
    });
  });

  it('should throw an error if operation is Withdraw and the current status of the instruction is pending', () => {
    const rawAffirmationStatus = dsMockUtils.createMockAffirmationStatus('Pending');
    dsMockUtils.createQueryMock('settlement', 'userAffirmations', {
      multi: [rawAffirmationStatus, rawAffirmationStatus],
    });
    when(meshAffirmationStatusToAffirmationStatusSpy)
      .calledWith(rawAffirmationStatus)
      .mockReturnValue(AffirmationStatus.Pending);

    const proc = procedureMockUtils.getInstance<
      ModifyInstructionAffirmationParams,
      Instruction,
      Storage
    >(mockContext, {
      portfolios: [portfolio, portfolio],
      portfolioParams: [],
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

  it('should return a withdraw instruction transaction spec', async () => {
    const rawAffirmationStatus = dsMockUtils.createMockAffirmationStatus('Affirmed');
    dsMockUtils.createQueryMock('settlement', 'userAffirmations', {
      multi: [rawAffirmationStatus, rawAffirmationStatus],
    });
    when(meshAffirmationStatusToAffirmationStatusSpy)
      .calledWith(rawAffirmationStatus)
      .mockReturnValue(AffirmationStatus.Affirmed);

    const proc = procedureMockUtils.getInstance<
      ModifyInstructionAffirmationParams,
      Instruction,
      Storage
    >(mockContext, {
      portfolios: [portfolio, portfolio],
      portfolioParams: [],
      senderLegAmount: legAmount,
      totalLegAmount: legAmount,
    });

    const transaction = dsMockUtils.createTxMock('settlement', 'withdrawAffirmation');

    const result = await prepareModifyInstructionAffirmation.call(proc, {
      id,
      operation: InstructionAffirmationOperation.Withdraw,
    });

    expect(result).toEqual({
      transaction,
      feeMultiplier: new BigNumber(2),
      args: [rawInstructionId, [rawPortfolioId, rawPortfolioId], rawLegAmount],
      resolver: expect.objectContaining({ id }),
    });
  });

  it('should return a reject instruction transaction spec', async () => {
    const rawAffirmationStatus = dsMockUtils.createMockAffirmationStatus('Pending');
    dsMockUtils.createQueryMock('settlement', 'userAffirmations', {
      multi: [rawAffirmationStatus, rawAffirmationStatus],
    });
    when(meshAffirmationStatusToAffirmationStatusSpy)
      .calledWith(rawAffirmationStatus)
      .mockReturnValue(AffirmationStatus.Pending);

    const isCustodiedBySpy = jest
      .fn()
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false)
      .mockReturnValue(false);

    entityMockUtils.configureMocks({
      defaultPortfolioOptions: {
        isCustodiedBy: isCustodiedBySpy,
      },
    });

    const proc = procedureMockUtils.getInstance<
      ModifyInstructionAffirmationParams,
      Instruction,
      Storage
    >(mockContext, {
      portfolios: [portfolio, portfolio],
      portfolioParams: [],
      senderLegAmount: legAmount,
      totalLegAmount: legAmount,
    });

    const transaction = dsMockUtils.createTxMock('settlement', 'rejectInstruction');

    const result = await prepareModifyInstructionAffirmation.call(proc, {
      id,
      operation: InstructionAffirmationOperation.Reject,
    });

    expect(result).toEqual({
      transaction,
      feeMultiplier: new BigNumber(2),
      args: [rawInstructionId, rawPortfolioId, rawLegAmount],
      resolver: expect.objectContaining({ id }),
    });
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
        portfolioParams: [],
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
        portfolioParams: [],
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
    const fromDid = 'fromDid';
    const toDid = 'toDid';

    let from1 = entityMockUtils.getDefaultPortfolioInstance({
      did: fromDid,
      isCustodiedBy: true,
      exists: true,
    });
    const from2 = entityMockUtils.getNumberedPortfolioInstance({
      did: 'someOtherDid',
      id: new BigNumber(1),
      exists: false,
    });
    let to1 = entityMockUtils.getDefaultPortfolioInstance({
      did: toDid,
      isCustodiedBy: true,
      exists: true,
    });
    const to2 = entityMockUtils.getNumberedPortfolioInstance({
      did: 'someDid',
      id: new BigNumber(1),
      exists: false,
    });
    const amount = new BigNumber(1);
    const asset = entityMockUtils.getAssetInstance({ ticker: 'SOME_ASSET' });

    it('should return the portfolios for which to modify affirmation status', async () => {
      const proc = procedureMockUtils.getInstance<
        ModifyInstructionAffirmationParams,
        Instruction,
        Storage
      >(mockContext);

      const boundFunc = prepareStorage.bind(proc);
      entityMockUtils.configureMocks({
        instructionOptions: {
          getLegs: {
            data: [
              { from: from1, to: to1, amount, asset },
              { from: from2, to: to2, amount, asset },
            ],
            next: null,
          },
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
          expect.objectContaining({
            owner: expect.objectContaining({ did: 'someDid' }),
            id: new BigNumber(1),
          }),
        ],
        portfolioParams: [],
        senderLegAmount: new BigNumber(1),
        totalLegAmount: new BigNumber(2),
      });

      result = await boundFunc({
        id: new BigNumber(1),
        operation: InstructionAffirmationOperation.Affirm,
        portfolios: [fromDid],
      });

      expect(result).toEqual({
        portfolios: [expect.objectContaining({ owner: expect.objectContaining({ did: fromDid }) })],
        portfolioParams: [fromDid],
        senderLegAmount: new BigNumber(1),
        totalLegAmount: new BigNumber(2),
      });

      result = await boundFunc({
        id: new BigNumber(1),
        operation: InstructionAffirmationOperation.Withdraw,
        portfolios: [fromDid],
      });

      expect(result).toEqual({
        portfolios: [expect.objectContaining({ owner: expect.objectContaining({ did: fromDid }) })],
        portfolioParams: [fromDid],
        senderLegAmount: new BigNumber(1),
        totalLegAmount: new BigNumber(2),
      });

      result = await boundFunc({
        id: new BigNumber(1),
        operation: InstructionAffirmationOperation.Reject,
        portfolio: fromDid,
      });

      expect(result).toEqual({
        portfolios: [expect.objectContaining({ owner: expect.objectContaining({ did: fromDid }) })],
        portfolioParams: [fromDid],
        senderLegAmount: new BigNumber(1),
        totalLegAmount: new BigNumber(2),
      });
    });

    it('should return the portfolios for which to modify affirmation status when there is no sender legs', async () => {
      const proc = procedureMockUtils.getInstance<
        ModifyInstructionAffirmationParams,
        Instruction,
        Storage
      >(mockContext);

      const boundFunc = prepareStorage.bind(proc);
      from1 = entityMockUtils.getDefaultPortfolioInstance({ did: fromDid, isCustodiedBy: false });
      to1 = entityMockUtils.getDefaultPortfolioInstance({ did: toDid, isCustodiedBy: false });

      entityMockUtils.configureMocks({
        instructionOptions: {
          getLegs: { data: [{ from: from1, to: to1, amount, asset }], next: null },
        },
      });

      const result = await boundFunc({
        id: new BigNumber(1),
        operation: InstructionAffirmationOperation.Affirm,
      });

      expect(result).toEqual({
        portfolios: [],
        portfolioParams: [],
        senderLegAmount: new BigNumber(0),
        totalLegAmount: new BigNumber(1),
      });
    });
  });
});
