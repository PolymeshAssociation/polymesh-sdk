import { QueryOptions } from '@apollo/client/core';
import BigNumber from 'bignumber.js';
import gql from 'graphql-tag';

import { createArgsAndFilters, getSizeAndOffset, orderByClause } from '~/middleware/queries/common';
import { Investment, InvestmentsOrderBy } from '~/middleware/types';
import { PaginatedQueryArgs, QueryArgs } from '~/types/utils';

/**
 * @hidden
 *
 * Get all investments for a given offering
 */
export function investmentsQuery(
  filters: QueryArgs<Investment, 'stoId' | 'offeringAssetId'>,
  size?: BigNumber,
  start?: BigNumber,
  orderBy?: InvestmentsOrderBy | InvestmentsOrderBy[]
): QueryOptions<PaginatedQueryArgs<QueryArgs<Investment, 'stoId' | 'offeringAssetId'>>> {
  const { args, filter } = createArgsAndFilters(filters, { stoId: 'Int' });

  // `id` is `<block>/<event index>`, zero padded: block order, and unique
  const ordering = orderByClause(orderBy, [InvestmentsOrderBy.IdAsc]);

  const query = gql`
    query InvestmentsQuery
      ${args}
     {
      investments(
        ${filter}
        first: $size
        offset: $start
        orderBy: [${ordering}]
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
