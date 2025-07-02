import { QueryOptions } from '@apollo/client/core';
import BigNumber from 'bignumber.js';
import gql from 'graphql-tag';

import { getSizeAndOffset } from '~/middleware/queries/common';
import { Investment, InvestmentsOrderBy } from '~/middleware/types';
import { PaginatedQueryArgs, QueryArgs } from '~/types/utils';

/**
 * @hidden
 *
 * Get all investments for a given offering
 */
export function investmentsQuery(
  paddedIds: boolean,
  filters: QueryArgs<Investment, 'stoId' | 'offeringAssetId'>,
  size?: BigNumber,
  start?: BigNumber
): QueryOptions<PaginatedQueryArgs<QueryArgs<Investment, 'stoId' | 'offeringAssetId'>>> {
  const orderBy = paddedIds
    ? `${InvestmentsOrderBy.CreatedBlockIdAsc}`
    : `${InvestmentsOrderBy.CreatedAtAsc}, ${InvestmentsOrderBy.CreatedBlockIdAsc}`;

  const query = gql`
    query InvestmentsQuery($stoId: Int!, $offeringAssetId: String!, $size: Int, $start: Int) {
      investments(
        filter: { stoId: { equalTo: $stoId }, offeringAssetId: { equalTo: $offeringAssetId } }
        first: $size
        offset: $start
        orderBy: [${orderBy}]
      ) {
        totalCount
        nodes {
          investorId
          offeringAssetId
          offeringToken
          raisingAssetId
          raiseToken
          raisingAssetType
          offeringTokenAmount
          raiseTokenAmount
        }
      }
    }
  `;

  return {
    query,
    variables: { ...filters, ...getSizeAndOffset(size, start) },
  };
}
