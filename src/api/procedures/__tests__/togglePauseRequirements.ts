import { bool } from '@polkadot/types';
import { PolymeshPrimitivesAssetAssetId } from '@polkadot/types/lookup';
import { when } from 'jest-when';

import {
  getAuthorization,
  Params,
  prepareTogglePauseRequirements,
} from '~/api/procedures/togglePauseRequirements';
import { BaseAsset, Context } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { TxTags } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Asset/Fungible',
  require('~/testUtils/mocks/entities').mockFungibleAssetModule('~/api/entities/Asset/Fungible')
);

describe('togglePauseRequirements procedure', () => {
  let mockContext: Mocked<Context>;
  let assetToMeshAssetIdSpy: jest.SpyInstance;
  let assetCompliancesMock: jest.Mock;
  let boolToBooleanSpy: jest.SpyInstance<boolean, [bool]>;
  let assetId: string;
  let asset: BaseAsset;
  let rawAssetId: PolymeshPrimitivesAssetAssetId;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    assetToMeshAssetIdSpy = jest.spyOn(utilsConversionModule, 'assetToMeshAssetId');
    boolToBooleanSpy = jest.spyOn(utilsConversionModule, 'boolToBoolean');
    assetId = '0x1234';
    asset = entityMockUtils.getBaseAssetInstance({ assetId });
    rawAssetId = dsMockUtils.createMockAssetId(assetId);
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    when(assetToMeshAssetIdSpy).calledWith(asset, mockContext).mockReturnValue(rawAssetId);
    assetCompliancesMock = dsMockUtils.createQueryMock('complianceManager', 'assetCompliances', {
      returnValue: [],
    });
    when(assetCompliancesMock).calledWith(rawAssetId).mockResolvedValue({
      paused: true,
    });
    boolToBooleanSpy.mockReturnValue(true);
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

  it('should throw an error if pause is set to true and the asset compliance requirements are already paused', () => {
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    return expect(
      prepareTogglePauseRequirements.call(proc, {
        asset,
        pause: true,
      })
    ).rejects.toThrow('Requirements are already paused');
  });

  it('should throw an error if pause is set to false and the asset compliance requirements are already unpaused', () => {
    when(assetCompliancesMock).calledWith(rawAssetId).mockReturnValue({
      paused: false,
    });

    boolToBooleanSpy.mockReturnValue(false);

    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    return expect(
      prepareTogglePauseRequirements.call(proc, {
        asset,
        pause: false,
      })
    ).rejects.toThrow('Requirements are already unpaused');
  });

  it('should return a pause asset compliance transaction spec', async () => {
    when(assetCompliancesMock).calledWith(rawAssetId).mockReturnValue({
      paused: false,
    });

    boolToBooleanSpy.mockReturnValue(false);

    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    const transaction = dsMockUtils.createTxMock('complianceManager', 'pauseAssetCompliance');

    const result = await prepareTogglePauseRequirements.call(proc, {
      asset,
      pause: true,
    });

    expect(result).toEqual({
      transaction,
      args: [rawAssetId],
    });
  });

  it('should return a resume asset compliance transaction spec', async () => {
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    const transaction = dsMockUtils.createTxMock('complianceManager', 'resumeAssetCompliance');

    const result = await prepareTogglePauseRequirements.call(proc, {
      asset,
      pause: false,
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
        pause: true,
      };

      expect(boundFunc(args)).toEqual({
        permissions: {
          transactions: [TxTags.complianceManager.PauseAssetCompliance],
          assets: [expect.objectContaining({ id: assetId })],
          portfolios: [],
        },
      });

      args.pause = false;

      expect(boundFunc(args)).toEqual({
        permissions: {
          transactions: [TxTags.complianceManager.ResumeAssetCompliance],
          assets: [expect.objectContaining({ id: assetId })],
          portfolios: [],
        },
      });
    });
  });
});
