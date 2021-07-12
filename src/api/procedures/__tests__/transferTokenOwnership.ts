import { Option } from '@polkadot/types';
import { Moment } from '@polkadot/types/interfaces';
import { AuthorizationData, Signatory, TxTags } from 'polymesh-types/types';
import sinon from 'sinon';

import {
  getAuthorization,
  Params,
  prepareTransferTokenOwnership,
} from '~/api/procedures/transferTokenOwnership';
import { Context, SecurityToken } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { Authorization, AuthorizationType } from '~/types';
import { PolymeshTx, SignerType, SignerValue } from '~/types/internal';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/SecurityToken',
  require('~/testUtils/mocks/entities').mockSecurityTokenModule('~/api/entities/SecurityToken')
);

describe('transferTokenOwnership procedure', () => {
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
      TransferAssetOwnership: dsMockUtils.createMockTicker(ticker),
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
      .withArgs({ type: AuthorizationType.TransferAssetOwnership, value: ticker }, mockContext)
      .returns(rawAuthorizationData);
    dateToMomentStub.withArgs(expiry, mockContext).returns(rawMoment);
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

  test('should add an add authorization transaction to the queue', async () => {
    const proc = procedureMockUtils.getInstance<Params, SecurityToken>(mockContext);

    const result = await prepareTransferTokenOwnership.call(proc, args);

    sinon.assert.calledWith(
      addTransactionStub,
      transaction,
      {},
      rawSignatory,
      rawAuthorizationData,
      null
    );
    expect(result).toEqual(entityMockUtils.getSecurityTokenInstance({ ticker }));
  });

  test('should add an add authorization transaction with expiry to the queue if an expiry date was passed', async () => {
    const proc = procedureMockUtils.getInstance<Params, SecurityToken>(mockContext);

    const result = await prepareTransferTokenOwnership.call(proc, { ...args, expiry });

    sinon.assert.calledWith(
      addTransactionStub,
      transaction,
      {},
      rawSignatory,
      rawAuthorizationData,
      rawMoment
    );
    expect(result).toMatchObject(entityMockUtils.getSecurityTokenInstance({ ticker }));
  });

  describe('getAuthorization', () => {
    test('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<Params, SecurityToken>(mockContext);
      const boundFunc = getAuthorization.bind(proc);

      expect(boundFunc(args)).toEqual({
        permissions: {
          tokens: [entityMockUtils.getSecurityTokenInstance({ ticker })],
          transactions: [TxTags.identity.AddAuthorization],
          portfolios: [],
        },
      });
    });
  });
});
