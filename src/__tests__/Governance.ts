import BigNumber from 'bignumber.js';
import sinon from 'sinon';

import { Identity, Proposal } from '~/api/entities';
import { createProposal } from '~/api/procedures';
import { TransactionQueue } from '~/base';
import { Context } from '~/context';
import { Governance } from '~/Governance';
import { proposals } from '~/middleware/queries';
import { Proposal as MiddlewareProposal, ProposalState } from '~/middleware/types';
import { dsMockUtils } from '~/testUtils/mocks';
import { TxTags } from '~/types';

describe('Governance class', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  describe('method: getGovernanceCommitteeMembers', () => {
    afterAll(() => {
      sinon.restore();
    });

    test('should retrieve a list of the identities of all active members', async () => {
      const did = 'someDid';
      const context = dsMockUtils.getContextInstance();
      const expectedMembers = [new Identity({ did }, context)];
      const governance = new Governance(context);

      dsMockUtils.createQueryStub('committeeMembership', 'activeMembers', {
        returnValue: [dsMockUtils.createMockIdentityId('someDid')],
      });

      const result = await governance.getGovernanceCommitteeMembers();

      expect(result).toEqual(expectedMembers);
    });
  });

  describe('method: getProposals', () => {
    let context: Context;

    beforeEach(() => {
      context = dsMockUtils.getContextInstance();
    });

    test('should return a list of proposal entities', async () => {
      const pipId = 10;
      const proposerDid = 'someProposerDid';
      const createdAt = 50800;
      const coolOffPeriod = 100;
      const proposalPeriodTimeFrame = 600;
      const fakeResult = [new Proposal({ pipId }, context)];
      const proposalsQueryResponse: MiddlewareProposal[] = [
        {
          pipId,
          proposer: proposerDid,
          createdAt,
          url: 'http://someUrl',
          description: 'some description',
          coolOffEndBlock: createdAt + coolOffPeriod,
          endBlock: createdAt + proposalPeriodTimeFrame,
          proposal: '0x180500cc829c190000000000000000000000e8030000',
          lastState: ProposalState.Referendum,
          lastStateUpdatedAt: createdAt + proposalPeriodTimeFrame,
          totalVotes: 0,
          totalAyesWeight: 0,
          totalNaysWeight: 0,
        },
      ];
      const governance = new Governance(context);

      dsMockUtils.createApolloQueryStub(
        proposals({
          proposers: [proposerDid],
          states: undefined,
          orderBy: undefined,
          count: undefined,
          skip: undefined,
        }),
        {
          proposals: proposalsQueryResponse,
        }
      );

      const result = await governance.getProposals({
        proposers: [proposerDid],
      });

      expect(result).toEqual(fakeResult);
    });

    test('should throw if the middleware query fails', async () => {
      const governance = new Governance(context);

      dsMockUtils.throwOnMiddlewareQuery();

      return expect(governance.getProposals()).rejects.toThrow('Error in middleware query: Error');
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
      const context = dsMockUtils.getContextInstance();
      const governance = new Governance(context);
      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<Proposal>;

      sinon
        .stub(createProposal, 'prepare')
        .withArgs(args, context)
        .resolves(expectedQueue);

      const queue = await governance.createProposal(args);

      expect(queue).toBe(expectedQueue);
    });
  });
});
