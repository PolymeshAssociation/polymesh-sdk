import { Option } from '@polkadot/types';
import { Moment } from '@polkadot/types/interfaces';
import BigNumber from 'bignumber.js';
import { AuthorizationData, Signatory } from 'polymesh-types/types';
import sinon from 'sinon';

import { SecurityToken } from '~/api/entities';
import {
  getRequiredRoles,
  Params,
  prepareTransferTokenOwnership,
} from '~/api/procedures/transferTokenOwnership';
import { Context } from '~/context';
import { entityMockUtils, polkadotMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { Authorization, AuthorizationType, RoleType, TickerReservationStatus } from '~/types';
import { PolymeshTx, Signer, SignerType } from '~/types/internal';
import * as utilsModule from '~/utils';

describe('transferTokenOwnership procedure', () => {
  let mockContext: Mocked<Context>;
  let signerToSignatoryStub: sinon.SinonStub<[Signer, Context], Signatory>;
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
    polkadotMockUtils.initMocks({ contextOptions: { balance: new BigNumber(500) } });
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    signerToSignatoryStub = sinon.stub(utilsModule, 'signerToSignatory');
    authorizationToAuthorizationDataStub = sinon.stub(
      utilsModule,
      'authorizationToAuthorizationData'
    );
    dateToMomentStub = sinon.stub(utilsModule, 'dateToMoment');
    ticker = 'someTicker';
    did = 'someOtherDid';
    expiry = new Date('10/14/3040');
    rawSignatory = polkadotMockUtils.createMockSignatory({
      identity: polkadotMockUtils.createMockIdentityId(did),
    });
    rawAuthorizationData = polkadotMockUtils.createMockAuthorizationData({
      transferTokenOwnership: polkadotMockUtils.createMockTicker(ticker),
    });
    rawMoment = polkadotMockUtils.createMockMoment(expiry.getTime());
    args = {
      ticker,
      did,
    };
  });

  let addTransactionStub: sinon.SinonStub;

  let transaction: PolymeshTx<[Signatory, AuthorizationData, Option<Moment>]>;

  beforeEach(() => {
    addTransactionStub = procedureMockUtils.getAddTransactionStub();

    entityMockUtils.getTickerReservationDetailsStub().resolves({
      owner: entityMockUtils.getIdentityInstance(),
      expiryDate: null,
      status: TickerReservationStatus.Free,
    });

    transaction = polkadotMockUtils.createTxStub('identity', 'addAuthorization');

    mockContext = polkadotMockUtils.getContextInstance();

    signerToSignatoryStub
      .withArgs({ type: SignerType.Identity, value: did }, mockContext)
      .returns(rawSignatory);
    authorizationToAuthorizationDataStub
      .withArgs({ type: AuthorizationType.TransferTokenOwnership, value: ticker }, mockContext)
      .returns(rawAuthorizationData);
    dateToMomentStub.withArgs(expiry, mockContext).returns(rawMoment);
  });

  afterEach(() => {
    entityMockUtils.reset();
    procedureMockUtils.reset();
    polkadotMockUtils.reset();
  });

  afterAll(() => {
    entityMockUtils.cleanup();
    procedureMockUtils.cleanup();
    polkadotMockUtils.cleanup();
  });

  test('should add an add authorization transaction to the queue', async () => {
    const proc = procedureMockUtils.getInstance<Params, SecurityToken>();
    proc.context = mockContext;

    const result = await prepareTransferTokenOwnership.call(proc, args);

    sinon.assert.calledWith(
      addTransactionStub,
      transaction,
      {},
      rawSignatory,
      rawAuthorizationData,
      null
    );
    expect(result).toMatchObject(new SecurityToken({ ticker }, mockContext));
  });

  test('should add an add authorization transaction with expiry to the queue if an expiry date was passed', async () => {
    const proc = procedureMockUtils.getInstance<Params, SecurityToken>();
    proc.context = mockContext;

    const result = await prepareTransferTokenOwnership.call(proc, { ...args, expiry });

    sinon.assert.calledWith(
      addTransactionStub,
      transaction,
      {},
      rawSignatory,
      rawAuthorizationData,
      rawMoment
    );
    expect(result).toMatchObject(new SecurityToken({ ticker }, mockContext));
  });
});

describe('getRequiredRoles', () => {
  test('should return a token owner role', () => {
    const ticker = 'someTicker';
    const args = {
      ticker,
    } as Params;

    expect(getRequiredRoles(args)).toEqual([{ type: RoleType.TokenOwner, ticker }]);
  });
});
