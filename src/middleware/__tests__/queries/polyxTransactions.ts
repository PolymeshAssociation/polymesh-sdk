import BigNumber from 'bignumber.js';

import { polyxTransactionsQuery } from '~/middleware/queries/polyxTransactions';
import { DEFAULT_GQL_PAGE_SIZE } from '~/utils/constants';

describe('polyxTransactionsQuery', () => {
  it('should pass the variables to the grapqhl query', () => {
    const variables = {
      addresses: ['someAddress'],
      identityId: 'someDid',
      size: DEFAULT_GQL_PAGE_SIZE,
      start: 0,
    };

    let result = polyxTransactionsQuery(false, variables);

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual(variables);

    result = polyxTransactionsQuery(false, {}, new BigNumber(10), new BigNumber(2));

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual({
      size: 10,
      start: 2,
    });
  });
});
