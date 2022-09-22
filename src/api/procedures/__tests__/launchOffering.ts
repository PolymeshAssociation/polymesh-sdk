import { Bytes, u64 } from '@polkadot/types';
import { Balance } from '@polkadot/types/interfaces';
import { ISubmittableResult } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';
import { Moment, PortfolioId as MeshPortfolioId, PriceTier, Ticker } from 'polymesh-types/types';

import {
  createOfferingResolver,
  getAuthorization,
  Params,
  prepareLaunchOffering,
  prepareStorage,
  Storage,
} from '~/api/procedures/launchOffering';
import { Context, DefaultPortfolio, Offering, Venue } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import {
  OfferingTier,
  PortfolioBalance,
  PortfolioId,
  PortfolioLike,
  RoleType,
  TxTags,
  VenueType,
} from '~/types';
import * as utilsConversionModule from '~/utils/conversion';
import * as utilsInternalModule from '~/utils/internal';

jest.mock(
  '~/api/entities/Asset',
  require('~/testUtils/mocks/entities').mockAssetModule('~/api/entities/Asset')
);
jest.mock(
  '~/api/entities/Identity',
  require('~/testUtils/mocks/entities').mockIdentityModule('~/api/entities/Identity')
);
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

describe('launchOffering procedure', () => {
  let mockContext: Mocked<Context>;
  let stringToTickerStub: jest.SpyInstance<Ticker, [string, Context]>;
  let portfolioIdToMeshPortfolioIdStub: jest.SpyInstance<MeshPortfolioId, [PortfolioId, Context]>;
  let portfolioLikeToPortfolioIdStub: jest.SpyInstance<PortfolioId, [PortfolioLike]>;
  let bigNumberToU64Stub: jest.SpyInstance<u64, [BigNumber, Context]>;
  let dateToMomentStub: jest.SpyInstance<Moment, [Date, Context]>;
  let bigNumberToBalanceStub: jest.SpyInstance<Balance, [BigNumber, Context, boolean?]>;
  let offeringTierToPriceTierStub: jest.SpyInstance<PriceTier, [OfferingTier, Context]>;
  let stringToBytesStub: jest.SpyInstance<Bytes, [string, Context]>;
  let portfolioIdToPortfolioStub: jest.SpyInstance;
  let ticker: string;
  let offeringPortfolio: PortfolioLike;
  let portfolio: entityMockUtils.MockDefaultPortfolio;
  let offeringPortfolioId: PortfolioId;
  let raisingPortfolio: PortfolioLike;
  let raisingPortfolioId: PortfolioId;
  let raisingCurrency: string;
  let venueId: BigNumber;
  let venue: Venue;
  let name: string;
  let start: Date;
  let end: Date;
  let amount: BigNumber;
  let price: BigNumber;
  let minInvestment: BigNumber;
  let rawTicker: Ticker;
  let rawOfferingPortfolio: MeshPortfolioId;
  let rawRaisingPortfolio: MeshPortfolioId;
  let rawRaisingCurrency: Ticker;
  let rawVenueId: u64;
  let rawName: Bytes;
  let rawStart: Moment;
  let rawEnd: Moment;
  let rawTiers: PriceTier[];
  let rawMinInvestment: Balance;

  let args: Params;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    stringToTickerStub = jest.spyOn(utilsConversionModule, 'stringToTicker');
    portfolioIdToMeshPortfolioIdStub = jest.spyOn(
      utilsConversionModule,
      'portfolioIdToMeshPortfolioId'
    );
    portfolioLikeToPortfolioIdStub = jest.spyOn(
      utilsConversionModule,
      'portfolioLikeToPortfolioId'
    );
    offeringTierToPriceTierStub = jest.spyOn(utilsConversionModule, 'offeringTierToPriceTier');
    bigNumberToU64Stub = jest.spyOn(utilsConversionModule, 'bigNumberToU64');
    dateToMomentStub = jest.spyOn(utilsConversionModule, 'dateToMoment');
    bigNumberToBalanceStub = jest.spyOn(utilsConversionModule, 'bigNumberToBalance');
    stringToBytesStub = jest.spyOn(utilsConversionModule, 'stringToBytes');
    portfolioIdToPortfolioStub = jest.spyOn(utilsConversionModule, 'portfolioIdToPortfolio');
    ticker = 'tickerFrozen';
    rawTicker = dsMockUtils.createMockTicker(ticker);
    offeringPortfolio = 'oneDid';
    raisingPortfolio = 'treasuryDid';
    offeringPortfolioId = { did: offeringPortfolio };
    raisingPortfolioId = { did: raisingPortfolio };
    raisingCurrency = 'USD';
    venueId = new BigNumber(1);
    name = 'someOffering';
    const now = new Date();
    start = new Date(now.getTime() + 10000);
    end = new Date(start.getTime() + 10000);
    amount = new BigNumber(100);
    price = new BigNumber(1000);
    minInvestment = new BigNumber(50);
    rawOfferingPortfolio = dsMockUtils.createMockPortfolioId({
      did: dsMockUtils.createMockIdentityId(offeringPortfolio),
      kind: dsMockUtils.createMockPortfolioKind('Default'),
    });
    rawRaisingPortfolio = dsMockUtils.createMockPortfolioId({
      did: dsMockUtils.createMockIdentityId(raisingPortfolio),
      kind: dsMockUtils.createMockPortfolioKind('Default'),
    });
    rawRaisingCurrency = dsMockUtils.createMockTicker(raisingCurrency);
    rawVenueId = dsMockUtils.createMockU64(venueId);
    rawName = dsMockUtils.createMockBytes(name);
    rawStart = dsMockUtils.createMockMoment(new BigNumber(start.getTime()));
    rawEnd = dsMockUtils.createMockMoment(new BigNumber(end.getTime()));
    rawTiers = [
      dsMockUtils.createMockPriceTier({
        total: dsMockUtils.createMockBalance(amount),
        price: dsMockUtils.createMockBalance(price),
      }),
    ];
    rawMinInvestment = dsMockUtils.createMockBalance(minInvestment);
  });

  beforeEach(() => {
    venue = entityMockUtils.getVenueInstance({
      id: venueId,
      details: {
        type: VenueType.Sto,
      },
    });
    mockContext = dsMockUtils.getContextInstance();
    when(stringToTickerStub).calledWith(ticker, mockContext).mockReturnValue(rawTicker);
    when(stringToTickerStub)
      .calledWith(raisingCurrency, mockContext)
      .mockReturnValue(rawRaisingCurrency);
    when(portfolioLikeToPortfolioIdStub)
      .calledWith(offeringPortfolio)
      .mockReturnValue(offeringPortfolioId);
    when(portfolioIdToMeshPortfolioIdStub)
      .calledWith(offeringPortfolioId, mockContext)
      .mockReturnValue(rawOfferingPortfolio);
    when(portfolioLikeToPortfolioIdStub)
      .calledWith(raisingPortfolio)
      .mockReturnValue(raisingPortfolioId);
    when(portfolioIdToMeshPortfolioIdStub)
      .calledWith(raisingPortfolioId, mockContext)
      .mockReturnValue(rawRaisingPortfolio);
    when(offeringTierToPriceTierStub)
      .calledWith({ amount, price }, mockContext)
      .mockReturnValue(rawTiers[0]);
    when(bigNumberToU64Stub).calledWith(venue.id, mockContext).mockReturnValue(rawVenueId);
    when(dateToMomentStub).calledWith(start, mockContext).mockReturnValue(rawStart);
    when(dateToMomentStub).calledWith(end, mockContext).mockReturnValue(rawEnd);
    when(stringToBytesStub).calledWith(name, mockContext).mockReturnValue(rawName);
    when(bigNumberToBalanceStub)
      .calledWith(minInvestment, mockContext)
      .mockReturnValue(rawMinInvestment);
    portfolio = entityMockUtils.getDefaultPortfolioInstance(offeringPortfolioId);
    when(portfolioIdToPortfolioStub)
      .calledWith(offeringPortfolioId, mockContext)
      .mockReturnValue(portfolio);

    args = {
      ticker,
      offeringPortfolio,
      raisingPortfolio,
      raisingCurrency,
      venue,
      name,
      start,
      end,
      tiers: [{ amount, price }],
      minInvestment,
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

  it('should throw an error if no valid Venue was supplied or found', async () => {
    portfolio.getAssetBalances = jest.fn().mockResolvedValue([{ free: new BigNumber(20) }]);
    entityMockUtils.configureMocks({
      identityOptions: {
        getVenues: [entityMockUtils.getVenueInstance({ details: { type: VenueType.Exchange } })],
      },
    });
    const proc = procedureMockUtils.getInstance<Params, Offering, Storage>(mockContext, {
      offeringPortfolioId,
      raisingPortfolioId,
    });

    let err: Error | undefined;

    try {
      await prepareLaunchOffering.call(proc, {
        ...args,
        venue: entityMockUtils.getVenueInstance({ exists: false }),
      });
    } catch (error) {
      err = error;
    }

    expect(err?.message).toBe('A valid Venue for the Offering was neither supplied nor found');

    err = undefined;

    try {
      await prepareLaunchOffering.call(proc, { ...args, venue: undefined });
    } catch (error) {
      err = error;
    }

    expect(err?.message).toBe('A valid Venue for the Offering was neither supplied nor found');
  });

  it("should throw an error if Asset tokens offered exceed the Portfolio's balance", async () => {
    portfolio.getAssetBalances = jest.fn().mockResolvedValue([{ free: new BigNumber(1) }]);

    const proc = procedureMockUtils.getInstance<Params, Offering, Storage>(mockContext, {
      offeringPortfolioId,
      raisingPortfolioId,
    });

    let err: Error | undefined;

    try {
      await prepareLaunchOffering.call(proc, args);
    } catch (error) {
      err = error;
    }

    expect(err?.message).toBe("There isn't enough free balance in the offering Portfolio");
  });

  it('should return a create fundraiser transaction spec', async () => {
    portfolio.getAssetBalances = jest.fn().mockResolvedValue([{ free: new BigNumber(1000) }]);

    const proc = procedureMockUtils.getInstance<Params, Offering, Storage>(mockContext, {
      offeringPortfolioId,
      raisingPortfolioId,
    });

    const transaction = dsMockUtils.createTxStub('sto', 'createFundraiser');

    let result = await prepareLaunchOffering.call(proc, args);

    expect(result).toEqual({
      transaction,
      args: [
        rawOfferingPortfolio,
        rawTicker,
        rawRaisingPortfolio,
        rawRaisingCurrency,
        rawTiers,
        rawVenueId,
        rawStart,
        rawEnd,
        rawMinInvestment,
        rawName,
      ],
      resolver: expect.any(Function),
    });

    entityMockUtils.configureMocks({
      venueOptions: {
        details: {
          type: VenueType.Sto,
        },
      },
      identityOptions: {
        getVenues: [venue],
      },
      defaultPortfolioOptions: {
        getAssetBalances: [{ free: new BigNumber(1000) }] as PortfolioBalance[],
      },
    });

    result = await prepareLaunchOffering.call(proc, {
      ...args,
      venue: undefined,
      start: undefined,
      end: undefined,
    });

    expect(result).toEqual({
      transaction,
      args: [
        rawOfferingPortfolio,
        rawTicker,
        rawRaisingPortfolio,
        rawRaisingCurrency,
        rawTiers,
        rawVenueId,
        null,
        null,
        rawMinInvestment,
        rawName,
      ],
      resolver: expect.any(Function),
    });
  });

  describe('stoResolver', () => {
    const filterEventRecordsStub = jest.spyOn(utilsInternalModule, 'filterEventRecords');
    const stoId = new BigNumber(15);

    beforeAll(() => {
      entityMockUtils.initMocks({ offeringOptions: { ticker, id: stoId } });
    });

    beforeEach(() => {
      filterEventRecordsStub.mockReturnValue([
        dsMockUtils.createMockIEvent(['filler', dsMockUtils.createMockU64(stoId)]),
      ]);
    });

    afterEach(() => {
      filterEventRecordsStub.mockReset();
    });

    it('should return the new Offering', () => {
      const result = createOfferingResolver(ticker, mockContext)({} as ISubmittableResult);

      expect(result).toEqual(
        expect.objectContaining({ asset: expect.objectContaining({ ticker }), id: stoId })
      );
    });
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<Params, Offering, Storage>(mockContext, {
        offeringPortfolioId,
        raisingPortfolioId,
      });
      const boundFunc = getAuthorization.bind(proc);

      const portfolios = [
        'offering' as unknown as DefaultPortfolio,
        'raising' as unknown as DefaultPortfolio,
      ];
      when(portfolioIdToPortfolioStub)
        .calledWith(offeringPortfolioId, mockContext)
        .mockReturnValue(portfolios[0]);
      when(portfolioIdToPortfolioStub)
        .calledWith(raisingPortfolioId, mockContext)
        .mockReturnValue(portfolios[1]);

      const roles = [
        { type: RoleType.PortfolioCustodian, portfolioId: offeringPortfolioId },
        { type: RoleType.PortfolioCustodian, portfolioId: raisingPortfolioId },
      ];

      expect(boundFunc(args)).toEqual({
        roles,
        permissions: {
          transactions: [TxTags.sto.CreateFundraiser],
          assets: [expect.objectContaining({ ticker })],
          portfolios,
        },
      });
    });
  });

  describe('prepareStorage', () => {
    it('should return the offering and raising portfolio ids', async () => {
      const proc = procedureMockUtils.getInstance<Params, Offering, Storage>(mockContext);
      const boundFunc = prepareStorage.bind(proc);

      const result = await boundFunc(args);

      expect(result).toEqual({
        offeringPortfolioId,
        raisingPortfolioId,
      });
    });
  });
});
