import BigNumber from 'bignumber.js';

import { ConfidentialAccount } from '~/api/entities/ConfidentialAccount';
import { Context, Entity, PolymeshError } from '~/internal';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { ErrorCode } from '~/types';

describe('ConfidentialAccount class', () => {
  let context: Mocked<Context>;
  let publicKey: string;
  let confidentialAccount: ConfidentialAccount;

  beforeAll(() => {
    entityMockUtils.initMocks();
    dsMockUtils.initMocks();

    publicKey = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
    confidentialAccount = new ConfidentialAccount({ publicKey }, context);
  });

  afterEach(() => {
    entityMockUtils.reset();
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  it('should extend Entity', () => {
    expect(ConfidentialAccount.prototype).toBeInstanceOf(Entity);
  });

  describe('constructor', () => {
    it('should assign publicKey to instance', () => {
      expect(confidentialAccount.publicKey).toBe(publicKey);
    });
  });

  describe('method: isUniqueIdentifiers', () => {
    it('should return true if the object conforms to the interface', () => {
      expect(ConfidentialAccount.isUniqueIdentifiers({ publicKey: 'someKey' })).toBe(true);
      expect(ConfidentialAccount.isUniqueIdentifiers({})).toBe(false);
      expect(ConfidentialAccount.isUniqueIdentifiers({ publicKey: 123 })).toBe(false);
    });
  });

  describe('method: exists', () => {
    it('should return true if the account has an associated identity', async () => {
      const mockConfidentialAssets = {
        accountDid: jest.fn().mockResolvedValue({
          isNone: false,
          unwrap: () => ({ toString: () => 'someDid' }),
        }),
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (context.polymeshApi.query as any).confidentialAssets = mockConfidentialAssets;

      const result = await confidentialAccount.exists();
      expect(result).toBe(true);
    });

    it('should return false if the account has no associated identity', async () => {
      const mockConfidentialAssets = {
        accountDid: jest.fn().mockResolvedValue({
          isNone: true,
        }),
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (context.polymeshApi.query as any).confidentialAssets = mockConfidentialAssets;

      const result = await confidentialAccount.exists();
      expect(result).toBe(false);
    });

    it('should throw if confidentialAssets module is not available', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (context.polymeshApi.query as any).confidentialAssets = undefined;

      await expect(confidentialAccount.exists()).rejects.toThrow(PolymeshError);
    });
  });

  describe('method: getIdentity', () => {
    it('should return the Identity associated with the account', async () => {
      const did = 'someDid';
      const mockConfidentialAssets = {
        accountDid: jest.fn().mockResolvedValue({
          isNone: false,
          unwrap: () => ({ toString: () => did }),
        }),
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (context.polymeshApi.query as any).confidentialAssets = mockConfidentialAssets;

      const result = await confidentialAccount.getIdentity();
      expect(result?.did).toBe(did);
    });

    it('should return null if no identity is associated', async () => {
      const mockConfidentialAssets = {
        accountDid: jest.fn().mockResolvedValue({
          isNone: true,
        }),
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (context.polymeshApi.query as any).confidentialAssets = mockConfidentialAssets;

      const result = await confidentialAccount.getIdentity();
      expect(result).toBeNull();
    });
  });

  describe('method: getDetails', () => {
    it('should return the account details', async () => {
      const did = 'someDid';
      const encryptionKey = '0xencryptionkey';
      const mockConfidentialAssets = {
        accountDid: jest.fn().mockResolvedValue({
          isNone: false,
          unwrap: () => ({ toString: () => did }),
        }),
        accountEncryptionKey: jest.fn().mockResolvedValue({
          isSome: true,
          unwrap: () => ({ toString: () => encryptionKey }),
        }),
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (context.polymeshApi.query as any).confidentialAssets = mockConfidentialAssets;

      const result = await confidentialAccount.getDetails();
      expect(result.identity.did).toBe(did);
      expect(result.encryptionKey).toBe(encryptionKey);
    });

    it('should throw if the account does not exist', async () => {
      const mockConfidentialAssets = {
        accountDid: jest.fn().mockResolvedValue({
          isNone: true,
        }),
        accountEncryptionKey: jest.fn().mockResolvedValue({
          isSome: false,
        }),
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (context.polymeshApi.query as any).confidentialAssets = mockConfidentialAssets;

      await expect(confidentialAccount.getDetails()).rejects.toThrow(
        'The Confidential Account does not exist'
      );
    });

    it('should return empty encryptionKey if not set', async () => {
      const did = 'someDid';
      const mockConfidentialAssets = {
        accountDid: jest.fn().mockResolvedValue({
          isNone: false,
          unwrap: () => ({ toString: () => did }),
        }),
        accountEncryptionKey: jest.fn().mockResolvedValue({
          isSome: false,
        }),
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (context.polymeshApi.query as any).confidentialAssets = mockConfidentialAssets;

      const result = await confidentialAccount.getDetails();
      expect(result.encryptionKey).toBe('');
    });
  });

  describe('method: isRegisteredForAsset', () => {
    it('should return true if account is registered for the asset', async () => {
      const assetId = new BigNumber(1);
      const mockConfidentialAssets = {
        accountAssetRegistrations: jest.fn().mockResolvedValue({
          isTrue: true,
        }),
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (context.polymeshApi.query as any).confidentialAssets = mockConfidentialAssets;

      const result = await confidentialAccount.isRegisteredForAsset({ assetId });
      expect(result).toBe(true);
      expect(mockConfidentialAssets.accountAssetRegistrations).toHaveBeenCalledWith(
        publicKey,
        assetId.toNumber()
      );
    });

    it('should return false if account is not registered for the asset', async () => {
      const assetId = new BigNumber(1);
      const mockConfidentialAssets = {
        accountAssetRegistrations: jest.fn().mockResolvedValue({
          isTrue: false,
        }),
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (context.polymeshApi.query as any).confidentialAssets = mockConfidentialAssets;

      const result = await confidentialAccount.isRegisteredForAsset({ assetId });
      expect(result).toBe(false);
    });
  });

  describe('method: getRegisteredAssets', () => {
    it('should return list of registered asset IDs', async () => {
      const mockEntries = [
        [{ args: [publicKey, { toNumber: () => 1 }] }, { isTrue: true }],
        [{ args: [publicKey, { toNumber: () => 2 }] }, { isTrue: true }],
        [{ args: [publicKey, { toNumber: () => 3 }] }, { isTrue: false }],
      ];

      const mockConfidentialAssets = {
        accountAssetRegistrations: {
          entries: jest.fn().mockResolvedValue(mockEntries),
        },
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (context.polymeshApi.query as any).confidentialAssets = mockConfidentialAssets;

      const result = await confidentialAccount.getRegisteredAssets();
      expect(result).toHaveLength(2);
      expect(result[0]!.toNumber()).toBe(1);
      expect(result[1]!.toNumber()).toBe(2);
    });
  });

  describe('method: toHuman', () => {
    it('should return the public key', () => {
      expect(confidentialAccount.toHuman()).toBe(publicKey);
    });
  });
});
