import { StorageKey, u64 } from '@polkadot/types';
import { PolymeshPrimitivesIdentityIdPortfolioId } from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import { Context, Entity, Instruction, PolymeshTransaction } from '~/internal';
import { InstructionStatusEnum } from '~/middleware/enums';
import { instructionsQuery } from '~/middleware/queries';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { createMockInstructionStatus, createMockNfts } from '~/testUtils/mocks/dataSources';
import { Mocked } from '~/testUtils/types';
import {
  AffirmationStatus,
  InstructionAffirmationOperation,
  InstructionStatus,
  InstructionType,
  UnsubCallback,
} from '~/types';
import { InstructionStatus as InternalInstructionStatus } from '~/types/internal';
import { tuple } from '~/types/utils';
import * as utilsConversionModule from '~/utils/conversion';
import * as utilsInternalModule from '~/utils/internal';

jest.mock(
  '~/api/entities/Identity',
  require('~/testUtils/mocks/entities').mockIdentityModule('~/api/entities/Identity')
);
jest.mock(
  '~/api/entities/Asset',
  require('~/testUtils/mocks/entities').mockAssetModule('~/api/entities/Asset')
);
jest.mock(
  '~/api/entities/Venue',
  require('~/testUtils/mocks/entities').mockVenueModule('~/api/entities/Venue')
);
jest.mock(
  '~/base/Procedure',
  require('~/testUtils/mocks/procedure').mockProcedureModule('~/base/Procedure')
);

describe('Instruction class', () => {
  let context: Mocked<Context>;
  let instruction: Instruction;
  let id: BigNumber;
  let rawId: u64;

  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();
    procedureMockUtils.initMocks();

    id = new BigNumber(1);
    rawId = dsMockUtils.createMockU64(id);
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
    instruction = new Instruction({ id }, context);
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
    expect(Instruction.prototype instanceof Entity).toBe(true);
  });

  describe('method: isUniqueIdentifiers', () => {
    it('should return true if the object conforms to the interface', () => {
      expect(Instruction.isUniqueIdentifiers({ id: new BigNumber(1) })).toBe(true);
      expect(Instruction.isUniqueIdentifiers({})).toBe(false);
      expect(Instruction.isUniqueIdentifiers({ id: 3 })).toBe(false);
    });
  });

  describe('method: isExecuted', () => {
    afterAll(() => {
      jest.restoreAllMocks();
    });

    let bigNumberToU64Spy: jest.SpyInstance;
    let instructionCounterMock: jest.Mock;

    beforeAll(() => {
      bigNumberToU64Spy = jest.spyOn(utilsConversionModule, 'bigNumberToU64');
    });

    beforeEach(() => {
      instructionCounterMock = dsMockUtils.createQueryMock('settlement', 'instructionCounter', {
        returnValue: dsMockUtils.createMockU64(new BigNumber(1000)),
      });
      when(bigNumberToU64Spy).calledWith(id, context).mockReturnValue(rawId);
    });

    it('should return whether the instruction is executed', async () => {
      const owner = 'someDid';

      entityMockUtils.configureMocks({ identityOptions: { did: owner } });

      const instructionStatusesMock = dsMockUtils.createQueryMock(
        'settlement',
        'instructionStatuses'
      );
      when(instructionStatusesMock)
        .calledWith(rawId)
        .mockResolvedValue(
          dsMockUtils.createMockInstructionStatus(InternalInstructionStatus.Executed)
        );

      let result = await instruction.isExecuted();

      expect(result).toBe(true);

      when(instructionStatusesMock)
        .calledWith(rawId)
        .mockResolvedValue(
          dsMockUtils.createMockInstructionStatus(InternalInstructionStatus.Unknown)
        );
      instructionCounterMock.mockResolvedValue(dsMockUtils.createMockU64(new BigNumber(0)));

      result = await instruction.isExecuted();

      expect(result).toBe(false);

      instructionStatusesMock.mockResolvedValue(
        dsMockUtils.createMockInstructionStatus(InternalInstructionStatus.Pending)
      );

      result = await instruction.isExecuted();

      expect(result).toBe(false);
    });
  });

  describe('method: isPending', () => {
    afterAll(() => {
      jest.restoreAllMocks();
    });

    let bigNumberToU64Spy: jest.SpyInstance;

    beforeAll(() => {
      bigNumberToU64Spy = jest.spyOn(utilsConversionModule, 'bigNumberToU64');
    });

    beforeEach(() => {
      when(bigNumberToU64Spy).calledWith(id, context).mockReturnValue(rawId);
    });

    it('should return whether the instruction is pending', async () => {
      const owner = 'someDid';

      entityMockUtils.configureMocks({ identityOptions: { did: owner } });

      const instructionStatusesMock = dsMockUtils.createQueryMock(
        'settlement',
        'instructionStatuses'
      );
      when(instructionStatusesMock)
        .calledWith(rawId)
        .mockResolvedValue(
          dsMockUtils.createMockInstructionStatus(InternalInstructionStatus.Pending)
        );

      let result = await instruction.isPending();

      expect(result).toBe(true);

      instructionStatusesMock.mockResolvedValue(
        dsMockUtils.createMockInstructionStatus(InternalInstructionStatus.Executed)
      );

      result = await instruction.isPending();

      expect(result).toBe(false);
    });
  });

  describe('method: onStatusChange', () => {
    let bigNumberToU64Spy: jest.SpyInstance;
    let instructionStatusesMock: jest.Mock;

    afterAll(() => {
      jest.restoreAllMocks();
    });

    beforeAll(() => {
      bigNumberToU64Spy = jest.spyOn(utilsConversionModule, 'bigNumberToU64');
    });

    beforeEach(() => {
      const owner = 'someDid';
      entityMockUtils.configureMocks({ identityOptions: { did: owner } });
      when(bigNumberToU64Spy).calledWith(id, context).mockReturnValue(rawId);

      instructionStatusesMock = dsMockUtils.createQueryMock('settlement', 'instructionStatuses');
    });

    it('should allow subscription', async () => {
      const unsubCallback = 'unsubCallback' as unknown as Promise<UnsubCallback>;
      const callback = jest.fn();

      const mockPendingStatus = dsMockUtils.createMockInstructionStatus(InstructionStatus.Pending);

      instructionStatusesMock.mockImplementationOnce(async (_, cbFunc) => {
        cbFunc(createMockInstructionStatus(InternalInstructionStatus.Pending));
        return unsubCallback;
      });

      when(instructionStatusesMock).calledWith(rawId).mockResolvedValue(mockPendingStatus);

      let result = await instruction.onStatusChange(callback);

      expect(result).toEqual(unsubCallback);
      expect(callback).toBeCalledWith(InstructionStatus.Pending);

      instructionStatusesMock.mockImplementationOnce(async (_, cbFunc) => {
        cbFunc(dsMockUtils.createMockInstructionStatus(InternalInstructionStatus.Failed));
        return unsubCallback;
      });

      result = await instruction.onStatusChange(callback);

      expect(result).toEqual(unsubCallback);
      expect(callback).toBeCalledWith(InstructionStatus.Failed);
    });

    it('should error on unknown instruction status', () => {
      const unsubCallback = 'unsubCallback' as unknown as Promise<UnsubCallback>;
      const callback = jest.fn();

      instructionStatusesMock.mockImplementationOnce(async (_, cbFunc) => {
        cbFunc(createMockInstructionStatus(InternalInstructionStatus.Unknown));
        return unsubCallback;
      });

      when(instructionStatusesMock)
        .calledWith(rawId)
        .mockResolvedValue(dsMockUtils.createMockInstructionStatus('Unknown'));

      const expectedError = new Error('Unknown instruction status');

      return expect(instruction.onStatusChange(callback)).rejects.toThrow(expectedError);
    });
  });

  describe('method: exists', () => {
    afterAll(() => {
      jest.restoreAllMocks();
    });

    let bigNumberToU64Spy: jest.SpyInstance;

    beforeAll(() => {
      bigNumberToU64Spy = jest.spyOn(utilsConversionModule, 'bigNumberToU64');
    });

    beforeEach(() => {
      when(bigNumberToU64Spy).calledWith(id, context).mockReturnValue(rawId);
    });

    it('should return whether the instruction exists', async () => {
      const owner = 'someDid';

      entityMockUtils.configureMocks({ identityOptions: { did: owner } });

      const instructionCounterMock = dsMockUtils
        .createQueryMock('settlement', 'instructionCounter')
        .mockResolvedValue(dsMockUtils.createMockU64(new BigNumber(10)));

      let result = await instruction.exists();

      expect(result).toBe(true);

      instructionCounterMock.mockResolvedValue(dsMockUtils.createMockU64(new BigNumber(0)));

      result = await instruction.exists();

      expect(result).toBe(false);
    });
  });

  describe('method: details', () => {
    afterAll(() => {
      jest.restoreAllMocks();
    });

    let bigNumberToU64Spy: jest.SpyInstance;
    let queryMultiMock: jest.Mock;
    let instructionMemoToStringSpy: jest.SpyInstance;
    let meshSettlementTypeToEndConditionSpy: jest.SpyInstance;

    beforeAll(() => {
      bigNumberToU64Spy = jest.spyOn(utilsConversionModule, 'bigNumberToU64');
      instructionMemoToStringSpy = jest.spyOn(utilsConversionModule, 'instructionMemoToString');
      meshSettlementTypeToEndConditionSpy = jest.spyOn(
        utilsConversionModule,
        'meshSettlementTypeToEndCondition'
      );
    });

    beforeEach(() => {
      when(bigNumberToU64Spy).calledWith(id, context).mockReturnValue(rawId);
      dsMockUtils.createQueryMock('settlement', 'instructionDetails');
      dsMockUtils.createQueryMock('settlement', 'instructionStatuses');
      dsMockUtils.createQueryMock('settlement', 'instructionMemos');
      queryMultiMock = dsMockUtils.getQueryMultiMock();
    });

    it('should return the Instruction details', async () => {
      let status = InstructionStatus.Pending;
      const createdAt = new Date('10/14/1987');
      const tradeDate = new Date('11/17/1987');
      const valueDate = new Date('11/17/1987');
      const venueId = new BigNumber(1);
      let type = InstructionType.SettleOnAffirmation;
      const owner = 'someDid';
      const memo = 'someMemo';

      entityMockUtils.configureMocks({ identityOptions: { did: owner } });

      let rawSettlementType = dsMockUtils.createMockSettlementType(type);
      const rawInstructionDetails = dsMockUtils.createMockInstruction({
        instructionId: dsMockUtils.createMockU64(new BigNumber(1)),
        venueId: dsMockUtils.createMockU64(venueId),
        createdAt: dsMockUtils.createMockOption(
          dsMockUtils.createMockMoment(new BigNumber(createdAt.getTime()))
        ),
        tradeDate: dsMockUtils.createMockOption(
          dsMockUtils.createMockMoment(new BigNumber(tradeDate.getTime()))
        ),
        valueDate: dsMockUtils.createMockOption(
          dsMockUtils.createMockMoment(new BigNumber(valueDate.getTime()))
        ),
        settlementType: rawSettlementType,
      });
      const rawInstructionStatus = dsMockUtils.createMockInstructionStatus(
        InternalInstructionStatus.Pending
      );
      when(meshSettlementTypeToEndConditionSpy)
        .calledWith(rawSettlementType)
        .mockReturnValueOnce({ type });
      const rawInstructionMemo = dsMockUtils.createMockMemo(memo);
      const rawOptionalMemo = dsMockUtils.createMockOption(rawInstructionMemo);

      when(instructionMemoToStringSpy).calledWith(rawInstructionMemo).mockReturnValue(memo);

      queryMultiMock.mockResolvedValueOnce([
        rawInstructionDetails,
        rawInstructionStatus,
        rawOptionalMemo,
      ]);

      let result = await instruction.details();

      expect(result).toMatchObject({
        status,
        createdAt,
        tradeDate,
        valueDate,
        type,
        memo,
      });
      expect(result.venue.id).toEqual(venueId);

      type = InstructionType.SettleOnBlock;
      const endBlock = new BigNumber(100);

      rawSettlementType = dsMockUtils.createMockSettlementType({
        SettleOnBlock: dsMockUtils.createMockU32(endBlock),
      });
      when(meshSettlementTypeToEndConditionSpy)
        .calledWith(rawSettlementType)
        .mockReturnValueOnce({ type, endBlock });
      queryMultiMock.mockResolvedValueOnce([
        dsMockUtils.createMockInstruction({
          ...rawInstructionDetails,
          tradeDate: dsMockUtils.createMockOption(),
          valueDate: dsMockUtils.createMockOption(),
          settlementType: rawSettlementType,
        }),
        rawInstructionStatus,
        dsMockUtils.createMockOption(),
      ]);

      result = await instruction.details();

      expect(result).toMatchObject({
        status,
        createdAt,
        tradeDate: null,
        valueDate: null,
        type,
        endBlock,
        memo: null,
      });
      expect(result.venue.id).toEqual(venueId);

      type = InstructionType.SettleManual;

      rawSettlementType = dsMockUtils.createMockSettlementType({
        SettleManual: dsMockUtils.createMockU32(endBlock),
      });
      when(meshSettlementTypeToEndConditionSpy)
        .calledWith(rawSettlementType)
        .mockReturnValueOnce({ type, endAfterBlock: endBlock });

      queryMultiMock.mockResolvedValueOnce([
        dsMockUtils.createMockInstruction({
          ...rawInstructionDetails,
          tradeDate: dsMockUtils.createMockOption(),
          valueDate: dsMockUtils.createMockOption(),
          settlementType: rawSettlementType,
        }),
        rawInstructionStatus,
        dsMockUtils.createMockOption(),
      ]);

      result = await instruction.details();

      expect(result).toMatchObject({
        status,
        createdAt,
        tradeDate: null,
        valueDate: null,
        type,
        endAfterBlock: endBlock,
        memo: null,
      });
      expect(result.venue.id).toEqual(venueId);

      status = InstructionStatus.Failed;
      type = InstructionType.SettleOnAffirmation;

      when(meshSettlementTypeToEndConditionSpy)
        .calledWith(rawSettlementType)
        .mockReturnValueOnce({ type });

      queryMultiMock.mockResolvedValueOnce([
        dsMockUtils.createMockInstruction({
          ...rawInstructionDetails,
        }),
        dsMockUtils.createMockInstructionStatus(InternalInstructionStatus.Failed),
        rawOptionalMemo,
      ]);

      result = await instruction.details();

      expect(result).toMatchObject({
        status,
        createdAt,
        tradeDate,
        valueDate,
        type,
        memo,
      });
      expect(result.venue.id).toEqual(venueId);
    });

    it('should throw an error if an Instruction leg is not present', () => {
      queryMultiMock.mockResolvedValueOnce([
        dsMockUtils.createMockInstruction({
          instructionId: dsMockUtils.createMockU64(new BigNumber(1)),
          venueId: dsMockUtils.createMockU64(new BigNumber(1)),
          createdAt: dsMockUtils.createMockOption(),
          tradeDate: dsMockUtils.createMockOption(),
          valueDate: dsMockUtils.createMockOption(),
          settlementType: dsMockUtils.createMockSettlementType(),
        }),
        dsMockUtils.createMockOption(),
      ]);

      return expect(instruction.details()).rejects.toThrow(
        'Instruction has already been executed/rejected and it was purged from chain'
      );
    });
  });

  describe('method: getAffirmations', () => {
    const did = 'someDid';
    const status = AffirmationStatus.Affirmed;
    let rawStorageKey: [u64, PolymeshPrimitivesIdentityIdPortfolioId][];

    let instructionStatusesMock: jest.Mock;

    afterAll(() => {
      jest.restoreAllMocks();
    });

    beforeAll(() => {
      rawStorageKey = [
        tuple(
          dsMockUtils.createMockU64(),
          dsMockUtils.createMockPortfolioId({
            did: dsMockUtils.createMockIdentityId(did),
            kind: dsMockUtils.createMockPortfolioKind('Default'),
          })
        ),
      ];
      const authsReceivedEntries = rawStorageKey.map(([instructionId, portfolioId]) =>
        tuple(
          {
            args: [instructionId, portfolioId],
          } as unknown as StorageKey,
          dsMockUtils.createMockAffirmationStatus(AffirmationStatus.Affirmed)
        )
      );
      jest
        .spyOn(utilsInternalModule, 'requestPaginated')
        .mockResolvedValue({ entries: authsReceivedEntries, lastKey: null });

      jest.spyOn(utilsConversionModule, 'identityIdToString').mockClear().mockReturnValue(did);
      jest
        .spyOn(utilsConversionModule, 'meshAffirmationStatusToAffirmationStatus')
        .mockReturnValue(status);
    });

    beforeEach(() => {
      dsMockUtils.createQueryMock('settlement', 'instructionCounter', {
        returnValue: dsMockUtils.createMockU64(new BigNumber(1000)),
      });
      instructionStatusesMock = dsMockUtils.createQueryMock('settlement', 'instructionStatuses');

      instructionStatusesMock.mockResolvedValue(
        createMockInstructionStatus(InternalInstructionStatus.Pending)
      );
      dsMockUtils.createQueryMock('settlement', 'affirmsReceived');
    });

    it('should throw an error if the instruction is not pending', () => {
      instructionStatusesMock.mockResolvedValue(
        dsMockUtils.createMockInstructionStatus(InternalInstructionStatus.Executed)
      );

      return expect(instruction.getAffirmations()).rejects.toThrow(
        'Instruction has already been executed/rejected and it was purged from chain'
      );
    });

    it('should return a list of Affirmation Statuses', async () => {
      const { data } = await instruction.getAffirmations();

      expect(data).toHaveLength(1);
      expect(data[0].identity.did).toEqual(did);
      expect(data[0].status).toEqual(status);
    });
  });

  describe('method: getLegs', () => {
    let instructionStatusMock: jest.Mock;

    afterAll(() => {
      jest.restoreAllMocks();
    });

    let bigNumberToU64Spy: jest.SpyInstance;

    beforeAll(() => {
      bigNumberToU64Spy = jest.spyOn(utilsConversionModule, 'bigNumberToU64');
    });

    beforeEach(() => {
      dsMockUtils.createQueryMock('settlement', 'instructionCounter', {
        returnValue: dsMockUtils.createMockU64(new BigNumber(1000)),
      });
      when(bigNumberToU64Spy).calledWith(id, context).mockReturnValue(rawId);
      dsMockUtils.createQueryMock('settlement', 'instructionLegs');
      instructionStatusMock = dsMockUtils.createQueryMock('settlement', 'instructionStatuses');
    });

    it("should return the instruction's legs", async () => {
      const fromDid = 'fromDid';
      const toDid = 'toDid';
      const ticker = 'SOME_TICKER';
      const amount = new BigNumber(1000);

      entityMockUtils.configureMocks({ assetOptions: { ticker } });
      instructionStatusMock.mockResolvedValue(
        createMockInstructionStatus(InternalInstructionStatus.Pending)
      );
      const mockLeg = dsMockUtils.createMockOption(
        dsMockUtils.createMockInstructionLeg({
          Fungible: {
            sender: dsMockUtils.createMockPortfolioId({
              did: dsMockUtils.createMockIdentityId(fromDid),
              kind: dsMockUtils.createMockPortfolioKind('Default'),
            }),
            receiver: dsMockUtils.createMockPortfolioId({
              did: dsMockUtils.createMockIdentityId(toDid),
              kind: dsMockUtils.createMockPortfolioKind('Default'),
            }),
            ticker: dsMockUtils.createMockTicker(ticker),
            amount: dsMockUtils.createMockU128(amount.shiftedBy(6)),
          },
        })
      );
      const entries = [tuple(['instructionId', 'legId'] as unknown as StorageKey, mockLeg)];

      jest
        .spyOn(utilsInternalModule, 'requestPaginated')
        .mockClear()
        .mockImplementation()
        .mockResolvedValue({ entries, lastKey: null });

      const { data: leg } = await instruction.getLegs();

      expect(leg[0].amount).toEqual(amount);
      expect(leg[0].asset.ticker).toBe(ticker);
      expect(leg[0].from.owner.did).toBe(fromDid);
      expect(leg[0].to.owner.did).toBe(toDid);
    });

    it('should throw an error if the instruction is not pending', () => {
      instructionStatusMock.mockResolvedValue(
        createMockInstructionStatus(InternalInstructionStatus.Executed)
      );
      return expect(instruction.getLegs()).rejects.toThrow(
        'Instruction has already been executed/rejected and it was purged from chain'
      );
    });

    it('should throw an error if a leg is an NFT (to be implemented)', () => {
      const fromDid = 'fromDid';
      const toDid = 'toDid';
      const ticker = 'SOME_TICKER';

      entityMockUtils.configureMocks({ assetOptions: { ticker } });
      instructionStatusMock.mockResolvedValue(
        createMockInstructionStatus(InternalInstructionStatus.Pending)
      );
      const mockLeg = dsMockUtils.createMockOption(
        dsMockUtils.createMockInstructionLeg({
          NonFungible: {
            sender: dsMockUtils.createMockPortfolioId({
              did: dsMockUtils.createMockIdentityId(fromDid),
              kind: dsMockUtils.createMockPortfolioKind('Default'),
            }),
            receiver: dsMockUtils.createMockPortfolioId({
              did: dsMockUtils.createMockIdentityId(toDid),
              kind: dsMockUtils.createMockPortfolioKind('Default'),
            }),
            nfts: createMockNfts(),
          },
        })
      );
      const entries = [tuple(['instructionId', 'legId'] as unknown as StorageKey, mockLeg)];

      jest
        .spyOn(utilsInternalModule, 'requestPaginated')
        .mockClear()
        .mockImplementation()
        .mockResolvedValue({ entries, lastKey: null });

      return expect(instruction.getLegs()).rejects.toThrow();
    });

    it('should throw an error if a leg is a off chain (to be implemented)', () => {
      const fromDid = 'fromDid';
      const toDid = 'toDid';
      const ticker = 'SOME_TICKER';

      entityMockUtils.configureMocks({ assetOptions: { ticker } });
      instructionStatusMock.mockResolvedValue(
        createMockInstructionStatus(InternalInstructionStatus.Pending)
      );
      const mockLeg = dsMockUtils.createMockOption(
        dsMockUtils.createMockInstructionLeg({
          OffChain: {
            senderIdentity: dsMockUtils.createMockIdentityId(fromDid),
            receiverIdentity: dsMockUtils.createMockIdentityId(toDid),
            ticker: dsMockUtils.createMockTicker(ticker),
            amount: dsMockUtils.createMockU128(new BigNumber(1)),
          },
        })
      );
      const entries = [tuple(['instructionId', 'legId'] as unknown as StorageKey, mockLeg)];

      jest
        .spyOn(utilsInternalModule, 'requestPaginated')
        .mockClear()
        .mockImplementation()
        .mockResolvedValue({ entries, lastKey: null });

      return expect(instruction.getLegs()).rejects.toThrow();
    });

    it('should throw an error if a leg in None', () => {
      const ticker = 'SOME_TICKER';

      entityMockUtils.configureMocks({ assetOptions: { ticker } });
      instructionStatusMock.mockResolvedValue(
        createMockInstructionStatus(InternalInstructionStatus.Pending)
      );
      const mockLeg = dsMockUtils.createMockOption();
      const entries = [tuple(['instructionId', 'legId'] as unknown as StorageKey, mockLeg)];

      jest
        .spyOn(utilsInternalModule, 'requestPaginated')
        .mockClear()
        .mockImplementation()
        .mockResolvedValue({ entries, lastKey: null });

      return expect(instruction.getLegs()).rejects.toThrow();
    });
  });

  describe('method: reject', () => {
    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should prepare the procedure and return the resulting transaction', async () => {
      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<void>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith(
          {
            args: { id, operation: InstructionAffirmationOperation.Reject },
            transformer: undefined,
          },
          context,
          {}
        )
        .mockResolvedValue(expectedTransaction);

      const tx = await instruction.reject();
      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: affirm', () => {
    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should prepare the procedure and return the resulting transaction', async () => {
      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<Instruction>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith(
          {
            args: { id, operation: InstructionAffirmationOperation.Affirm },
            transformer: undefined,
          },
          context,
          {}
        )
        .mockResolvedValue(expectedTransaction);

      const tx = await instruction.affirm();

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: withdraw', () => {
    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should prepare the procedure and return the resulting transaction', async () => {
      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<Instruction>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith(
          {
            args: { id, operation: InstructionAffirmationOperation.Withdraw },
            transformer: undefined,
          },
          context,
          {}
        )
        .mockResolvedValue(expectedTransaction);

      const tx = await instruction.withdraw();

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: executeManually', () => {
    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should prepare the procedure and return the resulting transaction', async () => {
      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<Instruction>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith(
          {
            args: { id, skipAffirmationCheck: false },
            transformer: undefined,
          },
          context,
          {}
        )
        .mockResolvedValue(expectedTransaction);

      const tx = await instruction.executeManually({ id, skipAffirmationCheck: false });

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: getStatus', () => {
    afterAll(() => {
      jest.restoreAllMocks();
    });

    let bigNumberToU64Spy: jest.SpyInstance;

    beforeAll(() => {
      bigNumberToU64Spy = jest.spyOn(utilsConversionModule, 'bigNumberToU64');
    });

    beforeEach(() => {
      when(bigNumberToU64Spy).calledWith(id, context).mockReturnValue(rawId);
    });

    it('should return Pending Instruction status', async () => {
      const queryResult = dsMockUtils.createMockInstruction({
        instructionId: dsMockUtils.createMockU64(new BigNumber(1)),
        venueId: dsMockUtils.createMockU64(),
        createdAt: dsMockUtils.createMockOption(),
        tradeDate: dsMockUtils.createMockOption(),
        valueDate: dsMockUtils.createMockOption(),
        settlementType: dsMockUtils.createMockSettlementType(),
      });

      when(dsMockUtils.createQueryMock('settlement', 'instructionDetails'))
        .calledWith(rawId)
        .mockResolvedValue(queryResult);

      when(dsMockUtils.createQueryMock('settlement', 'instructionStatuses'))
        .calledWith(rawId)
        .mockResolvedValue(
          dsMockUtils.createMockInstructionStatus(InternalInstructionStatus.Pending)
        );

      const result = await instruction.getStatus();
      expect(result).toMatchObject({
        status: InstructionStatus.Pending,
      });
    });

    it('should return Executed Instruction status', async () => {
      const blockNumber = new BigNumber(1234);
      const blockDate = new Date('4/14/2020');
      const eventIdx = new BigNumber(1);
      const blockHash = 'someHash';
      const fakeQueryResult = {
        updatedBlock: { blockId: blockNumber.toNumber(), hash: blockHash, datetime: blockDate },
        eventIdx: eventIdx.toNumber(),
      };
      const fakeEventIdentifierResult = { blockNumber, blockDate, blockHash, eventIndex: eventIdx };

      const queryVariables = {
        status: InstructionStatusEnum.Executed,
        id: id.toString(),
      };

      // Should return Pending status
      const queryResult = dsMockUtils.createMockInstruction({
        instructionId: dsMockUtils.createMockU64(new BigNumber(1)),
        venueId: dsMockUtils.createMockU64(),
        createdAt: dsMockUtils.createMockOption(),
        tradeDate: dsMockUtils.createMockOption(),
        valueDate: dsMockUtils.createMockOption(),
        settlementType: dsMockUtils.createMockSettlementType(),
      });

      when(dsMockUtils.createQueryMock('settlement', 'instructionDetails'))
        .calledWith(rawId)
        .mockResolvedValue(queryResult);

      when(dsMockUtils.createQueryMock('settlement', 'instructionStatuses'))
        .calledWith(rawId)
        .mockResolvedValue(
          dsMockUtils.createMockInstructionStatus(InternalInstructionStatus.Executed)
        );

      dsMockUtils.createApolloMultipleQueriesMock([
        {
          query: instructionsQuery(queryVariables, new BigNumber(1), new BigNumber(0)),
          returnData: {
            instructions: { nodes: [fakeQueryResult] },
          },
        },
        {
          query: instructionsQuery(
            {
              ...queryVariables,
              status: InstructionStatusEnum.Failed,
            },
            new BigNumber(1),
            new BigNumber(0)
          ),
          returnData: {
            instructions: { nodes: [] },
          },
        },
      ]);

      const result = await instruction.getStatus();
      expect(result).toMatchObject({
        status: InstructionStatus.Executed,
        eventIdentifier: fakeEventIdentifierResult,
      });
    });

    it('should return Failed Instruction status', async () => {
      const blockNumber = new BigNumber(1234);
      const blockDate = new Date('4/14/2020');
      const eventIdx = new BigNumber(1);
      const blockHash = 'someHash';
      const fakeQueryResult = {
        updatedBlock: { blockId: blockNumber.toNumber(), hash: blockHash, datetime: blockDate },
        eventIdx: eventIdx.toNumber(),
      };
      const fakeEventIdentifierResult = { blockNumber, blockDate, blockHash, eventIndex: eventIdx };

      const queryVariables = {
        status: InstructionStatusEnum.Executed,
        id: id.toString(),
      };

      // Should return Pending status
      const queryResult = dsMockUtils.createMockInstruction({
        instructionId: dsMockUtils.createMockU64(new BigNumber(1)),
        venueId: dsMockUtils.createMockU64(),
        createdAt: dsMockUtils.createMockOption(),
        tradeDate: dsMockUtils.createMockOption(),
        valueDate: dsMockUtils.createMockOption(),
        settlementType: dsMockUtils.createMockSettlementType(),
      });

      when(dsMockUtils.createQueryMock('settlement', 'instructionDetails'))
        .calledWith(rawId)
        .mockResolvedValue(queryResult);

      when(dsMockUtils.createQueryMock('settlement', 'instructionStatuses'))
        .calledWith(rawId)
        .mockResolvedValue(dsMockUtils.createMockInstructionStatus('Failed'));

      dsMockUtils.createApolloMultipleQueriesMock([
        {
          query: instructionsQuery(queryVariables, new BigNumber(1), new BigNumber(0)),
          returnData: {
            instructions: {
              nodes: [],
            },
          },
        },
        {
          query: instructionsQuery(
            {
              ...queryVariables,
              status: InstructionStatusEnum.Failed,
            },
            new BigNumber(1),
            new BigNumber(0)
          ),
          returnData: {
            instructions: {
              nodes: [fakeQueryResult],
            },
          },
        },
      ]);

      const result = await instruction.getStatus();
      expect(result).toMatchObject({
        status: InstructionStatus.Failed,
        eventIdentifier: fakeEventIdentifierResult,
      });
    });

    it("should throw an error if Instruction status couldn't be determined", async () => {
      const queryVariables = {
        status: InstructionStatusEnum.Executed,
        id: id.toString(),
      };

      // Should return Pending status
      const queryResult = dsMockUtils.createMockInstruction({
        instructionId: dsMockUtils.createMockU64(new BigNumber(1)),
        venueId: dsMockUtils.createMockU64(),
        createdAt: dsMockUtils.createMockOption(),
        tradeDate: dsMockUtils.createMockOption(),
        valueDate: dsMockUtils.createMockOption(),
        settlementType: dsMockUtils.createMockSettlementType(),
      });

      when(dsMockUtils.createQueryMock('settlement', 'instructionDetails'))
        .calledWith(rawId)
        .mockResolvedValue(queryResult);

      when(dsMockUtils.createQueryMock('settlement', 'instructionStatuses'))
        .calledWith(rawId)
        .mockResolvedValue(
          dsMockUtils.createMockInstructionStatus(InternalInstructionStatus.Unknown)
        );

      dsMockUtils.createApolloMultipleQueriesMock([
        {
          query: instructionsQuery(queryVariables, new BigNumber(1), new BigNumber(0)),
          returnData: {
            instructions: { nodes: [] },
          },
        },
        {
          query: instructionsQuery(
            {
              ...queryVariables,
              status: InstructionStatusEnum.Failed,
            },
            new BigNumber(1),
            new BigNumber(0)
          ),
          returnData: {
            instructions: { nodes: [] },
          },
        },
      ]);

      return expect(instruction.getStatus()).rejects.toThrow(
        "It isn't possible to determine the current status of this Instruction"
      );
    });
  });

  describe('method: toHuman', () => {
    it('should return a human readable version of the entity', () => {
      expect(instruction.toHuman()).toBe('1');
    });
  });

  describe('method: getInvolvedPortfolios', () => {
    it('should return the portfolios in the instruction where the given DID is the custodian', async () => {
      const fromDid = 'fromDid';
      const toDid = 'toDid';

      const from1 = entityMockUtils.getDefaultPortfolioInstance({
        did: fromDid,
        isCustodiedBy: true,
        exists: true,
      });
      const from2 = entityMockUtils.getNumberedPortfolioInstance({
        did: 'someOtherDid',
        id: new BigNumber(1),
        exists: false,
      });
      const to1 = entityMockUtils.getDefaultPortfolioInstance({
        did: toDid,
        isCustodiedBy: true,
        exists: true,
      });
      const to2 = entityMockUtils.getNumberedPortfolioInstance({
        did: 'someDid',
        id: new BigNumber(1),
        exists: false,
      });
      const amount = new BigNumber(1);
      const asset = entityMockUtils.getAssetInstance({ ticker: 'SOME_ASSET' });

      jest.spyOn(instruction, 'getLegs').mockResolvedValue({
        data: [
          { from: from1, to: to1, amount, asset },
          { from: from2, to: to2, amount, asset },
        ],
        next: null,
      });

      const result = await instruction.getInvolvedPortfolios({ did: 'someDid' });
      expect(result).toEqual([
        expect.objectContaining({ owner: expect.objectContaining({ did: fromDid }) }),
        expect.objectContaining({ owner: expect.objectContaining({ did: toDid }) }),
        expect.objectContaining({
          owner: expect.objectContaining({ did: 'someDid' }),
          id: new BigNumber(1),
        }),
      ]);
    });
  });
});
