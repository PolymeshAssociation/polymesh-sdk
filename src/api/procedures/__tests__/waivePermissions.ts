import sinon from 'sinon';

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

jest.mock(
  '~/api/entities/Asset',
  require('~/testUtils/mocks/entities').mockAssetModule('~/api/entities/Asset')
);

describe('waivePermissions procedure', () => {
  const ticker = 'SOME_TICKER';
  const did = 'someDid';
  const rawTicker = dsMockUtils.createMockTicker(ticker);

  let mockContext: Mocked<Context>;
  let addTransactionStub: sinon.SinonStub;
  let externalAgentsAbdicateTransaction: PolymeshTx<unknown[]>;

  beforeAll(() => {
    entityMockUtils.initMocks();
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();

    sinon.stub(utilsConversionModule, 'stringToTicker').returns(rawTicker);
  });

  beforeEach(() => {
    addTransactionStub = procedureMockUtils.getAddTransactionStub();
    externalAgentsAbdicateTransaction = dsMockUtils.createTxStub('externalAgents', 'abdicate');
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

  test('should throw an error if the Identity is not an Agent for the Asset', async () => {
    const asset = entityMockUtils.getAssetInstance({
      ticker,
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

  test('should add an abdicate transaction to the queue', async () => {
    const asset = entityMockUtils.getAssetInstance({
      ticker,
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

    await prepareWaivePermissions.call(proc, {
      asset,
      identity: entityMockUtils.getIdentityInstance({
        did,
      }),
    });

    sinon.assert.calledWith(addTransactionStub, {
      transaction: externalAgentsAbdicateTransaction,
      args: [rawTicker],
    });
  });

  describe('prepareStorage', () => {
    test('should return the Asset', () => {
      const asset = entityMockUtils.getAssetInstance({
        ticker,
      });

      const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext);
      const boundFunc = prepareStorage.bind(proc);

      const result = boundFunc({
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
    test('should return the appropriate roles and permissions', () => {
      const asset = entityMockUtils.getAssetInstance({
        ticker,
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
          assets: [expect.objectContaining({ ticker })],
          portfolios: [],
        },
        roles: [{ type: RoleType.Identity, did }],
      });
    });
  });
});
