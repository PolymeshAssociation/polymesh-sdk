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

  const serializeStub = jest.spyOn(utilsInternalModule, 'serialize');
  describe('method: generateUuid', () => {
    it("should generate the Entity's UUID", async () => {
      when(serializeStub)
        .calledWith('Entity', {
          did: 'abc',
        })
        .mockReturnValue('uuid');
      const result = Entity.generateUuid({ did: 'abc' });
      expect(result).toBe('uuid');
    });
  });

  describe('method: unserialize', () => {
    let unserializeStub: jest.SpyInstance;

    beforeAll(() => {
      unserializeStub = jest.spyOn(utilsInternalModule, 'unserialize');
    });

    it('should throw an error if the string is not related to an Entity Unique Identifier', async () => {
      unserializeStub.mockReturnValue(undefined);
      expect(() => Entity.unserialize('def')).toThrow(
        "The string doesn't correspond to the UUID of type Entity"
      );
    });

    it('should return an Entity Unique Identifier object', async () => {
      const fakeReturn = { someIdentifier: 'abc' };
      unserializeStub.mockReturnValue(fakeReturn);
      expect(Entity.unserialize('def')).toEqual(fakeReturn);
    });
  });

  describe('method: isEqual', () => {
    it('should return whether the entities are the same', () => {
      when(serializeStub).calledWith('NonAbstract', { foo: 'bar' }).mockReturnValue('first');
      when(serializeStub).calledWith('NonAbstract', { bar: 'baz' }).mockReturnValue('second');

      const first = new NonAbstract({ foo: 'bar' }, {} as Context);
      const second = new NonAbstract({ bar: 'baz' }, {} as Context);

      expect(first.isEqual(first)).toBe(true);
      expect(first.isEqual(second)).toBe(false);
      expect(second.isEqual(first)).toBe(false);
    });
  });
});
