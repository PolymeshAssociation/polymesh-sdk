import { bool, BTreeSet, u64 } from '@polkadot/types';
import { Permill } from '@polkadot/types/interfaces';
import {
  PolymeshPrimitivesAssetAssetId,
  PolymeshPrimitivesIdentityClaimClaimType,
  PolymeshPrimitivesIdentityId,
  PolymeshPrimitivesStatisticsStatOpType,
  PolymeshPrimitivesStatisticsStatType,
  PolymeshPrimitivesTransferComplianceAssetTransferCompliance,
  PolymeshPrimitivesTransferComplianceTransferCondition,
} from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import { SetTransferRestrictionsParams } from '~/api/entities/Asset/Fungible/TransferRestrictions/TransferRestrictionBase';
import {
  addExemptionIfNotPresent,
  getAuthorization,
  newExemptionRecord,
  prepareSetTransferRestrictions,
  prepareStorage,
  Storage,
} from '~/api/procedures/setTransferRestrictions';
import { Context, PolymeshError, Procedure, setTransferRestrictions } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import {
  ClaimCountRestrictionValue,
  ClaimPercentageRestrictionValue,
  ClaimType,
  CountryCode,
  ErrorCode,
  FungibleAsset,
  Identity,
  StatType,
  TransferRestriction,
  TransferRestrictionType,
  TxTags,
} from '~/types';
import { PolymeshTx } from '~/types/internal';
import * as utilsConversionModule from '~/utils/conversion';
import * as utilsInternalModule from '~/utils/internal';

jest.mock(
  '~/api/entities/Asset/Fungible',
  require('~/testUtils/mocks/entities').mockFungibleAssetModule('~/api/entities/Asset/Fungible')
);
jest.mock(
  '~/api/entities/Identity',
  require('~/testUtils/mocks/entities').mockIdentityModule('~/api/entities/Identity')
);

describe('setTransferRestrictions procedure', () => {
  let mockContext: Mocked<Context>;
  let transferRestrictionToPolymeshTransferConditionSpy: jest.SpyInstance<
    PolymeshPrimitivesTransferComplianceTransferCondition,
    [TransferRestriction, Context]
  >;
  let assetToMeshAssetIdSpy: jest.SpyInstance;
  let stringToIdentityIdSpy: jest.SpyInstance;
  let identitiesToBtreeSetSpy: jest.SpyInstance<
    BTreeSet<PolymeshPrimitivesIdentityId>,
    [Identity[], Context]
  >;
  let transferRestrictionTypeToStatOpTypeSpy: jest.SpyInstance<
    PolymeshPrimitivesStatisticsStatOpType,
    [TransferRestrictionType, Context]
  >;
  let complianceConditionsToBtreeSetSpy: jest.SpyInstance<
    BTreeSet<PolymeshPrimitivesTransferComplianceTransferCondition>,
    [PolymeshPrimitivesTransferComplianceTransferCondition[], Context]
  >;
  let statisticsOpTypeToStatTypeSpy: jest.SpyInstance<
    PolymeshPrimitivesStatisticsStatType,
    [
      {
        operationType: PolymeshPrimitivesStatisticsStatOpType;
        claimIssuer?: [PolymeshPrimitivesIdentityClaimClaimType, PolymeshPrimitivesIdentityId];
      },
      Context
    ]
  >;
  let assetId: string;
  let asset: FungibleAsset;
  let count: BigNumber;
  let percentage: BigNumber;
  let maxInvestorRestriction: TransferRestriction;
  let maxOwnershipRestriction: TransferRestriction;
  let claimCountRestriction: TransferRestriction;
  let claimPercentageRestriction: TransferRestriction;
  let claimCountRestrictionValue: ClaimCountRestrictionValue;
  let claimPercentageRestrictionValue: ClaimPercentageRestrictionValue;
  let rawAssetId: PolymeshPrimitivesAssetAssetId;
  let rawCount: u64;
  let rawPercentage: Permill;
  let rawCountRestriction: PolymeshPrimitivesTransferComplianceTransferCondition;
  let rawPercentageRestriction: PolymeshPrimitivesTransferComplianceTransferCondition;
  let rawClaimCountRestriction: PolymeshPrimitivesTransferComplianceTransferCondition;
  let rawClaimPercentageRestriction: PolymeshPrimitivesTransferComplianceTransferCondition;
  let rawExemptedDid: PolymeshPrimitivesIdentityId;
  let mockNeededStat: PolymeshPrimitivesStatisticsStatType;
  let args: SetTransferRestrictionsParams;
  let rawCountRestrictionBtreeSet: BTreeSet<PolymeshPrimitivesTransferComplianceTransferCondition>;
  let rawPercentageRestrictionBtreeSet: BTreeSet<PolymeshPrimitivesTransferComplianceTransferCondition>;
  let rawClaimCountRestrictionBtreeSet: BTreeSet<PolymeshPrimitivesTransferComplianceTransferCondition>;
  let rawClaimPercentageRestrictionBtreeSet: BTreeSet<PolymeshPrimitivesTransferComplianceTransferCondition>;
  let booleanToBoolSpy: jest.SpyInstance<bool, [boolean, Context]>;
  let identityIdToStringSpy: jest.SpyInstance<string, [PolymeshPrimitivesIdentityId]>;

  const min = new BigNumber(10);
  const max = new BigNumber(20);
  const did = 'issuerDid';
  const exemptedDid = 'exemptedDid';
  const issuer = entityMockUtils.getIdentityInstance({ did });
  const emptyExemptions = {
    Accredited: [],
    Affiliate: [],
    Jurisdiction: [],
    None: [],
  };
  const rawTrue = dsMockUtils.createMockBool(true);
  const rawFalse = dsMockUtils.createMockBool(false);

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    transferRestrictionToPolymeshTransferConditionSpy = jest.spyOn(
      utilsConversionModule,
      'transferRestrictionToPolymeshTransferCondition'
    );
    assetToMeshAssetIdSpy = jest.spyOn(utilsConversionModule, 'assetToMeshAssetId');
    stringToIdentityIdSpy = jest.spyOn(utilsConversionModule, 'stringToIdentityId');
    identitiesToBtreeSetSpy = jest.spyOn(utilsConversionModule, 'identitiesToBtreeSet');
    transferRestrictionTypeToStatOpTypeSpy = jest.spyOn(
      utilsConversionModule,
      'transferRestrictionTypeToStatOpType'
    );
    complianceConditionsToBtreeSetSpy = jest.spyOn(
      utilsConversionModule,
      'complianceConditionsToBtreeSet'
    );
    statisticsOpTypeToStatTypeSpy = jest.spyOn(utilsConversionModule, 'statisticsOpTypeToStatType');
    booleanToBoolSpy = jest.spyOn(utilsConversionModule, 'booleanToBool');
    assetId = '12341234-1234-1234-1234-123412341234';
    asset = entityMockUtils.getFungibleAssetInstance({ assetId });
    count = new BigNumber(10);
    percentage = new BigNumber(49);
    maxInvestorRestriction = { type: TransferRestrictionType.Count, value: count };
    maxOwnershipRestriction = { type: TransferRestrictionType.Percentage, value: percentage };
    claimCountRestrictionValue = {
      min,
      max,
      issuer,
      claim: {
        type: ClaimType.Accredited,
        accredited: true,
      },
    };
    claimCountRestriction = {
      type: TransferRestrictionType.ClaimCount,
      value: claimCountRestrictionValue,
    };
    claimPercentageRestrictionValue = {
      min,
      max,
      issuer,
      claim: {
        type: ClaimType.Accredited,
        accredited: true,
      },
    };
    claimPercentageRestriction = {
      type: TransferRestrictionType.ClaimPercentage,
      value: claimPercentageRestrictionValue,
    };
    identityIdToStringSpy = jest.spyOn(utilsConversionModule, 'identityIdToString');
  });

  let setAssetTransferComplianceTransaction: PolymeshTx<
    [PolymeshPrimitivesAssetAssetId, PolymeshPrimitivesTransferComplianceTransferCondition]
  >;
  let setEntitiesExemptTransaction: PolymeshTx<
    [
      boolean,
      {
        asset: { Ticker: PolymeshPrimitivesAssetAssetId };
        operationType: PolymeshPrimitivesStatisticsStatOpType;
      },
      BTreeSet<PolymeshPrimitivesIdentityId>
    ]
  >;

  beforeEach(() => {
    args = {
      asset,
      restrictions: [{ count }],
      type: TransferRestrictionType.Count,
    };
    dsMockUtils.setConstMock('statistics', 'maxTransferConditionsPerAsset', {
      returnValue: dsMockUtils.createMockU32(new BigNumber(3)),
    });

    setAssetTransferComplianceTransaction = dsMockUtils.createTxMock(
      'statistics',
      'setAssetTransferCompliance'
    );
    setEntitiesExemptTransaction = dsMockUtils.createTxMock('statistics', 'setEntitiesExempt');

    mockContext = dsMockUtils.getContextInstance();

    rawAssetId = dsMockUtils.createMockAssetId(assetId);
    rawCount = dsMockUtils.createMockU64(count);
    rawPercentage = dsMockUtils.createMockPermill(percentage.multipliedBy(10000));
    rawCountRestriction = dsMockUtils.createMockTransferCondition({
      MaxInvestorCount: rawCount,
      isMaxInvestorCount: true,
    });
    rawPercentageRestriction = dsMockUtils.createMockTransferCondition({
      MaxInvestorOwnership: rawPercentage,
      isMaxInvestorOwnership: true,
    });
    rawClaimCountRestriction = dsMockUtils.createMockTransferCondition({
      ClaimCount: [
        dsMockUtils.createMockStatisticsStatClaim({ Accredited: dsMockUtils.createMockBool(true) }),
        dsMockUtils.createMockIdentityId(did),
        rawCount,
        dsMockUtils.createMockOption(),
      ],
      isClaimCount: true,
    });
    rawClaimPercentageRestriction = dsMockUtils.createMockTransferCondition({
      ClaimOwnership: [
        dsMockUtils.createMockStatisticsStatClaim({ Accredited: dsMockUtils.createMockBool(true) }),
        dsMockUtils.createMockIdentityId(),
        rawPercentage,
        rawPercentage,
      ],
      isClaimOwnership: true,
    });
    rawCountRestrictionBtreeSet = dsMockUtils.createMockBTreeSet([rawCountRestriction]);
    rawPercentageRestrictionBtreeSet = dsMockUtils.createMockBTreeSet([rawPercentageRestriction]);
    rawClaimCountRestrictionBtreeSet = dsMockUtils.createMockBTreeSet([rawClaimCountRestriction]);
    rawClaimPercentageRestrictionBtreeSet = dsMockUtils.createMockBTreeSet([
      rawClaimPercentageRestriction,
    ]);

    rawExemptedDid = dsMockUtils.createMockIdentityId(exemptedDid);
    mockNeededStat = dsMockUtils.createMockStatisticsStatType();

    when(transferRestrictionToPolymeshTransferConditionSpy)
      .calledWith(maxInvestorRestriction, mockContext)
      .mockReturnValue(rawCountRestriction);
    when(transferRestrictionToPolymeshTransferConditionSpy)
      .calledWith(maxOwnershipRestriction, mockContext)
      .mockReturnValue(rawPercentageRestriction);
    when(transferRestrictionToPolymeshTransferConditionSpy)
      .calledWith(expect.objectContaining(claimCountRestriction), mockContext)
      .mockReturnValue(rawClaimCountRestriction);
    when(transferRestrictionToPolymeshTransferConditionSpy)
      .calledWith(claimPercentageRestriction, mockContext)
      .mockReturnValue(rawClaimPercentageRestriction);
    when(assetToMeshAssetIdSpy).calledWith(asset, mockContext).mockReturnValue(rawAssetId);
    when(stringToIdentityIdSpy)
      .calledWith(exemptedDid, mockContext)
      .mockReturnValue(rawExemptedDid);
    when(complianceConditionsToBtreeSetSpy)
      .calledWith([rawCountRestriction], mockContext)
      .mockReturnValue(rawCountRestrictionBtreeSet);
    when(complianceConditionsToBtreeSetSpy)
      .calledWith([rawPercentageRestriction], mockContext)
      .mockReturnValue(rawPercentageRestrictionBtreeSet);
    when(complianceConditionsToBtreeSetSpy)
      .calledWith([rawClaimCountRestriction], mockContext)
      .mockReturnValue(rawClaimCountRestrictionBtreeSet);
    when(complianceConditionsToBtreeSetSpy)
      .calledWith([rawClaimPercentageRestriction], mockContext)
      .mockReturnValue(rawClaimPercentageRestrictionBtreeSet);
    statisticsOpTypeToStatTypeSpy.mockReturnValue(mockNeededStat);
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

  it('should add a setTransferRestrictions transaction to the batch', async () => {
    let proc = procedureMockUtils.getInstance<SetTransferRestrictionsParams, BigNumber, Storage>(
      mockContext,
      {
        currentTypeRestrictions: [rawPercentageRestriction],
        filteredRestrictions: [],
        currentExemptions: emptyExemptions,
        occupiedSlots: new BigNumber(0),
      }
    );

    let result = await prepareSetTransferRestrictions.call(proc, args);

    expect(result).toEqual({
      transactions: [
        {
          transaction: setAssetTransferComplianceTransaction,
          args: [rawAssetId, rawCountRestrictionBtreeSet],
        },
      ],
      resolver: new BigNumber(1),
    });

    proc = procedureMockUtils.getInstance<SetTransferRestrictionsParams, BigNumber, Storage>(
      mockContext,
      {
        currentTypeRestrictions: [rawCountRestriction],
        filteredRestrictions: [],
        currentExemptions: emptyExemptions,
        occupiedSlots: new BigNumber(0),
      }
    );

    args = {
      asset,
      restrictions: [{ percentage }],
      type: TransferRestrictionType.Percentage,
    };

    result = await prepareSetTransferRestrictions.call(proc, args);

    expect(result).toEqual({
      transactions: [
        {
          transaction: setAssetTransferComplianceTransaction,
          args: [rawAssetId, rawPercentageRestrictionBtreeSet],
        },
      ],
      resolver: new BigNumber(1),
    });

    proc = procedureMockUtils.getInstance<SetTransferRestrictionsParams, BigNumber, Storage>(
      mockContext,
      {
        currentTypeRestrictions: [],
        filteredRestrictions: [],
        currentExemptions: emptyExemptions,
        occupiedSlots: new BigNumber(0),
      }
    );

    args = {
      asset,
      restrictions: [claimCountRestrictionValue],
      type: TransferRestrictionType.ClaimCount,
    };

    result = await prepareSetTransferRestrictions.call(proc, args);

    expect(result).toEqual({
      transactions: [
        {
          transaction: setAssetTransferComplianceTransaction,
          args: [rawAssetId, rawClaimCountRestrictionBtreeSet],
        },
      ],
      resolver: new BigNumber(1),
    });

    args = {
      asset,
      restrictions: [claimPercentageRestrictionValue],
      type: TransferRestrictionType.ClaimPercentage,
    };

    result = await prepareSetTransferRestrictions.call(proc, args);

    expect(result).toEqual({
      transactions: [
        {
          transaction: setAssetTransferComplianceTransaction,
          args: [rawAssetId, rawClaimPercentageRestrictionBtreeSet],
        },
      ],
      resolver: new BigNumber(1),
    });
  });

  it('should add exempted identities if they were given', async () => {
    when(booleanToBoolSpy).calledWith(true, mockContext).mockReturnValue(rawTrue);
    const proc = procedureMockUtils.getInstance<SetTransferRestrictionsParams, BigNumber, Storage>(
      mockContext,
      {
        currentTypeRestrictions: [],
        filteredRestrictions: [],
        currentExemptions: emptyExemptions,
        occupiedSlots: new BigNumber(0),
      }
    );
    const exemptedDids = [
      '0x1000',
      '0x2000',
      entityMockUtils.getIdentityInstance({ did: '0x3000' }),
    ];
    const exemptedDidsBtreeSet =
      dsMockUtils.createMockBTreeSet<PolymeshPrimitivesIdentityId>(exemptedDids);
    const op = 'Count';

    identitiesToBtreeSetSpy.mockReturnValue(exemptedDidsBtreeSet);

    when(transferRestrictionTypeToStatOpTypeSpy)
      .calledWith(TransferRestrictionType.Count, mockContext)
      .mockReturnValue(op as unknown as PolymeshPrimitivesStatisticsStatOpType);

    when(transferRestrictionTypeToStatOpTypeSpy)
      .calledWith(TransferRestrictionType.ClaimCount, mockContext)
      .mockReturnValue(op as unknown as PolymeshPrimitivesStatisticsStatOpType);
    args = {
      asset,
      restrictions: [{ ...claimCountRestrictionValue, exemptedIdentities: exemptedDids }],
      type: TransferRestrictionType.ClaimCount,
    };
    complianceConditionsToBtreeSetSpy.mockReturnValue(rawClaimCountRestrictionBtreeSet);

    let result = await prepareSetTransferRestrictions.call(proc, args);

    expect(result).toEqual({
      transactions: [
        {
          transaction: setAssetTransferComplianceTransaction,
          args: [rawAssetId, rawClaimCountRestrictionBtreeSet],
        },
        {
          transaction: setEntitiesExemptTransaction,
          feeMultiplier: new BigNumber(3),
          args: [
            rawTrue,
            { assetId: rawAssetId, op, claimType: ClaimType.Accredited },
            exemptedDidsBtreeSet,
          ],
        },
      ],
      resolver: new BigNumber(1),
    });

    args = {
      asset,
      restrictions: [
        {
          count,
          exemptedIdentities: exemptedDids,
        },
      ],
      type: TransferRestrictionType.Count,
    };
    complianceConditionsToBtreeSetSpy.mockReturnValue(rawCountRestrictionBtreeSet);

    result = await prepareSetTransferRestrictions.call(proc, args);

    expect(result).toEqual({
      transactions: [
        {
          transaction: setAssetTransferComplianceTransaction,
          args: [rawAssetId, rawCountRestrictionBtreeSet],
        },
        {
          transaction: setEntitiesExemptTransaction,
          feeMultiplier: new BigNumber(3),
          args: [rawTrue, { assetId: rawAssetId, op, claimType: undefined }, exemptedDidsBtreeSet],
        },
      ],
      resolver: new BigNumber(1),
    });
  });

  it('should remove exempted identities if they were not given', async () => {
    when(booleanToBoolSpy).calledWith(false, mockContext).mockReturnValue(rawFalse);
    let proc = procedureMockUtils.getInstance<SetTransferRestrictionsParams, BigNumber, Storage>(
      mockContext,
      {
        filteredRestrictions: [],
        currentTypeRestrictions: [],
        currentExemptions: {
          ...emptyExemptions,
          None: [
            entityMockUtils.getIdentityInstance({ did: '0x1000' }),
            entityMockUtils.getIdentityInstance({ did: '0x2000' }),
          ],
        },
        occupiedSlots: new BigNumber(0),
      }
    );

    const exemptedDids = ['0x1000', '0x2000'];
    const exemptedDidsBtreeSet =
      dsMockUtils.createMockBTreeSet<PolymeshPrimitivesIdentityId>(exemptedDids);
    const op = 'Count';

    identitiesToBtreeSetSpy.mockReturnValue(exemptedDidsBtreeSet);

    when(transferRestrictionTypeToStatOpTypeSpy)
      .calledWith(TransferRestrictionType.Count, mockContext)
      .mockReturnValue(op as unknown as PolymeshPrimitivesStatisticsStatOpType);

    args = {
      asset,
      restrictions: [{ count }],
      type: TransferRestrictionType.Count,
    };

    let result = await prepareSetTransferRestrictions.call(proc, args);
    expect(result).toEqual({
      transactions: [
        {
          transaction: setAssetTransferComplianceTransaction,
          args: [rawAssetId, rawCountRestrictionBtreeSet],
        },
        {
          transaction: setEntitiesExemptTransaction,
          feeMultiplier: new BigNumber(2),
          args: [rawFalse, { assetId: rawAssetId, op, claimType: undefined }, exemptedDidsBtreeSet],
        },
      ],
      resolver: new BigNumber(1),
    });

    proc = procedureMockUtils.getInstance<SetTransferRestrictionsParams, BigNumber, Storage>(
      mockContext,
      {
        currentTypeRestrictions: [],
        filteredRestrictions: [],
        currentExemptions: {
          ...emptyExemptions,
          Accredited: [
            entityMockUtils.getIdentityInstance({ did: '0x1000' }),
            entityMockUtils.getIdentityInstance({ did: '0x2000' }),
          ],
        },
        occupiedSlots: new BigNumber(0),
      }
    );

    when(transferRestrictionTypeToStatOpTypeSpy)
      .calledWith(TransferRestrictionType.ClaimCount, mockContext)
      .mockReturnValue(op as unknown as PolymeshPrimitivesStatisticsStatOpType);

    args = {
      asset,
      restrictions: [claimCountRestrictionValue],
      type: TransferRestrictionType.ClaimCount,
    };

    result = await prepareSetTransferRestrictions.call(proc, args);

    expect(result).toEqual({
      transactions: [
        {
          transaction: setAssetTransferComplianceTransaction,
          args: [rawAssetId, rawClaimCountRestrictionBtreeSet],
        },
        {
          transaction: setEntitiesExemptTransaction,
          feeMultiplier: new BigNumber(2),
          args: [
            rawFalse,
            { assetId: rawAssetId, op, claimType: ClaimType.Accredited },
            exemptedDidsBtreeSet,
          ],
        },
      ],
      resolver: new BigNumber(1),
    });
  });

  it('should remove restrictions by adding a setTransferRestriction transaction to the batch', async () => {
    args = {
      type: TransferRestrictionType.Count,
      restrictions: [],
      asset,
    };

    const proc = procedureMockUtils.getInstance<SetTransferRestrictionsParams, BigNumber, Storage>(
      mockContext,
      {
        currentTypeRestrictions: [rawCountRestriction],
        filteredRestrictions: [],
        currentExemptions: emptyExemptions,
        occupiedSlots: new BigNumber(0),
      }
    );
    const emptyConditionsBtreeSet =
      dsMockUtils.createMockBTreeSet<PolymeshPrimitivesTransferComplianceTransferCondition>([]);
    when(complianceConditionsToBtreeSetSpy)
      .calledWith([], mockContext)
      .mockReturnValue(emptyConditionsBtreeSet);

    const result = await prepareSetTransferRestrictions.call(proc, args);

    expect(result).toEqual({
      transactions: [
        {
          transaction: setAssetTransferComplianceTransaction,
          args: [rawAssetId, emptyConditionsBtreeSet],
        },
      ],
      resolver: new BigNumber(0),
    });
  });

  it('should throw an error if attempting to add restrictions that already exist', async () => {
    let proc = procedureMockUtils.getInstance<SetTransferRestrictionsParams, BigNumber, Storage>(
      mockContext,
      {
        currentTypeRestrictions: [rawCountRestriction],
        filteredRestrictions: [],
        currentExemptions: emptyExemptions,
        occupiedSlots: new BigNumber(0),
      }
    );

    const expectedError = new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The restrictions and exemptions are already in place',
    });

    await expect(
      prepareSetTransferRestrictions.call(proc, {
        asset,
        restrictions: [{ count }],
        type: TransferRestrictionType.Count,
      })
    ).rejects.toThrowError(expectedError);

    proc = procedureMockUtils.getInstance<SetTransferRestrictionsParams, BigNumber, Storage>(
      mockContext,
      {
        currentTypeRestrictions: [rawPercentageRestriction],
        filteredRestrictions: [],
        currentExemptions: emptyExemptions,
        occupiedSlots: new BigNumber(0),
      }
    );

    return expect(
      prepareSetTransferRestrictions.call(proc, {
        asset,
        restrictions: [{ percentage }],
        type: TransferRestrictionType.Percentage,
      })
    ).rejects.toThrowError(expectedError);
  });

  it('should throw an error if attempting to remove an empty restriction list', async () => {
    args = {
      asset,
      restrictions: [],
      type: TransferRestrictionType.Count,
    };
    const proc = procedureMockUtils.getInstance<SetTransferRestrictionsParams, BigNumber, Storage>(
      mockContext,
      {
        currentTypeRestrictions: [],
        filteredRestrictions: [],
        currentExemptions: emptyExemptions,
        occupiedSlots: new BigNumber(0),
      }
    );
    let err;
    try {
      await prepareSetTransferRestrictions.call(proc, args);
    } catch (error) {
      err = error;
    }
    expect(err.message).toBe('No restrictions to remove');
  });

  it('should throw an error if trying to add more restrictions than there are slots available', async () => {
    args = {
      asset,
      restrictions: [{ count: new BigNumber(2) }],
      type: TransferRestrictionType.Count,
    };

    const proc = procedureMockUtils.getInstance<SetTransferRestrictionsParams, BigNumber, Storage>(
      mockContext,
      {
        currentTypeRestrictions: [rawClaimCountRestriction],
        filteredRestrictions: [],
        currentExemptions: emptyExemptions,
        occupiedSlots: new BigNumber(3),
      }
    );

    let err;

    try {
      await prepareSetTransferRestrictions.call(proc, args);
    } catch (error) {
      err = error;
    }

    expect(err.message).toBe(
      'Cannot set more Transfer Restrictions than there are slots available'
    );
    expect(err.data).toEqual({ availableSlots: new BigNumber(0) });
  });

  it('should throw an error if more than one set of Percentage/Count restrictions are provided', async () => {
    args = {
      asset,
      restrictions: [{ count }, { count: new BigNumber(1) }],
      type: TransferRestrictionType.Count,
    };

    const proc = procedureMockUtils.getInstance<SetTransferRestrictionsParams, BigNumber, Storage>(
      mockContext,
      {
        currentTypeRestrictions: [rawClaimCountRestriction],
        filteredRestrictions: [],
        currentExemptions: emptyExemptions,
        occupiedSlots: new BigNumber(3),
      }
    );

    let err;

    try {
      await prepareSetTransferRestrictions.call(proc, args);
    } catch (error) {
      err = error;
    }

    expect(err.message).toBe('Only one of provided Transfer Type Restriction can be set at a time');
    expect(err.data).toEqual({ type: TransferRestrictionType.Count });
  });

  it('should throw an error if multiple instances of same Claim are included', async () => {
    args = {
      asset,
      restrictions: [claimCountRestrictionValue, claimCountRestrictionValue],
      type: TransferRestrictionType.ClaimCount,
    };

    const proc = procedureMockUtils.getInstance<SetTransferRestrictionsParams, BigNumber, Storage>(
      mockContext,
      {
        currentTypeRestrictions: [rawClaimCountRestriction],
        filteredRestrictions: [],
        currentExemptions: emptyExemptions,
        occupiedSlots: new BigNumber(1),
      }
    );

    let err;

    try {
      await prepareSetTransferRestrictions.call(proc, args);
    } catch (error) {
      err = error;
    }

    expect(err.message).toBe('Duplicate ClaimType found in input');
    expect(err.data).toEqual({ claimType: claimCountRestrictionValue.claim.type });
  });

  it('should throw an error if multiple instances of same Jurisdiction are included', async () => {
    args = {
      asset,
      restrictions: [
        {
          min,
          max,
          issuer,
          claim: {
            type: ClaimType.Jurisdiction,
            countryCode: CountryCode.Us,
          },
        },
        {
          min,
          max,
          issuer,
          claim: {
            type: ClaimType.Jurisdiction,
            countryCode: CountryCode.Us,
          },
        },
      ],
      type: TransferRestrictionType.ClaimCount,
    };

    const proc = procedureMockUtils.getInstance<SetTransferRestrictionsParams, BigNumber, Storage>(
      mockContext,
      {
        currentTypeRestrictions: [rawClaimCountRestriction],
        filteredRestrictions: [],
        currentExemptions: emptyExemptions,
        occupiedSlots: new BigNumber(1),
      }
    );

    let err;

    try {
      await prepareSetTransferRestrictions.call(proc, args);
    } catch (error) {
      err = error;
    }

    expect(err.message).toBe('Duplicate Jurisdiction CountryCode found in input');
    expect(err.data).toEqual({ countryCode: CountryCode.Us });

    args = {
      asset,
      restrictions: [
        {
          min,
          max,
          issuer,
          claim: {
            type: ClaimType.Jurisdiction,
          },
        },
        {
          min,
          max,
          issuer,
          claim: {
            type: ClaimType.Jurisdiction,
          },
        },
      ],
      type: TransferRestrictionType.ClaimCount,
    };

    try {
      await prepareSetTransferRestrictions.call(proc, args);
    } catch (error) {
      err = error;
    }

    expect(err.message).toBe('Duplicate Jurisdiction CountryCode found in input');
    expect(err.data).toEqual({ countryCode: undefined });
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      let proc = procedureMockUtils.getInstance<SetTransferRestrictionsParams, BigNumber, Storage>(
        mockContext,
        {
          currentTypeRestrictions: [],
          filteredRestrictions: [],
          currentExemptions: emptyExemptions,
          occupiedSlots: new BigNumber(0),
        }
      );

      let boundFunc = getAuthorization.bind(proc);

      expect(boundFunc(args)).toEqual({
        permissions: {
          assets: [expect.objectContaining({ id: assetId })],
          transactions: [TxTags.statistics.SetAssetTransferCompliance],
          portfolios: [],
        },
      });

      args.restrictions = [{ count, exemptedIdentities: ['0x1000'] }];

      proc = procedureMockUtils.getInstance<SetTransferRestrictionsParams, BigNumber, Storage>(
        mockContext,
        {
          currentTypeRestrictions: [],
          filteredRestrictions: [],
          currentExemptions: emptyExemptions,
          occupiedSlots: new BigNumber(0),
        }
      );

      boundFunc = getAuthorization.bind(proc);

      expect(boundFunc(args)).toEqual({
        permissions: {
          assets: [expect.objectContaining({ id: assetId })],
          transactions: [
            TxTags.statistics.SetAssetTransferCompliance,
            TxTags.statistics.SetEntitiesExempt,
          ],
          portfolios: [],
        },
      });
    });
  });

  describe('prepareStorage', () => {
    let identityScopeId: string;
    let rawCountStatType: PolymeshPrimitivesStatisticsStatType;
    let rawBalanceStatType: PolymeshPrimitivesStatisticsStatType;
    let rawClaimCountStatType: PolymeshPrimitivesStatisticsStatType;
    let rawIdentityScopeId: PolymeshPrimitivesIdentityId;
    let queryMultiMock: jest.Mock;
    let queryMultiResult: [
      BTreeSet<PolymeshPrimitivesStatisticsStatType>,
      PolymeshPrimitivesTransferComplianceAssetTransferCompliance
    ];
    let statBtreeSet: BTreeSet<PolymeshPrimitivesStatisticsStatType>;
    let assertStatIsSetSpy: jest.SpyInstance;

    beforeAll(() => {
      identityScopeId = 'someScopeId';

      rawIdentityScopeId = dsMockUtils.createMockIdentityId(identityScopeId);

      rawCountStatType = dsMockUtils.createMockStatisticsStatType();
      rawBalanceStatType = dsMockUtils.createMockStatisticsStatType({
        operationType: dsMockUtils.createMockStatisticsOpType(StatType.Balance),
        claimIssuer: dsMockUtils.createMockOption(),
      });
      rawClaimCountStatType = dsMockUtils.createMockStatisticsStatType({
        operationType: dsMockUtils.createMockStatisticsOpType(StatType.ScopedCount),
        claimIssuer: dsMockUtils.createMockOption([
          dsMockUtils.createMockClaimType(),
          dsMockUtils.createMockIdentityId(),
        ]),
      });
      statBtreeSet = dsMockUtils.createMockBTreeSet([
        rawCountStatType,
        rawBalanceStatType,
        rawClaimCountStatType,
      ]);
      assertStatIsSetSpy = jest.spyOn(utilsInternalModule, 'assertStatIsSet');
    });

    beforeEach(() => {
      queryMultiMock = dsMockUtils.getQueryMultiMock();

      when(stringToIdentityIdSpy)
        .calledWith(identityScopeId, mockContext)
        .mockReturnValue(rawIdentityScopeId);

      assertStatIsSetSpy.mockReturnValue(true);

      entityMockUtils.configureMocks({
        identityOptions: {
          getScopeId: identityScopeId,
        },
      });

      asset = entityMockUtils.getFungibleAssetInstance({ assetId });

      rawClaimCountStatType = dsMockUtils.createMockStatisticsStatType({
        operationType: dsMockUtils.createMockStatisticsOpType(StatType.ScopedCount),
        claimIssuer: dsMockUtils.createMockOption([
          dsMockUtils.createMockClaimType(),
          dsMockUtils.createMockIdentityId(),
        ]),
      });
      dsMockUtils.createQueryMock('statistics', 'activeAssetStats');
      dsMockUtils.createQueryMock('statistics', 'assetTransferCompliances');
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should fetch, process and return shared data', async () => {
      queryMultiResult = [
        statBtreeSet,
        {
          paused: dsMockUtils.createMockBool(false),
          requirements: [
            rawClaimCountRestriction,
            rawClaimPercentageRestriction,
            rawCountRestriction,
            rawPercentageRestriction,
          ],
        } as unknown as PolymeshPrimitivesTransferComplianceAssetTransferCompliance,
      ];

      queryMultiMock.mockReturnValue(queryMultiResult);
      dsMockUtils.createQueryMock('statistics', 'transferConditionExemptEntities', {
        entries: [],
      });

      const proc = procedureMockUtils.getInstance<
        SetTransferRestrictionsParams,
        BigNumber,
        Storage
      >(mockContext);
      const boundFunc = prepareStorage.bind(proc);

      args = {
        asset,
        type: TransferRestrictionType.Count,
        restrictions: [
          {
            count,
          },
        ],
      };

      let result = await boundFunc(args);
      expect(result).toEqual({
        occupiedSlots: new BigNumber(3),
        filteredRestrictions: [
          rawClaimCountRestriction,
          rawClaimPercentageRestriction,
          rawPercentageRestriction,
        ],
        currentTypeRestrictions: [rawCountRestriction],
        currentExemptions: emptyExemptions,
      });

      args = {
        asset,
        type: TransferRestrictionType.Percentage,
        restrictions: [
          {
            percentage,
          },
        ],
      };

      result = await boundFunc(args);

      expect(result).toEqual({
        occupiedSlots: new BigNumber(3),
        filteredRestrictions: [
          rawClaimCountRestriction,
          rawClaimPercentageRestriction,
          rawCountRestriction,
        ],
        currentTypeRestrictions: [rawPercentageRestriction],
        currentExemptions: emptyExemptions,
      });

      args = {
        asset,
        type: TransferRestrictionType.ClaimCount,
        restrictions: [
          {
            claim: { type: ClaimType.Accredited, accredited: true },
            min: new BigNumber(10),
            max: new BigNumber(20),
            issuer,
          },
        ],
      };

      result = await boundFunc(args);

      expect(result).toEqual({
        occupiedSlots: new BigNumber(3),
        filteredRestrictions: [
          rawClaimPercentageRestriction,
          rawCountRestriction,
          rawPercentageRestriction,
        ],
        currentTypeRestrictions: [rawClaimCountRestriction],
        currentExemptions: emptyExemptions,
      });

      args = {
        asset,
        type: TransferRestrictionType.ClaimPercentage,
        restrictions: [
          {
            claim: { type: ClaimType.Accredited, accredited: true },
            min: new BigNumber(10),
            max: new BigNumber(20),
            issuer,
          },
        ],
      };

      result = await boundFunc(args);

      expect(result).toEqual({
        occupiedSlots: new BigNumber(3),
        filteredRestrictions: [
          rawClaimCountRestriction,
          rawCountRestriction,
          rawPercentageRestriction,
        ],
        currentTypeRestrictions: [rawClaimPercentageRestriction],
        currentExemptions: emptyExemptions,
      });
    });

    it('should return current exemptions for the restriction', async () => {
      identityIdToStringSpy.mockReturnValue('someDid');
      queryMultiResult = [
        statBtreeSet,
        {
          paused: dsMockUtils.createMockBool(false),
          requirements: [
            rawClaimCountRestriction,
            rawClaimPercentageRestriction,
            rawCountRestriction,
            rawPercentageRestriction,
          ],
        } as unknown as PolymeshPrimitivesTransferComplianceAssetTransferCompliance,
      ];

      queryMultiMock.mockReturnValue(queryMultiResult);
      const mock = dsMockUtils.createQueryMock('statistics', 'transferConditionExemptEntities');
      mock.entries.mockResolvedValue([
        [
          {
            args: [
              {
                claimType: dsMockUtils.createMockOption(
                  dsMockUtils.createMockClaimType(ClaimType.Accredited)
                ),
              },
              dsMockUtils.createMockIdentityId('someDid'),
            ],
          },
          true,
        ],
      ]);

      const proc = procedureMockUtils.getInstance<
        SetTransferRestrictionsParams,
        BigNumber,
        Storage
      >(mockContext);
      const boundFunc = prepareStorage.bind(proc);

      args = {
        asset,
        type: TransferRestrictionType.Count,
        restrictions: [
          {
            count,
          },
        ],
      };

      const mockIdentity = entityMockUtils.getIdentityInstance({ did: 'someDid' });
      const result = await boundFunc(args);
      expect(JSON.stringify(result.currentExemptions)).toEqual(
        JSON.stringify({
          ...emptyExemptions,
          Accredited: [mockIdentity],
        })
      );
    });
  });

  describe('addExemptionIfNotPresent', () => {
    it('should not add the toInsertId object to exemptionRecords if it is already present in the filterSet', () => {
      const toInsertId = { did: 'testDid' } as Identity;
      const exemptionRecords = newExemptionRecord();
      const claimType = ClaimType.Accredited;
      const filterSet = [toInsertId] as Identity[];

      addExemptionIfNotPresent(toInsertId, exemptionRecords, claimType, filterSet);

      expect(exemptionRecords[claimType]).toEqual([]);
    });

    it('should add the toInsertId object to exemptionRecords if it is not already present in the filterSet', () => {
      const toInsertId = { did: 'testDid' } as Identity;
      const exemptionRecords = newExemptionRecord();
      const claimType = ClaimType.Accredited;
      const filterSet = [] as Identity[];

      addExemptionIfNotPresent(toInsertId, exemptionRecords, claimType, filterSet);

      expect(exemptionRecords[claimType]).toEqual([toInsertId]);
    });
  });

  describe('setTransferRestrictions', () => {
    it('should return the result of the prepareSetTransferRestrictions call', async () => {
      const result = setTransferRestrictions();

      expect(result).toBeInstanceOf(Procedure);
    });
  });
});
