import BigNumber from 'bignumber.js';

import { Identity } from '~/api/entities/Identity';
import { Entity } from '~/base';
import { Context } from '~/context';
import { proposalVotes } from '~/middleware/queries';
import { dsMockUtils } from '~/testUtils/mocks';

import { Proposal } from '../';

describe('Proposal class', () => {
  const pipId = 10;
  let context: Context;
  let proposal: Proposal;

  beforeAll(() => {
    dsMockUtils.initMocks();
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

  describe('method: getVotes', () => {
    test('should return the list of votes', async () => {
      const identityDid = 'someDid';
      const vote = false;
      const weight = new BigNumber(10000000000);
      const proposalVotesQueryResponse = [
        {
          account: identityDid,
          vote,
          weight: weight.toNumber(),
        },
      ];
      const fakeResult = [
        {
          identity: new Identity({ did: identityDid }, context),
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
});
