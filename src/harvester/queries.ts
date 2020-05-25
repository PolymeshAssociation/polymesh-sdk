import { DocumentNode } from 'graphql';
import gql from 'graphql-tag';

import { QueryDidsWithClaimsArgs } from '~/harvester/types';

interface GraphqlQuery {
  query: DocumentNode;
  variables: QueryDidsWithClaimsArgs;
}

/**
 * @hidden
 *
 * Get all dids with at least one claim for a given scope and from one the given trustedClaimIssuers
 */
export function didsWithClaims(variables: QueryDidsWithClaimsArgs): GraphqlQuery {
  const query = gql`
    query DidsWithClaimsQuery(
      $dids: [String]
      $scope: String
      $trustedClaimIssuers: [String]
      $claimTypes: [String]
      $count: Int
      $skip: Int
    ) {
      didsWithClaims(
        dids: $dids
        scope: $scope
        trustedClaimIssuers: $trustedClaimIssuers
        claimTypes: $claimTypes
        count: $count
        skip: $skip
      ) {
        did
        claims {
          targetDID
          issuer
          issuance_date
          last_update_date
          expiry
          type
          jurisdiction
          scope
        }
      }
    }
  `;

  return {
    query,
    variables,
  };
}
