import BigNumber from 'bignumber.js';

import {
  getAuthorization,
  prepareMoveFunds,
  prepareStorage,
  Storage,
} from '~/api/procedures/transferFunds';
import * as procedureUtilsModule from '~/api/procedures/utils';
import { Context } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { PortfolioBalance, TransferFundsParams, TxTags } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';
import * as typeguardsModule from '~/utils/typeguards';

jest.mock(
  '~/api/entities/NumberedPortfolio',
  require('~/testUtils/mocks/entities').mockNumberedPortfolioModule(
    '~/api/entities/NumberedPortfolio'
  )
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

jest.mock(
  '~/api/entities/Asset/Fungible',
  require('~/testUtils/mocks/entities').mockFungibleAssetModule('~/api/entities/Asset/Fungible')
);
jest.mock(
  '~/api/entities/Asset/NonFungible',
  require('~/testUtils/mocks/entities').mockNftCollectionModule('~/api/entities/Asset/NonFungible')
);

describe('transferFunds procedure', () => {
  let mockContext: Mocked<Context>;
  let assetHolderIdToMeshAssetHolderSpy: jest.SpyInstance;
  let assetHolderLikeToAssetHolderIdSpy: jest.SpyInstance;
  let assetHolderLikeToAssetHolderSpy: jest.SpyInstance;
  let fungibleMovementToPortfolioFundSpy: jest.SpyInstance;
  let nftMovementToPortfolioFundSpy: jest.SpyInstance;
  let getAssetHolderDidSpy: jest.SpyInstance;
  let isFungibleLegBuilderSpy: jest.SpyInstance;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    assetHolderIdToMeshAssetHolderSpy = jest.spyOn(
      utilsConversionModule,
      'assetHolderIdToMeshAssetHolder'
    );
    assetHolderLikeToAssetHolderIdSpy = jest.spyOn(
      utilsConversionModule,
      'assetHolderLikeToAssetHolderId'
    );
    assetHolderLikeToAssetHolderSpy = jest.spyOn(
      utilsConversionModule,
      'assetHolderLikeToAssetHolder'
    );
    fungibleMovementToPortfolioFundSpy = jest.spyOn(
      utilsConversionModule,
      'fungibleMovementToPortfolioFund'
    );
    nftMovementToPortfolioFundSpy = jest.spyOn(utilsConversionModule, 'nftMovementToPortfolioFund');
    getAssetHolderDidSpy = jest.spyOn(procedureUtilsModule, 'getAssetHolderDid');
    isFungibleLegBuilderSpy = jest.spyOn(typeguardsModule, 'isFungibleLegBuilder');
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    isFungibleLegBuilderSpy.mockResolvedValue((leg: any) => 'amount' in leg);
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

  describe('prepareMoveFunds', () => {
    it('should throw an error if from and to asset holders are the same', async () => {
      const fromHolder = entityMockUtils.getNumberedPortfolioInstance({
        did: 'someDid',
        id: new BigNumber(1),
      });
      const toHolder = entityMockUtils.getNumberedPortfolioInstance({
        did: 'someDid',
        id: new BigNumber(1),
      });

      fromHolder.isEqual.mockReturnValue(true);

      const proc = procedureMockUtils.getInstance<TransferFundsParams, void, Storage>(mockContext, {
        fromHolder,
        toHolder,
        signingDid: 'someDid',
        signingAccount: 'someAccount',
      });

      await expect(
        prepareMoveFunds.call(proc, {
          from: fromHolder,
          to: toHolder,
          asset: 'someAsset',
          amount: new BigNumber(100),
        } as unknown as TransferFundsParams)
      ).rejects.toThrow('from and to asset holders cannot be the same');
    });

    it('should throw an error if DID cannot be retrieved from one or both asset holders', async () => {
      const fromHolder = entityMockUtils.getNumberedPortfolioInstance({
        did: 'someDid',
        id: new BigNumber(1),
      });
      const toHolder = entityMockUtils.getNumberedPortfolioInstance({
        did: 'someDid',
        id: new BigNumber(2),
      });

      fromHolder.isEqual.mockReturnValue(false);
      getAssetHolderDidSpy.mockResolvedValueOnce('someDid').mockResolvedValueOnce(undefined);

      const proc = procedureMockUtils.getInstance<TransferFundsParams, void, Storage>(mockContext, {
        fromHolder,
        toHolder,
        signingDid: 'someDid',
        signingAccount: 'someAccount',
      });

      await expect(
        prepareMoveFunds.call(proc, {
          from: fromHolder,
          to: toHolder,
          asset: 'someAsset',
          amount: new BigNumber(100),
        } as unknown as TransferFundsParams)
      ).rejects.toThrow('Unable to retrieve the DID from one or both asset holders');
    });

    it('should throw an error if DIDs are different', async () => {
      const fromHolder = entityMockUtils.getNumberedPortfolioInstance({
        did: 'someDid',
        id: new BigNumber(1),
      });
      const toHolder = entityMockUtils.getNumberedPortfolioInstance({
        did: 'otherDid',
        id: new BigNumber(2),
      });

      fromHolder.isEqual.mockReturnValue(false);
      getAssetHolderDidSpy.mockResolvedValueOnce('someDid').mockResolvedValueOnce('otherDid');

      const proc = procedureMockUtils.getInstance<TransferFundsParams, void, Storage>(mockContext, {
        fromHolder,
        toHolder,
        signingDid: 'someDid',
        signingAccount: 'someAccount',
      });

      await expect(
        prepareMoveFunds.call(proc, {
          from: fromHolder,
          to: toHolder,
          asset: 'someAsset',
          amount: new BigNumber(100),
        } as unknown as TransferFundsParams)
      ).rejects.toThrow(
        'For transferring funds between different DIDs, use `addInstruction` method instead.'
      );
    });

    it('should throw an error if amount is less than or equal to 0 for a fungible leg', async () => {
      const fromHolder = entityMockUtils.getNumberedPortfolioInstance({
        did: 'someDid',
        id: new BigNumber(1),
      });
      const toHolder = entityMockUtils.getNumberedPortfolioInstance({
        did: 'someDid',
        id: new BigNumber(2),
      });

      fromHolder.isEqual.mockReturnValue(false);
      getAssetHolderDidSpy.mockResolvedValue('someDid');

      const proc = procedureMockUtils.getInstance<TransferFundsParams, void, Storage>(mockContext, {
        fromHolder,
        toHolder,
        signingDid: 'someDid',
        signingAccount: 'someAccount',
      });

      await expect(
        prepareMoveFunds.call(proc, {
          from: fromHolder,
          to: toHolder,
          asset: 'someAsset',
          amount: new BigNumber(0),
        } as unknown as TransferFundsParams)
      ).rejects.toThrow('Amount should be greater than 0');
    });

    it('should throw an error if sender has insufficient balance for a fungible leg', async () => {
      const fromHolder = entityMockUtils.getNumberedPortfolioInstance({
        did: 'someDid',
        id: new BigNumber(1),
      });
      const toHolder = entityMockUtils.getNumberedPortfolioInstance({
        did: 'someDid',
        id: new BigNumber(2),
      });

      fromHolder.isEqual.mockReturnValue(false);
      fromHolder.getAssetBalances.mockResolvedValue([
        { free: new BigNumber(50) } as unknown as PortfolioBalance,
      ]);
      getAssetHolderDidSpy.mockResolvedValue('someDid');

      const proc = procedureMockUtils.getInstance<TransferFundsParams, void, Storage>(mockContext, {
        fromHolder,
        toHolder,
        signingDid: 'someDid',
        signingAccount: 'someAccount',
      });

      await expect(
        prepareMoveFunds.call(proc, {
          from: fromHolder,
          to: toHolder,
          asset: 'someAsset',
          amount: new BigNumber(100),
        } as unknown as TransferFundsParams)
      ).rejects.toThrow('Sender has insufficient balance to cover the transfer');
    });

    it('should throw an error if spender has insufficient allowance for a fungible leg', async () => {
      const fromHolder = entityMockUtils.getAccountInstance({ address: 'someAccount' });
      const toHolder = entityMockUtils.getNumberedPortfolioInstance({
        did: 'someDid',
        id: new BigNumber(2),
      });
      const asset = entityMockUtils.getFungibleAssetInstance({ ticker: 'TICKER' });

      asset.getAllowance.mockResolvedValue(new BigNumber(50));
      fromHolder.isEqual.mockReturnValue(false);
      getAssetHolderDidSpy.mockResolvedValue('someDid');

      const proc = procedureMockUtils.getInstance<TransferFundsParams, void, Storage>(mockContext, {
        fromHolder,
        toHolder,
        signingDid: 'otherDid',
        signingAccount: 'someOtherAccount',
      });

      await expect(
        prepareMoveFunds.call(proc, {
          from: fromHolder,
          to: toHolder,
          asset,
          amount: new BigNumber(100),
        } as unknown as TransferFundsParams)
      ).rejects.toThrow('Spender has insufficient allowance to cover the transfer');
    });

    it('should return a transfer funds transaction spec for fungible assets', async () => {
      const fromHolder = entityMockUtils.getNumberedPortfolioInstance({
        did: 'someDid',
        id: new BigNumber(1),
      });
      const toHolder = entityMockUtils.getNumberedPortfolioInstance({
        did: 'someDid',
        id: new BigNumber(2),
      });
      const asset = entityMockUtils.getFungibleAssetInstance({ ticker: 'TICKER' });

      fromHolder.isEqual.mockReturnValue(false);
      fromHolder.getAssetBalances.mockResolvedValue([
        { free: new BigNumber(150) } as unknown as PortfolioBalance,
      ]);
      getAssetHolderDidSpy.mockResolvedValue('someDid');

      fungibleMovementToPortfolioFundSpy.mockResolvedValue('rawFund');
      assetHolderLikeToAssetHolderIdSpy.mockReturnValue('someHolderId');
      assetHolderIdToMeshAssetHolderSpy.mockResolvedValue('rawHolder');

      const proc = procedureMockUtils.getInstance<TransferFundsParams, void, Storage>(mockContext, {
        fromHolder,
        toHolder,
        signingDid: 'someDid',
        signingAccount: 'someAccount',
      });

      const transaction = dsMockUtils.createTxMock('settlement', 'transferFunds');

      const result = await prepareMoveFunds.call(proc, {
        from: fromHolder,
        to: toHolder,
        asset,
        amount: new BigNumber(100),
      } as unknown as TransferFundsParams);

      expect(result).toEqual({
        transaction,
        args: ['rawHolder', 'rawHolder', 'rawFund'],
        resolver: undefined,
      });
    });

    it('should return a transfer funds transaction spec for NFT assets', async () => {
      const fromHolder = entityMockUtils.getNumberedPortfolioInstance({
        did: 'someDid',
        id: new BigNumber(1),
      });
      const toHolder = entityMockUtils.getNumberedPortfolioInstance({
        did: 'someDid',
        id: new BigNumber(2),
      });
      const asset = entityMockUtils.getNftCollectionInstance({ ticker: 'TICKER' });

      fromHolder.isEqual.mockReturnValue(false);
      getAssetHolderDidSpy.mockResolvedValue('someDid');

      nftMovementToPortfolioFundSpy.mockResolvedValue('rawNftFund');
      assetHolderLikeToAssetHolderIdSpy.mockReturnValue('someHolderId');
      assetHolderIdToMeshAssetHolderSpy.mockResolvedValue('rawHolder');
      isFungibleLegBuilderSpy.mockResolvedValue(() => false);

      const proc = procedureMockUtils.getInstance<TransferFundsParams, void, Storage>(mockContext, {
        fromHolder,
        toHolder,
        signingDid: 'someDid',
        signingAccount: 'someAccount',
      });

      const transaction = dsMockUtils.createTxMock('settlement', 'transferFunds');

      const result = await prepareMoveFunds.call(proc, {
        from: fromHolder,
        to: toHolder,
        asset,
        nfts: [new BigNumber(1)],
      } as unknown as TransferFundsParams);

      expect(result).toEqual({
        transaction,
        args: ['rawHolder', 'rawHolder', 'rawNftFund'],
        resolver: undefined,
      });
    });
  });

  describe('prepareStorage', () => {
    it('should return the necessary storage', async () => {
      const from = entityMockUtils.getNumberedPortfolioInstance({
        did: 'someDid',
        id: new BigNumber(1),
      });
      const to = entityMockUtils.getNumberedPortfolioInstance({
        did: 'someDid',
        id: new BigNumber(2),
      });

      assetHolderLikeToAssetHolderSpy.mockReturnValueOnce(from).mockReturnValueOnce(to);

      const proc = procedureMockUtils.getInstance<TransferFundsParams, void, Storage>(mockContext);

      const result = await prepareStorage.call(proc, {
        from,
        to,
        asset: 'someAsset',
        amount: new BigNumber(100),
      } as unknown as TransferFundsParams);

      expect(result).toEqual({
        fromHolder: from,
        toHolder: to,
        signingDid: 'someDid',
        signingAccount: mockContext.getSigningAccount().address,
      });
    });
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      const fromHolder = entityMockUtils.getNumberedPortfolioInstance({
        did: 'someDid',
        id: new BigNumber(1),
      });
      const toHolder = entityMockUtils.getAccountInstance({ address: 'someAccount' });

      const proc = procedureMockUtils.getInstance<TransferFundsParams, void, Storage>(mockContext, {
        fromHolder,
        toHolder,
        signingDid: 'someDid',
        signingAccount: 'someAccount',
      });

      const boundFunc = getAuthorization.bind(proc);

      expect(boundFunc()).toEqual({
        permissions: {
          transactions: [TxTags.settlement.TransferFunds],
          portfolios: [fromHolder],
          assets: [],
        },
      });
    });
  });
});
