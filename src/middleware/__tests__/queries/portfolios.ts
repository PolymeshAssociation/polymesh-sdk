import BigNumber from 'bignumber.js';

import { portfolioMovementsQuery, portfolioQuery } from '~/middleware/queries/portfolios';

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
