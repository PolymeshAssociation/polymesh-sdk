import BigNumber from 'bignumber.js';
import sinon from 'sinon';

import {
  getAuthorization,
  Params,
  prepareSetGroupPermissions,
} from '~/api/procedures/setGroupPermissions';
import { Context } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { PermissionType, TxTags } from '~/types';
import { PolymeshTx } from '~/types/internal';
import * as utilsConversionModule from '~/utils/conversion';

describe('setGroupPermissions procedure', () => {
  const ticker = 'SOME_TICKER';
  const permissions = {
    transactions: {
      type: PermissionType.Include,
      values: [TxTags.sto.Invest],
    },
  };
  const rawTicker = dsMockUtils.createMockTicker(ticker);
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
  const customId = new BigNumber(1);
  const rawAgId = dsMockUtils.createMockU32(customId);

  let mockContext: Mocked<Context>;
  let addTransactionStub: sinon.SinonStub;
  let externalAgentsSetGroupPermissionsTransaction: PolymeshTx<unknown[]>;
  let permissionsLikeToPermissionsStub: sinon.SinonStub;

  beforeAll(() => {
    entityMockUtils.initMocks();
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();

    sinon.stub(utilsConversionModule, 'stringToTicker').returns(rawTicker);
    sinon
      .stub(utilsConversionModule, 'transactionPermissionsToExtrinsicPermissions')
      .returns(rawExtrinsicPermissions);
    sinon.stub(utilsConversionModule, 'bigNumberToU32').returns(rawAgId);

    permissionsLikeToPermissionsStub = sinon.stub(
      utilsConversionModule,
      'permissionsLikeToPermissions'
    );
  });

  beforeEach(() => {
    addTransactionStub = procedureMockUtils.getAddTransactionStub();
    externalAgentsSetGroupPermissionsTransaction = dsMockUtils.createTxStub(
      'externalAgents',
      'setGroupPermissions'
    );
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

  it('should throw an error if new permissions are the same as the current ones', async () => {
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    permissionsLikeToPermissionsStub.returns(permissions);

    let error;

    try {
      await prepareSetGroupPermissions.call(proc, {
        group: entityMockUtils.getCustomPermissionGroupInstance({
          ticker,
          id: customId,
          getPermissions: {
            transactions: permissions.transactions,
            transactionGroups: [],
          },
        }),
        permissions: { transactions: permissions.transactions },
      });
    } catch (err) {
      error = err;
    }

    expect(error.message).toBe('New permissions are the same as the current ones');
  });

  it('should add a set group permissions transaction to the queue', async () => {
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    const fakePermissions = { transactions: permissions.transactions };
    permissionsLikeToPermissionsStub
      .withArgs(fakePermissions, mockContext)
      .returns(permissions.transactions);

    await prepareSetGroupPermissions.call(proc, {
      group: entityMockUtils.getCustomPermissionGroupInstance({
        ticker,
        id: customId,
        getPermissions: {
          transactions: permissions.transactions,
          transactionGroups: [],
        },
      }),
      permissions: fakePermissions,
    });

    sinon.assert.calledWith(addTransactionStub, {
      transaction: externalAgentsSetGroupPermissionsTransaction,
      args: [rawTicker, rawAgId, rawExtrinsicPermissions],
    });
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<Params, void>(mockContext);
      const boundFunc = getAuthorization.bind(proc);

      expect(
        boundFunc({
          permissions: { transactionGroups: [] },
          group: entityMockUtils.getCustomPermissionGroupInstance(),
        })
      ).toEqual({
        permissions: {
          transactions: [TxTags.externalAgents.SetGroupPermissions],
          assets: [expect.objectContaining({ ticker })],
          portfolios: [],
        },
      });
    });
  });
});
