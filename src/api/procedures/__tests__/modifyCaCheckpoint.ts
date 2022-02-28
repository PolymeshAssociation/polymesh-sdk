import BigNumber from 'bignumber.js';
import { TxTags } from 'polymesh-types/types';
import sinon from 'sinon';

import {
  getAuthorization,
  Params,
  prepareModifyCaCheckpoint,
} from '~/api/procedures/modifyCaCheckpoint';
import { Context } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { PolymeshTx } from '~/types/internal';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Asset',
  require('~/testUtils/mocks/entities').mockAssetModule('~/api/entities/Asset')
);

describe('modifyCaCheckpoint procedure', () => {
  const ticker = 'SOME_TICKER';

  let mockContext: Mocked<Context>;
  let addTransactionStub: sinon.SinonStub;
  let changeRecordDateTransaction: PolymeshTx<unknown[]>;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
  });

  beforeEach(() => {
    addTransactionStub = procedureMockUtils.getAddTransactionStub();
    changeRecordDateTransaction = dsMockUtils.createTxStub('corporateAction', 'changeRecordDate');
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

  it('should throw an error if checkpoint schedule no longer exists', async () => {
    const args = {
      corporateAction: entityMockUtils.getCorporateActionInstance(),
      checkpoint: entityMockUtils.getCheckpointScheduleInstance({
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

    expect(err.message).toBe("Checkpoint Schedule doesn't exist");
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

  it('should add a change record date transaction to the queue', async () => {
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);
    const id = new BigNumber(1);

    // eslint-disable-next-line @typescript-eslint/naming-convention
    const rawCaId = dsMockUtils.createMockCAId({ ticker, local_id: id });

    sinon.stub(utilsConversionModule, 'corporateActionIdentifierToCaId').returns(rawCaId);

    const rawRecordDateSpec = dsMockUtils.createMockRecordDateSpec({
      Scheduled: dsMockUtils.createMockMoment(new BigNumber(new Date().getTime())),
    });

    sinon.stub(utilsConversionModule, 'checkpointToRecordDateSpec').returns(rawRecordDateSpec);

    await prepareModifyCaCheckpoint.call(proc, {
      corporateAction: entityMockUtils.getCorporateActionInstance({
        id,
      }),
      checkpoint: entityMockUtils.getCheckpointInstance({
        exists: true,
      }),
    });

    sinon.assert.calledWith(addTransactionStub, {
      transaction: changeRecordDateTransaction,
      args: [rawCaId, rawRecordDateSpec],
    });

    await prepareModifyCaCheckpoint.call(proc, {
      corporateAction: entityMockUtils.getCorporateActionInstance({
        id,
      }),
      checkpoint: entityMockUtils.getCheckpointScheduleInstance({
        exists: true,
      }),
    });

    sinon.assert.calledWith(addTransactionStub, {
      transaction: changeRecordDateTransaction,
      args: [rawCaId, rawRecordDateSpec],
    });

    await prepareModifyCaCheckpoint.call(proc, {
      corporateAction: entityMockUtils.getCorporateActionInstance({
        id,
      }),
      checkpoint: new Date(new Date().getTime() + 100000),
    });

    sinon.assert.calledWith(addTransactionStub, {
      transaction: changeRecordDateTransaction,
      args: [rawCaId, rawRecordDateSpec],
    });

    await prepareModifyCaCheckpoint.call(proc, {
      corporateAction: entityMockUtils.getCorporateActionInstance({
        id,
      }),
      checkpoint: null,
    });

    sinon.assert.calledWith(addTransactionStub, {
      transaction: changeRecordDateTransaction,
      args: [rawCaId, null],
    });
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<Params, void>(mockContext);
      const boundFunc = getAuthorization.bind(proc);
      const args = {
        corporateAction: {
          asset: { ticker },
        },
      } as Params;

      expect(boundFunc(args)).toEqual({
        permissions: {
          assets: [expect.objectContaining({ ticker })],
          transactions: [TxTags.corporateAction.ChangeRecordDate],
          portfolios: [],
        },
      });
    });
  });
});
