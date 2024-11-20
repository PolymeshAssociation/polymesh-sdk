import { QueryOptions } from '@apollo/client/core';
import BigNumber from 'bignumber.js';
import gql from 'graphql-tag';

import { getSizeAndOffset } from '~/middleware/queries/common';
import { Distribution, DistributionPayment } from '~/middleware/types';
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
  start?: BigNumber
): QueryOptions<PaginatedQueryArgs<QueryArgs<DistributionPayment, 'distributionId'>>> {
  const query = gql`
    query DistributionPaymentQuery($distributionId: String!, $size: Int, $start: Int) {
      distributionPayments(
        filter: { distributionId: { equalTo: $distributionId } }
        first: $size
        offset: $start
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
