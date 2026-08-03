import {
  PolymeshPrimitivesAssetAssetId,
  PolymeshPrimitivesIdentityIdPortfolioId,
} from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import {
  getAuthorization,
  Params,
  prepareStorage,
  prepareTogglePortfolioPreApproval,
  Storage,
} from '~/api/procedures/togglePortfolioPreApproval';
import { BaseAsset, Context, NumberedPortfolio } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { PortfolioId, TxTags } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';
import * as utilsInternalModule from '~/utils/internal';

jest.mock(
  '~/api/entities/Asset/Fungible',
  require('~/testUtils/mocks/entities').mockFungibleAssetModule('~/api/entities/Asset/Fungible')
);
jest.mock(
  '~/api/entities/NumberedPortfolio',
  require('~/testUtils/mocks/entities').mockNumberedPortfolioModule(
    '~/api/entities/NumberedPortfolio'
  )
);

describe('togglePortfolioPreApproval procedure', () => {
  const did = 'someDid';
  const id = new BigNumber(1);
  const portfolioId: PortfolioId = { did, number: id };

  let mockContext: Mocked<Context>;
  let assetToMeshAssetIdSpy: jest.SpyInstance;
  let portfolioIdToMeshPortfolioIdSpy: jest.SpyInstance;
  let portfolioLikeToPortfolioIdSpy: jest.SpyInstance;
  let asBaseAssetSpy: jest.SpyInstance;
  let assetId: string;
  let asset: BaseAsset;
  let rawAssetId: PolymeshPrimitivesAssetAssetId;
  let rawPortfolioId: PolymeshPrimitivesIdentityIdPortfolioId;
  let portfolio: Mocked<NumberedPortfolio>;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    assetToMeshAssetIdSpy = jest.spyOn(utilsConversionModule, 'assetToMeshAssetId');
    portfolioIdToMeshPortfolioIdSpy = jest.spyOn(
      utilsConversionModule,
      'portfolioIdToMeshPortfolioId'
    );
    portfolioLikeToPortfolioIdSpy = jest.spyOn(utilsConversionModule, 'portfolioLikeToPortfolioId');
    asBaseAssetSpy = jest.spyOn(utilsInternalModule, 'asBaseAsset');
    assetId = 'TEST';
    asset = entityMockUtils.getBaseAssetInstance({ assetId });
    rawAssetId = dsMockUtils.createMockTicker(assetId);
    rawPortfolioId = dsMockUtils.createMockPortfolioId({
      did: dsMockUtils.createMockIdentityId(did),
      kind: dsMockUtils.createMockPortfolioKind({
        User: dsMockUtils.createMockU64(id),
      }),
    });
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    portfolio = entityMockUtils.getNumberedPortfolioInstance({
      did,
      id,
      isAssetPreApproved: false,
    });
    asBaseAssetSpy.mockResolvedValue(asset);
    when(assetToMeshAssetIdSpy)
      .calledWith(expect.objectContaining({ id: assetId }), mockContext)
      .mockReturnValue(rawAssetId);
    when(portfolioIdToMeshPortfolioIdSpy)
      .calledWith(portfolioId, mockContext)
      .mockReturnValue(rawPortfolioId);
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

  it('should throw an error if pre approving an asset that is already pre-approved', () => {
    const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
      portfolioId,
    });
    portfolio.isAssetPreApproved.mockResolvedValue(true);

    return expect(
      prepareTogglePortfolioPreApproval.call(proc, {
        portfolio,
        asset,
        preApprove: true,
      })
    ).rejects.toThrow('The Portfolio has already pre-approved the asset');
  });

  it('should throw an error if removing pre approval for an asset that is not pre-approved', () => {
    const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
      portfolioId,
    });

    return expect(
      prepareTogglePortfolioPreApproval.call(proc, {
        portfolio,
        asset,
        preApprove: false,
      })
    ).rejects.toThrow('The Portfolio has not pre-approved the asset');
  });

  it('should return a pre approve portfolio transaction spec', async () => {
    const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
      portfolioId,
    });

    const transaction = dsMockUtils.createTxMock('portfolio', 'preApprovePortfolio');

    const result = await prepareTogglePortfolioPreApproval.call(proc, {
      portfolio,
      asset,
      preApprove: true,
    });

    expect(result).toEqual({
      transaction,
      args: [rawAssetId, rawPortfolioId],
      resolver: undefined,
    });
  });

  it('should return a remove portfolio pre approval transaction spec', async () => {
    const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
      portfolioId,
    });
    portfolio.isAssetPreApproved.mockResolvedValue(true);

    const transaction = dsMockUtils.createTxMock('portfolio', 'removePortfolioPreApproval');

    const result = await prepareTogglePortfolioPreApproval.call(proc, {
      portfolio,
      asset,
      preApprove: false,
    });

    expect(result).toEqual({
      transaction,
      args: [rawAssetId, rawPortfolioId],
      resolver: undefined,
    });
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
        portfolioId,
      });
      const boundFunc = getAuthorization.bind(proc);
      const args: Params = {
        portfolio,
        asset,
        preApprove: true,
      };

      expect(boundFunc(args)).toEqual({
        permissions: {
          transactions: [TxTags.portfolio.PreApprovePortfolio],
          assets: [],
          portfolios: [portfolio],
        },
      });

      args.preApprove = false;

      expect(boundFunc(args)).toEqual({
        permissions: {
          transactions: [TxTags.portfolio.RemovePortfolioPreApproval],
          assets: [],
          portfolios: [portfolio],
        },
      });
    });
  });

  describe('prepareStorage', () => {
    it('should return the portfolio id', () => {
      const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext);
      const boundFunc = prepareStorage.bind(proc);

      when(portfolioLikeToPortfolioIdSpy).calledWith(portfolio).mockReturnValue(portfolioId);

      const result = boundFunc({ portfolio, asset, preApprove: true });

      expect(result).toEqual({
        portfolioId,
      });
    });
  });
});
