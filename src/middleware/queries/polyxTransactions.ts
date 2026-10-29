import { QueryOptions } from '@apollo/client/core';
import BigNumber from 'bignumber.js';
import gql from 'graphql-tag';

import {
  eventIdentifierFields,
  getSizeAndOffset,
  orderByClause,
} from '~/middleware/queries/common';
import { PolyxEntriesOrderBy } from '~/middleware/types';
import { PaginatedQueryArgs } from '~/types/utils';

export interface QueryPolyxTransactionFilters {
  identityId?: string | undefined;
  addresses?: string[] | undefined;
}

/**
 *  @hidden
 */
function createPolyxTransactionFilters({ identityId, addresses }: QueryPolyxTransactionFilters): {
  args: string;
  filter: string;
  variables: QueryPolyxTransactionFilters;
} {
  const args = ['$size: Int, $start: Int'];
  const filters = [];
  const variables: QueryPolyxTransactionFilters = {};

  // an entry is one side of a movement, so the entries of an Account or an Identity are exactly
  // the movements it took part in
  if (identityId) {
    variables.identityId = identityId;
    args.push('$identityId: String!');
    filters.push('{ identityId: { equalTo: $identityId } }');
  }

  if (addresses?.length) {
    variables.addresses = addresses;
    args.push('$addresses: [String!]!');
    filters.push('{ accountId: { in: $addresses } }');
  }

  let filter = '';
  if (filters.length === 1) {
    filter = `filter: ${filters[0]}`;
  } else if (filters.length) {
    filter = `filter: { or: [ ${filters.join(', ')} ] }`;
  }

  return {
    args: `(${args.join()})`,
    filter,
    variables,
  };
}

/**
 * @hidden
 *
 * Get the POLYX balance entries of an Identity's or some Accounts' balances
 */
export function polyxTransactionsQuery(
  filters: QueryPolyxTransactionFilters,
  size?: BigNumber,
  start?: BigNumber,
  orderBy?: PolyxEntriesOrderBy | PolyxEntriesOrderBy[]
): QueryOptions<PaginatedQueryArgs<QueryPolyxTransactionFilters>> {
  const { args, filter, variables } = createPolyxTransactionFilters(filters);

  // `id` is `<block>/<event index>/<side>`, zero padded: block order, and unique
  const ordering = orderByClause(orderBy, [PolyxEntriesOrderBy.IdDesc]);

  const query = gql`
    query PolyxTransactionsQuery
      ${args}
     {
      polyxEntries(
        ${filter}
        first: $size
        offset: $start
        orderBy: [${ordering}]
      ) {
        totalCount
        nodes {
          id
          accountId
          identityId
          counterpartyAddress
          counterpartyIdentityId
          pool
          amount
          kind
          direction
          memo
          moduleId
          callId
          eventId
          extrinsic {
            extrinsicIdx
          }
          createdEvent {
            ${eventIdentifierFields}
          }
        }
      }
    }
  `;

  return {
    query,
    variables: { ...variables, ...getSizeAndOffset(size, start) },
  };
}
