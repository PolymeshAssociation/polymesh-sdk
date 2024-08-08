import { DocumentNode, QueryOptions } from '@apollo/client/core';
import gql from 'graphql-tag';

import { QuerySettlementFilters } from '~/middleware/queries/settlements';
import { Portfolio, PortfolioMovement, PortfolioMovementsOrderBy } from '~/middleware/types';
import { QueryArgs } from '~/types/utils';

/**
 * @hidden
 *
 * Get portfolio details for a given DID and portfolio number
 */
export function portfolioQuery(
  variables: QueryArgs<Portfolio, 'identityId' | 'number'>
): QueryOptions<QueryArgs<Portfolio, 'identityId' | 'number'>> {
  const query = gql`
    query PortfolioQuery($identityId: String!, $number: Int!) {
      portfolios(filter: { identityId: { equalTo: $identityId }, number: { equalTo: $number } }) {
        nodes {
          eventIdx
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
    variables,
  };
}

type PortfolioMovementArgs = 'fromId' | 'toId' | 'assetId' | 'address';

/**
 *  @hidden
 */
function createPortfolioMovementFilters(
  { identityId, portfolioId, assetId: ticker, address }: QuerySettlementFilters,
  queryAll?: boolean
): {
  args: string;
  filter: string;
  variables: QueryArgs<PortfolioMovement, PortfolioMovementArgs>;
} {
  const args: string[] = ['$fromId: String!, $toId: String!'];
  const fromIdFilters = queryAll
    ? ['fromId: { startsWith: $fromId }']
    : ['fromId: { equalTo: $fromId }'];
  const toIdFilters = queryAll ? ['toId: { startsWith: $toId }'] : ['toId: { equalTo: $toId }'];
  const portfolioNumber = portfolioId ? portfolioId.toNumber() : 0;
  const variables: QueryArgs<PortfolioMovement, PortfolioMovementArgs> = {
    fromId: queryAll ? `${identityId}` : `${identityId}/${portfolioNumber}`,
    toId: queryAll ? `${identityId}` : `${identityId}/${portfolioNumber}`,
  };

  if (ticker) {
    variables.assetId = ticker;
    args.push('$assetId: String!');
    const assetIdFilter = 'assetId: { equalTo: $assetId }';
    toIdFilters.push(assetIdFilter);
    fromIdFilters.push(assetIdFilter);
  }

  if (address) {
    variables.address = address;
    args.push('$address: String!');
    const addressFilter = 'address: { equalTo: $address }';
    toIdFilters.push(addressFilter);
    fromIdFilters.push(addressFilter);
  }

  return {
    args: `(${args.join()})`,
    filter: `filter: { or: [ { ${fromIdFilters.join()} }, { ${toIdFilters.join()} } ] }`,
    variables,
  };
}

/**
 * @hidden
 */
function buildPortfolioMovementsQuery(args: string, filter: string): DocumentNode {
  return gql`
  query PortfolioMovementsQuery
    ${args}
   {
    portfolioMovements(
      ${filter}
      orderBy: [${PortfolioMovementsOrderBy.CreatedAtAsc}, ${PortfolioMovementsOrderBy.CreatedBlockIdAsc}]
    ) {
      nodes {
        id
        fromId
        toId
        assetId
        amount
        address
        createdBlock {
          blockId
          datetime
          hash
        }
      }
    }
  }
`;
}

/**
 * @hidden
 *
 * Get Settlements where a Portfolio is involved
 */
export function portfolioMovementsQuery(
  filters: QuerySettlementFilters
): QueryOptions<QueryArgs<PortfolioMovement, 'fromId' | 'toId' | 'assetId' | 'address'>> {
  const { args, filter, variables } = createPortfolioMovementFilters(filters);
  const query = buildPortfolioMovementsQuery(args, filter);

  return {
    query,
    variables,
  };
}

/**
 * @hidden
 *
 * Get Settlements for all portfolios
 */
export function portfoliosMovementsQuery(
  filters: Omit<QuerySettlementFilters, 'portfolioId'>
): QueryOptions<QueryArgs<PortfolioMovement, 'fromId' | 'toId' | 'assetId' | 'address'>> {
  const { args, filter, variables } = createPortfolioMovementFilters(filters, true);
  const query = buildPortfolioMovementsQuery(args, filter);

  return {
    query,
    variables,
  };
}
