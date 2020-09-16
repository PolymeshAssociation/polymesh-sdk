import { AccountId, Balance } from '@polkadot/types/interfaces';
import { bool } from '@polkadot/types/primitive';
import BigNumber from 'bignumber.js';
import { IdentityId, Ticker } from 'polymesh-types/types';
import sinon, { SinonStub } from 'sinon';

import { Namespace } from '~/api/entities';
import { toggleFreezeTransfers, transferToken } from '~/api/procedures';
import { Params } from '~/api/procedures/toggleFreezeTransfers';
import { Context, TransactionQueue } from '~/base';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { TransferStatus } from '~/types';
import * as utilsModule from '~/utils';
import { DUMMY_ACCOUNT_ID } from '~/utils/constants';

import { SecurityToken } from '../';
import { Transfers } from '../Transfers';

describe('Transfers class', () => {
  let mockContext: Mocked<Context>;
  let mockSecurityToken: Mocked<SecurityToken>;
  let transfers: Transfers;
  let prepareToggleFreezeTransfersStub: SinonStub<
    [Params, Context],
    Promise<TransactionQueue<SecurityToken, unknown[][]>>
  >;
  let stringToAccountIdStub: SinonStub<[string, Context], AccountId>;
  let stringToTickerStub: SinonStub<[string, Context], Ticker>;
  let stringToIdentityIdStub: SinonStub<[string, Context], IdentityId>;
  let numberToBalanceStub: SinonStub<[number | BigNumber, Context], Balance>;
  let rawAccountId: AccountId;
  let rawToDid: IdentityId;
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
    stringToIdentityIdStub = sinon.stub(utilsModule, 'stringToIdentityId');
    numberToBalanceStub = sinon.stub(utilsModule, 'numberToBalance');
    rawToDid = dsMockUtils.createMockIdentityId(toDid);
    rawAmount = dsMockUtils.createMockBalance(amount.toNumber());
    prepareToggleFreezeTransfersStub = sinon.stub(toggleFreezeTransfers, 'prepare');
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    mockSecurityToken = entityMockUtils.getSecurityTokenInstance();
    stringToIdentityIdStub.withArgs(toDid, mockContext).returns(rawToDid);
    numberToBalanceStub.withArgs(amount, mockContext).returns(rawAmount);
    transfers = new Transfers(mockSecurityToken, mockContext);
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
    expect(Transfers.prototype instanceof Namespace).toBe(true);
  });

  describe('method: freeze', () => {
    test('should prepare the procedure and return the resulting transaction queue', async () => {
      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<SecurityToken>;

      prepareToggleFreezeTransfersStub
        .withArgs({ ticker: mockSecurityToken.ticker, freeze: true }, mockContext)
        .resolves(expectedQueue);

      const queue = await transfers.freeze();

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: unfreeze', () => {
    test('should prepare the procedure and return the resulting transaction queue', async () => {
      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<SecurityToken>;

      prepareToggleFreezeTransfersStub
        .withArgs({ ticker: mockSecurityToken.ticker, freeze: false }, mockContext)
        .resolves(expectedQueue);

      const queue = await transfers.unfreeze();

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: areFrozen', () => {
    let frozenStub: sinon.SinonStub;
    let boolValue: boolean;
    let rawBoolValue: bool;

    beforeAll(() => {
      boolValue = true;
      rawBoolValue = dsMockUtils.createMockBool(boolValue);
    });

    beforeEach(() => {
      frozenStub = dsMockUtils.createQueryStub('asset', 'frozen');
    });

    test('should return whether the security token is frozen or not', async () => {
      frozenStub.resolves(rawBoolValue);

      const result = await transfers.areFrozen();

      expect(result).toBe(boolValue);
    });

    test('should allow subscription', async () => {
      const unsubCallback = 'unsubCallBack';

      frozenStub.callsFake(async (_, cbFunc) => {
        cbFunc(rawBoolValue);
        return unsubCallback;
      });

      const callback = sinon.stub();
      const result = await transfers.areFrozen(callback);

      expect(result).toBe(unsubCallback);
      sinon.assert.calledWithExactly(callback, boolValue);
    });
  });

  describe('method: canTransfer', () => {
    let fromDid: string;
    let rawFromDid: IdentityId;

    beforeAll(() => {
      fromDid = 'fromDid';
      rawFromDid = dsMockUtils.createMockIdentityId(fromDid);
    });

    beforeEach(() => {
      stringToIdentityIdStub.withArgs(fromDid, mockContext).returns(rawFromDid);
    });

    test('should return a status value representing whether the transaction can be made from the current identity', async () => {
      const { did: currentDid } = await mockContext.getCurrentIdentity();

      const rawCurrentDid = dsMockUtils.createMockIdentityId(currentDid);
      const rawDummyAccountId = dsMockUtils.createMockAccountId(DUMMY_ACCOUNT_ID);

      stringToIdentityIdStub.withArgs(currentDid, mockContext).returns(rawCurrentDid);

      // also test the case where the SDK was instanced without an account
      mockContext.currentPair = undefined;
      stringToAccountIdStub.withArgs(DUMMY_ACCOUNT_ID, mockContext).returns(rawDummyAccountId);

      const rawResponse = dsMockUtils.createMockCanTransferResult({
        Ok: dsMockUtils.createMockU8(statusCode),
      });

      dsMockUtils
        .createRpcStub('asset', 'canTransfer')
        .withArgs(rawDummyAccountId, rawTicker, rawCurrentDid, rawToDid, rawAmount)
        .returns(rawResponse);

      const result = await transfers.canTransfer({ to: toDid, amount });

      expect(result).toBe(TransferStatus.Success);
    });

    test('should return a status value representing whether the transaction can be made from another identity', async () => {
      const rawResponse = dsMockUtils.createMockCanTransferResult({
        Ok: dsMockUtils.createMockU8(statusCode),
      });

      dsMockUtils
        .createRpcStub('asset', 'canTransfer')
        .withArgs(rawAccountId, rawTicker, rawFromDid, rawToDid, rawAmount)
        .returns(rawResponse);

      const result = await transfers.canTransfer({ from: fromDid, to: toDid, amount });

      expect(result).toBe(TransferStatus.Success);
    });
  });

  describe('method: canMint', () => {
    test('should return a status value representing whether the minting can be made', async () => {
      const rawResponse = dsMockUtils.createMockCanTransferResult({
        Ok: dsMockUtils.createMockU8(statusCode),
      });

      dsMockUtils
        .createRpcStub('asset', 'canTransfer')
        .withArgs(rawAccountId, rawTicker, null, rawToDid, rawAmount)
        .returns(rawResponse);

      const result = await transfers.canMint({ to: toDid, amount });

      expect(result).toBe(TransferStatus.Success);
    });
  });

  describe('method: transfer', () => {
    test('should prepare the procedure and return the resulting transaction queue', async () => {
      const args = {
        to: 'someDid',
        amount: new BigNumber(100),
      };
      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<SecurityToken>;

      sinon
        .stub(transferToken, 'prepare')
        .withArgs({ ticker: mockSecurityToken.ticker, ...args }, mockContext)
        .resolves(expectedQueue);

      const queue = await transfers.transfer(args);

      expect(queue).toBe(expectedQueue);
    });
  });
});
