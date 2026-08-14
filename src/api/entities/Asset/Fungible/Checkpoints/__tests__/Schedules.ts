import { PolymeshMoment } from '@polymeshassociation/polymesh-types/polkadot/polymesh';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import { Schedules } from '~/api/entities/Asset/Fungible/Checkpoints/Schedules';
import {
  CheckpointSchedule,
  Context,
  FungibleAsset,
  Namespace,
  PolymeshTransaction,
} from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { tuple } from '~/types/utils';
import * as utilsConversionModule from '~/utils/conversion';

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

describe('Schedules class', () => {
  let context: Context;
  let schedules: Schedules;

  let assetId: string;
  let asset: FungibleAsset;

  let assetToMeshAssetIdSpy: jest.SpyInstance;

  beforeAll(() => {
    entityMockUtils.initMocks();
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();

    assetId = '12341234-1234-1234-1234-123412341234';

    assetToMeshAssetIdSpy = jest.spyOn(utilsConversionModule, 'assetToMeshAssetId');
  });

  afterEach(() => {
    entityMockUtils.reset();
    dsMockUtils.reset();
    procedureMockUtils.reset();

    context = dsMockUtils.getContextInstance();

    asset = entityMockUtils.getFungibleAssetInstance({ ticker: assetId });
    schedules = new Schedules(asset, context);
  });

  afterAll(() => {
    dsMockUtils.cleanup();
    procedureMockUtils.cleanup();
  });

  it('should extend namespace', () => {
    expect(Schedules.prototype instanceof Namespace).toBe(true);
  });

  describe('method: create', () => {
    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const expectedTransaction =
        'someTransaction' as unknown as PolymeshTransaction<CheckpointSchedule>;

      const now = new Date();
      const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      const args = {
        points: [nextMonth],
      };

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args: { asset, ...args }, transformer: undefined }, context, {})
        .mockResolvedValue(expectedTransaction);

      const tx = await schedules.create(args);

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: remove', () => {
    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<void>;
      const args = {
        schedule: new BigNumber(1),
      };

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args: { asset, ...args }, transformer: undefined }, context, {})
        .mockResolvedValue(expectedTransaction);

      const tx = await schedules.remove(args);

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: getOne', () => {
    let getSpy: jest.SpyInstance;
    let id: BigNumber;

    beforeAll(() => {
      id = new BigNumber(1);
    });

    beforeEach(() => {
      getSpy = jest.spyOn(schedules, 'get');
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should return the requested Checkpoint Schedule', async () => {
      const fakeResult = {
        schedule: entityMockUtils.getCheckpointScheduleInstance({ id }),
        details: {
          remainingCheckpoints: 1,
          nextCheckpointDate: new Date(),
        },
      };

      getSpy.mockResolvedValue([fakeResult]);

      const result = await schedules.getOne({ id });
      expect(result).toEqual(fakeResult);
    });

    it('should throw an error if the Schedule does not exist', () => {
      getSpy.mockResolvedValue([]);

      return expect(schedules.getOne({ id })).rejects.toThrow('The Schedule does not exist');
    });
  });

  describe('method: get', () => {
    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should return the current checkpoint schedules', async () => {
      const rawAssetId = dsMockUtils.createMockAssetId(assetId);
      const id = new BigNumber(1);
      const rawId = dsMockUtils.createMockU64(id);
      const start = new Date('10/14/1987');
      const nextCheckpointDate = new Date('10/14/2030');
      const remaining = new BigNumber(2);

      when(assetToMeshAssetIdSpy)
        .calledWith(expect.objectContaining({ id: assetId }), context)
        .mockReturnValue(rawAssetId);

      dsMockUtils.createQueryMock('checkpoint', 'scheduledCheckpoints', {
        entries: [
          tuple(
            [dsMockUtils.createMockAssetId(rawAssetId), rawId],
            dsMockUtils.createMockOption(
              dsMockUtils.createMockCheckpointSchedule({
                pending: dsMockUtils.createMockBtreeSet<PolymeshMoment>([
                  dsMockUtils.createMockMoment(new BigNumber(start.getTime())),
                  dsMockUtils.createMockMoment(new BigNumber(nextCheckpointDate.getTime())),
                ]),
              })
            )
          ),
        ],
      });

      const result = await schedules.get();

      expect(result[0]!.details).toEqual({
        remainingCheckpoints: remaining,
        nextCheckpointDate: start,
      });
      expect(result[0]!.schedule.id).toEqual(id);
      expect(result[0]!.schedule.asset.id).toEqual(assetId);
    });
  });

  describe('method: maxComplexity', () => {
    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should return the maximum complexity from the chain', async () => {
      dsMockUtils.createQueryMock('checkpoint', 'schedulesMaxComplexity', {
        returnValue: dsMockUtils.createMockU64(new BigNumber(20)),
      });

      const result = await schedules.maxComplexity();

      expect(result).toEqual(new BigNumber(20));
    });
  });

  describe('method: getNextCheckpoint', () => {
    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should return null if there is no cached next Checkpoint information', async () => {
      const rawAssetId = dsMockUtils.createMockAssetId(assetId);

      when(assetToMeshAssetIdSpy)
        .calledWith(expect.objectContaining({ id: assetId }), context)
        .mockReturnValue(rawAssetId);

      dsMockUtils.createQueryMock('checkpoint', 'cachedNextCheckpoints', {
        returnValue: dsMockUtils.createMockOption(),
      });

      const result = await schedules.getNextCheckpoint();

      expect(result).toBeNull();
    });

    it('should return null if every Schedule has been removed', async () => {
      const rawAssetId = dsMockUtils.createMockAssetId(assetId);

      when(assetToMeshAssetIdSpy)
        .calledWith(expect.objectContaining({ id: assetId }), context)
        .mockReturnValue(rawAssetId);

      /*
       * removing every Schedule leaves the cached entry in place, with no Schedules and `nextAt` set to
       * the `u64::MAX` sentinel
       */
      dsMockUtils.createQueryMock('checkpoint', 'cachedNextCheckpoints', {
        returnValue: dsMockUtils.createMockOption(
          dsMockUtils.createMockNextCheckpoints({
            nextAt: dsMockUtils.createMockMoment(new BigNumber('18446744073709551615')),
            totalPending: dsMockUtils.createMockU64(new BigNumber(0)),
            schedules: dsMockUtils.createMockBtreeMap(new Map()),
          })
        ),
      });

      const result = await schedules.getNextCheckpoint();

      expect(result).toBeNull();
    });

    it('should return the cached next Checkpoint information from the chain', async () => {
      const rawAssetId = dsMockUtils.createMockAssetId(assetId);
      const nextAt = new Date('10/14/2030');
      const totalPending = new BigNumber(3);
      const firstScheduleId = new BigNumber(1);
      const secondScheduleId = new BigNumber(2);
      const firstScheduleNextAt = new Date('10/14/2030');
      const secondScheduleNextAt = new Date('11/14/2030');

      when(assetToMeshAssetIdSpy)
        .calledWith(expect.objectContaining({ id: assetId }), context)
        .mockReturnValue(rawAssetId);

      dsMockUtils.createQueryMock('checkpoint', 'cachedNextCheckpoints', {
        returnValue: dsMockUtils.createMockOption(
          dsMockUtils.createMockNextCheckpoints({
            nextAt: dsMockUtils.createMockMoment(new BigNumber(nextAt.getTime())),
            totalPending: dsMockUtils.createMockU64(totalPending),
            schedules: dsMockUtils.createMockBtreeMap(
              new Map([
                [
                  dsMockUtils.createMockU64(firstScheduleId),
                  dsMockUtils.createMockMoment(new BigNumber(firstScheduleNextAt.getTime())),
                ],
                [
                  dsMockUtils.createMockU64(secondScheduleId),
                  dsMockUtils.createMockMoment(new BigNumber(secondScheduleNextAt.getTime())),
                ],
              ])
            ),
          })
        ),
      });

      const result = await schedules.getNextCheckpoint();

      expect(result).toEqual({
        nextAt,
        totalPending,
        schedules: [
          { id: firstScheduleId, nextAt: firstScheduleNextAt },
          { id: secondScheduleId, nextAt: secondScheduleNextAt },
        ],
      });
    });
  });
});
