import { Balance } from '@polkadot/types/interfaces';
import BigNumber from 'bignumber.js';
import { Ticker } from 'polymesh-types/types';
import sinon from 'sinon';

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
  let addTransactionStub: sinon.SinonStub;
  let ticker: string;
  let rawTicker: Ticker;
  let amount: BigNumber;
  let rawAmount: Balance;
  let stringToTickerStub: sinon.SinonStub<[string, Context], Ticker>;
  let bigNumberToBalanceStub: sinon.SinonStub<
    [BigNumber, Context, (boolean | undefined)?],
    Balance
  >;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    ticker = 'SOME_TICKER';
    rawTicker = dsMockUtils.createMockTicker(ticker);
    amount = new BigNumber(100);
    rawAmount = dsMockUtils.createMockBalance(amount);
    stringToTickerStub = sinon.stub(utilsConversionModule, 'stringToTicker');
    bigNumberToBalanceStub = sinon.stub(utilsConversionModule, 'bigNumberToBalance');
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    addTransactionStub = procedureMockUtils.getAddTransactionStub();
    stringToTickerStub.withArgs(ticker, mockContext).returns(rawTicker);
    bigNumberToBalanceStub.withArgs(amount, mockContext).returns(rawAmount);
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

  it('should add a redeem transaction to the queue', async () => {
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    const transaction = dsMockUtils.createTxStub('asset', 'redeem');

    entityMockUtils.configureMocks({
      assetOptions: {
        details: {
          isDivisible: true,
        },
      },
      defaultPortfolioOptions: {
        getAssetBalances: [
          ({
            asset: entityMockUtils.getAssetInstance({ ticker }),
            free: new BigNumber(500),
          } as unknown) as PortfolioBalance,
        ],
      },
    });

    await prepareRedeemTokens.call(proc, {
      ticker,
      amount,
    });

    sinon.assert.calledWith(addTransactionStub, { transaction, args: [rawTicker, rawAmount] });
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
          ({
            asset: entityMockUtils.getAssetInstance({ ticker }),
            free: new BigNumber(0),
          } as unknown) as PortfolioBalance,
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
