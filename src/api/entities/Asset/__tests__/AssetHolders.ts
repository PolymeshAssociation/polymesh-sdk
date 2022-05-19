import { StorageKey } from '@polkadot/types';
import { Balance } from '@polkadot/types/interfaces';
import BigNumber from 'bignumber.js';
import sinon from 'sinon';

import { Context, Namespace } from '~/internal';
import { IdentityId, Ticker } from '~/polkadot/polymesh';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { IdentityBalance } from '~/types';
import { tuple } from '~/types/utils';
import * as utilsConversionModule from '~/utils/conversion';
import * as utilsInternalModule from '~/utils/internal';

import { AssetHolders } from '../AssetHolders';

jest.mock(
  '~/api/entities/Asset',
  require('~/testUtils/mocks/entities').mockAssetModule('~/api/entities/Asset')
);
jest.mock(
  '~/api/entities/Identity',
  require('~/testUtils/mocks/entities').mockIdentityModule('~/api/entities/Identity')
);

describe('AssetHolder class', () => {
  let ticker: string;
  let mockContext: Mocked<Context>;
  let rawTicker: Ticker;
  let requestPaginatedStub: sinon.SinonStub;
  let identityIdToStringStub: sinon.SinonStub<[IdentityId], string>;
  let balanceToBigNumberStub: sinon.SinonStub<[Balance], BigNumber>;
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
    ticker = 'TEST';
    mockContext = dsMockUtils.getContextInstance();
    rawTicker = dsMockUtils.createMockTicker(ticker);
    requestPaginatedStub = sinon.stub(utilsInternalModule, 'requestPaginated');
    identityIdToStringStub = sinon.stub(utilsConversionModule, 'identityIdToString');
    balanceToBigNumberStub = sinon.stub(utilsConversionModule, 'balanceToBigNumber');
    sinon
      .stub(utilsConversionModule, 'stringToTicker')
      .withArgs(ticker, mockContext)
      .returns(rawTicker);
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
      sinon.restore();
    });

    it('should retrieve all the Asset Holders with balance', async () => {
      dsMockUtils.createQueryStub('asset', 'balanceOf');

      const expectedHolders: IdentityBalance[] = [];

      const balanceOfEntries: [StorageKey, Balance][] = [];

      const context = dsMockUtils.getContextInstance();

      fakeData.forEach(({ identity, value }) => {
        const identityId = dsMockUtils.createMockIdentityId(identity);
        const fakeBalance = dsMockUtils.createMockBalance(value);
        const balance = new BigNumber(value);

        identityIdToStringStub.withArgs(identityId).returns(identity);
        balanceToBigNumberStub.withArgs(fakeBalance).returns(balance);

        balanceOfEntries.push(
          tuple({ args: [rawTicker, identityId] } as unknown as StorageKey, fakeBalance)
        );

        expectedHolders.push({
          identity: expect.objectContaining({ did: identity }),
          balance,
        });
      });

      requestPaginatedStub.resolves({ entries: balanceOfEntries, lastKey: null });

      const asset = entityMockUtils.getAssetInstance();
      const assetHolders = new AssetHolders(asset, context);

      const result = await assetHolders.get();

      expect(result.data).toEqual(expectedHolders);
      expect(result.next).toBeNull();
    });

    it('should retrieve the first page of results with only one Asset Holder', async () => {
      dsMockUtils.createQueryStub('asset', 'balanceOf');

      const expectedHolders: IdentityBalance[] = [];

      const balanceOfEntries: [StorageKey, Balance][] = [];

      const context = dsMockUtils.getContextInstance();

      const { identity, value } = fakeData[0];
      const identityId = dsMockUtils.createMockIdentityId(identity);
      const fakeBalance = dsMockUtils.createMockBalance(value);
      const balance = new BigNumber(value);

      identityIdToStringStub.withArgs(identityId).returns(identity);
      balanceToBigNumberStub.withArgs(fakeBalance).returns(balance);

      balanceOfEntries.push(
        tuple({ args: [rawTicker, identityId] } as unknown as StorageKey, fakeBalance)
      );

      expectedHolders.push({
        identity: expect.objectContaining({ did: identity }),
        balance,
      });

      requestPaginatedStub.resolves({ entries: balanceOfEntries, lastKey: 'someKey' });

      const asset = entityMockUtils.getAssetInstance();
      const assetHolders = new AssetHolders(asset, context);

      const result = await assetHolders.get({ size: new BigNumber(1) });

      expect(result.data).toEqual(expectedHolders);
      expect(result.next).toBe('someKey');
    });
  });
});
