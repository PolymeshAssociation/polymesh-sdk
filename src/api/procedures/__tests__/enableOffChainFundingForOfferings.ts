import { u64 } from '@polkadot/types';
import { PolymeshPrimitivesAssetAssetId, PolymeshPrimitivesTicker } from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import {
  getAuthorization,
  Params,
  prepareEnableOffChainFundingForOfferings,
} from '~/api/procedures/enableOffChainFundingForOfferings';
import { Context, FungibleAsset } from '~/internal';
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

describe('enableOffChainFundingForOfferings procedure', () => {
  let mockContext: Mocked<Context>;
  let assetToMeshAssetIdSpy: jest.SpyInstance;
  let stringToTickerSpy: jest.SpyInstance;
  let bigNumberToU64Spy: jest.SpyInstance<u64, [BigNumber, Context]>;
  let assetId: string;
  let asset: FungibleAsset;
  let rawAssetId: PolymeshPrimitivesAssetAssetId;
  let id: BigNumber;
  let rawId: u64;
  let offChainTicker: string;
  let rawTicker: PolymeshPrimitivesTicker;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    assetToMeshAssetIdSpy = jest.spyOn(utilsConversionModule, 'assetToMeshAssetId');
    bigNumberToU64Spy = jest.spyOn(utilsConversionModule, 'bigNumberToU64');
    stringToTickerSpy = jest.spyOn(utilsConversionModule, 'stringToTicker');
    assetId = '0x12341234123412341234123412341234';
    asset = entityMockUtils.getFungibleAssetInstance({ assetId });
    id = new BigNumber(1);
    rawAssetId = dsMockUtils.createMockAssetId(assetId);
    rawId = dsMockUtils.createMockU64(id);
    offChainTicker = 'OFFCHAIN';
    rawTicker = dsMockUtils.createMockTicker(offChainTicker);
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    when(assetToMeshAssetIdSpy).calledWith(asset, mockContext).mockReturnValue(rawAssetId);
    when(bigNumberToU64Spy).calledWith(id, mockContext).mockReturnValue(rawId);
    when(stringToTickerSpy).calledWith(offChainTicker, mockContext).mockReturnValue(rawTicker);
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

  it('should throw an error if the Offering does not exist', () => {
    entityMockUtils.configureMocks({
      offeringOptions: {
        exists: false,
      },
    });

    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    return expect(
      prepareEnableOffChainFundingForOfferings.call(proc, {
        asset,
        id,
        offChainTicker,
      })
    ).rejects.toThrow('The Offering does not exist');
  });

  it('should throw an error if the Offering has reached its end date', () => {
    entityMockUtils.configureMocks({
      offeringOptions: {
        exists: true,
        details: {
          status: {
            timing: OfferingTimingStatus.Expired,
            balance: OfferingBalanceStatus.Available,
            sale: OfferingSaleStatus.Closed,
          },
        },
      },
    });

    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    return expect(
      prepareEnableOffChainFundingForOfferings.call(proc, {
        asset,
        id,
        offChainTicker,
      })
    ).rejects.toThrow('The Offering has already ended');
  });

  it('should throw an error if the Offering is already closed', async () => {
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    entityMockUtils.configureMocks({
      offeringOptions: {
        exists: true,
        details: {
          status: {
            sale: OfferingSaleStatus.ClosedEarly,
            timing: OfferingTimingStatus.Started,
            balance: OfferingBalanceStatus.Available,
          },
        },
      },
    });

    await expect(
      prepareEnableOffChainFundingForOfferings.call(proc, {
        asset,
        id,
        offChainTicker,
      })
    ).rejects.toThrow('The Offering is already closed');

    entityMockUtils.configureMocks({
      offeringOptions: {
        exists: true,
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
      prepareEnableOffChainFundingForOfferings.call(proc, {
        asset,
        id,
        offChainTicker,
      })
    ).rejects.toThrow('The Offering is already closed');
  });

  it('should return a enableOffchainFunding transaction spec', async () => {
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    const transaction = dsMockUtils.createTxMock('sto', 'enableOffchainFunding');

    const result = await prepareEnableOffChainFundingForOfferings.call(proc, {
      asset,
      id,
      offChainTicker,
    });

    expect(result).toEqual({
      transaction,
      args: [rawAssetId, rawId, rawTicker],
      resolver: undefined,
    });
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<Params, void>(mockContext);
      const boundFunc = getAuthorization.bind(proc);

      expect(boundFunc({ asset, id, offChainTicker })).toEqual({
        permissions: {
          transactions: [TxTags.sto.EnableOffchainFunding],
          assets: [asset],
          portfolios: [],
        },
      });
    });
  });
});
