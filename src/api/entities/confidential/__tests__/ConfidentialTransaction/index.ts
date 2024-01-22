import BigNumber from 'bignumber.js';

import { ConfidentialTransaction, Context, Entity, PolymeshError } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import {
  createMockConfidentialAssetTransaction,
  createMockOption,
} from '~/testUtils/mocks/dataSources';
import { Mocked } from '~/testUtils/types';
import { ConfidentialTransactionStatus, ErrorCode } from '~/types';
import { tuple } from '~/types/utils';

describe('ConfidentialTransaction class', () => {
  let context: Mocked<Context>;
  let transaction: ConfidentialTransaction;
  let id: BigNumber;

  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();
    procedureMockUtils.initMocks();

    id = new BigNumber(1);
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
    transaction = new ConfidentialTransaction({ id }, context);
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

  it('should extend Entity', () => {
    expect(ConfidentialTransaction.prototype instanceof Entity).toBe(true);
  });

  describe('method: isUniqueIdentifiers', () => {
    it('should return true if the object conforms to the interface', () => {
      expect(ConfidentialTransaction.isUniqueIdentifiers({ id: new BigNumber(1) })).toBe(true);
      expect(ConfidentialTransaction.isUniqueIdentifiers({})).toBe(false);
      expect(ConfidentialTransaction.isUniqueIdentifiers({ id: 3 })).toBe(false);
    });
  });

  describe('method: exists', () => {
    it('should return whether the instruction exists', async () => {
      dsMockUtils
        .createQueryMock('confidentialAsset', 'transactionCounter')
        .mockResolvedValue(
          dsMockUtils.createMockCompact(dsMockUtils.createMockU64(new BigNumber(10)))
        );

      let result = await transaction.exists();

      expect(result).toBe(true);

      let fakeTransaction = new ConfidentialTransaction({ id: new BigNumber(0) }, context);

      result = await fakeTransaction.exists();

      expect(result).toBe(false);

      fakeTransaction = new ConfidentialTransaction({ id: new BigNumber(20) }, context);

      result = await fakeTransaction.exists();

      expect(result).toBe(false);
    });
  });

  describe('method: details', () => {
    const mockCreatedAt = dsMockUtils.createMockU32(new BigNumber(1));
    const mockVenueId = dsMockUtils.createMockU64(new BigNumber(2));
    const mockStatus = dsMockUtils.createMockConfidentialTransactionStatus(
      ConfidentialTransactionStatus.Pending
    );

    it('should return details', async () => {
      dsMockUtils.createQueryMock('confidentialAsset', 'transactions').mockResolvedValue(
        dsMockUtils.createMockOption(
          createMockConfidentialAssetTransaction({
            venueId: mockVenueId,
            createdAt: mockCreatedAt,
            memo: createMockOption(),
          })
        )
      );

      dsMockUtils
        .createQueryMock('confidentialAsset', 'transactionStatuses')
        .mockResolvedValue(dsMockUtils.createMockOption(mockStatus));

      const result = await transaction.details();

      expect(result).toEqual({
        createdAt: new BigNumber(1),
        memo: undefined,
        status: ConfidentialTransactionStatus.Pending,
        venueId: new BigNumber(2),
      });
    });

    it('should throw an error if transaction details are not found', async () => {
      dsMockUtils
        .createQueryMock('confidentialAsset', 'transactions')
        .mockResolvedValue(dsMockUtils.createMockOption());

      dsMockUtils
        .createQueryMock('confidentialAsset', 'transactionStatuses')
        .mockResolvedValue(dsMockUtils.createMockOption(mockStatus));

      const expectedError = new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: 'Confidential transaction details were not found',
      });

      return expect(transaction.details()).rejects.toThrow(expectedError);
    });

    it('should throw an error if transaction status is not found', async () => {
      dsMockUtils.createQueryMock('confidentialAsset', 'transactions').mockResolvedValue(
        dsMockUtils.createMockOption(
          createMockConfidentialAssetTransaction({
            venueId: mockVenueId,
            createdAt: mockCreatedAt,
            memo: createMockOption(),
          })
        )
      );

      dsMockUtils
        .createQueryMock('confidentialAsset', 'transactionStatuses')
        .mockResolvedValue(dsMockUtils.createMockOption());

      const expectedError = new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: 'Confidential transaction details were not found',
      });

      return expect(transaction.details()).rejects.toThrow(expectedError);
    });
  });

  describe('method: getInvolvedParties', () => {
    it('should get involved parties for the transaction', async () => {
      const rawId = dsMockUtils.createMockU64(transaction.id);
      dsMockUtils.createQueryMock('confidentialAsset', 'transactionParties', {
        entries: [
          tuple(
            [rawId, dsMockUtils.createMockIdentityId('0x01')],
            dsMockUtils.createMockBool(true)
          ),
          tuple(
            [rawId, dsMockUtils.createMockIdentityId('0x02')],
            dsMockUtils.createMockBool(true)
          ),
        ],
      });

      const result = await transaction.getInvolvedParties();

      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ did: '0x01' }),
          expect.objectContaining({ did: '0x02' }),
        ])
      );
    });

    it('should throw an error if no parties are found', async () => {
      dsMockUtils.createQueryMock('confidentialAsset', 'transactionParties', {
        entries: [],
      });

      const expectedError = new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message:
          'No involved parties were found for this transaction. Its likely been completed and the chain storage has been pruned',
      });

      return expect(transaction.getInvolvedParties()).rejects.toThrow(expectedError);
    });
  });

  describe('method: toHuman', () => {
    it('should return a human readable version of the entity', () => {
      expect(transaction.toHuman()).toBe('1');
    });
  });
});
