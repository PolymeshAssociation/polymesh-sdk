import { AccountId, Balance } from '@polkadot/types/interfaces';
import { PolymeshPrimitivesIdentityId, PolymeshPrimitivesTicker } from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import sinon, { SinonStub } from 'sinon';

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
  let stringToAccountIdStub: SinonStub<[string, Context], AccountId>;
  let stringToTickerStub: SinonStub<[string, Context], PolymeshPrimitivesTicker>;
  let bigNumberToBalanceStub: sinon.SinonStub;
  let portfolioIdToMeshPortfolioIdStub: sinon.SinonStub<[PortfolioId, Context], MeshPortfolioId>;
  let portfolioLikeToPortfolioIdStub: sinon.SinonStub<[PortfolioLike], PortfolioId>;
  let portfolioIdToPortfolioStub: sinon.SinonStub<
    [PortfolioId, Context],
    DefaultPortfolio | NumberedPortfolio
  >;
  let stringToIdentityIdStub: sinon.SinonStub<[string, Context], PolymeshPrimitivesIdentityId>;
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
    stringToAccountIdStub = sinon.stub(utilsConversionModule, 'stringToAccountId');
    stringToTickerStub = sinon.stub(utilsConversionModule, 'stringToTicker');
    bigNumberToBalanceStub = sinon.stub(utilsConversionModule, 'bigNumberToBalance');
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
    rawAmount = dsMockUtils.createMockBalance(amount);
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    mockAsset = entityMockUtils.getAssetInstance();
    bigNumberToBalanceStub.withArgs(amount, mockContext, false).returns(rawAmount);
    settlements = new Settlements(mockAsset, mockContext);
    ticker = mockAsset.ticker;
    rawAccountId = dsMockUtils.createMockAccountId(DUMMY_ACCOUNT_ID);
    rawTicker = dsMockUtils.createMockTicker(ticker);
    rawToDid = dsMockUtils.createMockIdentityId(toDid);
    stringToAccountIdStub.withArgs(DUMMY_ACCOUNT_ID, mockContext).returns(rawAccountId);
    stringToTickerStub.withArgs(ticker, mockContext).returns(rawTicker);
    stringToIdentityIdStub.withArgs(toDid, mockContext).returns(rawToDid);
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
      portfolioLikeToPortfolioIdStub.withArgs(fromDid).returns(fromPortfolioId);
      portfolioLikeToPortfolioIdStub.withArgs(toDid).returns(toPortfolioId);
      portfolioLikeToPortfolioIdStub.withArgs(fromDid).returns(fromPortfolioId);
      portfolioIdToMeshPortfolioIdStub.withArgs(toPortfolioId, mockContext).returns(rawToPortfolio);
      portfolioIdToPortfolioStub.withArgs(fromPortfolioId, mockContext).returns(fromPortfolio);
      portfolioIdToPortfolioStub.withArgs(toPortfolioId, mockContext).returns(toPortfolio);
      stringToIdentityIdStub.withArgs(fromDid, mockContext).returns(rawFromDid);
    });

    it('should return a status value representing whether the transaction can be made from the signing Identity', async () => {
      const signingIdentity = await mockContext.getSigningIdentity();
      const { did: signingDid } = signingIdentity;
      const rawSigningDid = dsMockUtils.createMockIdentityId(signingDid);

      const rawDummyAccountId = dsMockUtils.createMockAccountId(DUMMY_ACCOUNT_ID);
      const currentDefaultPortfolioId = { did: signingDid };

      fromPortfolio.getCustodian.resolves(entityMockUtils.getIdentityInstance({ did: signingDid }));
      toPortfolio.getCustodian.resolves(entityMockUtils.getIdentityInstance({ did: toDid }));

      portfolioLikeToPortfolioIdStub.withArgs(signingIdentity).returns(currentDefaultPortfolioId);
      portfolioIdToMeshPortfolioIdStub
        .withArgs(currentDefaultPortfolioId, mockContext)
        .returns(rawFromPortfolio);
      portfolioIdToPortfolioStub.withArgs(currentDefaultPortfolioId, mockContext).returns(
        entityMockUtils.getDefaultPortfolioInstance({
          did: signingDid,
        })
      );
      stringToIdentityIdStub.withArgs(signingDid, mockContext).returns(rawSigningDid);
      stringToAccountIdStub.withArgs(DUMMY_ACCOUNT_ID, mockContext).returns(rawDummyAccountId);

      const rawResponse = dsMockUtils.createMockCanTransferResult({
        Ok: dsMockUtils.createMockU8(statusCode),
      });

      dsMockUtils
        .createRpcStub('asset', 'canTransfer')
        .withArgs(
          rawDummyAccountId,
          rawSigningDid,
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

    it('should return a status value representing whether the transaction can be made from another Identity', async () => {
      const rawResponse = dsMockUtils.createMockCanTransferResult({
        Ok: dsMockUtils.createMockU8(statusCode),
      });

      fromPortfolio.getCustodian.resolves(entityMockUtils.getIdentityInstance({ did: fromDid }));
      toPortfolio.getCustodian.resolves(entityMockUtils.getIdentityInstance({ did: toDid }));

      portfolioIdToMeshPortfolioIdStub
        .withArgs({ did: fromDid }, mockContext)
        .returns(rawFromPortfolio);

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
    let rawFromDid: PolymeshPrimitivesIdentityId;
    let fromPortfolio: entityMockUtils.MockDefaultPortfolio;
    let toPortfolio: entityMockUtils.MockDefaultPortfolio;
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
      toPortfolio = entityMockUtils.getDefaultPortfolioInstance({
        did: toDid,
      });
      fromPortfolio = entityMockUtils.getDefaultPortfolioInstance({
        did: fromDid,
      });
      portfolioLikeToPortfolioIdStub.withArgs(toDid).returns(toPortfolioId);
      portfolioLikeToPortfolioIdStub.withArgs(fromDid).returns(fromPortfolioId);
      portfolioIdToMeshPortfolioIdStub.withArgs(toPortfolioId, mockContext).returns(rawToPortfolio);
      portfolioIdToPortfolioStub.withArgs(toPortfolioId, mockContext).returns(toPortfolio);
      portfolioIdToPortfolioStub.withArgs(fromPortfolioId, mockContext).returns(fromPortfolio);
      stringToIdentityIdStub.withArgs(fromDid, mockContext).returns(rawFromDid);
    });

    it('should return a transfer breakdown representing whether the transaction can be made from the signing Identity', async () => {
      const signingIdentity = await mockContext.getSigningIdentity();
      const { did: signingDid } = signingIdentity;
      const rawSigningDid = dsMockUtils.createMockIdentityId(signingDid);

      const currentDefaultPortfolioId = { did: signingDid };

      portfolioLikeToPortfolioIdStub.withArgs(signingIdentity).returns(currentDefaultPortfolioId);
      portfolioIdToMeshPortfolioIdStub
        .withArgs(currentDefaultPortfolioId, mockContext)
        .returns(rawFromPortfolio);
      portfolioIdToPortfolioStub.withArgs(currentDefaultPortfolioId, mockContext).returns(
        entityMockUtils.getDefaultPortfolioInstance({
          did: signingDid,
          getCustodian: entityMockUtils.getIdentityInstance({ did: signingDid }),
        })
      );
      stringToIdentityIdStub.withArgs(signingDid, mockContext).returns(rawSigningDid);

      toPortfolio.getCustodian.resolves(entityMockUtils.getIdentityInstance({ did: toDid }));

      const response = 'rpcResponse' as unknown as GranularCanTransferResult;

      dsMockUtils
        .createRpcStub('asset', 'canTransferGranular')
        .withArgs(rawSigningDid, rawFromPortfolio, rawToDid, rawToPortfolio, rawTicker, rawAmount)
        .returns(response);

      const expected = 'breakdown' as unknown as TransferBreakdown;

      granularCanTransferResultToTransferBreakdownStub
        .withArgs(response, mockContext)
        .returns(expected);

      const result = await settlements.canTransfer({ to: toDid, amount });

      expect(result).toEqual(expected);
    });

    it('should return a transfer breakdown representing whether the transaction can be made from another Identity', async () => {
      const response = 'rpcResponse' as unknown as GranularCanTransferResult;

      portfolioIdToMeshPortfolioIdStub
        .withArgs({ did: fromDid }, mockContext)
        .returns(rawFromPortfolio);

      fromPortfolio.getCustodian.resolves(entityMockUtils.getIdentityInstance({ did: fromDid }));
      toPortfolio.getCustodian.resolves(entityMockUtils.getIdentityInstance({ did: toDid }));
      dsMockUtils
        .createRpcStub('asset', 'canTransferGranular')
        .withArgs(rawFromDid, rawFromPortfolio, rawToDid, rawToPortfolio, rawTicker, rawAmount)
        .returns(response);

      const expected = 'breakdown' as unknown as TransferBreakdown;

      granularCanTransferResultToTransferBreakdownStub
        .withArgs(response, mockContext)
        .returns(expected);

      const result = await settlements.canTransfer({ from: fromDid, to: toDid, amount });

      expect(result).toEqual(expected);
    });
  });
});
