import { QueryOptions } from '@apollo/client/core';
import BigNumber from 'bignumber.js';
import gql from 'graphql-tag';

import {
  createArgsAndFilters,
  getSizeAndOffset,
  removeUndefinedValues,
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
  orderBy: ExtrinsicsOrderBy = ExtrinsicsOrderBy.BlockIdAsc
): QueryOptions<PaginatedQueryArgs<QueryArgs<Extrinsic, ExtrinsicArgs>>> {
  const { args, filter } = createArgsAndFilters(filters, {
    moduleId: 'ModuleIdEnum',
    callId: 'CallIdEnum',
    success: 'Int',
  });
  const query = gql`
    query TransactionsQuery
      ${args}
     {
      extrinsics(
        ${filter}
        orderBy: [${orderBy}]
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
