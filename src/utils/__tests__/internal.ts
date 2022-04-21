import { ISubmittableResult } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';
import { IdentityId, ModuleName, PortfolioName } from 'polymesh-types/types';
import sinon from 'sinon';

import { Asset, Context, PolymeshError, PostTransactionValue, Procedure } from '~/internal';
import { ClaimScopeTypeEnum } from '~/middleware/types';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';
import { getWebSocketInstance, MockWebSocket } from '~/testUtils/mocks/dataSources';
import {
  CaCheckpointType,
  CalendarPeriod,
  CalendarUnit,
  ClaimType,
  CountryCode,
  ErrorCode,
  ProcedureMethod,
  TxTags,
} from '~/types';
import { tuple } from '~/types/utils';
import { MAX_TICKER_LENGTH } from '~/utils/constants';

import {
  assertAddressValid,
  assertExpectedChainVersion,
  assertIsInteger,
  assertIsPositive,
  assertTickerValid,
  asTicker,
  calculateNextKey,
  createClaim,
  createProcedureMethod,
  delay,
  filterEventRecords,
  getCheckpointValue,
  getDid,
  getExemptedIds,
  getIdentity,
  getPortfolioIdByName,
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

jest.mock(
  '~/api/entities/Asset',
  require('~/testUtils/mocks/entities').mockAssetModule('~/api/entities/Asset')
);
jest.mock('websocket', require('~/testUtils/mocks/dataSources').mockWebSocketModule());

describe('delay', () => {
  beforeAll(() => {
    jest.useFakeTimers('legacy');
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

describe('unwrapValue', () => {
  it('should unwrap a Post Transaction Value', async () => {
    const wrapped = new PostTransactionValue(async () => 1);
    await wrapped.run({} as ISubmittableResult);

    const unwrapped = unwrapValue(wrapped);

    expect(unwrapped).toEqual(1);
  });

  it('should return a non Post Transaction Value as is', () => {
    expect(unwrapValue(1)).toBe(1);
  });
});

describe('unwrapValues', () => {
  it('should unwrap all Post Transaction Values in the array', async () => {
    const values = [1, 2, 3, 4, 5];
    const wrapped = values.map(value => new PostTransactionValue(async () => value));
    await Promise.all(wrapped.map(postValue => postValue.run({} as ISubmittableResult)));

    const unwrapped = unwrapValues(wrapped);

    expect(unwrapped).toEqual(values);
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
      `Event "${mod}.${eventName}" wasn't fired even though the corresponding transaction was completed. Please report this to the Polymath team`
    );
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

describe('getPortfolioIdByName', () => {
  let context: Context;
  let nameToNumberStub: sinon.SinonStub;
  let portfoliosStub: sinon.SinonStub;
  let rawName: PortfolioName;
  let identityId: IdentityId;

  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
    rawName = dsMockUtils.createMockText('someName');
    identityId = dsMockUtils.createMockIdentityId('someDid');
    nameToNumberStub = dsMockUtils.createQueryStub('portfolio', 'nameToNumber');
    portfoliosStub = dsMockUtils.createQueryStub('portfolio', 'portfolios');
  });

  afterEach(() => {
    dsMockUtils.reset();
    entityMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  it('should return null if no portfolio with given name is found', async () => {
    nameToNumberStub.returns(dsMockUtils.createMockU64(new BigNumber(1)));
    portfoliosStub.returns(dsMockUtils.createMockText('randomName'));

    const result = await getPortfolioIdByName(identityId, rawName, context);
    expect(result).toBeNull();
  });

  it('should return portfolio number for given portfolio name', async () => {
    nameToNumberStub.returns(dsMockUtils.createMockU64(new BigNumber(2)));

    let result = await getPortfolioIdByName(identityId, rawName, context);
    expect(result).toEqual(new BigNumber(2));

    nameToNumberStub.returns(dsMockUtils.createMockU64(new BigNumber(1)));
    portfoliosStub.returns(rawName);

    result = await getPortfolioIdByName(identityId, rawName, context);
    expect(result).toEqual(new BigNumber(1));
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
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  beforeEach(() => {
    client = getWebSocketInstance();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  it('should resolve if it receives expected chain version', () => {
    const signal = assertExpectedChainVersion('ws://example.com');
    client.onopen();

    return expect(signal).resolves.not.toThrow();
  });

  it('should throw an error given an unexpected version', () => {
    const signal = assertExpectedChainVersion('ws://example.com');
    client.sendVersion('3.0.0');
    const expectedError = new PolymeshError({
      code: ErrorCode.FatalError,
      message: 'Unsupported Polymesh version. Please upgrade the SDK',
    });
    return expect(signal).rejects.toThrowError(expectedError);
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
