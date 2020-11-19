import { Option, u32, u64 } from '@polkadot/types';
import { Balance, Moment } from '@polkadot/types/interfaces';
import { ISubmittableResult } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';
import { PortfolioId, SettlementType, Ticker } from 'polymesh-types/types';
import sinon from 'sinon';

import {
  createAddInstructionResolver,
  getRequiredRoles,
  Params,
  prepareAddInstruction,
} from '~/api/procedures/addInstruction';
import { Context, Instruction, PostTransactionValue } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { InstructionType, PortfolioLike, RoleType, TickerReservationStatus } from '~/types';
import { PolymeshTx } from '~/types/internal';
import * as utilsModule from '~/utils';

describe('addInstruction procedure', () => {
  let mockContext: Mocked<Context>;
  let portfolioIdToMeshPortfolioIdStub: sinon.SinonStub;
  let portfolioLikeToPortfolioIdStub: sinon.SinonStub;
  let stringToTickerStub: sinon.SinonStub<[string, Context], Ticker>;
  let numberToU64Stub: sinon.SinonStub<[number | BigNumber, Context], u64>;
  let numberToBalanceStub: sinon.SinonStub<
    [number | BigNumber, Context, (boolean | undefined)?],
    Balance
  >;
  let endConditionToSettlementTypeStub: sinon.SinonStub<
    [
      (
        | { type: InstructionType.SettleOnAuthorization }
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
    portfolioIdToMeshPortfolioIdStub = sinon.stub(utilsModule, 'portfolioIdToMeshPortfolioId');
    portfolioLikeToPortfolioIdStub = sinon.stub(utilsModule, 'portfolioLikeToPortfolioId');
    stringToTickerStub = sinon.stub(utilsModule, 'stringToTicker');
    numberToU64Stub = sinon.stub(utilsModule, 'numberToU64');
    numberToBalanceStub = sinon.stub(utilsModule, 'numberToBalance');
    endConditionToSettlementTypeStub = sinon.stub(utilsModule, 'endConditionToSettlementType');
    dateToMomentStub = sinon.stub(utilsModule, 'dateToMoment');
    venueId = new BigNumber(1);
    amount = new BigNumber(100);
    from = 'fromDid';
    to = 'toDid';
    fromDid = 'fromDid';
    toDid = 'toDid';
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
    rawAuthSettlementType = dsMockUtils.createMockSettlementType('SettleOnAuthorization');
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
      'addAndAuthorizeInstruction'
    );
    addInstructionTransaction = dsMockUtils.createTxStub('settlement', 'addInstruction');

    mockContext = dsMockUtils.getContextInstance();

    portfolioLikeToPortfolioIdStub.withArgs(from, mockContext).returns({ did: fromDid });
    portfolioLikeToPortfolioIdStub.withArgs(to, mockContext).returns({ did: toDid });
    portfolioIdToMeshPortfolioIdStub
      .withArgs({ did: fromDid, number: undefined }, mockContext)
      .returns(rawFrom);
    portfolioIdToMeshPortfolioIdStub
      .withArgs({ did: toDid, number: undefined }, mockContext)
      .returns(rawTo);
    stringToTickerStub.withArgs(token, mockContext).returns(rawToken);
    numberToU64Stub.withArgs(venueId, mockContext).returns(rawVenueId);
    numberToBalanceStub.withArgs(amount, mockContext).returns(rawAmount);
    endConditionToSettlementTypeStub
      .withArgs({ type: InstructionType.SettleOnBlock, value: endBlock }, mockContext)
      .returns(rawBlockSettlementType);
    endConditionToSettlementTypeStub
      .withArgs({ type: InstructionType.SettleOnAuthorization }, mockContext)
      .returns(rawAuthSettlementType);
    dateToMomentStub.withArgs(validFrom, mockContext).returns(rawValidFrom);
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
      [rawFrom]
    );
    expect(result).toBe(instruction);
  });

  test('should add an add instruction transaction to the queue', async () => {
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
});

describe('getRequiredRoles', () => {
  test('should return a venue owner role', () => {
    const venueId = new BigNumber(100);
    const args = {
      venueId,
    } as Params;

    expect(getRequiredRoles(args)).toEqual([{ type: RoleType.VenueOwner, venueId }]);
  });
});

describe('createAddInstructionResolver', () => {
  const findEventRecordStub = sinon.stub(utilsModule, 'findEventRecord');
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
