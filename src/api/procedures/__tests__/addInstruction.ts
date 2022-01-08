import { Option, u32, u64 } from '@polkadot/types';
import { Balance, Moment } from '@polkadot/types/interfaces';
import { ISubmittableResult } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';
import { PortfolioId, SettlementType, Ticker, TxTags } from 'polymesh-types/types';
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
  Venue,
} from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { InstructionType, PortfolioLike, RoleType, TickerReservationStatus } from '~/types';
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
  let numberToU64Stub: sinon.SinonStub<[number | BigNumber, Context], u64>;
  let numberToBalanceStub: sinon.SinonStub<
    [number | BigNumber, Context, (boolean | undefined)?],
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
  let venueId: BigNumber;
  let amount: BigNumber;
  let from: PortfolioLike;
  let to: PortfolioLike;
  let fromDid: string;
  let toDid: string;
  let fromPortfolio: DefaultPortfolio | NumberedPortfolio;
  let toPortfolio: DefaultPortfolio | NumberedPortfolio;
  let token: string;
  let tradeDate: Date;
  let valueDate: Date;
  let endBlock: BigNumber;
  let args: Params;
  let venue: Mocked<Venue>;

  let rawVenueId: u64;
  let rawAmount: Balance;
  let rawFrom: PortfolioId;
  let rawTo: PortfolioId;
  let rawToken: Ticker;
  let rawTradeDate: Moment;
  let rawValueDate: Moment;
  let rawEndBlock: u32;
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
    getCustodianStub = entityMockUtils.getNumberedPortfolioGetCustodianStub();
    stringToTickerStub = sinon.stub(utilsConversionModule, 'stringToTicker');
    numberToU64Stub = sinon.stub(utilsConversionModule, 'numberToU64');
    numberToBalanceStub = sinon.stub(utilsConversionModule, 'numberToBalance');
    endConditionToSettlementTypeStub = sinon.stub(
      utilsConversionModule,
      'endConditionToSettlementType'
    );
    dateToMomentStub = sinon.stub(utilsConversionModule, 'dateToMoment');
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
    token = 'SOME_TOKEN';
    const now = new Date();
    tradeDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    valueDate = new Date(now.getTime() + 24 * 60 * 60 * 1000 + 1);
    endBlock = new BigNumber(1000);
    rawVenueId = dsMockUtils.createMockU64(venueId.toNumber());
    rawAmount = dsMockUtils.createMockBalance(amount.toNumber());
    rawFrom = dsMockUtils.createMockPortfolioId({
      did: dsMockUtils.createMockIdentityId(from),
      kind: dsMockUtils.createMockPortfolioKind('Default'),
    });
    rawTo = dsMockUtils.createMockPortfolioId({
      did: dsMockUtils.createMockIdentityId(to),
      kind: dsMockUtils.createMockPortfolioKind('Default'),
    });
    rawToken = dsMockUtils.createMockTicker(token);
    rawTradeDate = dsMockUtils.createMockMoment(tradeDate.getTime());
    rawValueDate = dsMockUtils.createMockMoment(valueDate.getTime());
    rawEndBlock = dsMockUtils.createMockU32(endBlock.toNumber());
    rawAuthSettlementType = dsMockUtils.createMockSettlementType('SettleOnAffirmation');
    rawBlockSettlementType = dsMockUtils.createMockSettlementType({ SettleOnBlock: rawEndBlock });
    rawLeg = {
      from: rawFrom,
      to: rawTo,
      amount: rawAmount,
      asset: rawToken,
    };

    instruction = (['instruction'] as unknown) as PostTransactionValue<[Instruction]>;
  });

  let addAndAuthorizeInstructionTransaction: PolymeshTx<
    [
      u64,
      SettlementType,
      Option<Moment>,
      { from: PortfolioId; to: PortfolioId; asset: Ticker; amount: Balance }[],
      PortfolioId[]
    ]
  >;
  let addInstructionTransaction: PolymeshTx<
    [
      u64,
      SettlementType,
      Option<Moment>,
      { from: PortfolioId; to: PortfolioId; asset: Ticker; amount: Balance }[]
    ]
  >;

  beforeEach(() => {
    addBatchTransactionStub = procedureMockUtils
      .getAddBatchTransactionStub()
      .returns([instruction]);

    entityMockUtils.getTickerReservationDetailsStub().resolves({
      owner: entityMockUtils.getIdentityInstance(),
      expiryDate: null,
      status: TickerReservationStatus.Free,
    });

    addAndAuthorizeInstructionTransaction = dsMockUtils.createTxStub(
      'settlement',
      'addAndAffirmInstruction'
    );
    addInstructionTransaction = dsMockUtils.createTxStub('settlement', 'addInstruction');

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
    stringToTickerStub.withArgs(token, mockContext).returns(rawToken);
    numberToU64Stub.withArgs(venueId, mockContext).returns(rawVenueId);
    numberToBalanceStub.withArgs(amount, mockContext).returns(rawAmount);
    endConditionToSettlementTypeStub
      .withArgs({ type: InstructionType.SettleOnBlock, value: endBlock }, mockContext)
      .returns(rawBlockSettlementType);
    endConditionToSettlementTypeStub
      .withArgs({ type: InstructionType.SettleOnAffirmation }, mockContext)
      .returns(rawAuthSettlementType);
    dateToMomentStub.withArgs(tradeDate, mockContext).returns(rawTradeDate);
    dateToMomentStub.withArgs(valueDate, mockContext).returns(rawValueDate);

    venue = entityMockUtils.getVenueInstance({ id: venueId });
    args = {
      venue,
      instructions: [
        {
          legs: [
            {
              from,
              to,
              token,
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
    entityMockUtils.cleanup();
    procedureMockUtils.cleanup();
    dsMockUtils.cleanup();
  });

  test('should throw an error if the instructions array is empty', async () => {
    const proc = procedureMockUtils.getInstance<Params, Instruction[], Storage>(mockContext, {
      portfoliosToAffirm: [],
    });

    let error;

    try {
      await prepareAddInstruction.call(proc, { venue, instructions: [] });
    } catch (err) {
      error = err;
    }

    expect(error.message).toBe('The Instructions array cannot be empty');
  });

  test('should throw an error if the legs array is empty', async () => {
    const proc = procedureMockUtils.getInstance<Params, Instruction[], Storage>(mockContext, {
      portfoliosToAffirm: [],
    });

    let error;

    try {
      await prepareAddInstruction.call(proc, { venue, instructions: [{ legs: [] }] });
    } catch (err) {
      error = err;
    }

    expect(error.message).toBe("The legs array can't be empty");
    expect(error.data.failedInstructionIndexes[0]).toBe(0);
  });

  test('should throw an error if the legs array exceeds limit', async () => {
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
      token: entityMockUtils.getSecurityTokenInstance({ ticker: token }),
    });

    try {
      await prepareAddInstruction.call(proc, { venue, instructions: [{ legs }] });
    } catch (err) {
      error = err;
    }

    expect(error.message).toBe('The legs array exceeds the maximum allowed length');
  });

  test('should throw an error if the end block is in the past', async () => {
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
        venue,
        instructions: [
          {
            legs: [
              {
                from,
                to,
                amount,
                token: entityMockUtils.getSecurityTokenInstance({ ticker: token }),
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
    expect(error.data.failedInstructionIndexes[0]).toBe(0);
  });

  test('should throw an error if the value date is before the trade date', async () => {
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
        venue,
        instructions: [
          {
            legs: [
              {
                from,
                to,
                token,
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
    expect(error.data.failedInstructionIndexes[0]).toBe(0);
  });

  test('should add an add and authorize instruction transaction to the queue', async () => {
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
            args: [rawVenueId, rawAuthSettlementType, null, null, [rawLeg], [rawFrom, rawTo]],
          },
        ],
        resolvers: sinon.match.array,
      })
    );
    expect(result).toBe(instruction);
  });

  test('should add an add instruction transaction to the queue', async () => {
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
      venue,
      instructions: [
        {
          legs: [
            {
              from,
              to,
              amount,
              token: entityMockUtils.getSecurityTokenInstance({ ticker: token }),
            },
          ],
          tradeDate,
          valueDate,
          endBlock,
        },
      ],
    });

    sinon.assert.calledWith(
      addBatchTransactionStub,
      sinon.match({
        transactions: [
          {
            transaction: addInstructionTransaction,
            args: [rawVenueId, rawBlockSettlementType, rawTradeDate, rawValueDate, [rawLeg]],
          },
        ],
        resolvers: sinon.match.array,
      })
    );
    expect(result).toBe(instruction);
  });

  describe('getAuthorization', () => {
    test('should return the appropriate roles and permissions', async () => {
      let proc = procedureMockUtils.getInstance<Params, Instruction[], Storage>(mockContext, {
        portfoliosToAffirm: [[fromPortfolio, toPortfolio]],
      });
      let boundFunc = getAuthorization.bind(proc);

      let result = await boundFunc({
        venue,
        instructions: [
          { legs: [{ from: fromPortfolio, to: toPortfolio, amount, token: 'SOME_TOKEN' }] },
        ],
      });

      expect(result).toEqual({
        roles: [{ type: RoleType.VenueOwner, venueId }],
        permissions: {
          tokens: [],
          portfolios: [fromPortfolio, toPortfolio],
          transactions: [TxTags.settlement.AddAndAffirmInstruction],
        },
      });

      proc = procedureMockUtils.getInstance<Params, Instruction[], Storage>(mockContext, {
        portfoliosToAffirm: [[]],
      });
      boundFunc = getAuthorization.bind(proc);

      result = await boundFunc({
        venue,
        instructions: [
          { legs: [{ from: fromPortfolio, to: toPortfolio, amount, token: 'SOME_TOKEN' }] },
        ],
      });

      expect(result).toEqual({
        roles: [{ type: RoleType.VenueOwner, venueId }],
        permissions: {
          tokens: [],
          portfolios: [],
          transactions: [TxTags.settlement.AddInstruction],
        },
      });
    });
  });

  describe('prepareStorage', () => {
    test('should return the list of portfolios that will be affirmed', async () => {
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
  const rawId = dsMockUtils.createMockU64(id.toNumber());

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

  test('should return the new Instruction', () => {
    const fakeContext = {} as Context;

    const result = createAddInstructionResolver(fakeContext)({} as ISubmittableResult);

    expect(result[0].id).toEqual(id);
  });

  test('should return a list of new Instructions', () => {
    const fakeContext = {} as Context;
    const previousInstructionId = new BigNumber(2);

    const previousInstructions = ({
      value: [new Instruction({ id: previousInstructionId }, fakeContext)],
    } as unknown) as PostTransactionValue<Instruction[]>;

    const result = createAddInstructionResolver(
      fakeContext,
      previousInstructions
    )({} as ISubmittableResult);

    expect(result.length).toEqual(2);
    expect(result[0].id).toEqual(previousInstructionId);
    expect(result[1].id).toEqual(id);
  });
});
