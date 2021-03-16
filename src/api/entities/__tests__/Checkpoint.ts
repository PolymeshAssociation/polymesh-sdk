import { StorageKey } from '@polkadot/types';
import BigNumber from 'bignumber.js';
import sinon from 'sinon';

import { Checkpoint, Context, Entity } from '~/internal';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';
import { tuple } from '~/types/utils';
import * as utilsInternalModule from '~/utils/internal';

jest.mock(
  '~/api/entities/Identity',
  require('~/testUtils/mocks/entities').mockIdentityModule('~/api/entities/Identity')
);

describe('Checkpoint class', () => {
  let context: Context;

  let id: BigNumber;
  let ticker: string;

  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();

    id = new BigNumber(1);
    ticker = 'SOME_TICKER';
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

  test('should extend Entity', () => {
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

  describe('method: allBalances', () => {
    test("should return the Checkpoint's tokenholder balances", async () => {
      const checkpoint = new Checkpoint({ id, ticker }, context);

      dsMockUtils.createQueryStub('checkpoint', 'balance');

      const fakeResult = [
        {
          identity: entityMockUtils.getIdentityInstance({ did: 'someDid' }),
          balance: new BigNumber(1000),
        },
        {
          identity: entityMockUtils.getIdentityInstance({ did: 'otherDid' }),
          balance: new BigNumber(2000),
        },
      ];

      const rawTicker = dsMockUtils.createMockTicker(ticker);
      const rawId = dsMockUtils.createMockU64(id.toNumber());
      const entries = [
        tuple(
          ({
            args: [
              tuple(rawTicker, rawId),
              dsMockUtils.createMockIdentityId(fakeResult[0].identity.did),
            ],
          } as unknown) as StorageKey,
          dsMockUtils.createMockBalance(fakeResult[0].balance.shiftedBy(6).toNumber())
        ),
        tuple(
          ({
            args: [
              tuple(rawTicker, rawId),
              dsMockUtils.createMockIdentityId(fakeResult[1].identity.did),
            ],
          } as unknown) as StorageKey,
          dsMockUtils.createMockBalance(fakeResult[1].balance.shiftedBy(6).toNumber())
        ),
      ];

      sinon.stub(utilsInternalModule, 'requestPaginated').resolves({ entries, lastKey: null });

      const { data } = await checkpoint.allBalances();

      expect(data).toEqual(fakeResult);
    });
  });

  describe('method: balance', () => {
    test("should return a specific Identity's balance at the Checkpoint", async () => {
      const checkpoint = new Checkpoint({ id, ticker }, context);
      const balance = 10000000000;

      dsMockUtils.createQueryStub('checkpoint', 'balance', {
        returnValue: dsMockUtils.createMockBalance(balance),
      });

      const expected = new BigNumber(balance).shiftedBy(-6);

      let result = await checkpoint.balance({ identity: 'someDid' });

      expect(result).toEqual(expected);

      result = await checkpoint.balance();

      expect(result).toEqual(expected);
    });
  });
});
