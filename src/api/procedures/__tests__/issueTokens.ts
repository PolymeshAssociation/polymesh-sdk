import { Balance } from '@polkadot/types/interfaces';
import { PolymeshPrimitivesAssetAssetId } from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import { getAuthorization, Params, prepareIssueTokens } from '~/api/procedures/issueTokens';
import { Context, FungibleAsset, Portfolio } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { EntityGetter } from '~/testUtils/mocks/entities';
import { Mocked } from '~/testUtils/types';
import { TxTags } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Asset/Fungible',
  require('~/testUtils/mocks/entities').mockFungibleAssetModule('~/api/entities/Asset/Fungible')
);

describe('issueTokens procedure', () => {
  let mockContext: Mocked<Context>;
  let assetToMeshAssetIdSpy: jest.SpyInstance;
  let bigNumberToBalance: jest.SpyInstance;
  let assetId: string;
  let asset: FungibleAsset;
  let rawAssetId: PolymeshPrimitivesAssetAssetId;
  let amount: BigNumber;
  let rawAmount: Balance;
  let assetHolderToAssetHolderKindSpy: jest.SpyInstance;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    assetToMeshAssetIdSpy = jest.spyOn(utilsConversionModule, 'assetToMeshAssetId');
    assetHolderToAssetHolderKindSpy = jest.spyOn(
      utilsConversionModule,
      'assetHolderToAssetHolderKind'
    );
    bigNumberToBalance = jest.spyOn(utilsConversionModule, 'bigNumberToBalance');
    assetId = '0x12341234123412341234123412341234';
    asset = entityMockUtils.getFungibleAssetInstance({ assetId });
    rawAssetId = dsMockUtils.createMockAssetId(assetId);
    amount = new BigNumber(100);
    rawAmount = dsMockUtils.createMockBalance(amount);
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    assetToMeshAssetIdSpy.mockReturnValue(rawAssetId);
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

  it('should throw an error if Asset supply is bigger than the limit total supply', async () => {
    const limitTotalSupply = new BigNumber(Math.pow(10, 12));

    const args = {
      amount,
      asset: entityMockUtils.getFungibleAssetInstance({
        assetId,
        details: {
          totalSupply: limitTotalSupply,
        },
      }),
    };

    const proc = procedureMockUtils.getInstance<Params, FungibleAsset>(mockContext);

    let error;

    try {
      await prepareIssueTokens.call(proc, args);
    } catch (err) {
      error = err;
    }

    expect(error.message).toBe(
      `This issuance operation will cause the total supply of "${assetId}" to exceed the supply limit`
    );
    expect(error.data).toMatchObject({
      currentSupply: limitTotalSupply,
      supplyLimit: limitTotalSupply,
    });
  });

  it('should return a issue transaction spec', async () => {
    const isDivisible = true;
    const args = {
      amount,
      asset: entityMockUtils.getFungibleAssetInstance({
        assetId,
        details: {
          isDivisible,
        },
      }),
    };
    mockContext.getSigningIdentity.mockResolvedValue(entityMockUtils.getIdentityInstance());

    when(bigNumberToBalance)
      .calledWith(amount, mockContext, isDivisible)
      .mockReturnValue(rawAmount);

    const transaction = dsMockUtils.createTxMock('asset', 'issue');
    const proc = procedureMockUtils.getInstance<Params, FungibleAsset>(mockContext);

    const result = await prepareIssueTokens.call(proc, args);
    expect(result).toEqual({
      transaction,
      args: [rawAssetId, rawAmount],
      resolver: expect.objectContaining({ id: assetId }),
    });
  });

  describe('issue tokens to portfolio', () => {
    const defaultPortfolioId = new BigNumber(0);
    const numberedPortfolioId = new BigNumber(1);

    const defaultPortfolioHolderKind = dsMockUtils.createMockAssetHolderKind('DefaultPortfolio');
    const numberedPortfolioHolderKind = dsMockUtils.createMockAssetHolderKind({
      UserPortfolio: dsMockUtils.createMockU64(numberedPortfolioId),
    });

    const getPortfolio: EntityGetter<Portfolio> = jest.fn();
    const mockDefaultPortfolio = entityMockUtils.getDefaultPortfolioInstance();
    const mockNumberedPortfolio = entityMockUtils.getNumberedPortfolioInstance({
      did: 'did',
      id: numberedPortfolioId,
    });

    beforeEach(() => {
      when(getPortfolio)
        .calledWith()
        .mockResolvedValue(mockDefaultPortfolio)
        .calledWith({ portfolioId: defaultPortfolioId })
        .mockResolvedValue(mockDefaultPortfolio)
        .calledWith({ portfolioId: numberedPortfolioId })
        .mockResolvedValue(mockNumberedPortfolio);

      when(assetHolderToAssetHolderKindSpy)
        .calledWith(mockDefaultPortfolio, mockContext)
        .mockReturnValue(defaultPortfolioHolderKind)
        .calledWith(mockNumberedPortfolio, mockContext)
        .mockReturnValue(numberedPortfolioHolderKind);
    });

    it('should issue tokens to Default portfolio if portfolioId is not specified', async () => {
      const isDivisible = true;

      const args = {
        amount,
        asset: entityMockUtils.getFungibleAssetInstance({
          assetId,
          details: {
            isDivisible,
          },
        }),
      };
      mockContext.getSigningIdentity.mockResolvedValue(
        entityMockUtils.getIdentityInstance({ portfoliosGetPortfolio: getPortfolio })
      );
      when(bigNumberToBalance)
        .calledWith(amount, mockContext, isDivisible)
        .mockReturnValue(rawAmount);
      const transaction = dsMockUtils.createTxMock('asset', 'issue');
      const proc = procedureMockUtils.getInstance<Params, FungibleAsset>(mockContext);
      const result = await prepareIssueTokens.call(proc, args);

      expect(result).toEqual({
        transaction,
        args: [rawAssetId, rawAmount, defaultPortfolioHolderKind],
        resolver: expect.objectContaining({ id: assetId }),
      });
    });

    it('should issue tokens to Default portfolio if default portfolioId is provided', async () => {
      const isDivisible = true;

      const args = {
        amount,
        asset: entityMockUtils.getFungibleAssetInstance({
          assetId,
          details: {
            isDivisible,
          },
        }),
        portfolioId: defaultPortfolioId,
      };
      mockContext.getSigningIdentity.mockResolvedValue(
        entityMockUtils.getIdentityInstance({ portfoliosGetPortfolio: getPortfolio })
      );
      when(bigNumberToBalance)
        .calledWith(amount, mockContext, isDivisible)
        .mockReturnValue(rawAmount);
      const transaction = dsMockUtils.createTxMock('asset', 'issue');
      const proc = procedureMockUtils.getInstance<Params, FungibleAsset>(mockContext);
      const result = await prepareIssueTokens.call(proc, args);

      expect(result).toEqual({
        transaction,
        args: [rawAssetId, rawAmount, defaultPortfolioHolderKind],
        resolver: expect.objectContaining({ id: assetId }),
      });
    });

    it('should issue tokens to the Numbered portfolio that is specified', async () => {
      const isDivisible = true;

      const args = {
        amount,
        asset: entityMockUtils.getFungibleAssetInstance({
          assetId,
          details: {
            isDivisible,
          },
        }),
        portfolioId: numberedPortfolioId,
      };
      mockContext.getSigningIdentity.mockResolvedValue(
        entityMockUtils.getIdentityInstance({ portfoliosGetPortfolio: getPortfolio })
      );
      when(bigNumberToBalance)
        .calledWith(amount, mockContext, isDivisible)
        .mockReturnValue(rawAmount);
      const transaction = dsMockUtils.createTxMock('asset', 'issue');
      const proc = procedureMockUtils.getInstance<Params, FungibleAsset>(mockContext);
      const result = await prepareIssueTokens.call(proc, args);

      expect(result).toEqual({
        transaction,
        args: [rawAssetId, rawAmount, numberedPortfolioHolderKind],
        resolver: expect.objectContaining({ id: assetId }),
      });
    });
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<Params, FungibleAsset>(mockContext);
      const boundFunc = getAuthorization.bind(proc);

      expect(boundFunc({ asset } as unknown as Params)).toEqual({
        permissions: {
          transactions: [TxTags.asset.Issue],
          assets: [asset],
          portfolios: [],
        },
      });
    });
  });
});
