import { Bytes, u32 } from '@polkadot/types';
import { AccountId } from '@polkadot/types/interfaces';
import {
  PolymeshPrimitivesIdentityClaimClaimType,
  PolymeshPrimitivesIdentityId,
  PolymeshPrimitivesSecondaryKeyKeyRecord,
} from '@polkadot/types/lookup';
import { ISubmittableResult } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';
import { IdentityId } from 'polymesh-types/types';
import sinon from 'sinon';

import { Account, Asset, Context, Identity, PolymeshError, Procedure } from '~/internal';
import { ClaimScopeTypeEnum } from '~/middleware/types';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';
import {
  createMockStatisticsStatClaim,
  getWebSocketInstance,
  MockCodec,
  MockWebSocket,
} from '~/testUtils/mocks/dataSources';
import {
  CaCheckpointType,
  CalendarPeriod,
  CalendarUnit,
  ClaimType,
  CountryCode,
  ErrorCode,
  ModuleName,
  PermissionedAccount,
  ProcedureMethod,
  RemoveAssetStatParams,
  StatType,
  SubCallback,
  TransferRestrictionType,
  TxTags,
} from '~/types';
import { tuple } from '~/types/utils';
import { MAX_TICKER_LENGTH } from '~/utils/constants';
import * as utilsConversionModule from '~/utils/conversion';

import {
  asAccount,
  assertAddressValid,
  assertExpectedChainVersion,
  assertIsInteger,
  assertIsPositive,
  assertTickerValid,
  asTicker,
  calculateNextKey,
  compareStatsToInput,
  compareStatTypeToTransferRestrictionType,
  compareTransferRestrictionToInput,
  compareTransferRestrictionToStat,
  createClaim,
  createProcedureMethod,
  delay,
  filterEventRecords,
  getCheckpointValue,
  getDid,
  getExemptedIds,
  getIdentity,
  getPortfolioIdsByName,
  getSecondaryAccountPermissions,
  hasSameElements,
  isModuleOrTagMatch,
  isPrintableAscii,
  mergeReceipts,
  neededStatTypeForRestrictionInput,
  optionize,
  padString,
  periodComplexity,
  removePadding,
  requestAtBlock,
  requestPaginated,
  serialize,
  sliceBatchReceipt,
  unserialize,
} from '../internal';

jest.mock(
  '~/api/entities/Asset',
  require('~/testUtils/mocks/entities').mockAssetModule('~/api/entities/Asset')
);
jest.mock(
  '~/api/entities/Account',
  require('~/testUtils/mocks/entities').mockAccountModule('~/api/entities/Account')
);
jest.mock('websocket', require('~/testUtils/mocks/dataSources').mockWebSocketModule());

describe('delay', () => {
  beforeAll(() => {
    jest.useFakeTimers({
      legacyFakeTimers: true,
    });
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('should resolve after the supplied timeout', () => {
    const delayPromise = delay(5000);

    jest.advanceTimersByTime(5000);

    return expect(delayPromise).resolves.toBeUndefined();
  });
});

describe('serialize and unserialize', () => {
  const entityType = 'someEntity';

  const pojo1 = {
    foo: 'Foo',
    bar: 'Bar',
  };

  const inversePojo1 = {
    bar: 'Bar',
    foo: 'Foo',
  };

  const pojo2 = {
    baz: 'baz',
  };

  describe('serialize', () => {
    it('should return the same unique id for the same pojo', () => {
      expect(serialize(entityType, pojo1)).toBe(serialize(entityType, pojo1));
      expect(serialize(entityType, pojo1)).toBe(serialize(entityType, inversePojo1));
    });

    it('should return a different unique id for different pojos', () => {
      expect(serialize(entityType, pojo1)).not.toBe(serialize(entityType, pojo2));
    });
  });

  describe('unserialize', () => {
    it('should recover the serialized object', () => {
      expect(unserialize(serialize(entityType, pojo1))).toEqual(pojo1);
      expect(unserialize(serialize(entityType, inversePojo1))).toEqual(pojo1);
    });

    const errorMsg = 'Wrong ID format';

    it('should throw an error if the argument has an incorrect format', () => {
      expect(() => unserialize('unformatted')).toThrowError(errorMsg);
    });

    it('should throw an error if the serialized string is not valid JSON', () => {
      const fakeSerialized = Buffer.from('someEntity:nonJsonString').toString('base64');
      expect(() => unserialize(fakeSerialized)).toThrowError(errorMsg);
    });
  });
});

describe('getDid', () => {
  let context: Context;
  let did: string;

  beforeAll(() => {
    dsMockUtils.initMocks();
    did = 'aDid';
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  it('should extract the DID from an Identity', async () => {
    entityMockUtils.initMocks();
    const result = await getDid(entityMockUtils.getIdentityInstance({ did }), context);

    expect(result).toBe(did);
  });

  it('should return the passed DID', async () => {
    const result = await getDid(did, context);

    expect(result).toBe(did);
  });

  it('should return the signing Identity DID if nothing is passed', async () => {
    const result = await getDid(undefined, context);

    expect(result).toBe((await context.getSigningIdentity()).did);
  });
});

describe('asAccount', () => {
  let context: Context;
  let address: string;
  let account: Account;

  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();
    address = 'someAddress';
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
    account = new Account({ address }, context);
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  it('should return Account for given address', async () => {
    const result = asAccount(address, context);

    expect(result).toEqual(expect.objectContaining({ address }));
  });

  it('should return the passed Account', async () => {
    const result = asAccount(account, context);

    expect(result).toBe(account);
  });
});

describe('filterEventRecords', () => {
  const filterRecordsStub = sinon.stub();
  const mockReceipt = {
    filterRecords: filterRecordsStub,
  } as unknown as ISubmittableResult;

  afterEach(() => {
    filterRecordsStub.reset();
  });

  it('should return the corresponding Event Record', () => {
    const mod = 'asset';
    const eventName = 'TickerRegistered';
    const fakeResult = 'event';
    filterRecordsStub.withArgs(mod, eventName).returns([{ event: fakeResult }]);

    const eventRecord = filterEventRecords(mockReceipt, mod, eventName);

    expect(eventRecord[0]).toBe(fakeResult);
  });

  it("should throw an error if the Event wasn't fired", () => {
    const mod = 'asset';
    const eventName = 'TickerRegistered';
    filterRecordsStub.withArgs(mod, eventName).returns([]);

    expect(() => filterEventRecords(mockReceipt, mod, eventName)).toThrow(
      `Event "${mod}.${eventName}" wasn't fired even though the corresponding transaction was completed. Please report this to the Polymesh team`
    );
  });
});

describe('sliceBatchReceipt', () => {
  const filterRecordsStub = sinon.stub();
  const mockReceipt = {
    filterRecords: filterRecordsStub,
    events: ['tx0event0', 'tx0event1', 'tx1event0', 'tx2event0', 'tx2event1', 'tx2event2'],
    findRecord: sinon.stub(),
    toHuman: sinon.stub(),
  } as unknown as ISubmittableResult;

  beforeEach(() => {
    filterRecordsStub.withArgs('utility', 'BatchCompleted').returns([
      {
        event: {
          data: [
            [
              dsMockUtils.createMockU32(new BigNumber(2)),
              dsMockUtils.createMockU32(new BigNumber(1)),
              dsMockUtils.createMockU32(new BigNumber(3)),
            ],
          ],
        },
      },
    ]);
  });

  afterEach(() => {
    filterRecordsStub.reset();
  });

  it('should return the cloned receipt with a subset of events', () => {
    let slicedReceipt = sliceBatchReceipt(mockReceipt, 1, 3);

    expect(slicedReceipt.events).toEqual(['tx1event0', 'tx2event0', 'tx2event1', 'tx2event2']);

    slicedReceipt = sliceBatchReceipt(mockReceipt, 0, 2);

    expect(slicedReceipt.events).toEqual(['tx0event0', 'tx0event1', 'tx1event0']);
  });

  it('should throw an error if the transaction indexes are out of bounds', () => {
    expect(() => sliceBatchReceipt(mockReceipt, -1, 2)).toThrow(
      'Transaction index range out of bounds. Please report this to the Polymesh team'
    );

    expect(() => sliceBatchReceipt(mockReceipt, 1, 4)).toThrow(
      'Transaction index range out of bounds. Please report this to the Polymesh team'
    );
  });
});

describe('mergeReceipts', () => {
  let bigNumberToU32Stub: sinon.SinonStub;
  let receipts: ISubmittableResult[];
  let context: Context;

  let eventsPerTransaction: u32[];

  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
    eventsPerTransaction = [
      dsMockUtils.createMockU32(new BigNumber(2)),
      dsMockUtils.createMockU32(new BigNumber(1)),
      dsMockUtils.createMockU32(new BigNumber(3)),
    ];
    bigNumberToU32Stub = sinon.stub(utilsConversionModule, 'bigNumberToU32');
    bigNumberToU32Stub.withArgs(new BigNumber(2), context).returns(eventsPerTransaction[0]);
    bigNumberToU32Stub.withArgs(new BigNumber(1), context).returns(eventsPerTransaction[1]);
    bigNumberToU32Stub.withArgs(new BigNumber(3), context).returns(eventsPerTransaction[2]);

    receipts = [
      {
        filterRecords: sinon.stub(),
        events: ['tx0event0', 'tx0event1'],
        findRecord: sinon.stub(),
        toHuman: sinon.stub(),
      },
      {
        filterRecords: sinon.stub(),
        events: ['tx1event0'],
        findRecord: sinon.stub(),
        toHuman: sinon.stub(),
      },
      {
        filterRecords: sinon.stub(),
        events: ['tx2event0', 'tx2event1', 'tx2event2'],
        findRecord: sinon.stub(),
        toHuman: sinon.stub(),
      },
    ] as unknown as ISubmittableResult[];
  });

  afterEach(() => {
    dsMockUtils.reset();
    sinon.restore();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  it('should return a receipt with all the combined events in order', () => {
    const result = mergeReceipts(receipts, context);

    expect(result.events).toEqual([
      'tx0event0',
      'tx0event1',
      'tx1event0',
      'tx2event0',
      'tx2event1',
      'tx2event2',
      {
        event: {
          section: 'utility',
          method: 'BatchCompleted',
          data: [eventsPerTransaction],
        },
      },
    ]);
  });
});

describe('createClaim', () => {
  it('should create Claim objects from claims data provided by middleware', () => {
    let type = 'Jurisdiction';
    const jurisdiction = 'CL';
    let scope = { type: ClaimScopeTypeEnum.Identity, value: 'someScope' };

    let result = createClaim(type, jurisdiction, scope, null, undefined);
    expect(result).toEqual({
      type: ClaimType.Jurisdiction,
      code: CountryCode.Cl,
      scope,
    });

    type = 'BuyLockup';
    scope = { type: ClaimScopeTypeEnum.Identity, value: 'someScope' };

    result = createClaim(type, null, scope, null, undefined);
    expect(result).toEqual({
      type: ClaimType.BuyLockup,
      scope,
    });

    type = 'NoData';

    result = createClaim(type, null, null, null, undefined);
    expect(result).toEqual({
      type: ClaimType.NoData,
    });

    type = 'CustomerDueDiligence';
    const id = 'someId';

    result = createClaim(type, null, null, id, undefined);
    expect(result).toEqual({
      type: ClaimType.CustomerDueDiligence,
      id,
    });

    type = 'InvestorUniqueness';
    scope = { type: ClaimScopeTypeEnum.Ticker, value: 'SOME_TICKER' };

    result = createClaim(type, null, scope, id, undefined);
    expect(result).toEqual({
      type: ClaimType.InvestorUniqueness,
      scope: scope,
      cddId: id,
    });

    type = 'InvestorUniquenessV2';

    result = createClaim(type, null, null, id, undefined);
    expect(result).toEqual({
      type: ClaimType.InvestorUniquenessV2,
      cddId: id,
    });
  });
});

describe('padString', () => {
  it('should pad a string on the right side to cover the supplied length', () => {
    const value = 'someString';
    const fakeResult = `${value}\0\0`;

    const result = padString(value, 12);

    expect(result).toBe(fakeResult);
  });
});

describe('removePadding', () => {
  it('should remove all null character padding from the input', () => {
    const expected = 'someString';

    const result = removePadding(`${expected}\0\0\0`);

    expect(result).toBe(expected);
  });
});

describe('requestPaginated', () => {
  it('should fetch and return entries and the hex value of the last key', async () => {
    const queryStub = dsMockUtils.createQueryStub('asset', 'tickers', {
      entries: [
        tuple(['ticker0'], dsMockUtils.createMockU32(new BigNumber(0))),
        tuple(['ticker1'], dsMockUtils.createMockU32(new BigNumber(1))),
        tuple(['ticker2'], dsMockUtils.createMockU32(new BigNumber(2))),
      ],
    });

    let res = await requestPaginated(queryStub, {
      paginationOpts: undefined,
    });

    expect(res.lastKey).toBeNull();
    sinon.assert.calledOnce(queryStub.entries);

    sinon.resetHistory();

    res = await requestPaginated(queryStub, {
      paginationOpts: { size: new BigNumber(3) },
    });

    expect(typeof res.lastKey).toBe('string');
    sinon.assert.calledOnce(queryStub.entriesPaged);

    sinon.resetHistory();

    res = await requestPaginated(queryStub, {
      paginationOpts: { size: new BigNumber(4) },
      arg: 'something',
    });

    expect(res.lastKey).toBeNull();
    sinon.assert.calledOnce(queryStub.entriesPaged);
  });
});

describe('requestAtBlock', () => {
  it('should fetch and return the value at a certain block (current if left empty)', async () => {
    const context = dsMockUtils.getContextInstance({
      isArchiveNode: true,
    });
    const returnValue = dsMockUtils.createMockU32(new BigNumber(5));
    const queryStub = dsMockUtils.createQueryStub('asset', 'tickers', {
      returnValue,
    });

    const blockHash = 'someBlockHash';
    const ticker = 'ticker';

    let res = await requestAtBlock(
      queryStub,
      {
        blockHash,
        args: [ticker],
      },
      context
    );

    sinon.assert.calledWith(queryStub.at, blockHash, ticker);
    expect(res).toBe(returnValue);

    res = await requestAtBlock(
      queryStub,
      {
        args: [ticker],
      },
      context
    );

    sinon.assert.calledWith(queryStub, ticker);
    expect(res).toBe(returnValue);
  });

  it('should throw an error if the node is not archive', () => {
    const context = dsMockUtils.getContextInstance({
      isArchiveNode: false,
    });

    const queryStub = dsMockUtils.createQueryStub('asset', 'tickers', {
      returnValue: dsMockUtils.createMockU32(new BigNumber(5)),
    });

    return expect(
      requestAtBlock(
        queryStub,
        {
          blockHash: 'someBlockHash',
          args: ['ticker'],
        },
        context
      )
    ).rejects.toThrow('Cannot query previous blocks in a non-archive node');
  });
});

describe('calculateNextKey', () => {
  it('should return NextKey null as there are less elements than the default page size', () => {
    const totalCount = new BigNumber(20);
    const nextKey = calculateNextKey(totalCount);

    expect(nextKey).toBeNull();
  });

  it('should return NextKey null as it is the last page', () => {
    const totalCount = new BigNumber(50);
    const currentPageSize = new BigNumber(30);
    const currentStart = new BigNumber(31);
    const nextKey = calculateNextKey(totalCount, currentPageSize, currentStart);

    expect(nextKey).toBeNull();
  });

  it('should return NextKey', () => {
    const totalCount = new BigNumber(50);
    const currentPageSize = new BigNumber(30);
    const currentStart = new BigNumber(0);
    const nextKey = calculateNextKey(totalCount, currentPageSize, currentStart);

    expect(nextKey).toEqual(new BigNumber(30));
  });
});

describe('isPrintableAscii', () => {
  it('should return true if the string only contains printable ASCII characters', () => {
    expect(isPrintableAscii('TICKER')).toBe(true);
  });

  it("should return false if the string doesn't contain only printable ASCII characters", () => {
    expect(isPrintableAscii(String.fromCharCode(10000000))).toBe(false);
  });
});

describe('createProcedureMethod', () => {
  let context: Context;

  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  it('should return a ProcedureMethod object', async () => {
    const prepare = sinon.stub();
    const checkAuthorization = sinon.stub();
    const transformer = sinon.stub();
    const fakeProcedure = (): Procedure<number, void> =>
      ({
        prepare,
        checkAuthorization,
      } as unknown as Procedure<number, void>);

    const method: ProcedureMethod<number, void> = createProcedureMethod(
      { getProcedureAndArgs: args => [fakeProcedure, args], transformer },
      context
    );

    const procArgs = 1;
    await method(procArgs);

    sinon.assert.calledWithExactly(prepare, { args: procArgs, transformer }, context, {});

    await method.checkAuthorization(procArgs);

    sinon.assert.calledWithExactly(checkAuthorization, procArgs, context, {});
  });

  it('should return a NoArgsProcedureMethod object', async () => {
    const prepare = sinon.stub();
    const checkAuthorization = sinon.stub();
    const transformer = sinon.stub();
    const fakeProcedure = (): Procedure<void, void> =>
      ({
        prepare,
        checkAuthorization,
      } as unknown as Procedure<void, void>);

    const method = createProcedureMethod(
      { getProcedureAndArgs: () => [fakeProcedure, undefined], transformer, voidArgs: true },
      context
    );

    await method();

    sinon.assert.calledWithExactly(prepare, { transformer, args: undefined }, context, {});

    await method.checkAuthorization();

    sinon.assert.calledWithExactly(checkAuthorization, undefined, context, {});
  });
});

describe('assertIsInteger', () => {
  it('should not throw if the argument is an integer', async () => {
    try {
      assertIsInteger(new BigNumber(1));
    } catch (_) {
      expect(true).toBe(false);
    }
  });

  it('should throw an error if the argument is not an integer', async () => {
    expect(() => assertIsInteger(new BigNumber('noInteger'))).toThrow(
      'The number must be an integer'
    );

    expect(() => assertIsInteger(new BigNumber(1.2))).toThrow('The number must be an integer');
  });
});

describe('assertIsPositive', () => {
  it('should not throw an error if the argument is positive', () => {
    expect(() => assertIsPositive(new BigNumber(43))).not.toThrow();
  });
  it('should throw an error if the argument is negative', async () => {
    expect(() => assertIsPositive(new BigNumber(-3))).toThrow('The number must be positive');
  });
});

describe('assertAddressValid', () => {
  const ss58Format = new BigNumber(42);

  it('should throw an error if the address is not a valid ss58 address', async () => {
    expect(() =>
      // cSpell: disable-next-line
      assertAddressValid('foo', ss58Format)
    ).toThrow('The supplied address is not a valid SS58 address');
  });

  it('should throw an error if the address is prefixed with an invalid ss58', async () => {
    expect(() =>
      // cSpell: disable-next-line
      assertAddressValid('ajYMsCKsEAhEvHpeA4XqsfiA9v1CdzZPrCfS6pEfeGHW9j8', ss58Format)
    ).toThrow("The supplied address is not encoded with the chain's SS58 format");
  });

  it('should not throw if the address is valid and prefixed with valid ss58', async () => {
    expect(() =>
      assertAddressValid('5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY', ss58Format)
    ).not.toThrow();
  });
});

describe('asTicker', () => {
  it('should return an Asset symbol', async () => {
    const symbol = 'ASSET';
    let result = asTicker(symbol);

    expect(result).toBe(symbol);

    result = asTicker(new Asset({ ticker: symbol }, dsMockUtils.getContextInstance()));
    expect(result).toBe(symbol);
  });
});

describe('periodComplexity', () => {
  it('should calculate complexity for any period', () => {
    const period: CalendarPeriod = {
      unit: CalendarUnit.Second,
      amount: new BigNumber(1),
    };
    let result = periodComplexity(period);
    expect(result).toEqual(new BigNumber(31536000));

    period.unit = CalendarUnit.Minute;
    result = periodComplexity(period);
    expect(result).toEqual(new BigNumber(525600));

    period.unit = CalendarUnit.Hour;
    result = periodComplexity(period);
    expect(result).toEqual(new BigNumber(8760));

    period.unit = CalendarUnit.Day;
    result = periodComplexity(period);
    expect(result).toEqual(new BigNumber(365));

    period.unit = CalendarUnit.Week;
    result = periodComplexity(period);
    expect(result).toEqual(new BigNumber(52));

    period.unit = CalendarUnit.Month;
    result = periodComplexity(period);
    expect(result).toEqual(new BigNumber(12));

    period.unit = CalendarUnit.Year;
    result = periodComplexity(period);
    expect(result).toEqual(new BigNumber(2));

    period.amount = new BigNumber(0);
    result = periodComplexity(period);
    expect(result).toEqual(new BigNumber(1));
  });
});

describe('optionize', () => {
  it('should transform a conversion util into a version that returns null if the first input is falsy, passing along the rest if not', () => {
    const number = new BigNumber(1);

    const toString = (value: BigNumber, foo: string, bar: number): string =>
      `${value.toString()}${foo}${bar}`;

    let result = optionize(toString)(number, 'notNeeded', 1);
    expect(result).toBe(toString(number, 'notNeeded', 1));

    result = optionize(toString)(null, 'stillNotNeeded', 2);
    expect(result).toBeNull();
  });
});

describe('isModuleOrTagMatch', () => {
  it("should return true if two tags/modules are equal, or if one is the other one's module", () => {
    let result = isModuleOrTagMatch(TxTags.identity.AddInvestorUniquenessClaim, ModuleName.Sto);
    expect(result).toEqual(false);

    result = isModuleOrTagMatch(ModuleName.Sto, TxTags.identity.AddInvestorUniquenessClaim);
    expect(result).toEqual(false);

    result = isModuleOrTagMatch(
      TxTags.identity.AddInvestorUniquenessClaim,
      TxTags.identity.AddClaim
    );
    expect(result).toEqual(false);
  });
});

describe('getCheckpointValue', () => {
  let context: Context;

  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  it('should return value as it is for valid params of type Checkpoint, CheckpointSchedule or Date', async () => {
    const mockCheckpointSchedule = entityMockUtils.getCheckpointScheduleInstance();
    const mockAsset = entityMockUtils.getAssetInstance();
    let result = await getCheckpointValue(mockCheckpointSchedule, mockAsset, context);
    expect(result).toEqual(mockCheckpointSchedule);

    const mockCheckpoint = entityMockUtils.getCheckpointInstance();
    result = await getCheckpointValue(mockCheckpoint, mockAsset, context);
    expect(result).toEqual(mockCheckpoint);

    const mockCheckpointDate = new Date();
    result = await getCheckpointValue(mockCheckpointDate, mockAsset, context);
    expect(result).toEqual(mockCheckpointDate);
  });

  it('should return Checkpoint instance for params with type `Existing`', async () => {
    const mockCheckpoint = entityMockUtils.getCheckpointInstance();
    const mockCaCheckpointTypeParams = {
      id: new BigNumber(1),
      type: CaCheckpointType.Existing,
    };
    const mockAsset = entityMockUtils.getAssetInstance({
      checkpointsGetOne: mockCheckpoint,
    });

    const result = await getCheckpointValue(mockCaCheckpointTypeParams, mockAsset, context);
    expect(result).toEqual(mockCheckpoint);
  });

  it('should return Checkpoint instance for params with type `Scheduled`', async () => {
    const mockCheckpointSchedule = entityMockUtils.getCheckpointScheduleInstance();
    const mockCaCheckpointTypeParams = {
      id: new BigNumber(1),
      type: CaCheckpointType.Schedule,
    };
    const mockAsset = entityMockUtils.getAssetInstance({
      checkpointsSchedulesGetOne: { schedule: mockCheckpointSchedule },
    });

    const result = await getCheckpointValue(mockCaCheckpointTypeParams, mockAsset, context);
    expect(result).toEqual(mockCheckpointSchedule);
  });
});

describe('hasSameElements', () => {
  it('should use provided comparator for matching the elements ', () => {
    let result = hasSameElements(
      [
        { id: 1, name: 'X' },
        { id: 2, name: 'Y' },
      ],
      [
        { id: 1, name: 'X' },
        { id: 2, name: 'Z' },
      ],
      (a, b) => a.id === b.id
    );
    expect(result).toEqual(true);

    result = hasSameElements(
      [
        { id: 1, name: 'X' },
        { id: 2, name: 'Y' },
      ],
      [
        { id: 1, name: 'X' },
        { id: 3, name: 'Z' },
      ],
      (a, b) => a.id === b.id
    );
    expect(result).toEqual(false);
  });

  it('should use the lodash `isEqual` if no comparator is provided', () => {
    let result = hasSameElements([1, 2], [2, 1]);
    expect(result).toEqual(true);

    result = hasSameElements([1, 2], [2, 3]);
    expect(result).toEqual(false);
  });
});

describe('getPortfolioIdsByName', () => {
  let context: Context;
  let portfoliosStub: sinon.SinonStub;
  let firstPortfolioName: MockCodec<Bytes>;
  let rawNames: Bytes[];
  let identityId: IdentityId;

  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
    firstPortfolioName = dsMockUtils.createMockBytes('someName');
    rawNames = [firstPortfolioName, dsMockUtils.createMockBytes('otherName')];
    identityId = dsMockUtils.createMockIdentityId('someDid');
    dsMockUtils.createQueryStub('portfolio', 'nameToNumber', {
      multi: [
        dsMockUtils.createMockU64(new BigNumber(1)),
        dsMockUtils.createMockU64(new BigNumber(2)),
        dsMockUtils.createMockU64(new BigNumber(1)),
        dsMockUtils.createMockU64(new BigNumber(1)),
      ],
    });
    portfoliosStub = dsMockUtils.createQueryStub('portfolio', 'portfolios');
  });

  afterEach(() => {
    dsMockUtils.reset();
    entityMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  it('should return portfolio numbers for given portfolio name, and null for names that do not exist', async () => {
    portfoliosStub.resolves(firstPortfolioName);
    firstPortfolioName.eq = sinon.stub();
    firstPortfolioName.eq.withArgs(rawNames[0]).returns(true);
    const result = await getPortfolioIdsByName(
      identityId,
      [
        ...rawNames,
        dsMockUtils.createMockBytes('anotherName'),
        dsMockUtils.createMockBytes('yetAnotherName'),
      ],
      context
    );

    expect(result).toEqual([new BigNumber(1), new BigNumber(2), null, null]);
  });
});

describe('getIdentity', () => {
  let context: Context;

  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
  });

  afterEach(() => {
    dsMockUtils.reset();
    entityMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  it('should return currentIdentity when given undefined value', async () => {
    const expectedIdentity = await context.getSigningIdentity();
    const result = await getIdentity(undefined, context);
    expect(result).toEqual(expectedIdentity);
  });

  it('should return an Identity if given an Identity', async () => {
    const identity = entityMockUtils.getIdentityInstance();
    const result = await getIdentity(identity, context);
    expect(result).toEqual(identity);
  });

  it('should return the Identity given its DID', async () => {
    const identity = entityMockUtils.getIdentityInstance();
    const result = await getIdentity(identity.did, context);
    expect(result.did).toEqual(identity.did);
  });
});

describe('getExemptedIds', () => {
  let context: Context;

  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
  });

  afterEach(() => {
    dsMockUtils.reset();
    entityMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  it('should return a list of DIDs if the Asset does not support PUIS', async () => {
    const asset = entityMockUtils.getAssetInstance({
      details: { requiresInvestorUniqueness: false },
    });
    const dids = ['someDid', 'otherDid'];

    const result = await getExemptedIds(dids, context, asset.ticker);

    expect(result).toEqual(dids);
  });

  it('should return a list of Scope IDs if the Asset supports PUIS', async () => {
    entityMockUtils.configureMocks({
      assetOptions: {
        details: {
          requiresInvestorUniqueness: true,
        },
      },
    });
    const scopeIds = ['someScopeId', 'otherScopeId'];
    const identities = scopeIds.map(scopeId =>
      entityMockUtils.getIdentityInstance({ getScopeId: scopeId })
    );

    const result = await getExemptedIds(identities, context, 'SOME_TICKER');

    expect(result).toEqual(scopeIds);
  });

  it('should throw an error if one or more of the passed Identities have no Scope ID for the Asset', () => {
    entityMockUtils.configureMocks({
      assetOptions: {
        details: {
          requiresInvestorUniqueness: true,
        },
      },
    });
    const scopeIds = ['someScopeId', null];
    const identities = scopeIds.map(scopeId =>
      entityMockUtils.getIdentityInstance({ getScopeId: scopeId })
    );

    return expect(getExemptedIds(identities, context, 'SOME_TICKER')).rejects.toThrow(
      'Identities must have an Investor Uniqueness claim Scope ID in order to be exempted from Transfer Restrictions for Asset "SOME_TICKER"'
    );
  });

  it('should throw an error if the exempted IDs have duplicates', () => {
    const asset = entityMockUtils.getAssetInstance({
      details: { requiresInvestorUniqueness: false },
    });
    const dids = ['someDid', 'someDid'];

    return expect(getExemptedIds(dids, context, asset.ticker)).rejects.toThrow(
      'One or more of the passed exempted Identities are repeated or have the same Scope ID'
    );
  });
});

describe('assertExpectedChainVersion', () => {
  let client: MockWebSocket;
  let warnStub: sinon.SinonStub;

  beforeAll(() => {
    dsMockUtils.initMocks();
    warnStub = sinon.stub(console, 'warn');
  });

  beforeEach(() => {
    client = getWebSocketInstance();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    warnStub.restore();
  });

  it('should resolve if it receives both expected RPC node and chain spec version', () => {
    const signal = assertExpectedChainVersion('ws://example.com');
    client.onopen();

    return expect(signal).resolves.not.toThrow();
  });

  it('should throw an error given a major RPC node version mismatch', () => {
    const signal = assertExpectedChainVersion('ws://example.com');
    client.sendRpcVersion('3.0.0');
    const expectedError = new PolymeshError({
      code: ErrorCode.FatalError,
      message: 'Unsupported Polymesh RPC node version. Please upgrade the SDK',
    });
    return expect(signal).rejects.toThrowError(expectedError);
  });

  it('should log a warning given a minor or patch RPC node version mismatch', async () => {
    const signal = assertExpectedChainVersion('ws://example.com');
    client.sendSpecVersion('5001000');
    client.sendRpcVersion('5.1.7');
    await signal;
    sinon.assert.calledWith(
      warnStub,
      'This version of the SDK supports Polymesh RPC node version 5.1.0. The node is at version 5.1.7. Please upgrade the SDK'
    );
  });

  it('should throw an error given a major chain spec version mismatch', () => {
    const signal = assertExpectedChainVersion('ws://example.com');
    client.sendSpecVersion('3000000');
    const expectedError = new PolymeshError({
      code: ErrorCode.FatalError,
      message: 'Unsupported Polymesh chain spec version. Please upgrade the SDK',
    });
    return expect(signal).rejects.toThrowError(expectedError);
  });

  it('should log a warning given a minor or patch chain spec version mismatch', async () => {
    const signal = assertExpectedChainVersion('ws://example.com');
    client.sendSpecVersion('5001007');
    client.sendRpcVersion('5.1.0');
    await signal;
    sinon.assert.calledWith(
      warnStub,
      'This version of the SDK supports Polymesh chain spec version 5.1.2. The chain spec is at version 5.1.7. Please upgrade the SDK'
    );
  });

  it('should throw an error if the node cannot be reached', () => {
    const signal = assertExpectedChainVersion('ws://example.com');
    const expectedError = new PolymeshError({
      code: ErrorCode.FatalError,
      message: 'Could not connect to the Polymesh node at ws://example.com',
    });
    client.triggerError(new Error('could not connect'));
    return expect(signal).rejects.toThrowError(expectedError);
  });
});

describe('assertTickerValid', () => {
  it('should throw an error if the string is empty', () => {
    const ticker = '';

    expect(() => assertTickerValid(ticker)).toThrow(
      `Ticker length must be between 1 and ${MAX_TICKER_LENGTH} character`
    );
  });

  it('should throw an error if the string length exceeds the max ticker length', () => {
    const ticker = 'VERY_LONG_TICKER';

    expect(() => assertTickerValid(ticker)).toThrow(
      `Ticker length must be between 1 and ${MAX_TICKER_LENGTH} character`
    );
  });

  it('should throw an error if the string contains unreadable characters', () => {
    const ticker = `ILLEGAL_${String.fromCharCode(65533)}`;

    expect(() => assertTickerValid(ticker)).toThrow(
      'Only printable ASCII is allowed as ticker name'
    );
  });

  it('should throw an error if the string is not in upper case', () => {
    const ticker = 'FakeTicker';

    expect(() => assertTickerValid(ticker)).toThrow('Ticker cannot contain lower case letters');
  });

  it('should not throw an error', () => {
    const ticker = 'FAKE_TICKER';

    assertTickerValid(ticker);
  });
});

describe('neededStatTypeForRestrictionInput', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  it('should return a raw StatType based on the given TransferRestrictionType', () => {
    const context = dsMockUtils.getContextInstance();
    const mockClaimIssuer: [
      PolymeshPrimitivesIdentityClaimClaimType,
      PolymeshPrimitivesIdentityId
    ] = [dsMockUtils.createMockClaimType(), dsMockUtils.createMockIdentityId()];

    sinon.stub(utilsConversionModule, 'claimIssuerToMeshClaimIssuer').returns(mockClaimIssuer);

    context.createType
      .withArgs('PolymeshPrimitivesStatisticsStatOpType', StatType.Count)
      .returns('Count');
    context.createType
      .withArgs('PolymeshPrimitivesStatisticsStatOpType', StatType.Balance)
      .returns('Balance');

    context.createType
      .withArgs('PolymeshPrimitivesStatisticsStatType', { op: 'Count', claimIssuer: undefined })
      .returns('CountStat');
    context.createType
      .withArgs('PolymeshPrimitivesStatisticsStatType', { op: 'Balance', claimIssuer: undefined })
      .returns('BalanceStat');
    context.createType
      .withArgs('PolymeshPrimitivesStatisticsStatType', {
        op: 'Balance',
        claimIssuer: mockClaimIssuer,
      })
      .returns('ScopedBalanceStat');

    let result = neededStatTypeForRestrictionInput(
      { type: TransferRestrictionType.Count },
      context
    );

    expect(result).toEqual('CountStat');

    result = neededStatTypeForRestrictionInput(
      { type: TransferRestrictionType.Percentage },
      context
    );
    expect(result).toEqual('BalanceStat');

    result = neededStatTypeForRestrictionInput(
      {
        type: TransferRestrictionType.ClaimPercentage,
        claimIssuer: {
          claimType: ClaimType.Jurisdiction,
          issuer: entityMockUtils.getIdentityInstance(),
        },
      },
      context
    );
    expect(result).toEqual('ScopedBalanceStat');
  });
});

describe('compareTransferRestrictionToInput', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  it('should return true when the input matches the TransferRestriction type', () => {
    const countTransferRestriction = dsMockUtils.createMockTransferCondition({
      MaxInvestorCount: dsMockUtils.createMockU64(new BigNumber(10)),
    });
    let result = compareTransferRestrictionToInput(countTransferRestriction, {
      type: TransferRestrictionType.Count,
      value: new BigNumber(10),
    });
    expect(result).toEqual(true);

    const percentTransferRestriction = dsMockUtils.createMockTransferCondition({
      MaxInvestorOwnership: dsMockUtils.createMockPermill(new BigNumber(100000)),
    });

    result = compareTransferRestrictionToInput(percentTransferRestriction, {
      type: TransferRestrictionType.Percentage,
      value: new BigNumber(10),
    });
    expect(result).toEqual(true);

    const claimCountTransferRestriction = dsMockUtils.createMockTransferCondition({
      ClaimCount: [
        dsMockUtils.createMockStatisticsStatClaim({ Accredited: dsMockUtils.createMockBool(true) }),
        dsMockUtils.createMockIdentityId('someDid'),
        dsMockUtils.createMockU64(new BigNumber(10)),
        dsMockUtils.createMockOption(),
      ],
    });

    result = compareTransferRestrictionToInput(claimCountTransferRestriction, {
      value: {
        min: new BigNumber(10),
        claim: { type: ClaimType.Accredited, accredited: true },
        issuer: entityMockUtils.getIdentityInstance({ did: 'someDid' }),
      },
      type: TransferRestrictionType.ClaimCount,
    });

    expect(result).toEqual(true);

    const claimCountTransferRestrictionWithMax = dsMockUtils.createMockTransferCondition({
      ClaimCount: [
        dsMockUtils.createMockStatisticsStatClaim({ Affiliate: dsMockUtils.createMockBool(true) }),
        dsMockUtils.createMockIdentityId('someDid'),
        dsMockUtils.createMockU64(new BigNumber(10)),
        dsMockUtils.createMockOption(dsMockUtils.createMockU64(new BigNumber(20))),
      ],
    });

    result = compareTransferRestrictionToInput(claimCountTransferRestrictionWithMax, {
      value: {
        min: new BigNumber(10),
        max: new BigNumber(20),
        claim: { type: ClaimType.Affiliate, affiliate: true },
        issuer: entityMockUtils.getIdentityInstance({ did: 'someDid' }),
      },
      type: TransferRestrictionType.ClaimCount,
    });

    expect(result).toEqual(true);

    const claimPercentageTransferRestriction = dsMockUtils.createMockTransferCondition({
      ClaimOwnership: [
        dsMockUtils.createMockStatisticsStatClaim({
          Jurisdiction: dsMockUtils.createMockOption(
            dsMockUtils.createMockCountryCode(CountryCode.Ca)
          ),
        }),
        dsMockUtils.createMockIdentityId('someDid'),
        dsMockUtils.createMockPermill(new BigNumber(100000)),
        dsMockUtils.createMockPermill(new BigNumber(200000)),
      ],
    });

    result = compareTransferRestrictionToInput(claimPercentageTransferRestriction, {
      value: {
        min: new BigNumber(10),
        max: new BigNumber(20),
        claim: { type: ClaimType.Jurisdiction, countryCode: CountryCode.Ca },
        issuer: entityMockUtils.getIdentityInstance({ did: 'someDid' }),
      },
      type: TransferRestrictionType.ClaimPercentage,
    });

    expect(result).toEqual(true);
  });

  it('should return false if things do not match', () => {
    const claimCountTransferRestrictionWithMax = dsMockUtils.createMockTransferCondition({
      ClaimCount: [
        dsMockUtils.createMockStatisticsStatClaim({ Affiliate: dsMockUtils.createMockBool(true) }),
        dsMockUtils.createMockIdentityId('someDid'),
        dsMockUtils.createMockU64(new BigNumber(10)),
        dsMockUtils.createMockOption(dsMockUtils.createMockU64(new BigNumber(20))),
      ],
    });

    let result = compareTransferRestrictionToInput(claimCountTransferRestrictionWithMax, {
      value: {
        min: new BigNumber(10),
        max: new BigNumber(21),
        claim: { type: ClaimType.Affiliate, affiliate: true },
        issuer: entityMockUtils.getIdentityInstance({ did: 'someDid' }),
      },
      type: TransferRestrictionType.ClaimCount,
    });

    expect(result).toEqual(false);

    const claimPercentageTransferRestrictionNoMax = dsMockUtils.createMockTransferCondition({
      ClaimCount: [
        dsMockUtils.createMockStatisticsStatClaim({
          Accredited: dsMockUtils.createMockBool(true),
        }),
        dsMockUtils.createMockIdentityId('someDid'),
        dsMockUtils.createMockU64(new BigNumber(10)),
        dsMockUtils.createMockOption(),
      ],
    });

    result = compareTransferRestrictionToInput(claimPercentageTransferRestrictionNoMax, {
      value: {
        min: new BigNumber(10),
        max: new BigNumber(20),
        claim: { type: ClaimType.Affiliate, affiliate: true },
        issuer: entityMockUtils.getIdentityInstance({ did: 'someDid' }),
      },
      type: TransferRestrictionType.ClaimCount,
    });

    expect(result).toEqual(false);

    const claimPercentageTransferRestriction = dsMockUtils.createMockTransferCondition({
      ClaimOwnership: [
        dsMockUtils.createMockStatisticsStatClaim({
          Jurisdiction: dsMockUtils.createMockOption(
            dsMockUtils.createMockCountryCode(CountryCode.Ca)
          ),
        }),
        dsMockUtils.createMockIdentityId('someDid'),
        dsMockUtils.createMockPermill(new BigNumber(100000)),
        dsMockUtils.createMockPermill(new BigNumber(200000)),
      ],
    });

    result = compareTransferRestrictionToInput(claimPercentageTransferRestriction, {
      value: {
        min: new BigNumber(10),
        max: new BigNumber(21),
        claim: { type: ClaimType.Jurisdiction, countryCode: CountryCode.Ca },
        issuer: entityMockUtils.getIdentityInstance({ did: 'someDid' }),
      },
      type: TransferRestrictionType.ClaimPercentage,
    });

    expect(result).toEqual(false);

    result = compareTransferRestrictionToInput(claimPercentageTransferRestriction, {
      value: {
        min: new BigNumber(10),
        max: new BigNumber(21),
        claim: { type: ClaimType.Jurisdiction, countryCode: CountryCode.Ca },
        issuer: entityMockUtils.getIdentityInstance({ did: 'someDid' }),
      },
      type: TransferRestrictionType.ClaimPercentage,
    });

    expect(result).toEqual(false);
  });
});

describe('compareStatTypeToTransferRestrictionType', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });
  const did = 'someDid';
  const issuerId = dsMockUtils.createMockIdentityId(did);

  const countStatType = dsMockUtils.createMockStatisticsStatType({
    op: dsMockUtils.createMockStatisticsOpType(StatType.Count),
    claimIssuer: dsMockUtils.createMockOption(),
  });
  const percentStatType = dsMockUtils.createMockStatisticsStatType({
    op: dsMockUtils.createMockStatisticsOpType(StatType.Balance),
    claimIssuer: dsMockUtils.createMockOption(),
  });

  const claimCountStat = dsMockUtils.createMockStatisticsStatType({
    op: dsMockUtils.createMockStatisticsOpType(StatType.Count),
    claimIssuer: dsMockUtils.createMockOption([
      dsMockUtils.createMockClaimType(ClaimType.Affiliate),
      issuerId,
    ]),
  });
  const claimPercentageStat = dsMockUtils.createMockStatisticsStatType({
    op: dsMockUtils.createMockStatisticsOpType(StatType.Balance),
    claimIssuer: dsMockUtils.createMockOption([
      dsMockUtils.createMockClaimType(ClaimType.Affiliate),
      issuerId,
    ]),
  });

  it('should return true if the PolymeshPrimitivesStatisticsStatType matches the given TransferRestriction', () => {
    let result = compareStatTypeToTransferRestrictionType(
      countStatType,
      TransferRestrictionType.Count
    );
    expect(result).toEqual(true);

    result = compareStatTypeToTransferRestrictionType(
      percentStatType,
      TransferRestrictionType.Percentage
    );
    expect(result).toEqual(true);

    result = compareStatTypeToTransferRestrictionType(
      claimCountStat,
      TransferRestrictionType.ClaimCount
    );
    expect(result).toEqual(true);

    result = compareStatTypeToTransferRestrictionType(
      claimPercentageStat,
      TransferRestrictionType.ClaimPercentage
    );
    expect(result).toEqual(true);
  });

  it('should return false if the PolymeshPrimitivesStatisticsStatType does not match the given TransferRestriction', () => {
    let result = compareStatTypeToTransferRestrictionType(
      countStatType,
      TransferRestrictionType.Percentage
    );
    expect(result).toEqual(false);

    result = compareStatTypeToTransferRestrictionType(
      percentStatType,
      TransferRestrictionType.Count
    );
    expect(result).toEqual(false);

    result = compareStatTypeToTransferRestrictionType(
      claimCountStat,
      TransferRestrictionType.ClaimPercentage
    );
    expect(result).toEqual(false);

    result = compareStatTypeToTransferRestrictionType(
      claimPercentageStat,
      TransferRestrictionType.ClaimCount
    );
    expect(result).toEqual(false);
  });
});

describe('compareStatsToInput', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  const did = 'someDid';
  const issuer = entityMockUtils.getIdentityInstance({ did });
  const issuerId = dsMockUtils.createMockIdentityId(did);
  const ticker = 'TICKER';

  it('should return true if input matches stat', () => {
    const countStat = dsMockUtils.createMockStatisticsStatType({
      op: dsMockUtils.createMockStatisticsOpType(StatType.Count),
      claimIssuer: dsMockUtils.createMockOption(),
    });

    let args: RemoveAssetStatParams = {
      type: StatType.Count,
      ticker,
    };

    let result = compareStatsToInput(countStat, args);
    expect(result).toEqual(true);

    const percentStat = dsMockUtils.createMockStatisticsStatType({
      op: dsMockUtils.createMockStatisticsOpType(StatType.Balance),
      claimIssuer: dsMockUtils.createMockOption(),
    });
    args = { type: StatType.Balance, ticker };
    result = compareStatsToInput(percentStat, args);
    expect(result).toEqual(true);

    const claimCountStat = dsMockUtils.createMockStatisticsStatType({
      op: dsMockUtils.createMockStatisticsOpType(StatType.Count),
      claimIssuer: dsMockUtils.createMockOption([
        dsMockUtils.createMockClaimType(ClaimType.Affiliate),
        issuerId,
      ]),
    });
    args = {
      type: StatType.ScopedCount,
      issuer,
      claimType: ClaimType.Affiliate,
      ticker,
    };
    result = compareStatsToInput(claimCountStat, args);
    expect(result).toEqual(true);

    const claimPercentageStat = dsMockUtils.createMockStatisticsStatType({
      op: dsMockUtils.createMockStatisticsOpType(StatType.Balance),
      claimIssuer: dsMockUtils.createMockOption([
        dsMockUtils.createMockClaimType(ClaimType.Affiliate),
        issuerId,
      ]),
    });
    args = {
      type: StatType.ScopedBalance,
      issuer,
      claimType: ClaimType.Affiliate,
      ticker,
    };
    result = compareStatsToInput(claimPercentageStat, args);
    expect(result).toEqual(true);
  });

  it('should return false if input does not match the stat', () => {
    const countStat = dsMockUtils.createMockStatisticsStatType({
      op: dsMockUtils.createMockStatisticsOpType(StatType.Count),
      claimIssuer: dsMockUtils.createMockOption(),
    });

    let args: RemoveAssetStatParams = {
      type: StatType.Balance,
      ticker,
    };
    let result = compareStatsToInput(countStat, args);
    expect(result).toEqual(false);

    const percentStat = dsMockUtils.createMockStatisticsStatType({
      op: dsMockUtils.createMockStatisticsOpType(StatType.Balance),
      claimIssuer: dsMockUtils.createMockOption(),
    });
    args = {
      type: StatType.ScopedBalance,
      issuer,
      claimType: ClaimType.Accredited,
      ticker,
    };
    result = compareStatsToInput(percentStat, args);
    expect(result).toEqual(false);

    const claimCountStat = dsMockUtils.createMockStatisticsStatType({
      op: dsMockUtils.createMockStatisticsOpType(StatType.Count),
      claimIssuer: dsMockUtils.createMockOption([
        dsMockUtils.createMockClaimType(ClaimType.Jurisdiction),
        issuerId,
      ]),
    });
    args = {
      type: StatType.ScopedCount,
      issuer,
      claimType: ClaimType.Affiliate,
      ticker,
    };
    result = compareStatsToInput(claimCountStat, args);
    expect(result).toEqual(false);

    args = {
      type: StatType.ScopedCount,
      issuer: entityMockUtils.getIdentityInstance({ did: 'differentDid' }),
      claimType: ClaimType.Jurisdiction,
      ticker,
    };
    result = compareStatsToInput(claimCountStat, args);
    expect(result).toEqual(false);

    result = compareStatsToInput(percentStat, args);
    expect(result).toEqual(false);

    args = {
      type: StatType.Count,
      ticker,
    };

    result = compareStatsToInput(claimCountStat, args);
    expect(result).toEqual(false);
  });
});

describe('compareTransferRestrictionToStat', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });
  const did = 'someDid';
  const min = new BigNumber(10);
  const max = new BigNumber(20);
  const issuer = entityMockUtils.getIdentityInstance({ did });
  const rawMax = dsMockUtils.createMockU64(max);
  const optionMax = dsMockUtils.createMockOption(rawMax);
  const rawMin = dsMockUtils.createMockU64(min);
  const rawIssuerId = dsMockUtils.createMockIdentityId(did);
  const rawClaim = createMockStatisticsStatClaim({ Accredited: dsMockUtils.createMockBool(true) });

  it('should return true when a transfer restriction matches a stat', () => {
    const countCondition = dsMockUtils.createMockTransferCondition({ MaxInvestorCount: rawMax });
    let result = compareTransferRestrictionToStat(countCondition, StatType.Count);
    expect(result).toEqual(true);

    const percentCondition = dsMockUtils.createMockTransferCondition({
      MaxInvestorOwnership: rawMax,
    });
    result = compareTransferRestrictionToStat(percentCondition, StatType.Balance);
    expect(result).toEqual(true);

    const claimCountCondition = dsMockUtils.createMockTransferCondition({
      ClaimCount: [rawClaim, rawIssuerId, rawMin, optionMax],
    });
    result = compareTransferRestrictionToStat(claimCountCondition, StatType.ScopedCount, {
      claimType: ClaimType.Accredited,
      issuer,
    });
    expect(result).toEqual(true);

    const claimPercentageCondition = dsMockUtils.createMockTransferCondition({
      ClaimOwnership: [rawClaim, rawIssuerId, rawMin, rawMax],
    });
    result = compareTransferRestrictionToStat(claimPercentageCondition, StatType.ScopedBalance, {
      claimType: ClaimType.Accredited,
      issuer,
    });
    expect(result).toEqual(true);
  });

  it('should return false when a transfer restriction does not match the given stat', () => {
    const countCondition = dsMockUtils.createMockTransferCondition({ MaxInvestorCount: rawMax });
    let result = compareTransferRestrictionToStat(countCondition, StatType.Balance);
    expect(result).toEqual(false);

    const percentCondition = dsMockUtils.createMockTransferCondition({
      MaxInvestorOwnership: rawMax,
    });
    result = compareTransferRestrictionToStat(percentCondition, StatType.Count);
    expect(result).toEqual(false);

    const claimCountCondition = dsMockUtils.createMockTransferCondition({
      ClaimCount: [rawClaim, rawIssuerId, rawMin, optionMax],
    });
    result = compareTransferRestrictionToStat(claimCountCondition, StatType.ScopedCount, {
      claimType: ClaimType.Affiliate,
      issuer,
    });
    expect(result).toEqual(false);

    const claimPercentageCondition = dsMockUtils.createMockTransferCondition({
      ClaimOwnership: [rawClaim, rawIssuerId, rawMin, rawMax],
    });
    result = compareTransferRestrictionToStat(claimPercentageCondition, StatType.ScopedBalance, {
      claimType: ClaimType.Accredited,
      issuer: entityMockUtils.getIdentityInstance({ did: 'otherDid' }),
    });
    expect(result).toEqual(false);
  });
});

describe('method: getSecondaryAccountPermissions', () => {
  const accountId = 'someAccountId';
  const did = 'someDid';

  let account: Account;
  let fakeResult: PermissionedAccount[];

  let rawPrimaryKeyRecord: PolymeshPrimitivesSecondaryKeyKeyRecord;
  let rawSecondaryKeyRecord: PolymeshPrimitivesSecondaryKeyKeyRecord;
  let rawMultiSigKeyRecord: PolymeshPrimitivesSecondaryKeyKeyRecord;
  let identityIdToStringStub: sinon.SinonStub<[PolymeshPrimitivesIdentityId], string>;
  let stringToAccountIdStub: sinon.SinonStub<[string, Context], AccountId>;
  let meshPermissionsToPermissionsStub: sinon.SinonStub;

  beforeAll(() => {
    dsMockUtils.initMocks();
    account = entityMockUtils.getAccountInstance({ address: accountId });
    meshPermissionsToPermissionsStub = sinon.stub(
      utilsConversionModule,
      'meshPermissionsToPermissions'
    );
    stringToAccountIdStub = sinon.stub(utilsConversionModule, 'stringToAccountId');
    identityIdToStringStub = sinon.stub(utilsConversionModule, 'identityIdToString');
    account = entityMockUtils.getAccountInstance();
    fakeResult = [
      {
        account,
        permissions: {
          assets: null,
          portfolios: null,
          transactions: null,
          transactionGroups: [],
        },
      },
    ];
  });

  afterAll(() => {
    sinon.restore();
    dsMockUtils.cleanup();
  });

  beforeEach(() => {
    rawPrimaryKeyRecord = dsMockUtils.createMockKeyRecord({
      PrimaryKey: dsMockUtils.createMockIdentityId(did),
    });
    rawSecondaryKeyRecord = dsMockUtils.createMockKeyRecord({
      SecondaryKey: [dsMockUtils.createMockIdentityId(did), dsMockUtils.createMockPermissions()],
    });
    rawMultiSigKeyRecord = dsMockUtils.createMockKeyRecord({
      MultiSigSignerKey: dsMockUtils.createMockAccountId('someAddress'),
    });

    meshPermissionsToPermissionsStub.returns({
      assets: null,
      portfolios: null,
      transactions: null,
      transactionGroups: [],
    });
    stringToAccountIdStub.returns(dsMockUtils.createMockAccountId(accountId));
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  it('should return a list of Accounts', async () => {
    const context = dsMockUtils.getContextInstance();
    dsMockUtils.createQueryStub('identity', 'keyRecords', {
      multi: [
        dsMockUtils.createMockOption(rawPrimaryKeyRecord),
        dsMockUtils.createMockOption(rawSecondaryKeyRecord),
        dsMockUtils.createMockOption(rawMultiSigKeyRecord),
      ],
    });
    identityIdToStringStub.returns('someDid');
    const identity = new Identity({ did: 'someDid' }, context);

    const result = await getSecondaryAccountPermissions(
      {
        accounts: [
          entityMockUtils.getAccountInstance(),
          account,
          entityMockUtils.getAccountInstance(),
        ],
        identity,
      },
      context
    );

    expect(result).toEqual(fakeResult);
  });

  it('should filter out Accounts if they do not belong to the given identity', () => {
    const mockContext = dsMockUtils.getContextInstance();
    const otherSecondaryKey = dsMockUtils.createMockKeyRecord({
      SecondaryKey: [dsMockUtils.createMockIdentityId(did), dsMockUtils.createMockPermissions()],
    });
    dsMockUtils.createQueryStub('identity', 'keyRecords', {
      multi: [
        dsMockUtils.createMockOption(rawPrimaryKeyRecord),
        dsMockUtils.createMockOption(otherSecondaryKey),
        dsMockUtils.createMockOption(),
        dsMockUtils.createMockOption(rawMultiSigKeyRecord),
      ],
    });
    identityIdToStringStub.returns('someDid');
    const identity = new Identity({ did: 'otherDid' }, mockContext);

    return expect(
      getSecondaryAccountPermissions(
        {
          accounts: [
            entityMockUtils.getAccountInstance(),
            account,
            entityMockUtils.getAccountInstance(),
          ],
          identity,
        },
        mockContext
      )
    ).resolves.toEqual([]);
  });

  it('should allow for subscription', async () => {
    const mockContext = dsMockUtils.getContextInstance();
    const callback: SubCallback<PermissionedAccount[]> = sinon.stub();
    const unsubCallback = 'unsubCallBack';

    const keyRecordsStub = dsMockUtils.createQueryStub('identity', 'keyRecords');
    keyRecordsStub.multi.yields([
      dsMockUtils.createMockOption(rawPrimaryKeyRecord),
      dsMockUtils.createMockOption(rawSecondaryKeyRecord),
      dsMockUtils.createMockOption(rawMultiSigKeyRecord),
    ]);
    keyRecordsStub.multi.returns(unsubCallback);

    identityIdToStringStub.returns('someDid');
    const identity = new Identity({ did }, mockContext);

    const result = await getSecondaryAccountPermissions(
      {
        accounts: [
          entityMockUtils.getAccountInstance(),
          account,
          entityMockUtils.getAccountInstance(),
        ],
        identity,
      },
      mockContext,
      callback
    );

    sinon.assert.calledWithExactly(callback as sinon.SinonStub, fakeResult);
    expect(result).toEqual(unsubCallback);
  });
});
