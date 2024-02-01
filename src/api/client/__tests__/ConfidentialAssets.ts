import { PolymeshPrimitivesTicker } from '@polkadot/types/lookup';
import { when } from 'jest-when';

import { ConfidentialAssets } from '~/api/client/ConfidentialAssets';
import { ConfidentialAsset, Context, PolymeshError, PolymeshTransaction } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { ErrorCode } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/confidential/ConfidentialAsset',
  require('~/testUtils/mocks/entities').mockConfidentialAssetModule(
    '~/api/entities/confidential/ConfidentialAsset'
  )
);
jest.mock(
  '~/base/Procedure',
  require('~/testUtils/mocks/procedure').mockProcedureModule('~/base/Procedure')
);

describe('ConfidentialAssets Class', () => {
  let context: Mocked<Context>;
  let confidentialAssets: ConfidentialAssets;

  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();
    procedureMockUtils.initMocks();
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
    confidentialAssets = new ConfidentialAssets(context);
  });

  afterEach(() => {
    dsMockUtils.reset();
    entityMockUtils.reset();
    procedureMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
    procedureMockUtils.cleanup();
  });

  describe('method: getConfidentialAsset', () => {
    const id = '76702175-d8cb-e3a5-5a19-734433351e25';

    it('should return a specific Confidential Asset if exists', async () => {
      entityMockUtils.configureMocks({
        confidentialAssetOptions: { exists: true },
      });
      const confidentialAsset = await confidentialAssets.getConfidentialAsset({ id });

      expect(confidentialAsset).toBeInstanceOf(ConfidentialAsset);
    });

    it('should throw if the Confidential Asset does not exist', async () => {
      entityMockUtils.configureMocks({
        confidentialAssetOptions: { exists: false },
      });

      const expectedError = new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: 'Confidential Asset does not exists',
        data: { id },
      });

      return expect(confidentialAssets.getConfidentialAsset({ id })).rejects.toThrowError(
        expectedError
      );
    });
  });

  describe('method: createConfidentialAsset', () => {
    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const args = {
        ticker: 'FAKE_TICKER',
        data: 'SOME_DATA',
        auditors: ['someAuditorKey'],
        mediators: ['someMediatorDid'],
      };

      const expectedTransaction =
        'someTransaction' as unknown as PolymeshTransaction<ConfidentialAsset>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args, transformer: undefined }, context, {})
        .mockResolvedValue(expectedTransaction);

      const tx = await confidentialAssets.createConfidentialAsset(args);

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: getConfidentialAssetFromTicker', () => {
    let ticker: string;
    let rawTicker: PolymeshPrimitivesTicker;
    let stringToTickerSpy: jest.SpyInstance;
    let meshConfidentialAssetToAssetIdSpy: jest.SpyInstance;
    let assetId: string;

    beforeAll(() => {
      stringToTickerSpy = jest.spyOn(utilsConversionModule, 'stringToTicker');
      meshConfidentialAssetToAssetIdSpy = jest.spyOn(
        utilsConversionModule,
        'meshConfidentialAssetToAssetId'
      );
    });

    beforeEach(() => {
      ticker = 'SOME_TICKER';
      assetId = 'SOME_ASSET_ID';
      rawTicker = dsMockUtils.createMockTicker(ticker);
      when(stringToTickerSpy).calledWith(ticker, context).mockReturnValue(rawTicker);
      meshConfidentialAssetToAssetIdSpy.mockReturnValue(assetId);
    });

    it('should return the number of pending affirmations', async () => {
      dsMockUtils.createQueryMock('confidentialAsset', 'tickerToAsset', {
        returnValue: dsMockUtils.createMockOption(dsMockUtils.createMockU8aFixed(assetId)),
      });

      const result = await confidentialAssets.getConfidentialAssetFromTicker({ ticker });

      expect(result).toEqual(expect.objectContaining({ id: assetId }));
    });

    it('should throw an error if the count is not found', async () => {
      dsMockUtils.createQueryMock('confidentialAsset', 'tickerToAsset', {
        returnValue: dsMockUtils.createMockOption(),
      });

      const expectedError = new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: 'The ticker is not mapped to any Confidential Asset',
        data: {
          ticker,
        },
      });

      return expect(confidentialAssets.getConfidentialAssetFromTicker({ ticker })).rejects.toThrow(
        expectedError
      );
    });
  });
});
