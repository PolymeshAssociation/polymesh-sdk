import {
  PolymeshPrimitivesAssetAssetID,
  PolymeshPrimitivesIdentityId,
} from '@polkadot/types/lookup';
import { BTreeSet } from '@polkadot/types-codec';
import { when } from 'jest-when';

import {
  getAuthorization,
  Params,
  prepareRemoveAssetMediators,
} from '~/api/procedures/removeAssetMediators';
import { BaseAsset, Context, Identity, PolymeshError } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { ErrorCode, TxTags } from '~/types';
import { PolymeshTx } from '~/types/internal';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Asset/Base',
  require('~/testUtils/mocks/entities').mockBaseAssetModule('~/api/entities/Asset/Base')
);

describe('removeAssetMediators procedure', () => {
  let mockContext: Mocked<Context>;
  let identitiesToSetSpy: jest.SpyInstance;
  let asset: BaseAsset;
  let assetId: string;
  let rawAssetId: PolymeshPrimitivesAssetAssetID;
  let currentMediator: Identity;
  let rawCurrentMediator: PolymeshPrimitivesIdentityId;
  let assetToMeshAssetIdSpy: jest.SpyInstance;
  let mockRemoveMediators: BTreeSet<PolymeshPrimitivesIdentityId>;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    assetToMeshAssetIdSpy = jest.spyOn(utilsConversionModule, 'assetToMeshAssetId');
    identitiesToSetSpy = jest.spyOn(utilsConversionModule, 'identitiesToBtreeSet');
    assetId = '0x1234';
    rawAssetId = dsMockUtils.createMockAssetId(assetId);
    currentMediator = entityMockUtils.getIdentityInstance({ did: 'currentDid' });
    rawCurrentMediator = dsMockUtils.createMockIdentityId(currentMediator.did);
    asset = entityMockUtils.getBaseAssetInstance({
      assetId,
      getRequiredMediators: [currentMediator],
    });
    mockRemoveMediators = dsMockUtils.createMockBTreeSet<PolymeshPrimitivesIdentityId>([
      rawCurrentMediator,
    ]);
  });

  let removeMandatoryMediatorsTransaction: PolymeshTx<
    [PolymeshPrimitivesAssetAssetID, BTreeSet<PolymeshPrimitivesIdentityId>]
  >;

  beforeEach(() => {
    removeMandatoryMediatorsTransaction = dsMockUtils.createTxMock(
      'asset',
      'removeMandatoryMediators'
    );

    mockContext = dsMockUtils.getContextInstance();

    when(assetToMeshAssetIdSpy).calledWith(asset, mockContext).mockReturnValue(rawAssetId);
    when(identitiesToSetSpy)
      .calledWith(
        expect.arrayContaining([expect.objectContaining({ did: currentMediator.did })]),
        mockContext
      )
      .mockReturnValue(mockRemoveMediators);
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

  it('should throw an error if a supplied mediator is not already required for the Asset', () => {
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    const expectedError = new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'One of the specified mediators to remove is not set',
    });

    return expect(
      prepareRemoveAssetMediators.call(proc, { asset, mediators: ['someOtherDid'] })
    ).rejects.toThrow(expectedError);
  });

  it('should return an remove required mediators transaction spec', async () => {
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    const result = await prepareRemoveAssetMediators.call(proc, {
      asset,
      mediators: [currentMediator],
    });

    expect(result).toEqual({
      transaction: removeMandatoryMediatorsTransaction,
      args: [rawAssetId, mockRemoveMediators],
      resolver: undefined,
    });
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<Params, void>(mockContext);
      const boundFunc = getAuthorization.bind(proc);
      const params = {
        asset,
        mediators: [],
      } as Params;

      expect(boundFunc(params)).toEqual({
        permissions: {
          transactions: [TxTags.asset.RemoveMandatoryMediators],
          assets: [expect.objectContaining({ id: assetId })],
          portfolios: [],
        },
      });
    });
  });
});
