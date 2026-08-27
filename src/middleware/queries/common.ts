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
/**
 * @hidden
 *
 * How a filter attribute is turned into a GQL variable and comparison
 */
export interface FilterSpec {
  /**
   * GQL type of the variable. Defaults to `String`
   */
  type?: string;
  /**
   * GQL comparison to apply. Defaults to `equalTo`
   */
  operator?: string;
}

/**
 * @hidden
 *
 * Build the GQL argument list and `filter:` block for the attributes actually supplied
 */
export function createArgsAndFilters(
  filters: Record<string, unknown>,
  typeMap: Record<string, string | FilterSpec>
): {
  args: string;
  filter: string;
} {
  const args: string[] = ['$start: Int', '$size: Int'];
  const gqlFilters: string[] = [];

  Object.keys(filters).forEach(attribute => {
    /*
     * a supplied value is filtered on even when it is falsy: `success: 0` means "only the failed
     * ones", and dropping it returned everything instead
     */
    if (filters[attribute] === undefined || filters[attribute] === null) {
      return;
    }

    const spec = typeMap[attribute] ?? {};
    const { type = 'String', operator = 'equalTo' } =
      typeof spec === 'string' ? { type: spec } : spec;

    args.push(`$${attribute}: ${type}!`);
    gqlFilters.push(`${attribute}: { ${operator}: $${attribute} }`);
  });

  return {
    args: `(${args.join()})`,
    filter: gqlFilters.length ? `filter: { ${gqlFilters.join()} }` : '',
  };
}

/**
 * @hidden
 *
 * The column an ordering key names, without its direction
 */
function orderByColumn(key: string): string {
  return key.replace(/_(ASC|DESC)$/, '');
}

/**
 * @hidden
 *
 * Read an ordering the caller may have given as one key or as several
 */
export function toOrderByList<Key>(orderBy?: Key | Key[]): Key[] {
  if (orderBy === undefined) {
    return [];
  }

  return Array.isArray(orderBy) ? orderBy : [orderBy];
}

/**
 * @hidden
 *
 * Build a paginated query's `orderBy` list from the ordering the caller supplied.
 *
 * What a caller asks for comes first, and the query's own ordering follows it, rather than being
 * replaced by it: `first`/`offset` paging over an order that does not decide every row repeats and
 * skips rows, so the keys that make the order unique are appended, except where the caller already
 * orders by that column and has said which direction they want it in
 *
 * @param orderBy - ordering the caller supplied, if any
 * @param tiebreaker - the keys that make this query's order unique, which are also its default
 */
export function orderByClause<Key extends string>(
  orderBy: Key | Key[] | undefined,
  tiebreaker: Key[]
): string {
  const supplied = toOrderByList(orderBy);
  const orderedColumns = new Set(supplied.map(orderByColumn));

  return [...supplied, ...tiebreaker.filter(key => !orderedColumns.has(orderByColumn(key)))].join(
    ', '
  );
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
    size: size?.toNumber() ?? DEFAULT_GQL_PAGE_SIZE,
    start: start?.toNumber() ?? 0,
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
