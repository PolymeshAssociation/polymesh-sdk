import { u64 } from '@polkadot/types';
import BigNumber from 'bignumber.js';
import { StoredSchedule, Ticker } from 'polymesh-types/types';
import sinon from 'sinon';

import {
  getAuthorization,
  Params,
  prepareRemoveCheckpointSchedule,
} from '~/api/procedures/removeCheckpointSchedule';
import { Context } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { TxTags } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Asset',
  require('~/testUtils/mocks/entities').mockAssetModule('~/api/entities/Asset')
);

describe('removeCheckpointSchedule procedure', () => {
  let mockContext: Mocked<Context>;
  let stringToTickerStub: sinon.SinonStub;
  let bigNumberToU64Stub: sinon.SinonStub;
  let u32ToBigNumberStub: sinon.SinonStub;
  let ticker: string;
  let rawTicker: Ticker;
  let id: BigNumber;
  let rawId: u64;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    stringToTickerStub = sinon.stub(utilsConversionModule, 'stringToTicker');
    bigNumberToU64Stub = sinon.stub(utilsConversionModule, 'bigNumberToU64');
    u32ToBigNumberStub = sinon.stub(utilsConversionModule, 'u32ToBigNumber');
    ticker = 'SOME_TICKER';
    rawTicker = dsMockUtils.createMockTicker(ticker);
    id = new BigNumber(1);
    rawId = dsMockUtils.createMockU64(id);
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    stringToTickerStub.returns(rawTicker);
    bigNumberToU64Stub.returns(rawId);

    dsMockUtils.createQueryStub('checkpoint', 'scheduleRefCount');
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

  it('should throw an error if the Schedule no longer exists', () => {
    const args = {
      ticker,
      schedule: id,
    };

    dsMockUtils.createQueryStub('checkpoint', 'schedules', {
      returnValue: [
        dsMockUtils.createMockStoredSchedule({
          id: dsMockUtils.createMockU64(new BigNumber(5)),
        } as unknown as StoredSchedule),
      ],
    });

    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    return expect(prepareRemoveCheckpointSchedule.call(proc, args)).rejects.toThrow(
      'Schedule was not found. It may have been removed or expired'
    );
  });

  it('should throw an error if Schedule Ref Count is not zero', () => {
    const args = {
      ticker,
      schedule: id,
    };

    dsMockUtils.createQueryStub('checkpoint', 'schedules', {
      returnValue: [
        dsMockUtils.createMockStoredSchedule({
          id: dsMockUtils.createMockU64(id),
        } as unknown as StoredSchedule),
      ],
    });

    u32ToBigNumberStub.returns(new BigNumber(1));

    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    return expect(prepareRemoveCheckpointSchedule.call(proc, args)).rejects.toThrow(
      'This Schedule is being referenced by other Entities. It cannot be removed'
    );
  });

  it('should return a remove schedule transaction spec', async () => {
    const args = {
      ticker,
      schedule: id,
    };

    dsMockUtils.createQueryStub('checkpoint', 'schedules', {
      returnValue: [
        dsMockUtils.createMockStoredSchedule({
          id: rawId,
        } as StoredSchedule),
      ],
    });

    u32ToBigNumberStub.returns(new BigNumber(0));

    let transaction = dsMockUtils.createTxStub('checkpoint', 'removeSchedule');
    let proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    let result = await prepareRemoveCheckpointSchedule.call(proc, args);

    expect(result).toEqual({ transaction, args: [rawTicker, rawId], resolver: undefined });

    transaction = dsMockUtils.createTxStub('checkpoint', 'removeSchedule');
    proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    result = await prepareRemoveCheckpointSchedule.call(proc, {
      ticker,
      schedule: entityMockUtils.getCheckpointScheduleInstance({
        id: new BigNumber(1),
      }),
    });

    expect(result).toEqual({ transaction, args: [rawTicker, rawId], resolver: undefined });
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<Params, void>(mockContext);
      const boundFunc = getAuthorization.bind(proc);
      const args = {
        ticker,
      } as Params;

      expect(boundFunc(args)).toEqual({
        permissions: {
          transactions: [TxTags.checkpoint.RemoveSchedule],
          assets: [expect.objectContaining({ ticker })],
          portfolios: [],
        },
      });
    });
  });
});
