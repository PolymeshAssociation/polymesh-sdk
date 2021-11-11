import { Balance } from '@polkadot/types/interfaces';
import BigNumber from 'bignumber.js';
import { Ticker } from 'polymesh-types/types';
import sinon from 'sinon';

import { getAuthorization, Params, prepareRedeemToken } from '~/api/procedures/redeemToken';
import { Context, DefaultPortfolio, SecurityToken } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { PortfolioBalance, TxTags } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/SecurityToken',
  require('~/testUtils/mocks/entities').mockSecurityTokenModule('~/api/entities/SecurityToken')
);
jest.mock(
  '~/api/entities/DefaultPortfolio',
  require('~/testUtils/mocks/entities').mockDefaultPortfolioModule(
    '~/api/entities/DefaultPortfolio'
  )
);

describe('redeemToken procedure', () => {
  let mockContext: Mocked<Context>;
  let addTransactionStub: sinon.SinonStub;
  let ticker: string;
  let rawTicker: Ticker;
  let amount: BigNumber;
  let rawAmount: Balance;
  let stringToTickerStub: sinon.SinonStub<[string, Context], Ticker>;
  let numberToBalanceStub: sinon.SinonStub<
    [number | BigNumber, Context, (boolean | undefined)?],
    Balance
  >;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    ticker = 'SOMETICKER';
    rawTicker = dsMockUtils.createMockTicker(ticker);
    amount = new BigNumber(100);
    rawAmount = dsMockUtils.createMockBalance(amount.toNumber());
    stringToTickerStub = sinon.stub(utilsConversionModule, 'stringToTicker');
    numberToBalanceStub = sinon.stub(utilsConversionModule, 'numberToBalance');
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    addTransactionStub = procedureMockUtils.getAddTransactionStub();
    stringToTickerStub.withArgs(ticker, mockContext).returns(rawTicker);
    numberToBalanceStub.withArgs(amount, mockContext).returns(rawAmount);
  });

  afterEach(() => {
    entityMockUtils.reset();
    procedureMockUtils.reset();
    dsMockUtils.reset();
  });

  afterAll(() => {
    entityMockUtils.cleanup();
    procedureMockUtils.cleanup();
    dsMockUtils.cleanup();
  });

  test('should add a redeem transaction to the queue', async () => {
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    const transaction = dsMockUtils.createTxStub('asset', 'redeem');

    entityMockUtils.configureMocks({
      securityTokenOptions: {
        details: {
          isDivisible: true,
        },
      },
      defaultPortfolioOptions: {
        tokenBalances: [
          {
            token: new SecurityToken({ ticker }, mockContext),
            free: new BigNumber(500),
          } as PortfolioBalance,
        ],
      },
    });

    await prepareRedeemToken.call(proc, {
      ticker,
      amount,
    });

    sinon.assert.calledWith(addTransactionStub, transaction, {}, rawTicker, rawAmount);
  });

  test('should throw an error if the portfolio has not sufficient balance to redeem', () => {
    entityMockUtils.configureMocks({
      securityTokenOptions: {
        details: {
          isDivisible: true,
        },
      },
      defaultPortfolioOptions: {
        tokenBalances: [
          {
            token: new SecurityToken({ ticker }, mockContext),
            free: new BigNumber(0),
          } as PortfolioBalance,
        ],
      },
    });

    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    return expect(
      prepareRedeemToken.call(proc, {
        ticker,
        amount,
      })
    ).rejects.toThrow('Insufficient free balance');
  });

  describe('getAuthorization', () => {
    test('should return the appropriate roles and permissions', async () => {
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
          tokens: [new SecurityToken({ ticker }, mockContext)],
          portfolios: [new DefaultPortfolio({ did: someDid }, mockContext)],
        },
      });
    });
  });
});
