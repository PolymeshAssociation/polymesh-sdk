import { AccountId, Balance, DispatchError } from '@polkadot/types/interfaces';
import {
  PolymeshPrimitivesIdentityId,
  PolymeshPrimitivesIdentityIdPortfolioId,
  PolymeshPrimitivesTicker,
} from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import { Context, Namespace, PolymeshError } from '~/internal';
import { GranularCanTransferResult } from '~/polkadot';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';
import { createMockCanTransferGranularReturn } from '~/testUtils/mocks/dataSources';
import { Mocked } from '~/testUtils/types';
import {
  DefaultPortfolio,
  ErrorCode,
  NumberedPortfolio,
  PortfolioId,
  PortfolioLike,
  TransferBreakdown,
} from '~/types';
import { DUMMY_ACCOUNT_ID } from '~/utils/constants';
import * as utilsConversionModule from '~/utils/conversion';

import { FungibleAsset } from '../../Fungible';
import { Settlements } from '../../Fungible/Settlements';

describe('Settlements class', () => {
  let mockContext: Mocked<Context>;
  let mockAsset: Mocked<FungibleAsset>;
  let settlements: Settlements;
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
  let stringToIdentityIdSpy: jest.SpyInstance<PolymeshPrimitivesIdentityId, [string, Context]>;
  let rawAccountId: AccountId;
  let rawTicker: PolymeshPrimitivesTicker;
  let rawToDid: PolymeshPrimitivesIdentityId;
  let rawAmount: Balance;
  let amount: BigNumber;
  let toDid: string;
  let ticker: string;

  beforeAll(() => {
    entityMockUtils.initMocks();
    dsMockUtils.initMocks();

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
    stringToIdentityIdSpy = jest.spyOn(utilsConversionModule, 'stringToIdentityId');
    rawAmount = dsMockUtils.createMockBalance(amount);
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    mockAsset = entityMockUtils.getFungibleAssetInstance();
    when(bigNumberToBalanceSpy).calledWith(amount, mockContext, false).mockReturnValue(rawAmount);
    settlements = new Settlements(mockAsset, mockContext);
    ticker = mockAsset.ticker;
    rawAccountId = dsMockUtils.createMockAccountId(DUMMY_ACCOUNT_ID);
    rawTicker = dsMockUtils.createMockTicker(ticker);
    rawToDid = dsMockUtils.createMockIdentityId(toDid);
    when(stringToAccountIdSpy)
      .calledWith(DUMMY_ACCOUNT_ID, mockContext)
      .mockReturnValue(rawAccountId);
    when(stringToTickerSpy).calledWith(ticker, mockContext).mockReturnValue(rawTicker);
    when(stringToIdentityIdSpy).calledWith(toDid, mockContext).mockReturnValue(rawToDid);
  });

  afterEach(() => {
    dsMockUtils.reset();
    entityMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  it('should extend namespace', () => {
    expect(Settlements.prototype instanceof Namespace).toBe(true);
  });

  describe('method: canTransfer', () => {
    let fromDid: string;
    let fromPortfolioId: PortfolioId;
    let toPortfolioId: PortfolioId;
    let rawFromPortfolio: PolymeshPrimitivesIdentityIdPortfolioId;
    let rawToPortfolio: PolymeshPrimitivesIdentityIdPortfolioId;
    let rawFromDid: PolymeshPrimitivesIdentityId;
    let fromPortfolio: entityMockUtils.MockDefaultPortfolio;
    let toPortfolio: entityMockUtils.MockDefaultPortfolio;
    let granularCanTransferResultToTransferBreakdownSpy: jest.SpyInstance;

    beforeAll(() => {
      fromDid = 'fromDid';
      fromPortfolioId = { did: fromDid };
      toPortfolioId = { did: toDid };
      rawFromDid = dsMockUtils.createMockIdentityId(fromDid);
      rawFromPortfolio = dsMockUtils.createMockPortfolioId({ did: fromDid, kind: 'Default' });
      rawToPortfolio = dsMockUtils.createMockPortfolioId({ did: toDid, kind: 'Default' });
      granularCanTransferResultToTransferBreakdownSpy = jest.spyOn(
        utilsConversionModule,
        'granularCanTransferResultToTransferBreakdown'
      );
    });

    beforeEach(() => {
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
      when(stringToIdentityIdSpy).calledWith(fromDid, mockContext).mockReturnValue(rawFromDid);
    });

    it('should return a transfer breakdown representing whether the transaction can be made from the signing Identity', async () => {
      const signingIdentity = await mockContext.getSigningIdentity();
      const { did: signingDid } = signingIdentity;
      const rawSigningDid = dsMockUtils.createMockIdentityId(signingDid);

      const currentDefaultPortfolioId = { did: signingDid };

      when(stringToIdentityIdSpy)
        .calledWith(signingDid, mockContext)
        .mockReturnValue(rawSigningDid);

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

      when(dsMockUtils.createRpcMock('asset', 'canTransferGranular'))
        .calledWith(rawSigningDid, rawFromPortfolio, rawToDid, rawToPortfolio, rawTicker, rawAmount)
        .mockReturnValue(response);

      const expected = 'breakdown' as unknown as TransferBreakdown;

      when(granularCanTransferResultToTransferBreakdownSpy)
        .calledWith(okResponse, mockContext)
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
      when(dsMockUtils.createRpcMock('asset', 'canTransferGranular'))
        .calledWith(rawFromDid, rawFromPortfolio, rawToDid, rawToPortfolio, rawTicker, rawAmount)
        .mockReturnValue(response);

      const expected = 'breakdown' as unknown as TransferBreakdown;

      when(granularCanTransferResultToTransferBreakdownSpy)
        .calledWith(okResponse, mockContext)
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
      when(dsMockUtils.createRpcMock('asset', 'canTransferGranular'))
        .calledWith(rawFromDid, rawFromPortfolio, rawToDid, rawToPortfolio, rawTicker, rawAmount)
        .mockReturnValue(response);

      const expectedError = new PolymeshError({
        message:
          'RPC result from "asset.canTransferGranular" was not OK. Execution meter was likely exceeded',
        code: ErrorCode.LimitExceeded,
      });

      return expect(settlements.canTransfer({ from: fromDid, to: toDid, amount })).rejects.toThrow(
        expectedError
      );
    });
  });
});
