import BigNumber from 'bignumber.js';
import { Fundraiser, FundraiserName, Ticker } from 'polymesh-types/types';
import sinon from 'sinon';

import { Context, launchSto, Namespace, SecurityToken, Sto, TransactionQueue } from '~/internal';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';
import { StoBalanceStatus, StoDetails, StoSaleStatus, StoTimingStatus } from '~/types';
import { tuple } from '~/types/utils';
import * as utilsConversionModule from '~/utils/conversion';

import { Offerings } from '../Offerings';

jest.mock(
  '~/api/entities/SecurityToken',
  require('~/testUtils/mocks/entities').mockSecurityTokenModule('~/api/entities/SecurityToken')
);
jest.mock(
  '~/api/entities/Sto',
  require('~/testUtils/mocks/entities').mockStoModule('~/api/entities/Sto')
);

describe('Offerings class', () => {
  let ticker: string;
  let token: SecurityToken;
  let context: Context;

  let offerings: Offerings;

  beforeAll(() => {
    entityMockUtils.initMocks();
    dsMockUtils.initMocks();

    ticker = 'SOME_TOKEN';
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
    token = entityMockUtils.getSecurityTokenInstance({ ticker });

    offerings = new Offerings(token, context);
  });

  afterEach(() => {
    entityMockUtils.reset();
    dsMockUtils.reset();
  });

  afterAll(() => {
    entityMockUtils.cleanup();
    dsMockUtils.cleanup();
  });

  test('should extend namespace', () => {
    expect(Offerings.prototype instanceof Namespace).toBe(true);
  });

  describe('method: launch', () => {
    afterAll(() => {
      sinon.restore();
    });

    test('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<Sto>;
      const args = {
        raisingCurrency: 'USD',
        raisingPortfolio: 'someDid',
        name: 'someName',
        tiers: [],
        minInvestment: new BigNumber(100),
      };

      sinon
        .stub(launchSto, 'prepare')
        .withArgs({ ticker, ...args }, context)
        .resolves(expectedQueue);

      const queue = await offerings.launch(args);

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: get', () => {
    let rawTicker: Ticker;
    let rawName: FundraiserName;

    let stringToTickerStub: sinon.SinonStub<[string, Context], Ticker>;
    let fundraiserToStoDetailsStub: sinon.SinonStub<
      [Fundraiser, FundraiserName, Context],
      StoDetails
    >;

    let details: StoDetails[];
    let fundraisers: Fundraiser[];

    beforeAll(() => {
      rawTicker = dsMockUtils.createMockTicker(ticker);
      stringToTickerStub = sinon.stub(utilsConversionModule, 'stringToTicker');
      fundraiserToStoDetailsStub = sinon.stub(utilsConversionModule, 'fundraiserToStoDetails');

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
            sale: StoSaleStatus.Closed,
            timing: StoTimingStatus.Started,
            balance: StoBalanceStatus.Available,
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
            sale: StoSaleStatus.Live,
            timing: StoTimingStatus.Started,
            balance: StoBalanceStatus.Available,
          },
          totalAmount: tiers[0].amount,
          totalRemaining: tiers[0].remaining,
        },
      ];
      fundraisers = [
        dsMockUtils.createMockFundraiser({
          creator: dsMockUtils.createMockIdentityId(creator.did),
          /* eslint-disable @typescript-eslint/camelcase */
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
          venue_id: dsMockUtils.createMockU64(venue.id.toNumber()),
          tiers: [
            dsMockUtils.createMockFundraiserTier({
              total: dsMockUtils.createMockBalance(tiers[0].amount.toNumber()),
              price: dsMockUtils.createMockBalance(tiers[0].price.toNumber()),
              remaining: dsMockUtils.createMockBalance(tiers[0].remaining.toNumber()),
            }),
          ],
          start: dsMockUtils.createMockMoment(start.getTime()),
          end: dsMockUtils.createMockOption(dsMockUtils.createMockMoment(end.getTime())),
          minimum_investment: dsMockUtils.createMockBalance(minInvestment.toNumber()),
          status: dsMockUtils.createMockFundraiserStatus('Closed'),
        }),
        dsMockUtils.createMockFundraiser({
          creator: dsMockUtils.createMockIdentityId(creator.did),
          /* eslint-disable @typescript-eslint/camelcase */
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
          venue_id: dsMockUtils.createMockU64(venue.id.toNumber()),
          tiers: [
            dsMockUtils.createMockFundraiserTier({
              total: dsMockUtils.createMockBalance(tiers[0].amount.toNumber()),
              price: dsMockUtils.createMockBalance(tiers[0].price.toNumber()),
              remaining: dsMockUtils.createMockBalance(tiers[0].remaining.toNumber()),
            }),
          ],
          start: dsMockUtils.createMockMoment(start.getTime()),
          end: dsMockUtils.createMockOption(dsMockUtils.createMockMoment(end.getTime())),
          minimum_investment: dsMockUtils.createMockBalance(minInvestment.toNumber()),
          status: dsMockUtils.createMockFundraiserStatus('Live'),
        }),
      ];
    });

    beforeEach(() => {
      stringToTickerStub.withArgs(ticker, context).returns(rawTicker);
      fundraiserToStoDetailsStub.withArgs(fundraisers[0], rawName, context).returns(details[0]);
      fundraiserToStoDetailsStub.withArgs(fundraisers[1], rawName, context).returns(details[1]);

      dsMockUtils.createQueryStub('sto', 'fundraisers', {
        entries: [
          tuple(
            [rawTicker, dsMockUtils.createMockU64(1)],
            dsMockUtils.createMockOption(fundraisers[0])
          ),
          tuple(
            [rawTicker, dsMockUtils.createMockU64(2)],
            dsMockUtils.createMockOption(fundraisers[1])
          ),
        ],
      });
      dsMockUtils.createQueryStub('sto', 'fundraiserNames', {
        entries: [
          tuple([rawTicker, dsMockUtils.createMockU64(1)], rawName),
          tuple([rawTicker, dsMockUtils.createMockU64(2)], rawName),
        ],
      });
    });

    afterAll(() => {
      sinon.restore();
    });

    test('should return all offerings associated to the token', async () => {
      const result = await offerings.get();

      expect(result[0].sto.id).toEqual(new BigNumber(1));
      expect(result[0].details).toEqual(details[0]);
      expect(result[1].sto.id).toEqual(new BigNumber(2));
      expect(result[1].details).toEqual(details[1]);

      expect(result.length).toBe(2);
    });

    test('should return offerings associated to the token filtered by status', async () => {
      const result = await offerings.get({
        status: {
          sale: StoSaleStatus.Live,
          timing: StoTimingStatus.Started,
          balance: StoBalanceStatus.Available,
        },
      });

      expect(result[0].sto.id).toEqual(new BigNumber(2));
      expect(result[0].details).toEqual(details[1]);

      expect(result.length).toBe(1);
    });
  });
});
