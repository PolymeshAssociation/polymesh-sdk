import { u32 } from '@polkadot/types';
import { Balance } from '@polkadot/types/interfaces';
import BigNumber from 'bignumber.js';
import { TxTags } from 'polymesh-types/types';
import sinon from 'sinon';

import { Entity, Identity, Proposal } from '~/api/entities';
import { ProposalStage } from '~/api/entities/Proposal/types';
import { cancelProposal, editProposal, voteOnProposal } from '~/api/procedures';
import { Context, TransactionQueue } from '~/base';
import { eventByIndexedArgs, proposal as proposalQuery, proposalVotes } from '~/middleware/queries';
import { EventIdEnum, ModuleIdEnum, ProposalState } from '~/middleware/types';
import { dsMockUtils } from '~/testUtils/mocks';
import * as utilsModule from '~/utils';

describe('Proposal class', () => {
  const pipId = 10;
  let context: Context;
  let proposal: Proposal;
  let u32ToBigNumberStub: sinon.SinonStub<[u32], BigNumber>;
  let requestAtBlockStub: sinon.SinonStub;
  let balanceToBigNumberStub: sinon.SinonStub<[Balance], BigNumber>;

  beforeAll(() => {
    dsMockUtils.initMocks();
    u32ToBigNumberStub = sinon.stub(utilsModule, 'u32ToBigNumber');
    requestAtBlockStub = sinon.stub(utilsModule, 'requestAtBlock');
    balanceToBigNumberStub = sinon.stub(utilsModule, 'balanceToBigNumber');
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
    proposal = new Proposal({ pipId }, context);
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  test('should extend entity', () => {
    expect(Proposal.prototype instanceof Entity).toBe(true);
  });

  describe('constructor', () => {
    test('should assign pipId to instance', () => {
      expect(proposal.pipId).toBe(pipId);
    });
  });

  describe('method: isUniqueIdentifiers', () => {
    test('should return true if the object conforms to the interface', () => {
      expect(Proposal.isUniqueIdentifiers({ pipId: 10 })).toBe(true);
      expect(Proposal.isUniqueIdentifiers({})).toBe(false);
      expect(Proposal.isUniqueIdentifiers({ pipId: '10' })).toBe(false);
    });
  });

  describe('method: identityHasVoted', () => {
    const did = 'someDid';
    const variables = {
      moduleId: ModuleIdEnum.Pips,
      eventId: EventIdEnum.Voted,
      eventArg0: did,
      eventArg2: pipId.toString(),
    };

    beforeEach(() => {
      context = dsMockUtils.getContextInstance();
      proposal = new Proposal({ pipId }, context);
    });

    test('should return true if the identity has voted on the proposal', async () => {
      const fakeResult = true;

      dsMockUtils.createApolloQueryStub(eventByIndexedArgs(variables), {
        /* eslint-disable @typescript-eslint/camelcase */
        eventByIndexedArgs: {
          block_id: 'someBlockId',
        },
        /* eslint-enable @typescript-eslint/camelcase */
      });

      const result = await proposal.identityHasVoted();
      expect(result).toEqual(fakeResult);
    });

    test('should return false if the identity has not voted on the proposal', async () => {
      dsMockUtils.createApolloQueryStub(eventByIndexedArgs(variables), {});
      const result = await proposal.identityHasVoted({ identity: 'someDid' });
      expect(result).toBeFalsy();
    });
  });

  describe('method: getVotes', () => {
    test('should return the list of votes', async () => {
      const did = 'someDid';
      const vote = false;
      const weight = new BigNumber(10000000000);
      const proposalVotesQueryResponse = [
        {
          account: did,
          vote,
          weight: weight.toNumber(),
        },
      ];
      const fakeResult = [
        {
          identity: new Identity({ did }, context),
          vote,
          weight,
        },
      ];

      dsMockUtils.createApolloQueryStub(
        proposalVotes({
          pipId,
          vote: undefined,
          orderBy: undefined,
          count: undefined,
          skip: undefined,
        }),
        {
          proposalVotes: proposalVotesQueryResponse,
        }
      );

      const result = await proposal.getVotes();

      expect(result.data).toEqual(fakeResult);
      expect(result.next).toBeNull();
      expect(result.count).toBeUndefined();
    });
  });

  describe('method: edit', () => {
    test('should prepare the procedure with the correct arguments and context', async () => {
      const args = {
        discussionUrl: 'www.my-new-proposal.com',
        description: 'A new proposal description',
      };

      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<void>;

      sinon
        .stub(editProposal, 'prepare')
        .withArgs({ pipId, ...args }, context)
        .resolves(expectedQueue);

      const queue = await proposal.edit(args);

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: cancel', () => {
    test('should prepare the procedure with the correct arguments and context', async () => {
      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<void>;

      sinon
        .stub(cancelProposal, 'prepare')
        .withArgs({ pipId }, context)
        .resolves(expectedQueue);

      const queue = await proposal.cancel();

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: getDetails', () => {
    test('should return the proposal details', async () => {
      const variables = { pipId };
      const proposer = 'someProposer';
      const url = 'http://someUrl';
      const description = 'some description';
      const lastState = ProposalState.Pending;
      const createdAt = new BigNumber(150000);
      const coolOffEndBlock = new BigNumber(160000);
      const endBlock = new BigNumber(165000);
      const lastStateUpdatedAt = new BigNumber(163000);
      const totalVotes = new BigNumber(30);
      const totalAyesWeight = new BigNumber(10);
      const totalNaysWeight = new BigNumber(20);
      const rawProposal = '0x110000';
      const fakeProposal = {
        pipId,
        proposer,
        createdAt: createdAt.toNumber(),
        url,
        description,
        coolOffEndBlock: coolOffEndBlock.toNumber(),
        endBlock: endBlock.toNumber(),
        proposal: rawProposal,
        lastState,
        lastStateUpdatedAt: lastStateUpdatedAt.toNumber(),
        totalVotes: totalVotes.toNumber(),
        totalAyesWeight: totalAyesWeight,
        totalNaysWeight: totalNaysWeight,
      };
      const fakeResult = {
        proposerAddress: proposer,
        createdAt,
        discussionUrl: url,
        description,
        coolOffEndBlock,
        endBlock,
        transaction: TxTags.treasury.Disbursement,
        lastState,
        lastStateUpdatedAt,
        totalVotes,
        totalAyesWeight,
        totalNaysWeight,
      };

      dsMockUtils.createApolloQueryStub(proposalQuery(variables), {
        proposal: fakeProposal,
      });

      sinon
        .stub(utilsModule, 'middlewareProposalToProposalDetails')
        .withArgs(fakeProposal, context)
        .returns(fakeResult);

      const result = await proposal.getDetails();
      expect(result).toEqual(fakeResult);
    });
  });

  describe('method: getStage', () => {
    const coolOff = 555000;

    afterEach(() => {
      dsMockUtils.reset();
    });

    test('should return coolOff as stage of the proposal', async () => {
      const blockNumber = new BigNumber(500000);
      const rawCoolOff = dsMockUtils.createMockU32(coolOff);

      dsMockUtils.initMocks({ contextOptions: { latestBlock: blockNumber } });

      dsMockUtils.createQueryStub('pips', 'proposalMetadata', {
        returnValue: dsMockUtils.createMockOption(
          dsMockUtils.createMockPipsMetadata({
            proposer: dsMockUtils.createMockAccountId(),
            // eslint-disable-next-line @typescript-eslint/camelcase
            cool_off_until: rawCoolOff,
            end: dsMockUtils.createMockU32(),
          })
        ),
      });

      u32ToBigNumberStub.withArgs(rawCoolOff).returns(new BigNumber(coolOff));

      const result = await proposal.getStage();
      expect(result).toEqual(ProposalStage.CoolOff);
    });

    test('should return open as stage of the proposal', async () => {
      const blockNumber = new BigNumber(600000);
      const end = 1000000;
      const rawCoolOff = dsMockUtils.createMockU32(coolOff);
      const rawEnd = dsMockUtils.createMockU32(end);

      dsMockUtils.initMocks({ contextOptions: { latestBlock: blockNumber } });

      dsMockUtils.createQueryStub('pips', 'proposalMetadata', {
        returnValue: dsMockUtils.createMockOption(
          dsMockUtils.createMockPipsMetadata({
            proposer: dsMockUtils.createMockAccountId(),
            // eslint-disable-next-line @typescript-eslint/camelcase
            cool_off_until: rawCoolOff,
            end: rawEnd,
          })
        ),
      });

      u32ToBigNumberStub.withArgs(rawCoolOff).returns(new BigNumber(coolOff));
      u32ToBigNumberStub.withArgs(rawEnd).returns(new BigNumber(end));

      const result = await proposal.getStage();
      expect(result).toEqual(ProposalStage.Open);
    });

    test('should return ended as stage of the proposal', async () => {
      const blockNumber = new BigNumber(1000000);
      const end = 700000;
      const rawCoolOff = dsMockUtils.createMockU32(coolOff);
      const rawEnd = dsMockUtils.createMockU32(end);

      dsMockUtils.initMocks({ contextOptions: { latestBlock: blockNumber } });

      dsMockUtils.createQueryStub('pips', 'proposalMetadata', {
        returnValue: dsMockUtils.createMockOption(
          dsMockUtils.createMockPipsMetadata({
            proposer: dsMockUtils.createMockAccountId(),
            // eslint-disable-next-line @typescript-eslint/camelcase
            cool_off_until: rawCoolOff,
            end: rawEnd,
          })
        ),
      });

      u32ToBigNumberStub.withArgs(rawCoolOff).returns(new BigNumber(coolOff));
      u32ToBigNumberStub.withArgs(rawEnd).returns(new BigNumber(end));

      const result = await proposal.getStage();
      expect(result).toEqual(ProposalStage.Ended);
    });
  });

  describe('method: vote', () => {
    test('should prepare the procedure with the correct arguments and context', async () => {
      const args = {
        vote: true,
        bondAmount: new BigNumber(1000),
      };

      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<void>;

      sinon
        .stub(voteOnProposal, 'prepare')
        .withArgs({ pipId, ...args }, context)
        .resolves(expectedQueue);

      const queue = await proposal.vote(args);

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: minimumBondedAmount', () => {
    const fakeResult = new BigNumber(100000);
    const rawBalance = dsMockUtils.createMockBalance(fakeResult.toNumber());
    const end = 150000;
    const rawEnd = dsMockUtils.createMockU32(end);

    beforeEach(() => {
      dsMockUtils.createQueryStub('pips', 'proposalMetadata', {
        returnValue: dsMockUtils.createMockOption(
          dsMockUtils.createMockPipsMetadata({
            proposer: dsMockUtils.createMockAccountId(),
            // eslint-disable-next-line @typescript-eslint/camelcase
            cool_off_until: dsMockUtils.createMockU32(),
            end: rawEnd,
          })
        ),
      });

      requestAtBlockStub.returns(rawBalance);
      balanceToBigNumberStub.withArgs(rawBalance).returns(fakeResult);
    });

    afterEach(() => {
      dsMockUtils.reset();
    });

    test('should return the minimum bonded amount from the current storage', async () => {
      sinon.stub(proposal, 'getStage').resolves(ProposalStage.Open);

      const result = await proposal.minimumBondedAmount();
      expect(result).toBe(fakeResult);
    });

    test('should return the minimum bonded amount from the historic storage', async () => {
      const blockHash = new BigNumber(123456);
      const rawBlockHash = dsMockUtils.createMockU32(blockHash.toNumber());

      sinon.stub(proposal, 'getStage').resolves(ProposalStage.Ended);

      dsMockUtils.createQueryStub('system', 'blockHash', {
        returnValue: rawBlockHash,
      });

      const result = await proposal.minimumBondedAmount();
      expect(result).toBe(fakeResult);
    });
  });
});
