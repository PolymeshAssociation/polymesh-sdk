import { bool, u64 } from '@polkadot/types';
import BigNumber from 'bignumber.js';
import sinon from 'sinon';

import {
  ConsumeJoinSignerAuthorizationParams,
  getAuthorization,
  prepareConsumeJoinSignerAuthorization,
} from '~/api/procedures/consumeJoinSignerAuthorization';
import { AuthorizationRequest, Context, Identity } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { Authorization, AuthorizationType, Signer, TxTags } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

describe('consumeJoinSignerAuthorization procedure', () => {
  let mockContext: Mocked<Context>;
  let targetAddress: string;
  let numberToU64Stub: sinon.SinonStub<[number | BigNumber, Context], u64>;
  let booleanToBoolStub: sinon.SinonStub<[boolean, Context], bool>;
  let rawTrue: bool;
  let rawFalse: bool;
  let authId: BigNumber;
  let rawAuthId: u64;

  beforeAll(() => {
    targetAddress = 'someAddress';
    dsMockUtils.initMocks({
      contextOptions: {
        currentPairAddress: targetAddress,
      },
    });
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    numberToU64Stub = sinon.stub(utilsConversionModule, 'numberToU64');
    booleanToBoolStub = sinon.stub(utilsConversionModule, 'booleanToBool');
    authId = new BigNumber(1);
    rawAuthId = dsMockUtils.createMockU64(authId.toNumber());
    rawTrue = dsMockUtils.createMockBool(true);
    rawFalse = dsMockUtils.createMockBool(false);

    sinon.stub(utilsConversionModule, 'addressToKey');
  });

  let addTransactionStub: sinon.SinonStub;

  beforeEach(() => {
    addTransactionStub = procedureMockUtils.getAddTransactionStub();
    mockContext = dsMockUtils.getContextInstance();
    numberToU64Stub.withArgs(authId, mockContext).returns(rawAuthId);
    booleanToBoolStub.withArgs(true, mockContext).returns(rawTrue);
    booleanToBoolStub.withArgs(false, mockContext).returns(rawFalse);
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

  test('should throw an error if the Authorization Request is expired', async () => {
    const proc = procedureMockUtils.getInstance<ConsumeJoinSignerAuthorizationParams, void>(
      mockContext
    );

    const target = entityMockUtils.getAccountInstance({ address: 'someAddress' });

    expect(
      prepareConsumeJoinSignerAuthorization.call(proc, {
        authRequest: new AuthorizationRequest(
          {
            target,
            issuer: entityMockUtils.getIdentityInstance(),
            authId,
            expiry: new Date('10/14/1987'),
            data: {
              type: AuthorizationType.JoinIdentity,
              value: {
                tokens: null,
                transactions: null,
                transactionGroups: [],
                portfolios: null,
              },
            },
          },
          mockContext
        ),
        accept: true,
      })
    ).rejects.toThrow('The Authorization Request has expired');
  });

  test('should add a joinIdentityAsKey transaction to the queue if the target is an Account', async () => {
    const proc = procedureMockUtils.getInstance<ConsumeJoinSignerAuthorizationParams, void>(
      mockContext
    );

    const transaction = dsMockUtils.createTxStub('identity', 'joinIdentityAsKey');

    const target = entityMockUtils.getAccountInstance({ address: 'someAddress' });

    await prepareConsumeJoinSignerAuthorization.call(proc, {
      authRequest: new AuthorizationRequest(
        {
          target,
          issuer: entityMockUtils.getIdentityInstance(),
          authId,
          expiry: null,
          data: {
            type: AuthorizationType.JoinIdentity,
            value: {
              tokens: null,
              transactions: null,
              transactionGroups: [],
              portfolios: null,
            },
          },
        },
        mockContext
      ),
      accept: true,
    });

    sinon.assert.calledWith(addTransactionStub, transaction, { paidByThirdParty: true }, rawAuthId);
  });

  test('should add a acceptMultisigSignerAsKey transaction to the queue if the target is an Account', async () => {
    const proc = procedureMockUtils.getInstance<ConsumeJoinSignerAuthorizationParams, void>(
      mockContext
    );

    const transaction = dsMockUtils.createTxStub('multiSig', 'acceptMultisigSignerAsKey');

    const target = entityMockUtils.getAccountInstance({ address: 'someAddress' });

    await prepareConsumeJoinSignerAuthorization.call(proc, {
      authRequest: new AuthorizationRequest(
        {
          target,
          issuer: entityMockUtils.getIdentityInstance(),
          authId,
          expiry: null,
          data: {
            type: AuthorizationType.AddMultiSigSigner,
            value: 'someAccount',
          },
        },
        mockContext
      ),
      accept: true,
    });

    sinon.assert.calledWith(addTransactionStub, transaction, { paidByThirdParty: true }, rawAuthId);
  });

  test('should add a joinIdentityAsIdentity transaction to the queue if the target is an Identity', async () => {
    const proc = procedureMockUtils.getInstance<ConsumeJoinSignerAuthorizationParams, void>(
      mockContext
    );

    const transaction = dsMockUtils.createTxStub('identity', 'joinIdentityAsIdentity');

    const target = new Identity({ did: 'someOtherDid' }, mockContext);

    await prepareConsumeJoinSignerAuthorization.call(proc, {
      authRequest: new AuthorizationRequest(
        {
          target,
          issuer: entityMockUtils.getIdentityInstance(),
          authId,
          expiry: null,
          data: {
            type: AuthorizationType.JoinIdentity,
            value: {
              tokens: null,
              transactions: null,
              transactionGroups: [],
              portfolios: null,
            },
          },
        },
        mockContext
      ),
      accept: true,
    });

    sinon.assert.calledWith(addTransactionStub, transaction, { paidByThirdParty: true }, rawAuthId);
  });

  test('should add a acceptMultisigSignerAsIdentity transaction to the queue if the target is an Identity', async () => {
    const proc = procedureMockUtils.getInstance<ConsumeJoinSignerAuthorizationParams, void>(
      mockContext
    );

    const transaction = dsMockUtils.createTxStub('multiSig', 'acceptMultisigSignerAsIdentity');

    const target = new Identity({ did: 'someOtherDid' }, mockContext);

    await prepareConsumeJoinSignerAuthorization.call(proc, {
      authRequest: new AuthorizationRequest(
        {
          target,
          issuer: entityMockUtils.getIdentityInstance(),
          authId,
          expiry: null,
          data: {
            type: AuthorizationType.AddMultiSigSigner,
            value: 'someAccount',
          },
        },
        mockContext
      ),
      accept: true,
    });

    sinon.assert.calledWith(addTransactionStub, transaction, { paidByThirdParty: true }, rawAuthId);
  });

  test('should add a removeAuthorization transaction to the queue if accept is set to false', async () => {
    const proc = procedureMockUtils.getInstance<ConsumeJoinSignerAuthorizationParams, void>(
      mockContext
    );

    const transaction = dsMockUtils.createTxStub('identity', 'removeAuthorization');

    let target: Signer = new Identity({ did: 'someOtherDid' }, mockContext);

    const rawSignatory = dsMockUtils.createMockSignatory({
      Identity: dsMockUtils.createMockIdentityId(target.did),
    });

    sinon.stub(utilsConversionModule, 'signerValueToSignatory').returns(rawSignatory);

    await prepareConsumeJoinSignerAuthorization.call(proc, {
      authRequest: new AuthorizationRequest(
        {
          target,
          issuer: entityMockUtils.getIdentityInstance(),
          authId,
          expiry: null,
          data: {
            type: AuthorizationType.JoinIdentity,
            value: {
              tokens: null,
              transactions: null,
              transactionGroups: [],
              portfolios: null,
            },
          },
        },
        mockContext
      ),
      accept: false,
    });

    sinon.assert.calledWith(
      addTransactionStub,
      transaction,
      { paidByThirdParty: false },
      rawSignatory,
      rawAuthId,
      rawFalse
    );

    target = entityMockUtils.getAccountInstance({ address: targetAddress });

    await prepareConsumeJoinSignerAuthorization.call(proc, {
      authRequest: new AuthorizationRequest(
        {
          target,
          issuer: entityMockUtils.getIdentityInstance(),
          authId,
          expiry: null,
          data: {
            type: AuthorizationType.JoinIdentity,
            value: {
              tokens: null,
              transactions: null,
              transactionGroups: [],
              portfolios: null,
            },
          },
        },
        mockContext
      ),
      accept: false,
    });

    sinon.assert.calledWith(
      addTransactionStub,
      transaction,
      { paidByThirdParty: true },
      rawSignatory,
      rawAuthId,
      rawTrue
    );
  });

  describe('getAuthorization', () => {
    test('should return the appropriate roles and permissions', async () => {
      const proc = procedureMockUtils.getInstance<ConsumeJoinSignerAuthorizationParams, void>(
        mockContext
      );
      const { address } = mockContext.getCurrentAccount();
      const constructorParams = {
        authId,
        expiry: null,
        target: entityMockUtils.getAccountInstance({ address }),
        issuer: new Identity({ did: 'issuerDid1' }, mockContext),
        data: {
          type: AuthorizationType.JoinIdentity,
        } as Authorization,
      };
      const args = {
        authRequest: new AuthorizationRequest(constructorParams, mockContext),
        accept: true,
      };

      const boundFunc = getAuthorization.bind(proc);
      let result = await boundFunc(args);
      expect(result).toEqual({
        roles: true,
      });

      args.authRequest.target = new Identity({ did: 'notTheCurrentIdentity' }, mockContext);

      result = await boundFunc(args);
      expect(result).toEqual({
        roles: false,
        permissions: {
          tokens: [],
          portfolios: [],
          transactions: [TxTags.identity.JoinIdentityAsIdentity],
        },
      });

      args.authRequest.data.type = AuthorizationType.AddMultiSigSigner;

      result = await boundFunc(args);
      expect(result).toEqual({
        roles: false,
        permissions: {
          tokens: [],
          portfolios: [],
          transactions: [TxTags.multiSig.AcceptMultisigSignerAsIdentity],
        },
      });

      args.accept = false;
      args.authRequest.issuer = await mockContext.getCurrentIdentity();

      result = await boundFunc(args);
      expect(result).toEqual({
        roles: true,
        permissions: {
          tokens: [],
          portfolios: [],
          transactions: [TxTags.identity.RemoveAuthorization],
        },
      });

      mockContext.getCurrentAccount.returns(
        entityMockUtils.getAccountInstance({ getIdentity: null })
      );

      result = await boundFunc(args);
      expect(result).toEqual({
        roles: false,
        permissions: {
          tokens: [],
          portfolios: [],
          transactions: [TxTags.identity.RemoveAuthorization],
        },
      });
    });
  });
});
