import {
  PolymeshPrimitivesAssetAssetHolder,
  PolymeshPrimitivesAssetAssetHolderKind,
  PolymeshPrimitivesAssetAssetId,
  PolymeshPrimitivesNftNfTs,
} from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import {
  getAuthorization,
  Params,
  prepareNftControllerTransfer,
  prepareStorage,
  Storage,
} from '~/api/procedures/nftControllerTransfer';
import { Context, DefaultPortfolio, Nft } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { Account, NftCollection, PortfolioBalance, RoleType, TxTags } from '~/types';
import { uuidToHex } from '~/utils';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Asset/NonFungible',
  require('~/testUtils/mocks/entities').mockNftCollectionModule('~/api/entities/Asset/NonFungible')
);
jest.mock(
  '~/api/entities/DefaultPortfolio',
  require('~/testUtils/mocks/entities').mockDefaultPortfolioModule(
    '~/api/entities/DefaultPortfolio'
  )
);

jest.mock(
  '~/api/entities/Account',
  require('~/testUtils/mocks/entities').mockAccountModule('~/api/entities/Account')
);

describe('nftControllerTransfer procedure', () => {
  let mockContext: Mocked<Context>;
  let assetHolderLikeToAssetHolderIdSpy: jest.SpyInstance;
  let assetHolderIdToMeshAssetHolderSpy: jest.SpyInstance;
  let stringToAssetIdSpy: jest.SpyInstance<PolymeshPrimitivesAssetAssetId, [string, Context]>;
  let nftToMeshNftSpy: jest.SpyInstance;
  let assetHolderToAssetHolderKindSpy: jest.SpyInstance;
  let assetHolderLikeToAssetHolderSpy: jest.SpyInstance;
  let assetId: string;
  let rawAssetId: PolymeshPrimitivesAssetAssetId;
  let originDid: string;
  let signerDid: string;
  let signerAddress: string;
  let rawPortfolioAssetHolder: PolymeshPrimitivesAssetAssetHolder;
  let rawDestinationPortfolioKind: PolymeshPrimitivesAssetAssetHolderKind;
  let originPortfolio: DefaultPortfolio;
  let destinationPortfolio: DefaultPortfolio;
  let destinationAccount: Account;
  let collection: NftCollection;
  let rawNfts: PolymeshPrimitivesNftNfTs;
  let nfts: Nft[];

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    assetHolderLikeToAssetHolderIdSpy = jest.spyOn(
      utilsConversionModule,
      'assetHolderLikeToAssetHolderId'
    );
    assetHolderIdToMeshAssetHolderSpy = jest.spyOn(
      utilsConversionModule,
      'assetHolderIdToMeshAssetHolder'
    );
    assetHolderToAssetHolderKindSpy = jest.spyOn(
      utilsConversionModule,
      'assetHolderToAssetHolderKind'
    );
    nftToMeshNftSpy = jest.spyOn(utilsConversionModule, 'nftToMeshNft');
    assetId = '12341234-1234-1234-1234-123412341234';
    collection = entityMockUtils.getNftCollectionInstance({ assetId });
    stringToAssetIdSpy = jest.spyOn(utilsConversionModule, 'stringToAssetId');
    rawAssetId = dsMockUtils.createMockAssetId(uuidToHex(assetId));
    originDid = 'fakeDid';
    signerDid = 'signerDid';
    signerAddress = 'someAddress';
    assetHolderLikeToAssetHolderSpy = jest.spyOn(
      utilsConversionModule,
      'assetHolderLikeToAssetHolder'
    );
    rawPortfolioAssetHolder = dsMockUtils.createMockAssetHolder({
      Portfolio: dsMockUtils.createMockPortfolioId({
        did: dsMockUtils.createMockIdentityId(originDid),
        kind: dsMockUtils.createMockPortfolioKind('Default'),
      }),
    });
    rawDestinationPortfolioKind = dsMockUtils.createMockAssetHolderKind('DefaultPortfolio');

    nfts = [new Nft({ id: new BigNumber(1), assetId }, mockContext)];
    rawNfts = dsMockUtils.createMockNfts({
      assetId: rawAssetId,
      ids: nfts.map(nft => dsMockUtils.createMockU64(nft.id)),
    });
    originPortfolio = entityMockUtils.getDefaultPortfolioInstance({
      did: originDid,
      getCollections: [{ collection, free: nfts, locked: [], total: new BigNumber(1) }],
    });
    destinationPortfolio = entityMockUtils.getDefaultPortfolioInstance({ did: signerDid });
    destinationAccount = entityMockUtils.getAccountInstance({ address: signerAddress });
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    stringToAssetIdSpy.mockReturnValue(rawAssetId);

    originPortfolio = entityMockUtils.getDefaultPortfolioInstance({
      did: originDid,
      getCollections: [{ collection, free: nfts, locked: [], total: new BigNumber(1) }],
    });

    when(assetHolderLikeToAssetHolderIdSpy)
      .calledWith({ did: originDid }, mockContext)
      .mockReturnValue(originPortfolio);

    when(assetHolderLikeToAssetHolderIdSpy)
      .calledWith({ did: signerDid }, mockContext)
      .mockReturnValue(destinationPortfolio);

    when(assetHolderToAssetHolderKindSpy)
      .calledWith(destinationPortfolio, mockContext)
      .mockReturnValue(rawDestinationPortfolioKind);

    when(nftToMeshNftSpy)
      .calledWith(
        collection,
        nfts.map(({ id }) => id),
        mockContext
      )
      .mockReturnValue(rawNfts);

    assetHolderIdToMeshAssetHolderSpy.mockReturnValue(rawPortfolioAssetHolder);
  });

  afterEach(() => {
    entityMockUtils.reset();
    procedureMockUtils.reset();
    dsMockUtils.reset();
  });

  afterAll(() => {
    procedureMockUtils.cleanup();
    dsMockUtils.cleanup();
  });

  it('should throw an error in case of self Transfer', async () => {
    const selfPortfolio = entityMockUtils.getDefaultPortfolioInstance({
      did: signerDid,
      getAssetBalances: [{ free: new BigNumber(90) }] as PortfolioBalance[],
    });
    const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
      did: signerDid,
      destinationAssetHolder: destinationPortfolio,
    });

    await expect(
      prepareNftControllerTransfer.call(proc, {
        collection,
        originPortfolio: selfPortfolio,
        nfts,
      })
    ).rejects.toThrow('Controller transfers to self are not allowed');
  });

  it('should throw an error if transferring to another identity portfolio', () => {
    const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
      did: signerDid,
      destinationAssetHolder: entityMockUtils.getDefaultPortfolioInstance({ did: 'strangerDid' }),
    });

    return expect(
      prepareNftControllerTransfer.call(proc, {
        collection,
        originPortfolio,
        nfts,
      })
    ).rejects.toThrow(
      "Controller transfer must send to one of the signer's portfolios or accounts"
    );
  });

  it('should throw an error if the Portfolio does not have enough balance to transfer', () => {
    const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
      did: signerDid,
      destinationAssetHolder: destinationPortfolio,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (originPortfolio.getCollections as any).mockResolvedValue([]);

    return expect(
      prepareNftControllerTransfer.call(proc, {
        collection,
        originPortfolio,
        nfts,
      })
    ).rejects.toThrow('The origin Portfolio does not have all of the requested NFTs');
  });

  it('should return an nft controller transfer transaction spec', async () => {
    const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
      did: signerDid,
      destinationAssetHolder: destinationPortfolio,
    });

    assetHolderLikeToAssetHolderSpy.mockReturnValue(originPortfolio);

    const transaction = dsMockUtils.createTxMock('nft', 'controllerTransfer');

    const result = await prepareNftControllerTransfer.call(proc, {
      collection,
      originPortfolio,
      nfts,
    });

    expect(result).toEqual({
      transaction,
      args: [rawNfts, rawPortfolioAssetHolder, rawDestinationPortfolioKind],
      resolver: undefined,
    });
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      const portfolioId = { did: signerDid };

      let proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
        did: 'oneDid',
        destinationAssetHolder: destinationPortfolio,
      });
      let boundFunc = getAuthorization.bind(proc);

      const roles = [
        {
          type: RoleType.PortfolioCustodian,
          portfolioId,
        },
      ];

      expect(boundFunc({ collection, originPortfolio, nfts })).toEqual({
        roles,
        permissions: {
          transactions: [TxTags.nft.ControllerTransfer],
          assets: [collection],
          portfolios: [
            expect.objectContaining({ owner: expect.objectContaining({ did: portfolioId.did }) }),
          ],
        },
      });

      proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
        did: 'oneDid',
        destinationAssetHolder: destinationAccount,
      });
      boundFunc = getAuthorization.bind(proc);

      expect(
        boundFunc({ collection, originPortfolio, nfts, destination: destinationAccount })
      ).toEqual({
        permissions: {
          transactions: [TxTags.nft.ControllerTransfer],
          assets: [collection],
          portfolios: [],
        },
      });
    });
  });

  describe('prepareStorage', () => {
    it('should return the DID and destination asset holder details', async () => {
      const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext);
      when(assetHolderLikeToAssetHolderSpy)
        .calledWith(destinationPortfolio, mockContext)
        .mockReturnValue(destinationPortfolio);

      const boundFunc = prepareStorage.bind(proc);
      let result = await boundFunc({
        collection,
        originPortfolio,
        nfts,
        destination: destinationPortfolio,
      });

      expect(JSON.stringify(result)).toEqual(
        JSON.stringify({
          did: 'someDid',
          destinationAssetHolder: destinationPortfolio,
        })
      );

      when(assetHolderLikeToAssetHolderSpy)
        .calledWith(destinationAccount, mockContext)
        .mockReturnValue(destinationAccount);

      result = await boundFunc({
        collection,
        originPortfolio,
        nfts,
        destination: destinationAccount,
      });

      expect(JSON.stringify(result)).toEqual(
        JSON.stringify({
          did: 'someDid',
          destinationAssetHolder: destinationAccount,
        })
      );
    });

    it('should give preference to destination when both destination and destinationPortfolio are provided', async () => {
      const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext);
      const boundFunc = prepareStorage.bind(proc);

      when(assetHolderLikeToAssetHolderSpy)
        .calledWith(destinationAccount, mockContext)
        .mockReturnValue(destinationAccount);
      const result = await boundFunc({
        collection,
        originPortfolio,
        nfts,
        destinationPortfolio,
        destination: destinationAccount,
      });

      expect(JSON.stringify(result)).toEqual(
        JSON.stringify({
          did: 'someDid',
          destinationAssetHolder: destinationAccount,
        })
      );
    });

    it('should return the default portfolio if destinationPortfolio is not provided', async () => {
      mockContext.getSigningIdentity.mockResolvedValue(
        entityMockUtils.getIdentityInstance({ did: signerDid })
      );
      const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext);
      const boundFunc = prepareStorage.bind(proc);
      const result = await boundFunc({ collection, originPortfolio, nfts });

      expect(JSON.stringify(result)).toEqual(
        JSON.stringify({
          did: 'signerDid',
          destinationAssetHolder: destinationPortfolio,
        })
      );
    });
  });
});
