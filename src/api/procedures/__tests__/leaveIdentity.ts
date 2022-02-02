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
import { PermissionedAccount } from '~/types';

jest.mock(
  '~/api/entities/Asset',
  require('~/testUtils/mocks/entities').mockAssetModule('~/api/entities/Asset')
);

describe('leaveIdentity procedure', () => {
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

  test('should throw an error if the Account is not a secondary Account', async () => {
    const proc = procedureMockUtils.getInstance<LeaveIdentityParams, void>(mockContext);
    const account = entityMockUtils.getAccountInstance();

    let error;

    try {
      await prepareLeaveIdentity.call(proc, { account });
    } catch (err) {
      error = err;
    }

    expect(error.message).toBe('Only secondary Accounts are allowed to leave an Identity');
  });

  test('should add a leave identity as Account transaction to the queue', async () => {
    const address = 'someAddress';
    const addTransactionStub = procedureMockUtils.getAddTransactionStub();
    const leaveIdentityAsKeyTransaction = dsMockUtils.createTxStub(
      'identity',
      'leaveIdentityAsKey'
    );
    const account = entityMockUtils.getAccountInstance({
      address,
      getIdentity: entityMockUtils.getIdentityInstance({
        getSecondaryAccounts: [
          {
            account: entityMockUtils.getAccountInstance({ address }),
          } as unknown as PermissionedAccount,
        ],
      }),
    });

    const proc = procedureMockUtils.getInstance<LeaveIdentityParams, void>(mockContext);

    await prepareLeaveIdentity.call(proc, { account });

    sinon.assert.calledWith(addTransactionStub, { transaction: leaveIdentityAsKeyTransaction });
  });

  describe('getAuthorization', () => {
    test('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<LeaveIdentityParams, void>(mockContext);
      const boundFunc = getAuthorization.bind(proc);

      let account = entityMockUtils.getAccountInstance({ isEqual: false });

      expect(boundFunc({ account })).toEqual({
        roles: 'Only the current Account can leave its Identity',
        permissions: {
          assets: [],
          transactions: [TxTags.identity.LeaveIdentityAsKey],
          portfolios: [],
        },
      });

      account = entityMockUtils.getAccountInstance({ isEqual: true });

      expect(boundFunc({ account })).toEqual({
        roles: true,
        permissions: {
          assets: [],
          transactions: [TxTags.identity.LeaveIdentityAsKey],
          portfolios: [],
        },
      });
    });
  });
});
