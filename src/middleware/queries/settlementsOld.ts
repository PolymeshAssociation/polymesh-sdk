import { DocumentNode, QueryOptions } from '@apollo/client/core';
import BigNumber from 'bignumber.js';
import gql from 'graphql-tag';

import { createArgsAndFilters } from '~/middleware/queries/common';
import { InstructionsOrderBy, InstructionStatusEnum, Leg, LegsOrderBy } from '~/middleware/typesV6';
import { PaginatedQueryArgs, QueryArgs } from '~/types/utils';

type InstructionArgs = {
  id?: string;
  venueId?: string;
  status?: InstructionStatusEnum;
};

/**
 * @hidden
 *
 * Get a specific instruction within a venue for a specific event
 */
export function instructionsQuery(
  filters: InstructionArgs,
  size?: BigNumber,
  start?: BigNumber
): QueryOptions<PaginatedQueryArgs<InstructionArgs>> {
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
              toId
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
                toId
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
          instructionsByLegSettlementIdAndInstructionId {
            nodes {
              id
            }
          }
          result
          legs {
            nodes {
              fromId
              toId
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
