import { Agent, Context, Identity } from '~/internal';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';

describe('Agent class', () => {
  let context: Context;

  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
  });

  afterEach(() => {
    dsMockUtils.reset();
    entityMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
    entityMockUtils.cleanup();
  });

  test('should extend Identity', () => {
    expect(Agent.prototype instanceof Identity).toBe(true);
  });

  describe('constructor', () => {
    test('should assign ticker and did to instance', () => {
      const did = 'someDid';
      const ticker = 'SOMETICKER';
      const agent = new Agent({ did, ticker }, context);

      expect(agent.ticker).toBe(ticker);
      expect(agent.did).toEqual(did);
    });
  });

  describe('method: isUniqueIdentifiers', () => {
    test('should return true if the object conforms to the interface', () => {
      expect(Agent.isUniqueIdentifiers({ did: 'someDid', ticker: 'symbol' })).toBe(true);
      expect(Agent.isUniqueIdentifiers({})).toBe(false);
      expect(Agent.isUniqueIdentifiers({ did: 'someDid' })).toBe(false);
      expect(Agent.isUniqueIdentifiers({ did: 1 })).toBe(false);
    });
  });
});
