import { DocumentNode, QueryOptions } from '@apollo/client/core';
import BigNumber from 'bignumber.js';
import gql from 'graphql-tag';

import { Context } from '~/internal';
import {
  createArgsAndFilters,
  eventIdentifierFields,
  getSizeAndOffset,
  orderByClause,
} from '~/middleware/queries/common';
import {
  AffirmStatusEnum,
  InstructionAffirmationsOrderBy,
  InstructionEventEnum,
  InstructionEventsOrderBy,
  InstructionsOrderBy,
  InstructionStatusEnum,
  LegsOrderBy,
  LegTypeEnum,
} from '~/middleware/types';
import { HistoricalInstructionFilters } from '~/types';
import { PaginatedQueryArgs } from '~/types/utils';
import { DEFAULT_GQL_PAGE_SIZE } from '~/utils/constants';
import {
  bigNumberToMiddlewareSequenceId,
  portfolioToMiddlewarePortfolioId,
} from '~/utils/conversion';
import { asDid, getAssetIdForMiddleware } from '~/utils/internal';

const legAttributes = `
            legIndex
            legType
            fromId
            fromPortfolioId
            fromAccountId
            toId
            toPortfolioId
            toAccountId
            assetId
            ticker
            amount
            nftIds
            addresses
            offChainReceipts {
              nodes {
                uid
                signerId
              }
            }
`;

const instructionAttributes = `
          id
          venueId
          status
          type
          endBlock
          endAfterBlock
          tradeDate
          valueDate
          mediators
          legs(orderBy: [${LegsOrderBy.LegIndexAsc}]) {
            nodes {
              ${legAttributes}
            }
          }
          memo
          createdEvent {
            ${eventIdentifierFields}
          }
          updatedEvent {
            ${eventIdentifierFields}
          }
`;

const instructionAffirmationAttributes = `
      id
      identityId
      accountId
      portfolioId
      affirmedById
      signerId
      offChainReceiptId
      offChainReceipt {
        leg {
          id
          legIndex
        }
        signerId
      }
      status
      isAutomaticallyAffirmed
      isMediator
      expiry
`;

/**
 * The filter keys that hold an Instruction or Venue id
 */
const sequenceIdKeys = new Set(['id', 'venueId', 'instructionId']);

/**
 * @hidden
 *
 * An Instruction or Venue id is the chain's sequence number. The builders take it as a number and
 *   pad it the way the middleware stores it, so a caller cannot pass a form that matches nothing.
 *   Only the id keys are padded, so another number in the filters is left as it is
 */
function withMiddlewareIds(filters: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(filters).map(([key, value]) => [
      key,
      sequenceIdKeys.has(key) && BigNumber.isBigNumber(value)
        ? bigNumberToMiddlewareSequenceId(value)
        : value,
    ])
  );
}

export interface InstructionsQueryFilters {
  id?: BigNumber;
  venueId?: BigNumber;
  status?: InstructionStatusEnum;
}

export interface InstructionEventsQueryFilters {
  instructionId: BigNumber;
  event?: InstructionEventEnum;
}

export interface InstructionAffirmationsQueryFilters {
  instructionId: BigNumber;
  status?: AffirmStatusEnum;
  identityId?: string;
  isMediator?: boolean;
}

export interface LegsQueryFilters {
  instructionId: BigNumber;
  legType?: LegTypeEnum;
  legIndex?: number;
}

type InstructionPartiesVariables = Partial<
  // `orderBy` is interpolated into the query, not sent as a variable, like `size` and `start`
  Record<
    keyof Omit<HistoricalInstructionFilters, 'status' | 'size' | 'start' | 'orderBy'>,
    string
  > & {
    status?: InstructionStatusEnum;
    size?: number;
    start?: number;
  }
>;

/**
 * Query to get event details about instruction events
 */
export function instructionEventsQuery(
  filters: InstructionEventsQueryFilters,
  size?: BigNumber,
  start?: BigNumber,
  orderBy?: InstructionEventsOrderBy | InstructionEventsOrderBy[]
): QueryOptions<PaginatedQueryArgs<Record<string, unknown>>> {
  const variables = withMiddlewareIds({ ...filters });
  const { args, filter } = createArgsAndFilters(variables, {
    event: 'InstructionEventEnum',
  });

  // `createdEventId` is `<block>/<event index>`, zero padded: block order, and unique
  const ordering = orderByClause(orderBy, [InstructionEventsOrderBy.CreatedEventIdDesc]);

  const query = gql`
    query InstructionEventsQuery
      ${args}
      {
      instructionEvents(
        ${filter}
        first: $size
        offset: $start
        orderBy: [${ordering}]
      ) {
        totalCount
        nodes {
          id
          event
          identityId
          accountId
          portfolioId
          offChainReceiptId
          offChainReceipt {
            legId
            signerId
            uid
          }
          createdEvent {
            ${eventIdentifierFields}
          }
        }
      }
    }
  `;

  return {
    query,
    variables: { ...variables, ...getSizeAndOffset(size, start) },
  };
}

/**
 * @hidden
 *
 * Get a specific instruction within a venue for a specific event
 */
export function instructionsQuery(
  filters: InstructionsQueryFilters,
  size?: BigNumber,
  start?: BigNumber,
  orderBy?: InstructionsOrderBy | InstructionsOrderBy[]
): QueryOptions<PaginatedQueryArgs<Record<string, unknown>>> {
  const variables = withMiddlewareIds({ ...filters });
  const { args, filter } = createArgsAndFilters(variables, {
    status: 'InstructionStatusEnum',
  });

  // `createdEventId` is `<block>/<event index>`, zero padded: block order, and unique
  const ordering = orderByClause(orderBy, [InstructionsOrderBy.CreatedEventIdDesc]);

  const query = gql`
    query InstructionsQuery
      ${args}
      {
      instructions(
        ${filter}
        first: $size
        offset: $start
        orderBy: [${ordering}]
      ) {
        totalCount
        nodes {
          ${instructionAttributes}
        }
      }
    }
  `;

  return {
    query,
    variables: { ...variables, ...getSizeAndOffset(size, start) },
  };
}

/**
 * @hidden
 *
 * Get a specific instruction within a venue for a specific event
 */
export function instructionAffirmationsQuery(
  filters: InstructionAffirmationsQueryFilters,
  size?: BigNumber,
  start?: BigNumber,
  orderBy?: InstructionAffirmationsOrderBy | InstructionAffirmationsOrderBy[]
): QueryOptions<PaginatedQueryArgs<Record<string, unknown>>> {
  const variables = withMiddlewareIds({ ...filters });
  const { args, filter } = createArgsAndFilters(variables, {
    status: 'AffirmStatusEnum',
    isMediator: 'Boolean',
  });

  // every holder's row is created with the instruction, so `createdEventId` ties and `id` decides
  const ordering = orderByClause(orderBy, [
    InstructionAffirmationsOrderBy.CreatedEventIdDesc,
    InstructionAffirmationsOrderBy.IdDesc,
  ]);

  const query = gql`
    query InstructionAffirmationsQuery
      ${args}
      {
      instructionAffirmations(
        ${filter}
        first: $size
        offset: $start
        orderBy: [${ordering}]
      ) {
        totalCount
        nodes {
          ${instructionAffirmationAttributes}
        }
      }
    }
  `;

  return {
    query,
    variables: {
      ...variables,
      ...(size ? { size: size.toNumber() } : {}),
      ...(start ? { start: start.toNumber() } : {}),
    },
  };
}

/**
 * @hidden
 *
 * Get a specific instruction within a venue for a specific event
 */
export function offChainAffirmationsQuery(
  filters: Pick<InstructionAffirmationsQueryFilters, 'instructionId'>
): QueryOptions<Record<string, unknown>> {
  const orderBy = `${InstructionAffirmationsOrderBy.CreatedEventIdAsc}`;

  const query = gql`
    query InstructionAffirmationsQuery($instructionId: String!) {
      instructionAffirmations(
        filter: {
          instructionId: { equalTo: $instructionId }
          offChainReceiptExists: true
        }
        orderBy: [${orderBy}]
      ) {
        nodes {
          ${instructionAffirmationAttributes}
        }
      }
    }
  `;

  return {
    query,
    variables: withMiddlewareIds({ ...filters }),
  };
}

/**
 * @hidden
 *
 * Get a specific instruction within a venue for a specific event
 */
export function legsQuery(
  filters: LegsQueryFilters,
  size?: BigNumber,
  start?: BigNumber,
  orderBy?: LegsOrderBy | LegsOrderBy[]
): QueryOptions<PaginatedQueryArgs<Record<string, unknown>>> {
  const variables = withMiddlewareIds({ ...filters });
  const { args, filter } = createArgsAndFilters(variables, {
    legType: 'LegTypeEnum',
    legIndex: 'Int',
  });

  // `legIndex` is unique within the instruction this query always filters by
  const ordering = orderByClause(orderBy, [LegsOrderBy.LegIndexAsc]);
  const query = gql`
    query LegsQuery
      ${args}
      {
      legs(
        ${filter}
        first: $size
        offset: $start
        orderBy: [${ordering}]
      ) {
        totalCount
        nodes {
          ${legAttributes}
        }
      }
    }
  `;

  return {
    query,
    variables: {
      ...variables,
      ...(size ? { size: size.toNumber() } : {}),
      ...(start ? { start: start.toNumber() } : {}),
    },
  };
}

/**
 * @hidden
 *
 */
export const buildHistoricalInstructionsQueryFilter = async (
  filters: HistoricalInstructionFilters,
  context: Context
): Promise<{
  args: string;
  filter: string;
  variables: InstructionPartiesVariables;
}> => {
  const {
    identity,
    asset,
    status,
    sender,
    receiver,
    mediator,
    party,
    size = new BigNumber(DEFAULT_GQL_PAGE_SIZE),
    start = new BigNumber(0),
  } = filters;

  const args = ['$start: Int', '$size: Int'];
  const baseFilter = [];
  const instructionPartiesFilter = [];
  const legsFilter = [];
  const variables: InstructionPartiesVariables = {};

  if (identity) {
    args.push('$identity: String!');
    instructionPartiesFilter.push('identityId: { equalTo: $identity }');
    variables.identity = asDid(identity);
  }

  if (mediator) {
    args.push('$mediator: String!');
    baseFilter.push('mediators: { containsKey: $mediator }');
    variables.mediator = asDid(mediator);
  }

  if (status) {
    args.push('$status: InstructionStatusEnum!');
    baseFilter.push('status: { equalTo: $status }');
    variables.status = status;
  }

  if (party) {
    args.push('$party: String!');
    instructionPartiesFilter.push('identityId: { equalTo: $party }');
    variables.party = asDid(party);
  }

  if (asset) {
    args.push('$asset: String!');
    legsFilter.push('assetId: { equalTo: $asset }');
    variables.asset = await getAssetIdForMiddleware(asset, context);
  }

  if (sender) {
    args.push('$sender: String!');
    legsFilter.push('fromId: { equalTo: $sender }');
    variables.sender = asDid(sender);
  }

  if (receiver) {
    args.push('$receiver: String!');
    legsFilter.push('toId: { equalTo: $receiver }');
    variables.receiver = asDid(receiver);
  }

  if (legsFilter.length) {
    baseFilter.push(`legs: { some: { ${legsFilter.join(', ')} } }`);
  }

  if (instructionPartiesFilter.length) {
    baseFilter.push(`parties: { some: { ${instructionPartiesFilter.join(', ')} } }`);
  }

  return {
    args: `(${args.join()})`,
    filter: baseFilter.length ? `filter: { ${baseFilter.join(', ')} }` : '',
    variables: { ...variables, ...getSizeAndOffset(size, start) },
  };
};

/**
 * @hidden
 *
 * Get Instructions where an identity is involved
 */
export async function historicalInstructionsQuery(
  filters: HistoricalInstructionFilters,
  context: Context,
  orderBy?: InstructionsOrderBy | InstructionsOrderBy[]
): Promise<
  QueryOptions<PaginatedQueryArgs<Omit<HistoricalInstructionFilters, 'size' | 'start' | 'orderBy'>>>
> {
  const { args, filter, variables } = await buildHistoricalInstructionsQueryFilter(
    filters,
    context
  );

  // `createdEventId` is `<block>/<event index>`, zero padded: block order, and unique
  const ordering = orderByClause(orderBy, [InstructionsOrderBy.CreatedEventIdAsc]);

  const query = gql`
    query InstructionsQuery
    ${args}
     {
      instructions(
        ${filter}
        orderBy: [${ordering}]
        first: $size
        offset: $start
      ) {
        nodes {
            ${instructionAttributes}
        }
        totalCount
      }
    }
  `;

  return {
    query,
    variables,
  };
}

export interface QuerySettlementFilters {
  identityId: string;
  portfolioId?: BigNumber | undefined;
  assetId?: string | undefined;
  address?: string | undefined;
}

type LegFilterVariables = {
  from?: string;
  to?: string;
  fromPortfolio?: string;
  toPortfolio?: string;
  assetId?: string;
  addresses?: string[];
};

/**
 *  @hidden
 */
function createLegFilters(
  { identityId, portfolioId, assetId, address }: QuerySettlementFilters,
  queryAll?: boolean
): {
  args: string;
  filter: string;
  variables: LegFilterVariables;
} {
  const args: string[] = [];
  const fromIdFilters: string[] = [];
  const toIdFilters: string[] = [];
  const variables: LegFilterVariables = {};

  if (queryAll) {
    args.push('$from: String!, $to: String!');
    fromIdFilters.push('fromId: { equalTo: $from }');
    toIdFilters.push('toId: { equalTo: $to }');
    variables.from = identityId;
    variables.to = identityId;
  } else {
    const portfolio = portfolioToMiddlewarePortfolioId(identityId, portfolioId);

    args.push('$fromPortfolio: String!, $toPortfolio: String!');
    fromIdFilters.push('fromPortfolioId: { equalTo: $fromPortfolio }');
    toIdFilters.push('toPortfolioId: { equalTo: $toPortfolio }');
    variables.fromPortfolio = portfolio;
    variables.toPortfolio = portfolio;
  }

  if (assetId) {
    variables.assetId = assetId;
    args.push('$assetId: String!');
    const assetIdFilter = 'assetId: { equalTo: $assetId }';
    toIdFilters.push(assetIdFilter);
    fromIdFilters.push(assetIdFilter);
  }

  if (address) {
    variables.addresses = [address];
    args.push('$addresses: JSON!');
    const addressFilter = 'addresses: { contains: $addresses }';
    toIdFilters.push(addressFilter);
    fromIdFilters.push(addressFilter);
  }

  return {
    args: `(${args.join()})`,
    filter: `filter: { or: [{ ${fromIdFilters.join()} }, { ${toIdFilters.join()} } ] }`,
    variables,
  };
}

/**
 *  @hidden
 */
function buildSettlementsQuery(args: string, filter: string): DocumentNode {
  const orderBy = `[${LegsOrderBy.CreatedEventIdAsc}]`;

  return gql`
  query SettlementsQuery
    ${args}
   {
    legs(
      ${filter}
      orderBy: ${orderBy}
    ) {
      nodes {
        instruction {
          ${instructionAttributes}
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
): QueryOptions<LegFilterVariables> {
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
): QueryOptions<LegFilterVariables> {
  const { args, filter, variables } = createLegFilters(filters, true);
  const query = buildSettlementsQuery(args, filter);

  return {
    query,
    variables,
  };
}
