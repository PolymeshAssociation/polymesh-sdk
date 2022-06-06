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
import * as procedureUtilsModule from '~/api/procedures/utils';
import { Context, CustomPermissionGroup } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { PermissionType, TxTags } from '~/types';
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
    target = 'someDid';
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
    procedureMockUtils.cleanup();
    dsMockUtils.cleanup();
  });

  describe('createCreateGroupResolver', () => {
    const agId = new BigNumber(1);
    const rawAgId = dsMockUtils.createMockU64(agId);
    sinon
      .stub(utilsInternalModule, 'filterEventRecords')
      .returns([dsMockUtils.createMockIEvent(['someDid', rawTicker, rawAgId])]);

    it('should return the new CustomPermissionGroup', () => {
      const result = createCreateGroupResolver(mockContext)({} as ISubmittableResult);

      expect(result.id).toEqual(agId);
      expect(result.asset.ticker).toEqual(ticker);
    });
  });

  it('should throw an error if there already exists a group with exactly the same permissions', async () => {
    const errorMsg = 'ERROR';
    const assertGroupDoesNotExistStub = sinon.stub(procedureUtilsModule, 'assertGroupDoesNotExist');
    assertGroupDoesNotExistStub.rejects(new Error(errorMsg));

    const args = {
      ticker,
      permissions: { transactions },
    };

    permissionsLikeToPermissionsStub
      .withArgs({ transactions }, mockContext)
      .returns({ transactions });

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

    assertGroupDoesNotExistStub.restore();
  });

  it('should add a create group transaction to the queue', async () => {
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
