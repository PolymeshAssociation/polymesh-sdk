import { StorageKey } from '@polkadot/types';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import { Checkpoint, Context, Entity } from '~/internal';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';
import { tuple } from '~/types/utils';
import * as utilsConversionModule from '~/utils/conversion';
import * as utilsInternalModule from '~/utils/internal';

jest.mock(
  '~/api/entities/Identity',
  require('~/testUtils/mocks/entities').mockIdentityModule('~/api/entities/Identity')
);
jest.mock(
  '~/api/entities/Asset/Fungible',
  require('~/testUtils/mocks/entities').mockFungibleAssetModule('~/api/entities/Asset/Fungible')
);

describe('Checkpoint class', () => {
  let context: Context;

  let id: BigNumber;
  let ticker: string;

  let balanceToBigNumberSpy: jest.SpyInstance;

  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();

    id = new BigNumber(1);
    ticker = 'SOME_TICKER';

    balanceToBigNumberSpy = jest.spyOn(utilsConversionModule, 'balanceToBigNumber');
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
  });

  it('should extend Entity', () => {
    expect(Checkpoint.prototype instanceof Entity).toBe(true);
  });

  describe('constructor', () => {
    it('should assign ticker and id to instance', () => {
      const checkpoint = new Checkpoint({ id, ticker }, context);

      expect(checkpoint.asset.ticker).toBe(ticker);
      expect(checkpoint.id).toEqual(id);
    });
  });

  describe('method: isUniqueIdentifiers', () => {
    it('should return true if the object conforms to the interface', () => {
      expect(Checkpoint.isUniqueIdentifiers({ id: new BigNumber(1), ticker: 'symbol' })).toBe(true);
      expect(Checkpoint.isUniqueIdentifiers({})).toBe(false);
      expect(Checkpoint.isUniqueIdentifiers({ id: new BigNumber(1) })).toBe(false);
      expect(Checkpoint.isUniqueIdentifiers({ id: 'id' })).toBe(false);
    });
  });

  describe('method: createdAt', () => {
    it("should return the Checkpoint's creation date", async () => {
      const checkpoint = new Checkpoint({ id, ticker }, context);
      const timestamp = 12000;

      dsMockUtils.createQueryMock('checkpoint', 'timestamps', {
        returnValue: dsMockUtils.createMockMoment(new BigNumber(timestamp)),
      });

      const result = await checkpoint.createdAt();

      expect(result).toEqual(new Date(timestamp));
    });
  });

  describe('method: totalSupply', () => {
    it("should return the Checkpoint's total supply", async () => {
      const checkpoint = new Checkpoint({ id, ticker }, context);
      const balance = new BigNumber(10000000000);
      const expected = new BigNumber(balance).shiftedBy(-6);

      dsMockUtils.createQueryMock('checkpoint', 'totalSupply', {
        returnValue: dsMockUtils.createMockBalance(balance),
      });

      balanceToBigNumberSpy.mockReturnValue(expected);

      const result = await checkpoint.totalSupply();
      expect(result).toEqual(expected);
    });
  });

  describe('method: allBalances', () => {
    let stringToIdentityIdSpy: jest.SpyInstance;

    beforeAll(() => {
      stringToIdentityIdSpy = jest.spyOn(utilsConversionModule, 'stringToIdentityId');
    });

    it("should return the Checkpoint's Asset Holder balances", async () => {
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
        balance: dsMockUtils.createMockBalance(balance),
      }));

      rawBalanceOf.forEach(({ identityId, balance: rawBalance }, index) => {
        const { identity, balance } = balanceOf[index];
        when(balanceToBigNumberSpy).calledWith(rawBalance).mockReturnValue(balance);
        when(stringToIdentityIdSpy).calledWith(identity).mockReturnValue(identityId);
      });

      const balanceOfEntries = rawBalanceOf.map(({ identityId, balance }) =>
        tuple({ args: [rawTicker, identityId] } as unknown as StorageKey, balance)
      );

      dsMockUtils.createQueryMock('asset', 'balanceOf');

      jest
        .spyOn(utilsInternalModule, 'requestPaginated')
        .mockResolvedValue({ entries: balanceOfEntries, lastKey: null });

      dsMockUtils.createQueryMock('checkpoint', 'balanceUpdates', {
        multi: [
          [
            dsMockUtils.createMockU64(new BigNumber(1)),
            dsMockUtils.createMockU64(new BigNumber(2)),
          ],
          [dsMockUtils.createMockU64(new BigNumber(2))],
          [],
        ],
      });

      const balanceMulti = [new BigNumber(10000), new BigNumber(20000)];

      const rawBalanceMulti = balanceMulti.map(balance => dsMockUtils.createMockBalance(balance));

      dsMockUtils.createQueryMock('checkpoint', 'balance', {
        multi: rawBalanceMulti,
      });

      rawBalanceMulti.forEach((rawBalance, index) => {
        when(balanceToBigNumberSpy).calledWith(rawBalance).mockReturnValue(balanceMulti[index]);
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
    it("should return a specific Identity's balance at the Checkpoint", async () => {
      const checkpoint = new Checkpoint({ id, ticker }, context);
      const balance = new BigNumber(10000000000);

      const expected = new BigNumber(balance).shiftedBy(-6);

      balanceToBigNumberSpy.mockReturnValue(expected);

      dsMockUtils.createQueryMock('checkpoint', 'balanceUpdates', {
        returnValue: [
          dsMockUtils.createMockU64(new BigNumber(1)),
          dsMockUtils.createMockU64(new BigNumber(2)),
          dsMockUtils.createMockU64(new BigNumber(5)),
        ],
      });

      dsMockUtils.createQueryMock('checkpoint', 'balance', {
        returnValue: dsMockUtils.createMockBalance(balance),
      });

      let result = await checkpoint.balance({ identity: entityMockUtils.getIdentityInstance() });

      expect(result).toEqual(expected);

      result = await checkpoint.balance();

      expect(result).toEqual(expected);

      dsMockUtils.createQueryMock('checkpoint', 'balanceUpdates', {
        returnValue: [],
      });

      const assetBalance = new BigNumber(1000);

      result = await checkpoint.balance();

      expect(result).toEqual(assetBalance);
    });
  });

  describe('method: exists', () => {
    it('should return whether the checkpoint exists', async () => {
      jest.spyOn(utilsConversionModule, 'stringToTicker').mockImplementation();

      const checkpoint = new Checkpoint({ id, ticker }, context);

      dsMockUtils.createQueryMock('checkpoint', 'checkpointIdSequence', {
        returnValue: [dsMockUtils.createMockU64(new BigNumber(5))],
      });

      let result = await checkpoint.exists();

      expect(result).toBe(true);

      dsMockUtils.createQueryMock('checkpoint', 'checkpointIdSequence', {
        returnValue: [dsMockUtils.createMockU64(new BigNumber(0))],
      });

      result = await checkpoint.exists();

      expect(result).toBe(false);
    });
  });

  describe('method: toHuman', () => {
    it('should return a human readable version of the entity', () => {
      const checkpoint = new Checkpoint({ id: new BigNumber(1), ticker: 'SOME_TICKER' }, context);
      expect(checkpoint.toHuman()).toEqual({
        id: '1',
        ticker: 'SOME_TICKER',
      });
    });
  });
});
