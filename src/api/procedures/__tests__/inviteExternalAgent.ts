import { PolymeshPrimitivesAuthorizationAuthorizationData } from '@polkadot/types/lookup';
import { ISubmittableResult } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';
import { AgentGroup, IdentityId, Signatory, Ticker } from 'polymesh-types/types';
import sinon from 'sinon';

import {
  createGroupAndAuthorizationResolver,
  getAuthorization,
  Params,
  prepareInviteExternalAgent,
  prepareStorage,
  Storage,
} from '~/api/procedures/inviteExternalAgent';
import * as procedureUtilsModule from '~/api/procedures/utils';
import { Account, Asset, AuthorizationRequest, Context, Identity } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { Authorization, PermissionType, SignerValue, TxTags } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';
import * as utilsInternalModule from '~/utils/internal';

jest.mock(
  '~/api/entities/Asset',
  require('~/testUtils/mocks/entities').mockAssetModule('~/api/entities/Asset')
);
jest.mock(
  '~/api/entities/CustomPermissionGroup',
  require('~/testUtils/mocks/entities').mockCustomPermissionGroupModule(
    '~/api/entities/CustomPermissionGroup'
  )
);
jest.mock(
  '~/api/entities/KnownPermissionGroup',
  require('~/testUtils/mocks/entities').mockKnownPermissionGroupModule(
    '~/api/entities/KnownPermissionGroup'
  )
);

describe('inviteExternalAgent procedure', () => {
  let mockContext: Mocked<Context>;
  let authorizationToAuthorizationDataStub: sinon.SinonStub<
    [Authorization, Context],
    PolymeshPrimitivesAuthorizationAuthorizationData
  >;
  let signerToStringStub: sinon.SinonStub<[string | Identity | Account], string>;
  let signerValueToSignatoryStub: sinon.SinonStub<[SignerValue, Context], Signatory>;
  let stringToIdentityIdStub: sinon.SinonStub;
  let ticker: string;
  let asset: Asset;
  let rawTicker: Ticker;
  let rawAgentGroup: AgentGroup;
  let target: string;
  let rawSignatory: Signatory;
  let rawAuthorizationData: PolymeshPrimitivesAuthorizationAuthorizationData;
  let rawIdentityId: IdentityId;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    authorizationToAuthorizationDataStub = sinon.stub(
      utilsConversionModule,
      'authorizationToAuthorizationData'
    );
    signerToStringStub = sinon.stub(utilsConversionModule, 'signerToString');
    stringToIdentityIdStub = sinon.stub(utilsConversionModule, 'stringToIdentityId');
    signerValueToSignatoryStub = sinon.stub(utilsConversionModule, 'signerValueToSignatory');
    ticker = 'SOME_TICKER';
    rawTicker = dsMockUtils.createMockTicker(ticker);
    rawAgentGroup = dsMockUtils.createMockAgentGroup('Full');
    asset = entityMockUtils.getAssetInstance({ ticker });
    target = 'someDid';
    rawSignatory = dsMockUtils.createMockSignatory({
      Identity: dsMockUtils.createMockIdentityId(target),
    });
    rawAuthorizationData = dsMockUtils.createMockAuthorizationData({
      BecomeAgent: [rawTicker, rawAgentGroup],
    });
    rawIdentityId = dsMockUtils.createMockIdentityId(target);
  });

  beforeEach(() => {
    entityMockUtils.configureMocks({
      assetOptions: {
        corporateActionsGetAgents: [],
      },
    });
    mockContext = dsMockUtils.getContextInstance();
    authorizationToAuthorizationDataStub.returns(rawAuthorizationData);
    signerToStringStub.returns(target);
    signerValueToSignatoryStub.returns(rawSignatory);
    stringToIdentityIdStub.returns(rawIdentityId);
  });

  afterEach(() => {
    entityMockUtils.reset();
    procedureMockUtils.reset();
    dsMockUtils.reset();
  });

  afterAll(() => {
    procedureMockUtils.cleanup();
    dsMockUtils.cleanup();
    sinon.reset();
  });

  describe('prepareStorage', () => {
    it('should return the Asset', () => {
      const proc = procedureMockUtils.getInstance<Params, AuthorizationRequest, Storage>(
        mockContext
      );
      const boundFunc = prepareStorage.bind(proc);

      const result = boundFunc({
        ticker,
        target,
        permissions: entityMockUtils.getCustomPermissionGroupInstance(),
      });

      expect(result).toEqual({
        asset: expect.objectContaining({ ticker }),
      });
    });
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<Params, AuthorizationRequest, Storage>(
        mockContext,
        {
          asset,
        }
      );
      const boundFunc = getAuthorization.bind(proc);

      expect(boundFunc()).toEqual({
        permissions: {
          transactions: [TxTags.identity.AddAuthorization],
          assets: [expect.objectContaining({ ticker })],
          portfolios: [],
        },
      });
    });
  });

  it('should throw an error if the target Identity is already an external agent', () => {
    const args = {
      target,
      ticker,
      permissions: entityMockUtils.getKnownPermissionGroupInstance(),
    };

    const proc = procedureMockUtils.getInstance<Params, AuthorizationRequest, Storage>(
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

    return expect(prepareInviteExternalAgent.call(proc, args)).rejects.toThrow(
      'The target Identity is already an External Agent'
    );
  });

  it('should return an add authorization transaction spec if an existing group is passed', async () => {
    const transaction = dsMockUtils.createTxStub('identity', 'addAuthorization');
    const proc = procedureMockUtils.getInstance<Params, AuthorizationRequest, Storage>(
      mockContext,
      {
        asset: entityMockUtils.getAssetInstance({
          permissionsGetAgents: [
            {
              agent: entityMockUtils.getIdentityInstance({ isEqual: false }),
              group: entityMockUtils.getCustomPermissionGroupInstance(),
            },
          ],
        }),
      }
    );

    const result = await prepareInviteExternalAgent.call(proc, {
      target,
      ticker,
      permissions: entityMockUtils.getKnownPermissionGroupInstance(),
    });

    expect(result).toEqual({
      transaction,
      args: [rawSignatory, rawAuthorizationData, null],
      resolver: expect.any(Function),
    });
  });

  it('should use the existing group ID if there is a group with the same permissions as the ones passed', async () => {
    const groupId = new BigNumber(10);
    const transaction = dsMockUtils.createTxStub('identity', 'addAuthorization');
    const getGroupFromPermissionsStub = sinon
      .stub(procedureUtilsModule, 'getGroupFromPermissions')
      .resolves(
        entityMockUtils.getCustomPermissionGroupInstance({
          ticker,
          id: groupId,
        })
      );

    const args = {
      target,
      ticker,
      permissions: {
        transactions: {
          type: PermissionType.Include,
          values: [TxTags.asset.AcceptAssetOwnershipTransfer],
        },
      },
    };

    const proc = procedureMockUtils.getInstance<Params, AuthorizationRequest, Storage>(
      mockContext,
      {
        asset: entityMockUtils.getAssetInstance({
          permissionsGetAgents: [],
        }),
      }
    );

    const result = await prepareInviteExternalAgent.call(proc, args);

    expect(result).toEqual({
      transaction,
      args: [rawSignatory, rawAuthorizationData, null],
      resolver: expect.any(Function),
    });

    getGroupFromPermissionsStub.restore();
  });

  it('should return a create group and add authorization transaction spec if the group does not exist', async () => {
    const transaction = dsMockUtils.createTxStub('externalAgents', 'createGroupAndAddAuth');
    const proc = procedureMockUtils.getInstance<Params, AuthorizationRequest, Storage>(
      mockContext,
      {
        asset: entityMockUtils.getAssetInstance({
          permissionsGetAgents: [
            {
              agent: entityMockUtils.getIdentityInstance({ isEqual: false }),
              group: entityMockUtils.getCustomPermissionGroupInstance(),
            },
          ],
        }),
      }
    );

    sinon.stub(utilsConversionModule, 'permissionsLikeToPermissions').returns({
      transactions: null,
      assets: null,
      portfolios: null,
      transactionGroups: [],
    });
    const rawPermissions = dsMockUtils.createMockExtrinsicPermissions('Whole');
    sinon
      .stub(utilsConversionModule, 'transactionPermissionsToExtrinsicPermissions')
      .returns(rawPermissions);
    sinon.stub(utilsConversionModule, 'stringToTicker').returns(rawTicker);

    const result = await prepareInviteExternalAgent.call(proc, {
      target: entityMockUtils.getIdentityInstance({ did: target }),
      ticker,
      permissions: {
        transactions: {
          values: [],
          type: PermissionType.Include,
        },
      },
    });

    expect(result).toEqual({
      transaction,
      args: [rawTicker, rawPermissions, rawIdentityId, null],
      resolver: expect.any(Function),
    });
  });
});

describe('createGroupAndAuthorizationResolver', () => {
  const filterEventRecordsStub = sinon.stub(utilsInternalModule, 'filterEventRecords');
  const id = new BigNumber(10);
  const rawId = dsMockUtils.createMockU64(id);

  beforeEach(() => {
    filterEventRecordsStub.returns([
      dsMockUtils.createMockIEvent([undefined, undefined, undefined, rawId, undefined]),
    ]);
  });

  afterEach(() => {
    filterEventRecordsStub.reset();
  });

  it('should return the new Authorization', async () => {
    sinon.stub(utilsConversionModule, 'u64ToBigNumber').withArgs(rawId).returns(id);
    const target = entityMockUtils.getIdentityInstance({
      authorizationsGetOne: entityMockUtils.getAuthorizationRequestInstance({
        authId: id,
      }),
    });

    const result = await createGroupAndAuthorizationResolver(target)({} as ISubmittableResult);

    expect(result.authId).toEqual(id);
  });
});
