import { Moment } from '@polkadot/types/interfaces';
import {
  PolymeshPrimitivesAgentAgentGroup,
  PolymeshPrimitivesAuthorizationAuthorizationData,
  PolymeshPrimitivesSecondaryKeySignatory,
  PolymeshPrimitivesTicker,
} from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import {
  getAuthorization,
  modifyCorporateActionsAgent,
  Params,
  prepareModifyCorporateActionsAgent,
} from '~/api/procedures/modifyCorporateActionsAgent';
import { Procedure } from '~/base/Procedure';
import { Account, Context, Identity } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { Authorization, SignerValue, TxTags } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Asset/Fungible',
  require('~/testUtils/mocks/entities').mockFungibleAssetModule('~/api/entities/Asset/Fungible')
);

describe('modifyCorporateActionsAgent procedure', () => {
  let mockContext: Mocked<Context>;
  let authorizationToAuthorizationDataSpy: jest.SpyInstance<
    PolymeshPrimitivesAuthorizationAuthorizationData,
    [Authorization, Context]
  >;
  let dateToMomentSpy: jest.SpyInstance<Moment, [Date, Context]>;
  let signerToStringSpy: jest.SpyInstance<string, [string | Identity | Account]>;
  let signerValueToSignatorySpy: jest.SpyInstance<
    PolymeshPrimitivesSecondaryKeySignatory,
    [SignerValue, Context]
  >;
  let ticker: string;
  let rawTicker: PolymeshPrimitivesTicker;
  let rawAgentGroup: PolymeshPrimitivesAgentAgentGroup;
  let target: string;
  let rawSignatory: PolymeshPrimitivesSecondaryKeySignatory;
  let rawAuthorizationData: PolymeshPrimitivesAuthorizationAuthorizationData;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    authorizationToAuthorizationDataSpy = jest.spyOn(
      utilsConversionModule,
      'authorizationToAuthorizationData'
    );
    dateToMomentSpy = jest.spyOn(utilsConversionModule, 'dateToMoment');
    signerToStringSpy = jest.spyOn(utilsConversionModule, 'signerToString');
    signerValueToSignatorySpy = jest.spyOn(utilsConversionModule, 'signerValueToSignatory');
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
      fungibleAssetOptions: {
        corporateActionsGetAgents: [],
      },
    });
    mockContext = dsMockUtils.getContextInstance();
    authorizationToAuthorizationDataSpy.mockReturnValue(rawAuthorizationData);
    signerToStringSpy.mockReturnValue(target);
    signerValueToSignatorySpy.mockReturnValue(rawSignatory);
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
      fungibleAssetOptions: {
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
      fungibleAssetOptions: {
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

    when(dateToMomentSpy).calledWith(requestExpiry, mockContext).mockReturnValue(rawExpiry);

    const transaction = dsMockUtils.createTxMock('identity', 'addAuthorization');
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

jest.mock('~/base/Procedure');

describe('modifyCorporateActionsAgent', () => {
  afterAll(() => {
    // Reset the mock after all tests have run
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(modifyCorporateActionsAgent).toBeDefined();
  });

  it('should return new Procedure called with prepareModifyCorporateActionsAgent and getAuthorization', () => {
    const result = modifyCorporateActionsAgent();

    expect(Procedure).toHaveBeenCalledWith(prepareModifyCorporateActionsAgent, getAuthorization);
    expect(result).toBeInstanceOf(Procedure);
  });
});
