import BigNumber from 'bignumber.js';

import { Context } from '~/internal';
import {
  buildInstructionPartiesFilter,
  instructionEventsQuery,
  instructionPartiesQuery,
  instructionsQuery,
  settlementsForAllPortfoliosQuery,
  settlementsQuery,
} from '~/middleware/queries/settlements';
import { InstructionEventEnum, InstructionStatusEnum } from '~/middleware/types';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';
import { DEFAULT_GQL_PAGE_SIZE } from '~/utils/constants';
import * as utilsInternalModule from '~/utils/internal';

describe('instructionsQuery', () => {
  it('should pass the variables to the grapqhl query', () => {
    const variables = {
      status: InstructionStatusEnum.Executed,
      id: '1',
      size: DEFAULT_GQL_PAGE_SIZE,
      start: 0,
    };

    let result = instructionsQuery(false, variables);

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual(variables);

    result = instructionsQuery(
      true,
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
  let context: Context;

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
    jest.spyOn(utilsInternalModule, 'asAssetId').mockImplementation((a): Promise<string> => {
      return Promise.resolve(typeof a === 'string' ? a : a.id);
    });
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  it('should create the correct graphql filter with identity', async () => {
    const result = await buildInstructionPartiesFilter({ identity: 'someDid' }, context);

    expect(result.args).toBe('($start: Int,$size: Int,$identity: String!)');
    expect(result.filter).toBe('filter: { identity: { equalTo: $identity } }');
  });

  it('should create the correct graphql filter with identity as Identity object', async () => {
    const did = 'someDid';
    const mockIdentity = entityMockUtils.getIdentityInstance({ did });
    const result = await buildInstructionPartiesFilter({ identity: mockIdentity }, context);

    expect(result.args).toBe('($start: Int,$size: Int,$identity: String!)');
    expect(result.filter).toBe('filter: { identity: { equalTo: $identity } }');
    expect(result.variables.identity).toBe(did);
  });

  it('should create the correct graphql filter with status', async () => {
    const result = await buildInstructionPartiesFilter(
      { status: InstructionStatusEnum.Executed },
      context
    );

    expect(result.args).toBe('($start: Int,$size: Int,$status: InstructionStatusEnum!)');
    expect(result.filter).toBe('filter: { instruction: { status: { equalTo: $status } } }');
  });

  it('should create the correct graphql filter with mediator', async () => {
    const result = await buildInstructionPartiesFilter({ mediator: 'someMediator' }, context);

    expect(result.args).toBe('($start: Int,$size: Int,$mediator: String!)');
    expect(result.filter).toBe(
      'filter: { instruction: { mediators: { containsKey: $mediator } } }'
    );
  });

  it('should create the correct graphql filter with party', async () => {
    const result = await buildInstructionPartiesFilter({ party: 'someParty' }, context);

    expect(result.args).toBe('($start: Int,$size: Int,$party: String!)');
    expect(result.filter).toBe(
      'filter: { instruction: { parties: { some: { identity: { equalTo: $party } } } } }'
    );
  });

  it('should create the correct graphql filter with assetId', async () => {
    const result = await buildInstructionPartiesFilter({ asset: 'TICKER' }, context);

    expect(result.args).toBe('($start: Int,$size: Int,$asset: String!)');
    expect(result.filter).toBe(
      'filter: { instruction: { legs: { assetId: { equalTo: $asset } } } }'
    );
  });

  it('should create the correct graphql filter with asset as Asset object', async () => {
    const assetId = 'TICKE';
    const mockAsset = entityMockUtils.getFungibleAssetInstance({ assetId });
    const result = await buildInstructionPartiesFilter({ asset: mockAsset }, context);

    expect(result.args).toBe('($start: Int,$size: Int,$asset: String!)');
    expect(result.filter).toBe(
      'filter: { instruction: { legs: { assetId: { equalTo: $asset } } } }'
    );
    expect(result.variables.asset).toBe(assetId);
  });

  it('should create the correct graphql filter with sender', async () => {
    const result = await buildInstructionPartiesFilter({ sender: 'someSender' }, context);

    expect(result.args).toBe('($start: Int,$size: Int,$sender: String!)');
    expect(result.filter).toBe('filter: { instruction: { legs: { from: { equalTo: $sender } } } }');
  });

  it('should create the correct graphql filter with receiver', async () => {
    const result = await buildInstructionPartiesFilter({ receiver: 'someReceiver' }, context);

    expect(result.args).toBe('($start: Int,$size: Int,$receiver: String!)');
    expect(result.filter).toBe('filter: { instruction: { legs: { to: { equalTo: $receiver } } } }');
  });

  it('should create the correct graphql filter with multiple parameters', async () => {
    const result = await buildInstructionPartiesFilter(
      {
        identity: 'someDid',
        status: InstructionStatusEnum.Executed,
        asset: 'TICKER',
        sender: 'someSender',
      },
      context
    );

    expect(result.args).toBe(
      '($start: Int,$size: Int,$identity: String!,$status: InstructionStatusEnum!,$asset: String!,$sender: String!)'
    );
    expect(result.filter).toBe(
      'filter: { identity: { equalTo: $identity }, instruction: { status: { equalTo: $status }, legs: { assetId: { equalTo: $asset }, from: { equalTo: $sender } } } }'
    );
  });

  it('should return empty filter with default pagination when no parameters are provided', async () => {
    const result = await buildInstructionPartiesFilter({}, context);

    expect(result.args).toBe('($start: Int,$size: Int)');
    expect(result.filter).toBe('');
    expect(result.variables.size).toBe(DEFAULT_GQL_PAGE_SIZE);
    expect(result.variables.start).toBe(0);
  });
});

describe('instructionPartiesQuery', () => {
  let context: Context;

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
  });

  it('should pass the variables to the grapqhl query', async () => {
    const result = await instructionPartiesQuery(
      {
        identity: 'someDid',
        size: new BigNumber(10),
        start: new BigNumber(2),
      },
      context
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
      size: DEFAULT_GQL_PAGE_SIZE,
      start: 0,
    };
    let result = instructionEventsQuery(false, variables);
    expect(result.query).toBeDefined();
    expect(result.variables).toEqual(variables);

    result = instructionEventsQuery(
      true,
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
      assetId: '0x12341234123412341234123412341234',
      address: 'someAddress',
    };

    const result = settlementsQuery(false, variables);

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual({
      addresses: ['someAddress'],
      assetId: '0x12341234123412341234123412341234',
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
      assetId: '0x12341234123412341234123412341234',
      address: 'someAddress',
    };

    const result = settlementsForAllPortfoliosQuery(false, variables);

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual({
      addresses: ['someAddress'],
      assetId: '0x12341234123412341234123412341234',
      from: 'someDid',
      to: 'someDid',
    });
  });
});
