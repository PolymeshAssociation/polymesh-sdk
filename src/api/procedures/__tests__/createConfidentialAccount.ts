import { prepareCreateAccount } from '~/api/procedures/createConfidentialAccount';
import { ConfidentialAccount, Context } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { CreateConfidentialAccountParams } from '~/types';

jest.mock(
  '~/api/entities/confidential/ConfidentialAccount',
  require('~/testUtils/mocks/entities').mockConfidentialAccountModule(
    '~/api/entities/confidential/ConfidentialAccount'
  )
);

describe('createConfidentialAccount procedure', () => {
  let mockContext: Mocked<Context>;

  let publicKey: string;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
  });

  beforeEach(() => {
    entityMockUtils.configureMocks({
      confidentialAccountOptions: {
        getIdentity: null,
      },
    });

    mockContext = dsMockUtils.getContextInstance();
    publicKey = 'someKey';
  });

  afterEach(() => {
    entityMockUtils.reset();
    procedureMockUtils.reset();
    dsMockUtils.reset();
  });

  afterAll(() => {
    jest.resetAllMocks();
    procedureMockUtils.cleanup();
    dsMockUtils.cleanup();
  });

  it('should throw an error if the public key is already linked to another confidential Account', () => {
    entityMockUtils.configureMocks({
      confidentialAccountOptions: {
        getIdentity: entityMockUtils.getIdentityInstance(),
      },
    });

    const proc = procedureMockUtils.getInstance<
      CreateConfidentialAccountParams,
      ConfidentialAccount
    >(mockContext);

    return expect(
      prepareCreateAccount.call(proc, {
        publicKey,
      })
    ).rejects.toThrow('Confidential Account already exists for the given key');
  });

  it('should add a create CreateAccount transaction to the queue', async () => {
    const proc = procedureMockUtils.getInstance<
      CreateConfidentialAccountParams,
      ConfidentialAccount
    >(mockContext);

    const createAccountTransaction = dsMockUtils.createTxMock('confidentialAsset', 'createAccount');

    const result = await prepareCreateAccount.call(proc, {
      publicKey,
    });

    expect(result).toEqual({
      transaction: createAccountTransaction,
      resolver: expect.objectContaining({ publicKey }),
      args: [publicKey],
    });
  });
});
