import { bool } from '@polkadot/types';
import { when } from 'jest-when';
import { Ticker } from 'polymesh-types/types';

import {
  getAuthorization,
  Params,
  prepareTogglePauseRequirements,
} from '~/api/procedures/togglePauseRequirements';
import { Asset, Context } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { TxTags } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Asset',
  require('~/testUtils/mocks/entities').mockAssetModule('~/api/entities/Asset')
);

describe('togglePauseRequirements procedure', () => {
  let mockContext: Mocked<Context>;
  let stringToTickerStub: jest.SpyInstance<Ticker, [string, Context]>;
  let assetCompliancesStub: jest.Mock;
  let boolToBooleanStub: jest.SpyInstance<boolean, [bool]>;
  let ticker: string;
  let rawTicker: Ticker;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    stringToTickerStub = jest.spyOn(utilsConversionModule, 'stringToTicker');
    boolToBooleanStub = jest.spyOn(utilsConversionModule, 'boolToBoolean');
    ticker = 'TEST';
    rawTicker = dsMockUtils.createMockTicker(ticker);
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    when(stringToTickerStub).calledWith(ticker, mockContext).mockReturnValue(rawTicker);
    assetCompliancesStub = dsMockUtils.createQueryStub('complianceManager', 'assetCompliances', {
      returnValue: [],
    });
    when(assetCompliancesStub).calledWith(rawTicker).mockResolvedValue({
      paused: true,
    });
    boolToBooleanStub.mockReturnValue(true);
  });

  afterEach(() => {
    entityMockUtils.reset();
    procedureMockUtils.reset();
    dsMockUtils.reset();
  });

  afterAll(() => {
    procedureMockUtils.cleanup();
    dsMockUtils.cleanup();
  });

  it('should throw an error if pause is set to true and the asset compliance requirements are already paused', () => {
    const proc = procedureMockUtils.getInstance<Params, Asset>(mockContext);

    return expect(
      prepareTogglePauseRequirements.call(proc, {
        ticker,
        pause: true,
      })
    ).rejects.toThrow('Requirements are already paused');
  });

  it('should throw an error if pause is set to false and the asset compliance requirements are already unpaused', () => {
    when(assetCompliancesStub).calledWith(rawTicker).mockReturnValue({
      paused: false,
    });

    boolToBooleanStub.mockReturnValue(false);

    const proc = procedureMockUtils.getInstance<Params, Asset>(mockContext);

    return expect(
      prepareTogglePauseRequirements.call(proc, {
        ticker,
        pause: false,
      })
    ).rejects.toThrow('Requirements are already unpaused');
  });

  it('should return a pause asset compliance transaction spec', async () => {
    when(assetCompliancesStub).calledWith(rawTicker).mockReturnValue({
      paused: false,
    });

    boolToBooleanStub.mockReturnValue(false);

    const proc = procedureMockUtils.getInstance<Params, Asset>(mockContext);

    const transaction = dsMockUtils.createTxStub('complianceManager', 'pauseAssetCompliance');

    const result = await prepareTogglePauseRequirements.call(proc, {
      ticker,
      pause: true,
    });

    expect(result).toEqual({
      transaction,
      args: [rawTicker],
      resolver: expect.objectContaining({ ticker }),
    });
  });

  it('should return a resume asset compliance transaction spec', async () => {
    const proc = procedureMockUtils.getInstance<Params, Asset>(mockContext);

    const transaction = dsMockUtils.createTxStub('complianceManager', 'resumeAssetCompliance');

    const result = await prepareTogglePauseRequirements.call(proc, {
      ticker,
      pause: false,
    });

    expect(result).toEqual({
      transaction,
      args: [rawTicker],
      resolver: expect.objectContaining({ ticker }),
    });
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<Params, Asset>(mockContext);
      const boundFunc = getAuthorization.bind(proc);
      const args: Params = {
        ticker,
        pause: true,
      };

      expect(boundFunc(args)).toEqual({
        permissions: {
          transactions: [TxTags.complianceManager.PauseAssetCompliance],
          assets: [expect.objectContaining({ ticker })],
          portfolios: [],
        },
      });

      args.pause = false;

      expect(boundFunc(args)).toEqual({
        permissions: {
          transactions: [TxTags.complianceManager.ResumeAssetCompliance],
          assets: [expect.objectContaining({ ticker })],
          portfolios: [],
        },
      });
    });
  });
});
