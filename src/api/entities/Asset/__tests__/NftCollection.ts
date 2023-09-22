import { bool } from '@polkadot/types';
import { PolymeshPrimitivesAssetIdentifier } from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import { Context, Entity, NftCollection, PolymeshTransaction } from '~/internal';
import { assetQuery } from '~/middleware/queries';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { SecurityIdentifier, SecurityIdentifierType } from '~/types';
import { tuple } from '~/types/utils';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Identity',
  require('~/testUtils/mocks/entities').mockIdentityModule('~/api/entities/Identity')
);
jest.mock(
  '~/base/Procedure',
  require('~/testUtils/mocks/procedure').mockProcedureModule('~/base/Procedure')
);

describe('NftCollection class', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();
    procedureMockUtils.initMocks();
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
    expect(NftCollection.prototype).toBeInstanceOf(Entity);
  });

  describe('constructor', () => {
    it('should assign ticker and did to instance', () => {
      const ticker = 'test';
      const context = dsMockUtils.getContextInstance();
      const nftCollection = new NftCollection({ ticker }, context);

      expect(nftCollection.ticker).toBe(ticker);
      expect(nftCollection.did).toBe(utilsConversionModule.tickerToDid(ticker));
    });
  });

  describe('method: isUniqueIdentifiers', () => {
    it('should return true if the object conforms to the interface', () => {
      expect(NftCollection.isUniqueIdentifiers({ ticker: 'SOME_TICKER' })).toBe(true);
      expect(NftCollection.isUniqueIdentifiers({})).toBe(false);
      expect(NftCollection.isUniqueIdentifiers({ ticker: 3 })).toBe(false);
    });
  });

  describe('method: transferOwnership', () => {
    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const ticker = 'TEST';
      const context = dsMockUtils.getContextInstance();
      const nftCollection = new NftCollection({ ticker }, context);
      const target = 'someOtherDid';
      const expiry = new Date('10/14/3040');

      const args = {
        target,
        expiry,
      };

      const expectedTransaction =
        'someTransaction' as unknown as PolymeshTransaction<NftCollection>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args: { ticker, ...args }, transformer: undefined }, context, {})
        .mockResolvedValue(expectedTransaction);

      const tx = await nftCollection.transferOwnership(args);

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: investorCount', () => {
    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const ticker = 'TEST';
      const context = dsMockUtils.getContextInstance();
      const nftCollection = new NftCollection({ ticker }, context);

      dsMockUtils.createQueryMock('nft', 'numberOfNFTs', {
        entries: [
          tuple(
            [dsMockUtils.createMockTicker(ticker), dsMockUtils.createMockIdentityId('someDid')],
            dsMockUtils.createMockU64(new BigNumber(3))
          ),
        ],
      });

      const investorCount = await nftCollection.investorCount();

      expect(investorCount).toEqual(new BigNumber(1));
    });
  });

  describe('method: getIdentifiers', () => {
    let ticker: string;
    let isinValue: string;
    let isinMock: PolymeshPrimitivesAssetIdentifier;
    let securityIdentifiers: SecurityIdentifier[];

    let context: Context;
    let nftCollection: NftCollection;

    beforeAll(() => {
      ticker = 'TEST';
      isinValue = 'FAKE ISIN';
      isinMock = dsMockUtils.createMockAssetIdentifier({
        Isin: dsMockUtils.createMockU8aFixed(isinValue),
      });
      securityIdentifiers = [
        {
          type: SecurityIdentifierType.Isin,
          value: isinValue,
        },
      ];
    });

    beforeEach(() => {
      context = dsMockUtils.getContextInstance();
      nftCollection = new NftCollection({ ticker }, context);
    });

    it('should return the list of security identifiers for an NftCollection', async () => {
      dsMockUtils.createQueryMock('asset', 'identifiers', {
        returnValue: [isinMock],
      });

      const result = await nftCollection.getIdentifiers();

      expect(result[0].value).toBe(isinValue);
    });

    it('should allow subscription', async () => {
      const unsubCallback = 'unsubCallBack';

      dsMockUtils.createQueryMock('asset', 'identifiers').mockImplementation(async (_, cbFunc) => {
        cbFunc([isinMock]);

        return unsubCallback;
      });

      const callback = jest.fn();
      const result = await nftCollection.getIdentifiers(callback);

      expect(result).toBe(unsubCallback);
      expect(callback).toBeCalledWith(securityIdentifiers);
    });
  });

  describe('method: createdAt', () => {
    it('should return the event identifier object of the Asset creation', async () => {
      const ticker = 'SOME_TICKER';
      const blockNumber = new BigNumber(1234);
      const blockDate = new Date('4/14/2020');
      const blockHash = 'someHash';
      const eventIdx = new BigNumber(1);
      const variables = {
        ticker,
      };
      const fakeResult = { blockNumber, blockHash, blockDate, eventIndex: eventIdx };
      const context = dsMockUtils.getContextInstance();
      const nftCollection = new NftCollection({ ticker }, context);

      dsMockUtils.createApolloQueryMock(assetQuery(variables), {
        assets: {
          nodes: [
            {
              createdBlock: {
                blockId: blockNumber.toNumber(),
                datetime: blockDate,
                hash: blockHash,
              },
              eventIdx: eventIdx.toNumber(),
            },
          ],
        },
      });

      const result = await nftCollection.createdAt();

      expect(result).toEqual(fakeResult);
    });

    it('should return null if the query result is empty', async () => {
      const ticker = 'SOME_TICKER';
      const variables = {
        ticker,
      };
      const context = dsMockUtils.getContextInstance();
      const nftCollection = new NftCollection({ ticker }, context);

      dsMockUtils.createApolloQueryMock(assetQuery(variables), {
        assets: {
          nodes: [],
        },
      });
      const result = await nftCollection.createdAt();
      expect(result).toBeNull();
    });
  });

  describe('method: isFrozen', () => {
    let frozenMock: jest.Mock;
    let boolValue: boolean;
    let rawBoolValue: bool;

    beforeAll(() => {
      boolValue = true;
      rawBoolValue = dsMockUtils.createMockBool(boolValue);
    });

    beforeEach(() => {
      frozenMock = dsMockUtils.createQueryMock('asset', 'frozen');
    });

    it('should return whether the NftCollection is frozen or not', async () => {
      const ticker = 'TICKER';
      const context = dsMockUtils.getContextInstance();
      const nftCollection = new NftCollection({ ticker }, context);

      frozenMock.mockResolvedValue(rawBoolValue);

      const result = await nftCollection.isFrozen();

      expect(result).toBe(boolValue);
    });

    it('should allow subscription', async () => {
      const ticker = 'TICKER';
      const context = dsMockUtils.getContextInstance();
      const nftCollection = new NftCollection({ ticker }, context);
      const unsubCallback = 'unsubCallBack';

      frozenMock.mockImplementation(async (_, cbFunc) => {
        cbFunc(rawBoolValue);
        return unsubCallback;
      });

      const callback = jest.fn();
      const result = await nftCollection.isFrozen(callback);

      expect(result).toBe(unsubCallback);
      expect(callback).toBeCalledWith(boolValue);
    });
  });

  describe('method: controllerTransfer', () => {
    it('should prepare the procedure and return the resulting transaction', async () => {
      const ticker = 'TICKER';
      const originPortfolio = 'portfolio';
      const amount = new BigNumber(1);
      const context = dsMockUtils.getContextInstance();
      const nftCollection = new NftCollection({ ticker }, context);

      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<void>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith(
          { args: { ticker, originPortfolio, amount }, transformer: undefined },
          context,
          {}
        )
        .mockResolvedValue(expectedTransaction);

      const queue = await nftCollection.controllerTransfer({ originPortfolio, amount });

      expect(queue).toBe(expectedTransaction);
    });
  });

  describe('method: exists', () => {
    it('should return whether the NftCollection exists', async () => {
      const ticker = 'TICKER';
      const context = dsMockUtils.getContextInstance();
      const nftCollection = new NftCollection({ ticker }, context);

      dsMockUtils.createQueryMock('nft', 'collectionTicker', {
        returnValue: new BigNumber(10),
      });

      let result = await nftCollection.exists();

      expect(result).toBe(true);

      dsMockUtils.createQueryMock('nft', 'collectionTicker', {
        returnValue: new BigNumber(0),
      });

      result = await nftCollection.exists();

      expect(result).toBe(false);
    });
  });

  describe('method: toHuman', () => {
    it('should return a human readable version of the entity', () => {
      const context = dsMockUtils.getContextInstance();
      const nftCollection = new NftCollection({ ticker: 'SOME_TICKER' }, context);

      expect(nftCollection.toHuman()).toBe('SOME_TICKER');
    });
  });
});
