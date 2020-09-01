import { u8, u32 } from '@polkadot/types';
import { Balance } from '@polkadot/types/interfaces';
import BigNumber from 'bignumber.js';
import sinon from 'sinon';

import { Identity, Proposal } from '~/api/entities';
import { ProposalState } from '~/api/entities/Proposal/types';
import { createProposal } from '~/api/procedures';
import { TransactionQueue } from '~/base';
import { Context } from '~/context';
import { Governance } from '~/Governance';
import { proposals } from '~/middleware/queries';
import { TxTag } from '~/polkadot';
import { dsMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { TxTags } from '~/types';
import * as utilsModule from '~/utils';

describe('Governance class', () => {
  let context: Mocked<Context>;
  let governance: Governance;
  let balanceToBigNumberStub: sinon.SinonStub<[Balance], BigNumber>;
  let u32ToBigNumberStub: sinon.SinonStub<[u32], BigNumber>;
  let fakeBalance: Balance;
  const amount = new BigNumber(5000);

  beforeAll(() => {
    dsMockUtils.initMocks();
    balanceToBigNumberStub = sinon.stub(utilsModule, 'balanceToBigNumber');
    u32ToBigNumberStub = sinon.stub(utilsModule, 'u32ToBigNumber');
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
    governance = new Governance(context);
    fakeBalance = dsMockUtils.createMockBalance(amount.toNumber());
    balanceToBigNumberStub.withArgs(fakeBalance).returns(amount);
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  describe('method: getGovernanceCommitteeMembers', () => {
    test('should retrieve a list of the identities of all active members', async () => {
      const did = 'someDid';
      const expectedMembers = [new Identity({ did }, context)];

      dsMockUtils.createQueryStub('committeeMembership', 'activeMembers', {
        returnValue: [dsMockUtils.createMockIdentityId('someDid')],
      });

      const result = await governance.getGovernanceCommitteeMembers();

      expect(result).toEqual(expectedMembers);
    });
  });

  describe('method: getTransactionArguments', () => {
    test('should return the result of context.getTransactionArguments', () => {
      context.getTransactionArguments.returns(['fakeArguments']);

      expect(governance.getTransactionArguments({ tag: TxTags.asset.CreateAsset })).toEqual([
        'fakeArguments',
      ]);
    });
  });

  describe('method: getProposals', () => {
    test('should return a list of proposal entities', async () => {
      const pipId = 10;
      const url = 'http://someUrl';
      const address = 'someAddress';
      const proposer = '0xsomeAddress';
      const createdAt = new BigNumber(50800);
      const coolOffEndBlock = new BigNumber(51000);
      const endBlock = new BigNumber(56000);
      const lastStateUpdatedAt = new BigNumber(50900);
      const proposal = '0x180500cc829c190000000000000000000000e8030000';
      const fakeTransaction = 'methodName.sectionName' as TxTag;
      const totalVotes = new BigNumber(0);
      const totalAyesWeight = new BigNumber(0);
      const totalNaysWeight = new BigNumber(0);
      const proposalsQueryResponse = {
        proposerAddress: proposer,
        createdAt: createdAt.toNumber(),
        discussionUrl: url,
        description: 'some description',
        coolOffEndBlock: coolOffEndBlock.toNumber(),
        endBlock: endBlock.toNumber(),
        lastState: ProposalState.Referendum,
        lastStateUpdatedAt: lastStateUpdatedAt.toNumber(),
        totalVotes: totalVotes.toNumber(),
        totalAyesWeight: totalAyesWeight.toNumber(),
        totalNaysWeight: totalNaysWeight.toNumber(),
      };
      const proposalInstance = new Proposal({ pipId }, context);

      sinon
        .stub(utilsModule, 'addressToKey')
        .withArgs(address)
        .returns(proposer);

      sinon
        .stub(utilsModule, 'middlewareProposalToTxTag')
        .withArgs(proposal, context)
        .returns(fakeTransaction);

      dsMockUtils.createApolloQueryStub(
        proposals({
          proposers: [proposer],
          states: undefined,
          orderBy: undefined,
          count: undefined,
          skip: undefined,
        }),
        {
          proposals: [{ ...proposalsQueryResponse, pipId, proposal, proposer, url }],
        }
      );

      let result = await governance.getProposals({
        proposers: [address],
      });

      expect(result).toEqual([
        {
          proposal: proposalInstance,
          details: {
            ...proposalsQueryResponse,
            transaction: fakeTransaction,
            createdAt,
            coolOffEndBlock,
            endBlock,
            lastStateUpdatedAt,
            totalVotes,
            totalAyesWeight,
            totalNaysWeight,
          },
        },
      ]);

      dsMockUtils.createApolloQueryStub(
        proposals({
          proposers: undefined,
          states: undefined,
          orderBy: undefined,
          count: undefined,
          skip: undefined,
        }),
        {
          proposals: [{ ...proposalsQueryResponse, pipId, proposer, url }],
        }
      );

      result = await governance.getProposals();

      expect(result).toEqual([
        {
          proposal: proposalInstance,
          details: {
            ...proposalsQueryResponse,
            transaction: null,
            createdAt,
            coolOffEndBlock,
            endBlock,
            lastStateUpdatedAt,
            totalVotes,
            totalAyesWeight,
            totalNaysWeight,
          },
        },
      ]);
    });
  });

  describe('method: createProposal', () => {
    test('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
      const args = {
        discussionUrl: 'www.my-proposal.com',
        description: 'A proposal',
        bondAmount: new BigNumber(1000),
        tag: TxTags.asset.RegisterTicker,
        args: ['someTicker'],
      };
      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<Proposal>;

      sinon
        .stub(createProposal, 'prepare')
        .withArgs(args, context)
        .resolves(expectedQueue);

      const queue = await governance.createProposal(args);

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: minimumProposalDeposit', () => {
    test('should return the minimum proposal deposit', async () => {
      dsMockUtils.createQueryStub('pips', 'minimumProposalDeposit').resolves(fakeBalance);

      const result = await governance.minimumProposalDeposit();

      expect(result).toBe(amount);
    });

    test('should allow subscription', async () => {
      const unsubCallback = 'unsubCallback';
      const callback = sinon.stub();

      dsMockUtils.createQueryStub('pips', 'minimumProposalDeposit').callsFake(async cbFunc => {
        cbFunc(fakeBalance);
        return unsubCallback;
      });

      const result = await governance.minimumProposalDeposit(callback);

      expect(result).toEqual(unsubCallback);
      sinon.assert.calledWithExactly(callback, amount);
    });
  });

  describe('method: proposalTimeFrames', () => {
    let queryMultiStub: sinon.SinonStub;
    let coolOfPeriod: BigNumber;
    let proposalDuration: BigNumber;
    let rawCoolOfPeriod: u8;
    let rawProposalDuration: u8;

    beforeEach(() => {
      dsMockUtils.createQueryStub('pips', 'proposalCoolOffPeriod');
      dsMockUtils.createQueryStub('pips', 'proposalDuration');
      queryMultiStub = dsMockUtils.getQueryMultiStub();
      coolOfPeriod = new BigNumber(100);
      proposalDuration = new BigNumber(600);
      rawCoolOfPeriod = dsMockUtils.createMockU32(coolOfPeriod.toNumber());
      rawProposalDuration = dsMockUtils.createMockU32(proposalDuration.toNumber());
      u32ToBigNumberStub.withArgs(rawCoolOfPeriod).returns(coolOfPeriod);
      u32ToBigNumberStub.withArgs(rawProposalDuration).returns(proposalDuration);
    });

    test('should return the proposal time frames', async () => {
      queryMultiStub.resolves([rawCoolOfPeriod, rawProposalDuration]);

      const result = await governance.proposalTimeFrames();

      expect(result.coolOff).toBe(coolOfPeriod.toNumber());
      expect(result.duration).toBe(proposalDuration.toNumber());
    });

    test('should allow subscription', async () => {
      const unsubCallback = 'unsubCallback';

      queryMultiStub.callsFake(async (_, cbFunc) => {
        cbFunc([rawCoolOfPeriod, rawProposalDuration]);
        return unsubCallback;
      });

      const callback = sinon.stub();
      const result = await governance.proposalTimeFrames(callback);

      expect(result).toBe(unsubCallback);
      sinon.assert.calledWith(callback, {
        coolOff: coolOfPeriod.toNumber(),
        duration: proposalDuration.toNumber(),
      });
    });
  });
});
