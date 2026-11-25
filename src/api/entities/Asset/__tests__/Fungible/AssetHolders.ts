import { StorageKey } from '@polkadot/types';
import { Balance } from '@polkadot/types/interfaces';
import {
  PolymeshPrimitivesAssetAssetId,
  PolymeshPrimitivesIdentityId,
} from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import { print } from 'graphql';
import { when } from 'jest-when';

import { AssetHolders } from '~/api/entities/Asset/Fungible/AssetHolders';
import { Context, Namespace } from '~/internal';
import { holdingsQuery } from '~/middleware/queries/assets';
import { HolderKind, HoldingsOrderBy } from '~/middleware/types';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { IdentityBalance } from '~/types';
import { tuple } from '~/types/utils';
import * as utilsConversionModule from '~/utils/conversion';
import * as utilsInternalModule from '~/utils/internal';

jest.mock(
  '~/api/entities/Asset/Fungible',
  require('~/testUtils/mocks/entities').mockFungibleAssetModule('~/api/entities/Asset/Fungible')
);
jest.mock(
  '~/api/entities/Identity',
  require('~/testUtils/mocks/entities').mockIdentityModule('~/api/entities/Identity')
);

describe('AssetHolder class', () => {
  let assetId: string;
  let mockContext: Mocked<Context>;
  let rawAssetId: PolymeshPrimitivesAssetAssetId;
  let requestPaginatedSpy: jest.SpyInstance;
  let identityIdToStringSpy: jest.SpyInstance<string, [PolymeshPrimitivesIdentityId]>;
  let balanceToBigNumberSpy: jest.SpyInstance<BigNumber, [Balance]>;
  const fakeData = [
    {
      identity: 'someIdentity',
      value: new BigNumber(1000),
    },
    {
      identity: 'otherIdentity',
      value: new BigNumber(2000),
    },
  ];

  beforeAll(() => {
    entityMockUtils.initMocks();
    dsMockUtils.initMocks();
    assetId = '0x12341234123412341234123412341234';
    mockContext = dsMockUtils.getContextInstance();
    rawAssetId = dsMockUtils.createMockAssetId(assetId);
    requestPaginatedSpy = jest.spyOn(utilsInternalModule, 'requestPaginated');
    identityIdToStringSpy = jest.spyOn(utilsConversionModule, 'identityIdToString');
    balanceToBigNumberSpy = jest.spyOn(utilsConversionModule, 'balanceToBigNumber');
    when(jest.spyOn(utilsConversionModule, 'stringToAssetId'))
      .calledWith(assetId, mockContext)
      .mockReturnValue(rawAssetId);
  });

  afterEach(() => {
    entityMockUtils.reset();
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  it('should extend namespace', () => {
    expect(AssetHolders.prototype instanceof Namespace).toBe(true);
  });

  describe('method: get', () => {
    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should retrieve all the Asset Holders with balance', async () => {
      dsMockUtils.createQueryMock('asset', 'balanceOf');

      const expectedHolders: IdentityBalance[] = [];

      const balanceOfEntries: [StorageKey, Balance][] = [];

      const context = dsMockUtils.getContextInstance();

      fakeData.forEach(({ identity, value }) => {
        const identityId = dsMockUtils.createMockIdentityId(identity);
        const fakeBalance = dsMockUtils.createMockBalance(value);
        const balance = new BigNumber(value);

        when(identityIdToStringSpy).calledWith(identityId).mockReturnValue(identity);
        when(balanceToBigNumberSpy).calledWith(fakeBalance).mockReturnValue(balance);

        balanceOfEntries.push(
          tuple({ args: [rawAssetId, identityId] } as unknown as StorageKey, fakeBalance)
        );

        expectedHolders.push({
          identity: expect.objectContaining({ did: identity }),
          balance,
        });
      });

      requestPaginatedSpy.mockResolvedValue({ entries: balanceOfEntries, lastKey: null });

      const asset = entityMockUtils.getFungibleAssetInstance();
      const assetHolders = new AssetHolders(asset, context);

      const result = await assetHolders.get();

      expect(result.data).toEqual(expectedHolders);
      expect(result.next).toBeNull();
    });

    it('should retrieve the first page of results with only one Asset Holder', async () => {
      dsMockUtils.createQueryMock('asset', 'balanceOf');

      const expectedHolders: IdentityBalance[] = [];

      const balanceOfEntries: [StorageKey, Balance][] = [];

      const context = dsMockUtils.getContextInstance();

      const { identity, value } = fakeData[0]!;
      const identityId = dsMockUtils.createMockIdentityId(identity);
      const fakeBalance = dsMockUtils.createMockBalance(value);
      const balance = new BigNumber(value);

      when(identityIdToStringSpy).calledWith(identityId).mockReturnValue(identity);
      when(balanceToBigNumberSpy).calledWith(fakeBalance).mockReturnValue(balance);

      balanceOfEntries.push(
        tuple({ args: [rawAssetId, identityId] } as unknown as StorageKey, fakeBalance)
      );

      expectedHolders.push({
        identity: expect.objectContaining({ did: identity }),
        balance,
      });

      requestPaginatedSpy.mockResolvedValue({ entries: balanceOfEntries, lastKey: 'someKey' });

      const asset = entityMockUtils.getFungibleAssetInstance();
      const assetHolders = new AssetHolders(asset, context);

      const result = await assetHolders.get({ size: new BigNumber(1) });

      expect(result.data).toEqual(expectedHolders);
      expect(result.next).toBe('someKey');
    });
  });

  describe('method: getHoldings', () => {
    const holderAddress = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';
    let getAssetIdForMiddlewareSpy: jest.SpyInstance;

    afterEach(() => {
      getAssetIdForMiddlewareSpy.mockRestore();
    });

    it('should list each portfolio and Account holder with its balance and frozen part', async () => {
      const context = dsMockUtils.getContextInstance();
      const asset = entityMockUtils.getFungibleAssetInstance({ assetId });
      getAssetIdForMiddlewareSpy = jest
        .spyOn(utilsInternalModule, 'getAssetIdForMiddleware')
        .mockResolvedValue(assetId);

      dsMockUtils.createApolloQueryMock(
        holdingsQuery({ assetId }, new BigNumber(2), new BigNumber(0)),
        {
          holdings: {
            totalCount: 3,
            nodes: [
              {
                holderKind: HolderKind.Portfolio,
                portfolioId: 'someDid/2',
                accountId: null,
                identityId: 'someDid',
                amount: '5000000',
                frozen: '1000000',
                frozenSince: null,
              },
              {
                holderKind: HolderKind.Account,
                portfolioId: null,
                accountId: holderAddress,
                identityId: null,
                amount: '0',
                frozen: '0',
                // the middleware serialises UTC with no zone marker
                frozenSince: '2024-01-02T03:04:05',
              },
            ],
          },
        }
      );

      const assetHolders = new AssetHolders(asset, context);
      const result = await assetHolders.getHoldings({
        size: new BigNumber(2),
        start: new BigNumber(0),
      });

      const [portfolioHolding, accountHolding] = result.data;
      expect(portfolioHolding!.holder).toEqual(
        expect.objectContaining({
          id: new BigNumber(2),
          owner: expect.objectContaining({ did: 'someDid' }),
        })
      );
      expect(portfolioHolding!.identity).toEqual(expect.objectContaining({ did: 'someDid' }));
      expect(portfolioHolding!.amount).toEqual(new BigNumber(5));
      expect(portfolioHolding!.frozen).toEqual(new BigNumber(1));
      expect(portfolioHolding!.frozenSince).toBeNull();

      expect(accountHolding!.holder).toEqual(expect.objectContaining({ address: holderAddress }));
      expect(accountHolding!.identity).toBeUndefined();
      expect(accountHolding!.amount).toEqual(new BigNumber(0));
      expect(accountHolding!.frozenSince).toEqual(new Date('2024-01-02T03:04:05Z'));

      expect(result.count).toEqual(new BigNumber(3));
      expect(result.next).toEqual(new BigNumber(2));
    });

    it('should order by the largest balance first unless told otherwise', async () => {
      const context = dsMockUtils.getContextInstance();
      getAssetIdForMiddlewareSpy = jest
        .spyOn(utilsInternalModule, 'getAssetIdForMiddleware')
        .mockResolvedValue(assetId);

      dsMockUtils.createApolloQueryMock(
        holdingsQuery({ assetId }, undefined, undefined, HoldingsOrderBy.IdentityIdAsc),
        { holdings: { totalCount: 0, nodes: [] } }
      );

      const assetHolders = new AssetHolders(
        entityMockUtils.getFungibleAssetInstance({ assetId }),
        context
      );
      const result = await assetHolders.getHoldings({ orderBy: HoldingsOrderBy.IdentityIdAsc });

      expect(result).toEqual({ data: [], next: null, count: new BigNumber(0) });

      dsMockUtils.createApolloQueryMock(holdingsQuery({ assetId }), {
        holdings: { totalCount: 0, nodes: [] },
      });

      await expect(assetHolders.getHoldings()).resolves.toEqual({
        data: [],
        next: null,
        count: new BigNumber(0),
      });
      expect(print(holdingsQuery({ assetId }).query)).toContain('orderBy: [AMOUNT_DESC, ID_ASC]');
      expect(
        print(holdingsQuery({ assetId }, undefined, undefined, HoldingsOrderBy.IdentityIdAsc).query)
      ).toContain('orderBy: [IDENTITY_ID_ASC, ID_ASC]');
    });
  });

  describe('method: getFreezeStatus', () => {
    const address = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';
    const did = '0x0600000000000000000000000000000000000000000000000000000000000000';

    beforeEach(() => {
      jest.spyOn(utilsConversionModule, 'assetToMeshAssetId').mockReturnValue(rawAssetId);
      jest
        .spyOn(utilsConversionModule, 'stringToAccountId')
        .mockReturnValue(dsMockUtils.createMockAccountId(address));
      jest
        .spyOn(utilsConversionModule, 'portfolioIdToMeshPortfolioId')
        .mockReturnValue(dsMockUtils.createMockPortfolioId());
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should report how an Account holder is frozen', async () => {
      const rawFrozen = dsMockUtils.createMockBalance(new BigNumber(50).shiftedBy(6));
      const frozenAccountsMock = dsMockUtils.createQueryMock('asset', 'frozenAccounts', {
        returnValue: dsMockUtils.createMockBool(true),
      });
      dsMockUtils.createQueryMock('asset', 'frozenBalance', { returnValue: rawFrozen });

      const assetHolders = new AssetHolders(
        entityMockUtils.getFungibleAssetInstance(),
        dsMockUtils.getContextInstance()
      );

      const result = await assetHolders.getFreezeStatus({ holder: address });

      expect(frozenAccountsMock).toHaveBeenCalled();
      expect(result).toEqual({ isFrozen: true, frozen: new BigNumber(50) });
    });

    it('should report how a Portfolio holder is frozen', async () => {
      const frozenPortfoliosMock = dsMockUtils.createQueryMock('portfolio', 'frozenPortfolios', {
        returnValue: dsMockUtils.createMockBool(false),
      });
      dsMockUtils.createQueryMock('portfolio', 'portfolioFrozenAssets', {
        returnValue: dsMockUtils.createMockBalance(new BigNumber(10).shiftedBy(6)),
      });

      const assetHolders = new AssetHolders(
        entityMockUtils.getFungibleAssetInstance(),
        dsMockUtils.getContextInstance()
      );

      const result = await assetHolders.getFreezeStatus({
        holder: { identity: did, id: new BigNumber(1) },
      });

      expect(frozenPortfoliosMock).toHaveBeenCalled();
      expect(result).toEqual({ isFrozen: false, frozen: new BigNumber(10) });
    });

    it('should report an unfrozen holder on a chain without holder freezing', async () => {
      // the pallets exist before Polymesh 8.1.1, without the freeze storage
      dsMockUtils.createQueryMock('asset', 'balanceOf');
      dsMockUtils.createQueryMock('portfolio', 'portfolioAssetBalances');

      const assetHolders = new AssetHolders(
        entityMockUtils.getFungibleAssetInstance(),
        dsMockUtils.getContextInstance()
      );

      await expect(assetHolders.getFreezeStatus({ holder: address })).resolves.toEqual({
        isFrozen: false,
        frozen: new BigNumber(0),
      });
      await expect(
        assetHolders.getFreezeStatus({ holder: { identity: did, id: new BigNumber(1) } })
      ).resolves.toEqual({ isFrozen: false, frozen: new BigNumber(0) });
    });
  });
});
