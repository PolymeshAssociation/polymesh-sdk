import { TxTags } from 'polymesh-types/types';
import sinon from 'sinon';

import {
  getAuthorization,
  LeaveIdentityParams,
  prepareLeaveIdentity,
} from '~/api/procedures/leaveIdentity';
import { Context } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { SecondaryKey } from '~/types';

jest.mock(
  '~/api/entities/SecurityToken',
  require('~/testUtils/mocks/entities').mockSecurityTokenModule('~/api/entities/SecurityToken')
);

describe('modifyCaCheckpoint procedure', () => {
  let mockContext: Mocked<Context>;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
  });

  beforeEach(() => {
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

  test('should throw an error if the Account is not associated to any Identity', async () => {
    const proc = procedureMockUtils.getInstance<LeaveIdentityParams, void>(mockContext);
    const account = entityMockUtils.getAccountInstance({
      getIdentity: null,
    });

    let error;

    try {
      await prepareLeaveIdentity.call(proc, { account });
    } catch (err) {
      error = err;
    }

    expect(error.message).toBe('There is no Identity associated to this Account');
  });

  test('should throw an error if the Account is not a secondary key', async () => {
    const proc = procedureMockUtils.getInstance<LeaveIdentityParams, void>(mockContext);
    const account = entityMockUtils.getAccountInstance();

    let error;

    try {
      await prepareLeaveIdentity.call(proc, { account });
    } catch (err) {
      error = err;
    }

    expect(error.message).toBe('Only Seconday Keys are allowed to leave an Identity');
  });

  test('should add a leave identity as key transaction to the queue', async () => {
    const address = 'someAddress';
    const addTransactionStub = procedureMockUtils.getAddTransactionStub();
    const leaveIdentityAsKeyTransaction = dsMockUtils.createTxStub(
      'identity',
      'leaveIdentityAsKey'
    );
    const account = entityMockUtils.getAccountInstance({
      address,
      getIdentity: entityMockUtils.getIdentityInstance({
        getSecondaryKeys: [
          ({
            signer: entityMockUtils.getAccountInstance({ address }),
          } as unknown) as SecondaryKey,
        ],
      }),
    });

    const proc = procedureMockUtils.getInstance<LeaveIdentityParams, void>(mockContext);

    await prepareLeaveIdentity.call(proc, { account });

    sinon.assert.calledWith(addTransactionStub, leaveIdentityAsKeyTransaction, {});
  });

  describe('getAuthorization', () => {
    test('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<LeaveIdentityParams, void>(mockContext);
      const boundFunc = getAuthorization.bind(proc);

      expect(boundFunc()).toEqual({
        permissions: {
          tokens: [],
          transactions: [TxTags.identity.LeaveIdentityAsKey],
          portfolios: [],
        },
      });
    });
  });
});
