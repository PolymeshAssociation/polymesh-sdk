import BigNumber from 'bignumber.js';
import sinon from 'sinon';

import { Identity } from '~/api/entities/Identity';
import { editProposal } from '~/api/procedures';
import { Entity, TransactionQueue } from '~/base';
import { Context } from '~/context';
import { proposalVotes } from '~/middleware/queries';
import { dsMockUtils } from '~/testUtils/mocks';

import { Proposal } from '../';

describe('Proposal class', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
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
      const pipId = 10;
      const context = dsMockUtils.getContextInstance();
      const proposal = new Proposal({ pipId }, context);

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

  describe('method: getVotes', () => {
    const pipId = 1;
    let context: Context;
    let proposal: Proposal;

    beforeEach(() => {
      context = dsMockUtils.getContextInstance();
      proposal = new Proposal({ pipId }, context);
    });

    test('should return the list of votes', async () => {
      const account = 'someDid';
      const vote = false;
      const weight = new BigNumber(10000000000);
      const proposalVotesQueryResponse = [
        {
          account,
          vote,
          weight: weight.toNumber(),
        },
      ];
      const fakeResult = [
        {
          account: new Identity({ did: account }, context),
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

      expect(result).toEqual(fakeResult);
    });

    test('should throw if the middleware query fails', async () => {
      dsMockUtils.throwOnMiddlewareQuery();

      return expect(proposal.getVotes()).rejects.toThrow('Error in middleware query: Error');
    });
  });

  describe('method: edit', () => {
    test('should prepare the procedure with the correct arguments and context', async () => {
      const pipId = 10;
      const context = dsMockUtils.getContextInstance();
      const args = {
        discussionUrl: 'www.my-new-proposal.com',
        description: 'A new proposal description',
      };
      const proposal = new Proposal({ pipId }, context);

      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<void>;

      sinon
        .stub(editProposal, 'prepare')
        .withArgs({ pipId, ...args }, context)
        .resolves(expectedQueue);

      const queue = await proposal.edit(args);

      expect(queue).toBe(expectedQueue);
    });
  });
});
