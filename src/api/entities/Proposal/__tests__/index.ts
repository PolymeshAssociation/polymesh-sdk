import { Entity } from '~/base';
import { Context } from '~/context';
import { dsMockUtils } from '~/testUtils/mocks';

import { Proposal } from '../';

describe('Proposal class', () => {
  let context: Context;

  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  test('should extend entity', () => {
    expect(Proposal.prototype instanceof Entity).toBe(true);
  });

  describe('constructor', () => {
    test('should assign pipId to instance', () => {
      const pipId = 10;
      const proposal = new Proposal({ pipId }, context);

      expect(proposal.pipId).toBe(pipId);
    });
  });

  describe('method: isUniqueIdentifiers', () => {
    test('should return true if the object conforms to the interface', () => {
      expect(Proposal.isUniqueIdentifiers({ pipId: 10 })).toBe(true);
      expect(Proposal.isUniqueIdentifiers({})).toBe(false);
      expect(Proposal.isUniqueIdentifiers({ pipId: '10' })).toBe(false);
    });
  });
});
