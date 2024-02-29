import { bool } from '@polkadot/types';
import { PalletConfidentialAssetConfidentialAccount } from '@polkadot/types/lookup';
import { when } from 'jest-when';

import {
  getAuthorization,
  Params,
  prepareToggleFreezeConfidentialAccountAsset,
} from '~/api/procedures/toggleFreezeConfidentialAccountAsset';
import { Context } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { ConfidentialAccount, ConfidentialAsset, RoleType, TxTags } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

describe('toggleFreezeConfidentialAccountAsset procedure', () => {
  let mockContext: Mocked<Context>;
  let confidentialAsset: ConfidentialAsset;
  let confidentialAccount: ConfidentialAccount;
  let rawAssetId: string;
  let rawPublicKey: PalletConfidentialAssetConfidentialAccount;
  let booleanToBoolSpy: jest.SpyInstance;
  let confidentialAccountToMeshPublicKeySpy: jest.SpyInstance;
  let rawTrue: bool;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    confidentialAsset = entityMockUtils.getConfidentialAssetInstance();
    confidentialAccount = entityMockUtils.getConfidentialAccountInstance();
    rawPublicKey = dsMockUtils.createMockConfidentialAccount(confidentialAccount.publicKey);
    rawAssetId = '0x76702175d8cbe3a55a19734433351e26';
    rawTrue = dsMockUtils.createMockBool(true);
    booleanToBoolSpy = jest.spyOn(utilsConversionModule, 'booleanToBool');
    confidentialAccountToMeshPublicKeySpy = jest.spyOn(
      utilsConversionModule,
      'confidentialAccountToMeshPublicKey'
    );
    when(booleanToBoolSpy).calledWith(true, mockContext).mockReturnValue(rawTrue);
    when(confidentialAccountToMeshPublicKeySpy)
      .calledWith(confidentialAccount, mockContext)
      .mockReturnValue(rawPublicKey);
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

  it('should throw an error if freeze is set to true and the Asset is already frozen', () => {
    const frozenAsset = entityMockUtils.getConfidentialAssetInstance({
      isAccountFrozen: true,
    });

    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    return expect(
      prepareToggleFreezeConfidentialAccountAsset.call(proc, {
        confidentialAsset: frozenAsset,
        confidentialAccount,
        freeze: true,
      })
    ).rejects.toThrow('The account is already frozen');
  });

  it('should throw an error if freeze is set to false and the Asset is already unfrozen', () => {
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    return expect(
      prepareToggleFreezeConfidentialAccountAsset.call(proc, {
        confidentialAsset,
        confidentialAccount,
        freeze: false,
      })
    ).rejects.toThrow('The account is already unfrozen');
  });

  it('should return a freeze account asset transaction spec', async () => {
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    const transaction = dsMockUtils.createTxMock('confidentialAsset', 'setAccountAssetFrozen');

    const result = await prepareToggleFreezeConfidentialAccountAsset.call(proc, {
      confidentialAsset,
      confidentialAccount,
      freeze: true,
    });

    expect(result).toEqual({
      transaction,
      args: [rawPublicKey, rawAssetId, rawTrue],
      resolver: undefined,
    });
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<Params, void>(mockContext);
      const boundFunc = getAuthorization.bind(proc);

      expect(boundFunc({ confidentialAsset, confidentialAccount, freeze: false })).toEqual({
        roles: [{ assetId: confidentialAsset.id, type: RoleType.ConfidentialAssetOwner }],
        permissions: {
          transactions: [TxTags.confidentialAsset.SetAccountAssetFrozen],
          assets: [],
          portfolios: [],
        },
      });
    });
  });
});
