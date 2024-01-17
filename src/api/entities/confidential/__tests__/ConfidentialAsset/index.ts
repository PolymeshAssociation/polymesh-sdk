import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import { ConfidentialAsset, Context, Entity, PolymeshError } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { ErrorCode } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Identity',
  require('~/testUtils/mocks/entities').mockIdentityModule('~/api/entities/Identity')
);
jest.mock(
  '~/api/entities/confidential/ConfidentialAccount',
  require('~/testUtils/mocks/entities').mockConfidentialAccountModule(
    '~/api/entities/confidential/ConfidentialAccount'
  )
);

describe('ConfidentialAsset class', () => {
  let assetId: string;
  let id: string;
  let confidentialAsset: ConfidentialAsset;
  let context: Context;
  const assetDetails = {
    totalSupply: new BigNumber(100),
    data: 'SOME_DATA',
    ownerDid: 'SOME_DID',
  };
  let detailsQueryMock: jest.Mock;

  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();
    procedureMockUtils.initMocks();
  });

  beforeEach(() => {
    assetId = '76702175d8cbe3a55a19734433351e25';
    id = '76702175-d8cb-e3a5-5a19-734433351e25';
    context = dsMockUtils.getContextInstance();
    confidentialAsset = new ConfidentialAsset({ id: assetId }, context);
    detailsQueryMock = dsMockUtils.createQueryMock('confidentialAsset', 'details');

    detailsQueryMock.mockResolvedValue(
      dsMockUtils.createMockOption(
        dsMockUtils.createMockConfidentialAssetDetails({
          ...assetDetails,
          ticker: dsMockUtils.createMockOption(),
        })
      )
    );
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
      expect(confidentialAsset.id).toBe(id);
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
    let u128ToBigNumberSpy: jest.SpyInstance;
    let bytesToStringSpy: jest.SpyInstance;
    let identityIdToStringSpy: jest.SpyInstance;

    beforeAll(() => {
      u128ToBigNumberSpy = jest.spyOn(utilsConversionModule, 'u128ToBigNumber');
      bytesToStringSpy = jest.spyOn(utilsConversionModule, 'bytesToString');
      identityIdToStringSpy = jest.spyOn(utilsConversionModule, 'identityIdToString');
    });

    beforeEach(() => {
      when(bytesToStringSpy).calledWith(assetDetails.data).mockReturnValue(assetDetails.data);
      when(u128ToBigNumberSpy)
        .calledWith(assetDetails.totalSupply)
        .mockReturnValue(assetDetails.totalSupply);
      when(identityIdToStringSpy)
        .calledWith(assetDetails.ownerDid)
        .mockReturnValue(assetDetails.ownerDid);
    });

    it('should return the basic details of the confidential Asset', async () => {
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

    it('should throw an error if confidential Asset details are not available', async () => {
      const expectedError = new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: 'The Confidential Asset does not exists',
        data: { id },
      });
      detailsQueryMock.mockResolvedValue(dsMockUtils.createMockOption());
      await expect(confidentialAsset.details()).rejects.toThrow(expectedError);
    });
  });

  describe('method: getAuditors', () => {
    it('should throw an error if no auditor info exists', () => {
      dsMockUtils.createQueryMock('confidentialAsset', 'assetAuditors', {
        returnValue: dsMockUtils.createMockOption(),
      });

      const expectedError = new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: 'The Confidential Asset does not exists',
        data: { id },
      });

      return expect(confidentialAsset.getAuditors()).rejects.toThrow(expectedError);
    });

    it('should return all the auditors group by their type', async () => {
      dsMockUtils.createQueryMock('confidentialAsset', 'assetAuditors', {
        returnValue: dsMockUtils.createMockOption(
          dsMockUtils.createMockConfidentialAuditors({
            auditors: ['someAuditorPublicKey'],
            mediators: ['someMediatorDid'],
          })
        ),
      });

      const result = await confidentialAsset.getAuditors();

      expect(result.mediators[0]).toEqual(
        expect.objectContaining({
          did: 'someMediatorDid',
        })
      );

      expect(result.auditors[0]).toEqual(
        expect.objectContaining({
          publicKey: 'someAuditorPublicKey',
        })
      );
    });
  });

  describe('method: exists', () => {
    it('should return if Confidential Asset exists', async () => {
      let result = await confidentialAsset.exists();

      expect(result).toBeTruthy();

      detailsQueryMock.mockResolvedValue(dsMockUtils.createMockOption());

      result = await confidentialAsset.exists();

      expect(result).toBeFalsy();
    });
  });

  describe('method: toHuman', () => {
    it('should return a human readable version of the entity', () => {
      expect(confidentialAsset.toHuman()).toBe(id);
    });
  });
});
