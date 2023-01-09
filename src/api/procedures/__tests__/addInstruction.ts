import { Option, u32, u64 } from '@polkadot/types';
import { Balance, Moment } from '@polkadot/types/interfaces';
import { PalletSettlementInstructionMemo } from '@polkadot/types/lookup';
import { ISubmittableResult } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';
import { PortfolioId, SettlementType, Ticker } from 'polymesh-types/types';
import sinon from 'sinon';

import {
  createAddInstructionResolver,
  getAuthorization,
  Params,
  prepareAddInstruction,
  prepareStorage,
  Storage,
} from '~/api/procedures/addInstruction';
import {
  Context,
  DefaultPortfolio,
  Instruction,
  NumberedPortfolio,
  PostTransactionValue,
} from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import {
  ErrorCode,
  InstructionType,
  PortfolioLike,
  RoleType,
  TickerReservationStatus,
  TxTags,
} from '~/types';
import { PolymeshTx } from '~/types/internal';
import * as utilsConversionModule from '~/utils/conversion';
import * as utilsInternalModule from '~/utils/internal';

jest.mock(
  '~/api/entities/Venue',
  require('~/testUtils/mocks/entities').mockVenueModule('~/api/entities/Venue')
);

describe('addInstruction procedure', () => {
  let mockContext: Mocked<Context>;
  let portfolioIdToMeshPortfolioIdStub: sinon.SinonStub;
  let portfolioLikeToPortfolioIdStub: sinon.SinonStub;
  let portfolioLikeToPortfolioStub: sinon.SinonStub;
  let getCustodianStub: sinon.SinonStub;
  let stringToTickerStub: sinon.SinonStub<[string, Context], Ticker>;
  let bigNumberToU64Stub: sinon.SinonStub<[BigNumber, Context], u64>;
  let bigNumberToBalanceStub: sinon.SinonStub<
    [BigNumber, Context, (boolean | undefined)?],
    Balance
  >;
  let endConditionToSettlementTypeStub: sinon.SinonStub<
    [
      (
        | { type: InstructionType.SettleOnAffirmation }
        | { type: InstructionType.SettleOnBlock; value: BigNumber }
      ),
      Context
    ],
    SettlementType
  >;
  let dateToMomentStub: sinon.SinonStub<[Date, Context], Moment>;
  let stringToInstructionMemoStub: sinon.SinonStub;
  let venueId: BigNumber;
  let amount: BigNumber;
  let from: PortfolioLike;
  let to: PortfolioLike;
  let fromDid: string;
  let toDid: string;
  let fromPortfolio: DefaultPortfolio | NumberedPortfolio;
  let toPortfolio: DefaultPortfolio | NumberedPortfolio;
  let asset: string;
  let tradeDate: Date;
  let valueDate: Date;
  let endBlock: BigNumber;
  let memo: string;
  let args: Params;

  let rawVenueId: u64;
  let rawAmount: Balance;
  let rawFrom: PortfolioId;
  let rawTo: PortfolioId;
  let rawTicker: Ticker;
  let rawTradeDate: Moment;
  let rawValueDate: Moment;
  let rawEndBlock: u32;
  let rawInstructionMemo: PalletSettlementInstructionMemo;
  let rawAuthSettlementType: SettlementType;
  let rawBlockSettlementType: SettlementType;
  let rawLeg: { from: PortfolioId; to: PortfolioId; asset: Ticker; amount: Balance };

  let instruction: PostTransactionValue<Instruction[]>;
  let addBatchTransactionStub: sinon.SinonStub;

  beforeAll(() => {
    dsMockUtils.initMocks({
      contextOptions: {
        balance: {
          free: new BigNumber(500),
          locked: new BigNumber(0),
          total: new BigNumber(500),
        },
      },
    });
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    portfolioIdToMeshPortfolioIdStub = sinon.stub(
      utilsConversionModule,
      'portfolioIdToMeshPortfolioId'
    );
    portfolioLikeToPortfolioIdStub = sinon.stub(
      utilsConversionModule,
      'portfolioLikeToPortfolioId'
    );
    portfolioLikeToPortfolioStub = sinon.stub(utilsConversionModule, 'portfolioLikeToPortfolio');
    getCustodianStub = sinon.stub();
    stringToTickerStub = sinon.stub(utilsConversionModule, 'stringToTicker');
    bigNumberToU64Stub = sinon.stub(utilsConversionModule, 'bigNumberToU64');
    bigNumberToBalanceStub = sinon.stub(utilsConversionModule, 'bigNumberToBalance');
    endConditionToSettlementTypeStub = sinon.stub(
      utilsConversionModule,
      'endConditionToSettlementType'
    );
    dateToMomentStub = sinon.stub(utilsConversionModule, 'dateToMoment');
    stringToInstructionMemoStub = sinon.stub(utilsConversionModule, 'stringToInstructionMemo');
    venueId = new BigNumber(1);
    amount = new BigNumber(100);
    from = 'fromDid';
    to = 'toDid';
    fromDid = 'fromDid';
    toDid = 'toDid';
    fromPortfolio = entityMockUtils.getNumberedPortfolioInstance({
      did: fromDid,
      id: new BigNumber(1),
    });
    toPortfolio = entityMockUtils.getNumberedPortfolioInstance({
      did: toDid,
      id: new BigNumber(2),
    });
    asset = 'SOME_ASSET';
    const now = new Date();
    tradeDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    valueDate = new Date(now.getTime() + 24 * 60 * 60 * 1000 + 1);
    endBlock = new BigNumber(1000);
    memo = 'SOME_MEMO';
    rawVenueId = dsMockUtils.createMockU64(venueId);
    rawAmount = dsMockUtils.createMockBalance(amount);
    rawFrom = dsMockUtils.createMockPortfolioId({
      did: dsMockUtils.createMockIdentityId(from),
      kind: dsMockUtils.createMockPortfolioKind('Default'),
    });
    rawTo = dsMockUtils.createMockPortfolioId({
      did: dsMockUtils.createMockIdentityId(to),
      kind: dsMockUtils.createMockPortfolioKind('Default'),
    });
    rawTicker = dsMockUtils.createMockTicker(asset);
    rawTradeDate = dsMockUtils.createMockMoment(new BigNumber(tradeDate.getTime()));
    rawValueDate = dsMockUtils.createMockMoment(new BigNumber(valueDate.getTime()));
    rawEndBlock = dsMockUtils.createMockU32(endBlock);
    rawInstructionMemo = dsMockUtils.createMockInstructionMemo(memo);
    rawAuthSettlementType = dsMockUtils.createMockSettlementType('SettleOnAffirmation');
    rawBlockSettlementType = dsMockUtils.createMockSettlementType({ SettleOnBlock: rawEndBlock });
    rawLeg = {
      from: rawFrom,
      to: rawTo,
      amount: rawAmount,
      asset: rawTicker,
    };

    instruction = ['instruction'] as unknown as PostTransactionValue<[Instruction]>;
  });

  let addAndAuthorizeInstructionTransaction: PolymeshTx<
    [
      u64,
      SettlementType,
      Option<Moment>,
      { from: PortfolioId; to: PortfolioId; asset: Ticker; amount: Balance }[],
      PortfolioId[],
      Option<PalletSettlementInstructionMemo>
    ]
  >;
  let addInstructionTransaction: PolymeshTx<
    [
      u64,
      SettlementType,
      Option<Moment>,
      { from: PortfolioId; to: PortfolioId; asset: Ticker; amount: Balance }[],
      Option<PalletSettlementInstructionMemo>
    ]
  >;

  beforeEach(() => {
    addBatchTransactionStub = procedureMockUtils
      .getAddBatchTransactionStub()
      .returns([instruction]);

    const tickerReservationDetailsStub = sinon.stub();
    tickerReservationDetailsStub.resolves({
      owner: entityMockUtils.getIdentityInstance(),
      expiryDate: null,
      status: TickerReservationStatus.Free,
    });

    addAndAuthorizeInstructionTransaction = dsMockUtils.createTxStub(
      'settlement',
      'addAndAffirmInstructionWithMemo'
    );
    addInstructionTransaction = dsMockUtils.createTxStub('settlement', 'addInstructionWithMemo');

    mockContext = dsMockUtils.getContextInstance();

    portfolioLikeToPortfolioIdStub.withArgs(from).returns({ did: fromDid });
    portfolioLikeToPortfolioIdStub.withArgs(to).returns({ did: toDid });
    portfolioLikeToPortfolioIdStub.withArgs(fromPortfolio).returns({ did: fromDid });
    portfolioLikeToPortfolioIdStub.withArgs(toPortfolio).returns({ did: toDid });
    portfolioLikeToPortfolioStub.withArgs(from, mockContext).returns(fromPortfolio);
    portfolioLikeToPortfolioStub.withArgs(to, mockContext).returns(toPortfolio);
    portfolioIdToMeshPortfolioIdStub.withArgs({ did: fromDid }, mockContext).returns(rawFrom);
    portfolioIdToMeshPortfolioIdStub.withArgs({ did: toDid }, mockContext).returns(rawTo);
    getCustodianStub.onCall(0).returns({ did: fromDid });
    getCustodianStub.onCall(1).returns({ did: toDid });
    entityMockUtils.configureMocks({
      numberedPortfolioOptions: {
        getCustodian: getCustodianStub,
      },
      tickerReservationOptions: {
        details: tickerReservationDetailsStub,
      },
    });
    stringToTickerStub.withArgs(asset, mockContext).returns(rawTicker);
    bigNumberToU64Stub.withArgs(venueId, mockContext).returns(rawVenueId);
    bigNumberToBalanceStub.withArgs(amount, mockContext).returns(rawAmount);
    endConditionToSettlementTypeStub
      .withArgs({ type: InstructionType.SettleOnBlock, value: endBlock }, mockContext)
      .returns(rawBlockSettlementType);
    endConditionToSettlementTypeStub
      .withArgs({ type: InstructionType.SettleOnAffirmation }, mockContext)
      .returns(rawAuthSettlementType);
    dateToMomentStub.withArgs(tradeDate, mockContext).returns(rawTradeDate);
    dateToMomentStub.withArgs(valueDate, mockContext).returns(rawValueDate);
    stringToInstructionMemoStub.withArgs(memo, mockContext).returns(rawInstructionMemo);

    args = {
      venueId,
      instructions: [
        {
          legs: [
            {
              from,
              to,
              asset,
              amount,
            },
          ],
        },
      ],
    };
  });

  afterEach(() => {
    entityMockUtils.reset();
    procedureMockUtils.reset();
    dsMockUtils.reset();
    sinon.reset();
  });

  afterAll(() => {
    procedureMockUtils.cleanup();
    dsMockUtils.cleanup();
  });

  it('should throw an error if the instructions array is empty', async () => {
    const proc = procedureMockUtils.getInstance<Params, Instruction[], Storage>(mockContext, {
      portfoliosToAffirm: [],
    });

    let error;

    try {
      await prepareAddInstruction.call(proc, { venueId, instructions: [] });
    } catch (err) {
      error = err;
    }

    expect(error.message).toBe('The Instructions array cannot be empty');
    expect(error.code).toBe(ErrorCode.ValidationError);
  });

  it('should throw an error if the legs array is empty', async () => {
    const proc = procedureMockUtils.getInstance<Params, Instruction[], Storage>(mockContext, {
      portfoliosToAffirm: [],
    });

    entityMockUtils.configureMocks({
      venueOptions: { exists: true },
    });

    let error;

    try {
      await prepareAddInstruction.call(proc, { venueId, instructions: [{ legs: [] }] });
    } catch (err) {
      error = err;
    }

    expect(error.message).toBe("The legs array can't be empty");
    expect(error.code).toBe(ErrorCode.ValidationError);
    expect(error.data.failedInstructionIndexes[0]).toBe(0);
  });

  it('should throw an error if any instruction contains leg with zero amount', async () => {
    const proc = procedureMockUtils.getInstance<Params, Instruction[], Storage>(mockContext, {
      portfoliosToAffirm: [],
    });

    entityMockUtils.configureMocks({
      venueOptions: { exists: true },
    });

    let error;
    const legs = Array(2).fill({
      from,
      to,
      amount: new BigNumber(0),
      asset: entityMockUtils.getAssetInstance({ ticker: asset }),
    });
    try {
      await prepareAddInstruction.call(proc, { venueId, instructions: [{ legs }] });
    } catch (err) {
      error = err;
    }

    expect(error.message).toBe('Instruction legs cannot have zero amount');
    expect(error.code).toBe(ErrorCode.ValidationError);
    expect(error.data.failedInstructionIndexes[0]).toBe(0);
  });

  it("should throw an error if the Venue doesn't exist", async () => {
    const proc = procedureMockUtils.getInstance<Params, Instruction[], Storage>(mockContext, {
      portfoliosToAffirm: [],
    });

    entityMockUtils.configureMocks({
      venueOptions: { exists: false },
    });

    let error;

    try {
      await prepareAddInstruction.call(proc, args);
    } catch (err) {
      error = err;
    }

    expect(error.message).toBe("The Venue doesn't exist");
    expect(error.code).toBe(ErrorCode.DataUnavailable);
  });

  it('should throw an error if the legs array exceeds limit', async () => {
    const proc = procedureMockUtils.getInstance<Params, Instruction[], Storage>(mockContext, {
      portfoliosToAffirm: [],
    });

    entityMockUtils.configureMocks({
      venueOptions: {
        exists: true,
      },
    });

    let error;

    const legs = Array(11).fill({
      from,
      to,
      amount,
      asset: entityMockUtils.getAssetInstance({ ticker: asset }),
    });

    try {
      await prepareAddInstruction.call(proc, { venueId, instructions: [{ legs }] });
    } catch (err) {
      error = err;
    }

    expect(error.message).toBe('The legs array exceeds the maximum allowed length');
    expect(error.code).toBe(ErrorCode.LimitExceeded);
  });

  it('should throw an error if the end block is in the past', async () => {
    dsMockUtils.configureMocks({ contextOptions: { latestBlock: new BigNumber(1000) } });

    entityMockUtils.configureMocks({
      venueOptions: {
        exists: true,
      },
    });

    const proc = procedureMockUtils.getInstance<Params, Instruction[], Storage>(mockContext, {
      portfoliosToAffirm: [],
    });

    let error;

    try {
      await prepareAddInstruction.call(proc, {
        venueId,
        instructions: [
          {
            legs: [
              {
                from,
                to,
                amount,
                asset: entityMockUtils.getAssetInstance({ ticker: asset }),
              },
            ],
            endBlock: new BigNumber(100),
          },
        ],
      });
    } catch (err) {
      error = err;
    }

    expect(error.message).toBe('End block must be a future block');
    expect(error.code).toBe(ErrorCode.ValidationError);
    expect(error.data.failedInstructionIndexes[0]).toBe(0);
  });

  it('should throw an error if the value date is before the trade date', async () => {
    dsMockUtils.configureMocks({ contextOptions: { latestBlock: new BigNumber(1000) } });
    entityMockUtils.configureMocks({
      venueOptions: {
        exists: true,
      },
    });
    const proc = procedureMockUtils.getInstance<Params, Instruction[], Storage>(mockContext, {
      portfoliosToAffirm: [],
    });

    let error;

    try {
      await prepareAddInstruction.call(proc, {
        venueId,
        instructions: [
          {
            legs: [
              {
                from,
                to,
                asset: asset,
                amount,
              },
            ],
            tradeDate: new Date(valueDate.getTime() + 1),
            valueDate,
          },
        ],
      });
    } catch (err) {
      error = err;
    }

    expect(error.message).toBe('Value date must be after trade date');
    expect(error.code).toBe(ErrorCode.ValidationError);
    expect(error.data.failedInstructionIndexes[0]).toBe(0);
  });

  it('should add an add and authorize instruction transaction to the queue', async () => {
    dsMockUtils.configureMocks({ contextOptions: { did: fromDid } });
    entityMockUtils.configureMocks({
      venueOptions: {
        exists: true,
      },
    });
    getCustodianStub.onCall(1).returns({ did: fromDid });
    const proc = procedureMockUtils.getInstance<Params, Instruction[], Storage>(mockContext, {
      portfoliosToAffirm: [[fromPortfolio, toPortfolio]],
    });

    const result = await prepareAddInstruction.call(proc, args);

    sinon.assert.calledWith(
      addBatchTransactionStub,
      sinon.match({
        transactions: [
          {
            transaction: addAndAuthorizeInstructionTransaction,
            args: [rawVenueId, rawAuthSettlementType, null, null, [rawLeg], [rawFrom, rawTo], null],
          },
        ],
        resolvers: sinon.match.array,
      })
    );
    expect(result).toBe(instruction);
  });

  it('should add an add instruction transaction to the queue', async () => {
    dsMockUtils.configureMocks({ contextOptions: { did: fromDid } });
    entityMockUtils.configureMocks({
      venueOptions: {
        exists: true,
      },
    });
    getCustodianStub.onCall(0).returns({ did: toDid });
    const proc = procedureMockUtils.getInstance<Params, Instruction[], Storage>(mockContext, {
      portfoliosToAffirm: [[]],
    });

    const result = await prepareAddInstruction.call(proc, {
      venueId,
      instructions: [
        {
          legs: [
            {
              from,
              to,
              amount,
              asset: entityMockUtils.getAssetInstance({ ticker: asset }),
            },
          ],
          tradeDate,
          valueDate,
          endBlock,
          memo,
        },
      ],
    });

    sinon.assert.calledWith(
      addBatchTransactionStub,
      sinon.match({
        transactions: [
          {
            transaction: addInstructionTransaction,
            args: [
              rawVenueId,
              rawBlockSettlementType,
              rawTradeDate,
              rawValueDate,
              [rawLeg],
              rawInstructionMemo,
            ],
          },
        ],
        resolvers: sinon.match.array,
      })
    );
    expect(result).toBe(instruction);
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', async () => {
      let proc = procedureMockUtils.getInstance<Params, Instruction[], Storage>(mockContext, {
        portfoliosToAffirm: [[fromPortfolio, toPortfolio]],
      });
      let boundFunc = getAuthorization.bind(proc);

      let result = await boundFunc({
        venueId,
        instructions: [
          { legs: [{ from: fromPortfolio, to: toPortfolio, amount, asset: 'SOME_ASSET' }] },
        ],
      });

      expect(result).toEqual({
        roles: [{ type: RoleType.VenueOwner, venueId }],
        permissions: {
          assets: [],
          portfolios: [fromPortfolio, toPortfolio],
          transactions: [TxTags.settlement.AddAndAffirmInstructionWithMemo],
        },
      });

      proc = procedureMockUtils.getInstance<Params, Instruction[], Storage>(mockContext, {
        portfoliosToAffirm: [[]],
      });
      boundFunc = getAuthorization.bind(proc);

      result = await boundFunc({
        venueId,
        instructions: [
          { legs: [{ from: fromPortfolio, to: toPortfolio, amount, asset: 'SOME_ASSET' }] },
        ],
      });

      expect(result).toEqual({
        roles: [{ type: RoleType.VenueOwner, venueId }],
        permissions: {
          assets: [],
          portfolios: [],
          transactions: [TxTags.settlement.AddInstructionWithMemo],
        },
      });
    });
  });

  describe('prepareStorage', () => {
    it('should return the list of portfolios that will be affirmed', async () => {
      const proc = procedureMockUtils.getInstance<Params, Instruction[], Storage>(mockContext);
      const boundFunc = prepareStorage.bind(proc);

      fromPortfolio = entityMockUtils.getNumberedPortfolioInstance({ isCustodiedBy: true });
      toPortfolio = entityMockUtils.getNumberedPortfolioInstance({ isCustodiedBy: true });

      portfolioLikeToPortfolioStub.withArgs(from, mockContext).returns(fromPortfolio);
      portfolioLikeToPortfolioStub.withArgs(to, mockContext).returns(toPortfolio);

      let result = await boundFunc(args);

      expect(result).toEqual({
        portfoliosToAffirm: [[fromPortfolio, toPortfolio]],
      });

      fromPortfolio = entityMockUtils.getNumberedPortfolioInstance({ isCustodiedBy: false });
      toPortfolio = entityMockUtils.getNumberedPortfolioInstance({ isCustodiedBy: false });

      portfolioLikeToPortfolioStub.withArgs(from, mockContext).returns(fromPortfolio);
      portfolioLikeToPortfolioStub.withArgs(to, mockContext).returns(toPortfolio);

      result = await boundFunc(args);

      expect(result).toEqual({
        portfoliosToAffirm: [[]],
      });
    });
  });
});

describe('createAddInstructionResolver', () => {
  const filterEventRecordsStub = sinon.stub(utilsInternalModule, 'filterEventRecords');
  const id = new BigNumber(10);
  const rawId = dsMockUtils.createMockU64(id);

  beforeAll(() => {
    entityMockUtils.initMocks({
      instructionOptions: {
        id,
      },
    });
  });

  beforeEach(() => {
    filterEventRecordsStub.returns([dsMockUtils.createMockIEvent(['did', 'venueId', rawId])]);
  });

  afterEach(() => {
    filterEventRecordsStub.reset();
  });

  it('should return the new Instruction', () => {
    const fakeContext = {} as Context;

    const result = createAddInstructionResolver(fakeContext)({} as ISubmittableResult);

    expect(result[0].id).toEqual(id);
  });

  it('should return a list of new Instructions', () => {
    const fakeContext = {} as Context;
    const previousInstructionId = new BigNumber(2);

    const previousInstructions = {
      value: [new Instruction({ id: previousInstructionId }, fakeContext)],
    } as unknown as PostTransactionValue<Instruction[]>;

    const result = createAddInstructionResolver(
      fakeContext,
      previousInstructions
    )({} as ISubmittableResult);

    expect(result.length).toEqual(2);
    expect(result[0].id).toEqual(previousInstructionId);
    expect(result[1].id).toEqual(id);
  });
});
