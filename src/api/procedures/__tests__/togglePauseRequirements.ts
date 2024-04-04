import { bool } from '@polkadot/types';
import { PolymeshPrimitivesTicker } from '@polkadot/types/lookup';
import { when } from 'jest-when';

import {
  getAuthorization,
  Params,
  prepareTogglePauseRequirements,
} from '~/api/procedures/togglePauseRequirements';
import { Context } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { TxTags } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Asset/Fungible',
  require('~/testUtils/mocks/entities').mockFungibleAssetModule('~/api/entities/Asset/Fungible')
);

describe('togglePauseRequirements procedure', () => {
  let mockContext: Mocked<Context>;
  let stringToTickerSpy: jest.SpyInstance<PolymeshPrimitivesTicker, [string, Context]>;
  let assetCompliancesMock: jest.Mock;
  let boolToBooleanSpy: jest.SpyInstance<boolean, [bool]>;
  let ticker: string;
  let rawTicker: PolymeshPrimitivesTicker;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    stringToTickerSpy = jest.spyOn(utilsConversionModule, 'stringToTicker');
    boolToBooleanSpy = jest.spyOn(utilsConversionModule, 'boolToBoolean');
    ticker = 'TEST';
    rawTicker = dsMockUtils.createMockTicker(ticker);
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    when(stringToTickerSpy).calledWith(ticker, mockContext).mockReturnValue(rawTicker);
    assetCompliancesMock = dsMockUtils.createQueryMock('complianceManager', 'assetCompliances', {
      returnValue: [],
    });
    when(assetCompliancesMock).calledWith(rawTicker).mockResolvedValue({
      paused: true,
    });
    boolToBooleanSpy.mockReturnValue(true);
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
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    return expect(
      prepareTogglePauseRequirements.call(proc, {
        ticker,
        pause: true,
      })
    ).rejects.toThrow('Requirements are already paused');
  });

  it('should throw an error if pause is set to false and the asset compliance requirements are already unpaused', () => {
    when(assetCompliancesMock).calledWith(rawTicker).mockReturnValue({
      paused: false,
    });

    boolToBooleanSpy.mockReturnValue(false);

    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    return expect(
      prepareTogglePauseRequirements.call(proc, {
        ticker,
        pause: false,
      })
    ).rejects.toThrow('Requirements are already unpaused');
  });

  it('should return a pause asset compliance transaction spec', async () => {
    when(assetCompliancesMock).calledWith(rawTicker).mockReturnValue({
      paused: false,
    });

    boolToBooleanSpy.mockReturnValue(false);

    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    const transaction = dsMockUtils.createTxMock('complianceManager', 'pauseAssetCompliance');

    const result = await prepareTogglePauseRequirements.call(proc, {
      ticker,
      pause: true,
    });

    expect(result).toEqual({
      transaction,
      args: [rawTicker],
    });
  });

  it('should return a resume asset compliance transaction spec', async () => {
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    const transaction = dsMockUtils.createTxMock('complianceManager', 'resumeAssetCompliance');

    const result = await prepareTogglePauseRequirements.call(proc, {
      ticker,
      pause: false,
    });

    expect(result).toEqual({
      transaction,
      args: [rawTicker],
    });
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<Params, void>(mockContext);
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
