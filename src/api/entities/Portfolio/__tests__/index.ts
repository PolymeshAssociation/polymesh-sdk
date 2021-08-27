import { Balance } from '@polkadot/types/interfaces';
import BigNumber from 'bignumber.js';
import { PortfolioId, Ticker } from 'polymesh-types/types';
import sinon from 'sinon';

import {
  Context,
  DefaultPortfolio,
  Entity,
  NumberedPortfolio,
  Portfolio,
  SecurityToken,
  TransactionQueue,
} from '~/internal';
import { heartbeat, settlements } from '~/middleware/queries';
import {
  SettlementDirectionEnum,
  SettlementResult,
  SettlementResultEnum,
} from '~/middleware/types';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { tuple } from '~/types/utils';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Identity',
  require('~/testUtils/mocks/entities').mockIdentityModule('~/api/entities/Identity')
);
jest.mock(
  '~/api/entities/NumberedPortfolio',
  require('~/testUtils/mocks/entities').mockNumberedPortfolioModule(
    '~/api/entities/NumberedPortfolio'
  )
);
jest.mock(
  '~/api/entities/DefaultPortfolio',
  require('~/testUtils/mocks/entities').mockDefaultPortfolioModule(
    '~/api/entities/DefaultPortfolio'
  )
);
jest.mock(
  '~/base/Procedure',
  require('~/testUtils/mocks/procedure').mockProcedureModule('~/base/Procedure')
);

describe('Portfolio class', () => {
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
    expect(Portfolio.prototype instanceof Entity).toBe(true);
  });

  describe('constructor', () => {
    test('should assign Identity to instance', () => {
      const did = 'someDid';
      const identity = entityMockUtils.getIdentityInstance({ did });
      const portfolio = new Portfolio({ did }, context);

      expect(portfolio.owner).toEqual(identity);
    });
  });

  describe('method: isUniqueIdentifiers', () => {
    test('should return true if the object conforms to the interface', () => {
      expect(Portfolio.isUniqueIdentifiers({ did: 'someDid', id: new BigNumber(1) })).toBe(true);
      expect(Portfolio.isUniqueIdentifiers({ did: 'someDid' })).toBe(true);
      expect(Portfolio.isUniqueIdentifiers({})).toBe(false);
      expect(Portfolio.isUniqueIdentifiers({ did: 'someDid', id: 3 })).toBe(false);
      expect(Portfolio.isUniqueIdentifiers({ did: 1 })).toBe(false);
    });
  });

  describe('method: isOwnedBy', () => {
    let did: string;

    beforeAll(() => {
      did = 'currentIdentity';
      dsMockUtils.configureMocks({ contextOptions: { did } });
    });

    test('should return whether the current Identity is the Portfolio owner', async () => {
      let portfolio = new Portfolio({ did }, context);

      let result = await portfolio.isOwnedBy();

      expect(result).toBe(true);

      portfolio = new Portfolio({ did: 'notTheCurrentIdentity' }, context);

      result = await portfolio.isOwnedBy({ identity: did });

      expect(result).toBe(false);
    });
  });

  describe('method: isCustodiedBy', () => {
    let did: string;
    let id: BigNumber;

    beforeAll(() => {
      did = 'someDid';
      id = new BigNumber(1);
    });

    afterAll(() => {
      sinon.restore();
    });

    test('should return the custodian of the portfolio', async () => {
      const portfolio = new Portfolio({ did, id }, context);
      const custodianDid = 'custodianDid';
      const currentIdentityDid = 'currentIdentity';
      const identityIdToStringStub = sinon.stub(utilsConversionModule, 'identityIdToString');
      const portfolioCustodianStub = dsMockUtils.createQueryStub('portfolio', 'portfolioCustodian');

      portfolioCustodianStub.returns(
        dsMockUtils.createMockOption(dsMockUtils.createMockIdentityId(custodianDid))
      );
      identityIdToStringStub.returns(custodianDid);

      let result = await portfolio.isCustodiedBy();
      expect(result).toEqual(false);

      portfolioCustodianStub.returns(
        dsMockUtils.createMockOption(dsMockUtils.createMockIdentityId(currentIdentityDid))
      );
      identityIdToStringStub.returns(currentIdentityDid);

      result = await portfolio.isCustodiedBy({ identity: currentIdentityDid });
      expect(result).toEqual(true);
    });
  });

  describe('method: getTokenBalances', () => {
    let did: string;
    let id: BigNumber;
    let ticker0: string;
    let ticker1: string;
    let total0: BigNumber;
    let total1: BigNumber;
    let locked0: BigNumber;
    let locked1: BigNumber;
    let rawTicker0: Ticker;
    let rawTicker1: Ticker;
    let rawTotal0: Balance;
    let rawTotal1: Balance;
    let rawLocked0: Balance;
    let rawLocked1: Balance;
    let rawPortfolioId: PortfolioId;

    beforeAll(() => {
      did = 'someDid';
      id = new BigNumber(1);
      ticker0 = 'TICKER0';
      ticker1 = 'TICKER1';
      total0 = new BigNumber(100);
      total1 = new BigNumber(200);
      locked0 = new BigNumber(50);
      locked1 = new BigNumber(25);
      rawTicker0 = dsMockUtils.createMockTicker(ticker0);
      rawTicker1 = dsMockUtils.createMockTicker(ticker1);
      rawTotal0 = dsMockUtils.createMockBalance(total0.shiftedBy(6).toNumber());
      rawTotal1 = dsMockUtils.createMockBalance(total1.shiftedBy(6).toNumber());
      rawLocked0 = dsMockUtils.createMockBalance(locked0.shiftedBy(6).toNumber());
      rawLocked1 = dsMockUtils.createMockBalance(locked1.shiftedBy(6).toNumber());
      rawPortfolioId = dsMockUtils.createMockPortfolioId({
        did: dsMockUtils.createMockIdentityId(did),
        kind: dsMockUtils.createMockPortfolioKind({
          User: dsMockUtils.createMockU64(id.toNumber()),
        }),
      });
      sinon.stub(utilsConversionModule, 'portfolioIdToMeshPortfolioId');
      dsMockUtils.configureMocks({ contextOptions: { did } });
    });

    beforeEach(() => {
      dsMockUtils.createQueryStub('portfolio', 'portfolioAssetBalances', {
        entries: [
          tuple([rawPortfolioId, rawTicker0], rawTotal0),
          tuple([rawPortfolioId, rawTicker1], rawTotal1),
        ],
      });
      dsMockUtils.createQueryStub('portfolio', 'portfolioLockedAssets', {
        entries: [
          tuple([rawPortfolioId, rawTicker0], rawLocked0),
          tuple([rawPortfolioId, rawTicker1], rawLocked1),
        ],
      });
    });

    afterAll(() => {
      sinon.restore();
    });

    test("should return all of the portfolio's assets and their balances", async () => {
      const portfolio = new Portfolio({ did, id }, context);

      const result = await portfolio.getTokenBalances();

      expect(result[0].token.ticker).toBe(ticker0);
      expect(result[0].total).toEqual(total0);
      expect(result[0].locked).toEqual(locked0);
      expect(result[0].free).toEqual(total0.minus(locked0));
      expect(result[1].token.ticker).toBe(ticker1);
      expect(result[1].total).toEqual(total1);
      expect(result[1].locked).toEqual(locked1);
      expect(result[1].free).toEqual(total1.minus(locked1));
    });

    test('should return the requested portfolio assets and their balances', async () => {
      const portfolio = new Portfolio({ did, id }, context);

      const otherTicker = 'OTHER_TICKER';
      const result = await portfolio.getTokenBalances({
        tokens: [ticker0, new SecurityToken({ ticker: otherTicker }, context)],
      });

      expect(result.length).toBe(2);
      expect(result[0].token.ticker).toBe(ticker0);
      expect(result[0].total).toEqual(total0);
      expect(result[0].locked).toEqual(locked0);
      expect(result[0].free).toEqual(total0.minus(locked0));
      expect(result[1].token.ticker).toBe(otherTicker);
      expect(result[1].total).toEqual(new BigNumber(0));
      expect(result[1].locked).toEqual(new BigNumber(0));
      expect(result[1].free).toEqual(new BigNumber(0));
    });
  });

  describe('method: getCustodian', () => {
    let did: string;
    let id: BigNumber;

    beforeAll(() => {
      did = 'someDid';
      id = new BigNumber(1);
      sinon.stub(utilsConversionModule, 'portfolioIdToMeshPortfolioId');
    });

    afterAll(() => {
      sinon.restore();
    });

    test('should return the custodian of the portfolio', async () => {
      const custodianDid = 'custodianDid';
      const identityIdToStringStub = sinon.stub(utilsConversionModule, 'identityIdToString');

      dsMockUtils
        .createQueryStub('portfolio', 'portfolioCustodian')
        .returns(dsMockUtils.createMockOption(dsMockUtils.createMockIdentityId(custodianDid)));

      identityIdToStringStub.returns(custodianDid);

      const portfolio = new Portfolio({ did, id }, context);

      let result = await portfolio.getCustodian();
      expect(result.did).toEqual(custodianDid);

      dsMockUtils.createQueryStub('portfolio', 'portfolioCustodian').returns({});

      identityIdToStringStub.returns(did);

      result = await portfolio.getCustodian();
      expect(result.did).toEqual(did);
    });
  });

  describe('method: moveFunds', () => {
    test('should prepare the procedure and return the resulting transaction queue', async () => {
      const args = {
        to: new NumberedPortfolio({ id: new BigNumber(1), did: 'someDid' }, context),
        items: [{ token: 'someToken', amount: new BigNumber(100) }],
      };
      const portfolio = new Portfolio({ did: 'someDid' }, context);
      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<void>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs({ args: { ...args, from: portfolio }, transformer: undefined }, context)
        .resolves(expectedQueue);

      const queue = await portfolio.moveFunds(args);

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: quitCustody', () => {
    test('should prepare the procedure and return the resulting transaction queue', async () => {
      const portfolio = new Portfolio({ did: 'someDid' }, context);
      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<void>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs({ args: { portfolio }, transformer: undefined }, context)
        .resolves(expectedQueue);

      const queue = await portfolio.quitCustody();

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: setCustodian', () => {
    let did: string;
    let id: BigNumber;

    beforeAll(() => {
      did = 'someDid';
      id = new BigNumber(1);
    });

    afterAll(() => {
      sinon.restore();
    });

    test('should prepare the procedure and return the resulting transaction queue', async () => {
      const portfolio = new Portfolio({ id, did }, context);
      const targetIdentity = 'someTarget';
      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<void>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs({ args: { id, did, targetIdentity }, transformer: undefined }, context)
        .resolves(expectedQueue);

      const queue = await portfolio.setCustodian({ targetIdentity });

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: getTransactionHistory', () => {
    test('should return a list of transactions', async () => {
      const did = 'someDid';
      const id = new BigNumber(1);
      let portfolio = new Portfolio({ id, did }, context);

      const account = 'someAccount';
      const key = 'someKey';

      const blockNumber1 = new BigNumber(1);
      const blockNumber2 = new BigNumber(2);

      const token1 = new SecurityToken({ ticker: 'TICKER1' }, context);
      const amount1 = new BigNumber(1000);
      const token2 = new SecurityToken({ ticker: 'TICKER2' }, context);
      const amount2 = new BigNumber(2000);

      const portfolioDid1 = 'somePortfolioDid';
      const portfolioKind1 = 'Default';

      const portfolioDid2 = 'somePortfolioDid2';
      const portfolioKind2 = '10';

      const portfolio1 = new DefaultPortfolio({ did: portfolioDid1 }, context);
      const portfolio2 = new NumberedPortfolio(
        { did: portfolioDid2, id: new BigNumber(portfolioKind2) },
        context
      );

      const leg1 = [
        {
          ticker: token1.ticker,
          amount: amount1.toString(),
          direction: SettlementDirectionEnum.Incoming,
          from: {
            kind: portfolioKind1,
            did: portfolioDid1,
          },
          to: {
            kind: portfolioKind2,
            did: portfolioDid2,
          },
        },
      ];
      const leg2 = [
        {
          ticker: token2.ticker,
          amount: amount2.toString(),
          direction: SettlementDirectionEnum.Outgoing,
          from: {
            kind: portfolioKind2,
            did: portfolioDid2,
          },
          to: {
            kind: portfolioKind1,
            did: portfolioDid1,
          },
        },
      ];

      /* eslint-disable @typescript-eslint/naming-convention */
      const transactionsQueryResponse: SettlementResult = {
        totalCount: 20,
        items: [
          {
            block_id: blockNumber1.toNumber(),
            addresses: ['be865155e5b6be843e99117a825e9580bb03e401a9c2ace644fff604fe624917'],
            result: SettlementResultEnum.Executed,
            legs: leg1,
          },
          {
            block_id: blockNumber2.toNumber(),
            addresses: ['be865155e5b6be843e99117a825e9580bb03e401a9c2ace644fff604fe624917'],
            result: SettlementResultEnum.Executed,
            legs: leg2,
          },
        ],
      };
      /* eslint-enabled @typescript-eslint/naming-convention */

      dsMockUtils.configureMocks({ contextOptions: { withSeed: true } });
      dsMockUtils.createApolloQueryStub(heartbeat(), true);
      sinon.stub(utilsConversionModule, 'addressToKey').withArgs(account, context).returns(key);

      dsMockUtils.createApolloQueryStub(
        settlements({
          identityId: did,
          portfolioNumber: id.toString(),
          addressFilter: key,
          tickerFilter: undefined,
          count: 5,
          skip: 0,
        }),
        {
          settlements: transactionsQueryResponse,
        }
      );

      let result = await portfolio.getTransactionHistory({
        account,
        size: 5,
        start: 0,
      });

      /* eslint-disable @typescript-eslint/no-non-null-assertion */
      expect(result.data[0].blockNumber).toEqual(blockNumber1);
      expect(result.data[1].blockNumber).toEqual(blockNumber2);
      expect(result.data[0].legs[0].token.ticker).toEqual(token1.ticker);
      expect(result.data[1].legs[0].token.ticker).toEqual(token2.ticker);
      expect(result.data[0].legs[0].amount).toEqual(amount1.div(Math.pow(10, 6)));
      expect(result.data[1].legs[0].amount).toEqual(amount2.div(Math.pow(10, 6)));
      expect(result.data[0].legs[0].from).toEqual(portfolio1);
      expect(result.data[0].legs[0].to).toEqual(portfolio2);
      expect(result.data[1].legs[0].from).toEqual(portfolio2);
      expect(result.data[1].legs[0].to).toEqual(portfolio1);
      expect(result.count).toEqual(20);
      expect(result.next).toEqual(5);
      /* eslint-enabled @typescript-eslint/no-non-null-assertion */

      dsMockUtils.createApolloQueryStub(
        settlements({
          identityId: did,
          portfolioNumber: null,
          addressFilter: undefined,
          tickerFilter: undefined,
          count: undefined,
          skip: undefined,
        }),
        {
          settlements: {
            totalCount: 0,
            items: null,
          },
        }
      );

      portfolio = new Portfolio({ did }, context);
      result = await portfolio.getTransactionHistory();

      expect(result.data).toEqual([]);
      expect(result.next).toBeNull();
    });
  });

  describe('method: toJson', () => {
    test('should return a human readable version of the entity', () => {
      let portfolio = new Portfolio({ did: 'someDid', id: new BigNumber(1) }, context);

      expect(portfolio.toJson()).toEqual({
        did: 'someDid',
        id: '1',
      });

      portfolio = new Portfolio({ did: 'someDid' }, context);

      expect(portfolio.toJson()).toEqual({
        did: 'someDid',
      });
    });
  });
});
