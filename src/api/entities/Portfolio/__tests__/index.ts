import { u64 } from '@polkadot/types';
import { Balance } from '@polkadot/types/interfaces';
import {
  PolymeshPrimitivesIdentityIdPortfolioId,
  PolymeshPrimitivesTicker,
} from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import {
  Context,
  Entity,
  FungibleAsset,
  NumberedPortfolio,
  PolymeshTransaction,
  Portfolio,
} from '~/internal';
import { portfolioMovementsQuery } from '~/middleware/queries/portfolios';
import { settlementsQuery } from '~/middleware/queries/settlements';
import { settlementsQuery as oldSettlementsQuery } from '~/middleware/queries/settlementsOld';
import { LegTypeEnum } from '~/middleware/types';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import {
  FungibleLeg,
  InstructionStatusEnum,
  MoveFundsParams,
  SettlementDirectionEnum,
  SettlementResultEnum,
} from '~/types';
import { tuple } from '~/types/utils';
import { SETTLEMENTS_V2_SQ_VERSION } from '~/utils/constants';
import * as utilsConversionModule from '~/utils/conversion';
import * as utilsInternalModule from '~/utils/internal';

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
      jest.restoreAllMocks();
    });

    it('should return the custodian of the portfolio', async () => {
      const portfolio = new NonAbstract({ did, id }, context);
      const custodianDid = 'custodianDid';
      const signingIdentityDid = 'signingIdentity';
      const identityIdToStringSpy = jest.spyOn(utilsConversionModule, 'identityIdToString');
      const portfolioCustodianMock = dsMockUtils.createQueryMock('portfolio', 'portfolioCustodian');

      portfolioCustodianMock.mockReturnValue(
        dsMockUtils.createMockOption(dsMockUtils.createMockIdentityId(custodianDid))
      );
      identityIdToStringSpy.mockReturnValue(custodianDid);

      const spy = jest
        .spyOn(portfolio, 'getCustodian')
        .mockResolvedValue(entityMockUtils.getIdentityInstance({ isEqual: false }));

      let result = await portfolio.isCustodiedBy();
      expect(result).toEqual(false);

      portfolioCustodianMock.mockReturnValue(
        dsMockUtils.createMockOption(dsMockUtils.createMockIdentityId(signingIdentityDid))
      );
      identityIdToStringSpy.mockReturnValue(signingIdentityDid);
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
    let ticker2: string;
    let total0: BigNumber;
    let total1: BigNumber;
    let locked0: BigNumber;
    let locked1: BigNumber;
    let locked2: BigNumber;
    let rawTicker0: PolymeshPrimitivesTicker;
    let rawTicker1: PolymeshPrimitivesTicker;
    let rawTicker2: PolymeshPrimitivesTicker;
    let rawTotal0: Balance;
    let rawTotal1: Balance;
    let rawLocked0: Balance;
    let rawLocked1: Balance;
    let rawLocked2: Balance;
    let rawPortfolioId: PolymeshPrimitivesIdentityIdPortfolioId;

    beforeAll(() => {
      did = 'someDid';
      id = new BigNumber(1);
      ticker0 = 'TICKER0';
      ticker1 = 'TICKER1';
      ticker2 = 'TICKER2';
      total0 = new BigNumber(100);
      total1 = new BigNumber(200);
      locked0 = new BigNumber(50);
      locked1 = new BigNumber(25);
      locked2 = new BigNumber(0);
      rawTicker0 = dsMockUtils.createMockTicker(ticker0);
      rawTicker1 = dsMockUtils.createMockTicker(ticker1);
      rawTicker2 = dsMockUtils.createMockTicker(ticker2);
      rawTotal0 = dsMockUtils.createMockBalance(total0.shiftedBy(6));
      rawTotal1 = dsMockUtils.createMockBalance(total1.shiftedBy(6));
      rawLocked0 = dsMockUtils.createMockBalance(locked0.shiftedBy(6));
      rawLocked1 = dsMockUtils.createMockBalance(locked1.shiftedBy(6));
      rawLocked2 = dsMockUtils.createMockBalance(locked2.shiftedBy(6));
      rawPortfolioId = dsMockUtils.createMockPortfolioId({
        did: dsMockUtils.createMockIdentityId(did),
        kind: dsMockUtils.createMockPortfolioKind({
          User: dsMockUtils.createMockU64(id),
        }),
      });
      jest.spyOn(utilsConversionModule, 'portfolioIdToMeshPortfolioId').mockImplementation();
      dsMockUtils.configureMocks({ contextOptions: { did } });
    });

    beforeEach(() => {
      dsMockUtils.createQueryMock('portfolio', 'portfolioAssetBalances', {
        entries: [
          tuple([rawPortfolioId, rawTicker0], rawTotal0),
          tuple([rawPortfolioId, rawTicker1], rawTotal1),
        ],
      });
      dsMockUtils.createQueryMock('portfolio', 'portfolioLockedAssets', {
        entries: [
          tuple([rawPortfolioId, rawTicker0], rawLocked0),
          tuple([rawPortfolioId, rawTicker1], rawLocked1),
          tuple([rawPortfolioId, rawTicker2], rawLocked2),
        ],
      });
    });

    afterAll(() => {
      jest.restoreAllMocks();
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
        assets: [ticker0, new FungibleAsset({ ticker: otherTicker }, context)],
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

  describe('method: getCollections', () => {
    let portfolioId: BigNumber;
    let did: string;
    let nftId: BigNumber;
    let secondNftId: BigNumber;
    let lockedNftId: BigNumber;
    let heldOnlyNftId: BigNumber;
    let lockedOnlyNftId: BigNumber;
    let ticker: string;
    let heldOnlyTicker: string;
    let lockedOnlyTicker: string;
    let rawTicker: PolymeshPrimitivesTicker;
    let rawHeldOnlyTicker: PolymeshPrimitivesTicker;
    let rawLockedOnlyTicker: PolymeshPrimitivesTicker;
    let rawNftId: u64;
    let rawSecondId: u64;
    let rawLockedId: u64;
    let rawHeldOnlyId: u64;
    let rawLockedOnlyId: u64;
    let rawPortfolioId: PolymeshPrimitivesIdentityIdPortfolioId;
    const rawTrue = dsMockUtils.createMockBool(true);

    beforeAll(() => {
      did = 'someDid';
      portfolioId = new BigNumber(1);
      nftId = new BigNumber(11);
      secondNftId = new BigNumber(12);
      lockedNftId = new BigNumber(13);
      heldOnlyNftId = new BigNumber(20);
      lockedOnlyNftId = new BigNumber(30);
      ticker = 'TICKER';
      heldOnlyTicker = 'HELD';
      lockedOnlyTicker = 'LOCKED';
      rawTicker = dsMockUtils.createMockTicker(ticker);
      rawHeldOnlyTicker = dsMockUtils.createMockTicker(heldOnlyTicker);
      rawLockedOnlyTicker = dsMockUtils.createMockTicker(lockedOnlyTicker);
      rawNftId = dsMockUtils.createMockU64(nftId);
      rawSecondId = dsMockUtils.createMockU64(secondNftId);
      rawLockedId = dsMockUtils.createMockU64(lockedNftId);
      rawHeldOnlyId = dsMockUtils.createMockU64(heldOnlyNftId);
      rawLockedOnlyId = dsMockUtils.createMockU64(lockedOnlyNftId);
      rawPortfolioId = dsMockUtils.createMockPortfolioId({
        did: dsMockUtils.createMockIdentityId(did),
        kind: dsMockUtils.createMockPortfolioKind({
          User: dsMockUtils.createMockU64(portfolioId),
        }),
      });
      jest.spyOn(utilsConversionModule, 'portfolioIdToMeshPortfolioId').mockImplementation();
      dsMockUtils.configureMocks({ contextOptions: { did } });
    });

    beforeEach(() => {
      dsMockUtils.createQueryMock('portfolio', 'portfolioNFT', {
        entries: [
          tuple([rawPortfolioId, [rawTicker, rawNftId]], rawTrue),
          tuple([rawPortfolioId, [rawTicker, rawSecondId]], rawTrue),
          tuple([rawPortfolioId, [rawTicker, rawLockedId]], rawTrue),
          tuple([rawPortfolioId, [rawHeldOnlyTicker, rawHeldOnlyId]], rawTrue),
          tuple([rawPortfolioId, [rawLockedOnlyTicker, rawLockedOnlyId]], rawTrue),
        ],
      });
      dsMockUtils.createQueryMock('portfolio', 'portfolioLockedNFT', {
        entries: [
          tuple([rawPortfolioId, [rawTicker, rawLockedId]], rawTrue),
          tuple([rawPortfolioId, [rawLockedOnlyTicker, rawLockedOnlyId]], rawTrue),
        ],
      });
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    it("should return all of the portfolio's NFTs when no args are given", async () => {
      const portfolio = new NonAbstract({ did, id: portfolioId }, context);

      const result = await portfolio.getCollections();

      expect(result).toEqual(
        expect.arrayContaining([
          {
            collection: expect.objectContaining({ ticker }),
            free: expect.arrayContaining([
              expect.objectContaining({ id: nftId }),
              expect.objectContaining({ id: secondNftId }),
            ]),
            locked: expect.arrayContaining([expect.objectContaining({ id: lockedNftId })]),
            total: new BigNumber(3),
          },
          expect.objectContaining({
            collection: expect.objectContaining({ ticker: heldOnlyTicker }),
            free: expect.arrayContaining([expect.objectContaining({ id: heldOnlyNftId })]),
            locked: [],
            total: new BigNumber(1),
          }),
          expect.objectContaining({
            collection: expect.objectContaining({ ticker: lockedOnlyTicker }),
            free: [],
            locked: expect.arrayContaining([expect.objectContaining({ id: lockedOnlyNftId })]),
            total: new BigNumber(1),
          }),
        ])
      );
    });

    it('should filter assets if any are specified', async () => {
      const portfolio = new NonAbstract({ did, id: portfolioId }, context);

      const result = await portfolio.getCollections({ collections: [ticker] });

      expect(result.length).toEqual(1);
      expect(result).toEqual(
        expect.arrayContaining([
          {
            collection: expect.objectContaining({ ticker }),
            free: expect.arrayContaining([
              expect.objectContaining({ id: nftId }),
              expect.objectContaining({ id: secondNftId }),
            ]),
            locked: expect.arrayContaining([expect.objectContaining({ id: lockedNftId })]),
            total: new BigNumber(3),
          },
        ])
      );
    });

    it('should throw an error if the portfolio does not exist', () => {
      const portfolio = new NonAbstract({ did, id: portfolioId }, context);
      exists = false;

      return expect(portfolio.getCollections()).rejects.toThrow(
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
      jest.spyOn(utilsConversionModule, 'portfolioIdToMeshPortfolioId').mockImplementation();
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should return the custodian of the portfolio', async () => {
      const custodianDid = 'custodianDid';
      const identityIdToStringSpy = jest.spyOn(utilsConversionModule, 'identityIdToString');

      dsMockUtils
        .createQueryMock('portfolio', 'portfolioCustodian')
        .mockReturnValue(
          dsMockUtils.createMockOption(dsMockUtils.createMockIdentityId(custodianDid))
        );

      identityIdToStringSpy.mockReturnValue(custodianDid);

      const portfolio = new NonAbstract({ did, id }, context);

      let result = await portfolio.getCustodian();
      expect(result.did).toEqual(custodianDid);

      dsMockUtils.createQueryMock('portfolio', 'portfolioCustodian').mockReturnValue({});

      identityIdToStringSpy.mockReturnValue(did);

      result = await portfolio.getCustodian();
      expect(result.did).toEqual(did);
    });

    it('should throw an error if the portfolio does not exist', () => {
      const portfolio = new NonAbstract({ did, id }, context);
      exists = false;
      dsMockUtils.createQueryMock('portfolio', 'portfolioCustodian');

      return expect(portfolio.getCustodian()).rejects.toThrow(
        "The Portfolio doesn't exist or was removed by its owner"
      );
    });
  });

  describe('method: moveFunds', () => {
    it('should prepare the procedure and return the resulting transaction', async () => {
      const args: MoveFundsParams = {
        to: new NumberedPortfolio({ id: new BigNumber(1), did: 'someDid' }, context),
        items: [{ asset: 'someAsset', amount: new BigNumber(100) }],
      };
      const portfolio = new NonAbstract({ did: 'someDid' }, context);
      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<void>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args: { ...args, from: portfolio }, transformer: undefined }, context, {})
        .mockResolvedValue(expectedTransaction);

      const tx = await portfolio.moveFunds(args);

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: quitCustody', () => {
    it('should prepare the procedure and return the resulting transaction', async () => {
      const portfolio = new NonAbstract({ did: 'someDid' }, context);
      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<void>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args: { portfolio }, transformer: undefined }, context, {})
        .mockResolvedValue(expectedTransaction);

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
      jest.restoreAllMocks();
    });

    it('should prepare the procedure and return the resulting transaction', async () => {
      const portfolio = new NonAbstract({ id, did }, context);
      const targetIdentity = 'someTarget';
      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<void>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args: { id, did, targetIdentity }, transformer: undefined }, context, {})
        .mockResolvedValue(expectedTransaction);

      const tx = await portfolio.setCustodian({ targetIdentity });

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: getTransactionHistory', () => {
    let did: string;
    let id: BigNumber;

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

    let getLatestSqVersionSpy: jest.SpyInstance;

    beforeAll(() => {
      did = 'someDid';
      id = new BigNumber(1);
      getLatestSqVersionSpy = jest.spyOn(utilsInternalModule, 'getLatestSqVersion');
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    // TODO @prashantasdeveloper Remove after SQ dual version support
    it('should return a list of transactions for old SQ', async () => {
      getLatestSqVersionSpy.mockResolvedValue('15.0.0');

      let portfolio = new NonAbstract({ id, did }, context);

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
              instructionsByLegSettlementIdAndInstructionId: {
                nodes: [
                  {
                    id: '1',
                  },
                ],
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
              instructionsByLegSettlementIdAndInstructionId: {
                nodes: [
                  {
                    id: '2',
                  },
                ],
              },
              result: SettlementResultEnum.Executed,
              legs: { nodes: legs2 },
            },
          },
        ],
      };

      dsMockUtils.configureMocks({ contextOptions: { withSigningManager: true } });
      when(jest.spyOn(utilsConversionModule, 'addressToKey'))
        .calledWith(account, context)
        .mockReturnValue(key);

      dsMockUtils.createApolloMultipleQueriesMock([
        {
          query: oldSettlementsQuery({
            identityId: did,
            portfolioId: id,
            address: key,
            assetId: undefined,
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
            assetId: undefined,
          }),
          returnData: {
            portfolioMovements: {
              nodes: [],
            },
          },
        },
      ]);

      let result = await portfolio.getTransactionHistory({
        account,
      });

      expect(result[0].blockNumber).toEqual(blockNumber1);
      expect(result[1].blockNumber).toEqual(blockNumber2);
      expect(result[0].blockHash).toBe(blockHash1);
      expect(result[1].blockHash).toBe(blockHash2);
      expect((result[0].legs[0] as FungibleLeg).asset.ticker).toBe(ticker1);
      expect((result[1].legs[0] as FungibleLeg).asset.ticker).toBe(ticker2);
      expect((result[0].legs[0] as FungibleLeg).amount).toEqual(amount1.div(Math.pow(10, 6)));
      expect((result[1].legs[0] as FungibleLeg).amount).toEqual(amount2.div(Math.pow(10, 6)));
      expect((result[0].legs[0] as FungibleLeg).from.owner.did).toBe(portfolioDid1);
      expect((result[0].legs[0] as FungibleLeg).to.owner.did).toBe(portfolioDid2);
      expect((result[0].legs[0].to as NumberedPortfolio).id).toEqual(portfolioId2);
      expect((result[1].legs[0] as FungibleLeg).from.owner.did).toBe(portfolioDid2);
      expect((result[1].legs[0].from as NumberedPortfolio).id).toEqual(portfolioId2);
      expect((result[1].legs[0] as FungibleLeg).to.owner.did).toEqual(portfolioDid1);

      dsMockUtils.createApolloMultipleQueriesMock([
        {
          query: oldSettlementsQuery({
            identityId: did,
            portfolioId: undefined,
            address: undefined,
            assetId: undefined,
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
            assetId: undefined,
          }),
          returnData: {
            portfolioMovements: {
              nodes: [
                {
                  createdBlock: {
                    blockId: blockNumber1.toNumber(),
                    hash: 'someHash',
                  },
                  asset: {
                    id: ticker2,
                    ticker: ticker2,
                  },
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
      result = await portfolio.getTransactionHistory();

      expect(result[0].blockNumber).toEqual(blockNumber1);
      expect(result[0].blockHash).toBe(blockHash1);
      expect((result[0].legs[0] as FungibleLeg).asset.ticker).toBe(ticker2);
      expect((result[0].legs[0] as FungibleLeg).amount).toEqual(amount2.div(Math.pow(10, 6)));
      expect((result[0].legs[0] as FungibleLeg).from.owner.did).toBe(portfolioDid1);
      expect((result[0].legs[0] as FungibleLeg).to.owner.did).toBe(portfolioDid1);
      expect((result[0].legs[0].to as NumberedPortfolio).id).toEqual(portfolioId2);
    });

    it('should throw an error if the portfolio does not exist for old SQ', () => {
      getLatestSqVersionSpy.mockResolvedValue('15.0.0');

      const portfolio = new NonAbstract({ did, id }, context);
      exists = false;

      dsMockUtils.createApolloMultipleQueriesMock([
        {
          query: oldSettlementsQuery({
            identityId: did,
            portfolioId: id,
            address: undefined,
            assetId: undefined,
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
            portfolioId: id,
            address: undefined,
            assetId: undefined,
          }),
          returnData: {
            portfolioMovements: {
              nodes: [],
            },
          },
        },
      ]);

      return expect(portfolio.getTransactionHistory()).rejects.toThrow(
        "The Portfolio doesn't exist or was removed by its owner"
      );
    });

    it('should return a list of transactions', async () => {
      getLatestSqVersionSpy.mockResolvedValue(SETTLEMENTS_V2_SQ_VERSION);

      let portfolio = new NonAbstract({ id, did }, context);

      const legs1 = [
        {
          legType: LegTypeEnum.Fungible,
          assetId: ticker1,
          ticker: ticker1,
          amount: amount1,
          direction: SettlementDirectionEnum.Incoming,
          addresses: ['5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY'],
          fromPortfolio: portfolioNumber1,
          from: portfolioDid1,
          toPortfolio: portfolioNumber2,
          to: portfolioDid2,
        },
      ];
      const legs2 = [
        {
          legType: LegTypeEnum.Fungible,
          assetId: ticker2,
          ticker: ticker2,
          amount: amount2,
          direction: SettlementDirectionEnum.Outgoing,
          addresses: ['5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY'],
          toPortfolio: portfolioNumber1,
          to: portfolioDid1,
          fromPortfolio: portfolioNumber2,
          from: portfolioDid2,
        },
      ];

      const settlementsResponse = {
        nodes: [
          {
            instruction: {
              createdBlock: {
                blockId: blockNumber1.toNumber(),
                hash: blockHash1,
              },
              id: '1',
              status: InstructionStatusEnum.Executed,
              legs: { nodes: legs1 },
            },
          },
          {
            instruction: {
              createdBlock: {
                blockId: blockNumber2.toNumber(),
                hash: blockHash2,
              },
              id: '2',
              status: InstructionStatusEnum.Executed,
              legs: { nodes: legs2 },
            },
          },
        ],
      };

      dsMockUtils.createApolloMultipleQueriesMock([
        {
          query: settlementsQuery({
            identityId: did,
            portfolioId: id,
            address: account,
            assetId: undefined,
          }),
          returnData: {
            legs: settlementsResponse,
          },
        },
        {
          query: portfolioMovementsQuery({
            identityId: did,
            portfolioId: id,
            address: account,
            assetId: undefined,
          }),
          returnData: {
            portfolioMovements: {
              nodes: [],
            },
          },
        },
      ]);

      let result = await portfolio.getTransactionHistory({
        account,
      });

      expect(result[0].blockNumber).toEqual(blockNumber1);
      expect(result[1].blockNumber).toEqual(blockNumber2);
      expect(result[0].blockHash).toBe(blockHash1);
      expect(result[1].blockHash).toBe(blockHash2);
      expect((result[0].legs[0] as FungibleLeg).asset.ticker).toBe(ticker1);
      expect((result[1].legs[0] as FungibleLeg).asset.ticker).toBe(ticker2);
      expect((result[0].legs[0] as FungibleLeg).amount).toEqual(amount1.div(Math.pow(10, 6)));
      expect((result[1].legs[0] as FungibleLeg).amount).toEqual(amount2.div(Math.pow(10, 6)));
      expect((result[0].legs[0] as FungibleLeg).from.owner.did).toBe(portfolioDid1);
      expect((result[0].legs[0] as FungibleLeg).to.owner.did).toBe(portfolioDid2);
      expect((result[0].legs[0].to as NumberedPortfolio).id).toEqual(portfolioId2);
      expect((result[1].legs[0] as FungibleLeg).from.owner.did).toBe(portfolioDid2);
      expect((result[1].legs[0].from as NumberedPortfolio).id).toEqual(portfolioId2);
      expect((result[1].legs[0] as FungibleLeg).to.owner.did).toEqual(portfolioDid1);

      jest.spyOn(utilsInternalModule, 'getAssetIdForMiddleware').mockResolvedValue(ticker2);
      dsMockUtils.createApolloMultipleQueriesMock([
        {
          query: settlementsQuery({
            identityId: did,
            portfolioId: undefined,
            address: undefined,
            assetId: ticker2,
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
            assetId: ticker2,
          }),
          returnData: {
            portfolioMovements: {
              nodes: [
                {
                  createdBlock: {
                    blockId: blockNumber1.toNumber(),
                    hash: 'someHash',
                  },
                  asset: {
                    id: '0x1234',
                    ticker: ticker2,
                  },
                  amount: amount2,
                  address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
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
      result = await portfolio.getTransactionHistory({
        ticker: ticker2,
      });

      expect(result[0].blockNumber).toEqual(blockNumber1);
      expect(result[0].blockHash).toBe(blockHash1);
      expect((result[0].legs[0] as FungibleLeg).asset.ticker).toBe(ticker2);
      expect((result[0].legs[0] as FungibleLeg).amount).toEqual(amount2.div(Math.pow(10, 6)));
      expect((result[0].legs[0] as FungibleLeg).from.owner.did).toBe(portfolioDid1);
      expect((result[0].legs[0] as FungibleLeg).to.owner.did).toBe(portfolioDid1);
      expect((result[0].legs[0].to as NumberedPortfolio).id).toEqual(portfolioId2);
    });

    it('should throw an error if the portfolio does not exist', () => {
      getLatestSqVersionSpy.mockResolvedValue(SETTLEMENTS_V2_SQ_VERSION);

      const portfolio = new NonAbstract({ did, id }, context);
      exists = false;

      dsMockUtils.createApolloMultipleQueriesMock([
        {
          query: settlementsQuery({
            identityId: did,
            portfolioId: id,
            address: undefined,
            assetId: undefined,
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
            portfolioId: id,
            address: undefined,
            assetId: undefined,
          }),
          returnData: {
            portfolioMovements: {
              nodes: [],
            },
          },
        },
      ]);

      return expect(portfolio.getTransactionHistory()).rejects.toThrow(
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
