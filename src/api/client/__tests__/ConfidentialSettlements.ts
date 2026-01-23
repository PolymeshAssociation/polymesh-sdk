import { when } from 'jest-when';

import { ConfidentialSettlements } from '~/api/client/ConfidentialSettlements';
import { ConfidentialSettlement } from '~/api/entities/ConfidentialSettlement';
import { Context, PolymeshError, PolymeshTransaction } from '~/internal';
import { dsMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { ErrorCode } from '~/types';

jest.mock(
  '~/base/Procedure',
  require('~/testUtils/mocks/procedure').mockProcedureModule('~/base/Procedure')
);

describe('ConfidentialSettlements Class', () => {
  let context: Mocked<Context>;
  let confidentialSettlements: ConfidentialSettlements;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
    confidentialSettlements = new ConfidentialSettlements(context);
  });

  afterEach(() => {
    dsMockUtils.reset();
    procedureMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
    procedureMockUtils.cleanup();
  });

  describe('method: createSettlement', () => {
    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const args = {
        proof: '0xproof',
      };

      const expectedTransaction =
        'someTransaction' as unknown as PolymeshTransaction<ConfidentialSettlement>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args, transformer: undefined }, context, {})
        .mockResolvedValue(expectedTransaction);

      const tx = await confidentialSettlements.createSettlement(args);

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: getSettlement', () => {
    it('should return a ConfidentialSettlement if it exists', async () => {
      const settlementId = 'settlement-ref-123';

      const mockConfidentialAssets = {
        settlementState: jest.fn().mockResolvedValue({
          isSome: true,
        }),
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (context.polymeshApi.query as any).confidentialAssets = mockConfidentialAssets;

      const result = await confidentialSettlements.getSettlement({ id: settlementId });

      expect(result.id).toBe(settlementId);
    });

    it('should throw if the settlement does not exist', async () => {
      const settlementId = 'settlement-ref-123';

      const mockConfidentialAssets = {
        settlementState: jest.fn().mockResolvedValue({
          isSome: false,
        }),
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (context.polymeshApi.query as any).confidentialAssets = mockConfidentialAssets;

      await expect(confidentialSettlements.getSettlement({ id: settlementId })).rejects.toThrow(
        `Confidential Settlement with ID "${settlementId}" does not exist`
      );
    });
  });
});
