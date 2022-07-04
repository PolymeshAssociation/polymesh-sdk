import { Moment } from '@polkadot/types/interfaces';
import { PolymeshPrimitivesAuthorizationAuthorizationData } from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import { Signatory, Ticker } from 'polymesh-types/types';
import sinon from 'sinon';

import {
  getAuthorization,
  Params,
  prepareModifyPrimaryIssuanceAgent,
} from '~/api/procedures/modifyPrimaryIssuanceAgent';
import { Account, Context, Identity } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { Authorization, SignerValue, TxTags } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Asset',
  require('~/testUtils/mocks/entities').mockAssetModule('~/api/entities/Asset')
);

describe('modifyPrimaryIssuanceAgent procedure', () => {
  let mockContext: Mocked<Context>;
  let authorizationToAuthorizationDataStub: sinon.SinonStub<
    [Authorization, Context],
    PolymeshPrimitivesAuthorizationAuthorizationData
  >;
  let dateToMomentStub: sinon.SinonStub<[Date, Context], Moment>;
  let signerToStringStub: sinon.SinonStub<[string | Identity | Account], string>;
  let signerValueToSignatoryStub: sinon.SinonStub<[SignerValue, Context], Signatory>;
  let ticker: string;
  let rawTicker: Ticker;
  let target: string;
  let rawSignatory: Signatory;
  let rawAuthorizationData: PolymeshPrimitivesAuthorizationAuthorizationData;

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
    ticker = 'SOME_TICKER';
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

  it('should throw an error if the primary issuance agents list is not empty', () => {
    const args = {
      target,
      ticker,
      requestExpiry: new Date(),
    };

    entityMockUtils.configureMocks({
      assetOptions: {
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

  it("should throw an error if the supplied target doesn't exist", () => {
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

  it('should throw an error if the supplied expiry date is not a future date', () => {
    const args = {
      target,
      ticker,
      requestExpiry: new Date(),
    };

    entityMockUtils.configureMocks({
      assetOptions: {
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

  it('should return a add authorization transaction spec', async () => {
    const args = {
      target,
      ticker,
    };
    const requestExpiry = new Date('12/12/2050');
    const rawExpiry = dsMockUtils.createMockMoment(new BigNumber(requestExpiry.getTime()));

    dateToMomentStub.withArgs(requestExpiry, mockContext).returns(rawExpiry);

    entityMockUtils.configureMocks({
      assetOptions: {
        details: {
          primaryIssuanceAgents: [],
        },
      },
    });

    const transaction = dsMockUtils.createTxStub('identity', 'addAuthorization');
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    let result = await prepareModifyPrimaryIssuanceAgent.call(proc, args);

    expect(result).toEqual({
      transaction,
      args: [rawSignatory, rawAuthorizationData, null],
      resolver: undefined,
    });

    entityMockUtils.configureMocks({
      assetOptions: {
        details: {
          primaryIssuanceAgents: [],
        },
      },
    });

    result = await prepareModifyPrimaryIssuanceAgent.call(proc, args);

    expect(result).toEqual({
      transaction,
      args: [rawSignatory, rawAuthorizationData, null],
      resolver: undefined,
    });

    result = await prepareModifyPrimaryIssuanceAgent.call(proc, {
      ...args,
      requestExpiry,
    });

    expect(result).toEqual({
      transaction,
      args: [rawSignatory, rawAuthorizationData, rawExpiry],
      resolver: undefined,
    });
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<Params, void>(mockContext);
      const boundFunc = getAuthorization.bind(proc);
      const args = {
        ticker,
      } as Params;

      expect(boundFunc(args)).toEqual({
        permissions: {
          portfolios: [],
          transactions: [TxTags.identity.AddAuthorization],
          assets: [expect.objectContaining({ ticker })],
        },
      });
    });
  });
});
