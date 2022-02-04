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
import { Authorization, AuthorizationType, SignerValue } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Asset',
  require('~/testUtils/mocks/entities').mockAssetModule('~/api/entities/Asset')
);

jest.mock(
  '~/api/entities/TickerReservation',
  require('~/testUtils/mocks/entities').mockTickerReservationModule(
    '~/api/entities/TickerReservation'
  )
);

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

  let acceptAssetOwnershipTransferTransaction: sinon.SinonStub;
  let acceptPayingKeyTransaction: sinon.SinonStub;
  let acceptPrimaryKeyTransaction: sinon.SinonStub;
  let acceptBecomeAgentTransaction: sinon.SinonStub;
  let acceptPortfolioCustodyTransaction: sinon.SinonStub;
  let acceptTickerTransferTransaction: sinon.SinonStub;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    signerValueToSignatoryStub = sinon.stub(utilsConversionModule, 'signerValueToSignatory');
    numberToU64Stub = sinon.stub(utilsConversionModule, 'numberToU64');
    booleanToBoolStub = sinon.stub(utilsConversionModule, 'booleanToBool');
    sinon.stub(utilsConversionModule, 'addressToKey');
    dsMockUtils.createQueryStub('identity', 'authorizations', {
      returnValue: dsMockUtils.createMockOption(
        dsMockUtils.createMockAuthorization({
          /* eslint-disable @typescript-eslint/naming-convention */
          authorization_data: dsMockUtils.createMockAuthorizationData('RotatePrimaryKey'),
          auth_id: 1,
          authorized_by: 'someDid',
          expiry: dsMockUtils.createMockOption(),
          /* eslint-enable @typescript-eslint/naming-convention */
        })
      ),
    });
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
        target: entityMockUtils.getIdentityInstance({ did: 'targetDid1' }),
        issuer: entityMockUtils.getIdentityInstance({ did: 'issuerDid1' }),
        data: {
          type: AuthorizationType.TransferAssetOwnership,
          value: 'SOME_TICKER1',
        },
      },
      {
        authId: new BigNumber(2),
        expiry: null,
        target: entityMockUtils.getAccountInstance({ address: 'targetAddress2' }),
        issuer: entityMockUtils.getIdentityInstance({ did: 'issuerDid2' }),
        data: {
          type: AuthorizationType.AddRelayerPayingKey,
          value: {
            beneficiary: entityMockUtils.getAccountInstance({ address: 'targetAddress2' }),
            subsidizer: entityMockUtils.getAccountInstance({ address: 'payingKey' }),
            allowance: new BigNumber(1000),
          },
        },
      },
      {
        authId: new BigNumber(3),
        expiry: null,
        target: entityMockUtils.getAccountInstance({ address: 'targetAddress3' }),
        issuer: entityMockUtils.getIdentityInstance({ did: 'issuerDid3' }),
        data: {
          type: AuthorizationType.RotatePrimaryKey,
        },
      },
      {
        authId: new BigNumber(4),
        expiry: null,
        target: entityMockUtils.getIdentityInstance({ did: 'targetDid4' }),
        issuer: entityMockUtils.getIdentityInstance({ did: 'issuerDid4' }),
        data: {
          type: AuthorizationType.BecomeAgent,
          value: entityMockUtils.getKnownPermissionGroupInstance(),
        },
      },
      {
        authId: new BigNumber(5),
        expiry: null,
        target: entityMockUtils.getIdentityInstance({ did: 'targetDid5' }),
        issuer: entityMockUtils.getIdentityInstance({ did: 'issuerDid5' }),
        data: {
          type: AuthorizationType.PortfolioCustody,
          value: entityMockUtils.getDefaultPortfolioInstance({ did: 'issuerDid5' }),
        },
      },
      {
        authId: new BigNumber(6),
        expiry: null,
        target: entityMockUtils.getIdentityInstance({ did: 'targetDid6' }),
        issuer: entityMockUtils.getIdentityInstance({ did: 'issuerDid6' }),
        data: {
          type: AuthorizationType.TransferTicker,
          value: 'SOME_TICKER6',
        },
      },
      {
        authId: new BigNumber(7),
        expiry: new Date('10/14/1987'), // expired
        target: entityMockUtils.getIdentityInstance({ did: 'targetDid7' }),
        issuer: entityMockUtils.getIdentityInstance({ did: 'issuerDid7' }),
        data: {
          type: AuthorizationType.TransferAssetOwnership,
          value: 'SOME_TICKER7',
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

    acceptAssetOwnershipTransferTransaction = dsMockUtils.createTxStub(
      'asset',
      'acceptAssetOwnershipTransfer'
    );
    acceptPayingKeyTransaction = dsMockUtils.createTxStub('relayer', 'acceptPayingKey');
    acceptPrimaryKeyTransaction = dsMockUtils.createTxStub('identity', 'acceptPrimaryKey');
    acceptBecomeAgentTransaction = dsMockUtils.createTxStub('externalAgents', 'acceptBecomeAgent');
    acceptPortfolioCustodyTransaction = dsMockUtils.createTxStub(
      'portfolio',
      'acceptPortfolioCustody'
    );
    acceptTickerTransferTransaction = dsMockUtils.createTxStub('asset', 'acceptTickerTransfer');
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

  test('should add a batch of accept authorization transactions (dependent on the type of auth) to the queue and ignore expired requests', async () => {
    const proc = procedureMockUtils.getInstance<ConsumeAuthorizationRequestsParams, void>(
      mockContext
    );

    await prepareConsumeAuthorizationRequests.call(proc, {
      accept: true,
      authRequests: auths,
    });

    sinon.assert.calledWith(addBatchTransactionStub, {
      transactions: [
        {
          transaction: acceptAssetOwnershipTransferTransaction,
          args: rawAuthIds[0],
        },
      ],
    });
    sinon.assert.calledWith(addBatchTransactionStub, {
      transactions: [
        {
          transaction: acceptPayingKeyTransaction,
          args: rawAuthIds[1],
        },
      ],
    });
    sinon.assert.calledWith(addBatchTransactionStub, {
      transactions: [
        {
          transaction: acceptPrimaryKeyTransaction,
          args: [rawAuthIds[2][0], null],
        },
      ],
    });
    sinon.assert.calledWith(addBatchTransactionStub, {
      transactions: [
        {
          transaction: acceptBecomeAgentTransaction,
          args: rawAuthIds[3],
        },
      ],
    });
    sinon.assert.calledWith(addBatchTransactionStub, {
      transactions: [
        {
          transaction: acceptPortfolioCustodyTransaction,
          args: rawAuthIds[4],
        },
      ],
    });
    sinon.assert.calledWith(addBatchTransactionStub, {
      transactions: [
        {
          transaction: acceptTickerTransferTransaction,
          args: rawAuthIds[5],
        },
      ],
    });
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

    sinon.assert.calledWith(addBatchTransactionStub, {
      transactions: authIds.map(authId => ({ transaction, args: authId })),
    });
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
          target: entityMockUtils.getIdentityInstance({ did }),
          issuer: entityMockUtils.getIdentityInstance({ did: 'issuerDid1' }),
          data: {
            type: AuthorizationType.BecomeAgent,
          } as Authorization,
        },
        {
          authId: new BigNumber(2),
          expiry: new Date('10/14/1987'), // expired
          target: entityMockUtils.getIdentityInstance({ did: 'notTheCurrentIdentity' }),
          issuer: entityMockUtils.getIdentityInstance({ did: 'issuerDid2' }),
          data: {
            type: AuthorizationType.PortfolioCustody,
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
        roles: true,
        permissions: {
          assets: [],
          portfolios: [],
          transactions: [
            TxTags.externalAgents.AcceptBecomeAgent,
            TxTags.portfolio.AcceptPortfolioCustody,
          ],
        },
      });

      args.authRequests[0].target = entityMockUtils.getIdentityInstance({
        did: 'notTheCurrentIdentity',
      });
      args.accept = false;

      result = await boundFunc(args);
      expect(result).toEqual({
        roles:
          'Authorization Requests can only be accepted by the target Account/Identity. They can only be rejected by the target Account/Identity or the issuing Identity',
        permissions: {
          assets: [],
          portfolios: [],
          transactions: [TxTags.identity.RemoveAuthorization],
        },
      });

      args.authRequests[0].target = entityMockUtils.getAccountInstance({ address: 'someAddress' });

      result = await boundFunc(args);
      expect(result).toEqual({
        roles:
          'Authorization Requests can only be accepted by the target Account/Identity. They can only be rejected by the target Account/Identity or the issuing Identity',
        permissions: {
          assets: [],
          portfolios: [],
          transactions: [TxTags.identity.RemoveAuthorization],
        },
      });
    });
  });
});
