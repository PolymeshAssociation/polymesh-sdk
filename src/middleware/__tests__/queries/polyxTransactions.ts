import BigNumber from 'bignumber.js';
import { print } from 'graphql';

import { polyxTransactionsQuery } from '~/middleware/queries/polyxTransactions';
import { PolyxTransactionsOrderBy } from '~/middleware/types';
import { DEFAULT_GQL_PAGE_SIZE } from '~/utils/constants';

describe('polyxTransactionsQuery', () => {
  it('should pass the variables to the grapqhl query', () => {
    const variables = {
      addresses: ['someAddress'],
      identityId: 'someDid',
      size: DEFAULT_GQL_PAGE_SIZE,
      start: 0,
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

  it('should default to newest first, ordered by the id that encodes block and event index', () => {
    const { query } = polyxTransactionsQuery({});

    expect(print(query)).toContain('orderBy: [ID_DESC]');
  });

  it('should pass a requested ordering straight through', () => {
    const { query } = polyxTransactionsQuery(
      {},
      undefined,
      undefined,
      PolyxTransactionsOrderBy.CreatedBlockIdAsc
    );

    expect(print(query)).toContain('orderBy: [CREATED_BLOCK_ID_ASC]');
  });

  it('should request totalCount, which the ResultSet count is built from', () => {
    const { query } = polyxTransactionsQuery({});

    expect(print(query)).toContain('totalCount');
  });
});
