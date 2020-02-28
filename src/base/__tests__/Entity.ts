import { ImportMock } from 'ts-mock-imports';

import { PolkadotMockFactory } from '~/testUtils/mocks';
import * as utils from '~/utils';

import { Entity } from '../Entity';

describe('Entity class', () => {
  const polkadotMockFactory = new PolkadotMockFactory();

  polkadotMockFactory.initMocks({ mockContext: true });

  afterEach(() => {
    polkadotMockFactory.reset();
  });

  afterAll(() => {
    polkadotMockFactory.cleanup();
  });

  describe('method: generateUuid', () => {
    test("should generate the Entity's UUID", async () => {
      ImportMock.mockFunction(utils, 'serialize')
        .withArgs('Entity', {
          did: 'abc',
        })
        .returns('uuid');
      const result = Entity.generateUuid({ did: 'abc' });
      expect(result).toBe('uuid');
    });
  });

  describe('method: unserialize', () => {
    const mockUnserialize = ImportMock.mockFunction(utils, 'unserialize');

    test('should throw an error if the string is not related to an Entity Unique Identifier', async () => {
      mockUnserialize.returns(undefined);
      expect(() => Entity.unserialize('def')).toThrow(
        "The string doesn't correspond to the UUID of type Entity"
      );
    });

    test('should return an Entity Unique Identifier object', async () => {
      const fakeReturn = { someIdentifier: 'abc' };
      mockUnserialize.returns(fakeReturn);
      expect(Entity.unserialize('def')).toEqual(fakeReturn);
    });
  });
});
