import { distributionPaymentsQuery, distributionQuery } from '~/middleware/queries/distributions';

describe('distributionQuery', () => {
  it('should pass the variables to the grapqhl query', () => {
    const variables = {
      assetId: 'TICKER',
      localId: 1,
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
