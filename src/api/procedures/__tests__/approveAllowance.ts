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
import { Context, FungibleAsset, PolymeshError, Procedure } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { ErrorCode, TxTags } from '~/types';
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
    it('should throw an error if the amount is less than 0', () => {
      const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

      const expectedError = new PolymeshError({
        code: ErrorCode.UnmetPrerequisite,
        message:
          'Allowance amount cannot be less than 0. Pass 0 to revoke the allowance or greater than 0 to set the new allowance',
      });

      expect(() =>
        prepareApproveAllowance.call(proc, {
          asset,
          spender: 'someSpender',
          amount: new BigNumber(-10),
        })
      ).toThrow(expectedError);
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

      const result = boundFunc();

      expect(result).toEqual({
        permissions: {
          transactions: [TxTags.asset.Approve],
          assets: [],
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
