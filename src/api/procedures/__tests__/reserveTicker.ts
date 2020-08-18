import { ISubmittableResult } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';
import { Ticker } from 'polymesh-types/types';
import sinon from 'sinon';

import { TickerReservation } from '~/api/entities';
import {
  createTickerReservationResolver,
  getRequiredRoles,
  prepareReserveTicker,
  ReserveTickerParams,
} from '~/api/procedures/reserveTicker';
import { PostTransactionValue } from '~/base';
import { Context } from '~/context';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { RoleType, TickerReservationStatus } from '~/types';
import { PolymeshTx } from '~/types/internal';
import * as utilsModule from '~/utils';

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
      contextOptions: { balance: { free: new BigNumber(1000), locked: new BigNumber(0) } },
    });
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks({ identityOptions: { did: 'someOtherDid' } });
    stringToTickerStub = sinon.stub(utilsModule, 'stringToTicker');
    ticker = 'SOMETICKER';
    rawTicker = dsMockUtils.createMockTicker(ticker);
    args = {
      ticker,
    };
    reservation = ('reservation' as unknown) as PostTransactionValue<TickerReservation>;
  });

  let addTransactionStub: sinon.SinonStub;

  let transaction: PolymeshTx<[Ticker]>;

  beforeEach(() => {
    addTransactionStub = procedureMockUtils.getAddTransactionStub().returns([reservation]);

    entityMockUtils.getTickerReservationDetailsStub().resolves({
      owner: entityMockUtils.getIdentityInstance(),
      expiryDate: null,
      status: TickerReservationStatus.Free,
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
    entityMockUtils.cleanup();
    procedureMockUtils.cleanup();
    dsMockUtils.cleanup();
  });

  test('should throw if ticker symbol is invalid', async () => {
    const proc = procedureMockUtils.getInstance<ReserveTickerParams, TickerReservation>(
      mockContext
    );

    let error;

    try {
      await prepareReserveTicker.call(proc, { ticker: '' });
    } catch (err) {
      error = err;
    }

    expect(error.message).toBe(
      'The ticker must be between 1 and 12 characters long and cannot contain lower case letters'
    );

    try {
      await prepareReserveTicker.call(proc, { ticker: 'ALONGLONGTICKERSYMBOL' });
    } catch (err) {
      error = err;
    }

    expect(error.message).toBe(
      'The ticker must be between 1 and 12 characters long and cannot contain lower case letters'
    );

    try {
      await prepareReserveTicker.call(proc, { ticker: 'test' });
    } catch (err) {
      error = err;
    }

    expect(error.message).toBe(
      'The ticker must be between 1 and 12 characters long and cannot contain lower case letters'
    );
  });

  test('should throw an error if the ticker is already reserved', async () => {
    const expiryDate = new Date(new Date().getTime() + 1000);
    entityMockUtils.getTickerReservationDetailsStub().resolves({
      owner: entityMockUtils.getIdentityInstance(),
      expiryDate,
      status: TickerReservationStatus.Reserved,
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

  test('should throw an error if the current reservation is permanent', async () => {
    entityMockUtils.getTickerReservationDetailsStub().resolves({
      owner: entityMockUtils.getIdentityInstance(),
      expiryDate: null,
      status: TickerReservationStatus.Reserved,
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

  test('should throw an error if a token with that ticker has already been launched', () => {
    entityMockUtils.getTickerReservationDetailsStub().resolves({
      owner: entityMockUtils.getIdentityInstance(),
      expiryDate: null,
      status: TickerReservationStatus.TokenCreated,
    });
    const proc = procedureMockUtils.getInstance<ReserveTickerParams, TickerReservation>(
      mockContext
    );

    return expect(prepareReserveTicker.call(proc, args)).rejects.toThrow(
      `A Security Token with ticker "${ticker}" already exists`
    );
  });

  test('should throw an error if extendPeriod property is set to true and the ticker has not been reserved or the reservation has expired', async () => {
    const expiryDate = new Date(2019, 1, 1);
    entityMockUtils.getTickerReservationDetailsStub().resolves({
      owner: entityMockUtils.getIdentityInstance(),
      expiryDate,
      status: TickerReservationStatus.Free,
    });
    const proc = procedureMockUtils.getInstance<ReserveTickerParams, TickerReservation>(
      mockContext
    );

    return expect(prepareReserveTicker.call(proc, { ...args, extendPeriod: true })).rejects.toThrow(
      'Ticker not reserved or the reservation has expired'
    );
  });

  test('should add a register ticker transaction to the queue', async () => {
    const proc = procedureMockUtils.getInstance<ReserveTickerParams, TickerReservation>(
      mockContext
    );

    let result = await prepareReserveTicker.call(proc, args);

    sinon.assert.calledWith(
      addTransactionStub,
      transaction,
      sinon.match({
        resolvers: sinon.match.array,
      }),
      rawTicker
    );
    expect(result).toBe(reservation);

    entityMockUtils.getTickerReservationDetailsStub().resolves({
      owner: entityMockUtils.getIdentityInstance(),
      expriy: new Date(3000, 12, 12),
      status: TickerReservationStatus.Reserved,
    });

    result = await prepareReserveTicker.call(proc, { ...args, extendPeriod: true });

    sinon.assert.calledWith(
      addTransactionStub,
      transaction,
      sinon.match({
        resolvers: sinon.match.array,
      }),
      rawTicker
    );
    expect(result).toBe(reservation);
  });
});

describe('tickerReservationResolver', () => {
  const findEventRecordStub = sinon.stub(utilsModule, 'findEventRecord');
  const tickerString = 'someTicker';
  const ticker = dsMockUtils.createMockTicker(tickerString);

  beforeAll(() => {
    entityMockUtils.initMocks({ tickerReservationOptions: { ticker: tickerString } });
  });

  beforeEach(() => {
    findEventRecordStub.returns(dsMockUtils.createMockEventRecord(['someDid', ticker]));
  });

  afterEach(() => {
    findEventRecordStub.reset();
  });

  test('should return the new Ticker Reservation', () => {
    const fakeContext = {} as Context;

    const result = createTickerReservationResolver(fakeContext)({} as ISubmittableResult);

    expect(result.ticker).toBe(tickerString);
  });
});

describe('getRequiredRoles', () => {
  test('should return a ticker owner role if extending a reservation', () => {
    const ticker = 'someTicker';
    const args = {
      ticker,
      extendPeriod: true,
    };

    expect(getRequiredRoles(args)).toEqual([{ type: RoleType.TickerOwner, ticker }]);
  });

  test('should return an empty array if not extending a reservation', () => {
    const ticker = 'someTicker';
    const args = {
      ticker,
    };

    expect(getRequiredRoles(args)).toEqual([]);
  });
});
