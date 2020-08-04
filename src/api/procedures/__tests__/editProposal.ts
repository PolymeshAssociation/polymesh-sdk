import { Text, u32 } from '@polkadot/types';
import { AccountId, Call } from '@polkadot/types/interfaces/runtime';
import BigNumber from 'bignumber.js';
import sinon from 'sinon';

import { isAuthorized, Params, prepareEditProposal } from '~/api/procedures/editProposal';
import { PostTransactionValue } from '~/base';
import { Context } from '~/context';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { PolymeshTx } from '~/types/internal';
import * as utilsModule from '~/utils';

describe('editProposal procedure', () => {
  const pipId = 10;
  const mockAddress = 'someAddress';
  const description = 'Some Proposal';
  const discussionUrl = 'www.proposal.com';
  const args = {
    description,
    discussionUrl,
  };
  const proposal = ('proposal' as unknown) as PostTransactionValue<void>;
  const rawDescription = dsMockUtils.createMockText(description);
  const rawDiscussionUrl = dsMockUtils.createMockText(discussionUrl);
  const coolOff = 555000;
  const blockId = 500000;
  const rawCoolOff = dsMockUtils.createMockU32(coolOff);
  const rawBlockId = dsMockUtils.createMockU32(blockId);

  let mockContext: Mocked<Context>;
  let stringToTextStub: sinon.SinonStub<[string, Context], Text>;
  let u32ToBigNumberStub: sinon.SinonStub<[u32], BigNumber>;
  let accountIdToStringStub: sinon.SinonStub<[AccountId], string>;
  let addTransactionStub: sinon.SinonStub;
  let editProposalTransaction: PolymeshTx<unknown[]>;

  beforeAll(() => {
    dsMockUtils.initMocks({
      contextOptions: {
        currentPairAddress: mockAddress,
      },
    });
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();

    stringToTextStub = sinon.stub(utilsModule, 'stringToText');
    u32ToBigNumberStub = sinon.stub(utilsModule, 'u32ToBigNumber');
    accountIdToStringStub = sinon.stub(utilsModule, 'accountIdToString');
  });

  beforeEach(() => {
    addTransactionStub = procedureMockUtils.getAddTransactionStub().returns([proposal]);

    dsMockUtils.createQueryStub('pips', 'proposals', {
      returnValue: dsMockUtils.createMockOption(
        dsMockUtils.createMockPip({
          id: dsMockUtils.createMockU32(1),
          proposal: ('proposal' as unknown) as Call,
          state: dsMockUtils.createMockProposalState('Pending'),
        })
      ),
    });

    dsMockUtils.createQueryStub('pips', 'proposalMetadata', {
      returnValue: dsMockUtils.createMockOption(
        dsMockUtils.createMockPipsMetadata({
          proposer: dsMockUtils.createMockAccountId(),
          // eslint-disable-next-line @typescript-eslint/camelcase
          cool_off_until: rawCoolOff,
        })
      ),
    });

    dsMockUtils.createRpcStub('chain', 'getHeader').returns({ number: rawBlockId });

    editProposalTransaction = dsMockUtils.createTxStub('pips', 'amendProposal');

    mockContext = dsMockUtils.getContextInstance();

    stringToTextStub.withArgs(description, mockContext).returns(rawDescription);
    stringToTextStub.withArgs(discussionUrl, mockContext).returns(rawDiscussionUrl);
    u32ToBigNumberStub.withArgs(rawCoolOff).returns(new BigNumber(coolOff));
    u32ToBigNumberStub.withArgs(rawBlockId).returns(new BigNumber(blockId));
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

  test('should throw an error if the user has not passed any arguments', () => {
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    return expect(prepareEditProposal.call(proc, ({} as unknown) as Params)).rejects.toThrow(
      'Nothing to modify'
    );
  });

  test('should throw an error if the proposal is not in pending state', async () => {
    dsMockUtils.createQueryStub('pips', 'proposals', {
      returnValue: dsMockUtils.createMockOption(
        dsMockUtils.createMockPip({
          id: dsMockUtils.createMockU32(1),
          proposal: ('proposal' as unknown) as Call,
          state: dsMockUtils.createMockProposalState('Referendum'),
        })
      ),
    });

    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    let error;
    try {
      await prepareEditProposal.call(proc, { pipId, ...args });
    } catch (err) {
      error = err;
    }

    expect(error.message).toBe('The proposal must be in pending state');
  });

  test('should throw an error if the proposal is not in the cool off period', async () => {
    const fakeBlockId = new BigNumber(600000);
    const rawFakeBlockId = dsMockUtils.createMockU32(fakeBlockId.toNumber());

    dsMockUtils.createRpcStub('chain', 'getHeader').returns({ number: rawFakeBlockId });

    u32ToBigNumberStub.withArgs(rawFakeBlockId).returns(fakeBlockId);

    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    let error;
    try {
      await prepareEditProposal.call(proc, { pipId, ...args });
    } catch (err) {
      error = err;
    }

    expect(error.message).toBe('The proposal is mutable only during its cool off period');
  });

  test('should add an edit proposal transaction to the queue', async () => {
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    await prepareEditProposal.call(proc, { pipId, ...args });

    sinon.assert.calledWith(
      addTransactionStub,
      editProposalTransaction,
      {},
      pipId,
      rawDiscussionUrl,
      rawDescription
    );

    await prepareEditProposal.call(proc, {
      pipId,
      description,
    });

    sinon.assert.calledWith(
      addTransactionStub,
      editProposalTransaction,
      {},
      pipId,
      null,
      rawDescription
    );

    await prepareEditProposal.call(proc, {
      pipId,
      discussionUrl,
    });

    sinon.assert.calledWith(
      addTransactionStub,
      editProposalTransaction,
      {},
      pipId,
      rawDiscussionUrl,
      null
    );
  });

  describe('isAuthorized', () => {
    test('should return whether the current account is the owner of the proposal', async () => {
      const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

      accountIdToStringStub.returns(mockAddress);

      dsMockUtils.createQueryStub('pips', 'proposalMetadata', {
        returnValue: dsMockUtils.createMockOption(
          dsMockUtils.createMockPipsMetadata({
            proposer: dsMockUtils.createMockAccountId(mockAddress),
            // eslint-disable-next-line @typescript-eslint/camelcase
            cool_off_until: dsMockUtils.createMockU32(),
          })
        ),
      });

      const boundFunc = isAuthorized.bind(proc);
      let result = await boundFunc({ pipId, ...args });
      expect(result).toBe(true);

      dsMockUtils.configureMocks({
        contextOptions: {
          currentPairAddress: 'otherAddress',
        },
      });

      result = await boundFunc({ pipId, ...args });
      expect(result).toBe(false);
    });
  });
});
