import { StorageKey } from '@polkadot/types';
import BigNumber from 'bignumber.js';
import sinon from 'sinon';

import { Namespace, SecurityToken, TransactionQueue } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { TransactionPermissions } from '~/types';
import { tuple } from '~/types/utils';
import * as utilsInternalModule from '~/utils/internal';

import { Permissions } from '../Permissions';

jest.mock(
  '~/base/Procedure',
  require('~/testUtils/mocks/procedure').mockProcedureModule('~/base/Procedure')
);

describe('Issuance class', () => {
  beforeAll(() => {
    entityMockUtils.initMocks();
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
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
      const context = dsMockUtils.getContextInstance();
      const token = entityMockUtils.getSecurityTokenInstance();
      const permission = new Permissions(token, context);

      const args = {
        ticker: token.ticker,
        permissions: { transactions: {} as TransactionPermissions },
      };

      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<SecurityToken>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs({ args, transformer: undefined }, context)
        .resolves(expectedQueue);

      const queue = await permission.createGroup(args);

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: getGroups', () => {
    afterAll(() => {
      sinon.restore();
    });

    test('should retrieve all the group permissions of the Security Token', async () => {
      const id = new BigNumber(1);
      const context = dsMockUtils.getContextInstance();
      const token = entityMockUtils.getSecurityTokenInstance();
      const permission = new Permissions(token, context);

      dsMockUtils.createQueryStub('externalAgents', 'groupPermissions');

      const rawEntries = [
        tuple(
          ({
            args: [dsMockUtils.createMockTicker(), dsMockUtils.createMockU32(id.toNumber())],
          } as unknown) as StorageKey,
          dsMockUtils.createMockOption(dsMockUtils.createMockExtrinsicPermissions())
        ),
      ];

      sinon
        .stub(utilsInternalModule, 'requestPaginated')
        .resolves({ entries: rawEntries, lastKey: null });

      const result = await permission.getGroups();

      expect(result.data.length).toEqual(1);
      expect(result.data[0].id).toEqual(id);
      expect(result.next).toBeNull();
    });
  });
});
