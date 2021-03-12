import { StorageKey } from '@polkadot/types';
import { Balance } from '@polkadot/types/interfaces';
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
  let identityIdToStringStub: sinon.SinonStub;
  let requestPaginatedStub: sinon.SinonStub;

  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();

    id = new BigNumber(1);
    ticker = 'SOME_TICKER';

    sinon.stub(utilsConversionModule, 'stringToTicker');
    sinon.stub(utilsConversionModule, 'numberToU64');
    sinon.stub(utilsConversionModule, 'stringToIdentityId');
    balanceToBigNumberStub = sinon.stub(utilsConversionModule, 'balanceToBigNumber');
    identityIdToStringStub = sinon.stub(utilsConversionModule, 'identityIdToString');
    requestPaginatedStub = sinon.stub(utilsInternalModule, 'requestPaginated');
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
    test("should return the Checkpoint's tokenholder balances", async () => {
      const checkpoint = new Checkpoint({ id, ticker }, context);

      const rawTicker = dsMockUtils.createMockTicker(ticker);

      dsMockUtils.createQueryStub('asset', 'balanceOf');

      const fakeData = [
        {
          identity: 'someIdentity',
          value: 1000,
        },
        {
          identity: 'otherIdentity',
          value: 2000,
        },
      ];

      const balanceOfEntries: [StorageKey, Balance][] = [];

      fakeData.forEach(({ identity, value }) => {
        const identityId = dsMockUtils.createMockIdentityId(identity);
        const fakeBalance = dsMockUtils.createMockBalance(value);
        const balance = new BigNumber(value);

        identityIdToStringStub.withArgs(identityId).returns(identity);
        balanceToBigNumberStub.withArgs(fakeBalance).returns(balance);

        balanceOfEntries.push(
          tuple(({ args: [rawTicker, identityId] } as unknown) as StorageKey, fakeBalance)
        );
      });

      requestPaginatedStub.resolves({ entries: balanceOfEntries, lastKey: null });

      const [{ value: valueOne }, { value: valueTwo }] = fakeData;

      const rawValueOne = dsMockUtils.createMockBalance(valueOne);
      const rawValueTwo = dsMockUtils.createMockBalance(valueTwo);

      dsMockUtils.createQueryStub('checkpoint', 'balance', {
        multi: [rawValueOne, rawValueTwo],
      });

      balanceToBigNumberStub.withArgs(rawValueOne).returns(new BigNumber(valueOne));
      balanceToBigNumberStub.withArgs(rawValueTwo).returns(new BigNumber(valueTwo));

      let result = await checkpoint.allBalances();

      expect(result.data[0].balance).toEqual(new BigNumber(valueOne));
      expect(result.data[1].balance).toEqual(new BigNumber(valueTwo));

      balanceToBigNumberStub.withArgs(rawValueOne).returns(new BigNumber(0));
      balanceToBigNumberStub.withArgs(rawValueTwo).returns(new BigNumber(0));

      const zeroBalance = dsMockUtils.createMockBalance(0);

      dsMockUtils.createQueryStub('checkpoint', 'balance', {
        size: 0,
        returnValue: zeroBalance,
      });

      result = await checkpoint.allBalances();

      expect(result.data[0].balance).toEqual(new BigNumber(valueOne));
      expect(result.data[1].balance).toEqual(new BigNumber(valueTwo));

      dsMockUtils.createQueryStub('checkpoint', 'balance', {
        size: 1,
        returnValue: zeroBalance,
      });

      result = await checkpoint.allBalances();

      expect(result.data[0].balance).toEqual(new BigNumber(0));
      expect(result.data[1].balance).toEqual(new BigNumber(0));
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
