import BigNumber from 'bignumber.js';

import { eventsByArgs } from '~/middleware/queries/events';
import { EventIdEnum, ModuleIdEnum } from '~/middleware/types';
import { DEFAULT_GQL_PAGE_SIZE } from '~/utils/constants';

describe('eventsByArgs', () => {
  it('should pass the variables to the grapqhl query', () => {
    let result = eventsByArgs({});

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual({ size: DEFAULT_GQL_PAGE_SIZE, start: 0 });

    const variables = {
      moduleId: ModuleIdEnum.Asset,
      eventId: EventIdEnum.AssetCreated,
      eventArg0: 'TICKER',
      size: DEFAULT_GQL_PAGE_SIZE,
      start: 0,
    };

    result = eventsByArgs(variables);

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual(variables);

    result = eventsByArgs(variables, new BigNumber(1), new BigNumber(0));

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual({
      ...variables,
      size: 1,
      start: 0,
    });
  });
});
