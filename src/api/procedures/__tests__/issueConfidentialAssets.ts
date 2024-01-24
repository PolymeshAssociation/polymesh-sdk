import { Balance } from '@polkadot/types/interfaces';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import {
  getAuthorization,
  Params,
  prepareConfidentialAssets,
} from '~/api/procedures/issueConfidentialAssets';
import { Context, PolymeshError } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { ConfidentialAccount, ConfidentialAsset, ErrorCode, RoleType, TxTags } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/confidential/ConfidentialAsset',
  require('~/testUtils/mocks/entities').mockConfidentialAssetModule(
    '~/api/entities/confidential/ConfidentialAsset'
  )
);

describe('issueConfidentialAssets procedure', () => {
  let mockContext: Mocked<Context>;
  let amount: BigNumber;
  let rawAmount: Balance;
  let account: ConfidentialAccount;
  let serializeConfidentialAssetIdSpy: jest.SpyInstance;
  let bigNumberToU128Spy: jest.SpyInstance;
  let asset: Mocked<ConfidentialAsset>;
  let rawAssetId: string;
  let args: Params;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();

    bigNumberToU128Spy = jest.spyOn(utilsConversionModule, 'bigNumberToU128');
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

    amount = new BigNumber(100);
    rawAmount = dsMockUtils.createMockBalance(amount);

    when(bigNumberToU128Spy).calledWith(amount, mockContext).mockReturnValue(rawAmount);

    account = entityMockUtils.getConfidentialAccountInstance();

    args = {
      asset,
      amount,
      account,
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
      prepareConfidentialAssets.call(proc, { ...args, amount: new BigNumber(-10) })
    ).rejects.toThrowError(expectedError);
  });

  it('should throw an error if destination account is not owned by the signer', async () => {
    const proc = procedureMockUtils.getInstance<Params, ConfidentialAsset>(mockContext);

    const expectedError = new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'The Signing Identity cannot issue confidential Assets in the specified account',
    });

    await expect(
      prepareConfidentialAssets.call(proc, {
        ...args,
        account: entityMockUtils.getConfidentialAccountInstance({
          getIdentity: null,
        }),
      })
    ).rejects.toThrowError(expectedError);

    await expect(
      prepareConfidentialAssets.call(proc, {
        ...args,
        account: entityMockUtils.getConfidentialAccountInstance({
          getIdentity: entityMockUtils.getIdentityInstance({
            did: 'someRandomDid',
          }),
        }),
      })
    ).rejects.toThrowError(expectedError);
  });

  it('should throw an error if Asset supply is bigger than the limit total supply', async () => {
    const limitTotalSupply = new BigNumber(Math.pow(10, 12));

    entityMockUtils.configureMocks({
      confidentialAssetOptions: {
        details: {
          totalSupply: limitTotalSupply,
        },
      },
    });

    const proc = procedureMockUtils.getInstance<Params, ConfidentialAsset>(mockContext);

    let error;

    try {
      await prepareConfidentialAssets.call(proc, {
        ...args,
        asset: entityMockUtils.getConfidentialAssetInstance(),
      });
    } catch (err) {
      error = err;
    }

    expect(error.message).toBe(
      `This issuance operation will cause the total supply of "${asset.id}" to exceed the supply limit`
    );
    expect(error.data).toMatchObject({
      currentSupply: limitTotalSupply,
      supplyLimit: limitTotalSupply,
    });
  });

  it('should return a mint Confidential Asset transaction spec', async () => {
    const transaction = dsMockUtils.createTxMock('confidentialAsset', 'mintConfidentialAsset');
    const proc = procedureMockUtils.getInstance<Params, ConfidentialAsset>(mockContext);

    const result = await prepareConfidentialAssets.call(proc, args);
    expect(result).toEqual({
      transaction,
      args: [rawAssetId, rawAmount, account.publicKey],
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
          transactions: [TxTags.confidentialAsset.MintConfidentialAsset],
          assets: [],
          portfolios: [],
        },
      });
    });
  });
});
