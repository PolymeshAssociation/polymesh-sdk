import { ISubmittableResult } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';
import sinon from 'sinon';

import {
  createCreateGroupResolver,
  getAuthorization,
  Params,
  prepareCreateGroup,
  prepareStorage,
  Storage,
} from '~/api/procedures/createGroup';
import { Context, CustomPermissionGroup } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { PermissionGroupType, PermissionType, TxTags } from '~/types';
import { PolymeshTx } from '~/types/internal';
import * as utilsConversionModule from '~/utils/conversion';
import * as utilsInternalModule from '~/utils/internal';

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
  const rawTicker = dsMockUtils.createMockTicker(ticker);
  const rawExtrinsicPermissions = dsMockUtils.createMockExtrinsicPermissions({
    These: [
      /* eslint-disable @typescript-eslint/naming-convention */
      dsMockUtils.createMockPalletPermissions({
        pallet_name: dsMockUtils.createMockPalletName('Sto'),
        dispatchable_names: dsMockUtils.createMockDispatchableNames({
          These: [dsMockUtils.createMockDispatchableName('invest')],
        }),
      }),
      /* eslint-enable @typescript-eslint/naming-convention */
    ],
  });

  let mockContext: Mocked<Context>;
  let addTransactionStub: sinon.SinonStub;
  let externalAgentsCreateGroupTransaction: PolymeshTx<unknown[]>;
  let permissionsLikeToPermissionsStub: sinon.SinonStub;

  beforeAll(() => {
    entityMockUtils.initMocks();
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();

    sinon.stub(utilsConversionModule, 'stringToTicker').returns(rawTicker);
    sinon
      .stub(utilsConversionModule, 'transactionPermissionsToExtrinsicPermissions')
      .returns(rawExtrinsicPermissions);

    permissionsLikeToPermissionsStub = sinon.stub(
      utilsConversionModule,
      'permissionsLikeToPermissions'
    );
  });

  beforeEach(() => {
    addTransactionStub = procedureMockUtils.getAddTransactionStub();
    externalAgentsCreateGroupTransaction = dsMockUtils.createTxStub(
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
    entityMockUtils.cleanup();
    procedureMockUtils.cleanup();
    dsMockUtils.cleanup();
  });

  describe('createCreateGroupResolver', () => {
    const agId = new BigNumber(1);
    const rawAgId = dsMockUtils.createMockU64(agId.toNumber());
    sinon
      .stub(utilsInternalModule, 'filterEventRecords')
      .returns([dsMockUtils.createMockIEvent(['someDid', rawTicker, rawAgId])]);

    test('should return the new CustomPermissionGroup', () => {
      const result = createCreateGroupResolver(mockContext)({} as ISubmittableResult);

      expect(result.id).toEqual(agId);
      expect(result.asset.ticker).toEqual(ticker);
    });
  });

  test('should throw an error if there already exists a group with exactly the same permissions', async () => {
    const customId = new BigNumber(1);

    let proc = procedureMockUtils.getInstance<Params, CustomPermissionGroup, Storage>(mockContext, {
      asset: entityMockUtils.getAssetInstance({
        ticker,
        permissionsGetGroups: {
          custom: [
            entityMockUtils.getCustomPermissionGroupInstance({
              ticker,
              id: customId,
              getPermissions: {
                transactions,
                transactionGroups: [],
              },
            }),
          ],
          known: [],
        },
      }),
    });

    permissionsLikeToPermissionsStub.returns({ transactions });

    let error;

    try {
      await prepareCreateGroup.call(proc, {
        ticker,
        permissions: { transactions },
      });
    } catch (err) {
      error = err;
    }

    expect(error.message).toBe('There already exists a group with the exact same permissions');
    expect(error.data.groupId).toEqual(customId);

    proc = procedureMockUtils.getInstance<Params, CustomPermissionGroup, Storage>(mockContext, {
      asset: entityMockUtils.getAssetInstance({
        ticker,
        permissionsGetGroups: {
          custom: [],
          known: [
            entityMockUtils.getKnownPermissionGroupInstance({
              ticker,
              type: PermissionGroupType.Full,
              getPermissions: {
                transactions: null,
                transactionGroups: [],
              },
            }),
          ],
        },
      }),
    });

    permissionsLikeToPermissionsStub.returns({
      assets: null,
      portfolios: null,
      transactionGroups: [],
      transactions: null,
    });

    try {
      await prepareCreateGroup.call(proc, {
        ticker,
        permissions: {
          transactions: {
            type: PermissionType.Include,
            values: [],
          },
        },
      });
    } catch (err) {
      error = err;
    }

    expect(error.message).toBe('There already exists a group with the exact same permissions');
    expect(error.data.groupId).toEqual(PermissionGroupType.Full);
  });

  test('should add a create group transaction to the queue', async () => {
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
    permissionsLikeToPermissionsStub
      .withArgs(fakePermissions, mockContext)
      .returns({ transactions });

    await prepareCreateGroup.call(proc, {
      ticker,
      permissions: fakePermissions,
    });

    sinon.assert.calledWith(
      addTransactionStub,
      sinon.match({
        transaction: externalAgentsCreateGroupTransaction,
        resolvers: sinon.match.array,
        args: [rawTicker, rawExtrinsicPermissions],
      })
    );

    permissionsLikeToPermissionsStub
      .withArgs(
        {
          transactions: {
            type: PermissionType.Include,
            values: [],
          },
        },
        mockContext
      )
      .returns({ transactions: null });

    await prepareCreateGroup.call(proc, {
      ticker,
      permissions: { transactions },
    });

    sinon.assert.calledWith(
      addTransactionStub,
      sinon.match({
        transaction: externalAgentsCreateGroupTransaction,
        resolvers: sinon.match.array,
        args: [rawTicker, rawExtrinsicPermissions],
      })
    );
  });

  describe('prepareStorage', () => {
    test('should return the Asset', () => {
      const proc = procedureMockUtils.getInstance<Params, CustomPermissionGroup, Storage>(
        mockContext
      );
      const boundFunc = prepareStorage.bind(proc);

      const result = boundFunc({ ticker } as Params);

      expect(result).toEqual({
        asset: entityMockUtils.getAssetInstance({ ticker }),
      });
    });
  });

  describe('getAuthorization', () => {
    test('should return the appropriate roles and permissions', () => {
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
          assets: [entityMockUtils.getAssetInstance({ ticker })],
          portfolios: [],
        },
      });
    });
  });
});
