import {
  ClaimScopeTypeEnum,
  ClaimTypeEnum,
  EventIdEnum,
  ModuleIdEnum,
  Order,
  ProposalOrderFields,
  ProposalStateEnum,
  ProposalVotesOrderFields,
} from '~/middleware/types';

import {
  didsWithClaims,
  eventByAddedTrustedClaimIssuer,
  eventByIndexedArgs,
  eventsByIndexedArgs,
  getHistoryOfPaymentEventsForCa,
  getWithholdingTaxesOfCa,
  investments,
  issuerDidsWithClaimsByTarget,
  proposal,
  proposals,
  proposalVotes,
  scopesByIdentity,
  settlements,
  tickerExternalAgentActions,
  tickerExternalAgentHistory,
  tokensByTrustedClaimIssuer,
  tokensHeldByDid,
  transactionByHash,
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
      scope: { type: ClaimScopeTypeEnum.Ticker, value: 'someScope' },
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

describe('eventsByIndexedArgs', () => {
  test('should pass the variables to the grapqhl query', () => {
    const variables = {
      moduleId: ModuleIdEnum.Asset,
      eventId: EventIdEnum.AssetFrozen,
      eventArg0: 'someData',
    };

    const result = eventsByIndexedArgs(variables);

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual(variables);
  });
});

describe('transactionByHash', () => {
  test('should pass the variables to the grapqhl query', () => {
    const variables = {
      transactionHash: 'someTransactionHash',
    };

    const result = transactionByHash(variables);

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual(variables);
  });
});

describe('proposals', () => {
  test('should pass the variables to the grapqhl query', () => {
    const variables = {
      proposers: ['someProposer'],
      states: [ProposalStateEnum.Scheduled],
      orderBy: {
        field: ProposalOrderFields.VotesCount,
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
      scope: { type: ClaimScopeTypeEnum.Identity, value: 'someScope' },
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

describe('eventByAddedTrustedClaimIssuer', () => {
  test('should pass the variables to the grapqhl query', () => {
    const variables = {
      ticker: 'SOMETICKER',
      identityId: 'someDid',
    };

    const result = eventByAddedTrustedClaimIssuer(variables);

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual(variables);
  });
});

describe('settlements', () => {
  test('should pass the variables to the grapqhl query', () => {
    const variables = {
      identityId: 'someIdentityId',
    };

    const result = settlements(variables);

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual(variables);
  });
});

describe('investments', () => {
  test('should pass the variables to the grapqhl query', () => {
    const variables = {
      stoId: 1,
      ticker: 'SOMETICKER',
    };

    const result = investments(variables);

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual(variables);
  });
});

describe('getWithholdingTaxesOfCa', () => {
  test('should pass the variables to the grapqhl query', () => {
    const variables = {
      CAId: { ticker: 'SOMETICKER', localId: 1 },
    };

    const result = getWithholdingTaxesOfCa(variables);

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual(variables);
  });
});

describe('getHistoryOfPaymentEventsForCa', () => {
  test('should pass the variables to the grapqhl query', () => {
    const variables = {
      CAId: { ticker: 'SOMETICKER', localId: 1 },
    };

    const result = getHistoryOfPaymentEventsForCa(variables);

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual(variables);
  });
});

describe('tickerExternalAgentHistory', () => {
  test('should pass the variables to the grapqhl query', () => {
    const variables = {
      ticker: 'SOMETICKER',
    };

    const result = tickerExternalAgentHistory(variables);

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual(variables);
  });
});

describe('tickerExternalAgentActions', () => {
  test('should pass the variables to the grapqhl query', () => {
    const variables = {
      ticker: 'SOMETICKER',
      caller_did: 'someDid',
    };

    const result = tickerExternalAgentActions(variables);

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual(variables);
  });
});
