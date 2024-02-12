import { when } from 'jest-when';

import { ConfidentialAccounts } from '~/api/client/ConfidentialAccounts';
import { ConfidentialAccount, Context, PolymeshError, PolymeshTransaction } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { ErrorCode } from '~/types';

jest.mock(
  '~/api/entities/confidential/ConfidentialAccount',
  require('~/testUtils/mocks/entities').mockConfidentialAccountModule(
    '~/api/entities/confidential/ConfidentialAccount'
  )
);
jest.mock(
  '~/base/Procedure',
  require('~/testUtils/mocks/procedure').mockProcedureModule('~/base/Procedure')
);

describe('ConfidentialAccounts Class', () => {
  let context: Mocked<Context>;
  let confidentialAccounts: ConfidentialAccounts;

  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();
    procedureMockUtils.initMocks();
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
    confidentialAccounts = new ConfidentialAccounts(context);
  });

  afterEach(() => {
    dsMockUtils.reset();
    entityMockUtils.reset();
    procedureMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
    procedureMockUtils.cleanup();
  });

  describe('method: getConfidentialAccount', () => {
    const publicKey = 'someKey';

    it('should return a specific Confidential Account if exists', async () => {
      const confidentialAccount = await confidentialAccounts.getConfidentialAccount({ publicKey });

      expect(confidentialAccount).toBeInstanceOf(ConfidentialAccount);
    });

    it('should throw if the Confidential Account does not exist', async () => {
      entityMockUtils.configureMocks({
        confidentialAccountOptions: { getIdentity: null },
      });

      const expectedError = new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: 'No confidential Account exists',
        data: { publicKey },
      });

      return expect(
        confidentialAccounts.getConfidentialAccount({ publicKey })
      ).rejects.toThrowError(expectedError);
    });
  });

  describe('method: createConfidentialAccount', () => {
    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const args = {
        publicKey: 'someKey',
      };

      const expectedTransaction =
        'someTransaction' as unknown as PolymeshTransaction<ConfidentialAccount>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args, transformer: undefined }, context, {})
        .mockResolvedValue(expectedTransaction);

      const tx = await confidentialAccounts.createConfidentialAccount(args);

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: applyIncomingBalance', () => {
    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const args = {
        asset: 'someAsset',
        account: 'someAccount',
      };

      const expectedTransaction =
        'someTransaction' as unknown as PolymeshTransaction<ConfidentialAccount>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args, transformer: undefined }, context, {})
        .mockResolvedValue(expectedTransaction);

      const tx = await confidentialAccounts.applyIncomingBalance(args);

      expect(tx).toBe(expectedTransaction);
    });
  });
});
