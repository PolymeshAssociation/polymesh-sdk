import { StorageKey } from '@polkadot/types';
import BigNumber from 'bignumber.js';
import sinon from 'sinon';

import { Checkpoint, Context, Namespace, PolymeshTransaction } from '~/internal';
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
  const rawTicker = dsMockUtils.createMockTicker(ticker);

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
    const asset = entityMockUtils.getAssetInstance({ ticker });
    checkpoints = new Checkpoints(asset, context);
  });

  afterAll(() => {
    dsMockUtils.cleanup();
    procedureMockUtils.cleanup();
  });

  it('should extend namespace', () => {
    expect(Checkpoints.prototype instanceof Namespace).toBe(true);
  });

  describe('method: create', () => {
    afterAll(() => {
      sinon.restore();
    });

    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<Checkpoint>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs({ args: { ticker }, transformer: undefined }, context)
        .resolves(expectedTransaction);

      const tx = await checkpoints.create();

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: getOne', () => {
    afterAll(() => {
      sinon.restore();
    });

    it('should return the requested Checkpoint', async () => {
      const id = new BigNumber(1);

      const result = await checkpoints.getOne({ id });

      expect(result.id).toEqual(id);
      expect(result.asset.ticker).toBe(ticker);
    });

    it('should throw an error if the Checkpoint does not exist', async () => {
      const id = new BigNumber(1);

      entityMockUtils.configureMocks({ checkpointOptions: { exists: false } });

      return expect(checkpoints.getOne({ id })).rejects.toThrow('The Checkpoint does not exist');
    });
  });

  describe('method: get', () => {
    afterAll(() => {
      sinon.restore();
    });

    it('should return all created checkpoints with their timestamps and total supply', async () => {
      const stringToTickerStub = sinon.stub(utilsConversionModule, 'stringToTicker');

      dsMockUtils.createQueryStub('checkpoint', 'totalSupply');

      const requestPaginatedStub = sinon.stub(utilsInternalModule, 'requestPaginated');

      const totalSupply = [
        {
          checkpointId: new BigNumber(1),
          balance: new BigNumber(100),
          moment: new Date('10/10/2020'),
        },
        {
          checkpointId: new BigNumber(2),
          balance: new BigNumber(1000),
          moment: new Date('11/11/2020'),
        },
      ];

      stringToTickerStub.withArgs(ticker, context).returns(rawTicker);

      const rawTotalSupply = totalSupply.map(({ checkpointId, balance }) => ({
        checkpointId: dsMockUtils.createMockU64(checkpointId),
        balance: dsMockUtils.createMockBalance(balance),
      }));

      const totalSupplyEntries = rawTotalSupply.map(({ checkpointId, balance }) =>
        tuple({ args: [rawTicker, checkpointId] } as unknown as StorageKey, balance)
      );

      requestPaginatedStub.resolves({ entries: totalSupplyEntries, lastKey: null });

      const timestampsStub = dsMockUtils.createQueryStub('checkpoint', 'timestamps');
      timestampsStub.multi.resolves(
        totalSupply.map(({ moment }) =>
          dsMockUtils.createMockMoment(new BigNumber(moment.getTime()))
        )
      );

      const result = await checkpoints.get();

      result.data.forEach(({ checkpoint, totalSupply: ts, createdAt }, index) => {
        const {
          checkpointId: expectedCheckpointId,
          balance: expectedBalance,
          moment: expectedMoment,
        } = totalSupply[index];

        expect(checkpoint.id).toEqual(expectedCheckpointId);
        expect(checkpoint.asset.ticker).toBe(ticker);
        expect(ts).toEqual(expectedBalance.shiftedBy(-6));
        expect(createdAt).toEqual(expectedMoment);
      });
      expect(result.next).toBeNull();
    });
  });
});
