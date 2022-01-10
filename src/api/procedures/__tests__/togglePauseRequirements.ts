import { bool } from '@polkadot/types';
import { Ticker, TxTags } from 'polymesh-types/types';
import sinon from 'sinon';

import {
  getAuthorization,
  Params,
  prepareTogglePauseRequirements,
} from '~/api/procedures/togglePauseRequirements';
import { Asset, Context } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Asset',
  require('~/testUtils/mocks/entities').mockAssetModule('~/api/entities/Asset')
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
      paused: true,
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
    const proc = procedureMockUtils.getInstance<Params, Asset>(mockContext);

    return expect(
      prepareTogglePauseRequirements.call(proc, {
        ticker,
        pause: true,
      })
    ).rejects.toThrow('Requirements are already paused');
  });

  test('should throw an error if pause is set to false and the asset compliance requirements are already unpaused', () => {
    assetCompliancesStub.withArgs(rawTicker).returns({
      paused: false,
    });

    boolToBooleanStub.returns(false);

    const proc = procedureMockUtils.getInstance<Params, Asset>(mockContext);

    return expect(
      prepareTogglePauseRequirements.call(proc, {
        ticker,
        pause: false,
      })
    ).rejects.toThrow('Requirements are already unpaused');
  });

  test('should add a pause asset compliance transaction to the queue', async () => {
    assetCompliancesStub.withArgs(rawTicker).returns({
      paused: false,
    });

    boolToBooleanStub.returns(false);

    const proc = procedureMockUtils.getInstance<Params, Asset>(mockContext);

    const transaction = dsMockUtils.createTxStub('complianceManager', 'pauseAssetCompliance');

    const result = await prepareTogglePauseRequirements.call(proc, {
      ticker,
      pause: true,
    });

    sinon.assert.calledWith(addTransactionStub, transaction, {}, rawTicker);

    expect(ticker).toBe(result.ticker);
  });

  test('should add a resume asset compliance transaction to the queue', async () => {
    const proc = procedureMockUtils.getInstance<Params, Asset>(mockContext);

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
      const proc = procedureMockUtils.getInstance<Params, Asset>(mockContext);
      const boundFunc = getAuthorization.bind(proc);
      const args: Params = {
        ticker,
        pause: true,
      };

      expect(boundFunc(args)).toEqual({
        permissions: {
          transactions: [TxTags.complianceManager.PauseAssetCompliance],
          assets: [entityMockUtils.getAssetInstance({ ticker })],
          portfolios: [],
        },
      });

      args.pause = false;

      expect(boundFunc(args)).toEqual({
        permissions: {
          transactions: [TxTags.complianceManager.ResumeAssetCompliance],
          assets: [entityMockUtils.getAssetInstance({ ticker })],
          portfolios: [],
        },
      });
    });
  });
});
