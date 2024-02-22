import { when } from 'jest-when';

import {
  getAuthorization,
  prepareApplyIncomingBalance,
} from '~/api/procedures/applyIncomingAssetBalance';
import { Context, PolymeshError } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { ApplyIncomingBalanceParams, ConfidentialAsset, ErrorCode, TxTags } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

import { ConfidentialAccount } from './../../entities/types';

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
    const proc = procedureMockUtils.getInstance<ApplyIncomingBalanceParams, ConfidentialAccount>(
      mockContext
    );

    const expectedError = new PolymeshError({
      code: ErrorCode.DataUnavailable,
      message: 'Amount should be greater than zero',
    });

    account.getIncomingBalance = jest.fn().mockRejectedValue(expectedError);

    await expect(prepareApplyIncomingBalance.call(proc, args)).rejects.toThrowError(expectedError);
  });

  it('should throw an error if account is not owned by the signer', async () => {
    const proc = procedureMockUtils.getInstance<ApplyIncomingBalanceParams, ConfidentialAccount>(
      mockContext
    );

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
    const proc = procedureMockUtils.getInstance<ApplyIncomingBalanceParams, ConfidentialAccount>(
      mockContext
    );

    const result = await prepareApplyIncomingBalance.call(proc, args);
    expect(result).toEqual({
      transaction,
      args: [account.publicKey, rawAssetId],
      resolver: expect.objectContaining({ publicKey: account.publicKey }),
    });
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<ApplyIncomingBalanceParams, ConfidentialAccount>(
        mockContext
      );
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
});
