import { ISubmittableResult } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';

import * as addInstructionModule from '~/api/procedures/addInstruction';
import {
  getAuthorization,
  prepareStorage,
  prepareTransferFunds,
  Storage,
} from '~/api/procedures/transferFunds';
import * as procedureUtilsModule from '~/api/procedures/utils';
import { Account, Context, Instruction, Nft, NumberedPortfolio } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { AssetHolder, PortfolioBalance, TransferFundsParams, TxTags } from '~/types';
import { isResolverFunction, MaybeResolverFunction } from '~/types/internal';
import * as utilsConversionModule from '~/utils/conversion';
import * as utilsInternalModule from '~/utils/internal';
import * as typeguardsModule from '~/utils/typeguards';

const callResolver = (
  resolver: MaybeResolverFunction<Instruction | undefined>
): Promise<Instruction | undefined> =>
  Promise.resolve(isResolverFunction(resolver) ? resolver({} as ISubmittableResult) : resolver);

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
  let createAddInstructionResolverSpy: jest.SpyInstance;
  let asAssetIdSpy: jest.SpyInstance;
  let asFungibleAssetSpy: jest.SpyInstance;
  let getOwnerSpy: jest.SpyInstance;
  let isLockedSpy: jest.SpyInstance;
  let filterEventRecordsSpy: jest.SpyInstance;

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
    createAddInstructionResolverSpy = jest.spyOn(
      addInstructionModule,
      'createAddInstructionResolver'
    );
    asAssetIdSpy = jest.spyOn(utilsInternalModule, 'asAssetId');
    asFungibleAssetSpy = jest.spyOn(utilsInternalModule, 'asFungibleAsset');
    getOwnerSpy = jest.spyOn(Nft.prototype, 'getOwner');
    isLockedSpy = jest.spyOn(Nft.prototype, 'isLocked');
    filterEventRecordsSpy = jest.spyOn(utilsInternalModule, 'filterEventRecords');
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    assetHolderIdToMeshAssetHolderSpy.mockReturnValue('someMeshAssetHolder');
    assetHolderLikeToAssetHolderIdSpy.mockReturnValue('someAssetHolderId');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    isFungibleLegBuilderSpy.mockResolvedValue((leg: any) => 'amount' in leg);
    // no `SettlementManuallyExecuted` event by default - the created instruction stays pending
    filterEventRecordsSpy.mockReturnValue([]);
    getAssetHolderDidSpy.mockResolvedValue('someDid');
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

  describe('prepareTransferFunds', () => {
    let fromAccountHolder: Mocked<Account>;
    let fromPortfolioHolder: Mocked<NumberedPortfolio>;
    let toPortfolioHolder: Mocked<NumberedPortfolio>;

    beforeEach(() => {
      fromPortfolioHolder = entityMockUtils.getNumberedPortfolioInstance({
        did: 'someDid',
        id: new BigNumber(1),
      });
      fromAccountHolder = entityMockUtils.getAccountInstance({ address: 'someAccount' });
      toPortfolioHolder = entityMockUtils.getNumberedPortfolioInstance({
        did: 'someDid',
        id: new BigNumber(2),
      });

      fromPortfolioHolder.isEqual.mockReturnValue(false);
      fromAccountHolder.isEqual.mockReturnValue(false);
    });

    it('should throw an error if from and to asset holders are the same', async () => {
      fromPortfolioHolder.isEqual.mockReturnValue(true);

      const proc = procedureMockUtils.getInstance<
        TransferFundsParams,
        Instruction | undefined,
        Storage
      >(mockContext, {
        fromHolder: fromPortfolioHolder,
        toHolder: toPortfolioHolder,
        fromDid: 'someDid',
        toDid: 'someDid',
        signingDid: 'someDid',
        signingAccount: 'someAccount',
      });

      await expect(
        prepareTransferFunds.call(proc, {
          from: fromPortfolioHolder,
          to: toPortfolioHolder,
          asset: 'SOME_ASSET',
          amount: new BigNumber(100),
        })
      ).rejects.toThrow('from and to asset holders cannot be the same');
    });

    it('should throw an error if DID cannot be retrieved from one or both asset holders', async () => {
      const proc = procedureMockUtils.getInstance<
        TransferFundsParams,
        Instruction | undefined,
        Storage
      >(mockContext, {
        fromHolder: fromPortfolioHolder,
        toHolder: toPortfolioHolder,
        fromDid: 'someDid',
        toDid: undefined,
        signingDid: 'someDid',
        signingAccount: 'someAccount',
      });

      await expect(
        prepareTransferFunds.call(proc, {
          from: fromPortfolioHolder,
          to: toPortfolioHolder,
          asset: 'SOME_ASSET',
          amount: new BigNumber(100),
        })
      ).rejects.toThrow('Unable to retrieve the DID from one or both asset holders');
    });

    it('should throw an error if amount is less than or equal to 0 for a fungible leg', async () => {
      const proc = procedureMockUtils.getInstance<
        TransferFundsParams,
        Instruction | undefined,
        Storage
      >(mockContext, {
        fromHolder: fromPortfolioHolder,
        toHolder: toPortfolioHolder,
        fromDid: 'someDid',
        toDid: 'someDid',
        signingDid: 'someDid',
        signingAccount: 'someAccount',
      });

      await expect(
        prepareTransferFunds.call(proc, {
          from: fromPortfolioHolder,
          to: toPortfolioHolder,
          asset: 'SOME_ASSET',
          amount: new BigNumber(0),
        })
      ).rejects.toThrow('Amount should be greater than 0');
    });

    it('should throw an error if sender has insufficient balance for a fungible leg', async () => {
      fromPortfolioHolder.getAssetBalances.mockResolvedValue([
        { free: new BigNumber(50) } as PortfolioBalance,
      ]);

      const proc = procedureMockUtils.getInstance<
        TransferFundsParams,
        Instruction | undefined,
        Storage
      >(mockContext, {
        fromHolder: fromPortfolioHolder,
        toHolder: toPortfolioHolder,
        fromDid: 'someDid',
        toDid: 'someDid',
        signingDid: 'someDid',
        signingAccount: 'someAccount',
      });

      await expect(
        prepareTransferFunds.call(proc, {
          from: fromPortfolioHolder,
          to: toPortfolioHolder,
          asset: 'SOME_ASSET',
          amount: new BigNumber(100),
        })
      ).rejects.toThrow('Sender has insufficient balance to cover the transfer');
    });

    it('should throw an error if sender has no balance record for a fungible leg', async () => {
      fromPortfolioHolder.getAssetBalances.mockResolvedValue([]);

      const proc = procedureMockUtils.getInstance<
        TransferFundsParams,
        Instruction | undefined,
        Storage
      >(mockContext, {
        fromHolder: fromPortfolioHolder,
        toHolder: toPortfolioHolder,
        fromDid: 'someDid',
        toDid: 'someDid',
        signingDid: 'someDid',
        signingAccount: 'someAccount',
      });

      await expect(
        prepareTransferFunds.call(proc, {
          from: fromPortfolioHolder,
          to: toPortfolioHolder,
          asset: 'SOME_ASSET',
          amount: new BigNumber(100),
        })
      ).rejects.toThrow('Sender has insufficient balance to cover the transfer');
    });

    it('should check the balance of a Portfolio source even when it belongs to a different DID than the signer (cross-DID custody transfer)', async () => {
      // fromPortfolioHolder's DID ('someDid') differs from the signer's DID ('otherDid') -
      // e.g. a custodian moving funds out of a portfolio they don't own
      fromPortfolioHolder.getAssetBalances.mockResolvedValue([
        { free: new BigNumber(50) } as PortfolioBalance,
      ]);

      const proc = procedureMockUtils.getInstance<
        TransferFundsParams,
        Instruction | undefined,
        Storage
      >(mockContext, {
        fromHolder: fromPortfolioHolder,
        toHolder: toPortfolioHolder,
        fromDid: 'someDid',
        toDid: 'someDid',
        signingDid: 'otherDid',
        signingAccount: 'someOtherAccount',
      });

      await expect(
        prepareTransferFunds.call(proc, {
          from: fromPortfolioHolder,
          to: toPortfolioHolder,
          asset: 'SOME_ASSET',
          amount: new BigNumber(100),
        })
      ).rejects.toThrow('Sender has insufficient balance to cover the transfer');

      expect(fromPortfolioHolder.getAssetBalances).toHaveBeenCalled();
    });

    it('should throw an error if spender has insufficient allowance for a fungible leg', async () => {
      const asset = entityMockUtils.getFungibleAssetInstance({ ticker: 'TICKER' });
      asset.getAllowance.mockResolvedValue(new BigNumber(50));

      const proc = procedureMockUtils.getInstance<
        TransferFundsParams,
        Instruction | undefined,
        Storage
      >(mockContext, {
        fromHolder: fromAccountHolder,
        toHolder: toPortfolioHolder,
        fromDid: 'someDid',
        toDid: 'someDid',
        signingDid: 'otherDid',
        signingAccount: 'someOtherAccount',
      });

      await expect(
        prepareTransferFunds.call(proc, {
          from: fromAccountHolder,
          to: toPortfolioHolder,
          asset,
          amount: new BigNumber(100),
        })
      ).rejects.toThrow('Spender has insufficient allowance to cover the transfer');
    });

    it('should require an allowance check whenever the signing Account differs from the source Account, even when both belong to the same DID', async () => {
      const asset = entityMockUtils.getFungibleAssetInstance({ ticker: 'TICKER' });
      asset.getAllowance.mockResolvedValue(new BigNumber(50));

      const proc = procedureMockUtils.getInstance<
        TransferFundsParams,
        Instruction | undefined,
        Storage
      >(mockContext, {
        fromHolder: fromAccountHolder,
        toHolder: toPortfolioHolder,
        fromDid: 'someDid',
        toDid: 'someDid',
        // same DID as fromAccountHolder's, but a different signing key
        signingDid: 'someDid',
        signingAccount: 'someOtherAccount',
      });

      await expect(
        prepareTransferFunds.call(proc, {
          from: fromAccountHolder,
          to: toPortfolioHolder,
          asset,
          amount: new BigNumber(100),
        })
      ).rejects.toThrow('Spender has insufficient allowance to cover the transfer');
    });

    it('should still check the source balance even when a sufficient allowance is granted', async () => {
      const asset = entityMockUtils.getFungibleAssetInstance({ ticker: 'TICKER' });
      asset.getAllowance.mockResolvedValue(new BigNumber(150));
      fromAccountHolder.getAssetBalances.mockResolvedValue([
        { free: new BigNumber(50) } as PortfolioBalance,
      ]);

      const proc = procedureMockUtils.getInstance<
        TransferFundsParams,
        Instruction | undefined,
        Storage
      >(mockContext, {
        fromHolder: fromAccountHolder,
        toHolder: toPortfolioHolder,
        fromDid: 'someDid',
        toDid: 'someDid',
        signingDid: 'otherDid',
        signingAccount: 'someOtherAccount',
      });

      await expect(
        prepareTransferFunds.call(proc, {
          from: fromAccountHolder,
          to: toPortfolioHolder,
          asset,
          amount: new BigNumber(100),
        })
      ).rejects.toThrow('Sender has insufficient balance to cover the transfer');
    });

    it('should throw an error if a non-owning Account tries to transfer NFTs', async () => {
      const assetId = '12341234-1234-1234-1234-123412341234';
      const asset = entityMockUtils.getNftCollectionInstance({ assetId });

      const proc = procedureMockUtils.getInstance<
        TransferFundsParams,
        Instruction | undefined,
        Storage
      >(mockContext, {
        fromHolder: fromAccountHolder,
        toHolder: toPortfolioHolder,
        fromDid: 'someDid',
        toDid: 'someDid',
        signingDid: 'otherDid',
        signingAccount: 'someOtherAccount',
      });

      await expect(
        prepareTransferFunds.call(proc, {
          from: fromAccountHolder,
          to: toPortfolioHolder,
          asset,
          nfts: [new BigNumber(1)],
        })
      ).rejects.toThrow(
        'Only the owning key can transfer NFTs from an Account. Allowances do not apply to NFTs'
      );
    });

    it('should throw an error if an NFT is not owned by the sender or is locked', async () => {
      const assetId = '12341234-1234-1234-1234-123412341234';
      const asset = entityMockUtils.getNftCollectionInstance({ assetId });

      asAssetIdSpy.mockResolvedValue(assetId);
      getOwnerSpy.mockResolvedValue(null);

      const proc = procedureMockUtils.getInstance<
        TransferFundsParams,
        Instruction | undefined,
        Storage
      >(mockContext, {
        fromHolder: fromPortfolioHolder,
        toHolder: toPortfolioHolder,
        fromDid: 'someDid',
        toDid: 'someDid',
        signingDid: 'someDid',
        signingAccount: 'someAccount',
      });

      await expect(
        prepareTransferFunds.call(proc, {
          from: fromPortfolioHolder,
          to: toPortfolioHolder,
          asset,
          nfts: [new BigNumber(1)],
        })
      ).rejects.toThrow(
        'Some of the NFTs are not owned by the sender, are locked, or do not exist'
      );
    });

    it('should throw an error if an owned NFT is locked', async () => {
      const assetId = '12341234-1234-1234-1234-123412341234';
      const asset = entityMockUtils.getNftCollectionInstance({ assetId });

      asAssetIdSpy.mockResolvedValue(assetId);
      getOwnerSpy.mockResolvedValue(fromPortfolioHolder as unknown as AssetHolder);
      isLockedSpy.mockResolvedValue(true);
      fromPortfolioHolder.isEqual.mockImplementation(other => other === fromPortfolioHolder);

      const proc = procedureMockUtils.getInstance<
        TransferFundsParams,
        Instruction | undefined,
        Storage
      >(mockContext, {
        fromHolder: fromPortfolioHolder,
        toHolder: toPortfolioHolder,
        fromDid: 'someDid',
        toDid: 'someDid',
        signingDid: 'someDid',
        signingAccount: 'someAccount',
      });

      await expect(
        prepareTransferFunds.call(proc, {
          from: fromPortfolioHolder,
          to: toPortfolioHolder,
          asset,
          nfts: [new BigNumber(1)],
        })
      ).rejects.toThrow(
        'Some of the NFTs are not owned by the sender, are locked, or do not exist'
      );
    });

    it('should recognize a MultiSig as the NFT owner by address, even though `getOwner` always resolves Account holders to a plain Account', async () => {
      const assetId = '12341234-1234-1234-1234-123412341234';
      const asset = entityMockUtils.getNftCollectionInstance({ assetId });
      const multiSigHolder = entityMockUtils.getMultiSigInstance({ address: 'multiSigAddress' });
      multiSigHolder.isEqual.mockReturnValue(false);
      // `Nft.getOwner` always resolves Account-type holders to a plain `Account`, never the
      // `MultiSig` subclass, so its `isEqual` would (correctly, matching real behavior) report
      // no match against the MultiSig instance -- the ownership check must fall back to
      // comparing addresses instead of relying on `isEqual` for this pairing
      const plainAccountOwner = entityMockUtils.getAccountInstance({ address: 'multiSigAddress' });
      plainAccountOwner.isEqual.mockReturnValue(false);

      asAssetIdSpy.mockResolvedValue(assetId);
      getOwnerSpy.mockResolvedValue(plainAccountOwner as unknown as AssetHolder);
      isLockedSpy.mockResolvedValue(false);

      nftMovementToPortfolioFundSpy.mockResolvedValue('rawNftFund');
      assetHolderLikeToAssetHolderIdSpy.mockReturnValue('someHolderId');
      assetHolderIdToMeshAssetHolderSpy.mockReturnValue('rawHolder');
      createAddInstructionResolverSpy.mockReturnValue(() => []);

      const proc = procedureMockUtils.getInstance<
        TransferFundsParams,
        Instruction | undefined,
        Storage
      >(mockContext, {
        fromHolder: multiSigHolder,
        toHolder: toPortfolioHolder,
        fromDid: 'someDid',
        toDid: 'someDid',
        signingDid: 'someDid',
        signingAccount: multiSigHolder.address,
      });

      const transaction = dsMockUtils.createTxMock('settlement', 'transferFunds');

      const result = await prepareTransferFunds.call(proc, {
        from: multiSigHolder,
        to: toPortfolioHolder,
        asset,
        nfts: [new BigNumber(1)],
      });

      expect(result.transaction).toBe(transaction);
    });

    it('should return a transfer funds transaction spec when fromHolder is an Account with sufficient allowance', async () => {
      const asset = entityMockUtils.getFungibleAssetInstance({ ticker: 'TICKER' });
      asset.getAllowance.mockResolvedValue(new BigNumber(150));
      fromAccountHolder.getAssetBalances.mockResolvedValue([
        { free: new BigNumber(150) } as PortfolioBalance,
      ]);

      fungibleMovementToPortfolioFundSpy.mockResolvedValue('rawFund');
      const instruction = { id: new BigNumber(1) } as Instruction;
      createAddInstructionResolverSpy.mockReturnValue(() => [instruction]);

      const proc = procedureMockUtils.getInstance<
        TransferFundsParams,
        Instruction | undefined,
        Storage
      >(mockContext, {
        fromHolder: fromAccountHolder,
        toHolder: toPortfolioHolder,
        fromDid: 'someDid',
        toDid: 'someDid',
        signingDid: 'otherDid',
        signingAccount: 'someOtherAccount',
      });

      const transaction = dsMockUtils.createTxMock('settlement', 'transferFunds');

      const result = await prepareTransferFunds.call(proc, {
        from: fromAccountHolder,
        to: toPortfolioHolder,
        asset,
        amount: new BigNumber(100),
      });

      expect(result.transaction).toBe(transaction);
      expect(result.args).toEqual(['someMeshAssetHolder', 'someMeshAssetHolder', 'rawFund']);
      await expect(callResolver(result.resolver)).resolves.toBe(instruction);
      expect(createAddInstructionResolverSpy).toHaveBeenCalledWith(mockContext, true);
    });

    it('should return a transfer funds transaction spec for fungible assets', async () => {
      const asset = entityMockUtils.getFungibleAssetInstance({ ticker: 'TICKER' });

      fromPortfolioHolder.getAssetBalances.mockResolvedValue([
        { free: new BigNumber(150) } as PortfolioBalance,
      ]);

      fungibleMovementToPortfolioFundSpy.mockResolvedValue('rawFund');
      assetHolderLikeToAssetHolderIdSpy.mockReturnValue('someHolderId');
      assetHolderIdToMeshAssetHolderSpy.mockReturnValue('rawHolder');
      createAddInstructionResolverSpy.mockReturnValue(() => []);

      const proc = procedureMockUtils.getInstance<
        TransferFundsParams,
        Instruction | undefined,
        Storage
      >(mockContext, {
        fromHolder: fromPortfolioHolder,
        toHolder: toPortfolioHolder,
        fromDid: 'someDid',
        toDid: 'someDid',
        signingDid: 'someDid',
        signingAccount: 'someAccount',
      });

      const transaction = dsMockUtils.createTxMock('settlement', 'transferFunds');

      const result = await prepareTransferFunds.call(proc, {
        from: fromPortfolioHolder,
        to: toPortfolioHolder,
        asset,
        amount: new BigNumber(100),
      });

      expect(result.transaction).toBe(transaction);
      expect(result.args).toEqual(['rawHolder', 'rawHolder', 'rawFund']);
      await expect(callResolver(result.resolver)).resolves.toBeUndefined();
    });

    it('should return a transfer funds transaction spec for NFT assets', async () => {
      const assetId = '12341234-1234-1234-1234-123412341234';
      const asset = entityMockUtils.getNftCollectionInstance({ assetId });

      asAssetIdSpy.mockResolvedValue(assetId);
      getOwnerSpy.mockResolvedValue(fromPortfolioHolder as unknown as AssetHolder);
      isLockedSpy.mockResolvedValue(false);
      // isEqual is also used for the "same holder" guard against toHolder, so only report
      // equality when compared against itself (the NFT ownership check)
      fromPortfolioHolder.isEqual.mockImplementation(other => other === fromPortfolioHolder);

      nftMovementToPortfolioFundSpy.mockResolvedValue('rawNftFund');
      assetHolderLikeToAssetHolderIdSpy.mockReturnValue('someHolderId');
      assetHolderIdToMeshAssetHolderSpy.mockReturnValue('rawHolder');
      createAddInstructionResolverSpy.mockReturnValue(() => []);

      const proc = procedureMockUtils.getInstance<
        TransferFundsParams,
        Instruction | undefined,
        Storage
      >(mockContext, {
        fromHolder: fromPortfolioHolder,
        toHolder: toPortfolioHolder,
        fromDid: 'someDid',
        toDid: 'someDid',
        signingDid: 'someDid',
        signingAccount: 'someAccount',
      });

      const transaction = dsMockUtils.createTxMock('settlement', 'transferFunds');

      const result = await prepareTransferFunds.call(proc, {
        from: fromPortfolioHolder,
        to: toPortfolioHolder,
        asset,
        nfts: [new BigNumber(1)],
      });

      expect(result.transaction).toBe(transaction);
      expect(result.args).toEqual(['rawHolder', 'rawHolder', 'rawNftFund']);
    });

    it('should return a transfer funds transaction spec for a cross-DID portfolio transfer, leaving the instruction pending', async () => {
      const asset = entityMockUtils.getFungibleAssetInstance({ ticker: 'TICKER' });

      fromPortfolioHolder.getAssetBalances.mockResolvedValue([
        { free: new BigNumber(150) } as PortfolioBalance,
      ]);

      fungibleMovementToPortfolioFundSpy.mockResolvedValue('rawFund');
      assetHolderLikeToAssetHolderIdSpy.mockReturnValue('someHolderId');
      assetHolderIdToMeshAssetHolderSpy.mockReturnValue('rawHolder');
      const instruction = { id: new BigNumber(1) } as Instruction;
      createAddInstructionResolverSpy.mockReturnValue(() => [instruction]);

      const proc = procedureMockUtils.getInstance<
        TransferFundsParams,
        Instruction | undefined,
        Storage
      >(mockContext, {
        fromHolder: fromPortfolioHolder,
        toHolder: toPortfolioHolder,
        fromDid: 'someDid',
        toDid: 'otherDid',
        signingDid: 'someDid',
        signingAccount: 'someAccount',
      });

      const transaction = dsMockUtils.createTxMock('settlement', 'transferFunds');

      const result = await prepareTransferFunds.call(proc, {
        from: fromPortfolioHolder,
        to: toPortfolioHolder,
        asset,
        amount: new BigNumber(100),
      });

      expect(result.transaction).toBe(transaction);
      expect(result.args).toEqual(['rawHolder', 'rawHolder', 'rawFund']);
      await expect(callResolver(result.resolver)).resolves.toBe(instruction);
    });

    it('should resolve to undefined when a cross-DID instruction is created but also executed inline', async () => {
      // `InstructionCreated` fires whether or not the instruction also settles within the same
      // transaction (e.g. the caller is also the receiver and both sides end up affirmed) - only
      // `SettlementManuallyExecuted` distinguishes an already-settled instruction from a pending one
      const asset = entityMockUtils.getFungibleAssetInstance({ ticker: 'TICKER' });

      fromPortfolioHolder.getAssetBalances.mockResolvedValue([
        { free: new BigNumber(150) } as PortfolioBalance,
      ]);

      fungibleMovementToPortfolioFundSpy.mockResolvedValue('rawFund');
      assetHolderLikeToAssetHolderIdSpy.mockReturnValue('someHolderId');
      assetHolderIdToMeshAssetHolderSpy.mockReturnValue('rawHolder');
      const instruction = { id: new BigNumber(1) } as Instruction;
      createAddInstructionResolverSpy.mockReturnValue(() => [instruction]);
      filterEventRecordsSpy.mockReturnValue([
        dsMockUtils.createMockIEvent(['someDid', dsMockUtils.createMockU64(new BigNumber(1))]),
      ]);

      const proc = procedureMockUtils.getInstance<
        TransferFundsParams,
        Instruction | undefined,
        Storage
      >(mockContext, {
        fromHolder: fromPortfolioHolder,
        toHolder: toPortfolioHolder,
        fromDid: 'someDid',
        toDid: 'otherDid',
        signingDid: 'someDid',
        signingAccount: 'someAccount',
      });

      dsMockUtils.createTxMock('settlement', 'transferFunds');

      const result = await prepareTransferFunds.call(proc, {
        from: fromPortfolioHolder,
        to: toPortfolioHolder,
        asset,
        amount: new BigNumber(100),
      });

      await expect(callResolver(result.resolver)).resolves.toBeUndefined();
      expect(filterEventRecordsSpy).toHaveBeenCalledWith(
        expect.anything(),
        'settlement',
        'SettlementManuallyExecuted',
        true
      );
    });

    it('should resolve the Asset before checking the allowance when an Asset ID is passed', async () => {
      const asset = entityMockUtils.getFungibleAssetInstance({ ticker: 'TICKER' });
      asset.getAllowance.mockResolvedValue(new BigNumber(50));
      asFungibleAssetSpy.mockResolvedValue(asset);

      const proc = procedureMockUtils.getInstance<
        TransferFundsParams,
        Instruction | undefined,
        Storage
      >(mockContext, {
        fromHolder: fromAccountHolder,
        toHolder: toPortfolioHolder,
        fromDid: 'someDid',
        toDid: 'someDid',
        signingDid: 'otherDid',
        signingAccount: 'someOtherAccount',
      });

      await expect(
        prepareTransferFunds.call(proc, {
          from: fromAccountHolder,
          to: toPortfolioHolder,
          asset: '12341234-1234-1234-1234-123412341234',
          amount: new BigNumber(100),
        })
      ).rejects.toThrow('Spender has insufficient allowance to cover the transfer');

      expect(asFungibleAssetSpy).toHaveBeenCalledWith(
        '12341234-1234-1234-1234-123412341234',
        mockContext
      );
    });

    it('should pass the memo to the fund for a fungible leg', async () => {
      const asset = entityMockUtils.getFungibleAssetInstance({ ticker: 'TICKER' });

      fromPortfolioHolder.getAssetBalances.mockResolvedValue([
        { free: new BigNumber(150) } as PortfolioBalance,
      ]);

      fungibleMovementToPortfolioFundSpy.mockResolvedValue('rawFund');
      createAddInstructionResolverSpy.mockReturnValue(() => []);

      const proc = procedureMockUtils.getInstance<
        TransferFundsParams,
        Instruction | undefined,
        Storage
      >(mockContext, {
        fromHolder: fromPortfolioHolder,
        toHolder: toPortfolioHolder,
        fromDid: 'someDid',
        toDid: 'someDid',
        signingDid: 'someDid',
        signingAccount: 'someAccount',
      });

      dsMockUtils.createTxMock('settlement', 'transferFunds');

      const amount = new BigNumber(100);

      await prepareTransferFunds.call(proc, {
        from: fromPortfolioHolder,
        to: toPortfolioHolder,
        asset,
        amount,
        memo: 'someMemo',
      });

      expect(fungibleMovementToPortfolioFundSpy).toHaveBeenCalledWith(
        { asset, amount, memo: 'someMemo' },
        mockContext
      );
    });

    it('should pass the memo to the fund for an NFT leg', async () => {
      const assetId = '12341234-1234-1234-1234-123412341234';
      const asset = entityMockUtils.getNftCollectionInstance({ assetId });
      const nfts = [new BigNumber(1)];

      asAssetIdSpy.mockResolvedValue(assetId);
      getOwnerSpy.mockResolvedValue(fromPortfolioHolder as unknown as AssetHolder);
      isLockedSpy.mockResolvedValue(false);
      fromPortfolioHolder.isEqual.mockImplementation(other => other === fromPortfolioHolder);

      nftMovementToPortfolioFundSpy.mockResolvedValue('rawNftFund');
      createAddInstructionResolverSpy.mockReturnValue(() => []);

      const proc = procedureMockUtils.getInstance<
        TransferFundsParams,
        Instruction | undefined,
        Storage
      >(mockContext, {
        fromHolder: fromPortfolioHolder,
        toHolder: toPortfolioHolder,
        fromDid: 'someDid',
        toDid: 'someDid',
        signingDid: 'someDid',
        signingAccount: 'someAccount',
      });

      dsMockUtils.createTxMock('settlement', 'transferFunds');

      await prepareTransferFunds.call(proc, {
        from: fromPortfolioHolder,
        to: toPortfolioHolder,
        asset,
        nfts,
        memo: 'someMemo',
      });

      expect(nftMovementToPortfolioFundSpy).toHaveBeenCalledWith(
        { asset, nfts, memo: 'someMemo' },
        mockContext
      );
    });
  });

  describe('prepareStorage', () => {
    it('should return the necessary storage', async () => {
      const from = entityMockUtils.getNumberedPortfolioInstance({
        did: 'someDid',
        id: new BigNumber(1),
      });
      const to = entityMockUtils.getNumberedPortfolioInstance({
        did: 'otherDid',
        id: new BigNumber(2),
      });

      assetHolderLikeToAssetHolderSpy.mockReturnValueOnce(from).mockReturnValueOnce(to);
      getAssetHolderDidSpy.mockReset();
      getAssetHolderDidSpy.mockResolvedValueOnce('someDid').mockResolvedValueOnce('otherDid');

      const proc = procedureMockUtils.getInstance<
        TransferFundsParams,
        Instruction | undefined,
        Storage
      >(mockContext);

      const result = await prepareStorage.call(proc, {
        from,
        to,
        asset: 'SOME_ASSET',
        amount: new BigNumber(100),
      });

      expect(result).toEqual({
        fromHolder: from,
        toHolder: to,
        fromDid: 'someDid',
        toDid: 'otherDid',
        signingDid: 'someDid',
        signingAccount: mockContext.getSigningAccount().address,
      });
    });

    it('should key off the acting Account and its Identity when signing through a MultiSig', async () => {
      // a MultiSig proposal is dispatched with the MultiSig as the origin, so the chain sees the
      // MultiSig's Identity, not the Identity of the key that signs the proposal
      const from = entityMockUtils.getNumberedPortfolioInstance({
        did: 'multiSigDid',
        id: new BigNumber(1),
      });
      const to = entityMockUtils.getNumberedPortfolioInstance({
        did: 'someDid',
        id: new BigNumber(2),
      });

      assetHolderLikeToAssetHolderSpy.mockReturnValueOnce(from).mockReturnValueOnce(to);
      getAssetHolderDidSpy.mockReset();
      getAssetHolderDidSpy.mockResolvedValueOnce('multiSigDid').mockResolvedValueOnce('someDid');

      const multiSigAccount = entityMockUtils.getAccountInstance({
        address: 'multiSigAddress',
        getIdentity: entityMockUtils.getIdentityInstance({ did: 'multiSigDid' }),
      });
      mockContext.getActingAccount.mockResolvedValue(multiSigAccount);

      const proc = procedureMockUtils.getInstance<
        TransferFundsParams,
        Instruction | undefined,
        Storage
      >(mockContext);

      const result = await prepareStorage.call(proc, {
        from,
        to,
        asset: 'SOME_ASSET',
        amount: new BigNumber(100),
      });

      expect(result).toEqual({
        fromHolder: from,
        toHolder: to,
        fromDid: 'multiSigDid',
        toDid: 'someDid',
        signingDid: 'multiSigDid',
        signingAccount: 'multiSigAddress',
      });
    });

    it('should throw an error if the acting Account has no associated Identity', async () => {
      const from = entityMockUtils.getNumberedPortfolioInstance({
        did: 'someDid',
        id: new BigNumber(1),
      });
      const to = entityMockUtils.getNumberedPortfolioInstance({
        did: 'someDid',
        id: new BigNumber(2),
      });

      assetHolderLikeToAssetHolderSpy.mockReturnValueOnce(from).mockReturnValueOnce(to);

      const actingAccount = entityMockUtils.getAccountInstance({
        address: 'someAddress',
        getIdentity: null,
      });
      mockContext.getActingAccount.mockResolvedValue(actingAccount);

      const proc = procedureMockUtils.getInstance<
        TransferFundsParams,
        Instruction | undefined,
        Storage
      >(mockContext);

      await expect(
        prepareStorage.call(proc, {
          from,
          to,
          asset: 'SOME_ASSET',
          amount: new BigNumber(100),
        })
      ).rejects.toThrow('The acting Account does not have an associated Identity');
    });
  });

  describe('getAuthorization', () => {
    let fromPortfolioHolder: Mocked<NumberedPortfolio>;
    let toPortfolioHolder: Mocked<NumberedPortfolio>;

    beforeEach(() => {
      fromPortfolioHolder = entityMockUtils.getNumberedPortfolioInstance({
        did: 'someDid',
        id: new BigNumber(1),
        isCustodiedBy: true,
      });
      toPortfolioHolder = entityMockUtils.getNumberedPortfolioInstance({
        did: 'someDid',
        id: new BigNumber(2),
        isCustodiedBy: true,
      });

      asAssetIdSpy.mockClear();
      asAssetIdSpy.mockResolvedValue('12341234-1234-1234-1234-123412341234');
    });

    it('should require the source Portfolio permission and custody, without the destination', async () => {
      const proc = procedureMockUtils.getInstance<
        TransferFundsParams,
        Instruction | undefined,
        Storage
      >(mockContext, {
        fromHolder: fromPortfolioHolder,
        toHolder: toPortfolioHolder,
        fromDid: 'someDid',
        toDid: 'someDid',
        signingDid: 'someDid',
        signingAccount: 'someAccount',
      });

      const boundFunc = getAuthorization.bind(proc);

      await expect(boundFunc()).resolves.toEqual({
        roles: true,
        permissions: {
          transactions: [TxTags.settlement.TransferFunds],
          portfolios: [fromPortfolioHolder],
          assets: [],
        },
      });

      // the destination is never a hard requirement, so its affirmation requirement doesn't
      // need to be fetched
      expect(asAssetIdSpy).not.toHaveBeenCalled();
    });

    it('should return a failure message if the signing Identity is not the custodian of the source Portfolio', async () => {
      fromPortfolioHolder.isCustodiedBy.mockResolvedValue(false);

      const proc = procedureMockUtils.getInstance<
        TransferFundsParams,
        Instruction | undefined,
        Storage
      >(mockContext, {
        fromHolder: fromPortfolioHolder,
        toHolder: toPortfolioHolder,
        fromDid: 'someDid',
        toDid: 'someDid',
        signingDid: 'someDid',
        signingAccount: 'someAccount',
      });

      const boundFunc = getAuthorization.bind(proc);

      await expect(boundFunc()).resolves.toEqual({
        roles: 'The signing Identity must be the custodian of the origin Portfolio',
        permissions: {
          transactions: [TxTags.settlement.TransferFunds],
          portfolios: [fromPortfolioHolder],
          assets: [],
        },
      });

      expect(fromPortfolioHolder.isCustodiedBy).toHaveBeenCalledWith({ identity: 'someDid' });
    });

    it('should not require custody when the source is an Account', async () => {
      const fromHolder = entityMockUtils.getAccountInstance({ address: 'someAccount' });

      const proc = procedureMockUtils.getInstance<
        TransferFundsParams,
        Instruction | undefined,
        Storage
      >(mockContext, {
        fromHolder,
        toHolder: toPortfolioHolder,
        fromDid: 'someDid',
        toDid: 'someDid',
        signingDid: 'someDid',
        signingAccount: 'someAccount',
      });

      const boundFunc = getAuthorization.bind(proc);

      await expect(boundFunc()).resolves.toEqual({
        permissions: {
          transactions: [TxTags.settlement.TransferFunds],
          portfolios: [],
          assets: [],
        },
      });
    });

    it('should exclude a destination owned by a different Identity than the signer', async () => {
      const toHolder = entityMockUtils.getNumberedPortfolioInstance({
        did: 'otherDid',
        id: new BigNumber(2),
      });

      const proc = procedureMockUtils.getInstance<
        TransferFundsParams,
        Instruction | undefined,
        Storage
      >(mockContext, {
        fromHolder: fromPortfolioHolder,
        toHolder,
        fromDid: 'someDid',
        toDid: 'otherDid',
        signingDid: 'someDid',
        signingAccount: 'someAccount',
      });

      const boundFunc = getAuthorization.bind(proc);

      await expect(boundFunc()).resolves.toEqual({
        roles: true,
        permissions: {
          transactions: [TxTags.settlement.TransferFunds],
          portfolios: [fromPortfolioHolder],
          assets: [],
        },
      });
    });

    it("should exclude a cross-DID destination owned by the signer's Identity, even when the receiver has to affirm", async () => {
      const fromHolder = entityMockUtils.getNumberedPortfolioInstance({
        did: 'otherDid',
        id: new BigNumber(1),
        isCustodiedBy: true,
      });

      // the chain affirms the destination opportunistically on this path — it skips that
      // affirmation and leaves the Instruction pending rather than rejecting the transfer, so
      // the destination must not be demanded here
      const proc = procedureMockUtils.getInstance<
        TransferFundsParams,
        Instruction | undefined,
        Storage
      >(mockContext, {
        fromHolder,
        toHolder: toPortfolioHolder,
        fromDid: 'otherDid',
        toDid: 'someDid',
        signingDid: 'someDid',
        signingAccount: 'someAccount',
      });

      const boundFunc = getAuthorization.bind(proc);

      await expect(boundFunc()).resolves.toEqual({
        roles: true,
        permissions: {
          transactions: [TxTags.settlement.TransferFunds],
          portfolios: [fromHolder],
          assets: [],
        },
      });
    });

    it('should exclude an Account destination from the Portfolio permissions', async () => {
      const fromHolder = entityMockUtils.getNumberedPortfolioInstance({
        did: 'otherDid',
        id: new BigNumber(1),
        isCustodiedBy: true,
      });
      const toHolder = entityMockUtils.getAccountInstance({ address: 'someAccount' });

      const proc = procedureMockUtils.getInstance<
        TransferFundsParams,
        Instruction | undefined,
        Storage
      >(mockContext, {
        fromHolder,
        toHolder,
        fromDid: 'otherDid',
        toDid: 'someDid',
        signingDid: 'someDid',
        signingAccount: 'someAccount',
      });

      const boundFunc = getAuthorization.bind(proc);

      await expect(boundFunc()).resolves.toEqual({
        roles: true,
        permissions: {
          transactions: [TxTags.settlement.TransferFunds],
          portfolios: [fromHolder],
          assets: [],
        },
      });
    });
  });
});
