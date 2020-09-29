import {
  ClaimTypeEnum,
  EventIdEnum,
  ModuleIdEnum,
  Order,
  ProposalOrderFields,
  ProposalState,
  ProposalVotesOrderFields,
} from '~/middleware/types';

import {
  didsWithClaims,
  eventByIndexedArgs,
  issuerDidsWithClaimsByTarget,
  proposal,
  proposals,
  proposalVotes,
  scopesByIdentity,
  tokensByTrustedClaimIssuer,
  tokensHeldByDid,
  transactions,
} from '../queries';

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

describe('tokensByTrustedClaimIssuer', () => {
  test('should pass the variables to the grapqhl query', () => {
    const variables = {
      claimIssuerDid: 'someDid',
      order: Order.Asc,
    };

    const result = tokensByTrustedClaimIssuer(variables);

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual(variables);
  });
});

describe('tokensHeldByDid', () => {
  test('should pass the variables to the grapqhl query', () => {
    const variables = {
      did: 'someDid',
    };

    const result = tokensHeldByDid(variables);

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual(variables);
  });
});

describe('transactions', () => {
  test('should pass the variables to the grapqhl query', () => {
    let result = transactions();

    expect(result.query).toBeDefined();
    expect(result.variables).toBeUndefined();

    const variables = {
      address: 'someAddress',
    };
    result = transactions(variables);
    expect(result.query).toBeDefined();
    expect(result.variables).toEqual(variables);
  });
});

describe('scopesByIdentity', () => {
  test('should pass the variables to the grapqhl query', () => {
    const variables = {
      did: 'someDid',
    };

    const result = scopesByIdentity(variables);

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual(variables);
  });
});

describe('issuerDidsWithClaimsByTarget', () => {
  test('should pass the variables to the grapqhl query', () => {
    const variables = {
      target: 'someDid',
      scope: 'someScope',
      trustedClaimIssuers: ['aTrustedClaimIssuer'],
    };

    const result = issuerDidsWithClaimsByTarget(variables);

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual(variables);
  });
});

describe('proposal', () => {
  test('should pass the variables to the grapqhl query', () => {
    const variables = {
      pipId: 1,
    };

    const result = proposal(variables);

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual(variables);
  });
});
