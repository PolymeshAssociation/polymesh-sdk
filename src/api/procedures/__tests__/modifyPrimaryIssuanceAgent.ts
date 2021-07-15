import { Moment } from '@polkadot/types/interfaces';
import { AuthorizationData, Signatory, Ticker, TxTags } from 'polymesh-types/types';
import sinon from 'sinon';

import {
  getAuthorization,
  Params,
  prepareModifyPrimaryIssuanceAgent,
} from '~/api/procedures/modifyPrimaryIssuanceAgent';
import { Account, Context, Identity } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { Authorization, SignerValue } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

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

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    authorizationToAuthorizationDataStub = sinon.stub(
      utilsConversionModule,
      'authorizationToAuthorizationData'
    );
    dateToMomentStub = sinon.stub(utilsConversionModule, 'dateToMoment');
    signerToStringStub = sinon.stub(utilsConversionModule, 'signerToString');
    signerValueToSignatoryStub = sinon.stub(utilsConversionModule, 'signerValueToSignatory');
    ticker = 'someTicker';
    rawTicker = dsMockUtils.createMockTicker(ticker);
    target = 'someDid';
    rawSignatory = dsMockUtils.createMockSignatory({
      Identity: dsMockUtils.createMockIdentityId(target),
    });
    rawAuthorizationData = dsMockUtils.createMockAuthorizationData({
      TransferAssetOwnership: rawTicker,
    });
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    authorizationToAuthorizationDataStub.returns(rawAuthorizationData);
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

  test('should throw an error if the primary issuance agents list is not empty', () => {
    const args = {
      target,
      ticker,
      requestExpiry: new Date(),
    };

    entityMockUtils.configureMocks({
      securityTokenOptions: {
        details: {
          primaryIssuanceAgents: [new Identity({ did: 'otherDid' }, mockContext)],
        },
      },
    });

    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    return expect(prepareModifyPrimaryIssuanceAgent.call(proc, args)).rejects.toThrow(
      'The Primary Issuance Agents must be undefined to perform this procedure'
    );
  });

  test("should throw an error if the supplied target doesn't exist", () => {
    const args = {
      target,
      ticker,
    };

    dsMockUtils.configureMocks({ contextOptions: { invalidDids: [target] } });

    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    return expect(prepareModifyPrimaryIssuanceAgent.call(proc, args)).rejects.toThrow(
      'The supplied Identity does not exist'
    );
  });

  test('should throw an error if the supplied expiry date is not a future date', () => {
    const args = {
      target,
      ticker,
      requestExpiry: new Date(),
    };

    entityMockUtils.configureMocks({
      securityTokenOptions: {
        details: {
          primaryIssuanceAgents: [],
        },
      },
    });

    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    return expect(prepareModifyPrimaryIssuanceAgent.call(proc, args)).rejects.toThrow(
      'The request expiry must be a future date'
    );
  });

  test('should add a add authorization transaction to the queue', async () => {
    const args = {
      target,
      ticker,
    };
    const requestExpiry = new Date('12/12/2050');
    const rawExpiry = dsMockUtils.createMockMoment(requestExpiry.getTime());

    dateToMomentStub.withArgs(requestExpiry, mockContext).returns(rawExpiry);

    entityMockUtils.configureMocks({
      securityTokenOptions: {
        details: {
          primaryIssuanceAgents: [],
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
          primaryIssuanceAgents: [],
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

    await prepareModifyPrimaryIssuanceAgent.call(proc, {
      ...args,
      requestExpiry,
    });

    sinon.assert.calledWith(
      addTransactionStub,
      transaction,
      {},
      rawSignatory,
      rawAuthorizationData,
      rawExpiry
    );
  });

  describe('getAuthorization', () => {
    test('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<Params, void>(mockContext);
      const boundFunc = getAuthorization.bind(proc);
      const args = {
        ticker,
      } as Params;

      expect(boundFunc(args)).toEqual({
        permissions: {
          portfolios: [],
          transactions: [TxTags.identity.AddAuthorization],
          tokens: [entityMockUtils.getSecurityTokenInstance({ ticker })],
        },
      });
    });
  });
});
