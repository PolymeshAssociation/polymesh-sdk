import { QueryOptions } from '@apollo/client/core';
import BigNumber from 'bignumber.js';
import gql from 'graphql-tag';

import { createArgsAndFilters, getSizeAndOffset } from '~/middleware/queries/common';
import { Event, EventsOrderBy } from '~/middleware/types';
import { PaginatedQueryArgs, QueryArgs } from '~/types/utils';

type EventArgs = 'moduleId' | 'eventId' | 'eventArg0' | 'eventArg1' | 'eventArg2';

/**
 * @hidden
 *
 * Get a single event by any of its indexed arguments
 */
export function eventsByArgs(
  paddedIds: boolean,
  filters: QueryArgs<Event, EventArgs>,
  size?: BigNumber,
  start?: BigNumber
): QueryOptions<PaginatedQueryArgs<QueryArgs<Event, EventArgs>>> {
  const { args, filter } = createArgsAndFilters(filters, {
    moduleId: 'ModuleIdEnum',
    eventId: 'EventIdEnum',
  });

  const orderBy = paddedIds
    ? `${EventsOrderBy.BlockIdAsc}`
    : `${EventsOrderBy.CreatedAtAsc}, ${EventsOrderBy.BlockIdAsc}`;

  const query = gql`
    query EventsQuery
      ${args}
     {
      events(
        ${filter}
        orderBy: [${orderBy}]
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
