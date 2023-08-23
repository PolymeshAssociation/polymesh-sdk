import { Balance } from '@polkadot/types/interfaces';
import { PolymeshPrimitivesTicker } from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import {
  getAuthorization,
  IssueTokensParams,
  prepareIssueTokens,
  prepareStorage,
  Storage,
} from '~/api/procedures/issueTokens';
import { Asset, Context, Portfolio } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { EntityGetter } from '~/testUtils/mocks/entities';
import { Mocked } from '~/testUtils/types';
import { TxTags } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Asset',
  require('~/testUtils/mocks/entities').mockAssetModule('~/api/entities/Asset')
);

describe('issueTokens procedure', () => {
  let mockContext: Mocked<Context>;
  let stringToTickerSpy: jest.SpyInstance<PolymeshPrimitivesTicker, [string, Context]>;
  let bigNumberToBalance: jest.SpyInstance;
  let ticker: string;
  let rawTicker: PolymeshPrimitivesTicker;
  let amount: BigNumber;
  let rawAmount: Balance;
  let portfolioToPortfolioKindSpy: jest.SpyInstance;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    stringToTickerSpy = jest.spyOn(utilsConversionModule, 'stringToTicker');
    portfolioToPortfolioKindSpy = jest.spyOn(utilsConversionModule, 'portfolioToPortfolioKind');
    bigNumberToBalance = jest.spyOn(utilsConversionModule, 'bigNumberToBalance');
    ticker = 'SOME_TICKER';
    rawTicker = dsMockUtils.createMockTicker(ticker);
    amount = new BigNumber(100);
    rawAmount = dsMockUtils.createMockBalance(amount);
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    when(stringToTickerSpy).calledWith(ticker, mockContext).mockReturnValue(rawTicker);
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

  describe('prepareStorage', () => {
    it('should return the Asset', () => {
      const proc = procedureMockUtils.getInstance<IssueTokensParams, Asset, Storage>(mockContext);
      const boundFunc = prepareStorage.bind(proc);

      const result = boundFunc({
        ticker,
        amount: new BigNumber(10),
      });

      expect(result).toEqual({
        asset: expect.objectContaining({ ticker }),
      });
    });
  });

  it('should throw an error if Asset supply is bigger than the limit total supply', async () => {
    const args = {
      amount,
      ticker,
    };

    const limitTotalSupply = new BigNumber(Math.pow(10, 12));

    entityMockUtils.configureMocks({
      assetOptions: {
        details: {
          totalSupply: limitTotalSupply,
        },
      },
    });

    const proc = procedureMockUtils.getInstance<IssueTokensParams, Asset, Storage>(mockContext, {
      asset: entityMockUtils.getAssetInstance(),
    });

    let error;

    try {
      await prepareIssueTokens.call(proc, args);
    } catch (err) {
      error = err;
    }

    expect(error.message).toBe(
      `This issuance operation will cause the total supply of "${ticker}" to exceed the supply limit`
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
      ticker,
    };
    mockContext.getSigningIdentity.mockResolvedValue(entityMockUtils.getIdentityInstance());

    entityMockUtils.configureMocks({
      assetOptions: {
        ticker,
        details: {
          isDivisible,
        },
      },
    });

    when(bigNumberToBalance)
      .calledWith(amount, mockContext, isDivisible)
      .mockReturnValue(rawAmount);

    const transaction = dsMockUtils.createTxMock('asset', 'issue');
    const proc = procedureMockUtils.getInstance<IssueTokensParams, Asset, Storage>(mockContext, {
      asset: entityMockUtils.getAssetInstance(),
    });

    const result = await prepareIssueTokens.call(proc, args);
    expect(result).toEqual({
      transaction,
      args: [rawTicker, rawAmount],
      resolver: expect.objectContaining({ ticker }),
    });
  });

  describe('issue tokens to portfolio', () => {
    const defaultPortfolioId = new BigNumber(0);
    const numberedPortfolioId = new BigNumber(1);

    const defaultPortfolioKind = dsMockUtils.createMockPortfolioKind('Default');
    const numberedPortfolioKind = dsMockUtils.createMockPortfolioKind({
      User: dsMockUtils.createMockU64(numberedPortfolioId),
    });

    const getPortfolio: EntityGetter<Portfolio> = jest.fn();
    const mockDefaultPortfolio = entityMockUtils.getDefaultPortfolioInstance();
    const mockNumberedPortfolio = entityMockUtils.getNumberedPortfolioInstance({
      did: 'did',
      id: numberedPortfolioId,
    });

    beforeEach(() => {
      when(mockContext.createType)
        .calledWith('PolymeshPrimitivesIdentityIdPortfolioKind', 'Default')
        .mockReturnValue(defaultPortfolioKind);
      when(mockContext.createType)
        .calledWith('PolymeshPrimitivesIdentityIdPortfolioKind', numberedPortfolioKind)
        .mockReturnValue(numberedPortfolioKind);
      when(getPortfolio)
        .calledWith()
        .mockResolvedValue(mockDefaultPortfolio)
        .calledWith({ portfolioId: defaultPortfolioId })
        .mockResolvedValue(mockDefaultPortfolio)
        .calledWith({ portfolioId: numberedPortfolioId })
        .mockResolvedValue(mockNumberedPortfolio);

      when(portfolioToPortfolioKindSpy)
        .calledWith(mockDefaultPortfolio, mockContext)
        .mockReturnValue(defaultPortfolioKind)
        .calledWith(mockNumberedPortfolio, mockContext)
        .mockReturnValue(numberedPortfolioKind);
    });

    it('should issue tokens to Default portfolio if portfolioId is not specified', async () => {
      const isDivisible = true;

      const args = {
        amount,
        ticker,
      };
      mockContext.getSigningIdentity.mockResolvedValue(
        entityMockUtils.getIdentityInstance({ portfoliosGetPortfolio: getPortfolio })
      );
      entityMockUtils.configureMocks({
        assetOptions: {
          ticker,
          details: {
            isDivisible,
          },
        },
      });
      when(bigNumberToBalance)
        .calledWith(amount, mockContext, isDivisible)
        .mockReturnValue(rawAmount);
      const transaction = dsMockUtils.createTxMock('asset', 'issue');
      const proc = procedureMockUtils.getInstance<IssueTokensParams, Asset, Storage>(mockContext, {
        asset: entityMockUtils.getAssetInstance(),
      });
      const result = await prepareIssueTokens.call(proc, args);

      expect(result).toEqual({
        transaction,
        args: [rawTicker, rawAmount, defaultPortfolioKind],
        resolver: expect.objectContaining({ ticker }),
      });
    });

    it('should issue tokens to Default portfolio if default portfolioId is provided', async () => {
      const isDivisible = true;

      const args = {
        amount,
        ticker,
        portfolioId: defaultPortfolioId,
      };
      mockContext.getSigningIdentity.mockResolvedValue(
        entityMockUtils.getIdentityInstance({ portfoliosGetPortfolio: getPortfolio })
      );
      entityMockUtils.configureMocks({
        assetOptions: {
          ticker,
          details: {
            isDivisible,
          },
        },
      });
      when(bigNumberToBalance)
        .calledWith(amount, mockContext, isDivisible)
        .mockReturnValue(rawAmount);
      const transaction = dsMockUtils.createTxMock('asset', 'issue');
      const proc = procedureMockUtils.getInstance<IssueTokensParams, Asset, Storage>(mockContext, {
        asset: entityMockUtils.getAssetInstance(),
      });
      const result = await prepareIssueTokens.call(proc, args);

      expect(result).toEqual({
        transaction,
        args: [rawTicker, rawAmount, defaultPortfolioKind],
        resolver: expect.objectContaining({ ticker }),
      });
    });

    it('should issue tokens to the Numbered portfolio that is specified', async () => {
      const isDivisible = true;

      const args = {
        amount,
        ticker,
        portfolioId: numberedPortfolioId,
      };
      mockContext.getSigningIdentity.mockResolvedValue(
        entityMockUtils.getIdentityInstance({ portfoliosGetPortfolio: getPortfolio })
      );
      entityMockUtils.configureMocks({
        assetOptions: {
          ticker,
          details: {
            isDivisible,
          },
        },
      });
      when(bigNumberToBalance)
        .calledWith(amount, mockContext, isDivisible)
        .mockReturnValue(rawAmount);
      const transaction = dsMockUtils.createTxMock('asset', 'issue');
      const proc = procedureMockUtils.getInstance<IssueTokensParams, Asset, Storage>(mockContext, {
        asset: entityMockUtils.getAssetInstance(),
      });
      const result = await prepareIssueTokens.call(proc, args);

      expect(result).toEqual({
        transaction,
        args: [rawTicker, rawAmount, numberedPortfolioKind],
        resolver: expect.objectContaining({ ticker }),
      });
    });
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<IssueTokensParams, Asset, Storage>(mockContext, {
        asset: entityMockUtils.getAssetInstance({ ticker }),
      });
      const boundFunc = getAuthorization.bind(proc);

      expect(boundFunc()).toEqual({
        permissions: {
          transactions: [TxTags.asset.Issue],
          assets: [expect.objectContaining({ ticker })],
          portfolios: [],
        },
      });
    });
  });
});
