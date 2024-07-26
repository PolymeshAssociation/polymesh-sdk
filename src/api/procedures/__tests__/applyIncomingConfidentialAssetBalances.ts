import { u16 } from '@polkadot/types';
import { ISubmittableResult } from '@polkadot/types/types';
import { ErrorCode } from '@polymeshassociation/polymesh-sdk/types';
import * as utilsInternalModule from '@polymeshassociation/polymesh-sdk/utils/internal';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import {
  createIncomingAssetBalancesResolver,
  getAuthorization,
  prepareApplyIncomingConfidentialAssetBalances,
} from '~/api/procedures/applyIncomingConfidentialAssetBalances';
import { Context, PolymeshError } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import {
  ApplyIncomingConfidentialAssetBalancesParams,
  ConfidentialAccount,
  IncomingConfidentialAssetBalance,
  TxTags,
} from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

describe('applyIncomingConfidentialAssetBalances procedure', () => {
  let mockContext: Mocked<Context>;
  let account: ConfidentialAccount;
  let maxUpdates: BigNumber;
  let rawMaxUpdates: u16;
  let args: ApplyIncomingConfidentialAssetBalancesParams;
  let bigNumberToU16Spy: jest.SpyInstance;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();

    bigNumberToU16Spy = jest.spyOn(utilsConversionModule, 'bigNumberToU16');
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();

    maxUpdates = new BigNumber(2);
    account = entityMockUtils.getConfidentialAccountInstance({
      getIncomingBalances: [
        {
          confidentialAsset: entityMockUtils.getConfidentialAssetInstance(),
          balance: 'some_encrypted_balance',
        },
      ],
    });
    rawMaxUpdates = dsMockUtils.createMockU16(maxUpdates);

    when(bigNumberToU16Spy).calledWith(maxUpdates, mockContext).mockReturnValue(rawMaxUpdates);

    args = {
      confidentialAccount: account,
      maxUpdates,
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

  it('should throw an error if account is not owned by the signer', async () => {
    const proc = procedureMockUtils.getInstance<
      ApplyIncomingConfidentialAssetBalancesParams,
      IncomingConfidentialAssetBalance[]
    >(mockContext);

    const expectedError = new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'The Signing Identity cannot apply incoming balances in the specified account',
    });

    await expect(
      prepareApplyIncomingConfidentialAssetBalances.call(proc, {
        ...args,
        confidentialAccount: entityMockUtils.getConfidentialAccountInstance({
          getIdentity: null,
        }),
      })
    ).rejects.toThrowError(expectedError);

    await expect(
      prepareApplyIncomingConfidentialAssetBalances.call(proc, {
        ...args,
        confidentialAccount: entityMockUtils.getConfidentialAccountInstance({
          getIdentity: entityMockUtils.getIdentityInstance({
            did: 'someRandomDid',
          }),
        }),
      })
    ).rejects.toThrowError(expectedError);
  });

  it('should throw an error if no incoming balances are present', async () => {
    const proc = procedureMockUtils.getInstance<
      ApplyIncomingConfidentialAssetBalancesParams,
      IncomingConfidentialAssetBalance[]
    >(mockContext);

    const expectedError = new PolymeshError({
      code: ErrorCode.DataUnavailable,
      message: 'No incoming balance found for the given confidential Account',
    });

    await expect(
      prepareApplyIncomingConfidentialAssetBalances.call(proc, {
        ...args,
        confidentialAccount: entityMockUtils.getConfidentialAccountInstance(),
      })
    ).rejects.toThrowError(expectedError);
  });

  it('should return a apply incoming balances transaction spec', async () => {
    const transaction = dsMockUtils.createTxMock('confidentialAsset', 'applyIncomingBalances');
    const proc = procedureMockUtils.getInstance<
      ApplyIncomingConfidentialAssetBalancesParams,
      IncomingConfidentialAssetBalance[]
    >(mockContext);

    let result = await prepareApplyIncomingConfidentialAssetBalances.call(proc, args);
    expect(result).toEqual({
      transaction,
      args: [account.publicKey, rawMaxUpdates],
      resolver: expect.any(Function),
    });

    // maxUpdates to equal all incoming balances length
    const newMaxUpdates = new BigNumber(1);
    const rawNewMaxUpdates = dsMockUtils.createMockU16(newMaxUpdates);
    when(bigNumberToU16Spy)
      .calledWith(newMaxUpdates, mockContext)
      .mockReturnValue(rawNewMaxUpdates);

    result = await prepareApplyIncomingConfidentialAssetBalances.call(proc, {
      ...args,
      maxUpdates: undefined,
    });
    expect(result).toEqual({
      transaction,
      args: [account.publicKey, rawNewMaxUpdates],
      resolver: expect.any(Function),
    });
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<
        ApplyIncomingConfidentialAssetBalancesParams,
        IncomingConfidentialAssetBalance[]
      >(mockContext);
      const boundFunc = getAuthorization.bind(proc);

      expect(boundFunc()).toEqual({
        permissions: {
          transactions: [TxTags.confidentialAsset.ApplyIncomingBalances],
          assets: [],
          portfolios: [],
        },
      });
    });
  });

  describe('createIncomingAssetBalancesResolver', () => {
    const filterEventRecordsSpy = jest.spyOn(utilsInternalModule, 'filterEventRecords');
    const rawAmount = dsMockUtils.createMockElgamalCipherText('0xamount');
    const rawBalance = dsMockUtils.createMockElgamalCipherText('0xbalance');

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

    afterEach(() => {
      filterEventRecordsSpy.mockReset();
    });

    it('should return the new Confidential Transaction', () => {
      const fakeContext = {} as Context;

      const result = createIncomingAssetBalancesResolver(fakeContext)({} as ISubmittableResult);

      expect(result[0]).toEqual(
        expect.objectContaining({
          asset: expect.objectContaining({ id: '76702175-d8cb-e3a5-5a19-734433351e25' }),
          amount: '0xamount',
          balance: '0xbalance',
        })
      );
    });
  });
});
