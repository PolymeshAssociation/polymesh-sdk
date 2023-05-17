import { u64 } from '@polkadot/types';
import { PolymeshPrimitivesTicker } from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import {
  getAuthorization,
  manageAllowedVenues,
  Params,
  prepareManageAllowedVenues,
} from '~/api/procedures/manageAllowedVenues';
import { Context } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { MockCodec } from '~/testUtils/mocks/dataSources';
import { Mocked } from '~/testUtils/types';
import { ManageVenuesAction, TxTags } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

describe('manageAllowedVenues procedure', () => {
  let mockContext: Mocked<Context>;
  const ticker = 'TICKER';
  const venues: BigNumber[] = [new BigNumber(1)];
  let rawTicker: PolymeshPrimitivesTicker;
  let rawVenues: MockCodec<u64>[];
  let stringToTickerSpy: jest.SpyInstance<PolymeshPrimitivesTicker, [string, Context]>;
  let bigNumberToU64Spy: jest.SpyInstance<u64, [BigNumber, Context]>;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    rawTicker = dsMockUtils.createMockTicker(ticker);
    rawVenues = venues.map(venue => dsMockUtils.createMockU64(venue));
    bigNumberToU64Spy = jest.spyOn(utilsConversionModule, 'bigNumberToU64');
    stringToTickerSpy = jest.spyOn(utilsConversionModule, 'stringToTicker');
  });

  beforeEach(() => {
    entityMockUtils.configureMocks();
    mockContext = dsMockUtils.getContextInstance();
    when(stringToTickerSpy).calledWith(ticker, mockContext).mockReturnValue(rawTicker);
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

  describe('manageAllowedVenues', () => {
    it('the procedure method should be defined', () => {
      expect(manageAllowedVenues).toBeDefined();
    });

    it('calling it should return a new procedure', () => {
      const boundFunc = manageAllowedVenues.bind(mockContext);

      expect(boundFunc).not.toThrow();
      expect(procedureMockUtils.getInstance<Params, void>(mockContext)).toBeDefined();
    });
  });

  describe('prepareManageAllowedVenues', () => {
    it('should return a allow venues transaction spec', async () => {
      const proc = procedureMockUtils.getInstance<Params, void>(mockContext);
      const transaction = dsMockUtils.createTxMock('settlement', 'allowVenues');

      const result = await prepareManageAllowedVenues.call(proc, {
        ticker,
        venues,
        action: ManageVenuesAction.Allow,
      });

      expect(result).toEqual({
        transaction,
        args: [rawTicker, rawVenues],
        resolver: undefined,
      });
    });

    it('should return a disallow venues transaction spec', async () => {
      const proc = procedureMockUtils.getInstance<Params, void>(mockContext);
      const transaction = dsMockUtils.createTxMock('settlement', 'disallowVenues');

      const result = await prepareManageAllowedVenues.call(proc, {
        ticker,
        venues,
        action: ManageVenuesAction.Disallow,
      });

      expect(result).toEqual({
        transaction,
        args: [rawTicker, rawVenues],
        resolver: undefined,
      });
    });
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions for enabling venues', () => {
      const proc = procedureMockUtils.getInstance<Params, void>(mockContext);
      const boundFunc = getAuthorization.bind(proc);
      const args: Params = {
        ticker,
        venues,
        action: ManageVenuesAction.Allow,
      };

      expect(boundFunc(args)).toEqual({
        permissions: {
          transactions: [TxTags.settlement.AllowVenues],
          assets: [expect.objectContaining({ ticker })],
        },
      });
    });

    it('should return the appropriate roles and permissions for disabling venues', () => {
      const proc = procedureMockUtils.getInstance<Params, void>(mockContext);
      const boundFunc = getAuthorization.bind(proc);
      const args: Params = {
        ticker,
        venues,
        action: ManageVenuesAction.Disallow,
      };

      expect(boundFunc(args)).toEqual({
        permissions: {
          transactions: [TxTags.settlement.DisallowVenues],
          assets: [expect.objectContaining({ ticker })],
        },
      });
    });
  });
});
