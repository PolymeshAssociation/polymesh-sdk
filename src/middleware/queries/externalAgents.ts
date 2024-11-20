import { QueryOptions } from '@apollo/client/core';
import BigNumber from 'bignumber.js';
import gql from 'graphql-tag';

import { createArgsAndFilters, getSizeAndOffset } from '~/middleware/queries/common';
import {
  TickerExternalAgent,
  TickerExternalAgentAction,
  TickerExternalAgentActionsOrderBy,
  TickerExternalAgentHistoriesOrderBy,
  TickerExternalAgentHistory,
  TickerExternalAgentsOrderBy,
} from '~/middleware/types';
import { PaginatedQueryArgs, QueryArgs } from '~/types/utils';

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
    variables: { ...filters, ...getSizeAndOffset(size, start) },
  };
}
