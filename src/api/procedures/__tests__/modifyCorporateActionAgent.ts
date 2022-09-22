import { Moment } from '@polkadot/types/interfaces';
import { PolymeshPrimitivesAuthorizationAuthorizationData } from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';
import { AgentGroup, Signatory, Ticker } from 'polymesh-types/types';

import {
  getAuthorization,
  Params,
  prepareModifyCorporateActionsAgent,
} from '~/api/procedures/modifyCorporateActionsAgent';
import { Account, Context, Identity } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { Authorization, SignerValue, TxTags } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Asset',
  require('~/testUtils/mocks/entities').mockAssetModule('~/api/entities/Asset')
);

describe('modifyCorporateActionAgent procedure', () => {
  let mockContext: Mocked<Context>;
  let authorizationToAuthorizationDataStub: jest.SpyInstance<
    PolymeshPrimitivesAuthorizationAuthorizationData,
    [Authorization, Context]
  >;
  let dateToMomentStub: jest.SpyInstance<Moment, [Date, Context]>;
  let signerToStringStub: jest.SpyInstance<string, [string | Identity | Account]>;
  let signerValueToSignatoryStub: jest.SpyInstance<Signatory, [SignerValue, Context]>;
  let ticker: string;
  let rawTicker: Ticker;
  let rawAgentGroup: AgentGroup;
  let target: string;
  let rawSignatory: Signatory;
  let rawAuthorizationData: PolymeshPrimitivesAuthorizationAuthorizationData;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    authorizationToAuthorizationDataStub = jest.spyOn(
      utilsConversionModule,
      'authorizationToAuthorizationData'
    );
    dateToMomentStub = jest.spyOn(utilsConversionModule, 'dateToMoment');
    signerToStringStub = jest.spyOn(utilsConversionModule, 'signerToString');
    signerValueToSignatoryStub = jest.spyOn(utilsConversionModule, 'signerValueToSignatory');
    ticker = 'SOME_TICKER';
    rawTicker = dsMockUtils.createMockTicker(ticker);
    rawAgentGroup = dsMockUtils.createMockAgentGroup('Full');
    target = 'someDid';
    rawSignatory = dsMockUtils.createMockSignatory({
      Identity: dsMockUtils.createMockIdentityId(target),
    });
    rawAuthorizationData = dsMockUtils.createMockAuthorizationData({
      BecomeAgent: [rawTicker, rawAgentGroup],
    });
  });

  beforeEach(() => {
    entityMockUtils.configureMocks({
      assetOptions: {
        corporateActionsGetAgents: [],
      },
    });
    mockContext = dsMockUtils.getContextInstance();
    authorizationToAuthorizationDataStub.mockReturnValue(rawAuthorizationData);
    signerToStringStub.mockReturnValue(target);
    signerValueToSignatoryStub.mockReturnValue(rawSignatory);
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

  it("should throw an error if the supplied target doesn't exist", () => {
    const args = {
      target,
      ticker,
    };

    dsMockUtils.configureMocks({ contextOptions: { invalidDids: [target] } });

    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    return expect(prepareModifyCorporateActionsAgent.call(proc, args)).rejects.toThrow(
      'The supplied Identity does not exist'
    );
  });

  it('should throw an error if the supplied Identity is currently the corporate actions agent', () => {
    entityMockUtils.configureMocks({
      assetOptions: {
        corporateActionsGetAgents: [entityMockUtils.getIdentityInstance({ did: target })],
      },
    });

    const args = {
      target,
      ticker,
      requestExpiry: new Date(),
    };

    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    return expect(prepareModifyCorporateActionsAgent.call(proc, args)).rejects.toThrow(
      'The Corporate Actions Agent must be undefined to perform this procedure'
    );
  });

  it('should throw an error if the supplied expiry date is not a future date', () => {
    entityMockUtils.configureMocks({
      assetOptions: {
        corporateActionsGetAgents: [],
      },
    });

    const args = {
      target,
      ticker,
      requestExpiry: new Date(),
    };

    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    return expect(prepareModifyCorporateActionsAgent.call(proc, args)).rejects.toThrow(
      'The request expiry must be a future date'
    );
  });

  it('should return an add authorization transaction spec', async () => {
    const args = {
      target,
      ticker,
    };
    const requestExpiry = new Date('12/12/2050');
    const rawExpiry = dsMockUtils.createMockMoment(new BigNumber(requestExpiry.getTime()));

    when(dateToMomentStub).calledWith(requestExpiry, mockContext).mockReturnValue(rawExpiry);

    const transaction = dsMockUtils.createTxStub('identity', 'addAuthorization');
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    let result = await prepareModifyCorporateActionsAgent.call(proc, args);

    expect(result).toEqual({
      transaction,
      args: [rawSignatory, rawAuthorizationData, null],
      resolver: undefined,
    });

    result = await prepareModifyCorporateActionsAgent.call(proc, {
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
