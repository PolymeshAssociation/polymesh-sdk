import BigNumber from 'bignumber.js';

import { Checkpoint, Context, Entity } from '~/internal';
import { dsMockUtils } from '~/testUtils/mocks';

describe('Checkpoint class', () => {
  let context: Context;

  let id: BigNumber;
  let ticker: string;

  beforeAll(() => {
    dsMockUtils.initMocks();

    id = new BigNumber(1);
    ticker = 'SOME_TICKER';
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
    expect(Checkpoint.prototype instanceof Entity).toBe(true);
  });

  describe('constructor', () => {
    test('should assign ticker and id to instance', () => {
      const checkpoint = new Checkpoint({ id, ticker }, context);

      expect(checkpoint.ticker).toBe(ticker);
      expect(checkpoint.id).toEqual(id);
    });
  });

  describe('method: isUniqueIdentifiers', () => {
    test('should return true if the object conforms to the interface', () => {
      expect(Checkpoint.isUniqueIdentifiers({ id: new BigNumber(1), ticker: 'symbol' })).toBe(true);
      expect(Checkpoint.isUniqueIdentifiers({})).toBe(false);
      expect(Checkpoint.isUniqueIdentifiers({ id: new BigNumber(1) })).toBe(false);
      expect(Checkpoint.isUniqueIdentifiers({ id: 'id' })).toBe(false);
    });
  });

  describe('method: createdAt', () => {
    test("should return the Checkpoint's creation date", async () => {
      const checkpoint = new Checkpoint({ id, ticker }, context);
      const timestamp = 12000;

      dsMockUtils.createQueryStub('checkpoint', 'timestamps', {
        returnValue: dsMockUtils.createMockMoment(timestamp),
      });

      const result = await checkpoint.createdAt();

      expect(result).toEqual(new Date(timestamp));
    });
  });

  describe('method: totalSupply', () => {
    test("should return the Checkpoint's total supply", async () => {
      const checkpoint = new Checkpoint({ id, ticker }, context);
      const balance = 10000000000;

      dsMockUtils.createQueryStub('checkpoint', 'totalSupply', {
        returnValue: dsMockUtils.createMockBalance(balance),
      });

      const result = await checkpoint.totalSupply();

      expect(result).toEqual(new BigNumber(balance).shiftedBy(-6));
    });
  });
});
