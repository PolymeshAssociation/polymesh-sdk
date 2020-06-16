import { didsWithClaims, eventByIndexedArgs } from '../queries';

describe('didsWithClaims', () => {
  test('should pass the variables to the grapqhl query', () => {
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
  test('should pass the variables to the grapqhl query', () => {
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
