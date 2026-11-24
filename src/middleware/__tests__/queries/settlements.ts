import BigNumber from 'bignumber.js';
import { print } from 'graphql';
import { when } from 'jest-when';

import { Context } from '~/internal';
import {
  buildHistoricalInstructionsQueryFilter,
  historicalInstructionsQuery,
  instructionAffirmationsQuery,
  instructionEventsQuery,
  instructionsQuery,
  legsQuery,
  offChainAffirmationsQuery,
  settlementsForAllPortfoliosQuery,
  settlementsQuery,
  withAllLegs,
} from '~/middleware/queries/settlements';
import { InstructionEventEnum, InstructionStatusEnum, LegTypeEnum } from '~/middleware/types';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';
import { DEFAULT_GQL_PAGE_SIZE } from '~/utils/constants';
import * as utilsInternalModule from '~/utils/internal';

describe('instructionsQuery', () => {
  it('should pass the variables to the grapqhl query, with ids padded as the middleware stores them', () => {
    let result = instructionsQuery({
      status: InstructionStatusEnum.Executed,
      id: new BigNumber(1),
    });

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual({
      status: InstructionStatusEnum.Executed,
      id: '0000000001',
      size: DEFAULT_GQL_PAGE_SIZE,
      start: 0,
    });

    result = instructionsQuery({ venueId: new BigNumber(12) }, new BigNumber(10), new BigNumber(2));

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual({
      venueId: '0000000012',
      size: 10,
      start: 2,
    });
  });

  it("should list an instruction's legs in leg index order", () => {
    // a leg's id is `<instruction>/<leg index>` unpadded, so id order puts leg 10 before leg 2
    const printed = print(instructionsQuery({ id: new BigNumber(1) }).query);

    expect(printed).toContain('legs(orderBy: [LEG_INDEX_ASC])');
  });
});

describe('instructionAffirmationsQuery', () => {
  it('should pad the instruction id, and keep the other filters', () => {
    const result = instructionAffirmationsQuery(
      { instructionId: new BigNumber(1590), isMediator: false },
      new BigNumber(5),
      new BigNumber(1)
    );

    expect(result.variables).toEqual({
      instructionId: '0000001590',
      isMediator: false,
      size: 5,
      start: 1,
    });
    expect(print(result.query)).toContain('orderBy: [CREATED_EVENT_ID_DESC, ID_DESC]');
  });
});

describe('offChainAffirmationsQuery', () => {
  it('should pad the instruction id', () => {
    const result = offChainAffirmationsQuery({ instructionId: new BigNumber(7) });

    expect(result.variables).toEqual({ instructionId: '0000000007' });
    expect(print(result.query)).toContain('offChainReceiptExists: true');
  });
});

describe('legsQuery', () => {
  it('should pad only the id keys, and leave another number in the filters as it is', () => {
    const legIndex = new BigNumber(2);
    const result = legsQuery({
      instructionId: new BigNumber(3),
      legIndex: legIndex as unknown as number,
    });

    expect(result.variables).toMatchObject({ instructionId: '0000000003', legIndex });
  });

  it('should pad the instruction id, and keep the leg filters as they are', () => {
    const result = legsQuery({
      instructionId: new BigNumber(3),
      legType: LegTypeEnum.OffChain,
      legIndex: 2,
    });

    expect(result.variables).toEqual({
      instructionId: '0000000003',
      legType: LegTypeEnum.OffChain,
      legIndex: 2,
    });
  });
});

describe('buildHistoricalInstructionsQueryFilter', () => {
  let context: Context;
  let getAssetIdForMiddlewareSpy: jest.SpyInstance;

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
    getAssetIdForMiddlewareSpy = jest
      .spyOn(utilsInternalModule, 'getAssetIdForMiddleware')
      .mockImplementation((a): Promise<string> => {
        return Promise.resolve(typeof a === 'string' ? a : a.id);
      });
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  it('should give the identity and the party a clause each, since a filter names a field once', async () => {
    const result = await buildHistoricalInstructionsQueryFilter(
      { identity: 'someDid', party: 'otherDid' },
      context
    );

    expect(result.filter).toBe(
      'filter: { and: [{ parties: { some: { identityId: { equalTo: $identity } } } }, { parties: { some: { identityId: { equalTo: $party } } } }] }'
    );
    expect(result.variables).toMatchObject({ identity: 'someDid', party: 'otherDid' });
  });

  it('should create the correct graphql filter with identity', async () => {
    const result = await buildHistoricalInstructionsQueryFilter({ identity: 'someDid' }, context);

    expect(result.args).toBe('($start: Int,$size: Int,$identity: String!)');
    expect(result.filter).toBe(
      'filter: { parties: { some: { identityId: { equalTo: $identity } } } }'
    );
  });

  it('should create the correct graphql filter with identity as Identity object', async () => {
    const did = 'someDid';
    const mockIdentity = entityMockUtils.getIdentityInstance({ did });
    const result = await buildHistoricalInstructionsQueryFilter(
      { identity: mockIdentity },
      context
    );

    expect(result.args).toBe('($start: Int,$size: Int,$identity: String!)');
    expect(result.filter).toBe(
      'filter: { parties: { some: { identityId: { equalTo: $identity } } } }'
    );
    expect(result.variables.identity).toBe(did);
  });

  it('should create the correct graphql filter with status', async () => {
    const result = await buildHistoricalInstructionsQueryFilter(
      { status: InstructionStatusEnum.Executed },
      context
    );

    expect(result.args).toBe('($start: Int,$size: Int,$status: InstructionStatusEnum!)');
    expect(result.filter).toBe('filter: { status: { equalTo: $status } }');
  });

  it('should create the correct graphql filter with mediator', async () => {
    const result = await buildHistoricalInstructionsQueryFilter(
      { mediator: 'someMediator' },
      context
    );

    expect(result.args).toBe('($start: Int,$size: Int,$mediator: String!)');
    expect(result.filter).toBe('filter: { mediators: { containsKey: $mediator } }');
  });

  it('should create the correct graphql filter with party', async () => {
    const result = await buildHistoricalInstructionsQueryFilter({ party: 'someParty' }, context);

    expect(result.args).toBe('($start: Int,$size: Int,$party: String!)');
    expect(result.filter).toBe(
      'filter: { parties: { some: { identityId: { equalTo: $party } } } }'
    );
  });

  it('should create the correct graphql filter with assetId', async () => {
    const result = await buildHistoricalInstructionsQueryFilter({ asset: 'TICKER' }, context);

    expect(result.args).toBe('($start: Int,$size: Int,$asset: String!)');
    expect(result.filter).toBe('filter: { legs: { some: { assetId: { equalTo: $asset } } } }');
  });

  it("should filter by the asset in the middleware's hex form, given an Asset object", async () => {
    const assetId = '12341234-1234-1234-1234-123412341234';
    const mockAsset = entityMockUtils.getFungibleAssetInstance({ assetId });
    when(getAssetIdForMiddlewareSpy)
      .calledWith(mockAsset, context)
      .mockResolvedValue('0x12341234123412341234123412341234');

    const result = await buildHistoricalInstructionsQueryFilter({ asset: mockAsset }, context);

    expect(result.args).toBe('($start: Int,$size: Int,$asset: String!)');
    expect(result.filter).toBe('filter: { legs: { some: { assetId: { equalTo: $asset } } } }');
    // the middleware stores a leg's asset id as hex, not as the SDK's UUID
    expect(result.variables.asset).toBe('0x12341234123412341234123412341234');
  });

  it('should create the correct graphql filter with sender', async () => {
    const result = await buildHistoricalInstructionsQueryFilter({ sender: 'someSender' }, context);

    expect(result.args).toBe('($start: Int,$size: Int,$sender: String!)');
    expect(result.filter).toBe('filter: { legs: { some: { fromId: { equalTo: $sender } } } }');
  });

  it('should create the correct graphql filter with receiver', async () => {
    const result = await buildHistoricalInstructionsQueryFilter(
      { receiver: 'someReceiver' },
      context
    );

    expect(result.args).toBe('($start: Int,$size: Int,$receiver: String!)');
    expect(result.filter).toBe('filter: { legs: { some: { toId: { equalTo: $receiver } } } }');
  });

  it('should create the correct graphql filter with multiple parameters', async () => {
    const result = await buildHistoricalInstructionsQueryFilter(
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
      'filter: { status: { equalTo: $status }, legs: { some: { assetId: { equalTo: $asset }, fromId: { equalTo: $sender } } }, parties: { some: { identityId: { equalTo: $identity } } } }'
    );
  });

  it('should return empty filter with default pagination when no parameters are provided', async () => {
    const result = await buildHistoricalInstructionsQueryFilter({}, context);

    expect(result.args).toBe('($start: Int,$size: Int)');
    expect(result.filter).toBe('');
    expect(result.variables.size).toBe(DEFAULT_GQL_PAGE_SIZE);
    expect(result.variables.start).toBe(0);
  });
});

describe('historicalInstructionsQuery', () => {
  let context: Context;

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
  });

  it('should pass the variables to the grapqhl query', async () => {
    const result = await historicalInstructionsQuery(
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
  it('should pass the variables to the grapqhl query, with the instruction id padded', () => {
    let result = instructionEventsQuery({
      event: InstructionEventEnum.InstructionExecuted,
      instructionId: new BigNumber(1),
    });
    expect(result.query).toBeDefined();
    expect(result.variables).toEqual({
      event: InstructionEventEnum.InstructionExecuted,
      instructionId: '0000000001',
      size: DEFAULT_GQL_PAGE_SIZE,
      start: 0,
    });

    result = instructionEventsQuery(
      {
        event: InstructionEventEnum.InstructionFailed,
        instructionId: new BigNumber(10),
      },
      new BigNumber(10),
      new BigNumber(2)
    );

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual({
      event: InstructionEventEnum.InstructionFailed,
      instructionId: '0000000010',
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

    const result = settlementsQuery(variables);

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual({
      addresses: ['someAddress'],
      assetId: '0x12341234123412341234123412341234',
      fromPortfolio: 'someDid/1',
      toPortfolio: 'someDid/1',
      size: DEFAULT_GQL_PAGE_SIZE,
      start: 0,
    });
    expect(print(result.query)).toContain('addresses: {contains: $addresses}');
    expect(print(result.query)).toContain('fromPortfolioId: {equalTo: $fromPortfolio}');
    expect(print(result.query)).toContain('legs: {some: {or:');
    expect(print(result.query)).toContain('instructions(');

    expect(settlementsQuery(variables, new BigNumber(10), new BigNumber(20)).variables).toEqual(
      expect.objectContaining({ size: 10, start: 20 })
    );
  });
});

describe('settlementsForAllPortfoliosQuery', () => {
  it('should pass the variables to the grapqhl query', () => {
    const variables = {
      identityId: 'someDid',
      assetId: '0x12341234123412341234123412341234',
      address: 'someAddress',
    };

    const result = settlementsForAllPortfoliosQuery(variables);

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual({
      addresses: ['someAddress'],
      assetId: '0x12341234123412341234123412341234',
      from: 'someDid',
      to: 'someDid',
      size: DEFAULT_GQL_PAGE_SIZE,
      start: 0,
    });
    expect(print(result.query)).toContain('fromId: {equalTo: $from}');
  });
});

describe('withAllLegs', () => {
  let context: Context;

  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  const legsUpTo = (count: number): { legIndex: number }[] =>
    Array.from({ length: count }, (_, legIndex) => ({ legIndex }));

  it('should keep the legs of an instruction that the middleware returned whole', async () => {
    const instruction = { id: '0000000001', legs: { nodes: legsUpTo(2), totalCount: 2 } };

    const result = await withAllLegs([instruction] as never[], context);

    expect(result).toEqual([instruction]);
    expect(context.queryMiddleware).not.toHaveBeenCalled();
  });

  it('should read every leg of an instruction the middleware cut short', async () => {
    const instructionId = new BigNumber(7);
    const whole = { id: '0000000001', legs: { nodes: legsUpTo(1), totalCount: 1 } };
    const cut = { id: '0000000007', legs: { nodes: legsUpTo(100), totalCount: 120 } };

    dsMockUtils.createApolloMultipleQueriesMock([
      {
        query: legsQuery({ instructionId }, new BigNumber(100), new BigNumber(0)),
        returnData: { legs: { nodes: legsUpTo(100), totalCount: 120 } },
      },
      {
        query: legsQuery({ instructionId }, new BigNumber(100), new BigNumber(100)),
        returnData: {
          legs: { nodes: legsUpTo(120).slice(100), totalCount: 120 },
        },
      },
    ]);

    const result = await withAllLegs([whole, cut] as never[], context);

    expect(result[0]).toBe(whole);
    expect(result[1]).toEqual({ ...cut, legs: { nodes: legsUpTo(120), totalCount: 120 } });
  });
});
