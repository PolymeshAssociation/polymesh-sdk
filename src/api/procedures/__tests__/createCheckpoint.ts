import { PolymeshPrimitivesTicker } from '@polkadot/types/lookup';
import { ISubmittableResult } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import {
  createCheckpointResolver,
  getAuthorization,
  Params,
  prepareCreateCheckpoint,
} from '~/api/procedures/createCheckpoint';
import { Checkpoint, Context } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { TxTags } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';
import * as utilsInternalModule from '~/utils/internal';

jest.mock(
  '~/api/entities/Checkpoint',
  require('~/testUtils/mocks/entities').mockCheckpointModule('~/api/entities/Checkpoint')
);
jest.mock(
  '~/api/entities/Asset',
  require('~/testUtils/mocks/entities').mockAssetModule('~/api/entities/Asset')
);

describe('createCheckpoint procedure', () => {
  let mockContext: Mocked<Context>;
  let stringToTickerSpy: jest.SpyInstance<PolymeshPrimitivesTicker, [string, Context]>;
  let ticker: string;
  let rawTicker: PolymeshPrimitivesTicker;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    stringToTickerSpy = jest.spyOn(utilsConversionModule, 'stringToTicker');
    ticker = 'SOME_TICKER';
    rawTicker = dsMockUtils.createMockTicker(ticker);
  });

  beforeEach(() => {
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

  it('should return a create checkpoint transaction spec', async () => {
    const proc = procedureMockUtils.getInstance<Params, Checkpoint>(mockContext);

    const transaction = dsMockUtils.createTxMock('checkpoint', 'createCheckpoint');

    const result = await prepareCreateCheckpoint.call(proc, {
      ticker,
    });

    expect(result).toEqual({ transaction, resolver: expect.any(Function), args: [rawTicker] });
  });

  describe('createCheckpointResolver', () => {
    const filterEventRecordsSpy = jest.spyOn(utilsInternalModule, 'filterEventRecords');
    const id = new BigNumber(1);

    beforeAll(() => {
      entityMockUtils.initMocks({ checkpointOptions: { ticker, id } });
    });

    beforeEach(() => {
      filterEventRecordsSpy.mockReturnValue([
        dsMockUtils.createMockIEvent(['someDid', ticker, id]),
      ]);
    });

    afterEach(() => {
      filterEventRecordsSpy.mockReset();
    });

    it('should return the new Checkpoint', () => {
      const result = createCheckpointResolver(ticker, mockContext)({} as ISubmittableResult);
      expect(result.asset.ticker).toBe(ticker);
      expect(result.id).toEqual(id);
    });
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<Params, Checkpoint>(mockContext);
      const boundFunc = getAuthorization.bind(proc);

      expect(boundFunc({ ticker })).toEqual({
        permissions: {
          transactions: [TxTags.checkpoint.CreateCheckpoint],
          assets: [expect.objectContaining({ ticker })],
          portfolios: [],
        },
      });
    });
  });
});
