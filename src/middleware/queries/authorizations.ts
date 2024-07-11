import { QueryOptions } from '@apollo/client/core';
import BigNumber from 'bignumber.js';
import gql from 'graphql-tag';

import { Authorization, AuthorizationsOrderBy } from '~/middleware/types';
import { PaginatedQueryArgs, QueryArgs } from '~/types/utils';

export type AuthorizationArgs = 'fromId' | 'type' | 'status' | 'toId' | 'toKey' | 'expiry';

/**
 *  @hidden
 */
function createAuthorizationFilters(variables: QueryArgs<Authorization, AuthorizationArgs>): {
  args: string;
  filter: string;
  variables: QueryArgs<Authorization, AuthorizationArgs>;
} {
  const args = ['$size: Int, $start: Int'];
  const filters = [];
  const { fromId, toId, toKey, status, type } = variables;
  if (fromId?.length) {
    args.push('$fromId: String!');
    filters.push('fromId: { equalTo: $fromId }');
  }
  if (toId?.length) {
    args.push('$toId: String!');
    filters.push('toId: { equalTo: $toId }');
  }
  if (toKey?.length) {
    args.push('$toKey: String!');
    filters.push('toKey: { equalTo: $toKey }');
  }
  if (type) {
    args.push('$type: AuthTypeEnum!');
    filters.push('type: { equalTo: $type }');
  }
  if (status) {
    args.push('$status: AuthorizationStatusEnum!');
    filters.push('status: { equalTo: $status }');
  }
  return {
    args: `(${args.join()})`,
    filter: filters.length ? `filter: { ${filters.join()} }` : '',
    variables,
  };
}

/**
 * @hidden
 *
 * Get all authorizations with specified filters
 */
export function authorizationsQuery(
  filters: QueryArgs<Authorization, AuthorizationArgs>,
  size?: BigNumber,
  start?: BigNumber
): QueryOptions<PaginatedQueryArgs<QueryArgs<Authorization, AuthorizationArgs>>> {
  const { args, filter } = createAuthorizationFilters(filters);
  const query = gql`
    query AuthorizationsQuery
      ${args}
      {
      authorizations(
        ${filter}
        first: $size
        offset: $start
        orderBy: [${AuthorizationsOrderBy.CreatedAtAsc}, ${AuthorizationsOrderBy.CreatedBlockIdAsc}]
      ) {
        totalCount
        nodes {
          id
          type
          fromId
          toId
          toKey
          data
          expiry
          status
          createdBlockId
          updatedBlockId
        }
      }
    }
  `;

  return {
    query,
    variables: { ...filters, size: size?.toNumber(), start: start?.toNumber() },
  };
}
