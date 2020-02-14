import { Balance } from '@polymathnetwork/polkadot/types/interfaces';
import { ImportMock } from 'ts-mock-imports';
import { Identity } from '~/api/entities/Identity';
import { Entity } from '~/api/entities/Entity';
import * as contextModule from '~/Context';
import * as utils from '~/utils';

describe('Identity class', () => {
  const mockContext = ImportMock.mockStaticClass(contextModule, 'Context');

  afterAll(() => {
    mockContext.restore();
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
    test('should retrieve a non empty string', async () => {
      const result = Identity.generateUuid({ did: 'abc' });
      expect(result).not.toBe('');
      expect(typeof result).toBe(typeof 'string');
    });
  });

  describe('method: unserialize', () => {
    const mockUnserialize = ImportMock.mockFunction(utils, 'unserialize');

    test('should throw error if the string is not related to an Identity Unique Identifier', async () => {
      mockUnserialize.returns({ token: 'abc' });
      expect(() => Identity.unserialize('def')).toThrow(
        'The string is not related to an Identity Unique Identifiers Pojo'
      );
    });

    test('should return an Identity Unique Identifier object', async () => {
      mockUnserialize.returns({ did: 'abc' });
      expect(Identity.unserialize('def')).toEqual({ did: 'abc' });
    });
  });

  describe('method: getPolyBalance', () => {
    test('should return the account identity poly balance', async () => {
      mockContext.set('polymeshApi', {
        query: {
          balances: {
            identityBalance: async (): Promise<Balance> => {
              return (1 as unknown) as Balance;
            },
          },
        },
      });
      const identity = new Identity({ did: 'abc' }, mockContext.getMockInstance());
      const balance = await identity.getPolyBalance();
      expect(balance).toEqual(1);
    });
  });
});
