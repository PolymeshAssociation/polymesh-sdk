import {
  getAuthorization,
  Params,
  prepareRemoveExternalAgent,
} from '~/api/procedures/removeExternalAgent';
import { Context, FungibleAsset } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { PermissionGroupType, TxTags } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

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

describe('removeExternalAgent procedure', () => {
  let mockContext: Mocked<Context>;
  let assetId: string;
  let asset: FungibleAsset;
  let target: string;
  let assetToMeshAssetIdSpy: jest.SpyInstance;
  let stringToIdentityIdSpy: jest.SpyInstance;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    assetId = '0x12341234123412341234123412341234';
    asset = entityMockUtils.getFungibleAssetInstance({ assetId });
    target = 'someDid';
    assetToMeshAssetIdSpy = jest.spyOn(utilsConversionModule, 'assetToMeshAssetId');
    stringToIdentityIdSpy = jest.spyOn(utilsConversionModule, 'stringToIdentityId');
  });

  beforeEach(() => {
    entityMockUtils.configureMocks();
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

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<Params, void>(mockContext);
      const boundFunc = getAuthorization.bind(proc);

      expect(boundFunc({ asset } as unknown as Params)).toEqual({
        permissions: {
          transactions: [TxTags.externalAgents.RemoveAgent],
          assets: [expect.objectContaining({ id: assetId })],
          portfolios: [],
        },
      });
    });
  });

  it('should throw an error if the Identity is not an external agent', () => {
    const args = {
      target,
      asset: entityMockUtils.getFungibleAssetInstance({ assetId, permissionsGetAgents: [] }),
    };

    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    return expect(prepareRemoveExternalAgent.call(proc, args)).rejects.toThrow(
      'The target Identity is not an External Agent'
    );
  });

  it('should throw an error if the agent to remove is the last one assigned to the full group', () => {
    const args = {
      target,
      asset: entityMockUtils.getFungibleAssetInstance({
        assetId,
        permissionsGetAgents: [
          {
            agent: entityMockUtils.getIdentityInstance({ isEqual: true }),
            group: entityMockUtils.getKnownPermissionGroupInstance({
              assetId,
              type: PermissionGroupType.Full,
            }),
          },
        ],
      }),
    };

    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    return expect(prepareRemoveExternalAgent.call(proc, args)).rejects.toThrow(
      'The target is the last Agent with full permissions for this Asset. There should always be at least one Agent with full permissions'
    );
  });

  it('should return a remove agent transaction spec', async () => {
    const transaction = dsMockUtils.createTxMock('externalAgents', 'removeAgent');
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    const rawAssetId = dsMockUtils.createMockAssetId(assetId);
    const rawAgent = dsMockUtils.createMockIdentityId(target);

    assetToMeshAssetIdSpy.mockReturnValue(rawAssetId);
    stringToIdentityIdSpy.mockReturnValue(rawAgent);

    let result = await prepareRemoveExternalAgent.call(proc, {
      target,
      asset: entityMockUtils.getFungibleAssetInstance({
        assetId,
        permissionsGetAgents: [
          {
            agent: entityMockUtils.getIdentityInstance({ isEqual: true }),
            group: entityMockUtils.getKnownPermissionGroupInstance({
              assetId,
              type: PermissionGroupType.ExceptMeta,
            }),
          },
          {
            agent: entityMockUtils.getIdentityInstance({ isEqual: false }),
            group: entityMockUtils.getKnownPermissionGroupInstance({
              assetId,
              type: PermissionGroupType.Full,
            }),
          },
        ],
      }),
    });

    expect(result).toEqual({ transaction, args: [rawAssetId, rawAgent], resolver: undefined });

    result = await prepareRemoveExternalAgent.call(proc, {
      target,
      asset: entityMockUtils.getFungibleAssetInstance({
        permissionsGetAgents: [
          {
            agent: entityMockUtils.getIdentityInstance({ isEqual: false }),
            group: entityMockUtils.getKnownPermissionGroupInstance({
              assetId,
              type: PermissionGroupType.Full,
            }),
          },
          {
            agent: entityMockUtils.getIdentityInstance({ isEqual: true }),
            group: entityMockUtils.getKnownPermissionGroupInstance({
              assetId,
              type: PermissionGroupType.Full,
            }),
          },
        ],
      }),
    });

    expect(result).toEqual({ transaction, args: [rawAssetId, rawAgent], resolver: undefined });
  });
});
