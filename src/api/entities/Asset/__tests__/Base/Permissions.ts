import BigNumber from 'bignumber.js';
import { when } from 'jest-when';
import { range } from 'lodash';

import {
  Context,
  CustomPermissionGroup,
  FungibleAsset,
  KnownPermissionGroup,
  Namespace,
  PolymeshTransaction,
} from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { PermissionGroupType, TransactionPermissions } from '~/types';
import { tuple } from '~/types/utils';

import { Permissions } from '../../Base/Permissions';

jest.mock(
  '~/base/Procedure',
  require('~/testUtils/mocks/procedure').mockProcedureModule('~/base/Procedure')
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

describe('Permissions class', () => {
  let ticker: string;
  let asset: FungibleAsset;
  let context: Context;
  let target: string;
  let permissions: Permissions;

  beforeAll(() => {
    entityMockUtils.initMocks();
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();

    ticker = 'SOME_ASSET';
    target = 'someDid';
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
    asset = entityMockUtils.getFungibleAssetInstance({ ticker });
    permissions = new Permissions(asset, context);
  });

  afterEach(() => {
    entityMockUtils.reset();
    dsMockUtils.reset();
    procedureMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
    procedureMockUtils.cleanup();
  });

  it('should extend namespace', () => {
    expect(Permissions.prototype instanceof Namespace).toBe(true);
  });

  describe('method: createGroup', () => {
    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const args = {
        ticker: asset.ticker,
        permissions: { transactions: {} as TransactionPermissions },
      };

      const expectedTransaction =
        'someTransaction' as unknown as PolymeshTransaction<FungibleAsset>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args, transformer: undefined }, context, {})
        .mockResolvedValue(expectedTransaction);

      const tx = await permissions.createGroup(args);

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: inviteAgent', () => {
    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const args = {
        ticker: asset.ticker,
        target,
        permissions: { transactions: {} as TransactionPermissions },
      };

      const expectedTransaction =
        'someTransaction' as unknown as PolymeshTransaction<FungibleAsset>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args, transformer: undefined }, context, {})
        .mockResolvedValue(expectedTransaction);

      const tx = await permissions.inviteAgent(args);

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: removeAgent', () => {
    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const args = {
        ticker: asset.ticker,
        target,
      };

      const expectedTransaction =
        'someTransaction' as unknown as PolymeshTransaction<FungibleAsset>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args, transformer: undefined }, context, {})
        .mockResolvedValue(expectedTransaction);

      const tx = await permissions.removeAgent(args);

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: getGroup', () => {
    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should retrieve a specific Custom Permission Group', async () => {
      entityMockUtils.configureMocks({
        customPermissionGroupOptions: {
          ticker,
        },
      });
      const id = new BigNumber(1);

      const result = await permissions.getGroup({ id });

      expect(result.id).toEqual(id);
      expect(result.asset.ticker).toBe(ticker);
    });

    it('should throw an error if the Custom Permission Group does not exist', () => {
      const id = new BigNumber(1);

      entityMockUtils.configureMocks({ customPermissionGroupOptions: { exists: false } });

      return expect(permissions.getGroup({ id })).rejects.toThrow(
        'The Permission Group does not exist'
      );
    });

    it('should retrieve a specific Known Permission Group', async () => {
      entityMockUtils.configureMocks({
        knownPermissionGroupOptions: {
          ticker,
        },
      });
      const type = PermissionGroupType.Full;

      const result = await permissions.getGroup({ type });

      expect(result.type).toEqual(type);
      expect(result.asset.ticker).toBe(ticker);
    });
  });

  describe('method: getGroups', () => {
    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should retrieve all the permission groups of the Asset', async () => {
      const id = new BigNumber(1);

      dsMockUtils.createQueryMock('externalAgents', 'groupPermissions', {
        entries: [
          tuple(
            [dsMockUtils.createMockTicker(ticker), dsMockUtils.createMockU32(id)],
            dsMockUtils.createMockOption(dsMockUtils.createMockExtrinsicPermissions())
          ),
        ],
      });

      const { known, custom } = await permissions.getGroups();

      expect(known.length).toEqual(4);
      expect(custom.length).toEqual(1);

      known.forEach(group => {
        expect(group instanceof KnownPermissionGroup).toBe(true);
      });

      expect(custom[0] instanceof CustomPermissionGroup).toBe(true);
    });
  });

  describe('method: getAgents', () => {
    it('should retrieve a list of agent Identities', async () => {
      const did = 'someDid';
      const otherDid = 'otherDid';
      const customId = new BigNumber(1);

      dsMockUtils.createQueryMock('externalAgents', 'groupOfAgent', {
        entries: [
          tuple(
            [dsMockUtils.createMockTicker(ticker), dsMockUtils.createMockIdentityId(did)],
            dsMockUtils.createMockOption(dsMockUtils.createMockAgentGroup('ExceptMeta'))
          ),
          tuple(
            [dsMockUtils.createMockTicker(ticker), dsMockUtils.createMockIdentityId(otherDid)],
            dsMockUtils.createMockOption(dsMockUtils.createMockAgentGroup('Full'))
          ),
          tuple(
            [dsMockUtils.createMockTicker(ticker), dsMockUtils.createMockIdentityId(did)],
            dsMockUtils.createMockOption(dsMockUtils.createMockAgentGroup('PolymeshV1CAA'))
          ),
          tuple(
            [dsMockUtils.createMockTicker(ticker), dsMockUtils.createMockIdentityId(otherDid)],
            dsMockUtils.createMockOption(dsMockUtils.createMockAgentGroup('PolymeshV1PIA'))
          ),
          tuple(
            [dsMockUtils.createMockTicker(ticker), dsMockUtils.createMockIdentityId(otherDid)],
            dsMockUtils.createMockOption(
              dsMockUtils.createMockAgentGroup({
                Custom: dsMockUtils.createMockU32(customId),
              })
            )
          ),
        ],
      });

      const result = await permissions.getAgents();

      expect(result.length).toEqual(5);
      for (const i in range(4)) {
        expect(result[i].group instanceof KnownPermissionGroup).toEqual(true);
      }
      expect(result[4].group instanceof CustomPermissionGroup).toEqual(true);
    });
  });
});
