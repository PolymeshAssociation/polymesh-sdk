import { PolymeshPrimitivesAssetAssetId } from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import {
  getAuthorization,
  modifyAsset,
  Params,
  prepareModifyAsset,
  prepareStorage,
  Storage,
} from '~/api/procedures/modifyAsset';
import { BaseAsset, Context, Procedure } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import {
  Asset,
  KnownAssetType,
  KnownNftType,
  SecurityIdentifier,
  SecurityIdentifierType,
  TxTags,
} from '~/types';
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

  it('should return an instance of procedure', () => {
    const result = modifyAsset();

    expect(result).toBeInstanceOf(Procedure);
  });

  it('should throw an error if the user has not passed any arguments', () => {
    const proc = procedureMockUtils.getInstance<Params, Asset, Storage>(mockContext);

    return expect(prepareModifyAsset.call(proc, {} as unknown as Params)).rejects.toThrow(
      'Nothing to modify'
    );
  });

  it('should throw an error if makeDivisible is set to true and the Asset is already divisible', () => {
    const proc = procedureMockUtils.getInstance<Params, Asset, Storage>(mockContext);

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
    const proc = procedureMockUtils.getInstance<Params, Asset, Storage>(mockContext);

    return expect(
      prepareModifyAsset.call(proc, {
        asset: entityMockUtils.getNftCollectionInstance({ assetId, exists: true }),
        makeDivisible: true,
      })
    ).rejects.toThrow('NFT Collections cannot be made divisible');
  });

  it('should throw an error if newName is the same name currently in the Asset', () => {
    const proc = procedureMockUtils.getInstance<Params, Asset, Storage>(mockContext);

    return expect(
      prepareModifyAsset.call(proc, {
        asset: entityMockUtils.getBaseAssetInstance({ assetId, details: { name: 'ASSET_NAME' } }),
        name: 'ASSET_NAME',
      })
    ).rejects.toThrow('New name is the same as current name');
  });

  it('should throw an error if newFundingRound is the same funding round name currently in the Asset', () => {
    const proc = procedureMockUtils.getInstance<Params, Asset, Storage>(mockContext);

    return expect(
      prepareModifyAsset.call(proc, {
        asset: entityMockUtils.getBaseAssetInstance({ assetId, currentFundingRound: fundingRound }),
        fundingRound,
      })
    ).rejects.toThrow('New funding round name is the same as current funding round');
  });

  it('should throw an error if newIdentifiers are the same identifiers currently in the Asset', () => {
    const proc = procedureMockUtils.getInstance<Params, Asset, Storage>(mockContext);

    return expect(
      prepareModifyAsset.call(proc, {
        asset: entityMockUtils.getBaseAssetInstance({ assetId, getIdentifiers: identifiers }),
        identifiers,
      })
    ).rejects.toThrow('New identifiers are the same as current identifiers');
  });

  it('should add a make divisible transaction to the batch', async () => {
    const proc = procedureMockUtils.getInstance<Params, Asset, Storage>(mockContext);

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

    const proc = procedureMockUtils.getInstance<Params, Asset, Storage>(mockContext);

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

    const proc = procedureMockUtils.getInstance<Params, Asset, Storage>(mockContext);

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

    const proc = procedureMockUtils.getInstance<Params, Asset, Storage>(mockContext);

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

  it('should  throw if provided asset type is the same as the current asset type', async () => {
    const rawIdentifier = dsMockUtils.createMockAssetIdentifier({
      Isin: dsMockUtils.createMockU8aFixed(identifiers[0].value),
    });
    jest
      .spyOn(utilsConversionModule, 'securityIdentifierToAssetIdentifier')
      .mockReturnValue(rawIdentifier);

    asset.details = jest.fn().mockReturnValue(
      Promise.resolve({
        isDivisible: false,
        name: 'ASSET_NAME',
        assetType: KnownAssetType.EquityCommon,
        nonFungible: false,
      })
    );

    let proc = procedureMockUtils.getInstance<Params, Asset, Storage>(mockContext, {
      customTypeData: null,
    });

    await expect(
      prepareModifyAsset.call(proc, { asset, assetType: KnownAssetType.EquityCommon })
    ).rejects.toThrow('New type is the same as current type');

    asset.details = jest.fn().mockReturnValue(
      Promise.resolve({
        isDivisible: false,
        name: 'ASSET_NAME',
        assetType: new BigNumber(0),
        nonFungible: false,
      })
    );

    proc = procedureMockUtils.getInstance<Params, Asset, Storage>(mockContext, {
      customTypeData: null,
    });

    await expect(
      prepareModifyAsset.call(proc, { asset, assetType: new BigNumber(0) })
    ).rejects.toThrow('New type is the same as current type');
  });

  it('should  throw if trying to modify asset type for NFT collection', async () => {
    const rawIdentifier = dsMockUtils.createMockAssetIdentifier({
      Isin: dsMockUtils.createMockU8aFixed(identifiers[0].value),
    });
    jest
      .spyOn(utilsConversionModule, 'securityIdentifierToAssetIdentifier')
      .mockReturnValue(rawIdentifier);

    asset.details = jest.fn().mockReturnValue(
      Promise.resolve({
        nonFungible: true,
      })
    );

    const proc = procedureMockUtils.getInstance<Params, Asset, Storage>(mockContext, {
      customTypeData: null,
    });

    return expect(
      prepareModifyAsset.call(proc, { asset, assetType: KnownAssetType.EquityCommon })
    ).rejects.toThrow('The type for a NFT Collection cannot be modified');
  });

  it('should  throw if trying to modify asset type with custom type that is not registered on chain', async () => {
    const rawIdentifier = dsMockUtils.createMockAssetIdentifier({
      Isin: dsMockUtils.createMockU8aFixed(identifiers[0].value),
    });
    jest
      .spyOn(utilsConversionModule, 'securityIdentifierToAssetIdentifier')
      .mockReturnValue(rawIdentifier);

    asset.details = jest.fn().mockReturnValue(
      Promise.resolve({
        nonFungible: false,
        assetType: KnownAssetType.EquityCommon,
      })
    );

    const proc = procedureMockUtils.getInstance<Params, Asset, Storage>(mockContext, {
      customTypeData: {
        isAlreadyCreated: false,
        rawId: dsMockUtils.createMockU32(new BigNumber(0)),
        rawValue: dsMockUtils.createMockBytes(''),
      },
    });

    return expect(prepareModifyAsset.call(proc, { asset, assetType: 'some type' })).rejects.toThrow(
      'The provided custom type has not been created on the chain'
    );
  });

  it('should  throw if trying to modify asset type with KnownNftType', async () => {
    const rawIdentifier = dsMockUtils.createMockAssetIdentifier({
      Isin: dsMockUtils.createMockU8aFixed(identifiers[0].value),
    });
    jest
      .spyOn(utilsConversionModule, 'securityIdentifierToAssetIdentifier')
      .mockReturnValue(rawIdentifier);

    asset.details = jest.fn().mockReturnValue(
      Promise.resolve({
        nonFungible: false,
        assetType: KnownAssetType.FixedIncome,
      })
    );

    const proc = procedureMockUtils.getInstance<Params, Asset, Storage>(mockContext, {
      customTypeData: null,
    });

    return expect(
      prepareModifyAsset.call(proc, { asset, assetType: KnownNftType.Invoice })
    ).rejects.toThrow('KnownNftType cannot be used as an asset type');
  });

  it('should add a update asset type transaction to the batch', async () => {
    const internalAssetTypeToAssetTypeSpy = jest.spyOn(
      utilsConversionModule,
      'internalAssetTypeToAssetType'
    );
    const rawType = dsMockUtils.createMockAssetType(KnownAssetType.FixedIncome);

    when(internalAssetTypeToAssetTypeSpy)
      .calledWith(KnownAssetType.FixedIncome, mockContext)
      .mockReturnValue(rawType);

    asset.details = jest.fn().mockReturnValue(
      Promise.resolve({
        nonFungible: false,
        assetType: KnownAssetType.Derivative,
      })
    );

    const transaction = dsMockUtils.createTxMock('asset', 'updateAssetType');

    const proc = procedureMockUtils.getInstance<Params, Asset, Storage>(mockContext, {
      customTypeData: null,
    });

    const result = await prepareModifyAsset.call(proc, {
      asset,
      assetType: KnownAssetType.FixedIncome,
    });

    expect(result).toEqual({
      transactions: [
        {
          transaction,
          args: [rawAssetId, rawType],
        },
      ],
      resolver: expect.objectContaining({ id: assetId }),
    });
  });

  it('should add a update asset type with custom type transaction to the batch', async () => {
    const internalAssetTypeToAssetTypeSpy = jest.spyOn(
      utilsConversionModule,
      'internalAssetTypeToAssetType'
    );
    const rawId = dsMockUtils.createMockU32(new BigNumber(0));

    const rawCustomType = dsMockUtils.createMockAssetType({ Custom: rawId });

    when(internalAssetTypeToAssetTypeSpy)
      .calledWith({ Custom: rawId }, mockContext)
      .mockReturnValue(rawCustomType);

    asset.details = jest.fn().mockReturnValue(
      Promise.resolve({
        nonFungible: false,
        assetType: KnownAssetType.Derivative,
      })
    );

    const transaction = dsMockUtils.createTxMock('asset', 'updateAssetType');

    const proc = procedureMockUtils.getInstance<Params, Asset, Storage>(mockContext, {
      customTypeData: {
        isAlreadyCreated: true,
        rawId,
        rawValue: dsMockUtils.createMockBytes(''),
      },
    });

    const result = await prepareModifyAsset.call(proc, {
      asset,
      assetType: new BigNumber(0),
    });

    expect(result).toEqual({
      transactions: [
        {
          transaction,
          args: [rawAssetId, rawCustomType],
        },
      ],
      resolver: expect.objectContaining({ id: assetId }),
    });
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<Params, Asset, Storage>(mockContext);
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

      expect(
        boundFunc({
          ...args,
          makeDivisible: true,
          name,
          fundingRound,
          identifiers,
          assetType: KnownAssetType.EquityCommon,
        })
      ).toEqual({
        permissions: {
          transactions: [
            TxTags.asset.MakeDivisible,
            TxTags.asset.RenameAsset,
            TxTags.asset.SetFundingRound,
            TxTags.asset.UpdateIdentifiers,
            TxTags.asset.UpdateAssetType,
          ],
          portfolios: [],
          assets: [expect.objectContaining({ id: assetId })],
        },
      });
    });
  });

  describe('prepareStorage', () => {
    it('should return customTypeData equals null if no asset type is provided', async () => {
      const proc = procedureMockUtils.getInstance<Params, Asset, Storage>(mockContext);
      const boundFunc = prepareStorage.bind(proc);

      let result = await boundFunc({} as Params);

      expect(result).toEqual({
        customTypeData: null,
      });

      result = await boundFunc({
        assetType: KnownAssetType.EquityCommon,
      } as Params);

      expect(result).toEqual({
        customTypeData: null,
      });
    });
  });
});
