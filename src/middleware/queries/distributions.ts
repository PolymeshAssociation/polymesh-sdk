import { QueryOptions } from '@apollo/client/core';
import BigNumber from 'bignumber.js';
import gql from 'graphql-tag';

import { createArgsAndFilters, getSizeAndOffset } from '~/middleware/queries/common';
import { Distribution, DistributionPayment, DistributionPaymentsOrderBy } from '~/middleware/types';
import { PaginatedQueryArgs, QueryArgs } from '~/types/utils';

/**
 * @hidden
 *
 * Get distribution details for a CAId
 */
export function distributionQuery(
  variables: QueryArgs<Distribution, 'assetId' | 'localId'>
): QueryOptions<QueryArgs<Distribution, 'assetId' | 'localId'>> {
  const query = gql`
    query DistributionQuery($assetId: String!, $localId: Int!) {
      distributions(filter: { assetId: { equalTo: $assetId }, localId: { equalTo: $localId } }) {
        nodes {
          taxes
        }
      }
    }
  `;

  return {
    query,
    variables,
  };
}

/**
 * @hidden
 *
 * Get history of claims for a distribution
 */
export function distributionPaymentsQuery(
  filters: QueryArgs<DistributionPayment, 'distributionId'>,
  size?: BigNumber,
  start?: BigNumber,
  // `id` is `<block>/<event index>`, zero padded: chronological, and unique
  orderBy: DistributionPaymentsOrderBy = DistributionPaymentsOrderBy.IdAsc
): QueryOptions<PaginatedQueryArgs<QueryArgs<DistributionPayment, 'distributionId'>>> {
  const { args, filter } = createArgsAndFilters(filters, {});

  const query = gql`
    query DistributionPaymentQuery
      ${args}
     {
      distributionPayments(
        ${filter}
        first: $size
        offset: $start
        orderBy: [${orderBy}]
      ) {
        totalCount
        nodes {
          eventId
          targetId
          datetime
          amount
          tax
          createdBlock {
            blockId
            hash
          }
        }
      }
    }
  `;

  return {
    query,
    variables: { ...filters, ...getSizeAndOffset(size, start) },
  };
}
