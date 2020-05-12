import { AccountId, Balance } from '@polkadot/types/interfaces';
import BigNumber from 'bignumber.js';
import sinon, { SinonStub } from 'sinon';

import { toggleFreezeTransfers, transferToken } from '~/api/procedures';
import { Params } from '~/api/procedures/toggleFreezeTransfers';
import { Namespace, TransactionQueue } from '~/base';
import { Context } from '~/context';
import { IdentityId, Ticker } from '~/polkadot';
import { entityMockUtils, polkadotMockUtils } from '~/testUtils/mocks';
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

  beforeAll(() => {
    entityMockUtils.initMocks();
    polkadotMockUtils.initMocks();

    prepareToggleFreezeTransfersStub = sinon.stub(toggleFreezeTransfers, 'prepare');
  });

  beforeEach(() => {
    mockContext = polkadotMockUtils.getContextInstance();
    mockSecurityToken = entityMockUtils.getSecurityTokenInstance();
    transfers = new Transfers(mockSecurityToken, mockContext);
  });

  afterEach(() => {
    polkadotMockUtils.reset();
  });

  afterAll(() => {
    polkadotMockUtils.cleanup();
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
    test('should return whether the security token is frozen or not', async () => {
      const boolValue = true;

      polkadotMockUtils.createQueryStub('asset', 'frozen', {
        returnValue: polkadotMockUtils.createMockBool(boolValue),
      });

      const result = await transfers.areFrozen();

      expect(result).toBe(boolValue);
    });
  });

  describe('method: canTransfer', () => {
    let stringToAccountIdStub: SinonStub<[string, Context], AccountId>;
    let stringToTickerStub: SinonStub<[string, Context], Ticker>;
    let stringToIdentityIdStub: SinonStub<[string, Context], IdentityId>;
    let numberToBalanceStub: SinonStub<[number | BigNumber, Context], Balance>;

    let statusCode: number;
    let fromDid: string;
    let toDid: string;
    let ticker: string;
    let amount: BigNumber;
    let accountId: string;

    let rawAccountId: AccountId;
    let rawFromDid: IdentityId;
    let rawToDid: IdentityId;
    let rawTicker: Ticker;
    let rawAmount: Balance;

    beforeAll(() => {
      stringToAccountIdStub = sinon.stub(utilsModule, 'stringToAccountId');
      stringToTickerStub = sinon.stub(utilsModule, 'stringToTicker');
      stringToIdentityIdStub = sinon.stub(utilsModule, 'stringToIdentityId');
      numberToBalanceStub = sinon.stub(utilsModule, 'numberToBalance');

      statusCode = 81;
      fromDid = 'fromDid';
      toDid = 'toDid';
      ({ ticker } = mockSecurityToken);
      amount = new BigNumber(100);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      accountId = mockContext.currentPair?.address!;

      rawAccountId = polkadotMockUtils.createMockAccountId(accountId);
      rawFromDid = polkadotMockUtils.createMockIdentityId(fromDid);
      rawToDid = polkadotMockUtils.createMockIdentityId(toDid);
      rawTicker = polkadotMockUtils.createMockTicker(ticker);
      rawAmount = polkadotMockUtils.createMockBalance(amount.toNumber());
    });

    beforeEach(() => {
      stringToAccountIdStub.withArgs(accountId, mockContext).returns(rawAccountId);
      stringToTickerStub.withArgs(ticker, mockContext).returns(rawTicker);
      stringToIdentityIdStub.withArgs(fromDid, mockContext).returns(rawFromDid);
      stringToIdentityIdStub.withArgs(toDid, mockContext).returns(rawToDid);
      numberToBalanceStub.withArgs(amount, mockContext).returns(rawAmount);
    });

    test('should return a status value representing whether the transaction can be made from the current identity', async () => {
      const currentDid = mockContext.getCurrentIdentity().did;

      const rawCurrentDid = polkadotMockUtils.createMockIdentityId(currentDid);
      const rawDummyAccountId = polkadotMockUtils.createMockAccountId(DUMMY_ACCOUNT_ID);

      stringToIdentityIdStub.withArgs(currentDid, mockContext).returns(rawCurrentDid);

      // also test the case where the SDK was instanced without an account
      mockContext.currentPair = undefined;
      stringToAccountIdStub.withArgs(DUMMY_ACCOUNT_ID, mockContext).returns(rawDummyAccountId);

      const rawResponse = polkadotMockUtils.createMockCanTransferResult({
        Ok: polkadotMockUtils.createMockU8(statusCode),
      });

      polkadotMockUtils
        .createRpcStub('asset', 'canTransfer')
        .withArgs(rawDummyAccountId, rawTicker, rawCurrentDid, rawToDid, rawAmount)
        .returns(rawResponse);

      const result = await transfers.canTransfer({ to: toDid, amount });

      expect(result).toBe(TransferStatus.Success);
    });

    test('should return a status value representing whether the transaction can be made from another identity', async () => {
      const rawResponse = polkadotMockUtils.createMockCanTransferResult({
        Ok: polkadotMockUtils.createMockU8(statusCode),
      });

      polkadotMockUtils
        .createRpcStub('asset', 'canTransfer')
        .withArgs(rawAccountId, rawTicker, rawFromDid, rawToDid, rawAmount)
        .returns(rawResponse);

      const result = await transfers.canTransfer({ from: fromDid, to: toDid, amount });

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
