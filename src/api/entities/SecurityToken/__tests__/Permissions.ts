import BigNumber from 'bignumber.js';
import sinon from 'sinon';

import { CustomPermissionGroup } from '~/api/entities/CustomPermissionGroup';
import {
  Context,
  KnownPermissionGroup,
  Namespace,
  SecurityToken,
  TransactionQueue,
} from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { PermissionGroupType, TransactionPermissions } from '~/types';
import { tuple } from '~/types/utils';

import { Permissions } from '../Permissions';

jest.mock(
  '~/base/Procedure',
  require('~/testUtils/mocks/procedure').mockProcedureModule('~/base/Procedure')
);

describe('Permissions class', () => {
  let ticker: string;
  let token: SecurityToken;
  let context: Context;
  let permissions: Permissions;

  beforeAll(() => {
    entityMockUtils.initMocks();
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();

    ticker = 'SOME_TOKEN';
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
    token = entityMockUtils.getSecurityTokenInstance({ ticker });
    permissions = new Permissions(token, context);
  });

  afterEach(() => {
    entityMockUtils.reset();
    dsMockUtils.reset();
    procedureMockUtils.reset();
  });

  afterAll(() => {
    entityMockUtils.cleanup();
    dsMockUtils.cleanup();
    procedureMockUtils.cleanup();
  });

  test('should extend namespace', () => {
    expect(Permissions.prototype instanceof Namespace).toBe(true);
  });

  describe('method: createGroup', () => {
    afterAll(() => {
      sinon.restore();
    });

    test('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
      const args = {
        ticker: token.ticker,
        permissions: { transactions: {} as TransactionPermissions },
      };

      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<SecurityToken>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs({ args, transformer: undefined }, context)
        .resolves(expectedQueue);

      const queue = await permissions.createGroup(args);

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: getGroups', () => {
    afterAll(() => {
      sinon.restore();
    });

    test('should retrieve all the permission groups of the Security Token', async () => {
      const id = new BigNumber(1);

      dsMockUtils.createQueryStub('externalAgents', 'groupPermissions', {
        entries: [
          tuple(
            [dsMockUtils.createMockTicker(ticker), dsMockUtils.createMockU32(id.toNumber())],
            dsMockUtils.createMockOption(dsMockUtils.createMockExtrinsicPermissions())
          ),
        ],
      });

      const result = await permissions.getGroups();

      expect(result.length).toEqual(5);
      result.forEach((group, i) => {
        if (i === 4) {
          expect(group instanceof CustomPermissionGroup).toBe(true);
        } else {
          expect(group instanceof KnownPermissionGroup).toBe(true);
        }
      });
    });
  });

  describe('method: getAgents', () => {
    test('should retrieve a list of agent identities', async () => {
      const did = 'someDid';
      const otherDid = 'otherDid';

      dsMockUtils.createQueryStub('externalAgents', 'groupOfAgent', {
        entries: [
          tuple(
            [dsMockUtils.createMockTicker(ticker), dsMockUtils.createMockIdentityId(did)],
            dsMockUtils.createMockOption(dsMockUtils.createMockAgentGroup('PolymeshV1Caa'))
          ),
          tuple(
            [dsMockUtils.createMockTicker(ticker), dsMockUtils.createMockIdentityId(otherDid)],
            dsMockUtils.createMockOption(dsMockUtils.createMockAgentGroup('PolymeshV1Pia'))
          ),
        ],
      });

      const result = await permissions.getAgents();

      expect(result[0].agent.did).toEqual(did);
      expect(result[1].agent.did).toEqual(otherDid);
      expect(result[0].group).toEqual(PermissionGroupType.PolymeshV1Caa);
      expect(result[1].group).toEqual(PermissionGroupType.PolymeshV1Pia);
    });
  });
});
