import { Balance } from '@polkadot/types/interfaces';
import {
  PolymeshPrimitivesAssetAssetId,
  PolymeshPrimitivesIdentityIdPortfolioId,
} from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';

import {
  getAuthorization,
  Params,
  prepareControllerTransfer,
  prepareStorage,
  Storage,
} from '~/api/procedures/controllerTransfer';
import { Context, DefaultPortfolio, FungibleAsset } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { PortfolioBalance, RoleType, TxTags } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Asset/Fungible',
  require('~/testUtils/mocks/entities').mockFungibleAssetModule('~/api/entities/Asset/Fungible')
);
jest.mock(
  '~/api/entities/DefaultPortfolio',
  require('~/testUtils/mocks/entities').mockDefaultPortfolioModule(
    '~/api/entities/DefaultPortfolio'
  )
);

describe('controllerTransfer procedure', () => {
  let mockContext: Mocked<Context>;
  let assetHolderLikeToAssetHolderSpy: jest.SpyInstance;
  let bigNumberToBalanceSpy: jest.SpyInstance<
    Balance,
    [BigNumber, Context, (boolean | undefined)?]
  >;
  let assetHolderIdToMeshAssetHolderSpy: jest.SpyInstance;
  let assetToMeshAssetIdSpy: jest.SpyInstance;
  let assetId: string;
  let asset: FungibleAsset;
  let rawAssetId: PolymeshPrimitivesAssetAssetId;
  let did: string;
  let rawPortfolioId: PolymeshPrimitivesIdentityIdPortfolioId;
  let originPortfolio: DefaultPortfolio;
  let destinationPortfolio: DefaultPortfolio;
  let rawAmount: Balance;
  let amount: BigNumber;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    assetHolderLikeToAssetHolderSpy = jest.spyOn(
      utilsConversionModule,
      'assetHolderLikeToAssetHolder'
    );
    bigNumberToBalanceSpy = jest.spyOn(utilsConversionModule, 'bigNumberToBalance');
    assetHolderIdToMeshAssetHolderSpy = jest.spyOn(
      utilsConversionModule,
      'assetHolderIdToMeshAssetHolder'
    );
    assetToMeshAssetIdSpy = jest.spyOn(utilsConversionModule, 'assetToMeshAssetId');
    assetId = '0x12341234123412341234123412341234';
    asset = entityMockUtils.getFungibleAssetInstance({ assetId });
    rawAssetId = dsMockUtils.createMockAssetId(assetId);
    did = 'fakeDid';
    rawPortfolioId = dsMockUtils.createMockPortfolioId({
      did: dsMockUtils.createMockIdentityId(did),
      kind: dsMockUtils.createMockPortfolioKind('Default'),
    });
    originPortfolio = entityMockUtils.getDefaultPortfolioInstance({
      did,
      getAssetBalances: [{ free: new BigNumber(90) }] as PortfolioBalance[],
    });

    destinationPortfolio = entityMockUtils.getDefaultPortfolioInstance({ did: 'someDid' });

    amount = new BigNumber(50);
    rawAmount = dsMockUtils.createMockBalance(amount);
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    assetToMeshAssetIdSpy.mockReturnValue(rawAssetId);
    assetHolderLikeToAssetHolderSpy.mockReturnValue(originPortfolio);
    bigNumberToBalanceSpy.mockReturnValue(rawAmount);
    assetHolderIdToMeshAssetHolderSpy.mockReturnValue(rawPortfolioId);
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

  it('should throw an error in case of self Transfer', () => {
    const selfPortfolio = entityMockUtils.getDefaultPortfolioInstance({
      did: 'someDid',
      getAssetBalances: [{ free: new BigNumber(90) }] as PortfolioBalance[],
    });
    const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
      did: 'someDid',
      destinationAssetHolder: destinationPortfolio,
    });

    return expect(
      prepareControllerTransfer.call(proc, {
        asset,
        originPortfolio: selfPortfolio,
        amount: new BigNumber(1000),
      })
    ).rejects.toThrow('Controller transfers to self are not allowed');
  });

  it('should throw an error if the Portfolio does not have enough balance to transfer', () => {
    const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
      did: 'someDid',
      destinationAssetHolder: destinationPortfolio,
    });

    return expect(
      prepareControllerTransfer.call(proc, {
        asset,
        originPortfolio,
        amount: new BigNumber(1000),
      })
    ).rejects.toThrow('The origin Portfolio does not have enough free balance for this transfer');
  });

  it('should return a controller transfer transaction spec', async () => {
    const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
      did: 'someDid',
      destinationAssetHolder: destinationPortfolio,
    });

    const transaction = dsMockUtils.createTxMock('asset', 'controllerTransfer');

    const result = await prepareControllerTransfer.call(proc, {
      asset,
      originPortfolio,
      amount,
    });

    expect(result).toEqual({
      transaction,
      args: [rawAssetId, rawAmount, rawPortfolioId],
      resolver: undefined,
    });
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      const portfolioId = { did: 'oneDid' };

      const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
        did: 'oneDid',
        destinationAssetHolder: destinationPortfolio,
      });
      const boundFunc = getAuthorization.bind(proc);

      const roles = [
        {
          type: RoleType.PortfolioCustodian,
          portfolioId,
        },
      ];

      expect(boundFunc({ asset, originPortfolio, amount })).toEqual({
        roles,
        permissions: {
          transactions: [TxTags.asset.ControllerTransfer],
          assets: [asset],
          portfolios: [
            expect.objectContaining({ owner: expect.objectContaining({ did: portfolioId.did }) }),
          ],
        },
      });
    });
  });

  describe('prepareStorage', () => {
    it('should return the DID of signing Identity and destination asset holder', async () => {
      const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext);
      const boundFunc = prepareStorage.bind(proc);
      assetHolderLikeToAssetHolderSpy.mockReturnValue(destinationPortfolio);

      let result = await boundFunc({ asset, originPortfolio, amount });

      expect(JSON.stringify(result)).toEqual(
        JSON.stringify({ did: 'someDid', destinationAssetHolder: destinationPortfolio })
      );

      const mockAccount = entityMockUtils.getAccountInstance();
      assetHolderLikeToAssetHolderSpy.mockReturnValue(mockAccount);

      result = await boundFunc({ asset, originPortfolio, amount, destination: 'someAddress' });

      expect(result).toEqual({
        did: 'someDid',
        destinationAssetHolder: mockAccount,
      });
    });
  });
});
