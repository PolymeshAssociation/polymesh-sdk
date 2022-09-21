import { bool, BTreeSet, u64 } from '@polkadot/types';
import { Permill } from '@polkadot/types/interfaces';
import {
  PolymeshPrimitivesIdentityClaimClaimType,
  PolymeshPrimitivesIdentityId,
  PolymeshPrimitivesStatisticsStatOpType,
  PolymeshPrimitivesStatisticsStatType,
  PolymeshPrimitivesTransferComplianceTransferCondition,
} from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import { ScopeId, Ticker, TransferCondition } from 'polymesh-types/types';
import sinon from 'sinon';

import { SetTransferRestrictionsParams } from '~/api/entities/Asset/TransferRestrictions/TransferRestrictionBase';
import {
  getAuthorization,
  prepareSetTransferRestrictions,
  prepareStorage,
  Storage,
} from '~/api/procedures/setTransferRestrictions';
import { Context, PolymeshError } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import {
  ClaimCountRestrictionValue,
  ClaimPercentageRestrictionValue,
  ClaimType,
  ErrorCode,
  Identity,
  StatType,
  TransferRestriction,
  TransferRestrictionType,
  TxTags,
} from '~/types';
import { PolymeshTx, TickerKey } from '~/types/internal';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Asset',
  require('~/testUtils/mocks/entities').mockAssetModule('~/api/entities/Asset')
);
jest.mock(
  '~/api/entities/Identity',
  require('~/testUtils/mocks/entities').mockIdentityModule('~/api/entities/Identity')
);

describe('setTransferRestrictions procedure', () => {
  let mockContext: Mocked<Context>;
  let transferRestrictionToPolymeshTransferConditionStub: sinon.SinonStub<
    [TransferRestriction, Context],
    TransferCondition
  >;
  let stringToTickerKeyStub: sinon.SinonStub<[string, Context], TickerKey>;
  let stringToScopeIdStub: sinon.SinonStub<[string, Context], ScopeId>;
  let identitiesToBtreeSetStub: sinon.SinonStub<
    [Identity[], Context],
    BTreeSet<PolymeshPrimitivesIdentityId>
  >;
  let transferRestrictionTypeToStatOpTypeStub: sinon.SinonStub<
    [TransferRestrictionType, Context],
    PolymeshPrimitivesStatisticsStatOpType
  >;
  let complianceConditionsToBtreeSetStub: sinon.SinonStub<
    [PolymeshPrimitivesTransferComplianceTransferCondition[], Context],
    BTreeSet<PolymeshPrimitivesTransferComplianceTransferCondition>
  >;
  let statisticsOpTypeToStatTypeStub: sinon.SinonStub<
    [
      {
        op: PolymeshPrimitivesStatisticsStatOpType;
        claimIssuer?: [PolymeshPrimitivesIdentityClaimClaimType, PolymeshPrimitivesIdentityId];
      },
      Context
    ],
    PolymeshPrimitivesStatisticsStatType
  >;
  let statStub: sinon.SinonStub;
  let ticker: string;
  let count: BigNumber;
  let percentage: BigNumber;
  let maxInvestorRestriction: TransferRestriction;
  let maxOwnershipRestriction: TransferRestriction;
  let claimCountRestriction: TransferRestriction;
  let claimPercentageRestriction: TransferRestriction;
  let claimCountRestrictionValue: ClaimCountRestrictionValue;
  let claimPercentageRestrictionValue: ClaimPercentageRestrictionValue;
  let rawTicker: Ticker;
  let rawCount: u64;
  let rawPercentage: Permill;
  let rawCountRestriction: TransferCondition;
  let rawPercentageRestriction: TransferCondition;
  let rawClaimCountRestriction: TransferCondition;
  let rawClaimPercentageRestriction: TransferCondition;
  let rawScopeId: ScopeId;
  let rawStatType: PolymeshPrimitivesStatisticsStatType;
  let rawStatTypeBtree: BTreeSet<PolymeshPrimitivesStatisticsStatType>;
  let mockNeededStat: PolymeshPrimitivesStatisticsStatType;
  let rawStatStatTypeEqStub: sinon.SinonStub;
  let args: SetTransferRestrictionsParams;
  let rawCountRestrictionBtreeSet: BTreeSet<PolymeshPrimitivesTransferComplianceTransferCondition>;
  let rawPercentageRestrictionBtreeSet: BTreeSet<PolymeshPrimitivesTransferComplianceTransferCondition>;
  let rawClaimCountRestrictionBtreeSet: BTreeSet<PolymeshPrimitivesTransferComplianceTransferCondition>;
  let rawClaimPercentageRestrictionBtreeSet: BTreeSet<PolymeshPrimitivesTransferComplianceTransferCondition>;
  let identityIdToStringStub: sinon.SinonStub<[PolymeshPrimitivesIdentityId], string>;
  let booleanToBoolStub: sinon.SinonStub<[boolean, Context], bool>;

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
    transferRestrictionToPolymeshTransferConditionStub = sinon.stub(
      utilsConversionModule,
      'transferRestrictionToPolymeshTransferCondition'
    );
    stringToTickerKeyStub = sinon.stub(utilsConversionModule, 'stringToTickerKey');
    stringToScopeIdStub = sinon.stub(utilsConversionModule, 'stringToScopeId');
    identitiesToBtreeSetStub = sinon.stub(utilsConversionModule, 'identitiesToBtreeSet');
    transferRestrictionTypeToStatOpTypeStub = sinon.stub(
      utilsConversionModule,
      'transferRestrictionTypeToStatOpType'
    );
    statStub = sinon.stub(utilsConversionModule, 'statTypeToStatOpType');
    complianceConditionsToBtreeSetStub = sinon.stub(
      utilsConversionModule,
      'complianceConditionsToBtreeSet'
    );
    statisticsOpTypeToStatTypeStub = sinon.stub(
      utilsConversionModule,
      'statisticsOpTypeToStatType'
    );
    identityIdToStringStub = sinon.stub(utilsConversionModule, 'identityIdToString');
    booleanToBoolStub = sinon.stub(utilsConversionModule, 'booleanToBool');
    ticker = 'TICKER';
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
  });

  let setAssetTransferComplianceTransaction: PolymeshTx<[Ticker, TransferCondition]>;
  let setEntitiesExemptTransaction: PolymeshTx<
    [
      boolean,
      { asset: { Ticker: Ticker }; op: PolymeshPrimitivesStatisticsStatOpType },
      BTreeSet<PolymeshPrimitivesIdentityId>
    ]
  >;

  beforeEach(() => {
    args = {
      ticker,
      restrictions: [{ count }],
      type: TransferRestrictionType.Count,
    };
    dsMockUtils.setConstMock('statistics', 'maxTransferConditionsPerAsset', {
      returnValue: dsMockUtils.createMockU32(new BigNumber(3)),
    });

    setAssetTransferComplianceTransaction = dsMockUtils.createTxStub(
      'statistics',
      'setAssetTransferCompliance'
    );
    setEntitiesExemptTransaction = dsMockUtils.createTxStub('statistics', 'setEntitiesExempt');

    mockContext = dsMockUtils.getContextInstance();

    rawTicker = dsMockUtils.createMockTicker(ticker);
    rawCount = dsMockUtils.createMockU64(count);
    rawPercentage = dsMockUtils.createMockPermill(percentage.multipliedBy(10000));
    rawCountRestriction = dsMockUtils.createMockTransferCondition({ MaxInvestorCount: rawCount });
    rawPercentageRestriction = dsMockUtils.createMockTransferCondition({
      MaxInvestorOwnership: rawPercentage,
    });
    rawClaimCountRestriction = dsMockUtils.createMockTransferCondition({
      ClaimCount: [
        dsMockUtils.createMockStatisticsStatClaim({ Accredited: dsMockUtils.createMockBool(true) }),
        dsMockUtils.createMockIdentityId(did),
        rawCount,
        dsMockUtils.createMockOption(),
      ],
    });
    rawClaimPercentageRestriction = dsMockUtils.createMockTransferCondition({
      ClaimOwnership: [
        dsMockUtils.createMockStatisticsStatClaim({ Accredited: dsMockUtils.createMockBool(true) }),
        dsMockUtils.createMockIdentityId(),
        rawPercentage,
        rawPercentage,
      ],
    });
    rawCountRestrictionBtreeSet = dsMockUtils.createMockBTreeSet([rawCountRestriction]);
    rawPercentageRestrictionBtreeSet = dsMockUtils.createMockBTreeSet([rawPercentageRestriction]);
    rawClaimCountRestrictionBtreeSet = dsMockUtils.createMockBTreeSet([rawClaimCountRestriction]);
    rawClaimPercentageRestrictionBtreeSet = dsMockUtils.createMockBTreeSet([
      rawClaimPercentageRestriction,
    ]);
    rawScopeId = dsMockUtils.createMockScopeId(exemptedDid);
    rawStatType = dsMockUtils.createMockStatisticsStatType();
    mockNeededStat = dsMockUtils.createMockStatisticsStatType();
    rawStatStatTypeEqStub = rawStatType.eq as sinon.SinonStub;
    rawStatTypeBtree = dsMockUtils.createMockBTreeSet([rawStatType]);

    transferRestrictionToPolymeshTransferConditionStub
      .withArgs(maxInvestorRestriction, mockContext)
      .returns(rawCountRestriction);
    transferRestrictionToPolymeshTransferConditionStub
      .withArgs(maxOwnershipRestriction, mockContext)
      .returns(rawPercentageRestriction);
    transferRestrictionToPolymeshTransferConditionStub
      .withArgs(sinon.match(claimCountRestriction), mockContext)
      .returns(rawClaimCountRestriction);
    transferRestrictionToPolymeshTransferConditionStub
      .withArgs(claimPercentageRestriction, mockContext)
      .returns(rawClaimPercentageRestriction);
    stringToTickerKeyStub.withArgs(ticker, mockContext).returns({ Ticker: rawTicker });
    stringToScopeIdStub.withArgs(exemptedDid, mockContext).returns(rawScopeId);
    complianceConditionsToBtreeSetStub
      .withArgs([rawCountRestriction], mockContext)
      .returns(rawCountRestrictionBtreeSet);
    complianceConditionsToBtreeSetStub
      .withArgs([rawPercentageRestriction], mockContext)
      .returns(rawPercentageRestrictionBtreeSet);
    complianceConditionsToBtreeSetStub
      .withArgs([rawClaimCountRestriction], mockContext)
      .returns(rawClaimCountRestrictionBtreeSet);
    complianceConditionsToBtreeSetStub
      .withArgs([rawClaimPercentageRestriction], mockContext)
      .returns(rawClaimPercentageRestrictionBtreeSet);
    statisticsOpTypeToStatTypeStub.returns(mockNeededStat);
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
        currentRestrictions: [rawPercentageRestriction],
        currentExemptions: emptyExemptions,
        occupiedSlots: new BigNumber(0),
      }
    );

    let result = await prepareSetTransferRestrictions.call(proc, args);

    expect(result).toEqual({
      transactions: [
        {
          transaction: setAssetTransferComplianceTransaction,
          args: [{ Ticker: rawTicker }, rawCountRestrictionBtreeSet],
        },
      ],
      resolver: new BigNumber(1),
    });

    proc = procedureMockUtils.getInstance<SetTransferRestrictionsParams, BigNumber, Storage>(
      mockContext,
      {
        currentRestrictions: [rawCountRestriction],
        currentExemptions: emptyExemptions,
        occupiedSlots: new BigNumber(0),
      }
    );

    args = {
      ticker,
      restrictions: [{ percentage }],
      type: TransferRestrictionType.Percentage,
    };

    result = await prepareSetTransferRestrictions.call(proc, args);

    expect(result).toEqual({
      transactions: [
        {
          transaction: setAssetTransferComplianceTransaction,
          args: [{ Ticker: rawTicker }, rawPercentageRestrictionBtreeSet],
        },
      ],
      resolver: new BigNumber(1),
    });

    proc = procedureMockUtils.getInstance<SetTransferRestrictionsParams, BigNumber, Storage>(
      mockContext,
      {
        currentRestrictions: [],
        currentExemptions: emptyExemptions,
        occupiedSlots: new BigNumber(0),
      }
    );

    args = {
      ticker,
      restrictions: [claimCountRestrictionValue],
      type: TransferRestrictionType.ClaimCount,
    };

    result = await prepareSetTransferRestrictions.call(proc, args);

    expect(result).toEqual({
      transactions: [
        {
          transaction: setAssetTransferComplianceTransaction,
          args: [{ Ticker: rawTicker }, rawClaimCountRestrictionBtreeSet],
        },
      ],
      resolver: new BigNumber(1),
    });

    args = {
      ticker,
      restrictions: [claimPercentageRestrictionValue],
      type: TransferRestrictionType.ClaimPercentage,
    };

    result = await prepareSetTransferRestrictions.call(proc, args);

    expect(result).toEqual({
      transactions: [
        {
          transaction: setAssetTransferComplianceTransaction,
          args: [{ Ticker: rawTicker }, rawClaimPercentageRestrictionBtreeSet],
        },
      ],
      resolver: new BigNumber(1),
    });
  });

  it('should add exempted identities if they were given', async () => {
    booleanToBoolStub.withArgs(true, mockContext).returns(rawTrue);
    const proc = procedureMockUtils.getInstance<SetTransferRestrictionsParams, BigNumber, Storage>(
      mockContext,
      {
        currentRestrictions: [],
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

    identitiesToBtreeSetStub.returns(exemptedDidsBtreeSet);

    transferRestrictionTypeToStatOpTypeStub
      .withArgs(TransferRestrictionType.Count, mockContext)
      .returns(op as unknown as PolymeshPrimitivesStatisticsStatOpType);

    transferRestrictionTypeToStatOpTypeStub
      .withArgs(TransferRestrictionType.ClaimCount, mockContext)
      .returns(op as unknown as PolymeshPrimitivesStatisticsStatOpType);
    args = {
      ticker,
      restrictions: [{ ...claimCountRestrictionValue, exemptedIdentities: exemptedDids }],
      type: TransferRestrictionType.ClaimCount,
    };

    let result = await prepareSetTransferRestrictions.call(proc, args);

    expect(result).toEqual({
      transactions: [
        {
          transaction: setAssetTransferComplianceTransaction,
          args: [{ Ticker: rawTicker }, rawClaimCountRestrictionBtreeSet],
        },
        {
          transaction: setEntitiesExemptTransaction,
          feeMultiplier: new BigNumber(3),
          args: [
            rawTrue,
            { asset: { Ticker: rawTicker }, op, claimType: ClaimType.Accredited },
            exemptedDidsBtreeSet,
          ],
        },
      ],
      resolver: new BigNumber(1),
    });

    complianceConditionsToBtreeSetStub.returns(rawClaimCountRestrictionBtreeSet);
    args = {
      ticker,
      restrictions: [
        {
          count,
          exemptedIdentities: exemptedDids,
        },
      ],
      type: TransferRestrictionType.Count,
    };

    result = await prepareSetTransferRestrictions.call(proc, args);

    expect(result).toEqual({
      transactions: [
        {
          transaction: setAssetTransferComplianceTransaction,
          args: [{ Ticker: rawTicker }, rawCountRestrictionBtreeSet],
        },
        {
          transaction: setEntitiesExemptTransaction,
          feeMultiplier: new BigNumber(3),
          args: [
            rawTrue,
            { asset: { Ticker: rawTicker }, op, claimType: undefined },
            exemptedDidsBtreeSet,
          ],
        },
      ],
      resolver: new BigNumber(1),
    });
  });

  it('should remove exempted identities if they were not given', async () => {
    booleanToBoolStub.withArgs(false, mockContext).returns(rawFalse);
    let proc = procedureMockUtils.getInstance<SetTransferRestrictionsParams, BigNumber, Storage>(
      mockContext,
      {
        currentRestrictions: [],
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

    identitiesToBtreeSetStub.returns(exemptedDidsBtreeSet);

    transferRestrictionTypeToStatOpTypeStub
      .withArgs(TransferRestrictionType.Count, mockContext)
      .returns(op as unknown as PolymeshPrimitivesStatisticsStatOpType);

    args = {
      ticker,
      restrictions: [{ count }],
      type: TransferRestrictionType.Count,
    };

    let result = await prepareSetTransferRestrictions.call(proc, args);
    expect(result).toEqual({
      transactions: [
        {
          transaction: setAssetTransferComplianceTransaction,
          args: [{ Ticker: rawTicker }, rawCountRestrictionBtreeSet],
        },
        {
          transaction: setEntitiesExemptTransaction,
          feeMultiplier: new BigNumber(2),
          args: [
            rawFalse,
            { asset: { Ticker: rawTicker }, op, claimType: undefined },
            exemptedDidsBtreeSet,
          ],
        },
      ],
      resolver: new BigNumber(1),
    });

    proc = procedureMockUtils.getInstance<SetTransferRestrictionsParams, BigNumber, Storage>(
      mockContext,
      {
        currentRestrictions: [],
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

    transferRestrictionTypeToStatOpTypeStub
      .withArgs(TransferRestrictionType.ClaimCount, mockContext)
      .returns(op as unknown as PolymeshPrimitivesStatisticsStatOpType);

    args = {
      ticker,
      restrictions: [claimCountRestrictionValue],
      type: TransferRestrictionType.ClaimCount,
    };

    result = await prepareSetTransferRestrictions.call(proc, args);

    expect(result).toEqual({
      transactions: [
        {
          transaction: setAssetTransferComplianceTransaction,
          args: [{ Ticker: rawTicker }, rawClaimCountRestrictionBtreeSet],
        },
        {
          transaction: setEntitiesExemptTransaction,
          feeMultiplier: new BigNumber(2),
          args: [
            rawFalse,
            { asset: { Ticker: rawTicker }, op, claimType: ClaimType.Accredited },
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
      ticker,
    };

    const proc = procedureMockUtils.getInstance<SetTransferRestrictionsParams, BigNumber, Storage>(
      mockContext,
      {
        currentRestrictions: [rawCountRestriction],
        currentExemptions: emptyExemptions,
        occupiedSlots: new BigNumber(0),
      }
    );
    const emptyConditionsBtreeSet =
      dsMockUtils.createMockBTreeSet<PolymeshPrimitivesTransferComplianceTransferCondition>([]);
    complianceConditionsToBtreeSetStub.withArgs([], mockContext).returns(emptyConditionsBtreeSet);

    const result = await prepareSetTransferRestrictions.call(proc, args);

    expect(result).toEqual({
      transactions: [
        {
          transaction: setAssetTransferComplianceTransaction,
          args: [{ Ticker: rawTicker }, emptyConditionsBtreeSet],
        },
      ],
      resolver: new BigNumber(0),
    });
  });

  it('should throw an error if attempting to add restrictions that already exist', async () => {
    let proc = procedureMockUtils.getInstance<SetTransferRestrictionsParams, BigNumber, Storage>(
      mockContext,
      {
        currentRestrictions: [rawCountRestriction],
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
        ticker,
        restrictions: [{ count }],
        type: TransferRestrictionType.Count,
      })
    ).rejects.toThrowError(expectedError);

    proc = procedureMockUtils.getInstance<SetTransferRestrictionsParams, BigNumber, Storage>(
      mockContext,
      {
        currentRestrictions: [rawPercentageRestriction],
        currentExemptions: emptyExemptions,
        occupiedSlots: new BigNumber(0),
      }
    );

    return expect(
      prepareSetTransferRestrictions.call(proc, {
        ticker,
        restrictions: [{ percentage }],
        type: TransferRestrictionType.Percentage,
      })
    ).rejects.toThrowError(expectedError);
  });

  it('should throw an error if attempting to remove an empty restriction list', async () => {
    args = {
      ticker,
      restrictions: [],
      type: TransferRestrictionType.Count,
    };
    const proc = procedureMockUtils.getInstance<SetTransferRestrictionsParams, BigNumber, Storage>(
      mockContext,
      {
        currentRestrictions: [],
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
    expect(err.message).toBe('The restrictions and exemptions are already in place');
  });

  it('should throw an eStatTypeng to add more restrictions than there are slots available', async () => {
    args = {
      ticker,
      restrictions: [{ count }, { count: new BigNumber(2) }],
      type: TransferRestrictionType.Count,
    };

    const proc = procedureMockUtils.getInstance<SetTransferRestrictionsParams, BigNumber, Storage>(
      mockContext,
      {
        currentRestrictions: [rawCountRestriction],
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

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      let proc = procedureMockUtils.getInstance<SetTransferRestrictionsParams, BigNumber, Storage>(
        mockContext,
        {
          currentRestrictions: [],
          currentExemptions: emptyExemptions,
          occupiedSlots: new BigNumber(0),
        }
      );

      let boundFunc = getAuthorization.bind(proc);

      expect(boundFunc(args)).toEqual({
        permissions: {
          assets: [expect.objectContaining({ ticker })],
          transactions: [TxTags.statistics.SetAssetTransferCompliance],
          portfolios: [],
        },
      });

      args.restrictions = [{ count, exemptedIdentities: ['0x1000'] }];

      proc = procedureMockUtils.getInstance<SetTransferRestrictionsParams, BigNumber, Storage>(
        mockContext,
        {
          currentRestrictions: [],
          currentExemptions: emptyExemptions,
          occupiedSlots: new BigNumber(0),
        }
      );

      boundFunc = getAuthorization.bind(proc);

      expect(boundFunc(args)).toEqual({
        permissions: {
          assets: [expect.objectContaining({ ticker })],
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

    let rawIdentityScopeId: ScopeId;

    const getCountStub = sinon.stub();
    const getPercentageStub = sinon.stub();
    const getClaimCountStub = sinon.stub();
    const getClaimPercentageStub = sinon.stub();

    beforeAll(() => {
      identityScopeId = 'someScopeId';

      rawIdentityScopeId = dsMockUtils.createMockScopeId(identityScopeId);
    });

    beforeEach(() => {
      dsMockUtils.createQueryStub('statistics', 'transferConditionExemptEntities', {
        entries: [],
      });
      stringToScopeIdStub.withArgs(identityScopeId, mockContext).returns(rawIdentityScopeId);

      getCountStub.resolves({
        restrictions: [{ count }],
        availableSlots: new BigNumber(1),
      });
      getPercentageStub.resolves({
        restrictions: [{ percentage }],
        availableSlots: new BigNumber(1),
      });
      getClaimCountStub.resolves({
        restrictions: [claimCountRestrictionValue],
        availableSlots: new BigNumber(1),
      });
      getClaimPercentageStub.resolves({
        restrictions: [claimPercentageRestrictionValue],
        availableSlots: new BigNumber(1),
      });
      entityMockUtils.configureMocks({
        identityOptions: {
          getScopeId: identityScopeId,
        },
        assetOptions: {
          transferRestrictionsCountGet: getCountStub,
          transferRestrictionsPercentageGet: getPercentageStub,
          transferRestrictionsClaimCountGet: getClaimCountStub,
          transferRestrictionsClaimPercentageGet: getClaimPercentageStub,
        },
      });

      dsMockUtils.createQueryStub('statistics', 'activeAssetStats', {
        returnValue: rawStatTypeBtree,
      });
    });

    afterAll(() => {
      sinon.restore();
    });

    it('should fetch, process and return shared data', async () => {
      rawStatStatTypeEqStub.returns(true);
      identityIdToStringStub.returns('someDid');
      const proc = procedureMockUtils.getInstance<
        SetTransferRestrictionsParams,
        BigNumber,
        Storage
      >(mockContext);
      const boundFunc = prepareStorage.bind(proc);

      args = {
        ticker,
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
        currentRestrictions: [rawCountRestriction],
        currentExemptions: emptyExemptions,
      });

      args = {
        ticker,
        type: TransferRestrictionType.Percentage,
        restrictions: [
          {
            percentage,
          },
        ],
      };

      statStub.returns(StatType.Balance);

      result = await boundFunc(args);

      expect(result).toEqual({
        currentRestrictions: [rawPercentageRestriction],
        occupiedSlots: new BigNumber(3),
        currentExemptions: emptyExemptions,
      });

      args.restrictions = [];

      getCountStub.resolves({ restrictions: [{ count }], availableSlots: 1 });

      result = await boundFunc(args);
      expect(result).toEqual({
        currentRestrictions: [rawPercentageRestriction],
        occupiedSlots: new BigNumber(3),
        currentExemptions: emptyExemptions,
      });

      getCountStub.resolves({
        restrictions: [{ count, exemptedIds: [exemptedDid] }],
        availableSlots: 1,
      });

      result = await boundFunc(args);

      expect(result).toEqual({
        currentRestrictions: [rawPercentageRestriction],
        occupiedSlots: new BigNumber(3),
        currentExemptions: emptyExemptions,
      });

      args = {
        ticker,
        type: TransferRestrictionType.ClaimCount,
        restrictions: [claimCountRestrictionValue],
      };
      result = await boundFunc(args);
      expect(result).toEqual({
        currentRestrictions: [rawClaimCountRestriction],
        occupiedSlots: new BigNumber(3),
        currentExemptions: emptyExemptions,
      });

      args = {
        ticker,
        type: TransferRestrictionType.ClaimPercentage,
        restrictions: [claimPercentageRestrictionValue],
      };
      result = await boundFunc(args);
      expect(result).toEqual({
        currentRestrictions: [rawClaimPercentageRestriction],
        occupiedSlots: new BigNumber(3),
        currentExemptions: emptyExemptions,
      });
    });

    it('should return current exemptions for the restriction', async () => {
      rawStatStatTypeEqStub.returns(true);
      const proc = procedureMockUtils.getInstance<
        SetTransferRestrictionsParams,
        BigNumber,
        Storage
      >(mockContext);
      const boundFunc = prepareStorage.bind(proc);
      identityIdToStringStub.returns('someDid');
      const stub = dsMockUtils.createQueryStub('statistics', 'transferConditionExemptEntities');
      stub.entries.resolves([
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
      const mockIdentity = entityMockUtils.getIdentityInstance({ did: 'someDid' });
      const result = await boundFunc(args);
      expect(JSON.stringify(result)).toEqual(
        JSON.stringify({
          occupiedSlots: new BigNumber(3),
          currentRestrictions: [rawCountRestriction],
          currentExemptions: {
            ...emptyExemptions,
            Accredited: [mockIdentity],
          },
        })
      );
    });

    it('should throw an error if the appropriate stat is not set', async () => {
      dsMockUtils.createQueryStub('statistics', 'activeAssetStats', {
        returnValue: rawStatTypeBtree,
      });
      rawStatStatTypeEqStub.returns(false);

      const proc = procedureMockUtils.getInstance<
        SetTransferRestrictionsParams,
        BigNumber,
        Storage
      >(mockContext);
      const boundFunc = prepareStorage.bind(proc);

      const expectedError = new PolymeshError({
        code: ErrorCode.UnmetPrerequisite,
        message:
          'The appropriate stat type for this restriction is not set. Try calling enableStat in the namespace first',
      });

      return expect(boundFunc(args)).rejects.toThrowError(expectedError);
    });
  });
});
