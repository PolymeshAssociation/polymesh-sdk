import { u64 } from '@polkadot/types';
import { PolymeshPrimitivesAssetAssetId } from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';

import {
  getAuthorization,
  Params,
  prepareRemoveCheckpointSchedule,
} from '~/api/procedures/removeCheckpointSchedule';
import { Context } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { createMockBTreeSet } from '~/testUtils/mocks/dataSources';
import { Mocked } from '~/testUtils/types';
import { FungibleAsset, TxTags } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Asset/Fungible',
  require('~/testUtils/mocks/entities').mockFungibleAssetModule('~/api/entities/Asset/Fungible')
);

describe('removeCheckpointSchedule procedure', () => {
  let mockContext: Mocked<Context>;
  let assetToMeshAssetIdSpy: jest.SpyInstance;
  let bigNumberToU64Spy: jest.SpyInstance;
  let u32ToBigNumberSpy: jest.SpyInstance;
  let assetId: string;
  let asset: FungibleAsset;
  let rawAssetId: PolymeshPrimitivesAssetAssetId;
  let id: BigNumber;
  let rawId: u64;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    assetToMeshAssetIdSpy = jest.spyOn(utilsConversionModule, 'assetToMeshAssetId');
    bigNumberToU64Spy = jest.spyOn(utilsConversionModule, 'bigNumberToU64');
    u32ToBigNumberSpy = jest.spyOn(utilsConversionModule, 'u32ToBigNumber');
    assetId = '0x12341234123412341234123412341234';
    asset = entityMockUtils.getFungibleAssetInstance({ assetId });
    rawAssetId = dsMockUtils.createMockAssetId(assetId);
    id = new BigNumber(1);
    rawId = dsMockUtils.createMockU64(id);
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    assetToMeshAssetIdSpy.mockReturnValue(rawAssetId);
    bigNumberToU64Spy.mockReturnValue(rawId);

    dsMockUtils.createQueryMock('checkpoint', 'scheduleRefCount');
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

  it('should throw an error if the Schedule no longer exists', () => {
    const args = {
      asset,
      schedule: id,
    };

    dsMockUtils.createQueryMock('checkpoint', 'scheduledCheckpoints', {
      returnValue: [dsMockUtils.createMockCheckpointSchedule()],
    });

    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    return expect(prepareRemoveCheckpointSchedule.call(proc, args)).rejects.toThrow(
      'Schedule was not found. It may have been removed or expired'
    );
  });

  it('should throw an error if Schedule Ref Count is not zero', () => {
    const args = {
      asset,
      schedule: id,
    };

    dsMockUtils.createQueryMock('checkpoint', 'scheduledCheckpoints', {
      returnValue: dsMockUtils.createMockOption(
        dsMockUtils.createMockCheckpointSchedule({ pending: createMockBTreeSet() })
      ),
    });

    u32ToBigNumberSpy.mockReturnValue(new BigNumber(1));

    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    return expect(prepareRemoveCheckpointSchedule.call(proc, args)).rejects.toThrow(
      'This Schedule is being referenced by other Entities. It cannot be removed'
    );
  });

  it('should return a remove schedule transaction spec', async () => {
    const args = {
      asset,
      schedule: id,
    };

    dsMockUtils.createQueryMock('checkpoint', 'scheduledCheckpoints', {
      returnValue: dsMockUtils.createMockOption(dsMockUtils.createMockCheckpointSchedule()),
    });

    u32ToBigNumberSpy.mockReturnValue(new BigNumber(0));

    let transaction = dsMockUtils.createTxMock('checkpoint', 'removeSchedule');
    let proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    let result = await prepareRemoveCheckpointSchedule.call(proc, args);

    expect(result).toEqual({ transaction, args: [rawAssetId, rawId], resolver: undefined });

    transaction = dsMockUtils.createTxMock('checkpoint', 'removeSchedule');
    proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    result = await prepareRemoveCheckpointSchedule.call(proc, {
      asset,
      schedule: entityMockUtils.getCheckpointScheduleInstance(),
    });

    expect(result).toEqual({ transaction, args: [rawAssetId, rawId], resolver: undefined });
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<Params, void>(mockContext);
      const boundFunc = getAuthorization.bind(proc);
      const args = {
        asset,
      } as Params;

      expect(boundFunc(args)).toEqual({
        permissions: {
          transactions: [TxTags.checkpoint.RemoveSchedule],
          assets: [expect.objectContaining({ id: assetId })],
          portfolios: [],
        },
      });
    });
  });
});
