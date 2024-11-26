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
      assetId: '0x12341234123412341234123412341234',
      address: 'someAddress',
    };

    const result = portfolioMovementsQuery(false, variables);

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual({
      address: 'someAddress',
      assetId: '0x12341234123412341234123412341234',
      fromId: 'someDid/1',
      toId: 'someDid/1',
    });
  });
});
