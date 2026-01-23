import BigNumber from 'bignumber.js';

import { ConfidentialAsset } from '~/api/entities/ConfidentialAsset';
import { Context, Entity, PolymeshError } from '~/internal';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';

describe('ConfidentialAsset class', () => {
  let context: Mocked<Context>;
  let assetId: BigNumber;
  let confidentialAsset: ConfidentialAsset;

  beforeAll(() => {
    entityMockUtils.initMocks();
    dsMockUtils.initMocks();

    assetId = new BigNumber(1);
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
    confidentialAsset = new ConfidentialAsset({ id: assetId }, context);
  });

  afterEach(() => {
    entityMockUtils.reset();
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  it('should extend Entity', () => {
    expect(ConfidentialAsset.prototype).toBeInstanceOf(Entity);
  });

  describe('constructor', () => {
    it('should assign id to instance', () => {
      expect(confidentialAsset.id.toNumber()).toBe(assetId.toNumber());
    });
  });

  describe('method: isUniqueIdentifiers', () => {
    it('should return true if the object conforms to the interface', () => {
      expect(ConfidentialAsset.isUniqueIdentifiers({ id: new BigNumber(1) })).toBe(true);
      expect(ConfidentialAsset.isUniqueIdentifiers({})).toBe(false);
      expect(ConfidentialAsset.isUniqueIdentifiers({ id: 'notABigNumber' })).toBe(false);
    });
  });

  describe('method: exists', () => {
    it('should return true if the asset exists on chain', async () => {
      const mockConfidentialAssets = {
        dartAssetDetails: jest.fn().mockResolvedValue({
          isSome: true,
        }),
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (context.polymeshApi.query as any).confidentialAssets = mockConfidentialAssets;

      const result = await confidentialAsset.exists();
      expect(result).toBe(true);
      expect(mockConfidentialAssets.dartAssetDetails).toHaveBeenCalledWith(assetId.toNumber());
    });

    it('should return false if the asset does not exist', async () => {
      const mockConfidentialAssets = {
        dartAssetDetails: jest.fn().mockResolvedValue({
          isSome: false,
        }),
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (context.polymeshApi.query as any).confidentialAssets = mockConfidentialAssets;

      const result = await confidentialAsset.exists();
      expect(result).toBe(false);
    });

    it('should throw if confidentialAssets module is not available', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (context.polymeshApi.query as any).confidentialAssets = undefined;

      await expect(confidentialAsset.exists()).rejects.toThrow(PolymeshError);
    });
  });

  describe('method: details', () => {
    it('should return asset details', async () => {
      const ownerDid = 'someDid';
      const name = 'Test Asset';
      const symbol = 'TEST';
      const decimals = 6;
      const data = 'someData';
      const totalSupply = 1000000;

      const mockConfidentialAssets = {
        dartAssetDetails: jest.fn().mockResolvedValue({
          isSome: true,
          isNone: false,
          unwrap: () => ({
            owner: { toString: () => ownerDid },
            data: { toString: () => data },
            totalSupply: { toNumber: () => totalSupply },
            auditors: [],
            mediators: [],
          }),
        }),
        confidentialAssetNames: jest.fn().mockResolvedValue({
          isSome: true,
          unwrap: () => ({ toString: () => name }),
        }),
        confidentialAssetSymbols: jest.fn().mockResolvedValue({
          isSome: true,
          unwrap: () => ({ toString: () => symbol }),
        }),
        confidentialAssetDecimals: jest.fn().mockResolvedValue({
          isSome: true,
          unwrap: () => ({ toNumber: () => decimals }),
        }),
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (context.polymeshApi.query as any).confidentialAssets = mockConfidentialAssets;

      const result = await confidentialAsset.details();

      expect(result.id.toNumber()).toBe(assetId.toNumber());
      expect(result.name).toBe(name);
      expect(result.symbol).toBe(symbol);
      expect(result.decimals).toBe(decimals);
      expect(result.owner.did).toBe(ownerDid);
      expect(result.data).toBe(data);
      expect(result.totalSupply.toNumber()).toBe(totalSupply);
    });

    it('should return default values when optional fields are not set', async () => {
      const ownerDid = 'someDid';

      const mockConfidentialAssets = {
        dartAssetDetails: jest.fn().mockResolvedValue({
          isSome: true,
          isNone: false,
          unwrap: () => ({
            owner: { toString: () => ownerDid },
            data: { toString: () => '' },
            totalSupply: { toNumber: () => 0 },
            auditors: [],
            mediators: [],
          }),
        }),
        confidentialAssetNames: jest.fn().mockResolvedValue({
          isSome: false,
        }),
        confidentialAssetSymbols: jest.fn().mockResolvedValue({
          isSome: false,
        }),
        confidentialAssetDecimals: jest.fn().mockResolvedValue({
          isSome: false,
        }),
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (context.polymeshApi.query as any).confidentialAssets = mockConfidentialAssets;

      const result = await confidentialAsset.details();

      expect(result.name).toBe('');
      expect(result.symbol).toBe('');
      expect(result.decimals).toBe(0);
    });

    it('should throw if the asset does not exist', async () => {
      const mockConfidentialAssets = {
        dartAssetDetails: jest.fn().mockResolvedValue({
          isSome: false,
          isNone: true,
        }),
        confidentialAssetNames: jest.fn().mockResolvedValue({
          isSome: false,
        }),
        confidentialAssetSymbols: jest.fn().mockResolvedValue({
          isSome: false,
        }),
        confidentialAssetDecimals: jest.fn().mockResolvedValue({
          isSome: false,
        }),
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (context.polymeshApi.query as any).confidentialAssets = mockConfidentialAssets;

      await expect(confidentialAsset.details()).rejects.toThrow(
        'The Confidential Asset does not exist'
      );
    });
  });

  describe('method: getAuditors', () => {
    it('should return auditors and mediators', async () => {
      const auditor1 = '0xauditor1';
      const auditor2 = '0xauditor2';
      const mediator1 = '0xmediator1';

      const mockConfidentialAssets = {
        dartAssetDetails: jest.fn().mockResolvedValue({
          isSome: true,
          isNone: false,
          unwrap: () => ({
            auditors: [{ toString: () => auditor1 }, { toString: () => auditor2 }],
            mediators: [{ toString: () => mediator1 }],
          }),
        }),
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (context.polymeshApi.query as any).confidentialAssets = mockConfidentialAssets;

      const result = await confidentialAsset.getAuditors();

      expect(result.auditors).toEqual([auditor1, auditor2]);
      expect(result.mediators).toEqual([mediator1]);
    });

    it('should throw if the asset does not exist', async () => {
      const mockConfidentialAssets = {
        dartAssetDetails: jest.fn().mockResolvedValue({
          isSome: false,
          isNone: true,
        }),
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (context.polymeshApi.query as any).confidentialAssets = mockConfidentialAssets;

      await expect(confidentialAsset.getAuditors()).rejects.toThrow(
        'The Confidential Asset does not exist'
      );
    });
  });

  describe('method: toHuman', () => {
    it('should return the asset ID as string', () => {
      expect(confidentialAsset.toHuman()).toBe(assetId.toString());
    });
  });
});
