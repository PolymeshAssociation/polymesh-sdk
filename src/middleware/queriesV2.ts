import gql from 'graphql-tag';

import { QueryDidsWithClaimsArgs } from '~/middleware/types';
import { ClaimsOrderBy } from '~/middleware/typesV2';
import { GraphqlQuery } from '~/types/internal';

/**
 *  @hidden
 */
function createClaimsFilters(variables: QueryDidsWithClaimsArgs): {
  args: string;
  filter: string;
} {
  const args = [];
  const filters = ['revokeDate: { isNull: true }'];
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
    args: args.length ? `(${args.join()})` : '',
    filter: `filter: { ${filters.join()} },`,
  };
}

/**
 * @hidden
 *
 * Get all dids with at least one claim for a given scope and from one of the given trusted claim issuers
 */
export function claimTargets(
  variables: QueryDidsWithClaimsArgs
): GraphqlQuery<QueryDidsWithClaimsArgs> {
  const { args, filter } = createClaimsFilters(variables);
  const query = gql`
    query ClaimTargets
      ${args}
     {
      claims(
        ${filter}
        orderBy: [${ClaimsOrderBy.TargetIdAsc}]
      ) {
        groupedAggregates(groupBy: [TARGET_ID], having: {}) {
          keys
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
 * Get all claims that a given target DID has, with a given scope and from one of the given trustedClaimIssuers
 */
export function claims(variables: QueryDidsWithClaimsArgs): GraphqlQuery<QueryDidsWithClaimsArgs> {
  const { args, filter } = createClaimsFilters(variables);

  const query = gql`
    query ClaimsData
      ${args}
     {
      claims(
        ${filter}
        orderBy: [${ClaimsOrderBy.TargetIdAsc}, ${ClaimsOrderBy.BlockIdAsc}, ${ClaimsOrderBy.EventIdxAsc}]
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
