import {
  getAuthorization,
  Params,
  prepareStorage,
  prepareWaivePermissions,
  Storage,
} from '~/api/procedures/waivePermissions';
import { Context } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { RoleType, TxTags } from '~/types';
import { PolymeshTx } from '~/types/internal';
import * as utilsConversionModule from '~/utils/conversion';
import * as utilsInternalModule from '~/utils/internal';

jest.mock(
  '~/api/entities/Asset/Fungible',
  require('~/testUtils/mocks/entities').mockFungibleAssetModule('~/api/entities/Asset/Fungible')
);

describe('waivePermissions procedure', () => {
  const assetId = '0x12341234123412341234123412341234';
  const did = 'someDid';
  const rawAssetId = dsMockUtils.createMockAssetId(assetId);

  let mockContext: Mocked<Context>;
  let externalAgentsAbdicateTransaction: PolymeshTx<unknown[]>;

  beforeAll(() => {
    entityMockUtils.initMocks();
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();

    jest.spyOn(utilsConversionModule, 'assetToMeshAssetId').mockReturnValue(rawAssetId);
  });

  beforeEach(() => {
    externalAgentsAbdicateTransaction = dsMockUtils.createTxMock('externalAgents', 'abdicate');
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

  it('should throw an error if the Identity is not an Agent for the Asset', async () => {
    const asset = entityMockUtils.getFungibleAssetInstance({
      assetId,
      permissionsGetAgents: [
        {
          group: entityMockUtils.getKnownPermissionGroupInstance(),
          agent: entityMockUtils.getIdentityInstance({
            did: 'aDifferentDid',
            isEqual: false,
          }),
        },
        {
          group: entityMockUtils.getKnownPermissionGroupInstance(),
          agent: entityMockUtils.getIdentityInstance({
            did: 'anotherDifferentDid',
            isEqual: false,
          }),
        },
      ],
    });

    const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
      asset,
    });

    let error;

    try {
      await prepareWaivePermissions.call(proc, {
        asset,
        identity: entityMockUtils.getIdentityInstance({
          did,
        }),
      });
    } catch (err) {
      error = err;
    }

    expect(error.message).toBe('The Identity is not an Agent for the Asset');
  });

  it('should return an abdicate transaction spec', async () => {
    const asset = entityMockUtils.getFungibleAssetInstance({
      assetId,
      permissionsGetAgents: [
        {
          group: entityMockUtils.getKnownPermissionGroupInstance(),
          agent: entityMockUtils.getIdentityInstance({
            did,
          }),
        },
      ],
    });

    const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
      asset,
    });

    const result = await prepareWaivePermissions.call(proc, {
      asset,
      identity: entityMockUtils.getIdentityInstance({
        did,
      }),
    });

    expect(result).toEqual({
      transaction: externalAgentsAbdicateTransaction,
      args: [rawAssetId],
      resolver: undefined,
    });
  });

  describe('prepareStorage', () => {
    it('should return the Asset', async () => {
      const asset = entityMockUtils.getFungibleAssetInstance({
        assetId,
      });

      jest.spyOn(utilsInternalModule, 'asBaseAsset').mockResolvedValue(asset);

      const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext);
      const boundFunc = prepareStorage.bind(proc);

      const result = await boundFunc({
        identity: entityMockUtils.getIdentityInstance({
          did,
        }),
        asset,
      });

      expect(result).toEqual({
        asset,
      });
    });
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      const asset = entityMockUtils.getFungibleAssetInstance({
        assetId,
      });

      const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
        asset,
      });
      const boundFunc = getAuthorization.bind(proc);

      expect(
        boundFunc({
          identity: entityMockUtils.getIdentityInstance({
            did,
          }),
          asset,
        })
      ).toEqual({
        signerPermissions: {
          transactions: [TxTags.externalAgents.Abdicate],
          assets: [expect.objectContaining({ id: assetId })],
          portfolios: [],
        },
        roles: [{ type: RoleType.Identity, did }],
      });
    });
  });
});
