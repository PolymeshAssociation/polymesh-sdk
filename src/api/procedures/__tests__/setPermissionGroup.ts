import BigNumber from 'bignumber.js';
import sinon from 'sinon';

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
  '~/api/entities/Asset',
  require('~/testUtils/mocks/entities').mockAssetModule('~/api/entities/Asset')
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
  let addTransactionStub: sinon.SinonStub;
  let externalAgentsChangeGroupTransaction: PolymeshTx<unknown[]>;
  let externalAgentsCreateAndChangeGroupTransaction: PolymeshTx<unknown[]>;
  let permissionGroupIdentifierToAgentGroupStub: sinon.SinonStub;
  let transactionPermissionsToPalletPermissionsStub: sinon.SinonStub;
  let stringToTickerStub: sinon.SinonStub;
  let stringToIdentityIdStub: sinon.SinonStub;
  let getGroupFromPermissionsStub: sinon.SinonStub;

  beforeAll(() => {
    entityMockUtils.initMocks();
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();

    transactionPermissionsToPalletPermissionsStub = sinon.stub(
      utilsConversionModule,
      'transactionPermissionsToPalletPermissions'
    );

    permissionGroupIdentifierToAgentGroupStub = sinon.stub(
      utilsConversionModule,
      'permissionGroupIdentifierToAgentGroup'
    );
    stringToTickerStub = sinon.stub(utilsConversionModule, 'stringToTicker');
    stringToIdentityIdStub = sinon.stub(utilsConversionModule, 'stringToIdentityId');
    getGroupFromPermissionsStub = sinon.stub(utilsProcedureModule, 'getGroupFromPermissions');
  });

  beforeEach(() => {
    addTransactionStub = procedureMockUtils.getAddTransactionStub();
    externalAgentsChangeGroupTransaction = dsMockUtils.createTxStub(
      'externalAgents',
      'changeGroup'
    );
    externalAgentsCreateAndChangeGroupTransaction = dsMockUtils.createTxStub(
      'externalAgents',
      'createAndChangeCustomGroup'
    );
    mockContext = dsMockUtils.getContextInstance();
    stringToTickerStub.returns(rawTicker);
    stringToIdentityIdStub.returns(rawIdentityId);
    transactionPermissionsToPalletPermissionsStub.returns(rawExtrinsicPermissions);
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
      asset: entityMockUtils.getAssetInstance({
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
      asset: entityMockUtils.getAssetInstance({
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
      asset: entityMockUtils.getAssetInstance({
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

  it('should add a change group transaction to the queue if the passed group exists', async () => {
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

    getGroupFromPermissionsStub.resolves(expectedGroup);

    const proc = procedureMockUtils.getInstance<
      Params,
      CustomPermissionGroup | KnownPermissionGroup,
      Storage
    >(mockContext, {
      asset: entityMockUtils.getAssetInstance({
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

    permissionGroupIdentifierToAgentGroupStub
      .withArgs({ custom: existingGroupId }, mockContext)
      .returns(rawAgentGroup);

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

    expect(result).toEqual(expectedGroup);

    sinon.assert.calledWith(addTransactionStub, {
      transaction: externalAgentsChangeGroupTransaction,
      args: [rawTicker, rawIdentityId, rawAgentGroup],
    });

    expectedGroup = entityMockUtils.getKnownPermissionGroupInstance({
      isEqual: false,
    });
    getGroupFromPermissionsStub.resolves(expectedGroup);

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

    expect(result).toEqual(expectedGroup);

    sinon.assert.calledWith(addTransactionStub, {
      transaction: externalAgentsChangeGroupTransaction,
      args: [rawTicker, rawIdentityId, rawAgentGroup],
    });
  });

  it('should add an add and change group transaction to the queue if the passed permissions do not correspond to an existing group', async () => {
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
      asset: entityMockUtils.getAssetInstance({
        ticker,
        permissionsGetAgents: [
          {
            agent: identity,
            group: entityMockUtils.getCustomPermissionGroupInstance(),
          },
        ],
      }),
    });

    getGroupFromPermissionsStub.resolves(undefined);

    const rawAgentGroup = dsMockUtils.createMockAgentGroup({
      Custom: dsMockUtils.createMockU32(id),
    });

    permissionGroupIdentifierToAgentGroupStub
      .withArgs({ custom: id }, mockContext)
      .returns(rawAgentGroup);

    procedureMockUtils.getAddProcedureStub().resolves({
      transform: sinon
        .stub()
        .callsFake(cb => cb(entityMockUtils.getCustomPermissionGroupInstance({ ticker, id }))),
    });

    const newGroupId = new BigNumber(5);
    const newGroup = entityMockUtils.getCustomPermissionGroupInstance({
      id: newGroupId,
    });

    addTransactionStub.returns([newGroup]);

    const result = await prepareSetPermissionGroup.call(proc, {
      identity,
      group: {
        asset: ticker,
        transactions: {
          type: PermissionType.Include,
          values: [],
        },
      },
    });

    sinon.assert.calledWith(
      addTransactionStub,
      sinon.match({
        transaction: externalAgentsCreateAndChangeGroupTransaction,
        resolvers: sinon.match.array,
        args: [rawTicker, rawExtrinsicPermissions, rawIdentityId],
      })
    );

    expect(result).toEqual(newGroup);

    await prepareSetPermissionGroup.call(proc, {
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

    sinon.assert.calledWith(
      addTransactionStub,
      sinon.match({
        transaction: externalAgentsCreateAndChangeGroupTransaction,
        resolvers: sinon.match.array,
        args: [rawTicker, rawExtrinsicPermissions, rawIdentityId],
      })
    );
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
        asset: entityMockUtils.getAssetInstance({
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
