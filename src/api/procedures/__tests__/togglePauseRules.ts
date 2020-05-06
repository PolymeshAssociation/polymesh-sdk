import { bool } from '@polkadot/types';
import { Ticker } from 'polymesh-types/types';
import sinon from 'sinon';

import { SecurityToken } from '~/api/entities';
import {
  getRequiredRoles,
  Params,
  prepareTogglePauseRules,
} from '~/api/procedures/togglePauseRules';
import { Context } from '~/context';
import { entityMockUtils, polkadotMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { RoleType } from '~/types';
import * as utilsModule from '~/utils';

jest.mock(
  '~/api/entities/SecurityToken',
  require('~/testUtils/mocks/entities').mockSecurityTokenModule('~/api/entities/SecurityToken')
);

describe('togglePauseRules procedure', () => {
  let mockContext: Mocked<Context>;
  let stringToTickerStub: sinon.SinonStub<[string, Context], Ticker>;
  let assetRulesMapStub: sinon.SinonStub;
  let boolToBooleanStub: sinon.SinonStub<[bool], boolean>;
  let ticker: string;
  let rawTicker: Ticker;

  beforeAll(() => {
    polkadotMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    stringToTickerStub = sinon.stub(utilsModule, 'stringToTicker');
    boolToBooleanStub = sinon.stub(utilsModule, 'boolToBoolean');
    ticker = 'TEST';
    rawTicker = polkadotMockUtils.createMockTicker(ticker);
  });

  let addTransactionStub: sinon.SinonStub;

  beforeEach(() => {
    addTransactionStub = procedureMockUtils.getAddTransactionStub();
    mockContext = polkadotMockUtils.getContextInstance();
    stringToTickerStub.withArgs(ticker, mockContext).returns(rawTicker);
    assetRulesMapStub = polkadotMockUtils.createQueryStub('generalTm', 'assetRulesMap', {
      returnValue: [],
    });
    assetRulesMapStub.withArgs(rawTicker).returns({
      // eslint-disable-next-line @typescript-eslint/camelcase
      is_paused: true,
    });
    boolToBooleanStub.returns(true);
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

  test('should throw an error if pause is set to true and the rules are already paused', () => {
    const proc = procedureMockUtils.getInstance<Params, SecurityToken>();
    proc.context = mockContext;

    return expect(
      prepareTogglePauseRules.call(proc, {
        ticker,
        pause: true,
      })
    ).rejects.toThrow('Rules are already paused');
  });

  test('should throw an error if pause is set to false and the rules are already unpaused', () => {
    assetRulesMapStub.withArgs(rawTicker).returns({
      // eslint-disable-next-line @typescript-eslint/camelcase
      is_paused: false,
    });

    boolToBooleanStub.returns(false);

    const proc = procedureMockUtils.getInstance<Params, SecurityToken>();
    proc.context = mockContext;

    return expect(
      prepareTogglePauseRules.call(proc, {
        ticker,
        pause: false,
      })
    ).rejects.toThrow('Rules are already unpaused');
  });

  test('should add a pause asset rules transaction to the queue', async () => {
    assetRulesMapStub.withArgs(rawTicker).returns({
      // eslint-disable-next-line @typescript-eslint/camelcase
      is_paused: false,
    });

    boolToBooleanStub.returns(false);

    const proc = procedureMockUtils.getInstance<Params, SecurityToken>();
    proc.context = mockContext;

    const transaction = polkadotMockUtils.createTxStub('generalTm', 'pauseAssetRules');

    const result = await prepareTogglePauseRules.call(proc, {
      ticker,
      pause: true,
    });

    sinon.assert.calledWith(addTransactionStub, transaction, {}, rawTicker);

    expect(ticker).toBe(result.ticker);
  });

  test('should add a resume asset rules transaction to the queue', async () => {
    const proc = procedureMockUtils.getInstance<Params, SecurityToken>();
    proc.context = mockContext;

    const transaction = polkadotMockUtils.createTxStub('generalTm', 'resumeAssetRules');

    const result = await prepareTogglePauseRules.call(proc, {
      ticker,
      pause: false,
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
