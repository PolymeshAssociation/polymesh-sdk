import { Bytes, u32 } from '@polkadot/types';
import { AccountId } from '@polkadot/types/interfaces';
import {
  PolymeshPrimitivesIdentityClaimClaimType,
  PolymeshPrimitivesIdentityId,
  PolymeshPrimitivesSecondaryKeyKeyRecord,
  PolymeshPrimitivesStatisticsStatOpType,
  PolymeshPrimitivesStatisticsStatType,
} from '@polkadot/types/lookup';
import { ISubmittableResult } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import { Account, Asset, Context, Identity, PolymeshError, Procedure } from '~/internal';
import { latestSqVersionQuery } from '~/middleware/queries';
import { ClaimScopeTypeEnum } from '~/middleware/typesV1';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';
import {
  createMockStatisticsStatClaim,
  getApiInstance,
  getAtMock,
  getWebSocketInstance,
  MockCodec,
  MockContext,
  MockWebSocket,
} from '~/testUtils/mocks/dataSources';
import {
  CaCheckpointType,
  ClaimType,
  CountryCode,
  ErrorCode,
  ModuleName,
  OptionalArgsProcedureMethod,
  PermissionedAccount,
  ProcedureMethod,
  RemoveAssetStatParams,
  StatType,
  SubCallback,
  TransferRestrictionType,
  TxTags,
} from '~/types';
import { tuple } from '~/types/utils';
import {
  MAX_TICKER_LENGTH,
  MINIMUM_SQ_VERSION,
  SUPPORTED_NODE_SEMVER,
  SUPPORTED_SPEC_SEMVER,
} from '~/utils/constants';
import * as utilsConversionModule from '~/utils/conversion';

import { SUPPORTED_NODE_VERSION_RANGE, SUPPORTED_SPEC_VERSION_RANGE } from '../constants';
import {
  asAccount,
  asChildIdentity,
  assertAddressValid,
  assertExpectedChainVersion,
  assertExpectedSqVersion,
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
  getApiAtBlock,
  getCheckpointValue,
  getDid,
  getExemptedIds,
  getIdentity,
  getIdentityFromKeyRecord,
  getPortfolioIdsByName,
  getSecondaryAccountPermissions,
  hasSameElements,
  isAlphanumeric,
  isModuleOrTagMatch,
  isPrintableAscii,
  mergeReceipts,
  neededStatTypeForRestrictionInput,
  optionize,
  padString,
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

  it('should resolve after the supplied timeout', async () => {
    const delayPromise = delay(5000);

    jest.advanceTimersByTime(5000);

    expect(await delayPromise).toBeUndefined();
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
  const filterRecordsMock = jest.fn();
  const mockReceipt = {
    filterRecords: filterRecordsMock,
  } as unknown as ISubmittableResult;

  afterEach(() => {
    filterRecordsMock.mockReset();
  });

  it('should return the corresponding Event Record', () => {
    const mod = 'asset';
    const eventName = 'TickerRegistered';
    const fakeResult = 'event';
    when(filterRecordsMock)
      .calledWith(mod, eventName)
      .mockReturnValue([{ event: fakeResult }]);

    const eventRecord = filterEventRecords(mockReceipt, mod, eventName);

    expect(eventRecord[0]).toBe(fakeResult);
  });

  it("should throw an error if the Event wasn't fired", () => {
    const mod = 'asset';
    const eventName = 'TickerRegistered';
    when(filterRecordsMock).calledWith(mod, eventName).mockReturnValue([]);

    expect(() => filterEventRecords(mockReceipt, mod, eventName)).toThrow(
      `Event "${mod}.${eventName}" wasn't fired even though the corresponding transaction was completed. Please report this to the Polymesh team`
    );
  });
});

describe('sliceBatchReceipt', () => {
  const filterRecordsMock = jest.fn();
  const mockReceipt = {
    filterRecords: filterRecordsMock,
    events: ['tx0event0', 'tx0event1', 'tx1event0', 'tx2event0', 'tx2event1', 'tx2event2'],
    findRecord: jest.fn(),
    toHuman: jest.fn(),
  } as unknown as ISubmittableResult;

  beforeEach(() => {
    when(filterRecordsMock)
      .calledWith('utility', 'BatchCompletedOld')
      .mockReturnValue([
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
    filterRecordsMock.mockReset();
  });

  it('should return the cloned receipt with a subset of events', () => {
    let slicedReceipt = sliceBatchReceipt(mockReceipt, 1, 3, false);

    expect(slicedReceipt.events).toEqual(['tx1event0', 'tx2event0', 'tx2event1', 'tx2event2']);

    slicedReceipt = sliceBatchReceipt(mockReceipt, 0, 2, false);

    expect(slicedReceipt.events).toEqual(['tx0event0', 'tx0event1', 'tx1event0']);
  });

  it('should throw an error if the transaction indexes are out of bounds', () => {
    expect(() => sliceBatchReceipt(mockReceipt, -1, 2, false)).toThrow(
      'Transaction index range out of bounds. Please report this to the Polymesh team'
    );

    expect(() => sliceBatchReceipt(mockReceipt, 1, 4, false)).toThrow(
      'Transaction index range out of bounds. Please report this to the Polymesh team'
    );
  });
});

describe('mergeReceipts', () => {
  let bigNumberToU32Spy: jest.SpyInstance;
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
    bigNumberToU32Spy = jest.spyOn(utilsConversionModule, 'bigNumberToU32');
    when(bigNumberToU32Spy)
      .calledWith(new BigNumber(2), context)
      .mockReturnValue(eventsPerTransaction[0]);
    when(bigNumberToU32Spy)
      .calledWith(new BigNumber(1), context)
      .mockReturnValue(eventsPerTransaction[1]);
    when(bigNumberToU32Spy)
      .calledWith(new BigNumber(3), context)
      .mockReturnValue(eventsPerTransaction[2]);

    receipts = [
      {
        filterRecords: jest.fn(),
        events: ['tx0event0', 'tx0event1'],
        findRecord: jest.fn(),
        toHuman: jest.fn(),
      },
      {
        filterRecords: jest.fn(),
        events: ['tx1event0'],
        findRecord: jest.fn(),
        toHuman: jest.fn(),
      },
      {
        filterRecords: jest.fn(),
        events: ['tx2event0', 'tx2event1', 'tx2event2'],
        findRecord: jest.fn(),
        toHuman: jest.fn(),
      },
    ] as unknown as ISubmittableResult[];
  });

  afterEach(() => {
    dsMockUtils.reset();
    jest.restoreAllMocks();
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

    let result = createClaim(type, jurisdiction, scope, null);
    expect(result).toEqual({
      type: ClaimType.Jurisdiction,
      code: CountryCode.Cl,
      scope,
    });

    type = 'BuyLockup';
    scope = { type: ClaimScopeTypeEnum.Identity, value: 'someScope' };

    result = createClaim(type, null, scope, null);
    expect(result).toEqual({
      type: ClaimType.BuyLockup,
      scope,
    });

    type = 'CustomerDueDiligence';
    const id = 'someId';

    result = createClaim(type, null, null, id);
    expect(result).toEqual({
      type: ClaimType.CustomerDueDiligence,
      id,
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
    const entries = [
      tuple(['ticker0'], dsMockUtils.createMockU32(new BigNumber(0))),
      tuple(['ticker1'], dsMockUtils.createMockU32(new BigNumber(1))),
      tuple(['ticker2'], dsMockUtils.createMockU32(new BigNumber(2))),
    ];
    const queryMock = dsMockUtils.createQueryMock('asset', 'tickers', {
      entries,
    });

    let res = await requestPaginated(queryMock, {
      paginationOpts: undefined,
    });

    expect(res.lastKey).toBeNull();
    expect(queryMock.entries).toHaveBeenCalledTimes(1);

    jest.clearAllMocks();

    res = await requestPaginated(queryMock, {
      paginationOpts: { size: new BigNumber(3) },
    });

    expect(typeof res.lastKey).toBe('string');
    expect(queryMock.entriesPaged).toHaveBeenCalledTimes(1);

    jest.clearAllMocks();

    res = await requestPaginated(queryMock, {
      paginationOpts: { size: new BigNumber(4) },
      arg: 'something',
    });

    expect(res.lastKey).toBeNull();
    expect(queryMock.entriesPaged).toHaveBeenCalledTimes(1);
  });
});

describe('getApiAtBlock', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  it('should throw an error if the node is not archive', () => {
    const context = dsMockUtils.getContextInstance({
      isCurrentNodeArchive: false,
    });

    return expect(getApiAtBlock(context, 'blockHash')).rejects.toThrow(
      'Cannot query previous blocks in a non-archive node'
    );
  });

  it('should return corresponding API state at given block', async () => {
    const context = dsMockUtils.getContextInstance();

    const result = await getApiAtBlock(context, 'blockHash');

    expect(result).toEqual(getApiInstance());
    expect(getAtMock()).toHaveBeenCalledTimes(1);
  });
});

describe('requestAtBlock', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  it('should fetch and return the value at a certain block (current if left empty)', async () => {
    const context = dsMockUtils.getContextInstance({
      isCurrentNodeArchive: true,
    });
    const returnValue = dsMockUtils.createMockU32(new BigNumber(5));
    const queryMock = dsMockUtils.createQueryMock('asset', 'tickers', {
      returnValue,
    });
    const apiAtMock = getAtMock();

    const blockHash = 'someBlockHash';
    const ticker = 'ticker';

    let res = await requestAtBlock(
      'asset',
      'tickers',
      {
        blockHash,
        args: [ticker],
      },
      context
    );

    expect(apiAtMock).toHaveBeenCalledTimes(1);
    expect(queryMock).toHaveBeenCalledWith(ticker);
    expect(res).toBe(returnValue);

    apiAtMock.mockClear();

    res = await requestAtBlock(
      'asset',
      'tickers',
      {
        args: [ticker],
      },
      context
    );

    expect(apiAtMock).toHaveBeenCalledTimes(0);
    expect(queryMock).toHaveBeenCalledWith(ticker);
    expect(res).toBe(returnValue);
  });
});

describe('calculateNextKey', () => {
  it('should return NextKey as null when all elements are returned', () => {
    const totalCount = new BigNumber(20);
    const nextKey = calculateNextKey(totalCount, 20);

    expect(nextKey).toBeNull();
  });

  it('should return NextKey null as it is the last page', () => {
    const totalCount = new BigNumber(50);
    const resultSize = 30;
    const currentStart = new BigNumber(31);
    const nextKey = calculateNextKey(totalCount, resultSize, currentStart);

    expect(nextKey).toBeNull();
  });

  it('should return NextKey', () => {
    const totalCount = new BigNumber(50);
    const resultSize = 30;
    const currentStart = new BigNumber(0);
    const nextKey = calculateNextKey(totalCount, resultSize, currentStart);

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
  let prepare: jest.Mock;
  let checkAuthorization: jest.Mock;
  let transformer: jest.Mock;
  let fakeProcedure: () => Procedure<number, void>;

  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
    prepare = jest.fn();
    checkAuthorization = jest.fn();
    transformer = jest.fn();
    fakeProcedure = (): Procedure<number, void> =>
      ({
        prepare,
        checkAuthorization,
      } as unknown as Procedure<number, void>);
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  it('should return a ProcedureMethod object', async () => {
    const method: ProcedureMethod<number, void> = createProcedureMethod(
      { getProcedureAndArgs: args => [fakeProcedure, args], transformer },
      context
    );

    const procArgs = 1;
    await method(procArgs);

    expect(prepare).toHaveBeenCalledWith({ args: procArgs, transformer }, context, {});

    await method.checkAuthorization(procArgs);

    expect(checkAuthorization).toHaveBeenCalledWith(procArgs, context, {});
  });

  it('should return a OptionalArgsProcedureMethod object', async () => {
    const method: OptionalArgsProcedureMethod<number, void> = createProcedureMethod(
      {
        getProcedureAndArgs: (args?: number) => [fakeProcedure, args],
        transformer,
        optionalArgs: true,
      },
      context
    );

    await method();

    expect(prepare).toHaveBeenCalledWith({ args: undefined, transformer }, context, {});

    await method.checkAuthorization(undefined);

    expect(checkAuthorization).toHaveBeenCalledWith(undefined, context, {});

    const procArgs = 1;
    await method(procArgs);

    expect(prepare).toHaveBeenCalledWith({ args: procArgs, transformer }, context, {});

    await method.checkAuthorization(procArgs);

    expect(checkAuthorization).toHaveBeenCalledWith(procArgs, context, {});
  });

  it('should return a NoArgsProcedureMethod object', async () => {
    const noArgsFakeProcedure = (): Procedure<void, void> =>
      ({
        prepare,
        checkAuthorization,
      } as unknown as Procedure<void, void>);

    const method = createProcedureMethod(
      { getProcedureAndArgs: () => [noArgsFakeProcedure, undefined], transformer, voidArgs: true },
      context
    );

    await method();

    expect(prepare).toHaveBeenCalledWith({ transformer, args: undefined }, context, {});

    await method.checkAuthorization();

    expect(checkAuthorization).toHaveBeenCalledWith(undefined, context, {});
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
  let portfoliosMock: jest.Mock;
  let firstPortfolioName: MockCodec<Bytes>;
  let rawNames: Bytes[];
  let identityId: PolymeshPrimitivesIdentityId;

  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
    firstPortfolioName = dsMockUtils.createMockBytes('someName');
    rawNames = [firstPortfolioName, dsMockUtils.createMockBytes('otherName')];
    identityId = dsMockUtils.createMockIdentityId('someDid');
    dsMockUtils.createQueryMock('portfolio', 'nameToNumber', {
      multi: [
        dsMockUtils.createMockOption(dsMockUtils.createMockU64(new BigNumber(1))),
        dsMockUtils.createMockOption(dsMockUtils.createMockU64(new BigNumber(2))),
        dsMockUtils.createMockOption(),
        dsMockUtils.createMockOption(),
      ],
    });
    portfoliosMock = dsMockUtils.createQueryMock('portfolio', 'portfolios');
  });

  afterEach(() => {
    dsMockUtils.reset();
    entityMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  it('should return portfolio numbers for given portfolio name, and null for names that do not exist', async () => {
    portfoliosMock.mockResolvedValue(firstPortfolioName);
    firstPortfolioName.eq = jest.fn();
    when(firstPortfolioName.eq).calledWith(rawNames[0]).mockReturnValue(true);
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
    const dids = ['someDid', 'otherDid'];

    const result = await getExemptedIds(dids, context);

    expect(result).toEqual(dids);
  });

  it('should throw an error if the exempted IDs have duplicates', () => {
    const dids = ['someDid', 'someDid'];

    return expect(getExemptedIds(dids, context)).rejects.toThrow(
      'One or more of the passed exempted Identities are repeated or have the same Scope ID'
    );
  });
});

describe('assertExpectedSqVersion', () => {
  let warnSpy: jest.SpyInstance;
  let context: MockContext;

  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    warnSpy.mockClear();
    dsMockUtils.reset();
  });

  afterAll(() => {
    warnSpy.mockRestore();
  });

  it('should resolve if SDK is initialized with correct Middleware V2 version', () => {
    dsMockUtils.createApolloQueryMock(latestSqVersionQuery(), {
      subqueryVersions: {
        nodes: [
          {
            version: '9.7.1',
          },
        ],
      },
    });
    const promise = assertExpectedSqVersion(dsMockUtils.getContextInstance());

    return expect(promise).resolves.not.toThrow();
  });

  it('should log a warning for incompatible Subquery version', async () => {
    dsMockUtils.createApolloQueryMock(latestSqVersionQuery(), {
      subqueryVersions: {
        nodes: [
          {
            version: '9.6.0',
          },
        ],
      },
    });
    await assertExpectedSqVersion(context);

    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledWith(
      `This version of the SDK supports Polymesh Subquery version ${MINIMUM_SQ_VERSION} or higher. Please upgrade the MiddlewareV2`
    );

    warnSpy.mockReset();

    dsMockUtils.createApolloQueryMock(latestSqVersionQuery(), {
      subqueryVersions: {
        nodes: [],
      },
    });
    await assertExpectedSqVersion(context);

    expect(warnSpy).toHaveBeenCalledTimes(1);
  });
});

describe('assertExpectedChainVersion', () => {
  let client: MockWebSocket;
  let warnSpy: jest.SpyInstance;

  const getSpecVersion = (version: string): string =>
    `${version
      .split('.')
      .map(number => `00${number}`.slice(-3))
      .join('')}`;

  const getMismatchedVersion = (version: string, versionIndex = 1): string =>
    version
      .split('.')
      .map((number, index) => (index === versionIndex ? +number + 4 : number))
      .join('.');

  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  beforeEach(() => {
    client = getWebSocketInstance();
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    warnSpy.mockClear();
    dsMockUtils.reset();
  });

  afterAll(() => {
    warnSpy.mockRestore();
  });

  it('should resolve if it receives both expected RPC node and chain spec version', () => {
    const signal = assertExpectedChainVersion('ws://example.com');
    client.onopen();

    return expect(signal).resolves.not.toThrow();
  });

  it('should throw an error given a major RPC node version mismatch', () => {
    const signal = assertExpectedChainVersion('ws://example.com');
    const mismatchedVersion = getMismatchedVersion(SUPPORTED_NODE_SEMVER, 0);
    client.sendRpcVersion(mismatchedVersion);
    const expectedError = new PolymeshError({
      code: ErrorCode.FatalError,
      message: 'Unsupported Polymesh RPC node version. Please upgrade the SDK',
    });
    return expect(signal).rejects.toThrowError(expectedError);
  });

  it('should log a warning given a minor or patch RPC node version mismatch', async () => {
    const signal = assertExpectedChainVersion('ws://example.com');

    client.sendSpecVersion(getSpecVersion(SUPPORTED_SPEC_SEMVER));

    const mockRpcVersion = getMismatchedVersion(SUPPORTED_NODE_SEMVER);
    client.sendRpcVersion(mockRpcVersion);

    await signal;
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledWith(
      `This version of the SDK supports Polymesh RPC node version ${SUPPORTED_NODE_VERSION_RANGE}. The node is at version ${mockRpcVersion}. Please upgrade the SDK`
    );
  });

  it('should throw an error given a major chain spec version mismatch', () => {
    const signal = assertExpectedChainVersion('ws://example.com');
    const mismatchedSpecVersion = getMismatchedVersion(SUPPORTED_SPEC_SEMVER, 0);
    client.sendSpecVersion(getSpecVersion(mismatchedSpecVersion));
    const expectedError = new PolymeshError({
      code: ErrorCode.FatalError,
      message: 'Unsupported Polymesh chain spec version. Please upgrade the SDK',
    });
    return expect(signal).rejects.toThrowError(expectedError);
  });

  it('should log a warning given a minor chain spec version mismatch', async () => {
    const signal = assertExpectedChainVersion('ws://example.com');
    const mockSpecVersion = getMismatchedVersion(SUPPORTED_SPEC_SEMVER);
    client.sendSpecVersion(getSpecVersion(mockSpecVersion));
    client.sendRpcVersion(SUPPORTED_NODE_SEMVER);
    await signal;
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledWith(
      `This version of the SDK supports Polymesh chain spec version ${SUPPORTED_SPEC_VERSION_RANGE}. The chain spec is at version ${mockSpecVersion}. Please upgrade the SDK`
    );
  });

  it('should resolve even with a patch chain spec version mismatch', async () => {
    const signal = assertExpectedChainVersion('ws://example.com');
    const mockSpecVersion = getMismatchedVersion(SUPPORTED_SPEC_SEMVER, 2);
    client.sendSpecVersion(getSpecVersion(mockSpecVersion));
    client.sendRpcVersion(SUPPORTED_NODE_SEMVER);
    await signal;
    expect(warnSpy).toHaveBeenCalledTimes(0);
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

  it('should throw an error if the ticker contains a emoji', () => {
    const ticker = '💎';

    expect(() => assertTickerValid(ticker)).toThrow(
      'Only printable ASCII is allowed as ticker name'
    );
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

    jest
      .spyOn(utilsConversionModule, 'claimIssuerToMeshClaimIssuer')
      .mockReturnValue(mockClaimIssuer);

    when(context.createType)
      .calledWith('PolymeshPrimitivesStatisticsStatOpType', StatType.Count)
      .mockReturnValue('Count' as unknown as PolymeshPrimitivesStatisticsStatOpType);
    when(context.createType)
      .calledWith('PolymeshPrimitivesStatisticsStatOpType', StatType.Balance)
      .mockReturnValue('Balance' as unknown as PolymeshPrimitivesStatisticsStatOpType);

    when(context.createType)
      .calledWith('PolymeshPrimitivesStatisticsStatType', { op: 'Count', claimIssuer: undefined })
      .mockReturnValue('CountStat' as unknown as PolymeshPrimitivesStatisticsStatType);
    when(context.createType)
      .calledWith('PolymeshPrimitivesStatisticsStatType', { op: 'Balance', claimIssuer: undefined })
      .mockReturnValue('BalanceStat' as unknown as PolymeshPrimitivesStatisticsStatType);
    when(context.createType)
      .calledWith('PolymeshPrimitivesStatisticsStatType', {
        op: 'Balance',
        claimIssuer: mockClaimIssuer,
      })
      .mockReturnValue('ScopedBalanceStat' as unknown as PolymeshPrimitivesStatisticsStatType);

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
  let identityIdToStringSpy: jest.SpyInstance<string, [PolymeshPrimitivesIdentityId]>;
  let stringToAccountIdSpy: jest.SpyInstance<AccountId, [string, Context]>;
  let meshPermissionsToPermissionsSpy: jest.SpyInstance;

  beforeAll(() => {
    dsMockUtils.initMocks();
    account = entityMockUtils.getAccountInstance({ address: accountId });
    meshPermissionsToPermissionsSpy = jest.spyOn(
      utilsConversionModule,
      'meshPermissionsToPermissions'
    );
    stringToAccountIdSpy = jest.spyOn(utilsConversionModule, 'stringToAccountId');
    identityIdToStringSpy = jest.spyOn(utilsConversionModule, 'identityIdToString');
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
    dsMockUtils.cleanup();
    jest.restoreAllMocks();
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

    meshPermissionsToPermissionsSpy.mockReturnValue({
      assets: null,
      portfolios: null,
      transactions: null,
      transactionGroups: [],
    });
    stringToAccountIdSpy.mockReturnValue(dsMockUtils.createMockAccountId(accountId));
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  it('should return a list of Accounts', async () => {
    const context = dsMockUtils.getContextInstance();
    dsMockUtils.createQueryMock('identity', 'keyRecords', {
      multi: [
        dsMockUtils.createMockOption(rawPrimaryKeyRecord),
        dsMockUtils.createMockOption(rawSecondaryKeyRecord),
        dsMockUtils.createMockOption(rawMultiSigKeyRecord),
      ],
    });
    identityIdToStringSpy.mockReturnValue('someDid');
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

  it('should filter out Accounts if they do not belong to the given identity', async () => {
    const mockContext = dsMockUtils.getContextInstance();
    const otherSecondaryKey = dsMockUtils.createMockKeyRecord({
      SecondaryKey: [dsMockUtils.createMockIdentityId(did), dsMockUtils.createMockPermissions()],
    });
    dsMockUtils.createQueryMock('identity', 'keyRecords', {
      multi: [
        dsMockUtils.createMockOption(rawPrimaryKeyRecord),
        dsMockUtils.createMockOption(otherSecondaryKey),
        dsMockUtils.createMockOption(),
        dsMockUtils.createMockOption(rawMultiSigKeyRecord),
      ],
    });
    identityIdToStringSpy.mockReturnValue('someDid');
    const identity = new Identity({ did: 'otherDid' }, mockContext);

    const result = await getSecondaryAccountPermissions(
      {
        accounts: [
          entityMockUtils.getAccountInstance(),
          account,
          entityMockUtils.getAccountInstance(),
        ],
        identity,
      },
      mockContext
    );
    expect(result).toEqual([]);
  });

  it('should allow for subscription', async () => {
    const mockContext = dsMockUtils.getContextInstance();
    const callback: SubCallback<PermissionedAccount[]> = jest.fn().mockImplementation();
    const unsubCallback = 'unsubCallBack';

    const keyRecordsMock = dsMockUtils.createQueryMock('identity', 'keyRecords');
    keyRecordsMock.multi.mockImplementation((_, cbFunc) => {
      cbFunc([
        dsMockUtils.createMockOption(rawPrimaryKeyRecord),
        dsMockUtils.createMockOption(rawSecondaryKeyRecord),
        dsMockUtils.createMockOption(rawMultiSigKeyRecord),
      ]);
      return unsubCallback;
    });

    identityIdToStringSpy.mockReturnValue('someDid');
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

    expect(callback).toHaveBeenCalledWith(fakeResult);
    expect(result).toEqual(unsubCallback);
  });
});

describe('isAlphaNumeric', () => {
  it('should return true for alphanumeric strings', () => {
    const alphaNumericStrings = ['abc', 'TICKER', '123XYZ99'];

    expect(alphaNumericStrings.every(input => isAlphanumeric(input))).toBe(true);
  });

  it('should return false for non alphanumeric strings', () => {
    const alphaNumericStrings = ['**abc**', 'TICKER-Z', '💎'];

    expect(alphaNumericStrings.some(input => isAlphanumeric(input))).toBe(false);
  });
});

describe('getIdentityFromKeyRecord', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  it('should return the associated Identity', async () => {
    const did = 'someDid';
    const secondaryDid = 'secondaryDid';
    const multiDid = 'multiDid';

    const mockContext = dsMockUtils.getContextInstance();

    const primaryKeyRecord = dsMockUtils.createMockKeyRecord({
      PrimaryKey: dsMockUtils.createMockIdentityId(did),
    });

    let identity = await getIdentityFromKeyRecord(primaryKeyRecord, mockContext);

    expect(identity?.did).toEqual(did);

    const secondaryKeyRecord = dsMockUtils.createMockKeyRecord({
      SecondaryKey: [
        dsMockUtils.createMockIdentityId(secondaryDid),
        dsMockUtils.createMockPermissions(),
      ],
    });

    identity = await getIdentityFromKeyRecord(secondaryKeyRecord, mockContext);

    expect(identity?.did).toEqual(secondaryDid);

    const multiSigKeyRecord = dsMockUtils.createMockKeyRecord({
      MultiSigSignerKey: dsMockUtils.createMockAccountId(
        dsMockUtils.createMockAccountId('someAddress')
      ),
    });

    const multiKeyRecord = dsMockUtils.createMockKeyRecord({
      PrimaryKey: dsMockUtils.createMockIdentityId(multiDid),
    });

    const mockKeyRecords = dsMockUtils.createQueryMock('identity', 'keyRecords');
    mockKeyRecords.mockResolvedValue(dsMockUtils.createMockOption(multiKeyRecord));

    identity = await getIdentityFromKeyRecord(multiSigKeyRecord, mockContext);

    expect(identity?.did).toEqual(multiDid);
  });

  it('should return null if the record is unassigned', async () => {
    const mockContext = dsMockUtils.getContextInstance();

    const unassignedKeyRecord = dsMockUtils.createMockKeyRecord({
      MultiSigSignerKey: dsMockUtils.createMockAccountId(
        dsMockUtils.createMockAccountId('someAddress')
      ),
    });

    const mockKeyRecords = dsMockUtils.createQueryMock('identity', 'keyRecords');
    mockKeyRecords.mockResolvedValue(dsMockUtils.createMockOption());

    const result = await getIdentityFromKeyRecord(unassignedKeyRecord, mockContext);

    expect(result).toBeNull();
  });
});

describe('asChildIdentity', () => {
  it('should return child identity instance', () => {
    const mockContext = dsMockUtils.getContextInstance();

    const childDid = 'childDid';
    const childIdentity = entityMockUtils.getChildIdentityInstance({
      did: childDid,
    });

    let result = asChildIdentity(childDid, mockContext);

    expect(result).toEqual(expect.objectContaining({ did: childDid }));

    result = asChildIdentity(childIdentity, mockContext);

    expect(result).toEqual(expect.objectContaining({ did: childDid }));
  });
});
