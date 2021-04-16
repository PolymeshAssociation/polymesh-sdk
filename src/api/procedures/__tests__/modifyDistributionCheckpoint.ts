import { TxTags } from 'polymesh-types/types';
import sinon from 'sinon';

import {
  getAuthorization,
  Params,
  prepareModifyDistributionCheckpoint,
} from '~/api/procedures/modifyDistributionCheckpoint';
import { Context } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { RoleType } from '~/types';

jest.mock(
  '~/api/entities/CheckpointSchedule',
  require('~/testUtils/mocks/entities').mockCheckpointScheduleModule(
    '~/api/entities/CheckpointSchedule'
  )
);
jest.mock(
  '~/base/Procedure',
  require('~/testUtils/mocks/procedure').mockProcedureModule('~/base/Procedure')
);

describe('modifyDistributionCheckpoint procedure', () => {
  const ticker = 'SOMETICKER';

  let mockContext: Mocked<Context>;
  let addProcedureStub: sinon.SinonStub;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
  });

  beforeEach(() => {
    addProcedureStub = procedureMockUtils.getAddProcedureStub();
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

  test('should throw an error if the distribution payment date is in the past', async () => {
    const args = {
      distribution: entityMockUtils.getDividendDistributionInstance({
        paymentDate: new Date('10/14/1987'),
      }),
      checkpoint: new Date(),
    };

    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    let err;

    try {
      await prepareModifyDistributionCheckpoint.call(proc, args);
    } catch (error) {
      err = error;
    }

    expect(err.message).toBe('Distribution payment date must be in the future');
  });

  test('should throw an error if checkpoint date is not in the future', async () => {
    const args = {
      distribution: entityMockUtils.getDividendDistributionInstance(),
      checkpoint: new Date('10/10/2010'),
    };

    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    let err;

    try {
      await prepareModifyDistributionCheckpoint.call(proc, args);
    } catch (error) {
      err = error;
    }

    expect(err.message).toBe('Checkpoint date must be in the future');
  });

  test('should throw an error if checkpoint date is after the payment date', async () => {
    const args = {
      distribution: entityMockUtils.getDividendDistributionInstance({
        paymentDate: new Date('10/10/2030'),
      }),
      checkpoint: entityMockUtils.getCheckpointScheduleInstance({
        details: {
          nextCheckpointDate: new Date('11/11/2030'),
        },
      }),
    };

    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    let err;

    try {
      await prepareModifyDistributionCheckpoint.call(proc, args);
    } catch (error) {
      err = error;
    }

    expect(err.message).toBe('Checkpoint date must be before the payment date');
  });

  test('should throw an error if the distribution has already expired', async () => {
    const expiryDate = new Date('1/1/2020');
    const paymentDate = new Date('11/11/2021');

    const args = {
      distribution: entityMockUtils.getDividendDistributionInstance({
        expiryDate,
        paymentDate,
      }),
      checkpoint: new Date('10/10/2021'),
    };

    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    let err;

    try {
      await prepareModifyDistributionCheckpoint.call(proc, args);
    } catch (error) {
      err = error;
    }

    expect(err.message).toBe('Distribution has already expired');
    expect(err.data).toEqual({
      expiryDate,
    });
  });

  test('should add a modifyCaCheckpoint procedure transaction to the queue', async () => {
    const checkpoint = entityMockUtils.getCheckpointInstance();
    const distribution = entityMockUtils.getDividendDistributionInstance({
      paymentDate: new Date('10/10/2025'),
      expiryDate: new Date('12/12/2030'),
    });

    const args = {
      distribution,
      checkpoint,
    };

    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    await prepareModifyDistributionCheckpoint.call(proc, args);

    sinon.assert.calledWith(addProcedureStub, proc, {
      checkpoint,
      corporateAction: distribution,
    });
  });

  describe('getAuthorization', () => {
    test('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<Params, void>(mockContext);
      const boundFunc = getAuthorization.bind(proc);
      const args = {
        distribution: {
          ticker,
        },
      } as Params;

      expect(boundFunc(args)).toEqual({
        identityRoles: [{ type: RoleType.TokenCaa, ticker }],
        signerPermissions: {
          tokens: [],
          transactions: [TxTags.corporateAction.ChangeRecordDate],
          portfolios: [],
        },
      });
    });
  });
});
