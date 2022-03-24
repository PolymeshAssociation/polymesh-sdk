/* eslint-disable @typescript-eslint/no-use-before-define */

import { hexStripPrefix } from '@polkadot/util';
import gql from 'graphql-tag';

import { Context } from '~/internal';
import { V2Portfolio, V2Settlement } from '~/middleware/type-overrides';
import {
  AgentHistoryEvent,
  CallIdEnum,
  Claim as ClaimV1,
  ClaimTypeEnum,
  Event as EventV1,
  EventIdEnum,
  Extrinsic as ExtrinsicV1,
  IdentityWithClaims,
  Maybe,
  ModuleIdEnum,
  ProposalVotesOrderByInput,
  ProposalVotesOrderFields,
  QueryDidsWithClaimsArgs,
  QueryEventByAddedTrustedClaimIssuerArgs,
  QueryEventByIndexedArgsArgs,
  QueryEventsByIndexedArgsArgs,
  QueryGetHistoryOfPaymentEventsForCaArgs,
  QueryGetWithholdingTaxesOfCaArgs,
  QueryInvestmentsArgs,
  QueryIssuerDidsWithClaimsByTargetArgs,
  QueryProposalVotesArgs,
  QueryScopesByIdentityArgs,
  QuerySettlementsArgs,
  QueryTickerExternalAgentActionsArgs,
  QueryTickerExternalAgentHistoryArgs,
  QueryTokensByTrustedClaimIssuerArgs,
  QueryTokensHeldByDidArgs,
  QueryTransactionByHashArgs,
  QueryTransactionsArgs,
  SettlementDirectionEnum,
  TickerExternalAgentAction,
  TransactionOrderByInput,
  TransactionOrderFields,
} from '~/middleware/types';
import {
  Claim as ClaimV2,
  ClaimsConnection,
  Event as EventV2,
  Extrinsic as ExtrinsicV2,
  ExtrinsicsOrderBy,
  HeldTokensOrderBy,
  ProposalVotesOrderBy,
  TickerExternalAgentActionsOrderBy,
} from '~/middleware/types-v2';
import { DeepPartial, Order } from '~/types';
import { MultiGraphqlQuery } from '~/types/internal';
import { Modify } from '~/types/utils';
import { addressToKey, keyToAddress, removeNullChars } from '~/utils/conversion';

/**
 * @hidden
 *
 * Get the current voters list for given pipId
 */
export function proposalVotes(
  variables: QueryProposalVotesArgs
): MultiGraphqlQuery<
  QueryProposalVotesArgs,
  'proposalVotes',
  'proposalVotes',
  Modify<QueryProposalVotesArgs, { pipId: string; orderBy: ProposalVotesOrderBy[] }>
> {
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
  const queryV2 = gql`
    query ProposalVotesQuery(
      $pipId: String!
      $vote: Boolean!
      $count: Int
      $skip: Int
      $orderBy: [ProposalVotesOrderBy!]!
    ) {
      proposalVotes(
        filter: { proposalId: { equalTo: $pipId }, vote: { equalTo: $vote } }
        first: $count
        offset: $skip
        orderBy: $orderBy
      ) {
        nodes {
          blockId
          eventIdx
          account
          vote
          weight
        }
      }
    }
  `;

  return {
    v1: {
      query,
      variables,
    },
    v2: {
      request: {
        query: queryV2,
        variables: {
          ...variables,
          pipId: variables.pipId.toString(),
          orderBy: [mapProposalVotesOrder(variables.orderBy)],
        },
      },
      mapper: ({ proposalVotes: results }) => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const { nodes } = results!;
        return {
          proposalVotes: nodes.map(node => {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const { blockId, ...rest } = node!;
            // eslint-disable-next-line @typescript-eslint/naming-convention
            return { __typename: 'ProposalVote', block_id: +blockId, ...rest };
          }),
        };
      },
    },
  };
}

/**
 *  @hidden
 */
function mapProposalVotesOrder(
  orderInput?: Maybe<ProposalVotesOrderByInput>
): ProposalVotesOrderBy {
  if (!orderInput) {
    return ProposalVotesOrderBy.BlockIdAsc;
  }
  const { order, field } = orderInput;
  if (field === ProposalVotesOrderFields.BlockId) {
    if (order === Order.Asc) {
      return ProposalVotesOrderBy.BlockIdAsc;
    } else {
      return ProposalVotesOrderBy.BlockIdDesc;
    }
  } else if (field === ProposalVotesOrderFields.Vote) {
    if (order === Order.Asc) {
      return ProposalVotesOrderBy.VoteAsc;
    } else {
      return ProposalVotesOrderBy.VoteDesc;
    }
  } else if (field === ProposalVotesOrderFields.Weight) {
    if (order === Order.Asc) {
      return ProposalVotesOrderBy.WeightAsc;
    } else {
      return ProposalVotesOrderBy.WeightDesc;
    }
  }
  // Not smart enough type system
  return ProposalVotesOrderBy.BlockIdAsc;
}

type QueryDidsWithClaimsArgsV2 = Modify<QueryDidsWithClaimsArgs, { expiryTimestamp?: number }>;

/**
 * @hidden
 *
 * Get all dids with at least one claim for a given scope and from one the given trustedClaimIssuers
 */
export function didsWithClaims(
  variables: QueryDidsWithClaimsArgs
): MultiGraphqlQuery<
  QueryDidsWithClaimsArgs,
  'identityWithClaims',
  'didsWithClaims',
  QueryDidsWithClaimsArgsV2
> {
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

  const { args, filter, variablesV2, claimFilter } = createIdentityWithClaimsFilter(variables);
  const maybeFilter = filter ? `, filter:{${filter}}` : '';
  const maybeClaimFilter = claimFilter ? `, filter:{${claimFilter}}` : '';
  const queryV2 = gql`
    query DidsWithClaimsQuery($count: Int, $skip: Int ${args}) {
      identityWithClaims(first: $count, offset: $skip, orderBy: [ID_ASC] ${maybeFilter}) {
        totalCount
        nodes {
          id
          claims(orderBy: [BLOCK_ID_ASC, EVENT_IDX_ASC] ${maybeClaimFilter}) {
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
      }
    }
  `;

  return {
    v1: {
      query,
      variables,
    },
    v2: {
      request: { query: queryV2, variables: variablesV2 },
      mapper: ({ identityWithClaims }) => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const { nodes, totalCount } = identityWithClaims!;
        return {
          didsWithClaims: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            __typename: 'IdentityWithClaimsResult',
            totalCount,
            items: nodes.map(identityWithClaimsMapper),
          },
        };
      },
    },
  };
}
/**
 *  @hidden
 */
function identityWithClaimsMapper(
  node: Maybe<{ id: string; claims: ClaimsConnection }>
): IdentityWithClaims {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const { id, claims } = node!;
  const { nodes } = claims;
  return {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __typename: 'IdentityWithClaims',
    did: id,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    claims: nodes.map(n => mapClaim(n!)),
  };
}

/**
 *  @hidden
 */
function createIdentityWithClaimsFilter(variables: QueryDidsWithClaimsArgs): {
  filter: string;
  claimFilter: string;
  args: string;
  variablesV2: QueryDidsWithClaimsArgsV2;
} {
  let filter = '';
  let args = ' ';
  let claimFilter = '';
  const { dids, claimTypes, trustedClaimIssuers, scope, includeExpired, count, ...rest } =
    variables;
  if (dids) {
    args += ', $dids: [String!]';
    filter += 'id: { in: $dids }\n';
  }
  if (claimTypes) {
    args += ', $claimTypes: [String!]!';
    filter += 'typeIndex: { containsAnyKeys: $claimTypes}\n';
    claimFilter += 'type: { in: $claimTypes}\n';
  }
  if (trustedClaimIssuers) {
    args += ', $trustedClaimIssuers: [String!]';
    filter += 'issuerIndex: { containsAnyKeys: $trustedClaimIssuers}\n';
    claimFilter += 'issuer: { in: $trustedClaimIssuers}\n';
  }
  if (scope !== undefined) {
    args += ', $scope: JSON!';
    filter += 'scopeIndex: { contains: $scope},\n';
    claimFilter += 'scope: { equalTo: $scope},\n';
  }
  if (!includeExpired) {
    args += ', $expiryTimestamp: BigFloat';
    filter += 'maxExpiry: { lessThan: $expiryTimestamp }\n';
    claimFilter += 'filterExpiry: { lessThan: $expiryTimestamp }\n';
  }
  return {
    filter,
    args,
    claimFilter,
    variablesV2: {
      ...rest,
      count: count || 25,
      claimTypes,
      dids,
      scope,
      trustedClaimIssuers,
      expiryTimestamp: Date.now(),
    },
  };
}

/**
 *  @hidden
 */
function mapClaim({
  type,
  scope,
  cddId,
  issuanceDate,
  issuerId,
  lastUpdateDate,
  expiry,
  jurisdiction,
  targetId,
}: ClaimV2): ClaimV1 {
  return {
    /* eslint-disable @typescript-eslint/naming-convention */
    __typename: 'Claim',
    type: type as ClaimTypeEnum,
    scope: scope ? { ...scope, __typename: 'Scope' } : scope,
    cdd_id: cddId,
    issuance_date: issuanceDate,
    issuer: issuerId,
    last_update_date: lastUpdateDate,
    expiry: expiry ? Number(expiry) : expiry,
    jurisdiction,
    targetDID: targetId,
    /* eslint-enable @typescript-eslint/naming-convention */
  };
}

/**
 * @hidden
 *
 * Get a single event by any of its indexed arguments
 */
export function eventByIndexedArgs(
  variables: QueryEventsByIndexedArgsArgs
): MultiGraphqlQuery<QueryEventsByIndexedArgsArgs, 'events', 'eventByIndexedArgs'> {
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
  const { filter, args } = createEventFilter(variables);
  const queryV2 = gql`
    query EventByIndexedArgsQuery($moduleId: String!, $eventId: String! ${args}) {
      events(
        filter: { moduleId: { equalTo: $moduleId }, eventId: { equalTo: $eventId } ${filter} }
        first: 1
      ) {
        nodes {
          blockId
          eventIdx
          extrinsicIdx
          block {
            datetime
          }
        }
      }
    }
  `;

  return {
    v1: {
      query,
      variables,
    },
    v2: {
      request: { query: queryV2, variables },
      mapper: ({ events }) => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const { nodes } = events!;
        const event = nodes[0];
        if (!event) {
          return {
            eventByIndexedArgs: null,
          };
        }
        return {
          eventByIndexedArgs: mapEvent(event),
        };
      },
    },
  };
}

/**
 *  @hidden
 */
function mapEvent({ blockId, eventIdx, extrinsicIdx, block }: EventV2): DeepPartial<EventV1> {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const { datetime } = block!;
  return {
    /* eslint-disable @typescript-eslint/naming-convention */
    __typename: 'Event',
    block_id: +blockId,
    event_idx: eventIdx,
    extrinsic_idx: extrinsicIdx,
    block: { __typename: 'Block', datetime },
    /* eslint-enable @typescript-eslint/naming-convention */
  };
}

/**
 *  @hidden
 */
function createEventFilter(variables: QueryEventByIndexedArgsArgs): {
  filter: string;
  args: string;
} {
  let filter = '';
  let args = ' ';
  const { eventArg0, eventArg1, eventArg2 } = variables;
  if (eventArg0 !== undefined) {
    args += ', $eventArg0: String';
    filter += 'eventArg0: { equalTo: $eventArg0}\n';
  }
  if (eventArg1 !== undefined) {
    args += ', $eventArg1: String';
    filter += 'eventArg1: { equalTo: $eventArg1}\n';
  }
  if (eventArg2 !== undefined) {
    args += ', $eventArg1: String';
    filter += 'eventArg1: { equalTo: $eventArg1}\n';
  }
  return {
    filter,
    args,
  };
}

/**
 * @hidden
 *
 * Get all events by any of its indexed arguments
 */
export function eventsByIndexedArgs(
  variables: QueryEventsByIndexedArgsArgs
): MultiGraphqlQuery<QueryEventsByIndexedArgsArgs, 'events', 'eventsByIndexedArgs'> {
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
  const { filter, args } = createEventFilter(variables);
  const queryV2 = gql`
    query EventByIndexedArgsQuery($moduleId: String!, $eventId: String!, $count: Int, $skip: Int ${args}) {
      events(
        filter: { moduleId: { equalTo: $moduleId }, eventId: { equalTo: $eventId } ${filter} }
        first: $count
        offset: $skip
      ) {
        nodes {
          blockId
          eventIdx
          extrinsicIdx
          block {
            datetime
          }
        }
      }
    }
  `;

  return {
    v1: {
      query,
      variables,
    },
    v2: {
      request: { query: queryV2, variables },
      mapper: ({ events }) => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const { nodes } = events!;
        return {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          eventsByIndexedArgs: nodes.map(e => mapEvent(e!)),
        };
      },
    },
  };
}

/**
 * @hidden
 *
 * Get a transaction by hash
 */
export function transactionByHash(
  variables: QueryTransactionByHashArgs,
  context: Context
): MultiGraphqlQuery<QueryTransactionByHashArgs, 'extrinsics', 'transactionByHash'> {
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

  const queryV2 = gql`
    query TransactionByHashQuery($transactionHash: String!) {
      extrinsics(filter: { extrinsicHash: { equalTo: $transactionHash } }, first: 1) {
        nodes {
          blockId
          extrinsicIdx
          address
          nonce
          moduleId
          callId
          params
          success
          specVersionId
          extrinsicHash
        }
      }
    }
  `;

  return {
    v1: {
      query,
      variables,
    },
    v2: {
      request: { query: queryV2, variables },
      mapper: ({ extrinsics }) => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const { nodes } = extrinsics!;
        if (!nodes[0]) {
          return { transactionByHash: null };
        }
        return {
          transactionByHash: mapTransaction(nodes[0], context),
        };
      },
    },
  };
}

/**
 *  @hidden
 */
function mapTransaction(
  {
    blockId,
    extrinsicHash,
    address,
    nonce,
    moduleId,
    callId,
    params,
    success,
    specVersionId,
    extrinsicIdx,
  }: ExtrinsicV2,
  context: Context
): DeepPartial<ExtrinsicV1> {
  return {
    /* eslint-disable @typescript-eslint/naming-convention */
    __typename: 'Extrinsic',
    block_id: +blockId,
    extrinsic_hash: extrinsicHash,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    address: keyToAddress('0x' + address!, context),
    nonce,
    module_id: moduleId as ModuleIdEnum,
    call_id: callId as CallIdEnum,
    params,
    success,
    spec_version_id: specVersionId,
    extrinsic_idx: extrinsicIdx,
    /* eslint-enable @typescript-eslint/naming-convention */
  };
}

/**
 * @hidden
 *
 * Get the tickers of all the Assets for which the passed DID is a trusted claim issuer
 */
export function tokensByTrustedClaimIssuer(
  variables: QueryTokensByTrustedClaimIssuerArgs
): MultiGraphqlQuery<
  QueryTokensByTrustedClaimIssuerArgs,
  'trustedClaimIssuerTickers',
  'tokensByTrustedClaimIssuer'
> {
  const query = gql`
    query TokensByTrustedClaimIssuerQuery($claimIssuerDid: String!) {
      tokensByTrustedClaimIssuer(claimIssuerDid: $claimIssuerDid)
    }
  `;
  const queryV2 = gql`
    query TokensByTrustedClaimIssuerQuery($claimIssuerDid: String!) {
      trustedClaimIssuerTickers(filter: { issuer: { equalTo: $claimIssuerDid } }) {
        nodes {
          ticker
        }
      }
    }
  `;

  return {
    v1: {
      query,
      variables,
    },
    v2: {
      request: { query: queryV2, variables },
      mapper: ({ trustedClaimIssuerTickers }) => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const { nodes } = trustedClaimIssuerTickers!;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return { tokensByTrustedClaimIssuer: nodes.map(n => n!.ticker) };
      },
    },
  };
}

/**
 * @hidden
 *
 * Get all tickers of Assets that were held at some point by the given did
 */
export function tokensHeldByDid(
  variables: QueryTokensHeldByDidArgs
): MultiGraphqlQuery<
  QueryTokensHeldByDidArgs,
  'heldTokens',
  'tokensHeldByDid',
  Modify<QueryTokensHeldByDidArgs, { order: HeldTokensOrderBy }>
> {
  const query = gql`
    query TokensHeldByDidQuery($did: String!, $count: Int, $skip: Int, $order: Order) {
      tokensHeldByDid(did: $did, count: $count, skip: $skip, order: $order) {
        totalCount
        items
      }
    }
  `;
  const queryV2 = gql`
    query TokensHeldByDidQuery(
      $did: String!
      $count: Int
      $skip: Int
      $order: [HeldTokensOrderBy!]
    ) {
      heldTokens(
        first: $count
        offset: $skip
        orderBy: $order
        filter: { did: { equalTo: $did } }
      ) {
        totalCount
        nodes {
          token
        }
      }
    }
  `;

  return {
    v1: {
      query,
      variables,
    },
    v2: {
      mapper: ({ heldTokens }) => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const { totalCount, nodes } = heldTokens!;
        return {
          tokensHeldByDid: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            __typename: 'StringResult',
            totalCount,
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            items: nodes.map(node => node!.token),
          },
        };
      },
      request: {
        query: queryV2,
        variables: {
          ...variables,
          order:
            variables.order === Order.Desc
              ? HeldTokensOrderBy.TokenDesc
              : HeldTokensOrderBy.TokenAsc,
        },
      },
    },
  };
}

type QueryTransactionsArgsV2 = Modify<QueryTransactionsArgs, { orderBy: ExtrinsicsOrderBy[] }>;
/**
 * @hidden
 *
 * Get transactions
 */
export function transactions(
  context: Context,
  variables: QueryTransactionsArgs = {}
): MultiGraphqlQuery<QueryTransactionsArgs, 'extrinsics', 'transactions', QueryTransactionsArgsV2> {
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

  const { args, filter, variablesV2 } = createTransactionsFilter(variables, context);
  const queryV2 = gql`
    query TransactionsQuery($count: Int, $skip: Int, $orderBy: [ExtrinsicsOrderBy!]! ${args}) {
      extrinsics(first: $count, offset: $skip, orderBy: $orderBy ${filter}) {
        totalCount
        nodes {
          blockId
          extrinsicIdx
          address
          nonce
          moduleId
          callId
          params
          success
          specVersionId
          extrinsicHash
        }
      }
    }
  `;

  return {
    v1: {
      query,
      variables: variables,
    },
    v2: {
      request: { query: queryV2, variables: variablesV2 },
      mapper: ({ extrinsics }) => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const { nodes, totalCount } = extrinsics!;
        return {
          transactions: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            __typename: 'ExtrinsicResult',
            totalCount,
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            items: nodes.map(node => mapTransaction(node!, context)),
          },
        };
      },
    },
  };
}

/**
 * @hidden
 */
function createTransactionsFilter(
  variables: QueryTransactionsArgs,
  context: Context
): { filter: string; args: string; variablesV2: QueryTransactionsArgsV2 } {
  let filterString = '';
  let args = ' ';
  /* eslint-disable @typescript-eslint/naming-convention */
  const {
    success,
    address,
    block_id,
    module_id,
    call_id,
    orderBy,
    count = 25,
    ...rest
  } = variables;
  /* eslint-enable @typescript-eslint/naming-convention */
  if (success !== undefined) {
    args += ', $success: Boolean';
    filterString += 'success: { equalTo: $success}\n';
  }
  if (address !== undefined) {
    args += ', $address: String';
    filterString += 'address: { equalTo: $address}\n';
  }
  if (block_id !== undefined) {
    args += ', $block_id: String';
    filterString += 'blockId: { equalTo: $block_id}\n';
  }
  if (module_id !== undefined) {
    args += ', $module_id: String';
    filterString += 'moduleId: { equalTo: $module_id}\n';
  }
  if (call_id !== undefined) {
    args += ', $call_id: String';
    filterString += 'callId: { equalTo: $call_id}\n';
  }
  return {
    filter: filterString.length !== 0 ? `, filter:{${filterString}}` : '',
    args,
    variablesV2: {
      ...rest,
      count,
      /* eslint-disable @typescript-eslint/naming-convention */
      call_id,
      block_id,
      module_id,
      /* eslint-enable @typescript-eslint/naming-convention */
      address: address ? hexStripPrefix(addressToKey(address, context)) : address,
      success,
      orderBy: [mapTransactionOrderBy(orderBy || undefined)],
    },
  };
}

/**
 * @hidden
 */
function mapTransactionOrderBy(
  { field, order }: TransactionOrderByInput = {
    field: TransactionOrderFields.BlockId,
    order: Order.Asc,
  }
): ExtrinsicsOrderBy {
  const fieldOrderMap = {
    [TransactionOrderFields.Address]: {
      [Order.Asc]: ExtrinsicsOrderBy.AddressAsc,
      [Order.Desc]: ExtrinsicsOrderBy.AddressDesc,
    },
    [TransactionOrderFields.BlockId]: {
      [Order.Asc]: ExtrinsicsOrderBy.BlockIdAsc,
      [Order.Desc]: ExtrinsicsOrderBy.BlockIdDesc,
    },
    [TransactionOrderFields.CallId]: {
      [Order.Asc]: ExtrinsicsOrderBy.CallIdAsc,
      [Order.Desc]: ExtrinsicsOrderBy.CallIdDesc,
    },
    [TransactionOrderFields.ModuleId]: {
      [Order.Asc]: ExtrinsicsOrderBy.ModuleIdAsc,
      [Order.Desc]: ExtrinsicsOrderBy.ModuleIdDesc,
    },
  };
  return fieldOrderMap[field][order];
}

/**
 * @hidden
 *
 * Get the scopes (and ticker, if applicable) of claims issued on an Identity
 */
export function scopesByIdentity(
  variables: QueryScopesByIdentityArgs
): MultiGraphqlQuery<QueryScopesByIdentityArgs, 'claimScopes', 'scopesByIdentity'> {
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

  const queryV2 = gql`
    query ScopesByIdentityQuery($did: String!) {
      claimScopes(filter: { target: { equalTo: $did } }, first: 1) {
        nodes {
          scope
          ticker
        }
      }
    }
  `;

  return {
    v1: {
      query,
      variables,
    },
    v2: {
      request: { query: queryV2, variables },
      mapper: ({ claimScopes }) => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const { nodes } = claimScopes!;
        return {
          scopesByIdentity: nodes.map(node => ({
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            ...node!,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            __typename: 'ClaimScope',
          })),
        };
      },
    },
  };
}

/**
 * @hidden
 *
 * Get issuer dids with at least one claim for given target
 */
export function issuerDidsWithClaimsByTarget(
  variables: QueryIssuerDidsWithClaimsByTargetArgs
): MultiGraphqlQuery<
  QueryIssuerDidsWithClaimsByTargetArgs,
  'issuerIdentityWithClaims',
  'issuerDidsWithClaimsByTarget',
  // eslint-disable-next-line @typescript-eslint/naming-convention
  QueryDidsWithClaimsArgsV2 & { target: string; targetJSON: string }
> {
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
  const { filter, args, variablesV2, claimFilter } = createIdentityWithClaimsFilter(variables);
  const queryV2 = gql`
    query IssuerDidsWithClaimsByTargetQuery($targetJSON: JSON!, $target: String!, $count: Int, $skip: Int ${args}) {
      issuerIdentityWithClaims(
        filter: { targetIndex: { contains: $targetJSON } ${filter} }
        first: $count
        offset: $skip
        orderBy: [ID_ASC]
      ) {
        totalCount
        nodes {
          id
          claims(orderBy: [BLOCK_ID_ASC, EVENT_IDX_ASC], filter:{ targetId: { equalTo: $target } ${claimFilter}}) {
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
      }
    }
  `;

  return {
    v1: {
      query,
      variables,
    },
    v2: {
      request: {
        query: queryV2,
        variables: { ...variablesV2, target: variables.target, targetJSON: variables.target },
      },
      mapper: ({ issuerIdentityWithClaims }) => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const { nodes, totalCount } = issuerIdentityWithClaims!;
        return {
          issuerDidsWithClaimsByTarget: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            __typename: 'IdentityWithClaimsResult',
            totalCount,
            items: nodes.map(identityWithClaimsMapper),
          },
        };
      },
    },
  };
}

/**
 * @hidden
 *
 * Fetch the number of the latest block that has been processed by the middleware
 */
export function latestProcessedBlock(): MultiGraphqlQuery<undefined, 'blocks', 'latestBlock'> {
  const query = gql`
    query {
      latestBlock {
        id
      }
    }
  `;
  const queryV2 = gql`
    query {
      latestBlock {
        id
      }
    }
  `;

  return {
    v1: {
      query,
      variables: undefined,
    },
    v2: {
      request: { query: queryV2, variables: undefined },
      mapper: r => ({
        latestBlock: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          __typename: 'Block',
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          id: r.blocks!.nodes[0]!.blockId,
        },
      }),
    },
  };
}

/**
 * @hidden
 *
 * Middleware heartbeat
 */
export function heartbeat(): MultiGraphqlQuery<undefined, 'block', 'heartbeat'> {
  const query = gql`
    query {
      heartbeat
    }
  `;
  const queryV2 = gql`
    query {
      block(id: "1") {
        id
      }
    }
  `;

  return {
    v1: {
      query,
      variables: undefined,
    },
    v2: {
      request: { query: queryV2, variables: undefined },
      mapper: () => ({ heartbeat: true }),
    },
  };
}

/**
 * @hidden
 *
 * Get an added trusted claim issuer event by its indexed arguments
 */
export function eventByAddedTrustedClaimIssuer(
  variables: QueryEventByAddedTrustedClaimIssuerArgs
): MultiGraphqlQuery<
  QueryEventByAddedTrustedClaimIssuerArgs,
  'events',
  'eventByAddedTrustedClaimIssuer'
> {
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

  const queryV2 = gql`
    query EventByAddedTrustedClaimIssuerQuery($ticker: String!, $identityId: String!) {
      events(
        filter: {
          moduleId: { equalTo: "compliancemanager" }
          eventId: { equalTo: "TrustedDefaultClaimIssuerAdded" }
          eventArg1: { equalTo: $ticker }
          eventArg2: { includes: $identityId }
        }
        orderBy: [BLOCK_ID_DESC, EVENT_ID_DESC]
      ) {
        nodes {
          blockId
          eventIdx
          extrinsicIdx
          block {
            datetime
          }
        }
      }
    }
  `;

  return {
    v1: {
      query,
      variables,
    },
    v2: {
      request: {
        query: queryV2,
        variables: { ...variables, ticker: removeNullChars(variables.ticker) },
      },
      mapper: ({ events }) => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const { nodes } = events!;
        const node = nodes[0];
        if (!node) {
          return { eventByAddedTrustedClaimIssuer: null };
        }
        const { blockId, eventIdx, extrinsicIdx, block } = node;
        return {
          eventByAddedTrustedClaimIssuer: {
            /* eslint-disable @typescript-eslint/naming-convention */
            __typename: 'Event',
            block_id: +blockId,
            event_idx: eventIdx,
            extrinsic_idx: extrinsicIdx,
            block: {
              __typename: 'Block',
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              datetime: block!.datetime,
            },
            /* eslint-enable @typescript-eslint/naming-convention */
          },
        };
      },
    },
  };
}

/**
 * @hidden
 *
 * Get Settlements where a Portfolio is involved
 */
export function settlements(
  variables: QuerySettlementsArgs
): MultiGraphqlQuery<
  QuerySettlementsArgs,
  'settlements',
  'settlements',
  Modify<QuerySettlementsArgs, { portfolioNumber?: number; addressFilter: string[] }>
> {
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

  const queryV2 = gql`
    query SettlementsQuery(
      $identityId: String!
      $portfolioNumber: Int
      $addressFilter: JSON!
      $tickerFilter: String
      $count: Int
      $skip: Int
    ) {
      settlements(
        first: $count
        offset: $skip
        filter: {
          and: [
            {
              or: [
                {
                  legs: {
                    contains: [
                      { to: { did: $identityId, number: $portfolioNumber }, ticker: $tickerFilter }
                    ]
                  }
                }
                {
                  legs: {
                    contains: [
                      {
                        from: { did: $identityId, number: $portfolioNumber }
                        ticker: $tickerFilter
                      }
                    ]
                  }
                }
              ]
            }
            { addresses: { contains: $addressFilter } }
          ]
        }
      ) {
        totalCount
        nodes {
          addresses
          result
          blockId
          legs
        }
      }
    }
  `;

  // Null is not the same as undefined for subquery filters.
  // We also want the actual number in subquery, not a string
  const portfolioNumber = variables.portfolioNumber
    ? parseInt(variables.portfolioNumber)
    : undefined;

  return {
    v1: {
      query,
      variables,
    },
    v2: {
      request: {
        query: queryV2,
        variables: {
          ...variables,
          portfolioNumber,
          // The address filter arg is an array in subquery.
          addressFilter: variables.addressFilter ? [variables.addressFilter] : [],
        },
      },
      mapper: ({ settlements: result }) => {
        return {
          settlements: {
            /* eslint-disable @typescript-eslint/naming-convention */
            __typename: 'SettlementResult',
            totalCount: result?.totalCount,
            items: (result?.nodes as V2Settlement[]).map(n => ({
              __typename: 'Settlement',
              block_id: +n.blockId,
              result: n.result,
              addresses: n.addresses.map(hexStripPrefix),
              legs: n.legs.map(({ from, to, ...leg }) => ({
                __typename: 'SettlementLeg',
                ...leg,
                from: {
                  __typename: 'Portfolio',
                  did: from.did,
                  kind: portfolioToKind(from),
                },
                to: {
                  __typename: 'Portfolio',
                  did: to.did,
                  kind: portfolioToKind(to),
                },
                direction:
                  from.did === variables.identityId &&
                  // If this was !portfolioNumber, it could be 0,
                  // but since variables.portfolioNumber is a string, this is fine.
                  (!variables.portfolioNumber || portfolioNumber === from.number)
                    ? SettlementDirectionEnum.Outgoing
                    : SettlementDirectionEnum.Incoming,
              })),
            })),
            /* eslint-enable @typescript-eslint/naming-convention */
          },
        };
      },
    },
  };
}
/**
 * @hidden
 */
function portfolioToKind({ number }: V2Portfolio) {
  return number === 0 ? 'Default' : number.toString();
}

/**
 * @hidden
 *
 * Get all investments for a given offering
 */
export function investments(
  variables: QueryInvestmentsArgs
): MultiGraphqlQuery<QueryInvestmentsArgs, 'investments', 'investments'> {
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

  const queryV2 = gql`
    query InvestmentsQuery($stoId: Int!, $ticker: String!, $count: Int, $skip: Int) {
      investments(
        first: $count
        offset: $skip
        filter: { stoId: { equalTo: $stoId }, offeringToken: { equalTo: $ticker } }
      ) {
        totalCount
        nodes {
          investor
          offeringTokenAmount
          raiseTokenAmount
        }
      }
    }
  `;

  return {
    v1: {
      query,
      variables,
    },
    v2: {
      request: { query: queryV2, variables },
      mapper: a => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const { totalCount, nodes: items } = a.investments!;

        return {
          investments: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            __typename: 'InvestmentResult',
            totalCount,
            items,
          },
        };
      },
    },
  };
}

/**
 * @hidden
 *
 * Get current amount of withheld tax for a distribution
 */
export function getWithholdingTaxesOfCa(
  variables: QueryGetWithholdingTaxesOfCaArgs
): MultiGraphqlQuery<
  QueryGetWithholdingTaxesOfCaArgs,
  'withholdingTaxesOfCas',
  'getWithholdingTaxesOfCA',
  Modify<QueryGetWithholdingTaxesOfCaArgs, { ticker: string; localId: number }>
> {
  const query = gql`
    query GetWithholdingTaxesOfCAQuery($CAId: CAId!, $fromDate: DateTime, $toDate: DateTime) {
      getWithholdingTaxesOfCA(CAId: $CAId, fromDate: $fromDate, toDate: $toDate) {
        taxes
      }
    }
  `;
  const queryV2 = gql`
    query GetWithholdingTaxesOfCAQuery(
      $ticker: String!
      $localId: Int!
      $fromDate: Datetime
      $toDate: Datetime
    ) {
      withholdingTaxesOfCas(
        filter: {
          ticker: { equalTo: $ticker }
          localId: { equalTo: $localId }
          datetime: { lessThan: $toDate, greaterThan: $fromDate, notEqualTo: "1997-10-06T12:35:04" }
        }
      ) {
        nodes {
          taxes
        }
      }
    }
  `;

  const {
    CAId: { localId, ticker },
  } = variables;
  return {
    v1: {
      query,
      variables,
    },
    v2: {
      request: { query: queryV2, variables: { ...variables, ticker, localId } },
      mapper: ({ withholdingTaxesOfCas }) => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const { nodes } = withholdingTaxesOfCas!;
        const node = nodes[0];
        if (!node) {
          return {
            getWithholdingTaxesOfCA: null,
          };
        }
        const { taxes } = node;

        return {
          getWithholdingTaxesOfCA: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            __typename: 'WithholdingTaxesOfCA',
            taxes,
          },
        };
      },
    },
  };
}

/**
 * @hidden
 *
 * Get history of claims for a distribution
 */
export function getHistoryOfPaymentEventsForCa(
  variables: QueryGetHistoryOfPaymentEventsForCaArgs
): MultiGraphqlQuery<
  QueryGetHistoryOfPaymentEventsForCaArgs,
  'historyOfPaymentEventsForCas',
  'getHistoryOfPaymentEventsForCA',
  Modify<QueryGetHistoryOfPaymentEventsForCaArgs, { ticker: string; localId: number }>
> {
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

  const queryV2 = gql`
    query GetHistoryOfPaymentEventsForCAQuery(
      $ticker: String!
      $localId: Int!
      $fromDate: Datetime
      $toDate: Datetime
      $count: Int
      $skip: Int
    ) {
      historyOfPaymentEventsForCas(
        filter: {
          ticker: { equalTo: $ticker }
          localId: { equalTo: $localId }
          datetime: { lessThan: $toDate, greaterThan: $fromDate, notEqualTo: "1997-10-06T12:35:04" }
        }
        first: $count
        offset: $skip
      ) {
        totalCount
        nodes {
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

  const {
    CAId: { localId, ticker },
  } = variables;
  return {
    v1: {
      query,
      variables,
    },
    v2: {
      request: { query: queryV2, variables: { ...variables, localId, ticker } },
      mapper: ({ historyOfPaymentEventsForCas }) => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const { nodes, totalCount } = historyOfPaymentEventsForCas!;
        return {
          getHistoryOfPaymentEventsForCA: {
            /* eslint-disable @typescript-eslint/naming-convention */
            __typename: 'HistoryOfPaymentEventsForCAResults',
            totalCount,
            items: nodes.map(node => {
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              const { blockId, ...rest } = node!;
              return { block_id: +blockId, ...rest, __typename: 'HistoryOfPaymentEventsForCA' };
            }),
            /* eslint-enable @typescript-eslint/naming-convention */
          },
        };
      },
    },
  };
}

/**
 * @hidden
 *
 * Get the transaction history of each external agent of an Asset
 */
export function tickerExternalAgentHistory(
  variables: QueryTickerExternalAgentHistoryArgs
): MultiGraphqlQuery<
  QueryTickerExternalAgentHistoryArgs,
  'tickerExternalAgentHistories',
  'tickerExternalAgentHistory'
> {
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

  const queryV2 = gql`
    query TickerExternalAgentHistoryQuery($ticker: String!) {
      tickerExternalAgentHistories(filter: { ticker: { equalTo: $ticker } }) {
        nodes {
          did
          datetime
          type
          datetime
          blockId
          eventIdx
        }
      }
    }
  `;

  return {
    v1: {
      query,
      variables,
    },
    v2: {
      request: { query: queryV2, variables },
      mapper: ({ tickerExternalAgentHistories }) => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const { nodes } = tickerExternalAgentHistories!;
        // eslint-disable-next-line @typescript-eslint/naming-convention
        const byDid = new Map<string, (AgentHistoryEvent & { __typename: string })[]>();

        for (const node of nodes) {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          const { did, datetime, blockId, eventIdx, type } = node!;
          const events = byDid.get(did) || [];
          // eslint-disable-next-line @typescript-eslint/naming-convention
          events.push({ datetime, block_id: +blockId, event_idx: eventIdx, __typename: type });
          byDid.set(did, events);
        }

        return {
          tickerExternalAgentHistory: [...byDid.entries()].map(([did, history]) => ({
            // eslint-disable-next-line @typescript-eslint/naming-convention
            __typename: 'AgentHistory',
            did,
            history,
          })),
        };
      },
    },
  };
}

type QueryTickerExternalAgentActionsArgsV2 = Modify<
  QueryTickerExternalAgentActionsArgs,
  { order: TickerExternalAgentActionsOrderBy[] }
>;
/**
 * @hidden
 *
 * Get list of Events triggered by actions (from the set of actions that can only be performed by external agents) that have been performed on a specific Asset
 */
export function tickerExternalAgentActions(
  variables: QueryTickerExternalAgentActionsArgs
): MultiGraphqlQuery<
  QueryTickerExternalAgentActionsArgs,
  'tickerExternalAgentActions',
  'tickerExternalAgentActions',
  QueryTickerExternalAgentActionsArgsV2
> {
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
  const { args, filter, variablesV2 } = createTickerExternalAgentActionsFilter(variables);
  const queryV2 = gql`
    query TickerExternalAgentActionsQuery(
      $ticker: String!
      $count: Int
      $skip: Int
      $order: [TickerExternalAgentActionsOrderBy!]!
      ${args}
    ) {
      tickerExternalAgentActions(
        filter: {
          ticker: { equalTo: $ticker }
          ${filter}
        }
        first: $count
        offset: $skip
        orderBy: $order
      ) {
        totalCount
        nodes {
          datetime
          blockId
          eventIdx
          palletName
          eventId
          callerDid
        }
      }
    }
  `;

  return {
    v1: {
      query,
      variables,
    },
    v2: {
      request: { query: queryV2, variables: variablesV2 },
      mapper: ({ tickerExternalAgentActions: result }) => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const { nodes, totalCount } = result!;
        return {
          tickerExternalAgentActions: {
            /* eslint-disable @typescript-eslint/naming-convention */
            __typename: 'TickerExternalAgentActionsResult',
            totalCount,
            items: nodes.map((node): DeepPartial<TickerExternalAgentAction> => {
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              const { blockId, datetime, eventIdx, palletName, eventId, callerDid } = node!;
              return {
                __typename: 'TickerExternalAgentAction',
                block_id: +blockId,
                datetime,
                event_idx: eventIdx,
                pallet_name: palletName as ModuleIdEnum,
                event_id: eventId as EventIdEnum,
                caller_did: callerDid,
              };
            }),
            /* eslint-enable @typescript-eslint/naming-convention */
          },
        };
      },
    },
  };
}

/**
 * @hidden
 */
function createTickerExternalAgentActionsFilter(variables: QueryTickerExternalAgentActionsArgs): {
  filter: string;
  args: string;
  variablesV2: QueryTickerExternalAgentActionsArgsV2;
} {
  let filter = '';
  let args = ' ';
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { caller_did, pallet_name, event_id, max_block, order, ...rest } = variables;
  if (caller_did) {
    args += ', $caller_did: String!';
    filter += 'callerDid: { equalTo: $caller_did}\n';
  }
  if (pallet_name) {
    args += ', $pallet_name: String!';
    filter += 'palletName: { equalTo: $pallet_name}\n';
  }
  if (event_id) {
    args += ', $event_id: String!';
    filter += 'eventId: { equalTo: $event_id}\n';
  }
  if (max_block) {
    args += ', $max_block: Int!';
    filter += 'blockId: { lessThanOrEqualTo: $max_block}\n';
  }

  return {
    filter,
    args,
    variablesV2: {
      ...rest,
      /* eslint-disable @typescript-eslint/naming-convention */
      caller_did,
      pallet_name,
      event_id,
      /* eslint-enable @typescript-eslint/naming-convention */
      order:
        order === Order.Asc
          ? [
              TickerExternalAgentActionsOrderBy.BlockIdAsc,
              TickerExternalAgentActionsOrderBy.EventIdxAsc,
            ]
          : [
              TickerExternalAgentActionsOrderBy.BlockIdDesc,
              TickerExternalAgentActionsOrderBy.EventIdxDesc,
            ],
    },
  };
}
