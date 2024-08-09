import { PolymeshPrimitivesAssetAssetID } from '@polkadot/types/lookup';
import { ISubmittableResult } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import {
  createCheckpointScheduleResolver,
  getAuthorization,
  Params,
  prepareCreateCheckpointSchedule,
} from '~/api/procedures/createCheckpointSchedule';
import { CheckpointSchedule, Context } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { FungibleAsset, TxTags } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';
import * as utilsInternalModule from '~/utils/internal';

jest.mock(
  '~/api/entities/CheckpointSchedule',
  require('~/testUtils/mocks/entities').mockCheckpointScheduleModule(
    '~/api/entities/CheckpointSchedule'
  )
);
jest.mock(
  '~/api/entities/Asset/Fungible',
  require('~/testUtils/mocks/entities').mockFungibleAssetModule('~/api/entities/Asset/Fungible')
);

describe('createCheckpointSchedule procedure', () => {
  let mockContext: Mocked<Context>;
  let assetToMeshAssetIdSpy: jest.SpyInstance;
  let datesToScheduleCheckpointsSpy: jest.SpyInstance;
  let assetId: string;
  let asset: FungibleAsset;
  let rawAssetId: PolymeshPrimitivesAssetAssetID;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    assetToMeshAssetIdSpy = jest.spyOn(utilsConversionModule, 'assetToMeshAssetId');
    datesToScheduleCheckpointsSpy = jest.spyOn(utilsConversionModule, 'datesToScheduleCheckpoints');
    assetId = '0x1234';
    asset = entityMockUtils.getFungibleAssetInstance({ assetId });
    rawAssetId = dsMockUtils.createMockAssetId(assetId);
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    when(assetToMeshAssetIdSpy).calledWith(asset, mockContext).mockReturnValue(rawAssetId);
  });

  afterEach(() => {
    entityMockUtils.reset();
    procedureMockUtils.reset();
    dsMockUtils.reset();
  });

  afterAll(() => {
    procedureMockUtils.cleanup();
    dsMockUtils.cleanup();
  });

  it('should throw an error if the start date is in the past', () => {
    const proc = procedureMockUtils.getInstance<Params, CheckpointSchedule>(mockContext);

    return expect(
      prepareCreateCheckpointSchedule.call(proc, {
        asset,
        points: [new Date(new Date().getTime() - 10000)],
      })
    ).rejects.toThrow('Schedule points must be in the future');
  });

  it('should return a create checkpoint schedule transaction spec', async () => {
    const proc = procedureMockUtils.getInstance<Params, CheckpointSchedule>(mockContext);

    const transaction = dsMockUtils.createTxMock('checkpoint', 'createSchedule');

    const start = new Date(new Date().getTime() + 10000);

    const rawSchedule = dsMockUtils.createMockScheduleSpec({
      start: dsMockUtils.createMockOption(
        dsMockUtils.createMockMoment(new BigNumber(start.getTime()))
      ),
      period: dsMockUtils.createMockCalendarPeriod({}),
      remaining: dsMockUtils.createMockU32(new BigNumber(1)),
    });

    datesToScheduleCheckpointsSpy.mockReturnValue(rawSchedule);

    const result = await prepareCreateCheckpointSchedule.call(proc, {
      asset,
      points: [start],
    });

    expect(result).toEqual({
      transaction,
      resolver: expect.any(Function),
      args: [rawAssetId, rawSchedule],
    });
  });

  describe('createCheckpointScheduleResolver', () => {
    const filterEventRecordsSpy = jest.spyOn(utilsInternalModule, 'filterEventRecords');
    const id = new BigNumber(1);
    const start = new Date('10/14/1987');

    beforeAll(() => {
      entityMockUtils.initMocks({
        checkpointScheduleOptions: {
          assetId,
          id,
          start,
        },
      });
    });
    beforeEach(() => {
      filterEventRecordsSpy.mockReturnValue([
        dsMockUtils.createMockIEvent([
          dsMockUtils.createMockIdentityId('someDid'),
          dsMockUtils.createMockAssetId(assetId),
          dsMockUtils.createMockU64(id),
          dsMockUtils.createMockCheckpointSchedule({
            pending: dsMockUtils.createMockBTreeSet([
              dsMockUtils.createMockMoment(new BigNumber(start.getTime())),
            ]),
          }),
        ]),
      ]);
    });

    afterEach(() => {
      filterEventRecordsSpy.mockReset();
    });

    it('should return the new CheckpointSchedule', () => {
      const result = createCheckpointScheduleResolver(
        assetId,
        mockContext
      )({} as ISubmittableResult);
      expect(result.asset.id).toBe(assetId);
      expect(result.id).toEqual(id);
    });
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<Params, CheckpointSchedule>(mockContext);
      const boundFunc = getAuthorization.bind(proc);

      const start = new Date('10/14/1987');

      expect(boundFunc({ asset, points: [start] })).toEqual({
        permissions: {
          transactions: [TxTags.checkpoint.CreateSchedule],
          assets: [asset],
          portfolios: [],
        },
      });
    });
  });
});
