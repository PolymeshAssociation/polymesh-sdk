import { Moment } from '@polkadot/types/interfaces';
import { AuthorizationData, Signatory, Ticker } from 'polymesh-types/types';
import sinon from 'sinon';

import { Account, Identity } from '~/api/entities';
import {
  getRequiredRoles,
  Params,
  prepareModifyPrimaryIssuanceAgent,
} from '~/api/procedures/modifyPrimaryIssuanceAgent';
import { Context } from '~/base';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { Authorization, RoleType } from '~/types';
import { SignerValue } from '~/types/internal';
import * as utilsModule from '~/utils';

jest.mock(
  '~/api/entities/SecurityToken',
  require('~/testUtils/mocks/entities').mockSecurityTokenModule('~/api/entities/SecurityToken')
);

describe('modifyPrimaryIssuanceAgent procedure', () => {
  let mockContext: Mocked<Context>;
  let authorizationToAuthorizationDataStub: sinon.SinonStub<
    [Authorization, Context],
    AuthorizationData
  >;
  let dateToMomentStub: sinon.SinonStub<[Date, Context], Moment>;
  let signerToStringStub: sinon.SinonStub<[string | Identity | Account], string>;
  let signerValueToSignatoryStub: sinon.SinonStub<[SignerValue, Context], Signatory>;
  let ticker: string;
  let rawTicker: Ticker;
  let target: string;
  let addTransactionStub: sinon.SinonStub;
  let rawSignatory: Signatory;
  let rawAuthorizationData: AuthorizationData;
  let rawExpiry: Moment;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    authorizationToAuthorizationDataStub = sinon.stub(
      utilsModule,
      'authorizationToAuthorizationData'
    );
    dateToMomentStub = sinon.stub(utilsModule, 'dateToMoment');
    signerToStringStub = sinon.stub(utilsModule, 'signerToString');
    signerValueToSignatoryStub = sinon.stub(utilsModule, 'signerValueToSignatory');
    ticker = 'someTicker';
    rawTicker = dsMockUtils.createMockTicker(ticker);
    target = 'someDid';
    rawSignatory = dsMockUtils.createMockSignatory({
      Identity: dsMockUtils.createMockIdentityId(target),
    });
    rawAuthorizationData = dsMockUtils.createMockAuthorizationData({
      TransferAssetOwnership: rawTicker,
    });
    rawExpiry = dsMockUtils.createMockMoment(123456789);
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    authorizationToAuthorizationDataStub.returns(rawAuthorizationData);
    dateToMomentStub.returns(rawExpiry);
    signerToStringStub.returns(target);
    signerValueToSignatoryStub.returns(rawSignatory);
    addTransactionStub = procedureMockUtils.getAddTransactionStub();
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

  test("should throw an error if the supplied target don't exist", () => {
    const args = {
      target,
      ticker,
    };

    dsMockUtils.configureMocks({ contextOptions: { invalidDids: [target] } });

    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    return expect(prepareModifyPrimaryIssuanceAgent.call(proc, args)).rejects.toThrow(
      'The supplied Identity do not exist'
    );
  });

  test('should throw an error if the supplied target is currently the primary issuance agent', () => {
    const args = {
      target,
      ticker,
    };

    entityMockUtils.configureMocks({
      securityTokenOptions: {
        details: {
          primaryIssuanceAgent: new Identity({ did: target }, mockContext),
        },
      },
    });

    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    return expect(prepareModifyPrimaryIssuanceAgent.call(proc, args)).rejects.toThrow(
      'The supplied Identity is currently the primary issuance agent'
    );
  });

  test('should add a add authorization transaction to the queue', async () => {
    const args = {
      target,
      ticker,
    };

    entityMockUtils.configureMocks({
      securityTokenOptions: {
        details: {
          primaryIssuanceAgent: null,
        },
      },
    });

    const transaction = dsMockUtils.createTxStub('identity', 'addAuthorization');
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    await prepareModifyPrimaryIssuanceAgent.call(proc, args);

    sinon.assert.calledWith(
      addTransactionStub,
      transaction,
      {},
      rawSignatory,
      rawAuthorizationData,
      null
    );

    entityMockUtils.configureMocks({
      securityTokenOptions: {
        details: {
          primaryIssuanceAgent: new Identity({ did: 'fakeIdentity' }, mockContext),
        },
      },
    });

    await prepareModifyPrimaryIssuanceAgent.call(proc, args);

    sinon.assert.calledWith(
      addTransactionStub,
      transaction,
      {},
      rawSignatory,
      rawAuthorizationData,
      null
    );

    await prepareModifyPrimaryIssuanceAgent.call(proc, { ...args, expiry: new Date() });

    sinon.assert.calledWith(
      addTransactionStub,
      transaction,
      {},
      rawSignatory,
      rawAuthorizationData,
      rawExpiry
    );
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
