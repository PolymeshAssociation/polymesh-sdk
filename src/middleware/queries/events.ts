import { QueryOptions } from '@apollo/client/core';
import BigNumber from 'bignumber.js';
import gql from 'graphql-tag';

import { createArgsAndFilters, getSizeAndOffset, orderByClause } from '~/middleware/queries/common';
import { Event, EventsOrderBy } from '~/middleware/types';
import { PaginatedQueryArgs, QueryArgs } from '~/types/utils';

type EventArgs = 'moduleId' | 'eventId' | 'eventArg0' | 'eventArg1' | 'eventArg2';

/**
 * @hidden
 *
 * Get a single event by any of its indexed arguments
 */
export function eventsByArgs(
  filters: QueryArgs<Event, EventArgs>,
  size?: BigNumber,
  start?: BigNumber,
  orderBy?: EventsOrderBy | EventsOrderBy[]
): QueryOptions<PaginatedQueryArgs<QueryArgs<Event, EventArgs>>> {
  const { args, filter } = createArgsAndFilters(filters, {
    moduleId: 'ModuleIdEnum',
    eventId: 'EventIdEnum',
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
