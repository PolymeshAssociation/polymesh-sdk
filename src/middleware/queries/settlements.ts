import { DocumentNode, QueryOptions } from '@apollo/client/core';
import BigNumber from 'bignumber.js';
import gql from 'graphql-tag';

import { createArgsAndFilters } from '~/middleware/queries/common';
import {
  Instruction,
  InstructionEvent,
  InstructionEventsOrderBy,
  InstructionParty,
  InstructionsOrderBy,
  InstructionStatusEnum,
  Leg,
  LegsOrderBy,
} from '~/middleware/types';
import { PaginatedQueryArgs, QueryArgs } from '~/types/utils';

const instructionAttributes = `
          id
          venueId
          status
          type
          endBlock
          endAfterBlock
          tradeDate
          valueDate
          legs {
            nodes {
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

type InstructionArgs = 'id' | 'venueId' | 'status';

/**
 * Filters for instructions
 *
 */
export interface InstructionPartiesFilters {
  /**
   * The DID of the identity to filter by
   */
  identity?: string;
  /**
   * The asset ID to filter by
   */
  assetId?: string;
  /**
   * The ticker to filter by
   */
  ticker?: string;
  /**
   * The status to filter by
   */
  status?: InstructionStatusEnum;
  /**
   * The sender did to filter by
   */
  sender?: string;
  /**
   * The receiver did to filter by
   */
  receiver?: string;
  /**
   * The mediator did to filter by
   */
  mediator?: string;
  /**
   * The party did to filter by
   */
  party?: string;
}

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
    variables: { ...filters, size: size?.toNumber(), start: start?.toNumber() },
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
        orderBy: [${InstructionsOrderBy.CreatedAtDesc}, ${InstructionsOrderBy.IdDesc}]
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
    variables: { ...filters, size: size?.toNumber(), start: start?.toNumber() },
  };
}

/**
 * @hidden
 *
 */
export const buildInstructionPartiesFilter = (filters: InstructionPartiesFilters) => {
  const { identity, assetId, ticker, status, sender, receiver, mediator, party } = filters;

  const args = [];
  const baseFilter = [];
  const instructionFilter = [];
  const legsFilter = [];

  if (identity) {
    args.push('$identity: String!');
    baseFilter.push('identity: { equalTo: $identity }');
  }

  if (status) {
    args.push('$status: InstructionStatusEnum!');
    instructionFilter.push('status: { equalTo: $status }');
  }

  if (mediator) {
    args.push('$mediator: String!');
    instructionFilter.push('mediators: { containsKey: $mediator }');
  }

  if (party) {
    args.push('$party: String!');
    instructionFilter.push('parties: { some: { identity: { equalTo: $party } } }');
  }

  if (assetId) {
    args.push('$assetId: String!');
    legsFilter.push('assetId: { equalTo: $assetId }');
  }

  if (ticker) {
    args.push('$ticker: String!');
    legsFilter.push('ticker: { equalTo: $ticker }');
  }

  if (sender) {
    args.push('$sender: String!');
    legsFilter.push('from: { equalTo: $sender }');
  }

  if (receiver) {
    args.push('$receiver: String!');
    legsFilter.push('to: { equalTo: $receiver }');
  }

  if (legsFilter.length) {
    instructionFilter.push(`legs: { ${legsFilter.join(', ')} }`);
  }

  if (instructionFilter.length) {
    baseFilter.push(`instruction: { ${instructionFilter.join(', ')} }`);
  }

  return {
    args: args.length ? `(${args.join()})` : '',
    filter: baseFilter.length ? `filter: { ${baseFilter.join(', ')} }` : '',
  };
};

/**
 * @hidden
 *
 * Get Instructions where an identity is involved
 */
export function instructionPartiesQuery(
  filters: InstructionPartiesFilters,
  size?: BigNumber,
  start?: BigNumber
): QueryOptions<PaginatedQueryArgs<QueryArgs<InstructionParty, 'identity'>>> {
  const { args, filter } = buildInstructionPartiesFilter(filters);

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
