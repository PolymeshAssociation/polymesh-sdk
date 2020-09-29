import { AccountId, Balance } from '@polkadot/types/interfaces';
import BigNumber from 'bignumber.js';
import { PortfolioId as MeshPortfolioId, Ticker } from 'polymesh-types/types';
import sinon, { SinonStub } from 'sinon';

import { Namespace } from '~/api/entities';
import { Context } from '~/base';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { TransferStatus } from '~/types';
import { PortfolioId } from '~/types/internal';
import * as utilsModule from '~/utils';
import { DUMMY_ACCOUNT_ID } from '~/utils/constants';

import { SecurityToken } from '..';
import { Settlements } from '../Settlements';

describe('Settlements class', () => {
  let mockContext: Mocked<Context>;
  let mockSecurityToken: Mocked<SecurityToken>;
  let settlements: Settlements;
  let stringToAccountIdStub: SinonStub<[string, Context], AccountId>;
  let stringToTickerStub: SinonStub<[string, Context], Ticker>;
  let numberToBalanceStub: SinonStub<[number | BigNumber, Context], Balance>;
  let portfolioIdToMeshPortfolioIdStub: sinon.SinonStub<[PortfolioId, Context], MeshPortfolioId>;
  let rawAccountId: AccountId;
  let rawTicker: Ticker;
  let rawAmount: Balance;
  let statusCode: number;
  let amount: BigNumber;
  let toDid: string;
  let ticker: string;
  let accountId: string;

  beforeAll(() => {
    toDid = 'toDid';
    statusCode = 81;
    amount = new BigNumber(100);
    entityMockUtils.initMocks();
    dsMockUtils.initMocks();
    stringToAccountIdStub = sinon.stub(utilsModule, 'stringToAccountId');
    stringToTickerStub = sinon.stub(utilsModule, 'stringToTicker');
    numberToBalanceStub = sinon.stub(utilsModule, 'numberToBalance');
    portfolioIdToMeshPortfolioIdStub = sinon.stub(utilsModule, 'portfolioIdToMeshPortfolioId');
    rawAmount = dsMockUtils.createMockBalance(amount.toNumber());
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    mockSecurityToken = entityMockUtils.getSecurityTokenInstance();
    numberToBalanceStub.withArgs(amount, mockContext).returns(rawAmount);
    settlements = new Settlements(mockSecurityToken, mockContext);
    ticker = mockSecurityToken.ticker;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    accountId = mockContext.currentPair?.address!;
    rawAccountId = dsMockUtils.createMockAccountId(accountId);
    rawTicker = dsMockUtils.createMockTicker(ticker);
    stringToAccountIdStub.withArgs(accountId, mockContext).returns(rawAccountId);
    stringToTickerStub.withArgs(ticker, mockContext).returns(rawTicker);
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  test('should extend namespace', () => {
    expect(Settlements.prototype instanceof Namespace).toBe(true);
  });

  describe('method: canSettle', () => {
    let fromDid: string;
    const rawFromPortfolio = dsMockUtils.createMockPortfolioId();
    const rawToPortfolio = dsMockUtils.createMockPortfolioId();

    beforeAll(() => {
      fromDid = 'fromDid';
    });

    beforeEach(() => {
      portfolioIdToMeshPortfolioIdStub
        .withArgs({ did: toDid }, mockContext)
        .returns(rawToPortfolio);
    });

    test('should return a status value representing whether the transaction can be made from the current Identity', async () => {
      const { did: currentDid } = await mockContext.getCurrentIdentity();

      const rawDummyAccountId = dsMockUtils.createMockAccountId(DUMMY_ACCOUNT_ID);

      portfolioIdToMeshPortfolioIdStub
        .withArgs({ did: currentDid }, mockContext)
        .returns(rawFromPortfolio);

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
          null,
          rawFromPortfolio,
          null,
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

      dsMockUtils
        .createRpcStub('asset', 'canTransfer')
        .withArgs(rawAccountId, null, rawFromPortfolio, null, rawToPortfolio, rawTicker, rawAmount)
        .returns(rawResponse);

      const result = await settlements.canSettle({ from: fromDid, to: toDid, amount });

      expect(result).toBe(TransferStatus.Success);
    });
  });
});
