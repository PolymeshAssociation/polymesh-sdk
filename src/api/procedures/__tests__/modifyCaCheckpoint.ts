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
import { RoleType } from '~/types';
import { PolymeshTx } from '~/types/internal';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/SecurityToken',
  require('~/testUtils/mocks/entities').mockSecurityTokenModule('~/api/entities/SecurityToken')
);

describe('modifyCaCheckpoint procedure', () => {
  const ticker = 'SOMETICKER';

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
    entityMockUtils.cleanup();
    procedureMockUtils.cleanup();
    dsMockUtils.cleanup();
  });

  test('should throw an error if the checkpoint does not exist', async () => {
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

  test('should throw an error if checkpoint schedule no longer exists', async () => {
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

    expect(err.message).toBe("Checkpoint doesn't exist");
  });

  test('should throw an error if date is in the past', async () => {
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

  test('should add a change record date transaction to the queue', async () => {
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);
    const id = new BigNumber(1);

    // eslint-disable-next-line @typescript-eslint/camelcase
    const rawCaId = dsMockUtils.createMockCAId({ ticker, local_id: id.toNumber() });

    sinon.stub(utilsConversionModule, 'corporateActionIdentifierToCaId').returns(rawCaId);

    const rawRecordDateSpec = dsMockUtils.createMockRecordDateSpec({
      Scheduled: dsMockUtils.createMockMoment(new Date().getTime()),
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

    sinon.assert.calledWith(
      addTransactionStub,
      changeRecordDateTransaction,
      {},
      rawCaId,
      rawRecordDateSpec
    );

    await prepareModifyCaCheckpoint.call(proc, {
      corporateAction: entityMockUtils.getCorporateActionInstance({
        id,
      }),
      checkpoint: entityMockUtils.getCheckpointScheduleInstance({
        exists: true,
      }),
    });

    sinon.assert.calledWith(
      addTransactionStub,
      changeRecordDateTransaction,
      {},
      rawCaId,
      rawRecordDateSpec
    );

    await prepareModifyCaCheckpoint.call(proc, {
      corporateAction: entityMockUtils.getCorporateActionInstance({
        id,
      }),
      checkpoint: new Date(new Date().getTime() + 100000),
    });

    sinon.assert.calledWith(
      addTransactionStub,
      changeRecordDateTransaction,
      {},
      rawCaId,
      rawRecordDateSpec
    );

    await prepareModifyCaCheckpoint.call(proc, {
      corporateAction: entityMockUtils.getCorporateActionInstance({
        id,
      }),
    });

    sinon.assert.calledWith(addTransactionStub, changeRecordDateTransaction, {}, rawCaId, null);
  });

  describe('getAuthorization', () => {
    test('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<Params, void>(mockContext);
      const boundFunc = getAuthorization.bind(proc);
      const args = {
        corporateAction: {
          ticker,
        },
      } as Params;

      expect(boundFunc(args)).toEqual({
        identityRoles: [{ type: RoleType.TokenCaa, ticker }],
        signerPermissions: {
          tokens: [entityMockUtils.getSecurityTokenInstance({ ticker })],
          transactions: [TxTags.corporateAction.ChangeRecordDate],
          portfolios: [],
        },
      });
    });
  });
});
