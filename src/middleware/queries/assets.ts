import { QueryOptions } from '@apollo/client/core';
import BigNumber from 'bignumber.js';
import gql from 'graphql-tag';

import {
  createArgsAndFilters,
  eventIdentifierFields,
  getSizeAndOffset,
  orderByClause,
  toOrderByList,
} from '~/middleware/queries/common';
import {
  Asset,
  AssetHolder,
  AssetHoldersOrderBy,
  AssetTransaction,
  AssetTransactionsOrderBy,
  NftsOrderBy,
} from '~/middleware/types';
import { PaginatedQueryArgs, QueryArgs } from '~/types/utils';

/**
 * @hidden
 *
 * Get Asset details for a given ticker
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
  const { args, filter } = createArgsAndFilters(filters, {
    amount: { type: 'BigFloat', operator: 'greaterThan' },
  });

  const query = gql`
    query AssetHoldersQuery
      ${args}
     {
      assetHolders(
        ${filter}
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
 * Get the NFTs a DID holds in some collections
 */
export function heldNftsQuery(
  filters: { identityId: string; assetIds: string[] },
  size?: BigNumber,
  start?: BigNumber
): QueryOptions<PaginatedQueryArgs<{ identityId: string; assetIds: string[] }>> {
  // `nftId` is unique within a collection
  const query = gql`
    query NftHolderNftsQuery($start: Int, $size: Int, $identityId: String!, $assetIds: [String!]!) {
      nfts(
        filter: {
          assetId: { in: $assetIds }
          holding: { identityId: { equalTo: $identityId } }
        }
        first: $size
        offset: $start
        orderBy: [${NftsOrderBy.AssetIdAsc}, ${NftsOrderBy.NftIdAsc}]
      ) {
        totalCount
        nodes {
          assetId
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

/**
 * @hidden
 *
 * Get the balance history for an Asset
 */
export function assetTransactionQuery(
  filters: QueryArgs<AssetTransaction, 'assetId'>,
  size?: BigNumber,
  start?: BigNumber,
  orderBy?: AssetTransactionsOrderBy | AssetTransactionsOrderBy[]
): QueryOptions<PaginatedQueryArgs<QueryArgs<AssetTransaction, 'assetId'>>> {
  const { args, filter } = createArgsAndFilters(filters, {});

  // `id` is `<block>/<event index>`, zero padded: block order, and unique
  const ordering = orderByClause(orderBy, [AssetTransactionsOrderBy.IdAsc]);

  const query = gql`
    query AssetTransactionQuery
      ${args}
     {
      assetTransactions(
        ${filter}
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
    variables: { ...filters, ...getSizeAndOffset(size, start) },
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
 * Get the NFTs some Identities hold in a collection
 */
export function nftCollectionHoldersNftsQuery(
  filters: { assetId: string; identityIds: string[] },
  size?: BigNumber,
  start?: BigNumber
): QueryOptions<PaginatedQueryArgs<{ assetId: string; identityIds: string[] }>> {
  // `nftId` is unique within the collection this always filters by
  const query = gql`
    query NftCollectionHoldersNfts($assetId: String!, $identityIds: [String!]!, $size: Int, $start: Int) {
      nfts(
        filter: {
          assetId: { equalTo: $assetId }
          holding: { identityId: { in: $identityIds } }
        }
        first: $size
        offset: $start
        orderBy: [${NftsOrderBy.NftIdAsc}]
      ) {
        totalCount
        nodes {
          nftId
          holding {
            identityId
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
