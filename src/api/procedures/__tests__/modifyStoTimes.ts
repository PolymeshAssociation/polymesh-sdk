import BigNumber from 'bignumber.js';
import { Moment } from 'polymesh-types/types';
import sinon from 'sinon';

import { getAuthorization, Params, prepareModifyStoTimes } from '~/api/procedures/modifyStoTimes';
import { Context } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { StoBalanceStatus, StoSaleStatus, StoTimingStatus, TxTags } from '~/types';
import { PolymeshTx } from '~/types/internal';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Sto',
  require('~/testUtils/mocks/entities').mockStoModule('~/api/entities/Sto')
);
jest.mock(
  '~/api/entities/SecurityToken',
  require('~/testUtils/mocks/entities').mockSecurityTokenModule('~/api/entities/SecurityToken')
);

describe('modifyStoTimes procedure', () => {
  const ticker = 'SOMETICKER';
  const id = new BigNumber(1);
  const now = new Date();
  const newStart = new Date(now.getTime() + 700000);
  const newEnd = new Date(newStart.getTime() + 700000);
  const start = new Date(now.getTime() + 500000);
  const end = new Date(start.getTime() + 500000);

  const rawTicker = dsMockUtils.createMockTicker(ticker);
  const rawId = dsMockUtils.createMockU64(id.toNumber());
  const rawNewStart = dsMockUtils.createMockMoment(newStart.getTime());
  const rawNewEnd = dsMockUtils.createMockMoment(newEnd.getTime());
  const rawStart = dsMockUtils.createMockMoment(start.getTime());
  const rawEnd = dsMockUtils.createMockMoment(end.getTime());

  let mockContext: Mocked<Context>;
  let addTransactionStub: sinon.SinonStub;
  let modifyFundraiserWindowTransaction: PolymeshTx<unknown[]>;

  let dateToMomentStub: sinon.SinonStub<[Date, Context], Moment>;

  const args = {
    ticker,
    id,
    start: newStart,
    end: newEnd,
  };

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();

    sinon.stub(utilsConversionModule, 'stringToTicker').returns(rawTicker);
    sinon.stub(utilsConversionModule, 'numberToU64').returns(rawId);
    dateToMomentStub = sinon.stub(utilsConversionModule, 'dateToMoment');
  });

  beforeEach(() => {
    entityMockUtils.configureMocks({
      stoOptions: {
        details: {
          status: {
            sale: StoSaleStatus.Live,
            timing: StoTimingStatus.NotStarted,
            balance: StoBalanceStatus.Available,
          },
          start,
          end,
        },
      },
    });
    addTransactionStub = procedureMockUtils.getAddTransactionStub();
    mockContext = dsMockUtils.getContextInstance();

    dateToMomentStub.withArgs(newStart, mockContext).returns(rawNewStart);
    dateToMomentStub.withArgs(newEnd, mockContext).returns(rawNewEnd);
    dateToMomentStub.withArgs(start, mockContext).returns(rawStart);
    dateToMomentStub.withArgs(end, mockContext).returns(rawEnd);
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

  test('should add a modify fundraiser window transaction to the queue', async () => {
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);
    modifyFundraiserWindowTransaction = dsMockUtils.createTxStub('sto', 'modifyFundraiserWindow');

    await prepareModifyStoTimes.call(proc, args);

    sinon.assert.calledWith(
      addTransactionStub,
      modifyFundraiserWindowTransaction,
      {},
      rawTicker,
      rawId,
      rawNewStart,
      rawNewEnd
    );

    await prepareModifyStoTimes.call(proc, { ...args, start: undefined });

    sinon.assert.calledWith(
      addTransactionStub,
      modifyFundraiserWindowTransaction,
      {},
      rawTicker,
      rawId,
      rawStart,
      rawNewEnd
    );

    await prepareModifyStoTimes.call(proc, { ...args, end: null });

    sinon.assert.calledWith(
      addTransactionStub,
      modifyFundraiserWindowTransaction,
      {},
      rawTicker,
      rawId,
      rawNewStart,
      null
    );

    await prepareModifyStoTimes.call(proc, { ...args, end: undefined });

    sinon.assert.calledWith(
      addTransactionStub,
      modifyFundraiserWindowTransaction,
      {},
      rawTicker,
      rawId,
      rawNewStart,
      rawEnd
    );

    entityMockUtils.configureMocks({
      stoOptions: {
        details: {
          start,
          end: null,
          status: {
            sale: StoSaleStatus.Live,
            timing: StoTimingStatus.NotStarted,
            balance: StoBalanceStatus.Available,
          },
        },
      },
    });

    await prepareModifyStoTimes.call(proc, { ...args, end: undefined });

    sinon.assert.calledWith(
      addTransactionStub,
      modifyFundraiserWindowTransaction,
      {},
      rawTicker,
      rawId,
      rawNewStart,
      null
    );
  });

  test('should throw an error if nothing is being modified', async () => {
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    let err: Error | undefined;

    const message = 'Nothing to modify';

    try {
      await prepareModifyStoTimes.call(proc, { ...args, start, end });
    } catch (error) {
      err = error;
    }

    expect(err?.message).toBe(message);

    err = undefined;

    try {
      await prepareModifyStoTimes.call(proc, { ...args, start: undefined, end });
    } catch (error) {
      err = error;
    }

    expect(err?.message).toBe(message);

    try {
      await prepareModifyStoTimes.call(proc, { ...args, start, end: undefined });
    } catch (error) {
      err = error;
    }

    expect(err?.message).toBe(message);
  });

  test('should throw an error if the sto is already closed', () => {
    entityMockUtils.configureMocks({
      stoOptions: {
        details: {
          status: {
            sale: StoSaleStatus.Closed,
            timing: StoTimingStatus.Started,
            balance: StoBalanceStatus.Available,
          },
        },
      },
    });

    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    return expect(prepareModifyStoTimes.call(proc, args)).rejects.toThrow(
      'The STO is already closed'
    );
  });

  test('should throw an error if the STO has already ended', async () => {
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    entityMockUtils.configureMocks({
      stoOptions: {
        details: {
          start: now,
          end: now,
          status: {
            sale: StoSaleStatus.Live,
            timing: StoTimingStatus.Expired,
            balance: StoBalanceStatus.Available,
          },
        },
      },
    });

    let err: Error | undefined;

    try {
      await prepareModifyStoTimes.call(proc, args);
    } catch (error) {
      err = error;
    }

    expect(err?.message).toBe('The STO has already ended');
  });

  test('should throw an error if attempting to modify the start time of an STO that has already started', async () => {
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    entityMockUtils.configureMocks({
      stoOptions: {
        details: {
          start: new Date(now.getTime() - 1000),
          end,
          status: {
            sale: StoSaleStatus.Live,
            timing: StoTimingStatus.Started,
            balance: StoBalanceStatus.Available,
          },
        },
      },
    });

    let err: Error | undefined;

    try {
      await prepareModifyStoTimes.call(proc, args);
    } catch (error) {
      err = error;
    }

    expect(err?.message).toBe('Cannot modify the start time of an STO that already started');
  });

  test('should throw an error if the new times are in the past', async () => {
    entityMockUtils.configureMocks({
      stoOptions: {
        details: {
          status: {
            timing: StoTimingStatus.NotStarted,
            balance: StoBalanceStatus.Available,
            sale: StoSaleStatus.Live,
          },
        },
      },
    });

    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    let err: Error | undefined;

    const past = new Date(now.getTime() - 1000);

    const message = 'New dates are in the past';

    try {
      await prepareModifyStoTimes.call(proc, { ...args, start: past });
    } catch (error) {
      err = error;
    }

    expect(err?.message).toBe(message);

    err = undefined;

    try {
      await prepareModifyStoTimes.call(proc, { ...args, end: past });
    } catch (error) {
      err = error;
    }

    expect(err?.message).toBe(message);
  });

  describe('getAuthorization', () => {
    test('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<Params, void>(mockContext);
      const boundFunc = getAuthorization.bind(proc);

      expect(boundFunc(args)).toEqual({
        permissions: {
          transactions: [TxTags.sto.ModifyFundraiserWindow],
          tokens: [entityMockUtils.getSecurityTokenInstance({ ticker })],
          portfolios: [],
        },
      });
    });
  });
});
