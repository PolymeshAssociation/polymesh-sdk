import { ISubmittableResult } from '@polkadot/types/types';

import { ConfidentialSettlement } from '~/api/entities/ConfidentialSettlement';
import { CreateConfidentialSettlementParams } from '~/api/entities/ConfidentialSettlement/types';
import {
  createCreateConfidentialSettlementResolver,
  prepareCreateConfidentialSettlement,
} from '~/api/procedures/createConfidentialSettlement';
import { Context } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';

describe('createConfidentialSettlement procedure', () => {
  let mockContext: Mocked<Context>;
  let args: CreateConfidentialSettlementParams;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();

    // Mock the confidentialAssets pallet
    (mockContext.polymeshApi.tx as any).confidentialAssets = {
      createSettlement: dsMockUtils.createTxMock('asset', 'createAsset'),
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

  describe('prepareCreateConfidentialSettlement', () => {
    it('should throw an error if no proof is provided', async () => {
      const proc = procedureMockUtils.getInstance<
        CreateConfidentialSettlementParams,
        ConfidentialSettlement
      >(mockContext);

      await expect(prepareCreateConfidentialSettlement.call(proc, { proof: '' })).rejects.toThrow(
        'A valid settlement proof is required'
      );
    });

    it('should return a createSettlement transaction spec', async () => {
      const transaction = dsMockUtils.createTxMock('confidentialAssets', 'createSettlement');

      const proc = procedureMockUtils.getInstance<
        CreateConfidentialSettlementParams,
        ConfidentialSettlement
      >(mockContext);

      const result = await prepareCreateConfidentialSettlement.call(proc, args);

      expect(result).toEqual({
        transaction,
        args: [args.proof],
        resolver: expect.any(Function),
      });
    });

    it('should accept Uint8Array as proof', async () => {
      const transaction = dsMockUtils.createTxMock('confidentialAssets', 'createSettlement');
      const proofBytes = new Uint8Array([1, 2, 3, 4]);

      const proc = procedureMockUtils.getInstance<
        CreateConfidentialSettlementParams,
        ConfidentialSettlement
      >(mockContext);

      const result = await prepareCreateConfidentialSettlement.call(proc, { proof: proofBytes });

      expect(result).toEqual({
        transaction,
        args: [proofBytes],
        resolver: expect.any(Function),
      });
    });
  });

  describe('createCreateConfidentialSettlementResolver', () => {
    it('should return the created ConfidentialSettlement', () => {
      const settlementId = 'settlement-ref-123';

      const mockReceipt = {
        filterRecords: jest.fn().mockReturnValue([
          {
            event: {
              data: ['someDid', { toString: () => settlementId }],
            },
          },
        ]),
      } as unknown as ISubmittableResult;

      const fakeContext = {} as Context;

      const result = createCreateConfidentialSettlementResolver(fakeContext)(mockReceipt);

      expect(result).toBeInstanceOf(ConfidentialSettlement);
      expect(result.id).toBe(settlementId);
    });

    it('should throw if SettlementCreated event is not found', () => {
      const mockReceipt = {
        filterRecords: jest.fn().mockReturnValue([]),
      } as unknown as ISubmittableResult;

      const fakeContext = {} as Context;

      expect(() => createCreateConfidentialSettlementResolver(fakeContext)(mockReceipt)).toThrow(
        'Failed to find SettlementCreated event in transaction receipt'
      );
    });
  });
});
