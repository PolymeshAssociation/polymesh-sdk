import { QueryOptions } from '@apollo/client/core';
import BigNumber from 'bignumber.js';
import gql from 'graphql-tag';

import { createArgsAndFilters, getSizeAndOffset } from '~/middleware/queries/common';
import {
  Asset,
  AssetHolder,
  AssetHoldersOrderBy,
  AssetTransaction,
  AssetTransactionsOrderBy,
  NftHolder,
  NftHoldersOrderBy,
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

/**
 * @hidden
 *
 * Get asset held by a DID
 */
export function assetHoldersQuery(
  filters: QueryArgs<AssetHolder, 'identityId'> & { amount?: string },
  size?: BigNumber,
  start?: BigNumber,
  orderBy = AssetHoldersOrderBy.AssetIdAsc
): QueryOptions<PaginatedQueryArgs<QueryArgs<AssetHolder, 'identityId'> & { amount?: string }>> {
  if (orderBy === AssetHoldersOrderBy.CreatedAtAsc) {
    orderBy = AssetHoldersOrderBy.CreatedBlockIdAsc;
  }
  if (orderBy === AssetHoldersOrderBy.CreatedAtDesc) {
    orderBy = AssetHoldersOrderBy.CreatedBlockIdDesc;
  }

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
        orderBy: [${orderBy}]
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
 * Get NFTs held by a DID
 */
export function nftHoldersQuery(
  filters: QueryArgs<NftHolder, 'identityId'> & { nftIds?: number[] },
  size?: BigNumber,
  start?: BigNumber,
  orderBy = NftHoldersOrderBy.AssetIdAsc
): QueryOptions<PaginatedQueryArgs<QueryArgs<NftHolder, 'identityId'> & { nftIds?: number[] }>> {
  if (orderBy === NftHoldersOrderBy.CreatedAtAsc) {
    orderBy = NftHoldersOrderBy.CreatedBlockIdAsc;
  }
  if (orderBy === NftHoldersOrderBy.CreatedAtDesc) {
    orderBy = NftHoldersOrderBy.CreatedBlockIdDesc;
  }

  // a holding is kept once created, so excluding collections the Identity no longer holds any of
  // has to happen in the query, or `totalCount` and the cursor describe the unfiltered set
  const { args, filter } = createArgsAndFilters(filters, {
    nftIds: { type: 'JSON', operator: 'notEqualTo' },
  });

  const query = gql`
    query NftHolderQuery
      ${args}
     {
      nftHolders(
        ${filter}
        first: $size
        offset: $start
        orderBy: [${orderBy}]
      ) {
        totalCount
        nodes {
          asset {
            id
            ticker
          }
          nftIds
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
  // `id` is `<block>/<event index>`, zero padded: block order, and unique
  orderBy: AssetTransactionsOrderBy = AssetTransactionsOrderBy.IdAsc
): QueryOptions<PaginatedQueryArgs<QueryArgs<AssetTransaction, 'assetId'>>> {
  const { args, filter } = createArgsAndFilters(filters, {});

  const query = gql`
    query AssetTransactionQuery
      ${args}
     {
      assetTransactions(
        ${filter}
        first: $size
        offset: $start
        orderBy:  [${orderBy}]
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
          fromAccount
          fromIdentityId
          toPortfolioId
          toAccount
          toIdentityId
          eventId
          eventIdx
          extrinsicIdx
          fundingRound
          instructionId
          instructionMemo
          datetime
          createdBlock {
            blockId
            hash
            datetime
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
 * Get holders on an NFT Collection
 */
export function nftCollectionHolders(
  assetId: string,
  size?: BigNumber,
  start?: BigNumber,
  orderBy: NftHoldersOrderBy = NftHoldersOrderBy.IdentityIdDesc
): QueryOptions<PaginatedQueryArgs<QueryArgs<NftHolder, 'assetId'>>> {
  const query = gql`
    query NftCollectionHolders($assetId: String!, $size: Int, $start: Int) {
      nftHolders(
        first: $size
        offset: $start
        filter: { assetId: { equalTo: $assetId }, nftIds: { notEqualTo: [] } }
        orderBy: [${orderBy}]
      ) {
        nodes {
          identityId
          nftIds
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
