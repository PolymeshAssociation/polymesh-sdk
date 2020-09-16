import { u64 } from '@polkadot/types';
import BigNumber from 'bignumber.js';
import sinon from 'sinon';

import { Account, AuthorizationRequest, Identity } from '~/api/entities';
import {
  AcceptJoinIdentityAuthorizationParams,
  isAuthorized,
  prepareAcceptJoinIdentityAuthorization,
} from '~/api/procedures/acceptJoinIdentityAuthorization';
import { Context } from '~/base';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { Authorization, AuthorizationType } from '~/types';
import * as utilsModule from '~/utils';

describe('toggleFreezeTransfers procedure', () => {
  let mockContext: Mocked<Context>;
  let numberToU64Stub: sinon.SinonStub<[number | BigNumber, Context], u64>;
  let authId: BigNumber;
  let rawAuthId: u64;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    numberToU64Stub = sinon.stub(utilsModule, 'numberToU64');
    authId = new BigNumber(1);
    rawAuthId = dsMockUtils.createMockU64(authId.toNumber());

    sinon.stub(utilsModule, 'addressToKey');
  });

  let addTransactionStub: sinon.SinonStub;

  beforeEach(() => {
    addTransactionStub = procedureMockUtils.getAddTransactionStub();
    mockContext = dsMockUtils.getContextInstance();
    numberToU64Stub.withArgs(authId, mockContext).returns(rawAuthId);
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

  test('should add a joinIdentityAsKey transaction to the queue if the target is an Account', async () => {
    const proc = procedureMockUtils.getInstance<AcceptJoinIdentityAuthorizationParams, void>(
      mockContext
    );

    const transaction = dsMockUtils.createTxStub('identity', 'joinIdentityAsKey');

    const target = new Account({ address: 'someAddress' }, mockContext);

    await prepareAcceptJoinIdentityAuthorization.call(proc, {
      authRequest: new AuthorizationRequest(
        {
          target,
          issuer: entityMockUtils.getIdentityInstance(),
          authId,
          expiry: null,
          data: { type: AuthorizationType.JoinIdentity, value: [] },
        },
        mockContext
      ),
    });

    sinon.assert.calledWith(addTransactionStub, transaction, {}, rawAuthId);
  });

  test('should add a joinIdentityAsIdentity transaction to the queue if the target is an Identity', async () => {
    const proc = procedureMockUtils.getInstance<AcceptJoinIdentityAuthorizationParams, void>(
      mockContext
    );

    const transaction = dsMockUtils.createTxStub('identity', 'joinIdentityAsIdentity');

    const target = new Identity({ did: 'someOtherDid' }, mockContext);

    await prepareAcceptJoinIdentityAuthorization.call(proc, {
      authRequest: new AuthorizationRequest(
        {
          target,
          issuer: entityMockUtils.getIdentityInstance(),
          authId,
          expiry: null,
          data: { type: AuthorizationType.JoinIdentity, value: [] },
        },
        mockContext
      ),
    });

    sinon.assert.calledWith(addTransactionStub, transaction, {}, rawAuthId);
  });

  describe('isAuthorized', () => {
    test('should return whether the current Identity or Account is the target of the authorization request', async () => {
      const proc = procedureMockUtils.getInstance<AcceptJoinIdentityAuthorizationParams, void>(
        mockContext
      );
      const { address } = mockContext.getCurrentAccount();
      const constructorParams = {
        authId,
        expiry: null,
        target: new Account({ address }, mockContext),
        issuer: new Identity({ did: 'issuerDid1' }, mockContext),
        data: {
          type: AuthorizationType.NoData,
        } as Authorization,
      };
      const args = {
        authRequest: new AuthorizationRequest(constructorParams, mockContext),
      };

      const boundFunc = isAuthorized.bind(proc);
      let result = await boundFunc(args);
      expect(result).toBe(true);

      args.authRequest.target = new Identity({ did: 'notTheCurrentIdentity' }, mockContext);

      result = await boundFunc(args);
      expect(result).toBe(false);
    });
  });
});
