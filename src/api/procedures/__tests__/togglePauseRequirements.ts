import { bool } from '@polkadot/types';
import { Ticker, TxTags } from 'polymesh-types/types';
import sinon from 'sinon';

import {
  getAuthorization,
  Params,
  prepareTogglePauseRequirements,
} from '~/api/procedures/togglePauseRequirements';
import { Context, SecurityToken } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { RoleType } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/SecurityToken',
  require('~/testUtils/mocks/entities').mockSecurityTokenModule('~/api/entities/SecurityToken')
);

describe('togglePauseRequirements procedure', () => {
  let mockContext: Mocked<Context>;
  let stringToTickerStub: sinon.SinonStub<[string, Context], Ticker>;
  let assetCompliancesStub: sinon.SinonStub;
  let boolToBooleanStub: sinon.SinonStub<[bool], boolean>;
  let ticker: string;
  let rawTicker: Ticker;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    stringToTickerStub = sinon.stub(utilsConversionModule, 'stringToTicker');
    boolToBooleanStub = sinon.stub(utilsConversionModule, 'boolToBoolean');
    ticker = 'TEST';
    rawTicker = dsMockUtils.createMockTicker(ticker);
  });

  let addTransactionStub: sinon.SinonStub;

  beforeEach(() => {
    addTransactionStub = procedureMockUtils.getAddTransactionStub();
    mockContext = dsMockUtils.getContextInstance();
    stringToTickerStub.withArgs(ticker, mockContext).returns(rawTicker);
    assetCompliancesStub = dsMockUtils.createQueryStub('complianceManager', 'assetCompliances', {
      returnValue: [],
    });
    assetCompliancesStub.withArgs(rawTicker).resolves({
      // eslint-disable-next-line @typescript-eslint/camelcase
      is_paused: true,
    });
    boolToBooleanStub.returns(true);
  });

  afterEach(() => {
    entityMockUtils.reset();
    procedureMockUtils.reset();
    dsMockUtils.reset();
  });

  afterAll(() => {
    entityMockUtils.cleanup();
    procedureMockUtils.cleanup();
    dsMockUtils.cleanup();
  });

  test('should throw an error if pause is set to true and the asset compliance requirements are already paused', () => {
    const proc = procedureMockUtils.getInstance<Params, SecurityToken>(mockContext);

    return expect(
      prepareTogglePauseRequirements.call(proc, {
        ticker,
        pause: true,
      })
    ).rejects.toThrow('Requirements are already paused');
  });

  test('should throw an error if pause is set to false and the asset compliance requirements are already unpaused', () => {
    assetCompliancesStub.withArgs(rawTicker).returns({
      // eslint-disable-next-line @typescript-eslint/camelcase
      is_paused: false,
    });

    boolToBooleanStub.returns(false);

    const proc = procedureMockUtils.getInstance<Params, SecurityToken>(mockContext);

    return expect(
      prepareTogglePauseRequirements.call(proc, {
        ticker,
        pause: false,
      })
    ).rejects.toThrow('Requirements are already unpaused');
  });

  test('should add a pause asset compliance transaction to the queue', async () => {
    assetCompliancesStub.withArgs(rawTicker).returns({
      // eslint-disable-next-line @typescript-eslint/camelcase
      is_paused: false,
    });

    boolToBooleanStub.returns(false);

    const proc = procedureMockUtils.getInstance<Params, SecurityToken>(mockContext);

    const transaction = dsMockUtils.createTxStub('complianceManager', 'pauseAssetCompliance');

    const result = await prepareTogglePauseRequirements.call(proc, {
      ticker,
      pause: true,
    });

    sinon.assert.calledWith(addTransactionStub, transaction, {}, rawTicker);

    expect(ticker).toBe(result.ticker);
  });

  test('should add a resume asset compliance transaction to the queue', async () => {
    const proc = procedureMockUtils.getInstance<Params, SecurityToken>(mockContext);

    const transaction = dsMockUtils.createTxStub('complianceManager', 'resumeAssetCompliance');

    const result = await prepareTogglePauseRequirements.call(proc, {
      ticker,
      pause: false,
    });

    sinon.assert.calledWith(addTransactionStub, transaction, {}, rawTicker);

    expect(ticker).toBe(result.ticker);
  });

  describe('getAuthorization', () => {
    test('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<Params, SecurityToken>(mockContext);
      const boundFunc = getAuthorization.bind(proc);
      const args = {
        ticker,
      } as Params;

      expect(boundFunc(args)).toEqual({
        identityRoles: [{ type: RoleType.TokenOwner, ticker }],
        signerPermissions: {
          transactions: [TxTags.complianceManager.PauseAssetCompliance],
          tokens: [entityMockUtils.getSecurityTokenInstance({ ticker })],
          portfolios: [],
        },
      });
    });
  });
});
