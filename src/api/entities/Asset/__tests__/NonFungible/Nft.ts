import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import { Entity, Nft, PolymeshTransaction } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { tuple } from '~/types/utils';

jest.mock(
  '~/api/entities/Asset/NonFungible',
  require('~/testUtils/mocks/entities').mockNftCollectionModule('~/api/entities/Asset/NonFungible')
);
jest.mock(
  '~/base/Procedure',
  require('~/testUtils/mocks/procedure').mockProcedureModule('~/base/Procedure')
);

describe('Nft class', () => {
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
    expect(Nft.prototype).toBeInstanceOf(Entity);
  });

  describe('constructor', () => {
    it('should assign ticker and did to instance', () => {
      const ticker = 'TICKER';
      const context = dsMockUtils.getContextInstance();
      const id = new BigNumber(1);
      const nft = new Nft({ ticker, id }, context);

      expect(nft.collection.ticker).toBe(ticker);
      expect(nft.id).toEqual(id);
      expect(nft.collection.ticker).toEqual(ticker);
    });
  });

  describe('method: isUniqueIdentifiers', () => {
    it('should return true if the object conforms to the interface', () => {
      expect(Nft.isUniqueIdentifiers({ ticker: 'TICKER', id: new BigNumber(1) })).toBe(true);
      expect(Nft.isUniqueIdentifiers({})).toBe(false);
      expect(Nft.isUniqueIdentifiers({ ticker: 3 })).toBe(false);
    });
  });

  describe('method: getMetadata', () => {
    it('should return values for the metadata associated to the Nft', async () => {
      const id = new BigNumber(1);
      const ticker = 'TICKER';
      const context = dsMockUtils.getContextInstance();
      entityMockUtils.getNftCollectionInstance({
        getCollectionId: new BigNumber(1),
      });

      const rawCollectionId = dsMockUtils.createMockU64(new BigNumber(1));
      const rawId = dsMockUtils.createMockU64(new BigNumber(1));

      const mockMetadataKey = dsMockUtils.createMockAssetMetadataKey({ Local: rawId });

      dsMockUtils.createQueryMock('nft', 'metadataValue', {
        entries: [
          tuple(
            [[rawCollectionId, rawId], mockMetadataKey],
            dsMockUtils.createMockBytes('This is a test metadata value')
          ),
        ],
      });

      const nft = new Nft({ ticker, id }, context);

      const result = await nft.getMetadata();

      expect(result).toEqual([
        {
          key: { id, ticker: 'TICKER', type: 'Local' },
          value: 'This is a test metadata value',
        },
      ]);
    });
  });

  describe('method: exists', () => {
    it('should return true when Nft Id is less than or equal to nextId for the collection', async () => {
      const ticker = 'TICKER';
      const context = dsMockUtils.getContextInstance();
      const id = new BigNumber(3);
      const nft = new Nft({ ticker, id }, context);

      entityMockUtils.getNftCollectionInstance({
        getCollectionId: id,
      });

      dsMockUtils.createQueryMock('nft', 'nextNFTId', {
        returnValue: new BigNumber(10),
      });

      const result = await nft.exists();

      expect(result).toBe(true);
    });

    it('should return false when Nft Id is greater than nextId for the collection', async () => {
      const ticker = 'TICKER';
      const context = dsMockUtils.getContextInstance();
      const id = new BigNumber(3);
      const nft = new Nft({ ticker, id }, context);

      entityMockUtils.getNftCollectionInstance({
        getCollectionId: id,
      });

      dsMockUtils.createQueryMock('nft', 'nextNFTId', {
        returnValue: new BigNumber(1),
      });

      const result = await nft.exists();

      expect(result).toBe(false);
    });
  });

  describe('method: redeem', () => {
    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const ticker = 'TEST';
      const id = new BigNumber(1);
      const context = dsMockUtils.getContextInstance();
      const nft = new Nft({ ticker, id }, context);

      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<void>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args: { ticker, id }, transformer: undefined }, context, {})
        .mockResolvedValue(expectedTransaction);

      const tx = await nft.redeem();

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: toHuman', () => {
    it('should return a human readable version of the entity', () => {
      const context = dsMockUtils.getContextInstance();
      const ticker = 'TICKER';
      const nft = new Nft({ ticker, id: new BigNumber(1) }, context);

      expect(nft.toHuman()).toEqual({ collection: 'TICKER', id: '1' });
    });
  });
});
