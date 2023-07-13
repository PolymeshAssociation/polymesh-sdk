import { QueryOptions } from '@apollo/client';
import gql from 'graphql-tag';

import {
  QueryDidsWithClaimsArgs,
  QueryEventByAddedTrustedClaimIssuerArgs,
  QueryEventsByIndexedArgsArgs,
  QueryGetHistoryOfPaymentEventsForCaArgs,
  QueryGetWithholdingTaxesOfCaArgs,
  QueryInvestmentsArgs,
  QueryIssuerDidsWithClaimsByTargetArgs,
  QueryProposalArgs,
  QueryProposalsArgs,
  QueryProposalVotesArgs,
  QueryScopesByIdentityArgs,
  QuerySettlementsArgs,
  QueryTickerExternalAgentActionsArgs,
  QueryTickerExternalAgentHistoryArgs,
  QueryTokensByTrustedClaimIssuerArgs,
  QueryTokensHeldByDidArgs,
  QueryTransactionByHashArgs,
  QueryTransactionsArgs,
} from '~/middleware/types';

/**
 * @hidden
 *
 * Get the current voters list for given pipId
 */
export function proposalVotes(
  variables: QueryProposalVotesArgs
): QueryOptions<QueryProposalVotesArgs> {
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
): QueryOptions<QueryDidsWithClaimsArgs> {
  const query = gql`
    query DidsWithClaimsQuery(
      $dids: [String!]
      $scope: ScopeInput
      $trustedClaimIssuers: [String!]
      $claimTypes: [ClaimTypeEnum!]
      $includeExpired: Boolean
      $count: Int
      $skip: Int
    ) {
      didsWithClaims(
        dids: $dids
        scope: $scope
        trustedClaimIssuers: $trustedClaimIssuers
        claimTypes: $claimTypes
        includeExpired: $includeExpired
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
            cdd_id
            scope {
              type
              value
            }
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
): QueryOptions<QueryEventsByIndexedArgsArgs> {
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
          hash
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
 * Get all events by any of its indexed arguments
 */
export function eventsByIndexedArgs(
  variables: QueryEventsByIndexedArgsArgs
): QueryOptions<QueryEventsByIndexedArgsArgs> {
  const query = gql`
    query EventsByIndexedArgsQuery(
      $moduleId: ModuleIdEnum!
      $eventId: EventIdEnum!
      $eventArg0: String
      $eventArg1: String
      $eventArg2: String
      $count: Int
      $skip: Int
    ) {
      eventsByIndexedArgs(
        moduleId: $moduleId
        eventId: $eventId
        eventArg0: $eventArg0
        eventArg1: $eventArg1
        eventArg2: $eventArg2
        count: $count
        skip: $skip
      ) {
        block_id
        event_idx
        extrinsic_idx
        block {
          datetime
          hash
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
 * Get a transaction by hash
 */
export function transactionByHash(
  variables: QueryTransactionByHashArgs
): QueryOptions<QueryTransactionByHashArgs> {
  const query = gql`
    query TransactionByHashQuery($transactionHash: String) {
      transactionByHash(transactionHash: $transactionHash) {
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
        block {
          hash
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
export function proposals(variables?: QueryProposalsArgs): QueryOptions<QueryProposalsArgs> {
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
 * Get the tickers of all the Assets for which the passed DID is a trusted claim issuer
 */
export function tokensByTrustedClaimIssuer(
  variables: QueryTokensByTrustedClaimIssuerArgs
): QueryOptions<QueryTokensByTrustedClaimIssuerArgs> {
  const query = gql`
    query TokensByTrustedClaimIssuerQuery($claimIssuerDid: String!) {
      tokensByTrustedClaimIssuer(claimIssuerDid: $claimIssuerDid)
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
 * Get all tickers of Assets that were held at some point by the given did
 */
export function tokensHeldByDid(
  variables: QueryTokensHeldByDidArgs
): QueryOptions<QueryTokensHeldByDidArgs> {
  const query = gql`
    query TokensHeldByDidQuery($did: String!, $count: Int, $skip: Int, $order: Order) {
      tokensHeldByDid(did: $did, count: $count, skip: $skip, order: $order) {
        totalCount
        items
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
 * Get transactions
 */
export function transactions(
  variables?: QueryTransactionsArgs
): QueryOptions<QueryTransactionsArgs> {
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
          block {
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
 * Get the scopes (and ticker, if applicable) of claims issued on an Identity
 */
export function scopesByIdentity(
  variables: QueryScopesByIdentityArgs
): QueryOptions<QueryScopesByIdentityArgs> {
  const query = gql`
    query ScopesByIdentityQuery($did: String!) {
      scopesByIdentity(did: $did) {
        scope {
          type
          value
        }
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
  variables: QueryIssuerDidsWithClaimsByTargetArgs
): QueryOptions<QueryIssuerDidsWithClaimsByTargetArgs> {
  const query = gql`
    query IssuerDidsWithClaimsByTargetQuery(
      $target: String!
      $scope: ScopeInput
      $trustedClaimIssuers: [String!]
      $includeExpired: Boolean
      $count: Int
      $skip: Int
    ) {
      issuerDidsWithClaimsByTarget(
        target: $target
        scope: $scope
        trustedClaimIssuers: $trustedClaimIssuers
        includeExpired: $includeExpired
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
            cdd_id
            scope {
              type
              value
            }
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
 * Get a proposal by its pipId
 */
export function proposal(variables: QueryProposalArgs): QueryOptions<QueryProposalArgs> {
  const query = gql`
    query ProposalQuery($pipId: Int!) {
      proposal(pipId: $pipId) {
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
 * Fetch the number of the latest block that has been processed by the middleware
 */
export function latestProcessedBlock(): QueryOptions {
  const query = gql`
    query {
      latestBlock {
        id
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
 * Middleware heartbeat
 */
export function heartbeat(): QueryOptions {
  const query = gql`
    query {
      heartbeat
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
 * Get an added trusted claim issuer event by its indexed arguments
 */
export function eventByAddedTrustedClaimIssuer(
  variables: QueryEventByAddedTrustedClaimIssuerArgs
): QueryOptions<QueryEventByAddedTrustedClaimIssuerArgs> {
  const query = gql`
    query EventByAddedTrustedClaimIssuerQuery($ticker: String!, $identityId: String!) {
      eventByAddedTrustedClaimIssuer(ticker: $ticker, identityId: $identityId) {
        block_id
        event_idx
        extrinsic_idx
        block {
          datetime
          hash
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
 * Get Settlements where a Portfolio is involved
 */
export function settlements(variables: QuerySettlementsArgs): QueryOptions<QuerySettlementsArgs> {
  const query = gql`
    query SettlementsQuery(
      $identityId: String!
      $portfolioNumber: String
      $addressFilter: String
      $tickerFilter: String
      $count: Int
      $skip: Int
    ) {
      settlements(
        identityId: $identityId
        portfolioNumber: $portfolioNumber
        addressFilter: $addressFilter
        tickerFilter: $tickerFilter
        count: $count
        skip: $skip
      ) {
        totalCount
        items {
          block_id
          result
          addresses
          legs {
            ticker
            amount
            direction
            from {
              did
              kind
            }
            to {
              did
              kind
            }
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
 * Get all investments for a given offering
 */
export function investments(variables: QueryInvestmentsArgs): QueryOptions<QueryInvestmentsArgs> {
  const query = gql`
    query InvestmentsQuery($stoId: Int!, $ticker: String!, $count: Int, $skip: Int) {
      investments(stoId: $stoId, ticker: $ticker, count: $count, skip: $skip) {
        totalCount
        items {
          investor
          offeringTokenAmount
          raiseTokenAmount
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
 * Get current amount of withheld tax for a distribution
 */
export function getWithholdingTaxesOfCa(
  variables: QueryGetWithholdingTaxesOfCaArgs
): QueryOptions<QueryGetWithholdingTaxesOfCaArgs> {
  const query = gql`
    query GetWithholdingTaxesOfCAQuery($CAId: CAId!, $fromDate: DateTime, $toDate: DateTime) {
      getWithholdingTaxesOfCA(CAId: $CAId, fromDate: $fromDate, toDate: $toDate) {
        taxes
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
 * Get history of claims for a distribution
 */
export function getHistoryOfPaymentEventsForCa(
  variables: QueryGetHistoryOfPaymentEventsForCaArgs
): QueryOptions<QueryGetHistoryOfPaymentEventsForCaArgs> {
  const query = gql`
    query GetHistoryOfPaymentEventsForCAQuery(
      $CAId: CAId!
      $fromDate: DateTime
      $toDate: DateTime
      $count: Int
      $skip: Int
    ) {
      getHistoryOfPaymentEventsForCA(
        CAId: $CAId
        fromDate: $fromDate
        toDate: $toDate
        count: $count
        skip: $skip
      ) {
        totalCount
        items {
          blockId
          eventId
          eventDid
          datetime
          ticker
          localId
          balance
          tax
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
 * Get the transaction history of each external agent of an Asset
 */
export function tickerExternalAgentHistory(
  variables: QueryTickerExternalAgentHistoryArgs
): QueryOptions<QueryTickerExternalAgentHistoryArgs> {
  const query = gql`
    query TickerExternalAgentHistoryQuery($ticker: String!) {
      tickerExternalAgentHistory(ticker: $ticker) {
        did
        history {
          datetime
          block_id
          event_idx
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
 * Get list of Events triggered by actions (from the set of actions that can only be performed by external agents) that have been performed on a specific Asset
 */
export function tickerExternalAgentActions(
  variables: QueryTickerExternalAgentActionsArgs
): QueryOptions<QueryTickerExternalAgentActionsArgs> {
  const query = gql`
    query TickerExternalAgentActionsQuery(
      $ticker: String!
      $caller_did: String
      $pallet_name: ModuleIdEnum
      $event_id: EventIdEnum
      $max_block: Int
      $count: Int
      $skip: Int
      $order: Order
    ) {
      tickerExternalAgentActions(
        ticker: $ticker
        caller_did: $caller_did
        pallet_name: $pallet_name
        event_id: $event_id
        max_block: $max_block
        count: $count
        skip: $skip
        order: $order
      ) {
        totalCount
        items {
          datetime
          block_id
          event_idx
          pallet_name
          event_id
          caller_did
        }
      }
    }
  `;

  return {
    query,
    variables,
  };
}
