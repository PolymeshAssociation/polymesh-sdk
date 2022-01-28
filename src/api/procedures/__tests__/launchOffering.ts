import { Text, u64 } from '@polkadot/types';
import { Balance } from '@polkadot/types/interfaces';
import { ISubmittableResult } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';
import {
  Moment,
  PortfolioId as MeshPortfolioId,
  PriceTier,
  Ticker,
  TxTags,
} from 'polymesh-types/types';
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
import { OfferingTier, PortfolioBalance, PortfolioLike, RoleType, VenueType } from '~/types';
import { PortfolioId } from '~/types/internal';
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
  let numberToU64Stub: sinon.SinonStub<[number | BigNumber, Context], u64>;
  let dateToMomentStub: sinon.SinonStub<[Date, Context], Moment>;
  let numberToBalanceStub: sinon.SinonStub<[number | BigNumber, Context, boolean?], Balance>;
  let stoTierToPriceTierStub: sinon.SinonStub<[OfferingTier, Context], PriceTier>;
  let stringToTextStub: sinon.SinonStub<[string, Context], Text>;
  let portfolioIdToPortfolioStub: sinon.SinonStub;
  let ticker: string;
  let offeringPortfolio: PortfolioLike;
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
  let rawName: Text;
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
    stoTierToPriceTierStub = sinon.stub(utilsConversionModule, 'stoTierToPriceTier');
    numberToU64Stub = sinon.stub(utilsConversionModule, 'numberToU64');
    dateToMomentStub = sinon.stub(utilsConversionModule, 'dateToMoment');
    numberToBalanceStub = sinon.stub(utilsConversionModule, 'numberToBalance');
    stringToTextStub = sinon.stub(utilsConversionModule, 'stringToText');
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
    rawVenueId = dsMockUtils.createMockU64(venueId.toNumber());
    rawName = dsMockUtils.createMockText(name);
    rawStart = dsMockUtils.createMockMoment(start.getTime());
    rawEnd = dsMockUtils.createMockMoment(end.getTime());
    rawTiers = [
      dsMockUtils.createMockPriceTier({
        total: dsMockUtils.createMockBalance(amount.toNumber()),
        price: dsMockUtils.createMockBalance(price.toNumber()),
      }),
    ];
    rawMinInvestment = dsMockUtils.createMockBalance(minInvestment.toNumber());

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
    stoTierToPriceTierStub.withArgs({ amount, price }, mockContext).returns(rawTiers[0]);
    numberToU64Stub.withArgs(venue.id, mockContext).returns(rawVenueId);
    dateToMomentStub.withArgs(start, mockContext).returns(rawStart);
    dateToMomentStub.withArgs(end, mockContext).returns(rawEnd);
    stringToTextStub.withArgs(name, mockContext).returns(rawName);
    numberToBalanceStub.withArgs(minInvestment, mockContext).returns(rawMinInvestment);
    portfolioIdToPortfolioStub
      .withArgs(offeringPortfolioId, mockContext)
      .returns(new DefaultPortfolio(offeringPortfolioId, mockContext));

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
    entityMockUtils.cleanup();
    procedureMockUtils.cleanup();
    dsMockUtils.cleanup();
  });

  test('should throw an error if no valid Venue was supplied or found', async () => {
    entityMockUtils.configureMocks({
      identityOptions: {
        getVenues: [entityMockUtils.getVenueInstance({ details: { type: VenueType.Exchange } })],
      },
      defaultPortfolioOptions: {
        assetBalances: [{ free: new BigNumber(20) }] as PortfolioBalance[],
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

  test("should throw an error if Assets offered exceed the Portfolio's balance", async () => {
    entityMockUtils.configureMocks({
      defaultPortfolioOptions: {
        assetBalances: [{ free: new BigNumber(1) }] as PortfolioBalance[],
      },
    });

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

  test('should add a create fundraiser transaction to the queue', async () => {
    entityMockUtils.configureMocks({
      defaultPortfolioOptions: {
        assetBalances: [{ free: new BigNumber(1000) }] as PortfolioBalance[],
      },
    });

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
        assetBalances: [{ free: new BigNumber(1000) }] as PortfolioBalance[],
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
        dsMockUtils.createMockIEvent(['filler', dsMockUtils.createMockU64(stoId.toNumber())]),
      ]);
    });

    afterEach(() => {
      filterEventRecordsStub.reset();
    });

    test('should return the new Offering', () => {
      const result = createOfferingResolver(ticker, mockContext)({} as ISubmittableResult);

      const newOffering = entityMockUtils.getOfferingInstance();
      expect(result).toEqual(newOffering);
    });
  });

  describe('getAuthorization', () => {
    test('should return the appropriate roles and permissions', () => {
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

      const asset = entityMockUtils.getAssetInstance({ ticker });
      const roles = [
        { type: RoleType.PortfolioCustodian, portfolioId: offeringPortfolioId },
        { type: RoleType.PortfolioCustodian, portfolioId: raisingPortfolioId },
      ];

      expect(boundFunc(args)).toEqual({
        roles,
        permissions: {
          transactions: [TxTags.sto.CreateFundraiser],
          assets: [asset],
          portfolios,
        },
      });
    });
  });

  describe('prepareStorage', () => {
    test('should return the offering and raising portfolio ids', async () => {
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
