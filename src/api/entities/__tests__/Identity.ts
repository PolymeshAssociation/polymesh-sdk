import sinon from 'sinon';
import { ImportMock, StaticMockManager } from 'ts-mock-imports';

import { Identity } from '~/api/entities/Identity';
import { Entity } from '~/base/Entity';
import * as contextModule from '~/Context';
import { PolkadotMockFactory } from '~/testUtils/mocks/PolkadotMockFactory';
import * as utils from '~/utils';

describe('Identity class', () => {
  let mockContext: StaticMockManager<contextModule.Context>;
  let polkadotMockFactory: PolkadotMockFactory;

  beforeEach(() => {
    mockContext = ImportMock.mockStaticClass(contextModule, 'Context');
    polkadotMockFactory = new PolkadotMockFactory();
  });

  afterEach(() => {
    mockContext.restore();
    polkadotMockFactory.reset();
  });

  test('should extend entity', () => {
    expect(Identity.prototype instanceof Entity).toBe(true);
  });

  describe('constructor', () => {
    test('should assign did and uuid to instance', () => {
      const did = 'abc';
      const context = mockContext.getMockInstance();
      const identity = new Identity({ did }, context);

      expect(identity.did).toBe(did);
      expect(identity.uuid).toBeDefined();
    });
  });

  describe('method: generateUuid', () => {
    test("should generate the Identity's UUID", async () => {
      ImportMock.mockFunction(utils, 'serialize')
        .withArgs('identity', {
          did: 'abc',
        })
        .returns('uuid');
      const result = Identity.generateUuid({ did: 'abc' });
      expect(result).toBe('uuid');
    });
  });

  describe('method: unserialize', () => {
    const mockUnserialize = ImportMock.mockFunction(utils, 'unserialize');

    test('should throw error if the string is not related to an Identity Unique Identifier', async () => {
      mockUnserialize.returns({ token: 'abc' });
      expect(() => Identity.unserialize('def')).toThrow(
        'The string is not related to an Identity Unique Identifier'
      );
    });

    test('should return an Identity Unique Identifier object', async () => {
      const fakeReturn = { did: 'abc' };
      mockUnserialize.returns(fakeReturn);
      expect(Identity.unserialize('def')).toEqual(fakeReturn);
    });
  });

  describe('method: getPolyBalance', () => {
    test("should return the identity's POLY balance", async () => {
      const identityBalanceStub = polkadotMockFactory.createQueryStub(
        'balances',
        'identityBalance'
      );
      mockContext.set('polymeshApi', polkadotMockFactory.getInstance());
      const identity = new Identity({ did: 'abc' }, mockContext.getMockInstance());
      await identity.getPolyBalance();
      sinon.assert.calledOnce(identityBalanceStub);
    });
  });
});
