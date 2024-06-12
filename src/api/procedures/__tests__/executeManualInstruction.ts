import { u32, u64 } from '@polkadot/types';
import { PolymeshPrimitivesIdentityIdPortfolioId } from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import {
  getAuthorization,
  Params,
  prepareExecuteManualInstruction,
  prepareStorage,
  Storage,
} from '~/api/procedures/executeManualInstruction';
import * as procedureUtilsModule from '~/api/procedures/utils';
import { Context, DefaultPortfolio, Instruction, Venue } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import {
  InstructionAffirmationOperation,
  InstructionDetails,
  InstructionStatus,
  InstructionType,
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
  '~/api/entities/Venue',
  require('~/testUtils/mocks/entities').mockVenueModule('~/api/entities/Venue')
);
jest.mock(
  '~/api/entities/DefaultPortfolio',
  require('~/testUtils/mocks/entities').mockDefaultPortfolioModule(
    '~/api/entities/DefaultPortfolio'
  )
);

describe('executeManualInstruction procedure', () => {
  const id = new BigNumber(1);
  const rawInstructionId = dsMockUtils.createMockU64(id);
  const rawPortfolioId = dsMockUtils.createMockPortfolioId({
    did: dsMockUtils.createMockIdentityId('someDid'),
    kind: dsMockUtils.createMockPortfolioKind('Default'),
  });
  const fungibleTokens = dsMockUtils.createMockU32(new BigNumber(1));
  const nonFungibleTokens = dsMockUtils.createMockU32(new BigNumber(2));
  const offChainAssets = dsMockUtils.createMockU32(new BigNumber(3));

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
  let instructionDetails: InstructionDetails;

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

    jest
      .spyOn(procedureUtilsModule, 'assertInstructionValidForManualExecution')
      .mockImplementation();
  });

  beforeEach(() => {
    rawLegAmount = dsMockUtils.createMockU32(legAmount);
    dsMockUtils.createTxMock('settlement', 'executeManualInstruction');
    mockContext = dsMockUtils.getContextInstance();
    when(bigNumberToU64Spy).calledWith(id, mockContext).mockReturnValue(rawInstructionId);
    when(bigNumberToU32Spy).calledWith(legAmount, mockContext).mockReturnValue(rawLegAmount);
    when(portfolioLikeToPortfolioIdSpy).calledWith(portfolio).mockReturnValue(portfolioId);
    when(portfolioIdToMeshPortfolioIdSpy)
      .calledWith(portfolioId, mockContext)
      .mockReturnValue(rawPortfolioId);
    instructionDetails = {
      status: InstructionStatus.Pending,
      createdAt: new Date('2022/01/01'),
      tradeDate: null,
      valueDate: null,
      venue: new Venue({ id: new BigNumber(1) }, mockContext),
      memo: null,
      type: InstructionType.SettleManual,
      endAfterBlock: new BigNumber(1000),
    };

    dsMockUtils.createCallMock('settlementApi', 'getExecuteInstructionInfo', {
      returnValue: {
        fungibleTokens,
        nonFungibleTokens,
        offChainAssets,
        consumedWeight: 'someWeight',
      },
    });
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

  it('should throw an error if the signing identity is not the custodian of any of the involved portfolios', () => {
    const proc = procedureMockUtils.getInstance<Params, Instruction, Storage>(mockContext, {
      portfolios: [],
      offChainParties: new Set<string>(['offChainSender', 'offChainReceiver']),
      instructionDetails,
      signerDid: 'someOtherDid',
    });

    return expect(
      prepareExecuteManualInstruction.call(proc, {
        id,
        skipAffirmationCheck: false,
      })
    ).rejects.toThrow('The signing identity is not involved in this Instruction');
  });

  it('should throw an error if there are some pending affirmations', () => {
    dsMockUtils.createQueryMock('settlement', 'instructionAffirmsPending', {
      returnValue: dsMockUtils.createMockU64(new BigNumber(1)),
    });

    const proc = procedureMockUtils.getInstance<Params, Instruction, Storage>(mockContext, {
      portfolios: [portfolio, portfolio],
      offChainParties: new Set<string>(),
      instructionDetails,
      signerDid: did,
    });

    return expect(
      prepareExecuteManualInstruction.call(proc, {
        id,
        skipAffirmationCheck: false,
      })
    ).rejects.toThrow('Instruction needs to be affirmed by all parties before it can be executed');
  });

  it('should not throw an error if there are some pending affirmations but skipAffirmationCheck is `true`', () => {
    dsMockUtils.createQueryMock('settlement', 'instructionAffirmsPending', {
      returnValue: dsMockUtils.createMockU64(new BigNumber(1)),
    });

    const proc = procedureMockUtils.getInstance<Params, Instruction, Storage>(mockContext, {
      portfolios: [portfolio, portfolio],
      offChainParties: new Set<string>(),
      instructionDetails,
      signerDid: did,
    });

    return expect(
      prepareExecuteManualInstruction.call(proc, {
        id,
        skipAffirmationCheck: true,
      })
    ).resolves.not.toThrow();
  });

  it('should return an execute manual instruction transaction spec', async () => {
    const transaction = dsMockUtils.createTxMock('settlement', 'executeManualInstruction');

    dsMockUtils.createQueryMock('settlement', 'instructionAffirmsPending', {
      returnValue: dsMockUtils.createMockU64(new BigNumber(0)),
    });

    let proc = procedureMockUtils.getInstance<Params, Instruction, Storage>(mockContext, {
      portfolios: [portfolio, portfolio],
      offChainParties: new Set<string>(),
      instructionDetails,
      signerDid: did,
    });

    let result = await prepareExecuteManualInstruction.call(proc, {
      id,
      skipAffirmationCheck: false,
      operation: InstructionAffirmationOperation.Affirm,
    });

    expect(result).toEqual({
      transaction,
      args: [
        rawInstructionId,
        rawPortfolioId,
        fungibleTokens,
        nonFungibleTokens,
        offChainAssets,
        'someWeight',
      ],
      resolver: expect.objectContaining({ id }),
    });

    proc = procedureMockUtils.getInstance<Params, Instruction, Storage>(mockContext, {
      portfolios: [],
      offChainParties: new Set<string>(),
      instructionDetails,
      signerDid: did,
    });

    result = await prepareExecuteManualInstruction.call(proc, {
      id,
      skipAffirmationCheck: false,
      operation: InstructionAffirmationOperation.Affirm,
    });

    expect(result).toEqual({
      transaction,
      args: [
        rawInstructionId,
        null,
        fungibleTokens,
        nonFungibleTokens,
        offChainAssets,
        'someWeight',
      ],
      resolver: expect.objectContaining({ id }),
    });

    // one of the off chain parties is executing the settlement manually
    proc = procedureMockUtils.getInstance<Params, Instruction, Storage>(mockContext, {
      portfolios: [],
      offChainParties: new Set<string>(['offChainSender', 'offChainReceiver']),
      instructionDetails,
      signerDid: 'offChainSender',
    });

    result = await prepareExecuteManualInstruction.call(proc, {
      id,
      skipAffirmationCheck: false,
      operation: InstructionAffirmationOperation.Affirm,
    });

    expect(result).toEqual({
      transaction,
      args: [
        rawInstructionId,
        null,
        fungibleTokens,
        nonFungibleTokens,
        offChainAssets,
        'someWeight',
      ],
      resolver: expect.objectContaining({ id }),
    });
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', async () => {
      const from = entityMockUtils.getNumberedPortfolioInstance();
      const to = entityMockUtils.getDefaultPortfolioInstance();

      const proc = procedureMockUtils.getInstance<Params, Instruction, Storage>(mockContext, {
        portfolios: [from, to],
        offChainParties: new Set<string>(),
        instructionDetails,
        signerDid: did,
      });
      const boundFunc = getAuthorization.bind(proc);

      const result = await boundFunc();

      expect(result).toEqual({
        permissions: {
          assets: [],
          portfolios: [from, to],
          transactions: [TxTags.settlement.ExecuteManualInstruction],
        },
      });
    });
  });

  describe('prepareStorage', () => {
    const fromDid = 'fromDid';
    const toDid = 'toDid';
    const senderDid = 'senderDid';
    const receiverDid = 'receiverDid';

    let from = entityMockUtils.getDefaultPortfolioInstance({ did: fromDid, isCustodiedBy: true });
    let to = entityMockUtils.getDefaultPortfolioInstance({ did: toDid, isCustodiedBy: true });
    const sender = entityMockUtils.getIdentityInstance({ did: senderDid });
    const receiver = entityMockUtils.getIdentityInstance({ did: receiverDid });
    const amount = new BigNumber(1);
    const asset = entityMockUtils.getFungibleAssetInstance({ ticker: 'TICKER' });

    it('should return the custodied portfolios and offChain parties associated in the instruction legs for the signing identity', async () => {
      const proc = procedureMockUtils.getInstance<Params, Instruction, Storage>(mockContext);

      const boundFunc = prepareStorage.bind(proc);
      entityMockUtils.configureMocks({
        instructionOptions: {
          getLegs: {
            data: [
              { from, to, amount, asset },
              { from: sender, to: receiver, offChainAmount: amount, asset: 'OFF_CHAIN_ASSET' },
            ],
            next: null,
          },
          details: instructionDetails,
        },
      });
      const result = await boundFunc({
        id: new BigNumber(1),
        skipAffirmationCheck: false,
      });

      expect(result).toEqual({
        portfolios: [
          expect.objectContaining({ owner: expect.objectContaining({ did: fromDid }) }),
          expect.objectContaining({ owner: expect.objectContaining({ did: toDid }) }),
        ],
        instructionDetails,
        signerDid: did,
        offChainParties: new Set<string>([senderDid, receiverDid]),
      });
    });

    it('should return no portfolios when signing identity is not part of any legs', async () => {
      const proc = procedureMockUtils.getInstance<Params, Instruction, Storage>(mockContext);

      const boundFunc = prepareStorage.bind(proc);
      from = entityMockUtils.getDefaultPortfolioInstance({ did: fromDid, isCustodiedBy: false });
      to = entityMockUtils.getDefaultPortfolioInstance({ did: toDid, isCustodiedBy: false });

      entityMockUtils.configureMocks({
        instructionOptions: {
          getLegs: { data: [{ from, to, amount, asset }], next: null },
          details: instructionDetails,
        },
      });

      const result = await boundFunc({
        id: new BigNumber(1),
        skipAffirmationCheck: false,
      });

      expect(result).toEqual({
        portfolios: [],
        instructionDetails,
        signerDid: did,
        offChainParties: new Set<string>(),
      });
    });
  });
});
