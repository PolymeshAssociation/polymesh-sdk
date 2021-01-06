import { bool, u64 } from '@polkadot/types';
import BigNumber from 'bignumber.js';
import { Signatory, TxTags } from 'polymesh-types/types';
import sinon from 'sinon';

import {
  ConsumeAuthorizationRequestsParams,
  getAuthorization,
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
  let booleanToBoolStub: sinon.SinonStub<[boolean, Context], bool>;
  let authParams: {
    authId: BigNumber;
    expiry: Date | null;
    issuer: Identity;
    target: Identity | Account;
    data: Authorization;
  }[];
  let auths: AuthorizationRequest[];
  let rawAuthIdentifiers: [Signatory, u64, bool][];
  let rawAuthIds: [u64][];
  let rawFalseBool: bool;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    signerValueToSignatoryStub = sinon.stub(utilsConversionModule, 'signerValueToSignatory');
    numberToU64Stub = sinon.stub(utilsConversionModule, 'numberToU64');
    booleanToBoolStub = sinon.stub(utilsConversionModule, 'booleanToBool');
    sinon.stub(utilsConversionModule, 'addressToKey');
  });

  let addBatchTransactionStub: sinon.SinonStub;

  beforeEach(() => {
    addBatchTransactionStub = procedureMockUtils.getAddBatchTransactionStub();
    mockContext = dsMockUtils.getContextInstance();
    rawFalseBool = dsMockUtils.createMockBool(false);
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

      rawAuthIdentifiers.push([rawSignatory, rawAuthId, rawFalseBool]);
      signerValueToSignatoryStub.withArgs(signerValue, mockContext).returns(rawSignatory);
    });
    booleanToBoolStub.withArgs(false, mockContext).returns(rawFalseBool);
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

  describe('getAuthorization', () => {
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

      const boundFunc = getAuthorization.bind(proc);
      let result = await boundFunc(args);
      expect(result).toEqual({
        identityRoles: true,
        signerPermissions: {
          tokens: [],
          portfolios: [],
          transactions: [TxTags.identity.AcceptAuthorization],
        },
      });

      args.authRequests[0].target = new Identity({ did: 'notTheCurrentIdentity' }, mockContext);
      args.accept = false;

      result = await boundFunc(args);
      expect(result).toEqual({
        identityRoles: false,
        signerPermissions: {
          tokens: [],
          portfolios: [],
          transactions: [TxTags.identity.RemoveAuthorization],
        },
      });

      args.authRequests[0].target = new Account({ address: 'someAddress' }, mockContext);

      result = await boundFunc(args);
      expect(result).toEqual({
        identityRoles: false,
        signerPermissions: {
          tokens: [],
          portfolios: [],
          transactions: [TxTags.identity.RemoveAuthorization],
        },
      });
    });
  });
});
