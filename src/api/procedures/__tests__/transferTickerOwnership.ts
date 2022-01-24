import { Option } from '@polkadot/types';
import { Moment } from '@polkadot/types/interfaces';
import { AuthorizationData, Signatory, TxTags } from 'polymesh-types/types';
import sinon from 'sinon';

import {
  getAuthorization,
  Params,
  prepareTransferTickerOwnership,
} from '~/api/procedures/transferTickerOwnership';
import { AuthorizationRequest, Context } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import {
  Authorization,
  AuthorizationType,
  RoleType,
  SignerType,
  SignerValue,
  TickerReservationStatus,
} from '~/types';
import { PolymeshTx } from '~/types/internal';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/TickerReservation',
  require('~/testUtils/mocks/entities').mockTickerReservationModule(
    '~/api/entities/TickerReservation'
  )
);

describe('transferTickerOwnership procedure', () => {
  let mockContext: Mocked<Context>;
  let signerValueToSignatoryStub: sinon.SinonStub<[SignerValue, Context], Signatory>;
  let authorizationToAuthorizationDataStub: sinon.SinonStub<
    [Authorization, Context],
    AuthorizationData
  >;
  let dateToMomentStub: sinon.SinonStub<[Date, Context], Moment>;
  let ticker: string;
  let did: string;
  let expiry: Date;
  let rawSignatory: Signatory;
  let rawAuthorizationData: AuthorizationData;
  let rawMoment: Moment;
  let args: Params;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    signerValueToSignatoryStub = sinon.stub(utilsConversionModule, 'signerValueToSignatory');
    authorizationToAuthorizationDataStub = sinon.stub(
      utilsConversionModule,
      'authorizationToAuthorizationData'
    );
    dateToMomentStub = sinon.stub(utilsConversionModule, 'dateToMoment');
    ticker = 'someTicker';
    did = 'someOtherDid';
    expiry = new Date('10/14/3040');
    rawSignatory = dsMockUtils.createMockSignatory({
      Identity: dsMockUtils.createMockIdentityId(did),
    });
    rawAuthorizationData = dsMockUtils.createMockAuthorizationData({
      TransferTicker: dsMockUtils.createMockTicker(ticker),
    });
    rawMoment = dsMockUtils.createMockMoment(expiry.getTime());
    args = {
      ticker,
      target: did,
    };
  });

  let addTransactionStub: sinon.SinonStub;

  let transaction: PolymeshTx<[Signatory, AuthorizationData, Option<Moment>]>;

  beforeEach(() => {
    addTransactionStub = procedureMockUtils.getAddTransactionStub();

    transaction = dsMockUtils.createTxStub('identity', 'addAuthorization');

    mockContext = dsMockUtils.getContextInstance();

    signerValueToSignatoryStub
      .withArgs({ type: SignerType.Identity, value: did }, mockContext)
      .returns(rawSignatory);
    authorizationToAuthorizationDataStub
      .withArgs({ type: AuthorizationType.TransferTicker, value: ticker }, mockContext)
      .returns(rawAuthorizationData);
    dateToMomentStub.withArgs(expiry, mockContext).returns(rawMoment);
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

  test('should throw an error if a token with that ticker has already been launched', () => {
    entityMockUtils.configureMocks({
      tickerReservationOptions: {
        details: {
          owner: entityMockUtils.getIdentityInstance(),
          expiryDate: null,
          status: TickerReservationStatus.TokenCreated,
        },
      },
    });
    const proc = procedureMockUtils.getInstance<Params, AuthorizationRequest>(mockContext);

    return expect(prepareTransferTickerOwnership.call(proc, args)).rejects.toThrow(
      'A Security Token with this ticker has already been created'
    );
  });

  test('should add an add authorization transaction to the queue', async () => {
    const proc = procedureMockUtils.getInstance<Params, AuthorizationRequest>(mockContext);

    await prepareTransferTickerOwnership.call(proc, args);

    sinon.assert.calledWith(
      addTransactionStub,
      transaction,
      sinon.match({ resolvers: sinon.match.array }),
      rawSignatory,
      rawAuthorizationData,
      null
    );
  });

  test('should add an add authorization transaction to the queue if the target is an Identity', async () => {
    const identityArgs = Object.assign({}, args, {
      target: entityMockUtils.getIdentityInstance({ did }),
    });
    const proc = procedureMockUtils.getInstance<Params, AuthorizationRequest>(mockContext);

    await prepareTransferTickerOwnership.call(proc, identityArgs);

    sinon.assert.calledWith(
      addTransactionStub,
      transaction,
      sinon.match({ resolvers: sinon.match.array }),
      rawSignatory,
      rawAuthorizationData,
      null
    );
  });

  test('should add an add authorization transaction with expiry to the queue if an expiry date was passed', async () => {
    const proc = procedureMockUtils.getInstance<Params, AuthorizationRequest>(mockContext);

    await prepareTransferTickerOwnership.call(proc, { ...args, expiry });

    sinon.assert.calledWith(
      addTransactionStub,
      transaction,
      sinon.match({ resolvers: sinon.match.array }),
      rawSignatory,
      rawAuthorizationData,
      rawMoment
    );
  });

  describe('getAuthorization', () => {
    test('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<Params, AuthorizationRequest>(mockContext);
      const boundFunc = getAuthorization.bind(proc);

      expect(boundFunc(args)).toEqual({
        roles: [{ type: RoleType.TickerOwner, ticker }],
        permissions: {
          tokens: [],
          transactions: [TxTags.identity.AddAuthorization],
          portfolios: [],
        },
      });
    });
  });
});
