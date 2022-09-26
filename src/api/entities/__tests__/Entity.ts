import { when } from 'jest-when';

import { Context, Entity } from '~/internal';
import * as utilsInternalModule from '~/utils/internal';

// eslint-disable-next-line require-jsdoc
class NonAbstract extends Entity<unknown, boolean> {
  // eslint-disable-next-line require-jsdoc
  public toHuman(): boolean {
    return true;
  }

  // eslint-disable-next-line require-jsdoc
  public async exists(): Promise<boolean> {
    return true;
  }
}

describe('Entity class', () => {
  afterAll(() => {
    jest.restoreAllMocks();
  });

  const serializeSpy = jest.spyOn(utilsInternalModule, 'serialize');
  describe('method: generateUuid', () => {
    it("should generate the Entity's UUID", async () => {
      when(serializeSpy)
        .calledWith('Entity', {
          did: 'abc',
        })
        .mockReturnValue('uuid');
      const result = Entity.generateUuid({ did: 'abc' });
      expect(result).toBe('uuid');
    });
  });

  describe('method: unserialize', () => {
    let unserializeSpy: jest.SpyInstance;

    beforeAll(() => {
      unserializeSpy = jest.spyOn(utilsInternalModule, 'unserialize');
    });

    it('should throw an error if the string is not related to an Entity Unique Identifier', async () => {
      unserializeSpy.mockReturnValue(undefined);
      expect(() => Entity.unserialize('def')).toThrow(
        "The string doesn't correspond to the UUID of type Entity"
      );
    });

    it('should return an Entity Unique Identifier object', async () => {
      const fakeReturn = { someIdentifier: 'abc' };
      unserializeSpy.mockReturnValue(fakeReturn);
      expect(Entity.unserialize('def')).toEqual(fakeReturn);
    });
  });

  describe('method: isEqual', () => {
    it('should return whether the entities are the same', () => {
      when(serializeSpy).calledWith('NonAbstract', { foo: 'bar' }).mockReturnValue('first');
      when(serializeSpy).calledWith('NonAbstract', { bar: 'baz' }).mockReturnValue('second');

      const first = new NonAbstract({ foo: 'bar' }, {} as Context);
      const second = new NonAbstract({ bar: 'baz' }, {} as Context);

      expect(first.isEqual(first)).toBe(true);
      expect(first.isEqual(second)).toBe(false);
      expect(second.isEqual(first)).toBe(false);
    });
  });
});
