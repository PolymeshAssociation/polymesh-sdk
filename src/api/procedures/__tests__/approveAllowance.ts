import { AccountId, Balance } from '@polkadot/types/interfaces';
import { PolymeshPrimitivesAssetAssetId } from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import {
  approveAllowance,
  getAuthorization,
  Params,
  prepareApproveAllowance,
} from '~/api/procedures/approveAllowance';
import { Context, FungibleAsset, Procedure } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { TxTags } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';
import * as utilsInternalModule from '~/utils/internal';

describe('approveAllowance procedure', () => {
  let mockContext: Mocked<Context>;
  let assetToMeshAssetIdSpy: jest.SpyInstance;
  let stringToAccountIdSpy: jest.SpyInstance;
  let bigNumberToBalanceSpy: jest.SpyInstance;
  let asAccountSpy: jest.SpyInstance;
  let asset: FungibleAsset;
  let rawAssetId: PolymeshPrimitivesAssetAssetId;
  let rawAccountId: AccountId;
  let rawBalance: Balance;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    assetToMeshAssetIdSpy = jest.spyOn(utilsConversionModule, 'assetToMeshAssetId');
    stringToAccountIdSpy = jest.spyOn(utilsConversionModule, 'stringToAccountId');
    bigNumberToBalanceSpy = jest.spyOn(utilsConversionModule, 'bigNumberToBalance');
    asAccountSpy = jest.spyOn(utilsInternalModule, 'asAccount');
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    asset = entityMockUtils.getFungibleAssetInstance({ ticker: 'TICKER' });
    rawAssetId = dsMockUtils.createMockAssetId('0x1234');
    rawAccountId = dsMockUtils.createMockAccountId('someAddress');
    rawBalance = dsMockUtils.createMockBalance(new BigNumber(100));

    when(assetToMeshAssetIdSpy).calledWith(asset, mockContext).mockReturnValue(rawAssetId);

    dsMockUtils.createTxMock('asset', 'approve');
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

  describe('prepareApproveAllowance', () => {
    it('should throw an error if the amount is less than 0', async () => {
      const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

      let error;
      try {
        await prepareApproveAllowance.call(proc, {
          asset,
          spender: 'someSpender',
          amount: new BigNumber(-10),
        });
      } catch (err: any) {
        error = err;
      }
      expect(error.message).toBe('Amount must be greater than 0');
    });

    it('should return an approve transaction spec', async () => {
      const spender = 'someSpender';
      const amount = new BigNumber(100);

      asAccountSpy.mockReturnValue(entityMockUtils.getAccountInstance({ address: spender }));

      when(stringToAccountIdSpy).calledWith(spender, mockContext).mockReturnValue(rawAccountId);
      when(bigNumberToBalanceSpy).calledWith(amount, mockContext).mockReturnValue(rawBalance);

      const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

      const result = await prepareApproveAllowance.call(proc, {
        asset,
        spender,
        amount,
      });

      expect(result).toEqual({
        transaction: mockContext.polymeshApi.tx.asset.approve,
        args: [rawAssetId, rawAccountId, rawBalance],
        resolver: undefined,
      });
    });
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<Params, void>(mockContext);
      const boundFunc = getAuthorization.bind(proc);

      const result = boundFunc({ asset, spender: 'someSpender', amount: new BigNumber(10) });

      expect(result).toEqual({
        permissions: {
          transactions: [TxTags.asset.Approve],
          assets: [asset],
          portfolios: [],
        },
      });
    });
  });

  describe('approveAllowance', () => {
    it('should return a Procedure instance with prepareApproveAllowance and getAuthorization', () => {
      const result = approveAllowance();

      expect(result).toBeInstanceOf(Procedure);
    });
  });
});
