import { Context, ExternalAgent, Identity } from '~/internal';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';

describe('ExternalAgent class', () => {
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
    expect(ExternalAgent.prototype instanceof Identity).toBe(true);
  });

  describe('constructor', () => {
    test('should assign ticker and did to instance', () => {
      const did = 'someDid';
      const ticker = 'SOMETICKER';
      const externalAgent = new ExternalAgent({ did, ticker }, context);

      expect(externalAgent.ticker).toBe(ticker);
      expect(externalAgent.did).toEqual(did);
    });
  });

  describe('method: isUniqueIdentifiers', () => {
    test('should return true if the object conforms to the interface', () => {
      expect(ExternalAgent.isUniqueIdentifiers({ did: 'someDid', ticker: 'symbol' })).toBe(true);
      expect(ExternalAgent.isUniqueIdentifiers({})).toBe(false);
      expect(ExternalAgent.isUniqueIdentifiers({ did: 'someDid' })).toBe(false);
      expect(ExternalAgent.isUniqueIdentifiers({ did: 1 })).toBe(false);
    });
  });
});
