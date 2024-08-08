import { StorageKey } from '@polkadot/types';
import { Balance } from '@polkadot/types/interfaces';
import {
  PolymeshPrimitivesAssetAssetID,
  PolymeshPrimitivesIdentityId,
} from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import { AssetHolders } from '~/api/entities/Asset/Fungible/AssetHolders';
import { Context, Namespace } from '~/internal';
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
  let rawAssetId: PolymeshPrimitivesAssetAssetID;
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
    assetId = '0x1234';
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

      const { identity, value } = fakeData[0];
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
});
