import { Balance } from '@polkadot/types/interfaces';
import BigNumber from 'bignumber.js';
import { IdentityId, Ticker } from 'polymesh-types/types';
import sinon from 'sinon';

import { Identity, SecurityToken } from '~/api/entities';
import { getRequiredRoles, Params, prepareTransferToken } from '~/api/procedures/transferToken';
import { Context } from '~/context';
import { entityMockUtils, polkadotMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { RoleType, TransferStatus } from '~/types';
import * as utilsModule from '~/utils';

jest.mock(
  '~/api/entities/SecurityToken',
  require('~/testUtils/mocks/entities').mockSecurityTokenModule('~/api/entities/SecurityToken')
);

describe('transferToken procedure', () => {
  let mockContext: Mocked<Context>;
  let stringToTickerStub: sinon.SinonStub<[string, Context], Ticker>;
  let numberToBalanceStub: sinon.SinonStub<[number | BigNumber, Context], Balance>;
  let stringToIdentityIdStub: sinon.SinonStub<[string, Context], IdentityId>;
  let valueToDidStub: sinon.SinonStub<[string | Identity], string>;
  let did: string;
  let ticker: string;
  let rawTicker: Ticker;
  let args: Params;

  beforeAll(() => {
    polkadotMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    stringToTickerStub = sinon.stub(utilsModule, 'stringToTicker');
    numberToBalanceStub = sinon.stub(utilsModule, 'numberToBalance');
    stringToIdentityIdStub = sinon.stub(utilsModule, 'stringToIdentityId');
    valueToDidStub = sinon.stub(utilsModule, 'valueToDid');
    did = 'someDid';
    ticker = 'TEST';
    rawTicker = polkadotMockUtils.createMockTicker(ticker);
    args = {
      to: did,
      amount: new BigNumber(100),
      ticker,
    };
  });

  beforeEach(() => {
    mockContext = polkadotMockUtils.getContextInstance();
    stringToTickerStub.withArgs(ticker, mockContext).returns(rawTicker);
    valueToDidStub.returns('someDid');
  });

  afterEach(() => {
    entityMockUtils.reset();
    procedureMockUtils.reset();
    polkadotMockUtils.reset();
  });

  afterAll(() => {
    entityMockUtils.cleanup();
    procedureMockUtils.cleanup();
    polkadotMockUtils.cleanup();
  });

  test('should throw an error with possible reason if transfer status is different than success and failure', () => {
    const amount = new BigNumber(100);
    const status = TransferStatus.FundsLimitReached;

    entityMockUtils.configureMocks({
      securityTokenOptions: {
        transfersCanTransfer: status,
      },
    });

    const proc = procedureMockUtils.getInstance<Params, SecurityToken>();
    proc.context = mockContext;

    return expect(prepareTransferToken.call(proc, { ...args, amount })).rejects.toThrow(
      `You are not allowed to transfer ${amount.toFormat()} "${ticker}" tokens to "${did}". Reason: ${status}`
    );
  });

  test('should throw an error without possible reason if transfer status is failure', () => {
    const amount = new BigNumber(100);
    const status = TransferStatus.Failure;

    entityMockUtils.configureMocks({
      securityTokenOptions: {
        transfersCanTransfer: status,
      },
    });

    const proc = procedureMockUtils.getInstance<Params, SecurityToken>();
    proc.context = mockContext;

    return expect(prepareTransferToken.call(proc, { ...args, amount })).rejects.toThrow(
      `You are not allowed to transfer ${amount.toFormat()} "${ticker}" tokens to "${did}".`
    );
  });

  test('should add a token transfer transaction to the queue', async () => {
    const amount = 100;
    const rawAmount = polkadotMockUtils.createMockBalance(amount);
    const rawDid = polkadotMockUtils.createMockIdentityId(did);
    numberToBalanceStub.returns(rawAmount);
    stringToIdentityIdStub.returns(rawDid);

    const tx = polkadotMockUtils.createTxStub('asset', 'transfer');
    const proc = procedureMockUtils.getInstance<Params, SecurityToken>();
    proc.context = mockContext;

    await prepareTransferToken.call(proc, { ...args, amount: new BigNumber(amount) });

    sinon.assert.calledWith(
      procedureMockUtils.getAddTransactionStub(),
      tx,
      {},
      rawTicker,
      rawDid,
      rawAmount
    );
  });
});

describe('getRequiredRoles', () => {
  test('should return a token owner role', () => {
    const ticker = 'someTicker';
    const args = {
      ticker,
    } as Params;

    expect(getRequiredRoles(args)).toEqual([{ type: RoleType.TokenOwner, ticker }]);
  });
});
