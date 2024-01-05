import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import { Context, Entity, Nft, PolymeshTransaction } from '~/internal';
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
    let ticker: string;
    let id: BigNumber;
    let context: Context;
    let nft: Nft;
    let nextNftIdMock: jest.Mock;

    beforeEach(() => {
      ticker = 'TICKER';
      context = dsMockUtils.getContextInstance();
      id = new BigNumber(3);
      nft = new Nft({ ticker, id }, context);
      entityMockUtils.getNftCollectionInstance({
        getCollectionId: id,
      });
      nextNftIdMock = dsMockUtils.createQueryMock('nft', 'nextNFTId');
    });
    it('should return true when Nft Id is less than or equal to nextId for the collection', async () => {
      nextNftIdMock.mockResolvedValueOnce(new BigNumber(10));

      const result = await nft.exists();

      expect(result).toBe(true);
    });

    it('should return false when Nft Id is greater than nextId for the collection', async () => {
      nextNftIdMock.mockResolvedValueOnce(new BigNumber(1));

      const result = await nft.exists();

      expect(result).toBe(false);
    });

    it('should return false when Nft ID is 0', async () => {
      nft = new Nft({ ticker, id: new BigNumber(0) }, context);

      const result = await nft.exists();

      expect(result).toBe(false);
    });
  });

  describe('getImageUrl', () => {
    const ticker = 'TEST';
    const id = new BigNumber(1);
    let context: Context;

    beforeEach(async () => {
      context = dsMockUtils.getContextInstance();
      const globalId = new BigNumber(2);
      dsMockUtils.createQueryMock('asset', 'assetMetadataGlobalNameToKey', {
        returnValue: dsMockUtils.createMockOption(dsMockUtils.createMockU64(globalId)),
      });
    });

    describe('when image URL is set at the token level', () => {
      beforeEach(() => {
        dsMockUtils.createQueryMock('asset', 'assetMetadataValues', {
          returnValue: dsMockUtils.createMockOption(),
        });
      });

      it('should return the NFT image URL when the NFT has a value set', async () => {
        const imageUrl = 'https://example.com/nfts/{tokenId}/image.png';

        dsMockUtils.createQueryMock('nft', 'metadataValue', {
          returnValue: dsMockUtils.createMockBytes(imageUrl),
        });

        const nft = new Nft({ ticker, id }, context);

        const result = await nft.getImageUri();

        expect(result).toEqual('https://example.com/nfts/1/image.png');
      });

      it('should return null if no image metadata is set', async () => {
        dsMockUtils.createQueryMock('nft', 'metadataValue', {
          returnValue: dsMockUtils.createMockBytes(''),
        });

        dsMockUtils.createQueryMock('asset', 'assetMetadataValues', {
          returnValue: dsMockUtils.createMockOption(),
        });

        const nft = new Nft({ ticker, id }, context);

        const result = await nft.getImageUri();
        expect(result).toBeNull();
      });
    });

    describe('when image URL is set at the collection level', () => {
      beforeEach(() => {
        dsMockUtils.createQueryMock('nft', 'metadataValue', {
          returnValue: dsMockUtils.createMockBytes(''),
        });
      });

      it('should return image URL', async () => {
        const testUrl = 'https://example.com/nfts';
        dsMockUtils.createQueryMock('asset', 'assetMetadataValues', {
          returnValue: dsMockUtils.createMockOption(dsMockUtils.createMockBytes(testUrl)),
        });

        const nft = new Nft({ ticker, id }, context);

        const result = await nft.getImageUri();

        expect(result).toEqual(`${testUrl}/1`);
      });

      it('should template in ID if {tokenId} is present in value', async () => {
        const testUrl = 'https://example.com/nfts/{tokenId}/image.jpg';
        dsMockUtils.createQueryMock('asset', 'assetMetadataValues', {
          returnValue: dsMockUtils.createMockOption(dsMockUtils.createMockBytes(testUrl)),
        });

        const nft = new Nft({ ticker, id }, context);

        const result = await nft.getImageUri();

        expect(result).toEqual('https://example.com/nfts/1/image.jpg');
      });

      it('should not double / a path', async () => {
        const testUrl = 'https://example.com/nfts/';

        dsMockUtils.createQueryMock('asset', 'assetMetadataValues', {
          returnValue: dsMockUtils.createMockOption(dsMockUtils.createMockBytes(testUrl)),
        });

        const nft = new Nft({ ticker, id }, context);

        const result = await nft.getImageUri();

        expect(result).toEqual(`${testUrl}1`);
      });

      it('should return null if no value is set', async () => {
        dsMockUtils.createQueryMock('asset', 'assetMetadataValues', {
          returnValue: dsMockUtils.createMockOption(),
        });

        dsMockUtils.createQueryMock('nft', 'metadataValue', {
          returnValue: dsMockUtils.createMockBytes(''),
        });

        const nft = new Nft({ ticker, id }, context);

        const result = await nft.getImageUri();
        expect(result).toBeNull();
      });
    });

    describe('with null storage values', () => {
      it('should handle null global key Id', async () => {
        dsMockUtils.createQueryMock('asset', 'assetMetadataGlobalNameToKey', {
          returnValue: dsMockUtils.createMockOption(),
        });

        const nft = new Nft({ ticker, id }, context);

        const result = await nft.getImageUri();

        expect(result).toBeNull();
      });
    });
  });

  describe('getTokenUri', () => {
    const ticker = 'TEST';
    const id = new BigNumber(1);
    let context: Context;

    beforeEach(async () => {
      context = dsMockUtils.getContextInstance();
      const globalId = new BigNumber(2);
      dsMockUtils.createQueryMock('asset', 'assetMetadataGlobalNameToKey', {
        returnValue: dsMockUtils.createMockOption(dsMockUtils.createMockU64(globalId)),
      });
    });

    describe('when image URL is set at the token level', () => {
      beforeEach(() => {
        dsMockUtils.createQueryMock('asset', 'assetMetadataValues', {
          returnValue: dsMockUtils.createMockOption(),
        });
      });

      it('should return the NFT token URI when the NFT has a value set', async () => {
        const imageUrl = 'https://example.com/nfts/{tokenId}/info.json';

        dsMockUtils.createQueryMock('nft', 'metadataValue', {
          returnValue: dsMockUtils.createMockBytes(imageUrl),
        });

        const nft = new Nft({ ticker, id }, context);

        const result = await nft.getTokenUri();

        expect(result).toEqual('https://example.com/nfts/1/info.json');
      });

      it('should return null if no token URI metadata is set', async () => {
        dsMockUtils.createQueryMock('nft', 'metadataValue', {
          returnValue: dsMockUtils.createMockBytes(''),
        });

        dsMockUtils.createQueryMock('asset', 'assetMetadataValues', {
          returnValue: dsMockUtils.createMockOption(),
        });

        const nft = new Nft({ ticker, id }, context);

        const result = await nft.getTokenUri();
        expect(result).toBeNull();
      });
    });

    describe('when image URI is set at the collection level', () => {
      beforeEach(() => {
        dsMockUtils.createQueryMock('nft', 'metadataValue', {
          returnValue: dsMockUtils.createMockBytes(''),
        });
      });

      it('should return image URL', async () => {
        const testUrl = 'https://example.com/nfts';
        dsMockUtils.createQueryMock('asset', 'assetMetadataValues', {
          returnValue: dsMockUtils.createMockOption(dsMockUtils.createMockBytes(testUrl)),
        });

        const nft = new Nft({ ticker, id }, context);

        const result = await nft.getTokenUri();

        expect(result).toEqual(`${testUrl}/1`);
      });

      it('should template in ID if {tokenId} is present in value', async () => {
        const testUrl = 'https://example.com/nfts/{tokenId}/info.json';
        dsMockUtils.createQueryMock('asset', 'assetMetadataValues', {
          returnValue: dsMockUtils.createMockOption(dsMockUtils.createMockBytes(testUrl)),
        });

        const nft = new Nft({ ticker, id }, context);

        const result = await nft.getTokenUri();

        expect(result).toEqual('https://example.com/nfts/1/info.json');
      });

      it('should return null if no value is set', async () => {
        dsMockUtils.createQueryMock('asset', 'assetMetadataValues', {
          returnValue: dsMockUtils.createMockOption(),
        });

        dsMockUtils.createQueryMock('nft', 'metadataValue', {
          returnValue: dsMockUtils.createMockBytes(''),
        });

        const nft = new Nft({ ticker, id }, context);

        const result = await nft.getTokenUri();
        expect(result).toBeNull();
      });
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
