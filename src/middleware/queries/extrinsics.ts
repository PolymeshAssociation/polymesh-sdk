import { QueryOptions } from '@apollo/client/core';
import BigNumber from 'bignumber.js';
import gql from 'graphql-tag';

import {
  createArgsAndFilters,
  getSizeAndOffset,
  orderByClause,
  removeUndefinedValues,
  toOrderByList,
} from '~/middleware/queries/common';
import { Extrinsic, ExtrinsicsOrderBy } from '~/middleware/types';
import { PaginatedQueryArgs, QueryArgs } from '~/types/utils';

/**
 * @hidden
 *
 * Get a transaction by hash
 */
export function extrinsicByHash(
  variables: QueryArgs<Extrinsic, 'extrinsicHash'>
): QueryOptions<QueryArgs<Extrinsic, 'extrinsicHash'>> {
  const query = gql`
    query TransactionByHashQuery($extrinsicHash: String!) {
      extrinsics(filter: { extrinsicHash: { equalTo: $extrinsicHash } }) {
        nodes {
          extrinsicIdx
          address
          nonce
          moduleId
          callId
          paramsTxt
          success
          specVersionId
          extrinsicHash
          block {
            blockId
            hash
            datetime
          }
        }
      }
    }
  `;

  return {
    query,
    variables,
  };
}

type ExtrinsicArgs = 'blockId' | 'address' | 'moduleId' | 'callId' | 'success';

/**
 * @hidden
 *
 * Get transactions
 */
export function extrinsicsByArgs(
  filters: QueryArgs<Extrinsic, ExtrinsicArgs>,
  size?: BigNumber,
  start?: BigNumber,
  orderBy?: ExtrinsicsOrderBy | ExtrinsicsOrderBy[]
): QueryOptions<PaginatedQueryArgs<QueryArgs<Extrinsic, ExtrinsicArgs>>> {
  const { args, filter } = createArgsAndFilters(filters, {
    moduleId: 'ModuleIdEnum',
    callId: 'CallIdEnum',
    success: 'Int',
  });

  // the indexer exposes no `createdAt` ordering; both map onto block order
  const supplied = toOrderByList(orderBy).map(key => {
    if (key === ExtrinsicsOrderBy.CreatedAtAsc) {
      return ExtrinsicsOrderBy.IdAsc;
    }
    if (key === ExtrinsicsOrderBy.CreatedAtDesc) {
      return ExtrinsicsOrderBy.IdDesc;
    }

    return key;
  });

  // `id` is `<block>/<extrinsic index>`, zero padded: block order, and unique
  const ordering = orderByClause(supplied, [ExtrinsicsOrderBy.IdAsc]);

  const query = gql`
    query TransactionsQuery
      ${args}
     {
      extrinsics(
        ${filter}
        orderBy: [${ordering}]
        first: $size
        offset: $start
      ) {
        totalCount
        nodes {
          blockId
          extrinsicIdx
          address
          nonce
          moduleId
          callId
          paramsTxt
          success
          specVersionId
          extrinsicHash
          block {
            hash
            datetime
          }
        }
      }
    }
  `;

  return {
    query,
    variables: removeUndefinedValues({ ...filters, ...getSizeAndOffset(size, start) }),
  };
}
