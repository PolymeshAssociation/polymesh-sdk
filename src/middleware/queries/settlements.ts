import { DocumentNode, QueryOptions } from '@apollo/client/core';
import BigNumber from 'bignumber.js';
import gql from 'graphql-tag';

import { Context } from '~/internal';
import { createArgsAndFilters, getSizeAndOffset } from '~/middleware/queries/common';
import {
  Instruction,
  InstructionAffirmation,
  InstructionAffirmationsOrderBy,
  InstructionEvent,
  InstructionEventsOrderBy,
  InstructionsOrderBy,
  InstructionStatusEnum,
  Leg,
  LegsOrderBy,
} from '~/middleware/types';
import { HistoricalInstructionFilters } from '~/types';
import { PaginatedQueryArgs, QueryArgs } from '~/types/utils';
import { DEFAULT_GQL_PAGE_SIZE } from '~/utils/constants';
import { asAssetId, asDid } from '~/utils/internal';

const legAttributes = `
            legIndex
            legType
            from
            fromPortfolio
            to
            toPortfolio
            assetId
            ticker
            amount
            nftIds
            addresses
            offChainReceipts {
              nodes {
                uid
                signer
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
          legs {
            nodes {
              ${legAttributes}
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
`;

const instructionAffirmationAttributes = `
      id
      identity
      portfolios
      offChainReceiptId
      offChainReceipt {
        leg {
          id
          legIndex
        }
        signer
      }
      status
      isAutomaticallyAffirmed
      isMediator
      expiry
`;

type InstructionArgs = 'id' | 'venueId' | 'status';

type InstructionPartiesVariables = Partial<
  Record<keyof Omit<HistoricalInstructionFilters, 'status' | 'size' | 'start'>, string> & {
    status?: InstructionStatusEnum;
    size?: number;
    start?: number;
  }
>;

/**
 * Query to get event details about instruction events
 */
export function instructionEventsQuery(
  paddedIds: boolean,
  filters: QueryArgs<InstructionEvent, 'event' | 'instructionId'>,
  size?: BigNumber,
  start?: BigNumber
): QueryOptions<PaginatedQueryArgs<QueryArgs<InstructionEvent, 'event' | 'instructionId'>>> {
  const { args, filter } = createArgsAndFilters(filters, {
    event: 'InstructionEventEnum',
  });

  let orderBy = `[${InstructionEventsOrderBy.CreatedAtDesc}, ${InstructionEventsOrderBy.CreatedBlockIdDesc}]`;

  if (paddedIds) {
    orderBy = `[${InstructionEventsOrderBy.CreatedEventIdDesc}]`;
  }

  const query = gql`
    query InstructionEventsQuery
      ${args}
      {
      instructionEvents(
        ${filter}
        first: $size
        offset: $start
        orderBy: ${orderBy}
      ) {
        totalCount
        nodes {
          id
          event
          eventIdx
          identity
          portfolio
          offChainReceiptId
          offChainReceipt {
            legId
            signer
            uid
          }
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
    variables: { ...filters, ...getSizeAndOffset(size, start) },
  };
}

/**
 * @hidden
 *
 * Get a specific instruction within a venue for a specific event
 */
export function instructionsQuery(
  paddedIds: boolean,
  filters: QueryArgs<Instruction, InstructionArgs>,
  size?: BigNumber,
  start?: BigNumber
): QueryOptions<PaginatedQueryArgs<QueryArgs<Instruction, InstructionArgs>>> {
  const { args, filter } = createArgsAndFilters(filters, {
    status: 'InstructionStatusEnum',
  });

  let orderBy = `[${InstructionsOrderBy.CreatedAtDesc}, ${InstructionsOrderBy.IdDesc}]`;

  if (paddedIds) {
    orderBy = `[${InstructionsOrderBy.CreatedEventIdDesc}]`;
  }

  const query = gql`
    query InstructionsQuery
      ${args}
      {
      instructions(
        ${filter}
        first: $size
        offset: $start
        orderBy: ${orderBy}
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
    variables: { ...filters, ...getSizeAndOffset(size, start) },
  };
}

type InstructionAffirmationArgs = 'instructionId' | 'status' | 'identity' | 'isMediator';

/**
 * @hidden
 *
 * Get a specific instruction within a venue for a specific event
 */
export function instructionAffirmationsQuery(
  paddedIds: boolean,
  filters: QueryArgs<InstructionAffirmation, InstructionAffirmationArgs>,
  size?: BigNumber,
  start?: BigNumber
): QueryOptions<PaginatedQueryArgs<QueryArgs<InstructionAffirmation, InstructionAffirmationArgs>>> {
  const { args, filter } = createArgsAndFilters(filters, {
    status: 'AffirmStatusEnum',
    isMediator: 'Boolean',
  });

  const orderBy = paddedIds
    ? `[${InstructionAffirmationsOrderBy.CreatedBlockIdDesc}]`
    : `[${InstructionAffirmationsOrderBy.CreatedAtAsc}, ${InstructionAffirmationsOrderBy.CreatedBlockIdAsc}]`;

  const query = gql`
    query InstructionAffirmationsQuery
      ${args}
      {
      instructionAffirmations(
        ${filter}
        first: $size
        offset: $start
        orderBy: ${orderBy}
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
    variables: { ...filters, size: size?.toNumber(), start: start?.toNumber() },
  };
}

/**
 * @hidden
 *
 * Get a specific instruction within a venue for a specific event
 */
export function offChainAffirmationsQuery(
  paddedIds: boolean,
  filters: QueryArgs<InstructionAffirmation, 'instructionId'>
): QueryOptions<QueryArgs<InstructionAffirmation, 'instructionId'>> {
  const orderBy = paddedIds
    ? `${InstructionAffirmationsOrderBy.CreatedBlockIdAsc}`
    : `${InstructionAffirmationsOrderBy.CreatedAtAsc}, ${InstructionAffirmationsOrderBy.CreatedBlockIdAsc}`;

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
    variables: { ...filters },
  };
}

/**
 * @hidden
 *
 * Get a specific instruction within a venue for a specific event
 */
export function legsQuery(
  filters: QueryArgs<Leg, 'instructionId' | 'legType' | 'legIndex'>,
  size?: BigNumber,
  start?: BigNumber
): QueryOptions<PaginatedQueryArgs<QueryArgs<Leg, 'instructionId' | 'legType'>>> {
  const { args, filter } = createArgsAndFilters(filters, {
    legType: 'LegTypeEnum',
    legIndex: 'Int',
  });
  const query = gql`
    query LegsQuery
      ${args}
      {
      legs(
        ${filter}
        first: $size
        offset: $start
        orderBy: [${LegsOrderBy.LegIndexAsc}]
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
    variables: { ...filters, size: size?.toNumber(), start: start?.toNumber() },
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
    instructionPartiesFilter.push('identity: { equalTo: $identity }');
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
    instructionPartiesFilter.push('identity: { equalTo: $party }');
    variables.party = asDid(party);
  }

  if (asset) {
    args.push('$asset: String!');
    legsFilter.push('assetId: { equalTo: $asset }');
    variables.asset = await asAssetId(asset, context);
  }

  if (sender) {
    args.push('$sender: String!');
    legsFilter.push('from: { equalTo: $sender }');
    variables.sender = asDid(sender);
  }

  if (receiver) {
    args.push('$receiver: String!');
    legsFilter.push('to: { equalTo: $receiver }');
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
  context: Context
): Promise<QueryOptions<PaginatedQueryArgs<Omit<HistoricalInstructionFilters, 'size' | 'start'>>>> {
  const { args, filter, variables } = await buildHistoricalInstructionsQueryFilter(
    filters,
    context
  );

  const paddedIds = context.isSqIdPadded;

  const orderBy = paddedIds
    ? `[${InstructionsOrderBy.CreatedBlockIdAsc}]`
    : `[${InstructionsOrderBy.CreatedAtAsc}, ${InstructionsOrderBy.IdAsc}]`;

  const query = gql`
    query InstructionsQuery
    ${args}
     {
      instructions(
        ${filter}
        orderBy: ${orderBy}
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
  portfolioId?: BigNumber;
  assetId?: string;
  address?: string;
}

type LegArgs = 'from' | 'fromPortfolio' | 'to' | 'toPortfolio' | 'assetId' | 'addresses';

/**
 *  @hidden
 */
function createLegFilters(
  { identityId, portfolioId, assetId, address }: QuerySettlementFilters,
  queryAll?: boolean
): {
  args: string;
  filter: string;
  variables: QueryArgs<Leg, LegArgs>;
} {
  const args: string[] = ['$from: String!, $to: String!'];
  const fromIdFilters = ['from: { equalTo: $from }'];
  const toIdFilters = ['to: { equalTo: $to }'];
  const portfolioNumber = portfolioId ? portfolioId.toNumber() : 0;
  const variables: QueryArgs<Leg, LegArgs> = {
    from: identityId,
    to: identityId,
  };

  if (!queryAll) {
    variables.fromPortfolio = portfolioNumber;
    variables.toPortfolio = portfolioNumber;
    args.push('$fromPortfolio: Int, $toPortfolio: Int');
    fromIdFilters.push('fromPortfolio: { equalTo: $fromPortfolio }');
    toIdFilters.push('toPortfolio: { equalTo: $toPortfolio }');
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
    args.push('$addresses: [String!]!');
    const addressFilter = 'addresses: { in: $addresses }';
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
function buildSettlementsQuery(paddedIds: boolean, args: string, filter: string): DocumentNode {
  const orderBy = paddedIds
    ? `[${LegsOrderBy.CreatedBlockIdAsc}]`
    : `[${LegsOrderBy.CreatedAtAsc}, ${LegsOrderBy.InstructionIdAsc}]`;

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
  paddedIds: boolean,
  filters: QuerySettlementFilters
): QueryOptions<QueryArgs<Leg, LegArgs>> {
  const { args, filter, variables } = createLegFilters(filters);
  const query = buildSettlementsQuery(paddedIds, args, filter);

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
  paddedIds: boolean,
  filters: Omit<QuerySettlementFilters, 'portfolioId'>
): QueryOptions<QueryArgs<Leg, LegArgs>> {
  const { args, filter, variables } = createLegFilters(filters, true);
  const query = buildSettlementsQuery(paddedIds, args, filter);

  return {
    query,
    variables,
  };
}
