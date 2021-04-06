import sinon from 'sinon';

import { Context, Entity } from '~/internal';
import * as utilsInternalModule from '~/utils/internal';

describe('Entity class', () => {
  const serializeStub = sinon.stub(utilsInternalModule, 'serialize');
  describe('method: generateUuid', () => {
    test("should generate the Entity's UUID", async () => {
      serializeStub
        .withArgs('Entity', {
          did: 'abc',
        })
        .returns('uuid');
      const result = Entity.generateUuid({ did: 'abc' });
      expect(result).toBe('uuid');
    });
  });

  describe('method: unserialize', () => {
    let unserializeStub: sinon.SinonStub;

    beforeAll(() => {
      unserializeStub = sinon.stub(utilsInternalModule, 'unserialize');
    });

    test('should throw an error if the string is not related to an Entity Unique Identifier', async () => {
      unserializeStub.returns(undefined);
      expect(() => Entity.unserialize('def')).toThrow(
        "The string doesn't correspond to the UUID of type Entity"
      );
    });

    test('should return an Entity Unique Identifier object', async () => {
      const fakeReturn = { someIdentifier: 'abc' };
      unserializeStub.returns(fakeReturn);
      expect(Entity.unserialize('def')).toEqual(fakeReturn);
    });
  });

  describe('method: isEqual', () => {
    test('should return whether the entities are the same', () => {
      serializeStub.withArgs('Entity', { foo: 'bar' }).returns('first');
      serializeStub.withArgs('Entity', { bar: 'baz' }).returns('second');

      const first = new Entity({ foo: 'bar' }, {} as Context);
      const second = new Entity({ bar: 'baz' }, {} as Context);

      expect(first.isEqual(first)).toBe(true);
      expect(first.isEqual(second)).toBe(false);
      expect(second.isEqual(first)).toBe(false);
    });
  });
});
