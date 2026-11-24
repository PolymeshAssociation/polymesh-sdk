import { DocumentNode, QueryOptions } from '@apollo/client/core';
import BigNumber from 'bignumber.js';
import gql from 'graphql-tag';

import { eventIdentifierFields, getSizeAndOffset } from '~/middleware/queries/common';
import { QuerySettlementFilters } from '~/middleware/queries/settlements';
import { AssetTransactionsOrderBy, Portfolio } from '~/middleware/types';
import { PaginatedQueryArgs, QueryArgs } from '~/types/utils';
import { portfolioToMiddlewarePortfolioId } from '~/utils/conversion';

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
  const args: string[] = ['$from: String!, $to: String!, $size: Int, $start: Int'];

  const fromIdFilters = queryAll
    ? ['fromIdentityId: { equalTo: $from }']
    : ['fromPortfolioId: { equalTo: $from }'];
  const toIdFilters = queryAll
    ? ['toIdentityId: { equalTo: $to }']
    : ['toPortfolioId: { equalTo: $to }'];
  const id = queryAll ? identityId : portfolioToMiddlewarePortfolioId(identityId, portfolioId);
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
    /*
     * transfers no instruction made: movements between one Identity's holders, and transfers
     * between Identities such as a controller transfer or a distribution payout. A settlement is read
     * through its instruction's legs instead. An issuance or a redemption has one side only, so it
     * is not a transfer between holders
     */
    filter: `filter: { instructionId: { isNull: true }, fromIdentityId: { isNull: false }, toIdentityId: { isNull: false }, or: [ { ${fromIdFilters.join()} }, { ${toIdFilters.join()} } ] }`,
    variables,
  };
}

/**
 * @hidden
 */
function buildPortfolioMovementsQuery(args: string, filter: string): DocumentNode {
  // an event makes one transfer, so the transfers are in a total order
  const orderBy = `${AssetTransactionsOrderBy.CreatedEventIdAsc}`;

  return gql`
  query PortfolioMovementsQuery
    ${args}
   {
    assetTransactions(
      ${filter}
      orderBy: [${orderBy}]
      first: $size
      offset: $start
    ) {
      totalCount
      nodes {
        id
        fromIdentityId
        fromPortfolioId
        fromAccountId
        toIdentityId
        toPortfolioId
        toAccountId
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
 * Get the transfers no instruction made, into or out of a Portfolio
 */
export function portfolioMovementsQuery(
  filters: QuerySettlementFilters,
  size?: BigNumber,
  start?: BigNumber
): QueryOptions<PaginatedQueryArgs<PortfolioMovementVariables>> {
  const { args, filter, variables } = createPortfolioMovementFilters(filters);
  const query = buildPortfolioMovementsQuery(args, filter);

  return {
    query,
    variables: { ...variables, ...getSizeAndOffset(size, start) },
  };
}

/**
 * @hidden
 *
 * Get the transfers no instruction made, into or out of any of an Identity's holders
 */
export function portfoliosMovementsQuery(
  filters: Omit<QuerySettlementFilters, 'portfolioId'>,
  size?: BigNumber,
  start?: BigNumber
): QueryOptions<PaginatedQueryArgs<PortfolioMovementVariables>> {
  const { args, filter, variables } = createPortfolioMovementFilters(filters, true);
  const query = buildPortfolioMovementsQuery(args, filter);

  return {
    query,
    variables: { ...variables, ...getSizeAndOffset(size, start) },
  };
}
