import BigNumber from 'bignumber.js';
import sinon from 'sinon';

import { Context, Entity, Sto, TransactionQueue } from '~/internal';
import { heartbeat, investments } from '~/middleware/queries';
import { InvestmentResult } from '~/middleware/types';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { StoBalanceStatus, StoDetails, StoSaleStatus, StoTimingStatus } from '~/types';
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
  '~/api/entities/NumberedPortfolio',
  require('~/testUtils/mocks/entities').mockNumberedPortfolioModule(
    '~/api/entities/NumberedPortfolio'
  )
);
jest.mock(
  '~/api/entities/Venue',
  require('~/testUtils/mocks/entities').mockVenueModule('~/api/entities/Venue')
);
jest.mock(
  '~/base/Procedure',
  require('~/testUtils/mocks/procedure').mockProcedureModule('~/base/Procedure')
);

describe('Sto class', () => {
  let context: Context;

  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();
    procedureMockUtils.initMocks();
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
  });

  afterEach(() => {
    dsMockUtils.reset();
    entityMockUtils.reset();
    procedureMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
    entityMockUtils.cleanup();
    procedureMockUtils.cleanup();
  });

  test('should extend Entity', () => {
    expect(Sto.prototype instanceof Entity).toBe(true);
  });

  describe('constructor', () => {
    test('should assign ticker and id to instance', () => {
      const ticker = 'SOMETICKER';
      const id = new BigNumber(1);
      const sto = new Sto({ id, ticker }, context);

      expect(sto.token.ticker).toBe(ticker);
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
    const name = 'someSto';
    const otherDid = 'otherDid';
    const raisingCurrency = 'USD';
    const amount = new BigNumber(1000);
    const price = new BigNumber(100);
    const remaining = new BigNumber(700);
    const date = new Date();
    const minInvestmentValue = new BigNumber(1);

    const rawFundraiser = dsMockUtils.createMockOption(
      dsMockUtils.createMockFundraiser({
        /* eslint-disable @typescript-eslint/naming-convention */
        creator: dsMockUtils.createMockIdentityId(someDid),
        offering_portfolio: dsMockUtils.createMockPortfolioId({
          did: dsMockUtils.createMockIdentityId(someDid),
          kind: dsMockUtils.createMockPortfolioKind('Default'),
        }),
        offering_asset: dsMockUtils.createMockTicker(ticker),
        raising_portfolio: dsMockUtils.createMockPortfolioId({
          did: dsMockUtils.createMockIdentityId(otherDid),
          kind: dsMockUtils.createMockPortfolioKind({ User: dsMockUtils.createMockU64(1) }),
        }),
        raising_asset: dsMockUtils.createMockTicker(raisingCurrency),
        tiers: [
          dsMockUtils.createMockFundraiserTier({
            total: dsMockUtils.createMockBalance(amount.toNumber()),
            price: dsMockUtils.createMockBalance(price.toNumber()),
            remaining: dsMockUtils.createMockBalance(remaining.toNumber()),
          }),
        ],
        venue_id: dsMockUtils.createMockU64(1),
        start: dsMockUtils.createMockMoment(date.getTime()),
        end: dsMockUtils.createMockOption(dsMockUtils.createMockMoment(date.getTime())),
        status: dsMockUtils.createMockFundraiserStatus('Live'),
        minimum_investment: dsMockUtils.createMockBalance(minInvestmentValue.toNumber()),
        /* eslint-enable @typescript-eslint/naming-convention */
      })
    );

    const rawName = dsMockUtils.createMockFundraiserName(name);

    let sto: Sto;

    beforeEach(() => {
      context = dsMockUtils.getContextInstance();
      sto = new Sto({ ticker, id }, context);
    });

    test('should return details for a security token offering', async () => {
      const fakeResult = {
        creator: entityMockUtils.getIdentityInstance({ did: someDid }),
        name,
        offeringPortfolio: entityMockUtils.getDefaultPortfolioInstance({ did: someDid }),
        raisingPortfolio: entityMockUtils.getNumberedPortfolioInstance({
          did: otherDid,
          id: new BigNumber(1),
        }),
        raisingCurrency,
        tiers: [
          {
            amount: amount.shiftedBy(-6),
            price: price.shiftedBy(-6),
            remaining: remaining.shiftedBy(-6),
          },
        ],
        venue: entityMockUtils.getVenueInstance({ id: new BigNumber(1) }),
        start: date,
        end: date,
        status: {
          sale: StoSaleStatus.Live,
          timing: StoTimingStatus.Expired,
          balance: StoBalanceStatus.Residual,
        },
        minInvestment: minInvestmentValue.shiftedBy(-6),
        totalAmount: amount.shiftedBy(-6),
        totalRemaining: remaining.shiftedBy(-6),
      };

      dsMockUtils.createQueryStub('sto', 'fundraisers', {
        returnValue: rawFundraiser,
      });

      dsMockUtils.createQueryStub('sto', 'fundraiserNames', {
        returnValue: rawName,
      });

      const details = await sto.details();
      expect(details).toEqual(fakeResult);
    });

    test('should throw if security token offering does not exist', async () => {
      dsMockUtils.createQueryStub('sto', 'fundraiserNames', {
        returnValue: dsMockUtils.createMockFundraiserName(),
      });
      dsMockUtils.createQueryStub('sto', 'fundraisers', {
        returnValue: dsMockUtils.createMockOption(),
      });

      return expect(sto.details()).rejects.toThrow('STO no longer exists');
    });

    test('should allow subscription', async () => {
      const unsubCallback = 'unsubCallBack';

      dsMockUtils.createQueryStub('sto', 'fundraiserNames', {
        returnValue: rawName,
      });

      dsMockUtils.createQueryStub('sto', 'fundraisers').callsFake(async (_a, _b, cbFunc) => {
        cbFunc(rawFundraiser, rawName);
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

      procedureMockUtils
        .getPrepareStub()
        .withArgs({ args, transformer: undefined }, context)
        .resolves(expectedQueue);

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

      procedureMockUtils
        .getPrepareStub()
        .withArgs({ args, transformer: undefined }, context)
        .resolves(expectedQueue);

      const queue = await sto.modifyTimes({
        start,
        end,
      });

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: getInvestments', () => {
    test('should return a list of investors', async () => {
      const ticker = 'SOMETICKER';
      const id = new BigNumber(1);
      const sto = new Sto({ id, ticker }, context);
      const did = 'someDid';
      const offeringToken = 'TICKER';
      const raiseToken = 'USD';
      const offeringTokenAmount = new BigNumber(10000);
      const raiseTokenAmount = new BigNumber(1000);

      const items = [
        {
          investor: did,
          offeringToken,
          raiseToken,
          offeringTokenAmount: offeringTokenAmount.toNumber(),
          raiseTokenAmount: raiseTokenAmount.toNumber(),
          datetime: '2020-10-10',
        },
      ];

      /* eslint-disable @typescript-eslint/naming-convention */
      const investmentQueryResponse: InvestmentResult = {
        totalCount: 1,
        items,
      };
      /* eslint-enabled @typescript-eslint/naming-convention */

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

      let result = await sto.getInvestments({
        size: 5,
        start: 0,
      });

      const { data } = result;

      expect(data[0].investor.did).toBe(did);
      expect(data[0].soldAmount).toEqual(offeringTokenAmount.div(Math.pow(10, 6)));
      expect(data[0].investedAmount).toEqual(raiseTokenAmount.div(Math.pow(10, 6)));

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

      result = await sto.getInvestments();
      expect(result.data).toEqual([]);
      expect(result.next).toBeNull();
    });
  });

  describe('method: freeze', () => {
    test('should prepare the procedure and return the resulting transaction queue', async () => {
      const ticker = 'SOMETICKER';
      const id = new BigNumber(1);
      const sto = new Sto({ id, ticker }, context);

      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<Sto>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs({ args: { ticker, id, freeze: true }, transformer: undefined }, context)
        .resolves(expectedQueue);

      const queue = await sto.freeze();

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: unfreeze', () => {
    test('should prepare the procedure and return the resulting transaction queue', async () => {
      const ticker = 'SOMETICKER';
      const id = new BigNumber(1);
      const sto = new Sto({ id, ticker }, context);

      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<Sto>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs({ args: { ticker, id, freeze: false }, transformer: undefined }, context)
        .resolves(expectedQueue);

      const queue = await sto.unfreeze();

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: invest', () => {
    test('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
      const ticker = 'SOMETICKER';
      const id = new BigNumber(1);
      const sto = new Sto({ id, ticker }, context);
      const did = 'someDid';

      const purchasePortfolio = entityMockUtils.getDefaultPortfolioInstance({ did });
      const fundingPortfolio = entityMockUtils.getDefaultPortfolioInstance({ did });
      const purchaseAmount = new BigNumber(10);

      const args = {
        ticker,
        id,
        purchasePortfolio,
        fundingPortfolio,
        purchaseAmount,
      };

      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<void>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs({ args, transformer: undefined }, context)
        .resolves(expectedQueue);

      const queue = await sto.invest({
        purchasePortfolio,
        fundingPortfolio,
        purchaseAmount,
      });

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: exists', () => {
    test('should return whether the Offering exists', async () => {
      const sto = new Sto({ ticker: 'SOME_TICKER', id: new BigNumber(1) }, context);

      dsMockUtils.createQueryStub('sto', 'fundraisers', {
        returnValue: dsMockUtils.createMockOption(dsMockUtils.createMockFundraiser()),
      });

      let result = await sto.exists();
      expect(result).toBe(true);

      dsMockUtils.createQueryStub('sto', 'fundraisers', {
        returnValue: dsMockUtils.createMockOption(),
      });

      result = await sto.exists();
      expect(result).toBe(false);
    });
  });

  describe('method: toJson', () => {
    test('should return a human readable version of the entity', () => {
      const sto = new Sto({ ticker: 'SOME_TICKER', id: new BigNumber(1) }, context);

      expect(sto.toJson()).toEqual({
        id: '1',
        ticker: 'SOME_TICKER',
      });
    });
  });
});
