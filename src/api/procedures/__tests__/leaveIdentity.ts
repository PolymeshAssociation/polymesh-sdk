import sinon from 'sinon';

import { prepareLeaveIdentity } from '~/api/procedures/leaveIdentity';
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
    procedureMockUtils.cleanup();
    dsMockUtils.cleanup();
  });

  test('should throw an error if the Account is not associated to any Identity', async () => {
    const proc = procedureMockUtils.getInstance<void, void>(mockContext);
    mockContext.getSigningAccount.returns(
      entityMockUtils.getAccountInstance({
        getIdentity: null,
      })
    );

    let error;

    try {
      await prepareLeaveIdentity.call(proc);
    } catch (err) {
      error = err;
    }

    expect(error.message).toBe('There is no Identity associated to the signing Account');
  });

  test('should throw an error if the signing Account is not a secondary Account', async () => {
    const proc = procedureMockUtils.getInstance<void, void>(mockContext);
    mockContext.getSigningAccount.returns(entityMockUtils.getAccountInstance());

    let error;

    try {
      await prepareLeaveIdentity.call(proc);
    } catch (err) {
      error = err;
    }

    expect(error.message).toBe('Only secondary Accounts are allowed to leave an Identity');
  });

  test('should add a leave Identity as Account transaction to the queue', async () => {
    const address = 'someAddress';
    const addTransactionStub = procedureMockUtils.getAddTransactionStub();
    const leaveIdentityAsKeyTransaction = dsMockUtils.createTxStub(
      'identity',
      'leaveIdentityAsKey'
    );
    mockContext.getSigningAccount.returns(
      entityMockUtils.getAccountInstance({
        address,
        getIdentity: entityMockUtils.getIdentityInstance({
          getSecondaryAccounts: [
            {
              account: entityMockUtils.getAccountInstance({ address }),
            } as unknown as PermissionedAccount,
          ],
        }),
      })
    );

    const proc = procedureMockUtils.getInstance<void, void>(mockContext);

    await prepareLeaveIdentity.call(proc);

    sinon.assert.calledWith(addTransactionStub, { transaction: leaveIdentityAsKeyTransaction });
  });
});
