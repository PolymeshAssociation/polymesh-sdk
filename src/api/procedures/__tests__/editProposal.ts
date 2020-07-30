import { Text, u32 } from '@polkadot/types';
import BigNumber from 'bignumber.js';
import { AccountKey } from 'polymesh-types/types';
import sinon from 'sinon';

import { getRequiredRoles, Params, prepareEditProposal } from '~/api/procedures/editProposal';
import { PostTransactionValue } from '~/base';
import { Context } from '~/context';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { PolymeshTx } from '~/types/internal';
import * as utilsModule from '~/utils';

describe('editProposal procedure', () => {
  const mockAddress = 'someAddress';
  const pipId = 10;
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
  let accountKeyToStringStub: sinon.SinonStub<[AccountKey], string>;
  let u32ToBigNumberStub: sinon.SinonStub<[u32], BigNumber>;
  let addTransactionStub: sinon.SinonStub;
  let editProposalTransaction: PolymeshTx<unknown[]>;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();

    stringToTextStub = sinon.stub(utilsModule, 'stringToText');
    accountKeyToStringStub = sinon.stub(utilsModule, 'accountKeyToString');
    u32ToBigNumberStub = sinon.stub(utilsModule, 'u32ToBigNumber');
  });

  beforeEach(() => {
    addTransactionStub = procedureMockUtils.getAddTransactionStub().returns([proposal]);

    dsMockUtils.setContextAccountAddress(mockAddress);

    dsMockUtils.createQueryStub('pips', 'proposals', {
      returnValue: dsMockUtils.createMockOption(
        dsMockUtils.createMockPip({
          id: dsMockUtils.createMockU32(1),
          proposal: {},
          state: dsMockUtils.createMockProposalState('Pending'),
        })
      ),
    });

    dsMockUtils.createQueryStub('pips', 'proposalMetadata', {
      returnValue: dsMockUtils.createMockOption(
        dsMockUtils.createMockProposalMetadata({
          proposer: dsMockUtils.createMockAccountKey(mockAddress),
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

    accountKeyToStringStub.returns(mockAddress);
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

  test('should throw an error if the proposer is not the proposal owner', async () => {
    accountKeyToStringStub.returns('otherAddress');

    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    let error;
    try {
      await prepareEditProposal.call(proc, { pipId, ...args });
    } catch (err) {
      error = err;
    }

    expect(error.message).toBe('Only the owner of the proposal can edit it');
  });

  test('should throw an error if the proposal is not in pending state', async () => {
    dsMockUtils.createQueryStub('pips', 'proposals', {
      returnValue: dsMockUtils.createMockOption(
        dsMockUtils.createMockPip({
          id: dsMockUtils.createMockU32(1),
          proposal: {},
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
      ...{
        description,
      },
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
      ...{
        discussionUrl,
      },
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
});

describe('getRequiredRoles', () => {
  test('should return an empty array', () => {
    expect(getRequiredRoles()).toEqual([]);
  });
});
