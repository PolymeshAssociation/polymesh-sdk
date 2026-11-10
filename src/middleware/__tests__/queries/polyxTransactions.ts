import BigNumber from 'bignumber.js';
import { print } from 'graphql';

import { polyxTransactionsQuery } from '~/middleware/queries/polyxTransactions';
import { PolyxEntriesOrderBy } from '~/middleware/types';
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
    expect(print(result.query)).toContain(
      'filter: {or: [{identityId: {equalTo: $identityId}}, {accountId: {in: $addresses}}]}'
    );

    result = polyxTransactionsQuery({}, new BigNumber(10), new BigNumber(2));

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual({
      size: 10,
      start: 2,
    });
  });

  it('should filter on one side alone, since each entry is one side of a movement', () => {
    expect(print(polyxTransactionsQuery({ identityId: 'someDid' }).query)).toContain(
      'filter: {identityId: {equalTo: $identityId}}'
    );
    expect(print(polyxTransactionsQuery({ addresses: ['someAddress'] }).query)).toContain(
      'filter: {accountId: {in: $addresses}}'
    );
  });

  it('should default to newest first, ordered by the id that encodes block and event index', () => {
    const { query } = polyxTransactionsQuery({});

    expect(print(query)).toContain('orderBy: [ID_DESC]');
  });

  it('should put a requested ordering first, ahead of the key that makes it unique', () => {
    const { query } = polyxTransactionsQuery(
      {},
      undefined,
      undefined,
      PolyxEntriesOrderBy.CreatedEventIdAsc
    );

    expect(print(query)).toContain('orderBy: [CREATED_EVENT_ID_ASC, ID_DESC]');
  });

  it('should request totalCount, which the ResultSet count is built from', () => {
    const { query } = polyxTransactionsQuery({});

    expect(print(query)).toContain('totalCount');
  });
});
