import { PolymeshPrimitivesTicker } from '@polkadot/types/lookup';
import { when } from 'jest-when';

import { getAuthorization, Params, prepareModifyAsset } from '~/api/procedures/modifyAsset';
import { Asset, Context } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { SecurityIdentifier, SecurityIdentifierType, TxTags } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Asset',
  require('~/testUtils/mocks/entities').mockAssetModule('~/api/entities/Asset')
);

describe('modifyAsset procedure', () => {
  let mockContext: Mocked<Context>;
  let stringToTickerSpy: jest.SpyInstance<PolymeshPrimitivesTicker, [string, Context]>;
  let ticker: string;
  let rawTicker: PolymeshPrimitivesTicker;
  let fundingRound: string;
  let identifiers: SecurityIdentifier[];

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    stringToTickerSpy = jest.spyOn(utilsConversionModule, 'stringToTicker');
    ticker = 'SOME_TICKER';
    rawTicker = dsMockUtils.createMockTicker(ticker);
    fundingRound = 'Series A';
    identifiers = [
      {
        type: SecurityIdentifierType.Isin,
        value: 'someValue',
      },
    ];
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    when(stringToTickerSpy).calledWith(ticker, mockContext).mockReturnValue(rawTicker);
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
    entityMockUtils.configureMocks({
      assetOptions: {
        details: { isDivisible: true },
      },
    });

    const proc = procedureMockUtils.getInstance<Params, Asset>(mockContext);

    return expect(
      prepareModifyAsset.call(proc, {
        ticker,
        makeDivisible: true,
      })
    ).rejects.toThrow('The Asset is already divisible');
  });

  it('should throw an error if newName is the same name currently in the Asset', () => {
    const proc = procedureMockUtils.getInstance<Params, Asset>(mockContext);

    return expect(
      prepareModifyAsset.call(proc, {
        ticker,
        name: 'ASSET_NAME',
      })
    ).rejects.toThrow('New name is the same as current name');
  });

  it('should throw an error if newFundingRound is the same funding round name currently in the Asset', () => {
    const proc = procedureMockUtils.getInstance<Params, Asset>(mockContext);

    return expect(
      prepareModifyAsset.call(proc, {
        ticker,
        fundingRound,
      })
    ).rejects.toThrow('New funding round name is the same as current funding round');
  });

  it('should throw an error if newIdentifiers are the same identifiers currently in the Asset', () => {
    entityMockUtils.configureMocks({
      assetOptions: {
        getIdentifiers: identifiers,
      },
    });

    const proc = procedureMockUtils.getInstance<Params, Asset>(mockContext);

    return expect(
      prepareModifyAsset.call(proc, {
        ticker,
        identifiers,
      })
    ).rejects.toThrow('New identifiers are the same as current identifiers');
  });

  it('should add a make divisible transaction to the batch', async () => {
    const proc = procedureMockUtils.getInstance<Params, Asset>(mockContext);

    const transaction = dsMockUtils.createTxMock('asset', 'makeDivisible');

    const result = await prepareModifyAsset.call(proc, {
      ticker,
      makeDivisible: true,
    });

    expect(result).toEqual({
      transactions: [{ transaction, args: [rawTicker] }],
      resolver: expect.objectContaining({ ticker }),
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
      ticker,
      name: newName,
    });

    expect(result).toEqual({
      transactions: [
        {
          transaction,
          args: [rawTicker, rawAssetName],
        },
      ],
      resolver: expect.objectContaining({ ticker }),
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
      ticker,
      fundingRound: newFundingRound,
    });

    expect(result).toEqual({
      transactions: [
        {
          transaction,
          args: [rawTicker, rawFundingRound],
        },
      ],
      resolver: expect.objectContaining({ ticker }),
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
      ticker,
      identifiers,
    });

    expect(result).toEqual({
      transactions: [
        {
          transaction,
          args: [rawTicker, [rawIdentifier]],
        },
      ],
      resolver: expect.objectContaining({ ticker }),
    });
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<Params, Asset>(mockContext);
      const boundFunc = getAuthorization.bind(proc);
      const name = 'NEW NAME';
      const args = {
        ticker,
      } as Params;

      expect(boundFunc(args)).toEqual({
        permissions: {
          transactions: [],
          portfolios: [],
          assets: [expect.objectContaining({ ticker })],
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
          assets: [expect.objectContaining({ ticker })],
        },
      });
    });
  });
});
