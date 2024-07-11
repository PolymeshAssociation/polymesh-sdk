import { QueryOptions } from '@apollo/client/core';
import gql from 'graphql-tag';

import { BlocksOrderBy, SubqueryVersionsOrderBy } from '~/middleware/types';

/**
 * @hidden
 *
 * Get the latest processed block number
 */
export function latestBlockQuery(): QueryOptions {
  const query = gql`
    query latestBlock {
      blocks(first: 1, orderBy: [${BlocksOrderBy.BlockIdDesc}]) {
        nodes {
          blockId
        }
      }
    }
  `;

  return {
    query,
    variables: undefined,
  };
}

/**
 * @hidden
 *
 * Middleware V2 heartbeat
 */
export function heartbeatQuery(): QueryOptions {
  const query = gql`
    query heartbeat {
      blocks(filter: { blockId: { equalTo: 1 } }) {
        nodes {
          blockId
        }
      }
    }
  `;

  return {
    query,
    variables: undefined,
  };
}

/**
 * @hidden
 *
 * Get details about the SubQuery indexer
 */
export function metadataQuery(): QueryOptions {
  const query = gql`
    query Metadata {
      _metadata {
        chain
        specName
        genesisHash
        lastProcessedHeight
        lastProcessedTimestamp
        targetHeight
        indexerHealthy
        indexerNodeVersion
        queryNodeVersion
        dynamicDatasources
      }
    }
  `;

  return {
    query,
    variables: undefined,
  };
}

/**
 * @hidden
 *
 * Get details about the latest Subquery version
 */
export function latestSqVersionQuery(): QueryOptions {
  const query = gql`
    query SubqueryVersions {
      subqueryVersions(orderBy: [${SubqueryVersionsOrderBy.CreatedAtDesc}], first: 1) {
        nodes {
          id
          version
          createdAt
        }
      }
    }
  `;

  return {
    query,
    variables: undefined,
  };
}

/**
 * Create args and filters to be supplied to GQL query
 *
 * @param filters - filters to be applied
 * @param typeMap - Map defining the types corresponding to each attribute. All missing attributes whose types are not defined are considered to be `String`
 *
 * @hidden
 */
export function createArgsAndFilters(
  filters: Record<string, unknown>,
  typeMap: Record<string, string>
): {
  args: string;
  filter: string;
} {
  const args: string[] = ['$start: Int', '$size: Int'];
  const gqlFilters: string[] = [];

  Object.keys(filters).forEach(attribute => {
    if (filters[attribute]) {
      const type = typeMap[attribute] || 'String';
      args.push(`$${attribute}: ${type}!`);
      gqlFilters.push(`${attribute}: { equalTo: $${attribute} }`);
    }
  });

  return {
    args: `(${args.join()})`,
    filter: gqlFilters.length ? `filter: { ${gqlFilters.join()} }` : '',
  };
}
