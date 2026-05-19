import { u32, u64 } from '@polkadot/types';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import {
  executeManualInstruction,
  getAuthorization,
  Params,
  prepareExecuteManualInstruction,
  prepareStorage,
  Storage,
} from '~/api/procedures/executeManualInstruction';
import * as procedureUtilsModule from '~/api/procedures/utils';
import { Context, DefaultPortfolio, Instruction, Procedure, Venue } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import {
  AffirmationStatus,
  InstructionAffirmationOperation,
  InstructionDetails,
  InstructionStatus,
  InstructionType,
  PortfolioId,
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
  const rawPortfolioHolderId = dsMockUtils.createMockAssetHolder({
    Portfolio: dsMockUtils.createMockPortfolioId({
      did: dsMockUtils.createMockIdentityId('someDid'),
      kind: dsMockUtils.createMockPortfolioKind('Default'),
    }),
  });
  const fungibleTokens = dsMockUtils.createMockU32(new BigNumber(1));
  const nonFungibleTokens = dsMockUtils.createMockU32(new BigNumber(2));
  const offChainAssets = dsMockUtils.createMockU32(new BigNumber(3));
  const consumedWeight = dsMockUtils.createMockWeight({
    refTime: dsMockUtils.createMockCompact(dsMockUtils.createMockU64(new BigNumber(0))),
    proofSize: dsMockUtils.createMockCompact(
      dsMockUtils.createMockU64(new BigNumber('9455603734'))
    ),
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
  let assetHolderLikeToAssetHolderIdSpy: jest.SpyInstance;
  let assetHolderIdToMeshAssetHolderSpy: jest.SpyInstance;
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
    assetHolderLikeToAssetHolderIdSpy = jest.spyOn(
      utilsConversionModule,
      'assetHolderLikeToAssetHolderId'
    );
    assetHolderIdToMeshAssetHolderSpy = jest.spyOn(
      utilsConversionModule,
      'assetHolderIdToMeshAssetHolder'
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
    when(assetHolderLikeToAssetHolderIdSpy).calledWith(portfolio).mockReturnValue(portfolioId);
    when(assetHolderIdToMeshAssetHolderSpy)
      .calledWith(portfolioId, mockContext)
      .mockReturnValue(rawPortfolioHolderId);
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
      returnValue: dsMockUtils.createMockOption(
        dsMockUtils.createMockExecuteInstructionInfo({
          fungibleTokens,
          nonFungibleTokens,
          offChainAssets,
          consumedWeight,
        })
      ),
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

  it('should throw an error if the signer is not involved in the instruction', async () => {
    let proc = procedureMockUtils.getInstance<Params, Instruction, Storage>(mockContext, {
      allowedAssetHolders: [],
      offChainParties: new Set<string>(['offChainSender', 'offChainReceiver']),
      instructionDetails,
      signerDid: 'someOtherDid',
      mediatorDids: [],
    });

    await expect(
      prepareExecuteManualInstruction.call(proc, {
        id,
        skipAffirmationCheck: false,
      })
    ).rejects.toThrow('The signer is not involved in this Instruction');

    proc = procedureMockUtils.getInstance<Params, Instruction, Storage>(mockContext, {
      allowedAssetHolders: [],
      offChainParties: new Set<string>(['offChainSender', 'offChainReceiver']),
      instructionDetails: {
        ...instructionDetails,
        venue: null,
      },
      signerDid: 'someOtherDid',
      mediatorDids: [],
    });
    await expect(
      prepareExecuteManualInstruction.call(proc, {
        id,
        skipAffirmationCheck: false,
      })
    ).rejects.toThrow('The signer is not involved in this Instruction');
  });

  it('should throw an error if there are some pending affirmations', () => {
    dsMockUtils.createQueryMock('settlement', 'instructionAffirmsPending', {
      returnValue: dsMockUtils.createMockU64(new BigNumber(1)),
    });

    const proc = procedureMockUtils.getInstance<Params, Instruction, Storage>(mockContext, {
      allowedAssetHolders: [portfolio, portfolio],
      offChainParties: new Set<string>(),
      instructionDetails,
      signerDid: did,
      mediatorDids: [],
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
      allowedAssetHolders: [portfolio, portfolio],
      offChainParties: new Set<string>(),
      instructionDetails,
      signerDid: did,
      mediatorDids: [],
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
      allowedAssetHolders: [portfolio, portfolio],
      offChainParties: new Set<string>(),
      instructionDetails,
      signerDid: did,
      mediatorDids: [],
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
        rawPortfolioHolderId,
        fungibleTokens,
        nonFungibleTokens,
        offChainAssets,
        consumedWeight,
      ],
      resolver: expect.objectContaining({ id }),
    });

    proc = procedureMockUtils.getInstance<Params, Instruction, Storage>(mockContext, {
      allowedAssetHolders: [],
      offChainParties: new Set<string>(),
      instructionDetails,
      signerDid: did,
      mediatorDids: [],
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
        consumedWeight,
      ],
      resolver: expect.objectContaining({ id }),
    });

    // one of the off chain parties is executing the settlement manually
    proc = procedureMockUtils.getInstance<Params, Instruction, Storage>(mockContext, {
      allowedAssetHolders: [],
      offChainParties: new Set<string>(['offChainSender', 'offChainReceiver']),
      instructionDetails,
      signerDid: 'offChainSender',
      mediatorDids: [],
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
        consumedWeight,
      ],
      resolver: expect.objectContaining({ id }),
    });
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      const from = entityMockUtils.getNumberedPortfolioInstance();
      const to = entityMockUtils.getDefaultPortfolioInstance();

      const proc = procedureMockUtils.getInstance<Params, Instruction, Storage>(mockContext, {
        allowedAssetHolders: [from, to],
        offChainParties: new Set<string>(),
        instructionDetails,
        signerDid: did,
        mediatorDids: [],
      });
      const boundFunc = getAuthorization.bind(proc);

      const result = boundFunc();

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

    let assetHolderLikeToAssetHolderSpy: jest.SpyInstance;

    const from = entityMockUtils.getDefaultPortfolioInstance({ did: fromDid, isCustodiedBy: true });
    const to = entityMockUtils.getDefaultPortfolioInstance({ did: toDid, isCustodiedBy: true });
    const sender = entityMockUtils.getIdentityInstance({ did: senderDid });
    const receiver = entityMockUtils.getIdentityInstance({ did: receiverDid });
    const amount = new BigNumber(1);
    const asset = entityMockUtils.getFungibleAssetInstance({
      assetId: '0x12341234123412341234123412341234',
    });

    beforeEach(() => {
      assetHolderLikeToAssetHolderSpy = jest.spyOn(
        utilsConversionModule,
        'assetHolderLikeToAssetHolder'
      );

      when(assetHolderLikeToAssetHolderSpy).calledWith(from, mockContext).mockReturnValue(from);
      when(assetHolderLikeToAssetHolderSpy).calledWith(to, mockContext).mockReturnValue(to);
    });

    it('should return the custodied portfolios as asset holders and offChain parties associated in the instruction legs for the signing identity', async () => {
      const proc = procedureMockUtils.getInstance<Params, Instruction, Storage>(mockContext);

      const boundFunc = prepareStorage.bind(proc);
      entityMockUtils.configureMocks({
        instructionOptions: {
          getLegsFromChain: {
            data: [
              { from, to, amount, asset },
              { from: sender, to: receiver, offChainAmount: amount, asset: 'OFF_CHAIN_ASSET' },
            ],
            next: null,
          },
          detailsFromChain: instructionDetails,
          getMediators: [],
        },
      });
      const result = await boundFunc({
        id: new BigNumber(1),
        skipAffirmationCheck: false,
      });

      expect(result).toEqual({
        allowedAssetHolders: [
          expect.objectContaining({ owner: expect.objectContaining({ did: fromDid }) }),
          expect.objectContaining({ owner: expect.objectContaining({ did: toDid }) }),
        ],
        instructionDetails,
        signerDid: did,
        offChainParties: new Set<string>([senderDid, receiverDid]),
        mediatorDids: [],
      });
    });

    it('should return no asset holders when signers are not part of any legs', async () => {
      from.isCustodiedBy = jest.fn().mockResolvedValue(false);
      const toAccount = entityMockUtils.getAccountInstance({
        getIdentity: entityMockUtils.getIdentityInstance({ did: 'randomDid' }),
      });

      when(assetHolderLikeToAssetHolderSpy)
        .calledWith(toAccount, mockContext)
        .mockReturnValue(toAccount);

      entityMockUtils.configureMocks({
        instructionOptions: {
          getLegsFromChain: { data: [{ from, to: toAccount, amount, asset }], next: null },
          detailsFromChain: instructionDetails,
        },
      });
      const proc = procedureMockUtils.getInstance<Params, Instruction, Storage>(mockContext);

      const boundFunc = prepareStorage.bind(proc);

      const result = await boundFunc({
        id: new BigNumber(1),
        skipAffirmationCheck: false,
      });

      expect(result).toEqual({
        allowedAssetHolders: [],
        instructionDetails,
        signerDid: did,
        offChainParties: new Set<string>(),
        mediatorDids: [],
      });
    });

    it('should return Account as allowed asset holder if Account identity did matches signer did, and return mediator DIDs if instruction has mediators', async () => {
      from.isCustodiedBy = jest.fn().mockResolvedValue(false);
      const toAccount = entityMockUtils.getAccountInstance({
        getIdentity: entityMockUtils.getIdentityInstance({ did }),
      });

      when(assetHolderLikeToAssetHolderSpy)
        .calledWith(toAccount, mockContext)
        .mockReturnValue(toAccount);

      const mediatorDid = 'mediatorDid';
      entityMockUtils.configureMocks({
        instructionOptions: {
          getLegsFromChain: { data: [{ from, to: toAccount, amount, asset }], next: null },
          detailsFromChain: instructionDetails,
          getMediators: [
            {
              identity: entityMockUtils.getIdentityInstance({ did: mediatorDid }),
              status: AffirmationStatus.Unknown,
            },
          ],
        },
      });
      const proc = procedureMockUtils.getInstance<Params, Instruction, Storage>(mockContext);

      const boundFunc = prepareStorage.bind(proc);

      const result = await boundFunc({
        id: new BigNumber(1),
        skipAffirmationCheck: false,
      });

      expect(result).toEqual({
        allowedAssetHolders: [toAccount],
        instructionDetails,
        signerDid: did,
        offChainParties: new Set<string>(),
        mediatorDids: [mediatorDid],
      });
    });

    it('should treat Account as not allowed when getIdentity resolves to null', async () => {
      from.isCustodiedBy = jest.fn().mockResolvedValue(false);
      const toAccount = entityMockUtils.getAccountInstance({
        getIdentity: jest.fn().mockResolvedValue(null),
      });

      when(assetHolderLikeToAssetHolderSpy)
        .calledWith(toAccount, mockContext)
        .mockReturnValue(toAccount);

      entityMockUtils.configureMocks({
        instructionOptions: {
          getLegsFromChain: { data: [{ from, to: toAccount, amount, asset }], next: null },
          detailsFromChain: instructionDetails,
        },
      });
      const proc = procedureMockUtils.getInstance<Params, Instruction, Storage>(mockContext);

      const boundFunc = prepareStorage.bind(proc);

      const result = await boundFunc({
        id: new BigNumber(1),
        skipAffirmationCheck: false,
      });

      expect(result).toEqual({
        allowedAssetHolders: [],
        instructionDetails,
        signerDid: did,
        offChainParties: new Set<string>(),
        mediatorDids: [],
      });
    });
  });
});

describe('executeManualInstruction', () => {
  it('should be instance of Procedure', () => {
    expect(executeManualInstruction()).toBeInstanceOf(Procedure);
  });
});
