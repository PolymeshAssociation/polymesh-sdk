import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import { getAuthorization, Params, prepareCreateGroup } from '~/api/procedures/createGroup';
import * as procedureUtilsModule from '~/api/procedures/utils';
import { Context, CustomPermissionGroup } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { PermissionType, TxTags } from '~/types';
import { PolymeshTx } from '~/types/internal';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Offering',
  require('~/testUtils/mocks/entities').mockOfferingModule('~/api/entities/Offering')
);
jest.mock(
  '~/api/entities/Asset/Fungible',
  require('~/testUtils/mocks/entities').mockFungibleAssetModule('~/api/entities/Asset/Fungible')
);

describe('createGroup procedure', () => {
  const assetId = '0x1234';
  const transactions = {
    type: PermissionType.Include,
    values: [TxTags.sto.Invest, TxTags.asset.CreateAsset],
  };
  let target: string;
  const rawAssetId = dsMockUtils.createMockAssetId(assetId);
  const rawExtrinsicPermissions = dsMockUtils.createMockExtrinsicPermissions({
    These: [
      dsMockUtils.createMockPalletPermissions({
        palletName: 'Sto',
        dispatchableNames: dsMockUtils.createMockExtrinsicName({
          These: [dsMockUtils.createMockBytes('invest')],
        }),
      }),
    ],
  });

  let mockContext: Mocked<Context>;
  let externalAgentsCreateGroupTransaction: PolymeshTx<unknown[]>;
  let permissionsLikeToPermissionsSpy: jest.SpyInstance;

  beforeAll(() => {
    entityMockUtils.initMocks();
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();

    jest.spyOn(utilsConversionModule, 'assetToMeshAssetId').mockReturnValue(rawAssetId);
    jest
      .spyOn(utilsConversionModule, 'transactionPermissionsToExtrinsicPermissions')
      .mockReturnValue(rawExtrinsicPermissions);

    permissionsLikeToPermissionsSpy = jest.spyOn(
      utilsConversionModule,
      'permissionsLikeToPermissions'
    );
    target = 'someDid';
  });

  beforeEach(() => {
    externalAgentsCreateGroupTransaction = dsMockUtils.createTxMock(
      'externalAgents',
      'createGroup'
    );
    mockContext = dsMockUtils.getContextInstance();
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

  it('should throw an error if there already exists a group with exactly the same permissions', async () => {
    const errorMsg = 'ERROR';
    const assertGroupDoesNotExistSpy = jest.spyOn(procedureUtilsModule, 'assertGroupDoesNotExist');
    assertGroupDoesNotExistSpy.mockImplementation(() => {
      throw new Error(errorMsg);
    });

    const args = {
      assetId,
      permissions: { transactions },
    };

    when(permissionsLikeToPermissionsSpy)
      .calledWith({ transactions }, mockContext)
      .mockReturnValue({ transactions });

    const proc = procedureMockUtils.getInstance<Params, CustomPermissionGroup>(mockContext);

    await expect(
      prepareCreateGroup.call(proc, {
        ...args,
        asset: entityMockUtils.getFungibleAssetInstance({
          permissionsGetAgents: [
            {
              agent: entityMockUtils.getIdentityInstance({ did: target }),
              group: entityMockUtils.getKnownPermissionGroupInstance(),
            },
          ],
        }),
      })
    ).rejects.toThrow(errorMsg);

    assertGroupDoesNotExistSpy.mockRestore();
  });

  it('should return a create group transaction spec', async () => {
    const proc = procedureMockUtils.getInstance<Params, CustomPermissionGroup>(mockContext);

    const fakePermissions = { transactions };
    when(permissionsLikeToPermissionsSpy)
      .calledWith(fakePermissions, mockContext)
      .mockReturnValue({ transactions });

    const asset = entityMockUtils.getFungibleAssetInstance({
      assetId,
      permissionsGetGroups: {
        custom: [
          entityMockUtils.getCustomPermissionGroupInstance({
            assetId,
            id: new BigNumber(2),
            getPermissions: {
              transactions: null,
              transactionGroups: [],
            },
          }),
        ],
        known: [],
      },
    });
    let result = await prepareCreateGroup.call(proc, {
      asset,
      permissions: fakePermissions,
    });

    expect(result).toEqual({
      transaction: externalAgentsCreateGroupTransaction,
      args: [rawAssetId, rawExtrinsicPermissions],
      resolver: expect.any(Function),
    });

    when(permissionsLikeToPermissionsSpy)
      .calledWith(
        {
          transactions: {
            type: PermissionType.Include,
            values: [],
          },
        },
        mockContext
      )
      .mockReturnValue({ transactions: null });

    result = await prepareCreateGroup.call(proc, {
      asset,
      permissions: { transactions },
    });

    expect(result).toEqual({
      transaction: externalAgentsCreateGroupTransaction,
      args: [rawAssetId, rawExtrinsicPermissions],
      resolver: expect.any(Function),
    });
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<Params, CustomPermissionGroup>(mockContext);
      const boundFunc = getAuthorization.bind(proc);

      const asset = entityMockUtils.getBaseAssetInstance({ assetId });
      expect(boundFunc({ asset } as unknown as Params)).toEqual({
        permissions: {
          transactions: [TxTags.externalAgents.CreateGroup],
          assets: [asset],
          portfolios: [],
        },
      });
    });
  });
});
