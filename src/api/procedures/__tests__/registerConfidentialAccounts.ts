import { ISubmittableResult } from '@polkadot/types/types';

import { RegisterConfidentialAccountsParams } from '~/api/client/ConfidentialAccounts';
import { ConfidentialAccount } from '~/api/entities/ConfidentialAccount';
import {
  createRegisterConfidentialAccountsResolver,
  prepareRegisterConfidentialAccounts,
} from '~/api/procedures/registerConfidentialAccounts';
import { Context } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';

describe('registerConfidentialAccounts procedure', () => {
  let mockContext: Mocked<Context>;
  let args: RegisterConfidentialAccountsParams;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();

    // Mock the confidentialAssets pallet
    (mockContext.polymeshApi.tx as any).confidentialAssets = {
      registerAccounts: dsMockUtils.createTxMock('asset', 'createAsset'),
    };

    args = {
      proof: '0xvalidproof',
    };
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

  describe('prepareRegisterConfidentialAccounts', () => {
    it('should throw an error if no proof is provided', async () => {
      const proc = procedureMockUtils.getInstance<
        RegisterConfidentialAccountsParams,
        ConfidentialAccount[]
      >(mockContext);

      await expect(prepareRegisterConfidentialAccounts.call(proc, { proof: '' })).rejects.toThrow(
        'A valid registration proof is required'
      );
    });

    it('should return a registerAccounts transaction spec', async () => {
      const transaction = dsMockUtils.createTxMock('confidentialAssets', 'registerAccounts');

      const proc = procedureMockUtils.getInstance<
        RegisterConfidentialAccountsParams,
        ConfidentialAccount[]
      >(mockContext);

      const result = await prepareRegisterConfidentialAccounts.call(proc, args);

      expect(result).toEqual({
        transaction,
        args: [args.proof],
        resolver: expect.any(Function),
      });
    });

    it('should accept Uint8Array as proof', async () => {
      const transaction = dsMockUtils.createTxMock('confidentialAssets', 'registerAccounts');
      const proofBytes = new Uint8Array([1, 2, 3, 4]);

      const proc = procedureMockUtils.getInstance<
        RegisterConfidentialAccountsParams,
        ConfidentialAccount[]
      >(mockContext);

      const result = await prepareRegisterConfidentialAccounts.call(proc, { proof: proofBytes });

      expect(result).toEqual({
        transaction,
        args: [proofBytes],
        resolver: expect.any(Function),
      });
    });
  });

  describe('createRegisterConfidentialAccountsResolver', () => {
    it('should return the created ConfidentialAccounts', () => {
      const publicKey1 = '0xpublicKey1';
      const publicKey2 = '0xpublicKey2';

      const mockReceipt = {
        filterRecords: jest.fn().mockReturnValue([
          {
            event: {
              data: ['someDid', { toString: () => publicKey1 }],
            },
          },
          {
            event: {
              data: ['someDid', { toString: () => publicKey2 }],
            },
          },
        ]),
      } as unknown as ISubmittableResult;

      const fakeContext = {} as Context;

      const result = createRegisterConfidentialAccountsResolver(fakeContext)(mockReceipt);

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(ConfidentialAccount);
      expect(result[0]!.publicKey).toBe(publicKey1);
      expect(result[1]).toBeInstanceOf(ConfidentialAccount);
      expect(result[1]!.publicKey).toBe(publicKey2);
    });

    it('should throw if no AccountCreated events are found', () => {
      const mockReceipt = {
        filterRecords: jest.fn().mockReturnValue([]),
      } as unknown as ISubmittableResult;

      const fakeContext = {} as Context;

      expect(() => createRegisterConfidentialAccountsResolver(fakeContext)(mockReceipt)).toThrow(
        'Failed to find AccountCreated events in transaction receipt'
      );
    });
  });
});
