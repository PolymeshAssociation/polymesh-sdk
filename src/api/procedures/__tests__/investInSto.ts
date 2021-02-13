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
import { PortfolioBalance, PortfolioLike, RoleType, StoStatus } from '~/types';
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
  let investmentPortfolio: PortfolioLike;
  let investmentPortfolioId: PortfolioId;
  let fundingPortfolio: PortfolioLike;
  let fundingPortfolioId: PortfolioId;
  let investmentAmount: BigNumber;
  let maxPrice: BigNumber;
  let rawId: u64;
  let rawTicker: Ticker;
  let rawInvestmentPortfolio: MeshPortfolioId;
  let rawFundingPortfolio: MeshPortfolioId;
  let rawInvestmentAmount: Balance;
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
    investmentPortfolio = 'investmentPortfolioDid';
    fundingPortfolio = 'fundingPortfolioDid';
    investmentPortfolioId = { did: investmentPortfolio };
    fundingPortfolioId = { did: fundingPortfolio };
    investmentAmount = new BigNumber(50);
    maxPrice = new BigNumber(1);
    rawInvestmentPortfolio = dsMockUtils.createMockPortfolioId({
      did: dsMockUtils.createMockIdentityId(investmentPortfolio),
      kind: dsMockUtils.createMockPortfolioKind('Default'),
    });
    rawFundingPortfolio = dsMockUtils.createMockPortfolioId({
      did: dsMockUtils.createMockIdentityId(fundingPortfolio),
      kind: dsMockUtils.createMockPortfolioKind('Default'),
    });
    rawInvestmentAmount = dsMockUtils.createMockBalance(investmentAmount.toNumber());
    rawMaxPrice = dsMockUtils.createMockBalance(maxPrice.toNumber());
  });

  beforeEach(() => {
    addTransactionStub = procedureMockUtils.getAddTransactionStub();
    mockContext = dsMockUtils.getContextInstance();
    stringToTickerStub.withArgs(ticker, mockContext).returns(rawTicker);
    portfolioLikeToPortfolioIdStub.withArgs(investmentPortfolio).returns(investmentPortfolioId);
    portfolioIdToMeshPortfolioIdStub
      .withArgs(investmentPortfolioId, mockContext)
      .returns(rawInvestmentPortfolio);
    portfolioLikeToPortfolioIdStub.withArgs(fundingPortfolio).returns(fundingPortfolioId);
    portfolioIdToMeshPortfolioIdStub
      .withArgs(fundingPortfolioId, mockContext)
      .returns(rawFundingPortfolio);
    numberToU64Stub.withArgs(id, mockContext).returns(rawId);
    numberToBalanceStub.withArgs(investmentAmount, mockContext).returns(rawInvestmentAmount);
    numberToBalanceStub.withArgs(maxPrice, mockContext).returns(rawMaxPrice);

    args = {
      id,
      ticker,
      investmentPortfolio,
      fundingPortfolio,
      investmentAmount,
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

  test('should throw an error if the STO is not live', async () => {
    entityMockUtils.configureMocks({
      stoOptions: {
        details: {
          status: StoStatus.Closed,
        },
      },
    });
    const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
      investmentPortfolioId,
      fundingPortfolioId,
    });

    return expect(prepareInvestInSto.call(proc, args)).rejects.toThrow('The STO is not live');
  });

  test('should throw an error if the STO has already ended', async () => {
    entityMockUtils.configureMocks({
      stoOptions: {
        details: {
          status: StoStatus.Live,
          end: new Date('1/1/2020'),
        },
      },
    });
    const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
      investmentPortfolioId,
      fundingPortfolioId,
    });

    return expect(prepareInvestInSto.call(proc, args)).rejects.toThrow('The STO has already ended');
  });

  test('should throw an error if the investment amount is less than the STO minimum investment', async () => {
    entityMockUtils.configureMocks({
      stoOptions: {
        details: {
          status: StoStatus.Live,
          end: new Date('12/12/2030'),
          minInvestment: new BigNumber(1000),
        },
      },
    });
    const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
      investmentPortfolioId,
      fundingPortfolioId,
    });

    return expect(prepareInvestInSto.call(proc, args)).rejects.toThrow(
      'Investment amount must be equals or greater than minimum investment'
    );
  });

  test('should throw an error if the investment Portfolio has not enough balance to affront the investment', async () => {
    entityMockUtils.configureMocks({
      stoOptions: {
        details: {
          status: StoStatus.Live,
          end: new Date('12/12/2030'),
          minInvestment: new BigNumber(10),
        },
      },
      defaultPortfolioOptions: {
        tokenBalances: [{ total: new BigNumber(1) }] as PortfolioBalance[],
      },
    });

    const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
      investmentPortfolioId,
      fundingPortfolioId,
    });

    return expect(prepareInvestInSto.call(proc, args)).rejects.toThrow(
      'The Portfolio has not enough balance to affront the investment'
    );
  });

  test('should throw an error if the investment Portfolio has not enough balance to affront the investment', async () => {
    entityMockUtils.configureMocks({
      stoOptions: {
        details: {
          status: StoStatus.Live,
          end: new Date('12/12/2030'),
          minInvestment: new BigNumber(10),
          tiers: [
            {
              remaining: new BigNumber(10),
              amount: new BigNumber(100),
              price: new BigNumber(1),
            },
            {
              remaining: new BigNumber(20),
              amount: new BigNumber(100),
              price: new BigNumber(2),
            },
          ],
        },
      },
      defaultPortfolioOptions: {
        tokenBalances: [{ total: new BigNumber(200) }] as PortfolioBalance[],
      },
    });

    const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
      investmentPortfolioId,
      fundingPortfolioId,
    });

    return expect(prepareInvestInSto.call(proc, args)).rejects.toThrow(
      'The STO does not have enough remaining tokens to fulfill the investment'
    );
  });

  test('should throw an error if user set maxPrice and the STO cannot satisfy the buy', async () => {
    entityMockUtils.configureMocks({
      stoOptions: {
        details: {
          status: StoStatus.Live,
          end: new Date('12/12/2030'),
          minInvestment: new BigNumber(10),
          tiers: [
            {
              remaining: new BigNumber(40),
              amount: new BigNumber(100),
              price: new BigNumber(1),
            },
            {
              remaining: new BigNumber(100),
              amount: new BigNumber(100),
              price: new BigNumber(2),
            },
          ],
        },
      },
      defaultPortfolioOptions: {
        tokenBalances: [{ total: new BigNumber(200) }] as PortfolioBalance[],
      },
    });

    const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
      investmentPortfolioId,
      fundingPortfolioId,
    });

    return expect(prepareInvestInSto.call(proc, { ...args, maxPrice })).rejects.toThrow(
      'The STO does not have enough tiers that satisfy your constraint'
    );
  });

  test('should add an invest transaction to the queue', async () => {
    entityMockUtils.configureMocks({
      stoOptions: {
        details: {
          status: StoStatus.Live,
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
          ],
        },
      },
      defaultPortfolioOptions: {
        tokenBalances: [{ total: new BigNumber(200) }] as PortfolioBalance[],
      },
    });

    const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
      investmentPortfolioId,
      fundingPortfolioId,
    });

    const transaction = dsMockUtils.createTxStub('sto', 'invest');

    await prepareInvestInSto.call(proc, args);

    sinon.assert.calledWith(
      addTransactionStub,
      transaction,
      {},
      rawInvestmentPortfolio,
      rawFundingPortfolio,
      rawTicker,
      rawId,
      rawInvestmentAmount,
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
      rawInvestmentPortfolio,
      rawFundingPortfolio,
      rawTicker,
      rawId,
      rawInvestmentAmount,
      rawMaxPrice,
      null
    );
  });

  describe('getAuthorization', () => {
    test('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
        investmentPortfolioId,
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
      portfolioIdToPortfolioStub
        .withArgs(investmentPortfolioId, mockContext)
        .returns(portfolios[0]);
      portfolioIdToPortfolioStub.withArgs(fundingPortfolioId, mockContext).returns(portfolios[1]);

      const identityRoles = [
        { type: RoleType.PortfolioCustodian, portfolioId: investmentPortfolioId },
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
    test('should return the investment and funding portfolio ids', async () => {
      const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext);
      const boundFunc = prepareStorage.bind(proc);

      const result = await boundFunc(args);

      expect(result).toEqual({
        investmentPortfolioId,
        fundingPortfolioId,
      });
    });
  });
});
