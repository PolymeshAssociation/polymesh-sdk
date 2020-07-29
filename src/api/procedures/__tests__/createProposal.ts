import { Text } from '@polkadot/types';
import { Balance } from '@polkadot/types/interfaces';
import { ISubmittableResult } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';
import { TxTag, TxTags } from 'polymesh-types/types';
import sinon from 'sinon';

import { Proposal } from '~/api/entities';
import {
  CreateProposalParams,
  createProposalResolver,
  getRequiredRoles,
  prepareCreateProposal,
} from '~/api/procedures/createProposal';
import { PostTransactionValue } from '~/base';
import { Context } from '~/context';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { TickerReservationStatus } from '~/types';
import { PolymeshTx } from '~/types/internal';
import * as utilsModule from '~/utils';

describe('createProposal procedure', () => {
  let mockContext: Mocked<Context>;
  let stringToTextStub: sinon.SinonStub<[string, Context], Text>;
  let numberToBalanceStub: sinon.SinonStub<[number | BigNumber, Context], Balance>;
  let description: string;
  let discussionUrl: string;
  let bondAmount: BigNumber;
  let tag: TxTag;
  let transactionArgs: [string];
  let args: CreateProposalParams;

  let rawDescription: Text;
  let rawDiscussionUrl: Text;
  let rawBondAmount: Balance;

  let proposal: PostTransactionValue<Proposal>;

  beforeAll(() => {
    dsMockUtils.initMocks({
      contextOptions: { balance: { free: new BigNumber(5000), locked: new BigNumber(0) } },
    });
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    stringToTextStub = sinon.stub(utilsModule, 'stringToText');
    numberToBalanceStub = sinon.stub(utilsModule, 'numberToBalance');
    description = 'Some Proposal';
    discussionUrl = 'www.proposal.com';
    bondAmount = new BigNumber(1000);
    tag = TxTags.asset.RegisterTicker;
    transactionArgs = ['someTicker'];
    args = {
      description,
      discussionUrl,
      bondAmount,
      tag,
      args: transactionArgs,
    };

    rawDescription = dsMockUtils.createMockText(description);
    rawDiscussionUrl = dsMockUtils.createMockText(discussionUrl);
    rawBondAmount = dsMockUtils.createMockBalance(bondAmount.toNumber());

    proposal = ('proposal' as unknown) as PostTransactionValue<Proposal>;
  });

  let addTransactionStub: sinon.SinonStub;

  let createProposalTransaction: PolymeshTx<unknown[]>;

  beforeEach(() => {
    addTransactionStub = procedureMockUtils.getAddTransactionStub().returns([proposal]);

    entityMockUtils.getTickerReservationDetailsStub().resolves({
      owner: entityMockUtils.getIdentityInstance(),
      expiryDate: null,
      status: TickerReservationStatus.Free,
    });

    dsMockUtils.createQueryStub('pips', 'minimumProposalDeposit', {
      returnValue: dsMockUtils.createMockBalance(500),
    });

    createProposalTransaction = dsMockUtils.createTxStub('pips', 'propose');
    dsMockUtils.createTxStub('asset', 'registerTicker');

    mockContext = dsMockUtils.getContextInstance();

    stringToTextStub.withArgs(description, mockContext).returns(rawDescription);
    stringToTextStub.withArgs(discussionUrl, mockContext).returns(rawDiscussionUrl);
    numberToBalanceStub.withArgs(bondAmount, mockContext).returns(rawBondAmount);
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

  test('should throw an error if the bond amount is greater than the current free balance', async () => {
    const freeBalance = new BigNumber(10);
    dsMockUtils.configureMocks({
      contextOptions: { balance: { free: freeBalance, locked: new BigNumber(0) } },
    });
    const proc = procedureMockUtils.getInstance<CreateProposalParams, Proposal>(mockContext);

    let error;

    try {
      await prepareCreateProposal.call(proc, args);
    } catch (err) {
      error = err;
    }

    expect(error.message).toBe('Insufficient free balance');
    expect(error.data).toMatchObject({ freeBalance });
  });

  test('should throw an error if the bond amount is less than the minimum bond amount', async () => {
    const minBond = new BigNumber(2000);
    dsMockUtils.createQueryStub('pips', 'minimumProposalDeposit', {
      returnValue: dsMockUtils.createMockBalance(minBond.multipliedBy(Math.pow(10, 6)).toNumber()),
    });
    const proc = procedureMockUtils.getInstance<CreateProposalParams, Proposal>(mockContext);

    let error;

    try {
      await prepareCreateProposal.call(proc, args);
    } catch (err) {
      error = err;
    }

    expect(error.message).toBe('Bonded amount must exceed the minimum');
    expect(error.data).toMatchObject({ minBond });
  });

  test('should add an create proposal transaction to the queue', async () => {
    const proc = procedureMockUtils.getInstance<CreateProposalParams, Proposal>(mockContext);

    let result = await prepareCreateProposal.call(proc, args);

    sinon.assert.calledWith(
      addTransactionStub,
      createProposalTransaction,
      sinon.match({
        resolvers: sinon.match.array,
      }),
      'registerTicker',
      rawBondAmount,
      rawDiscussionUrl,
      rawDescription,
      null
    );
    expect(result).toBe(proposal);

    result = await prepareCreateProposal.call(proc, {
      ...args,
      discussionUrl: undefined,
      description: undefined,
    });

    sinon.assert.calledWith(
      addTransactionStub,
      createProposalTransaction,
      sinon.match({
        resolvers: sinon.match.array,
      }),
      'registerTicker',
      rawBondAmount,
      null,
      null,
      null
    );
    expect(result).toBe(proposal);
  });
});

describe('createPrroposalResolver', () => {
  const findEventRecordStub = sinon.stub(utilsModule, 'findEventRecord');
  const pipId = new BigNumber(1);
  const rawPipId = dsMockUtils.createMockU32(pipId.toNumber());

  beforeAll(() => {
    entityMockUtils.initMocks({ proposalOptions: { pipId: new BigNumber(pipId) } });
  });

  beforeEach(() => {
    findEventRecordStub.returns(dsMockUtils.createMockEventRecord(['garbage', 'data', rawPipId]));
  });

  afterEach(() => {
    findEventRecordStub.reset();
  });

  test('should return the new Proposal', () => {
    const fakeContext = {} as Context;

    const result = createProposalResolver(fakeContext)({} as ISubmittableResult);

    expect(result.pipId).toEqual(pipId);
  });
});

describe('getRequiredRoles', () => {
  test('should return an empty array', () => {
    expect(getRequiredRoles()).toEqual([]);
  });
});
