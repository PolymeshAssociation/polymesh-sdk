import * as createTypeModule from '@polymathnetwork/polkadot/types/create/createType';
import { Balance, IdentityId } from '@polymathnetwork/polkadot/types/interfaces';
import BigNumber from 'bignumber.js';
import sinon, { SinonStub } from 'sinon';
import { ImportMock } from 'ts-mock-imports';

import { PolkadotMockFactory } from '~/testUtils/mocks';
import {
  balanceToBigNumber,
  delay,
  identityIdToString,
  numberToBalance,
  serialize,
  stringToIdentityId,
  unserialize,
} from '~/utils';

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
      .returns(fakeResult)
      .withArgs(context.polymeshApi.registry, 'IdentityId', identity);

    const result = stringToIdentityId(identity, context);

    sinon.assert.match(result === fakeResult, true);
  });

  test('identityIdToString should convert an IdentityId to a did string', () => {
    const fakeResult = 'IdentityString';
    const toStringStub = sinon.stub().returns(fakeResult);
    const identityId = ({
      toString: toStringStub,
    } as unknown) as IdentityId;

    const result = identityIdToString(identityId);
    sinon.assert.match(result === fakeResult, true);
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

  test('numberToBalance should convert a number or BigNumber to a polkadot Balance object', () => {
    const value = new BigNumber(100);
    const fakeResult = ('100' as unknown) as Balance;
    const context = polkadotMockFactory.getContextInstance();

    mockCreateType.returns(fakeResult).withArgs(context.polymeshApi.registry, 'Balance', value);

    const result = numberToBalance(value, context);

    sinon.assert.match(result === fakeResult, true);
  });

  test('balanceToBigNumber should convert a polkadot Balance object to a BigNumber', () => {
    const fakeResult = new BigNumber(100);
    const toStringStub = sinon.stub().returns(fakeResult);
    const balance = ({
      toString: toStringStub,
    } as unknown) as Balance;

    const result = balanceToBigNumber(balance);
    sinon.assert.match(result.isEqualTo(fakeResult.div(Math.pow(10, 6))), true);
  });
});
