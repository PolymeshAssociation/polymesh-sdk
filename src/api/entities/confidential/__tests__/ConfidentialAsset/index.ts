import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import { ConfidentialAsset, Context, Entity } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import * as utilsConversionModule from '~/utils/conversion';

describe('ConfidentialAsset class', () => {
  let id: string;
  let guid: string;
  let confidentialAsset: ConfidentialAsset;
  let context: Context;

  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();
    procedureMockUtils.initMocks();
  });

  beforeEach(() => {
    id = '76702175d8cbe3a55a19734433351e25';
    guid = '76702175-d8cb-e3a5-5a19-734433351e25';
    context = dsMockUtils.getContextInstance();
    confidentialAsset = new ConfidentialAsset({ id }, context);
  });

  afterEach(() => {
    dsMockUtils.reset();
    entityMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  it('should extend Entity', () => {
    expect(ConfidentialAsset.prototype instanceof Entity).toBe(true);
  });

  describe('constructor', () => {
    it('should assign ID to instance', () => {
      expect(confidentialAsset.id).toBe(guid);
    });
  });

  describe('method: isUniqueIdentifiers', () => {
    it('should return true if the object conforms to the interface', () => {
      expect(
        ConfidentialAsset.isUniqueIdentifiers({ id: '76702175d8cbe3a55a19734433351e25' })
      ).toBe(true);
      expect(ConfidentialAsset.isUniqueIdentifiers({})).toBe(false);
      expect(ConfidentialAsset.isUniqueIdentifiers({ id: 3 })).toBe(false);
    });
  });

  describe('method: details', () => {
    let detailsQueryMock: jest.Mock;
    let u128ToBigNumberSpy: jest.SpyInstance;
    let bytesToStringSpy: jest.SpyInstance;
    let identityIdToStringSpy: jest.SpyInstance;

    const assetDetails = {
      totalSupply: new BigNumber(100),
      data: 'SOME_DATA',
      ownerDid: 'SOME_DID',
    };

    beforeAll(() => {
      u128ToBigNumberSpy = jest.spyOn(utilsConversionModule, 'u128ToBigNumber');
      bytesToStringSpy = jest.spyOn(utilsConversionModule, 'bytesToString');
      identityIdToStringSpy = jest.spyOn(utilsConversionModule, 'identityIdToString');
    });

    beforeEach(() => {
      detailsQueryMock = dsMockUtils.createQueryMock('confidentialAsset', 'details');
      when(bytesToStringSpy).calledWith(assetDetails.data).mockReturnValue(assetDetails.data);
      when(u128ToBigNumberSpy)
        .calledWith(assetDetails.totalSupply)
        .mockReturnValue(assetDetails.totalSupply);
      when(identityIdToStringSpy)
        .calledWith(assetDetails.ownerDid)
        .mockReturnValue(assetDetails.ownerDid);
    });

    it('should return null if confidential Asset does not exists', async () => {
      detailsQueryMock.mockResolvedValueOnce(dsMockUtils.createMockOption());
      const result = await confidentialAsset.details();

      expect(result).toBe(null);
    });

    it('should return the basic details of the confidential Asset', async () => {
      detailsQueryMock.mockResolvedValueOnce(
        dsMockUtils.createMockOption(
          dsMockUtils.createMockConfidentialAssetDetails({
            ...assetDetails,
            ticker: dsMockUtils.createMockOption(),
          })
        )
      );
      const expectedAssetDetails = {
        data: assetDetails.data,
        owner: expect.objectContaining({
          did: assetDetails.ownerDid,
        }),
        totalSupply: assetDetails.totalSupply,
        ticker: undefined,
      };

      let result = await confidentialAsset.details();

      expect(result).toEqual(expect.objectContaining(expectedAssetDetails));

      detailsQueryMock.mockResolvedValueOnce(
        dsMockUtils.createMockOption(
          dsMockUtils.createMockConfidentialAssetDetails({
            ...assetDetails,
            ticker: dsMockUtils.createMockOption(dsMockUtils.createMockTicker('SOME_TICKER')),
          })
        )
      );

      result = await confidentialAsset.details();

      expect(result).toEqual(
        expect.objectContaining({
          ...expectedAssetDetails,
          ticker: 'SOME_TICKER',
        })
      );
    });
  });

  describe('method: exists', () => {
    it('should return if Confidential Asset exists', async () => {
      const detailsSpy = jest.spyOn(confidentialAsset, 'details');

      detailsSpy.mockResolvedValueOnce({
        owner: entityMockUtils.getIdentityInstance(),
        totalSupply: new BigNumber(100),
        data: 'SOME_DATA',
        ticker: 'SOME_TICKER',
      });

      let result = await confidentialAsset.exists();

      expect(result).toBeTruthy();

      detailsSpy.mockResolvedValueOnce(null);

      result = await confidentialAsset.exists();

      expect(result).toBeFalsy();
    });
  });

  describe('method: toHuman', () => {
    it('should return a human readable version of the entity', () => {
      expect(confidentialAsset.toHuman()).toBe(guid);
    });
  });
});
