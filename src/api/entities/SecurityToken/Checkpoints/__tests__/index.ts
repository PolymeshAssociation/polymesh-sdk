import BigNumber from 'bignumber.js';
import { Ticker } from 'polymesh-types/types';
import sinon, { SinonStub } from 'sinon';

import { Checkpoint, Context, createCheckpoint, Namespace, TransactionQueue } from '~/internal';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';
import { tuple } from '~/types/utils';
import * as utilsConversionModule from '~/utils/conversion';

import { Checkpoints } from '../';

jest.mock(
  '~/api/entities/Checkpoint',
  require('~/testUtils/mocks/entities').mockCheckpointModule('~/api/entities/Checkpoint')
);
jest.mock(
  '~/api/entities/CheckpointSchedule',
  require('~/testUtils/mocks/entities').mockCheckpointScheduleModule(
    '~/api/entities/CheckpointSchedule'
  )
);

describe('Checkpoints class', () => {
  let context: Context;
  let checkpoints: Checkpoints;

  let ticker: string;

  let stringToTickerStub: SinonStub<[string, Context], Ticker>;

  beforeAll(() => {
    entityMockUtils.initMocks();
    dsMockUtils.initMocks();

    ticker = 'SOME_TICKER';

    stringToTickerStub = sinon.stub(utilsConversionModule, 'stringToTicker');
  });

  afterEach(() => {
    entityMockUtils.reset();
    dsMockUtils.reset();

    context = dsMockUtils.getContextInstance();

    const token = entityMockUtils.getSecurityTokenInstance({ ticker });
    checkpoints = new Checkpoints(token, context);
  });

  afterAll(() => {
    entityMockUtils.cleanup();
    dsMockUtils.cleanup();
  });

  test('should extend namespace', () => {
    expect(Checkpoints.prototype instanceof Namespace).toBe(true);
  });

  describe('method: create', () => {
    afterAll(() => {
      sinon.restore();
    });

    test('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<Checkpoint>;

      sinon
        .stub(createCheckpoint, 'prepare')
        .withArgs({ args: { ticker }, transformer: undefined }, context)
        .resolves(expectedQueue);

      const queue = await checkpoints.create();

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: get', () => {
    afterAll(() => {
      sinon.restore();
    });

    test('should return all created checkpoints with their timestamps', async () => {
      const timestamps = [1000, 2000, new Date().getTime() + 10000];
      const ids = [1, 2, 3];
      const rawTicker = dsMockUtils.createMockTicker(ticker);

      dsMockUtils.createQueryStub('checkpoint', 'timestamps', {
        entries: timestamps.map((timestamp, index) =>
          tuple(
            [rawTicker, dsMockUtils.createMockU64(ids[index])],
            dsMockUtils.createMockMoment(timestamp)
          )
        ),
      });

      stringToTickerStub.withArgs(ticker, context).returns(rawTicker);

      const result = await checkpoints.get();

      expect(result).toEqual(
        timestamps.slice(0, -1).map((timestamp, index) => ({
          checkpoint: entityMockUtils.getCheckpointInstance({ id: new BigNumber(ids[index]) }),
          createdAt: new Date(timestamp),
        }))
      );
    });
  });
});
