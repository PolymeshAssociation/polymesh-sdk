import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import { ConfidentialAssets } from '~/api/client/ConfidentialAssets';
import { ConfidentialAsset } from '~/api/entities/ConfidentialAsset';
import { Context, PolymeshError, PolymeshTransaction } from '~/internal';
import { dsMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { ErrorCode } from '~/types';

jest.mock(
  '~/base/Procedure',
  require('~/testUtils/mocks/procedure').mockProcedureModule('~/base/Procedure')
);

describe('ConfidentialAssets Class', () => {
  let context: Mocked<Context>;
  let confidentialAssets: ConfidentialAssets;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
    confidentialAssets = new ConfidentialAssets(context);
  });

  afterEach(() => {
    dsMockUtils.reset();
    procedureMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
    procedureMockUtils.cleanup();
  });

  describe('method: createConfidentialAsset', () => {
    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const args = {
        name: 'Test Asset',
        symbol: 'TEST',
        decimals: 6,
        auditors: ['0xauditor1'],
        mediators: ['0xmediator1'],
      };

      const expectedTransaction =
        'someTransaction' as unknown as PolymeshTransaction<ConfidentialAsset>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args, transformer: undefined }, context, {})
        .mockResolvedValue(expectedTransaction);

      const tx = await confidentialAssets.createConfidentialAsset(args);

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: getConfidentialAsset', () => {
    it('should return a ConfidentialAsset if it exists', async () => {
      const assetId = new BigNumber(1);

      const mockConfidentialAssetsQuery = {
        dartAssetDetails: jest.fn().mockResolvedValue({
          isSome: true,
        }),
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (context.polymeshApi.query as any).confidentialAssets = mockConfidentialAssetsQuery;

      const result = await confidentialAssets.getConfidentialAsset({ id: assetId });

      expect(result.id.toNumber()).toBe(assetId.toNumber());
    });

    it('should throw if the asset does not exist', async () => {
      const assetId = new BigNumber(1);

      const mockConfidentialAssetsQuery = {
        dartAssetDetails: jest.fn().mockResolvedValue({
          isSome: false,
        }),
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (context.polymeshApi.query as any).confidentialAssets = mockConfidentialAssetsQuery;

      await expect(confidentialAssets.getConfidentialAsset({ id: assetId })).rejects.toThrow(
        `Confidential Asset with ID "${assetId.toString()}" does not exist`
      );
    });
  });

  describe('method: getNextAssetId', () => {
    it('should return the next asset ID', async () => {
      const nextId = new BigNumber(5);

      const mockConfidentialAssetsQuery = {
        nextAssetId: jest.fn().mockResolvedValue({
          toNumber: () => nextId.toNumber(),
        }),
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (context.polymeshApi.query as any).confidentialAssets = mockConfidentialAssetsQuery;

      const result = await confidentialAssets.getNextAssetId();

      expect(result.toNumber()).toBe(nextId.toNumber());
    });

    it('should throw if confidentialAssets module is not available', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (context.polymeshApi.query as any).confidentialAssets = undefined;

      await expect(confidentialAssets.getNextAssetId()).rejects.toThrow(
        'Confidential assets module is not available on this chain'
      );
    });
  });

  describe('method: getConfidentialAssetsByOwner', () => {
    it('should return a list of ConfidentialAssets owned by an identity', async () => {
      const did = 'someDid';

      const mockEntries = [
        [{ args: [did, { toNumber: () => 1 }] }, {}],
        [{ args: [did, { toNumber: () => 2 }] }, {}],
      ];

      const mockConfidentialAssetsQuery = {
        ownerAssets: {
          entries: jest.fn().mockResolvedValue(mockEntries),
        },
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (context.polymeshApi.query as any).confidentialAssets = mockConfidentialAssetsQuery;

      const result = await confidentialAssets.getConfidentialAssetsByOwner({ did });

      expect(result).toHaveLength(2);
      expect(result[0]!.id.toNumber()).toBe(1);
      expect(result[1]!.id.toNumber()).toBe(2);
    });

    it('should throw if confidentialAssets module is not available', async () => {
      const did = 'someDid';

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (context.polymeshApi.query as any).confidentialAssets = undefined;

      await expect(confidentialAssets.getConfidentialAssetsByOwner({ did })).rejects.toThrow(
        'Confidential assets module is not available on this chain'
      );
    });
  });
});
