import { QueryOptions } from '@apollo/client/core';
import BigNumber from 'bignumber.js';
import gql from 'graphql-tag';

import {
  eventIdentifierFields,
  getSizeAndOffset,
  orderByClause,
  toOrderByList,
} from '~/middleware/queries/common';
import {
  Asset,
  AssetHolder,
  AssetHoldersOrderBy,
  AssetTransactionsOrderBy,
  HoldingsOrderBy,
  NftsOrderBy,
} from '~/middleware/types';
import { PaginatedQueryArgs, QueryArgs } from '~/types/utils';

/**
 * @hidden
 *
 * Get Asset details for a given ticker
 *
 * @note an Asset is one row, so the read needs no paging
 */
export function assetQuery(
  variables: QueryArgs<Asset, 'id'>
): QueryOptions<QueryArgs<Asset, 'id'>> {
  const query = gql`
    query AssetQuery($id: String!) {
      assets(filter: { id: { equalTo: $id } }) {
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

/**
 * @hidden
 *
 * Get asset held by a DID
 */
export function assetHoldersQuery(
  filters: QueryArgs<AssetHolder, 'identityId'> & { amount?: string },
  size?: BigNumber,
  start?: BigNumber,
  orderBy?: AssetHoldersOrderBy | AssetHoldersOrderBy[]
): QueryOptions<PaginatedQueryArgs<QueryArgs<AssetHolder, 'identityId'> & { amount?: string }>> {
  // the indexer exposes no `createdAt` ordering; both map onto event order
  const supplied = toOrderByList(orderBy).map(key => {
    if (key === AssetHoldersOrderBy.CreatedAtAsc) {
      return AssetHoldersOrderBy.CreatedEventIdAsc;
    }
    if (key === AssetHoldersOrderBy.CreatedAtDesc) {
      return AssetHoldersOrderBy.CreatedEventIdDesc;
    }

    return key;
  });

  // a holding is unique per Asset given the Identity this always filters by
  const ordering = orderByClause(supplied, [AssetHoldersOrderBy.AssetIdAsc]);

  // a holding is kept once created, so excluding zero balances has to happen in the query —
  // filtering client side would leave `totalCount` and the cursor describing the unfiltered set
  const hasAmount = filters.amount !== undefined;
  const amountArg = hasAmount ? ', $amount: BigFloat!' : '';
  const amountFilter = hasAmount ? ', amount: { greaterThan: $amount }' : '';

  // the middleware keeps one holding row per Asset and Identity for fungible Assets and NFT
  // collections alike, so the collections have to be left out here
  const query = gql`
    query AssetHoldersQuery($start: Int, $size: Int, $identityId: String!${amountArg}) {
      assetHolders(
        filter: {
          identityId: { equalTo: $identityId }
          asset: { isNftCollection: { equalTo: false } }${amountFilter}
        }
        first: $size
        offset: $start
        orderBy: [${ordering}]
      ) {
        totalCount
        nodes {
          amount
          asset {
            id
            ticker
          }
        }
      }
    }
  `;

  return {
    query,
    variables: {
      ...filters,
      ...getSizeAndOffset(size, start),
    },
  };
}

/**
 * @hidden
 *
 * Get the NFT collections a DID holds, or has held
 *
 * @param filters.heldNow - only the collections the DID holds at least one NFT of
 */
export function nftHoldersQuery(
  filters: { identityId: string; heldNow?: boolean | undefined },
  size?: BigNumber,
  start?: BigNumber,
  orderBy?: AssetHoldersOrderBy | AssetHoldersOrderBy[]
): QueryOptions<PaginatedQueryArgs<{ identityId: string }>> {
  const { identityId, heldNow } = filters;

  // the indexer exposes no `createdAt` ordering; both map onto event order
  const supplied = toOrderByList(orderBy).map(key => {
    if (key === AssetHoldersOrderBy.CreatedAtAsc) {
      return AssetHoldersOrderBy.CreatedEventIdAsc;
    }
    if (key === AssetHoldersOrderBy.CreatedAtDesc) {
      return AssetHoldersOrderBy.CreatedEventIdDesc;
    }

    return key;
  });

  // a holding is unique per Asset given the Identity this always filters by
  const ordering = orderByClause(supplied, [AssetHoldersOrderBy.AssetIdAsc]);

  // a holding is kept once created, so excluding collections the Identity no longer holds any of
  // has to happen in the query, or `totalCount` and the cursor describe the unfiltered set
  const heldNowFilter = heldNow ? ', nftCount: { greaterThan: 0 }' : '';

  const query = gql`
    query NftHolderQuery($start: Int, $size: Int, $identityId: String!) {
      assetHolders(
        filter: {
          identityId: { equalTo: $identityId }
          asset: { isNftCollection: { equalTo: true } }${heldNowFilter}
        }
        first: $size
        offset: $start
        orderBy: [${ordering}]
      ) {
        totalCount
        nodes {
          asset {
            id
            ticker
          }
          nftCount
        }
      }
    }
  `;

  return {
    query,
    variables: { identityId, ...getSizeAndOffset(size, start) },
  };
}

/**
 * @hidden
 *
 * Get the NFTs a DID holds in a collection
 */
export function heldNftsQuery(
  filters: { identityId: string; assetId: string },
  size?: BigNumber,
  start?: BigNumber
): QueryOptions<PaginatedQueryArgs<{ identityId: string; assetId: string }>> {
  // `nftId` is unique within the collection this always filters by
  const query = gql`
    query NftHolderNftsQuery($start: Int, $size: Int, $identityId: String!, $assetId: String!) {
      nfts(
        filter: {
          assetId: { equalTo: $assetId }
          holding: { identityId: { equalTo: $identityId } }
        }
        first: $size
        offset: $start
        orderBy: [${NftsOrderBy.NftIdAsc}]
      ) {
        totalCount
        nodes {
          nftId
        }
      }
    }
  `;

  return {
    query,
    variables: { ...filters, ...getSizeAndOffset(size, start) },
  };
}

export interface AssetTransactionFilters {
  assetId: string;
  /**
   * a holder on either side, by the middleware column it is stored under
   */
  holder?: { portfolioId: string } | { accountId: string } | undefined;
  /**
   * an Identity on either side
   */
  identityId?: string | undefined;
}

/**
 * @hidden
 *
 * Get the transactions of an Asset, optionally only those with a given holder or Identity on
 *   either side
 */
export function assetTransactionQuery(
  { assetId, holder, identityId }: AssetTransactionFilters,
  size?: BigNumber,
  start?: BigNumber,
  orderBy?: AssetTransactionsOrderBy | AssetTransactionsOrderBy[]
): QueryOptions<PaginatedQueryArgs<Record<string, unknown>>> {
  const args = ['$assetId: String!', '$size: Int', '$start: Int'];
  const variables: Record<string, unknown> = { assetId };
  const sideFilters: string[] = [];

  if (holder) {
    const [column, value] =
      'portfolioId' in holder
        ? ['PortfolioId', holder.portfolioId]
        : ['AccountId', holder.accountId];

    args.push('$holder: String!');
    variables.holder = value;
    sideFilters.push(
      `{ or: [{ from${column}: { equalTo: $holder } }, { to${column}: { equalTo: $holder } }] }`
    );
  }

  if (identityId) {
    args.push('$identityId: String!');
    variables.identityId = identityId;
    sideFilters.push(
      '{ or: [{ fromIdentityId: { equalTo: $identityId } }, { toIdentityId: { equalTo: $identityId } }] }'
    );
  }

  // each side condition is an `or`, and an input object can name `or` only once
  const sides = sideFilters.length ? `, and: [${sideFilters.join(', ')}]` : '';

  // `id` is `<block>/<event index>`, zero padded: block order, and unique
  const ordering = orderByClause(orderBy, [AssetTransactionsOrderBy.IdAsc]);

  const query = gql`
    query AssetTransactionQuery(${args.join(', ')}) {
      assetTransactions(
        filter: { assetId: { equalTo: $assetId }${sides} }
        first: $size
        offset: $start
        orderBy:  [${ordering}]
      ) {
        totalCount
        nodes {
          asset {
            id
            ticker
          }
          amount
          nftIds
          fromPortfolioId
          fromAccountId
          fromIdentityId
          toPortfolioId
          toAccountId
          toIdentityId
          isInternalTransfer
          memo
          eventId
          fundingRound
          instructionId
          instructionMemo
          createdEvent {
            ${eventIdentifierFields}
            extrinsicIdx
          }
        }
      }
    }
  `;

  return {
    query,
    variables: { ...variables, ...getSizeAndOffset(size, start) },
  };
}

/**
 * @hidden
 *
 * Get the Identities holding NFTs of a collection
 */
export function nftCollectionHolders(
  assetId: string,
  size?: BigNumber,
  start?: BigNumber,
  orderBy?: AssetHoldersOrderBy | AssetHoldersOrderBy[]
): QueryOptions<PaginatedQueryArgs<QueryArgs<AssetHolder, 'assetId'>>> {
  // a holder appears once per collection, which this always filters by
  const ordering = orderByClause(orderBy, [AssetHoldersOrderBy.IdentityIdDesc]);

  const query = gql`
    query NftCollectionHolders($assetId: String!, $size: Int, $start: Int) {
      assetHolders(
        first: $size
        offset: $start
        filter: { assetId: { equalTo: $assetId }, nftCount: { greaterThan: 0 } }
        orderBy: [${ordering}]
      ) {
        nodes {
          identityId
          nftCount
        }
        totalCount
      }
    }
  `;

  return {
    query,
    variables: { ...getSizeAndOffset(size, start), assetId },
  };
}

/**
 * @hidden
 *
 * Get the portfolios and Accounts that hold a fungible Asset, each with its balance and frozen part
 */
export function holdingsQuery(
  filters: { assetId: string },
  size?: BigNumber,
  start?: BigNumber,
  orderBy?: HoldingsOrderBy | HoldingsOrderBy[]
): QueryOptions<PaginatedQueryArgs<{ assetId: string }>> {
  // `id` is `<asset id>/<portfolio id or address>`, unique per holder of the Asset
  const ordering = orderByClause(orderBy ?? [HoldingsOrderBy.AmountDesc], [HoldingsOrderBy.IdAsc]);

  // a holding row is kept once its holder has sent everything, so a holder that holds nothing and
  // has nothing frozen is left out here, where `totalCount` still describes the page's set
  const query = gql`
    query HoldingsQuery($assetId: String!, $size: Int, $start: Int) {
      holdings(
        filter: {
          assetId: { equalTo: $assetId }
          or: [
            { amount: { greaterThan: "0" } }
            { frozen: { greaterThan: "0" } }
            { frozenSince: { isNull: false } }
          ]
        }
        first: $size
        offset: $start
        orderBy: [${ordering}]
      ) {
        totalCount
        nodes {
          holderKind
          portfolioId
          accountId
          identityId
          amount
          frozen
          frozenSince
        }
      }
    }
  `;

  return {
    query,
    variables: { ...filters, ...getSizeAndOffset(size, start) },
  };
}
