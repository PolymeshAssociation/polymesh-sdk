import BigNumber from 'bignumber.js';
import gql from 'graphql-tag';

import { ClaimTypeEnum, middlewareV2EnumMap } from '~/middleware/enumsV2';
import {
  Asset,
  AssetHolder,
  AssetHoldersOrderBy,
  ClaimsGroupBy,
  ClaimsOrderBy,
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
  Portfolio,
  PortfolioMovement,
  PortfolioMovementsOrderBy,
  TickerExternalAgent,
  TickerExternalAgentAction,
  TickerExternalAgentActionsOrderBy,
  TickerExternalAgentHistoriesOrderBy,
  TickerExternalAgentHistory,
  TickerExternalAgentsOrderBy,
  TrustedClaimIssuer,
  TrustedClaimIssuersOrderBy,
} from '~/middleware/typesV2';
import { GraphqlQuery } from '~/types/internal';
import { PaginatedQueryArgs, QueryArgs } from '~/types/utils';

/**
 * @hidden
 *
 * Middleware V2 heartbeat
 */
export function heartbeatQuery(): GraphqlQuery {
  const query = gql`
    query {
      block(id: "1") {
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
 *  @hidden
 */
function createClaimsFilters(variables: ClaimsQueryFilter): {
  args: string;
  filter: string;
} {
  const args = ['$size: Int, $start: Int'];
  const filters = ['revokeDate: { isNull: true }'];
  const { dids, claimTypes, trustedClaimIssuers, scope, includeExpired } = variables;
  if (dids) {
    args.push('$dids: [String!]');
    filters.push('targetId: { in: $dids }');
  }
  if (claimTypes) {
    args.push('$claimTypes: [ClaimTypeEnum!]!');
    filters.push('type: { in: $claimTypes }');
  }
  if (trustedClaimIssuers) {
    args.push('$trustedClaimIssuers: [String!]');
    filters.push('issuerId: { in: $trustedClaimIssuers }');
  }
  if (scope !== undefined) {
    args.push('$scope: JSON!');
    filters.push('scope: { contains: $scope }');
  }
  if (!includeExpired) {
    args.push('$expiryTimestamp: BigFloat');
    filters.push('filterExpiry: { lessThan: $expiryTimestamp }');
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
): GraphqlQuery<PaginatedQueryArgs<ClaimsQueryFilter>> {
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
): GraphqlQuery<PaginatedQueryArgs<ClaimsQueryFilter>> {
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
 * Get all investments for a given offering
 */
export function investmentsQuery(
  filters: QueryArgs<Investment, 'stoId' | 'offeringToken'>,
  size?: BigNumber,
  start?: BigNumber
): GraphqlQuery<PaginatedQueryArgs<QueryArgs<Investment, 'stoId' | 'offeringToken'>>> {
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
      const middlewareType = middlewareV2EnumMap[type] || type;
      args.push(`$${attribute}: ${middlewareType}!`);
      gqlFilters.push(`${attribute}: { equalTo: $${attribute} }`);
    }
  });

  return {
    args: `(${args.join()})`,
    filter: gqlFilters.length ? `filter: { ${gqlFilters.join()} }` : '',
  };
}

type InstructionArgs = 'id' | 'eventId' | 'venueId';

/**
 * @hidden
 *
 * Get a specific instruction within a venue for a specific event
 */
export function instructionsQuery(
  filters: QueryArgs<Instruction, InstructionArgs>,
  size?: BigNumber,
  start?: BigNumber
): GraphqlQuery<PaginatedQueryArgs<QueryArgs<Instruction, InstructionArgs>>> {
  const { args, filter } = createArgsAndFilters(filters, { eventId: 'EventIdEnum' });
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
export function instructionsByDidQuery(identityId: string): GraphqlQuery {
  const query = gql`
    query InstructionsByDidQuery
     {
      legs(
        filter: { or: [{ fromId: { startsWith: "${identityId}" } }, { toId: { startsWith: "${identityId}" } }] }
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
    variables: undefined,
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
): GraphqlQuery<PaginatedQueryArgs<QueryArgs<Event, EventArgs>>> {
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
        orderBy: [${EventsOrderBy.BlockIdAsc}]
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
): GraphqlQuery<QueryArgs<Extrinsic, 'extrinsicHash'>> {
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
): GraphqlQuery<PaginatedQueryArgs<QueryArgs<Extrinsic, ExtrinsicArgs>>> {
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
): GraphqlQuery<QueryArgs<TrustedClaimIssuer, 'issuer' | 'assetId'>> {
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
): GraphqlQuery<QueryArgs<TrustedClaimIssuer, 'issuer'>> {
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
): GraphqlQuery<QueryArgs<Portfolio, 'identityId' | 'number'>> {
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
): GraphqlQuery<QueryArgs<Asset, 'ticker'>> {
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
): GraphqlQuery<QueryArgs<TickerExternalAgent, 'assetId'>> {
  const query = gql`
    query TickerExternalAgentQuery($assetId: String!) {
      tickerExternalAgents(
        filter: { assetId: { equalTo: $assetId } }
        orderBy: [${TickerExternalAgentsOrderBy.CreatedBlockIdDesc}]
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
): GraphqlQuery<QueryArgs<TickerExternalAgentHistory, 'assetId'>> {
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
): GraphqlQuery<
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
  variables: QueryArgs<Distribution, 'id'>
): GraphqlQuery<QueryArgs<Distribution, 'id'>> {
  const query = gql`
    query DistributionQuery($id: String!) {
      distribution(id: $id) {
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
export function distributionPaymentsQuery(
  filters: QueryArgs<DistributionPayment, 'distributionId'>,
  size?: BigNumber,
  start?: BigNumber
): GraphqlQuery<PaginatedQueryArgs<QueryArgs<DistributionPayment, 'distributionId'>>> {
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
): GraphqlQuery<PaginatedQueryArgs<QueryArgs<DistributionPayment, 'distributionId'>>> {
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
function createLegFilters({ identityId, portfolioId, ticker, address }: QuerySettlementFilters): {
  args: string;
  filter: string;
  variables: QueryArgs<Leg, LegArgs>;
} {
  const args: string[] = ['$fromId: String!, $toId: String!'];
  const fromIdFilters = ['fromId: { equalTo: $fromId }'];
  const toIdFilters = ['toId: { equalTo: $toId }'];
  const portfolioNumber = portfolioId ? portfolioId.toNumber() : 0;
  const variables: QueryArgs<Leg, LegArgs> = {
    fromId: `${identityId}/${portfolioNumber}`,
    toId: `${identityId}/${portfolioNumber}`,
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
 * @hidden
 *
 * Get Settlements where a Portfolio is involved
 */
export function settlementsQuery(
  filters: QuerySettlementFilters
): GraphqlQuery<QueryArgs<Leg, 'fromId' | 'toId' | 'assetId' | 'addresses'>> {
  const { args, filter, variables } = createLegFilters(filters);
  const query = gql`
    query SettlementsQuery
      ${args}
     {
      legs(
        ${filter}
        orderBy: [${LegsOrderBy.InstructionIdAsc}]
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

  return {
    query,
    variables,
  };
}

type PortfolioMovementArgs = 'fromId' | 'toId' | 'assetId' | 'address';

/**
 *  @hidden
 */
function createPortfolioMovementFilters({
  identityId,
  portfolioId,
  ticker,
  address,
}: QuerySettlementFilters): {
  args: string;
  filter: string;
  variables: QueryArgs<PortfolioMovement, PortfolioMovementArgs>;
} {
  const args: string[] = ['$fromId: String!, $toId: String!'];
  const fromIdFilters = ['fromId: { equalTo: $fromId }'];
  const toIdFilters = ['toId: { equalTo: $toId }'];
  const portfolioNumber = portfolioId ? portfolioId.toNumber() : 0;
  const variables: QueryArgs<PortfolioMovement, PortfolioMovementArgs> = {
    fromId: `${identityId}/${portfolioNumber}`,
    toId: `${identityId}/${portfolioNumber}`,
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
    const addressFilter = 'address: { in: $address }';
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
 *
 * Get Settlements where a Portfolio is involved
 */
export function portfolioMovementsQuery(
  filters: QuerySettlementFilters
): GraphqlQuery<QueryArgs<PortfolioMovement, 'fromId' | 'toId' | 'assetId' | 'address'>> {
  const { args, filter, variables } = createPortfolioMovementFilters(filters);
  const query = gql`
    query PortfolioMovementsQuery
      ${args}
     {
      portfolioMovements(
        ${filter}
        orderBy: [${PortfolioMovementsOrderBy.IdAsc}]
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

  return {
    query,
    variables,
  };
}
