import BigNumber from 'bignumber.js';

import {
  tickerExternalAgentActionsQuery,
  tickerExternalAgentHistoryQuery,
  tickerExternalAgentsQuery,
} from '~/middleware/queries/externalAgents';
import { EventIdEnum } from '~/types';
import { DEFAULT_GQL_PAGE_SIZE } from '~/utils/constants';

describe('tickerExternalAgentsQuery', () => {
  it('should pass the variables to the grapqhl query', () => {
    const variables = {
      assetId: 'SOME_TICKER',
    };

    const result = tickerExternalAgentsQuery(false, variables);

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual(variables);
  });
});

describe('tickerExternalAgentHistoryQuery', () => {
  it('should pass the variables to the grapqhl query', () => {
    const variables = {
      assetId: 'SOME_TICKER',
    };

    const result = tickerExternalAgentHistoryQuery(false, variables);

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual(variables);
  });
});

describe('tickerExternalAgentActionsQuery', () => {
  it('should pass the variables to the grapqhl query', () => {
    let result = tickerExternalAgentActionsQuery(false, {});

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

    result = tickerExternalAgentActionsQuery(false, variables);

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual(variables);

    result = tickerExternalAgentActionsQuery(false, variables, new BigNumber(1), new BigNumber(0));

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual({
      ...variables,
      size: 1,
      start: 0,
    });
  });
});
