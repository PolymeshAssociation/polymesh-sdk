import { Option } from '@polkadot/types';
import { Moment } from '@polkadot/types/interfaces';
import { PolymeshPrimitivesAuthorizationAuthorizationData } from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import { AuthorizationData, Signatory } from 'polymesh-types/types';
import sinon from 'sinon';

import {
  getAuthorization,
  Params,
  prepareTransferAssetOwnership,
} from '~/api/procedures/transferAssetOwnership';
import { AuthorizationRequest, Context } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { Authorization, AuthorizationType, SignerType, SignerValue, TxTags } from '~/types';
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
    PolymeshPrimitivesAuthorizationAuthorizationData
  >;
  let dateToMomentStub: sinon.SinonStub<[Date, Context], Moment>;
  let ticker: string;
  let did: string;
  let expiry: Date;
  let rawSignatory: Signatory;
  let rawAuthorizationData: PolymeshPrimitivesAuthorizationAuthorizationData;
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
    ticker = 'SOME_TICKER';
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

  let transaction: PolymeshTx<[Signatory, AuthorizationData, Option<Moment>]>;

  beforeEach(() => {
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
    procedureMockUtils.cleanup();
    dsMockUtils.cleanup();
  });

  it('should return an add authorization transaction spec', async () => {
    const proc = procedureMockUtils.getInstance<Params, AuthorizationRequest>(mockContext);

    const result = await prepareTransferAssetOwnership.call(proc, args);

    expect(result).toEqual({
      transaction,
      args: [rawSignatory, rawAuthorizationData, null],
      resolver: expect.any(Function),
    });
  });

  it('should return an add authorization transaction with expiry spec if an expiry date was passed', async () => {
    const proc = procedureMockUtils.getInstance<Params, AuthorizationRequest>(mockContext);

    const result = await prepareTransferAssetOwnership.call(proc, { ...args, expiry });

    expect(result).toEqual({
      transaction,
      args: [rawSignatory, rawAuthorizationData, rawMoment],
      resolver: expect.any(Function),
    });
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<Params, AuthorizationRequest>(mockContext);
      const boundFunc = getAuthorization.bind(proc);

      expect(boundFunc(args)).toEqual({
        permissions: {
          assets: [expect.objectContaining({ ticker })],
          transactions: [TxTags.identity.AddAuthorization],
          portfolios: [],
        },
      });
    });
  });
});
