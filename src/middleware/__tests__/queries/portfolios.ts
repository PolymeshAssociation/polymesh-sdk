import BigNumber from 'bignumber.js';
import { print } from 'graphql';

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

    const result = portfolioMovementsQuery(variables);

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual({
      address: 'someAddress',
      assetId: '0x12341234123412341234123412341234',
      from: 'someDid/1',
      to: 'someDid/1',
    });
  });

  it('should read internal transfers that no instruction made', () => {
    const { query } = portfolioMovementsQuery({ identityId: 'someDid' });

    expect(print(query)).toContain('isInternalTransfer: {equalTo: true}');
    expect(print(query)).toContain('instructionId: {isNull: true}');
    expect(print(query)).toContain('fromPortfolioId: {equalTo: $from}');
  });
});
