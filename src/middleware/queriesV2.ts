import gql from 'graphql-tag';

import { QueryDidsWithClaimsArgs } from '~/middleware/types';
import { GraphqlQuery } from '~/types/internal';

/**
 *  @hidden
 */
function createClaimsFilters(variables: QueryDidsWithClaimsArgs): {
  args: string[];
  filters: string[];
} {
  const args = [];
  const filters = [];
  const { dids, claimTypes, trustedClaimIssuers, scope, includeExpired } = variables;
  if (dids) {
    args.push('$dids: [String!]');
    filters.push('targetId: { in: $dids }');
  }
  if (claimTypes) {
    args.push('$claimTypes: [String!]!');
    filters.push('type: { in: $claimTypes }');
  }
  if (trustedClaimIssuers) {
    args.push('$trustedClaimIssuers: [String!]');
    filters.push('issuerId: { in: $trustedClaimIssuers }');
  }
  if (scope !== undefined) {
    args.push('$scope: JSON!');
    filters.push('scope: { equalTo: $scope }');
  }
  if (!includeExpired) {
    args.push('$expiryTimestamp: BigFloat');
    filters.push('filterExpiry: { lessThan: $expiryTimestamp }');
  }
  return {
    args,
    filters,
  };
}

/**
 * @hidden
 *
 * Get all dids with at least one claim for a given scope and from one the given trustedClaimIssuers
 */
export function claimTargets(
  variables: QueryDidsWithClaimsArgs
): GraphqlQuery<QueryDidsWithClaimsArgs> {
  const { args, filters } = createClaimsFilters(variables);
  const maybeArgs = args.length ? `${args.join()},` : '';
  const maybeFilters = filters.length ? `filter : {${filters.join()}},` : '';
  const query = `
    query ClaimTargets(
      ${maybeArgs}
      $count: Int,
      $skip: Int
    ) {
      claims(
        ${maybeFilters}
        orderBy: [TARGET_ID_ASC],
        first: $count,
        offset: $skip
      ) {
        groupedAggregates(groupBy: [TARGET_ID], having: {}) {
          keys
        }
      }
    }
  `;

  console.log(query);
  return {
    query: gql`
      ${query}
    `,
    variables,
  };
}

/**
 * @hidden
 *
 * Get all dids with at least one claim for a given scope and from one the given trustedClaimIssuers
 */
export function claims(variables: QueryDidsWithClaimsArgs): GraphqlQuery<QueryDidsWithClaimsArgs> {
  const { args, filters } = createClaimsFilters(variables);
  const maybeArgs = args.length ? `, ${args.join()}` : '';
  const maybeFilters = filters.length ? `, filter : {${filters.join()}}` : '';
  const query = gql`
    query ClaimTargets(
      ${maybeArgs}
    ) {
      claims(
        orderBy: [BLOCK_ID_ASC, EVENT_IDX_ASC]
        ${maybeFilters}
      ) {
        nodes {
          targetId
          type
          scope
          cddId
          issuerId
          issuanceDate
          lastUpdateDate
          expiry
          jurisdiction
        }
      }
    }
  `;

  return {
    query,
    variables,
  };
}
