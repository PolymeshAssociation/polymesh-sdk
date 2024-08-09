import { PolymeshPrimitivesAssetAssetID } from '@polkadot/types/lookup';
import { when } from 'jest-when';

import {
  getAuthorization,
  Params,
  prepareToggleAssetPreApproval,
} from '~/api/procedures/toggleAssetPreApproval';
import { BaseAsset, Context } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { Identity, TxTags } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Asset/Fungible',
  require('~/testUtils/mocks/entities').mockFungibleAssetModule('~/api/entities/Asset/Fungible')
);

describe('toggleAssetPreApproval procedure', () => {
  let mockContext: Mocked<Context>;
  let mockSigningIdentity: Mocked<Identity>;
  let assetToMeshAssetIdSpy: jest.SpyInstance;
  let assetId: string;
  let asset: BaseAsset;
  let rawAssetId: PolymeshPrimitivesAssetAssetID;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    assetToMeshAssetIdSpy = jest.spyOn(utilsConversionModule, 'assetToMeshAssetId');
    assetId = 'TEST';
    asset = entityMockUtils.getBaseAssetInstance({ assetId });
    rawAssetId = dsMockUtils.createMockTicker(assetId);
  });

  beforeEach(() => {
    mockSigningIdentity = entityMockUtils.getIdentityInstance({
      isAssetPreApproved: false,
    });
    mockContext = dsMockUtils.getContextInstance();
    mockContext.getSigningIdentity.mockResolvedValue(mockSigningIdentity);
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

  it('should throw an error if pre approving an already approved asset', () => {
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);
    mockSigningIdentity.isAssetPreApproved.mockResolvedValue(true);

    return expect(
      prepareToggleAssetPreApproval.call(proc, {
        asset,
        preApprove: true,
      })
    ).rejects.toThrow('The signing identity has already pre-approved the ticker');
  });

  it('should throw an error if removing pre approval for an asset that is not pre-approved', () => {
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    return expect(
      prepareToggleAssetPreApproval.call(proc, {
        asset,
        preApprove: false,
      })
    ).rejects.toThrow('The signing identity has not pre-approved the asset');
  });

  it('should return a pre approve transaction spec', async () => {
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    const transaction = dsMockUtils.createTxMock('asset', 'preApproveAsset');

    const result = await prepareToggleAssetPreApproval.call(proc, {
      asset,
      preApprove: true,
    });

    expect(result).toEqual({
      transaction,
      args: [rawAssetId],
    });
  });

  it('should return a remove pre approval transaction spec', async () => {
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);
    mockSigningIdentity.isAssetPreApproved.mockResolvedValue(true);

    const transaction = dsMockUtils.createTxMock('asset', 'removeAssetPreApproval');

    const result = await prepareToggleAssetPreApproval.call(proc, {
      asset,
      preApprove: false,
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
      const args: Params = {
        asset,
        preApprove: true,
      };

      expect(boundFunc(args)).toEqual({
        permissions: {
          transactions: [TxTags.asset.PreApproveTicker],
          assets: [],
          portfolios: [],
        },
      });

      args.preApprove = false;

      expect(boundFunc(args)).toEqual({
        permissions: {
          transactions: [TxTags.asset.RemoveTickerPreApproval],
          assets: [],
          portfolios: [],
        },
      });
    });
  });
});
