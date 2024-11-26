import { QueryOptions } from '@apollo/client/core';
import BigNumber from 'bignumber.js';
import gql from 'graphql-tag';

import { BlocksOrderBy, SubqueryVersionsOrderBy } from '~/middleware/types';
import { DEFAULT_GQL_PAGE_SIZE } from '~/utils/constants';

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
      subqueryVersions(orderBy: [${SubqueryVersionsOrderBy.IdDesc}], first: 1) {
        nodes {
          id
          version
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

/**
 * Create args and filters to be supplied to GQL query
 *
 * @param size - size of the page
 * @param start - offset of the page
 *
 * @hidden
 */
export function getSizeAndOffset(
  size?: BigNumber,
  start?: BigNumber
): { size: number; start: number } {
  return {
    size: size?.toNumber() || DEFAULT_GQL_PAGE_SIZE,
    start: start?.toNumber() || 0,
  };
}

/**
 * Remove undefined values from the variables object
 *
 * @param variables - variables to be supplied to GQL query
 *
 * @hidden
 */
export function removeUndefinedValues(
  variables: Record<string | number | symbol, unknown>
): Record<string | number | symbol, unknown> {
  return Object.fromEntries(Object.entries(variables).filter(([, value]) => value !== undefined));
}

/**
 * Pad ID for subquery
 *
 * @hidden
 */
export function padSqId(id: string): string {
  return id.padStart(10, '0');
}
