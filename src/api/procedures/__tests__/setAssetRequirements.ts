import { Vec } from '@polkadot/types';
import {
  PolymeshPrimitivesAssetAssetID,
  PolymeshPrimitivesComplianceManagerComplianceRequirement,
  PolymeshPrimitivesCondition,
} from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import {
  getAuthorization,
  Params,
  prepareSetAssetRequirements,
} from '~/api/procedures/setAssetRequirements';
import { BaseAsset, Context } from '~/internal';
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
  '~/api/entities/Asset/Fungible',
  require('~/testUtils/mocks/entities').mockFungibleAssetModule('~/api/entities/Asset/Fungible')
);

describe('setAssetRequirements procedure', () => {
  let mockContext: Mocked<Context>;
  let assetToMeshAssetIdSpy: jest.SpyInstance;
  let requirementToComplianceRequirementSpy: jest.SpyInstance<
    PolymeshPrimitivesComplianceManagerComplianceRequirement,
    [InputRequirement, Context]
  >;
  let assetId: string;
  let asset: BaseAsset;
  let requirements: Condition[][];
  let currentRequirements: Requirement[];
  let rawAssetId: PolymeshPrimitivesAssetAssetID;
  let senderConditions: PolymeshPrimitivesCondition[][];
  let receiverConditions: PolymeshPrimitivesCondition[][];
  let rawComplianceRequirements: PolymeshPrimitivesComplianceManagerComplianceRequirement[];
  let args: Params;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    assetToMeshAssetIdSpy = jest.spyOn(utilsConversionModule, 'assetToMeshAssetId');
    requirementToComplianceRequirementSpy = jest.spyOn(
      utilsConversionModule,
      'requirementToComplianceRequirement'
    );
    assetId = '0x1234';
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
    rawAssetId = dsMockUtils.createMockAssetId(assetId);
    asset = entityMockUtils.getBaseAssetInstance({
      assetId,
      complianceRequirementsGet: {
        requirements: currentRequirements,
        defaultTrustedClaimIssuers: [],
      },
    });
    args = {
      asset,
      requirements,
    };
  });

  let resetAssetComplianceTransaction: PolymeshTx<[PolymeshPrimitivesAssetAssetID]>;
  let replaceAssetComplianceTransaction: PolymeshTx<
    Vec<PolymeshPrimitivesComplianceManagerComplianceRequirement>
  >;

  beforeEach(() => {
    dsMockUtils.setConstMock('complianceManager', 'maxConditionComplexity', {
      returnValue: dsMockUtils.createMockU32(new BigNumber(50)),
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
    when(assetToMeshAssetIdSpy)
      .calledWith(expect.objectContaining({ id: assetId }), mockContext)
      .mockReturnValue(rawAssetId);
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
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    return expect(prepareSetAssetRequirements.call(proc, args)).rejects.toThrow(
      'The supplied condition list is equal to the current one'
    );
  });

  it('should return a reset asset compliance transaction spec if the new requirements are empty', async () => {
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    const result = await prepareSetAssetRequirements.call(proc, { ...args, requirements: [] });

    expect(result).toEqual({
      transaction: resetAssetComplianceTransaction,
      args: [rawAssetId],
    });
  });

  it('should return a replace asset compliance transaction spec', async () => {
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    const result = await prepareSetAssetRequirements.call(proc, {
      ...args,
      asset: entityMockUtils.getBaseAssetInstance({
        assetId,
        complianceRequirementsGet: {
          requirements: currentRequirements.slice(0, 1),
          defaultTrustedClaimIssuers: [],
        },
      }),
    });

    expect(result).toEqual({
      transaction: replaceAssetComplianceTransaction,
      args: [rawAssetId, rawComplianceRequirements],
    });
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<Params, void>(mockContext);
      const boundFunc = getAuthorization.bind(proc);
      const params = {
        asset,
        requirements: [],
      };

      expect(boundFunc(params)).toEqual({
        permissions: {
          transactions: [TxTags.complianceManager.ResetAssetCompliance],
          assets: [expect.objectContaining({ id: assetId })],
          portfolios: [],
        },
      });

      expect(boundFunc({ ...params, requirements: [1] as unknown as InputCondition[][] })).toEqual({
        permissions: {
          transactions: [TxTags.complianceManager.ReplaceAssetCompliance],
          assets: [expect.objectContaining({ id: assetId })],
          portfolios: [],
        },
      });
    });
  });
});
