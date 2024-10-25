import {
  PolymeshPrimitivesAgentAgentGroup,
  PolymeshPrimitivesAssetAssetId,
  PolymeshPrimitivesAuthorizationAuthorizationData,
  PolymeshPrimitivesIdentityId,
  PolymeshPrimitivesSecondaryKeySignatory,
} from '@polkadot/types/lookup';
import { ISubmittableResult } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import {
  createGroupAndAuthorizationResolver,
  getAuthorization,
  Params,
  prepareInviteExternalAgent,
} from '~/api/procedures/inviteExternalAgent';
import * as procedureUtilsModule from '~/api/procedures/utils';
import { Account, AuthorizationRequest, Context, FungibleAsset, Identity } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { Authorization, PermissionType, SignerValue, TxTags } from '~/types';
import { uuidToHex } from '~/utils';
import * as utilsConversionModule from '~/utils/conversion';
import * as utilsInternalModule from '~/utils/internal';

jest.mock(
  '~/api/entities/Asset/Fungible',
  require('~/testUtils/mocks/entities').mockFungibleAssetModule('~/api/entities/Asset/Fungible')
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
  let authorizationToAuthorizationDataSpy: jest.SpyInstance<
    PolymeshPrimitivesAuthorizationAuthorizationData,
    [Authorization, Context]
  >;
  let signerToStringSpy: jest.SpyInstance<string, [string | Identity | Account]>;
  let signerValueToSignatorySpy: jest.SpyInstance<
    PolymeshPrimitivesSecondaryKeySignatory,
    [SignerValue, Context]
  >;
  let stringToIdentityIdSpy: jest.SpyInstance;
  let assetId: string;
  let asset: FungibleAsset;
  let rawAssetId: PolymeshPrimitivesAssetAssetId;
  let rawAgentGroup: PolymeshPrimitivesAgentAgentGroup;
  let target: string;
  let rawSignatory: PolymeshPrimitivesSecondaryKeySignatory;
  let rawAuthorizationData: PolymeshPrimitivesAuthorizationAuthorizationData;
  let rawIdentityId: PolymeshPrimitivesIdentityId;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    authorizationToAuthorizationDataSpy = jest.spyOn(
      utilsConversionModule,
      'authorizationToAuthorizationData'
    );
    signerToStringSpy = jest.spyOn(utilsConversionModule, 'signerToString');
    stringToIdentityIdSpy = jest.spyOn(utilsConversionModule, 'stringToIdentityId');
    signerValueToSignatorySpy = jest.spyOn(utilsConversionModule, 'signerValueToSignatory');
    assetId = '12341234-1234-1234-1234-123412341234';
    rawAssetId = dsMockUtils.createMockAssetId(uuidToHex(assetId));
    rawAgentGroup = dsMockUtils.createMockAgentGroup('Full');
    asset = entityMockUtils.getFungibleAssetInstance({ assetId });
    target = 'someDid';
    rawSignatory = dsMockUtils.createMockSignatory({
      Identity: dsMockUtils.createMockIdentityId(target),
    });
    rawAuthorizationData = dsMockUtils.createMockAuthorizationData({
      BecomeAgent: [rawAssetId, rawAgentGroup],
    });
    rawIdentityId = dsMockUtils.createMockIdentityId(target);
  });

  beforeEach(() => {
    entityMockUtils.configureMocks({
      fungibleAssetOptions: {
        corporateActionsGetAgents: [],
      },
    });
    mockContext = dsMockUtils.getContextInstance();
    authorizationToAuthorizationDataSpy.mockReturnValue(rawAuthorizationData);
    signerToStringSpy.mockReturnValue(target);
    signerValueToSignatorySpy.mockReturnValue(rawSignatory);
    stringToIdentityIdSpy.mockReturnValue(rawIdentityId);
  });

  afterEach(() => {
    entityMockUtils.reset();
    procedureMockUtils.reset();
    dsMockUtils.reset();
  });

  afterAll(() => {
    procedureMockUtils.cleanup();
    dsMockUtils.cleanup();
    jest.resetAllMocks();
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<Params, AuthorizationRequest>(mockContext);
      const boundFunc = getAuthorization.bind(proc);

      expect(boundFunc({ asset } as unknown as Params)).toEqual({
        permissions: {
          transactions: [TxTags.identity.AddAuthorization],
          assets: [asset],
          portfolios: [],
        },
      });
    });
  });

  it('should throw an error if the target Identity is already an external agent', () => {
    const args = {
      target,
      asset: entityMockUtils.getFungibleAssetInstance({
        permissionsGetAgents: [
          {
            agent: entityMockUtils.getIdentityInstance({ did: target }),
            group: entityMockUtils.getKnownPermissionGroupInstance(),
          },
        ],
        assetId,
      }),
      permissions: entityMockUtils.getKnownPermissionGroupInstance(),
    };

    const proc = procedureMockUtils.getInstance<Params, AuthorizationRequest>(mockContext);

    return expect(prepareInviteExternalAgent.call(proc, args)).rejects.toThrow(
      'The target Identity is already an External Agent'
    );
  });

  it('should return an add authorization transaction spec if an existing group is passed', async () => {
    const transaction = dsMockUtils.createTxMock('identity', 'addAuthorization');
    const proc = procedureMockUtils.getInstance<Params, AuthorizationRequest>(mockContext);

    const result = await prepareInviteExternalAgent.call(proc, {
      target,
      asset: entityMockUtils.getFungibleAssetInstance({
        permissionsGetAgents: [
          {
            agent: entityMockUtils.getIdentityInstance({ isEqual: false }),
            group: entityMockUtils.getCustomPermissionGroupInstance(),
          },
        ],
        assetId,
      }),
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
    const transaction = dsMockUtils.createTxMock('identity', 'addAuthorization');
    const getGroupFromPermissionsSpy = jest
      .spyOn(procedureUtilsModule, 'getGroupFromPermissions')
      .mockResolvedValue(
        entityMockUtils.getCustomPermissionGroupInstance({
          assetId,
          id: groupId,
        })
      );

    const args = {
      target,
      asset,
      permissions: {
        transactions: {
          type: PermissionType.Include,
          values: [TxTags.asset.AcceptAssetOwnershipTransfer],
        },
      },
    };

    const proc = procedureMockUtils.getInstance<Params, AuthorizationRequest>(mockContext);

    const result = await prepareInviteExternalAgent.call(proc, {
      ...args,
      asset: entityMockUtils.getFungibleAssetInstance({
        permissionsGetAgents: [],
        assetId,
      }),
    });

    expect(result).toEqual({
      transaction,
      args: [rawSignatory, rawAuthorizationData, null],
      resolver: expect.any(Function),
    });

    getGroupFromPermissionsSpy.mockRestore();
  });

  it('should return a create group and add authorization transaction spec if the group does not exist', async () => {
    const transaction = dsMockUtils.createTxMock('externalAgents', 'createGroupAndAddAuth');
    const proc = procedureMockUtils.getInstance<Params, AuthorizationRequest>(mockContext);

    jest.spyOn(utilsConversionModule, 'permissionsLikeToPermissions').mockClear().mockReturnValue({
      transactions: null,
      assets: null,
      portfolios: null,
      transactionGroups: [],
    });
    const rawPermissions = dsMockUtils.createMockExtrinsicPermissions('Whole');
    jest
      .spyOn(utilsConversionModule, 'transactionPermissionsToExtrinsicPermissions')
      .mockReturnValue(rawPermissions);
    jest.spyOn(utilsConversionModule, 'assetToMeshAssetId').mockReturnValue(rawAssetId);

    const result = await prepareInviteExternalAgent.call(proc, {
      target: entityMockUtils.getIdentityInstance({ did: target }),
      asset: entityMockUtils.getFungibleAssetInstance({
        permissionsGetAgents: [
          {
            agent: entityMockUtils.getIdentityInstance({ isEqual: false }),
            group: entityMockUtils.getCustomPermissionGroupInstance(),
          },
        ],
        assetId,
      }),
      permissions: {
        transactions: {
          values: [],
          type: PermissionType.Include,
        },
      },
    });

    expect(result).toEqual({
      transaction,
      args: [rawAssetId, rawPermissions, rawIdentityId, null],
      resolver: expect.any(Function),
    });
  });
});

describe('createGroupAndAuthorizationResolver', () => {
  const filterEventRecordsSpy = jest.spyOn(utilsInternalModule, 'filterEventRecords');
  const id = new BigNumber(10);
  const rawId = dsMockUtils.createMockU64(id);

  beforeEach(() => {
    filterEventRecordsSpy.mockReturnValue([
      dsMockUtils.createMockIEvent([undefined, undefined, undefined, rawId, undefined]),
    ]);
  });

  afterEach(() => {
    filterEventRecordsSpy.mockReset();
  });

  it('should return the new Authorization', async () => {
    when(jest.spyOn(utilsConversionModule, 'u64ToBigNumber')).calledWith(rawId).mockReturnValue(id);
    const target = entityMockUtils.getIdentityInstance({
      authorizationsGetOne: entityMockUtils.getAuthorizationRequestInstance({
        authId: id,
      }),
    });

    const result = await createGroupAndAuthorizationResolver(target)({} as ISubmittableResult);

    expect(result.authId).toEqual(id);
  });
});
