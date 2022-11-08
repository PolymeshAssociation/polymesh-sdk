import { Balance } from '@polkadot/types/interfaces';
import BigNumber from 'bignumber.js';
import sinon from 'sinon';

import {
  Asset,
  Context,
  Entity,
  NumberedPortfolio,
  PolymeshTransaction,
  Portfolio,
} from '~/internal';
import { heartbeat, settlements } from '~/middleware/queries';
import { portfolioMovementsQuery, settlementsQuery } from '~/middleware/queriesV2';
import {
  SettlementDirectionEnum,
  SettlementResult,
  SettlementResultEnum,
} from '~/middleware/types';
import { PortfolioId, Ticker } from '~/polkadot/polymesh';
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

let exists: boolean;

// eslint-disable-next-line require-jsdoc
class NonAbstract extends Portfolio {
  // eslint-disable-next-line require-jsdoc
  public async exists(): Promise<boolean> {
    return exists;
  }
}

describe('Portfolio class', () => {
  let context: Context;

  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();
    procedureMockUtils.initMocks();
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
    exists = true;
  });

  afterEach(() => {
    dsMockUtils.reset();
    entityMockUtils.reset();
    procedureMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
    procedureMockUtils.cleanup();
  });

  it('should extend Entity', () => {
    expect(Portfolio.prototype instanceof Entity).toBe(true);
  });

  describe('constructor', () => {
    it('should assign Identity to instance', () => {
      const did = 'someDid';
      const portfolio = new NonAbstract({ did }, context);

      expect(portfolio.owner.did).toBe(did);
    });
  });

  describe('method: isUniqueIdentifiers', () => {
    it('should return true if the object conforms to the interface', () => {
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
      did = 'signingIdentity';
      dsMockUtils.configureMocks({ contextOptions: { did } });
    });

    it('should return whether the signing Identity is the Portfolio owner', async () => {
      let portfolio = new NonAbstract({ did }, context);

      let result = await portfolio.isOwnedBy();

      expect(result).toBe(true);

      portfolio = new NonAbstract({ did: 'notTheSigningIdentity' }, context);
      const spy = jest.spyOn(portfolio.owner, 'isEqual').mockReturnValue(false);

      result = await portfolio.isOwnedBy({ identity: did });

      expect(result).toBe(false);
      spy.mockRestore();
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

    it('should return the custodian of the portfolio', async () => {
      const portfolio = new NonAbstract({ did, id }, context);
      const custodianDid = 'custodianDid';
      const signingIdentityDid = 'signingIdentity';
      const identityIdToStringStub = sinon.stub(utilsConversionModule, 'identityIdToString');
      const portfolioCustodianStub = dsMockUtils.createQueryStub('portfolio', 'portfolioCustodian');

      portfolioCustodianStub.returns(
        dsMockUtils.createMockOption(dsMockUtils.createMockIdentityId(custodianDid))
      );
      identityIdToStringStub.returns(custodianDid);

      const spy = jest
        .spyOn(portfolio, 'getCustodian')
        .mockResolvedValue(entityMockUtils.getIdentityInstance({ isEqual: false }));

      let result = await portfolio.isCustodiedBy();
      expect(result).toEqual(false);

      portfolioCustodianStub.returns(
        dsMockUtils.createMockOption(dsMockUtils.createMockIdentityId(signingIdentityDid))
      );
      identityIdToStringStub.returns(signingIdentityDid);
      spy.mockResolvedValue(entityMockUtils.getIdentityInstance({ isEqual: true }));

      result = await portfolio.isCustodiedBy({
        identity: entityMockUtils.getIdentityInstance({ isEqual: true }),
      });
      expect(result).toEqual(true);
      spy.mockRestore();
    });
  });

  describe('method: getAssetBalances', () => {
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
      rawTotal0 = dsMockUtils.createMockBalance(total0.shiftedBy(6));
      rawTotal1 = dsMockUtils.createMockBalance(total1.shiftedBy(6));
      rawLocked0 = dsMockUtils.createMockBalance(locked0.shiftedBy(6));
      rawLocked1 = dsMockUtils.createMockBalance(locked1.shiftedBy(6));
      rawPortfolioId = dsMockUtils.createMockPortfolioId({
        did: dsMockUtils.createMockIdentityId(did),
        kind: dsMockUtils.createMockPortfolioKind({
          User: dsMockUtils.createMockU64(id),
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

    it("should return all of the portfolio's assets and their balances", async () => {
      const portfolio = new NonAbstract({ did, id }, context);

      const result = await portfolio.getAssetBalances();

      expect(result[0].asset.ticker).toBe(ticker0);
      expect(result[0].total).toEqual(total0);
      expect(result[0].locked).toEqual(locked0);
      expect(result[0].free).toEqual(total0.minus(locked0));
      expect(result[1].asset.ticker).toBe(ticker1);
      expect(result[1].total).toEqual(total1);
      expect(result[1].locked).toEqual(locked1);
      expect(result[1].free).toEqual(total1.minus(locked1));
    });

    it('should return the requested portfolio assets and their balances', async () => {
      const portfolio = new NonAbstract({ did, id }, context);

      const otherTicker = 'OTHER_TICKER';
      const result = await portfolio.getAssetBalances({
        assets: [ticker0, new Asset({ ticker: otherTicker }, context)],
      });

      expect(result.length).toBe(2);
      expect(result[0].asset.ticker).toBe(ticker0);
      expect(result[0].total).toEqual(total0);
      expect(result[0].locked).toEqual(locked0);
      expect(result[0].free).toEqual(total0.minus(locked0));
      expect(result[1].asset.ticker).toBe(otherTicker);
      expect(result[1].total).toEqual(new BigNumber(0));
      expect(result[1].locked).toEqual(new BigNumber(0));
      expect(result[1].free).toEqual(new BigNumber(0));
    });

    it('should throw an error if the portfolio does not exist', () => {
      const portfolio = new NonAbstract({ did, id }, context);
      exists = false;

      return expect(portfolio.getAssetBalances()).rejects.toThrow(
        "The Portfolio doesn't exist or was removed by its owner"
      );
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

    it('should return the custodian of the portfolio', async () => {
      const custodianDid = 'custodianDid';
      const identityIdToStringStub = sinon.stub(utilsConversionModule, 'identityIdToString');

      dsMockUtils
        .createQueryStub('portfolio', 'portfolioCustodian')
        .returns(dsMockUtils.createMockOption(dsMockUtils.createMockIdentityId(custodianDid)));

      identityIdToStringStub.returns(custodianDid);

      const portfolio = new NonAbstract({ did, id }, context);

      let result = await portfolio.getCustodian();
      expect(result.did).toEqual(custodianDid);

      dsMockUtils.createQueryStub('portfolio', 'portfolioCustodian').returns({});

      identityIdToStringStub.returns(did);

      result = await portfolio.getCustodian();
      expect(result.did).toEqual(did);
    });

    it('should throw an error if the portfolio does not exist', () => {
      const portfolio = new NonAbstract({ did, id }, context);
      exists = false;
      dsMockUtils.createQueryStub('portfolio', 'portfolioCustodian');

      return expect(portfolio.getCustodian()).rejects.toThrow(
        "The Portfolio doesn't exist or was removed by its owner"
      );
    });
  });

  describe('method: moveFunds', () => {
    it('should prepare the procedure and return the resulting transaction', async () => {
      const args = {
        to: new NumberedPortfolio({ id: new BigNumber(1), did: 'someDid' }, context),
        items: [{ asset: 'someAsset', amount: new BigNumber(100) }],
      };
      const portfolio = new NonAbstract({ did: 'someDid' }, context);
      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<void>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs({ args: { ...args, from: portfolio }, transformer: undefined }, context)
        .resolves(expectedTransaction);

      const tx = await portfolio.moveFunds(args);

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: quitCustody', () => {
    it('should prepare the procedure and return the resulting transaction', async () => {
      const portfolio = new NonAbstract({ did: 'someDid' }, context);
      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<void>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs({ args: { portfolio }, transformer: undefined }, context)
        .resolves(expectedTransaction);

      const tx = await portfolio.quitCustody();

      expect(tx).toBe(expectedTransaction);
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

    it('should prepare the procedure and return the resulting transaction', async () => {
      const portfolio = new NonAbstract({ id, did }, context);
      const targetIdentity = 'someTarget';
      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<void>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs({ args: { id, did, targetIdentity }, transformer: undefined }, context)
        .resolves(expectedTransaction);

      const tx = await portfolio.setCustodian({ targetIdentity });

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: getTransactionHistory', () => {
    let did: string;
    let id: BigNumber;

    beforeAll(() => {
      did = 'someDid';
      id = new BigNumber(1);
    });

    afterAll(() => {
      sinon.restore();
    });

    it('should return a list of transactions', async () => {
      let portfolio = new NonAbstract({ id, did }, context);

      const account = 'someAccount';
      const key = 'someKey';

      const blockNumber1 = new BigNumber(1);
      const blockNumber2 = new BigNumber(2);

      const blockHash1 = 'someHash';
      const blockHash2 = 'otherHash';

      const ticker1 = 'TICKER_1';
      const ticker2 = 'TICKER_2';

      const amount1 = new BigNumber(1000);
      const amount2 = new BigNumber(2000);

      const portfolioDid1 = 'portfolioDid1';
      const portfolioKind1 = 'Default';

      const portfolioDid2 = 'portfolioDid2';
      const portfolioKind2 = '10';

      const portfolioId2 = new BigNumber(portfolioKind2);

      const legs1 = [
        {
          ticker: ticker1,
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
      const legs2 = [
        {
          ticker: ticker2,
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
            legs: legs1,
          },
          {
            block_id: blockNumber2.toNumber(),
            addresses: ['be865155e5b6be843e99117a825e9580bb03e401a9c2ace644fff604fe624917'],
            result: SettlementResultEnum.Executed,
            legs: legs2,
          },
        ],
      };
      /* eslint-enable @typescript-eslint/naming-convention */

      dsMockUtils.configureMocks({ contextOptions: { withSigningManager: true } });
      dsMockUtils.createApolloQueryStub(heartbeat(), true);
      sinon.stub(utilsConversionModule, 'addressToKey').withArgs(account, context).returns(key);

      dsMockUtils.createQueryStub('system', 'blockHash', {
        multi: [dsMockUtils.createMockHash(blockHash1), dsMockUtils.createMockHash(blockHash2)],
      });

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
        size: new BigNumber(5),
        start: new BigNumber(0),
      });

      expect(result.data[0].blockNumber).toEqual(blockNumber1);
      expect(result.data[1].blockNumber).toEqual(blockNumber2);
      expect(result.data[0].blockHash).toBe(blockHash1);
      expect(result.data[1].blockHash).toBe(blockHash2);
      expect(result.data[0].legs[0].asset.ticker).toBe(ticker1);
      expect(result.data[1].legs[0].asset.ticker).toBe(ticker2);
      expect(result.data[0].legs[0].amount).toEqual(amount1.div(Math.pow(10, 6)));
      expect(result.data[1].legs[0].amount).toEqual(amount2.div(Math.pow(10, 6)));
      expect(result.data[0].legs[0].from.owner.did).toBe(portfolioDid1);
      expect(result.data[0].legs[0].to.owner.did).toBe(portfolioDid2);
      expect((result.data[0].legs[0].to as NumberedPortfolio).id).toEqual(portfolioId2);
      expect(result.data[1].legs[0].from.owner.did).toBe(portfolioDid2);
      expect((result.data[1].legs[0].from as NumberedPortfolio).id).toEqual(portfolioId2);
      expect(result.data[1].legs[0].to.owner.did).toEqual(portfolioDid1);
      expect(result.count).toEqual(new BigNumber(20));
      expect(result.next).toEqual(new BigNumber(5));

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
            items: [],
          },
        }
      );

      portfolio = new NonAbstract({ did }, context);
      result = await portfolio.getTransactionHistory();

      expect(result.data).toEqual([]);
      expect(result.next).toBeNull();
    });

    it('should throw an error if the portfolio does not exist', () => {
      const portfolio = new NonAbstract({ did, id }, context);
      exists = false;

      dsMockUtils.createApolloQueryStub(heartbeat(), true);
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

      return expect(portfolio.getTransactionHistory()).rejects.toThrow(
        "The Portfolio doesn't exist or was removed by its owner"
      );
    });
  });

  describe('method: getTransactionHistoryV2', () => {
    let did: string;
    let id: BigNumber;

    beforeAll(() => {
      did = 'someDid';
      id = new BigNumber(1);
    });

    afterAll(() => {
      sinon.restore();
    });

    it('should return a list of transactions', async () => {
      let portfolio = new NonAbstract({ id, did }, context);

      const account = 'someAccount';
      const key = 'someKey';

      const blockNumber1 = new BigNumber(1);
      const blockNumber2 = new BigNumber(2);

      const blockHash1 = 'someHash';
      const blockHash2 = 'otherHash';

      const ticker1 = 'TICKER_1';
      const ticker2 = 'TICKER_2';

      const amount1 = new BigNumber(1000);
      const amount2 = new BigNumber(2000);

      const portfolioDid1 = 'portfolioDid1';
      const portfolioNumber1 = '0';

      const portfolioDid2 = 'someDid';
      const portfolioNumber2 = '1';

      const portfolioId2 = new BigNumber(portfolioNumber2);

      const legs1 = [
        {
          assetId: ticker1,
          amount: amount1,
          direction: SettlementDirectionEnum.Incoming,
          addresses: ['be865155e5b6be843e99117a825e9580bb03e401a9c2ace644fff604fe624917'],
          from: {
            number: portfolioNumber1,
            identityId: portfolioDid1,
          },
          fromId: `${portfolioDid1}/${portfolioNumber1}`,
          to: {
            number: portfolioNumber2,
            identityId: portfolioDid2,
          },
          toId: `${portfolioDid2}/${portfolioNumber2}`,
        },
      ];
      const legs2 = [
        {
          assetId: ticker2,
          amount: amount2,
          direction: SettlementDirectionEnum.Outgoing,
          addresses: ['be865155e5b6be843e99117a825e9580bb03e401a9c2ace644fff604fe624917'],
          to: {
            number: portfolioNumber1,
            identityId: portfolioDid1,
          },
          toId: `${portfolioDid1}/${portfolioNumber1}`,
          from: {
            number: portfolioNumber2,
            identityId: portfolioDid2,
          },
          fromId: `${portfolioDid2}/${portfolioNumber2}`,
        },
      ];

      const settlementsResponse = {
        nodes: [
          {
            settlement: {
              createdBlock: {
                blockId: blockNumber1.toNumber(),
                hash: blockHash1,
              },
              result: SettlementResultEnum.Executed,
              legs: { nodes: legs1 },
            },
          },
          {
            settlement: {
              createdBlock: {
                blockId: blockNumber2.toNumber(),
                hash: blockHash2,
              },
              result: SettlementResultEnum.Executed,
              legs: { nodes: legs2 },
            },
          },
        ],
      };

      dsMockUtils.configureMocks({ contextOptions: { withSigningManager: true } });
      dsMockUtils.createApolloQueryStub(heartbeat(), true);
      sinon.stub(utilsConversionModule, 'addressToKey').withArgs(account, context).returns(key);

      dsMockUtils.createApolloMultipleV2QueriesStub([
        {
          query: settlementsQuery({
            identityId: did,
            portfolioId: id,
            address: key,
            ticker: undefined,
          }),
          returnData: {
            legs: settlementsResponse,
          },
        },
        {
          query: portfolioMovementsQuery({
            identityId: did,
            portfolioId: id,
            address: key,
            ticker: undefined,
          }),
          returnData: {
            portfolioMovements: {
              nodes: [],
            },
          },
        },
      ]);

      let result = await portfolio.getTransactionHistoryV2({
        account,
      });

      expect(result[0].blockNumber).toEqual(blockNumber1);
      expect(result[1].blockNumber).toEqual(blockNumber2);
      expect(result[0].blockHash).toBe(blockHash1);
      expect(result[1].blockHash).toBe(blockHash2);
      expect(result[0].legs[0].asset.ticker).toBe(ticker1);
      expect(result[1].legs[0].asset.ticker).toBe(ticker2);
      expect(result[0].legs[0].amount).toEqual(amount1.div(Math.pow(10, 6)));
      expect(result[1].legs[0].amount).toEqual(amount2.div(Math.pow(10, 6)));
      expect(result[0].legs[0].from.owner.did).toBe(portfolioDid1);
      expect(result[0].legs[0].to.owner.did).toBe(portfolioDid2);
      expect((result[0].legs[0].to as NumberedPortfolio).id).toEqual(portfolioId2);
      expect(result[1].legs[0].from.owner.did).toBe(portfolioDid2);
      expect((result[1].legs[0].from as NumberedPortfolio).id).toEqual(portfolioId2);
      expect(result[1].legs[0].to.owner.did).toEqual(portfolioDid1);

      dsMockUtils.createApolloMultipleV2QueriesStub([
        {
          query: settlementsQuery({
            identityId: did,
            portfolioId: undefined,
            address: undefined,
            ticker: undefined,
          }),
          returnData: {
            legs: {
              nodes: [],
            },
          },
        },
        {
          query: portfolioMovementsQuery({
            identityId: did,
            portfolioId: undefined,
            address: undefined,
            ticker: undefined,
          }),
          returnData: {
            portfolioMovements: {
              nodes: [
                {
                  createdBlock: {
                    blockId: blockNumber1.toNumber(),
                    hash: 'someHash',
                  },
                  assetId: ticker2,
                  amount: amount2,
                  address: 'be865155e5b6be843e99117a825e9580bb03e401a9c2ace644fff604fe624917',
                  from: {
                    number: portfolioNumber1,
                    identityId: portfolioDid1,
                  },
                  fromId: `${portfolioDid1}/${portfolioNumber1}`,
                  to: {
                    number: portfolioNumber2,
                    identityId: portfolioDid1,
                  },
                  toId: `${portfolioDid1}/${portfolioNumber2}`,
                },
              ],
            },
          },
        },
      ]);

      portfolio = new NonAbstract({ did }, context);
      result = await portfolio.getTransactionHistoryV2();

      expect(result[0].blockNumber).toEqual(blockNumber1);
      expect(result[0].blockHash).toBe(blockHash1);
      expect(result[0].legs[0].asset.ticker).toBe(ticker2);
      expect(result[0].legs[0].amount).toEqual(amount2.div(Math.pow(10, 6)));
      expect(result[0].legs[0].from.owner.did).toBe(portfolioDid1);
      expect(result[0].legs[0].to.owner.did).toBe(portfolioDid1);
      expect((result[0].legs[0].to as NumberedPortfolio).id).toEqual(portfolioId2);
    });

    it('should throw an error if the portfolio does not exist', () => {
      const portfolio = new NonAbstract({ did, id }, context);
      exists = false;

      dsMockUtils.createApolloQueryStub(heartbeat(), true);
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
            nodes: [],
          },
        }
      );

      return expect(portfolio.getTransactionHistoryV2()).rejects.toThrow(
        "The Portfolio doesn't exist or was removed by its owner"
      );
    });
  });

  describe('method: toHuman', () => {
    it('should return a human readable version of the entity', () => {
      let portfolio = new NonAbstract({ did: 'someDid', id: new BigNumber(1) }, context);

      expect(portfolio.toHuman()).toEqual({
        did: 'someDid',
        id: '1',
      });

      portfolio = new NonAbstract({ did: 'someDid' }, context);

      expect(portfolio.toHuman()).toEqual({
        did: 'someDid',
      });
    });
  });
});
