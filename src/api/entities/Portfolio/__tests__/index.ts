import { Balance } from '@polkadot/types/interfaces';
import BigNumber from 'bignumber.js';
import { PortfolioId, Ticker } from 'polymesh-types/types';
import sinon from 'sinon';

import {
  Context,
  Entity,
  moveFunds,
  NumberedPortfolio,
  Portfolio,
  SecurityToken,
  setCustodian,
  TransactionQueue,
} from '~/internal';
import { heartbeat, settlements } from '~/middleware/queries';
import {
  SettlementDirectionEnum,
  SettlementResult,
  SettlementResultEnum,
} from '~/middleware/types';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';
import { tuple } from '~/types/utils';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Identity',
  require('~/testUtils/mocks/entities').mockIdentityModule('~/api/entities/Identity')
);

describe('Portfolio class', () => {
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
      rawTotal0 = dsMockUtils.createMockBalance(total0.times(Math.pow(10, 6)).toNumber());
      rawTotal1 = dsMockUtils.createMockBalance(total1.times(Math.pow(10, 6)).toNumber());
      rawLocked0 = dsMockUtils.createMockBalance(locked0.times(Math.pow(10, 6)).toNumber());
      rawLocked1 = dsMockUtils.createMockBalance(locked1.times(Math.pow(10, 6)).toNumber());
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
      expect(result[1].token.ticker).toBe(ticker1);
      expect(result[1].total).toEqual(total1);
      expect(result[1].locked).toEqual(locked1);
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
      expect(result[1].token.ticker).toBe(otherTicker);
      expect(result[1].total).toEqual(new BigNumber(0));
      expect(result[1].locked).toEqual(new BigNumber(0));
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

      sinon
        .stub(moveFunds, 'prepare')
        .withArgs({ ...args, from: portfolio }, context)
        .resolves(expectedQueue);

      const queue = await portfolio.moveFunds(args);

      expect(queue).toBe(expectedQueue);
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

    describe('method: setCustodian', () => {
      test('should prepare the procedure and return the resulting transaction queue', async () => {
        const portfolio = new Portfolio({ id, did }, context);
        const targetIdentity = 'someTarget';
        const expectedQueue = ('someQueue' as unknown) as TransactionQueue<void>;

        sinon
          .stub(setCustodian, 'prepare')
          .withArgs({ id, did, targetIdentity }, context)
          .resolves(expectedQueue);

        const queue = await portfolio.setCustodian({ targetIdentity });

        expect(queue).toBe(expectedQueue);
      });
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

      const leg1 = [
        {
          ticker: token1.ticker,
          amount: amount1.toString(),
          direction: SettlementDirectionEnum.Incoming,
        },
      ];
      const leg2 = [
        {
          ticker: token2.ticker,
          amount: amount2.toString(),
          direction: SettlementDirectionEnum.Outgoing,
        },
      ];

      /* eslint-disable @typescript-eslint/camelcase */
      const transactionsQueryResponse: SettlementResult = {
        totalCount: 20,
        items: [
          {
            block_id: blockNumber1.toNumber(),
            key: 'someKey',
            result: SettlementResultEnum.Executed,
            legs: leg1,
          },
          {
            block_id: blockNumber2.toNumber(),
            key: 'someKey',
            result: SettlementResultEnum.Executed,
            legs: leg2,
          },
        ],
      };
      /* eslint-enabled @typescript-eslint/camelcase */

      dsMockUtils.configureMocks({ contextOptions: { withSeed: true } });
      dsMockUtils.createApolloQueryStub(heartbeat(), true);
      sinon
        .stub(utilsConversionModule, 'addressToKey')
        .withArgs(account)
        .returns(key);

      dsMockUtils.createApolloQueryStub(
        settlements({
          identityId: did,
          portfolioNumber: id.toString(),
          keyFilter: key,
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
      expect(result.data[0].legs![0].token.ticker).toEqual(token1.ticker);
      expect(result.data[1].legs![0].token.ticker).toEqual(token2.ticker);
      expect(result.data[0].legs![0].amount).toEqual(amount1);
      expect(result.data[1].legs![0].amount).toEqual(amount2);
      expect(result.count).toEqual(20);
      expect(result.next).toEqual(5);
      /* eslint-enabled @typescript-eslint/no-non-null-assertion */

      dsMockUtils.createApolloQueryStub(
        settlements({
          identityId: did,
          portfolioNumber: null,
          keyFilter: undefined,
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
});
