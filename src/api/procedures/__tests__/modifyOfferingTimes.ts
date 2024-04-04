import { u64 } from '@polkadot/types';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import {
  getAuthorization,
  Params,
  prepareModifyOfferingTimes,
} from '~/api/procedures/modifyOfferingTimes';
import { Context } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { OfferingBalanceStatus, OfferingSaleStatus, OfferingTimingStatus, TxTags } from '~/types';
import { PolymeshTx } from '~/types/internal';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Offering',
  require('~/testUtils/mocks/entities').mockOfferingModule('~/api/entities/Offering')
);
jest.mock(
  '~/api/entities/Asset/Fungible',
  require('~/testUtils/mocks/entities').mockFungibleAssetModule('~/api/entities/Asset/Fungible')
);

describe('modifyStoTimes procedure', () => {
  const ticker = 'SOME_TICKER';
  const id = new BigNumber(1);
  const now = new Date();
  const newStart = new Date(now.getTime() + 700000);
  const newEnd = new Date(newStart.getTime() + 700000);
  const start = new Date(now.getTime() + 500000);
  const end = new Date(start.getTime() + 500000);

  const rawTicker = dsMockUtils.createMockTicker(ticker);
  const rawId = dsMockUtils.createMockU64(id);
  const rawNewStart = dsMockUtils.createMockMoment(new BigNumber(newStart.getTime()));
  const rawNewEnd = dsMockUtils.createMockMoment(new BigNumber(newEnd.getTime()));
  const rawStart = dsMockUtils.createMockMoment(new BigNumber(start.getTime()));
  const rawEnd = dsMockUtils.createMockMoment(new BigNumber(end.getTime()));

  let mockContext: Mocked<Context>;
  let modifyFundraiserWindowTransaction: PolymeshTx<unknown[]>;

  let dateToMomentSpy: jest.SpyInstance<u64, [Date, Context]>;

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

    jest.spyOn(utilsConversionModule, 'stringToTicker').mockReturnValue(rawTicker);
    jest.spyOn(utilsConversionModule, 'bigNumberToU64').mockReturnValue(rawId);
    dateToMomentSpy = jest.spyOn(utilsConversionModule, 'dateToMoment');
  });

  beforeEach(() => {
    entityMockUtils.configureMocks({
      offeringOptions: {
        details: {
          status: {
            sale: OfferingSaleStatus.Live,
            timing: OfferingTimingStatus.NotStarted,
            balance: OfferingBalanceStatus.Available,
          },
          start,
          end,
        },
      },
    });
    mockContext = dsMockUtils.getContextInstance();

    when(dateToMomentSpy).calledWith(newStart, mockContext).mockReturnValue(rawNewStart);
    when(dateToMomentSpy).calledWith(newEnd, mockContext).mockReturnValue(rawNewEnd);
    when(dateToMomentSpy).calledWith(start, mockContext).mockReturnValue(rawStart);
    when(dateToMomentSpy).calledWith(end, mockContext).mockReturnValue(rawEnd);
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

  it('should return a modify fundraiser window transaction spec', async () => {
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);
    modifyFundraiserWindowTransaction = dsMockUtils.createTxMock('sto', 'modifyFundraiserWindow');

    let result = await prepareModifyOfferingTimes.call(proc, args);

    expect(result).toEqual({
      transaction: modifyFundraiserWindowTransaction,
      args: [rawTicker, rawId, rawNewStart, rawNewEnd],
      resolver: undefined,
    });

    result = await prepareModifyOfferingTimes.call(proc, { ...args, start: undefined });

    expect(result).toEqual({
      transaction: modifyFundraiserWindowTransaction,
      args: [rawTicker, rawId, rawStart, rawNewEnd],
      resolver: undefined,
    });

    result = await prepareModifyOfferingTimes.call(proc, { ...args, end: null });

    expect(result).toEqual({
      transaction: modifyFundraiserWindowTransaction,
      args: [rawTicker, rawId, rawNewStart, null],
      resolver: undefined,
    });

    result = await prepareModifyOfferingTimes.call(proc, { ...args, end: undefined });

    expect(result).toEqual({
      transaction: modifyFundraiserWindowTransaction,
      args: [rawTicker, rawId, rawNewStart, rawEnd],
      resolver: undefined,
    });

    entityMockUtils.configureMocks({
      offeringOptions: {
        details: {
          start,
          end: null,
          status: {
            sale: OfferingSaleStatus.Live,
            timing: OfferingTimingStatus.NotStarted,
            balance: OfferingBalanceStatus.Available,
          },
        },
      },
    });

    result = await prepareModifyOfferingTimes.call(proc, { ...args, end: undefined });

    expect(result).toEqual({
      transaction: modifyFundraiserWindowTransaction,
      args: [rawTicker, rawId, rawNewStart, null],
      resolver: undefined,
    });
  });

  it('should throw an error if nothing is being modified', async () => {
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    let err: Error | undefined;

    const message = 'Nothing to modify';

    try {
      await prepareModifyOfferingTimes.call(proc, { ...args, start, end });
    } catch (error) {
      err = error;
    }

    expect(err?.message).toBe(message);

    err = undefined;

    try {
      await prepareModifyOfferingTimes.call(proc, { ...args, start: undefined, end });
    } catch (error) {
      err = error;
    }

    expect(err?.message).toBe(message);

    try {
      await prepareModifyOfferingTimes.call(proc, { ...args, start, end: undefined });
    } catch (error) {
      err = error;
    }

    expect(err?.message).toBe(message);
  });

  it('should throw an error if the Offering is already closed', () => {
    entityMockUtils.configureMocks({
      offeringOptions: {
        details: {
          status: {
            sale: OfferingSaleStatus.Closed,
            timing: OfferingTimingStatus.Started,
            balance: OfferingBalanceStatus.Available,
          },
        },
      },
    });

    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    return expect(prepareModifyOfferingTimes.call(proc, args)).rejects.toThrow(
      'The Offering is already closed'
    );
  });

  it('should throw an error if the Offering has already ended', async () => {
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    entityMockUtils.configureMocks({
      offeringOptions: {
        details: {
          start: now,
          end: now,
          status: {
            sale: OfferingSaleStatus.Live,
            timing: OfferingTimingStatus.Expired,
            balance: OfferingBalanceStatus.Available,
          },
        },
      },
    });

    let err: Error | undefined;

    try {
      await prepareModifyOfferingTimes.call(proc, args);
    } catch (error) {
      err = error;
    }

    expect(err?.message).toBe('The Offering has already ended');
  });

  it('should throw an error if attempting to modify the start time of an Offering that has already started', async () => {
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    entityMockUtils.configureMocks({
      offeringOptions: {
        details: {
          start: new Date(now.getTime() - 1000),
          end,
          status: {
            sale: OfferingSaleStatus.Live,
            timing: OfferingTimingStatus.Started,
            balance: OfferingBalanceStatus.Available,
          },
        },
      },
    });

    let err: Error | undefined;

    try {
      await prepareModifyOfferingTimes.call(proc, args);
    } catch (error) {
      err = error;
    }

    expect(err?.message).toBe('Cannot modify the start time of an Offering that already started');
  });

  it('should throw an error if the new times are in the past', async () => {
    entityMockUtils.configureMocks({
      offeringOptions: {
        details: {
          status: {
            timing: OfferingTimingStatus.NotStarted,
            balance: OfferingBalanceStatus.Available,
            sale: OfferingSaleStatus.Live,
          },
        },
      },
    });

    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    let err: Error | undefined;

    const past = new Date(now.getTime() - 1000);

    const message = 'New dates are in the past';

    try {
      await prepareModifyOfferingTimes.call(proc, { ...args, start: past });
    } catch (error) {
      err = error;
    }

    expect(err?.message).toBe(message);

    err = undefined;

    try {
      await prepareModifyOfferingTimes.call(proc, { ...args, end: past });
    } catch (error) {
      err = error;
    }

    expect(err?.message).toBe(message);
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<Params, void>(mockContext);
      const boundFunc = getAuthorization.bind(proc);

      expect(boundFunc(args)).toEqual({
        permissions: {
          transactions: [TxTags.sto.ModifyFundraiserWindow],
          assets: [expect.objectContaining({ ticker })],
          portfolios: [],
        },
      });
    });
  });
});
