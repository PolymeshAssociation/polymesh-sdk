import { Keyring } from '@polkadot/api';
import { ISubmittableResult } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';
import { range } from 'lodash';
import { ModuleName, TxTags } from 'polymesh-types/types';
import sinon from 'sinon';

import { Context, PostTransactionValue, Procedure, SecurityToken } from '~/internal';
import { ClaimScopeTypeEnum } from '~/middleware/types';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';
import {
  CaCheckpointType,
  CalendarPeriod,
  CalendarUnit,
  ClaimType,
  CommonKeyring,
  CountryCode,
  ProcedureMethod,
} from '~/types';
import { tuple } from '~/types/utils';
import { DEFAULT_MAX_BATCH_ELEMENTS, MAX_BATCH_ELEMENTS } from '~/utils/constants';

import {
  assertFormatValid,
  assertIsInteger,
  assertIsPositive,
  assertKeyringFormatValid,
  batchArguments,
  calculateNextKey,
  createClaim,
  createProcedureMethod,
  delay,
  filterEventRecords,
  getCheckpointValue,
  getCommonKeyring,
  getDid,
  getTicker,
  hasSameElements,
  isModuleOrTagMatch,
  isPrintableAscii,
  optionize,
  padString,
  periodComplexity,
  removePadding,
  requestAtBlock,
  requestPaginated,
  serialize,
  unserialize,
  unwrapValue,
  unwrapValues,
} from '../internal';

describe('delay', () => {
  beforeAll(() => {
    jest.useFakeTimers('legacy');
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  test('should resolve after the supplied timeout', () => {
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

  test('serialize returns the same unique id for the same pojo', () => {
    expect(serialize(entityType, pojo1)).toBe(serialize(entityType, pojo1));
    expect(serialize(entityType, pojo1)).toBe(serialize(entityType, inversePojo1));
  });

  test('serialize returns a different unique id for different pojos', () => {
    expect(serialize(entityType, pojo1)).not.toBe(serialize(entityType, pojo2));
  });

  test('unserialize recovers the serialized object', () => {
    expect(unserialize(serialize(entityType, pojo1))).toEqual(pojo1);
    expect(unserialize(serialize(entityType, inversePojo1))).toEqual(pojo1);
  });

  const errorMsg = 'Wrong ID format';

  test('unserialize throws an error if the argument has an incorrect format', () => {
    expect(() => unserialize('unformatted')).toThrowError(errorMsg);
  });

  test('unserialize throws an error if the serialized string is not valid JSON', () => {
    const fakeSerialized = Buffer.from('someEntity:nonJsonString').toString('base64');
    expect(() => unserialize(fakeSerialized)).toThrowError(errorMsg);
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

  test('getDid should extract the DID from an Identity', async () => {
    entityMockUtils.initMocks();
    const result = await getDid(entityMockUtils.getIdentityInstance({ did }), context);

    expect(result).toBe(did);
  });

  test('getDid should return the passed DID', async () => {
    const result = await getDid(did, context);

    expect(result).toBe(did);
  });

  test('getDid should return the current Identity DID if nothing is passed', async () => {
    const result = await getDid(undefined, context);

    expect(result).toBe((await context.getCurrentIdentity()).did);
  });
});

describe('unwrapValue', () => {
  test('should unwrap a Post Transactin Value', async () => {
    const wrapped = new PostTransactionValue(async () => 1);
    await wrapped.run({} as ISubmittableResult);

    const unwrapped = unwrapValue(wrapped);

    expect(unwrapped).toEqual(1);
  });

  test('should return a non Post Transaction Value as is', () => {
    expect(unwrapValue(1)).toBe(1);
  });
});

describe('unwrapValues', () => {
  test('should unwrap all Post Transaction Values in the array', async () => {
    const values = [1, 2, 3, 4, 5];
    const wrapped = values.map(value => new PostTransactionValue(async () => value));
    await Promise.all(wrapped.map(postValue => postValue.run({} as ISubmittableResult)));

    const unwrapped = unwrapValues(wrapped);

    expect(unwrapped).toEqual(values);
  });
});

describe('filterEventRecords', () => {
  const filterRecordsStub = sinon.stub();
  const mockReceipt = ({
    filterRecords: filterRecordsStub,
  } as unknown) as ISubmittableResult;

  afterEach(() => {
    filterRecordsStub.reset();
  });

  test('returns the corresponding Event Record', () => {
    const mod = 'asset';
    const eventName = 'TickerRegistered';
    const fakeResult = 'event';
    filterRecordsStub.withArgs(mod, eventName).returns([{ event: fakeResult }]);

    const eventRecord = filterEventRecords(mockReceipt, mod, eventName);

    expect(eventRecord[0]).toBe(fakeResult);
  });

  test("throws if the Event wasn't fired", () => {
    const mod = 'asset';
    const eventName = 'TickerRegistered';
    filterRecordsStub.withArgs(mod, eventName).returns([]);

    expect(() => filterEventRecords(mockReceipt, mod, eventName)).toThrow(
      `Event "${mod}.${eventName}" wasn't fired even though the corresponding transaction was completed. Please report this to the Polymath team`
    );
  });
});

describe('createClaim', () => {
  test('createClaim should create Claim objects from claims data provided by middleware', () => {
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
    scope = { type: ClaimScopeTypeEnum.Ticker, value: 'someTicker' };

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
  test('should pad a string on the right side to cover the supplied length', () => {
    const value = 'someString';
    const fakeResult = `${value}\0\0`;

    const result = padString(value, 12);

    expect(result).toBe(fakeResult);
  });
});

describe('removePadding', () => {
  test('should remove all null character padding from the input', () => {
    const expected = 'someString';

    const result = removePadding(`${expected}\0\0\0`);

    expect(result).toBe(expected);
  });
});

describe('requestPaginated', () => {
  test('should fetch and return entries and the hex value of the last key', async () => {
    const queryStub = dsMockUtils.createQueryStub('asset', 'tickers', {
      entries: [
        tuple(['ticker0'], dsMockUtils.createMockU32(0)),
        tuple(['ticker1'], dsMockUtils.createMockU32(1)),
        tuple(['ticker2'], dsMockUtils.createMockU32(2)),
      ],
    });

    let res = await requestPaginated(queryStub, {
      paginationOpts: undefined,
    });

    expect(res.lastKey).toBeNull();
    sinon.assert.calledOnce(queryStub.entries);

    sinon.resetHistory();

    res = await requestPaginated(queryStub, {
      paginationOpts: { size: 3 },
    });

    expect(typeof res.lastKey).toBe('string');
    sinon.assert.calledOnce(queryStub.entriesPaged);

    sinon.resetHistory();

    res = await requestPaginated(queryStub, {
      paginationOpts: { size: 4 },
      arg: 'something',
    });

    expect(res.lastKey).toBeNull();
    sinon.assert.calledOnce(queryStub.entriesPaged);
  });
});

describe('requestAtBlock', () => {
  test('should fetch and return the value at a certain block (current if left empty)', async () => {
    const context = dsMockUtils.getContextInstance({
      isArchiveNode: true,
    });
    const returnValue = dsMockUtils.createMockU32(5);
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

  test('should throw an error if the node is not archive', () => {
    const context = dsMockUtils.getContextInstance({
      isArchiveNode: false,
    });

    const queryStub = dsMockUtils.createQueryStub('asset', 'tickers', {
      returnValue: dsMockUtils.createMockU32(5),
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

describe('batchArguments', () => {
  test('should return chunks of data', () => {
    const tag = TxTags.asset.AddDocuments;
    const expectedBatchLength = MAX_BATCH_ELEMENTS[tag];

    const elements = range(0, 3 * expectedBatchLength + 1);

    const batches = batchArguments(elements, tag);

    expect(batches.length).toBe(4);
    expect(batches[0].length).toBe(expectedBatchLength);
    expect(batches[1].length).toBe(expectedBatchLength);
    expect(batches[2].length).toBe(expectedBatchLength);
    expect(batches[3].length).toBe(1);
  });

  test('should use a custom batching function to group elements', () => {
    const tag = TxTags.corporateAction.InitiateCorporateAction;
    const expectedBatchLength = DEFAULT_MAX_BATCH_ELEMENTS;

    const elements = range(0, 2 * expectedBatchLength);

    let batches = batchArguments(elements, tag, element => `${element % 2}`); // separate odd from even

    expect(batches.length).toBe(2);
    expect(batches[0]).toEqual(range(0, 2 * expectedBatchLength, 2));
    expect(batches[1]).toEqual(range(1, 2 * expectedBatchLength, 2));

    batches = batchArguments(elements, tag, element => `${element % 5}`); // separate in 5 groups

    expect(batches.length).toBe(3);
    expect(batches[0].length).toBeLessThan(expectedBatchLength);
    expect(batches[1].length).toBeLessThan(expectedBatchLength);
    expect(batches[2].length).toBeLessThan(expectedBatchLength);
  });

  test('should throw an error if a custom batch has a size bigger than the limit', () => {
    const tag = TxTags.asset.AddDocuments;
    const expectedBatchLength = MAX_BATCH_ELEMENTS[tag];

    const elements = range(0, 3 * expectedBatchLength);

    expect(() => batchArguments(elements, tag, element => `${element % 2}`)).toThrowError(
      'Batch size exceeds limit'
    );
  });
});

describe('calculateNextKey', () => {
  test('should return NextKey null as there are less elements than the default page size', () => {
    const totalCount = 20;
    const nextKey = calculateNextKey(totalCount);

    expect(nextKey).toBeNull();
  });

  test('should return NextKey null as it is the last page', () => {
    const totalCount = 50;
    const currentPageSize = 30;
    const currentStart = 31;
    const nextKey = calculateNextKey(totalCount, currentPageSize, currentStart);

    expect(nextKey).toBeNull();
  });

  test('should return NextKey', () => {
    const totalCount = 50;
    const currentPageSize = 30;
    const currentStart = 0;
    const nextKey = calculateNextKey(totalCount, currentPageSize, currentStart);

    expect(nextKey).toEqual(30);
  });
});

describe('isPrintableAscii', () => {
  test('should return true if the string only contains printable ASCII characters', () => {
    expect(isPrintableAscii('TICKER')).toBe(true);
  });

  test("should return false if the string doesn't contain only printable ASCII characters", () => {
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

  test('should return a ProcedureMethod object', async () => {
    const prepare = sinon.stub();
    const checkAuthorization = sinon.stub();
    const transformer = sinon.stub();
    const fakeProcedure = (): Procedure<number, void> =>
      (({
        prepare,
        checkAuthorization,
      } as unknown) as Procedure<number, void>);

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

  test('should return a NoArgsProcedureMethod object', async () => {
    const prepare = sinon.stub();
    const checkAuthorization = sinon.stub();
    const transformer = sinon.stub();
    const fakeProcedure = (): Procedure<void, void> =>
      (({
        prepare,
        checkAuthorization,
      } as unknown) as Procedure<void, void>);

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
  test('should not throw if the argument is an integer', async () => {
    try {
      assertIsInteger(new BigNumber(1));
    } catch (_) {
      expect(true).toBe(false);
    }
  });

  test('assertIsInteger should throw an error if the argument is not an integer', async () => {
    expect(() => assertIsInteger(('noInteger' as unknown) as BigNumber)).toThrow(
      'The number must be an integer'
    );

    expect(() => assertIsInteger(new BigNumber(1.2))).toThrow('The number must be an integer');
  });
});

describe('assertIsPositive', () => {
  test('should not throw an error if the argument is positive', () => {
    expect(() => assertIsPositive(new BigNumber(43))).not.toThrow();
  });
  test('should throw an error if the argument is negative', async () => {
    expect(() => assertIsPositive(new BigNumber(-3))).toThrow('The number must be positive');
  });
});

describe('getCommonKeyring', () => {
  test('should return a common keyring', async () => {
    const fakeKeyring = ('keyring' as unknown) as CommonKeyring;
    let result = getCommonKeyring(fakeKeyring);

    expect(result).toBe(fakeKeyring);

    result = getCommonKeyring({ keyring: fakeKeyring });
    expect(result).toBe(fakeKeyring);
  });
});

describe('assertFormatValid', () => {
  const ss58Format = 42;

  test('should throw an error if the address is prefixed with an invalid ss58', async () => {
    expect(() =>
      assertFormatValid('ajYMsCKsEAhEvHpeA4XqsfiA9v1CdzZPrCfS6pEfeGHW9j8', ss58Format)
    ).toThrow("The supplied address is not encoded with the chain's SS58 format");
  });

  test('should not throw if the address is prefixed with valid ss58', async () => {
    expect(() =>
      assertFormatValid('5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY', ss58Format)
    ).not.toThrow();
  });
});

describe('assertKeyringFormatValid', () => {
  const ss58Format = 42;
  const keyring = new Keyring({ ss58Format });

  test('should not throw if the keyring is set with valid ss58', async () => {
    expect(() => assertKeyringFormatValid(keyring, ss58Format)).not.toThrow();
  });

  test('should throw an error if the keyring is set with an invalid ss58', async () => {
    keyring.setSS58Format(12);
    expect(() => assertKeyringFormatValid(keyring, ss58Format)).toThrow(
      "The supplied keyring is not using the chain's SS58 format"
    );
  });
});

describe('getTicker', () => {
  test('should return a token symbol', async () => {
    const symbol = 'TOKEN';
    let result = getTicker(symbol);

    expect(result).toBe(symbol);

    result = getTicker(new SecurityToken({ ticker: symbol }, dsMockUtils.getContextInstance()));
    expect(result).toBe(symbol);
  });
});

describe('periodComplexity', () => {
  test('should calculate complexity for any period', () => {
    const period: CalendarPeriod = {
      unit: CalendarUnit.Second,
      amount: 1,
    };
    let result = periodComplexity(period);
    expect(result).toBe(31536000);

    period.unit = CalendarUnit.Minute;
    result = periodComplexity(period);
    expect(result).toBe(525600);

    period.unit = CalendarUnit.Hour;
    result = periodComplexity(period);
    expect(result).toBe(8760);

    period.unit = CalendarUnit.Day;
    result = periodComplexity(period);
    expect(result).toBe(365);

    period.unit = CalendarUnit.Week;
    result = periodComplexity(period);
    expect(result).toBe(52);

    period.unit = CalendarUnit.Month;
    result = periodComplexity(period);
    expect(result).toBe(12);

    period.unit = CalendarUnit.Year;
    result = periodComplexity(period);
    expect(result).toBe(2);

    period.amount = 0;
    result = periodComplexity(period);
    expect(result).toBe(1);
  });
});

describe('optionize', () => {
  test('should transform a conversion util into a version that returns null if the first input is falsy, passing along the rest if not', () => {
    const number = 1;

    const toString = (value: number, foo: string, bar: number): string =>
      `${value.toString()}${foo}${bar}`;

    let result = optionize(toString)(number, 'notNeeded', 1);
    expect(result).toBe(toString(number, 'notNeeded', 1));

    result = optionize(toString)(null, 'stillNotNeeded', 2);
    expect(result).toBeNull();
  });
});

describe('isModuleOrTagMatch', () => {
  test("should return true if two tags/modules are equal, or if one is the other one's module", () => {
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

  test('should return value as it is for valid params of type Checkpoint, CheckpointSchedule or Date', async () => {
    const mockCheckpointSchedule = entityMockUtils.getCheckpointScheduleInstance();
    const mockToken = entityMockUtils.getSecurityTokenInstance();
    let result = await getCheckpointValue(mockCheckpointSchedule, mockToken, context);
    expect(result).toEqual(mockCheckpointSchedule);

    const mockCheckpoint = entityMockUtils.getCheckpointInstance();
    result = await getCheckpointValue(mockCheckpoint, mockToken, context);
    expect(result).toEqual(mockCheckpoint);

    const mockCheckpointDate = new Date();
    result = await getCheckpointValue(mockCheckpointDate, mockToken, context);
    expect(result).toEqual(mockCheckpointDate);
  });

  test('should return Checkpoint instance for params with type `Existing`', async () => {
    const mockCheckpoint = entityMockUtils.getCheckpointInstance();
    const mockCaCheckpointTypeParams = {
      id: new BigNumber(1),
      type: CaCheckpointType.Existing,
    };
    const mockSecurityToken = entityMockUtils.getSecurityTokenInstance({
      checkpointsGetOne: mockCheckpoint,
    });

    const result = await getCheckpointValue(mockCaCheckpointTypeParams, mockSecurityToken, context);
    expect(result).toEqual(mockCheckpoint);
  });

  test('should return Checkpoint instance for params with type `Scheduled`', async () => {
    const mockCheckpointSchedule = entityMockUtils.getCheckpointScheduleInstance();
    const mockCaCheckpointTypeParams = {
      id: new BigNumber(1),
      type: CaCheckpointType.Schedule,
    };
    const mockSecurityToken = entityMockUtils.getSecurityTokenInstance({
      checkpointsSchedulesGetOne: { schedule: mockCheckpointSchedule },
    });

    const result = await getCheckpointValue(mockCaCheckpointTypeParams, mockSecurityToken, context);
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
