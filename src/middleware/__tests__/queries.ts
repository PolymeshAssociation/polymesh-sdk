import {
  ClaimTypeEnum,
  EventIdEnum,
  ModuleIdEnum,
  Order,
  ProposalOrderFields,
  ProposalState,
  ProposalVotesOrderFields,
} from '~/middleware/types';

import { didsWithClaims, eventByIndexedArgs, proposals, proposalVotes } from '../queries';

describe('proposalVotes', () => {
  test('should pass the variables to the grapqhl query', () => {
    const variables = {
      pipId: 10,
      vote: false,
      count: 50,
      skip: 0,
      orderBy: {
        field: ProposalVotesOrderFields.Vote,
        order: Order.Desc,
      },
    };

    const result = proposalVotes(variables);

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual(variables);
  });
});

describe('didsWithClaims', () => {
  test('should pass the variables to the grapqhl query', () => {
    const variables = {
      dids: ['someDid', 'otherDid'],
      scope: 'someScope',
      trustedClaimIssuers: ['someTrustedClaim'],
      claimTypes: [ClaimTypeEnum.Accredited],
      count: 100,
      skip: 0,
    };

    const result = didsWithClaims(variables);

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual(variables);
  });
});

describe('eventByIndexedArgs', () => {
  test('should pass the variables to the grapqhl query', () => {
    const variables = {
      moduleId: ModuleIdEnum.Asset,
      eventId: EventIdEnum.AssetFrozen,
      eventArg0: 'someData',
    };

    const result = eventByIndexedArgs(variables);

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual(variables);
  });
});

describe('proposals', () => {
  test('should pass the variables to the grapqhl query', () => {
    const variables = {
      proposers: ['someProposer'],
      states: [ProposalState.Referendum],
      orderBy: {
        field: ProposalOrderFields.CreatedAt,
        order: Order.Desc,
      },
    };

    const result = proposals(variables);

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual(variables);
  });
});
