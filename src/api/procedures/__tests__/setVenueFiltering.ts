import { bool } from '@polkadot/types';
import { PolymeshPrimitivesTicker } from '@polkadot/types/lookup';
import { when } from 'jest-when';

import {
  getAuthorization,
  Params,
  prepareVenueFiltering,
  setVenueFiltering,
} from '~/api/procedures/setVenueFiltering';
import { Context } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { TxTags } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Venue',
  require('~/testUtils/mocks/entities').mockVenueModule('~/api/entities/Venue')
);

describe('setVenueFiltering procedure', () => {
  let mockContext: Mocked<Context>;
  let venueFilteringMock: jest.Mock;
  const enabledTicker = 'ENABLED';
  const disabledTicker = 'DISABLED';
  let stringToTickerSpy: jest.SpyInstance<PolymeshPrimitivesTicker, [string, Context]>;
  let booleanToBoolSpy: jest.SpyInstance<bool, [boolean, Context]>;
  let rawEnabledTicker: PolymeshPrimitivesTicker;
  let rawFalse: bool;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    stringToTickerSpy = jest.spyOn(utilsConversionModule, 'stringToTicker');
    booleanToBoolSpy = jest.spyOn(utilsConversionModule, 'booleanToBool');
    rawEnabledTicker = dsMockUtils.createMockTicker(enabledTicker);
    rawFalse = dsMockUtils.createMockBool(false);
  });

  beforeEach(() => {
    entityMockUtils.configureMocks();
    mockContext = dsMockUtils.getContextInstance();
    venueFilteringMock = dsMockUtils.createQueryMock('settlement', 'venueFiltering');

    when(venueFilteringMock)
      .calledWith(enabledTicker)
      .mockResolvedValue(dsMockUtils.createMockBool(true));
    when(venueFilteringMock)
      .calledWith(disabledTicker)
      .mockResolvedValue(dsMockUtils.createMockBool(false));
    when(stringToTickerSpy)
      .calledWith(enabledTicker, mockContext)
      .mockReturnValue(rawEnabledTicker);
    when(booleanToBoolSpy).calledWith(false, mockContext).mockReturnValue(rawFalse);
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

  describe('setVenueFiltering', () => {
    it('the procedure method should be defined', () => {
      expect(setVenueFiltering).toBeDefined();
    });

    it('calling it should return a new procedure', () => {
      const boundFunc = setVenueFiltering.bind(mockContext);

      expect(boundFunc).not.toThrow();
      expect(procedureMockUtils.getInstance<Params, void>(mockContext)).toBeDefined();
    });
  });

  describe('prepareVenueFiltering', () => {
    it('should throw an error if already enabled', () => {
      const args = {
        ticker: enabledTicker,
        enabled: true,
      };

      const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

      return expect(prepareVenueFiltering.call(proc, args)).rejects.toThrow(
        'Venue filtering is already enabled'
      );
    });

    it('should throw an error if already disabled', () => {
      const args = {
        ticker: disabledTicker,
        enabled: false,
      };

      const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

      return expect(prepareVenueFiltering.call(proc, args)).rejects.toThrow(
        'Venue filtering is already disabled'
      );
    });

    it('should return a set venue filtering transaction spec', async () => {
      const proc = procedureMockUtils.getInstance<Params, void>(mockContext);
      const setEnabled = false;
      const transaction = dsMockUtils.createTxMock('settlement', 'setVenueFiltering');

      const result = await prepareVenueFiltering.call(proc, {
        ticker: enabledTicker,
        enabled: setEnabled,
      });

      expect(result).toEqual({
        transaction,
        args: [rawEnabledTicker, rawFalse],
        resolver: undefined,
      });
    });
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<Params, void>(mockContext);
      const boundFunc = getAuthorization.bind(proc);
      const args: Params = {
        ticker: enabledTicker,
        enabled: true,
      };

      expect(boundFunc(args)).toEqual({
        permissions: {
          transactions: [TxTags.settlement.SetVenueFiltering],
          assets: [expect.objectContaining({ ticker: enabledTicker })],
        },
      });
    });
  });
});
