import { AccountId, Balance, DispatchError } from '@polkadot/types/interfaces';
import {
  PolymeshPrimitivesIdentityIdPortfolioId,
  PolymeshPrimitivesTicker,
} from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import { FungibleSettlements, NonFungibleSettlements } from '~/api/entities/Asset/Base/Settlements';
import { Context, Namespace, PolymeshError, PolymeshTransaction } from '~/internal';
import { GranularCanTransferResult } from '~/polkadot';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { createMockCanTransferGranularReturn } from '~/testUtils/mocks/dataSources';
import { Mocked } from '~/testUtils/types';
import {
  DefaultPortfolio,
  ErrorCode,
  NftCollection,
  NumberedPortfolio,
  PortfolioId,
  PortfolioLike,
  TransferBreakdown,
} from '~/types';
import { DUMMY_ACCOUNT_ID } from '~/utils/constants';
import * as utilsConversionModule from '~/utils/conversion';

import { FungibleAsset } from '../../Fungible';

jest.mock(
  '~/base/Procedure',
  require('~/testUtils/mocks/procedure').mockProcedureModule('~/base/Procedure')
);

describe('Settlements class', () => {
  let mockContext: Mocked<Context>;
  let mockAsset: Mocked<FungibleAsset>;
  let stringToAccountIdSpy: jest.SpyInstance<AccountId, [string, Context]>;
  let stringToTickerSpy: jest.SpyInstance<PolymeshPrimitivesTicker, [string, Context]>;
  let bigNumberToBalanceSpy: jest.SpyInstance;
  let portfolioIdToMeshPortfolioIdSpy: jest.SpyInstance<
    PolymeshPrimitivesIdentityIdPortfolioId,
    [PortfolioId, Context]
  >;
  let portfolioLikeToPortfolioIdSpy: jest.SpyInstance<PortfolioId, [PortfolioLike]>;
  let portfolioIdToPortfolioSpy: jest.SpyInstance<
    DefaultPortfolio | NumberedPortfolio,
    [PortfolioId, Context]
  >;
  let rawAccountId: AccountId;
  let rawTicker: PolymeshPrimitivesTicker;
  let rawAmount: Balance;
  let amount: BigNumber;
  let toDid: string;
  let ticker: string;
  let fromDid: string;
  let fromPortfolioId: PortfolioId;
  let toPortfolioId: PortfolioId;
  let rawFromPortfolio: PolymeshPrimitivesIdentityIdPortfolioId;
  let rawToPortfolio: PolymeshPrimitivesIdentityIdPortfolioId;
  let fromPortfolio: entityMockUtils.MockDefaultPortfolio;
  let toPortfolio: entityMockUtils.MockDefaultPortfolio;
  let granularCanTransferResultToTransferBreakdownSpy: jest.SpyInstance;

  beforeAll(() => {
    entityMockUtils.initMocks();
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();

    toDid = 'toDid';
    amount = new BigNumber(100);
    stringToAccountIdSpy = jest.spyOn(utilsConversionModule, 'stringToAccountId');
    stringToTickerSpy = jest.spyOn(utilsConversionModule, 'stringToTicker');
    bigNumberToBalanceSpy = jest.spyOn(utilsConversionModule, 'bigNumberToBalance');
    portfolioIdToMeshPortfolioIdSpy = jest.spyOn(
      utilsConversionModule,
      'portfolioIdToMeshPortfolioId'
    );
    portfolioLikeToPortfolioIdSpy = jest.spyOn(utilsConversionModule, 'portfolioLikeToPortfolioId');
    portfolioIdToPortfolioSpy = jest.spyOn(utilsConversionModule, 'portfolioIdToPortfolio');
    rawAmount = dsMockUtils.createMockBalance(amount);
    fromDid = 'fromDid';
    fromPortfolioId = { did: fromDid };
    toPortfolioId = { did: toDid };
    rawFromPortfolio = dsMockUtils.createMockPortfolioId({ did: fromDid, kind: 'Default' });
    rawToPortfolio = dsMockUtils.createMockPortfolioId({ did: toDid, kind: 'Default' });
    granularCanTransferResultToTransferBreakdownSpy = jest.spyOn(
      utilsConversionModule,
      'granularCanTransferResultToTransferBreakdown'
    );
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    mockAsset = entityMockUtils.getFungibleAssetInstance();

    ticker = mockAsset.ticker;
    rawAccountId = dsMockUtils.createMockAccountId(DUMMY_ACCOUNT_ID);
    rawTicker = dsMockUtils.createMockTicker(ticker);
    toPortfolio = entityMockUtils.getDefaultPortfolioInstance({
      ...toPortfolioId,
      getCustodian: entityMockUtils.getIdentityInstance({ did: toPortfolioId.did }),
    });
    fromPortfolio = entityMockUtils.getDefaultPortfolioInstance({
      ...fromPortfolioId,
      getCustodian: entityMockUtils.getIdentityInstance({ did: fromPortfolioId.did }),
    });
    when(portfolioLikeToPortfolioIdSpy).calledWith(toDid).mockReturnValue(toPortfolioId);
    when(portfolioLikeToPortfolioIdSpy).calledWith(fromDid).mockReturnValue(fromPortfolioId);
    when(portfolioIdToMeshPortfolioIdSpy)
      .calledWith(toPortfolioId, mockContext)
      .mockReturnValue(rawToPortfolio);
    when(portfolioIdToPortfolioSpy)
      .calledWith(toPortfolioId, mockContext)
      .mockReturnValue(toPortfolio);
    when(portfolioIdToPortfolioSpy)
      .calledWith(fromPortfolioId, mockContext)
      .mockReturnValue(fromPortfolio);
    when(stringToAccountIdSpy)
      .calledWith(DUMMY_ACCOUNT_ID, mockContext)
      .mockReturnValue(rawAccountId);
    when(stringToTickerSpy).calledWith(ticker, mockContext).mockReturnValue(rawTicker);
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

        const currentDefaultPortfolioId = { did: signingDid };

        when(portfolioLikeToPortfolioIdSpy)
          .calledWith(signingIdentity)
          .mockReturnValue(currentDefaultPortfolioId);
        when(portfolioIdToMeshPortfolioIdSpy)
          .calledWith(currentDefaultPortfolioId, mockContext)
          .mockReturnValue(rawFromPortfolio);
        when(portfolioIdToPortfolioSpy)
          .calledWith(currentDefaultPortfolioId, mockContext)
          .mockReturnValue(
            entityMockUtils.getDefaultPortfolioInstance({
              did: signingDid,
              getCustodian: entityMockUtils.getIdentityInstance({ did: signingDid }),
            })
          );

        const okResponse = 'rpcResponse' as unknown as GranularCanTransferResult;
        const response = createMockCanTransferGranularReturn({
          Ok: okResponse,
        });

        when(dsMockUtils.createCallMock('assetApi', 'canTransferGranular'))
          .calledWith(signingDid, rawFromPortfolio, toDid, rawToPortfolio, rawTicker, rawAmount)
          .mockReturnValue(response);

        const expected = 'breakdown' as unknown as TransferBreakdown;

        when(granularCanTransferResultToTransferBreakdownSpy)
          .calledWith(okResponse, undefined, mockContext)
          .mockReturnValue(expected);

        const result = await settlements.canTransfer({ to: toDid, amount });

        expect(result).toEqual(expected);
      });

      it('should return a transfer breakdown representing whether the transaction can be made from another Identity', async () => {
        const okResponse = 'rpcResponse' as unknown as GranularCanTransferResult;
        const response = createMockCanTransferGranularReturn({
          Ok: okResponse,
        });

        when(portfolioIdToMeshPortfolioIdSpy)
          .calledWith({ did: fromDid }, mockContext)
          .mockReturnValue(rawFromPortfolio);

        fromPortfolio.getCustodian.mockResolvedValue(
          entityMockUtils.getIdentityInstance({ did: fromDid })
        );
        toPortfolio.getCustodian.mockResolvedValue(
          entityMockUtils.getIdentityInstance({ did: toDid })
        );
        when(dsMockUtils.createCallMock('assetApi', 'canTransferGranular'))
          .calledWith(fromDid, rawFromPortfolio, toDid, rawToPortfolio, rawTicker, rawAmount)
          .mockReturnValue(response);

        const expected = 'breakdown' as unknown as TransferBreakdown;

        when(granularCanTransferResultToTransferBreakdownSpy)
          .calledWith(okResponse, undefined, mockContext)
          .mockReturnValue(expected);

        const result = await settlements.canTransfer({ from: fromDid, to: toDid, amount });

        expect(result).toEqual(expected);
      });

      it('should error if response is Err', () => {
        const errResponse = 'unexpected error' as unknown as DispatchError;
        const response = createMockCanTransferGranularReturn({
          Err: errResponse,
        });

        when(portfolioIdToMeshPortfolioIdSpy)
          .calledWith({ did: fromDid }, mockContext)
          .mockReturnValue(rawFromPortfolio);

        fromPortfolio.getCustodian.mockResolvedValue(
          entityMockUtils.getIdentityInstance({ did: fromDid })
        );
        toPortfolio.getCustodian.mockResolvedValue(
          entityMockUtils.getIdentityInstance({ did: toDid })
        );
        when(dsMockUtils.createCallMock('assetApi', 'canTransferGranular'))
          .calledWith(fromDid, rawFromPortfolio, toDid, rawToPortfolio, rawTicker, rawAmount)
          .mockReturnValue(response);

        const expectedError = new PolymeshError({
          message:
            'RPC result from "asset.canTransferGranular" was not OK. Execution meter was likely exceeded',
          code: ErrorCode.LimitExceeded,
        });

        return expect(
          settlements.canTransfer({ from: fromDid, to: toDid, amount })
        ).rejects.toThrow(expectedError);
      });
    });

    describe('method: preApproveTicker', () => {
      it('should prepare the procedure and return the resulting transaction', async () => {
        const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<void>;
        const args = { ticker, preApprove: true };

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
        const args = { ticker, preApprove: false };

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
      const okResponse = 'rpcResponse' as unknown as GranularCanTransferResult;
      const response = createMockCanTransferGranularReturn({
        Ok: okResponse,
      });

      when(portfolioIdToMeshPortfolioIdSpy)
        .calledWith({ did: fromDid }, mockContext)
        .mockReturnValue(rawFromPortfolio);

      fromPortfolio.getCustodian.mockResolvedValue(
        entityMockUtils.getIdentityInstance({ did: fromDid })
      );
      toPortfolio.getCustodian.mockResolvedValue(
        entityMockUtils.getIdentityInstance({ did: toDid })
      );
      dsMockUtils.createCallMock('assetApi', 'canTransferGranular').mockReturnValue(response);

      const mockDispatch = dsMockUtils.createMockDispatchResult();
      dsMockUtils.createCallMock('nftApi', 'validateNftTransfer', {
        returnValue: mockDispatch,
      });

      const expected = 'breakdown' as unknown as TransferBreakdown;

      when(granularCanTransferResultToTransferBreakdownSpy)
        .calledWith(okResponse, mockDispatch, mockContext)
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
