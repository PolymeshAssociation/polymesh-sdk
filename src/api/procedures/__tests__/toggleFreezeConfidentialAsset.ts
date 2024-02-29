import { bool } from '@polkadot/types';
import { when } from 'jest-when';

import {
  getAuthorization,
  Params,
  prepareToggleFreezeConfidentialAsset,
} from '~/api/procedures/toggleFreezeConfidentialAsset';
import { Context } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { ConfidentialAsset, RoleType, TxTags } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

describe('toggleFreezeConfidentialAsset procedure', () => {
  let mockContext: Mocked<Context>;
  let confidentialAsset: ConfidentialAsset;
  let rawId: string;
  let rawTrue: bool;
  let booleanToBoolSpy: jest.SpyInstance;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    confidentialAsset = entityMockUtils.getConfidentialAssetInstance();
    rawId = '0x76702175d8cbe3a55a19734433351e26';
    rawTrue = dsMockUtils.createMockBool(true);
    booleanToBoolSpy = jest.spyOn(utilsConversionModule, 'booleanToBool');
    when(booleanToBoolSpy).calledWith(true, mockContext).mockReturnValue(rawTrue);
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
    const frozenAsset = entityMockUtils.getConfidentialAssetInstance({
      isFrozen: true,
    });

    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    return expect(
      prepareToggleFreezeConfidentialAsset.call(proc, {
        confidentialAsset: frozenAsset,
        freeze: true,
      })
    ).rejects.toThrow('The Asset is already frozen');
  });

  it('should throw an error if freeze is set to false and the Asset is already unfrozen', () => {
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    return expect(
      prepareToggleFreezeConfidentialAsset.call(proc, {
        confidentialAsset,
        freeze: false,
      })
    ).rejects.toThrow('The Asset is already unfrozen');
  });

  it('should return a freeze transaction spec', async () => {
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    const transaction = dsMockUtils.createTxMock('confidentialAsset', 'setAssetFrozen');

    const result = await prepareToggleFreezeConfidentialAsset.call(proc, {
      confidentialAsset,
      freeze: true,
    });

    expect(result).toEqual({
      transaction,
      args: [rawId, rawTrue],
      resolver: undefined,
    });
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<Params, void>(mockContext);
      const boundFunc = getAuthorization.bind(proc);

      expect(boundFunc({ confidentialAsset, freeze: false })).toEqual({
        roles: [{ assetId: confidentialAsset.id, type: RoleType.ConfidentialAssetOwner }],
        permissions: {
          transactions: [TxTags.confidentialAsset.SetAssetFrozen],
          assets: [],
          portfolios: [],
        },
      });
    });
  });
});
