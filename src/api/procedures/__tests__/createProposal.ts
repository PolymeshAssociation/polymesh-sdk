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
import { Context, PostTransactionValue } from '~/base';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { TickerReservationStatus, TransactionArgumentType } from '~/types';
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
  let transactionArgs: [string, string, number];
  let args: CreateProposalParams;

  let rawDescription: Text;
  let rawDiscussionUrl: Text;
  let rawBondAmount: Balance;

  let convertedBalance: Balance;

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
    tag = TxTags.asset.Transfer;
    transactionArgs = ['someTicker', 'someDestinatary', 3000];
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
    convertedBalance = dsMockUtils.createMockBalance(transactionArgs[2]);

    proposal = ('proposal' as unknown) as PostTransactionValue<Proposal>;
  });

  let addTransactionStub: sinon.SinonStub;

  let createProposalTransaction: PolymeshTx<unknown[]>;
  let transferTransaction: sinon.SinonStub;

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
    transferTransaction = dsMockUtils.createTxStub('asset', 'transfer');

    mockContext = dsMockUtils.getContextInstance();
    mockContext.getTransactionArguments.returns([
      {
        type: TransactionArgumentType.Text,
      },
      {
        type: TransactionArgumentType.Did,
      },
      {
        type: TransactionArgumentType.Balance,
      },
    ]);

    stringToTextStub.withArgs(description, mockContext).returns(rawDescription);
    stringToTextStub.withArgs(discussionUrl, mockContext).returns(rawDiscussionUrl);
    numberToBalanceStub.withArgs(bondAmount, mockContext).returns(rawBondAmount);
    numberToBalanceStub.withArgs(transactionArgs[2], mockContext).returns(convertedBalance);
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
    mockContext.accountBalance.resolves({ free: freeBalance, locked: new BigNumber(0) });

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

  test('should add an create proposal transaction to the queue, transforming balance arguments', async () => {
    const proc = procedureMockUtils.getInstance<CreateProposalParams, Proposal>(mockContext);

    let result = await prepareCreateProposal.call(proc, args);

    sinon.assert.calledWith(
      transferTransaction,
      transactionArgs[0],
      transactionArgs[1],
      convertedBalance
    );
    sinon.assert.calledWith(
      addTransactionStub,
      createProposalTransaction,
      sinon.match({
        resolvers: sinon.match.array,
      }),
      'transfer',
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
      transferTransaction,
      transactionArgs[0],
      transactionArgs[1],
      convertedBalance
    );
    sinon.assert.calledWith(
      addTransactionStub,
      createProposalTransaction,
      sinon.match({
        resolvers: sinon.match.array,
      }),
      'transfer',
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
  const pipId = 1;
  const rawPipId = dsMockUtils.createMockU32(pipId);

  beforeAll(() => {
    entityMockUtils.initMocks({ proposalOptions: { pipId } });
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
