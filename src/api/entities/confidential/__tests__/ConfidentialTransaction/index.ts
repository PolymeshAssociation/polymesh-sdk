import BigNumber from 'bignumber.js';

import { ConfidentialTransaction, Context, Entity } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';

describe('ConfidentialTransaction class', () => {
  let context: Mocked<Context>;
  let transaction: ConfidentialTransaction;
  let id: BigNumber;

  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();
    procedureMockUtils.initMocks();

    id = new BigNumber(1);
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
    transaction = new ConfidentialTransaction({ id }, context);
  });

  afterEach(() => {
    dsMockUtils.reset();
    entityMockUtils.reset();
    procedureMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
    procedureMockUtils.cleanup();
  });

  it('should extend Entity', () => {
    expect(ConfidentialTransaction.prototype instanceof Entity).toBe(true);
  });

  describe('method: isUniqueIdentifiers', () => {
    it('should return true if the object conforms to the interface', () => {
      expect(ConfidentialTransaction.isUniqueIdentifiers({ id: new BigNumber(1) })).toBe(true);
      expect(ConfidentialTransaction.isUniqueIdentifiers({})).toBe(false);
      expect(ConfidentialTransaction.isUniqueIdentifiers({ id: 3 })).toBe(false);
    });
  });

  describe('method: exists', () => {
    it('should return whether the instruction exists', async () => {
      dsMockUtils
        .createQueryMock('confidentialAsset', 'transactionCounter')
        .mockResolvedValue(
          dsMockUtils.createMockCompact(dsMockUtils.createMockU64(new BigNumber(10)))
        );

      let result = await transaction.exists();

      expect(result).toBe(true);

      let fakeTransaction = new ConfidentialTransaction({ id: new BigNumber(0) }, context);

      result = await fakeTransaction.exists();

      expect(result).toBe(false);

      fakeTransaction = new ConfidentialTransaction({ id: new BigNumber(20) }, context);

      result = await fakeTransaction.exists();

      expect(result).toBe(false);
    });
  });

  describe('method: toHuman', () => {
    it('should return a human readable version of the entity', () => {
      expect(transaction.toHuman()).toBe('1');
    });
  });
});
