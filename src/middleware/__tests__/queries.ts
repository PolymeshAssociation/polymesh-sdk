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
  it('should pass the variables to the grapqhl query', () => {
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
  it('should pass the variables to the grapqhl query', () => {
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
  it('should pass the variables to the grapqhl query', () => {
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
  it('should pass the variables to the grapqhl query', () => {
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
  it('should pass the variables to the grapqhl query', () => {
    const variables = {
      transactionHash: 'someTransactionHash',
    };

    const result = transactionByHash(variables);

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual(variables);
  });
});

describe('proposals', () => {
  it('should pass the variables to the grapqhl query', () => {
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

describe('assetsByTrustedClaimIssuer', () => {
  it('should pass the variables to the grapqhl query', () => {
    const variables = {
      claimIssuerDid: 'someDid',
    };

    const result = tokensByTrustedClaimIssuer(variables);

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual(variables);
  });
});

describe('assetsHeldByDid', () => {
  it('should pass the variables to the grapqhl query', () => {
    const variables = {
      did: 'someDid',
    };

    const result = tokensHeldByDid(variables);

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual(variables);
  });
});

describe('transactions', () => {
  it('should pass the variables to the grapqhl query', () => {
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
  it('should pass the variables to the grapqhl query', () => {
    const variables = {
      did: 'someDid',
    };

    const result = scopesByIdentity(variables);

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual(variables);
  });
});

describe('issuerDidsWithClaimsByTarget', () => {
  it('should pass the variables to the grapqhl query', () => {
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
  it('should pass the variables to the grapqhl query', () => {
    const variables = {
      pipId: 1,
    };

    const result = proposal(variables);

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual(variables);
  });
});

describe('eventByAddedTrustedClaimIssuer', () => {
  it('should pass the variables to the grapqhl query', () => {
    const variables = {
      ticker: 'SOME_TICKER',
      identityId: 'someDid',
    };

    const result = eventByAddedTrustedClaimIssuer(variables);

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual(variables);
  });
});

describe('settlements', () => {
  it('should pass the variables to the grapqhl query', () => {
    const variables = {
      identityId: 'someIdentityId',
    };

    const result = settlements(variables);

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual(variables);
  });
});

describe('investments', () => {
  it('should pass the variables to the grapqhl query', () => {
    const variables = {
      stoId: 1,
      ticker: 'SOME_TICKER',
    };

    const result = investments(variables);

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual(variables);
  });
});

describe('getWithholdingTaxesOfCa', () => {
  it('should pass the variables to the grapqhl query', () => {
    const variables = {
      CAId: { ticker: 'SOME_TICKER', localId: 1 },
    };

    const result = getWithholdingTaxesOfCa(variables);

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual(variables);
  });
});

describe('getHistoryOfPaymentEventsForCa', () => {
  it('should pass the variables to the grapqhl query', () => {
    const variables = {
      CAId: { ticker: 'SOME_TICKER', localId: 1 },
    };

    const result = getHistoryOfPaymentEventsForCa(variables);

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual(variables);
  });
});

describe('tickerExternalAgentHistory', () => {
  it('should pass the variables to the grapqhl query', () => {
    const variables = {
      ticker: 'SOME_TICKER',
    };

    const result = tickerExternalAgentHistory(variables);

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual(variables);
  });
});

describe('tickerExternalAgentActions', () => {
  it('should pass the variables to the grapqhl query', () => {
    const variables = {
      ticker: 'SOME_TICKER',
      // eslint-disable-next-line @typescript-eslint/naming-convention
      caller_did: 'someDid',
    };

    const result = tickerExternalAgentActions(variables);

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual(variables);
  });
});
