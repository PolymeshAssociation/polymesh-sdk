import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import {
  getAuthorization,
  Params,
  prepareSetPermissionGroup,
  prepareStorage,
  Storage,
} from '~/api/procedures/setPermissionGroup';
import * as utilsProcedureModule from '~/api/procedures/utils';
import { Context, CustomPermissionGroup, KnownPermissionGroup } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { MockCustomPermissionGroup, MockKnownPermissionGroup } from '~/testUtils/mocks/entities';
import { Mocked } from '~/testUtils/types';
import { PermissionGroupType, PermissionType, TxGroup, TxTags } from '~/types';
import { PolymeshTx } from '~/types/internal';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Asset/Fungible',
  require('~/testUtils/mocks/entities').mockFungibleAssetModule('~/api/entities/Asset/Fungible')
);

describe('setPermissionGroup procedure', () => {
  const ticker = 'SOME_TICKER';
  const did = 'someDid';
  const rawTicker = dsMockUtils.createMockTicker(ticker);
  const rawIdentityId = dsMockUtils.createMockIdentityId(did);
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
  let externalAgentsChangeGroupTransaction: PolymeshTx<unknown[]>;
  let externalAgentsCreateAndChangeGroupTransaction: PolymeshTx<unknown[]>;
  let permissionGroupIdentifierToAgentGroupSpy: jest.SpyInstance;
  let transactionPermissionsToExtrinsicPermissionsSpy: jest.SpyInstance;
  let stringToTickerSpy: jest.SpyInstance;
  let stringToIdentityIdSpy: jest.SpyInstance;
  let getGroupFromPermissionsSpy: jest.SpyInstance;

  beforeAll(() => {
    entityMockUtils.initMocks();
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();

    transactionPermissionsToExtrinsicPermissionsSpy = jest.spyOn(
      utilsConversionModule,
      'transactionPermissionsToExtrinsicPermissions'
    );

    permissionGroupIdentifierToAgentGroupSpy = jest.spyOn(
      utilsConversionModule,
      'permissionGroupIdentifierToAgentGroup'
    );
    stringToTickerSpy = jest.spyOn(utilsConversionModule, 'stringToTicker');
    stringToIdentityIdSpy = jest.spyOn(utilsConversionModule, 'stringToIdentityId');
    getGroupFromPermissionsSpy = jest.spyOn(utilsProcedureModule, 'getGroupFromPermissions');
  });

  beforeEach(() => {
    externalAgentsChangeGroupTransaction = dsMockUtils.createTxMock(
      'externalAgents',
      'changeGroup'
    );
    externalAgentsCreateAndChangeGroupTransaction = dsMockUtils.createTxMock(
      'externalAgents',
      'createAndChangeCustomGroup'
    );
    mockContext = dsMockUtils.getContextInstance();
    stringToTickerSpy.mockReturnValue(rawTicker);
    stringToIdentityIdSpy.mockReturnValue(rawIdentityId);
    transactionPermissionsToExtrinsicPermissionsSpy.mockReturnValue(rawExtrinsicPermissions);
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

  it('should throw an error if the target is the last agent with full permissions', async () => {
    const group = entityMockUtils.getKnownPermissionGroupInstance({
      ticker,
      type: PermissionGroupType.Full,
    });

    const proc = procedureMockUtils.getInstance<
      Params,
      CustomPermissionGroup | KnownPermissionGroup,
      Storage
    >(mockContext, {
      asset: entityMockUtils.getFungibleAssetInstance({
        ticker,
        permissionsGetAgents: [
          {
            agent: entityMockUtils.getIdentityInstance(),
            group,
          },
        ],
      }),
    });

    let error;

    try {
      await prepareSetPermissionGroup.call(proc, {
        identity: entityMockUtils.getIdentityInstance({
          assetPermissionsGetGroup: group,
        }),
        group: {
          asset: ticker,
          transactions: {
            type: PermissionType.Include,
            values: [],
          },
        },
      });
    } catch (err) {
      error = err;
    }

    expect(error.message).toBe(
      'The target is the last Agent with full permissions for this Asset. There should always be at least one Agent with full permissions'
    );
  });

  it('should throw an error if the target is not an agent', async () => {
    const proc = procedureMockUtils.getInstance<
      Params,
      CustomPermissionGroup | KnownPermissionGroup,
      Storage
    >(mockContext, {
      asset: entityMockUtils.getFungibleAssetInstance({
        ticker,
        permissionsGetAgents: [],
      }),
    });

    let error;

    try {
      await prepareSetPermissionGroup.call(proc, {
        identity: entityMockUtils.getIdentityInstance(),
        group: {
          asset: ticker,
          transactions: {
            type: PermissionType.Include,
            values: [],
          },
        },
      });
    } catch (err) {
      error = err;
    }

    expect(error.message).toBe('The target must already be an Agent for the Asset');
  });

  it('should throw an error if the Agent is already part of the permission group', async () => {
    const identity = entityMockUtils.getIdentityInstance({
      assetPermissionsGetGroup: entityMockUtils.getKnownPermissionGroupInstance({
        ticker,
        type: PermissionGroupType.PolymeshV1Caa,
      }),
    });
    let group: Mocked<CustomPermissionGroup | KnownPermissionGroup> =
      entityMockUtils.getKnownPermissionGroupInstance({
        ticker,
        type: PermissionGroupType.PolymeshV1Caa,
      });
    const proc = procedureMockUtils.getInstance<
      Params,
      CustomPermissionGroup | KnownPermissionGroup,
      Storage
    >(mockContext, {
      asset: entityMockUtils.getFungibleAssetInstance({
        ticker,
        permissionsGetAgents: [
          {
            agent: identity,
            group,
          },
        ],
      }),
    });

    let error;

    try {
      await prepareSetPermissionGroup.call(proc, {
        identity,
        asset: ticker,
        group,
      });
    } catch (err) {
      error = err;
    }

    expect(error.message).toBe('The Agent is already part of this permission group');

    const id = new BigNumber(1);
    group = entityMockUtils.getCustomPermissionGroupInstance({
      ticker,
      id,
    });

    try {
      await prepareSetPermissionGroup.call(proc, {
        identity: entityMockUtils.getIdentityInstance({
          assetPermissionsGetGroup: group,
        }),
        asset: ticker,
        group,
      });
    } catch (err) {
      error = err;
    }

    expect(error.message).toBe('The Agent is already part of this permission group');
  });

  it('should return a change group transaction spec if the passed group exists', async () => {
    const identity = entityMockUtils.getIdentityInstance({
      assetPermissionsGetGroup: entityMockUtils.getKnownPermissionGroupInstance({
        ticker,
        type: PermissionGroupType.Full,
      }),
    });

    const existingGroupId = new BigNumber(3);

    let expectedGroup: MockKnownPermissionGroup | MockCustomPermissionGroup =
      entityMockUtils.getCustomPermissionGroupInstance({
        id: existingGroupId,
        isEqual: false,
      });

    getGroupFromPermissionsSpy.mockResolvedValue(expectedGroup);

    const proc = procedureMockUtils.getInstance<
      Params,
      CustomPermissionGroup | KnownPermissionGroup,
      Storage
    >(mockContext, {
      asset: entityMockUtils.getFungibleAssetInstance({
        ticker,
        permissionsGetAgents: [
          {
            agent: identity,
            group: entityMockUtils.getCustomPermissionGroupInstance(),
          },
        ],
      }),
    });

    const rawAgentGroup = dsMockUtils.createMockAgentGroup({
      Custom: dsMockUtils.createMockU32(existingGroupId),
    });

    when(permissionGroupIdentifierToAgentGroupSpy)
      .calledWith({ custom: existingGroupId }, mockContext)
      .mockReturnValue(rawAgentGroup);

    let result = await prepareSetPermissionGroup.call(proc, {
      identity,
      group: {
        asset: ticker,
        transactions: {
          type: PermissionType.Include,
          values: [],
        },
      },
    });

    expect(result).toEqual({
      transaction: externalAgentsChangeGroupTransaction,
      args: [rawTicker, rawIdentityId, rawAgentGroup],
      resolver: expectedGroup,
    });

    expectedGroup = entityMockUtils.getKnownPermissionGroupInstance({
      type: PermissionGroupType.ExceptMeta,
      isEqual: false,
    });
    getGroupFromPermissionsSpy.mockResolvedValue(expectedGroup);

    when(permissionGroupIdentifierToAgentGroupSpy)
      .calledWith(PermissionGroupType.ExceptMeta, mockContext)
      .mockReturnValue(rawAgentGroup);

    result = await prepareSetPermissionGroup.call(proc, {
      identity,
      group: {
        asset: ticker,
        transactions: {
          type: PermissionType.Include,
          values: [],
        },
      },
    });

    expect(result).toEqual({
      transaction: externalAgentsChangeGroupTransaction,
      args: [rawTicker, rawIdentityId, rawAgentGroup],
      resolver: expectedGroup,
    });
  });

  it('should return a create and change group transaction spec if the passed permissions do not correspond to an existing group', async () => {
    const id = new BigNumber(1);
    const identity = entityMockUtils.getIdentityInstance({
      assetPermissionsGetGroup: entityMockUtils.getKnownPermissionGroupInstance({
        ticker,
        type: PermissionGroupType.Full,
      }),
    });

    const proc = procedureMockUtils.getInstance<
      Params,
      CustomPermissionGroup | KnownPermissionGroup,
      Storage
    >(mockContext, {
      asset: entityMockUtils.getFungibleAssetInstance({
        ticker,
        permissionsGetAgents: [
          {
            agent: identity,
            group: entityMockUtils.getCustomPermissionGroupInstance(),
          },
        ],
      }),
    });

    getGroupFromPermissionsSpy.mockResolvedValue(undefined);

    const rawAgentGroup = dsMockUtils.createMockAgentGroup({
      Custom: dsMockUtils.createMockU32(id),
    });

    when(permissionGroupIdentifierToAgentGroupSpy)
      .calledWith({ custom: id }, mockContext)
      .mockReturnValue(rawAgentGroup);

    let result = await prepareSetPermissionGroup.call(proc, {
      identity,
      group: {
        asset: ticker,
        transactions: {
          type: PermissionType.Include,
          values: [],
        },
      },
    });

    expect(result).toEqual({
      transaction: externalAgentsCreateAndChangeGroupTransaction,
      args: [rawTicker, rawExtrinsicPermissions, rawIdentityId],
      resolver: expect.any(Function),
    });

    result = await prepareSetPermissionGroup.call(proc, {
      identity: entityMockUtils.getIdentityInstance({
        assetPermissionsGetGroup: entityMockUtils.getCustomPermissionGroupInstance({
          ticker,
          id,
        }),
      }),
      group: {
        asset: ticker,
        transactionGroups: [TxGroup.AdvancedAssetManagement],
      },
    });

    expect(result).toEqual({
      transaction: externalAgentsCreateAndChangeGroupTransaction,
      args: [rawTicker, rawExtrinsicPermissions, rawIdentityId],
      resolver: expect.any(Function),
    });
  });

  describe('prepareStorage', () => {
    it('should return the Asset', () => {
      const proc = procedureMockUtils.getInstance<
        Params,
        CustomPermissionGroup | KnownPermissionGroup,
        Storage
      >(mockContext);
      const boundFunc = prepareStorage.bind(proc);

      let result = boundFunc({
        identity: entityMockUtils.getIdentityInstance(),
        group: { transactionGroups: [], asset: ticker },
      } as Params);

      expect(result).toEqual({
        asset: expect.objectContaining({ ticker }),
      });

      result = boundFunc({
        identity: entityMockUtils.getIdentityInstance(),
        group: entityMockUtils.getCustomPermissionGroupInstance({
          ticker,
        }),
      } as Params);

      expect(result).toEqual({
        asset: expect.objectContaining({ ticker }),
      });
    });
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<
        Params,
        CustomPermissionGroup | KnownPermissionGroup,
        Storage
      >(mockContext, {
        asset: entityMockUtils.getFungibleAssetInstance({
          ticker,
        }),
      });
      const boundFunc = getAuthorization.bind(proc);

      expect(boundFunc()).toEqual({
        permissions: {
          transactions: [TxTags.externalAgents.ChangeGroup],
          assets: [expect.objectContaining({ ticker })],
          portfolios: [],
        },
      });
    });
  });
});
