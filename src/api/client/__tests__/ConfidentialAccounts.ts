import { ErrorCode } from '@polymeshassociation/polymesh-sdk/types';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import { ConfidentialAccounts } from '~/api/client/ConfidentialAccounts';
import { MoveFundsResolverResult } from '~/api/procedures/moveFunds';
import { ConfidentialAccount, Context, PolymeshError, PolymeshTransaction } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';

jest.mock(
  '~/api/entities/ConfidentialAccount',
  require('~/testUtils/mocks/entities').mockConfidentialAccountModule(
    '~/api/entities/ConfidentialAccount'
  )
);
jest.mock(
  '~/base/ConfidentialProcedure',
  require('~/testUtils/mocks/procedure').mockConfidentialProcedureModule(
    '~/base/ConfidentialProcedure'
  )
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
        confidentialAsset: 'someAsset',
        confidentialAccount: 'someAccount',
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

  describe('method: applyIncomingBalances', () => {
    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const args = {
        confidentialAccount: 'someAccount',
        maxUpdates: new BigNumber(1),
      };

      const expectedTransaction =
        'someTransaction' as unknown as PolymeshTransaction<ConfidentialAccount>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args, transformer: undefined }, context, {})
        .mockResolvedValue(expectedTransaction);

      const tx = await confidentialAccounts.applyIncomingBalances(args);

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: moveFunds', () => {
    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const args = {
        from: dsMockUtils.createMockConfidentialAccount() as unknown as ConfidentialAccount,
        to: dsMockUtils.createMockConfidentialAccount() as unknown as ConfidentialAccount,
        proofs: [{ asset: 'someAsset', proof: 'someProof' }],
      };

      const expectedTransaction =
        'someTransaction' as unknown as PolymeshTransaction<MoveFundsResolverResult>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args, transformer: undefined }, context, {})
        .mockResolvedValue(expectedTransaction);

      const tx = await confidentialAccounts.moveFunds(args);

      expect(tx).toBe(expectedTransaction);
    });
  });
});
