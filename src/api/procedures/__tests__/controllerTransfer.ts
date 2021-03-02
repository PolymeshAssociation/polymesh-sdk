import { Balance } from '@polkadot/types/interfaces';
import BigNumber from 'bignumber.js';
import { PortfolioId as MeshPortfolioId, Ticker, TxTags } from 'polymesh-types/types';
import sinon from 'sinon';

import {
  getAuthorization,
  Params,
  prepareControllerTransfer,
} from '~/api/procedures/controllerTransfer';
import { Context, DefaultPortfolio, NumberedPortfolio } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { PortfolioBalance, RoleType } from '~/types';
import { PortfolioId } from '~/types/internal';
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

describe('controllerTransfer procedure', () => {
  let mockContext: Mocked<Context>;
  let portfolioLikeToPortfolioIdStub: sinon.SinonStub;
  let portfolioIdToPortfolioStub: sinon.SinonStub<
    [PortfolioId, Context],
    DefaultPortfolio | NumberedPortfolio
  >;
  let numberToBalanceStub: sinon.SinonStub<
    [number | BigNumber, Context, (boolean | undefined)?],
    Balance
  >;
  let portfolioIdToMeshPortfolioIdStub: sinon.SinonStub;
  let stringToTickerStub: sinon.SinonStub<[string, Context], Ticker>;
  let ticker: string;
  let rawTicker: Ticker;
  let did: string;
  let rawPortfolioId: MeshPortfolioId;
  let portfolio: DefaultPortfolio;
  let rawAmount: Balance;
  let amount: BigNumber;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks({
      defaultPortfolioOptions: {
        tokenBalances: [
          { total: new BigNumber(100), locked: new BigNumber(10) },
        ] as PortfolioBalance[],
      },
    });
    portfolioLikeToPortfolioIdStub = sinon.stub(
      utilsConversionModule,
      'portfolioLikeToPortfolioId'
    );
    portfolioIdToPortfolioStub = sinon.stub(utilsConversionModule, 'portfolioIdToPortfolio');
    numberToBalanceStub = sinon.stub(utilsConversionModule, 'numberToBalance');
    portfolioIdToMeshPortfolioIdStub = sinon.stub(
      utilsConversionModule,
      'portfolioIdToMeshPortfolioId'
    );
    stringToTickerStub = sinon.stub(utilsConversionModule, 'stringToTicker');
    ticker = 'SOME_TICKER';
    rawTicker = dsMockUtils.createMockTicker(ticker);
    did = 'someDid';
    rawPortfolioId = dsMockUtils.createMockPortfolioId({
      did: dsMockUtils.createMockIdentityId(did),
      kind: dsMockUtils.createMockPortfolioKind('Default'),
    });
    portfolio = new DefaultPortfolio({ did }, mockContext);
    amount = new BigNumber(50);
    rawAmount = dsMockUtils.createMockBalance(amount.toNumber());
  });

  let addTransactionStub: sinon.SinonStub;

  beforeEach(() => {
    addTransactionStub = procedureMockUtils.getAddTransactionStub();
    mockContext = dsMockUtils.getContextInstance();
    stringToTickerStub.returns(rawTicker);
    portfolioLikeToPortfolioIdStub.returns({ did });
    portfolioIdToPortfolioStub.returns(portfolio);
    numberToBalanceStub.returns(rawAmount);
    portfolioIdToMeshPortfolioIdStub.returns(rawPortfolioId);
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

  test('should throw an error if the Portfolio does not have enough balance to transfer', () => {
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    return expect(
      prepareControllerTransfer.call(proc, {
        ticker,
        portfolio,
        amount: new BigNumber(1000),
      })
    ).rejects.toThrow('The Portfolio does not have enough balance for this transfer');
  });

  test('should add a controller transfer transaction to the queue', async () => {
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    const transaction = dsMockUtils.createTxStub('asset', 'controllerTransfer');

    await prepareControllerTransfer.call(proc, {
      ticker,
      portfolio,
      amount,
    });

    sinon.assert.calledWith(
      addTransactionStub,
      transaction,
      {},
      rawTicker,
      rawAmount,
      rawPortfolioId
    );
  });

  describe('getAuthorization', () => {
    test('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<Params, void>(mockContext);
      const boundFunc = getAuthorization.bind(proc);

      const token = entityMockUtils.getSecurityTokenInstance({ ticker });
      const identityRoles = [{ type: RoleType.TokenPia, ticker }];

      expect(boundFunc({ ticker, portfolio, amount })).toEqual({
        identityRoles,
        signerPermissions: {
          transactions: [TxTags.asset.ControllerTransfer],
          tokens: [token],
          portfolios: [],
        },
      });
    });
  });
});
