import { PolymeshPrimitivesTicker } from '@polkadot/types/lookup';
import { ISubmittableResult } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import {
  createTickerReservationResolver,
  getAuthorization,
  prepareReserveTicker,
} from '~/api/procedures/reserveTicker';
import { Context, TickerReservation } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { ReserveTickerParams, RoleType, TickerReservationStatus, TxTags } from '~/types';
import { PolymeshTx } from '~/types/internal';
import * as utilsConversionModule from '~/utils/conversion';
import * as utilsInternalModule from '~/utils/internal';

jest.mock(
  '~/api/entities/TickerReservation',
  require('~/testUtils/mocks/entities').mockTickerReservationModule(
    '~/api/entities/TickerReservation'
  )
);

describe('reserveTicker procedure', () => {
  let mockContext: Mocked<Context>;
  let stringToTickerSpy: jest.SpyInstance<PolymeshPrimitivesTicker, [string, Context]>;
  let ticker: string;
  let rawTicker: PolymeshPrimitivesTicker;
  let args: ReserveTickerParams;

  beforeAll(() => {
    dsMockUtils.initMocks({
      contextOptions: {
        balance: {
          free: new BigNumber(1000),
          locked: new BigNumber(0),
          total: new BigNumber(1000),
        },
      },
    });
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    stringToTickerSpy = jest.spyOn(utilsConversionModule, 'stringToTicker');
    ticker = 'SOME_TICKER';
    rawTicker = dsMockUtils.createMockTicker(ticker);
    args = {
      ticker,
    };
  });

  let transaction: PolymeshTx<[PolymeshPrimitivesTicker]>;

  beforeEach(() => {
    entityMockUtils.configureMocks({
      tickerReservationOptions: {
        details: {
          owner: entityMockUtils.getIdentityInstance({ did: 'someOtherDid' }),
          expiryDate: null,
          status: TickerReservationStatus.Free,
        },
      },
    });

    dsMockUtils.createQueryMock('asset', 'tickerConfig', {
      returnValue: dsMockUtils.createMockTickerRegistrationConfig(),
    });

    transaction = dsMockUtils.createTxMock('asset', 'registerTicker');

    mockContext = dsMockUtils.getContextInstance();

    when(stringToTickerSpy).calledWith(ticker, mockContext).mockReturnValue(rawTicker);
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

  it('should throw an error if the ticker is already reserved', async () => {
    const expiryDate = new Date(new Date().getTime() + 1000);
    entityMockUtils.configureMocks({
      tickerReservationOptions: {
        details: {
          owner: entityMockUtils.getIdentityInstance({ did: 'someOtherDid' }),
          expiryDate,
          status: TickerReservationStatus.Reserved,
        },
      },
    });
    const proc = procedureMockUtils.getInstance<ReserveTickerParams, TickerReservation>(
      mockContext
    );

    let error;

    try {
      await prepareReserveTicker.call(proc, args);
    } catch (err) {
      error = err;
    }

    expect(error.message).toBe(`Ticker "${ticker}" already reserved`);
    expect(error.data).toMatchObject({ expiryDate });
  });

  it('should throw an error if the current reservation is permanent', async () => {
    entityMockUtils.configureMocks({
      tickerReservationOptions: {
        details: {
          owner: entityMockUtils.getIdentityInstance({ did: 'someOtherDid' }),
          expiryDate: null,
          status: TickerReservationStatus.Reserved,
        },
      },
    });
    const proc = procedureMockUtils.getInstance<ReserveTickerParams, TickerReservation>(
      mockContext
    );

    let error;

    try {
      await prepareReserveTicker.call(proc, args);
    } catch (err) {
      error = err;
    }

    expect(error.message).toBe(`Ticker "${ticker}" already reserved`);
    expect(error.data).toMatchObject({ expiryDate: null });
  });

  it('should throw an error if an Asset with that ticker has already been launched', () => {
    entityMockUtils.configureMocks({
      tickerReservationOptions: {
        details: {
          owner: entityMockUtils.getIdentityInstance({ did: 'someOtherDid' }),
          expiryDate: null,
          status: TickerReservationStatus.AssetCreated,
        },
      },
    });
    const proc = procedureMockUtils.getInstance<ReserveTickerParams, TickerReservation>(
      mockContext
    );

    return expect(prepareReserveTicker.call(proc, args)).rejects.toThrow(
      `An Asset with ticker "${ticker}" already exists`
    );
  });

  it('should throw an error if extendPeriod property is set to true and the ticker has not been reserved or the reservation has expired', () => {
    const expiryDate = new Date(2019, 1, 1);
    entityMockUtils.configureMocks({
      tickerReservationOptions: {
        details: {
          owner: entityMockUtils.getIdentityInstance({ did: 'someOtherDid' }),
          expiryDate,
          status: TickerReservationStatus.Free,
        },
      },
    });
    const proc = procedureMockUtils.getInstance<ReserveTickerParams, TickerReservation>(
      mockContext
    );

    return expect(prepareReserveTicker.call(proc, { ...args, extendPeriod: true })).rejects.toThrow(
      'Ticker not reserved or the reservation has expired'
    );
  });

  it('should return a register ticker transaction spec', async () => {
    const proc = procedureMockUtils.getInstance<ReserveTickerParams, TickerReservation>(
      mockContext
    );

    let result = await prepareReserveTicker.call(proc, args);

    expect(result).toEqual({
      transaction,
      args: [rawTicker],
      resolver: expect.any(Function),
    });

    entityMockUtils.configureMocks({
      tickerReservationOptions: {
        details: {
          owner: entityMockUtils.getIdentityInstance({ did: 'someOtherDid' }),
          expiryDate: new Date(3000, 12, 12),
          status: TickerReservationStatus.Reserved,
        },
      },
    });

    result = await prepareReserveTicker.call(proc, { ...args, extendPeriod: true });

    expect(result).toEqual({ transaction, resolver: expect.any(Function), args: [rawTicker] });
  });
});

describe('tickerReservationResolver', () => {
  const filterEventRecordsSpy = jest.spyOn(utilsInternalModule, 'filterEventRecords');
  const tickerString = 'SOME_TICKER';
  const ticker = dsMockUtils.createMockTicker(tickerString);

  beforeAll(() => {
    entityMockUtils.initMocks({ tickerReservationOptions: { ticker: tickerString } });
  });

  beforeEach(() => {
    filterEventRecordsSpy.mockReturnValue([dsMockUtils.createMockIEvent(['someDid', ticker])]);
  });

  afterEach(() => {
    filterEventRecordsSpy.mockReset();
  });

  it('should return the new PolymeshPrimitivesTicker Reservation', () => {
    const fakeContext = {} as Context;

    const result = createTickerReservationResolver(fakeContext)({} as ISubmittableResult);

    expect(result.ticker).toBe(tickerString);
  });
});

describe('getAuthorization', () => {
  it('should return the appropriate roles and permissions', () => {
    const ticker = 'SOME_TICKER';
    const args = {
      ticker,
      extendPeriod: true,
    };

    const permissions = {
      transactions: [TxTags.asset.RegisterTicker],
      assets: [],
      portfolios: [],
    };

    expect(getAuthorization(args)).toEqual({
      roles: [{ type: RoleType.TickerOwner, ticker }],
      permissions,
    });

    args.extendPeriod = false;

    expect(getAuthorization(args)).toEqual({
      permissions,
    });
  });
});
