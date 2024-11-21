import { QueryOptions } from '@apollo/client/core';
import BigNumber from 'bignumber.js';
import gql from 'graphql-tag';

import { getSizeAndOffset } from '~/middleware/queries/common';
import { PolyxTransactionsOrderBy } from '~/middleware/types';
import { PaginatedQueryArgs } from '~/types/utils';

export interface QueryPolyxTransactionFilters {
  identityId?: string;
  addresses?: string[];
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
  const fromIdFilters = [];
  const toIdFilters = [];
  const variables: QueryPolyxTransactionFilters = {};

  if (identityId) {
    variables.identityId = identityId;
    args.push('$identityId: String!');
    fromIdFilters.push('identityId: { equalTo: $identityId }');
    toIdFilters.push('toId: { equalTo: $identityId }');
  }

  if (addresses?.length) {
    variables.addresses = addresses;
    args.push('$addresses: [String!]!');
    fromIdFilters.push('address: { in: $addresses }');
    toIdFilters.push('toAddress: { in: $addresses }');
  }

  return {
    args: `(${args.join()})`,
    filter:
      fromIdFilters.length && toIdFilters.length
        ? `filter: { or: [ { ${fromIdFilters.join()} }, { ${toIdFilters.join()} } ] }`
        : '',
    variables,
  };
}

/**
 * @hidden
 *
 * Get POLYX transactions where an Account or an Identity is involved
 */
export function polyxTransactionsQuery(
  paddedIds: boolean,
  filters: QueryPolyxTransactionFilters,
  size?: BigNumber,
  start?: BigNumber
): QueryOptions<PaginatedQueryArgs<QueryPolyxTransactionFilters>> {
  const { args, filter, variables } = createPolyxTransactionFilters(filters);

  const orderBy = paddedIds
    ? `${PolyxTransactionsOrderBy.CreatedBlockIdAsc}`
    : `${PolyxTransactionsOrderBy.CreatedAtAsc}, ${PolyxTransactionsOrderBy.CreatedBlockIdAsc}`;

  const query = gql`
    query PolyxTransactionsQuery
      ${args}
     {
      polyxTransactions(
        ${filter}
        first: $size
        offset: $start
        orderBy: [${orderBy}]
      ) {
        nodes {
          id
          identityId
          address
          toId
          toAddress
          amount
          type
          extrinsic {
            extrinsicIdx
          }
          callId
          eventId
          moduleId
          eventIdx
          memo
          datetime
          createdBlock {
            blockId
            datetime
            hash
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
