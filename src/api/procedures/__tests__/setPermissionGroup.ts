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
import * as utilsInternalModule from '~/utils/internal';

jest.mock(
  '~/api/entities/Asset/Fungible',
  require('~/testUtils/mocks/entities').mockFungibleAssetModule('~/api/entities/Asset/Fungible')
);

describe('setPermissionGroup procedure', () => {
  const assetId = '0x12341234123412341234123412341234';
  const did = 'someDid';
  const rawAssetId = dsMockUtils.createMockAssetId(assetId);
  const rawIdentityId = dsMockUtils.createMockIdentityId(did);
  const rawPalletName = dsMockUtils.createMockText('Sto');

  const rawPalletPermissions = dsMockUtils.createMockPalletPermissions({
    extrinsics: dsMockUtils.createMockExtrinsicName({
      These: [dsMockUtils.createMockText('invest')],
    }),
  });

  const permissionsMap = new Map();
  permissionsMap.set(rawPalletName, rawPalletPermissions);

  const rawPermissions = dsMockUtils.createMockBtreeMap(permissionsMap);

  const rawExtrinsicPermissions = dsMockUtils.createMockExtrinsicPermissions({
    These: rawPermissions,
  });

  let mockContext: Mocked<Context>;
  let externalAgentsChangeGroupTransaction: PolymeshTx<unknown[]>;
  let externalAgentsCreateAndChangeGroupTransaction: PolymeshTx<unknown[]>;
  let permissionGroupIdentifierToAgentGroupSpy: jest.SpyInstance;
  let transactionPermissionsToExtrinsicPermissionsSpy: jest.SpyInstance;
  let assetToMeshAssetIdSpy: jest.SpyInstance;
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
    assetToMeshAssetIdSpy = jest.spyOn(utilsConversionModule, 'assetToMeshAssetId');
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
    assetToMeshAssetIdSpy.mockReturnValue(rawAssetId);
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
      assetId,
      type: PermissionGroupType.Full,
    });

    const proc = procedureMockUtils.getInstance<
      Params,
      CustomPermissionGroup | KnownPermissionGroup,
      Storage
    >(mockContext, {
      asset: entityMockUtils.getFungibleAssetInstance({
        assetId,
        permissionsGetAgents: [
          {
            agent: entityMockUtils.getIdentityInstance(),
            group,
          },
        ],
      }),
      existingGroup: group,
      groupTransactions: null,
    });

    let error;

    try {
      await prepareSetPermissionGroup.call(proc, {
        identity: entityMockUtils.getIdentityInstance({
          assetPermissionsGetGroup: group,
        }),
        group: {
          asset: assetId,
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
        assetId,
        permissionsGetAgents: [],
      }),
      existingGroup: entityMockUtils.getKnownPermissionGroupInstance({ assetId }),
      groupTransactions: null,
    });

    let error;

    try {
      await prepareSetPermissionGroup.call(proc, {
        identity: entityMockUtils.getIdentityInstance(),
        group: {
          asset: assetId,
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
        assetId,
        type: PermissionGroupType.PolymeshV1Caa,
      }),
    });
    let group: Mocked<CustomPermissionGroup | KnownPermissionGroup> =
      entityMockUtils.getKnownPermissionGroupInstance({
        assetId,
        type: PermissionGroupType.PolymeshV1Caa,
      });
    let proc = procedureMockUtils.getInstance<
      Params,
      CustomPermissionGroup | KnownPermissionGroup,
      Storage
    >(mockContext, {
      asset: entityMockUtils.getFungibleAssetInstance({
        assetId,
        permissionsGetAgents: [{ agent: identity, group }],
      }),
      existingGroup: group,
      groupTransactions: null,
    });

    let error;

    try {
      await prepareSetPermissionGroup.call(proc, {
        identity,
        asset: assetId,
        group,
      });
    } catch (err) {
      error = err;
    }

    expect(error.message).toBe('The Agent is already part of this permission group');

    const id = new BigNumber(1);
    group = entityMockUtils.getCustomPermissionGroupInstance({
      assetId,
      id,
    });

    proc = procedureMockUtils.getInstance<
      Params,
      CustomPermissionGroup | KnownPermissionGroup,
      Storage
    >(mockContext, {
      asset: entityMockUtils.getFungibleAssetInstance({
        assetId,
        permissionsGetAgents: [{ agent: identity, group }],
      }),
      existingGroup: group,
      groupTransactions: null,
    });

    try {
      await prepareSetPermissionGroup.call(proc, {
        identity: entityMockUtils.getIdentityInstance({
          assetPermissionsGetGroup: group,
        }),
        asset: assetId,
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
        assetId,
        type: PermissionGroupType.Full,
      }),
    });

    const existingGroupId = new BigNumber(3);

    let expectedGroup: MockKnownPermissionGroup | MockCustomPermissionGroup =
      entityMockUtils.getCustomPermissionGroupInstance({
        id: existingGroupId,
        isEqual: false,
      });

    let proc = procedureMockUtils.getInstance<
      Params,
      CustomPermissionGroup | KnownPermissionGroup,
      Storage
    >(mockContext, {
      asset: entityMockUtils.getFungibleAssetInstance({
        assetId,
        permissionsGetAgents: [
          {
            agent: identity,
            group: entityMockUtils.getCustomPermissionGroupInstance(),
          },
        ],
      }),
      existingGroup: expectedGroup,
      groupTransactions: null,
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
        asset: assetId,
        transactions: {
          type: PermissionType.Include,
          values: [],
        },
      },
    });

    expect(result).toEqual({
      transaction: externalAgentsChangeGroupTransaction,
      args: [rawAssetId, rawIdentityId, rawAgentGroup],
      resolver: expectedGroup,
    });

    expectedGroup = entityMockUtils.getKnownPermissionGroupInstance({
      type: PermissionGroupType.ExceptMeta,
      isEqual: false,
    });

    proc = procedureMockUtils.getInstance<
      Params,
      CustomPermissionGroup | KnownPermissionGroup,
      Storage
    >(mockContext, {
      asset: entityMockUtils.getFungibleAssetInstance({
        assetId,
        permissionsGetAgents: [
          {
            agent: identity,
            group: entityMockUtils.getCustomPermissionGroupInstance(),
          },
        ],
      }),
      existingGroup: expectedGroup,
      groupTransactions: null,
    });

    when(permissionGroupIdentifierToAgentGroupSpy)
      .calledWith(PermissionGroupType.ExceptMeta, mockContext)
      .mockReturnValue(rawAgentGroup);

    result = await prepareSetPermissionGroup.call(proc, {
      identity,
      group: {
        asset: assetId,
        transactions: {
          type: PermissionType.Include,
          values: [],
        },
      },
    });

    expect(result).toEqual({
      transaction: externalAgentsChangeGroupTransaction,
      args: [rawAssetId, rawIdentityId, rawAgentGroup],
      resolver: expectedGroup,
    });
  });

  it('should return a create and change group transaction spec if the passed permissions do not correspond to an existing group', async () => {
    const id = new BigNumber(1);
    const identity = entityMockUtils.getIdentityInstance({
      assetPermissionsGetGroup: entityMockUtils.getKnownPermissionGroupInstance({
        assetId,
        type: PermissionGroupType.Full,
      }),
    });

    const proc = procedureMockUtils.getInstance<
      Params,
      CustomPermissionGroup | KnownPermissionGroup,
      Storage
    >(mockContext, {
      asset: entityMockUtils.getFungibleAssetInstance({
        assetId,
        permissionsGetAgents: [
          {
            agent: identity,
            group: entityMockUtils.getCustomPermissionGroupInstance(),
          },
        ],
      }),
      existingGroup: null,
      groupTransactions: null,
    });

    const rawAgentGroup = dsMockUtils.createMockAgentGroup({
      Custom: dsMockUtils.createMockU32(id),
    });

    when(permissionGroupIdentifierToAgentGroupSpy)
      .calledWith({ custom: id }, mockContext)
      .mockReturnValue(rawAgentGroup);

    let result = await prepareSetPermissionGroup.call(proc, {
      identity,
      group: {
        asset: assetId,
        transactions: {
          type: PermissionType.Include,
          values: [],
        },
      },
    });

    expect(result).toEqual({
      transaction: externalAgentsCreateAndChangeGroupTransaction,
      args: [rawAssetId, rawExtrinsicPermissions, rawIdentityId],
      resolver: expect.any(Function),
    });

    result = await prepareSetPermissionGroup.call(proc, {
      identity: entityMockUtils.getIdentityInstance({
        assetPermissionsGetGroup: entityMockUtils.getCustomPermissionGroupInstance({
          assetId,
          id,
        }),
      }),
      group: {
        asset: assetId,
        transactionGroups: [TxGroup.AdvancedAssetManagement],
      },
    });

    expect(result).toEqual({
      transaction: externalAgentsCreateAndChangeGroupTransaction,
      args: [rawAssetId, rawExtrinsicPermissions, rawIdentityId],
      resolver: expect.any(Function),
    });
  });

  describe('prepareStorage', () => {
    beforeEach(() => {
      jest
        .spyOn(utilsInternalModule, 'asBaseAsset')
        .mockResolvedValue(expect.objectContaining({ id: assetId }));
    });

    it('should look up the group matching the passed permission groups', async () => {
      const expectedGroup = entityMockUtils.getCustomPermissionGroupInstance({ assetId });
      getGroupFromPermissionsSpy.mockResolvedValue(expectedGroup);

      const proc = procedureMockUtils.getInstance<
        Params,
        CustomPermissionGroup | KnownPermissionGroup,
        Storage
      >(mockContext);
      const boundFunc = prepareStorage.bind(proc);

      const result = await boundFunc({
        identity: entityMockUtils.getIdentityInstance(),
        group: { transactionGroups: [], asset: assetId },
      } as Params);

      expect(result).toEqual({
        asset: expect.objectContaining({ id: assetId }),
        existingGroup: expectedGroup,
        groupTransactions: expect.anything(),
      });
    });

    it('should look up the group matching the passed transactions', async () => {
      const expectedGroup = entityMockUtils.getCustomPermissionGroupInstance({ assetId });
      getGroupFromPermissionsSpy.mockResolvedValue(expectedGroup);

      const transactions = { type: PermissionType.Include, values: [] };

      const proc = procedureMockUtils.getInstance<
        Params,
        CustomPermissionGroup | KnownPermissionGroup,
        Storage
      >(mockContext);
      const boundFunc = prepareStorage.bind(proc);

      const result = await boundFunc({
        identity: entityMockUtils.getIdentityInstance(),
        group: { transactions, asset: assetId },
      } as Params);

      expect(result).toEqual({
        asset: expect.objectContaining({ id: assetId }),
        existingGroup: expectedGroup,
        groupTransactions: transactions,
      });
    });

    it('should return a null group when no existing group matches', async () => {
      getGroupFromPermissionsSpy.mockResolvedValue(undefined);

      const proc = procedureMockUtils.getInstance<
        Params,
        CustomPermissionGroup | KnownPermissionGroup,
        Storage
      >(mockContext);
      const boundFunc = prepareStorage.bind(proc);

      const result = await boundFunc({
        identity: entityMockUtils.getIdentityInstance(),
        group: { transactionGroups: [], asset: assetId },
      } as Params);

      expect(result).toEqual({
        asset: expect.objectContaining({ id: assetId }),
        existingGroup: null,
        groupTransactions: expect.anything(),
      });
    });

    it('should return a passed Permission Group without looking one up', async () => {
      getGroupFromPermissionsSpy.mockClear();

      const group = entityMockUtils.getCustomPermissionGroupInstance({
        assetId,
      });

      const proc = procedureMockUtils.getInstance<
        Params,
        CustomPermissionGroup | KnownPermissionGroup,
        Storage
      >(mockContext);
      const boundFunc = prepareStorage.bind(proc);

      const result = await boundFunc({
        identity: entityMockUtils.getIdentityInstance(),
        group,
      } as Params);

      expect(result).toEqual({
        asset: expect.objectContaining({ id: assetId }),
        existingGroup: group,
        groupTransactions: null,
      });
      expect(getGroupFromPermissionsSpy).not.toHaveBeenCalled();
    });
  });

  describe('getAuthorization', () => {
    it('should declare changeGroup when the target group already exists', () => {
      const proc = procedureMockUtils.getInstance<
        Params,
        CustomPermissionGroup | KnownPermissionGroup,
        Storage
      >(mockContext, {
        asset: entityMockUtils.getFungibleAssetInstance({
          assetId,
        }),
        existingGroup: entityMockUtils.getKnownPermissionGroupInstance({ assetId }),
        groupTransactions: null,
      });
      const boundFunc = getAuthorization.bind(proc);

      expect(boundFunc()).toEqual({
        permissions: {
          transactions: [TxTags.externalAgents.ChangeGroup],
          assets: [expect.objectContaining({ id: assetId })],
          portfolios: [],
        },
      });
    });

    it('should declare createAndChangeCustomGroup when the group has to be created', () => {
      const proc = procedureMockUtils.getInstance<
        Params,
        CustomPermissionGroup | KnownPermissionGroup,
        Storage
      >(mockContext, {
        asset: entityMockUtils.getFungibleAssetInstance({
          assetId,
        }),
        existingGroup: null,
        groupTransactions: null,
      });
      const boundFunc = getAuthorization.bind(proc);

      expect(boundFunc()).toEqual({
        permissions: {
          transactions: [TxTags.externalAgents.CreateAndChangeCustomGroup],
          assets: [expect.objectContaining({ id: assetId })],
          portfolios: [],
        },
      });
    });
  });
});
