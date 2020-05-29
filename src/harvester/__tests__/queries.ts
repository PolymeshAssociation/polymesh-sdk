import { didsWithClaims, eventByIndexedArgs } from '../queries';

describe('didsWithClaims', () => {
  test('should verify that the variables are the same that were passed to the query', () => {
    const variables = {
      dids: ['someDid', 'otherDid'],
      scope: 'someScope',
      trustedClaimIssuers: ['someTrustedClaim'],
      claimTypes: ['someClaimType'],
      count: 100,
      skip: 0,
    };

    const result = didsWithClaims(variables);

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual(variables);
  });
});

describe('eventByIndexedArgs', () => {
  test('should verify that the variables are the same that were passed to the query', () => {
    const variables = {
      moduleId: 'someModule',
      eventId: 'someEvent',
      eventArg0: 'someData',
    };

    const result = eventByIndexedArgs(variables);

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual(variables);
  });
});
