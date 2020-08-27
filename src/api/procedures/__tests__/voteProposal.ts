import { Balance } from '@polkadot/types/interfaces';
import { bool } from '@polkadot/types/primitive';
import BigNumber from 'bignumber.js';
import sinon from 'sinon';

import { ProposalStage, ProposalState } from '~/api/entities/Proposal/types';
import { Params, prepareVoteProposal } from '~/api/procedures/voteProposal';
import { Context } from '~/context';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { PolymeshTx } from '~/types/internal';
import * as utilsModule from '~/utils';

jest.mock(
  '~/api/entities/Proposal',
  require('~/testUtils/mocks/entities').mockProposalModule('~/api/entities/Proposal')
);

describe('voteProposal procedure', () => {
  const pipId = 10;
  const mockAddress = 'someAddress';
  const vote = true;
  const deposit = new BigNumber(10);
  const args = {
    vote,
    deposit,
  };
  const rawVote = dsMockUtils.createMockBool(vote);
  const rawDeposit = dsMockUtils.createMockBalance(deposit.toNumber());

  let mockContext: Mocked<Context>;
  let booleanToBoolStub: sinon.SinonStub<[boolean, Context], bool>;
  let numberToBalanceStub: sinon.SinonStub<[number | BigNumber, Context], Balance>;
  let addTransactionStub: sinon.SinonStub;
  let voteProposalTransaction: PolymeshTx<unknown[]>;

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

    voteProposalTransaction = dsMockUtils.createTxStub('pips', 'vote');

    mockContext = dsMockUtils.getContextInstance();

    booleanToBoolStub.withArgs(vote, mockContext).returns(rawVote);
    numberToBalanceStub.withArgs(deposit, mockContext).returns(rawDeposit);
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
          state: ProposalState.Cancelled,
          module: 'someModule',
          method: 'someMethod',
        },
      },
    });

    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    let error;

    try {
      await prepareVoteProposal.call(proc, { pipId, ...args });
    } catch (err) {
      error = err;
    }

    expect(error.message).toBe('The proposal must be in pending state');
  });

  test('should throw an error if the proposal is in its cool-off period', async () => {
    entityMockUtils.configureMocks({
      proposalOptions: {
        getDetails: {
          state: ProposalState.Pending,
          module: 'someModule',
          method: 'someMethod',
        },
        getStage: ProposalStage.CoolOff,
      },
    });

    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    let error;

    try {
      await prepareVoteProposal.call(proc, { pipId, ...args });
    } catch (err) {
      error = err;
    }

    expect(error.message).toBe('The proposal must not be in its cool-off period');
  });

  test('should throw an error if the identity has already voted the proposal', async () => {
    entityMockUtils.configureMocks({
      proposalOptions: {
        getDetails: {
          state: ProposalState.Pending,
          module: 'someModule',
          method: 'someMethod',
        },
        identityHasVoted: true,
      },
    });

    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    let error;

    try {
      await prepareVoteProposal.call(proc, { pipId, ...args });
    } catch (err) {
      error = err;
    }

    expect(error.message).toBe('The identity has already voted this proposal');
  });

  test('should throw an error if the identity has not enough balance', async () => {
    entityMockUtils.configureMocks({
      proposalOptions: {
        getDetails: {
          state: ProposalState.Pending,
          module: 'someModule',
          method: 'someMethod',
        },
      },
    });

    const freeBalance = new BigNumber(1000);
    mockContext.accountBalance.resolves({ free: freeBalance });

    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    let error;

    try {
      await prepareVoteProposal.call(proc, { pipId, ...args, deposit: new BigNumber(1000000) });
    } catch (err) {
      error = err;
    }

    expect(error.message).toBe('The identity has not enough balance');
    expect(error.data).toMatchObject({ freeBalance });
  });

  test('should add an vote proposal transaction to the queue', async () => {
    entityMockUtils.configureMocks({
      proposalOptions: {
        getDetails: {
          state: ProposalState.Pending,
          module: 'someModule',
          method: 'someMethod',
        },
        getStage: ProposalStage.Open,
        identityHasVoted: false,
      },
    });
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    await prepareVoteProposal.call(proc, { pipId, ...args });

    sinon.assert.calledWith(
      addTransactionStub,
      voteProposalTransaction,
      {},
      pipId,
      rawVote,
      rawDeposit
    );
  });
});
