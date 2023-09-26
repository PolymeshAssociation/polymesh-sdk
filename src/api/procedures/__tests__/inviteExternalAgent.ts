import {
  PolymeshPrimitivesAgentAgentGroup,
  PolymeshPrimitivesAuthorizationAuthorizationData,
  PolymeshPrimitivesIdentityId,
  PolymeshPrimitivesSecondaryKeySignatory,
  PolymeshPrimitivesTicker,
} from '@polkadot/types/lookup';
import { ISubmittableResult } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import {
  createGroupAndAuthorizationResolver,
  getAuthorization,
  Params,
  prepareInviteExternalAgent,
  prepareStorage,
  Storage,
} from '~/api/procedures/inviteExternalAgent';
import * as procedureUtilsModule from '~/api/procedures/utils';
import { Account, AuthorizationRequest, Context, FungibleAsset, Identity } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { Authorization, PermissionType, SignerValue, TxTags } from '~/types';
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
  let ticker: string;
  let asset: FungibleAsset;
  let rawTicker: PolymeshPrimitivesTicker;
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
    ticker = 'SOME_TICKER';
    rawTicker = dsMockUtils.createMockTicker(ticker);
    rawAgentGroup = dsMockUtils.createMockAgentGroup('Full');
    asset = entityMockUtils.getFungibleAssetInstance({ ticker });
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
        asset: entityMockUtils.getFungibleAssetInstance({
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
    const transaction = dsMockUtils.createTxMock('identity', 'addAuthorization');
    const proc = procedureMockUtils.getInstance<Params, AuthorizationRequest, Storage>(
      mockContext,
      {
        asset: entityMockUtils.getFungibleAssetInstance({
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
    const transaction = dsMockUtils.createTxMock('identity', 'addAuthorization');
    const getGroupFromPermissionsSpy = jest
      .spyOn(procedureUtilsModule, 'getGroupFromPermissions')
      .mockResolvedValue(
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
        asset: entityMockUtils.getFungibleAssetInstance({
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

    getGroupFromPermissionsSpy.mockRestore();
  });

  it('should return a create group and add authorization transaction spec if the group does not exist', async () => {
    const transaction = dsMockUtils.createTxMock('externalAgents', 'createGroupAndAddAuth');
    const proc = procedureMockUtils.getInstance<Params, AuthorizationRequest, Storage>(
      mockContext,
      {
        asset: entityMockUtils.getFungibleAssetInstance({
          permissionsGetAgents: [
            {
              agent: entityMockUtils.getIdentityInstance({ isEqual: false }),
              group: entityMockUtils.getCustomPermissionGroupInstance(),
            },
          ],
        }),
      }
    );

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
    jest.spyOn(utilsConversionModule, 'stringToTicker').mockReturnValue(rawTicker);

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
