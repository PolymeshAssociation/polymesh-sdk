import { StorageKey } from '@polkadot/types';
import BigNumber from 'bignumber.js';
import sinon from 'sinon';

import { Checkpoint, Context, Entity } from '~/internal';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';
import { tuple } from '~/types/utils';
import * as utilsConversionModule from '~/utils/conversion';
import * as utilsInternalModule from '~/utils/internal';

jest.mock(
  '~/api/entities/Identity',
  require('~/testUtils/mocks/entities').mockIdentityModule('~/api/entities/Identity')
);

describe('Checkpoint class', () => {
  let context: Context;

  let id: BigNumber;
  let ticker: string;

  let balanceToBigNumberStub: sinon.SinonStub;

  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();

    id = new BigNumber(1);
    ticker = 'SOME_TICKER';

    balanceToBigNumberStub = sinon.stub(utilsConversionModule, 'balanceToBigNumber');
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
      const expected = new BigNumber(balance).shiftedBy(-6);

      dsMockUtils.createQueryStub('checkpoint', 'totalSupply', {
        returnValue: dsMockUtils.createMockBalance(balance),
      });

      balanceToBigNumberStub.returns(expected);

      const result = await checkpoint.totalSupply();
      expect(result).toEqual(expected);
    });
  });

  describe('method: allBalances', () => {
    let stringToIdentityIdStub: sinon.SinonStub;

    beforeAll(() => {
      stringToIdentityIdStub = sinon.stub(utilsConversionModule, 'stringToIdentityId');
    });

    test("should return the Checkpoint's tokenholder balances", async () => {
      const checkpoint = new Checkpoint({ id, ticker }, context);

      const balanceOf = [
        {
          identity: 'did',
          balance: new BigNumber(100),
        },
        {
          identity: 'did2',
          balance: new BigNumber(200),
        },
        {
          identity: 'did3',
          balance: new BigNumber(10),
        },
      ];

      const rawTicker = dsMockUtils.createMockTicker(ticker);
      const rawBalanceOf = balanceOf.map(({ identity, balance }) => ({
        identityId: dsMockUtils.createMockIdentityId(identity),
        balance: dsMockUtils.createMockBalance(balance.toNumber()),
      }));

      rawBalanceOf.forEach(({ identityId, balance: rawBalance }, index) => {
        const { identity, balance } = balanceOf[index];
        balanceToBigNumberStub.withArgs(rawBalance).returns(balance);
        stringToIdentityIdStub.withArgs(identity).returns(identityId);
      });

      const balanceOfEntries = rawBalanceOf.map(({ identityId, balance }) =>
        tuple(({ args: [rawTicker, identityId] } as unknown) as StorageKey, balance)
      );

      dsMockUtils.createQueryStub('asset', 'balanceOf');

      sinon
        .stub(utilsInternalModule, 'requestPaginated')
        .resolves({ entries: balanceOfEntries, lastKey: null });

      dsMockUtils.createQueryStub('checkpoint', 'balanceUpdates', {
        multi: [
          [dsMockUtils.createMockU64(1), dsMockUtils.createMockU64(2)],
          [dsMockUtils.createMockU64(2)],
          [],
        ],
      });

      const balanceMulti = [new BigNumber(10000), new BigNumber(20000)];

      const rawBalanceMulti = balanceMulti.map(balance =>
        dsMockUtils.createMockBalance(balance.toNumber())
      );

      dsMockUtils.createQueryStub('checkpoint', 'balance', {
        multi: rawBalanceMulti,
      });

      rawBalanceMulti.forEach((rawBlance, index) => {
        balanceToBigNumberStub.withArgs(rawBlance).returns(balanceMulti[index]);
      });

      const { data } = await checkpoint.allBalances();

      expect(data[0].identity.did).toEqual(balanceOf[0].identity);
      expect(data[1].identity.did).toEqual(balanceOf[1].identity);
      expect(data[2].identity.did).toEqual(balanceOf[2].identity);
      expect(data[0].balance).toEqual(balanceMulti[0]);
      expect(data[1].balance).toEqual(balanceMulti[1]);
      expect(data[2].balance).toEqual(balanceOf[2].balance);
    });
  });

  describe('method: balance', () => {
    test("should return a specific Identity's balance at the Checkpoint", async () => {
      const checkpoint = new Checkpoint({ id, ticker }, context);
      const balance = 10000000000;

      const expected = new BigNumber(balance).shiftedBy(-6);

      balanceToBigNumberStub.returns(expected);

      dsMockUtils.createQueryStub('checkpoint', 'balance', {
        size: 1,
        returnValue: dsMockUtils.createMockBalance(balance),
      });

      let result = await checkpoint.balance({ identity: 'someDid' });

      expect(result).toEqual(expected);

      result = await checkpoint.balance();

      expect(result).toEqual(expected);

      const zeroBalance = dsMockUtils.createMockBalance(0);

      dsMockUtils.createQueryStub('checkpoint', 'balance', {
        size: 0,
        returnValue: zeroBalance,
      });

      balanceToBigNumberStub.withArgs(zeroBalance).returns(new BigNumber(0));

      const tokenBalance = new BigNumber(10);

      entityMockUtils.configureMocks({
        identityOptions: {
          getTokenBalance: tokenBalance,
        },
      });

      result = await checkpoint.balance();

      expect(result).toEqual(tokenBalance);
    });
  });
});
