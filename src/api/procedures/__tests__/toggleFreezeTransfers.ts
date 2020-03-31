import { Ticker } from 'polymesh-types/types';
import sinon from 'sinon';

import { SecurityToken } from '~/api/entities';
import {
  getRequiredRoles,
  Params,
  prepareToggleFreezeTransfers,
} from '~/api/procedures/toggleFreezeTransfers';
import { Context } from '~/context';
import { entityMockUtils, polkadotMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { RoleType } from '~/types';
import * as utilsModule from '~/utils';

jest.mock(
  '~/api/entities/SecurityToken',
  require('~/testUtils/mocks/entities').mockSecurityTokenModule('~/api/entities/SecurityToken')
);

describe('toggleFreezeTransfers procedure', () => {
  let mockContext: Mocked<Context>;
  let stringToTickerStub: sinon.SinonStub<[string, Context], Ticker>;
  let ticker: string;
  let rawTicker: Ticker;

  beforeAll(() => {
    polkadotMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    stringToTickerStub = sinon.stub(utilsModule, 'stringToTicker');
    ticker = 'someTicker';
    rawTicker = polkadotMockUtils.createMockTicker(ticker);
  });

  let addTransactionStub: sinon.SinonStub;

  beforeEach(() => {
    addTransactionStub = procedureMockUtils.getAddTransactionStub();
    mockContext = polkadotMockUtils.getContextInstance();
    stringToTickerStub.withArgs(ticker, mockContext).returns(rawTicker);
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

  test('should throw an error if freeze is set to false and the security token is already unfrozen', () => {
    const proc = procedureMockUtils.getInstance<Params, SecurityToken>();
    proc.context = mockContext;

    return expect(
      prepareToggleFreezeTransfers.call(proc, {
        ticker,
        freeze: false,
      })
    ).rejects.toThrow('The Security Token is already unfrozen');
  });

  test('should add a freeze transaction to the queue', async () => {
    const proc = procedureMockUtils.getInstance<Params, SecurityToken>();
    proc.context = mockContext;

    const transaction = polkadotMockUtils.createTxStub('asset', 'freeze');

    const result = await prepareToggleFreezeTransfers.call(proc, {
      ticker,
      freeze: true,
    });

    sinon.assert.calledWith(addTransactionStub, transaction, {}, rawTicker);

    expect(ticker).toBe(result.ticker);
  });

  test('should throw an error if freeze is set to true and the security token is already frozen', () => {
    entityMockUtils.initMocks({
      securityTokenOptions: {
        transfersAreFrozen: true,
      },
    });

    const proc = procedureMockUtils.getInstance<Params, SecurityToken>();
    proc.context = mockContext;

    return expect(
      prepareToggleFreezeTransfers.call(proc, {
        ticker,
        freeze: true,
      })
    ).rejects.toThrow('The Security Token is already frozen');
  });

  test('should add a unfreeze transaction to the queue', async () => {
    const proc = procedureMockUtils.getInstance<Params, SecurityToken>();
    proc.context = mockContext;

    const transaction = polkadotMockUtils.createTxStub('asset', 'unfreeze');

    const result = await prepareToggleFreezeTransfers.call(proc, {
      ticker,
      freeze: false,
    });

    sinon.assert.calledWith(addTransactionStub, transaction, {}, rawTicker);

    expect(ticker).toBe(result.ticker);
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
