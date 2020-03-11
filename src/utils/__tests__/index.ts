import { bool } from '@polymathnetwork/polkadot/types';
import * as createTypeModule from '@polymathnetwork/polkadot/types/create/createType';
import {
  Balance,
  IdentityId,
  Moment,
  Ticker,
  TokenName,
} from '@polymathnetwork/polkadot/types/interfaces';
import { ISubmittableResult } from '@polymathnetwork/polkadot/types/types';
import BigNumber from 'bignumber.js';
import sinon, { SinonStub } from 'sinon';
import { ImportMock } from 'ts-mock-imports';

import { PostTransactionValue } from '~/base';
import { PolkadotMockFactory } from '~/testUtils/mocks';

import {
  balanceToBigNumber,
  boolToBoolean,
  dateToMoment,
  delay,
  findEventRecord,
  identityIdToString,
  momentToDate,
  numberToBalance,
  serialize,
  stringToIdentityId,
  stringToTicker,
  tickerToString,
  tokenNameToString,
  unserialize,
  unwrapValues,
} from '../';

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
  const polkadotMockFactory = new PolkadotMockFactory();
  polkadotMockFactory.initMocks({ mockContext: true });

  let mockCreateType: SinonStub;

  beforeEach(() => {
    mockCreateType = ImportMock.mockFunction(createTypeModule, 'createType', 'type');
  });

  afterEach(() => {
    polkadotMockFactory.reset();
    mockCreateType.restore();
  });

  afterAll(() => {
    polkadotMockFactory.cleanup();
  });

  test('stringToIdentityId should convert a did string into an IdentityId', () => {
    const identity = 'IdentityObject';
    const fakeResult = ('type' as unknown) as IdentityId;
    const context = polkadotMockFactory.getContextInstance();

    mockCreateType
      .withArgs(context.polymeshApi.registry, 'IdentityId', identity)
      .returns(fakeResult);

    const result = stringToIdentityId(identity, context);

    expect(result).toBe(fakeResult);
  });

  test('identityIdToString should convert an IdentityId to a did string', () => {
    const fakeResult = 'IdentityString';
    const toStringStub = sinon.stub().returns(fakeResult);
    const identityId = ({
      toString: toStringStub,
    } as unknown) as IdentityId;

    const result = identityIdToString(identityId);
    expect(result).toBe(fakeResult);
  });
});

describe('numberToBalance and balanceToBigNumber', () => {
  const polkadotMockFactory = new PolkadotMockFactory();
  polkadotMockFactory.initMocks({ mockContext: true });

  let mockCreateType: SinonStub;

  beforeEach(() => {
    mockCreateType = ImportMock.mockFunction(createTypeModule, 'createType', 'type');
  });

  afterEach(() => {
    polkadotMockFactory.reset();
    mockCreateType.restore();
  });

  afterAll(() => {
    polkadotMockFactory.cleanup();
  });

  test('numberToBalance should convert a number to a polkadot Balance object', () => {
    const value = new BigNumber(100);
    const fakeResult = ('100' as unknown) as Balance;
    const context = polkadotMockFactory.getContextInstance();

    mockCreateType
      .withArgs(context.polymeshApi.registry, 'Balance', value.pow(Math.pow(10, 6)))
      .returns(fakeResult);

    const result = numberToBalance(value, context);

    expect(result).toBe(fakeResult);
  });

  test('balanceToBigNumber should convert a polkadot Balance object to a BigNumber', () => {
    const fakeResult = new BigNumber(100);
    const balance = ({
      toString: sinon.stub().returns(fakeResult.toString()),
    } as unknown) as Balance;

    const result = balanceToBigNumber(balance);
    expect(result).toEqual(fakeResult.div(Math.pow(10, 6)));
  });
});

describe('stringToTicker and tickerToString', () => {
  const polkadotMockFactory = new PolkadotMockFactory();
  polkadotMockFactory.initMocks({ mockContext: true });

  let mockCreateType: SinonStub;

  beforeEach(() => {
    mockCreateType = ImportMock.mockFunction(createTypeModule, 'createType', 'type');
  });

  afterEach(() => {
    polkadotMockFactory.reset();
    mockCreateType.restore();
  });

  afterAll(() => {
    polkadotMockFactory.cleanup();
  });

  test('stringToTicker should convert a string to a polkadot Ticker object', () => {
    const value = 'someTicker';
    const fakeResult = ('someTicker' as unknown) as Ticker;
    const context = polkadotMockFactory.getContextInstance();

    mockCreateType.withArgs(context.polymeshApi.registry, 'Ticker', value).returns(fakeResult);

    const result = stringToTicker(value, context);

    expect(result).toBe(fakeResult);
  });

  test('tickerToString should convert a polkadot Ticker object to a string', () => {
    const fakeResult = 'someTicker';
    const ticker = ({
      toString: sinon.stub().returns(fakeResult),
    } as unknown) as Ticker;

    const result = tickerToString(ticker);
    expect(result).toEqual(fakeResult);
  });
});

describe('tokenNameToString', () => {
  test('tokenNameToString should convert a TokenName object to a string', () => {
    const fakeResult = 'someTokenName';
    const tokenName = ({
      toString: sinon.stub().returns(fakeResult),
    } as unknown) as TokenName;

    const result = tokenNameToString(tokenName);
    expect(result).toEqual(fakeResult);
  });
});

describe('boolToBoolean', () => {
  test('boolToBoolean should convert a bool object to a boolean', () => {
    const fakeResult = true;
    const bool = ({
      valueOf: sinon.stub().returns(fakeResult),
    } as unknown) as bool;

    const result = boolToBoolean(bool);
    expect(result).toEqual(fakeResult);
  });
});

describe('dateToMoment and momentToDate', () => {
  const polkadotMockFactory = new PolkadotMockFactory();
  polkadotMockFactory.initMocks({ mockContext: true });

  let mockCreateType: SinonStub;

  beforeEach(() => {
    mockCreateType = ImportMock.mockFunction(createTypeModule, 'createType', 'type');
  });

  afterEach(() => {
    polkadotMockFactory.reset();
    mockCreateType.restore();
  });

  afterAll(() => {
    polkadotMockFactory.cleanup();
  });

  test('dateToMoment should convert a Date to a polkadot Moment object', () => {
    const value = new Date();
    const fakeResult = (10000 as unknown) as Moment;
    const context = polkadotMockFactory.getContextInstance();

    mockCreateType
      .withArgs(context.polymeshApi.registry, 'Moment', Math.round(value.getTime()))
      .returns(fakeResult);

    const result = dateToMoment(value, context);

    expect(result).toBe(fakeResult);
  });

  test('momentToDate should convert a polkadot Moment object to a Date', () => {
    const fakeResult = 10000;
    const moment = ({
      toNumber: sinon.stub().returns(fakeResult),
    } as unknown) as Moment;

    const result = momentToDate(moment);
    expect(result).toEqual(new Date(fakeResult));
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
