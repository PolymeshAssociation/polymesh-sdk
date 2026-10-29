import BigNumber from 'bignumber.js';
import { print } from 'graphql';

import { eventsByArgs } from '~/middleware/queries/events';
import { EventIdEnum, ModuleIdEnum } from '~/middleware/types';
import { DEFAULT_GQL_PAGE_SIZE } from '~/utils/constants';

describe('eventsByArgs', () => {
  const eventType = { moduleId: ModuleIdEnum.Asset, eventId: EventIdEnum.AssetCreated };

  it('should pass the variables to the grapqhl query', () => {
    let result = eventsByArgs(eventType);

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual({ ...eventType, size: DEFAULT_GQL_PAGE_SIZE, start: 0 });

    const variables = {
      ...eventType,
      refs: ['identity:someDid'],
      args: { assetId: '0x01' },
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

  it('should match refs and args by containment', () => {
    const { query } = eventsByArgs({
      ...eventType,
      refs: ['identity:someDid'],
      args: { assetId: '0x01' },
    });

    expect(print(query)).toContain('refs: {contains: $refs}');
    expect(print(query)).toContain('args: {contains: $args}');
    expect(print(query)).toContain('$refs: JSON!');
    expect(print(query)).toContain('$args: JSON!');
  });

  it('should leave out the filters that are not given', () => {
    const { query } = eventsByArgs(eventType);

    expect(print(query)).not.toContain('refs:');
    expect(print(query)).not.toContain('args:');
  });
});
