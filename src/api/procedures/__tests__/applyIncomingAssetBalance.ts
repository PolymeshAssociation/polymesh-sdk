import { ISubmittableResult } from '@polkadot/types/types';
import { ErrorCode } from '@polymeshassociation/polymesh-sdk/types';
import * as utilsInternalModule from '@polymeshassociation/polymesh-sdk/utils/internal';
import { when } from 'jest-when';

import {
  createIncomingAssetBalanceResolver,
  getAuthorization,
  prepareApplyIncomingBalance,
} from '~/api/procedures/applyIncomingAssetBalance';
import { ConfidentialAccount, Context, PolymeshError } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import {
  ApplyIncomingBalanceParams,
  ConfidentialAsset,
  IncomingConfidentialAssetBalance,
  TxTags,
} from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

describe('applyIncomingAssetBalance procedure', () => {
  let mockContext: Mocked<Context>;
  let account: ConfidentialAccount;
  let serializeConfidentialAssetIdSpy: jest.SpyInstance;
  let asset: ConfidentialAsset;
  let rawAssetId: string;
  let args: ApplyIncomingBalanceParams;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();

    serializeConfidentialAssetIdSpy = jest.spyOn(
      utilsConversionModule,
      'serializeConfidentialAssetId'
    );
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    asset = entityMockUtils.getConfidentialAssetInstance();
    rawAssetId = '0x10Asset';

    when(serializeConfidentialAssetIdSpy).calledWith(asset.id).mockReturnValue(rawAssetId);

    account = entityMockUtils.getConfidentialAccountInstance();

    args = {
      confidentialAsset: asset,
      confidentialAccount: account,
    };
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

  it('should throw an error if no incoming balance is present', async () => {
    const proc = procedureMockUtils.getInstance<
      ApplyIncomingBalanceParams,
      IncomingConfidentialAssetBalance
    >(mockContext);

    const expectedError = new PolymeshError({
      code: ErrorCode.DataUnavailable,
      message: 'Amount should be greater than zero',
    });

    account.getIncomingBalance = jest.fn().mockRejectedValue(expectedError);

    await expect(prepareApplyIncomingBalance.call(proc, args)).rejects.toThrowError(expectedError);
  });

  it('should throw an error if account is not owned by the signer', async () => {
    const proc = procedureMockUtils.getInstance<
      ApplyIncomingBalanceParams,
      IncomingConfidentialAssetBalance
    >(mockContext);

    const expectedError = new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message:
        'The Signing Identity cannot apply incoming balance for the confidential Asset in the specified account',
    });

    await expect(
      prepareApplyIncomingBalance.call(proc, {
        ...args,
        confidentialAccount: entityMockUtils.getConfidentialAccountInstance({
          getIdentity: null,
        }),
      })
    ).rejects.toThrowError(expectedError);

    await expect(
      prepareApplyIncomingBalance.call(proc, {
        ...args,
        confidentialAccount: entityMockUtils.getConfidentialAccountInstance({
          getIdentity: entityMockUtils.getIdentityInstance({
            did: 'someRandomDid',
          }),
        }),
      })
    ).rejects.toThrowError(expectedError);
  });

  it('should return a apply incoming balance transaction spec', async () => {
    const transaction = dsMockUtils.createTxMock('confidentialAsset', 'applyIncomingBalance');
    const proc = procedureMockUtils.getInstance<
      ApplyIncomingBalanceParams,
      IncomingConfidentialAssetBalance
    >(mockContext);

    const result = await prepareApplyIncomingBalance.call(proc, args);
    expect(result).toEqual({
      transaction,
      args: [account.publicKey, rawAssetId],
      resolver: expect.any(Function),
    });
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<
        ApplyIncomingBalanceParams,
        IncomingConfidentialAssetBalance
      >(mockContext);
      const boundFunc = getAuthorization.bind(proc);

      expect(boundFunc()).toEqual({
        permissions: {
          transactions: [TxTags.confidentialAsset.ApplyIncomingBalance],
          assets: [],
          portfolios: [],
        },
      });
    });
  });

  describe('createIncomingAssetBalanceResolver', () => {
    const filterEventRecordsSpy = jest.spyOn(utilsInternalModule, 'filterEventRecords');
    const rawBalance = dsMockUtils.createMockElgamalCipherText('0xbalance');
    const rawAmount = dsMockUtils.createMockElgamalCipherText('0xamount');

    afterEach(() => {
      filterEventRecordsSpy.mockReset();
    });

    beforeEach(() => {
      filterEventRecordsSpy.mockReturnValue([
        dsMockUtils.createMockIEvent([
          '0xPublicKey',
          '0x76702175d8cbe3a55a19734433351e25',
          rawAmount,
          rawBalance,
        ]),
      ]);
    });

    it('should return the new Confidential Transaction', () => {
      const fakeContext = {} as Context;

      const result = createIncomingAssetBalanceResolver(fakeContext)({} as ISubmittableResult);

      expect(result).toEqual(
        expect.objectContaining({
          asset: expect.objectContaining({ id: '76702175-d8cb-e3a5-5a19-734433351e25' }),
          amount: '0xamount',
          balance: '0xbalance',
        })
      );
    });
  });
});
