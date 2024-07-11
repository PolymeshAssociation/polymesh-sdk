import { QueryOptions } from '@apollo/client/core';
import BigNumber from 'bignumber.js';
import gql from 'graphql-tag';

import { Investment, InvestmentsOrderBy } from '~/middleware/types';
import { PaginatedQueryArgs, QueryArgs } from '~/types/utils';

/**
 * @hidden
 *
 * Get all investments for a given offering
 */
export function investmentsQuery(
  filters: QueryArgs<Investment, 'stoId' | 'offeringToken'>,
  size?: BigNumber,
  start?: BigNumber
): QueryOptions<PaginatedQueryArgs<QueryArgs<Investment, 'stoId' | 'offeringToken'>>> {
  const query = gql`
    query InvestmentsQuery($stoId: Int!, $offeringToken: String!, $size: Int, $start: Int) {
      investments(
        filter: { stoId: { equalTo: $stoId }, offeringToken: { equalTo: $offeringToken } }
        first: $size
        offset: $start
        orderBy: [${InvestmentsOrderBy.CreatedAtAsc}, ${InvestmentsOrderBy.CreatedBlockIdAsc}]
      ) {
        totalCount
        nodes {
          investorId
          offeringToken
          raiseToken
          offeringTokenAmount
          raiseTokenAmount
        }
      }
    }
  `;

  return {
    query,
    variables: { ...filters, size: size?.toNumber(), start: start?.toNumber() },
  };
}
