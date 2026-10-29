import { QueryOptions } from '@apollo/client/core';
import BigNumber from 'bignumber.js';
import gql from 'graphql-tag';

import { createArgsAndFilters, getSizeAndOffset, orderByClause } from '~/middleware/queries/common';
import { EventIdEnum, EventsOrderBy, ModuleIdEnum } from '~/middleware/types';
import { PaginatedQueryArgs } from '~/types/utils';

export interface EventsByArgsFilters {
  moduleId: ModuleIdEnum;
  eventId: EventIdEnum;
  /**
   * what the event must involve, each as `<kind>:<value>`
   */
  refs?: string[] | undefined;
  /**
   * arguments the event's own must contain, keyed by field name
   */
  args?: Record<string, unknown> | undefined;
}

/**
 * @hidden
 *
 * Get events of one type by what they involve and by their arguments
 */
export function eventsByArgs(
  filters: EventsByArgsFilters,
  size?: BigNumber,
  start?: BigNumber,
  orderBy?: EventsOrderBy | EventsOrderBy[]
): QueryOptions<PaginatedQueryArgs<EventsByArgsFilters>> {
  // `args` is not indexed, so it is only ever filtered together with the event type
  const { args, filter } = createArgsAndFilters(filters as unknown as Record<string, unknown>, {
    moduleId: 'ModuleIdEnum',
    eventId: 'EventIdEnum',
    refs: { type: 'JSON', operator: 'contains' },
    args: { type: 'JSON', operator: 'contains' },
  });

  // `id` is `<block>/<event index>`, zero padded: block order, and unique
  const ordering = orderByClause(orderBy, [EventsOrderBy.IdAsc]);

  const query = gql`
    query EventsQuery
      ${args}
     {
      events(
        ${filter}
        orderBy: [${ordering}]
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
    variables: { ...filters, ...getSizeAndOffset(size, start) },
  };
}
