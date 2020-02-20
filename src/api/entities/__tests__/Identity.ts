import sinon from 'sinon';
import { ImportMock } from 'ts-mock-imports';

import { Identity } from '~/api/entities';
import { Entity } from '~/base';
import { PolkadotMockFactory } from '~/testUtils/mocks';
import * as utils from '~/utils';

describe('Identity class', () => {
  const polkadotMockFactory = new PolkadotMockFactory();

  polkadotMockFactory.initMocks({ mockContext: {} });

  afterEach(() => {
    polkadotMockFactory.reset();
  });

  test('should extend entity', () => {
    expect(Identity.prototype instanceof Entity).toBe(true);
  });

  describe('constructor', () => {
    test('should assign did and uuid to instance', () => {
      const did = 'abc';
      const context = polkadotMockFactory.getContextInstance();
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

  describe('method: getIdentityBalance', () => {
    test("should return the identity's POLY balance", async () => {
      const identityBalanceStub = polkadotMockFactory.createQueryStub(
        'balances',
        'identityBalance'
      );
      const identity = new Identity({ did: 'abc' }, polkadotMockFactory.getContextInstance());
      await identity.getIdentityBalance();
      sinon.assert.calledOnce(identityBalanceStub);
    });
  });
});
