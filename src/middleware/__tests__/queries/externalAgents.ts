import BigNumber from 'bignumber.js';

import {
  tickerExternalAgentActionsQuery,
  tickerExternalAgentHistoryQuery,
  tickerExternalAgentsQuery,
} from '~/middleware/queries/externalAgents';
import { EventIdEnum } from '~/types';

describe('tickerExternalAgentsQuery', () => {
  it('should pass the variables to the grapqhl query', () => {
    const variables = {
      assetId: 'SOME_TICKER',
    };

    const result = tickerExternalAgentsQuery(variables);

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual(variables);
  });
});

describe('tickerExternalAgentHistoryQuery', () => {
  it('should pass the variables to the grapqhl query', () => {
    const variables = {
      assetId: 'SOME_TICKER',
    };

    const result = tickerExternalAgentHistoryQuery(variables);

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual(variables);
  });
});

describe('tickerExternalAgentActionsQuery', () => {
  it('should pass the variables to the grapqhl query', () => {
    let result = tickerExternalAgentActionsQuery({});

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual({});

    const variables = {
      assetId: 'SOME_TICKER',
      callerId: 'someDid',
      palletName: 'asset',
      eventId: EventIdEnum.ControllerTransfer,
    };

    result = tickerExternalAgentActionsQuery(variables);

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual(variables);

    result = tickerExternalAgentActionsQuery(variables, new BigNumber(1), new BigNumber(0));

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual({
      ...variables,
      size: 1,
      start: 0,
    });
  });
});
