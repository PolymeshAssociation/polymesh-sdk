import { Vec } from '@polkadot/types';
import {
  PolymeshPrimitivesComplianceManagerComplianceRequirement,
  PolymeshPrimitivesCondition,
  PolymeshPrimitivesTicker,
} from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import {
  getAuthorization,
  Params,
  prepareSetAssetRequirements,
} from '~/api/procedures/setAssetRequirements';
import { Asset, Context } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import {
  Condition,
  ConditionTarget,
  ConditionType,
  InputCondition,
  InputRequirement,
  Requirement,
  TxTags,
} from '~/types';
import { PolymeshTx } from '~/types/internal';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Asset',
  require('~/testUtils/mocks/entities').mockAssetModule('~/api/entities/Asset')
);

describe('setAssetRequirements procedure', () => {
  let mockContext: Mocked<Context>;
  let stringToTickerSpy: jest.SpyInstance<PolymeshPrimitivesTicker, [string, Context]>;
  let requirementToComplianceRequirementSpy: jest.SpyInstance<
    PolymeshPrimitivesComplianceManagerComplianceRequirement,
    [InputRequirement, Context]
  >;
  let ticker: string;
  let requirements: Condition[][];
  let currentRequirements: Requirement[];
  let rawTicker: PolymeshPrimitivesTicker;
  let senderConditions: PolymeshPrimitivesCondition[][];
  let receiverConditions: PolymeshPrimitivesCondition[][];
  let rawComplianceRequirements: PolymeshPrimitivesComplianceManagerComplianceRequirement[];
  let args: Params;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    stringToTickerSpy = jest.spyOn(utilsConversionModule, 'stringToTicker');
    requirementToComplianceRequirementSpy = jest.spyOn(
      utilsConversionModule,
      'requirementToComplianceRequirement'
    );
    ticker = 'SOME_TICKER';
    requirements = [
      [
        {
          type: ConditionType.IsIdentity,
          identity: entityMockUtils.getIdentityInstance(),
          target: ConditionTarget.Both,
        },
        {
          type: ConditionType.IsExternalAgent,
          target: ConditionTarget.Both,
        },
      ],
      [
        {
          type: ConditionType.IsExternalAgent,
          target: ConditionTarget.Both,
        },
        {
          type: ConditionType.IsNoneOf,
          claims: [],
          target: ConditionTarget.Both,
        },
        {
          type: ConditionType.IsAnyOf,
          claims: [],
          target: ConditionTarget.Both,
        },
      ],
    ];
    currentRequirements = requirements.map((conditions, index) => ({
      conditions,
      id: new BigNumber(index),
    }));
    senderConditions = [
      'senderConditions0' as unknown as PolymeshPrimitivesCondition[],
      'senderConditions1' as unknown as PolymeshPrimitivesCondition[],
      'senderConditions2' as unknown as PolymeshPrimitivesCondition[],
    ];
    receiverConditions = [
      'receiverConditions0' as unknown as PolymeshPrimitivesCondition[],
      'receiverConditions1' as unknown as PolymeshPrimitivesCondition[],
      'receiverConditions2' as unknown as PolymeshPrimitivesCondition[],
    ];
    rawTicker = dsMockUtils.createMockTicker(ticker);
    args = {
      ticker,
      requirements,
    };
  });

  let resetAssetComplianceTransaction: PolymeshTx<[PolymeshPrimitivesTicker]>;
  let replaceAssetComplianceTransaction: PolymeshTx<
    Vec<PolymeshPrimitivesComplianceManagerComplianceRequirement>
  >;

  beforeEach(() => {
    dsMockUtils.setConstMock('complianceManager', 'maxConditionComplexity', {
      returnValue: dsMockUtils.createMockU32(new BigNumber(50)),
    });
    entityMockUtils.configureMocks({
      assetOptions: {
        complianceRequirementsGet: {
          requirements: currentRequirements,
          defaultTrustedClaimIssuers: [],
        },
      },
    });

    resetAssetComplianceTransaction = dsMockUtils.createTxMock(
      'complianceManager',
      'resetAssetCompliance'
    );
    replaceAssetComplianceTransaction = dsMockUtils.createTxMock(
      'complianceManager',
      'replaceAssetCompliance'
    );

    mockContext = dsMockUtils.getContextInstance();

    rawComplianceRequirements = [];
    when(stringToTickerSpy).calledWith(ticker, mockContext).mockReturnValue(rawTicker);
    requirements.forEach((conditions, index) => {
      const complianceRequirement = dsMockUtils.createMockComplianceRequirement({
        senderConditions: senderConditions[index],
        receiverConditions: receiverConditions[index],
        id: dsMockUtils.createMockU32(new BigNumber(index)),
      });
      rawComplianceRequirements.push(complianceRequirement);
      when(requirementToComplianceRequirementSpy)
        .calledWith({ conditions, id: new BigNumber(index) }, mockContext)
        .mockReturnValue(complianceRequirement);
    });
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

  it('should throw an error if the new list is the same as the current one', () => {
    const proc = procedureMockUtils.getInstance<Params, Asset>(mockContext);

    return expect(prepareSetAssetRequirements.call(proc, args)).rejects.toThrow(
      'The supplied condition list is equal to the current one'
    );
  });

  it('should return a reset asset compliance transaction spec if the new requirements are empty', async () => {
    const proc = procedureMockUtils.getInstance<Params, Asset>(mockContext);

    const result = await prepareSetAssetRequirements.call(proc, { ...args, requirements: [] });

    expect(result).toEqual({
      transaction: resetAssetComplianceTransaction,
      args: [rawTicker],
      resolver: expect.objectContaining({ ticker }),
    });
  });

  it('should return a replace asset compliance transaction spec', async () => {
    entityMockUtils.configureMocks({
      assetOptions: {
        complianceRequirementsGet: {
          requirements: currentRequirements.slice(0, 1),
          defaultTrustedClaimIssuers: [],
        },
      },
    });
    const proc = procedureMockUtils.getInstance<Params, Asset>(mockContext);

    const result = await prepareSetAssetRequirements.call(proc, args);

    expect(result).toEqual({
      transaction: replaceAssetComplianceTransaction,
      args: [rawTicker, rawComplianceRequirements],
      resolver: expect.objectContaining({ ticker }),
    });
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<Params, Asset>(mockContext);
      const boundFunc = getAuthorization.bind(proc);
      const params = {
        ticker,
        requirements: [],
      };

      expect(boundFunc(params)).toEqual({
        permissions: {
          transactions: [TxTags.complianceManager.ResetAssetCompliance],
          assets: [expect.objectContaining({ ticker })],
          portfolios: [],
        },
      });

      expect(boundFunc({ ...params, requirements: [1] as unknown as InputCondition[][] })).toEqual({
        permissions: {
          transactions: [TxTags.complianceManager.ReplaceAssetCompliance],
          assets: [expect.objectContaining({ ticker })],
          portfolios: [],
        },
      });
    });
  });
});
