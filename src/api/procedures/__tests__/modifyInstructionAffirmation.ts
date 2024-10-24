import { BTreeSet, u32, u64 } from '@polkadot/types';
import {
  PolymeshPrimitivesIdentityIdPortfolioId,
  PolymeshPrimitivesSettlementAffirmationStatus,
  PolymeshPrimitivesSettlementAssetCount,
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
import { Context, DefaultPortfolio, Instruction, PolymeshError } from '~/internal';
import { AffirmationCount, ExecuteInstructionInfo } from '~/polkadot/polymesh';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import {
  createMockAssetCount,
  createMockExecuteInstructionInfo,
  createMockMediatorAffirmationStatus,
} from '~/testUtils/mocks/dataSources';
import { Mocked } from '~/testUtils/types';
import {
  AffirmationStatus,
  ErrorCode,
  Identity,
  InstructionAffirmationOperation,
  ModifyInstructionAffirmationParams,
  OffChainAffirmationReceipt,
  PortfolioId,
  PortfolioLike,
  SignerKeyRingType,
  TxTags,
} from '~/types';
import * as utilsConversionModule from '~/utils/conversion';
import * as utilsInternalModule from '~/utils/internal';

jest.mock(
  '~/api/entities/Account',
  require('~/testUtils/mocks/entities').mockAccountModule('~/api/entities/Account')
);

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
  let signer: Identity;
  let portfolio: DefaultPortfolio;
  let legAmount: BigNumber;
  let rawLegAmount: u32;
  const portfolioId: PortfolioId = { did };
  const latestBlock = new BigNumber(100);
  let mockContext: Mocked<Context>;
  let portfolioIdsToBtreeSetSpy: jest.SpyInstance;
  let bigNumberToU64Spy: jest.SpyInstance<u64, [BigNumber, Context]>;
  let bigNumberToU32Spy: jest.SpyInstance<u32, [BigNumber, Context]>;
  let portfolioLikeToPortfolioIdSpy: jest.SpyInstance<PortfolioId, [PortfolioLike]>;
  let portfolioIdToMeshPortfolioIdSpy: jest.SpyInstance<
    PolymeshPrimitivesIdentityIdPortfolioId,
    [PortfolioId, Context]
  >;
  let meshAffirmationStatusToAffirmationStatusSpy: jest.SpyInstance<
    AffirmationStatus,
    [PolymeshPrimitivesSettlementAffirmationStatus]
  >;
  let assetCountToRawSpy: jest.SpyInstance;
  let mediatorAffirmationStatusToStatusSpy: jest.SpyInstance;
  let mockExecuteInfo: ExecuteInstructionInfo;
  let mockAffirmCount: AffirmationCount;
  let mockAssetCount: PolymeshPrimitivesSettlementAssetCount;
  let rawPortfolioIds: BTreeSet<PolymeshPrimitivesIdentityIdPortfolioId>;

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
    mockExecuteInfo = createMockExecuteInstructionInfo({
      fungibleTokens: dsMockUtils.createMockU32(new BigNumber(3)),
      nonFungibleTokens: dsMockUtils.createMockU32(new BigNumber(0)),
      offChainAssets: dsMockUtils.createMockU32(new BigNumber(1)),
      consumedWeight: dsMockUtils.createMockWeight(),
    });
    mockAffirmCount = dsMockUtils.createMockAffirmationCount();
    mockAssetCount = createMockAssetCount({
      fungible: dsMockUtils.createMockU32(new BigNumber(3)),
      nonFungible: dsMockUtils.createMockU32(new BigNumber(0)),
      offChain: dsMockUtils.createMockU32(new BigNumber(0)),
    });
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
    assetCountToRawSpy = jest.spyOn(utilsConversionModule, 'assetCountToRaw');

    mediatorAffirmationStatusToStatusSpy = jest.spyOn(
      utilsConversionModule,
      'mediatorAffirmationStatusToStatus'
    );

    jest.spyOn(procedureUtilsModule, 'assertInstructionValid').mockImplementation();

    portfolioIdsToBtreeSetSpy = jest.spyOn(utilsConversionModule, 'portfolioIdsToBtreeSet');
  });

  beforeEach(() => {
    rawLegAmount = dsMockUtils.createMockU32(new BigNumber(2));
    dsMockUtils.createTxMock('settlement', 'affirmInstructionWithCount');
    dsMockUtils.createTxMock('settlement', 'withdrawAffirmationWithCount');
    dsMockUtils.createTxMock('settlement', 'rejectInstructionWithCount');
    dsMockUtils.createTxMock('settlement', 'affirmInstructionAsMediator');
    dsMockUtils.createTxMock('settlement', 'withdrawAffirmationAsMediator');
    dsMockUtils.createTxMock('settlement', 'rejectInstructionAsMediator');
    dsMockUtils.createCallMock('settlementApi', 'getExecuteInstructionInfo', {
      returnValue: dsMockUtils.createMockOption(mockExecuteInfo),
    });
    dsMockUtils.createCallMock('settlementApi', 'getAffirmationCount', {
      returnValue: mockAffirmCount,
    });
    mockContext = dsMockUtils.getContextInstance({ getSigningIdentity: signer });
    bigNumberToU64Spy.mockReturnValue(rawInstructionId);
    bigNumberToU32Spy.mockReturnValue(rawLegAmount);
    assetCountToRawSpy.mockReturnValue(mockAssetCount);
    signer = entityMockUtils.getIdentityInstance({ did });
    when(portfolioLikeToPortfolioIdSpy).calledWith(portfolio).mockReturnValue(portfolioId);
    when(portfolioIdToMeshPortfolioIdSpy)
      .calledWith(portfolioId, mockContext)
      .mockReturnValue(rawPortfolioId);
    dsMockUtils.createQueryMock('settlement', 'instructionMediatorsAffirmations', {
      returnValue: dsMockUtils.createMockAffirmationStatus(AffirmationStatus.Unknown),
    });
    dsMockUtils.createQueryMock('settlement', 'userAffirmations', {
      multi: [],
    });

    rawPortfolioIds = dsMockUtils.createMockBTreeSet([rawPortfolioId, rawPortfolioId]);

    when(portfolioIdsToBtreeSetSpy)
      .calledWith([rawPortfolioId, rawPortfolioId], mockContext)
      .mockReturnValue(rawPortfolioIds);
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
      signer,
      offChainLegIndices: [],
      instructionInfo: mockExecuteInfo,
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
      signer,
      offChainLegIndices: [],
      instructionInfo: mockExecuteInfo,
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
      signer,
      offChainLegIndices: [],
      instructionInfo: mockExecuteInfo,
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
      signer,
      offChainLegIndices: [],
      instructionInfo: mockExecuteInfo,
    });

    const transaction = dsMockUtils.createTxMock('settlement', 'affirmInstructionWithCount');

    const result = await prepareModifyInstructionAffirmation.call(proc, {
      id,
      operation: InstructionAffirmationOperation.Affirm,
    });

    expect(result).toEqual({
      transaction,
      feeMultiplier: new BigNumber(2),
      args: [rawInstructionId, rawPortfolioIds, mockAffirmCount],
      resolver: expect.objectContaining({ id }),
    });
  });

  describe('offchain settlement affirmation', () => {
    let receipt: OffChainAffirmationReceipt;
    let transaction: jest.Mock;
    let storage: Storage;
    let offChainAffirmationsQueryMock: jest.Mock;
    let receiptsUsedQueryMock: jest.Mock;

    beforeAll(() => {
      jest.spyOn(utilsInternalModule, 'assertAddressValid').mockImplementation();
    });

    beforeEach(() => {
      offChainAffirmationsQueryMock = dsMockUtils.createQueryMock(
        'settlement',
        'offChainAffirmations'
      );

      receiptsUsedQueryMock = dsMockUtils.createQueryMock('settlement', 'receiptsUsed');

      transaction = dsMockUtils.createTxMock('settlement', 'affirmWithReceiptsWithCount');

      storage = {
        portfolios: [],
        portfolioParams: [],
        senderLegAmount: new BigNumber(0),
        totalLegAmount: legAmount,
        signer,
        offChainLegIndices: [0],
        instructionInfo: mockExecuteInfo,
      };
      receipt = {
        legId: new BigNumber(0),
        uid: new BigNumber(1),
        signer: 'allowedSigner',
        signature: {
          type: SignerKeyRingType.Sr25519,
          value: '0xsignature',
        },
        metadata: 'Optional metadata',
      };

      offChainAffirmationsQueryMock.mockResolvedValue(
        dsMockUtils.createMockAffirmationStatus('Pending')
      );

      receiptsUsedQueryMock.mockResolvedValue(dsMockUtils.createMockBool(false));
    });

    it('should throw an error if receipts contains duplicate uid/legId', async () => {
      const proc = procedureMockUtils.getInstance<
        ModifyInstructionAffirmationParams,
        Instruction,
        Storage
      >(mockContext, { ...storage, offChainLegIndices: [0, 1] });

      await expect(
        prepareModifyInstructionAffirmation.call(proc, {
          id,
          operation: InstructionAffirmationOperation.Affirm,
          receipts: [
            receipt,
            {
              ...receipt,
              legId: new BigNumber(1),
            },
          ],
        })
      ).rejects.toThrow(
        'Incorrect receipt details. Note, each leg in the receipt should be mapped to unique uid'
      );

      await expect(
        prepareModifyInstructionAffirmation.call(proc, {
          id,
          operation: InstructionAffirmationOperation.Affirm,
          receipts: [
            receipt,
            {
              ...receipt,
              uid: new BigNumber(2),
            },
          ],
        })
      ).rejects.toThrow(
        'Incorrect receipt details. Note, each leg in the receipt should be mapped to unique uid'
      );
    });

    it('should throw an error if receipts contains invalid offchain legId', async () => {
      const proc = procedureMockUtils.getInstance<
        ModifyInstructionAffirmationParams,
        Instruction,
        Storage
      >(mockContext, storage);

      await expect(
        prepareModifyInstructionAffirmation.call(proc, {
          id,
          operation: InstructionAffirmationOperation.Affirm,
          receipts: [
            receipt,
            {
              ...receipt,
              legId: new BigNumber(1),
            },
          ],
        })
      ).rejects.toThrow(
        'Incorrect receipt details. Note, each leg in the receipt should be mapped to unique uid'
      );
    });

    it('should throw an error if signer is not an allowed signer', async () => {
      const proc = procedureMockUtils.getInstance<
        ModifyInstructionAffirmationParams,
        Instruction,
        Storage
      >(mockContext, storage);

      await expect(
        prepareModifyInstructionAffirmation.call(proc, {
          id,
          operation: InstructionAffirmationOperation.Affirm,
          receipts: [
            {
              ...receipt,
              signer: 'notAllowedSigner',
            },
          ],
        })
      ).rejects.toThrow('Some signers are not allowed to sign the receipt for this Instruction');

      entityMockUtils.configureMocks({
        instructionOptions: {
          details: {
            venue: undefined,
          },
        },
      });
      await expect(
        prepareModifyInstructionAffirmation.call(proc, {
          id,
          operation: InstructionAffirmationOperation.Affirm,
          receipts: [
            {
              ...receipt,
              signer: 'notAllowedSigner',
            },
          ],
        })
      ).rejects.toThrow('Some signers are not allowed to sign the receipt for this Instruction');
    });

    it('should throw an error if offchain leg is already affirmed', async () => {
      const rawAffirmStatus = dsMockUtils.createMockAffirmationStatus('Affirmed');

      offChainAffirmationsQueryMock.mockResolvedValue(
        dsMockUtils.createMockAffirmationStatus('Affirmed')
      );

      when(meshAffirmationStatusToAffirmationStatusSpy)
        .calledWith(rawAffirmStatus)
        .mockReturnValue(AffirmationStatus.Affirmed);

      const proc = procedureMockUtils.getInstance<
        ModifyInstructionAffirmationParams,
        Instruction,
        Storage
      >(mockContext, storage);

      await expect(
        prepareModifyInstructionAffirmation.call(proc, {
          id,
          operation: InstructionAffirmationOperation.Affirm,
          receipts: [receipt],
        })
      ).rejects.toThrow('Some of the legs have already been affirmed');
    });

    it('should throw an error if receipt is already used by the signer', async () => {
      receiptsUsedQueryMock.mockResolvedValue(dsMockUtils.createMockBool(true));

      const proc = procedureMockUtils.getInstance<
        ModifyInstructionAffirmationParams,
        Instruction,
        Storage
      >(mockContext, storage);

      await expect(
        prepareModifyInstructionAffirmation.call(proc, {
          id,
          operation: InstructionAffirmationOperation.Affirm,
          receipts: [receipt],
        })
      ).rejects.toThrow('Some of the receipts have already been used by the receipts signers');
    });

    it('should return an affirm instruction with receipts transaction spec', async () => {
      const receiptDetailsToMeshReceiptDetailsSpy: jest.SpyInstance = jest.spyOn(
        utilsConversionModule,
        'receiptDetailsToMeshReceiptDetails'
      );
      receiptDetailsToMeshReceiptDetailsSpy.mockReturnValue([]);

      const emptySet = dsMockUtils.createMockBTreeSet([]);
      when(portfolioIdsToBtreeSetSpy).calledWith([], mockContext).mockReturnValue(emptySet);

      const proc = procedureMockUtils.getInstance<
        ModifyInstructionAffirmationParams,
        Instruction,
        Storage
      >(mockContext, storage);

      const result = await prepareModifyInstructionAffirmation.call(proc, {
        id,
        operation: InstructionAffirmationOperation.Affirm,
        receipts: [receipt],
      });

      expect(result).toEqual({
        transaction,
        args: [rawInstructionId, [], emptySet, mockAffirmCount],
        resolver: expect.objectContaining({ id }),
      });
    });
  });

  it('should throw an error if affirmed by a mediator without a pending affirmation', async () => {
    const rawAffirmationStatus = dsMockUtils.createMockAffirmationStatus('Unknown');
    dsMockUtils.createQueryMock('settlement', 'instructionMediatorsAffirmations', {
      returnValue: rawAffirmationStatus,
    });
    when(mediatorAffirmationStatusToStatusSpy)
      .calledWith(rawAffirmationStatus)
      .mockReturnValue({ status: AffirmationStatus.Unknown });

    const proc = procedureMockUtils.getInstance<
      ModifyInstructionAffirmationParams,
      Instruction,
      Storage
    >(mockContext, {
      portfolios: [portfolio, portfolio],
      portfolioParams: [],
      senderLegAmount: legAmount,
      totalLegAmount: legAmount,
      signer,
      offChainLegIndices: [],
      instructionInfo: mockExecuteInfo,
    });

    const expectedError = new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The signer is not a mediator',
    });

    return expect(
      prepareModifyInstructionAffirmation.call(proc, {
        id,
        operation: InstructionAffirmationOperation.AffirmAsMediator,
      })
    ).rejects.toThrow(expectedError);
  });

  it('should throw an error if expiry is set at a point in the future', async () => {
    const rawAffirmationStatus = dsMockUtils.createMockAffirmationStatus('Pending');
    dsMockUtils.createQueryMock('settlement', 'instructionMediatorsAffirmations', {
      returnValue: rawAffirmationStatus,
    });
    when(mediatorAffirmationStatusToStatusSpy)
      .calledWith(rawAffirmationStatus)
      .mockReturnValue({ status: AffirmationStatus.Pending });

    const proc = procedureMockUtils.getInstance<
      ModifyInstructionAffirmationParams,
      Instruction,
      Storage
    >(mockContext, {
      portfolios: [portfolio, portfolio],
      portfolioParams: [],
      senderLegAmount: legAmount,
      totalLegAmount: legAmount,
      signer,
      offChainLegIndices: [],
      instructionInfo: mockExecuteInfo,
    });

    const expectedError = new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The expiry must be in the future',
    });

    return expect(
      prepareModifyInstructionAffirmation.call(proc, {
        id,
        operation: InstructionAffirmationOperation.AffirmAsMediator,
        expiry: new Date(1),
      })
    ).rejects.toThrow(expectedError);
  });

  it('should return an affirm as mediator instruction transaction spec', async () => {
    const rawAffirmationStatus = dsMockUtils.createMockAffirmationStatus('Pending');
    dsMockUtils.createQueryMock('settlement', 'instructionMediatorsAffirmations', {
      returnValue: rawAffirmationStatus,
    });
    when(mediatorAffirmationStatusToStatusSpy)
      .calledWith(rawAffirmationStatus)
      .mockReturnValue({ status: AffirmationStatus.Pending });

    const proc = procedureMockUtils.getInstance<
      ModifyInstructionAffirmationParams,
      Instruction,
      Storage
    >(mockContext, {
      portfolios: [portfolio, portfolio],
      portfolioParams: [],
      senderLegAmount: legAmount,
      totalLegAmount: legAmount,
      signer,
      offChainLegIndices: [],
      instructionInfo: mockExecuteInfo,
    });

    const transaction = dsMockUtils.createTxMock('settlement', 'affirmInstructionAsMediator');

    const result = await prepareModifyInstructionAffirmation.call(proc, {
      id,
      operation: InstructionAffirmationOperation.AffirmAsMediator,
    });

    expect(result).toEqual({
      transaction,
      args: [rawInstructionId, null],
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
      signer,
      offChainLegIndices: [],
      instructionInfo: mockExecuteInfo,
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

    dsMockUtils.configureMocks({ contextOptions: { specVersion: 7000003 } });
    const proc = procedureMockUtils.getInstance<
      ModifyInstructionAffirmationParams,
      Instruction,
      Storage
    >(mockContext, {
      portfolios: [portfolio, portfolio],
      portfolioParams: [],
      senderLegAmount: legAmount,
      totalLegAmount: legAmount,
      signer,
      offChainLegIndices: [],
      instructionInfo: mockExecuteInfo,
    });

    const transaction = dsMockUtils.createTxMock('settlement', 'withdrawAffirmationWithCount');

    const result = await prepareModifyInstructionAffirmation.call(proc, {
      id,
      operation: InstructionAffirmationOperation.Withdraw,
    });

    expect(result).toEqual({
      transaction,
      feeMultiplier: new BigNumber(2),
      args: [rawInstructionId, [rawPortfolioId, rawPortfolioId], mockAffirmCount],
      resolver: expect.objectContaining({ id }),
    });
  });

  it('should throw an error if a mediator attempts to withdraw a non affirmed transaction', async () => {
    const rawAffirmationStatus = createMockMediatorAffirmationStatus(AffirmationStatus.Pending);
    dsMockUtils.createQueryMock('settlement', 'instructionMediatorsAffirmations', {
      returnValue: rawAffirmationStatus,
    });
    when(mediatorAffirmationStatusToStatusSpy)
      .calledWith(rawAffirmationStatus)
      .mockReturnValue({ status: AffirmationStatus.Pending });

    const proc = procedureMockUtils.getInstance<
      ModifyInstructionAffirmationParams,
      Instruction,
      Storage
    >(mockContext, {
      portfolios: [portfolio, portfolio],
      portfolioParams: [],
      senderLegAmount: legAmount,
      totalLegAmount: legAmount,
      signer,
      offChainLegIndices: [],
      instructionInfo: mockExecuteInfo,
    });

    const expectedError = new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The signer is not a mediator that has already affirmed the instruction',
    });

    return expect(
      prepareModifyInstructionAffirmation.call(proc, {
        id,
        operation: InstructionAffirmationOperation.WithdrawAsMediator,
      })
    ).rejects.toThrow(expectedError);
  });

  it('should return a withdraw as mediator instruction transaction spec', async () => {
    const rawAffirmationStatus = createMockMediatorAffirmationStatus({
      Affirmed: dsMockUtils.createMockOption(),
    });
    dsMockUtils.createQueryMock('settlement', 'instructionMediatorsAffirmations', {
      returnValue: rawAffirmationStatus,
    });
    when(mediatorAffirmationStatusToStatusSpy)
      .calledWith(rawAffirmationStatus)
      .mockReturnValue({ status: AffirmationStatus.Affirmed });

    const proc = procedureMockUtils.getInstance<
      ModifyInstructionAffirmationParams,
      Instruction,
      Storage
    >(mockContext, {
      portfolios: [portfolio, portfolio],
      portfolioParams: [],
      senderLegAmount: legAmount,
      totalLegAmount: legAmount,
      signer,
      offChainLegIndices: [],
      instructionInfo: mockExecuteInfo,
    });

    const transaction = dsMockUtils.createTxMock('settlement', 'withdrawAffirmationAsMediator');

    const result = await prepareModifyInstructionAffirmation.call(proc, {
      id,
      operation: InstructionAffirmationOperation.WithdrawAsMediator,
    });

    expect(result).toEqual({
      transaction,
      args: [rawInstructionId],
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
      signer,
      offChainLegIndices: [],
      instructionInfo: mockExecuteInfo,
    });

    const transaction = dsMockUtils.createTxMock('settlement', 'rejectInstructionWithCount');

    const result = await prepareModifyInstructionAffirmation.call(proc, {
      id,
      operation: InstructionAffirmationOperation.Reject,
    });

    expect(result).toEqual({
      transaction,
      feeMultiplier: new BigNumber(2),
      args: [rawInstructionId, rawPortfolioId, mockAssetCount],
      resolver: expect.objectContaining({ id }),
    });
  });

  it('should throw an error if a non involved identity attempts to reject the transaction', () => {
    const rawAffirmationStatus = createMockMediatorAffirmationStatus(AffirmationStatus.Unknown);
    dsMockUtils.createQueryMock('settlement', 'instructionMediatorsAffirmations', {
      returnValue: rawAffirmationStatus,
    });
    when(mediatorAffirmationStatusToStatusSpy)
      .calledWith(rawAffirmationStatus)
      .mockReturnValue({ status: AffirmationStatus.Unknown });

    const proc = procedureMockUtils.getInstance<
      ModifyInstructionAffirmationParams,
      Instruction,
      Storage
    >(mockContext, {
      portfolios: [portfolio, portfolio],
      portfolioParams: [],
      senderLegAmount: legAmount,
      totalLegAmount: legAmount,
      signer: entityMockUtils.getIdentityInstance({ did: 'someOtherDid' }),
      offChainLegIndices: [],
      instructionInfo: mockExecuteInfo,
    });

    const expectedError = new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The signer is not a mediator for the instruction',
    });

    return expect(
      prepareModifyInstructionAffirmation.call(proc, {
        id,
        operation: InstructionAffirmationOperation.RejectAsMediator,
      })
    ).rejects.toThrow(expectedError);
  });

  it('should return a reject as mediator instruction transaction spec', async () => {
    const rawAffirmationStatus = createMockMediatorAffirmationStatus(AffirmationStatus.Pending);
    dsMockUtils.createQueryMock('settlement', 'instructionMediatorsAffirmations', {
      returnValue: rawAffirmationStatus,
    });
    when(mediatorAffirmationStatusToStatusSpy)
      .calledWith(rawAffirmationStatus)
      .mockReturnValue({ status: AffirmationStatus.Pending });

    const proc = procedureMockUtils.getInstance<
      ModifyInstructionAffirmationParams,
      Instruction,
      Storage
    >(mockContext, {
      portfolios: [portfolio, portfolio],
      portfolioParams: [],
      senderLegAmount: legAmount,
      totalLegAmount: legAmount,
      signer,
      offChainLegIndices: [],
      instructionInfo: mockExecuteInfo,
    });

    const transaction = dsMockUtils.createTxMock('settlement', 'rejectInstructionAsMediator');

    const result = await prepareModifyInstructionAffirmation.call(proc, {
      id,
      operation: InstructionAffirmationOperation.RejectAsMediator,
    });

    expect(result).toEqual({
      transaction,
      args: [rawInstructionId, mockAssetCount],
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
        signer,
        offChainLegIndices: [],
        instructionInfo: mockExecuteInfo,
      });
      let boundFunc = getAuthorization.bind(proc);

      let result = await boundFunc(args);

      expect(result).toEqual({
        permissions: {
          assets: [],
          portfolios: [from, to],
          transactions: [TxTags.settlement.AffirmInstructionWithCount],
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
        signer,
        offChainLegIndices: [2],
        instructionInfo: mockExecuteInfo,
      });

      boundFunc = getAuthorization.bind(proc);

      result = await boundFunc({
        ...args,
        operation: InstructionAffirmationOperation.Affirm,
        receipts: ['receipts' as unknown as OffChainAffirmationReceipt],
      });

      expect(result).toEqual({
        permissions: {
          assets: [],
          portfolios: [],
          transactions: [TxTags.settlement.AffirmWithReceiptsWithCount],
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
        signer,
        offChainLegIndices: [],
        instructionInfo: mockExecuteInfo,
      });

      boundFunc = getAuthorization.bind(proc);

      result = await boundFunc({ ...args, operation: InstructionAffirmationOperation.Reject });

      expect(result).toEqual({
        permissions: {
          assets: [],
          portfolios: [],
          transactions: [TxTags.settlement.RejectInstructionWithCount],
        },
      });

      result = await boundFunc({ ...args, operation: InstructionAffirmationOperation.Withdraw });

      expect(result).toEqual({
        permissions: {
          assets: [],
          portfolios: [],
          transactions: [TxTags.settlement.WithdrawAffirmationWithCount],
        },
      });

      result = await boundFunc({
        ...args,
        operation: InstructionAffirmationOperation.AffirmAsMediator,
      });

      expect(result).toEqual({
        permissions: {
          assets: [],
          portfolios: [],
          transactions: [TxTags.settlement.AffirmInstructionAsMediator],
        },
      });

      result = await boundFunc({
        ...args,
        operation: InstructionAffirmationOperation.WithdrawAsMediator,
      });

      expect(result).toEqual({
        permissions: {
          assets: [],
          portfolios: [],
          transactions: [TxTags.settlement.WithdrawAffirmationAsMediator],
        },
      });

      result = await boundFunc({
        ...args,
        operation: InstructionAffirmationOperation.RejectAsMediator,
      });

      expect(result).toEqual({
        permissions: {
          assets: [],
          portfolios: [],
          transactions: [TxTags.settlement.RejectInstructionAsMediator],
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
    const sender = entityMockUtils.getIdentityInstance({ did: 'offChainSenderDid' });
    const receiver = entityMockUtils.getIdentityInstance({ did: 'offChainReceiverDid' });
    const offChainAsset = 'OFFCHAIN_ASSET';
    const amount = new BigNumber(1);
    const asset = entityMockUtils.getFungibleAssetInstance({ assetId: 'SOME_ASSET' });

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
              { from: sender, to: receiver, offChainAmount: amount, asset: offChainAsset },
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
        totalLegAmount: new BigNumber(3),
        signer: expect.objectContaining({ did: signer.did }),
        offChainLegIndices: [2],
        instructionInfo: mockExecuteInfo,
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
        totalLegAmount: new BigNumber(3),
        signer: expect.objectContaining({ did: signer.did }),
        offChainLegIndices: [2],
        instructionInfo: mockExecuteInfo,
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
        totalLegAmount: new BigNumber(3),
        signer: expect.objectContaining({ did: signer.did }),
        offChainLegIndices: [2],
        instructionInfo: mockExecuteInfo,
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
        totalLegAmount: new BigNumber(3),
        signer: expect.objectContaining({ did: signer.did }),
        offChainLegIndices: [2],
        instructionInfo: mockExecuteInfo,
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
        signer: expect.objectContaining({ did: signer.did }),
        offChainLegIndices: [],
        instructionInfo: mockExecuteInfo,
      });
    });
  });
});
