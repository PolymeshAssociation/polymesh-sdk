import { AccountId, Balance } from '@polkadot/types/interfaces';
import BigNumber from 'bignumber.js';
import {
  GranularCanTransferResult,
  IdentityId,
  PortfolioId as MeshPortfolioId,
  Ticker,
} from 'polymesh-types/types';
import sinon, { SinonStub } from 'sinon';

import { Context, Namespace } from '~/internal';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import {
  DefaultPortfolio,
  NumberedPortfolio,
  PortfolioLike,
  TransferBreakdown,
  TransferStatus,
} from '~/types';
import { PortfolioId } from '~/types/internal';
import { DUMMY_ACCOUNT_ID } from '~/utils/constants';
import * as utilsConversionModule from '~/utils/conversion';

import { SecurityToken } from '..';
import { Settlements } from '../Settlements';

describe('Settlements class', () => {
  let mockContext: Mocked<Context>;
  let mockSecurityToken: Mocked<SecurityToken>;
  let settlements: Settlements;
  let stringToAccountIdStub: SinonStub<[string, Context], AccountId>;
  let stringToTickerStub: SinonStub<[string, Context], Ticker>;
  let numberToBalanceStub: sinon.SinonStub;
  let portfolioIdToMeshPortfolioIdStub: sinon.SinonStub<[PortfolioId, Context], MeshPortfolioId>;
  let portfolioLikeToPortfolioIdStub: sinon.SinonStub<[PortfolioLike], PortfolioId>;
  let portfolioIdToPortfolioStub: sinon.SinonStub<
    [PortfolioId, Context],
    DefaultPortfolio | NumberedPortfolio
  >;
  let stringToIdentityIdStub: sinon.SinonStub<[string, Context], IdentityId>;
  let rawAccountId: AccountId;
  let rawTicker: Ticker;
  let rawToDid: IdentityId;
  let rawAmount: Balance;
  let statusCode: number;
  let amount: BigNumber;
  let toDid: string;
  let ticker: string;
  let accountId: string;

  beforeAll(() => {
    entityMockUtils.initMocks();
    dsMockUtils.initMocks();

    toDid = 'toDid';
    statusCode = 81;
    amount = new BigNumber(100);
    stringToAccountIdStub = sinon.stub(utilsConversionModule, 'stringToAccountId');
    stringToTickerStub = sinon.stub(utilsConversionModule, 'stringToTicker');
    numberToBalanceStub = sinon.stub(utilsConversionModule, 'numberToBalance');
    portfolioIdToMeshPortfolioIdStub = sinon.stub(
      utilsConversionModule,
      'portfolioIdToMeshPortfolioId'
    );
    portfolioLikeToPortfolioIdStub = sinon.stub(
      utilsConversionModule,
      'portfolioLikeToPortfolioId'
    );
    portfolioIdToPortfolioStub = sinon.stub(utilsConversionModule, 'portfolioIdToPortfolio');
    stringToIdentityIdStub = sinon.stub(utilsConversionModule, 'stringToIdentityId');
    rawAmount = dsMockUtils.createMockBalance(amount.toNumber());
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    mockSecurityToken = entityMockUtils.getSecurityTokenInstance();
    numberToBalanceStub.withArgs(amount, mockContext, false).returns(rawAmount);
    settlements = new Settlements(mockSecurityToken, mockContext);
    ticker = mockSecurityToken.ticker;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    accountId = mockContext.currentPair?.address!;
    rawAccountId = dsMockUtils.createMockAccountId(accountId);
    rawTicker = dsMockUtils.createMockTicker(ticker);
    rawToDid = dsMockUtils.createMockIdentityId(toDid);
    stringToAccountIdStub.withArgs(accountId, mockContext).returns(rawAccountId);
    stringToTickerStub.withArgs(ticker, mockContext).returns(rawTicker);
    stringToIdentityIdStub.withArgs(toDid, mockContext).returns(rawToDid);
  });

  afterEach(() => {
    dsMockUtils.reset();
    entityMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
    entityMockUtils.cleanup();
  });

  test('should extend namespace', () => {
    expect(Settlements.prototype instanceof Namespace).toBe(true);
  });

  describe('method: canSettle', () => {
    let fromDid: string;
    let fromPortfolioId: PortfolioId;
    let toPortfolioId: PortfolioId;
    let rawFromPortfolio: MeshPortfolioId;
    let rawToPortfolio: MeshPortfolioId;
    let rawFromDid: IdentityId;

    beforeAll(() => {
      fromDid = 'fromDid';
      fromPortfolioId = { did: fromDid };
      toPortfolioId = { did: toDid };
      rawFromDid = dsMockUtils.createMockIdentityId(fromDid);
      rawFromPortfolio = dsMockUtils.createMockPortfolioId({ did: fromDid, kind: 'Default' });
      rawToPortfolio = dsMockUtils.createMockPortfolioId({ did: toDid, kind: 'Default' });
    });

    beforeEach(() => {
      portfolioLikeToPortfolioIdStub.withArgs(fromDid).returns(fromPortfolioId);
      portfolioLikeToPortfolioIdStub.withArgs(toDid).returns(toPortfolioId);
      portfolioIdToMeshPortfolioIdStub.withArgs(toPortfolioId, mockContext).returns(rawToPortfolio);
      portfolioIdToPortfolioStub.withArgs(fromPortfolioId, mockContext).returns(
        entityMockUtils.getDefaultPortfolioInstance({
          did: fromDid,
        })
      );
      portfolioIdToPortfolioStub.withArgs(toPortfolioId, mockContext).returns(
        entityMockUtils.getDefaultPortfolioInstance({
          did: toDid,
        })
      );
      stringToIdentityIdStub.withArgs(fromDid, mockContext).returns(rawFromDid);
    });

    test('should return a status value representing whether the transaction can be made from the current Identity', async () => {
      const currentIdentity = await mockContext.getCurrentIdentity();
      const { did: currentDid } = currentIdentity;
      const rawCurrentDid = dsMockUtils.createMockIdentityId(currentDid);

      const rawDummyAccountId = dsMockUtils.createMockAccountId(DUMMY_ACCOUNT_ID);
      const currentDefaultPortfolioId = { did: currentDid };

      portfolioLikeToPortfolioIdStub.withArgs(currentIdentity).returns(currentDefaultPortfolioId);
      portfolioIdToMeshPortfolioIdStub
        .withArgs(currentDefaultPortfolioId, mockContext)
        .returns(rawFromPortfolio);
      portfolioIdToPortfolioStub.withArgs(currentDefaultPortfolioId, mockContext).returns(
        entityMockUtils.getDefaultPortfolioInstance({
          did: currentDid,
        })
      );
      stringToIdentityIdStub.withArgs(currentDid, mockContext).returns(rawCurrentDid);

      const getCustodianStub = entityMockUtils.getDefaultPortfolioGetCustodianStub();
      getCustodianStub
        .onFirstCall()
        .resolves(entityMockUtils.getIdentityInstance({ did: currentDid }));
      getCustodianStub.onSecondCall().resolves(entityMockUtils.getIdentityInstance({ did: toDid }));

      // also test the case where the SDK was instanced without an account
      mockContext.currentPair = undefined;
      stringToAccountIdStub.withArgs(DUMMY_ACCOUNT_ID, mockContext).returns(rawDummyAccountId);

      const rawResponse = dsMockUtils.createMockCanTransferResult({
        Ok: dsMockUtils.createMockU8(statusCode),
      });

      dsMockUtils
        .createRpcStub('asset', 'canTransfer')
        .withArgs(
          rawDummyAccountId,
          rawCurrentDid,
          rawFromPortfolio,
          rawToDid,
          rawToPortfolio,
          rawTicker,
          rawAmount
        )
        .returns(rawResponse);

      const result = await settlements.canSettle({ to: toDid, amount });

      expect(result).toBe(TransferStatus.Success);
    });

    test('should return a status value representing whether the transaction can be made from another Identity', async () => {
      const rawResponse = dsMockUtils.createMockCanTransferResult({
        Ok: dsMockUtils.createMockU8(statusCode),
      });

      portfolioIdToMeshPortfolioIdStub
        .withArgs({ did: fromDid }, mockContext)
        .returns(rawFromPortfolio);

      const getCustodianStub = entityMockUtils.getDefaultPortfolioGetCustodianStub();
      getCustodianStub
        .onFirstCall()
        .resolves(entityMockUtils.getIdentityInstance({ did: fromDid }));
      getCustodianStub.onSecondCall().resolves(entityMockUtils.getIdentityInstance({ did: toDid }));

      dsMockUtils
        .createRpcStub('asset', 'canTransfer')
        .withArgs(
          rawAccountId,
          rawFromDid,
          rawFromPortfolio,
          rawToDid,
          rawToPortfolio,
          rawTicker,
          rawAmount
        )
        .returns(rawResponse);

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
    let rawFromDid: IdentityId;
    let granularCanTransferResultToTransferBreakdownStub: sinon.SinonStub;

    beforeAll(() => {
      fromDid = 'fromDid';
      fromPortfolioId = { did: fromDid };
      toPortfolioId = { did: toDid };
      rawFromDid = dsMockUtils.createMockIdentityId(fromDid);
      rawFromPortfolio = dsMockUtils.createMockPortfolioId({ did: fromDid, kind: 'Default' });
      rawToPortfolio = dsMockUtils.createMockPortfolioId({ did: toDid, kind: 'Default' });
      granularCanTransferResultToTransferBreakdownStub = sinon.stub(
        utilsConversionModule,
        'granularCanTransferResultToTransferBreakdown'
      );
    });

    beforeEach(() => {
      portfolioLikeToPortfolioIdStub.withArgs(fromDid).returns(fromPortfolioId);
      portfolioLikeToPortfolioIdStub.withArgs(toDid).returns(toPortfolioId);
      portfolioIdToMeshPortfolioIdStub.withArgs(toPortfolioId, mockContext).returns(rawToPortfolio);
      portfolioIdToPortfolioStub.withArgs(fromPortfolioId, mockContext).returns(
        entityMockUtils.getDefaultPortfolioInstance({
          did: fromDid,
        })
      );
      portfolioIdToPortfolioStub.withArgs(toPortfolioId, mockContext).returns(
        entityMockUtils.getDefaultPortfolioInstance({
          did: toDid,
        })
      );
      stringToIdentityIdStub.withArgs(fromDid, mockContext).returns(rawFromDid);
    });

    test('should return a transfer breakdown representing whether the transaction can be made from the current Identity', async () => {
      const currentIdentity = await mockContext.getCurrentIdentity();
      const { did: currentDid } = currentIdentity;
      const rawCurrentDid = dsMockUtils.createMockIdentityId(currentDid);

      const currentDefaultPortfolioId = { did: currentDid };

      portfolioLikeToPortfolioIdStub.withArgs(currentIdentity).returns(currentDefaultPortfolioId);
      portfolioIdToMeshPortfolioIdStub
        .withArgs(currentDefaultPortfolioId, mockContext)
        .returns(rawFromPortfolio);
      portfolioIdToPortfolioStub.withArgs(currentDefaultPortfolioId, mockContext).returns(
        entityMockUtils.getDefaultPortfolioInstance({
          did: currentDid,
        })
      );
      stringToIdentityIdStub.withArgs(currentDid, mockContext).returns(rawCurrentDid);

      const getCustodianStub = entityMockUtils.getDefaultPortfolioGetCustodianStub();
      getCustodianStub
        .onFirstCall()
        .resolves(entityMockUtils.getIdentityInstance({ did: currentDid }));
      getCustodianStub.onSecondCall().resolves(entityMockUtils.getIdentityInstance({ did: toDid }));

      const response = ('rpcResponse' as unknown) as GranularCanTransferResult;

      dsMockUtils
        .createRpcStub('asset', 'canTransferGranular')
        .withArgs(rawCurrentDid, rawFromPortfolio, rawToDid, rawToPortfolio, rawTicker, rawAmount)
        .returns(response);

      const expected = ('breakdown' as unknown) as TransferBreakdown;

      granularCanTransferResultToTransferBreakdownStub
        .withArgs(response, mockContext)
        .returns(expected);

      const result = await settlements.canTransfer({ to: toDid, amount });

      expect(result).toEqual(expected);
    });

    test('should return a transfer breakdown representing whether the transaction can be made from another Identity', async () => {
      const response = ('rpcResponse' as unknown) as GranularCanTransferResult;

      portfolioIdToMeshPortfolioIdStub
        .withArgs({ did: fromDid }, mockContext)
        .returns(rawFromPortfolio);

      const getCustodianStub = entityMockUtils.getDefaultPortfolioGetCustodianStub();
      getCustodianStub
        .onFirstCall()
        .resolves(entityMockUtils.getIdentityInstance({ did: fromDid }));
      getCustodianStub.onSecondCall().resolves(entityMockUtils.getIdentityInstance({ did: toDid }));

      dsMockUtils
        .createRpcStub('asset', 'canTransferGranular')
        .withArgs(rawFromDid, rawFromPortfolio, rawToDid, rawToPortfolio, rawTicker, rawAmount)
        .returns(response);

      const expected = ('breakdown' as unknown) as TransferBreakdown;

      granularCanTransferResultToTransferBreakdownStub
        .withArgs(response, mockContext)
        .returns(expected);

      const result = await settlements.canTransfer({ from: fromDid, to: toDid, amount });

      expect(result).toEqual(expected);
    });
  });
});
