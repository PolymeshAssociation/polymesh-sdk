import { QueryOptions } from '@apollo/client/core';
import BigNumber from 'bignumber.js';
import gql from 'graphql-tag';

import { getSizeAndOffset } from '~/middleware/queries/common';
import {
  Asset,
  AssetHolder,
  AssetHoldersOrderBy,
  AssetTransaction,
  AssetTransactionsOrderBy,
  DistributionPayment,
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
  isSqIdPadded: boolean,
  filters: QueryArgs<AssetHolder, 'identityId'>,
  size?: BigNumber,
  start?: BigNumber,
  orderBy = AssetHoldersOrderBy.AssetIdAsc
): QueryOptions<PaginatedQueryArgs<QueryArgs<DistributionPayment, 'distributionId'>>> {
  if (isSqIdPadded) {
    if (orderBy === AssetHoldersOrderBy.CreatedAtAsc) {
      orderBy = AssetHoldersOrderBy.CreatedBlockIdAsc;
    }
    if (orderBy === AssetHoldersOrderBy.CreatedAtDesc) {
      orderBy = AssetHoldersOrderBy.CreatedBlockIdDesc;
    }
  }

  const query = gql`
    query AssetHoldersQuery($identityId: String!, $size: Int, $start: Int) {
      assetHolders(
        filter: { identityId: { equalTo: $identityId } }
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
  isSqIdPadded: boolean,
  filters: QueryArgs<NftHolder, 'identityId'>,
  size?: BigNumber,
  start?: BigNumber,
  orderBy = NftHoldersOrderBy.AssetIdAsc
): QueryOptions<PaginatedQueryArgs<QueryArgs<NftHolder, 'identityId'>>> {
  if (isSqIdPadded) {
    if (orderBy === NftHoldersOrderBy.CreatedAtAsc) {
      orderBy = NftHoldersOrderBy.CreatedBlockIdAsc;
    }
    if (orderBy === NftHoldersOrderBy.CreatedAtDesc) {
      orderBy = NftHoldersOrderBy.CreatedBlockIdDesc;
    }
  }

  const query = gql`
    query NftHolderQuery($identityId: String!, $size: Int, $start: Int) {
      nftHolders(
        filter: { identityId: { equalTo: $identityId } }
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
  paddedIds: boolean,
  filters: QueryArgs<AssetTransaction, 'assetId'>,
  size?: BigNumber,
  start?: BigNumber
): QueryOptions<PaginatedQueryArgs<QueryArgs<AssetTransaction, 'assetId'>>> {
  const orderBy = paddedIds
    ? `${AssetTransactionsOrderBy.CreatedBlockIdAsc}`
    : `${AssetTransactionsOrderBy.CreatedAtAsc}, ${AssetTransactionsOrderBy.CreatedBlockIdAsc}`;

  const query = gql`
    query AssetTransactionQuery($assetId: String!) {
      assetTransactions(
        filter: { assetId: { equalTo: $assetId } }
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
          toPortfolioId
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
  start?: BigNumber
): QueryOptions<PaginatedQueryArgs<QueryArgs<NftHolder, 'assetId'>>> {
  const query = gql`
    query NftCollectionHolders($assetId: String!, $size: Int, $start: Int) {
      nftHolders(
        first: $size
        offset: $start
        filter: { assetId: { equalTo: $assetId }, nftIds: { notEqualTo: [] } }
        orderBy: IDENTITY_ID_DESC
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
