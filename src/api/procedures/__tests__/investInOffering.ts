import { u64 } from '@polkadot/types';
import { Balance } from '@polkadot/types/interfaces';
import {
  PolymeshPrimitivesAssetAssetID,
  PolymeshPrimitivesIdentityIdPortfolioId,
} from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import {
  getAuthorization,
  Params,
  prepareInvestInSto,
  prepareStorage,
  Storage,
} from '~/api/procedures/investInOffering';
import { Context, DefaultPortfolio, FungibleAsset } from '~/internal';
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
  let assetToMeshAssetIdSpy: jest.SpyInstance;
  let portfolioIdToMeshPortfolioIdSpy: jest.SpyInstance<
    PolymeshPrimitivesIdentityIdPortfolioId,
    [PortfolioId, Context]
  >;
  let portfolioLikeToPortfolioIdSpy: jest.SpyInstance<PortfolioId, [PortfolioLike]>;
  let bigNumberToU64Spy: jest.SpyInstance<u64, [BigNumber, Context]>;
  let bigNumberToBalanceSpy: jest.SpyInstance<Balance, [BigNumber, Context, boolean?]>;

  let id: BigNumber;
  let assetId: string;
  let asset: FungibleAsset;
  let purchasePortfolio: PortfolioLike;
  let purchasePortfolioId: PortfolioId;
  let fundingPortfolio: PortfolioLike;
  let fundingPortfolioId: PortfolioId;
  let purchaseAmount: BigNumber;
  let maxPrice: BigNumber;
  let rawId: u64;
  let rawAssetId: PolymeshPrimitivesAssetAssetID;
  let rawPurchasePortfolio: PolymeshPrimitivesIdentityIdPortfolioId;
  let rawFundingPortfolio: PolymeshPrimitivesIdentityIdPortfolioId;
  let rawPurchaseAmount: Balance;
  let rawMaxPrice: Balance;
  let args: Params;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    assetToMeshAssetIdSpy = jest.spyOn(utilsConversionModule, 'assetToMeshAssetId');
    portfolioIdToMeshPortfolioIdSpy = jest.spyOn(
      utilsConversionModule,
      'portfolioIdToMeshPortfolioId'
    );
    portfolioLikeToPortfolioIdSpy = jest.spyOn(utilsConversionModule, 'portfolioLikeToPortfolioId');
    bigNumberToU64Spy = jest.spyOn(utilsConversionModule, 'bigNumberToU64');
    bigNumberToBalanceSpy = jest.spyOn(utilsConversionModule, 'bigNumberToBalance');
    id = new BigNumber(id);
    rawId = dsMockUtils.createMockU64(id);
    assetId = '0x1234';
    asset = entityMockUtils.getFungibleAssetInstance({ assetId });
    rawAssetId = dsMockUtils.createMockAssetId(assetId);
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
    mockContext = dsMockUtils.getContextInstance();
    when(assetToMeshAssetIdSpy).calledWith(asset, mockContext).mockReturnValue(rawAssetId);
    when(portfolioLikeToPortfolioIdSpy)
      .calledWith(purchasePortfolio)
      .mockReturnValue(purchasePortfolioId);
    when(portfolioIdToMeshPortfolioIdSpy)
      .calledWith(purchasePortfolioId, mockContext)
      .mockReturnValue(rawPurchasePortfolio);
    when(portfolioLikeToPortfolioIdSpy)
      .calledWith(fundingPortfolio)
      .mockReturnValue(fundingPortfolioId);
    when(portfolioIdToMeshPortfolioIdSpy)
      .calledWith(fundingPortfolioId, mockContext)
      .mockReturnValue(rawFundingPortfolio);
    when(bigNumberToU64Spy).calledWith(id, mockContext).mockReturnValue(rawId);
    when(bigNumberToBalanceSpy)
      .calledWith(purchaseAmount, mockContext)
      .mockReturnValue(rawPurchaseAmount);
    when(bigNumberToBalanceSpy).calledWith(maxPrice, mockContext).mockReturnValue(rawMaxPrice);

    args = {
      id,
      asset,
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

  it('should return an invest transaction spec', async () => {
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

    const transaction = dsMockUtils.createTxMock('sto', 'invest');

    let result = await prepareInvestInSto.call(proc, args);

    expect(result).toEqual({
      transaction,
      args: [
        rawPurchasePortfolio,
        rawFundingPortfolio,
        rawAssetId,
        rawId,
        rawPurchaseAmount,
        null,
        null,
      ],
      resolver: undefined,
    });

    result = await prepareInvestInSto.call(proc, {
      ...args,
      maxPrice,
    });

    expect(result).toEqual({
      transaction,
      args: [
        rawPurchasePortfolio,
        rawFundingPortfolio,
        rawAssetId,
        rawId,
        rawPurchaseAmount,
        rawMaxPrice,
        null,
      ],
      resolver: undefined,
    });
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
        purchasePortfolioId,
        fundingPortfolioId,
      });
      const boundFunc = getAuthorization.bind(proc);

      const portfolioIdToPortfolioSpy = jest
        .spyOn(utilsConversionModule, 'portfolioIdToPortfolio')
        .mockClear()
        .mockImplementation();
      const portfolios = [
        'investment' as unknown as DefaultPortfolio,
        'funding' as unknown as DefaultPortfolio,
      ];
      when(portfolioIdToPortfolioSpy)
        .calledWith(purchasePortfolioId, mockContext)
        .mockReturnValue(portfolios[0]);
      when(portfolioIdToPortfolioSpy)
        .calledWith(fundingPortfolioId, mockContext)
        .mockReturnValue(portfolios[1]);

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
