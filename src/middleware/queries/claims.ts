import { QueryOptions } from '@apollo/client/core';
import BigNumber from 'bignumber.js';
import gql from 'graphql-tag';

import { getSizeAndOffset, removeUndefinedValues } from '~/middleware/queries/common';
import {
  ClaimsOrderBy,
  ClaimTypeEnum,
  TrustedClaimIssuer,
  TrustedClaimIssuersOrderBy,
} from '~/middleware/types';
import { PaginatedQueryArgs, QueryArgs } from '~/types/utils';

/**
 *  @hidden
 */
function createClaimsFilters(variables: ClaimsQueryFilter): {
  args: string;
  filter: string;
} {
  const args = ['$size: Int, $start: Int'];
  const filters = ['revokeDate: { isNull: true }'];
  const { dids, claimTypes, trustedClaimIssuers, scope, includeExpired } = variables;
  if (dids?.length) {
    args.push('$dids: [String!]');
    filters.push('targetId: { in: $dids }');
  }
  if (claimTypes) {
    args.push('$claimTypes: [ClaimTypeEnum!]!');
    filters.push('type: { in: $claimTypes }');
  }
  if (trustedClaimIssuers?.length) {
    args.push('$trustedClaimIssuers: [String!]');
    filters.push('issuerId: { in: $trustedClaimIssuers }');
  }
  if (scope !== undefined) {
    args.push('$scope: JSON!');
    filters.push('scope: { contains: $scope }');
  }
  if (!includeExpired) {
    args.push('$expiryTimestamp: BigFloat');
    filters.push(
      'or: [{ filterExpiry: { lessThan: $expiryTimestamp } }, { expiry: { isNull: true } }]'
    );
  }
  return {
    args: `(${args.join()})`,
    filter: `filter: { ${filters.join()} },`,
  };
}

export interface ClaimsQueryFilter {
  dids?: string[];
  scope?: Record<string, unknown>;
  trustedClaimIssuers?: string[];
  claimTypes?: ClaimTypeEnum[];
  includeExpired?: boolean;
  expiryTimestamp?: number;
}
/**
 * @hidden
 *
 * Get all dids with at least one claim for a given scope and from one of the given trusted claim issuers
 */
export function claimsGroupingQuery(
  variables: ClaimsQueryFilter,
  orderBy = ClaimsOrderBy.TargetIdAsc,
  groupBy = 'TARGET_ID'
): QueryOptions<PaginatedQueryArgs<ClaimsQueryFilter>> {
  const { args, filter } = createClaimsFilters(variables);

  const query = gql`
    query claimsGroupingQuery
      ${args}
     {
      claims(
        ${filter}
        orderBy: [${orderBy}]
        first: $size
        offset: $start
      ) {
        groupedAggregates(groupBy: [${groupBy}], having: {}) {
          keys
        }
      }
    }
  `;

  return {
    query,
    variables: removeUndefinedValues(variables as Record<string, unknown>),
  };
}

/**
 * @hidden
 *
 * Get all claims that a given target DID has, with a given scope and from one of the given trustedClaimIssuers
 */
export function claimsQuery(
  paddedIds: boolean,
  filters: ClaimsQueryFilter,
  size?: BigNumber,
  start?: BigNumber
): QueryOptions<PaginatedQueryArgs<ClaimsQueryFilter>> {
  const { args, filter } = createClaimsFilters(filters);

  const orderBy = paddedIds
    ? `${ClaimsOrderBy.TargetIdAsc}, ${ClaimsOrderBy.CreatedBlockIdAsc}, ${ClaimsOrderBy.EventIdxAsc}`
    : `${ClaimsOrderBy.TargetIdAsc}, ${ClaimsOrderBy.CreatedAtAsc}, ${ClaimsOrderBy.CreatedBlockIdAsc}, ${ClaimsOrderBy.EventIdxAsc}`;

  const query = gql`
    query ClaimsQuery
      ${args}
      {
        claims(
          ${filter}
          orderBy: [${orderBy}]
          first: $size
          offset: $start
        ) {
          totalCount
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
            customClaimTypeId
          }
        }
      }
    `;

  return {
    query,
    variables: removeUndefinedValues({
      ...filters,
      expiryTimestamp: filters.includeExpired ? undefined : new Date().getTime(),
      ...getSizeAndOffset(size, start),
    }),
  };
}

/**
 * @hidden
 *
 * Get an trusted claim issuer event for an asset and an issuer
 */
export function trustedClaimIssuerQuery(
  paddedIds: boolean,
  variables: QueryArgs<TrustedClaimIssuer, 'issuer' | 'assetId'>
): QueryOptions<QueryArgs<TrustedClaimIssuer, 'issuer' | 'assetId'>> {
  const orderBy = paddedIds
    ? `${TrustedClaimIssuersOrderBy.CreatedBlockIdDesc}`
    : `${TrustedClaimIssuersOrderBy.CreatedAtDesc}, ${TrustedClaimIssuersOrderBy.CreatedBlockIdDesc}`;

  const query = gql`
    query TrustedClaimIssuerQuery($assetId: String!, $issuer: String!) {
      trustedClaimIssuers(
        filter: { assetId: { equalTo: $assetId }, issuer: { equalTo: $issuer } }
        orderBy: [${orderBy}]
      ) {
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
 * Get an trusted claim issuer event for an asset and an issuer
 */
export function trustingAssetsQuery(
  variables: QueryArgs<TrustedClaimIssuer, 'issuer'>
): QueryOptions<QueryArgs<TrustedClaimIssuer, 'issuer'>> {
  const query = gql`
    query TrustedClaimIssuerQuery($issuer: String!) {
      trustedClaimIssuers(
        filter: { issuer: { equalTo: $issuer } },
        orderBy: [${TrustedClaimIssuersOrderBy.AssetIdAsc}]
      ) {
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
    variables,
  };
}

/**
 *  @hidden
 */
export function createCustomClaimTypeQueryFilters(variables: CustomClaimTypesQuery): {
  args: string;
  filter: string;
} {
  const args = ['$size: Int, $start: Int'];
  const filters = [];

  const { dids } = variables;

  if (dids?.length) {
    args.push('$dids: [String!]');
    filters.push('identityId: { in: $dids }');
  }

  return {
    args: `(${args.join()})`,
    filter: filters.length ? `filter: { ${filters.join()} },` : '',
  };
}

export interface CustomClaimTypesQuery {
  dids?: string[];
}
/**
 * @hidden
 *
 * Get registered CustomClaimTypes
 */
export function customClaimTypeQuery(
  size?: BigNumber,
  start?: BigNumber,
  dids?: string[]
): QueryOptions<PaginatedQueryArgs<CustomClaimTypesQuery>> {
  const { args, filter } = createCustomClaimTypeQueryFilters({ dids });

  const query = gql`
  query CustomClaimTypesQuery
    ${args}
    {
      customClaimTypes(
        ${filter}
        first: $size
        offset: $start
      ){
        nodes {
          id
          name
          identityId
        }
        totalCount
      }
    }
`;

  return {
    query,
    variables: removeUndefinedValues({ ...getSizeAndOffset(size, start), dids }),
  };
}
