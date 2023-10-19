import BigNumber from 'bignumber.js';

import {
  assetHoldersQuery,
  assetQuery,
  assetTransactionQuery,
  authorizationsQuery,
  claimsGroupingQuery,
  claimsQuery,
  distributionPaymentsQuery,
  distributionQuery,
  eventsByArgs,
  extrinsicByHash,
  extrinsicsByArgs,
  heartbeatQuery,
  instructionsByDidQuery,
  instructionsQuery,
  investmentsQuery,
  latestBlockQuery,
  latestSqVersionQuery,
  metadataQuery,
  polyxTransactionsQuery,
  portfolioMovementsQuery,
  portfolioQuery,
  settlementsQuery,
  tickerExternalAgentActionsQuery,
  tickerExternalAgentHistoryQuery,
  tickerExternalAgentsQuery,
  trustedClaimIssuerQuery,
  trustingAssetsQuery,
} from '~/middleware/queries';
import {
  AuthorizationStatusEnum,
  AuthTypeEnum,
  CallIdEnum,
  ClaimTypeEnum,
  EventIdEnum,
  ModuleIdEnum,
} from '~/middleware/types';
import { ClaimScopeTypeEnum } from '~/middleware/typesV1';

describe('latestBlockQuery', () => {
  it('should pass the variables to the grapqhl query', () => {
    const result = latestBlockQuery();

    expect(result.query).toBeDefined();
    expect(result.variables).toBeUndefined();
  });
});

describe('heartbeat', () => {
  it('should pass the variables to the grapqhl query', () => {
    const result = heartbeatQuery();

    expect(result.query).toBeDefined();
    expect(result.variables).toBeUndefined();
  });
});

describe('metadataQuery', () => {
  it('should pass the variables to the grapqhl query', () => {
    const result = metadataQuery();

    expect(result.query).toBeDefined();
    expect(result.variables).toBeUndefined();
  });
});

describe('latestSqVersionQuery', () => {
  it('should pass the variables to the grapqhl query', () => {
    const result = latestSqVersionQuery();

    expect(result.query).toBeDefined();
    expect(result.variables).toBeUndefined();
  });
});

describe('claimsGroupingQuery', () => {
  it('should pass the variables to the grapqhl query', () => {
    const variables = {
      dids: ['someDid', 'otherDid'],
      scope: { type: ClaimScopeTypeEnum.Ticker, value: 'someScope' },
      trustedClaimIssuers: ['someTrustedClaim'],
      claimTypes: [ClaimTypeEnum.Accredited],
      includeExpired: true,
    };

    const result = claimsGroupingQuery(variables);

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual(variables);
  });
});

describe('claimsQuery', () => {
  it('should pass the variables to the grapqhl query', () => {
    const variables = {
      dids: ['someDid', 'otherDid'],
      scope: { type: ClaimScopeTypeEnum.Ticker, value: 'someScope' },
      trustedClaimIssuers: ['someTrustedClaim'],
      claimTypes: [ClaimTypeEnum.Accredited],
      includeExpired: true,
    };

    let result = claimsQuery(variables);

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual(variables);

    result = claimsQuery(
      { ...variables, includeExpired: false },
      new BigNumber(1),
      new BigNumber(0)
    );

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual({
      ...variables,
      includeExpired: false,
      expiryTimestamp: expect.any(Number),
      size: 1,
      start: 0,
    });
  });
});

describe('investmentsQuery', () => {
  it('should pass the variables to the grapqhl query', () => {
    const variables = {
      stoId: 1,
      offeringToken: 'SOME_TICKER',
    };

    const result = investmentsQuery(variables);

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual(variables);
  });
});

describe('instructionsQuery', () => {
  it('should pass the variables to the grapqhl query', () => {
    const variables = {
      eventId: EventIdEnum.InstructionExecuted,
      id: '1',
    };

    let result = instructionsQuery(variables);

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual(variables);

    result = instructionsQuery(
      {
        venueId: '2',
      },
      new BigNumber(10),
      new BigNumber(2)
    );

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual({
      venueId: '2',
      size: 10,
      start: 2,
    });
  });
});

describe('instructionsByDidQuery', () => {
  it('should pass the variables to the grapqhl query', () => {
    const result = instructionsByDidQuery('someDid');
    expect(result.query).toBeDefined();
    expect(result.variables).toEqual({ fromId: 'someDid/', toId: 'someDid/' });
  });
});

describe('eventsByArgs', () => {
  it('should pass the variables to the grapqhl query', () => {
    let result = eventsByArgs({});

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual({});

    const variables = {
      moduleId: ModuleIdEnum.Asset,
      eventId: EventIdEnum.AssetCreated,
      eventArg0: 'TICKER',
    };

    result = eventsByArgs(variables);

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual(variables);

    result = eventsByArgs(variables, new BigNumber(1), new BigNumber(0));

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual({
      ...variables,
      size: 1,
      start: 0,
    });
  });
});

describe('extrinsicByHash', () => {
  it('should pass the variables to the grapqhl query', () => {
    const variables = {
      extrinsicHash: 'someHash',
    };

    const result = extrinsicByHash(variables);

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual(variables);
  });
});

describe('extrinsicsByArgs', () => {
  it('should pass the variables to the grapqhl query', () => {
    let result = extrinsicsByArgs({});

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual({});

    const variables = {
      blockId: '123',
      address: 'someAddress',
      moduleId: ModuleIdEnum.Asset,
      callId: CallIdEnum.CreateAsset,
      success: 1,
    };

    result = extrinsicsByArgs(variables);

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual(variables);
  });
});

describe('trustedClaimIssuerQuery', () => {
  it('should pass the variables to the grapqhl query', () => {
    const variables = {
      issuer: 'someDid',
      assetId: 'SOME_TICKER',
    };

    const result = trustedClaimIssuerQuery(variables);

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual(variables);
  });
});

describe('trustingAssetsQuery', () => {
  it('should pass the variables to the grapqhl query', () => {
    const variables = {
      issuer: 'someDid',
    };

    const result = trustingAssetsQuery(variables);

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual(variables);
  });
});

describe('portfolioQuery', () => {
  it('should pass the variables to the grapqhl query', () => {
    const variables = {
      identityId: 'someDid',
      number: 1,
    };

    const result = portfolioQuery(variables);

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual(variables);
  });
});

describe('assetQuery', () => {
  it('should pass the variables to the grapqhl query', () => {
    const variables = {
      ticker: 'SOME_TICKER',
    };

    const result = assetQuery(variables);

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual(variables);
  });
});

describe('tickerExternalAgentsQuery', () => {
  it('should pass the variables to the grapqhl query', () => {
    const variables = {
      assetId: 'SOME_TICKER',
    };

    const result = tickerExternalAgentsQuery(variables);

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual(variables);
  });
});

describe('tickerExternalAgentHistoryQuery', () => {
  it('should pass the variables to the grapqhl query', () => {
    const variables = {
      assetId: 'SOME_TICKER',
    };

    const result = tickerExternalAgentHistoryQuery(variables);

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual(variables);
  });
});

describe('tickerExternalAgentActionsQuery', () => {
  it('should pass the variables to the grapqhl query', () => {
    let result = tickerExternalAgentActionsQuery({});

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual({});

    const variables = {
      assetId: 'SOME_TICKER',
      callerId: 'someDid',
      palletName: 'asset',
      eventId: EventIdEnum.ControllerTransfer,
    };

    result = tickerExternalAgentActionsQuery(variables);

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual(variables);

    result = tickerExternalAgentActionsQuery(variables, new BigNumber(1), new BigNumber(0));

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual({
      ...variables,
      size: 1,
      start: 0,
    });
  });
});

describe('distributionQuery', () => {
  it('should pass the variables to the grapqhl query', () => {
    const variables = {
      id: '123',
    };

    const result = distributionQuery(variables);

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual(variables);
  });
});

describe('distributionPaymentsQuery', () => {
  it('should pass the variables to the grapqhl query', () => {
    const variables = {
      distributionId: 'SOME_TICKER/1',
    };

    const result = distributionPaymentsQuery(variables);

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual(variables);
  });
});

describe('assetHoldersQuery', () => {
  it('should pass the variables to the grapqhl query', () => {
    const variables = {
      identityId: 'someDid',
    };

    let result = assetHoldersQuery(variables);

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual(variables);

    result = assetHoldersQuery(variables, new BigNumber(1), new BigNumber(0));

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual({
      ...variables,
      size: 1,
      start: 0,
    });
  });
});

describe('settlementsQuery', () => {
  it('should pass the variables to the grapqhl query', () => {
    const variables = {
      identityId: 'someDid',
      portfolioId: new BigNumber(1),
      ticker: 'SOME_TICKER',
      address: 'someAddress',
    };

    const result = settlementsQuery(variables);

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual({
      addresses: ['someAddress'],
      assetId: 'SOME_TICKER',
      fromId: 'someDid/1',
      toId: 'someDid/1',
    });
  });
});

describe('portfolioMovementsQuery', () => {
  it('should pass the variables to the grapqhl query', () => {
    const variables = {
      identityId: 'someDid',
      portfolioId: new BigNumber(1),
      ticker: 'SOME_TICKER',
      address: 'someAddress',
    };

    const result = portfolioMovementsQuery(variables);

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual({
      address: 'someAddress',
      assetId: 'SOME_TICKER',
      fromId: 'someDid/1',
      toId: 'someDid/1',
    });
  });
});

describe('assetTransactionQuery', () => {
  it('should pass the variables to the grapqhl query', () => {
    const variables = {
      assetId: 'SOME_TICKER',
    };

    let result = assetTransactionQuery(variables);

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual(variables);

    result = assetTransactionQuery(variables, new BigNumber(1), new BigNumber(0));

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual({
      ...variables,
      size: 1,
      start: 0,
    });
  });
});

describe('polyxTransactionsQuery', () => {
  it('should pass the variables to the grapqhl query', () => {
    const variables = {
      addresses: ['someAddress'],
      identityId: 'someDid',
    };

    let result = polyxTransactionsQuery(variables);

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual(variables);

    result = polyxTransactionsQuery({}, new BigNumber(10), new BigNumber(2));

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual({
      size: 10,
      start: 2,
    });
  });
});

describe('authorizationsQuery', () => {
  it('should pass the variables to the grapqhl query', () => {
    let result = authorizationsQuery({});

    expect(result.query).toBeDefined();

    const variables = {
      fromId: 'someId',
      toId: 'someOtherId',
      toKey: 'someKey',
      type: AuthTypeEnum.RotatePrimaryKey,
      status: AuthorizationStatusEnum.Consumed,
    };

    result = authorizationsQuery(variables);

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual(variables);

    result = authorizationsQuery(variables, new BigNumber(1), new BigNumber(0));

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual({
      ...variables,
      size: 1,
      start: 0,
    });
  });
});
