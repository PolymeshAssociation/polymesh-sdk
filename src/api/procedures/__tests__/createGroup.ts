import { ISubmittableResult } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';
import sinon from 'sinon';

import {
  createCreateGroupResolver,
  getAuthorization,
  Params,
  prepareCreateGroup,
  prepareStorage,
  Storage} from '~/api/procedures/createGroup';
import { Context, CustomPermissionGroup,  } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { PermissionType, TxTags } from '~/types';
import { PolymeshTx } from '~/types/internal';
import * as utilsConversionModule from '~/utils/conversion';
import * as utilsInternalModule from '~/utils/internal';

jest.mock(
  '~/api/entities/Sto',
  require('~/testUtils/mocks/entities').mockStoModule('~/api/entities/Sto')
);
jest.mock(
  '~/api/entities/SecurityToken',
  require('~/testUtils/mocks/entities').mockSecurityTokenModule('~/api/entities/SecurityToken')
);

describe('createGroup procedure', () => {
  const ticker = 'SOMETICKER';
  const permissions = {
    tokens: null,
    portfolios: null,
    transactionGroups: [],
    transactions: {
      type: PermissionType.Include,
      values: [TxTags.sto.Invest],
    },
  };

  const rawTicker = dsMockUtils.createMockTicker(ticker);
  const rawExtrinsicPermissions = dsMockUtils.createMockExtrinsicPermissions({
    These: [
      /* eslint-disable @typescript-eslint/naming-convention */
      dsMockUtils.createMockPalletPermissions({
        pallet_name: dsMockUtils.createMockPalletName('Sto'),
        dispatchable_names: dsMockUtils.createMockDispatchableNames({
          These: [dsMockUtils.createMockDispatchableName('invest')],
        }),
      }),
      /* eslint-enable @typescript-eslint/naming-convention */
    ],
  });

  let mockContext: Mocked<Context>;
  let addTransactionStub: sinon.SinonStub;
  let externalAgentsCreateGroupTransaction: PolymeshTx<unknown[]>;

  beforeAll(() => {
    entityMockUtils.initMocks();
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();

    sinon.stub(utilsConversionModule, 'stringToTicker').returns(rawTicker);
    sinon.stub(utilsConversionModule, 'permissionsLikeToPermissions').returns(permissions);
    sinon
      .stub(utilsConversionModule, 'transactionPermissionsToExtrinsicPermissions')
      .returns(rawExtrinsicPermissions);
  });

  beforeEach(() => {
    addTransactionStub = procedureMockUtils.getAddTransactionStub();
    externalAgentsCreateGroupTransaction = dsMockUtils.createTxStub(
      'externalAgents',
      'createGroup'
    );
    mockContext = dsMockUtils.getContextInstance();
  });

  afterEach(() => {
    entityMockUtils.reset();
    procedureMockUtils.reset();
    dsMockUtils.reset();
  });

  afterAll(() => {
    entityMockUtils.cleanup();
    procedureMockUtils.cleanup();
    dsMockUtils.cleanup();
  });

  describe('createCreateGroupResolver', () => {
    const agId = new BigNumber(1);
    const rawAgId = dsMockUtils.createMockU64(agId.toNumber());
    sinon.stub(utilsInternalModule, 'filterEventRecords').returns([dsMockUtils.createMockIEvent(['someDid', rawTicker, rawAgId])]);

    test('should return the new CustomPermissionGroup', () => {
      const result = createCreateGroupResolver(mockContext)({} as ISubmittableResult);

      expect(result.id).toEqual(agId);
      expect(result.ticker).toEqual(ticker);
    });
  });

  test('should throw an error if already exists a group with exactly the same permissions', async () => {
    const proc = procedureMockUtils.getInstance<Params, CustomPermissionGroup, Storage>(mockContext, {
      token: entityMockUtils.getSecurityTokenInstance({
        ticker,
        permissionsGetGroups: {
          data: [
            entityMockUtils.getCustomPermissionGroupInstance({
              ticker,
              id: new BigNumber(1),
              getPermissions: {
                transactions: permissions.transactions,
                transactionGroups: [],
              },
            }),
          ],
          next: null,
        },
      }),
    });

    expect(
      prepareCreateGroup.call(proc, {
        ticker,
        permissions: { transactions: permissions.transactions },
      })
    ).rejects.toThrow('Already exists a group with exactly the same permissions');
  });

  test('should add a create group transaction to the queue', async () => {
    const proc = procedureMockUtils.getInstance<Params, CustomPermissionGroup, Storage>(mockContext, {
      token: entityMockUtils.getSecurityTokenInstance({
        ticker,
        permissionsGetGroups: {
          data: [
            entityMockUtils.getCustomPermissionGroupInstance({
              ticker,
              id: new BigNumber(2),
              getPermissions: {
                transactions: null,
                transactionGroups: [],
              },
            }),
          ],
          next: null,
        },
      }),
    });

    await prepareCreateGroup.call(proc, {
      ticker,
      permissions: { transactions: permissions.transactions },
    });

    sinon.assert.calledWith(
      addTransactionStub,
      externalAgentsCreateGroupTransaction,
      sinon.match({ resolvers: sinon.match.array }),
      rawTicker,
      rawExtrinsicPermissions
    );
  });

  describe('prepareStorage', () => {
    test('should return the security token', () => {
      const proc = procedureMockUtils.getInstance<Params, CustomPermissionGroup, Storage>(mockContext);
      const boundFunc = prepareStorage.bind(proc);

      const result = boundFunc({ ticker } as Params);

      expect(result).toEqual({
        token: entityMockUtils.getSecurityTokenInstance({ ticker }),
      });
    });
  });

  describe('getAuthorization', () => {
    test('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<Params, CustomPermissionGroup, Storage>(mockContext, {
        token: entityMockUtils.getSecurityTokenInstance({
          ticker,
        }),
      });
      const boundFunc = getAuthorization.bind(proc);

      expect(boundFunc()).toEqual({
        permissions: {
          transactions: [TxTags.externalAgents.CreateGroup],
          tokens: [entityMockUtils.getSecurityTokenInstance({ ticker })],
          portfolios: [],
        },
      });
    });
  });
});
