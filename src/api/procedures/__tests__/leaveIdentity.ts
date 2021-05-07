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

  test('should throw an error if the account does not have an Identity to leave', async () => {
    const proc = procedureMockUtils.getInstance<LeaveIdentityParams, void>(mockContext);
    const account = entityMockUtils.getCurrentAccountInstance({
      getIdentity: null,
    });

    let error;

    try {
      await prepareLeaveIdentity.call(proc, { account });
    } catch (err) {
      error = err;
    }

    expect(error.message).toBe("You don't have a current identity to leave");
  });

  test('should throw an error if the account is not a secondary key', async () => {
    const proc = procedureMockUtils.getInstance<LeaveIdentityParams, void>(mockContext);
    const account = entityMockUtils.getCurrentAccountInstance();

    let error;

    try {
      await prepareLeaveIdentity.call(proc, { account });
    } catch (err) {
      error = err;
    }

    expect(error.message).toBe('Only Seconday Keys are allowed to leave an identity');
  });

  test('should add a leave identity as key transaction to the queue', async () => {
    const address = 'someAddress';
    const addTransactionStub = procedureMockUtils.getAddTransactionStub();
    const leaveIdentityAsKeyTransaction = dsMockUtils.createTxStub(
      'identity',
      'leaveIdentityAsKey'
    );

    dsMockUtils.configureMocks({
      contextOptions: {
        secondaryKeys: [
          ({
            signer: entityMockUtils.getAccountInstance({ address }),
          } as unknown) as SecondaryKey,
        ],
      },
    });
    const proc = procedureMockUtils.getInstance<LeaveIdentityParams, void>(mockContext);
    const account = entityMockUtils.getCurrentAccountInstance({
      address,
    });

    await prepareLeaveIdentity.call(proc, { account });

    sinon.assert.calledWith(addTransactionStub, leaveIdentityAsKeyTransaction, {});
  });

  describe('getAuthorization', () => {
    test('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<LeaveIdentityParams, void>(mockContext);
      const boundFunc = getAuthorization.bind(proc);

      expect(boundFunc()).toEqual({
        signerPermissions: {
          tokens: [],
          transactions: [TxTags.identity.LeaveIdentityAsKey],
          portfolios: [],
        },
      });
    });
  });
});
