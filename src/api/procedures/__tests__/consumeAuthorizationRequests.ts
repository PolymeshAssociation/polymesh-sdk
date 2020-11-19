import { u64 } from '@polkadot/types';
import BigNumber from 'bignumber.js';
import { Signatory } from 'polymesh-types/types';
import sinon from 'sinon';

import {
  ConsumeAuthorizationRequestsParams,
  isAuthorized,
  prepareConsumeAuthorizationRequests,
} from '~/api/procedures/consumeAuthorizationRequests';
import { Account, AuthorizationRequest, Context, Identity } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { Authorization, AuthorizationType } from '~/types';
import { SignerValue } from '~/types/internal';
import * as utilsConversionModule from '~/utils/conversion';

describe('consumeAuthorizationRequests procedure', () => {
  let mockContext: Mocked<Context>;
  let signerValueToSignatoryStub: sinon.SinonStub<[SignerValue, Context], Signatory>;
  let numberToU64Stub: sinon.SinonStub<[number | BigNumber, Context], u64>;
  let authParams: {
    authId: BigNumber;
    expiry: Date | null;
    issuer: Identity;
    target: Identity | Account;
    data: Authorization;
  }[];
  let auths: AuthorizationRequest[];
  let rawAuthIdentifiers: [Signatory, u64][];
  let rawAuthIds: [u64][];

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    signerValueToSignatoryStub = sinon.stub(utilsConversionModule, 'signerValueToSignatory');
    numberToU64Stub = sinon.stub(utilsConversionModule, 'numberToU64');
    sinon.stub(utilsConversionModule, 'addressToKey');
  });

  let addBatchTransactionStub: sinon.SinonStub;

  beforeEach(() => {
    addBatchTransactionStub = procedureMockUtils.getAddBatchTransactionStub();
    mockContext = dsMockUtils.getContextInstance();
    authParams = [
      {
        authId: new BigNumber(1),
        expiry: new Date('10/14/3040'),
        target: new Identity({ did: 'targetDid1' }, mockContext),
        issuer: new Identity({ did: 'issuerDid1' }, mockContext),
        data: {
          type: AuthorizationType.TransferAssetOwnership,
          value: 'someTicker1',
        },
      },
      {
        authId: new BigNumber(2),
        expiry: null,
        target: new Account({ address: 'targetAddress2' }, mockContext),
        issuer: new Identity({ did: 'issuerDid2' }, mockContext),
        data: {
          type: AuthorizationType.TransferAssetOwnership,
          value: 'someTicker2',
        },
      },
      {
        authId: new BigNumber(3),
        expiry: new Date('10/14/1987'), // expired
        target: new Identity({ did: 'targetDid3' }, mockContext),
        issuer: new Identity({ did: 'issuerDid3' }, mockContext),
        data: {
          type: AuthorizationType.TransferAssetOwnership,
          value: 'someTicker3',
        },
      },
    ];
    auths = [];
    rawAuthIds = [];
    rawAuthIdentifiers = [];
    authParams.forEach(params => {
      const { authId, target } = params;

      const signerValue = utilsConversionModule.signerToSignerValue(target);

      auths.push(new AuthorizationRequest(params, mockContext));

      const rawAuthId = dsMockUtils.createMockU64(authId.toNumber());
      rawAuthIds.push([rawAuthId]);
      numberToU64Stub.withArgs(authId, mockContext).returns(rawAuthId);
      const rawSignatory = dsMockUtils.createMockSignatory({
        Identity: dsMockUtils.createMockIdentityId(signerValue.value),
      });

      rawAuthIdentifiers.push([rawSignatory, rawAuthId]);
      signerValueToSignatoryStub.withArgs(signerValue, mockContext).returns(rawSignatory);
    });
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

  test('should add a batch of accept authorization transactions to the queue and ignore expired requests', async () => {
    const proc = procedureMockUtils.getInstance<ConsumeAuthorizationRequestsParams, void>(
      mockContext
    );

    const transaction = dsMockUtils.createTxStub('identity', 'acceptAuthorization');

    await prepareConsumeAuthorizationRequests.call(proc, {
      accept: true,
      authRequests: auths,
    });

    const authIds = rawAuthIds.slice(0, -1);

    sinon.assert.calledWith(addBatchTransactionStub, transaction, {}, authIds);
  });

  test('should add a batch of remove authorization transactions to the queue and ignore expired requests', async () => {
    const proc = procedureMockUtils.getInstance<ConsumeAuthorizationRequestsParams, void>(
      mockContext
    );

    const transaction = dsMockUtils.createTxStub('identity', 'removeAuthorization');

    await prepareConsumeAuthorizationRequests.call(proc, {
      accept: false,
      authRequests: auths,
    });

    const authIds = rawAuthIdentifiers.slice(0, -1);

    sinon.assert.calledWith(addBatchTransactionStub, transaction, {}, authIds);
  });

  describe('isAuthorized', () => {
    test('should return whether the current Identity or Account is the target of all non-expired requests if trying to accept', async () => {
      const proc = procedureMockUtils.getInstance<ConsumeAuthorizationRequestsParams, void>(
        mockContext
      );
      const { did } = await mockContext.getCurrentIdentity();
      const constructorParams = [
        {
          authId: new BigNumber(1),
          expiry: null,
          target: new Identity({ did }, mockContext),
          issuer: new Identity({ did: 'issuerDid1' }, mockContext),
          data: {
            type: AuthorizationType.NoData,
          } as Authorization,
        },
        {
          authId: new BigNumber(2),
          expiry: new Date('10/14/1987'), // expired
          target: new Identity({ did: 'notTheCurrentIdentity' }, mockContext),
          issuer: new Identity({ did: 'issuerDid2' }, mockContext),
          data: {
            type: AuthorizationType.NoData,
          } as Authorization,
        },
      ];
      const args = {
        accept: true,
        authRequests: constructorParams.map(
          params => new AuthorizationRequest(params, mockContext)
        ),
      } as ConsumeAuthorizationRequestsParams;

      const boundFunc = isAuthorized.bind(proc);
      let result = await boundFunc(args);
      expect(result).toBe(true);

      args.authRequests[0].target = new Identity({ did: 'notTheCurrentIdentity' }, mockContext);

      result = await boundFunc(args);
      expect(result).toBe(false);
    });

    test('should return whether the current Identity or Account is the target or issuer of all non-expired requests if trying to remove', async () => {
      const proc = procedureMockUtils.getInstance<ConsumeAuthorizationRequestsParams, void>(
        mockContext
      );
      const { did } = await mockContext.getCurrentIdentity();
      const { address } = mockContext.getCurrentAccount();
      const constructorParams = [
        {
          authId: new BigNumber(1),
          expiry: null,
          target: new Account({ address }, mockContext),
          issuer: new Identity({ did: 'notTheCurrentIdentity' }, mockContext),
          data: {
            type: AuthorizationType.NoData,
          } as Authorization,
        },
        {
          authId: new BigNumber(2),
          expiry: new Date('10/14/3040'),
          target: new Identity({ did: 'notTheCurrentIdentity' }, mockContext),
          issuer: new Identity({ did }, mockContext),
          data: {
            type: AuthorizationType.NoData,
          } as Authorization,
        },
        {
          authId: new BigNumber(3),
          expiry: new Date('10/14/1987'), // expired
          target: new Identity({ did: 'notTheCurrentIdentity' }, mockContext),
          issuer: new Identity({ did: 'notTheCurrentIdentity' }, mockContext),
          data: {
            type: AuthorizationType.NoData,
          } as Authorization,
        },
        {
          authId: new BigNumber(4),
          expiry: new Date('10/14/3040'),
          target: new Identity({ did: 'notTheCurrentIdentity' }, mockContext),
          issuer: new Identity({ did }, mockContext),
          data: {
            type: AuthorizationType.NoData,
          } as Authorization,
        },
      ];
      const args = {
        accept: false,
        authRequests: constructorParams.map(
          params => new AuthorizationRequest(params, mockContext)
        ),
      } as ConsumeAuthorizationRequestsParams;

      const boundFunc = isAuthorized.bind(proc);
      let result = await boundFunc(args);
      expect(result).toBe(true);

      args.authRequests[0].target = new Identity({ did: 'notTheCurrentIdentity' }, mockContext);

      result = await boundFunc(args);
      expect(result).toBe(false);
    });
  });
});
