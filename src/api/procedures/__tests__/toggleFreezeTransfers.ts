import { PolymeshPrimitivesAssetAssetID } from '@polkadot/types/lookup';
import { when } from 'jest-when';

import {
  getAuthorization,
  Params,
  prepareToggleFreezeTransfers,
} from '~/api/procedures/toggleFreezeTransfers';
import { BaseAsset, Context } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { TxTags } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Asset/Base',
  require('~/testUtils/mocks/entities').mockBaseAssetModule('~/api/entities/Asset/Base')
);

describe('toggleFreezeTransfers procedure', () => {
  let mockContext: Mocked<Context>;
  let assetToMeshAssetIdSpy: jest.SpyInstance;
  let assetId: string;
  let asset: BaseAsset;
  let rawAssetId: PolymeshPrimitivesAssetAssetID;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    assetToMeshAssetIdSpy = jest.spyOn(utilsConversionModule, 'assetToMeshAssetId');
    assetId = '0x1234';
    asset = entityMockUtils.getBaseAssetInstance({ assetId });
    rawAssetId = dsMockUtils.createMockAssetId(assetId);
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    when(assetToMeshAssetIdSpy)
      .calledWith(expect.objectContaining({ id: assetId }), mockContext)
      .mockReturnValue(rawAssetId);
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

  it('should throw an error if freeze is set to true and the Asset is already frozen', () => {
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    return expect(
      prepareToggleFreezeTransfers.call(proc, {
        asset: entityMockUtils.getBaseAssetInstance({
          assetId,
          isFrozen: true,
        }),
        freeze: true,
      })
    ).rejects.toThrow('The Asset is already frozen');
  });

  it('should throw an error if freeze is set to false and the Asset is already unfrozen', () => {
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    return expect(
      prepareToggleFreezeTransfers.call(proc, {
        asset,
        freeze: false,
      })
    ).rejects.toThrow('The Asset is already unfrozen');
  });

  it('should return a freeze transaction spec', async () => {
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    const transaction = dsMockUtils.createTxMock('asset', 'freeze');

    const result = await prepareToggleFreezeTransfers.call(proc, {
      asset,
      freeze: true,
    });

    expect(result).toEqual({
      transaction,
      args: [rawAssetId],
    });
  });

  it('should add an unfreeze transaction spec', async () => {
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    const transaction = dsMockUtils.createTxMock('asset', 'unfreeze');

    const result = await prepareToggleFreezeTransfers.call(proc, {
      asset: entityMockUtils.getBaseAssetInstance({
        assetId,
        isFrozen: true,
      }),
      freeze: false,
    });

    expect(result).toEqual({
      transaction,
      args: [rawAssetId],
    });
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<Params, void>(mockContext);
      const boundFunc = getAuthorization.bind(proc);

      expect(boundFunc({ asset, freeze: true })).toEqual({
        permissions: {
          transactions: [TxTags.asset.Freeze],
          assets: [asset],
          portfolios: [],
        },
      });

      expect(boundFunc({ asset, freeze: false })).toEqual({
        permissions: {
          transactions: [TxTags.asset.Unfreeze],
          assets: [asset],
          portfolios: [],
        },
      });
    });
  });
});
