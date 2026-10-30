import { DocumentNode, QueryOptions } from '@apollo/client/core';
import gql from 'graphql-tag';

import { eventIdentifierFields } from '~/middleware/queries/common';
import { QuerySettlementFilters } from '~/middleware/queries/settlements';
import { AssetTransactionsOrderBy, Portfolio } from '~/middleware/types';
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
          createdEvent {
            ${eventIdentifierFields}
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

type PortfolioMovementVariables = {
  from: string;
  to: string;
  assetId?: string;
  address?: string;
};

/**
 *  @hidden
 */
function createPortfolioMovementFilters(
  { identityId, portfolioId, assetId, address }: QuerySettlementFilters,
  queryAll?: boolean
): {
  args: string;
  filter: string;
  variables: PortfolioMovementVariables;
} {
  const args: string[] = ['$from: String!, $to: String!'];

  // a portfolio's id is `<did>/<number>`, the default portfolio being number 0
  const fromIdFilters = queryAll
    ? ['fromIdentityId: { equalTo: $from }']
    : ['fromPortfolioId: { equalTo: $from }'];
  const toIdFilters = queryAll
    ? ['toIdentityId: { equalTo: $to }']
    : ['toPortfolioId: { equalTo: $to }'];
  const id = queryAll ? identityId : `${identityId}/${portfolioId ? portfolioId.toString() : '0'}`;
  const variables: PortfolioMovementVariables = { from: id, to: id };

  if (assetId) {
    variables.assetId = assetId;
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
    // a settlement between one Identity's holders is also an internal transfer, but it is read
    // through its instruction's legs, so only movements outside an instruction are kept
    filter: `filter: { isInternalTransfer: { equalTo: true }, instructionId: { isNull: true }, or: [ { ${fromIdFilters.join()} }, { ${toIdFilters.join()} } ] }`,
    variables,
  };
}

/**
 * @hidden
 */
function buildPortfolioMovementsQuery(args: string, filter: string): DocumentNode {
  const orderBy = `${AssetTransactionsOrderBy.CreatedEventIdAsc}`;

  return gql`
  query PortfolioMovementsQuery
    ${args}
   {
    assetTransactions(
      ${filter}
      orderBy: [${orderBy}]
    ) {
      nodes {
        id
        fromPortfolioId
        toPortfolioId
        assetId
        amount
        nftIds
        memo
        address
        createdEvent {
          ${eventIdentifierFields}
        }
      }
    }
  }
`;
}

/**
 * @hidden
 *
 * Get the movements between portfolios of one Identity where a Portfolio is involved
 */
export function portfolioMovementsQuery(
  filters: QuerySettlementFilters
): QueryOptions<PortfolioMovementVariables> {
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
 * Get the movements between portfolios of an Identity
 */
export function portfoliosMovementsQuery(
  filters: Omit<QuerySettlementFilters, 'portfolioId'>
): QueryOptions<PortfolioMovementVariables> {
  const { args, filter, variables } = createPortfolioMovementFilters(filters, true);
  const query = buildPortfolioMovementsQuery(args, filter);

  return {
    query,
    variables,
  };
}
