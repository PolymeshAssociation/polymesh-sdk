import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import {
  getAuthorization,
  Params,
  prepareSetGroupPermissions,
} from '~/api/procedures/setGroupPermissions';
import { Context } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { PermissionType, TxTags } from '~/types';
import { PolymeshTx } from '~/types/internal';
import { uuidToHex } from '~/utils';
import * as utilsConversionModule from '~/utils/conversion';

describe('setGroupPermissions procedure', () => {
  const assetId = '12341234-1234-1234-1234-123412341234';
  const permissions = {
    transactions: {
      type: PermissionType.Include,
      values: [TxTags.sto.Invest],
    },
  };
  const rawAssetId = dsMockUtils.createMockAssetId(uuidToHex(assetId));
  const rawPalletName = dsMockUtils.createMockText('Sto');

  const rawPalletPermissions = dsMockUtils.createMockPalletPermissions({
    extrinsics: dsMockUtils.createMockExtrinsicName({
      These: [dsMockUtils.createMockText('invest')],
    }),
  });

  const permissionsMap = new Map();
  permissionsMap.set(rawPalletName, rawPalletPermissions);

  const rawPermissions = dsMockUtils.createMockBTreeMap(permissionsMap);

  const rawExtrinsicPermissions = dsMockUtils.createMockExtrinsicPermissions({
    These: rawPermissions,
  });
  const customId = new BigNumber(1);
  const rawAgId = dsMockUtils.createMockU32(customId);

  let mockContext: Mocked<Context>;
  let externalAgentsSetGroupPermissionsTransaction: PolymeshTx<unknown[]>;
  let permissionsLikeToPermissionsSpy: jest.SpyInstance;

  beforeAll(() => {
    entityMockUtils.initMocks();
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();

    jest.spyOn(utilsConversionModule, 'assetToMeshAssetId').mockReturnValue(rawAssetId);
    jest
      .spyOn(utilsConversionModule, 'transactionPermissionsToExtrinsicPermissions')
      .mockReturnValue(rawExtrinsicPermissions);
    jest.spyOn(utilsConversionModule, 'bigNumberToU32').mockReturnValue(rawAgId);

    permissionsLikeToPermissionsSpy = jest.spyOn(
      utilsConversionModule,
      'permissionsLikeToPermissions'
    );
  });

  beforeEach(() => {
    externalAgentsSetGroupPermissionsTransaction = dsMockUtils.createTxMock(
      'externalAgents',
      'setGroupPermissions'
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

  it('should throw an error if new permissions are the same as the current ones', async () => {
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    permissionsLikeToPermissionsSpy.mockReturnValue(permissions);

    let error;

    try {
      await prepareSetGroupPermissions.call(proc, {
        group: entityMockUtils.getCustomPermissionGroupInstance({
          assetId,
          id: customId,
          getPermissions: {
            transactions: permissions.transactions,
            transactionGroups: [],
          },
        }),
        permissions: { transactions: permissions.transactions },
      });
    } catch (err) {
      error = err;
    }

    expect(error.message).toBe('New permissions are the same as the current ones');
  });

  it('should return a set group permissions transaction spec', async () => {
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    const fakePermissions = { transactions: permissions.transactions };
    when(permissionsLikeToPermissionsSpy)
      .calledWith(fakePermissions, mockContext)
      .mockReturnValue(permissions.transactions);

    const result = await prepareSetGroupPermissions.call(proc, {
      group: entityMockUtils.getCustomPermissionGroupInstance({
        assetId,
        id: customId,
        getPermissions: {
          transactions: permissions.transactions,
          transactionGroups: [],
        },
      }),
      permissions: fakePermissions,
    });

    expect(result).toEqual({
      transaction: externalAgentsSetGroupPermissionsTransaction,
      args: [rawAssetId, rawAgId, rawExtrinsicPermissions],
      resolver: undefined,
    });
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<Params, void>(mockContext);
      const boundFunc = getAuthorization.bind(proc);

      expect(
        boundFunc({
          permissions: { transactionGroups: [] },
          group: entityMockUtils.getCustomPermissionGroupInstance(),
        })
      ).toEqual({
        permissions: {
          transactions: [TxTags.externalAgents.SetGroupPermissions],
          assets: [expect.objectContaining({ id: assetId })],
          portfolios: [],
        },
      });
    });
  });
});
