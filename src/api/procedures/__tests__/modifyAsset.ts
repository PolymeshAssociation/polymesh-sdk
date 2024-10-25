import { PolymeshPrimitivesAssetAssetId } from '@polkadot/types/lookup';
import { when } from 'jest-when';

import { getAuthorization, Params, prepareModifyAsset } from '~/api/procedures/modifyAsset';
import { BaseAsset, Context } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { Asset, SecurityIdentifier, SecurityIdentifierType, TxTags } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Asset/Fungible',
  require('~/testUtils/mocks/entities').mockFungibleAssetModule('~/api/entities/Asset/Fungible')
);
jest.mock(
  '~/api/entities/Asset/NonFungible',
  require('~/testUtils/mocks/entities').mockNftCollectionModule('~/api/entities/Asset/NonFungible')
);

describe('modifyAsset procedure', () => {
  let mockContext: Mocked<Context>;
  let assetToMeshAssetIdSpy: jest.SpyInstance;
  let assetId: string;
  let asset: BaseAsset;
  let rawAssetId: PolymeshPrimitivesAssetAssetId;
  let fundingRound: string;
  let identifiers: SecurityIdentifier[];

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    assetToMeshAssetIdSpy = jest.spyOn(utilsConversionModule, 'assetToMeshAssetId');
    assetId = '12341234-1234-1234-1234-123412341234';
    asset = entityMockUtils.getBaseAssetInstance({ assetId });
    rawAssetId = dsMockUtils.createMockAssetId(assetId);
    fundingRound = 'Series A';
    identifiers = [
      {
        type: SecurityIdentifierType.Isin,
        value: 'someValue',
      },
    ];
  });

  beforeEach(() => {
    entityMockUtils.configureMocks({
      fungibleAssetOptions: {
        exists: true,
      },
      nftCollectionOptions: {
        exists: false,
      },
    });
    mockContext = dsMockUtils.getContextInstance();
    when(assetToMeshAssetIdSpy).calledWith(asset, mockContext).mockReturnValue(rawAssetId);
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

  it('should throw an error if the user has not passed any arguments', () => {
    const proc = procedureMockUtils.getInstance<Params, Asset>(mockContext);

    return expect(prepareModifyAsset.call(proc, {} as unknown as Params)).rejects.toThrow(
      'Nothing to modify'
    );
  });

  it('should throw an error if makeDivisible is set to true and the Asset is already divisible', () => {
    const proc = procedureMockUtils.getInstance<Params, Asset>(mockContext);

    return expect(
      prepareModifyAsset.call(proc, {
        asset: entityMockUtils.getFungibleAssetInstance({
          assetId,
          details: { isDivisible: true },
        }),
        makeDivisible: true,
      })
    ).rejects.toThrow('The Asset is already divisible');
  });

  it('should throw an error if makeDivisible is set to true and the Asset is an NFT Collection', () => {
    const proc = procedureMockUtils.getInstance<Params, Asset>(mockContext);

    return expect(
      prepareModifyAsset.call(proc, {
        asset: entityMockUtils.getNftCollectionInstance({ assetId, exists: true }),
        makeDivisible: true,
      })
    ).rejects.toThrow('NFT Collections cannot be made divisible');
  });

  it('should throw an error if newName is the same name currently in the Asset', () => {
    const proc = procedureMockUtils.getInstance<Params, Asset>(mockContext);

    return expect(
      prepareModifyAsset.call(proc, {
        asset: entityMockUtils.getBaseAssetInstance({ assetId, details: { name: 'ASSET_NAME' } }),
        name: 'ASSET_NAME',
      })
    ).rejects.toThrow('New name is the same as current name');
  });

  it('should throw an error if newFundingRound is the same funding round name currently in the Asset', () => {
    const proc = procedureMockUtils.getInstance<Params, Asset>(mockContext);

    return expect(
      prepareModifyAsset.call(proc, {
        asset: entityMockUtils.getBaseAssetInstance({ assetId, currentFundingRound: fundingRound }),
        fundingRound,
      })
    ).rejects.toThrow('New funding round name is the same as current funding round');
  });

  it('should throw an error if newIdentifiers are the same identifiers currently in the Asset', () => {
    const proc = procedureMockUtils.getInstance<Params, Asset>(mockContext);

    return expect(
      prepareModifyAsset.call(proc, {
        asset: entityMockUtils.getBaseAssetInstance({ assetId, getIdentifiers: identifiers }),
        identifiers,
      })
    ).rejects.toThrow('New identifiers are the same as current identifiers');
  });

  it('should add a make divisible transaction to the batch', async () => {
    const proc = procedureMockUtils.getInstance<Params, Asset>(mockContext);

    const transaction = dsMockUtils.createTxMock('asset', 'makeDivisible');

    const result = await prepareModifyAsset.call(proc, {
      asset,
      makeDivisible: true,
    });

    expect(result).toEqual({
      transactions: [{ transaction, args: [rawAssetId] }],
      resolver: expect.objectContaining({ id: assetId }),
    });
  });

  it('should add a rename Asset transaction to the batch', async () => {
    const newName = 'NEW_NAME';
    const rawAssetName = dsMockUtils.createMockBytes(newName);
    when(jest.spyOn(utilsConversionModule, 'nameToAssetName'))
      .calledWith(newName, mockContext)
      .mockReturnValue(rawAssetName);

    const proc = procedureMockUtils.getInstance<Params, Asset>(mockContext);

    const transaction = dsMockUtils.createTxMock('asset', 'renameAsset');

    const result = await prepareModifyAsset.call(proc, {
      asset,
      name: newName,
    });

    expect(result).toEqual({
      transactions: [
        {
          transaction,
          args: [rawAssetId, rawAssetName],
        },
      ],
      resolver: expect.objectContaining({ id: assetId }),
    });
  });

  it('should add a set funding round transaction to the batch', async () => {
    const newFundingRound = 'Series B';
    const rawFundingRound = dsMockUtils.createMockBytes(newFundingRound);
    when(jest.spyOn(utilsConversionModule, 'fundingRoundToAssetFundingRound'))
      .calledWith(newFundingRound, mockContext)
      .mockReturnValue(rawFundingRound);

    const proc = procedureMockUtils.getInstance<Params, Asset>(mockContext);

    const transaction = dsMockUtils.createTxMock('asset', 'setFundingRound');

    const result = await prepareModifyAsset.call(proc, {
      asset,
      fundingRound: newFundingRound,
    });

    expect(result).toEqual({
      transactions: [
        {
          transaction,
          args: [rawAssetId, rawFundingRound],
        },
      ],
      resolver: expect.objectContaining({ id: assetId }),
    });
  });

  it('should add a update identifiers transaction to the batch', async () => {
    const rawIdentifier = dsMockUtils.createMockAssetIdentifier({
      Isin: dsMockUtils.createMockU8aFixed(identifiers[0].value),
    });
    jest
      .spyOn(utilsConversionModule, 'securityIdentifierToAssetIdentifier')
      .mockReturnValue(rawIdentifier);

    const proc = procedureMockUtils.getInstance<Params, Asset>(mockContext);

    const transaction = dsMockUtils.createTxMock('asset', 'updateIdentifiers');

    const result = await prepareModifyAsset.call(proc, {
      asset,
      identifiers,
    });

    expect(result).toEqual({
      transactions: [
        {
          transaction,
          args: [rawAssetId, [rawIdentifier]],
        },
      ],
      resolver: expect.objectContaining({ id: assetId }),
    });
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<Params, Asset>(mockContext);
      const boundFunc = getAuthorization.bind(proc);
      const name = 'NEW NAME';
      const args = {
        asset,
      } as Params;

      expect(boundFunc(args)).toEqual({
        permissions: {
          transactions: [],
          portfolios: [],
          assets: [expect.objectContaining({ id: assetId })],
        },
      });

      expect(boundFunc({ ...args, makeDivisible: true, name, fundingRound, identifiers })).toEqual({
        permissions: {
          transactions: [
            TxTags.asset.MakeDivisible,
            TxTags.asset.RenameAsset,
            TxTags.asset.SetFundingRound,
            TxTags.asset.UpdateIdentifiers,
          ],
          portfolios: [],
          assets: [expect.objectContaining({ id: assetId })],
        },
      });
    });
  });
});
