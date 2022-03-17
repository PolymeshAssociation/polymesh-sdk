import BigNumber from 'bignumber.js';
import { Fundraiser, FundraiserName, Ticker } from 'polymesh-types/types';
import sinon from 'sinon';

import { Asset, Context, Namespace, Offering, TransactionQueue } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import {
  OfferingBalanceStatus,
  OfferingDetails,
  OfferingSaleStatus,
  OfferingTimingStatus,
} from '~/types';
import { tuple } from '~/types/utils';
import * as utilsConversionModule from '~/utils/conversion';

import { Offerings } from '../Offerings';

jest.mock(
  '~/api/entities/Asset',
  require('~/testUtils/mocks/entities').mockAssetModule('~/api/entities/Asset')
);
jest.mock(
  '~/api/entities/Offering',
  require('~/testUtils/mocks/entities').mockOfferingModule('~/api/entities/Offering')
);
jest.mock(
  '~/base/Procedure',
  require('~/testUtils/mocks/procedure').mockProcedureModule('~/base/Procedure')
);

describe('Offerings class', () => {
  let ticker: string;
  let asset: Asset;
  let context: Context;

  let offerings: Offerings;

  beforeAll(() => {
    entityMockUtils.initMocks();
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();

    ticker = 'SOME_ASSET';
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
    asset = entityMockUtils.getAssetInstance({ ticker });

    offerings = new Offerings(asset, context);
  });

  afterEach(() => {
    entityMockUtils.reset();
    dsMockUtils.reset();
    procedureMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
    procedureMockUtils.cleanup();
  });

  it('should extend namespace', () => {
    expect(Offerings.prototype instanceof Namespace).toBe(true);
  });

  describe('method: launch', () => {
    afterAll(() => {
      sinon.restore();
    });

    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
      const expectedQueue = 'someQueue' as unknown as TransactionQueue<Offering>;
      const args = {
        offeringPortfolio: 'otherDid',
        raisingCurrency: 'USD',
        raisingPortfolio: 'someDid',
        name: 'someName',
        tiers: [],
        minInvestment: new BigNumber(100),
      };

      procedureMockUtils
        .getPrepareStub()
        .withArgs({ args: { ticker, ...args }, transformer: undefined }, context)
        .resolves(expectedQueue);

      const queue = await offerings.launch(args);

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: getOne', () => {
    it('should return the requested Offering', async () => {
      entityMockUtils.configureMocks({
        offeringOptions: {
          ticker,
        },
      });
      const id = new BigNumber(1);
      const result = await offerings.getOne({ id });

      expect(result.id).toEqual(id);
    });

    it('should throw an error if the Offering does not exist', () => {
      entityMockUtils.configureMocks({
        offeringOptions: {
          exists: false,
        },
      });

      const id = new BigNumber(1);
      return expect(offerings.getOne({ id })).rejects.toThrow('The Offering does not exist');
    });
  });

  describe('method: get', () => {
    let rawTicker: Ticker;
    let rawName: FundraiserName;

    let stringToTickerStub: sinon.SinonStub<[string, Context], Ticker>;
    let fundraiserToOfferingDetailsStub: sinon.SinonStub<
      [Fundraiser, FundraiserName, Context],
      OfferingDetails
    >;

    let details: OfferingDetails[];
    let fundraisers: Fundraiser[];

    beforeAll(() => {
      rawTicker = dsMockUtils.createMockTicker(ticker);
      stringToTickerStub = sinon.stub(utilsConversionModule, 'stringToTicker');
      fundraiserToOfferingDetailsStub = sinon.stub(
        utilsConversionModule,
        'fundraiserToOfferingDetails'
      );

      const creator = entityMockUtils.getIdentityInstance();
      const name = 'someSto';
      rawName = dsMockUtils.createMockFundraiserName(name);
      const offeringPortfolio = entityMockUtils.getDefaultPortfolioInstance();
      const raisingPortfolio = entityMockUtils.getDefaultPortfolioInstance();
      const venue = entityMockUtils.getVenueInstance();
      const raisingCurrency = 'USD';
      const now = new Date();
      const start = new Date(now.getTime() + 70000);
      const end = new Date(start.getTime() + 70000);
      const minInvestment = new BigNumber(100);
      const tiers = [
        {
          amount: new BigNumber(1000),
          price: new BigNumber(50),
          remaining: new BigNumber(300),
        },
      ];
      details = [
        {
          creator,
          name,
          offeringPortfolio,
          raisingPortfolio,
          raisingCurrency,
          start,
          end,
          tiers,
          minInvestment,
          venue,
          status: {
            sale: OfferingSaleStatus.Closed,
            timing: OfferingTimingStatus.Started,
            balance: OfferingBalanceStatus.Available,
          },
          totalAmount: tiers[0].amount,
          totalRemaining: tiers[0].remaining,
        },
        {
          creator,
          name,
          offeringPortfolio,
          raisingPortfolio,
          raisingCurrency,
          start,
          end,
          tiers,
          minInvestment,
          venue,
          status: {
            sale: OfferingSaleStatus.Live,
            timing: OfferingTimingStatus.Started,
            balance: OfferingBalanceStatus.Available,
          },
          totalAmount: tiers[0].amount,
          totalRemaining: tiers[0].remaining,
        },
      ];
      fundraisers = [
        dsMockUtils.createMockFundraiser({
          creator: dsMockUtils.createMockIdentityId(creator.did),
          /* eslint-disable @typescript-eslint/naming-convention */
          offering_portfolio: dsMockUtils.createMockPortfolioId({
            did: dsMockUtils.createMockIdentityId(offeringPortfolio.owner.did),
            kind: dsMockUtils.createMockPortfolioKind('Default'),
          }),
          raising_portfolio: dsMockUtils.createMockPortfolioId({
            did: dsMockUtils.createMockIdentityId(raisingPortfolio.owner.did),
            kind: dsMockUtils.createMockPortfolioKind('Default'),
          }),
          offering_asset: rawTicker,
          raising_asset: dsMockUtils.createMockTicker(raisingCurrency),
          venue_id: dsMockUtils.createMockU64(venue.id),
          tiers: [
            dsMockUtils.createMockFundraiserTier({
              total: dsMockUtils.createMockBalance(tiers[0].amount),
              price: dsMockUtils.createMockBalance(tiers[0].price),
              remaining: dsMockUtils.createMockBalance(tiers[0].remaining),
            }),
          ],
          start: dsMockUtils.createMockMoment(new BigNumber(start.getTime())),
          end: dsMockUtils.createMockOption(
            dsMockUtils.createMockMoment(new BigNumber(end.getTime()))
          ),
          minimum_investment: dsMockUtils.createMockBalance(minInvestment),
          status: dsMockUtils.createMockFundraiserStatus('Closed'),
        }),
        dsMockUtils.createMockFundraiser({
          creator: dsMockUtils.createMockIdentityId(creator.did),
          /* eslint-disable @typescript-eslint/naming-convention */
          offering_portfolio: dsMockUtils.createMockPortfolioId({
            did: dsMockUtils.createMockIdentityId(offeringPortfolio.owner.did),
            kind: dsMockUtils.createMockPortfolioKind('Default'),
          }),
          raising_portfolio: dsMockUtils.createMockPortfolioId({
            did: dsMockUtils.createMockIdentityId(raisingPortfolio.owner.did),
            kind: dsMockUtils.createMockPortfolioKind('Default'),
          }),
          offering_asset: rawTicker,
          raising_asset: dsMockUtils.createMockTicker(raisingCurrency),
          venue_id: dsMockUtils.createMockU64(venue.id),
          tiers: [
            dsMockUtils.createMockFundraiserTier({
              total: dsMockUtils.createMockBalance(tiers[0].amount),
              price: dsMockUtils.createMockBalance(tiers[0].price),
              remaining: dsMockUtils.createMockBalance(tiers[0].remaining),
            }),
          ],
          start: dsMockUtils.createMockMoment(new BigNumber(start.getTime())),
          end: dsMockUtils.createMockOption(
            dsMockUtils.createMockMoment(new BigNumber(end.getTime()))
          ),
          minimum_investment: dsMockUtils.createMockBalance(minInvestment),
          status: dsMockUtils.createMockFundraiserStatus('Live'),
        }),
      ];
    });

    beforeEach(() => {
      stringToTickerStub.withArgs(ticker, context).returns(rawTicker);
      fundraiserToOfferingDetailsStub
        .withArgs(fundraisers[0], rawName, context)
        .returns(details[0]);
      fundraiserToOfferingDetailsStub
        .withArgs(fundraisers[1], rawName, context)
        .returns(details[1]);

      dsMockUtils.createQueryStub('sto', 'fundraisers', {
        entries: [
          tuple(
            [rawTicker, dsMockUtils.createMockU64(new BigNumber(1))],
            dsMockUtils.createMockOption(fundraisers[0])
          ),
          tuple(
            [rawTicker, dsMockUtils.createMockU64(new BigNumber(2))],
            dsMockUtils.createMockOption(fundraisers[1])
          ),
        ],
      });
      dsMockUtils.createQueryStub('sto', 'fundraiserNames', {
        entries: [
          tuple([rawTicker, dsMockUtils.createMockU64(new BigNumber(1))], rawName),
          tuple([rawTicker, dsMockUtils.createMockU64(new BigNumber(2))], rawName),
        ],
      });
    });

    afterAll(() => {
      sinon.restore();
    });

    it('should return all Offerings associated to the Asset', async () => {
      const result = await offerings.get();

      expect(result[0].offering.id).toEqual(new BigNumber(1));
      expect(result[0].details).toEqual(details[0]);
      expect(result[1].offering.id).toEqual(new BigNumber(2));
      expect(result[1].details).toEqual(details[1]);

      expect(result.length).toBe(2);
    });

    it('should return Offerings associated to the Asset filtered by status', async () => {
      const result = await offerings.get({
        status: {
          sale: OfferingSaleStatus.Live,
          timing: OfferingTimingStatus.Started,
          balance: OfferingBalanceStatus.Available,
        },
      });

      expect(result[0].offering.id).toEqual(new BigNumber(2));
      expect(result[0].details).toEqual(details[1]);

      expect(result.length).toBe(1);
    });
  });
});
