import { Vec } from '@polkadot/types';
import {
  PolymeshPrimitivesComplianceManagerComplianceRequirement,
  PolymeshPrimitivesCondition,
} from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import { ComplianceRequirement, Ticker } from 'polymesh-types/types';
import sinon from 'sinon';

import {
  getAuthorization,
  Params,
  prepareSetAssetRequirements,
} from '~/api/procedures/setAssetRequirements';
import { Asset, Context } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import {
  ClaimType,
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
  let stringToTickerStub: sinon.SinonStub<[string, Context], Ticker>;
  let requirementToComplianceRequirementStub: sinon.SinonStub<
    [InputRequirement, Context],
    PolymeshPrimitivesComplianceManagerComplianceRequirement
  >;
  let ticker: string;
  let requirements: Condition[][];
  let currentRequirements: Requirement[];
  let rawTicker: Ticker;
  let senderConditions: PolymeshPrimitivesCondition[][];
  let receiverConditions: PolymeshPrimitivesCondition[][];
  let rawComplianceRequirements: PolymeshPrimitivesComplianceManagerComplianceRequirement[];
  let args: Params;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    stringToTickerStub = sinon.stub(utilsConversionModule, 'stringToTicker');
    requirementToComplianceRequirementStub = sinon.stub(
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
      [
        {
          type: ConditionType.IsPresent,
          claim: {
            type: ClaimType.NoData,
          },
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

  let resetAssetComplianceTransaction: PolymeshTx<[Ticker]>;
  let replaceAssetComplianceTransaction: PolymeshTx<Vec<ComplianceRequirement>>;

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

    resetAssetComplianceTransaction = dsMockUtils.createTxStub(
      'complianceManager',
      'resetAssetCompliance'
    );
    replaceAssetComplianceTransaction = dsMockUtils.createTxStub(
      'complianceManager',
      'replaceAssetCompliance'
    );

    mockContext = dsMockUtils.getContextInstance();

    rawComplianceRequirements = [];
    stringToTickerStub.withArgs(ticker, mockContext).returns(rawTicker);
    requirements.forEach((conditions, index) => {
      const complianceRequirement = dsMockUtils.createMockComplianceRequirement({
        senderConditions: senderConditions[index],
        receiverConditions: receiverConditions[index],
        id: dsMockUtils.createMockU32(new BigNumber(index)),
      });
      rawComplianceRequirements.push(complianceRequirement);
      requirementToComplianceRequirementStub
        .withArgs({ conditions, id: new BigNumber(index) }, mockContext)
        .returns(complianceRequirement);
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
