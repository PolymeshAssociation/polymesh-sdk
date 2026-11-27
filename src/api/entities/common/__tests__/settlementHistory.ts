import BigNumber from 'bignumber.js';

import { getSettlementHistory } from '~/api/entities/common/settlementHistory';
import { Context } from '~/internal';
import * as settlementsQueriesModule from '~/middleware/queries/settlements';
import { InstructionStatusEnum, LegTypeEnum } from '~/middleware/types';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';
import * as utilsInternalModule from '~/utils/internal';

describe('getSettlementHistory', () => {
  let context: Context;
  let queryMiddlewarePagesSpy: jest.SpyInstance;
  let withAllLegsSpy: jest.SpyInstance;

  const assetId = '0x12341234123412341234123412341234';
  const queries = { instructions: jest.fn(), transfers: jest.fn() };

  const event = (blockId: number, eventIdx: number): Record<string, unknown> => ({
    eventIdx,
    block: { blockId, hash: `hash${blockId}` },
  });

  const instruction = (id: number, blockId: number, eventIdx: number): Record<string, unknown> => ({
    id: `${id}`.padStart(10, '0'),
    status: InstructionStatusEnum.Executed,
    createdEvent: event(blockId, eventIdx),
    legs: {
      nodes: [
        {
          legType: LegTypeEnum.Fungible,
          assetId,
          amount: '1000000',
          fromId: 'me',
          fromPortfolioId: 'me/0',
          toId: 'other',
          toPortfolioId: 'other/0',
          addresses: [],
        },
      ],
      totalCount: 1,
    },
  });

  const transfer = (blockId: number, eventIdx: number): Record<string, unknown> => ({
    createdEvent: event(blockId, eventIdx),
    assetId,
    amount: '1000000',
    fromIdentityId: 'me',
    fromPortfolioId: 'me/0',
    toIdentityId: 'me',
    toPortfolioId: 'me/1',
    address: null,
  });

  // chain order: instruction 1 (block 1), transfer (block 2, event 1), instruction 2 (block 2,
  // event 3), transfer (block 3, event 0), instruction 3 (block 4)
  const instructions = [instruction(1, 1, 0), instruction(2, 2, 3), instruction(3, 4, 0)];
  const transfers = [transfer(2, 1), transfer(3, 0)];

  const describeRow = ({
    instruction: rowInstruction,
    blockNumber,
  }: {
    instruction?: { id: BigNumber };
    blockNumber: BigNumber;
  }): string => (rowInstruction ? `i${rowInstruction.id}` : `t${blockNumber}`);

  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();
    queryMiddlewarePagesSpy = jest.spyOn(utilsInternalModule, 'queryMiddlewarePages');
    withAllLegsSpy = jest.spyOn(settlementsQueriesModule, 'withAllLegs');
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
    queryMiddlewarePagesSpy.mockImplementation((_context, _query, key, limit: BigNumber) => {
      const nodes = key === 'instructions' ? instructions : transfers;

      return Promise.resolve({ nodes: nodes.slice(0, limit.toNumber()), totalCount: nodes.length });
    });
    withAllLegsSpy.mockImplementation(nodes => Promise.resolve(nodes));
  });

  afterEach(() => {
    dsMockUtils.reset();
    entityMockUtils.reset();
    jest.clearAllMocks();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
    jest.restoreAllMocks();
  });

  it('should merge instructions and transfers in chain order', async () => {
    const result = await getSettlementHistory(context, queries, { identityId: 'me' });

    expect(result.data.map(describeRow)).toEqual(['i1', 't2', 'i2', 't3', 'i3']);
    expect(result.count).toEqual(new BigNumber(5));
    expect(result.next).toBeNull();
  });

  it('should read each connection up to the end of the page, and return that page', async () => {
    const result = await getSettlementHistory(
      context,
      queries,
      { identityId: 'me', portfolio: 0 },
      { size: new BigNumber(2), start: new BigNumber(1) }
    );

    expect(result.data.map(describeRow)).toEqual(['t2', 'i2']);
    expect(result.next).toEqual(new BigNumber(3));
    expect(result.count).toEqual(new BigNumber(5));
    expect(queryMiddlewarePagesSpy).toHaveBeenCalledWith(
      context,
      queries.instructions,
      'instructions',
      new BigNumber(3)
    );
    expect(queryMiddlewarePagesSpy).toHaveBeenCalledWith(
      context,
      queries.transfers,
      'assetTransactions',
      new BigNumber(3)
    );
  });

  it('should give all their legs to the instructions on the page only', async () => {
    await getSettlementHistory(
      context,
      queries,
      { identityId: 'me' },
      { size: new BigNumber(2), start: new BigNumber(2) }
    );

    expect(withAllLegsSpy).toHaveBeenCalledWith([instructions[1]], context);
  });
});
