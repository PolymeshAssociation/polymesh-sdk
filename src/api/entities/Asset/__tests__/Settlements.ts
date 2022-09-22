import { AccountId, Balance } from '@polkadot/types/interfaces';
import { PolymeshPrimitivesIdentityId, PolymeshPrimitivesTicker } from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import { Context, Namespace } from '~/internal';
import { GranularCanTransferResult, PortfolioId as MeshPortfolioId } from '~/polkadot/polymesh';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import {
  DefaultPortfolio,
  NumberedPortfolio,
  PortfolioId,
  PortfolioLike,
  TransferBreakdown,
  TransferStatus,
} from '~/types';
import { DUMMY_ACCOUNT_ID } from '~/utils/constants';
import * as utilsConversionModule from '~/utils/conversion';

import { Asset } from '..';
import { Settlements } from '../Settlements';

describe('Settlements class', () => {
  let mockContext: Mocked<Context>;
  let mockAsset: Mocked<Asset>;
  let settlements: Settlements;
  let stringToAccountIdStub: jest.SpyInstance<AccountId, [string, Context]>;
  let stringToTickerStub: jest.SpyInstance<PolymeshPrimitivesTicker, [string, Context]>;
  let bigNumberToBalanceStub: jest.SpyInstance;
  let portfolioIdToMeshPortfolioIdStub: jest.SpyInstance<MeshPortfolioId, [PortfolioId, Context]>;
  let portfolioLikeToPortfolioIdStub: jest.SpyInstance<PortfolioId, [PortfolioLike]>;
  let portfolioIdToPortfolioStub: jest.SpyInstance<
    DefaultPortfolio | NumberedPortfolio,
    [PortfolioId, Context]
  >;
  let stringToIdentityIdStub: jest.SpyInstance<PolymeshPrimitivesIdentityId, [string, Context]>;
  let rawAccountId: AccountId;
  let rawTicker: PolymeshPrimitivesTicker;
  let rawToDid: PolymeshPrimitivesIdentityId;
  let rawAmount: Balance;
  let statusCode: BigNumber;
  let amount: BigNumber;
  let toDid: string;
  let ticker: string;

  beforeAll(() => {
    entityMockUtils.initMocks();
    dsMockUtils.initMocks();

    toDid = 'toDid';
    statusCode = new BigNumber(81);
    amount = new BigNumber(100);
    stringToAccountIdStub = jest.spyOn(utilsConversionModule, 'stringToAccountId');
    stringToTickerStub = jest.spyOn(utilsConversionModule, 'stringToTicker');
    bigNumberToBalanceStub = jest.spyOn(utilsConversionModule, 'bigNumberToBalance');
    portfolioIdToMeshPortfolioIdStub = jest.spyOn(
      utilsConversionModule,
      'portfolioIdToMeshPortfolioId'
    );
    portfolioLikeToPortfolioIdStub = jest.spyOn(
      utilsConversionModule,
      'portfolioLikeToPortfolioId'
    );
    portfolioIdToPortfolioStub = jest.spyOn(utilsConversionModule, 'portfolioIdToPortfolio');
    stringToIdentityIdStub = jest.spyOn(utilsConversionModule, 'stringToIdentityId');
    rawAmount = dsMockUtils.createMockBalance(amount);
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    mockAsset = entityMockUtils.getAssetInstance();
    when(bigNumberToBalanceStub).calledWith(amount, mockContext, false).mockReturnValue(rawAmount);
    settlements = new Settlements(mockAsset, mockContext);
    ticker = mockAsset.ticker;
    rawAccountId = dsMockUtils.createMockAccountId(DUMMY_ACCOUNT_ID);
    rawTicker = dsMockUtils.createMockTicker(ticker);
    rawToDid = dsMockUtils.createMockIdentityId(toDid);
    when(stringToAccountIdStub)
      .calledWith(DUMMY_ACCOUNT_ID, mockContext)
      .mockReturnValue(rawAccountId);
    when(stringToTickerStub).calledWith(ticker, mockContext).mockReturnValue(rawTicker);
    when(stringToIdentityIdStub).calledWith(toDid, mockContext).mockReturnValue(rawToDid);
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

  describe('method: canSettle', () => {
    let fromDid: string;
    let fromPortfolioId: PortfolioId;
    let toPortfolioId: PortfolioId;
    let rawFromPortfolio: MeshPortfolioId;
    let rawToPortfolio: MeshPortfolioId;
    let rawFromDid: PolymeshPrimitivesIdentityId;
    let fromPortfolio: entityMockUtils.MockDefaultPortfolio;
    let toPortfolio: entityMockUtils.MockDefaultPortfolio;

    beforeAll(() => {
      fromDid = 'fromDid';
      fromPortfolioId = { did: fromDid };
      toPortfolioId = { did: toDid };
      rawFromDid = dsMockUtils.createMockIdentityId(fromDid);
      rawFromPortfolio = dsMockUtils.createMockPortfolioId({ did: fromDid, kind: 'Default' });
      rawToPortfolio = dsMockUtils.createMockPortfolioId({ did: toDid, kind: 'Default' });
    });

    beforeEach(() => {
      fromPortfolio = entityMockUtils.getDefaultPortfolioInstance(fromPortfolioId);
      toPortfolio = entityMockUtils.getDefaultPortfolioInstance(toPortfolioId);
      when(portfolioLikeToPortfolioIdStub).calledWith(fromDid).mockReturnValue(fromPortfolioId);
      when(portfolioLikeToPortfolioIdStub).calledWith(toDid).mockReturnValue(toPortfolioId);
      when(portfolioLikeToPortfolioIdStub).calledWith(fromDid).mockReturnValue(fromPortfolioId);
      when(portfolioIdToMeshPortfolioIdStub)
        .calledWith(toPortfolioId, mockContext)
        .mockReturnValue(rawToPortfolio);
      when(portfolioIdToPortfolioStub)
        .calledWith(fromPortfolioId, mockContext)
        .mockReturnValue(fromPortfolio);
      when(portfolioIdToPortfolioStub)
        .calledWith(toPortfolioId, mockContext)
        .mockReturnValue(toPortfolio);
      when(stringToIdentityIdStub).calledWith(fromDid, mockContext).mockReturnValue(rawFromDid);
    });

    it('should return a status value representing whether the transaction can be made from the signing Identity', async () => {
      const signingIdentity = await mockContext.getSigningIdentity();
      const { did: signingDid } = signingIdentity;
      const rawSigningDid = dsMockUtils.createMockIdentityId(signingDid);

      const rawDummyAccountId = dsMockUtils.createMockAccountId(DUMMY_ACCOUNT_ID);
      const currentDefaultPortfolioId = { did: signingDid };

      fromPortfolio.getCustodian.mockResolvedValue(
        entityMockUtils.getIdentityInstance({ did: signingDid })
      );
      toPortfolio.getCustodian.mockResolvedValue(
        entityMockUtils.getIdentityInstance({ did: toDid })
      );

      when(portfolioLikeToPortfolioIdStub)
        .calledWith(signingIdentity)
        .mockReturnValue(currentDefaultPortfolioId);
      when(portfolioIdToMeshPortfolioIdStub)
        .calledWith(currentDefaultPortfolioId, mockContext)
        .mockReturnValue(rawFromPortfolio);
      when(portfolioIdToPortfolioStub)
        .calledWith(currentDefaultPortfolioId, mockContext)
        .mockReturnValue(
          entityMockUtils.getDefaultPortfolioInstance({
            did: signingDid,
          })
        );
      when(stringToIdentityIdStub)
        .calledWith(signingDid, mockContext)
        .mockReturnValue(rawSigningDid);
      when(stringToAccountIdStub)
        .calledWith(DUMMY_ACCOUNT_ID, mockContext)
        .mockReturnValue(rawDummyAccountId);

      const rawResponse = dsMockUtils.createMockCanTransferResult({
        Ok: dsMockUtils.createMockU8(statusCode),
      });

      when(dsMockUtils.createRpcStub('asset', 'canTransfer'))
        .calledWith(
          rawDummyAccountId,
          rawSigningDid,
          rawFromPortfolio,
          rawToDid,
          rawToPortfolio,
          rawTicker,
          rawAmount
        )
        .mockReturnValue(rawResponse);

      const result = await settlements.canSettle({ to: toDid, amount });

      expect(result).toBe(TransferStatus.Success);
    });

    it('should return a status value representing whether the transaction can be made from another Identity', async () => {
      const rawResponse = dsMockUtils.createMockCanTransferResult({
        Ok: dsMockUtils.createMockU8(statusCode),
      });

      fromPortfolio.getCustodian.mockResolvedValue(
        entityMockUtils.getIdentityInstance({ did: fromDid })
      );
      toPortfolio.getCustodian.mockResolvedValue(
        entityMockUtils.getIdentityInstance({ did: toDid })
      );

      when(portfolioIdToMeshPortfolioIdStub)
        .calledWith({ did: fromDid }, mockContext)
        .mockReturnValue(rawFromPortfolio);

      when(dsMockUtils.createRpcStub('asset', 'canTransfer'))
        .calledWith(
          rawAccountId,
          rawFromDid,
          rawFromPortfolio,
          rawToDid,
          rawToPortfolio,
          rawTicker,
          rawAmount
        )
        .mockReturnValue(rawResponse);

      const result = await settlements.canSettle({ from: fromDid, to: toDid, amount });

      expect(result).toBe(TransferStatus.Success);
    });
  });

  describe('method: canTransfer', () => {
    let fromDid: string;
    let fromPortfolioId: PortfolioId;
    let toPortfolioId: PortfolioId;
    let rawFromPortfolio: MeshPortfolioId;
    let rawToPortfolio: MeshPortfolioId;
    let rawFromDid: PolymeshPrimitivesIdentityId;
    let fromPortfolio: entityMockUtils.MockDefaultPortfolio;
    let toPortfolio: entityMockUtils.MockDefaultPortfolio;
    let granularCanTransferResultToTransferBreakdownStub: jest.SpyInstance;

    beforeAll(() => {
      fromDid = 'fromDid';
      fromPortfolioId = { did: fromDid };
      toPortfolioId = { did: toDid };
      rawFromDid = dsMockUtils.createMockIdentityId(fromDid);
      rawFromPortfolio = dsMockUtils.createMockPortfolioId({ did: fromDid, kind: 'Default' });
      rawToPortfolio = dsMockUtils.createMockPortfolioId({ did: toDid, kind: 'Default' });
      granularCanTransferResultToTransferBreakdownStub = jest.spyOn(
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
      when(portfolioLikeToPortfolioIdStub).calledWith(toDid).mockReturnValue(toPortfolioId);
      when(portfolioLikeToPortfolioIdStub).calledWith(fromDid).mockReturnValue(fromPortfolioId);
      when(portfolioIdToMeshPortfolioIdStub)
        .calledWith(toPortfolioId, mockContext)
        .mockReturnValue(rawToPortfolio);
      when(portfolioIdToPortfolioStub)
        .calledWith(toPortfolioId, mockContext)
        .mockReturnValue(toPortfolio);
      when(portfolioIdToPortfolioStub)
        .calledWith(fromPortfolioId, mockContext)
        .mockReturnValue(fromPortfolio);
      when(stringToIdentityIdStub).calledWith(fromDid, mockContext).mockReturnValue(rawFromDid);
    });

    it('should return a transfer breakdown representing whether the transaction can be made from the signing Identity', async () => {
      const signingIdentity = await mockContext.getSigningIdentity();
      const { did: signingDid } = signingIdentity;
      const rawSigningDid = dsMockUtils.createMockIdentityId(signingDid);

      const currentDefaultPortfolioId = { did: signingDid };

      when(stringToIdentityIdStub)
        .calledWith(signingDid, mockContext)
        .mockReturnValue(rawSigningDid);

      when(portfolioLikeToPortfolioIdStub)
        .calledWith(signingIdentity)
        .mockReturnValue(currentDefaultPortfolioId);
      when(portfolioIdToMeshPortfolioIdStub)
        .calledWith(currentDefaultPortfolioId, mockContext)
        .mockReturnValue(rawFromPortfolio);
      when(portfolioIdToPortfolioStub)
        .calledWith(currentDefaultPortfolioId, mockContext)
        .mockReturnValue(
          entityMockUtils.getDefaultPortfolioInstance({
            did: signingDid,
            getCustodian: entityMockUtils.getIdentityInstance({ did: signingDid }),
          })
        );

      const response = 'rpcResponse' as unknown as GranularCanTransferResult;

      when(dsMockUtils.createRpcStub('asset', 'canTransferGranular'))
        .calledWith(rawSigningDid, rawFromPortfolio, rawToDid, rawToPortfolio, rawTicker, rawAmount)
        .mockReturnValue(response);

      const expected = 'breakdown' as unknown as TransferBreakdown;

      when(granularCanTransferResultToTransferBreakdownStub)
        .calledWith(response, mockContext)
        .mockReturnValue(expected);

      const result = await settlements.canTransfer({ to: toDid, amount });

      expect(result).toEqual(expected);
    });

    it('should return a transfer breakdown representing whether the transaction can be made from another Identity', async () => {
      const response = 'rpcResponse' as unknown as GranularCanTransferResult;

      when(portfolioIdToMeshPortfolioIdStub)
        .calledWith({ did: fromDid }, mockContext)
        .mockReturnValue(rawFromPortfolio);

      fromPortfolio.getCustodian.mockResolvedValue(
        entityMockUtils.getIdentityInstance({ did: fromDid })
      );
      toPortfolio.getCustodian.mockResolvedValue(
        entityMockUtils.getIdentityInstance({ did: toDid })
      );
      when(dsMockUtils.createRpcStub('asset', 'canTransferGranular'))
        .calledWith(rawFromDid, rawFromPortfolio, rawToDid, rawToPortfolio, rawTicker, rawAmount)
        .mockReturnValue(response);

      const expected = 'breakdown' as unknown as TransferBreakdown;

      when(granularCanTransferResultToTransferBreakdownStub)
        .calledWith(response, mockContext)
        .mockReturnValue(expected);

      const result = await settlements.canTransfer({ from: fromDid, to: toDid, amount });

      expect(result).toEqual(expected);
    });
  });
});
