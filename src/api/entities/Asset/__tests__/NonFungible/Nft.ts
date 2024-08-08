import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import { Context, Entity, Nft, PolymeshError, PolymeshTransaction } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { ErrorCode } from '~/types';
import { tuple } from '~/types/utils';
import * as utilsConversionModule from '~/utils/conversion';

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
    it('should assign assetId and did to instance', () => {
      const assetId = '0x1234';
      const context = dsMockUtils.getContextInstance();
      const id = new BigNumber(1);
      const nft = new Nft({ assetId, id }, context);

      expect(nft.collection.id).toBe(assetId);
      expect(nft.id).toEqual(id);
      expect(nft.collection.id).toEqual(assetId);
    });
  });

  describe('method: isUniqueIdentifiers', () => {
    it('should return true if the object conforms to the interface', () => {
      expect(Nft.isUniqueIdentifiers({ assetId: '0x1234', id: new BigNumber(1) })).toBe(true);
      expect(Nft.isUniqueIdentifiers({})).toBe(false);
      expect(Nft.isUniqueIdentifiers({ assetId: 3 })).toBe(false);
    });
  });

  describe('method: getMetadata', () => {
    it('should return values for the metadata associated to the Nft', async () => {
      const id = new BigNumber(1);
      const assetId = '0x1234';
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

      const nft = new Nft({ assetId, id }, context);

      const result = await nft.getMetadata();

      expect(result).toEqual([
        {
          key: { id, assetId: '0x1234', type: 'Local' },
          value: 'This is a test metadata value',
        },
      ]);
    });
  });

  describe('method: exists', () => {
    it('should return whether NFT exists or not', async () => {
      const assetId = '0x1234';
      const context = dsMockUtils.getContextInstance();
      const id = new BigNumber(3);
      const nft = new Nft({ assetId, id }, context);

      const getOwnerSpy = jest.spyOn(nft, 'getOwner');

      getOwnerSpy.mockResolvedValueOnce(entityMockUtils.getDefaultPortfolioInstance());

      let result = await nft.exists();

      expect(result).toBe(true);

      getOwnerSpy.mockResolvedValueOnce(null);

      result = await nft.exists();

      expect(result).toBe(false);
    });
  });

  describe('getImageUrl', () => {
    const assetId = 'TEST';
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

        const nft = new Nft({ assetId, id }, context);

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

        const nft = new Nft({ assetId, id }, context);

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

        const nft = new Nft({ assetId, id }, context);

        const result = await nft.getImageUri();

        expect(result).toEqual(`${testUrl}/1`);
      });

      it('should template in ID if {tokenId} is present in value', async () => {
        const testUrl = 'https://example.com/nfts/{tokenId}/image.jpg';
        dsMockUtils.createQueryMock('asset', 'assetMetadataValues', {
          returnValue: dsMockUtils.createMockOption(dsMockUtils.createMockBytes(testUrl)),
        });

        const nft = new Nft({ assetId, id }, context);

        const result = await nft.getImageUri();

        expect(result).toEqual('https://example.com/nfts/1/image.jpg');
      });

      it('should not double / a path', async () => {
        const testUrl = 'https://example.com/nfts/';

        dsMockUtils.createQueryMock('asset', 'assetMetadataValues', {
          returnValue: dsMockUtils.createMockOption(dsMockUtils.createMockBytes(testUrl)),
        });

        const nft = new Nft({ assetId, id }, context);

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

        const nft = new Nft({ assetId, id }, context);

        const result = await nft.getImageUri();
        expect(result).toBeNull();
      });
    });

    describe('with null storage values', () => {
      it('should handle null global key Id', async () => {
        dsMockUtils.createQueryMock('asset', 'assetMetadataGlobalNameToKey', {
          returnValue: dsMockUtils.createMockOption(),
        });

        const nft = new Nft({ assetId, id }, context);

        const result = await nft.getImageUri();

        expect(result).toBeNull();
      });
    });
  });

  describe('getTokenUri', () => {
    const assetId = 'TEST';
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

        const nft = new Nft({ assetId, id }, context);

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

        const nft = new Nft({ assetId, id }, context);

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

        const nft = new Nft({ assetId, id }, context);

        const result = await nft.getTokenUri();

        expect(result).toEqual(`${testUrl}/1`);
      });

      it('should template in ID if {tokenId} is present in value', async () => {
        const testUrl = 'https://example.com/nfts/{tokenId}/info.json';
        dsMockUtils.createQueryMock('asset', 'assetMetadataValues', {
          returnValue: dsMockUtils.createMockOption(dsMockUtils.createMockBytes(testUrl)),
        });

        const nft = new Nft({ assetId, id }, context);

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

        const nft = new Nft({ assetId, id }, context);

        const result = await nft.getTokenUri();
        expect(result).toBeNull();
      });
    });
  });

  describe('method: redeem', () => {
    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const assetId = 'TEST';
      const id = new BigNumber(1);
      const context = dsMockUtils.getContextInstance();
      const nft = new Nft({ assetId, id }, context);

      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<void>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith(
          { args: { collection: nft.collection, id }, transformer: undefined },
          context,
          {}
        )
        .mockResolvedValue(expectedTransaction);

      const tx = await nft.redeem();

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: getOwner', () => {
    const assetId = 'TEST';
    const id = new BigNumber(1);
    let context: Context;
    let nftOwnerMock: jest.Mock;
    let nft: Nft;

    beforeEach(async () => {
      context = dsMockUtils.getContextInstance();
      nftOwnerMock = dsMockUtils.createQueryMock('nft', 'nftOwner');
      nft = new Nft({ assetId, id }, context);
    });

    it('should return null if no owner exists', async () => {
      nftOwnerMock.mockResolvedValueOnce(dsMockUtils.createMockOption());

      const result = await nft.getOwner();

      expect(result).toBeNull();
    });

    it('should return the owner of the NFT', async () => {
      const meshPortfolioIdToPortfolioSpy = jest.spyOn(
        utilsConversionModule,
        'meshPortfolioIdToPortfolio'
      );

      const rawPortfolio = dsMockUtils.createMockPortfolioId({
        did: 'someDid',
        kind: dsMockUtils.createMockPortfolioKind({
          User: dsMockUtils.createMockU64(new BigNumber(1)),
        }),
      });

      nftOwnerMock.mockResolvedValueOnce(dsMockUtils.createMockOption(rawPortfolio));
      const portfolio = entityMockUtils.getNumberedPortfolioInstance();

      when(meshPortfolioIdToPortfolioSpy)
        .calledWith(rawPortfolio, context)
        .mockReturnValue(portfolio);

      const result = await nft.getOwner();

      expect(result).toBe(portfolio);
    });
  });

  describe('method: isLocked', () => {
    const assetId = 'TEST';
    const id = new BigNumber(1);
    let context: Context;
    let nft: Nft;
    let ownerSpy: jest.SpyInstance;

    beforeEach(async () => {
      context = dsMockUtils.getContextInstance();
      nft = new Nft({ assetId, id }, context);
      ownerSpy = jest.spyOn(nft, 'getOwner');
    });

    it('should throw an error if NFT has no owner', () => {
      ownerSpy.mockResolvedValueOnce(null);

      const error = new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: 'NFT does not exists. The token may have been redeemed',
      });
      return expect(nft.isLocked()).rejects.toThrow(error);
    });

    it('should return whether NFT is locked in any settlement', async () => {
      ownerSpy.mockResolvedValue(entityMockUtils.getDefaultPortfolioInstance());

      dsMockUtils.createQueryMock('portfolio', 'portfolioLockedNFT', {
        returnValue: dsMockUtils.createMockBool(true),
      });

      const result = await nft.isLocked();

      expect(result).toBe(true);
    });
  });

  describe('method: toHuman', () => {
    it('should return a human readable version of the entity', () => {
      const context = dsMockUtils.getContextInstance();
      const assetId = '0x1234';
      const nft = new Nft({ assetId, id: new BigNumber(1) }, context);

      expect(nft.toHuman()).toEqual({ collection: '0x1234', id: '1' });
    });
  });
});
