import { when } from 'jest-when';

import { ConfidentialAccounts } from '~/api/client/ConfidentialAccounts';
import { ConfidentialAccount } from '~/api/entities/ConfidentialAccount';
import { Context, PolymeshError, PolymeshTransaction } from '~/internal';
import { dsMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { ErrorCode } from '~/types';

jest.mock(
  '~/base/Procedure',
  require('~/testUtils/mocks/procedure').mockProcedureModule('~/base/Procedure')
);

describe('ConfidentialAccounts Class', () => {
  let context: Mocked<Context>;
  let confidentialAccounts: ConfidentialAccounts;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
    confidentialAccounts = new ConfidentialAccounts(context);
  });

  afterEach(() => {
    dsMockUtils.reset();
    procedureMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
    procedureMockUtils.cleanup();
  });

  describe('method: registerConfidentialAccounts', () => {
    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const args = {
        proof: '0xproof',
      };

      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<
        ConfidentialAccount[]
      >;

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args, transformer: undefined }, context, {})
        .mockResolvedValue(expectedTransaction);

      const tx = await confidentialAccounts.registerConfidentialAccounts(args);

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: getConfidentialAccount', () => {
    it('should return a ConfidentialAccount if it exists', async () => {
      const publicKey = '0xpublicKey';

      const mockConfidentialAssets = {
        accountDid: jest.fn().mockResolvedValue({
          isNone: false,
          unwrap: () => ({ toString: () => 'someDid' }),
        }),
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (context.polymeshApi.query as any).confidentialAssets = mockConfidentialAssets;

      const result = await confidentialAccounts.getConfidentialAccount({ publicKey });

      expect(result.publicKey).toBe(publicKey);
    });

    it('should throw if the account does not exist', async () => {
      const publicKey = '0xpublicKey';

      const mockConfidentialAssets = {
        accountDid: jest.fn().mockResolvedValue({
          isNone: true,
        }),
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (context.polymeshApi.query as any).confidentialAssets = mockConfidentialAssets;

      await expect(confidentialAccounts.getConfidentialAccount({ publicKey })).rejects.toThrow(
        `Confidential Account with public key "${publicKey}" does not exist`
      );
    });
  });

  describe('method: getConfidentialAccountsByIdentity', () => {
    it('should return a list of ConfidentialAccounts', async () => {
      const did = 'someDid';
      const publicKey1 = '0xpublicKey1';
      const publicKey2 = '0xpublicKey2';

      const mockEntries = [
        [{ args: [did, { toString: () => publicKey1 }] }, {}],
        [{ args: [did, { toString: () => publicKey2 }] }, {}],
      ];

      const mockConfidentialAssets = {
        didAccounts: {
          entries: jest.fn().mockResolvedValue(mockEntries),
        },
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (context.polymeshApi.query as any).confidentialAssets = mockConfidentialAssets;

      const result = await confidentialAccounts.getConfidentialAccountsByIdentity({ did });

      expect(result).toHaveLength(2);
      expect(result[0]!.publicKey).toBe(publicKey1);
      expect(result[1]!.publicKey).toBe(publicKey2);
    });

    it('should throw if confidentialAssets module is not available', async () => {
      const did = 'someDid';

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (context.polymeshApi.query as any).confidentialAssets = undefined;

      await expect(confidentialAccounts.getConfidentialAccountsByIdentity({ did })).rejects.toThrow(
        'Confidential assets module is not available on this chain'
      );
    });
  });

  describe('method: getIdentityFromConfidentialAccount', () => {
    it('should return the Identity if account exists', async () => {
      const publicKey = '0xpublicKey';
      const did = 'someDid';

      const mockConfidentialAssets = {
        accountDid: jest.fn().mockResolvedValue({
          isNone: false,
          unwrap: () => ({ toString: () => did }),
        }),
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (context.polymeshApi.query as any).confidentialAssets = mockConfidentialAssets;

      const result = await confidentialAccounts.getIdentityFromConfidentialAccount({ publicKey });

      expect(result?.did).toBe(did);
    });

    it('should return null if account does not exist', async () => {
      const publicKey = '0xpublicKey';

      const mockConfidentialAssets = {
        accountDid: jest.fn().mockResolvedValue({
          isNone: true,
        }),
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (context.polymeshApi.query as any).confidentialAssets = mockConfidentialAssets;

      const result = await confidentialAccounts.getIdentityFromConfidentialAccount({ publicKey });

      expect(result).toBeNull();
    });

    it('should throw if confidentialAssets module is not available', async () => {
      const publicKey = '0xpublicKey';

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (context.polymeshApi.query as any).confidentialAssets = undefined;

      await expect(
        confidentialAccounts.getIdentityFromConfidentialAccount({ publicKey })
      ).rejects.toThrow('Confidential assets module is not available on this chain');
    });
  });

  describe('method: getEncryptionKey', () => {
    it('should return the encryption key if set', async () => {
      const publicKey = '0xpublicKey';
      const encryptionKey = '0xencryptionKey';

      const mockConfidentialAssets = {
        accountEncryptionKey: jest.fn().mockResolvedValue({
          isNone: false,
          unwrap: () => ({ toString: () => encryptionKey }),
        }),
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (context.polymeshApi.query as any).confidentialAssets = mockConfidentialAssets;

      const result = await confidentialAccounts.getEncryptionKey({ publicKey });

      expect(result).toBe(encryptionKey);
    });

    it('should return null if encryption key is not set', async () => {
      const publicKey = '0xpublicKey';

      const mockConfidentialAssets = {
        accountEncryptionKey: jest.fn().mockResolvedValue({
          isNone: true,
        }),
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (context.polymeshApi.query as any).confidentialAssets = mockConfidentialAssets;

      const result = await confidentialAccounts.getEncryptionKey({ publicKey });

      expect(result).toBeNull();
    });

    it('should throw if confidentialAssets module is not available', async () => {
      const publicKey = '0xpublicKey';

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (context.polymeshApi.query as any).confidentialAssets = undefined;

      await expect(confidentialAccounts.getEncryptionKey({ publicKey })).rejects.toThrow(
        'Confidential assets module is not available on this chain'
      );
    });
  });
});
