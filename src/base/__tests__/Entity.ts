import sinon from 'sinon';

import { polkadotMockUtils } from '~/testUtils/mocks';
import * as utils from '~/utils';

import { Entity } from '../Entity';

describe('Entity class', () => {
  beforeAll(() => {
    polkadotMockUtils.initMocks();
  });

  afterEach(() => {
    polkadotMockUtils.reset();
  });

  afterAll(() => {
    polkadotMockUtils.cleanup();
  });

  describe('method: generateUuid', () => {
    test("should generate the Entity's UUID", async () => {
      sinon
        .stub(utils, 'serialize')
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
      unserializeStub = sinon.stub(utils, 'unserialize');
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
});
