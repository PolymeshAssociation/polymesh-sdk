import BigNumber from 'bignumber.js';

import {
  getAuthorization,
  Params,
  prepareModifyCaCheckpoint,
} from '~/api/procedures/modifyCaCheckpoint';
import { Context, PolymeshError } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { ErrorCode, TxTags } from '~/types';
import { PolymeshTx } from '~/types/internal';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Asset/Fungible',
  require('~/testUtils/mocks/entities').mockFungibleAssetModule('~/api/entities/Asset/Fungible')
);

describe('modifyCaCheckpoint procedure', () => {
  const assetId = '0x1234';

  let mockContext: Mocked<Context>;
  let changeRecordDateTransaction: PolymeshTx<unknown[]>;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
  });

  beforeEach(() => {
    changeRecordDateTransaction = dsMockUtils.createTxMock('corporateAction', 'changeRecordDate');
    mockContext = dsMockUtils.getContextInstance();
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

  it('should throw an error if the distribution has already started', async () => {
    const args = {
      corporateAction: entityMockUtils.getDividendDistributionInstance({
        paymentDate: new Date('10/14/1987'),
      }),
      checkpoint: new Date(new Date().getTime() + 60 * 60 * 1000),
    };

    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    let err;

    try {
      await prepareModifyCaCheckpoint.call(proc, args);
    } catch (error) {
      err = error;
    }

    expect(err.message).toBe('Cannot modify a Distribution checkpoint after the payment date');
  });

  it('should throw an error if the payment date is earlier than the Checkpoint date', async () => {
    const checkpoint = new Date(new Date().getTime() + 1000);
    const args = {
      corporateAction: entityMockUtils.getDividendDistributionInstance({
        paymentDate: new Date(checkpoint.getTime() - 100),
      }),
      checkpoint,
    };

    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    let err;

    try {
      await prepareModifyCaCheckpoint.call(proc, args);
    } catch (error) {
      err = error;
    }

    expect(err.message).toBe('Payment date must be after the Checkpoint date');
  });

  it('should throw an error if the checkpoint date is after the expiry date', () => {
    const checkpoint = new Date(new Date().getTime() + 1000);
    const paymentDate = new Date(checkpoint.getTime() + 2000);
    const args = {
      corporateAction: entityMockUtils.getDividendDistributionInstance({
        paymentDate,
        expiryDate: new Date(checkpoint.getTime() - 1000),
      }),
      checkpoint: entityMockUtils.getCheckpointScheduleInstance({
        details: {
          nextCheckpointDate: checkpoint,
        },
      }),
    };

    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    return expect(prepareModifyCaCheckpoint.call(proc, args)).rejects.toThrow(
      'Expiry date must be after the Checkpoint date'
    );
  });

  it('should throw an error if the checkpoint does not exist', async () => {
    const args = {
      corporateAction: entityMockUtils.getCorporateActionInstance(),
      checkpoint: entityMockUtils.getCheckpointInstance({
        exists: false,
      }),
    };

    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    let err;

    try {
      await prepareModifyCaCheckpoint.call(proc, args);
    } catch (error) {
      err = error;
    }

    expect(err.message).toBe("Checkpoint doesn't exist");
  });

  it('should throw an error if checkpoint schedule no longer exists', () => {
    const args = {
      corporateAction: entityMockUtils.getCorporateActionInstance(),
      checkpoint: entityMockUtils.getCheckpointScheduleInstance({
        exists: false,
      }),
    };

    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    const expectedError = new PolymeshError({
      message: "Checkpoint Schedule doesn't exist",
      code: ErrorCode.DataUnavailable,
    });

    return expect(prepareModifyCaCheckpoint.call(proc, args)).rejects.toThrow(expectedError);
  });

  it('should throw an error if date is in the past', async () => {
    const args = {
      corporateAction: entityMockUtils.getCorporateActionInstance(),
      checkpoint: new Date(new Date().getTime() - 100000),
    };

    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    let err;

    try {
      await prepareModifyCaCheckpoint.call(proc, args);
    } catch (error) {
      err = error;
    }

    expect(err.message).toBe('Checkpoint date must be in the future');
  });

  it('should return a change record date transaction spec', async () => {
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);
    const id = new BigNumber(1);

    const rawCaId = dsMockUtils.createMockCAId({ assetId, localId: id });

    jest.spyOn(utilsConversionModule, 'corporateActionIdentifierToCaId').mockReturnValue(rawCaId);

    const rawRecordDateSpec = dsMockUtils.createMockRecordDateSpec({
      Scheduled: dsMockUtils.createMockMoment(new BigNumber(new Date().getTime())),
    });

    jest
      .spyOn(utilsConversionModule, 'checkpointToRecordDateSpec')
      .mockReturnValue(rawRecordDateSpec);

    let result = await prepareModifyCaCheckpoint.call(proc, {
      corporateAction: entityMockUtils.getCorporateActionInstance({
        id,
      }),
      checkpoint: entityMockUtils.getCheckpointInstance({
        exists: true,
      }),
    });

    expect(result).toEqual({
      transaction: changeRecordDateTransaction,
      args: [rawCaId, rawRecordDateSpec],
      resolver: undefined,
    });

    result = await prepareModifyCaCheckpoint.call(proc, {
      corporateAction: entityMockUtils.getCorporateActionInstance({
        id,
      }),
      checkpoint: entityMockUtils.getCheckpointScheduleInstance({
        exists: true,
      }),
    });

    expect(result).toEqual({
      transaction: changeRecordDateTransaction,
      args: [rawCaId, rawRecordDateSpec],
      resolver: undefined,
    });

    result = await prepareModifyCaCheckpoint.call(proc, {
      corporateAction: entityMockUtils.getCorporateActionInstance({
        id,
      }),
      checkpoint: new Date(new Date().getTime() + 100000),
    });

    expect(result).toEqual({
      transaction: changeRecordDateTransaction,
      args: [rawCaId, rawRecordDateSpec],
      resolver: undefined,
    });

    result = await prepareModifyCaCheckpoint.call(proc, {
      corporateAction: entityMockUtils.getCorporateActionInstance({
        id,
      }),
      checkpoint: null,
    });

    expect(result).toEqual({
      transaction: changeRecordDateTransaction,
      args: [rawCaId, null],
      resolver: undefined,
    });
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<Params, void>(mockContext);
      const boundFunc = getAuthorization.bind(proc);
      const args = {
        corporateAction: {
          asset: entityMockUtils.getFungibleAssetInstance({ assetId }),
        },
      } as unknown as Params;

      expect(boundFunc(args)).toEqual({
        permissions: {
          assets: [expect.objectContaining({ id: assetId })],
          transactions: [TxTags.corporateAction.ChangeRecordDate],
          portfolios: [],
        },
      });
    });
  });
});
