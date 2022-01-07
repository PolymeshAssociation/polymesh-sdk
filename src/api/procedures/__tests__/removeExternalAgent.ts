import { TxTags } from 'polymesh-types/types';
import sinon from 'sinon';

import {
  getAuthorization,
  Params,
  prepareRemoveExternalAgent,
  prepareStorage,
  Storage,
} from '~/api/procedures/removeExternalAgent';
import { Asset, Context, Identity } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { PermissionGroupType } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Asset',
  require('~/testUtils/mocks/entities').mockAssetModule('~/api/entities/Asset')
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
  let ticker: string;
  let asset: Asset;
  let target: string;
  let addTransactionStub: sinon.SinonStub;
  let stringToTickerStub: sinon.SinonStub;
  let stringToIdentityIdStub: sinon.SinonStub;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    ticker = 'SOMETICKER';
    asset = entityMockUtils.getMockAssetInstance({ ticker });
    target = 'someDid';
    stringToTickerStub = sinon.stub(utilsConversionModule, 'stringToTicker');
    stringToIdentityIdStub = sinon.stub(utilsConversionModule, 'stringToIdentityId');
  });

  beforeEach(() => {
    entityMockUtils.configureMocks();
    mockContext = dsMockUtils.getContextInstance();
    addTransactionStub = procedureMockUtils.getAddTransactionStub();
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

  describe('prepareStorage', () => {
    test('should return the asset', () => {
      const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext);
      const boundFunc = prepareStorage.bind(proc);

      const result = boundFunc({
        ticker,
        target,
      });

      expect(result).toEqual({
        asset,
      });
    });
  });

  describe('getAuthorization', () => {
    test('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
        asset,
      });
      const boundFunc = getAuthorization.bind(proc);

      expect(boundFunc()).toEqual({
        permissions: {
          transactions: [TxTags.externalAgents.RemoveAgent],
          assets: [asset],
          portfolios: [],
        },
      });
    });
  });

  test('should throw an error if the identity is not an External Agent', () => {
    const args = {
      target,
      ticker,
    };

    const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
      asset: entityMockUtils.getMockAssetInstance({
        permissionsGetAgents: [],
      }),
    });

    return expect(prepareRemoveExternalAgent.call(proc, args)).rejects.toThrow(
      'The target Identity is not an External Agent'
    );
  });

  test('should throw an error if the agent to remove is the last one assigned to the full group', () => {
    const args = {
      target,
      ticker,
    };

    const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
      asset: entityMockUtils.getMockAssetInstance({
        permissionsGetAgents: [
          {
            agent: { did: 'someDid' } as Identity,
            group: entityMockUtils.getKnownPermissionGroupInstance({
              ticker,
              type: PermissionGroupType.Full,
            }),
          },
        ],
      }),
    });

    return expect(prepareRemoveExternalAgent.call(proc, args)).rejects.toThrow(
      'The target is the last Agent with full permissions for this Asset. There should always be at least one Agent with full permissions'
    );
  });

  test('should add a remove agent transaction to the queue', async () => {
    const transaction = dsMockUtils.createTxStub('externalAgents', 'removeAgent');
    let proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
      asset: entityMockUtils.getMockAssetInstance({
        permissionsGetAgents: [
          {
            agent: { did: 'someDid' } as Identity,
            group: entityMockUtils.getKnownPermissionGroupInstance({
              ticker,
              type: PermissionGroupType.ExceptMeta,
            }),
          },
          {
            agent: { did: 'otherDid' } as Identity,
            group: entityMockUtils.getKnownPermissionGroupInstance({
              ticker,
              type: PermissionGroupType.Full,
            }),
          },
        ],
      }),
    });

    const rawTicker = dsMockUtils.createMockTicker(ticker);
    const rawAgent = dsMockUtils.createMockIdentityId(target);

    stringToTickerStub.returns(rawTicker);
    stringToIdentityIdStub.returns(rawAgent);

    await prepareRemoveExternalAgent.call(proc, {
      target,
      ticker,
    });

    sinon.assert.calledWith(addTransactionStub, transaction, {}, rawTicker, rawAgent);

    proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
      asset: entityMockUtils.getMockAssetInstance({
        permissionsGetAgents: [
          {
            agent: { did: 'someDid' } as Identity,
            group: entityMockUtils.getKnownPermissionGroupInstance({
              ticker,
              type: PermissionGroupType.Full,
            }),
          },
          {
            agent: { did: 'otherDid' } as Identity,
            group: entityMockUtils.getKnownPermissionGroupInstance({
              ticker,
              type: PermissionGroupType.Full,
            }),
          },
        ],
      }),
    });

    await prepareRemoveExternalAgent.call(proc, {
      target,
      ticker,
    });

    sinon.assert.calledWith(addTransactionStub, transaction, {}, rawTicker, rawAgent);
  });
});
