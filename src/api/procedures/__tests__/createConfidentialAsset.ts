import {
  PalletConfidentialAssetConfidentialAuditors,
  PolymeshPrimitivesTicker,
} from '@polkadot/types/lookup';
import { ISubmittableResult } from '@polkadot/types/types';
import { Bytes } from '@polkadot/types-codec';
import { when } from 'jest-when';

import {
  createConfidentialAssetResolver,
  prepareCreateConfidentialAsset,
} from '~/api/procedures/createConfidentialAsset';
import { ConfidentialAsset, Context, Identity, PolymeshError } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { ConfidentialAccount, CreateConfidentialAssetParams, ErrorCode } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';
import * as utilsInternalModule from '~/utils/internal';

describe('createConfidentialAsset procedure', () => {
  let mockContext: Mocked<Context>;

  let ticker: string;
  let rawTicker: PolymeshPrimitivesTicker;
  let data: string;
  let rawData: Bytes;
  let auditors: ConfidentialAccount[];
  let mediators: Identity[];
  let rawAuditors: PalletConfidentialAssetConfidentialAuditors;
  let stringToTickerSpy: jest.SpyInstance;
  let stringToBytesSpy: jest.SpyInstance;
  let auditorsToConfidentialAuditorsSpy: jest.SpyInstance;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();

    stringToTickerSpy = jest.spyOn(utilsConversionModule, 'stringToTicker');
    stringToBytesSpy = jest.spyOn(utilsConversionModule, 'stringToBytes');
    auditorsToConfidentialAuditorsSpy = jest.spyOn(
      utilsConversionModule,
      'auditorsToConfidentialAuditors'
    );
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    auditors = [entityMockUtils.getConfidentialAccountInstance()];
    mediators = [
      entityMockUtils.getIdentityInstance({
        did: 'someMediatorDid',
      }),
    ];

    rawAuditors = dsMockUtils.createMockConfidentialAuditors({
      auditors: ['somePublicKey'],
      mediators: ['someMediatorDid'],
    });

    ticker = 'SOME_TICKER';
    rawTicker = dsMockUtils.createMockTicker(ticker);
    data = 'SOME_DATA';
    rawData = dsMockUtils.createMockBytes(data);

    when(stringToTickerSpy).calledWith(ticker, mockContext).mockReturnValue(rawTicker);
    when(stringToBytesSpy).calledWith(data, mockContext).mockReturnValue(rawData);
    when(auditorsToConfidentialAuditorsSpy)
      .calledWith(mockContext, auditors, mediators)
      .mockReturnValue(rawAuditors);
  });

  afterEach(() => {
    entityMockUtils.reset();
    procedureMockUtils.reset();
    dsMockUtils.reset();
  });

  afterAll(() => {
    jest.resetAllMocks();
    procedureMockUtils.cleanup();
    dsMockUtils.cleanup();
  });

  it('should throw an error if one or more auditors is not linked to an Identity', () => {
    const proc = procedureMockUtils.getInstance<CreateConfidentialAssetParams, ConfidentialAsset>(
      mockContext
    );
    const invalidAuditors = [
      ...auditors,
      entityMockUtils.getConfidentialAccountInstance({
        getIdentity: null,
      }),
    ];
    const expectedError = new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'One or more auditors do not exists',
      data: {
        invalidAuditors,
      },
    });
    return expect(
      prepareCreateConfidentialAsset.call(proc, {
        ticker,
        data,
        auditors: invalidAuditors,
      })
    ).rejects.toThrowError(expectedError);
  });

  it('should add a create CreateConfidentialAsset transaction to the queue', async () => {
    const proc = procedureMockUtils.getInstance<CreateConfidentialAssetParams, ConfidentialAsset>(
      mockContext
    );

    const createConfidentialAssetTransaction = dsMockUtils.createTxMock(
      'confidentialAsset',
      'createConfidentialAsset'
    );

    let result = await prepareCreateConfidentialAsset.call(proc, {
      ticker,
      data,
      auditors,
      mediators,
    });

    expect(result).toEqual({
      transaction: createConfidentialAssetTransaction,
      resolver: expect.any(Function),
      args: [rawTicker, rawData, rawAuditors],
    });

    when(auditorsToConfidentialAuditorsSpy)
      .calledWith(mockContext, auditors, undefined)
      .mockReturnValue(rawAuditors);

    result = await prepareCreateConfidentialAsset.call(proc, {
      ticker,
      data,
      auditors,
      mediators: [],
    });

    expect(result).toEqual({
      transaction: createConfidentialAssetTransaction,
      resolver: expect.any(Function),
      args: [rawTicker, rawData, rawAuditors],
    });
  });

  describe('createConfidentialAssetResolver', () => {
    const filterEventRecordsSpy = jest.spyOn(utilsInternalModule, 'filterEventRecords');
    const did = 'someDid';
    const rawIdentityId = dsMockUtils.createMockIdentityId(did);
    const rawConfidentialAsset = '0x76702175d8cbe3a55a19734433351e25';

    beforeEach(() => {
      filterEventRecordsSpy.mockReturnValue([
        dsMockUtils.createMockIEvent([rawIdentityId, rawConfidentialAsset]),
      ]);
    });

    afterEach(() => {
      jest.resetAllMocks();
      filterEventRecordsSpy.mockReset();
    });

    it('should return the new ConfidentialAsset', () => {
      const fakeContext = {} as Context;

      const result = createConfidentialAssetResolver(fakeContext)({} as ISubmittableResult);

      expect(result.id).toEqual('76702175-d8cb-e3a5-5a19-734433351e25');
    });
  });
});
