import { AgentGroup, AuthorizationData, Signatory, Ticker } from 'polymesh-types/types';
import sinon from 'sinon';

import {
  getAuthorization,
  Params,
  prepareInviteExternalAgent,
  prepareStorage,
  Storage,
} from '~/api/procedures/inviteExternalAgent';
import { Account, Asset, AuthorizationRequest, Context, Identity } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { Authorization, PermissionType, SignerValue, TxTags } from '~/types';
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

describe('inviteExternalAgent procedure', () => {
  let mockContext: Mocked<Context>;
  let authorizationToAuthorizationDataStub: sinon.SinonStub<
    [Authorization, Context],
    AuthorizationData
  >;
  let signerToStringStub: sinon.SinonStub<[string | Identity | Account], string>;
  let signerValueToSignatoryStub: sinon.SinonStub<[SignerValue, Context], Signatory>;
  let ticker: string;
  let asset: Asset;
  let rawTicker: Ticker;
  let rawAgentGroup: AgentGroup;
  let target: string;
  let addTransactionStub: sinon.SinonStub;
  let rawSignatory: Signatory;
  let rawAuthorizationData: AuthorizationData;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    authorizationToAuthorizationDataStub = sinon.stub(
      utilsConversionModule,
      'authorizationToAuthorizationData'
    );
    signerToStringStub = sinon.stub(utilsConversionModule, 'signerToString');
    signerValueToSignatoryStub = sinon.stub(utilsConversionModule, 'signerValueToSignatory');
    ticker = 'someTicker';
    rawTicker = dsMockUtils.createMockTicker(ticker);
    rawAgentGroup = dsMockUtils.createMockAgentGroup('Full');
    asset = entityMockUtils.getAssetInstance({ ticker });
    target = 'someDid';
    rawSignatory = dsMockUtils.createMockSignatory({
      Identity: dsMockUtils.createMockIdentityId(target),
    });
    rawAuthorizationData = dsMockUtils.createMockAuthorizationData({
      BecomeAgent: [rawTicker, rawAgentGroup],
    });
  });

  beforeEach(() => {
    entityMockUtils.configureMocks({
      assetOptions: {
        corporateActionsGetAgents: [],
      },
    });
    mockContext = dsMockUtils.getContextInstance();
    authorizationToAuthorizationDataStub.returns(rawAuthorizationData);
    signerToStringStub.returns(target);
    signerValueToSignatoryStub.returns(rawSignatory);
    addTransactionStub = procedureMockUtils.getAddTransactionStub();
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
        asset: entityMockUtils.getAssetInstance({
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

  it('should add an add authorization transaction to the queue', async () => {
    const transaction = dsMockUtils.createTxStub('identity', 'addAuthorization');
    const proc = procedureMockUtils.getInstance<Params, AuthorizationRequest, Storage>(
      mockContext,
      {
        asset: entityMockUtils.getAssetInstance({
          permissionsGetAgents: [
            {
              agent: entityMockUtils.getIdentityInstance({ isEqual: false }),
              group: entityMockUtils.getCustomPermissionGroupInstance(),
            },
          ],
        }),
      }
    );

    type AuthCallback = () => AuthorizationData;
    procedureMockUtils.getAddProcedureStub().resolves({
      transform: (cb: AuthCallback & { transform: { cb: AuthCallback } }) => {
        const res = cb();
        return {
          ...res,
          transform: (ocb: AuthCallback): AuthorizationData => ocb(),
        };
      },
    });

    await prepareInviteExternalAgent.call(proc, {
      target,
      ticker,
      permissions: entityMockUtils.getKnownPermissionGroupInstance(),
    });

    sinon.assert.calledWith(
      addTransactionStub,
      sinon.match({
        transaction,
        resolvers: sinon.match.array,
        args: [rawSignatory, rawAuthorizationData, null],
      })
    );

    await prepareInviteExternalAgent.call(proc, {
      target: entityMockUtils.getIdentityInstance({ did: target }),
      ticker,
      permissions: {
        transactions: {
          values: [],
          type: PermissionType.Include,
        },
      },
    });

    sinon.assert.calledWith(
      addTransactionStub,
      sinon.match({
        transaction,
        resolvers: sinon.match.array,
        args: [rawSignatory, rawAuthorizationData, null],
      })
    );
  });
});
