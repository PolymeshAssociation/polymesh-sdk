import { bool } from '@polkadot/types';
import {
  PolymeshPrimitivesAssetAssetHolder,
  PolymeshPrimitivesAssetAssetId,
} from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';

import {
  getAuthorization,
  Params,
  prepareToggleFreezeHolder,
} from '~/api/procedures/toggleFreezeHolder';
import * as proceduresUtilsModule from '~/api/procedures/utils';
import { BaseAsset, Context, PolymeshError } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { ErrorCode, TxTags } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';
import * as utilsInternalModule from '~/utils/internal';

jest.mock(
  '~/api/entities/Asset/Base',
  require('~/testUtils/mocks/entities').mockBaseAssetModule('~/api/entities/Asset/Base')
);

describe('toggleFreezeHolder procedure', () => {
  const holder = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';

  let mockContext: Mocked<Context>;
  let asset: BaseAsset;
  let rawAssetId: PolymeshPrimitivesAssetAssetId;
  let rawHolder: PolymeshPrimitivesAssetAssetHolder;
  let rawTrue: bool;
  let rawFalse: bool;
  let getHolderFreezeStatusSpy: jest.SpyInstance;
  let assertAssetHolderExistsSpy: jest.SpyInstance;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();

    asset = entityMockUtils.getBaseAssetInstance({ assetId: '0x12341234123412341234123412341234' });
    rawAssetId = dsMockUtils.createMockAssetId('0x12341234123412341234123412341234');
    rawHolder = dsMockUtils.createMockAssetHolder({
      Account: dsMockUtils.createMockAccountId(holder),
    });
    rawTrue = dsMockUtils.createMockBool(true);
    rawFalse = dsMockUtils.createMockBool(false);
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    dsMockUtils.createTxMock('asset', 'setHolderFrozen');

    jest.spyOn(utilsConversionModule, 'assetToMeshAssetId').mockReturnValue(rawAssetId);
    jest.spyOn(utilsConversionModule, 'assetHolderIdToMeshAssetHolder').mockReturnValue(rawHolder);
    jest
      .spyOn(utilsConversionModule, 'booleanToBool')
      .mockImplementation(value => (value ? rawTrue : rawFalse));
    getHolderFreezeStatusSpy = jest.spyOn(utilsInternalModule, 'getHolderFreezeStatus');
    assertAssetHolderExistsSpy = jest
      .spyOn(proceduresUtilsModule, 'assertAssetHolderExists')
      .mockResolvedValue();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    entityMockUtils.reset();
    procedureMockUtils.reset();
    dsMockUtils.reset();
  });

  afterAll(() => {
    procedureMockUtils.cleanup();
    dsMockUtils.cleanup();
  });

  it('should return a transaction spec that freezes the holder', async () => {
    getHolderFreezeStatusSpy.mockResolvedValue({ isFrozen: false, frozen: new BigNumber(0) });
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    const result = await prepareToggleFreezeHolder.call(proc, { asset, holder, freeze: true });

    expect(assertAssetHolderExistsSpy).toHaveBeenCalledWith(holder, mockContext);
    expect(result).toEqual({
      transaction: mockContext.polymeshApi.tx.asset.setHolderFrozen,
      args: [rawHolder, rawAssetId, rawTrue],
      resolver: undefined,
    });
  });

  it('should return a transaction spec that unfreezes the holder', async () => {
    getHolderFreezeStatusSpy.mockResolvedValue({ isFrozen: true, frozen: new BigNumber(0) });
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    const result = await prepareToggleFreezeHolder.call(proc, { asset, holder, freeze: false });

    expect(result.args).toEqual([rawHolder, rawAssetId, rawFalse]);
  });

  it('should throw if the holder is already frozen', () => {
    getHolderFreezeStatusSpy.mockResolvedValue({ isFrozen: true, frozen: new BigNumber(0) });
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    return expect(
      prepareToggleFreezeHolder.call(proc, { asset, holder, freeze: true })
    ).rejects.toThrow(
      new PolymeshError({
        code: ErrorCode.NoDataChange,
        message: 'The holder is already frozen',
      })
    );
  });

  it('should throw if the holder is already unfrozen', () => {
    getHolderFreezeStatusSpy.mockResolvedValue({ isFrozen: false, frozen: new BigNumber(0) });
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    return expect(
      prepareToggleFreezeHolder.call(proc, { asset, holder, freeze: false })
    ).rejects.toThrow('The holder is already unfrozen');
  });

  it('should throw NotSupported on a chain without holder freezing', () => {
    dsMockUtils.reset();
    mockContext = dsMockUtils.getContextInstance();
    dsMockUtils.createTxMock('asset', 'freeze');
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    return expect(
      prepareToggleFreezeHolder.call(proc, { asset, holder, freeze: true })
    ).rejects.toThrow(expect.objectContaining({ code: ErrorCode.NotSupported }));
  });

  describe('getAuthorization', () => {
    it('should require the agent permission for the extrinsic over the Asset', () => {
      const proc = procedureMockUtils.getInstance<Params, void>(mockContext);
      const boundFunc = getAuthorization.bind(proc);

      expect(boundFunc({ asset, holder, freeze: true })).toEqual({
        permissions: {
          transactions: [TxTags.asset.SetHolderFrozen],
          assets: [asset],
          portfolios: [],
        },
      });
    });
  });
});
