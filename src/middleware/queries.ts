import gql from 'graphql-tag';

import {
  QueryDidsWithClaimsArgs,
  QueryEventsByIndexedArgsArgs,
  QueryIssuerDidsWithClaimsByTargetArgs,
  QueryProposalsArgs,
  QueryProposalVotesArgs,
  QueryScopesByIdentityArgs,
  QueryTokensByTrustedClaimIssuerArgs,
  QueryTransactionsArgs,
} from '~/middleware/types';
import { GraphqlQuery } from '~/types/internal';

/**
 * @hidden
 *
 * Get the current voters list for given pipId
 */
export function proposalVotes(
  variables: QueryProposalVotesArgs
): GraphqlQuery<QueryProposalVotesArgs> {
  const query = gql`
    query ProposalVotesQuery(
      $pipId: Int!
      $vote: Boolean!
      $count: Int
      $skip: Int
      $orderBy: ProposalVotesOrderByInput
    ) {
      proposalVotes(pipId: $pipId, vote: $vote, count: $count, skip: $skip, orderBy: $orderBy) {
        blockId
        eventIdx
        account
        vote
        weight
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
 * Get all dids with at least one claim for a given scope and from one the given trustedClaimIssuers
 */
export function didsWithClaims(
  variables: QueryDidsWithClaimsArgs
): GraphqlQuery<QueryDidsWithClaimsArgs> {
  const query = gql`
    query DidsWithClaimsQuery(
      $dids: [String!]
      $scope: String
      $trustedClaimIssuers: [String!]
      $claimTypes: [ClaimTypeEnum!]
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
        totalCount
        items {
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
 * Get a single event by any of its indexed arguments
 */
export function eventByIndexedArgs(
  variables: QueryEventsByIndexedArgsArgs
): GraphqlQuery<QueryEventsByIndexedArgsArgs> {
  const query = gql`
    query EventByIndexedArgsQuery(
      $moduleId: ModuleIdEnum!
      $eventId: EventIdEnum!
      $eventArg0: String
      $eventArg1: String
      $eventArg2: String
    ) {
      eventByIndexedArgs(
        moduleId: $moduleId
        eventId: $eventId
        eventArg0: $eventArg0
        eventArg1: $eventArg1
        eventArg2: $eventArg2
      ) {
        block_id
        event_idx
        extrinsic_idx
        block {
          datetime
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
 * Get all proposals optionally filtered by pipId, proposer or state
 */
export function proposals(
  variables?: QueryProposalsArgs
): GraphqlQuery<QueryProposalsArgs | undefined> {
  const query = gql`
    query ProposalsQuery(
      $pipIds: [Int!]
      $proposers: [String!]
      $states: [ProposalState!]
      $count: Int
      $skip: Int
      $orderBy: ProposalOrderByInput
    ) {
      proposals(
        pipIds: $pipIds
        proposers: $proposers
        states: $states
        count: $count
        skip: $skip
        orderBy: $orderBy
      ) {
        pipId
        proposer
        createdAt
        url
        description
        coolOffEndBlock
        endBlock
        proposal
        lastState
        lastStateUpdatedAt
        totalVotes
        totalAyesWeight
        totalNaysWeight
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
 * Get the tickers of all the tokens for which the passed DID is a trusted claim issuer
 */
export function tokensByTrustedClaimIssuer(
  variables: QueryTokensByTrustedClaimIssuerArgs
): GraphqlQuery<QueryTokensByTrustedClaimIssuerArgs> {
  const query = gql`
    query TokensByTrustedClaimIssuerQuery($claimIssuerDid: String!, $order: Order) {
      tokensByTrustedClaimIssuer(claimIssuerDid: $claimIssuerDid, order: $order)
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
 * Get transactions
 */
export function transactions(
  variables?: QueryTransactionsArgs
): GraphqlQuery<QueryTransactionsArgs | undefined> {
  const query = gql`
    query TransactionsQuery(
      $block_id: Int
      $address: String
      $module_id: ModuleIdEnum
      $call_id: CallIdEnum
      $success: Boolean
      $count: Int
      $skip: Int
      $orderBy: TransactionOrderByInput
    ) {
      transactions(
        block_id: $block_id
        address: $address
        module_id: $module_id
        call_id: $call_id
        success: $success
        count: $count
        skip: $skip
        orderBy: $orderBy
      ) {
        totalCount
        items {
          block_id
          extrinsic_idx
          address
          nonce
          module_id
          call_id
          params
          success
          spec_version_id
          extrinsic_hash
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
 * Get the scopes (and ticker, if applicable) of claims issued on an identity
 */
export function scopesByIdentity(
  variables: QueryScopesByIdentityArgs
): GraphqlQuery<QueryScopesByIdentityArgs> {
  const query = gql`
    query ScopesByIdentityQuery($did: String!) {
      scopesByIdentity(did: $did) {
        scope
        ticker
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
 * Get issuer dids with at least one claim for given target
 */
export function issuerDidsWithClaimsByTarget(
  variables?: QueryIssuerDidsWithClaimsByTargetArgs
): GraphqlQuery<QueryIssuerDidsWithClaimsByTargetArgs | undefined> {
  const query = gql`
    query IssuerDidsWithClaimsByTargetQuery(
      $target: String!
      $scope: String
      $trustedClaimIssuers: [String!]
      $count: Int
      $skip: Int
    ) {
      issuerDidsWithClaimsByTarget(
        target: $target
        scope: $scope
        trustedClaimIssuers: $trustedClaimIssuers
        count: $count
        skip: $skip
      )
    }
  `;

  return {
    query,
    variables,
  };
}
