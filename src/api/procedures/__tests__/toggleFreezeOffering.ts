import { u64 } from '@polkadot/types';
import { PolymeshPrimitivesAssetAssetID } from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import {
  getAuthorization,
  prepareToggleFreezeOffering,
  ToggleFreezeOfferingParams,
} from '~/api/procedures/toggleFreezeOffering';
import { Context, FungibleAsset, Offering } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { OfferingBalanceStatus, OfferingSaleStatus, OfferingTimingStatus, TxTags } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Asset/Fungible',
  require('~/testUtils/mocks/entities').mockFungibleAssetModule('~/api/entities/Asset/Fungible')
);
jest.mock(
  '~/api/entities/Offering',
  require('~/testUtils/mocks/entities').mockOfferingModule('~/api/entities/Offering')
);

describe('toggleFreezeOffering procedure', () => {
  let mockContext: Mocked<Context>;
  let assetToMeshAssetIdSpy: jest.SpyInstance;
  let bigNumberToU64Spy: jest.SpyInstance<u64, [BigNumber, Context]>;
  let assetId: string;
  let asset: FungibleAsset;
  let rawAssetId: PolymeshPrimitivesAssetAssetID;
  let id: BigNumber;
  let rawId: u64;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    assetToMeshAssetIdSpy = jest.spyOn(utilsConversionModule, 'assetToMeshAssetId');
    bigNumberToU64Spy = jest.spyOn(utilsConversionModule, 'bigNumberToU64');
    assetId = '0x1234';
    asset = entityMockUtils.getFungibleAssetInstance({ assetId });
    id = new BigNumber(1);
    rawAssetId = dsMockUtils.createMockAssetId(assetId);
    rawId = dsMockUtils.createMockU64(id);
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    when(assetToMeshAssetIdSpy).calledWith(asset, mockContext).mockReturnValue(rawAssetId);
    when(bigNumberToU64Spy).calledWith(id, mockContext).mockReturnValue(rawId);
  });

  afterEach(() => {
    entityMockUtils.reset();
    procedureMockUtils.reset();
    dsMockUtils.reset();
  });

  afterAll(() => {
    procedureMockUtils.cleanup();
    dsMockUtils.cleanup();
  });

  it('should throw an error if the Offering has reached its end date', () => {
    entityMockUtils.configureMocks({
      offeringOptions: {
        details: {
          status: {
            timing: OfferingTimingStatus.Expired,
            balance: OfferingBalanceStatus.Available,
            sale: OfferingSaleStatus.Closed,
          },
        },
      },
    });

    const proc = procedureMockUtils.getInstance<ToggleFreezeOfferingParams, Offering>(mockContext);

    return expect(
      prepareToggleFreezeOffering.call(proc, {
        asset,
        id,
        freeze: true,
      })
    ).rejects.toThrow('The Offering has already ended');
  });

  it('should throw an error if freeze is set to true and the Offering is already frozen', () => {
    entityMockUtils.configureMocks({
      offeringOptions: {
        details: {
          status: {
            sale: OfferingSaleStatus.Frozen,
            timing: OfferingTimingStatus.Started,
            balance: OfferingBalanceStatus.Available,
          },
        },
      },
    });

    const proc = procedureMockUtils.getInstance<ToggleFreezeOfferingParams, Offering>(mockContext);

    return expect(
      prepareToggleFreezeOffering.call(proc, {
        asset,
        id,
        freeze: true,
      })
    ).rejects.toThrow('The Offering is already frozen');
  });

  it('should throw an error if freeze is set to false and the Offering status is live or close', async () => {
    const proc = procedureMockUtils.getInstance<ToggleFreezeOfferingParams, Offering>(mockContext);

    entityMockUtils.configureMocks({
      offeringOptions: {
        details: {
          status: {
            sale: OfferingSaleStatus.Live,
            timing: OfferingTimingStatus.Started,
            balance: OfferingBalanceStatus.Available,
          },
        },
      },
    });

    await expect(
      prepareToggleFreezeOffering.call(proc, {
        asset,
        id,
        freeze: false,
      })
    ).rejects.toThrow('The Offering is already unfrozen');

    entityMockUtils.configureMocks({
      offeringOptions: {
        details: {
          status: {
            sale: OfferingSaleStatus.Closed,
            timing: OfferingTimingStatus.Started,
            balance: OfferingBalanceStatus.Available,
          },
        },
      },
    });

    return expect(
      prepareToggleFreezeOffering.call(proc, {
        asset,
        id,
        freeze: false,
      })
    ).rejects.toThrow('The Offering is already closed');
  });

  it('should return a freeze transaction spec', async () => {
    const proc = procedureMockUtils.getInstance<ToggleFreezeOfferingParams, Offering>(mockContext);

    const transaction = dsMockUtils.createTxMock('sto', 'freezeFundraiser');

    const result = await prepareToggleFreezeOffering.call(proc, {
      asset,
      id,
      freeze: true,
    });

    expect(result).toEqual({
      transaction,
      args: [rawAssetId, rawId],
      resolver: expect.objectContaining({ asset: expect.objectContaining({ id: assetId }) }),
    });
  });

  it('should return an unfreeze transaction spec', async () => {
    entityMockUtils.configureMocks({
      offeringOptions: {
        details: {
          status: {
            timing: OfferingTimingStatus.Started,
            balance: OfferingBalanceStatus.Available,
            sale: OfferingSaleStatus.Frozen,
          },
        },
      },
    });

    const proc = procedureMockUtils.getInstance<ToggleFreezeOfferingParams, Offering>(mockContext);

    const transaction = dsMockUtils.createTxMock('sto', 'unfreezeFundraiser');

    const result = await prepareToggleFreezeOffering.call(proc, {
      asset,
      id,
      freeze: false,
    });

    expect(result).toEqual({
      transaction,
      args: [rawAssetId, rawId],
      resolver: expect.objectContaining({ asset: expect.objectContaining({ id: assetId }) }),
    });
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<ToggleFreezeOfferingParams, Offering>(
        mockContext
      );
      const boundFunc = getAuthorization.bind(proc);

      expect(boundFunc({ asset, id, freeze: true })).toEqual({
        permissions: {
          transactions: [TxTags.sto.FreezeFundraiser],
          assets: [asset],
          portfolios: [],
        },
      });

      expect(boundFunc({ asset, id, freeze: false })).toEqual({
        permissions: {
          transactions: [TxTags.sto.UnfreezeFundraiser],
          assets: [asset],
          portfolios: [],
        },
      });
    });
  });
});
