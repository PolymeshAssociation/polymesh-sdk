import { DocumentNode, QueryOptions } from '@apollo/client/core';
import BigNumber from 'bignumber.js';
import gql from 'graphql-tag';

import { eventIdentifierFields, getSizeAndOffset } from '~/middleware/queries/common';
import { HistoryHolderKind, QuerySettlementFilters } from '~/middleware/queries/settlements';
import { AssetTransactionsOrderBy, Portfolio } from '~/middleware/types';
import { PaginatedQueryArgs, QueryArgs } from '~/types/utils';
import { portfolioToMiddlewarePortfolioId } from '~/utils/conversion';

/**
 * @hidden
 *
 * Get portfolio details for a given DID and portfolio number
 *
 * @note a portfolio is one row, so the read needs no paging
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
  {
    identityId,
    portfolioId,
    accountId,
    assetId,
    address,
  }: Partial<QuerySettlementFilters> & { accountId?: string },
  holderKind: HistoryHolderKind = 'portfolio'
): {
  args: string;
  filter: string;
  variables: PortfolioMovementVariables;
} {
  const args: string[] = ['$from: String!, $to: String!, $size: Int, $start: Int'];

  const columns: Record<HistoryHolderKind, [string, string]> = {
    portfolio: ['fromPortfolioId', 'toPortfolioId'],
    identity: ['fromIdentityId', 'toIdentityId'],
    account: ['fromAccountId', 'toAccountId'],
  };
  const [fromColumn, toColumn] = columns[holderKind];

  const fromIdFilters = [`${fromColumn}: { equalTo: $from }`];
  const toIdFilters = [`${toColumn}: { equalTo: $to }`];
  const ids: Record<HistoryHolderKind, () => string> = {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    portfolio: () => portfolioToMiddlewarePortfolioId(identityId!, portfolioId),
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    identity: () => identityId!,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    account: () => accountId!,
  };
  const id = ids[holderKind]();
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
     * is not a transfer between holders. A side is tested for a holder (a portfolio or an Account),
     * not for an Identity: an Account side keeps no Identity when the middleware doesn't know it.
     * A filter can't hold two `or` keys, so the second sits inside the `and`
     */
    filter: `filter: { instructionId: { isNull: true }, or: [ { fromPortfolioId: { isNull: false } }, { fromAccountId: { isNull: false } } ], and: [ { or: [ { toPortfolioId: { isNull: false } }, { toAccountId: { isNull: false } } ] }, { or: [ { ${fromIdFilters.join()} }, { ${toIdFilters.join()} } ] } ] }`,
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
  const { args, filter, variables } = createPortfolioMovementFilters(filters, 'identity');
  const query = buildPortfolioMovementsQuery(args, filter);

  return {
    query,
    variables: { ...variables, ...getSizeAndOffset(size, start) },
  };
}

/**
 * @hidden
 *
 * Get the transfers no instruction made, into or out of an Account holder
 */
export function accountTransfersQuery(
  filters: { accountId: string; assetId?: string | undefined },
  size?: BigNumber,
  start?: BigNumber
): QueryOptions<PaginatedQueryArgs<PortfolioMovementVariables>> {
  const { args, filter, variables } = createPortfolioMovementFilters(filters, 'account');
  const query = buildPortfolioMovementsQuery(args, filter);

  return {
    query,
    variables: { ...variables, ...getSizeAndOffset(size, start) },
  };
}
