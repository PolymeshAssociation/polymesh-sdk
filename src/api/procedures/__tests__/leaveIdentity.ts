import { prepareLeaveIdentity } from '~/api/procedures/leaveIdentity';
import { Context, PolymeshError } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { ErrorCode } from '~/types';
import * as utilsInternalModule from '~/utils/internal';

jest.mock(
  '~/api/entities/Asset',
  require('~/testUtils/mocks/entities').mockAssetModule('~/api/entities/Asset')
);

describe('leaveIdentity procedure', () => {
  let mockContext: Mocked<Context>;
  let getSecondaryAccountPermissionsSpy: jest.SpyInstance;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();

    getSecondaryAccountPermissionsSpy = jest.spyOn(
      utilsInternalModule,
      'getSecondaryAccountPermissions'
    );
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

  it('should throw an error if the Account is not associated to any Identity', async () => {
    const proc = procedureMockUtils.getInstance<void, void>(mockContext);
    mockContext.getSigningAccount.mockReturnValue(
      entityMockUtils.getAccountInstance({
        getIdentity: null,
      })
    );
    getSecondaryAccountPermissionsSpy.mockReturnValue([]);

    const expectedError = new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'There is no Identity associated to the signing Account',
    });

    return expect(prepareLeaveIdentity.call(proc)).rejects.toThrowError(expectedError);
  });

  it('should throw an error if the signing Account is not a secondary Account', () => {
    const proc = procedureMockUtils.getInstance<void, void>(mockContext);
    mockContext.getSigningAccount.mockReturnValue(entityMockUtils.getAccountInstance());

    const expectedError = new PolymeshError({
      code: ErrorCode.DataUnavailable,
      message: 'Only secondary Accounts are allowed to leave an Identity',
    });

    return expect(prepareLeaveIdentity.call(proc)).rejects.toThrowError(expectedError);
  });

  it('should return a leave Identity as Account transaction spec', async () => {
    const address = 'someAddress';
    const leaveIdentityAsKeyTransaction = dsMockUtils.createTxMock(
      'identity',
      'leaveIdentityAsKey'
    );

    getSecondaryAccountPermissionsSpy.mockReturnValue([
      {
        account: entityMockUtils.getAccountInstance({ address }),
        permissions: {
          assets: null,
          portfolios: null,
          transactionGroups: [],
          transactions: null,
        },
      },
    ]);

    const proc = procedureMockUtils.getInstance<void, void>(mockContext);

    const result = await prepareLeaveIdentity.call(proc);

    expect(result).toEqual({ transaction: leaveIdentityAsKeyTransaction, resolver: undefined });
  });
});
