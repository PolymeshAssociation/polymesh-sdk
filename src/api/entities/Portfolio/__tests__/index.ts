import { Balance } from '@polkadot/types/interfaces';
import BigNumber from 'bignumber.js';
import { PortfolioId, Ticker } from 'polymesh-types/types';
import sinon from 'sinon';

import { Entity, Identity, Portfolio, SecurityToken } from '~/api/entities';
import { NumberedPortfolio } from '~/api/entities/NumberedPortfolio';
import { moveFunds, setCustodian } from '~/api/procedures';
import { Context, TransactionQueue } from '~/base';
import { dsMockUtils } from '~/testUtils/mocks';
import { tuple } from '~/types/utils';
import * as utilsModule from '~/utils';

describe('Portfolio class', () => {
  let context: Context;

  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  test('should extend entity', () => {
    expect(Portfolio.prototype instanceof Entity).toBe(true);
  });

  describe('constructor', () => {
    test('should assign Identity to instance', () => {
      const did = 'someDid';
      const identity = new Identity({ did }, context);
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
      sinon.stub(utilsModule, 'portfolioIdToMeshPortfolioId');
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
      sinon.stub(utilsModule, 'portfolioIdToMeshPortfolioId');
    });

    afterAll(() => {
      sinon.restore();
    });

    test('should return the custodian of the portfolio', async () => {
      const custodianDid = 'custodianDid';
      const identityIdToStringStub = sinon.stub(utilsModule, 'identityIdToString');

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

  describe('method: setCustodian', () => {
    test('should prepare the procedure and return the resulting transaction queue', async () => {
      const id = new BigNumber(1);
      const did = 'someDid';
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
