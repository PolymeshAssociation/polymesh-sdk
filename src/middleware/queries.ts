import gql from 'graphql-tag';

import {
  QueryDidsWithClaimsArgs,
  QueryEventByAddedTrustedClaimIssuerArgs,
  QueryEventsByIndexedArgsArgs,
  QueryGetHistoryOfClaimsForCaArgs,
  QueryGetWithholdingTaxesOfCaArgs,
  QueryInvestmentsArgs,
  QueryIssuerDidsWithClaimsByTargetArgs,
  QueryProposalArgs,
  QueryProposalsArgs,
  QueryProposalVotesArgs,
  QueryScopesByIdentityArgs,
  QuerySettlementsArgs,
  QueryTokensByTrustedClaimIssuerArgs,
  QueryTokensHeldByDidArgs,
  QueryTransactionByHashArgs,
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
 * Get all events by any of its indexed arguments
 */
export function eventsByIndexedArgs(
  variables: QueryEventsByIndexedArgsArgs
): GraphqlQuery<QueryEventsByIndexedArgsArgs> {
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
): GraphqlQuery<QueryTransactionByHashArgs> {
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
 * Get all tickers of tokens that were held at some point by the given did
 */
export function tokensHeldByDid(
  variables: QueryTokensHeldByDidArgs
): GraphqlQuery<QueryTokensHeldByDidArgs> {
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
 * Get the scopes (and ticker, if applicable) of claims issued on an Identity
 */
export function scopesByIdentity(
  variables: QueryScopesByIdentityArgs
): GraphqlQuery<QueryScopesByIdentityArgs> {
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
): GraphqlQuery<QueryIssuerDidsWithClaimsByTargetArgs> {
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
export function proposal(variables: QueryProposalArgs): GraphqlQuery<QueryProposalArgs> {
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
export function latestProcessedBlock(): GraphqlQuery {
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
export function heartbeat(): GraphqlQuery {
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
): GraphqlQuery<QueryEventByAddedTrustedClaimIssuerArgs> {
  const query = gql`
    query EventByAddedTrustedClaimIssuerQuery($ticker: String!, $identityId: String!) {
      eventByAddedTrustedClaimIssuer(ticker: $ticker, identityId: $identityId) {
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
 * Get Settlements where a Portfolio is involved
 */
export function settlements(variables: QuerySettlementsArgs): GraphqlQuery<QuerySettlementsArgs> {
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
export function investments(variables: QueryInvestmentsArgs): GraphqlQuery<QueryInvestmentsArgs> {
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
export function getWithholdingTaxesOfCA(
  variables: QueryGetWithholdingTaxesOfCaArgs
): GraphqlQuery<QueryGetWithholdingTaxesOfCaArgs> {
  const query = gql`
    query GetWithholdingTaxesOfCAQuery($CAId: CaId!, $fromDate: String, $toDate: String) {
      getWithholdingTaxesOfCA(CAId: $CAId, fromDate: $fromDate, toDate: $coutoDatent) {
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
export function getHistoryOfClaimsForCA(
  variables: QueryGetHistoryOfClaimsForCaArgs
): GraphqlQuery<QueryGetHistoryOfClaimsForCaArgs> {
  const query = gql`
    query GetHistoryOfClaimsForCAQuery(
      $CAId: CaId!
      $fromDate: String
      $toDate: String
      $count: Int
      $skip: Int
    ) {
      getHistoryOfClaimsForCA(
        CAId: $CAId
        fromDate: $fromDate
        toDate: $coutoDatent
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
