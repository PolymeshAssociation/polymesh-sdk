import { BTreeSet, Bytes, u16 } from '@polkadot/types';
import {
  ConfidentialAssetsBurnConfidentialBurnProof,
  PalletConfidentialAssetAffirmParty,
  PalletConfidentialAssetAffirmTransaction,
  PalletConfidentialAssetAffirmTransactions,
  PalletConfidentialAssetAuditorAccount,
  PalletConfidentialAssetConfidentialAuditors,
  PalletConfidentialAssetConfidentialTransfers,
  PalletConfidentialAssetLegParty,
  PalletConfidentialAssetTransaction,
  PalletConfidentialAssetTransactionLeg,
  PalletConfidentialAssetTransactionLegId,
  PalletConfidentialAssetTransactionLegState,
  PolymeshPrimitivesIdentityId,
} from '@polkadot/types/lookup';
import { stringToHex } from '@polkadot/util';
import { UnreachableCaseError } from '@polymeshassociation/polymesh-sdk/api/procedures/utils';
import {
  Block,
  ConfidentialAssetHistory,
  EventIdEnum,
} from '@polymeshassociation/polymesh-sdk/middleware/types';
import { u16ToBigNumber } from '@polymeshassociation/polymesh-sdk/utils/conversion';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import { ConfidentialAccount, ConfidentialAsset, Context, Identity } from '~/internal';
import { dsMockUtils } from '~/testUtils/mocks';
import { createMockBlock, createMockBTreeSet } from '~/testUtils/mocks/dataSources';
import {
  ConfidentialAffirmParty,
  ConfidentialLegParty,
  ConfidentialLegStateBalances,
  ConfidentialTransactionStatus,
} from '~/types';

import {
  auditorsToBtreeSet,
  auditorsToConfidentialAuditors,
  auditorToMeshAuditor,
  bigNumberToU16,
  confidentialAffirmPartyToRaw,
  confidentialAffirmsToRaw,
  confidentialAssetsToBtreeSet,
  confidentialBurnProofToRaw,
  confidentialLegIdToId,
  confidentialLegPartyToRole,
  confidentialLegStateToLegState,
  confidentialLegToMeshLeg,
  confidentialTransactionLegIdToBigNumber,
  meshConfidentialAssetTransactionIdToId,
  meshConfidentialTransactionDetailsToDetails,
  meshConfidentialTransactionStatusToStatus,
  meshPublicKeyToKey,
  middlewareAssetHistoryToTransactionHistory,
  middlewareEventDetailsToEventIdentifier,
  serializeConfidentialAssetId,
} from '../conversion';

describe('serializeConfidentialAssetId', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  it('should convert a confidential Asset ID to hex prefixed string', () => {
    const result = serializeConfidentialAssetId('76702175-d8cb-e3a5-5a19-734433351e25');

    expect(result).toEqual('0x76702175d8cbe3a55a19734433351e25');
  });

  it('should extract the ID from ConfidentialAsset entity', () => {
    const context = dsMockUtils.getContextInstance();
    const asset = new ConfidentialAsset({ id: '76702175-d8cb-e3a5-5a19-734433351e25' }, context);

    const result = serializeConfidentialAssetId(asset);

    expect(result).toEqual('0x76702175d8cbe3a55a19734433351e25');
  });
});

describe('middlewareEventDetailsToEventIdentifier', () => {
  it('should extract block info', () => {
    const block = { blockId: 1, datetime: '7', hash: '0x01' } as Block;

    let result = middlewareEventDetailsToEventIdentifier(block);
    expect(result).toEqual({
      blockNumber: new BigNumber(1),
      blockHash: '0x01',
      blockDate: new Date('7'),
      eventIndex: new BigNumber(0),
    });

    result = middlewareEventDetailsToEventIdentifier(block, 3);
    expect(result).toEqual({
      blockNumber: new BigNumber(1),
      blockHash: '0x01',
      blockDate: new Date('7'),
      eventIndex: new BigNumber(3),
    });
  });
});

describe('auditorToMeshAuditor', () => {
  let account: ConfidentialAccount;
  let context: Context;

  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
    account = new ConfidentialAccount({ publicKey: 'somePubKey' }, context);
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  it('should convert a ConfidentialAccount to PalletConfidentialAssetAuditorAccount', () => {
    const mockResult = 'mockResult' as unknown as PalletConfidentialAssetAuditorAccount;

    when(context.createType)
      .calledWith('PalletConfidentialAssetAuditorAccount', account.publicKey)
      .mockReturnValue(mockResult);

    const result = auditorToMeshAuditor(account, context);

    expect(result).toEqual(mockResult);
  });
});

describe('auditorsToBtreeSet', () => {
  let account: ConfidentialAccount;
  let context: Context;

  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
    account = new ConfidentialAccount({ publicKey: 'somePubKey' }, context);
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  it('should convert a ConfidentialAccount to BTreeSetPalletConfidentialAssetAuditorAccount>', () => {
    const mockResult = createMockBTreeSet<PalletConfidentialAssetAuditorAccount>([]);
    const mockAuditor = 'somePubKey' as unknown as PalletConfidentialAssetAuditorAccount;

    when(context.createType)
      .calledWith('PalletConfidentialAssetAuditorAccount', account.publicKey)
      .mockReturnValue(mockAuditor);

    when(context.createType)
      .calledWith('BTreeSet<PalletConfidentialAssetAuditorAccount>', [mockAuditor])
      .mockReturnValue(mockResult);

    const result = auditorsToBtreeSet([account], context);

    expect(result).toEqual(mockResult);
  });
});

describe('confidentialAssetsToBtreeSet', () => {
  let asset: ConfidentialAsset;
  let context: Context;

  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
    asset = new ConfidentialAsset({ id: '76702175d8cbe3a55a19734433351e25' }, context);
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  it('should convert a ConfidentialAccount to PalletConfidentialAssetAuditorAccount', () => {
    const mockResult = createMockBTreeSet<Bytes>();
    when(context.createType)
      .calledWith('BTreeSet<Bytes>', ['0x76702175d8cbe3a55a19734433351e25'])
      .mockReturnValue(mockResult);

    const result = confidentialAssetsToBtreeSet([asset], context);

    expect(result).toEqual(mockResult);
  });
});

describe('meshPublicKeyToKey', () => {
  it('should convert the key', () => {
    const expectedKey = '0x01';
    const mockKey = dsMockUtils.createMockConfidentialAccount(expectedKey);

    const result = meshPublicKeyToKey(mockKey);

    expect(result).toEqual(expectedKey);
  });
});

describe('confidentialLegIdToId', () => {
  it('should convert to a BigNumber', () => {
    const mockLegId = dsMockUtils.createMockConfidentialTransactionLegId(new BigNumber(1));

    const result = confidentialLegIdToId(mockLegId);

    expect(result).toEqual(new BigNumber(1));
  });
});

describe('meshConfidentialAssetTransactionIdToId', () => {
  it('should convert to a BigNumber', () => {
    const mockAssetId = dsMockUtils.createMockConfidentialAssetTransactionId(new BigNumber(1));

    const result = meshConfidentialAssetTransactionIdToId(mockAssetId);

    expect(result).toEqual(new BigNumber(1));
  });

  describe('confidentialTransactionLegIdToBigNumber', () => {
    let id: BigNumber;
    let rawId: PalletConfidentialAssetTransactionLegId;

    beforeAll(() => {
      dsMockUtils.initMocks();
    });

    beforeEach(() => {
      id = new BigNumber(1);
      rawId = dsMockUtils.createMockConfidentialTransactionLegId(id);
    });

    afterEach(() => {
      dsMockUtils.reset();
    });

    afterAll(() => {
      dsMockUtils.cleanup();
    });

    it('should convert PalletConfidentialAssetTransactionLegId to BigNumber ', () => {
      const result = confidentialTransactionLegIdToBigNumber(rawId);

      expect(result).toEqual(id);
    });
  });
});

describe('confidentialTransactionLegIdToBigNumber', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });
  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  it('should convert PalletConfidentialAssetTransactionLegId to BigNumber ', () => {
    let input = dsMockUtils.createMockConfidentialLegParty('Sender');
    let expected = ConfidentialLegParty.Sender;
    let result = confidentialLegPartyToRole(input);
    expect(result).toEqual(expected);

    input = dsMockUtils.createMockConfidentialLegParty('Receiver');
    expected = ConfidentialLegParty.Receiver;
    result = confidentialLegPartyToRole(input);
    expect(result).toEqual(expected);

    input = dsMockUtils.createMockConfidentialLegParty('Mediator');
    expected = ConfidentialLegParty.Mediator;
    result = confidentialLegPartyToRole(input);
    expect(result).toEqual(expected);
  });

  it('should throw if an unexpected role is received', () => {
    const input = 'notSomeRole' as unknown as PalletConfidentialAssetLegParty;

    expect(() => confidentialLegPartyToRole(input)).toThrow(UnreachableCaseError);
  });
});

describe('confidentialAffirmPartyToRaw', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });
  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  it('should return a raw affirm party for a mediator', () => {
    const mockContext = dsMockUtils.getContextInstance();
    const party = ConfidentialAffirmParty.Mediator;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mockResult = 'mockResult' as any;

    when(mockContext.createType)
      .calledWith('PalletConfidentialAssetAffirmParty', {
        [party]: null,
      })
      .mockReturnValue(mockResult);

    const result = confidentialAffirmPartyToRaw({ party }, mockContext);

    expect(result).toEqual(mockResult);
  });

  it('should return a raw affirm party for a sender', () => {
    const mockContext = dsMockUtils.getContextInstance();
    const party = ConfidentialAffirmParty.Sender;
    const proofs = [{ asset: '1234', proof: '0x01' }];
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const fmtProofs = { '0x1234': '0x01' };

    const mockResult = 'mockResult' as unknown as PalletConfidentialAssetAffirmParty;
    const mockRawProofs = dsMockUtils.createMockBTreeMap<Bytes, Bytes>();
    const mockTransferProof =
      'mockTransferProof' as unknown as PalletConfidentialAssetConfidentialTransfers;

    when(mockContext.createType)
      .calledWith('BTreeMap<Bytes, Bytes>', fmtProofs)
      .mockReturnValue(mockRawProofs);

    when(mockContext.createType)
      .calledWith('PalletConfidentialAssetConfidentialTransfers', {
        proofs: mockRawProofs,
      })
      .mockReturnValue(mockTransferProof);

    when(mockContext.createType)
      .calledWith('PalletConfidentialAssetAffirmParty', {
        [party]: mockTransferProof,
      })
      .mockReturnValue(mockResult);

    const result = confidentialAffirmPartyToRaw({ party, proofs }, mockContext);

    expect(result).toEqual(mockResult);
  });
});

describe('confidentialAffirmsToRaw', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });
  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  it('should return a raw affirm transaction', () => {
    const mockContext = dsMockUtils.getContextInstance();

    const mockAffirm = 'mockAffirm' as unknown as PalletConfidentialAssetAffirmTransaction;
    const mockResult = 'mockResult' as unknown as PalletConfidentialAssetAffirmTransactions;

    when(mockContext.createType)
      .calledWith('PalletConfidentialAssetAffirmTransactions', [mockAffirm])
      .mockReturnValue(mockResult);

    const result = confidentialAffirmsToRaw([mockAffirm], mockContext);

    expect(result).toEqual(mockResult);
  });
});

describe('confidentialLegStateToLegState', () => {
  let mockLegState: dsMockUtils.MockCodec<PalletConfidentialAssetTransactionLegState>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockLegReturn: any;

  const assetId = '76702175-d8cb-e3a5-5a19-734433351e25';

  beforeEach(() => {
    mockLegState = dsMockUtils.createMockConfidentialLegState({
      assetState: dsMockUtils.createMockBTreeMap<
        Bytes,
        PalletConfidentialAssetTransactionLegState
      >(),
    });
    mockLegReturn = dsMockUtils.createMockOption(mockLegState);
  });
  beforeAll(() => {
    dsMockUtils.initMocks();
  });
  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  it('should return the parsed leg state', () => {
    const balances = {
      senderInitBalance: '0x02',
      senderAmount: '0x03',
      receiverAmount: '0x04',
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (mockLegState.assetState as any).toJSON = (): Record<string, ConfidentialLegStateBalances> => ({
      // eslint-disable-next-line @typescript-eslint/naming-convention
      [assetId]: balances,
    });

    const mockContext = dsMockUtils.getContextInstance();

    const result = confidentialLegStateToLegState(mockLegReturn, mockContext);

    expect(result).toEqual(
      expect.objectContaining({
        proved: true,
        assetState: expect.arrayContaining([
          expect.objectContaining({
            asset: expect.objectContaining({ id: assetId }),
          }),
        ]),
      })
    );
  });

  it('should return the expected result for unproven legs', () => {
    const mockContext = dsMockUtils.getContextInstance();

    const result = confidentialLegStateToLegState(dsMockUtils.createMockOption(), mockContext);

    expect(result).toEqual(
      expect.objectContaining({
        proved: false,
      })
    );
  });

  it('should throw an error if there is unexpected leg state', () => {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    (mockLegState.assetState as any).toJSON = (): Record<string, ConfidentialLegStateBalances> => ({
      // eslint-disable-next-line @typescript-eslint/naming-convention
      assetId: {
        senderInitBalance: undefined,
      } as any,
    });
    /* eslint-enable @typescript-eslint/no-explicit-any */

    const mockContext = dsMockUtils.getContextInstance();

    expect(() => confidentialLegStateToLegState(mockLegReturn, mockContext)).toThrow(
      'Unexpected data for PalletConfidentialAssetTransactionLegState received from chain'
    );
  });
});

describe('middlewareAssetHistoryToTransactionHistory', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  it('should convert a middleware AssetHistory to TransactionHistory', () => {
    const assetHistoryEntry = {
      id: '1',
      fromId: 'someString',
      toId: 'someString',
      amount: '0x01',
      createdBlock: createMockBlock() as unknown as Block,
      assetId: 'assetId',
      eventId: EventIdEnum.AccountDeposit,
      memo: '0x02',
    } as ConfidentialAssetHistory;

    const expectedResult = {
      id: assetHistoryEntry.id,
      assetId: assetHistoryEntry.assetId,
      fromId: assetHistoryEntry.fromId,
      toId: assetHistoryEntry.toId,
      amount: assetHistoryEntry.amount,
      datetime: assetHistoryEntry.createdBlock!.datetime,
      createdBlockId: new BigNumber(assetHistoryEntry.createdBlock!.id),
      eventId: assetHistoryEntry.eventId,
      memo: assetHistoryEntry.memo,
    };

    const result = middlewareAssetHistoryToTransactionHistory(assetHistoryEntry);

    expect(result).toEqual(expectedResult);
  });
});

describe('confidentialBurnProofToRaw', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });
  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  it('should return a raw burn proof', () => {
    const mockContext = dsMockUtils.getContextInstance();

    const proof = 'someProof';
    const rawProof = 'rawSomeProof' as unknown as Bytes;
    const mockResult = 'mockResult' as unknown as ConfidentialAssetsBurnConfidentialBurnProof;

    when(mockContext.createType).calledWith('Bytes', proof).mockReturnValue(rawProof);

    when(mockContext.createType)
      .calledWith('ConfidentialAssetsBurnConfidentialBurnProof', { encodedInnerProof: rawProof })
      .mockReturnValue(mockResult);

    const result = confidentialBurnProofToRaw(proof, mockContext);

    expect(result).toEqual(mockResult);
  });
});

describe('bigNumberToU16 and u16ToBigNumber', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  describe('bigNumberToU16', () => {
    it('should convert a number to a polkadot u16 object', () => {
      const value = new BigNumber(100);
      const fakeResult = '100' as unknown as u16;
      const context = dsMockUtils.getContextInstance();

      when(context.createType).calledWith('u16', value.toString()).mockReturnValue(fakeResult);

      const result = bigNumberToU16(value, context);

      expect(result).toBe(fakeResult);
    });

    it('should throw an error if the number is negative', () => {
      const value = new BigNumber(-100);
      const context = dsMockUtils.getContextInstance();

      expect(() => bigNumberToU16(value, context)).toThrow();
    });

    it('should throw an error if the number is not an integer', () => {
      const value = new BigNumber(1.5);
      const context = dsMockUtils.getContextInstance();

      expect(() => bigNumberToU16(value, context)).toThrow();
    });
  });

  describe('u16ToBigNumber', () => {
    it('should convert a polkadot u32 object to a BigNumber', () => {
      const fakeResult = new BigNumber(100);
      const num = dsMockUtils.createMockU16(fakeResult);

      const result = u16ToBigNumber(num);
      expect(result).toEqual(new BigNumber(fakeResult));
    });
  });
});

describe('auditorsToConfidentialAuditors', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  it('should convert auditors and mediators to PalletConfidentialAssetConfidentialAuditors', () => {
    const context = dsMockUtils.getContextInstance();

    const auditors = ['auditor'];
    const mediators = ['mediator1', 'mediator2'];
    mediators.forEach(did =>
      when(context.createType)
        .calledWith('PolymeshPrimitivesIdentityId', did)
        .mockReturnValue(did as unknown as PolymeshPrimitivesIdentityId)
    );

    when(context.createType)
      .calledWith('BTreeSet<PalletConfidentialAssetAuditorAccount>', auditors)
      .mockReturnValue(auditors as unknown as BTreeSet<PalletConfidentialAssetAuditorAccount>);
    when(context.createType)
      .calledWith('BTreeSet<PolymeshPrimitivesIdentityId>', mediators)
      .mockReturnValue(mediators as unknown as BTreeSet<PolymeshPrimitivesIdentityId>);

    when(context.createType)
      .calledWith('PalletConfidentialAssetConfidentialAuditors', {
        auditors,
        mediators,
      })
      .mockReturnValue({
        auditors,
        mediators,
      } as unknown as PalletConfidentialAssetConfidentialAuditors);

    let result = auditorsToConfidentialAuditors(
      context,
      auditors.map(auditor => ({ publicKey: auditor })) as unknown as ConfidentialAccount[],
      mediators.map(mediator => ({ did: mediator })) as unknown as Identity[]
    );
    expect(result).toEqual({ auditors, mediators });

    when(context.createType)
      .calledWith('BTreeSet<PolymeshPrimitivesIdentityId>', [])
      .mockReturnValue([] as unknown as BTreeSet<PolymeshPrimitivesIdentityId>);
    when(context.createType)
      .calledWith('PalletConfidentialAssetConfidentialAuditors', {
        auditors,
        mediators: [],
      })
      .mockReturnValue({
        auditors,
        mediators: [],
      } as unknown as PalletConfidentialAssetConfidentialAuditors);

    result = auditorsToConfidentialAuditors(
      context,
      auditors.map(auditor => ({ publicKey: auditor })) as unknown as ConfidentialAccount[]
    );
    expect(result).toEqual({ auditors, mediators: [] });
  });
});

describe('meshConfidentialTransactionStatusToStatus', () => {
  it('should return the correct status', () => {
    const mockPending = dsMockUtils.createMockConfidentialTransactionStatus('Pending');
    let result = meshConfidentialTransactionStatusToStatus(mockPending);
    expect(result).toEqual(ConfidentialTransactionStatus.Pending);

    const mockRejected = dsMockUtils.createMockConfidentialTransactionStatus('Rejected');
    result = meshConfidentialTransactionStatusToStatus(mockRejected);
    expect(result).toEqual(ConfidentialTransactionStatus.Rejected);

    const mockExecuted = dsMockUtils.createMockConfidentialTransactionStatus('Executed');
    result = meshConfidentialTransactionStatusToStatus(mockExecuted);
    expect(result).toEqual(ConfidentialTransactionStatus.Executed);
  });

  it('should throw an error if there is an unknown status', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(() => meshConfidentialTransactionStatusToStatus('notAStatus' as any)).toThrow(
      UnreachableCaseError
    );
  });
});

describe('confidentialLegToMeshLeg', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  it('should return a raw leg type', () => {
    const context = dsMockUtils.getContextInstance();

    const leg = {
      sender: dsMockUtils.createMockConfidentialAccount(),
      receiver: dsMockUtils.createMockConfidentialAccount(),
      assets: dsMockUtils.createMockBTreeSet<Bytes>(),
      auditors: dsMockUtils.createMockBTreeSet<PalletConfidentialAssetAuditorAccount>(),
      mediators: dsMockUtils.createMockBTreeSet<PolymeshPrimitivesIdentityId>(),
    };

    const fakeResult = 'fakeResult' as unknown as PalletConfidentialAssetTransactionLeg;

    when(context.createType)
      .calledWith('PalletConfidentialAssetTransactionLeg', leg)
      .mockReturnValue(fakeResult);

    const result = confidentialLegToMeshLeg(leg, context);

    expect(result).toEqual(fakeResult);
  });
});

describe('meshConfidentialDetailsToConfidentialDetails', () => {
  it('should convert PalletConfidentialAssetTransaction to ConfidentialTransactionDetails', () => {
    const mockDetails = dsMockUtils.createMockConfidentialAssetTransaction({
      createdAt: dsMockUtils.createMockU32(new BigNumber(1)),
      memo: dsMockUtils.createMockOption(dsMockUtils.createMockMemo(stringToHex('someMemo'))),
      venueId: dsMockUtils.createMockU64(new BigNumber(2)),
    });
    const result = meshConfidentialTransactionDetailsToDetails(
      mockDetails as PalletConfidentialAssetTransaction
    );

    expect(result).toEqual({
      createdAt: new BigNumber(1),
      memo: 'someMemo',
      venueId: new BigNumber(2),
    });
  });
});
