import { bool } from '@polkadot/types';
import * as createTypeModule from '@polkadot/types/create/createType';
import { Balance, Moment } from '@polkadot/types/interfaces';
import { ISubmittableResult } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';
import {
  AssetIdentifier,
  AssetType,
  FundingRoundName,
  IdentifierType,
  IdentityId,
  Ticker,
  TokenName,
} from 'polymesh-types/types';
import sinon, { SinonStub } from 'sinon';

import { PostTransactionValue } from '~/base';
import { polkadotMockUtils } from '~/testUtils/mocks';
import { KnownTokenIdentifierType, KnownTokenType } from '~/types';

import {
  assetIdentifierToString,
  assetTypeToString,
  balanceToBigNumber,
  booleanToBool,
  boolToBoolean,
  dateToMoment,
  delay,
  findEventRecord,
  fundingRoundNameToString,
  identifierTypeToString,
  identityIdToString,
  momentToDate,
  numberToBalance,
  serialize,
  stringToAssetIdentifier,
  stringToFundingRoundName,
  stringToIdentityId,
  stringToTicker,
  stringToTokenName,
  tickerToString,
  tokenIdentifierTypeToIdentifierType,
  tokenNameToString,
  tokenTypeToAssetType,
  unserialize,
  unwrapValues,
} from '../';

jest.mock(
  '@polkadot/api',
  require('~/testUtils/mocks/polkadot').mockPolkadotModule('@polkadot/api')
);
jest.mock('~/context', require('~/testUtils/mocks/polkadot').mockContextModule('~/context'));

describe('delay', () => {
  jest.useFakeTimers();

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

describe('stringToIdentityId and identityIdToString', () => {
  let mockCreateType: SinonStub;

  beforeAll(() => {
    polkadotMockUtils.initMocks();
  });

  beforeEach(() => {
    mockCreateType = sinon.stub(createTypeModule, 'createType');
  });

  afterEach(() => {
    polkadotMockUtils.reset();
    mockCreateType.restore();
  });

  afterAll(() => {
    polkadotMockUtils.cleanup();
  });

  test('stringToIdentityId should convert a did string into an IdentityId', () => {
    const identity = 'IdentityObject';
    const fakeResult = ('type' as unknown) as IdentityId;
    const context = polkadotMockUtils.getContextInstance();

    mockCreateType
      .withArgs(context.polymeshApi.registry, 'IdentityId', identity)
      .returns(fakeResult);

    const result = stringToIdentityId(identity, context);

    expect(result).toBe(fakeResult);
  });

  test('identityIdToString should convert an IdentityId to a did string', () => {
    const fakeResult = 'IdentityString';
    const identityId = polkadotMockUtils.createMockIdentityId(fakeResult);

    const result = identityIdToString(identityId);
    expect(result).toBe(fakeResult);
  });
});

describe('numberToBalance and balanceToBigNumber', () => {
  let mockCreateType: SinonStub;

  beforeAll(() => {
    polkadotMockUtils.initMocks();
  });

  beforeEach(() => {
    mockCreateType = sinon.stub(createTypeModule, 'createType');
  });

  afterEach(() => {
    polkadotMockUtils.reset();
    mockCreateType.restore();
  });

  afterAll(() => {
    polkadotMockUtils.cleanup();
  });

  test('numberToBalance should convert a number to a polkadot Balance object', () => {
    const value = new BigNumber(100);
    const fakeResult = ('100' as unknown) as Balance;
    const context = polkadotMockUtils.getContextInstance();

    mockCreateType
      .withArgs(context.polymeshApi.registry, 'Balance', value.pow(Math.pow(10, 6)))
      .returns(fakeResult);

    const result = numberToBalance(value, context);

    expect(result).toBe(fakeResult);
  });

  test('balanceToBigNumber should convert a polkadot Balance object to a BigNumber', () => {
    const fakeResult = 100;
    const balance = polkadotMockUtils.createMockBalance(fakeResult);

    const result = balanceToBigNumber(balance);
    expect(result).toEqual(new BigNumber(fakeResult).div(Math.pow(10, 6)));
  });
});

describe('stringToTicker and tickerToString', () => {
  let mockCreateType: SinonStub;

  beforeAll(() => {
    polkadotMockUtils.initMocks();
  });

  beforeEach(() => {
    mockCreateType = sinon.stub(createTypeModule, 'createType');
  });

  afterEach(() => {
    polkadotMockUtils.reset();
    mockCreateType.restore();
  });

  afterAll(() => {
    polkadotMockUtils.cleanup();
  });

  test('stringToTicker should convert a string to a polkadot Ticker object', () => {
    const value = 'someTicker';
    const fakeResult = ('convertedTicker' as unknown) as Ticker;
    const context = polkadotMockUtils.getContextInstance();

    mockCreateType.withArgs(context.polymeshApi.registry, 'Ticker', value).returns(fakeResult);

    const result = stringToTicker(value, context);

    expect(result).toBe(fakeResult);
  });

  test('tickerToString should convert a polkadot Ticker object to a string', () => {
    const fakeResult = 'someTicker';
    const ticker = polkadotMockUtils.createMockTicker(fakeResult);

    const result = tickerToString(ticker);
    expect(result).toEqual(fakeResult);
  });
});

describe('stringToTokenName and tokenNameToString', () => {
  let mockCreateType: SinonStub;

  beforeAll(() => {
    polkadotMockUtils.initMocks();
  });

  beforeEach(() => {
    mockCreateType = sinon.stub(createTypeModule, 'createType');
  });

  afterEach(() => {
    polkadotMockUtils.reset();
    mockCreateType.restore();
  });

  afterAll(() => {
    polkadotMockUtils.cleanup();
  });

  test('stringToTokenName should convert a string to a polkadot TokenName object', () => {
    const value = 'someName';
    const fakeResult = ('convertedName' as unknown) as TokenName;
    const context = polkadotMockUtils.getContextInstance();

    mockCreateType.withArgs(context.polymeshApi.registry, 'TokenName', value).returns(fakeResult);

    const result = stringToTokenName(value, context);

    expect(result).toEqual(fakeResult);
  });

  test('tokenNameToString should convert a polkadot TokenName object to a string', () => {
    const fakeResult = 'someTokenName';
    const tokenName = polkadotMockUtils.createMockTokenName(fakeResult);

    const result = tokenNameToString(tokenName);
    expect(result).toEqual(fakeResult);
  });
});

describe('booleanToBool and boolToBoolean', () => {
  let mockCreateType: SinonStub;

  beforeAll(() => {
    polkadotMockUtils.initMocks();
  });

  beforeEach(() => {
    mockCreateType = sinon.stub(createTypeModule, 'createType');
  });

  afterEach(() => {
    polkadotMockUtils.reset();
    mockCreateType.restore();
  });

  afterAll(() => {
    polkadotMockUtils.cleanup();
  });

  test('booleanToBool should convert a boolean to a polkadot bool object', () => {
    const value = true;
    const fakeResult = ('true' as unknown) as bool;
    const context = polkadotMockUtils.getContextInstance();

    mockCreateType.withArgs(context.polymeshApi.registry, 'bool', value).returns(fakeResult);

    const result = booleanToBool(value, context);

    expect(result).toEqual(fakeResult);
  });

  test('boolToBoolean should convert a polkadot bool object to a boolean', () => {
    const fakeResult = true;
    const mockBool = polkadotMockUtils.createMockBool(fakeResult);

    const result = boolToBoolean(mockBool);
    expect(result).toEqual(fakeResult);
  });
});

describe('dateToMoment and momentToDate', () => {
  let mockCreateType: SinonStub;

  beforeAll(() => {
    polkadotMockUtils.initMocks();
  });

  beforeEach(() => {
    mockCreateType = sinon.stub(createTypeModule, 'createType');
  });

  afterEach(() => {
    polkadotMockUtils.reset();
    mockCreateType.restore();
  });

  afterAll(() => {
    polkadotMockUtils.cleanup();
  });

  test('dateToMoment should convert a Date to a polkadot Moment object', () => {
    const value = new Date();
    const fakeResult = (10000 as unknown) as Moment;
    const context = polkadotMockUtils.getContextInstance();

    mockCreateType
      .withArgs(context.polymeshApi.registry, 'Moment', Math.round(value.getTime()))
      .returns(fakeResult);

    const result = dateToMoment(value, context);

    expect(result).toBe(fakeResult);
  });

  test('momentToDate should convert a polkadot Moment object to a Date', () => {
    const fakeResult = 10000;
    const moment = polkadotMockUtils.createMockMoment(fakeResult);

    const result = momentToDate(moment);
    expect(result).toEqual(new Date(fakeResult));
  });
});

describe('tokenTypeToAssetType and assetTypeToString', () => {
  let mockCreateType: SinonStub;

  beforeAll(() => {
    polkadotMockUtils.initMocks();
  });

  beforeEach(() => {
    mockCreateType = sinon.stub(createTypeModule, 'createType');
  });

  afterEach(() => {
    polkadotMockUtils.reset();
    mockCreateType.restore();
  });

  afterAll(() => {
    polkadotMockUtils.cleanup();
  });

  test('tokenTypeToAssetType should convert a TokenType to a polkadot AssetType object', () => {
    const value = KnownTokenType.Commodity;
    const fakeResult = ('CommodityEnum' as unknown) as AssetType;
    const context = polkadotMockUtils.getContextInstance();

    mockCreateType.withArgs(context.polymeshApi.registry, 'AssetType', value).returns(fakeResult);

    const result = tokenTypeToAssetType(value, context);

    expect(result).toBe(fakeResult);
  });

  test('assetTypeToString should convert a polkadot AssetType object to a string', () => {
    let fakeResult = KnownTokenType.Commodity;
    let assetType = polkadotMockUtils.createMockAssetType(fakeResult);

    let result = assetTypeToString(assetType);
    expect(result).toEqual(fakeResult);

    fakeResult = KnownTokenType.Equity;
    assetType = polkadotMockUtils.createMockAssetType(fakeResult);

    result = assetTypeToString(assetType);
    expect(result).toEqual(fakeResult);

    fakeResult = KnownTokenType.Debt;
    assetType = polkadotMockUtils.createMockAssetType(fakeResult);

    result = assetTypeToString(assetType);
    expect(result).toEqual(fakeResult);

    fakeResult = KnownTokenType.StructuredProduct;
    assetType = polkadotMockUtils.createMockAssetType(fakeResult);

    result = assetTypeToString(assetType);
    expect(result).toEqual(fakeResult);

    const fakeType = 'otherType';
    assetType = polkadotMockUtils.createMockAssetType({
      custom: polkadotMockUtils.createMockBytes(fakeType),
    });

    result = assetTypeToString(assetType);
    expect(result).toEqual(fakeType);
  });
});

describe('tokenIdentifierTypeToIdentifierType and identifierTypeToString', () => {
  let mockCreateType: SinonStub;

  beforeAll(() => {
    polkadotMockUtils.initMocks();
  });

  beforeEach(() => {
    mockCreateType = sinon.stub(createTypeModule, 'createType');
  });

  afterEach(() => {
    polkadotMockUtils.reset();
    mockCreateType.restore();
  });

  afterAll(() => {
    polkadotMockUtils.cleanup();
  });

  test('tokenIdentifierTypeToIdentifierType should convert a TokenIdentifierType to a polkadot IdentifierType object', () => {
    const value = KnownTokenIdentifierType.Isin;
    const fakeResult = ('IsinEnum' as unknown) as IdentifierType;
    const context = polkadotMockUtils.getContextInstance();

    mockCreateType
      .withArgs(context.polymeshApi.registry, 'IdentifierType', value)
      .returns(fakeResult);

    const result = tokenIdentifierTypeToIdentifierType(value, context);

    expect(result).toBe(fakeResult);
  });

  test('identifierTypeToString should convert a polkadot IdentifierType object to a string', () => {
    let fakeResult = KnownTokenIdentifierType.Isin;
    let identifierType = polkadotMockUtils.createMockIdentifierType(fakeResult);

    let result = identifierTypeToString(identifierType);
    expect(result).toEqual(fakeResult);

    fakeResult = KnownTokenIdentifierType.Cusip;
    identifierType = polkadotMockUtils.createMockIdentifierType(fakeResult);

    result = identifierTypeToString(identifierType);
    expect(result).toEqual(fakeResult);

    const fakeType = 'otherType';
    identifierType = polkadotMockUtils.createMockIdentifierType({
      custom: polkadotMockUtils.createMockBytes(fakeType),
    });

    result = identifierTypeToString(identifierType);
    expect(result).toEqual(fakeType);
  });
});

describe('stringToAssetIdentifier and assetIdentifierToString', () => {
  let mockCreateType: SinonStub;

  beforeAll(() => {
    polkadotMockUtils.initMocks();
  });

  beforeEach(() => {
    mockCreateType = sinon.stub(createTypeModule, 'createType');
  });

  afterEach(() => {
    polkadotMockUtils.reset();
    mockCreateType.restore();
  });

  afterAll(() => {
    polkadotMockUtils.cleanup();
  });

  test('stringToAssetIdentifier should convert a string to a polkadot AssetIdentifier object', () => {
    const value = 'someIdentifier';
    const fakeResult = ('convertedIdentifier' as unknown) as AssetIdentifier;
    const context = polkadotMockUtils.getContextInstance();

    mockCreateType
      .withArgs(context.polymeshApi.registry, 'AssetIdentifier', value)
      .returns(fakeResult);

    const result = stringToAssetIdentifier(value, context);

    expect(result).toBe(fakeResult);
  });

  test('assetIdentifierToString should convert a polkadot AssetIdentifier object to a string', () => {
    const fakeResult = 'someIdentifier';
    const identifierType = polkadotMockUtils.createMockAssetIdentifier(fakeResult);

    const result = assetIdentifierToString(identifierType);
    expect(result).toEqual(fakeResult);
  });
});

describe('stringToFundingRoundName and fundingRoundNameToString', () => {
  let mockCreateType: SinonStub;

  beforeAll(() => {
    polkadotMockUtils.initMocks();
  });

  beforeEach(() => {
    mockCreateType = sinon.stub(createTypeModule, 'createType');
  });

  afterEach(() => {
    polkadotMockUtils.reset();
    mockCreateType.restore();
  });

  afterAll(() => {
    polkadotMockUtils.cleanup();
  });

  test('stringToFundingRoundName should convert a string to a polkadot FundingRoundName object', () => {
    const value = 'someName';
    const fakeResult = ('convertedName' as unknown) as FundingRoundName;
    const context = polkadotMockUtils.getContextInstance();

    mockCreateType
      .withArgs(context.polymeshApi.registry, 'FundingRoundName', value)
      .returns(fakeResult);

    const result = stringToFundingRoundName(value, context);

    expect(result).toEqual(fakeResult);
  });

  test('fundingRoundNameToString should convert a polkadot FundingRoundName object to a string', () => {
    const fakeResult = 'someFundingRoundName';
    const tokenName = polkadotMockUtils.createMockFundingRoundName(fakeResult);

    const result = fundingRoundNameToString(tokenName);
    expect(result).toEqual(fakeResult);
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

describe('findEventRecord', () => {
  const findRecordStub = sinon.stub();
  const mockReceipt = ({
    findRecord: findRecordStub,
  } as unknown) as ISubmittableResult;

  afterEach(() => {
    findRecordStub.reset();
  });

  test('returns the corresponding Event Record', () => {
    const mod = 'asset';
    const eventName = 'TickerRegistered';
    const fakeResult = 'event';
    findRecordStub.withArgs(mod, eventName).returns(fakeResult);

    const eventRecord = findEventRecord(mockReceipt, mod, eventName);

    expect(eventRecord).toBe(fakeResult);
  });

  test("throws if the Event wasn't fired", () => {
    const mod = 'asset';
    const eventName = 'TickerRegistered';
    findRecordStub.withArgs(mod, eventName).returns(undefined);

    expect(() => findEventRecord(mockReceipt, mod, eventName)).toThrow(
      `Event "${mod}.${eventName}" wasnt't fired even though the corresponding transaction was completed. Please report this to the Polymath team`
    );
  });
});
