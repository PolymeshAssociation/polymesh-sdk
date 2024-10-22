import BigNumber from 'bignumber.js';

import {
  buildInstructionPartiesFilter,
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

describe('buildInstructionPartiesFilter', () => {
  it('should create the correct graphql filter with identity', () => {
    const result = buildInstructionPartiesFilter({ identity: 'someDid' });

    expect(result.args).toBe('($identity: String!)');
    expect(result.filter).toBe('filter: { identity: { equalTo: $identity } }');
  });

  it('should create the correct graphql filter with status', () => {
    const result = buildInstructionPartiesFilter({ status: InstructionStatusEnum.Executed });

    expect(result.args).toBe('($status: InstructionStatusEnum!)');
    expect(result.filter).toBe('filter: { instruction: { status: { equalTo: $status } } }');
  });

  it('should create the correct graphql filter with mediator', () => {
    const result = buildInstructionPartiesFilter({ mediator: 'someMediator' });

    expect(result.args).toBe('($mediator: String!)');
    expect(result.filter).toBe(
      'filter: { instruction: { mediators: { containsKey: $mediator } } }'
    );
  });

  it('should create the correct graphql filter with party', () => {
    const result = buildInstructionPartiesFilter({ party: 'someParty' });

    expect(result.args).toBe('($party: String!)');
    expect(result.filter).toBe(
      'filter: { instruction: { parties: { some: { identity: { equalTo: $party } } } } }'
    );
  });

  it('should create the correct graphql filter with assetId', () => {
    const result = buildInstructionPartiesFilter({ assetId: 'someAssetId' });

    expect(result.args).toBe('($assetId: String!)');
    expect(result.filter).toBe(
      'filter: { instruction: { legs: { assetId: { equalTo: $assetId } } } }'
    );
  });

  it('should create the correct graphql filter with ticker', () => {
    const result = buildInstructionPartiesFilter({ ticker: 'someTicker' });

    expect(result.args).toBe('($ticker: String!)');
    expect(result.filter).toBe(
      'filter: { instruction: { legs: { ticker: { equalTo: $ticker } } } }'
    );
  });

  it('should create the correct graphql filter with sender', () => {
    const result = buildInstructionPartiesFilter({ sender: 'someSender' });

    expect(result.args).toBe('($sender: String!)');
    expect(result.filter).toBe('filter: { instruction: { legs: { from: { equalTo: $sender } } } }');
  });

  it('should create the correct graphql filter with receiver', () => {
    const result = buildInstructionPartiesFilter({ receiver: 'someReceiver' });

    expect(result.args).toBe('($receiver: String!)');
    expect(result.filter).toBe('filter: { instruction: { legs: { to: { equalTo: $receiver } } } }');
  });

  it('should create the correct graphql filter with multiple parameters', () => {
    const result = buildInstructionPartiesFilter({
      identity: 'someDid',
      status: InstructionStatusEnum.Executed,
      assetId: 'someAssetId',
      sender: 'someSender',
    });

    expect(result.args).toBe(
      '($identity: String!,$status: InstructionStatusEnum!,$assetId: String!,$sender: String!)'
    );
    expect(result.filter).toBe(
      'filter: { identity: { equalTo: $identity }, instruction: { status: { equalTo: $status }, legs: { assetId: { equalTo: $assetId }, from: { equalTo: $sender } } } }'
    );
  });

  it('should return empty filter when no parameters are provided', () => {
    const result = buildInstructionPartiesFilter({});

    expect(result.args).toBe('');
    expect(result.filter).toBe('');
  });
});

describe('instructionPartiesQuery', () => {
  it('should pass the variables to the grapqhl query', () => {
    const result = instructionPartiesQuery(
      { identity: 'someDid' },
      new BigNumber(10),
      new BigNumber(2)
    );
    expect(result.query).toBeDefined();
    expect(result.variables).toEqual({
      identity: 'someDid',
      size: 10,
      start: 2,
    });
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
      assetId: '0x1234',
      address: 'someAddress',
    };

    const result = settlementsQuery(variables);

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual({
      addresses: ['someAddress'],
      assetId: '0x1234',
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
      assetId: '0x1234',
      address: 'someAddress',
    };

    const result = settlementsForAllPortfoliosQuery(variables);

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual({
      addresses: ['someAddress'],
      assetId: '0x1234',
      from: 'someDid',
      to: 'someDid',
    });
  });
});
