import BigNumber from 'bignumber.js';

import { polyxTransactionsQuery } from '~/middleware/queries/polyxTransactions';

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
