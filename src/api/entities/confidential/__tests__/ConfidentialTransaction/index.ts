import { Bytes, u64 } from '@polkadot/types';
import { PalletConfidentialAssetTransactionLegState } from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import {
  ConfidentialTransaction,
  Context,
  Entity,
  PolymeshError,
  PolymeshTransaction,
} from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import {
  createMockConfidentialAssetTransaction,
  createMockConfidentialTransactionStatus,
  createMockOption,
} from '~/testUtils/mocks/dataSources';
import { Mocked } from '~/testUtils/types';
import {
  ConfidentialAffirmParty,
  ConfidentialLegStateBalances,
  ConfidentialTransactionStatus,
  ErrorCode,
  UnsubCallback,
} from '~/types';
import { tuple } from '~/types/utils';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/confidential/ConfidentialAsset',
  require('~/testUtils/mocks/entities').mockConfidentialAssetModule(
    '~/api/entities/confidential/ConfidentialAsset'
  )
);

jest.mock(
  '~/base/Procedure',
  require('~/testUtils/mocks/procedure').mockProcedureModule('~/base/Procedure')
);

describe('ConfidentialTransaction class', () => {
  let context: Mocked<Context>;
  let transaction: ConfidentialTransaction;
  let id: BigNumber;
  let legId: BigNumber;

  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();
    procedureMockUtils.initMocks();

    id = new BigNumber(1);
    legId = new BigNumber(2);
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

  describe('method: onStatusChange', () => {
    let bigNumberToU64Spy: jest.SpyInstance;
    let transactionStatusesMock: jest.Mock;
    let rawId: u64;

    afterAll(() => {
      jest.restoreAllMocks();
    });

    beforeAll(() => {
      bigNumberToU64Spy = jest.spyOn(utilsConversionModule, 'bigNumberToU64');
    });

    beforeEach(() => {
      const owner = 'someDid';
      rawId = dsMockUtils.createMockU64(new BigNumber(1));
      entityMockUtils.configureMocks({ identityOptions: { did: owner } });
      when(bigNumberToU64Spy).calledWith(id, context).mockReturnValue(rawId);

      transactionStatusesMock = dsMockUtils.createQueryMock(
        'confidentialAsset',
        'transactionStatuses'
      );
    });

    it('should allow subscription', async () => {
      const unsubCallback = 'unsubCallback' as unknown as Promise<UnsubCallback>;
      const callback = jest.fn();

      const mockPendingStatus = dsMockUtils.createMockConfidentialTransactionStatus(
        ConfidentialTransactionStatus.Pending
      );
      const mockPending = dsMockUtils.createMockOption(
        createMockConfidentialTransactionStatus(ConfidentialTransactionStatus.Pending)
      );
      transactionStatusesMock.mockImplementationOnce(async (_, cbFunc) => {
        cbFunc(mockPending);
        return unsubCallback;
      });

      when(transactionStatusesMock).calledWith(rawId).mockResolvedValue(mockPendingStatus);

      let result = await transaction.onStatusChange(callback);

      expect(result).toEqual(unsubCallback);
      expect(callback).toBeCalledWith(ConfidentialTransactionStatus.Pending);

      const mockRejectedStatus = dsMockUtils.createMockOption(
        dsMockUtils.createMockInstructionStatus(ConfidentialTransactionStatus.Rejected)
      );

      transactionStatusesMock.mockImplementationOnce(async (_, cbFunc) => {
        cbFunc(mockRejectedStatus);
        return unsubCallback;
      });

      result = await transaction.onStatusChange(callback);

      expect(result).toEqual(unsubCallback);
      expect(callback).toBeCalledWith(ConfidentialTransactionStatus.Rejected);
    });

    it('should error missing transaction status', () => {
      const unsubCallback = 'unsubCallback' as unknown as Promise<UnsubCallback>;
      const callback = jest.fn();

      transactionStatusesMock.mockImplementationOnce(async (_, cbFunc) => {
        cbFunc(dsMockUtils.createMockOption());
        return unsubCallback;
      });

      const expectedError = new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: 'The status of the transaction was not found',
      });

      return expect(transaction.onStatusChange(callback)).rejects.toThrow(expectedError);
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

    it('should throw an error if no parties are found', () => {
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

  describe('method: getLegs', () => {
    const rawTransactionId = dsMockUtils.createMockConfidentialAssetTransactionId(id);
    const senderKey = '0x01';
    const receiverKey = '0x02';
    const mediatorDid = 'someDid';
    const sender = dsMockUtils.createMockConfidentialAccount(senderKey);
    const receiver = dsMockUtils.createMockConfidentialAccount(receiverKey);
    const mediator = dsMockUtils.createMockIdentityId(mediatorDid);

    beforeEach(() => {});

    it('should return the transaction legs', async () => {
      dsMockUtils.createQueryMock('confidentialAsset', 'transactionLegs', {
        entries: [
          tuple(
            [rawTransactionId, dsMockUtils.createMockConfidentialTransactionLegId(legId)],
            dsMockUtils.createMockOption(
              dsMockUtils.createMockConfidentialLegDetails({
                sender,
                receiver,
                auditors: dsMockUtils.createMockBTreeMap(),
                mediators: [mediator],
              })
            )
          ),
        ],
      });

      const result = await transaction.getLegs();
      expect(result).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: new BigNumber(2) })])
      );
    });

    it('should throw an error if details are None', () => {
      dsMockUtils.createQueryMock('confidentialAsset', 'transactionLegs', {
        entries: [
          tuple(
            [
              dsMockUtils.createMockConfidentialAssetTransactionId(id),
              dsMockUtils.createMockConfidentialTransactionLegId(legId),
            ],
            dsMockUtils.createMockOption()
          ),
        ],
      });

      const expectedError = new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: 'There were no details for a confidential transaction leg',
      });

      return expect(transaction.getLegs()).rejects.toThrow(expectedError);
    });
  });

  describe('method: getPendingAffirmsCount', () => {
    const mockCount = new BigNumber(3);
    const rawMockCount = dsMockUtils.createMockU32(mockCount);
    it('should return the number of pending affirmations', async () => {
      dsMockUtils.createQueryMock('confidentialAsset', 'pendingAffirms', {
        returnValue: dsMockUtils.createMockOption(rawMockCount),
      });

      const result = await transaction.getPendingAffirmsCount();
      expect(result).toEqual(mockCount);
    });

    it('should throw an error if the count is not found', async () => {
      dsMockUtils.createQueryMock('confidentialAsset', 'pendingAffirms', {
        returnValue: dsMockUtils.createMockOption(),
      });

      const expectedError = new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: 'Affirm count not available. The transaction has likely been completed and pruned',
      });

      return expect(transaction.getPendingAffirmsCount()).rejects.toThrow(expectedError);
    });
  });

  describe('method: execute', () => {
    it('should prepare the procedure and return the resulting transaction', async () => {
      const expectedTransaction =
        'someTransaction' as unknown as PolymeshTransaction<ConfidentialTransaction>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith(
          {
            args: { transaction },
            transformer: undefined,
          },
          context,
          {}
        )
        .mockResolvedValue(expectedTransaction);

      const tx = await transaction.execute();

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: affirmLeg', () => {
    it('should prepare the procedure and return the resulting transaction', async () => {
      const expectedTransaction =
        'someTransaction' as unknown as PolymeshTransaction<ConfidentialTransaction>;

      const args = { legId, party: ConfidentialAffirmParty.Mediator } as const;

      when(procedureMockUtils.getPrepareMock())
        .calledWith(
          {
            args: { transaction, ...args },
            transformer: undefined,
          },
          context,
          {}
        )
        .mockResolvedValue(expectedTransaction);

      const tx = await transaction.affirmLeg(args);

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: reject', () => {
    it('should prepare the procedure and return the resulting transaction', async () => {
      const expectedTransaction =
        'someTransaction' as unknown as PolymeshTransaction<ConfidentialTransaction>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith(
          {
            args: { transaction },
            transformer: undefined,
          },
          context,
          {}
        )
        .mockResolvedValue(expectedTransaction);

      const tx = await transaction.reject();

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('leg state methods', () => {});
  let mockLegState: dsMockUtils.MockCodec<PalletConfidentialAssetTransactionLegState>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockLegReturn: any;

  beforeEach(() => {
    mockLegState = dsMockUtils.createMockConfidentialLegState({
      assetState: dsMockUtils.createMockBTreeMap<
        Bytes,
        PalletConfidentialAssetTransactionLegState
      >(),
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (mockLegState.assetState as any).toJSON = (): Record<string, ConfidentialLegStateBalances> => ({
      // eslint-disable-next-line @typescript-eslint/naming-convention
      '0x01': {
        senderInitBalance: '0x02',
        senderAmount: '0x03',
        receiverAmount: '0x04',
      },
    });

    mockLegReturn = dsMockUtils.createMockOption(mockLegState);
  });

  describe('method: getLegStates', () => {
    it('should return the leg states for the transaction', async () => {
      dsMockUtils.createQueryMock('confidentialAsset', 'txLegStates', {
        entries: [
          tuple(
            [
              dsMockUtils.createMockConfidentialTransactionId(id),
              dsMockUtils.createMockConfidentialTransactionLegId(legId),
            ],
            mockLegReturn
          ),
          tuple(
            [
              dsMockUtils.createMockConfidentialTransactionId(id),
              dsMockUtils.createMockConfidentialTransactionLegId(new BigNumber(legId.plus(1))),
            ],
            dsMockUtils.createMockOption()
          ),
        ],
      });

      const result = await transaction.getLegStates();

      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            proved: true,
            assetState: expect.arrayContaining([
              expect.objectContaining({
                asset: expect.objectContaining({ id: '01' }),
                balances: expect.objectContaining({
                  senderInitBalance: '0x02',
                  senderAmount: '0x03',
                  receiverAmount: '0x04',
                }),
              }),
            ]),
          }),
          expect.objectContaining({
            proved: false,
          }),
        ])
      );
    });
  });

  describe('method: getLegState', () => {
    it('should return the leg state for the leg when its pending proof', async () => {
      dsMockUtils.createQueryMock('confidentialAsset', 'txLegStates', {
        returnValue: dsMockUtils.createMockOption(),
      });
      const result = await transaction.getLegState(legId);

      expect(result).toEqual({ proved: false });
    });

    it('should return the leg state for the leg when it has been proved', async () => {
      dsMockUtils.createQueryMock('confidentialAsset', 'txLegStates', {
        returnValue: mockLegReturn,
      });

      const result = await transaction.getLegState(legId);

      expect(result).toEqual({
        proved: true,
        assetState: expect.arrayContaining([
          expect.objectContaining({
            asset: expect.objectContaining({ id: '01' }),
            balances: expect.objectContaining({
              senderInitBalance: '0x02',
              senderAmount: '0x03',
              receiverAmount: '0x04',
            }),
          }),
        ]),
      });
    });
  });

  describe('method: toHuman', () => {
    it('should return a human readable version of the entity', () => {
      expect(transaction.toHuman()).toBe('1');
    });
  });
});
