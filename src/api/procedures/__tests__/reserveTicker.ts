import { TxTags } from '@polymathnetwork/polkadot/api/types';
import { Ticker } from '@polymathnetwork/polkadot/types/interfaces';
import { ISubmittableResult } from '@polymathnetwork/polkadot/types/types';
import BigNumber from 'bignumber.js';
import sinon from 'sinon';
import { ImportMock, MockManager } from 'ts-mock-imports';

/* eslint-disable import/no-duplicates */
import { TickerReservation } from '~/api/entities';
import * as entitiesModule from '~/api/entities';
/* eslint-enable import/no-duplicates */
import {
  createTickerReservationResolver,
  prepareReserveTicker,
  ReserveTickerParams,
} from '~/api/procedures/reserveTicker';
import { PostTransactionValue } from '~/base';
import * as procedureModule from '~/base/Procedure';
import { Context } from '~/context';
import {
  createMockBalance,
  createMockEventRecord,
  createMockMoment,
  createMockOption,
  createMockSecurityToken,
  createMockTicker,
  createMockTickerRegistration,
  createMockTickerRegistrationConfig,
  createMockU8,
  PolkadotMockFactory,
} from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { TickerReservationStatus } from '~/types';
import { PolymeshTx } from '~/types/internal';
import * as utilsModule from '~/utils';

describe('reserveTicker procedure', () => {
  let mockProcedure: MockManager<procedureModule.Procedure<ReserveTickerParams, TickerReservation>>;
  let mockTickerReservation: MockManager<entitiesModule.TickerReservation>;
  const mockFactory = new PolkadotMockFactory();
  let mockContext: Mocked<Context>;

  mockFactory.initMocks({ mockContext: { balance: new BigNumber(500) } });

  const stringToTickerStub = sinon.stub(utilsModule, 'stringToTicker');

  const ticker = 'someTicker';
  const rawTicker = createMockTicker(ticker);
  const args: ReserveTickerParams = {
    ticker,
  };
  const fee = 250;

  let addTransactionStub: sinon.SinonStub;

  const reservation = ('reservation' as unknown) as PostTransactionValue<TickerReservation>;

  let transaction: PolymeshTx<[string | Ticker | Uint8Array]>;

  beforeEach(() => {
    mockProcedure = ImportMock.mockClass<
      procedureModule.Procedure<ReserveTickerParams, TickerReservation>
    >(procedureModule, 'Procedure');
    addTransactionStub = mockProcedure.mock('addTransaction').returns([reservation]);

    mockTickerReservation = ImportMock.mockClass<entitiesModule.TickerReservation>(
      entitiesModule,
      'TickerReservation'
    );
    mockTickerReservation.mock('details', {
      ownerDid: null,
      expiryDate: null,
      status: TickerReservationStatus.Free,
    });

    mockFactory.createQueryStub('asset', 'tickerRegistrationFee', {
      returnValue: createMockBalance(fee * Math.pow(10, 6)),
    });
    mockFactory.createQueryStub('asset', 'tickers', {
      returnValue: createMockTickerRegistration(),
    });
    mockFactory.createQueryStub('asset', 'tokens', { returnValue: createMockSecurityToken() });
    mockFactory.createQueryStub('asset', 'tickerConfig', {
      returnValue: createMockTickerRegistrationConfig(),
    });

    transaction = mockFactory.createTxStub('asset', 'registerTicker');

    mockContext = mockFactory.getContextInstance();

    stringToTickerStub.withArgs(ticker, mockContext).returns(rawTicker);
  });

  afterEach(() => {
    mockProcedure.restore();
    mockTickerReservation.restore();
    mockFactory.reset();
    stringToTickerStub.reset();
  });

  afterAll(() => {
    mockFactory.cleanup();
  });

  test('should throw an error if the ticker is already reserved', () => {
    const expiryDate = new Date(new Date().getTime() + 1000);
    mockTickerReservation.mock('details', {
      ownerDid: 'someDid',
      expiryDate,
      status: TickerReservationStatus.Reserved,
    });
    const proc = mockProcedure.getMockInstance();
    proc.context = mockContext;

    return expect(prepareReserveTicker.call(proc, args)).rejects.toThrow(
      `Ticker "${ticker}" already reserved. The current reservation will expire at ${expiryDate}`
    );
  });

  test('should throw an error if the current reservation is permanent', () => {
    mockTickerReservation.mock('details', {
      ownerDid: 'someDid',
      expiryDate: null,
      status: TickerReservationStatus.Reserved,
    });
    const proc = mockProcedure.getMockInstance();
    proc.context = mockContext;

    return expect(prepareReserveTicker.call(proc, args)).rejects.toThrow(
      `Ticker "${ticker}" already reserved. The current reservation will not expire`
    );
  });

  test('should throw an error if a token with that ticker has already been launched', () => {
    mockTickerReservation.mock('details', {
      ownerDid: 'someDid',
      expiryDate: null,
      status: TickerReservationStatus.TokenCreated,
    });
    const proc = mockProcedure.getMockInstance();
    proc.context = mockContext;

    return expect(prepareReserveTicker.call(proc, args)).rejects.toThrow(
      `A Security Token with ticker "${ticker} already exists`
    );
  });

  test('should throw an error if the ticker length exceeds the maximum', () => {
    const maxTickerLength = 3;
    mockFactory.createQueryStub('asset', 'tickerConfig', {
      returnValue: createMockTickerRegistrationConfig({
        /* eslint-disable @typescript-eslint/camelcase */
        max_ticker_length: createMockU8(maxTickerLength),
        registration_length: createMockOption(createMockMoment(10000)),
        /* eslint-enable @typescript-eslint/camelcase */
      }),
    });
    const proc = mockProcedure.getMockInstance();
    proc.context = mockContext;

    return expect(prepareReserveTicker.call(proc, args)).rejects.toThrow(
      `Ticker length cannot exceed ${maxTickerLength}`
    );
  });

  test("should throw an error if the signing account doesn't have enough balance", () => {
    mockFactory.createQueryStub('asset', 'tickerRegistrationFee', {
      returnValue: createMockBalance(600000000),
    });
    const proc = mockProcedure.getMockInstance();
    proc.context = mockContext;

    return expect(prepareReserveTicker.call(proc, args)).rejects.toThrow(
      'Not enough POLY balance to pay for ticker reservation'
    );
  });

  test('should add a register ticker transaction to the queue', async () => {
    const proc = mockProcedure.getMockInstance();
    proc.context = mockContext;

    const result = await prepareReserveTicker.call(proc, args);

    sinon.assert.calledWith(
      addTransactionStub,
      transaction,
      sinon.match({
        tag: TxTags.asset.RegisterTicker,
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
  const ticker = 'someTicker';

  beforeEach(() => {
    findEventRecordStub.returns(createMockEventRecord([ticker]));
  });

  afterEach(() => {
    findEventRecordStub.reset();
  });

  test('should return the new Ticker Reservation', () => {
    const fakeContext = {} as Context;

    const result = createTickerReservationResolver(fakeContext)({} as ISubmittableResult);

    expect(result.ticker).toBe(ticker);
  });
});
