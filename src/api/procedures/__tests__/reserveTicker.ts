import { Balance } from '@polkadot/types/interfaces';
import { ISubmittableResult } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';
import { PosRatio, Ticker } from 'polymesh-types/types';
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
import { entityMockUtils, polkadotMockUtils, procedureMockUtils } from '~/testUtils/mocks';
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
  let posRatioToBigNumberStub: sinon.SinonStub<[PosRatio], BigNumber>;
  let balanceToBigNumberStub: sinon.SinonStub<[Balance], BigNumber>;
  let ticker: string;
  let rawTicker: Ticker;
  let args: ReserveTickerParams;
  let fee: number;
  let reservation: PostTransactionValue<TickerReservation>;
  let rawPosRatio: PosRatio;
  let rawFee: Balance;
  let numerator: number;
  let denominator: number;
  let posRatioToBigNumberResult: BigNumber;

  beforeAll(() => {
    polkadotMockUtils.initMocks({ contextOptions: { balance: new BigNumber(1000) } });
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks({ identityOptions: { did: 'someOtherDid' } });
    stringToTickerStub = sinon.stub(utilsModule, 'stringToTicker');
    posRatioToBigNumberStub = sinon.stub(utilsModule, 'posRatioToBigNumber');
    balanceToBigNumberStub = sinon.stub(utilsModule, 'balanceToBigNumber');
    ticker = 'someTicker';
    rawTicker = polkadotMockUtils.createMockTicker(ticker);
    args = {
      ticker,
    };
    fee = 250;
    numerator = 7;
    denominator = 3;
    reservation = ('reservation' as unknown) as PostTransactionValue<TickerReservation>;
    rawPosRatio = polkadotMockUtils.createMockPosRatio(numerator, denominator);
    rawFee = polkadotMockUtils.createMockBalance(fee);
    posRatioToBigNumberResult = new BigNumber(numerator).dividedBy(new BigNumber(denominator));
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

    polkadotMockUtils.createQueryStub('protocolFee', 'coefficient', {
      returnValue: rawPosRatio,
    });
    polkadotMockUtils.createQueryStub('protocolFee', 'baseFees', {
      returnValue: rawFee,
    });
    polkadotMockUtils.createQueryStub('asset', 'tickerConfig', {
      returnValue: polkadotMockUtils.createMockTickerRegistrationConfig(),
    });

    transaction = polkadotMockUtils.createTxStub('asset', 'registerTicker');

    mockContext = polkadotMockUtils.getContextInstance();

    stringToTickerStub.withArgs(ticker, mockContext).returns(rawTicker);

    posRatioToBigNumberStub
      .withArgs(rawPosRatio)
      .returns(new BigNumber(numerator).dividedBy(new BigNumber(denominator)));

    posRatioToBigNumberStub.withArgs(rawPosRatio).returns(posRatioToBigNumberResult);

    balanceToBigNumberStub.withArgs(rawFee).returns(new BigNumber(fee));
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
    const fakeValue = 600000000;
    const fakeBalance = polkadotMockUtils.createMockBalance(fakeValue);
    polkadotMockUtils.createQueryStub('protocolFee', 'baseFees', {
      returnValue: fakeBalance,
    });
    balanceToBigNumberStub.withArgs(fakeBalance).returns(new BigNumber(fakeValue));
    const proc = procedureMockUtils.getInstance<ReserveTickerParams, TickerReservation>();
    proc.context = mockContext;

    return expect(prepareReserveTicker.call(proc, args)).rejects.toThrow(
      'Not enough POLYX balance to pay for ticker reservation'
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
    const fakeValue = 600000000;
    const fakeBalance = polkadotMockUtils.createMockBalance(fakeValue);
    entityMockUtils.getTickerReservationDetailsStub().resolves({
      owner: entityMockUtils.getIdentityInstance({ did: 'someDid' }),
      expiryDate,
      status: TickerReservationStatus.Reserved,
    });
    polkadotMockUtils.createQueryStub('protocolFee', 'baseFees', {
      returnValue: fakeBalance,
    });
    balanceToBigNumberStub.withArgs(fakeBalance).returns(new BigNumber(fakeValue));

    const proc = procedureMockUtils.getInstance<ReserveTickerParams, TickerReservation>();
    proc.context = mockContext;

    return expect(prepareReserveTicker.call(proc, { ...args, extendPeriod: true })).rejects.toThrow(
      'Not enough POLYX balance to pay for ticker period extension'
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
        fee: new BigNumber(fee).multipliedBy(posRatioToBigNumberResult),
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
