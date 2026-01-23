import BigNumber from 'bignumber.js';

import { ConfidentialSettlement } from '~/api/entities/ConfidentialSettlement';
import { ConfidentialSettlementStatus } from '~/api/entities/ConfidentialSettlement/types';
import { Context, Entity, PolymeshError } from '~/internal';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';

describe('ConfidentialSettlement class', () => {
  let context: Mocked<Context>;
  let settlementId: string;
  let confidentialSettlement: ConfidentialSettlement;

  beforeAll(() => {
    entityMockUtils.initMocks();
    dsMockUtils.initMocks();

    settlementId = 'settlement-ref-123';
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
    confidentialSettlement = new ConfidentialSettlement({ id: settlementId }, context);
  });

  afterEach(() => {
    entityMockUtils.reset();
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  it('should extend Entity', () => {
    expect(ConfidentialSettlement.prototype).toBeInstanceOf(Entity);
  });

  describe('constructor', () => {
    it('should assign id to instance', () => {
      expect(confidentialSettlement.id).toBe(settlementId);
    });
  });

  describe('method: isUniqueIdentifiers', () => {
    it('should return true if the object conforms to the interface', () => {
      expect(ConfidentialSettlement.isUniqueIdentifiers({ id: 'someId' })).toBe(true);
      expect(ConfidentialSettlement.isUniqueIdentifiers({})).toBe(false);
      expect(ConfidentialSettlement.isUniqueIdentifiers({ id: 123 })).toBe(false);
    });
  });

  describe('method: exists', () => {
    it('should return true if the settlement exists on chain', async () => {
      const mockConfidentialAssets = {
        settlementState: jest.fn().mockResolvedValue({
          isSome: true,
        }),
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (context.polymeshApi.query as any).confidentialAssets = mockConfidentialAssets;

      const result = await confidentialSettlement.exists();
      expect(result).toBe(true);
      expect(mockConfidentialAssets.settlementState).toHaveBeenCalledWith(settlementId);
    });

    it('should return false if the settlement does not exist', async () => {
      const mockConfidentialAssets = {
        settlementState: jest.fn().mockResolvedValue({
          isSome: false,
        }),
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (context.polymeshApi.query as any).confidentialAssets = mockConfidentialAssets;

      const result = await confidentialSettlement.exists();
      expect(result).toBe(false);
    });

    it('should throw if confidentialAssets module is not available', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (context.polymeshApi.query as any).confidentialAssets = undefined;

      await expect(confidentialSettlement.exists()).rejects.toThrow(PolymeshError);
    });
  });

  describe('method: getStatus', () => {
    it('should return Pending status', async () => {
      const mockConfidentialAssets = {
        settlementState: jest.fn().mockResolvedValue({
          isSome: true,
          isNone: false,
          unwrap: () => ({
            isPending: true,
            isExecuted: false,
            isRejected: false,
          }),
        }),
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (context.polymeshApi.query as any).confidentialAssets = mockConfidentialAssets;

      const result = await confidentialSettlement.getStatus();
      expect(result).toBe(ConfidentialSettlementStatus.Pending);
    });

    it('should return Executed status', async () => {
      const mockConfidentialAssets = {
        settlementState: jest.fn().mockResolvedValue({
          isSome: true,
          isNone: false,
          unwrap: () => ({
            isPending: false,
            isExecuted: true,
            isRejected: false,
          }),
        }),
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (context.polymeshApi.query as any).confidentialAssets = mockConfidentialAssets;

      const result = await confidentialSettlement.getStatus();
      expect(result).toBe(ConfidentialSettlementStatus.Executed);
    });

    it('should return Rejected status', async () => {
      const mockConfidentialAssets = {
        settlementState: jest.fn().mockResolvedValue({
          isSome: true,
          isNone: false,
          unwrap: () => ({
            isPending: false,
            isExecuted: false,
            isRejected: true,
          }),
        }),
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (context.polymeshApi.query as any).confidentialAssets = mockConfidentialAssets;

      const result = await confidentialSettlement.getStatus();
      expect(result).toBe(ConfidentialSettlementStatus.Rejected);
    });

    it('should throw if the settlement does not exist', async () => {
      const mockConfidentialAssets = {
        settlementState: jest.fn().mockResolvedValue({
          isSome: false,
          isNone: true,
        }),
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (context.polymeshApi.query as any).confidentialAssets = mockConfidentialAssets;

      await expect(confidentialSettlement.getStatus()).rejects.toThrow(
        'The Confidential Settlement does not exist'
      );
    });

    it('should return Pending status for unknown status values', async () => {
      const mockConfidentialAssets = {
        settlementState: jest.fn().mockResolvedValue({
          isSome: true,
          isNone: false,
          unwrap: () => ({
            isPending: false,
            isExecuted: false,
            isRejected: false,
          }),
        }),
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (context.polymeshApi.query as any).confidentialAssets = mockConfidentialAssets;

      const result = await confidentialSettlement.getStatus();
      expect(result).toBe(ConfidentialSettlementStatus.Pending);
    });
  });

  describe('method: getMemo', () => {
    it('should return the memo if present', async () => {
      const memo = 'Test memo';
      const mockConfidentialAssets = {
        settlementMemo: jest.fn().mockResolvedValue({
          isSome: true,
          isNone: false,
          unwrap: () => ({ toString: () => memo }),
        }),
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (context.polymeshApi.query as any).confidentialAssets = mockConfidentialAssets;

      const result = await confidentialSettlement.getMemo();
      expect(result).toBe(memo);
    });

    it('should return null if no memo is set', async () => {
      const mockConfidentialAssets = {
        settlementMemo: jest.fn().mockResolvedValue({
          isSome: false,
          isNone: true,
        }),
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (context.polymeshApi.query as any).confidentialAssets = mockConfidentialAssets;

      const result = await confidentialSettlement.getMemo();
      expect(result).toBeNull();
    });
  });

  describe('method: getPendingAffirmationsCount', () => {
    it('should return the pending affirmations count', async () => {
      const count = 3;
      const mockConfidentialAssets = {
        settlementPendingAffirmations: jest.fn().mockResolvedValue({
          toNumber: () => count,
        }),
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (context.polymeshApi.query as any).confidentialAssets = mockConfidentialAssets;

      const result = await confidentialSettlement.getPendingAffirmationsCount();
      expect(result.toNumber()).toBe(count);
    });
  });

  describe('method: canExecute', () => {
    it('should return true if status is Pending and no pending affirmations', async () => {
      const mockConfidentialAssets = {
        settlementState: jest.fn().mockResolvedValue({
          isSome: true,
          isNone: false,
          unwrap: () => ({
            isPending: true,
            isExecuted: false,
            isRejected: false,
          }),
        }),
        settlementPendingAffirmations: jest.fn().mockResolvedValue({
          toNumber: () => 0,
        }),
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (context.polymeshApi.query as any).confidentialAssets = mockConfidentialAssets;

      const result = await confidentialSettlement.canExecute();
      expect(result).toBe(true);
    });

    it('should return false if there are pending affirmations', async () => {
      const mockConfidentialAssets = {
        settlementState: jest.fn().mockResolvedValue({
          isSome: true,
          isNone: false,
          unwrap: () => ({
            isPending: true,
            isExecuted: false,
            isRejected: false,
          }),
        }),
        settlementPendingAffirmations: jest.fn().mockResolvedValue({
          toNumber: () => 2,
        }),
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (context.polymeshApi.query as any).confidentialAssets = mockConfidentialAssets;

      const result = await confidentialSettlement.canExecute();
      expect(result).toBe(false);
    });

    it('should return false if settlement is not Pending', async () => {
      const mockConfidentialAssets = {
        settlementState: jest.fn().mockResolvedValue({
          isSome: true,
          isNone: false,
          unwrap: () => ({
            isPending: false,
            isExecuted: true,
            isRejected: false,
          }),
        }),
        settlementPendingAffirmations: jest.fn().mockResolvedValue({
          toNumber: () => 0,
        }),
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (context.polymeshApi.query as any).confidentialAssets = mockConfidentialAssets;

      const result = await confidentialSettlement.canExecute();
      expect(result).toBe(false);
    });
  });

  describe('method: details', () => {
    it('should return settlement details', async () => {
      const memo = 'Test memo';
      const mockConfidentialAssets = {
        settlementState: jest.fn().mockResolvedValue({
          isSome: true,
          isNone: false,
          unwrap: () => ({
            isPending: true,
            isExecuted: false,
            isRejected: false,
          }),
        }),
        settlementMemo: jest.fn().mockResolvedValue({
          isSome: true,
          isNone: false,
          unwrap: () => ({ toString: () => memo }),
        }),
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (context.polymeshApi.query as any).confidentialAssets = mockConfidentialAssets;

      const result = await confidentialSettlement.details();
      expect(result.status).toBe(ConfidentialSettlementStatus.Pending);
      expect(result.memo).toBe(memo);
      expect(result.legs).toEqual([]);
    });
  });

  describe('method: toHuman', () => {
    it('should return the settlement ID', () => {
      expect(confidentialSettlement.toHuman()).toBe(settlementId);
    });
  });
});
