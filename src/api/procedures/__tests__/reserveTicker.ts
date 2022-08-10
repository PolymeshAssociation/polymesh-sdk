import { ISubmittableResult } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';
import { Ticker } from 'polymesh-types/types';
import sinon from 'sinon';

import {
  createTickerReservationResolver,
  getAuthorization,
  prepareReserveTicker,
} from '~/api/procedures/reserveTicker';
import { Context, PostTransactionValue, TickerReservation } from '~/internal';
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
  let stringToTickerStub: sinon.SinonStub<[string, Context], Ticker>;
  let ticker: string;
  let rawTicker: Ticker;
  let args: ReserveTickerParams;
  let reservation: PostTransactionValue<TickerReservation>;

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
    stringToTickerStub = sinon.stub(utilsConversionModule, 'stringToTicker');
    ticker = 'SOME_TICKER';
    rawTicker = dsMockUtils.createMockTicker(ticker);
    args = {
      ticker,
    };
    reservation = 'reservation' as unknown as PostTransactionValue<TickerReservation>;
  });

  let addTransactionStub: sinon.SinonStub;

  let transaction: PolymeshTx<[Ticker]>;

  beforeEach(() => {
    addTransactionStub = procedureMockUtils.getAddTransactionStub().returns([reservation]);

    entityMockUtils.configureMocks({
      tickerReservationOptions: {
        details: {
          owner: entityMockUtils.getIdentityInstance({ did: 'someOtherDid' }),
          expiryDate: null,
          status: TickerReservationStatus.Free,
        },
      },
    });

    dsMockUtils.createQueryStub('asset', 'tickerConfig', {
      returnValue: dsMockUtils.createMockTickerRegistrationConfig(),
    });

    transaction = dsMockUtils.createTxStub('asset', 'registerTicker');

    mockContext = dsMockUtils.getContextInstance();

    stringToTickerStub.withArgs(ticker, mockContext).returns(rawTicker);
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

  it('should add a register ticker transaction to the queue', async () => {
    const proc = procedureMockUtils.getInstance<ReserveTickerParams, TickerReservation>(
      mockContext
    );

    let result = await prepareReserveTicker.call(proc, args);

    sinon.assert.calledWith(
      addTransactionStub,
      sinon.match({
        transaction,
        resolvers: sinon.match.array,
        args: [rawTicker],
      })
    );
    expect(result).toBe(reservation);

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

    sinon.assert.calledWith(
      addTransactionStub,
      sinon.match({ transaction, resolvers: sinon.match.array, args: [rawTicker] })
    );
    expect(result).toBe(reservation);
  });
});

describe('tickerReservationResolver', () => {
  const filterEventRecordsStub = sinon.stub(utilsInternalModule, 'filterEventRecords');
  const tickerString = 'SOME_TICKER';
  const ticker = dsMockUtils.createMockTicker(tickerString);

  beforeAll(() => {
    entityMockUtils.initMocks({ tickerReservationOptions: { ticker: tickerString } });
  });

  beforeEach(() => {
    filterEventRecordsStub.returns([dsMockUtils.createMockIEvent(['someDid', ticker])]);
  });

  afterEach(() => {
    filterEventRecordsStub.reset();
  });

  it('should return the new Ticker Reservation', () => {
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
