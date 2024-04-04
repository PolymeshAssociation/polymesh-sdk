import { Balance } from '@polkadot/types/interfaces';
import { ConfidentialAssetsBurnConfidentialBurnProof } from '@polkadot/types/lookup';
import { ErrorCode } from '@polymeshassociation/polymesh-sdk/types';
import * as utilsPublicConversionModule from '@polymeshassociation/polymesh-sdk/utils/conversion';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import {
  getAuthorization,
  Params,
  prepareBurnConfidentialAsset,
} from '~/api/procedures/burnConfidentialAssets';
import { Context, PolymeshError } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { ConfidentialAccount, ConfidentialAsset, RoleType, TxTags } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/ConfidentialAsset',
  require('~/testUtils/mocks/entities').mockConfidentialAssetModule(
    '~/api/entities/ConfidentialAsset'
  )
);

describe('burnConfidentialAssets procedure', () => {
  let mockContext: Mocked<Context>;
  let amount: BigNumber;
  let rawAmount: Balance;
  let account: ConfidentialAccount;
  let serializeConfidentialAssetIdSpy: jest.SpyInstance;
  let bigNumberToU128Spy: jest.SpyInstance;
  let confidentialBurnProofToRawSpy: jest.SpyInstance;
  let asset: Mocked<ConfidentialAsset>;
  let rawAssetId: string;
  let proof: string;
  let rawProof: ConfidentialAssetsBurnConfidentialBurnProof;
  let args: Params;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();

    bigNumberToU128Spy = jest.spyOn(utilsPublicConversionModule, 'bigNumberToU128');
    serializeConfidentialAssetIdSpy = jest.spyOn(
      utilsConversionModule,
      'serializeConfidentialAssetId'
    );

    confidentialBurnProofToRawSpy = jest.spyOn(utilsConversionModule, 'confidentialBurnProofToRaw');
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    asset = entityMockUtils.getConfidentialAssetInstance({
      details: { totalSupply: new BigNumber(1000) },
    });
    rawAssetId = '0x10Asset';
    rawProof = dsMockUtils.createMockConfidentialBurnProof({
      encodedInnerProof: dsMockUtils.createMockBytes(proof),
    });

    when(serializeConfidentialAssetIdSpy).calledWith(asset.id).mockReturnValue(rawAssetId);

    when(confidentialBurnProofToRawSpy).calledWith(proof, mockContext).mockReturnValue(rawProof);

    amount = new BigNumber(100);
    rawAmount = dsMockUtils.createMockBalance(amount);

    when(bigNumberToU128Spy).calledWith(amount, mockContext).mockReturnValue(rawAmount);

    account = entityMockUtils.getConfidentialAccountInstance({
      getIdentity: entityMockUtils.getIdentityInstance({
        did: 'someDid',
      }),
    });

    args = {
      confidentialAsset: asset,
      amount,
      confidentialAccount: account,
      proof,
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

  it('should throw an error if amount provided is less than equal to 0', () => {
    const proc = procedureMockUtils.getInstance<Params, ConfidentialAsset>(mockContext);

    const expectedError = new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'Amount should be greater than zero',
      data: {
        amount,
      },
    });

    return expect(
      prepareBurnConfidentialAsset.call(proc, { ...args, amount: new BigNumber(-10) })
    ).rejects.toThrowError(expectedError);
  });

  it('should throw an error if destination account is not owned by the signer', async () => {
    const proc = procedureMockUtils.getInstance<Params, ConfidentialAsset>(mockContext);

    const expectedError = new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'The Signing Identity cannot burn confidential Assets in the specified account',
    });

    await expect(
      prepareBurnConfidentialAsset.call(proc, {
        ...args,
        confidentialAccount: entityMockUtils.getConfidentialAccountInstance({
          getIdentity: null,
        }),
      })
    ).rejects.toThrowError(expectedError);

    await expect(
      prepareBurnConfidentialAsset.call(proc, {
        ...args,
        confidentialAccount: entityMockUtils.getConfidentialAccountInstance({
          getIdentity: entityMockUtils.getIdentityInstance({
            did: 'someRandomDid',
          }),
        }),
      })
    ).rejects.toThrowError(expectedError);
  });

  it('should throw an error if Asset supply is bigger than the current supply', async () => {
    const proc = procedureMockUtils.getInstance<Params, ConfidentialAsset>(mockContext);

    let error;

    try {
      await prepareBurnConfidentialAsset.call(proc, {
        ...args,
        confidentialAsset: entityMockUtils.getConfidentialAssetInstance(),
      });
    } catch (err) {
      error = err;
    }

    expect(error.message).toBe(
      `This burn operation will cause the total supply of "${asset.id}" to be negative`
    );
  });

  it('should return a burn Confidential Asset transaction spec', async () => {
    const transaction = dsMockUtils.createTxMock('confidentialAsset', 'burn');
    const proc = procedureMockUtils.getInstance<Params, ConfidentialAsset>(mockContext);

    const result = await prepareBurnConfidentialAsset.call(proc, args);
    expect(result).toEqual({
      transaction,
      args: [rawAssetId, rawAmount, account.publicKey, rawProof],
      resolver: expect.objectContaining({ id: asset.id }),
    });
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<Params, ConfidentialAsset>(mockContext);
      const boundFunc = getAuthorization.bind(proc);

      expect(boundFunc(args)).toEqual({
        roles: [{ type: RoleType.ConfidentialAssetOwner, assetId: asset.id }],
        permissions: {
          transactions: [TxTags.confidentialAsset.Burn],
          assets: [],
          portfolios: [],
        },
      });
    });
  });
});
