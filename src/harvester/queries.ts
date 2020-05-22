import { DocumentNode } from 'graphql';
import gql from 'graphql-tag';

import { Maybe, QueryDidsWithClaimsArgs } from '~/harvester/types';

interface GraphqlQuery {
  query: DocumentNode;
}

/**
 * @hidden
 */
export function gqlNumber(value: number | null | undefined): number | null {
  if (typeof value === 'number') {
    return value;
  }
  return null;
}

/**
 * @hidden
 */
export function gqlString(value: string | null | undefined): string | null {
  if (typeof value === 'string') {
    return `"${value}"`;
  }
  return null;
}

/**
 * @hidden
 */
export function gqlArray(value: Maybe<string>[] | null | undefined): string | null {
  if (value instanceof Array) {
    return `[${value.map(i => `"${i}"`).join(',')}]`;
  }
  return null;
}

/**
 * @hidden
 *
 * Get all dids with at least one claim for a given scope and from one the given trustedClaimIssuers
 */
export function didsWithClaims(args: QueryDidsWithClaimsArgs): GraphqlQuery {
  const { dids, scope, trustedClaimIssuers, claimTypes, count, skip } = args;

  return {
    query: gql`
    query {
      didsWithClaims(
        dids: ${gqlArray(dids)},
        scope: ${gqlString(scope)},
        trustedClaimIssuers: ${gqlArray(trustedClaimIssuers)},
        claimTypes: ${gqlArray(claimTypes)},
        count: ${gqlNumber(count)},
        skip: ${gqlNumber(skip)}
      ) {
        did,
        claims {
          targetDID, issuer, issuance_date, last_update_date, expiry, type, jurisdiction, scope
        }
      }
    }
    `,
  };
}
