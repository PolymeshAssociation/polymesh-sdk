import { Bytes, u64 } from '@polkadot/types';
import { Balance } from '@polkadot/types/interfaces';
import { ISubmittableResult } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';
import { Moment, PortfolioId as MeshPortfolioId, PriceTier, Ticker } from 'polymesh-types/types';
import sinon from 'sinon';

import {
  createOfferingResolver,
  getAuthorization,
  Params,
  prepareLaunchOffering,
  prepareStorage,
  Storage,
} from '~/api/procedures/launchOffering';
import { Context, DefaultPortfolio, Offering, PostTransactionValue, Venue } from '~/internal';
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
  let stringToTickerStub: sinon.SinonStub<[string, Context], Ticker>;
  let portfolioIdToMeshPortfolioIdStub: sinon.SinonStub<[PortfolioId, Context], MeshPortfolioId>;
  let portfolioLikeToPortfolioIdStub: sinon.SinonStub<[PortfolioLike], PortfolioId>;
  let bigNumberToU64Stub: sinon.SinonStub<[BigNumber, Context], u64>;
  let dateToMomentStub: sinon.SinonStub<[Date, Context], Moment>;
  let bigNumberToBalanceStub: sinon.SinonStub<[BigNumber, Context, boolean?], Balance>;
  let offeringTierToPriceTierStub: sinon.SinonStub<[OfferingTier, Context], PriceTier>;
  let stringToBytesStub: sinon.SinonStub<[string, Context], Bytes>;
  let portfolioIdToPortfolioStub: sinon.SinonStub;
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

  let offering: PostTransactionValue<Offering>;

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
    offeringTierToPriceTierStub = sinon.stub(utilsConversionModule, 'offeringTierToPriceTier');
    bigNumberToU64Stub = sinon.stub(utilsConversionModule, 'bigNumberToU64');
    dateToMomentStub = sinon.stub(utilsConversionModule, 'dateToMoment');
    bigNumberToBalanceStub = sinon.stub(utilsConversionModule, 'bigNumberToBalance');
    stringToBytesStub = sinon.stub(utilsConversionModule, 'stringToBytes');
    portfolioIdToPortfolioStub = sinon.stub(utilsConversionModule, 'portfolioIdToPortfolio');
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

    offering = 'offering' as unknown as PostTransactionValue<Offering>;
  });

  let addTransactionStub: sinon.SinonStub;

  beforeEach(() => {
    venue = entityMockUtils.getVenueInstance({
      id: venueId,
      details: {
        type: VenueType.Sto,
      },
    });
    addTransactionStub = procedureMockUtils.getAddTransactionStub().returns([offering]);
    mockContext = dsMockUtils.getContextInstance();
    stringToTickerStub.withArgs(ticker, mockContext).returns(rawTicker);
    stringToTickerStub.withArgs(raisingCurrency, mockContext).returns(rawRaisingCurrency);
    portfolioLikeToPortfolioIdStub.withArgs(offeringPortfolio).returns(offeringPortfolioId);
    portfolioIdToMeshPortfolioIdStub
      .withArgs(offeringPortfolioId, mockContext)
      .returns(rawOfferingPortfolio);
    portfolioLikeToPortfolioIdStub.withArgs(raisingPortfolio).returns(raisingPortfolioId);
    portfolioIdToMeshPortfolioIdStub
      .withArgs(raisingPortfolioId, mockContext)
      .returns(rawRaisingPortfolio);
    offeringTierToPriceTierStub.withArgs({ amount, price }, mockContext).returns(rawTiers[0]);
    bigNumberToU64Stub.withArgs(venue.id, mockContext).returns(rawVenueId);
    dateToMomentStub.withArgs(start, mockContext).returns(rawStart);
    dateToMomentStub.withArgs(end, mockContext).returns(rawEnd);
    stringToBytesStub.withArgs(name, mockContext).returns(rawName);
    bigNumberToBalanceStub.withArgs(minInvestment, mockContext).returns(rawMinInvestment);
    portfolio = entityMockUtils.getDefaultPortfolioInstance(offeringPortfolioId);
    portfolioIdToPortfolioStub.withArgs(offeringPortfolioId, mockContext).returns(portfolio);

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
    portfolio.getAssetBalances.resolves([{ free: new BigNumber(20) }]);
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
    portfolio.getAssetBalances.resolves([{ free: new BigNumber(1) }]);

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

  it('should add a create fundraiser transaction to the queue', async () => {
    portfolio.getAssetBalances.resolves([{ free: new BigNumber(1000) }]);

    const proc = procedureMockUtils.getInstance<Params, Offering, Storage>(mockContext, {
      offeringPortfolioId,
      raisingPortfolioId,
    });

    const transaction = dsMockUtils.createTxStub('sto', 'createFundraiser');

    let result = await prepareLaunchOffering.call(proc, args);

    sinon.assert.calledWith(
      addTransactionStub,
      sinon.match({
        transaction,
        resolvers: sinon.match.array,
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
      })
    );

    expect(result).toBe(offering);

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

    sinon.assert.calledWith(
      addTransactionStub,
      sinon.match({
        transaction,
        resolvers: sinon.match.array,
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
      })
    );

    expect(result).toEqual(offering);
  });

  describe('stoResolver', () => {
    const filterEventRecordsStub = sinon.stub(utilsInternalModule, 'filterEventRecords');
    const stoId = new BigNumber(15);

    beforeAll(() => {
      entityMockUtils.initMocks({ offeringOptions: { ticker, id: stoId } });
    });

    beforeEach(() => {
      filterEventRecordsStub.returns([
        dsMockUtils.createMockIEvent(['filler', dsMockUtils.createMockU64(stoId)]),
      ]);
    });

    afterEach(() => {
      filterEventRecordsStub.reset();
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
      portfolioIdToPortfolioStub.withArgs(offeringPortfolioId, mockContext).returns(portfolios[0]);
      portfolioIdToPortfolioStub.withArgs(raisingPortfolioId, mockContext).returns(portfolios[1]);

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
