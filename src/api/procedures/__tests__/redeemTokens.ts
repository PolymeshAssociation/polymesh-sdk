import { Balance } from '@polkadot/types/interfaces';
import { PolymeshPrimitivesTicker } from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import { getAuthorization, Params, prepareRedeemTokens } from '~/api/procedures/redeemTokens';
import { Context } from '~/internal';
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

describe('redeemTokens procedure', () => {
  let mockContext: Mocked<Context>;
  let ticker: string;
  let rawTicker: PolymeshPrimitivesTicker;
  let amount: BigNumber;
  let rawAmount: Balance;
  let stringToTickerSpy: jest.SpyInstance<PolymeshPrimitivesTicker, [string, Context]>;
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
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    const transaction = dsMockUtils.createTxMock('asset', 'redeem');

    entityMockUtils.configureMocks({
      assetOptions: {
        details: {
          isDivisible: true,
        },
      },
      defaultPortfolioOptions: {
        getAssetBalances: [
          {
            asset: entityMockUtils.getAssetInstance({ ticker }),
            free: new BigNumber(500),
          } as unknown as PortfolioBalance,
        ],
      },
    });

    const result = await prepareRedeemTokens.call(proc, {
      ticker,
      amount,
    });

    expect(result).toEqual({ transaction, args: [rawTicker, rawAmount], resolver: undefined });
  });

  it('should throw an error if the portfolio has not sufficient balance to redeem', () => {
    entityMockUtils.configureMocks({
      assetOptions: {
        details: {
          isDivisible: true,
        },
      },
      defaultPortfolioOptions: {
        getAssetBalances: [
          {
            asset: entityMockUtils.getAssetInstance({ ticker }),
            free: new BigNumber(0),
          } as unknown as PortfolioBalance,
        ],
      },
    });

    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    return expect(
      prepareRedeemTokens.call(proc, {
        ticker,
        amount,
      })
    ).rejects.toThrow('Insufficient free balance');
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', async () => {
      const params = {
        ticker,
        amount,
      };
      const someDid = 'someDid';

      dsMockUtils.getContextInstance({ did: someDid });

      const proc = procedureMockUtils.getInstance<Params, void>(mockContext);
      const boundFunc = getAuthorization.bind(proc);

      const result = await boundFunc(params);

      expect(result).toEqual({
        permissions: {
          transactions: [TxTags.asset.Redeem],
          assets: [expect.objectContaining({ ticker })],
          portfolios: [
            expect.objectContaining({ owner: expect.objectContaining({ did: someDid }) }),
          ],
        },
      });
    });
  });
});
