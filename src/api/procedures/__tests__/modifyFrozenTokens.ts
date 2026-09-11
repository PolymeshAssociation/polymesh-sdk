import { Balance } from '@polkadot/types/interfaces';
import {
  PolymeshPrimitivesAssetAssetHolder,
  PolymeshPrimitivesAssetAssetId,
} from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';

import {
  getAuthorization,
  Params,
  prepareModifyFrozenTokens,
} from '~/api/procedures/modifyFrozenTokens';
import * as proceduresUtilsModule from '~/api/procedures/utils';
import { Context, FungibleAsset, PolymeshError } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { ErrorCode, PortfolioBalance, TxTags } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';
import * as utilsInternalModule from '~/utils/internal';

jest.mock(
  '~/api/entities/Asset/Fungible',
  require('~/testUtils/mocks/entities').mockFungibleAssetModule('~/api/entities/Asset/Fungible')
);

describe('modifyFrozenTokens procedure', () => {
  const holder = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';

  let mockContext: Mocked<Context>;
  let asset: FungibleAsset;
  let rawAssetId: PolymeshPrimitivesAssetAssetId;
  let rawHolder: PolymeshPrimitivesAssetAssetHolder;
  let rawAmount: Balance;
  let getHolderFreezeStatusSpy: jest.SpyInstance;
  let assetHolderLikeToAssetHolderSpy: jest.SpyInstance;

  const setFrozen = (frozen: number): void => {
    getHolderFreezeStatusSpy.mockResolvedValue({ isFrozen: false, frozen: new BigNumber(frozen) });
  };

  const setHolderBalance = (total: number): void => {
    assetHolderLikeToAssetHolderSpy.mockReturnValue(
      entityMockUtils.getAccountInstance({
        getAssetBalances: [{ total: new BigNumber(total) }] as PortfolioBalance[],
      })
    );
  };

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();

    asset = entityMockUtils.getFungibleAssetInstance({
      assetId: '0x12341234123412341234123412341234',
    });
    rawAssetId = dsMockUtils.createMockAssetId('0x12341234123412341234123412341234');
    rawHolder = dsMockUtils.createMockAssetHolder({
      Account: dsMockUtils.createMockAccountId(holder),
    });
    rawAmount = dsMockUtils.createMockBalance(new BigNumber(100));
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    dsMockUtils.createTxMock('asset', 'setFrozenTokens');
    dsMockUtils.createTxMock('asset', 'freezePartialTokens');
    dsMockUtils.createTxMock('asset', 'unfreezePartialTokens');

    jest.spyOn(utilsConversionModule, 'assetToMeshAssetId').mockReturnValue(rawAssetId);
    jest.spyOn(utilsConversionModule, 'assetHolderIdToMeshAssetHolder').mockReturnValue(rawHolder);
    jest.spyOn(utilsConversionModule, 'bigNumberToBalance').mockReturnValue(rawAmount);
    assetHolderLikeToAssetHolderSpy = jest.spyOn(
      utilsConversionModule,
      'assetHolderLikeToAssetHolder'
    );
    getHolderFreezeStatusSpy = jest.spyOn(utilsInternalModule, 'getHolderFreezeStatus');
    jest.spyOn(proceduresUtilsModule, 'assertAssetHolderExists').mockResolvedValue();
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

  describe('set', () => {
    it('should return a transaction spec, without checking the holder balance', async () => {
      setFrozen(0);
      const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

      const result = await prepareModifyFrozenTokens.call(proc, {
        asset,
        holder,
        amount: new BigNumber(1000000),
        operation: 'set',
      });

      expect(assetHolderLikeToAssetHolderSpy).not.toHaveBeenCalled();
      expect(result).toEqual({
        transaction: mockContext.polymeshApi.tx.asset.setFrozenTokens,
        args: [rawAssetId, rawHolder, rawAmount],
        resolver: undefined,
      });
    });

    it('should accept 0, which unfreezes every token', async () => {
      setFrozen(50);
      const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

      const result = await prepareModifyFrozenTokens.call(proc, {
        asset,
        holder,
        amount: new BigNumber(0),
        operation: 'set',
      });

      expect(result.transaction).toBe(mockContext.polymeshApi.tx.asset.setFrozenTokens);
    });

    it('should throw if the amount is already frozen', () => {
      setFrozen(100);
      const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

      return expect(
        prepareModifyFrozenTokens.call(proc, {
          asset,
          holder,
          amount: new BigNumber(100),
          operation: 'set',
        })
      ).rejects.toThrow(
        new PolymeshError({
          code: ErrorCode.NoDataChange,
          message: 'The holder already has this amount frozen',
        })
      );
    });
  });

  describe('increase', () => {
    it('should return a transaction spec when the result stays within the balance', async () => {
      setFrozen(50);
      setHolderBalance(150);
      const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

      const result = await prepareModifyFrozenTokens.call(proc, {
        asset,
        holder,
        amount: new BigNumber(100),
        operation: 'increase',
      });

      expect(result).toEqual({
        transaction: mockContext.polymeshApi.tx.asset.freezePartialTokens,
        args: [rawAssetId, rawHolder, rawAmount],
        resolver: undefined,
      });
    });

    it('should throw if the frozen amount would exceed the balance', () => {
      setFrozen(50);
      setHolderBalance(149);
      const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

      return expect(
        prepareModifyFrozenTokens.call(proc, {
          asset,
          holder,
          amount: new BigNumber(100),
          operation: 'increase',
        })
      ).rejects.toThrow(
        new PolymeshError({
          code: ErrorCode.UnmetPrerequisite,
          message: "The frozen amount would exceed the holder's balance",
        })
      );
    });

    it('should throw if the holder has no balance of the Asset at all', () => {
      setFrozen(0);
      // a holder that has never held the Asset has no balance entry to read
      assetHolderLikeToAssetHolderSpy.mockReturnValue(
        entityMockUtils.getAccountInstance({ getAssetBalances: [] })
      );
      const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

      return expect(
        prepareModifyFrozenTokens.call(proc, {
          asset,
          holder,
          amount: new BigNumber(1),
          operation: 'increase',
        })
      ).rejects.toThrow(
        new PolymeshError({
          code: ErrorCode.UnmetPrerequisite,
          message: "The frozen amount would exceed the holder's balance",
        })
      );
    });

    it('should throw if the amount is not positive', () => {
      setFrozen(0);
      const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

      return expect(
        prepareModifyFrozenTokens.call(proc, {
          asset,
          holder,
          amount: new BigNumber(0),
          operation: 'increase',
        })
      ).rejects.toThrow(
        new PolymeshError({
          code: ErrorCode.ValidationError,
          message: 'The amount must be greater than 0',
        })
      );
    });
  });

  describe('decrease', () => {
    it('should return a transaction spec when that much is frozen', async () => {
      setFrozen(100);
      const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

      const result = await prepareModifyFrozenTokens.call(proc, {
        asset,
        holder,
        amount: new BigNumber(100),
        operation: 'decrease',
      });

      expect(result.transaction).toBe(mockContext.polymeshApi.tx.asset.unfreezePartialTokens);
    });

    it('should throw if the amount exceeds what is frozen', () => {
      setFrozen(99);
      const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

      return expect(
        prepareModifyFrozenTokens.call(proc, {
          asset,
          holder,
          amount: new BigNumber(100),
          operation: 'decrease',
        })
      ).rejects.toThrow(
        new PolymeshError({
          code: ErrorCode.UnmetPrerequisite,
          message: 'The amount to unfreeze exceeds what is frozen',
        })
      );
    });
  });

  it('should throw NotSupported on a chain without partial freezing', () => {
    dsMockUtils.reset();
    mockContext = dsMockUtils.getContextInstance();
    dsMockUtils.createTxMock('asset', 'freeze');
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    return expect(
      prepareModifyFrozenTokens.call(proc, {
        asset,
        holder,
        amount: new BigNumber(100),
        operation: 'increase',
      })
    ).rejects.toThrow(expect.objectContaining({ code: ErrorCode.NotSupported }));
  });

  describe('getAuthorization', () => {
    it.each([
      ['set', TxTags.asset.SetFrozenTokens],
      ['increase', TxTags.asset.FreezePartialTokens],
      ['decrease', TxTags.asset.UnfreezePartialTokens],
    ] as const)('should require the agent permission for %s over the Asset', (operation, tag) => {
      const proc = procedureMockUtils.getInstance<Params, void>(mockContext);
      const boundFunc = getAuthorization.bind(proc);

      expect(boundFunc({ asset, holder, amount: new BigNumber(1), operation })).toEqual({
        permissions: {
          transactions: [tag],
          assets: [asset],
          portfolios: [],
        },
      });
    });
  });
});
