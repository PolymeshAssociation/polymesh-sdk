import { DocumentNode, QueryOptions } from '@apollo/client/core';
import BigNumber from 'bignumber.js';
import gql from 'graphql-tag';

import {
  Asset,
  AssetHolder,
  AssetHoldersOrderBy,
  AssetTransaction,
  AssetTransactionsOrderBy,
  Authorization,
  AuthorizationsOrderBy,
  BlocksOrderBy,
  ClaimsGroupBy,
  ClaimsOrderBy,
  ClaimTypeEnum,
  Distribution,
  DistributionPayment,
  Event,
  EventsOrderBy,
  Extrinsic,
  ExtrinsicsOrderBy,
  Instruction,
  InstructionsOrderBy,
  Investment,
  InvestmentsOrderBy,
  Leg,
  LegsOrderBy,
  MultiSigProposal,
  MultiSigProposalVote,
  MultiSigProposalVotesOrderBy,
  NftHolder,
  NftHoldersOrderBy,
  PolyxTransactionsOrderBy,
  Portfolio,
  PortfolioMovement,
  PortfolioMovementsOrderBy,
  SubqueryVersionsOrderBy,
  TickerExternalAgent,
  TickerExternalAgentAction,
  TickerExternalAgentActionsOrderBy,
  TickerExternalAgentHistoriesOrderBy,
  TickerExternalAgentHistory,
  TickerExternalAgentsOrderBy,
  TrustedClaimIssuer,
  TrustedClaimIssuersOrderBy,
} from '~/middleware/types';
import { PaginatedQueryArgs, QueryArgs } from '~/types/utils';

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
    variables: undefined,
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
    variables: undefined,
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
    variables: undefined,
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
      subqueryVersions(orderBy: [${SubqueryVersionsOrderBy.CreatedAtDesc}], first: 1) {
        nodes {
          id
          version
          createdAt
        }
      }
    }
  `;

  return {
    query,
    variables: undefined,
  };
}

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
  groupBy = ClaimsGroupBy.TargetId
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
    variables,
  };
}

/**
 * @hidden
 *
 * Get all claims that a given target DID has, with a given scope and from one of the given trustedClaimIssuers
 */
export function claimsQuery(
  filters: ClaimsQueryFilter,
  size?: BigNumber,
  start?: BigNumber
): QueryOptions<PaginatedQueryArgs<ClaimsQueryFilter>> {
  const { args, filter } = createClaimsFilters(filters);

  const query = gql`
    query ClaimsQuery
      ${args}
      {
        claims(
          ${filter}
          orderBy: [${ClaimsOrderBy.TargetIdAsc}, ${ClaimsOrderBy.CreatedAtAsc}, ${ClaimsOrderBy.CreatedBlockIdAsc}, ${ClaimsOrderBy.EventIdxAsc}]
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
    variables: {
      ...filters,
      expiryTimestamp: filters.includeExpired ? undefined : new Date().getTime(),
      size: size?.toNumber(),
      start: start?.toNumber(),
    },
  };
}

/**
 * @hidden
 *
 * Get all investments for a given offering
 */
export function investmentsQuery(
  filters: QueryArgs<Investment, 'stoId' | 'offeringToken'>,
  size?: BigNumber,
  start?: BigNumber
): QueryOptions<PaginatedQueryArgs<QueryArgs<Investment, 'stoId' | 'offeringToken'>>> {
  const query = gql`
    query InvestmentsQuery($stoId: Int!, $offeringToken: String!, $size: Int, $start: Int) {
      investments(
        filter: { stoId: { equalTo: $stoId }, offeringToken: { equalTo: $offeringToken } }
        first: $size
        offset: $start
        orderBy: [${InvestmentsOrderBy.CreatedAtAsc}, ${InvestmentsOrderBy.CreatedBlockIdAsc}]
      ) {
        totalCount
        nodes {
          investorId
          offeringToken
          raiseToken
          offeringTokenAmount
          raiseTokenAmount
        }
      }
    }
  `;

  return {
    query,
    variables: { ...filters, size: size?.toNumber(), start: start?.toNumber() },
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
function createArgsAndFilters(
  filters: Record<string, unknown>,
  typeMap: Record<string, string>
): {
  args: string;
  filter: string;
} {
  const args: string[] = ['$start: Int', '$size: Int'];
  const gqlFilters: string[] = [];

  Object.keys(filters).forEach(attribute => {
    if (filters[attribute]) {
      const type = typeMap[attribute] || 'String';
      args.push(`$${attribute}: ${type}!`);
      gqlFilters.push(`${attribute}: { equalTo: $${attribute} }`);
    }
  });

  return {
    args: `(${args.join()})`,
    filter: gqlFilters.length ? `filter: { ${gqlFilters.join()} }` : '',
  };
}

type InstructionArgs = 'id' | 'eventId' | 'venueId' | 'status';

/**
 * @hidden
 *
 * Get a specific instruction within a venue for a specific event
 */
export function instructionsQuery(
  filters: QueryArgs<Instruction, InstructionArgs>,
  size?: BigNumber,
  start?: BigNumber
): QueryOptions<PaginatedQueryArgs<QueryArgs<Instruction, InstructionArgs>>> {
  const { args, filter } = createArgsAndFilters(filters, {
    eventId: 'EventIdEnum',
    status: 'InstructionStatusEnum',
  });
  const query = gql`
    query InstructionsQuery
      ${args}
      {
      instructions(
        ${filter}
        first: $size
        offset: $start
        orderBy: [${InstructionsOrderBy.CreatedAtDesc}, ${InstructionsOrderBy.IdDesc}]
      ) {
        totalCount
        nodes {
          id
          eventIdx
          eventId
          status
          settlementType
          venueId
          endBlock
          tradeDate
          valueDate
          legs {
            nodes {
              fromId
              from {
                identityId
                number
              }
              toId
              to {
                identityId
                number
              }
              assetId
              amount
              addresses
            }
          }
          memo
          createdBlock {
            blockId
            hash
            datetime
          }
          updatedBlock {
            blockId
            hash
            datetime
          }
        }
      }
    }
  `;

  return {
    query,
    variables: { ...filters, size: size?.toNumber(), start: start?.toNumber() },
  };
}

/**
 * @hidden
 *
 * Get Instructions where an identity is involved
 */
export function instructionsByDidQuery(
  identityId: string
): QueryOptions<QueryArgs<Leg, 'fromId' | 'toId'>> {
  const query = gql`
    query InstructionsByDidQuery($fromId: String!, $toId: String!)
     {
      legs(
        filter: { or: [{ fromId: { startsWith: $fromId } }, { toId: { startsWith: $toId } }] }
        orderBy: [${LegsOrderBy.CreatedAtAsc}, ${LegsOrderBy.InstructionIdAsc}]
      ) {
        nodes {
          instruction {
            id
            eventIdx
            eventId
            status
            settlementType
            venueId
            endBlock
            tradeDate
            valueDate
            legs {
              nodes {
                fromId
                from {
                  identityId
                  number
                }
                toId
                to {
                  identityId
                  number
                }
                assetId
                amount
                addresses
              }
            }
            memo
            createdBlock {
              blockId
              hash
              datetime
            }
            updatedBlock {
              blockId
              hash
              datetime
            }
          }
        }
      }
    }
  `;

  return {
    query,
    variables: { fromId: `${identityId}/`, toId: `${identityId}/` },
  };
}

type EventArgs = 'moduleId' | 'eventId' | 'eventArg0' | 'eventArg1' | 'eventArg2';

/**
 * @hidden
 *
 * Get a single event by any of its indexed arguments
 */
export function eventsByArgs(
  filters: QueryArgs<Event, EventArgs>,
  size?: BigNumber,
  start?: BigNumber
): QueryOptions<PaginatedQueryArgs<QueryArgs<Event, EventArgs>>> {
  const { args, filter } = createArgsAndFilters(filters, {
    moduleId: 'ModuleIdEnum',
    eventId: 'EventIdEnum',
  });
  const query = gql`
    query EventsQuery
      ${args}
     {
      events(
        ${filter}
        orderBy: [${EventsOrderBy.CreatedAtAsc}, ${EventsOrderBy.BlockIdAsc}]
        first: $size
        offset: $start
      ) {
        nodes {
          eventIdx
          block {
            blockId
            hash
            datetime
          }
        }
      }
    }
  `;

  return {
    query,
    variables: { ...filters, size: size?.toNumber(), start: start?.toNumber() },
  };
}

/**
 * @hidden
 *
 * Get a transaction by hash
 */
export function extrinsicByHash(
  variables: QueryArgs<Extrinsic, 'extrinsicHash'>
): QueryOptions<QueryArgs<Extrinsic, 'extrinsicHash'>> {
  const query = gql`
    query TransactionByHashQuery($extrinsicHash: String!) {
      extrinsics(filter: { extrinsicHash: { equalTo: $extrinsicHash } }) {
        nodes {
          extrinsicIdx
          address
          nonce
          moduleId
          callId
          paramsTxt
          success
          specVersionId
          extrinsicHash
          block {
            blockId
            hash
            datetime
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

type ExtrinsicArgs = 'blockId' | 'address' | 'moduleId' | 'callId' | 'success';

/**
 * @hidden
 *
 * Get transactions
 */
export function extrinsicsByArgs(
  filters: QueryArgs<Extrinsic, ExtrinsicArgs>,
  size?: BigNumber,
  start?: BigNumber,
  orderBy: ExtrinsicsOrderBy = ExtrinsicsOrderBy.BlockIdAsc
): QueryOptions<PaginatedQueryArgs<QueryArgs<Extrinsic, ExtrinsicArgs>>> {
  const { args, filter } = createArgsAndFilters(filters, {
    moduleId: 'ModuleIdEnum',
    callId: 'CallIdEnum',
    success: 'Int',
  });
  const query = gql`
    query TransactionsQuery
      ${args}
     {
      extrinsics(
        ${filter}
        orderBy: [${orderBy}]
        first: $size
        offset: $start
      ) {
        totalCount
        nodes {
          blockId
          extrinsicIdx
          address
          nonce
          moduleId
          callId
          paramsTxt
          success
          specVersionId
          extrinsicHash
          block {
            hash
            datetime
          }
        }
      }
    }
  `;

  return {
    query,
    variables: { ...filters, size: size?.toNumber(), start: start?.toNumber() },
  };
}

/**
 * @hidden
 *
 * Get an trusted claim issuer event for an asset and an issuer
 */
export function trustedClaimIssuerQuery(
  variables: QueryArgs<TrustedClaimIssuer, 'issuer' | 'assetId'>
): QueryOptions<QueryArgs<TrustedClaimIssuer, 'issuer' | 'assetId'>> {
  const query = gql`
    query TrustedClaimIssuerQuery($assetId: String!, $issuer: String!) {
      trustedClaimIssuers(
        filter: { assetId: { equalTo: $assetId }, issuer: { equalTo: $issuer } },
        orderBy: [${TrustedClaimIssuersOrderBy.CreatedAtDesc}, ${TrustedClaimIssuersOrderBy.CreatedBlockIdDesc}]
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
          assetId
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
 * Get portfolio details for a given DID and portfolio number
 */
export function portfolioQuery(
  variables: QueryArgs<Portfolio, 'identityId' | 'number'>
): QueryOptions<QueryArgs<Portfolio, 'identityId' | 'number'>> {
  const query = gql`
    query PortfolioQuery($identityId: String!, $number: Int!) {
      portfolios(filter: { identityId: { equalTo: $identityId }, number: { equalTo: $number } }) {
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
 * Get Asset details for a given ticker
 */
export function assetQuery(
  variables: QueryArgs<Asset, 'ticker'>
): QueryOptions<QueryArgs<Asset, 'ticker'>> {
  const query = gql`
    query AssetQuery($ticker: String!) {
      assets(filter: { ticker: { equalTo: $ticker } }) {
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
 * Get the event details when external agent added for a ticker
 */
export function tickerExternalAgentsQuery(
  variables: QueryArgs<TickerExternalAgent, 'assetId'>
): QueryOptions<QueryArgs<TickerExternalAgent, 'assetId'>> {
  const query = gql`
    query TickerExternalAgentQuery($assetId: String!) {
      tickerExternalAgents(
        filter: { assetId: { equalTo: $assetId } }
        orderBy: [${TickerExternalAgentsOrderBy.CreatedAtDesc}, ${TickerExternalAgentsOrderBy.CreatedBlockIdDesc}]
        first: 1
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
 * Get the transaction history of each external agent of an Asset
 */
export function tickerExternalAgentHistoryQuery(
  variables: QueryArgs<TickerExternalAgentHistory, 'assetId'>
): QueryOptions<QueryArgs<TickerExternalAgentHistory, 'assetId'>> {
  const query = gql`
    query TickerExternalAgentHistoryQuery($assetId: String!) {
      tickerExternalAgentHistories(
        filter: { assetId: { equalTo: $assetId } }
        orderBy: [${TickerExternalAgentHistoriesOrderBy.CreatedAtAsc}, ${TickerExternalAgentHistoriesOrderBy.CreatedBlockIdAsc}]
      ) {
        nodes {
          identityId
          assetId
          eventIdx
          createdBlock {
            blockId
            hash
            datetime
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

type TickerExternalAgentActionArgs = 'assetId' | 'callerId' | 'palletName' | 'eventId';

/**
 * @hidden
 *
 * Get list of Events triggered by actions (from the set of actions that can only be performed by external agents) that have been performed on a specific Asset
 */
export function tickerExternalAgentActionsQuery(
  filters: QueryArgs<TickerExternalAgentAction, TickerExternalAgentActionArgs>,
  size?: BigNumber,
  start?: BigNumber
): QueryOptions<
  PaginatedQueryArgs<QueryArgs<TickerExternalAgentAction, TickerExternalAgentActionArgs>>
> {
  const { args, filter } = createArgsAndFilters(filters, { eventId: 'EventIdEnum' });
  const query = gql`
    query TickerExternalAgentActionsQuery
      ${args}
     {
      tickerExternalAgentActions(
        ${filter}
        first: $size
        offset: $start
        orderBy: [${TickerExternalAgentActionsOrderBy.CreatedAtDesc}, ${TickerExternalAgentActionsOrderBy.CreatedBlockIdDesc}]
      ) {
        totalCount
        nodes {
          eventIdx
          palletName
          eventId
          callerId
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
    variables: { ...filters, size: size?.toNumber(), start: start?.toNumber() },
  };
}

/**
 * @hidden
 *
 * Get distribution details for a CAId
 */
export function distributionQuery(
  variables: QueryArgs<Distribution, 'assetId' | 'localId'>
): QueryOptions<QueryArgs<Distribution, 'assetId' | 'localId'>> {
  const query = gql`
    query DistributionQuery($assetId: String!, $localId: Int!) {
      distributions(filter: { assetId: { equalTo: $assetId }, localId: { equalTo: $localId } }) {
        nodes {
          taxes
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
 * Get history of claims for a distribution
 */
export function distributionPaymentsQuery(
  filters: QueryArgs<DistributionPayment, 'distributionId'>,
  size?: BigNumber,
  start?: BigNumber
): QueryOptions<PaginatedQueryArgs<QueryArgs<DistributionPayment, 'distributionId'>>> {
  const query = gql`
    query DistributionPaymentQuery($distributionId: String!, $size: Int, $start: Int) {
      distributionPayments(
        filter: { distributionId: { equalTo: $distributionId } }
        first: $size
        offset: $start
      ) {
        totalCount
        nodes {
          eventId
          targetId
          datetime
          amount
          tax
          createdBlock {
            blockId
            hash
          }
        }
      }
    }
  `;

  return {
    query,
    variables: { ...filters, size: size?.toNumber(), start: start?.toNumber() },
  };
}

/**
 * @hidden
 *
 * Get asset held by a DID
 */
export function assetHoldersQuery(
  filters: QueryArgs<AssetHolder, 'identityId'>,
  size?: BigNumber,
  start?: BigNumber,
  orderBy = AssetHoldersOrderBy.AssetIdAsc
): QueryOptions<PaginatedQueryArgs<QueryArgs<DistributionPayment, 'distributionId'>>> {
  const query = gql`
    query AssetHoldersQuery($identityId: String!, $size: Int, $start: Int) {
      assetHolders(
        filter: { identityId: { equalTo: $identityId } }
        first: $size
        offset: $start
        orderBy: [${orderBy}]
      ) {
        totalCount
        nodes {
          assetId
        }
      }
    }
  `;

  return {
    query,
    variables: { ...filters, size: size?.toNumber(), start: start?.toNumber() },
  };
}

/**
 * @hidden
 *
 * Get NFTs held by a DID
 */
export function nftHoldersQuery(
  filters: QueryArgs<NftHolder, 'identityId'>,
  size?: BigNumber,
  start?: BigNumber,
  orderBy = NftHoldersOrderBy.AssetIdAsc
): QueryOptions<PaginatedQueryArgs<QueryArgs<NftHolder, 'identityId'>>> {
  const query = gql`
    query NftHolderQuery($identityId: String!, $size: Int, $start: Int) {
      nftHolders(
        filter: { identityId: { equalTo: $identityId } }
        first: $size
        offset: $start
        orderBy: [${orderBy}]
      ) {
        totalCount
        nodes {
          assetId
          nftIds
        }
      }
    }
  `;

  return {
    query,
    variables: { ...filters, size: size?.toNumber(), start: start?.toNumber() },
  };
}

export interface QuerySettlementFilters {
  identityId: string;
  portfolioId?: BigNumber;
  ticker?: string;
  address?: string;
}

type LegArgs = 'fromId' | 'toId' | 'assetId' | 'addresses';

/**
 *  @hidden
 */
function createLegFilters(
  { identityId, portfolioId, ticker, address }: QuerySettlementFilters,
  queryAll?: boolean
): {
  args: string;
  filter: string;
  variables: QueryArgs<Leg, LegArgs>;
} {
  const args: string[] = ['$fromId: String!, $toId: String!'];
  const fromIdFilters = queryAll
    ? ['fromId: { startsWith: $fromId }']
    : ['fromId: { equalTo: $fromId }'];
  const toIdFilters = queryAll ? ['toId: { startsWith: $toId }'] : ['toId: { equalTo: $toId }'];
  const portfolioNumber = portfolioId ? portfolioId.toNumber() : 0;
  const variables: QueryArgs<Leg, LegArgs> = {
    fromId: queryAll ? `${identityId}` : `${identityId}/${portfolioNumber}`,
    toId: queryAll ? `${identityId}` : `${identityId}/${portfolioNumber}`,
  };

  if (ticker) {
    variables.assetId = ticker;
    args.push('$assetId: String!');
    const assetIdFilter = 'assetId: { equalTo: $assetId }';
    toIdFilters.push(assetIdFilter);
    fromIdFilters.push(assetIdFilter);
  }

  if (address) {
    variables.addresses = [address];
    args.push('$addresses: [String!]!');
    const addressFilter = 'addresses: { in: $addresses }';
    toIdFilters.push(addressFilter);
    fromIdFilters.push(addressFilter);
  }

  return {
    args: `(${args.join()})`,
    filter: `filter: { or: [{ ${fromIdFilters.join()}, settlementId: { isNull: false } }, { ${toIdFilters.join()}, settlementId: { isNull: false } } ] }`,
    variables,
  };
}

/**
 *  @hidden
 */
function buildSettlementsQuery(args: string, filter: string): DocumentNode {
  return gql`
  query SettlementsQuery
    ${args}
   {
    legs(
      ${filter}
      orderBy: [${LegsOrderBy.CreatedAtAsc}, ${LegsOrderBy.InstructionIdAsc}]
    ) {
      nodes {
        settlement {
          id
          createdBlock {
            blockId
            datetime
            hash
          }
          result
          legs {
            nodes {
              fromId
              from {
                identityId
                number
              }
              toId
              to {
                identityId
                number
              }
              assetId
              amount
              addresses
            }
          }
        }
      }
    }
  }
`;
}

/**
 * @hidden
 *
 * Get Settlements where a Portfolio is involved
 */
export function settlementsQuery(
  filters: QuerySettlementFilters
): QueryOptions<QueryArgs<Leg, 'fromId' | 'toId' | 'assetId' | 'addresses'>> {
  const { args, filter, variables } = createLegFilters(filters);
  const query = buildSettlementsQuery(args, filter);

  return {
    query,
    variables,
  };
}

/**
 * @hidden
 *
 * Get Settlements for all Portfolios
 */
export function settlementsForAllPortfoliosQuery(
  filters: Omit<QuerySettlementFilters, 'portfolioId'>
): QueryOptions<QueryArgs<Leg, 'fromId' | 'toId' | 'assetId' | 'addresses'>> {
  const { args, filter, variables } = createLegFilters(filters, true);
  const query = buildSettlementsQuery(args, filter);

  return {
    query,
    variables,
  };
}

type PortfolioMovementArgs = 'fromId' | 'toId' | 'assetId' | 'address';

/**
 *  @hidden
 */
function createPortfolioMovementFilters(
  { identityId, portfolioId, ticker, address }: QuerySettlementFilters,
  queryAll?: boolean
): {
  args: string;
  filter: string;
  variables: QueryArgs<PortfolioMovement, PortfolioMovementArgs>;
} {
  const args: string[] = ['$fromId: String!, $toId: String!'];
  const fromIdFilters = queryAll
    ? ['fromId: { startsWith: $fromId }']
    : ['fromId: { equalTo: $fromId }'];
  const toIdFilters = queryAll ? ['toId: { startsWith: $toId }'] : ['toId: { equalTo: $toId }'];
  const portfolioNumber = portfolioId ? portfolioId.toNumber() : 0;
  const variables: QueryArgs<PortfolioMovement, PortfolioMovementArgs> = {
    fromId: queryAll ? `${identityId}` : `${identityId}/${portfolioNumber}`,
    toId: queryAll ? `${identityId}` : `${identityId}/${portfolioNumber}`,
  };

  if (ticker) {
    variables.assetId = ticker;
    args.push('$assetId: String!');
    const assetIdFilter = 'assetId: { equalTo: $assetId }';
    toIdFilters.push(assetIdFilter);
    fromIdFilters.push(assetIdFilter);
  }

  if (address) {
    variables.address = address;
    args.push('$address: String!');
    const addressFilter = 'address: { equalTo: $address }';
    toIdFilters.push(addressFilter);
    fromIdFilters.push(addressFilter);
  }

  return {
    args: `(${args.join()})`,
    filter: `filter: { or: [ { ${fromIdFilters.join()} }, { ${toIdFilters.join()} } ] }`,
    variables,
  };
}

/**
 * @hidden
 */
function buildPortfolioMovementsQuery(args: string, filter: string): DocumentNode {
  return gql`
  query PortfolioMovementsQuery
    ${args}
   {
    portfolioMovements(
      ${filter}
      orderBy: [${PortfolioMovementsOrderBy.CreatedAtAsc}, ${PortfolioMovementsOrderBy.IdAsc}]
    ) {
      nodes {
        id
        fromId
        from {
          identityId
          number
        }
        toId
        to {
          identityId
          number
        }
        assetId
        amount
        address
        createdBlock {
          blockId
          datetime
          hash
        }
      }
    }
  }
`;
}

/**
 * @hidden
 *
 * Get Settlements where a Portfolio is involved
 */
export function portfolioMovementsQuery(
  filters: QuerySettlementFilters
): QueryOptions<QueryArgs<PortfolioMovement, 'fromId' | 'toId' | 'assetId' | 'address'>> {
  const { args, filter, variables } = createPortfolioMovementFilters(filters);
  const query = buildPortfolioMovementsQuery(args, filter);

  return {
    query,
    variables,
  };
}

/**
 * @hidden
 *
 * Get Settlements for all portfolios
 */
export function portfoliosMovementsQuery(
  filters: Omit<QuerySettlementFilters, 'portfolioId'>
): QueryOptions<QueryArgs<PortfolioMovement, 'fromId' | 'toId' | 'assetId' | 'address'>> {
  const { args, filter, variables } = createPortfolioMovementFilters(filters, true);
  const query = buildPortfolioMovementsQuery(args, filter);

  return {
    query,
    variables,
  };
}

export interface QueryPolyxTransactionFilters {
  identityId?: string;
  addresses?: string[];
}

/**
 *  @hidden
 */
function createPolyxTransactionFilters({ identityId, addresses }: QueryPolyxTransactionFilters): {
  args: string;
  filter: string;
  variables: QueryPolyxTransactionFilters;
} {
  const args = ['$size: Int, $start: Int'];
  const fromIdFilters = [];
  const toIdFilters = [];
  const variables: QueryPolyxTransactionFilters = {};

  if (identityId) {
    variables.identityId = identityId;
    args.push('$identityId: String!');
    fromIdFilters.push('identityId: { equalTo: $identityId }');
    toIdFilters.push('toId: { equalTo: $identityId }');
  }

  if (addresses?.length) {
    variables.addresses = addresses;
    args.push('$addresses: [String!]!');
    fromIdFilters.push('address: { in: $addresses }');
    toIdFilters.push('toAddress: { in: $addresses }');
  }

  return {
    args: `(${args.join()})`,
    filter:
      fromIdFilters.length && toIdFilters.length
        ? `filter: { or: [ { ${fromIdFilters.join()} }, { ${toIdFilters.join()} } ] }`
        : '',
    variables,
  };
}

/**
 * @hidden
 *
 * Get the balance history for an Asset
 */
export function assetTransactionQuery(
  filters: QueryArgs<AssetTransaction, 'assetId'>,
  size?: BigNumber,
  start?: BigNumber
): QueryOptions<PaginatedQueryArgs<QueryArgs<AssetTransaction, 'assetId'>>> {
  const query = gql`
    query AssetTransactionQuery($assetId: String!) {
      assetTransactions(
        filter: { assetId: { equalTo: $assetId } }
        orderBy: [${AssetTransactionsOrderBy.CreatedAtAsc}, ${AssetTransactionsOrderBy.CreatedBlockIdAsc}]
      ) {
        totalCount
        nodes {
          assetId
          amount
          fromPortfolioId
          fromPortfolio {
            identityId
            number
          }
          toPortfolioId
          toPortfolio {
            identityId
            number
          }
          eventId
          eventIdx
          extrinsicIdx
          fundingRound
          instructionId
          instructionMemo
          datetime
          createdBlock {
            blockId
            hash
            datetime
          }
        }
      }
    }
  `;

  return {
    query,
    variables: { ...filters, size: size?.toNumber(), start: start?.toNumber() },
  };
}

/**
 * @hidden
 *
 * Get the transaction history for an NFT Collection
 */
export function nftTransactionQuery(
  filters: QueryArgs<AssetTransaction, 'assetId'>,
  size?: BigNumber,
  start?: BigNumber
): QueryOptions<PaginatedQueryArgs<QueryArgs<AssetTransaction, 'assetId'>>> {
  const query = gql`
    query AssetTransactionQuery($assetId: String!) {
      assetTransactions(
        filter: { assetId: { equalTo: $assetId } }
        orderBy: [${AssetTransactionsOrderBy.CreatedAtAsc}, ${AssetTransactionsOrderBy.CreatedBlockIdAsc}]
      ) {
        totalCount
        nodes {
          assetId
          nftIds
          fromPortfolioId
          fromPortfolio {
            identityId
            number
          }
          toPortfolioId
          toPortfolio {
            identityId
            number
          }
          eventId
          eventIdx
          extrinsicIdx
          fundingRound
          instructionId
          instructionMemo
          datetime
          createdBlock {
            blockId
            hash
            datetime
          }
        }
      }
    }
  `;

  return {
    query,
    variables: { ...filters, size: size?.toNumber(), start: start?.toNumber() },
  };
}

/**
 * @hidden
 *
 * Get POLYX transactions where an Account or an Identity is involved
 */
export function polyxTransactionsQuery(
  filters: QueryPolyxTransactionFilters,
  size?: BigNumber,
  start?: BigNumber
): QueryOptions<PaginatedQueryArgs<QueryPolyxTransactionFilters>> {
  const { args, filter, variables } = createPolyxTransactionFilters(filters);
  const query = gql`
    query PolyxTransactionsQuery
      ${args}
     {
      polyxTransactions(
        ${filter}
        first: $size
        offset: $start
        orderBy: [${PolyxTransactionsOrderBy.CreatedAtAsc}, ${PolyxTransactionsOrderBy.CreatedBlockIdAsc}]
      ) {
        nodes {
          id
          identityId
          address
          toId
          toAddress
          amount
          type
          extrinsic {
            extrinsicIdx
          }
          callId
          eventId
          moduleId
          eventIdx
          memo
          datetime
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
    variables: { ...variables, size: size?.toNumber(), start: start?.toNumber() },
  };
}

export type AuthorizationArgs = 'fromId' | 'type' | 'status' | 'toId' | 'toKey' | 'expiry';

/**
 *  @hidden
 */
function createAuthorizationFilters(variables: QueryArgs<Authorization, AuthorizationArgs>): {
  args: string;
  filter: string;
  variables: QueryArgs<Authorization, AuthorizationArgs>;
} {
  const args = ['$size: Int, $start: Int'];
  const filters = [];
  const { fromId, toId, toKey, status, type } = variables;
  if (fromId?.length) {
    args.push('$fromId: String!');
    filters.push('fromId: { equalTo: $fromId }');
  }
  if (toId?.length) {
    args.push('$toId: String!');
    filters.push('toId: { equalTo: $toId }');
  }
  if (toKey?.length) {
    args.push('$toKey: String!');
    filters.push('toKey: { equalTo: $toKey }');
  }
  if (type) {
    args.push('$type: AuthTypeEnum!');
    filters.push('type: { equalTo: $type }');
  }
  if (status) {
    args.push('$status: AuthorizationStatusEnum!');
    filters.push('status: { equalTo: $status }');
  }
  return {
    args: `(${args.join()})`,
    filter: filters.length ? `filter: { ${filters.join()} }` : '',
    variables,
  };
}

/**
 * @hidden
 *
 * Get all authorizations with specified filters
 */
export function authorizationsQuery(
  filters: QueryArgs<Authorization, AuthorizationArgs>,
  size?: BigNumber,
  start?: BigNumber
): QueryOptions<PaginatedQueryArgs<QueryArgs<Investment, 'stoId' | 'offeringToken'>>> {
  const { args, filter } = createAuthorizationFilters(filters);
  const query = gql`
    query AuthorizationsQuery
      ${args}
      {
      authorizations(
        ${filter}
        first: $size
        offset: $start
        orderBy: [${AuthorizationsOrderBy.CreatedAtAsc}, ${AuthorizationsOrderBy.CreatedBlockIdAsc}]
      ) {
        totalCount
        nodes {
          id
          type
          fromId
          toId
          toKey
          data
          expiry
          status
          createdBlockId
          updatedBlockId
        }
      }
    }
  `;

  return {
    query,
    variables: { ...filters, size: size?.toNumber(), start: start?.toNumber() },
  };
}

/**
 * @hidden
 *
 * Get MultiSig proposal details for a given MultiSig address and portfolio ID
 */
export function multiSigProposalQuery(
  variables: QueryArgs<MultiSigProposal, 'multisigId' | 'proposalId'>
): QueryOptions<QueryArgs<MultiSigProposal, 'multisigId' | 'proposalId'>> {
  const query = gql`
    query MultiSigProposalQuery($multisigId: String!, $proposalId: Int!) {
      multiSigProposals(
        filter: { multisigId: { equalTo: $multisigId }, proposalId: { equalTo: $proposalId } }
      ) {
        nodes {
          eventIdx
          creatorId
          creatorAccount
          createdBlock {
            blockId
            hash
            datetime
          }
          votes {
            nodes {
              action
              signer {
                signerType
                signerValue
              }
            }
          }
          updatedBlock {
            blockId
            hash
            datetime
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
 * Get MultiSig proposal votes for a given proposalId ({multiSigAddress}/{proposalId})
 */
export function multiSigProposalVotesQuery(
  variables: QueryArgs<MultiSigProposalVote, 'proposalId'>
): QueryOptions<QueryArgs<MultiSigProposalVote, 'proposalId'>> {
  const query = gql`
    query MultiSigProposalVotesQuery($proposalId: String!) {
      multiSigProposalVotes(
        filter: { proposalId: { equalTo: $proposalId } }
        orderBy: [${MultiSigProposalVotesOrderBy.CreatedAtAsc}]
      ) {
        nodes {
          signer {
            signerType
            signerValue
          }
          action
          eventIdx
          createdBlockId
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
          identity {
            did
          }
        }
        totalCount
      }
    }
`;

  return {
    query,
    variables: { size: size?.toNumber(), start: start?.toNumber(), dids },
  };
}

/**
 * @hidden
 *
 * Get holders on an NFT Collection
 */
export function nftCollectionHolders(
  assetId: string,
  size?: BigNumber,
  start?: BigNumber
): QueryOptions<PaginatedQueryArgs<QueryArgs<NftHolder, 'assetId'>>> {
  const query = gql`
    query NftCollectionHolders($assetId: String!, $size: Int, $start: Int) {
      nftHolders(
        first: $size
        offset: $start
        filter: { assetId: { equalTo: $assetId }, nftIds: { notEqualTo: [] } }
        orderBy: IDENTITY_ID_DESC
      ) {
        nodes {
          identityId
          nftIds
        }
        totalCount
      }
    }
  `;

  return {
    query,
    variables: { size: size?.toNumber(), start: start?.toNumber(), assetId },
  };
}

type MultiSigProposalQueryParameters = {
  multisigId: string;
};

/**
 * @hidden
 *
 * Get MultiSig Proposals history for a given MultiSig address
 */
export function multiSigProposalsQuery(
  multisigId: string,
  size?: BigNumber,
  start?: BigNumber
): QueryOptions<PaginatedQueryArgs<MultiSigProposalQueryParameters>> {
  const query = gql`
    query MultiSigProposalsQuery($size: Int, $start: Int, $multisigId: String!) {
      multiSigProposals(filter: { multisigId: { eq: $multisigId } }, first: $size, offset: $start) {
        nodes {
          id
          proposalId
          multisigId
        }
        totalCount
      }
    }
  `;

  return {
    query,
    variables: { size: size?.toNumber(), start: start?.toNumber(), multisigId },
  };
}
