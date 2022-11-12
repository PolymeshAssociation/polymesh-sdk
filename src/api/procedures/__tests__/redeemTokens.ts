import { Balance } from '@polkadot/types/interfaces';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';
import { Ticker } from 'polymesh-types/types';

import {
  getAuthorization,
  Params,
  prepareRedeemTokens,
  prepareStorage,
  Storage,
} from '~/api/procedures/redeemTokens';
import { Context, NumberedPortfolio } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { PortfolioBalance, TxTags } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Asset',
  require('~/testUtils/mocks/entities').mockAssetModule('~/api/entities/Asset')
);
jest.mock(
  '~/api/entities/DefaultPortfolio',
  require('~/testUtils/mocks/entities').mockDefaultPortfolioModule(
    '~/api/entities/DefaultPortfolio'
  )
);
jest.mock(
  '~/api/entities/NumberedPortfolio',
  require('~/testUtils/mocks/entities').mockNumberedPortfolioModule(
    '~/api/entities/NumberedPortfolio'
  )
);

describe('redeemTokens procedure', () => {
  let mockContext: Mocked<Context>;
  let ticker: string;
  let rawTicker: Ticker;
  let amount: BigNumber;
  let rawAmount: Balance;
  let stringToTickerSpy: jest.SpyInstance<Ticker, [string, Context]>;
  let bigNumberToBalanceSpy: jest.SpyInstance<
    Balance,
    [BigNumber, Context, (boolean | undefined)?]
  >;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    ticker = 'SOME_TICKER';
    rawTicker = dsMockUtils.createMockTicker(ticker);
    amount = new BigNumber(100);
    rawAmount = dsMockUtils.createMockBalance(amount);
    stringToTickerSpy = jest.spyOn(utilsConversionModule, 'stringToTicker');
    bigNumberToBalanceSpy = jest.spyOn(utilsConversionModule, 'bigNumberToBalance');
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    when(stringToTickerSpy).calledWith(ticker, mockContext).mockReturnValue(rawTicker);
    when(bigNumberToBalanceSpy).calledWith(amount, mockContext, true).mockReturnValue(rawAmount);
    entityMockUtils.configureMocks({
      assetOptions: {
        details: {
          isDivisible: true,
        },
      },
    });
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

  it('should return a redeem transaction spec', async () => {
    const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
      fromPortfolio: entityMockUtils.getDefaultPortfolioInstance({
        getAssetBalances: [
          {
            asset: entityMockUtils.getAssetInstance({ ticker }),
            free: new BigNumber(500),
          } as unknown as PortfolioBalance,
        ],
      }),
    });

    const transaction = dsMockUtils.createTxMock('asset', 'redeem');

    const result = await prepareRedeemTokens.call(proc, {
      ticker,
      amount,
    });

    expect(result).toEqual({ transaction, args: [rawTicker, rawAmount], resolver: undefined });
  });

  it('should return a redeemFromPortfolio transaction spec', async () => {
    const from = entityMockUtils.getNumberedPortfolioInstance({
      id: new BigNumber(1),
      getAssetBalances: [
        {
          asset: entityMockUtils.getAssetInstance({ ticker }),
          free: new BigNumber(500),
        } as unknown as PortfolioBalance,
      ],
    });
    const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
      fromPortfolio: from,
    });

    const transaction = dsMockUtils.createTxMock('asset', 'redeemFromPortfolio');

    const rawPortfolioKind = dsMockUtils.createMockPortfolioKind({
      User: dsMockUtils.createMockU64(new BigNumber(1)),
    });

    when(jest.spyOn(utilsConversionModule, 'portfolioToPortfolioKind'))
      .calledWith(from, mockContext)
      .mockReturnValue(rawPortfolioKind);

    const result = await prepareRedeemTokens.call(proc, {
      ticker,
      amount,
      from,
    });
    expect(result).toEqual({
      transaction,
      args: [rawTicker, rawAmount, rawPortfolioKind],
      resolver: undefined,
    });
  });

  it('should throw an error if the portfolio has not sufficient balance to redeem', () => {
    const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
      fromPortfolio: entityMockUtils.getNumberedPortfolioInstance({
        getAssetBalances: [
          {
            asset: entityMockUtils.getAssetInstance({ ticker }),
            free: new BigNumber(0),
          } as unknown as PortfolioBalance,
        ],
      }),
    });

    return expect(
      prepareRedeemTokens.call(proc, {
        ticker,
        amount,
      })
    ).rejects.toThrow('Insufficient free balance');
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', async () => {
      const someDid = 'someDid';

      dsMockUtils.getContextInstance({ did: someDid });

      let fromPortfolio = entityMockUtils.getDefaultPortfolioInstance({
        did: someDid,
      });

      let proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
        fromPortfolio,
      });

      const params = {
        ticker,
        amount,
      };
      let boundFunc = getAuthorization.bind(proc);

      let result = await boundFunc(params);

      expect(result).toEqual({
        permissions: {
          transactions: [TxTags.asset.Redeem],
          assets: [expect.objectContaining({ ticker })],
          portfolios: [fromPortfolio],
        },
      });

      fromPortfolio = entityMockUtils.getNumberedPortfolioInstance();

      proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
        fromPortfolio,
      });

      boundFunc = getAuthorization.bind(proc);

      result = await boundFunc({ ...params, from: fromPortfolio });

      expect(result).toEqual({
        permissions: {
          transactions: [TxTags.asset.RedeemFromPortfolio],
          assets: [expect.objectContaining({ ticker })],
          portfolios: [fromPortfolio],
        },
      });
    });
  });

  describe('prepareStorage', () => {
    it('should return the Portfolio from which the Assets will be redeemed', async () => {
      const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext);
      const boundFunc = prepareStorage.bind(proc);
      let result = await boundFunc({} as Params);

      expect(result).toEqual({
        fromPortfolio: expect.objectContaining({
          owner: expect.objectContaining({
            did: 'someDid',
          }),
        }),
      });

      result = await boundFunc({
        from: new BigNumber(1),
      } as Params);

      expect(result).toEqual({
        fromPortfolio: expect.objectContaining({
          id: new BigNumber(1),
          owner: expect.objectContaining({
            did: 'someDid',
          }),
        }),
      });

      const from = new NumberedPortfolio({ did: 'someDid', id: new BigNumber(1) }, mockContext);
      result = await boundFunc({
        from,
      } as Params);

      expect(result).toEqual({
        fromPortfolio: from,
      });
    });
  });
});
