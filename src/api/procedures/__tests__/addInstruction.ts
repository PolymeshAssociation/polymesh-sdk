import { Option, u32, u64 } from '@polkadot/types';
import { Balance, Moment } from '@polkadot/types/interfaces';
import {
  PalletSettlementInstructionMemo,
  PalletSettlementSettlementType,
  PolymeshPrimitivesIdentityIdPortfolioId,
  PolymeshPrimitivesTicker,
} from '@polkadot/types/lookup';
import { ISubmittableResult } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import {
  createAddInstructionResolver,
  getAuthorization,
  Params,
  prepareAddInstruction,
  prepareStorage,
  Storage,
} from '~/api/procedures/addInstruction';
import { Context, DefaultPortfolio, Instruction, NumberedPortfolio } from '~/internal';
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
  let portfolioIdToMeshPortfolioIdSpy: jest.SpyInstance;
  let portfolioLikeToPortfolioIdSpy: jest.SpyInstance;
  let portfolioLikeToPortfolioSpy: jest.SpyInstance;
  let getCustodianMock: jest.Mock;
  let stringToTickerSpy: jest.SpyInstance<PolymeshPrimitivesTicker, [string, Context]>;
  let bigNumberToU64Spy: jest.SpyInstance<u64, [BigNumber, Context]>;
  let bigNumberToBalanceSpy: jest.SpyInstance<
    Balance,
    [BigNumber, Context, (boolean | undefined)?]
  >;
  let endConditionToSettlementTypeSpy: jest.SpyInstance<
    PalletSettlementSettlementType,
    [
      (
        | { type: InstructionType.SettleOnAffirmation }
        | { type: InstructionType.SettleOnBlock; value: BigNumber }
      ),
      Context
    ]
  >;
  let dateToMomentSpy: jest.SpyInstance<Moment, [Date, Context]>;
  let stringToInstructionMemoSpy: jest.SpyInstance;
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
  let rawFrom: PolymeshPrimitivesIdentityIdPortfolioId;
  let rawTo: PolymeshPrimitivesIdentityIdPortfolioId;
  let rawTicker: PolymeshPrimitivesTicker;
  let rawTradeDate: Moment;
  let rawValueDate: Moment;
  let rawEndBlock: u32;
  let rawInstructionMemo: PalletSettlementInstructionMemo;
  let rawAuthSettlementType: PalletSettlementSettlementType;
  let rawBlockSettlementType: PalletSettlementSettlementType;
  let rawLeg: {
    from: PolymeshPrimitivesIdentityIdPortfolioId;
    to: PolymeshPrimitivesIdentityIdPortfolioId;
    asset: PolymeshPrimitivesTicker;
    amount: Balance;
  };

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
    portfolioIdToMeshPortfolioIdSpy = jest.spyOn(
      utilsConversionModule,
      'portfolioIdToMeshPortfolioId'
    );
    portfolioLikeToPortfolioIdSpy = jest.spyOn(utilsConversionModule, 'portfolioLikeToPortfolioId');
    portfolioLikeToPortfolioSpy = jest.spyOn(utilsConversionModule, 'portfolioLikeToPortfolio');
    getCustodianMock = jest.fn();
    stringToTickerSpy = jest.spyOn(utilsConversionModule, 'stringToTicker');
    bigNumberToU64Spy = jest.spyOn(utilsConversionModule, 'bigNumberToU64');
    bigNumberToBalanceSpy = jest.spyOn(utilsConversionModule, 'bigNumberToBalance');
    endConditionToSettlementTypeSpy = jest.spyOn(
      utilsConversionModule,
      'endConditionToSettlementType'
    );
    dateToMomentSpy = jest.spyOn(utilsConversionModule, 'dateToMoment');
    stringToInstructionMemoSpy = jest.spyOn(utilsConversionModule, 'stringToInstructionMemo');

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
  });

  let addAndAuthorizeInstructionTransaction: PolymeshTx<
    [
      u64,
      PalletSettlementSettlementType,
      Option<Moment>,
      {
        from: PolymeshPrimitivesIdentityIdPortfolioId;
        to: PolymeshPrimitivesIdentityIdPortfolioId;
        asset: PolymeshPrimitivesTicker;
        amount: Balance;
      }[],
      PolymeshPrimitivesIdentityIdPortfolioId[],
      Option<PalletSettlementInstructionMemo>
    ]
  >;
  let addInstructionTransaction: PolymeshTx<
    [
      u64,
      PalletSettlementSettlementType,
      Option<Moment>,
      {
        from: PolymeshPrimitivesIdentityIdPortfolioId;
        to: PolymeshPrimitivesIdentityIdPortfolioId;
        asset: PolymeshPrimitivesTicker;
        amount: Balance;
      }[],
      Option<PalletSettlementInstructionMemo>
    ]
  >;

  beforeEach(() => {
    const tickerReservationDetailsMock = jest.fn();
    tickerReservationDetailsMock.mockResolvedValue({
      owner: entityMockUtils.getIdentityInstance(),
      expiryDate: null,
      status: TickerReservationStatus.Free,
    });

    addAndAuthorizeInstructionTransaction = dsMockUtils.createTxMock(
      'settlement',
      'addAndAffirmInstructionWithMemo'
    );
    addInstructionTransaction = dsMockUtils.createTxMock('settlement', 'addInstructionWithMemo');

    mockContext = dsMockUtils.getContextInstance();

    when(portfolioLikeToPortfolioIdSpy).calledWith(from).mockReturnValue({ did: fromDid });
    when(portfolioLikeToPortfolioIdSpy).calledWith(to).mockReturnValue({ did: toDid });
    when(portfolioLikeToPortfolioIdSpy).calledWith(fromPortfolio).mockReturnValue({ did: fromDid });
    when(portfolioLikeToPortfolioIdSpy).calledWith(toPortfolio).mockReturnValue({ did: toDid });
    when(portfolioLikeToPortfolioSpy).calledWith(from, mockContext).mockReturnValue(fromPortfolio);
    when(portfolioLikeToPortfolioSpy).calledWith(to, mockContext).mockReturnValue(toPortfolio);
    when(portfolioIdToMeshPortfolioIdSpy)
      .calledWith({ did: fromDid }, mockContext)
      .mockReturnValue(rawFrom);
    when(portfolioIdToMeshPortfolioIdSpy)
      .calledWith({ did: toDid }, mockContext)
      .mockReturnValue(rawTo);
    getCustodianMock.mockReturnValueOnce({ did: fromDid }).mockReturnValue({ did: toDid });
    entityMockUtils.configureMocks({
      numberedPortfolioOptions: {
        getCustodian: getCustodianMock,
      },
      tickerReservationOptions: {
        details: tickerReservationDetailsMock,
      },
    });
    when(stringToTickerSpy).calledWith(asset, mockContext).mockReturnValue(rawTicker);
    when(bigNumberToU64Spy).calledWith(venueId, mockContext).mockReturnValue(rawVenueId);
    when(bigNumberToBalanceSpy).calledWith(amount, mockContext).mockReturnValue(rawAmount);
    when(endConditionToSettlementTypeSpy)
      .calledWith({ type: InstructionType.SettleOnBlock, value: endBlock }, mockContext)
      .mockReturnValue(rawBlockSettlementType);
    when(endConditionToSettlementTypeSpy)
      .calledWith({ type: InstructionType.SettleOnAffirmation }, mockContext)
      .mockReturnValue(rawAuthSettlementType);
    when(dateToMomentSpy).calledWith(tradeDate, mockContext).mockReturnValue(rawTradeDate);
    when(dateToMomentSpy).calledWith(valueDate, mockContext).mockReturnValue(rawValueDate);
    when(stringToInstructionMemoSpy)
      .calledWith(memo, mockContext)
      .mockReturnValue(rawInstructionMemo);

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
    jest.resetAllMocks();
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

  it('should throw an error if any instruction contains leg with transferring Assets within same Identity portfolios', async () => {
    const proc = procedureMockUtils.getInstance<Params, Instruction[], Storage>(mockContext, {
      portfoliosToAffirm: [],
    });

    entityMockUtils.configureMocks({
      venueOptions: { exists: true },
    });

    let error;
    const legs = Array(2).fill({
      from: to,
      to,
      amount: new BigNumber(10),
      asset: entityMockUtils.getAssetInstance({ ticker: asset }),
    });
    try {
      await prepareAddInstruction.call(proc, { venueId, instructions: [{ legs }] });
    } catch (err) {
      error = err;
    }

    expect(error.message).toBe('Instruction leg cannot transfer Assets between same identity');
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

  it('should return an add and authorize instruction transaction spec', async () => {
    dsMockUtils.configureMocks({ contextOptions: { did: fromDid } });
    entityMockUtils.configureMocks({
      venueOptions: {
        exists: true,
      },
    });
    getCustodianMock.mockReturnValue({ did: fromDid });
    const proc = procedureMockUtils.getInstance<Params, Instruction[], Storage>(mockContext, {
      portfoliosToAffirm: [[fromPortfolio, toPortfolio]],
    });

    const result = await prepareAddInstruction.call(proc, args);

    expect(result).toEqual({
      transactions: [
        {
          transaction: addAndAuthorizeInstructionTransaction,
          args: [rawVenueId, rawAuthSettlementType, null, null, [rawLeg], [rawFrom, rawTo], null],
        },
      ],
      resolver: expect.any(Function),
    });
  });

  it('should return an add instruction transaction spec', async () => {
    dsMockUtils.configureMocks({ contextOptions: { did: fromDid } });
    entityMockUtils.configureMocks({
      venueOptions: {
        exists: true,
      },
    });
    getCustodianMock.mockReturnValue({ did: toDid });
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

    expect(result).toEqual({
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
      resolver: expect.any(Function),
    });
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

      when(portfolioLikeToPortfolioSpy)
        .calledWith(from, mockContext)
        .mockReturnValue(fromPortfolio);
      when(portfolioLikeToPortfolioSpy).calledWith(to, mockContext).mockReturnValue(toPortfolio);

      let result = await boundFunc(args);

      expect(result).toEqual({
        portfoliosToAffirm: [[fromPortfolio, toPortfolio]],
      });

      fromPortfolio = entityMockUtils.getNumberedPortfolioInstance({ isCustodiedBy: false });
      toPortfolio = entityMockUtils.getNumberedPortfolioInstance({ isCustodiedBy: false });

      when(portfolioLikeToPortfolioSpy)
        .calledWith(from, mockContext)
        .mockReturnValue(fromPortfolio);
      when(portfolioLikeToPortfolioSpy).calledWith(to, mockContext).mockReturnValue(toPortfolio);

      result = await boundFunc(args);

      expect(result).toEqual({
        portfoliosToAffirm: [[]],
      });
    });
  });
});

describe('createAddInstructionResolver', () => {
  const filterEventRecordsSpy = jest.spyOn(utilsInternalModule, 'filterEventRecords');
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
    filterEventRecordsSpy.mockReturnValue([
      dsMockUtils.createMockIEvent(['did', 'venueId', rawId]),
    ]);
  });

  afterEach(() => {
    filterEventRecordsSpy.mockReset();
  });

  it('should return the new Instruction', () => {
    const fakeContext = {} as Context;

    const result = createAddInstructionResolver(fakeContext)({} as ISubmittableResult);

    expect(result[0].id).toEqual(id);
  });
});
