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
import { InstructionPartiesFilters } from '~/types';
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
  Record<keyof Omit<InstructionPartiesFilters, 'status' | 'size' | 'start'>, string> & {
    status?: InstructionStatusEnum;
    size?: number;
    start?: number;
  }
>;

/**
 * Query to get event details about instruction events
 */
export function instructionEventsQuery(
  filters: QueryArgs<InstructionEvent, 'event' | 'instructionId'>,
  size?: BigNumber,
  start?: BigNumber
): QueryOptions<PaginatedQueryArgs<QueryArgs<InstructionEvent, 'event' | 'instructionId'>>> {
  const { args, filter } = createArgsAndFilters(filters, {
    event: 'InstructionEventEnum',
  });
  const query = gql`
    query InstructionEventsQuery
      ${args}
      {
      instructionEvents(
        ${filter}
        first: $size
        offset: $start
        orderBy: [${InstructionEventsOrderBy.CreatedAtDesc}, ${InstructionEventsOrderBy.CreatedBlockIdDesc}]
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
  filters: QueryArgs<Instruction, InstructionArgs>,
  size?: BigNumber,
  start?: BigNumber
): QueryOptions<PaginatedQueryArgs<QueryArgs<Instruction, InstructionArgs>>> {
  const { args, filter } = createArgsAndFilters(filters, {
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
        orderBy: [${InstructionsOrderBy.CreatedAtAsc}, ${InstructionsOrderBy.IdAsc}]
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
  filters: QueryArgs<InstructionAffirmation, InstructionAffirmationArgs>,
  size?: BigNumber,
  start?: BigNumber
): QueryOptions<PaginatedQueryArgs<QueryArgs<InstructionAffirmation, InstructionAffirmationArgs>>> {
  const { args, filter } = createArgsAndFilters(filters, {
    status: 'AffirmStatusEnum',
    isMediator: 'Boolean',
  });
  const query = gql`
    query InstructionAffirmationsQuery
      ${args}
      {
      instructionAffirmations(
        ${filter}
        first: $size
        offset: $start
        orderBy: [${InstructionAffirmationsOrderBy.CreatedAtAsc}, ${InstructionAffirmationsOrderBy.CreatedBlockIdAsc}]
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
  filters: QueryArgs<InstructionAffirmation, 'instructionId'>
): QueryOptions<QueryArgs<InstructionAffirmation, 'instructionId'>> {
  const query = gql`
    query InstructionAffirmationsQuery($instructionId: String!) {
      instructionAffirmations(
        filter: {
          instructionId: { equalTo: $instructionId }
          offChainReceiptExists: true
        }
        orderBy: [${InstructionAffirmationsOrderBy.CreatedAtAsc}, ${InstructionAffirmationsOrderBy.CreatedBlockIdAsc}]
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
export const buildInstructionPartiesFilter = async (
  filters: InstructionPartiesFilters,
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
  const instructionFilter = [];
  const legsFilter = [];
  const variables: InstructionPartiesVariables = {};

  if (identity) {
    args.push('$identity: String!');
    baseFilter.push('identity: { equalTo: $identity }');
    variables.identity = asDid(identity);
  }

  if (status) {
    args.push('$status: InstructionStatusEnum!');
    instructionFilter.push('status: { equalTo: $status }');
    variables.status = status;
  }

  if (mediator) {
    args.push('$mediator: String!');
    instructionFilter.push('mediators: { containsKey: $mediator }');
    variables.mediator = asDid(mediator);
  }

  if (party) {
    args.push('$party: String!');
    instructionFilter.push('parties: { some: { identity: { equalTo: $party } } }');
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
    instructionFilter.push(`legs: { ${legsFilter.join(', ')} }`);
  }

  if (instructionFilter.length) {
    baseFilter.push(`instruction: { ${instructionFilter.join(', ')} }`);
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
export async function instructionPartiesQuery(
  filters: InstructionPartiesFilters,
  context: Context
): Promise<QueryOptions<PaginatedQueryArgs<Omit<InstructionPartiesFilters, 'size' | 'start'>>>> {
  const { args, filter, variables } = await buildInstructionPartiesFilter(filters, context);

  const query = gql`
    query InstructionPartiesQuery
    ${args}
     {
      instructionParties(
        ${filter}
        orderBy: [${LegsOrderBy.CreatedAtAsc}, ${LegsOrderBy.InstructionIdAsc}]
        first: $size
        offset: $start
      ) {
        nodes {
          instruction {
            ${instructionAttributes}
          }
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
): QueryOptions<QueryArgs<Leg, LegArgs>> {
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
): QueryOptions<QueryArgs<Leg, LegArgs>> {
  const { args, filter, variables } = createLegFilters(filters, true);
  const query = buildSettlementsQuery(args, filter);

  return {
    query,
    variables,
  };
}
