import * as createTypeModule from '@polymathnetwork/polkadot/types/create/createType';
import * as registryModule from '@polymathnetwork/polkadot/types/create/registry';
import { Balance, IdentityId } from '@polymathnetwork/polkadot/types/interfaces';
import sinon, { SinonStub } from 'sinon';
import { ImportMock, MockManager, StaticMockManager } from 'ts-mock-imports';

import * as contextModule from '~/base/Context';
import {
  balanceToNumber,
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
  let mockContext: StaticMockManager<contextModule.Context>;
  let mockRegistry: MockManager<registryModule.TypeRegistry>;
  let mockCreateType: SinonStub;

  beforeEach(() => {
    mockContext = ImportMock.mockStaticClass(contextModule, 'Context');
    mockRegistry = ImportMock.mockClass(registryModule, 'TypeRegistry');
    mockCreateType = ImportMock.mockFunction(createTypeModule, 'createType', 'type');
  });

  afterEach(() => {
    mockContext.restore();
    mockRegistry.restore();
    mockCreateType.restore();
  });

  test('should stringToIdentityId being called with provided arguments', () => {
    mockContext.set('polymeshApi', {
      registry: mockRegistry.getMockInstance(),
    });
    const identity = 'IdentityObject';
    const context = mockContext.getMockInstance();
    stringToIdentityId(identity, context);
    sinon.assert.calledWith(mockCreateType, context.polymeshApi.registry, 'IdentityId', identity);
  });

  test('should identityIdToString returns an string', () => {
    const toStringStub = sinon.stub().returns('IdentityString');
    const identityId = ({
      toString: toStringStub,
    } as unknown) as IdentityId;

    const result = identityIdToString(identityId);
    sinon.assert.calledOnce(toStringStub);
    sinon.assert.match(typeof result === 'string', true);
  });
});

describe('numberToBalance and balanceToNumber', () => {
  let mockContext: StaticMockManager<contextModule.Context>;
  let mockRegistry: MockManager<registryModule.TypeRegistry>;
  let mockCreateType: SinonStub;

  beforeEach(() => {
    mockContext = ImportMock.mockStaticClass(contextModule, 'Context');
    mockRegistry = ImportMock.mockClass(registryModule, 'TypeRegistry');
    mockCreateType = ImportMock.mockFunction(createTypeModule, 'createType', 'type');
  });

  afterEach(() => {
    mockContext.restore();
    mockRegistry.restore();
    mockCreateType.restore();
  });

  test('should numberToBalance being called with provided arguments', () => {
    mockContext.set('polymeshApi', {
      registry: mockRegistry.getMockInstance(),
    });

    const value = 100;
    const context = mockContext.getMockInstance();
    numberToBalance(value, context);
    sinon.assert.calledWith(mockCreateType, context.polymeshApi.registry, 'Balance', value);
  });

  test('should balanceToNumber returns a base 6 number', () => {
    const toStringStub = sinon.stub().returns('100');
    const balance = ({
      toString: toStringStub,
    } as unknown) as Balance;

    const result = balanceToNumber(balance);
    sinon.assert.calledOnce(toStringStub);
    sinon.assert.match(typeof result === 'number', true);
    sinon.assert.match(result === 100 / Math.pow(10, 6), true);
  });
});
