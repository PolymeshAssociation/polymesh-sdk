import { Option } from '@polkadot/types';
import { Moment } from '@polkadot/types/interfaces';
import BigNumber from 'bignumber.js';
import { AuthorizationData, Signatory, TxTags } from 'polymesh-types/types';
import sinon from 'sinon';

import {
  getAuthorization,
  Params,
  prepareTransferAssetOwnership,
} from '~/api/procedures/transferAssetOwnership';
import { AuthorizationRequest, Context } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { Authorization, AuthorizationType, SignerType, SignerValue } from '~/types';
import { PolymeshTx } from '~/types/internal';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Asset',
  require('~/testUtils/mocks/entities').mockAssetModule('~/api/entities/Asset')
);

describe('transferAssetOwnership procedure', () => {
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
    rawMoment = dsMockUtils.createMockMoment(new BigNumber(expiry.getTime()));
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
    const proc = procedureMockUtils.getInstance<Params, AuthorizationRequest>(mockContext);

    await prepareTransferAssetOwnership.call(proc, args);

    sinon.assert.calledWith(
      addTransactionStub,
      sinon.match({
        transaction,
        resolvers: sinon.match.array,
        args: [rawSignatory, rawAuthorizationData, null],
      })
    );
  });

  test('should add an add authorization transaction with expiry to the queue if an expiry date was passed', async () => {
    const proc = procedureMockUtils.getInstance<Params, AuthorizationRequest>(mockContext);

    await prepareTransferAssetOwnership.call(proc, { ...args, expiry });

    sinon.assert.calledWith(
      addTransactionStub,
      sinon.match({
        transaction,
        resolvers: sinon.match.array,
        args: [rawSignatory, rawAuthorizationData, rawMoment],
      })
    );
  });

  describe('getAuthorization', () => {
    test('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<Params, AuthorizationRequest>(mockContext);
      const boundFunc = getAuthorization.bind(proc);

      expect(boundFunc(args)).toEqual({
        permissions: {
          assets: [entityMockUtils.getAssetInstance({ ticker })],
          transactions: [TxTags.identity.AddAuthorization],
          portfolios: [],
        },
      });
    });
  });
});
