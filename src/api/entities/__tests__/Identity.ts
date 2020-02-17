import { Balance } from '@polymathnetwork/polkadot/types/interfaces';
import { ImportMock, StaticMockManager } from 'ts-mock-imports';

import { Entity } from '~/api/entities/Entity';
import { Identity } from '~/api/entities/Identity';
import * as contextModule from '~/Context';
import * as utils from '~/utils';

describe('Identity class', () => {
  let mockContext: StaticMockManager<contextModule.Context>;

  beforeEach(() => {
    mockContext = ImportMock.mockStaticClass(contextModule, 'Context');
  });

  afterEach(() => {
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
      const fn = jest.fn(
        async (): Promise<Balance> => {
          return (1 as unknown) as Balance;
        }
      );
      mockContext.set('polymeshApi', {
        query: {
          balances: {
            identityBalance: fn,
          },
        },
      });
      const identity = new Identity({ did: 'abc' }, mockContext.getMockInstance());
      await identity.getPolyBalance();
      expect(fn).toHaveBeenCalledWith('abc');
    });
  });
});
