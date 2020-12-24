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
  let validFrom: Date;
  let endBlock: BigNumber;
  let args: Params;

  let rawVenueId: u64;
  let rawAmount: Balance;
  let rawFrom: PortfolioId;
  let rawTo: PortfolioId;
  let rawToken: Ticker;
  let rawValidFrom: Moment;
  let rawEndBlock: u32;
  let rawAuthSettlementType: SettlementType;
  let rawBlockSettlementType: SettlementType;
  let rawLeg: { from: PortfolioId; to: PortfolioId; asset: Ticker; amount: Balance };

  let instruction: PostTransactionValue<Instruction>;

  beforeAll(() => {
    dsMockUtils.initMocks({
      contextOptions: { balance: { free: new BigNumber(500), locked: new BigNumber(0) } },
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
    });
    toPortfolio = entityMockUtils.getNumberedPortfolioInstance({
      did: toDid,
    });
    token = 'SOME_TOKEN';
    validFrom = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
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
    rawValidFrom = dsMockUtils.createMockMoment(validFrom.getTime());
    rawEndBlock = dsMockUtils.createMockU32(endBlock.toNumber());
    rawAuthSettlementType = dsMockUtils.createMockSettlementType('SettleOnAffirmation');
    rawBlockSettlementType = dsMockUtils.createMockSettlementType({ SettleOnBlock: rawEndBlock });
    rawLeg = {
      from: rawFrom,
      to: rawTo,
      amount: rawAmount,
      asset: rawToken,
    };
    args = {
      venueId,
      legs: [
        {
          from,
          to,
          token,
          amount,
        },
      ],
    };

    instruction = ('instruction' as unknown) as PostTransactionValue<Instruction>;
  });

  let addTransactionStub: sinon.SinonStub;

  let addAndAuthorizeInstructionTransaction: PolymeshTx<[
    u64,
    SettlementType,
    Option<Moment>,
    { from: PortfolioId; to: PortfolioId; asset: Ticker; amount: Balance }[],
    PortfolioId[]
  ]>;
  let addInstructionTransaction: PolymeshTx<[
    u64,
    SettlementType,
    Option<Moment>,
    { from: PortfolioId; to: PortfolioId; asset: Ticker; amount: Balance }[]
  ]>;

  beforeEach(() => {
    addTransactionStub = procedureMockUtils.getAddTransactionStub().returns([instruction]);

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
    dateToMomentStub.withArgs(validFrom, mockContext).returns(rawValidFrom);
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

  test('should throw an error if the legs array is empty', async () => {
    const proc = procedureMockUtils.getInstance<Params, Instruction>(mockContext);

    let error;

    try {
      await prepareAddInstruction.call(proc, { ...args, legs: [] });
    } catch (err) {
      error = err;
    }

    expect(error.message).toBe("The legs array can't be empty");
  });

  test('should throw an error if the end block is in the past', async () => {
    dsMockUtils.configureMocks({ contextOptions: { latestBlock: new BigNumber(1000) } });
    entityMockUtils.configureMocks({
      venueOptions: {
        exists: true,
      },
    });
    const proc = procedureMockUtils.getInstance<Params, Instruction>(mockContext);

    let error;

    try {
      await prepareAddInstruction.call(proc, { ...args, endBlock: new BigNumber(100) });
    } catch (err) {
      error = err;
    }

    expect(error.message).toBe('End block must be a future block');
  });

  test('should add an add and authorize instruction transaction to the queue', async () => {
    dsMockUtils.configureMocks({ contextOptions: { did: fromDid } });
    entityMockUtils.configureMocks({
      venueOptions: {
        exists: true,
      },
    });
    getCustodianStub.onCall(1).returns({ did: fromDid });
    const proc = procedureMockUtils.getInstance<Params, Instruction>(mockContext);

    const result = await prepareAddInstruction.call(proc, args);

    sinon.assert.calledWith(
      addTransactionStub,
      addAndAuthorizeInstructionTransaction,
      sinon.match({
        resolvers: sinon.match.array,
      }),
      rawVenueId,
      rawAuthSettlementType,
      null,
      [rawLeg],
      [rawFrom, rawTo]
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
    const proc = procedureMockUtils.getInstance<Params, Instruction>(mockContext);

    const result = await prepareAddInstruction.call(proc, {
      ...args,
      legs: [
        { from, to, amount, token: entityMockUtils.getSecurityTokenInstance({ ticker: token }) },
      ],
      validFrom,
      endBlock,
    });

    sinon.assert.calledWith(
      addTransactionStub,
      addInstructionTransaction,
      sinon.match({
        resolvers: sinon.match.array,
      }),
      rawVenueId,
      rawBlockSettlementType,
      rawValidFrom,
      [rawLeg]
    );
    expect(result).toBe(instruction);
  });

  test("should throw an error if the venue doesn't exist", async () => {
    entityMockUtils.configureMocks({
      venueOptions: {
        exists: false,
      },
    });

    const proc = procedureMockUtils.getInstance<Params, Instruction>(mockContext);

    let error;

    try {
      await prepareAddInstruction.call(proc, { ...args, legs: [] });
    } catch (err) {
      error = err;
    }

    expect(error.message).toBe("The Venue doesn't exist");
  });

  describe('getAuthorization', () => {
    test('should return the appropriate roles and permissions', async () => {
      const proc = procedureMockUtils.getInstance<Params, Instruction>(mockContext);
      const boundFunc = getAuthorization.bind(proc);
      fromPortfolio = entityMockUtils.getNumberedPortfolioInstance({ isCustodiedBy: true });
      toPortfolio = entityMockUtils.getNumberedPortfolioInstance({ isCustodiedBy: true });

      portfolioLikeToPortfolioStub.withArgs(fromPortfolio).returns(fromPortfolio);
      portfolioLikeToPortfolioStub.withArgs(toPortfolio).returns(toPortfolio);

      let result = await boundFunc({
        venueId,
        legs: [{ from: fromPortfolio, to: toPortfolio, amount, token: 'SOME_TOKEN' }],
      });

      expect(result).toEqual({
        identityRoles: [{ type: RoleType.VenueOwner, venueId }],
        signerPermissions: {
          tokens: [],
          portfolios: [fromPortfolio, toPortfolio],
          transactions: [TxTags.settlement.AddAndAffirmInstruction],
        },
      });

      fromPortfolio = entityMockUtils.getNumberedPortfolioInstance({ isCustodiedBy: false });
      toPortfolio = entityMockUtils.getNumberedPortfolioInstance({ isCustodiedBy: false });

      portfolioLikeToPortfolioStub.withArgs(fromPortfolio).returns(fromPortfolio);
      portfolioLikeToPortfolioStub.withArgs(toPortfolio).returns(toPortfolio);

      result = await boundFunc({
        venueId,
        legs: [{ from: fromPortfolio, to: toPortfolio, amount, token: 'SOME_TOKEN' }],
      });

      expect(result).toEqual({
        identityRoles: [{ type: RoleType.VenueOwner, venueId }],
        signerPermissions: {
          tokens: [],
          portfolios: [],
          transactions: [TxTags.settlement.AddInstruction],
        },
      });
    });
  });
});

describe('createAddInstructionResolver', () => {
  const findEventRecordStub = sinon.stub(utilsInternalModule, 'findEventRecord');
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
    findEventRecordStub.returns(dsMockUtils.createMockEventRecord(['did', 'venueId', rawId]));
  });

  afterEach(() => {
    findEventRecordStub.reset();
  });

  test('should return the new Instruction', () => {
    const fakeContext = {} as Context;

    const result = createAddInstructionResolver(fakeContext)({} as ISubmittableResult);

    expect(result.id).toEqual(id);
  });
});
