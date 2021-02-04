import BigNumber from 'bignumber.js';
import sinon from 'sinon';

import {
  closeSto,
  Context,
  DefaultPortfolio,
  Entity,
  Identity,
  modifyStoTimes,
  SecurityToken,
  Sto,
  TransactionQueue,
  Venue,
} from '~/internal';
import { heartbeat, investments } from '~/middleware/queries';
import { InvestmentResult } from '~/middleware/types';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';
import { StoDetails, StoStatus } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Identity',
  require('~/testUtils/mocks/entities').mockIdentityModule('~/api/entities/Identity')
);
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
jest.mock(
  '~/api/entities/Venue',
  require('~/testUtils/mocks/entities').mockVenueModule('~/api/entities/Venue')
);

describe('Sto class', () => {
  let context: Context;

  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
  });

  afterEach(() => {
    dsMockUtils.reset();
    entityMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
    entityMockUtils.cleanup();
  });

  test('should extend entity', () => {
    expect(Sto.prototype instanceof Entity).toBe(true);
  });

  describe('constructor', () => {
    test('should assign ticker and id to instance', () => {
      const ticker = 'SOMETICKER';
      const id = new BigNumber(1);
      const sto = new Sto({ id, ticker }, context);

      expect(sto.ticker).toBe(ticker);
      expect(sto.id).toEqual(id);
    });
  });

  describe('method: isUniqueIdentifiers', () => {
    test('should return true if the object conforms to the interface', () => {
      expect(Sto.isUniqueIdentifiers({ id: new BigNumber(1), ticker: 'symbol' })).toBe(true);
      expect(Sto.isUniqueIdentifiers({})).toBe(false);
      expect(Sto.isUniqueIdentifiers({ id: new BigNumber(1) })).toBe(false);
      expect(Sto.isUniqueIdentifiers({ id: 1 })).toBe(false);
    });
  });

  describe('method: details', () => {
    const ticker = 'FAKETICKER';
    const id = new BigNumber(1);
    const someDid = 'someDid';
    const otherDid = 'otherDid';
    const raisingCurrency = 'USD';
    const tierNumber = new BigNumber(10);
    const date = new Date();
    const minimumInvestmentValue = new BigNumber(1);

    const rawFundraiser = dsMockUtils.createMockOption(
      dsMockUtils.createMockFundraiser({
        /* eslint-disable @typescript-eslint/camelcase */
        creator: dsMockUtils.createMockIdentityId(someDid),
        offering_portfolio: dsMockUtils.createMockPortfolioId({
          did: dsMockUtils.createMockIdentityId(someDid),
          kind: dsMockUtils.createMockPortfolioKind('Default'),
        }),
        offering_asset: dsMockUtils.createMockTicker(ticker),
        raising_portfolio: dsMockUtils.createMockPortfolioId({
          did: dsMockUtils.createMockIdentityId(otherDid),
          kind: dsMockUtils.createMockPortfolioKind('Default'),
        }),
        raising_asset: dsMockUtils.createMockTicker(raisingCurrency),
        tiers: [
          dsMockUtils.createMockFundraiserTier({
            total: dsMockUtils.createMockBalance(tierNumber.toNumber()),
            price: dsMockUtils.createMockBalance(tierNumber.toNumber()),
            remaining: dsMockUtils.createMockBalance(tierNumber.toNumber()),
          }),
        ],
        venue_id: dsMockUtils.createMockU64(1),
        start: dsMockUtils.createMockMoment(date.getTime()),
        end: dsMockUtils.createMockOption(dsMockUtils.createMockMoment(date.getTime())),
        status: dsMockUtils.createMockFundraiserStatus('Live'),
        minimum_investment: dsMockUtils.createMockBalance(minimumInvestmentValue.toNumber()),
        /* eslint-enable @typescript-eslint/camelcase */
      })
    );

    let sto: Sto;

    beforeEach(() => {
      context = dsMockUtils.getContextInstance();
      sto = new Sto({ ticker, id }, context);
    });

    test('should return details for a security token offering', async () => {
      const fakeResult = {
        creator: new Identity({ did: someDid }, context),
        offeringPortfolio: new DefaultPortfolio({ did: someDid }, context),
        offeringAsset: new SecurityToken({ ticker }, context),
        raisingPortfolio: new DefaultPortfolio({ did: otherDid }, context),
        raisingCurrency,
        tiers: [
          {
            amount: tierNumber.div(Math.pow(10, 6)),
            price: tierNumber.div(Math.pow(10, 6)),
            remaining: tierNumber.div(Math.pow(10, 6)),
          },
        ],
        venue: new Venue({ id: new BigNumber(1) }, context),
        start: date,
        end: date,
        status: StoStatus.Live,
        minimumInvestment: minimumInvestmentValue.div(Math.pow(10, 6)),
      };

      dsMockUtils.createQueryStub('sto', 'fundraisers', {
        returnValue: rawFundraiser,
      });

      const details = await sto.details();
      expect(details).toEqual(fakeResult);
    });

    test('should throw if security token offering does not exist', async () => {
      dsMockUtils.createQueryStub('sto', 'fundraisers', {
        returnValue: dsMockUtils.createMockOption(),
      });

      return expect(sto.details()).rejects.toThrow('STO no longer exists');
    });

    test('should allow subscription', async () => {
      const unsubCallback = 'unsubCallBack';

      dsMockUtils.createQueryStub('sto', 'fundraisers').callsFake(async (_a, _b, cbFunc) => {
        cbFunc(rawFundraiser);
        return unsubCallback;
      });

      const callback = sinon.stub();
      const result = await sto.details(callback);

      sinon.stub(utilsConversionModule, 'fundraiserToStoDetails').returns({} as StoDetails);

      expect(result).toBe(unsubCallback);
      sinon.assert.calledWithExactly(callback, sinon.match({}));
    });
  });

  describe('method: close', () => {
    test('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
      const ticker = 'SOMETICKER';
      const id = new BigNumber(1);
      const sto = new Sto({ id, ticker }, context);

      const args = {
        ticker,
        id,
      };

      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<void>;

      sinon.stub(closeSto, 'prepare').withArgs(args, context).resolves(expectedQueue);

      const queue = await sto.close();

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: modifyTimes', () => {
    test('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
      const ticker = 'SOMETICKER';
      const id = new BigNumber(1);
      const sto = new Sto({ id, ticker }, context);

      const now = new Date();
      const start = new Date(now.getTime() + 100000);
      const end = new Date(start.getTime() + 100000);

      const args = {
        ticker,
        id,
        start,
        end,
      };

      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<void>;

      sinon.stub(modifyStoTimes, 'prepare').withArgs(args, context).resolves(expectedQueue);

      const queue = await sto.modifyTimes({
        start,
        end,
      });

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: getInvestors', () => {
    test('should return a list of investors', async () => {
      const ticker = 'SOMETICKER';
      const id = new BigNumber(1);
      const sto = new Sto({ id, ticker }, context);

      const did = 'someDid';
      const offeringToken = 'TICKER';
      const raiseToken = 'USD';
      const offeringTokenAmount = 100;
      const raiseTokenAmount = 1;

      const items = [
        {
          investor: did,
          offeringToken,
          raiseToken,
          offeringTokenAmount,
          raiseTokenAmount,
        },
      ];

      /* eslint-disable @typescript-eslint/camelcase */
      const investmentQueryResponse: InvestmentResult = {
        totalCount: 1,
        items,
      };
      /* eslint-enabled @typescript-eslint/camelcase */

      dsMockUtils.createApolloQueryStub(heartbeat(), true);

      dsMockUtils.createApolloQueryStub(
        investments({
          stoId: id.toNumber(),
          ticker,
          count: 5,
          skip: 0,
        }),
        {
          investments: investmentQueryResponse,
        }
      );

      let result = await sto.getInvestors({
        size: 5,
        start: 0,
      });

      const { data } = result;

      expect(data[0].investor.did).toBe(did);
      expect(data[0].offeringToken.ticker).toBe(offeringToken);
      expect(data[0].raiseCurrency).toBe(raiseToken);
      expect(data[0].offeringTokenAmount.toNumber()).toBe(offeringTokenAmount);
      expect(data[0].raiseTokenAmount.toNumber()).toBe(raiseTokenAmount);

      dsMockUtils.createApolloQueryStub(
        investments({
          stoId: id.toNumber(),
          ticker,
          count: undefined,
          skip: undefined,
        }),
        {
          investments: {
            totalCount: 0,
            items: null,
          },
        }
      );

      result = await sto.getInvestors();

      expect(result.data).toEqual([]);
      expect(result.next).toBeNull();
    });
  });
});
