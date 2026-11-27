import BigNumber from 'bignumber.js';
import { print } from 'graphql';

import {
  assetAgentActionsQuery,
  assetAgentHistoryQuery,
  assetAgentQuery,
} from '~/middleware/queries/externalAgents';
import { EventIdEnum } from '~/types';
import { DEFAULT_GQL_PAGE_SIZE } from '~/utils/constants';

describe('assetAgentQuery', () => {
  it('should pass the variables to the grapqhl query', () => {
    const variables = {
      assetId: 'SOME_TICKER',
      identityId: 'someDid',
    };

    const result = assetAgentQuery(variables);

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual(variables);
  });

  it("should filter by the agent's Identity as well as the Asset", () => {
    const { query } = assetAgentQuery({ assetId: 'SOME_TICKER', identityId: 'someDid' });

    expect(print(query)).toContain('identityId: {equalTo: $identityId}');
  });
});

describe('assetAgentHistoryQuery', () => {
  it('should pass the variables to the grapqhl query', () => {
    const variables = {
      assetId: 'SOME_TICKER',
    };

    let result = assetAgentHistoryQuery(variables);

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual({ ...variables, size: DEFAULT_GQL_PAGE_SIZE, start: 0 });
    expect(print(result.query)).toContain('orderBy: [CREATED_EVENT_ID_ASC, ID_ASC]');
    expect(print(result.query)).toContain('totalCount');

    result = assetAgentHistoryQuery(variables, new BigNumber(100), new BigNumber(200));

    expect(result.variables).toEqual({ ...variables, size: 100, start: 200 });
  });
});

describe('assetAgentActionsQuery', () => {
  it('should pass the variables to the grapqhl query', () => {
    let result = assetAgentActionsQuery({});

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual({ size: DEFAULT_GQL_PAGE_SIZE, start: 0 });

    const variables = {
      assetId: 'SOME_TICKER',
      callerId: 'someDid',
      palletName: 'asset',
      eventId: EventIdEnum.ControllerTransfer,
      size: DEFAULT_GQL_PAGE_SIZE,
      start: 0,
    };

    result = assetAgentActionsQuery(variables);

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual(variables);

    result = assetAgentActionsQuery(variables, new BigNumber(1), new BigNumber(0));

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual({
      ...variables,
      size: 1,
      start: 0,
    });
  });
});
