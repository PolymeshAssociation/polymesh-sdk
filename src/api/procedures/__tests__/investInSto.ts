import { u64 } from '@polkadot/types';
import { Balance } from '@polkadot/types/interfaces';
import BigNumber from 'bignumber.js';
import { PortfolioId as MeshPortfolioId, Ticker, TxTags } from 'polymesh-types/types';
import sinon from 'sinon';

import {
  getAuthorization,
  Params,
  prepareInvestInSto,
  prepareStorage,
  Storage,
} from '~/api/procedures/investInSto';
import { Context, DefaultPortfolio } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import {
  PortfolioBalance,
  PortfolioLike,
  RoleType,
  StoBalanceStatus,
  StoSaleStatus,
  StoTimingStatus,
} from '~/types';
import { PortfolioId } from '~/types/internal';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Sto',
  require('~/testUtils/mocks/entities').mockStoModule('~/api/entities/Sto')
);
jest.mock(
  '~/api/entities/DefaultPortfolio',
  require('~/testUtils/mocks/entities').mockDefaultPortfolioModule(
    '~/api/entities/DefaultPortfolio'
  )
);

describe('investInSto procedure', () => {
  let mockContext: Mocked<Context>;
  let stringToTickerStub: sinon.SinonStub<[string, Context], Ticker>;
  let portfolioIdToMeshPortfolioIdStub: sinon.SinonStub<[PortfolioId, Context], MeshPortfolioId>;
  let portfolioLikeToPortfolioIdStub: sinon.SinonStub<[PortfolioLike], PortfolioId>;
  let numberToU64Stub: sinon.SinonStub<[number | BigNumber, Context], u64>;
  let numberToBalanceStub: sinon.SinonStub<[number | BigNumber, Context, boolean?], Balance>;
  let addTransactionStub: sinon.SinonStub;

  let id: BigNumber;
  let ticker: string;
  let purchasePortfolio: PortfolioLike;
  let purchasePortfolioId: PortfolioId;
  let fundingPortfolio: PortfolioLike;
  let fundingPortfolioId: PortfolioId;
  let purchaseAmount: BigNumber;
  let maxPrice: BigNumber;
  let rawId: u64;
  let rawTicker: Ticker;
  let rawPurchasePortfolio: MeshPortfolioId;
  let rawFundingPortfolio: MeshPortfolioId;
  let rawPurchaseAmount: Balance;
  let rawMaxPrice: Balance;
  let args: Params;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    stringToTickerStub = sinon.stub(utilsConversionModule, 'stringToTicker');
    portfolioIdToMeshPortfolioIdStub = sinon.stub(
      utilsConversionModule,
      'portfolioIdToMeshPortfolioId'
    );
    portfolioLikeToPortfolioIdStub = sinon.stub(
      utilsConversionModule,
      'portfolioLikeToPortfolioId'
    );
    numberToU64Stub = sinon.stub(utilsConversionModule, 'numberToU64');
    numberToBalanceStub = sinon.stub(utilsConversionModule, 'numberToBalance');
    id = new BigNumber(id);
    rawId = dsMockUtils.createMockU64(id.toNumber());
    ticker = 'tickerFrozen';
    rawTicker = dsMockUtils.createMockTicker(ticker);
    purchasePortfolio = 'purchasePortfolioDid';
    fundingPortfolio = 'fundingPortfolioDid';
    purchasePortfolioId = { did: purchasePortfolio };
    fundingPortfolioId = { did: fundingPortfolio };
    purchaseAmount = new BigNumber(50);
    maxPrice = new BigNumber(1);
    rawPurchasePortfolio = dsMockUtils.createMockPortfolioId({
      did: dsMockUtils.createMockIdentityId(purchasePortfolio),
      kind: dsMockUtils.createMockPortfolioKind('Default'),
    });
    rawFundingPortfolio = dsMockUtils.createMockPortfolioId({
      did: dsMockUtils.createMockIdentityId(fundingPortfolio),
      kind: dsMockUtils.createMockPortfolioKind('Default'),
    });
    rawPurchaseAmount = dsMockUtils.createMockBalance(purchaseAmount.toNumber());
    rawMaxPrice = dsMockUtils.createMockBalance(maxPrice.toNumber());
  });

  beforeEach(() => {
    addTransactionStub = procedureMockUtils.getAddTransactionStub();
    mockContext = dsMockUtils.getContextInstance();
    stringToTickerStub.withArgs(ticker, mockContext).returns(rawTicker);
    portfolioLikeToPortfolioIdStub.withArgs(purchasePortfolio).returns(purchasePortfolioId);
    portfolioIdToMeshPortfolioIdStub
      .withArgs(purchasePortfolioId, mockContext)
      .returns(rawPurchasePortfolio);
    portfolioLikeToPortfolioIdStub.withArgs(fundingPortfolio).returns(fundingPortfolioId);
    portfolioIdToMeshPortfolioIdStub
      .withArgs(fundingPortfolioId, mockContext)
      .returns(rawFundingPortfolio);
    numberToU64Stub.withArgs(id, mockContext).returns(rawId);
    numberToBalanceStub.withArgs(purchaseAmount, mockContext).returns(rawPurchaseAmount);
    numberToBalanceStub.withArgs(maxPrice, mockContext).returns(rawMaxPrice);

    args = {
      id,
      ticker,
      purchasePortfolio,
      fundingPortfolio,
      purchaseAmount,
    };
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

  test('should throw an error if the STO is not accepting investments', async () => {
    entityMockUtils.configureMocks({
      stoOptions: {
        details: {
          status: {
            sale: StoSaleStatus.Frozen,
            timing: StoTimingStatus.Started,
            balance: StoBalanceStatus.Available,
          },
        },
      },
    });
    const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
      purchasePortfolioId,
      fundingPortfolioId,
    });

    return expect(prepareInvestInSto.call(proc, args)).rejects.toThrow(
      'The STO is not accepting investments at the moment'
    );
  });

  test('should throw an error if the minimum investment is not reached', async () => {
    entityMockUtils.configureMocks({
      stoOptions: {
        details: {
          status: {
            sale: StoSaleStatus.Live,
            timing: StoTimingStatus.Started,
            balance: StoBalanceStatus.Available,
          },
          end: new Date('12/12/2030'),
          minInvestment: new BigNumber(10),
          tiers: [
            {
              remaining: new BigNumber(0),
              amount: new BigNumber(100),
              price: new BigNumber(1),
            },
          ],
        },
      },
      defaultPortfolioOptions: {
        tokenBalances: [{ free: new BigNumber(20) }] as PortfolioBalance[],
      },
    });

    const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
      purchasePortfolioId,
      fundingPortfolioId,
    });

    let error;

    try {
      await prepareInvestInSto.call(proc, args);
    } catch (err) {
      error = err;
    }

    expect(error.message).toBe('Minimum investment not reached');
    expect(error.data.priceTotal).toEqual(new BigNumber(0));
  });

  test("should throw an error if the funding Portfolio doesn't have enough balance to purchase the tokens", async () => {
    entityMockUtils.configureMocks({
      stoOptions: {
        details: {
          status: {
            sale: StoSaleStatus.Live,
            timing: StoTimingStatus.Started,
            balance: StoBalanceStatus.Available,
          },
          end: new Date('12/12/2030'),
          minInvestment: new BigNumber(25),
          tiers: [
            {
              remaining: new BigNumber(50),
              amount: new BigNumber(100),
              price: new BigNumber(1),
            },
          ],
        },
      },
      defaultPortfolioOptions: {
        tokenBalances: [{ free: new BigNumber(1) }] as PortfolioBalance[],
      },
    });

    const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
      purchasePortfolioId,
      fundingPortfolioId,
    });

    let error;

    try {
      await prepareInvestInSto.call(proc, args);
    } catch (err) {
      error = err;
    }

    expect(error.message).toBe(
      'The Portfolio does not have enough free balance for this investment'
    );
    expect(error.data.free).toEqual(new BigNumber(1));
    expect(error.data.priceTotal).toEqual(new BigNumber(50));
  });

  test('should throw an error if the STO does not have enough remaining tokens', async () => {
    entityMockUtils.configureMocks({
      stoOptions: {
        details: {
          status: {
            sale: StoSaleStatus.Live,
            timing: StoTimingStatus.Started,
            balance: StoBalanceStatus.Available,
          },
          end: new Date('12/12/2030'),
          minInvestment: new BigNumber(10),
          tiers: [
            {
              remaining: new BigNumber(10),
              amount: new BigNumber(100),
              price: new BigNumber(1),
            },
            {
              remaining: new BigNumber(30),
              amount: new BigNumber(100),
              price: new BigNumber(2),
            },
          ],
        },
      },
      defaultPortfolioOptions: {
        tokenBalances: [{ free: new BigNumber(200) }] as PortfolioBalance[],
      },
    });

    const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
      purchasePortfolioId,
      fundingPortfolioId,
    });

    expect(prepareInvestInSto.call(proc, args)).rejects.toThrow(
      'The STO does not have enough remaining tokens'
    );

    expect(prepareInvestInSto.call(proc, { ...args, maxPrice })).rejects.toThrow(
      'The STO does not have enough remaining tokens below the stipulated max price'
    );
  });

  test('should add an invest transaction to the queue', async () => {
    entityMockUtils.configureMocks({
      stoOptions: {
        details: {
          status: {
            sale: StoSaleStatus.Live,
            timing: StoTimingStatus.Started,
            balance: StoBalanceStatus.Available,
          },
          end: new Date('12/12/2030'),
          minInvestment: new BigNumber(10),
          tiers: [
            {
              remaining: new BigNumber(100),
              amount: new BigNumber(100),
              price: new BigNumber(1),
            },
            {
              remaining: new BigNumber(100),
              amount: new BigNumber(100),
              price: new BigNumber(2),
            },
            {
              remaining: new BigNumber(200),
              amount: new BigNumber(200),
              price: new BigNumber(20),
            },
          ],
        },
      },
      defaultPortfolioOptions: {
        tokenBalances: [{ free: new BigNumber(200) }] as PortfolioBalance[],
      },
    });

    const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
      purchasePortfolioId,
      fundingPortfolioId,
    });

    const transaction = dsMockUtils.createTxStub('sto', 'invest');

    await prepareInvestInSto.call(proc, args);

    sinon.assert.calledWith(
      addTransactionStub,
      transaction,
      {},
      rawPurchasePortfolio,
      rawFundingPortfolio,
      rawTicker,
      rawId,
      rawPurchaseAmount,
      null,
      null
    );

    await prepareInvestInSto.call(proc, {
      ...args,
      maxPrice,
    });

    sinon.assert.calledWith(
      addTransactionStub,
      transaction,
      {},
      rawPurchasePortfolio,
      rawFundingPortfolio,
      rawTicker,
      rawId,
      rawPurchaseAmount,
      rawMaxPrice,
      null
    );
  });

  describe('getAuthorization', () => {
    test('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
        purchasePortfolioId,
        fundingPortfolioId,
      });
      const boundFunc = getAuthorization.bind(proc);

      const portfolioIdToPortfolioStub = sinon.stub(
        utilsConversionModule,
        'portfolioIdToPortfolio'
      );
      const portfolios = [
        ('investment' as unknown) as DefaultPortfolio,
        ('funding' as unknown) as DefaultPortfolio,
      ];
      portfolioIdToPortfolioStub.withArgs(purchasePortfolioId, mockContext).returns(portfolios[0]);
      portfolioIdToPortfolioStub.withArgs(fundingPortfolioId, mockContext).returns(portfolios[1]);

      const identityRoles = [
        { type: RoleType.PortfolioCustodian, portfolioId: purchasePortfolioId },
        { type: RoleType.PortfolioCustodian, portfolioId: fundingPortfolioId },
      ];

      expect(boundFunc()).toEqual({
        identityRoles,
        signerPermissions: {
          transactions: [TxTags.sto.Invest],
          tokens: [],
          portfolios,
        },
      });
    });
  });

  describe('prepareStorage', () => {
    test('should return the investment and funding portfolio ids', () => {
      const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext);
      const boundFunc = prepareStorage.bind(proc);

      const result = boundFunc(args);

      expect(result).toEqual({
        purchasePortfolioId,
        fundingPortfolioId,
      });
    });
  });
});
