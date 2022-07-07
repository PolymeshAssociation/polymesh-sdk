import { u64 } from '@polkadot/types';
import { Balance } from '@polkadot/types/interfaces';
import BigNumber from 'bignumber.js';
import { PortfolioId as MeshPortfolioId, Ticker } from 'polymesh-types/types';
import sinon from 'sinon';

import {
  getAuthorization,
  Params,
  prepareInvestInSto,
  prepareStorage,
  Storage,
} from '~/api/procedures/investInOffering';
import { Context, DefaultPortfolio } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import {
  OfferingBalanceStatus,
  OfferingSaleStatus,
  OfferingTimingStatus,
  PortfolioBalance,
  PortfolioId,
  PortfolioLike,
  RoleType,
  TxTags,
} from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Offering',
  require('~/testUtils/mocks/entities').mockOfferingModule('~/api/entities/Offering')
);
jest.mock(
  '~/api/entities/DefaultPortfolio',
  require('~/testUtils/mocks/entities').mockDefaultPortfolioModule(
    '~/api/entities/DefaultPortfolio'
  )
);

describe('investInOffering procedure', () => {
  let mockContext: Mocked<Context>;
  let stringToTickerStub: sinon.SinonStub<[string, Context], Ticker>;
  let portfolioIdToMeshPortfolioIdStub: sinon.SinonStub<[PortfolioId, Context], MeshPortfolioId>;
  let portfolioLikeToPortfolioIdStub: sinon.SinonStub<[PortfolioLike], PortfolioId>;
  let bigNumberToU64Stub: sinon.SinonStub<[BigNumber, Context], u64>;
  let bigNumberToBalanceStub: sinon.SinonStub<[BigNumber, Context, boolean?], Balance>;
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
    bigNumberToU64Stub = sinon.stub(utilsConversionModule, 'bigNumberToU64');
    bigNumberToBalanceStub = sinon.stub(utilsConversionModule, 'bigNumberToBalance');
    id = new BigNumber(id);
    rawId = dsMockUtils.createMockU64(id);
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
    rawPurchaseAmount = dsMockUtils.createMockBalance(purchaseAmount);
    rawMaxPrice = dsMockUtils.createMockBalance(maxPrice);
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
    bigNumberToU64Stub.withArgs(id, mockContext).returns(rawId);
    bigNumberToBalanceStub.withArgs(purchaseAmount, mockContext).returns(rawPurchaseAmount);
    bigNumberToBalanceStub.withArgs(maxPrice, mockContext).returns(rawMaxPrice);

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
    procedureMockUtils.cleanup();
    dsMockUtils.cleanup();
  });

  it('should throw an error if the Offering is not accepting investments', () => {
    entityMockUtils.configureMocks({
      offeringOptions: {
        details: {
          status: {
            sale: OfferingSaleStatus.Frozen,
            timing: OfferingTimingStatus.Started,
            balance: OfferingBalanceStatus.Available,
          },
        },
      },
    });
    const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
      purchasePortfolioId,
      fundingPortfolioId,
    });

    return expect(prepareInvestInSto.call(proc, args)).rejects.toThrow(
      'The Offering is not accepting investments at the moment'
    );
  });

  it('should throw an error if the minimum investment is not reached', async () => {
    entityMockUtils.configureMocks({
      offeringOptions: {
        details: {
          status: {
            sale: OfferingSaleStatus.Live,
            timing: OfferingTimingStatus.Started,
            balance: OfferingBalanceStatus.Available,
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
        getAssetBalances: [{ free: new BigNumber(20) }] as PortfolioBalance[],
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

  it("should throw an error if the funding Portfolio doesn't have enough balance to purchase the Assets", async () => {
    entityMockUtils.configureMocks({
      offeringOptions: {
        details: {
          status: {
            sale: OfferingSaleStatus.Live,
            timing: OfferingTimingStatus.Started,
            balance: OfferingBalanceStatus.Available,
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
        getAssetBalances: [{ free: new BigNumber(1) }] as PortfolioBalance[],
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

  it('should throw an error if the Offering does not have enough remaining Assets', async () => {
    entityMockUtils.configureMocks({
      offeringOptions: {
        details: {
          status: {
            sale: OfferingSaleStatus.Live,
            timing: OfferingTimingStatus.Started,
            balance: OfferingBalanceStatus.Available,
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
        getAssetBalances: [{ free: new BigNumber(200) }] as PortfolioBalance[],
      },
    });

    const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
      purchasePortfolioId,
      fundingPortfolioId,
    });

    await expect(prepareInvestInSto.call(proc, args)).rejects.toThrow(
      'The Offering does not have enough remaining tokens'
    );

    return expect(prepareInvestInSto.call(proc, { ...args, maxPrice })).rejects.toThrow(
      'The Offering does not have enough remaining tokens below the stipulated max price'
    );
  });

  it('should add an invest transaction to the queue', async () => {
    entityMockUtils.configureMocks({
      offeringOptions: {
        details: {
          status: {
            sale: OfferingSaleStatus.Live,
            timing: OfferingTimingStatus.Started,
            balance: OfferingBalanceStatus.Available,
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
        getAssetBalances: [{ free: new BigNumber(200) }] as PortfolioBalance[],
      },
    });

    const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
      purchasePortfolioId,
      fundingPortfolioId,
    });

    const transaction = dsMockUtils.createTxStub('sto', 'invest');

    await prepareInvestInSto.call(proc, args);

    sinon.assert.calledWith(addTransactionStub, {
      transaction,
      args: [
        rawPurchasePortfolio,
        rawFundingPortfolio,
        rawTicker,
        rawId,
        rawPurchaseAmount,
        null,
        null,
      ],
    });

    await prepareInvestInSto.call(proc, {
      ...args,
      maxPrice,
    });

    sinon.assert.calledWith(addTransactionStub, {
      transaction,
      args: [
        rawPurchasePortfolio,
        rawFundingPortfolio,
        rawTicker,
        rawId,
        rawPurchaseAmount,
        rawMaxPrice,
        null,
      ],
    });
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
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
        'investment' as unknown as DefaultPortfolio,
        'funding' as unknown as DefaultPortfolio,
      ];
      portfolioIdToPortfolioStub.withArgs(purchasePortfolioId, mockContext).returns(portfolios[0]);
      portfolioIdToPortfolioStub.withArgs(fundingPortfolioId, mockContext).returns(portfolios[1]);

      const roles = [
        { type: RoleType.PortfolioCustodian, portfolioId: purchasePortfolioId },
        { type: RoleType.PortfolioCustodian, portfolioId: fundingPortfolioId },
      ];

      expect(boundFunc()).toEqual({
        roles,
        permissions: {
          transactions: [TxTags.sto.Invest],
          assets: [],
          portfolios,
        },
      });
    });
  });

  describe('prepareStorage', () => {
    it('should return the investment and funding portfolio ids', () => {
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
