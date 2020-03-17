import { ISubmittableResult } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';
import { Ticker } from 'polymesh-types/types';
import sinon from 'sinon';

import { TickerReservation } from '~/api/entities';
import {
  createTickerReservationResolver,
  prepareReserveTicker,
  ReserveTickerParams,
} from '~/api/procedures/reserveTicker';
import { PostTransactionValue } from '~/base';
import { Context } from '~/context';
import { entityMockUtils, polkadotMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { TickerReservationStatus } from '~/types';
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
  let fee: number;
  let reservation: PostTransactionValue<TickerReservation>;

  beforeAll(() => {
    polkadotMockUtils.initMocks({ contextOptions: { balance: new BigNumber(500) } });
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks({ identityOptions: { did: 'someOtherDid' } });
    stringToTickerStub = sinon.stub(utilsModule, 'stringToTicker');
    ticker = 'someTicker';
    rawTicker = polkadotMockUtils.createMockTicker(ticker);
    args = {
      ticker,
    };
    fee = 250;
    reservation = ('reservation' as unknown) as PostTransactionValue<TickerReservation>;
  });

  let addTransactionStub: sinon.SinonStub;

  let transaction: PolymeshTx<[string | Ticker | Uint8Array]>;

  beforeEach(() => {
    addTransactionStub = procedureMockUtils.getAddTransactionStub().returns([reservation]);

    entityMockUtils.getTickerReservationDetailsStub().resolves({
      owner: entityMockUtils.getIdentityInstance(),
      expiryDate: null,
      status: TickerReservationStatus.Free,
    });

    polkadotMockUtils.createQueryStub('asset', 'tickerRegistrationFee', {
      returnValue: polkadotMockUtils.createMockBalance(fee * Math.pow(10, 6)),
    });
    polkadotMockUtils.createQueryStub('asset', 'tickerConfig', {
      returnValue: polkadotMockUtils.createMockTickerRegistrationConfig(),
    });

    transaction = polkadotMockUtils.createTxStub('asset', 'registerTicker');

    mockContext = polkadotMockUtils.getContextInstance();

    stringToTickerStub.withArgs(ticker, mockContext).returns(rawTicker);
  });

  afterEach(() => {
    entityMockUtils.reset();
    procedureMockUtils.reset();
    polkadotMockUtils.reset();
  });

  afterAll(() => {
    entityMockUtils.cleanup();
    procedureMockUtils.cleanup();
    polkadotMockUtils.cleanup();
  });

  test('should throw an error if the ticker is already reserved', () => {
    const expiryDate = new Date(new Date().getTime() + 1000);
    entityMockUtils.getTickerReservationDetailsStub().resolves({
      owner: entityMockUtils.getIdentityInstance(),
      expiryDate,
      status: TickerReservationStatus.Reserved,
    });
    const proc = procedureMockUtils.getInstance<ReserveTickerParams, TickerReservation>();
    proc.context = mockContext;

    return expect(prepareReserveTicker.call(proc, args)).rejects.toThrow(
      `Ticker "${ticker}" already reserved. The current reservation will expire at ${expiryDate}`
    );
  });

  test('should throw an error if the current reservation is permanent', () => {
    entityMockUtils.getTickerReservationDetailsStub().resolves({
      owner: entityMockUtils.getIdentityInstance(),
      expiryDate: null,
      status: TickerReservationStatus.Reserved,
    });
    const proc = procedureMockUtils.getInstance<ReserveTickerParams, TickerReservation>();
    proc.context = mockContext;

    return expect(prepareReserveTicker.call(proc, args)).rejects.toThrow(
      `Ticker "${ticker}" already reserved. The current reservation will not expire`
    );
  });

  test('should throw an error if a token with that ticker has already been launched', () => {
    entityMockUtils.getTickerReservationDetailsStub().resolves({
      owner: entityMockUtils.getIdentityInstance(),
      expiryDate: null,
      status: TickerReservationStatus.TokenCreated,
    });
    const proc = procedureMockUtils.getInstance<ReserveTickerParams, TickerReservation>();
    proc.context = mockContext;

    return expect(prepareReserveTicker.call(proc, args)).rejects.toThrow(
      `A Security Token with ticker "${ticker}" already exists`
    );
  });

  test('should throw an error if the ticker length exceeds the maximum', () => {
    const maxTickerLength = 3;
    polkadotMockUtils.createQueryStub('asset', 'tickerConfig', {
      returnValue: polkadotMockUtils.createMockTickerRegistrationConfig({
        /* eslint-disable @typescript-eslint/camelcase */
        max_ticker_length: polkadotMockUtils.createMockU8(maxTickerLength),
        registration_length: polkadotMockUtils.createMockOption(
          polkadotMockUtils.createMockMoment(10000)
        ),
        /* eslint-enable @typescript-eslint/camelcase */
      }),
    });
    const proc = procedureMockUtils.getInstance<ReserveTickerParams, TickerReservation>();
    proc.context = mockContext;

    return expect(prepareReserveTicker.call(proc, args)).rejects.toThrow(
      `Ticker length cannot exceed ${maxTickerLength}`
    );
  });

  test("should throw an error if the signing account doesn't have enough balance", () => {
    polkadotMockUtils.createQueryStub('asset', 'tickerRegistrationFee', {
      returnValue: polkadotMockUtils.createMockBalance(600000000),
    });
    const proc = procedureMockUtils.getInstance<ReserveTickerParams, TickerReservation>();
    proc.context = mockContext;

    return expect(prepareReserveTicker.call(proc, args)).rejects.toThrow(
      'Not enough POLY balance to pay for ticker reservation'
    );
  });

  test('should throw an error if extendPeriod property is set to true and the ticker has not been reserved or the reservation has expired', async () => {
    const expiryDate = new Date(2019, 1, 1);
    entityMockUtils.getTickerReservationDetailsStub().resolves({
      owner: entityMockUtils.getIdentityInstance(),
      expiryDate,
      status: TickerReservationStatus.Free,
    });
    const proc = procedureMockUtils.getInstance<ReserveTickerParams, TickerReservation>();
    proc.context = mockContext;

    return expect(prepareReserveTicker.call(proc, { ...args, extendPeriod: true })).rejects.toThrow(
      'Ticker not reserved or the reservation has expired'
    );
  });

  test("should throw an error if extendPeriod property is set to true and the signing account doesn't have enough balance", () => {
    const expiryDate = new Date(new Date().getTime() + 1000);
    entityMockUtils.getTickerReservationDetailsStub().resolves({
      owner: entityMockUtils.getIdentityInstance({ did: 'someDid' }),
      expiryDate,
      status: TickerReservationStatus.Reserved,
    });
    polkadotMockUtils.createQueryStub('asset', 'tickerRegistrationFee', {
      returnValue: polkadotMockUtils.createMockBalance(600000000),
    });
    const proc = procedureMockUtils.getInstance<ReserveTickerParams, TickerReservation>();
    proc.context = mockContext;

    return expect(prepareReserveTicker.call(proc, { ...args, extendPeriod: true })).rejects.toThrow(
      'Not enough POLY balance to pay for ticker period extension'
    );
  });

  test('should throw an error if extendPeriod property is set to true and the signing account is not the ticker owner', () => {
    const expiryDate = new Date(new Date().getTime() + 1000);
    entityMockUtils.getTickerReservationDetailsStub().resolves({
      owner: entityMockUtils.getIdentityInstance(),
      expiryDate,
      status: TickerReservationStatus.Reserved,
    });
    const proc = procedureMockUtils.getInstance<ReserveTickerParams, TickerReservation>();
    proc.context = mockContext;

    return expect(prepareReserveTicker.call(proc, { ...args, extendPeriod: true })).rejects.toThrow(
      'You must be the owner of the ticker to extend its reservation period'
    );
  });

  test('should add a register ticker transaction to the queue', async () => {
    const proc = procedureMockUtils.getInstance<ReserveTickerParams, TickerReservation>();
    proc.context = mockContext;

    const result = await prepareReserveTicker.call(proc, args);

    sinon.assert.calledWith(
      addTransactionStub,
      transaction,
      sinon.match({
        fee: new BigNumber(fee),
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
  const ticker = polkadotMockUtils.createMockTicker(tickerString);

  beforeAll(() => {
    entityMockUtils.initMocks({ tickerReservationOptions: { ticker: tickerString } });
  });

  beforeEach(() => {
    findEventRecordStub.returns(polkadotMockUtils.createMockEventRecord([ticker]));
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
