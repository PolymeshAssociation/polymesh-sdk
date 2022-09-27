import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import {
  getAuthorization,
  Params,
  prepareCreateGroup,
  prepareStorage,
  Storage,
} from '~/api/procedures/createGroup';
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
  '~/api/entities/Asset',
  require('~/testUtils/mocks/entities').mockAssetModule('~/api/entities/Asset')
);

describe('createGroup procedure', () => {
  const ticker = 'SOME_TICKER';
  const transactions = {
    type: PermissionType.Include,
    values: [TxTags.sto.Invest, TxTags.asset.CreateAsset],
  };
  let target: string;
  const rawTicker = dsMockUtils.createMockTicker(ticker);
  const rawExtrinsicPermissions = dsMockUtils.createMockExtrinsicPermissions({
    These: [
      dsMockUtils.createMockPalletPermissions({
        palletName: 'Sto',
        dispatchableNames: dsMockUtils.createMockDispatchableNames({
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

    jest.spyOn(utilsConversionModule, 'stringToTicker').mockReturnValue(rawTicker);
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
      ticker,
      permissions: { transactions },
    };

    when(permissionsLikeToPermissionsSpy)
      .calledWith({ transactions }, mockContext)
      .mockReturnValue({ transactions });

    const proc = procedureMockUtils.getInstance<Params, CustomPermissionGroup, Storage>(
      mockContext,
      {
        asset: entityMockUtils.getAssetInstance({
          permissionsGetAgents: [
            {
              agent: entityMockUtils.getIdentityInstance({ did: target }),
              group: entityMockUtils.getKnownPermissionGroupInstance(),
            },
          ],
        }),
      }
    );

    await expect(prepareCreateGroup.call(proc, args)).rejects.toThrow(errorMsg);

    assertGroupDoesNotExistSpy.mockRestore();
  });

  it('should return a create group transaction spec', async () => {
    const proc = procedureMockUtils.getInstance<Params, CustomPermissionGroup, Storage>(
      mockContext,
      {
        asset: entityMockUtils.getAssetInstance({
          ticker,
          permissionsGetGroups: {
            custom: [
              entityMockUtils.getCustomPermissionGroupInstance({
                ticker,
                id: new BigNumber(2),
                getPermissions: {
                  transactions: null,
                  transactionGroups: [],
                },
              }),
            ],
            known: [],
          },
        }),
      }
    );

    const fakePermissions = { transactions };
    when(permissionsLikeToPermissionsSpy)
      .calledWith(fakePermissions, mockContext)
      .mockReturnValue({ transactions });

    let result = await prepareCreateGroup.call(proc, {
      ticker,
      permissions: fakePermissions,
    });

    expect(result).toEqual({
      transaction: externalAgentsCreateGroupTransaction,
      args: [rawTicker, rawExtrinsicPermissions],
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
      ticker,
      permissions: { transactions },
    });

    expect(result).toEqual({
      transaction: externalAgentsCreateGroupTransaction,
      args: [rawTicker, rawExtrinsicPermissions],
      resolver: expect.any(Function),
    });
  });

  describe('prepareStorage', () => {
    it('should return the Asset', () => {
      const proc = procedureMockUtils.getInstance<Params, CustomPermissionGroup, Storage>(
        mockContext
      );
      const boundFunc = prepareStorage.bind(proc);

      const result = boundFunc({ ticker } as Params);

      expect(result).toEqual({
        asset: expect.objectContaining({ ticker }),
      });
    });
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<Params, CustomPermissionGroup, Storage>(
        mockContext,
        {
          asset: entityMockUtils.getAssetInstance({
            ticker,
          }),
        }
      );
      const boundFunc = getAuthorization.bind(proc);

      expect(boundFunc()).toEqual({
        permissions: {
          transactions: [TxTags.externalAgents.CreateGroup],
          assets: [expect.objectContaining({ ticker })],
          portfolios: [],
        },
      });
    });
  });
});
