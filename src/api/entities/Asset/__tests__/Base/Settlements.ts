import { AccountId, Balance, DispatchError } from '@polkadot/types/interfaces';
import {
  PolymeshPrimitivesAssetAssetHolder,
  PolymeshPrimitivesAssetAssetId,
  PolymeshPrimitivesIdentityId,
} from '@polkadot/types/lookup';
import { Result, Vec } from '@polkadot/types-codec';
import {
  ComplianceReport,
  TransferCondition,
} from '@polymeshassociation/polymesh-types/polkadot/polymesh';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import { FungibleSettlements, NonFungibleSettlements } from '~/api/entities/Asset/Base/Settlements';
import * as proceduresUtilsModule from '~/api/procedures/utils';
import { Context, Namespace, PolymeshError, PolymeshTransaction } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { ErrorCode, FungibleAsset, NftCollection, PortfolioId, TransferBreakdown } from '~/types';
import { uuidToHex } from '~/utils';
import { DUMMY_ACCOUNT_ID } from '~/utils/constants';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/base/Procedure',
  require('~/testUtils/mocks/procedure').mockProcedureModule('~/base/Procedure')
);

describe('Settlements class', () => {
  let mockContext: Mocked<Context>;
  let mockAsset: Mocked<FungibleAsset>;
  let stringToAccountIdSpy: jest.SpyInstance<AccountId, [string, Context]>;
  let stringToAssetIdSpy: jest.SpyInstance<PolymeshPrimitivesAssetAssetId, [string, Context]>;
  let bigNumberToBalanceSpy: jest.SpyInstance;
  let assetHolderIdToMeshAssetHolderSpy: jest.SpyInstance;
  let assetHolderLikeToAssetHolderIdSpy: jest.SpyInstance;
  let stringToIdentityIdSpy: jest.SpyInstance<PolymeshPrimitivesIdentityId, [string, Context]>;
  let getAssetHolderDidSpy: jest.SpyInstance;
  let rawAccountId: AccountId;
  let rawAssetId: PolymeshPrimitivesAssetAssetId;
  let rawToDid: PolymeshPrimitivesIdentityId;
  let rawAmount: Balance;
  let amount: BigNumber;
  let toDid: string;
  let assetId: string;
  let fromDid: string;
  let fromPortfolioHolderId: PortfolioId;
  let toPortfolioHolderId: PortfolioId;
  let rawFromPortfolioHolder: PolymeshPrimitivesAssetAssetHolder;
  let rawToPortfolioHolder: PolymeshPrimitivesAssetAssetHolder;
  let rawFromDid: PolymeshPrimitivesIdentityId;
  let fromPortfolio: entityMockUtils.MockDefaultPortfolio;
  let toPortfolio: entityMockUtils.MockDefaultPortfolio;
  let transferReportToTransferBreakdownSpy: jest.SpyInstance;

  beforeAll(() => {
    entityMockUtils.initMocks();
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();

    toDid = 'toDid';
    amount = new BigNumber(100);
    stringToAccountIdSpy = jest.spyOn(utilsConversionModule, 'stringToAccountId');
    stringToAssetIdSpy = jest.spyOn(utilsConversionModule, 'stringToAssetId');
    bigNumberToBalanceSpy = jest.spyOn(utilsConversionModule, 'bigNumberToBalance');
    assetHolderIdToMeshAssetHolderSpy = jest.spyOn(
      utilsConversionModule,
      'assetHolderIdToMeshAssetHolder'
    );
    assetHolderLikeToAssetHolderIdSpy = jest.spyOn(
      utilsConversionModule,
      'assetHolderLikeToAssetHolderId'
    );
    stringToIdentityIdSpy = jest.spyOn(utilsConversionModule, 'stringToIdentityId');
    rawAmount = dsMockUtils.createMockBalance(amount);
    fromDid = 'fromDid';
    fromPortfolioHolderId = { did: fromDid };
    toPortfolioHolderId = { did: toDid };
    rawFromDid = dsMockUtils.createMockIdentityId(fromDid);
    rawFromPortfolioHolder = dsMockUtils.createMockAssetHolder({
      Portfolio: dsMockUtils.createMockPortfolioId({ did: fromDid, kind: 'Default' }),
    });
    rawToPortfolioHolder = dsMockUtils.createMockAssetHolder({
      Portfolio: dsMockUtils.createMockPortfolioId({ did: toDid, kind: 'Default' }),
    });
    transferReportToTransferBreakdownSpy = jest.spyOn(
      utilsConversionModule,
      'transferReportToTransferBreakdown'
    );
    getAssetHolderDidSpy = jest.spyOn(proceduresUtilsModule, 'getAssetHolderDid');
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    mockAsset = entityMockUtils.getFungibleAssetInstance();

    assetId = mockAsset.id;
    rawAccountId = dsMockUtils.createMockAccountId(DUMMY_ACCOUNT_ID);
    rawAssetId = dsMockUtils.createMockAssetId(uuidToHex(assetId));
    rawToDid = dsMockUtils.createMockIdentityId(toDid);
    toPortfolio = entityMockUtils.getDefaultPortfolioInstance({
      ...toPortfolioHolderId,
      getCustodian: entityMockUtils.getIdentityInstance({ did: toPortfolioHolderId.did }),
    });
    fromPortfolio = entityMockUtils.getDefaultPortfolioInstance({
      ...fromPortfolioHolderId,
      getCustodian: entityMockUtils.getIdentityInstance({ did: fromPortfolioHolderId.did }),
    });
    when(assetHolderLikeToAssetHolderIdSpy).calledWith(toDid).mockReturnValue(toPortfolioHolderId);
    when(assetHolderLikeToAssetHolderIdSpy)
      .calledWith(fromDid)
      .mockReturnValue(fromPortfolioHolderId);
    when(assetHolderIdToMeshAssetHolderSpy)
      .calledWith(toPortfolioHolderId, mockContext)
      .mockReturnValue(rawToPortfolioHolder);
    when(stringToIdentityIdSpy).calledWith(fromDid, mockContext).mockReturnValue(rawFromDid);
    when(stringToAccountIdSpy)
      .calledWith(DUMMY_ACCOUNT_ID, mockContext)
      .mockReturnValue(rawAccountId);
    when(stringToAssetIdSpy).calledWith(assetId, mockContext).mockReturnValue(rawAssetId);
    when(stringToIdentityIdSpy).calledWith(toDid, mockContext).mockReturnValue(rawToDid);
    when(bigNumberToBalanceSpy).calledWith(amount, mockContext, false).mockReturnValue(rawAmount);
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

  describe('FungibleSettlements', () => {
    let settlements: FungibleSettlements;

    beforeEach(() => {
      settlements = new FungibleSettlements(mockAsset, mockContext);
    });

    it('should extend namespace', () => {
      expect(FungibleSettlements.prototype instanceof Namespace).toBe(true);
    });

    describe('method: canTransfer', () => {
      it('should return a transfer breakdown representing whether the transaction can be made from the signing Identity', async () => {
        const signingIdentity = await mockContext.getSigningIdentity();
        const { did: signingDid } = signingIdentity;
        const rawSigningDid = dsMockUtils.createMockIdentityId(signingDid);

        const currentDefaultPortfolioId = { did: signingDid };

        when(stringToIdentityIdSpy)
          .calledWith(signingDid, mockContext)
          .mockReturnValue(rawSigningDid);
        when(assetHolderLikeToAssetHolderIdSpy)
          .calledWith(signingIdentity)
          .mockReturnValue(currentDefaultPortfolioId);
        when(assetHolderIdToMeshAssetHolderSpy)
          .calledWith(currentDefaultPortfolioId, mockContext)
          .mockReturnValue(rawFromPortfolioHolder);

        const transferReportResponse = 'transferReportResponse' as unknown as Vec<DispatchError>;

        dsMockUtils
          .createCallMock('assetApi', 'transferReport')
          .mockReturnValue(transferReportResponse);

        const complianceReportResponse = 'complianceReportResponse' as unknown as Result<
          ComplianceReport,
          DispatchError
        >;

        dsMockUtils
          .createCallMock('complianceApi', 'complianceReport')
          .mockReturnValue(complianceReportResponse);

        const statsReportResponse = 'statsReportResponse' as unknown as Result<
          Vec<TransferCondition>,
          DispatchError
        >;
        dsMockUtils
          .createCallMock('statisticsApi', 'transferRestrictionsReport')
          .mockReturnValue(statsReportResponse);

        const expected = 'breakdown' as unknown as TransferBreakdown;

        when(transferReportToTransferBreakdownSpy)
          .calledWith(
            transferReportResponse,
            undefined,
            complianceReportResponse,
            statsReportResponse,
            mockContext
          )
          .mockReturnValue(expected);

        const result = await settlements.canTransfer({ to: toDid, amount });

        expect(result).toEqual(expected);
      });

      it('should throw an error if from did is not found', async () => {
        getAssetHolderDidSpy.mockResolvedValueOnce(undefined);

        const expectedError = new PolymeshError({
          code: ErrorCode.UnmetPrerequisite,
          message: 'No DID associated with `from` account holder',
        });

        await expect(settlements.canTransfer({ from: fromDid, to: toDid, amount })).rejects.toThrow(
          expectedError
        );
      });

      it('should throw an error if to did is not found', async () => {
        getAssetHolderDidSpy.mockResolvedValueOnce('someDid').mockResolvedValueOnce(undefined);

        const expectedError = new PolymeshError({
          code: ErrorCode.UnmetPrerequisite,
          message: 'No DID associated with `to` account holder',
        });

        await expect(settlements.canTransfer({ from: fromDid, to: toDid, amount })).rejects.toThrow(
          expectedError
        );
      });
    });

    describe('method: preApproveTicker', () => {
      it('should prepare the procedure and return the resulting transaction', async () => {
        const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<void>;
        const args = { asset: mockAsset, preApprove: true };

        when(procedureMockUtils.getPrepareMock())
          .calledWith({ args, transformer: undefined }, mockContext, {})
          .mockResolvedValue(expectedTransaction);

        const tx = await settlements.preApprove();

        expect(tx).toBe(expectedTransaction);
      });
    });

    describe('method: removePreApproval', () => {
      it('should prepare the procedure and return the resulting transaction', async () => {
        const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<void>;
        const args = { asset: mockAsset, preApprove: false };

        when(procedureMockUtils.getPrepareMock())
          .calledWith({ args, transformer: undefined }, mockContext, {})
          .mockResolvedValue(expectedTransaction);

        const tx = await settlements.removePreApproval();

        expect(tx).toBe(expectedTransaction);
      });
    });
  });

  describe('NonFungibleSettlements', () => {
    let settlements: NonFungibleSettlements;
    let nftCollection: NftCollection;

    beforeEach(() => {
      nftCollection = entityMockUtils.getNftCollectionInstance();
      settlements = new NonFungibleSettlements(nftCollection, mockContext);
    });

    it('should extend namespace', () => {
      expect(NonFungibleSettlements.prototype instanceof Namespace).toBe(true);
    });

    it('should work for NftCollections', async () => {
      when(assetHolderIdToMeshAssetHolderSpy)
        .calledWith({ did: fromDid }, mockContext)
        .mockReturnValue(rawFromPortfolioHolder);

      fromPortfolio.getCustodian.mockResolvedValue(
        entityMockUtils.getIdentityInstance({ did: fromDid })
      );
      toPortfolio.getCustodian.mockResolvedValue(
        entityMockUtils.getIdentityInstance({ did: toDid })
      );

      const nftTransferReportResponse =
        'nftTransferReportResponse' as unknown as Vec<DispatchError>;
      dsMockUtils
        .createCallMock('nftApi', 'transferReport')
        .mockReturnValue(nftTransferReportResponse);

      const complianceReportResponse = 'complianceReportResponse' as unknown as Result<
        ComplianceReport,
        DispatchError
      >;

      dsMockUtils
        .createCallMock('complianceApi', 'complianceReport')
        .mockReturnValue(complianceReportResponse);

      const statsReportResponse = 'statsReportResponse' as unknown as Result<
        Vec<TransferCondition>,
        DispatchError
      >;

      dsMockUtils
        .createCallMock('statisticsApi', 'transferRestrictionsReport')
        .mockReturnValue(statsReportResponse);

      const expected = 'breakdown' as unknown as TransferBreakdown;

      when(transferReportToTransferBreakdownSpy)
        .calledWith(
          undefined,
          nftTransferReportResponse,
          complianceReportResponse,
          statsReportResponse,
          mockContext
        )
        .mockReturnValue(expected);

      const result = await settlements.canTransfer({
        from: fromDid,
        to: toDid,
        nfts: [new BigNumber(1)],
      });

      expect(result).toEqual(expected);
    });
  });
});
