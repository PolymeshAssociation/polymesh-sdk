import BigNumber from 'bignumber.js';

import {
  instructionEventsQuery,
  instructionPartiesQuery,
  instructionsQuery,
  settlementsForAllPortfoliosQuery,
  settlementsQuery,
} from '~/middleware/queries/settlements';
import { InstructionEventEnum, InstructionStatusEnum } from '~/middleware/types';

describe('instructionsQuery', () => {
  it('should pass the variables to the grapqhl query', () => {
    const variables = {
      status: InstructionStatusEnum.Executed,
      id: '1',
    };

    let result = instructionsQuery(variables);

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual(variables);

    result = instructionsQuery(
      {
        venueId: '2',
      },
      new BigNumber(10),
      new BigNumber(2)
    );

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual({
      venueId: '2',
      size: 10,
      start: 2,
    });
  });
});

describe('instructionPartiesQuery', () => {
  it('should pass the variables to the grapqhl query', () => {
    const result = instructionPartiesQuery('someDid');
    expect(result.query).toBeDefined();
    expect(result.variables).toEqual({ identity: 'someDid' });
  });
});

describe('instructionEventsQuery', () => {
  it('should pass the variables to the grapqhl query', () => {
    const variables = {
      event: InstructionEventEnum.InstructionExecuted,
      instructionId: '1',
    };
    let result = instructionEventsQuery(variables);
    expect(result.query).toBeDefined();
    expect(result.variables).toEqual(variables);

    result = instructionEventsQuery(
      {
        event: InstructionEventEnum.InstructionFailed,
      },
      new BigNumber(10),
      new BigNumber(2)
    );

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual({
      event: InstructionEventEnum.InstructionFailed,
      size: 10,
      start: 2,
    });
  });
});

describe('settlementsQuery', () => {
  it('should pass the variables to the grapqhl query', () => {
    const variables = {
      identityId: 'someDid',
      portfolioId: new BigNumber(1),
      ticker: 'SOME_TICKER',
      address: 'someAddress',
    };

    const result = settlementsQuery(variables);

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual({
      addresses: ['someAddress'],
      assetId: 'SOME_TICKER',
      from: 'someDid',
      fromPortfolio: 1,
      to: 'someDid',
      toPortfolio: 1,
    });
  });
});

describe('settlementsForAllPortfoliosQuery', () => {
  it('should pass the variables to the grapqhl query', () => {
    const variables = {
      identityId: 'someDid',
      ticker: 'SOME_TICKER',
      address: 'someAddress',
    };

    const result = settlementsForAllPortfoliosQuery(variables);

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual({
      addresses: ['someAddress'],
      assetId: 'SOME_TICKER',
      from: 'someDid',
      to: 'someDid',
    });
  });
});
