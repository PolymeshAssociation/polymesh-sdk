import { StorageKey } from '@polkadot/types';
import BigNumber from 'bignumber.js';
import sinon from 'sinon';

import { Checkpoint, Context, Namespace, TransactionQueue } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { tuple } from '~/types/utils';
import * as utilsConversionModule from '~/utils/conversion';
import * as utilsInternalModule from '~/utils/internal';

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
jest.mock(
  '~/base/Procedure',
  require('~/testUtils/mocks/procedure').mockProcedureModule('~/base/Procedure')
);

describe('Checkpoints class', () => {
  const ticker = 'SOME_TICKER';

  let checkpoints: Checkpoints;
  let context: Context;

  beforeAll(() => {
    entityMockUtils.initMocks();
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
  });

  afterEach(() => {
    entityMockUtils.reset();
    dsMockUtils.reset();
    procedureMockUtils.reset();

    context = dsMockUtils.getContextInstance();
    const token = entityMockUtils.getSecurityTokenInstance({ ticker });
    checkpoints = new Checkpoints(token, context);
  });

  afterAll(() => {
    entityMockUtils.cleanup();
    dsMockUtils.cleanup();
    procedureMockUtils.cleanup();
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

      procedureMockUtils
        .getPrepareStub()
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

    test('should return all created checkpoints with their timestamps and total supply', async () => {
      const stringToTickerStub = sinon.stub(utilsConversionModule, 'stringToTicker');

      dsMockUtils.createQueryStub('checkpoint', 'totalSupply');

      const requestPaginatedStub = sinon.stub(utilsInternalModule, 'requestPaginated');

      const totalSupply = [
        {
          ticker: 'FAKETICKER',
          checkpointId: new BigNumber(1),
          balance: new BigNumber(100),
          moment: new Date('10/10/2020'),
        },
        {
          ticker: 'OTHERTICKER',
          checkpointId: new BigNumber(2),
          balance: new BigNumber(1000),
          moment: new Date('11/11/2020'),
        },
      ];

      totalSupply.forEach(({ ticker: t }) =>
        stringToTickerStub.withArgs(t, context).returns(dsMockUtils.createMockTicker(t))
      );

      const rawTotalSupply = totalSupply.map(({ ticker: t, checkpointId, balance }) => ({
        ticker: dsMockUtils.createMockTicker(t),
        checkpointId: dsMockUtils.createMockU64(checkpointId.toNumber()),
        balance: dsMockUtils.createMockBalance(balance.toNumber()),
      }));

      const totalSupplyEntries = rawTotalSupply.map(
        ({ ticker: rawTicker, checkpointId, balance }) =>
          tuple(({ args: [rawTicker, checkpointId] } as unknown) as StorageKey, balance)
      );

      requestPaginatedStub.resolves({ entries: totalSupplyEntries, lastKey: null });

      const timestampsStub = dsMockUtils.createQueryStub('checkpoint', 'timestamps');
      timestampsStub.multi.resolves(
        totalSupply.map(({ moment }) => dsMockUtils.createMockMoment(moment.getTime()))
      );

      const result = await checkpoints.get();

      result.data.forEach(({ checkpoint, totalSupply: ts, createdAt }, index) => {
        const {
          checkpointId: expectedCheckpointId,
          balance: expectedBalance,
          moment: expectedMoment,
        } = totalSupply[index];

        expect(checkpoint).toEqual(
          entityMockUtils.getCheckpointInstance({ id: expectedCheckpointId })
        );
        expect(ts).toEqual(expectedBalance.shiftedBy(-6));
        expect(createdAt).toEqual(expectedMoment);
      });
      expect(result.next).toBeNull();
    });
  });
});
