import { QueryOptions } from '@apollo/client/core';
import BigNumber from 'bignumber.js';
import gql from 'graphql-tag';

import {
  createArgsAndFilters,
  eventIdentifierFields,
  getSizeAndOffset,
  orderByClause,
} from '~/middleware/queries/common';
import {
  AssetAgent,
  AssetAgentAction,
  AssetAgentActionsOrderBy,
  AssetAgentHistoriesOrderBy,
  AssetAgentHistory,
} from '~/middleware/types';
import { PaginatedQueryArgs, QueryArgs } from '~/types/utils';

/**
 * @hidden
 *
 * Get the event in which an Identity became an agent of an Asset
 */
export function assetAgentQuery(
  variables: Required<QueryArgs<AssetAgent, 'assetId' | 'identityId'>>
): QueryOptions<QueryArgs<AssetAgent, 'assetId' | 'identityId'>> {
  const query = gql`
    query AssetAgentQuery($assetId: String!, $identityId: String!) {
      assetAgents(
        filter: { assetId: { equalTo: $assetId }, identityId: { equalTo: $identityId } }
      ) {
        nodes {
          identityId
          createdEvent {
            ${eventIdentifierFields}
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
 * Get the agent history of an Asset
 */
export function assetAgentHistoryQuery(
  variables: QueryArgs<AssetAgentHistory, 'assetId'>
): QueryOptions<QueryArgs<AssetAgentHistory, 'assetId'>> {
  const orderBy = `${AssetAgentHistoriesOrderBy.CreatedEventIdAsc}`;

  const query = gql`
    query AssetAgentHistoryQuery($assetId: String!) {
      assetAgentHistories(
        filter: { assetId: { equalTo: $assetId } }
        orderBy: [${orderBy}]
      ) {
        nodes {
          identityId
          assetId
          type
          permissions
          createdEvent {
            ${eventIdentifierFields}
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

type AssetAgentActionArgs = 'assetId' | 'callerId' | 'palletName' | 'eventId';

/**
 * @hidden
 *
 * Get list of Events triggered by actions (from the set of actions that can only be performed by external agents) that have been performed on a specific Asset
 */
export function assetAgentActionsQuery(
  filters: QueryArgs<AssetAgentAction, AssetAgentActionArgs>,
  size?: BigNumber,
  start?: BigNumber,
  orderBy?: AssetAgentActionsOrderBy | AssetAgentActionsOrderBy[]
): QueryOptions<PaginatedQueryArgs<QueryArgs<AssetAgentAction, AssetAgentActionArgs>>> {
  const { args, filter } = createArgsAndFilters(filters, { eventId: 'EventIdEnum' });

  // `createdEventId` is `<block>/<event index>`, zero padded: block order, and unique
  const ordering = orderByClause(orderBy, [AssetAgentActionsOrderBy.CreatedEventIdDesc]);

  const query = gql`
    query AssetAgentActionsQuery
      ${args}
     {
      assetAgentActions(
        ${filter}
        first: $size
        offset: $start
        orderBy: [${ordering}]
      ) {
        totalCount
        nodes {
          assetId
          callerId
          palletName
          eventId
          createdEvent {
            ${eventIdentifierFields}
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
