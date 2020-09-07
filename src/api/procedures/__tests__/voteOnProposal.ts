import { Balance } from '@polkadot/types/interfaces';
import { bool } from '@polkadot/types/primitive';
import BigNumber from 'bignumber.js';
import sinon from 'sinon';

import { ProposalDetails, ProposalStage, ProposalState } from '~/api/entities/Proposal/types';
import { Params, prepareVoteOnProposal } from '~/api/procedures/voteOnProposal';
import { Context } from '~/context';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { PolymeshTx } from '~/types/internal';
import * as utilsModule from '~/utils';

jest.mock(
  '~/api/entities/Proposal',
  require('~/testUtils/mocks/entities').mockProposalModule('~/api/entities/Proposal')
);

describe('voteOnProposal procedure', () => {
  const pipId = 10;
  const mockAddress = 'someAddress';
  const vote = true;
  const bondAmount = new BigNumber(10);
  const args = {
    vote,
    bondAmount,
  };
  const rawVote = dsMockUtils.createMockBool(vote);
  const rawBondAmount = dsMockUtils.createMockBalance(bondAmount.toNumber());

  let mockContext: Mocked<Context>;
  let booleanToBoolStub: sinon.SinonStub<[boolean, Context], bool>;
  let numberToBalanceStub: sinon.SinonStub<[number | BigNumber, Context], Balance>;
  let addTransactionStub: sinon.SinonStub;
  let voteOnProposalTransaction: PolymeshTx<unknown[]>;

  beforeAll(() => {
    dsMockUtils.initMocks({
      contextOptions: {
        currentPairAddress: mockAddress,
      },
    });
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();

    booleanToBoolStub = sinon.stub(utilsModule, 'booleanToBool');
    numberToBalanceStub = sinon.stub(utilsModule, 'numberToBalance');
  });

  beforeEach(() => {
    addTransactionStub = procedureMockUtils.getAddTransactionStub();

    voteOnProposalTransaction = dsMockUtils.createTxStub('pips', 'vote');

    mockContext = dsMockUtils.getContextInstance();

    booleanToBoolStub.withArgs(vote, mockContext).returns(rawVote);
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

  test('should throw an error if the proposal is not in pending state', async () => {
    entityMockUtils.configureMocks({
      proposalOptions: {
        getDetails: {
          lastState: ProposalState.Cancelled,
        } as ProposalDetails,
      },
    });

    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    let error;

    try {
      await prepareVoteOnProposal.call(proc, { pipId, ...args });
    } catch (err) {
      error = err;
    }

    expect(error.message).toBe('The proposal must be in pending state');
  });

  test('should throw an error if the proposal is in its cool-off period', async () => {
    entityMockUtils.configureMocks({
      proposalOptions: {
        getDetails: {
          lastState: ProposalState.Pending,
        } as ProposalDetails,
        getStage: ProposalStage.CoolOff,
      },
    });

    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    let error;

    try {
      await prepareVoteOnProposal.call(proc, { pipId, ...args });
    } catch (err) {
      error = err;
    }

    expect(error.message).toBe('The proposal must not be in its cool-off period');
  });

  test('should throw an error if the identity has already voted on the proposal', async () => {
    entityMockUtils.configureMocks({
      proposalOptions: {
        identityHasVoted: true,
        getDetails: {
          lastState: ProposalState.Pending,
        } as ProposalDetails,
      },
    });

    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    let error;

    try {
      await prepareVoteOnProposal.call(proc, { pipId, ...args });
    } catch (err) {
      error = err;
    }

    expect(error.message).toBe('The Identity has already voted on this proposal');
  });

  test("should throw an error if the identity doesn't have enough balance", async () => {
    entityMockUtils.configureMocks({
      proposalOptions: {
        getDetails: {
          lastState: ProposalState.Pending,
        } as ProposalDetails,
      },
    });

    const freeBalance = new BigNumber(1000);
    mockContext.accountBalance.resolves({ free: freeBalance });

    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    let error;

    try {
      await prepareVoteOnProposal.call(proc, {
        pipId,
        ...args,
        bondAmount: new BigNumber(1000000),
      });
    } catch (err) {
      error = err;
    }

    expect(error.message).toBe("The Identity doesn't have enough balance");
    expect(error.data).toMatchObject({ freeBalance });
  });

  test('should add a vote proposal transaction to the queue', async () => {
    entityMockUtils.configureMocks({
      proposalOptions: {
        getStage: ProposalStage.Open,
        identityHasVoted: false,
        getDetails: {
          lastState: ProposalState.Pending,
        } as ProposalDetails,
      },
    });
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    await prepareVoteOnProposal.call(proc, { pipId, ...args });

    sinon.assert.calledWith(
      addTransactionStub,
      voteOnProposalTransaction,
      {},
      pipId,
      rawVote,
      rawBondAmount
    );
  });
});
