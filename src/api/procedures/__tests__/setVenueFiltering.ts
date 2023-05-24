import { bool, u64 } from '@polkadot/types';
import { PolymeshPrimitivesTicker } from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import {
  getAuthorization,
  Params,
  prepareVenueFiltering,
  setVenueFiltering,
} from '~/api/procedures/setVenueFiltering';
import { Context } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { MockCodec } from '~/testUtils/mocks/dataSources';
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
  let bigNumberToU64Spy: jest.SpyInstance<u64, [BigNumber, Context]>;
  let rawEnabledTicker: PolymeshPrimitivesTicker;
  let rawFalse: bool;
  const venues: BigNumber[] = [new BigNumber(1)];
  let rawVenues: MockCodec<u64>[];

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    stringToTickerSpy = jest.spyOn(utilsConversionModule, 'stringToTicker');
    booleanToBoolSpy = jest.spyOn(utilsConversionModule, 'booleanToBool');
    bigNumberToU64Spy = jest.spyOn(utilsConversionModule, 'bigNumberToU64');
    rawEnabledTicker = dsMockUtils.createMockTicker(enabledTicker);
    rawFalse = dsMockUtils.createMockBool(false);
  });

  beforeEach(() => {
    entityMockUtils.configureMocks();
    mockContext = dsMockUtils.getContextInstance();
    venueFilteringMock = dsMockUtils.createQueryMock('settlement', 'venueFiltering');
    rawVenues = venues.map(venue => dsMockUtils.createMockU64(venue));

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
    when(bigNumberToU64Spy).calledWith(venues[0], mockContext).mockReturnValue(rawVenues[0]);
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
    it('should return a setVenueFiltering transaction spec', async () => {
      const proc = procedureMockUtils.getInstance<Params, void>(mockContext);
      const setEnabled = false;
      const transaction = dsMockUtils.createTxMock('settlement', 'setVenueFiltering');

      const result = await prepareVenueFiltering.call(proc, {
        ticker: enabledTicker,
        enabled: setEnabled,
      });

      expect(result).toEqual({
        transactions: [
          {
            transaction,
            args: [rawEnabledTicker, rawFalse],
          },
        ],
        resolver: undefined,
      });
    });

    it('should return a allowVenues transaction spec', async () => {
      const proc = procedureMockUtils.getInstance<Params, void>(mockContext);
      const transaction = dsMockUtils.createTxMock('settlement', 'allowVenues');

      const result = await prepareVenueFiltering.call(proc, {
        ticker: enabledTicker,
        allowedVenues: venues,
      });

      expect(result).toEqual({
        transactions: [
          {
            transaction,
            args: [rawEnabledTicker, rawVenues],
          },
        ],
        resolver: undefined,
      });
    });

    it('should return a disallowVenues transaction spec', async () => {
      const proc = procedureMockUtils.getInstance<Params, void>(mockContext);
      const transaction = dsMockUtils.createTxMock('settlement', 'disallowVenues');

      const result = await prepareVenueFiltering.call(proc, {
        ticker: enabledTicker,
        disallowedVenues: venues,
      });

      expect(result).toEqual({
        transactions: [
          {
            transaction,
            args: [rawEnabledTicker, rawVenues],
          },
        ],
        resolver: undefined,
      });
    });

    it('should return empty transaction spec', async () => {
      const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

      const result = await prepareVenueFiltering.call(proc, {
        ticker: enabledTicker,
        disallowedVenues: [],
        allowedVenues: [],
      });

      console.log(result);

      expect(result).toEqual({
        transactions: [],
        resolver: undefined,
      });
    });
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions for setVenueFiltering', () => {
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

    it('should return the appropriate roles and permissions for allowVenues', () => {
      const proc = procedureMockUtils.getInstance<Params, void>(mockContext);
      const boundFunc = getAuthorization.bind(proc);
      const args: Params = {
        ticker: enabledTicker,
        allowedVenues: venues,
      };

      expect(boundFunc(args)).toEqual({
        permissions: {
          transactions: [TxTags.settlement.AllowVenues],
          assets: [expect.objectContaining({ ticker: enabledTicker })],
        },
      });
    });

    it('should return the appropriate roles and permissions for disallowVenues', () => {
      const proc = procedureMockUtils.getInstance<Params, void>(mockContext);
      const boundFunc = getAuthorization.bind(proc);
      const args: Params = {
        ticker: enabledTicker,
        disallowedVenues: venues,
      };

      expect(boundFunc(args)).toEqual({
        permissions: {
          transactions: [TxTags.settlement.DisallowVenues],
          assets: [expect.objectContaining({ ticker: enabledTicker })],
        },
      });
    });
  });
});
