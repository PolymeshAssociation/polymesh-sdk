import { ISubmittableResult } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';

import { ConfidentialAsset } from '~/api/entities/ConfidentialAsset';
import { CreateConfidentialAssetParams } from '~/api/entities/ConfidentialAsset/types';
import {
  createCreateConfidentialAssetResolver,
  prepareCreateConfidentialAsset,
} from '~/api/procedures/createConfidentialAsset';
import { Context } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';

describe('createConfidentialAsset procedure', () => {
  let mockContext: Mocked<Context>;
  let args: CreateConfidentialAssetParams;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();

    // Mock the confidentialAssets pallet
    (mockContext.polymeshApi.tx as any).confidentialAssets = {
      createAsset: dsMockUtils.createTxMock('asset', 'createAsset'),
    };

    args = {
      name: 'Test Asset',
      symbol: 'TEST',
      decimals: 6,
      auditors: ['0xauditor1', '0xauditor2'],
      mediators: ['0xmediator1'],
      data: 'someData',
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

  describe('prepareCreateConfidentialAsset', () => {
    it('should throw an error if decimals is less than 0', async () => {
      const proc = procedureMockUtils.getInstance<CreateConfidentialAssetParams, ConfidentialAsset>(
        mockContext
      );

      await expect(
        prepareCreateConfidentialAsset.call(proc, { ...args, decimals: -1 })
      ).rejects.toThrow('Decimals must be between 0 and 18');
    });

    it('should throw an error if decimals is greater than 18', async () => {
      const proc = procedureMockUtils.getInstance<CreateConfidentialAssetParams, ConfidentialAsset>(
        mockContext
      );

      await expect(
        prepareCreateConfidentialAsset.call(proc, { ...args, decimals: 19 })
      ).rejects.toThrow('Decimals must be between 0 and 18');
    });

    it('should throw an error if symbol is longer than 12 characters', async () => {
      const proc = procedureMockUtils.getInstance<CreateConfidentialAssetParams, ConfidentialAsset>(
        mockContext
      );

      await expect(
        prepareCreateConfidentialAsset.call(proc, { ...args, symbol: 'TOOLONGSYMBOL1' })
      ).rejects.toThrow('Symbol must be 12 characters or less');
    });

    it('should throw an error if no auditors are provided', async () => {
      const proc = procedureMockUtils.getInstance<CreateConfidentialAssetParams, ConfidentialAsset>(
        mockContext
      );

      await expect(
        prepareCreateConfidentialAsset.call(proc, { ...args, auditors: [] })
      ).rejects.toThrow('At least one auditor is required');
    });

    it('should return a createAsset transaction spec', async () => {
      const transaction = dsMockUtils.createTxMock('confidentialAssets', 'createAsset');

      const proc = procedureMockUtils.getInstance<CreateConfidentialAssetParams, ConfidentialAsset>(
        mockContext
      );

      const result = await prepareCreateConfidentialAsset.call(proc, args);

      expect(result).toEqual({
        transaction,
        args: expect.any(Array),
        resolver: expect.any(Function),
      });
    });

    it('should use default values for optional parameters', async () => {
      const transaction = dsMockUtils.createTxMock('confidentialAssets', 'createAsset');

      const proc = procedureMockUtils.getInstance<CreateConfidentialAssetParams, ConfidentialAsset>(
        mockContext
      );

      const minArgs = {
        name: 'Test',
        symbol: 'TEST',
        decimals: 0,
        auditors: ['0xauditor1'],
      };

      const result = await prepareCreateConfidentialAsset.call(proc, minArgs);

      expect(result).toEqual({
        transaction,
        args: expect.any(Array),
        resolver: expect.any(Function),
      });
    });
  });

  describe('createCreateConfidentialAssetResolver', () => {
    it('should return the created ConfidentialAsset', () => {
      const assetId = new BigNumber(5);

      const mockReceipt = {
        filterRecords: jest.fn().mockReturnValue([
          {
            event: {
              data: ['someDid', { toNumber: () => assetId.toNumber() }],
            },
          },
        ]),
      } as unknown as ISubmittableResult;

      const fakeContext = {} as Context;

      const result = createCreateConfidentialAssetResolver(fakeContext)(mockReceipt);

      expect(result).toBeInstanceOf(ConfidentialAsset);
      expect(result.id.toNumber()).toBe(assetId.toNumber());
    });

    it('should throw if AssetCreated event is not found', () => {
      const mockReceipt = {
        filterRecords: jest.fn().mockReturnValue([]),
      } as unknown as ISubmittableResult;

      const fakeContext = {} as Context;

      expect(() => createCreateConfidentialAssetResolver(fakeContext)(mockReceipt)).toThrow(
        'Failed to find AssetCreated event in transaction receipt'
      );
    });
  });
});
